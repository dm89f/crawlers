const axios = require('axios');
const static_pages = new Set();
const template_pages = new Map();

const logConsole = (msg) => {
  console.log(msg);
}

function isUrlDynamic(segment) {
  return !isNaN(segment) || segment.length <= 2;
}


function createPageTree(pageUrls) {
  const root = { id: '00000', name: '', parentId: null, children: [] };


  let idCounter = 0;
  // A helper function to generate a unique ID
  function generateId() {
    const idString = (++idCounter).toString();
    return '0'.repeat(10 - idString.length) + idString;
  }

  // A helper function to add a page to the tree
  function addPageToTree(url, parentNode) {
    const segments = url.pathname.split('/').filter(Boolean);
    let node = parentNode;
    let path = '';
    for (const segment of segments) {

      let isDynamic = isUrlDynamic(segment);

      if (isDynamic) continue;

      path += `/${segment}`;
      let childNode;
      childNode = node.children.find((child) => child.path === path);
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

  try {
    const response = await axios.get(pageUrl, { timout: 5000 });
    if (response.status >= 200 && response.status < 300) {
      return { page_exist: true, error: null };
    } else {
      throw new Error("Page Does not Exist");
    }
  } catch (error) {
    return { page_exist: false, error: error.message };
  }

}

async function getSsUrlForTempPages(urlArray) {

  let ssUrl;
  for (let urlObj of urlArray.slice(0, 5)) {
    let resp = await getLinkIfResponseOk(urlObj.url);
    if (resp.page_exist) {
      ssUrl = urlObj.url;
      break;
    }
  }

  return ssUrl;
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

        try {

          if (currentChild.children.length === 0) {
            //node is leaf node
            if (!templateMap.has(currentChild.parentId)) {
              //parent is not a template
              result.static.push({
                name: currentChild.path,
                url: currentChild.url,
                ssUrl: currentChild.url,
              });
              logConsole(`static ${currentChild.url}`)
            }

          } else {
            queue.push(currentChild);
            templateMap.set(currentChild.id, true);

            let resp = await getLinkIfResponseOk(currentChild.url);
            // template home page is also static
            if (resp.page_exist) {
              result.static.push({
                name: currentChild.path,
                url: currentChild.url,
                ssUrl: currentChild.url,
              });
              logConsole(`static ${currentChild.url}`)
            }

            // Creating template url Object
            let urlArray = currentChild.children.map(childNode => {
              return {
                url: childNode.url,
                name: childNode.path
              }
            });
            let ssUrl = await getSsUrlForTempPages(urlArray);
            result.template.push({
              name: currentChild.path,
              url: currentChild.url,
              urlArray,
              numChild: urlArray.length,
              ssUrl,
            });
            logConsole(`template ${currentChild.url}`)

          }
        } catch (error) {
          console.log()
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

