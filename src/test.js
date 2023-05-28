const { formatUrlString } = require('./utils/formatUrl');
const fs = require('fs')
const { data_set } = require('./website_dataset/wordpress-sites_sitemap')
const getAllUrls = require('../crawlers/index');
const { createPageTree, findPagesCategory } = require('../crawlers/utils/createPageTree');

const test_sitemap_crawler = async () => {

  let logFileUrl = './src/website_dataset/wordpress-sites_sitemap.js';
  let logFailed = './src/website_dataset/wordpress-sites_nositemap.js'

  const list_start_idx = 45;
  const list_end = 50;

  if (list_start_idx == 0) {
    fs.appendFileSync(logFileUrl, `[`)
    fs.appendFileSync(logFailed, `[`)
  }




  let counter = 0;
  for (let testUrl of wordpress_sites.slice(list_start_idx, list_end)) {

    const resp = await getAllUrslsUsingAxios(formatUrlString(testUrl))
    const { urls } = resp;
    console.log(testUrl, urls.length, `(${++counter + list_start_idx}/${list_end})`);
    if (urls.length > 0) {
      let meta = {
        pagesLength: urls.length,
        url: testUrl
      }
      fs.appendFileSync(logFileUrl, `${JSON.stringify(meta)},`)
    } else {
      let meta = {
        url: testUrl
      }
      fs.appendFileSync(logFailed, `${JSON.stringify(meta)},`)
    }
  }


  if (list_end === wordpress_sites.length) {
    fs.appendFileSync(logFileUrl, `]`)
    fs.appendFileSync(logFailed, `]`)
  }
  // if(urls.length > 0){
  //   console.log("creating tree");
  //   console.log(urls.length);
  //   const rootNode= await createPageTree(urls);
  //   console.log("catogorizing tree");
  //   const {static, template} = await findPagesCategory(rootNode)
  //   console.log("static pages", static.length);
  //   console.log("template pages", template.length);
  // } 

}

const test_page_categ = async () => {

  const CRAWL_PAGE_LIMIT = 100;

  try {

    let time_start = Date.now();
    let website = formatUrlString("https://www.apple.com/");
    console.log(website);
    const resp = await getAllUrls(website, CRAWL_PAGE_LIMIT)
    console.log("total urls detected", resp.urls.length);
    console.log("creating page tree");
    const rootNode = await createPageTree(resp.urls);
    console.log("categorizing");
    const urls = await findPagesCategory(rootNode);
    console.log("static", urls.static.length);
    console.log("template", urls.template.length);
    const time_stop = Date.now();
    console.log("time took ", (time_stop - time_start) / 1000)

    fs.appendFileSync('sample_tree_2.json', JSON.stringify(urls))

  } catch (error) {
    console.log(error);
  }

}


const main = async () => {

  let URL = "https://www.icelandicexplorer.com/";

  try {
    let data = await getAllUrslsUsingAxios(URL);
    let RootNode = createPageTree(data.urls);
    const pages = await findPagesCategory(RootNode);
    console.log(pages);
  } catch (error) {
    console.log(error);
  }


}

test_page_categ();
