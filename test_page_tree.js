const fs = require('fs');
const axios = require('axios');
let node_cnt = 0;
const static_urls = new Set();
const template_urls = new Map();

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
      console.log("continue", segment, idx)
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

  let urls = [
    'https://rnsit.ac.in/',
    'https://rnsit.ac.in/mech/',
    'https://rnsit.ac.in/mca/',
    'https://rnsit.ac.in/ise/',
    'https://rnsit.ac.in/eie/',
    'https://rnsit.ac.in/cse-data-science/',
    'https://rnsit.ac.in/eee/',
    'https://rnsit.ac.in/ece/',
    'https://rnsit.ac.in/cse/',
    'https://rnsit.ac.in/civil/',
    'https://rnsit.ac.in/aiml/',
    'https://rnsit.ac.in/nirf/',
    'https://rnsit.ac.in/naac-file/',
    'https://rnsit.ac.in/admissions/',
    'https://rnsit.ac.in/placements/',
    'https://rnsit.ac.in/campus-life/',
    'https://rnsit.ac.in/about/',
    'https://rnsit.ac.in/admin-staff/',
    'https://rnsit.ac.in/chem/chem-staff/',
    'https://rnsit.ac.in/chem/chem-facilities-infrastructure/',
    'https://rnsit.ac.in/chem/chem-conferences-and-projects/',
    'https://rnsit.ac.in/chem/',
    'https://rnsit.ac.in/physics/physics-staff/',
    'https://rnsit.ac.in/physics/physics-facilities-infrastructure/',
    'https://rnsit.ac.in/physics/physics-conferences-and-projects/',
    'https://rnsit.ac.in/physics/',
    'https://rnsit.ac.in/math/staff/',
    'https://rnsit.ac.in/math/',
    'https://rnsit.ac.in/math/math-staff/',
    'https://rnsit.ac.in/mca/mca-student-life/',
    'https://rnsit.ac.in/mca/mca-staff/',
    'https://rnsit.ac.in/mca/mca-facilities-infrastructure/',
    'https://rnsit.ac.in/mca/mca-conferences-and-projects/',
    'https://rnsit.ac.in/mca/mca-placement-statistics/',
    'https://rnsit.ac.in/cybersecurity/',
    'https://rnsit.ac.in/cse/cse-staff/',
    'https://rnsit.ac.in/cse/cse-placement-statistics/',
    'https://rnsit.ac.in/cse/cse-facilities-infrastructure/',
    'https://rnsit.ac.in/cse/cse-student-life/',
    'https://rnsit.ac.in/cse/cse-conferences-and-projects/',
    'https://rnsit.ac.in/cse-data-science/staff/',
    'https://rnsit.ac.in/cse-data-science/facilities-infrastructure/',
    'https://rnsit.ac.in/aiml/aiml-student-life/',
    'https://rnsit.ac.in/aiml/aiml-conferences-and-projects/',
    'https://rnsit.ac.in/aiml/aiml-facilities-infrastructure/',
    'https://rnsit.ac.in/aiml/aiml-staff/',
    'https://rnsit.ac.in/civil/civil-student-life/',
    'https://rnsit.ac.in/civil/civil-facilities-infrastructure/',
    'https://rnsit.ac.in/civil/civil-conferences-and-projects/',
    'https://rnsit.ac.in/civil/civil-placement-statistics/',
    'https://rnsit.ac.in/civil/civil-staff/',
    'https://rnsit.ac.in/mech/mech-student-life/',
    'https://rnsit.ac.in/mech/mech-conferences-and-projects/',
    'https://rnsit.ac.in/mech/mech-facilities-infrastructure/',
    'https://rnsit.ac.in/mech/mech-placement-statistics/',
    'https://rnsit.ac.in/mech/mech-staff/',
    'https://rnsit.ac.in/eie/eie-student-life/',
    'https://rnsit.ac.in/eie/eie-staff/',
    'https://rnsit.ac.in/eie/eie-conferences-and-projects/',
    'https://rnsit.ac.in/eie/eie-facilities-infrastructure/',
    'https://rnsit.ac.in/eie/eie-placement-statistics/',
    'https://rnsit.ac.in/eee/eee-student-life/',
    'https://rnsit.ac.in/eee/eee-conferences-and-projects/',
    'https://rnsit.ac.in/eee/eee-facilities-infrastructure/',
    'https://rnsit.ac.in/eee/eee-placement-statistics/',
    'https://rnsit.ac.in/eee/eee-staff/',
    'https://rnsit.ac.in/ise/ise-student-life/',
    'https://rnsit.ac.in/ise/ise-placement-statistics/',
    'https://rnsit.ac.in/ise/ise-conferences-and-projects/',
    'https://rnsit.ac.in/ise/ise-facilities-infrastructure/',
    'https://rnsit.ac.in/ise/ise-staff/',
    'https://rnsit.ac.in/ece/ece-student-life/',
    'https://rnsit.ac.in/ece/ece-conferences-and-projects/',
    'https://rnsit.ac.in/ece/ece-staff/',
    'https://rnsit.ac.in/ece/ece-placement-statistics/',
    'https://rnsit.ac.in/ece/ece-facilities-infrastructure/',
    'https://rnsit.ac.in/sports/',
    'https://rnsit.ac.in/cultural/',
    'https://rnsit.ac.in/contact-us/',
    'https://rnsit.ac.in/cse-placement-statistics',
    'https://rnsit.ac.in/naac-dvv/',
    'https://rnsit.ac.in/ece-placement-statistics',
    'https://rnsit.ac.in/eee-placement-statistics',
    'https://rnsit.ac.in/cse-data-science/cse-staff/',
    'https://rnsit.ac.in/eie-placement-statistics',
    'https://rnsit.ac.in/ise-placement-statistics',
    'https://rnsit.ac.in/mca-placement-statistics'
  ];

  console.time("start-time")

  for (let url of urls) {
    await addUrlToTree(root_node, url);
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
  console.log(template_urls.keys())
  console.log(urls.length, static_urls.size, calc_tot_urls)

}


test();