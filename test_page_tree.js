const fs = require('fs');
const axios = require('axios');
let node_cnt = 0;
const static_urls = new Set();
const template_urls = new Map();
const http = require('http');
const https = require('https');



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

async function getLinkIfResponseOk(pageUrl) {

  try {
    const response = await axios.get(pageUrl, { timout: 5000 });
    if (response.status >= 200 && response.status < 300) {
      return { page_exist: true, error: null };
    } else {
      throw new Error("Page Does not Exist");
    }
  } catch (error) {
    console.log(error);
    return { page_exist: false, error: error.message };
  }

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
    if (isSegmentDynamic(segment)) continue;
    path += `/${segment}`;
    let node_url = getUrlOrigin(url) + path;

    let childNode = node.children.find((child) => child.path === path);
    if (!childNode) {
      if ((idx === segments.length - 1)) {
        if (isNodeRoot(node)) {
          static_urls.add(path);
        } else {
          let temp_path = path.substring(0, path.length - segment.length - 1);
          let nodeArr = template_urls.get(temp_path);
          template_urls.set(temp_path, [...nodeArr, path])
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
      } else {
        template_urls.set(path, []);
        let status = await pingUrl(node_url);
        if (status) {
          static_urls.add(path);
        } else {
          console.log(status)
          console.log("stat", node_url)
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


    }

    node = childNode;

  }

}
async function pingUrl(url) {
  try {
    const response = await axios.head(url);
    return response.status >= 200 && response.status < 400; // Webpage exists if status is in the 2xx or 3xx range
  } catch (error) {
    console.log(error);
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

  let urls = ['https://ruya.ae/',

    'https://ruya.ae/work/ritz-carlton/',
    'https://ruya.ae/work/emirates-nation-brand/',
    'https://ruya.ae/work/federal-youth-authority/',
    'https://ruya.ae/work/piramal-mahalaxmi/',
    'https://ruya.ae/work/al-habtoor-city/',
    'https://ruya.ae/work/melia-group-of-hotels/',
    'https://ruya.ae/work/nurai/',
    'https://ruya.ae/work/lapita/',
    'https://ruya.ae/work/chaimaa-avenue/',
    'https://ruya.ae/work/al-erkyah-city/',
    'https://ruya.ae/work/npcc/',
    'https://ruya.ae/work/mbl/',
    'https://ruya.ae/work/mag-city/',
    'https://ruya.ae/work/mag-corporate/',
    'https://ruya.ae/work/dusit-thani-beachfront-sri-lanka/',
    'https://ruya.ae/work/the-fields-at-mbr-city/',
    'https://ruya.ae/work/five-jumeirah-village/',
    'https://ruya.ae/work/five-palm-jumeirah/',
    'https://ruya.ae/work/dlf-5/',
    'https://ruya.ae/work/zaya-corporate/',
    'https://ruya.ae/work/hameni/',
    'https://ruya.ae/work/ghreiwati-group/',
    'https://ruya.ae/work/the-crest/',
    'https://ruya.ae/work/mina-by-azizi/',
    'https://ruya.ae/work/texture/',
    'https://ruya.ae/work/verde/',
    'https://ruya.ae/work/ariane/',
    'https://ruya.ae/work/ariane-city/',
    'https://ruya.ae/work/talex/',
    'https://ruya.ae/work/castel-royale/',
    'https://ruya.ae/work/provedore/',
    'https://ruya.ae/services/3d-design-agency-in-dubai/',
    'https://ruya.ae/services/digital-web-design-agency-in-dubai/',
    'https://ruya.ae/services/branding-agency-in-dubai/',
    'https://ruya.ae/careers/business-development-executive/',
    'https://ruya.ae/careers/graphic-designer/',
    'https://ruya.ae/legal/',
    'https://ruya.ae/connect/',
    'https://ruya.ae/careers/',
    'https://ruya.ae/services/',
    'https://ruya.ae/branding-digital-marketing-agency/',
    'https://ruya.ae/work/',
  ];

  console.time("start-time")

  for (let url of urls) {
    await addUrlToTree(root_node, url);
  }

  console.timeEnd("start-time")
  // fs.writeFileSync('sample_tree.json', JSON.stringify(root_node));
  let calc_tot_urls = 0;

  for (let [temp, arr] of template_urls.entries()) {
    // console.log(temp, arr, arr.length);
    if (arr) {
      calc_tot_urls += arr.length;
    }
  }
  console.log(urls.length, static_urls.size, calc_tot_urls)

}


test();