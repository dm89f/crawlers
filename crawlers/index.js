const { getAllUrslsUsingAxios } = require('./logics/xmlSitemapLogic');
const { getPagesToCrawl } = require('./logics/recursionLogic');

async function getAllUrls(website, CRAWL_PAGE_LIMIT) {
  try {
    let data = await getAllUrslsUsingAxios(website, CRAWL_PAGE_LIMIT);
    if (data.urls.length <= 2) {
      console.log('using recursion Logic');
      data = await getPagesToCrawl(website);
    }

    return data;
  } catch (err) {
    console.log(err);
  }
}
module.exports = getAllUrls;