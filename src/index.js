const { InvalidUrlError } = require('./CustomErrors/CustomErrors');
const { Axios } = require('./config/axiosInstance');
const { formatUrlString } = require('./utils/formatUrl');
const { getAllUrslsUsingAxios } = require('./getAllUrls/logics/xmlSitemapLogic')
const fs = require('fs')
const { createPageTree, findPagesCategory } = require('../src/getAllUrls/utils/createPageTree')
const { data_sets } = require('./website_dataset/wix-sites')
const { dataSets: square_space } = require('./website_dataset/square_space-1')
const { wordpress_sites } = require('./website_dataset/wordpress');
// Usage


const test_crawler = async () => {

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

const test_pagecateg = async () => {

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

test_crawler();
