const fs = require('fs');
const { urls } = require('./urls')

const { checkNodeChildLimitInTree, addUrlToTree } = require('./utils/treeUtils');

let test = async () => {

  const TREE_CHILD_LIMIT = 5;
  const TOTAL_PAGE_CRAWL_LIMIT = 50;
  let node_cnt = 0;
  const static_urls = new Set();
  const template_urls = new Map();

  const root_node = {
    id: "000000",
    name: "",
    path: "",
    url: "",
    parentId: "-1",
    children: [],
  };

  static_urls.add('/');
  for (let url of urls) {

    const total_pages_crawled = static_urls.size + template_urls.size
    if (total_pages_crawled >= TOTAL_PAGE_CRAWL_LIMIT) break;

    if (checkNodeChildLimitInTree(root_node, url, TREE_CHILD_LIMIT)) {
      console.log("visiting", url);
      await addUrlToTree(root_node, url, static_urls, template_urls, ++node_cnt);
    }
  }

  console.timeEnd("start-time")
  fs.writeFileSync('sample_tree.json', JSON.stringify(root_node));
  console.log("static URLS", static_urls);
  console.log("template URLS", template_urls.size);
  console.log(template_urls.entries())
}

test();