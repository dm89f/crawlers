const { formatUrlString } = require('./utils/formatUrl');
const fs = require('fs')
const { data_set: wordpress_sitemap } = require('./website_dataset/wordpress-sites_sitemap')
const { data_set: wordpress_no_sitemap } = require('./website_dataset/wordpress-sites_nositemap')
const { data_set: wix_no_sitemap } = require('./website_dataset/wix_no_sitemap');
const { data_set: wix_sitemap } = require('./website_dataset/wix_site_map');
const { data_set: square_site_map } = require('./website_dataset/square_site_map');
// const { data_set: square_no_site_map } = require('./website_dataset/square_space_no_sitemap');
const { getPagesToCrawl } = require('../crawlers/logics/recursion_new');
const { createPageTree, findPagesCategory } = require('../crawlers/utils/createPageTree');


const test = async () => {

  const square_no_site_map = [

    {
      "url": "https://www.craig-reynolds.com/"  // done
    },
    {
      "url": "https://omakase.coolhunting.com/" // incomplete urls
    },
    {
      "url": "https://g.page/my-codeless-website?share"   //tell what to crawl and what not to crawl
    }
  ];

  const resp = await getPagesToCrawl(formatUrlString(square_no_site_map[1].url));
  console.log("total Pages", resp.urls.length)


}

test();