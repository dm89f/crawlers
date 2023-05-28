const { getAllUrslsUsingAxios } = require('./logics/xmlSitemapLogic');
const { getPagesToCrawl } = require('./logics/recursionLogic');

async function getAllUrls(website) {
  try {
    let data = await getAllUrslsUsingAxios(website);

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
