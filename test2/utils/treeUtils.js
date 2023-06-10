const axios = require('axios');

// utility funcs
const pingUrl = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status >= 200 && response.status < 400; // Webpage exists if status is in the 2xx or 3xx range
  } catch (error) {
    console.log(error.response.status);
    return false; // Error occurred or webpage does not exist
  }
}

const isSegmentDynamic = (segment) => {
  return !isNaN(segment) || segment.length <= 2;
}

const getUrlOrigin = (url = "") => {

  const urlObj = new URL(url);
  return urlObj.origin;

}

const urlToPath = (url) => {
  let urlObj = new URL(url);
  return urlObj.pathname;
}

const isNodeRoot = (node) => {
  return node.id === '000000';
}

const generateId = (node_cnt) => {
  const idString = (node_cnt).toString();
  return '0'.repeat(10 - idString.length) + idString;
}

const checkNodeChildLimitInTree = (root_node, url, tree_child_limit) => {

  let node = root_node;
  let path_name = new URL(url).pathname;
  let segments = path_name.split('/').filter(Boolean);
  let path = "";

  for (let idx = 0; idx < segments.length; ++idx) {
    let segment = segments[idx];
    path += `/${segment}`;
    let childNode = node.children.find((child) => child.path === path);
    if (!childNode) {
      return true;
    }
    if (childNode.children.length === tree_child_limit) return false;

    node = childNode;

  }

  return false;
}

const addUrlToTree = async (root_node, url, static_urls,
  template_urls, curr_node_cnt) => {

  let node = root_node;
  let path_name = urlToPath(url);
  let segments = path_name.split('/').filter(Boolean);
  let path = "";
  for (let idx = 0; idx < segments.length; ++idx) {

    let segment = segments[idx];
    if (isSegmentDynamic(segment) && (idx !== (segments.length - 1))) {
      continue
    };
    path += `/${segment}`;
    let node_url = getUrlOrigin(url) + path;

    let childNode = node.children.find((child) => child.path === path);
    if (!childNode) {
      if ((idx === segments.length - 1)) {
        if (isNodeRoot(node)) {
          static_urls.add(path);
        } else {
          let temp_path = path.substring(0, path.length - segment.length - 1);  //template path
          let nodeArr = template_urls.get(temp_path);
          if (nodeArr) {
            template_urls.set(temp_path, [...nodeArr, path])
          } else {
            template_urls.set(temp_path, [path]);
          }
        }

      } else {
        template_urls.set(path, []);
        let status = await pingUrl(node_url);
        if (status) {
          static_urls.add(path);
        } else {
          console.log("not reachable", node_url)
        }

      }
      childNode = {
        id: generateId(curr_node_cnt),
        name: segment,
        path: path,
        url: node_url,
        parentId: node.parent_id,
        children: [],
      }
      node.children.push(childNode);
    }

    node = childNode;

  }
}

module.exports = {
  pingUrl,
  isSegmentDynamic,
  getUrlOrigin,
  urlToPath,
  isNodeRoot,
  generateId,
  checkNodeChildLimitInTree,
  addUrlToTree
}