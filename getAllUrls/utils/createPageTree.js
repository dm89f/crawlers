const axios = require('axios');

function createPageTree(pageUrls) {
  const root = { id: '00000', name: '', parentId: null, children: [] };
  let idCounter = 0;

  // A helper function to generate a unique ID
  function generateId() {
    const idString = (++idCounter).toString();
    return '0'.repeat(5 - idString.length) + idString;
  }

  // A helper function to add a page to the tree
  function addPageToTree(url, parentNode) {
    const segments = url.pathname.split('/').filter(Boolean);
    let node = parentNode;
    let path = '';

    for (const segment of segments) {
      path += `/${segment}`;
      let childNode = node.children.find((child) => child.path === path);
      if (!childNode) {
        const id = generateId();
        childNode = {
          id,
          name: segment,
          path,
          url: url.origin + path,
          parentId: node.id,
          children: [],
        };
        node.children.push(childNode);
      }
      node = childNode;
    }
  }

  // Add each page to the tree
  for (const urlString of pageUrls) {
    const url = new URL(urlString);
    addPageToTree(url, root);
  }

  if (!root.url) {
    let website = new URL(pageUrls[0]);
    root.name = '/';
    root.path = '/';
    root.url = website.origin;
  }
  return root;
}

async function getLinkIfResponseOk(pageUrl) {
  const response = await axios.get(pageUrl);

  if (response.status === 200) {
    return pageUrl;
  }

  return '';
}

async function findPagesCategory(treeNode) {
  const result = {
    static: [],
    template: [],
  };

  const templateMap = new Map(); //track template pages

  //workaround: add root node to static
  if (treeNode.url) {
    result.static.push({
      name: treeNode.name,
      url: treeNode.url,
      ssUrl: treeNode.url,
    });
  }

  let queue = [treeNode];

  while (queue.length > 0) {
    let node = queue.shift();

    if (node.children.length > 0) {
      for (let i = 0; i < node.children.length; ++i) {
        let currentChild = node.children[i];

        if (currentChild.children.length === 0) {
          //node is leaf node
          if (!templateMap.has(currentChild.parentId)) {
            //parent is not a template
            result.static.push({
              name: currentChild.name,
              url: currentChild.url,
              ssUrl: currentChild.url,
            });
          }
        } else {
          queue.push(currentChild);
          templateMap.set(currentChild.id, true);

          const [sPromise, tPromise] = await Promise.allSettled([
            getLinkIfResponseOk(currentChild.url), //check response for page is static
            getLinkIfResponseOk(currentChild.children[0].url),
          ]);

          if (sPromise.status === 'fulfilled') {
            result.static.push({
              name: currentChild.name,
              url: currentChild.url,
              ssUrl: sPromise.value,
            });
          }

          let urlArray = [];
          for (let childNode of currentChild.children) {
            let url = await getLinkIfResponseOk(childNode.url);
            if (url) {
              urlArray.push({ url, name: childNode.name });
            }
          }
          result.template.push({
            name: currentChild.name,
            url: currentChild.url,
            urlArray,
            numChild: currentChild.children.length,
            ssUrl: tPromise.value,
          });

          // if (tPromise.status === 'fulfilled') {
          //   result.template.push({
          //     name: currentChild.name,
          //     url: currentChild.url,
          //     numChild: currentChild.children.length,
          //     ssUrl: tPromise.value,
          //   });
          // }
        }
      }
    }
  }

  return result;
}

module.exports = {
  createPageTree,
  findPagesCategory,
};
/**
 * {
 * 	static: [
 * 		{
 *    	name: '',
 *      url: abs url,
 *      ssUrl: abs url,
 *    }
 *  ],
 *  template: [
 *    {
 *    	name: '',
 *      url: abs url,
 *      ssUrl: abs url of first child if present and response 200
 *      numChild: number,
 *    }
 *  ]
 * }
 */
