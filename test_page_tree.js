const fs = require('fs');
const axios = require('axios');
let node_cnt = 0;
const static_urls = new Set();
const template_urls = new Map();
const { urls } = require('./urls')

const TREE_CHILD_LIMIT = 10;
const STATIC_PAGE_LIMIT = 20;
const TEMPLATE_PAGE_LIMIT = 20;


let isNodeRoot = (node) => {
  return node.id === '000000';
}

const urlToPath = (url) => {
  let urlObj = new URL(url);
  return urlObj.pathname;
}

const generateId = () => {
  const idString = (++node_cnt).toString();
  return '0'.repeat(10 - idString.length) + idString;
}

const checkNodeChildLimitInTree = (root_node, url) => {

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
    if (childNode.children.length === TREE_CHILD_LIMIT) return false;

    node = childNode;

  }

  return false;


}

function isSegmentDynamic(segment) {
  return !isNaN(segment) || segment.length <= 2;
}

const getUrlOrigin = (url = "") => {

  const urlObj = new URL(url);
  return urlObj.origin;

}

const addUrlToTree = async (root_node, url) => {

  // console.log("adding", url);
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
        id: generateId(),
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

async function pingUrl(url) {
  try {
    const response = await axios.head(url);
    return response.status >= 200 && response.status < 400; // Webpage exists if status is in the 2xx or 3xx range
  } catch (error) {
    console.log(error.response.status);
    return false; // Error occurred or webpage does not exist
  }
}

let test = async () => {


  static_urls.add('/')

  const root_node = {
    id: "000000",
    name: "",
    path: "",
    url: "",
    parentId: "-1",
    children: [],
  }


  console.time("start-time")

  for (let url of urls) {

    let curr_stat_urls = static_urls.size;
    let curr_temp_urls = template_urls.size;

    if (curr_stat_urls >= STATIC_PAGE_LIMIT && curr_temp_urls >= TEMPLATE_PAGE_LIMIT) {
      break;
    }

    if (checkNodeChildLimitInTree(root_node, url)) {
      // console.log("visiting", url);
      await addUrlToTree(root_node, url);
    }

  }

  console.timeEnd("start-time")
  fs.writeFileSync('sample_tree.json', JSON.stringify(root_node));
  let calc_tot_urls = 0;

  for (let [temp, arr] of template_urls.entries()) {
    // console.log(temp, arr, arr.length);
    if (arr) {
      calc_tot_urls += arr.length;
    }
  }
  // console.log(template_urls.keys());
  // console.log("static URLS", static_urls.size);
  // console.log("template URLS", template_urls.size);
  console.log(template_urls.entries())

}


test();