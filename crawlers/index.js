const { getAllUrslsUsingAxios } = require('./logics/xmlSitemapLogic');
const { getPagesToCrawl } = require('./logics/recursionLogic');

async function getAllUrls(website, useSiteMapLogic, CRAWL_PAGE_LIMIT) {
  try {
    let data = null;
    if (useSiteMapLogic) {
      data = await getAllUrslsUsingAxios(website, CRAWL_PAGE_LIMIT);
    }
    //TODO: implement axios Logic
    return data;
  } catch (err) {
    console.log(err);
    return null
  }
}
module.exports = { getAllUrls };