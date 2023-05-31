const { getAllUrslsUsingAxios } = require('./logics/xmlSitemapLogic');
const { getPagesToCrawl } = require('./logics/recursionLogic');

async function getAllUrls(website, useSiteMapLogic, CRAWL_PAGE_LIMIT) {
  try {
    let data;
    if (useSiteMapLogic) {
      data = await getAllUrslsUsingAxios(website, CRAWL_PAGE_LIMIT);
    } else {
      console.log('using recursion Logic');
      data = await getPagesToCrawl(website);
    }
    return data;
  } catch (err) {
    console.log(err);
    return null
  }
}
module.exports = { getAllUrls };