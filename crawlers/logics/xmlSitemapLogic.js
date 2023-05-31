const axios = require('axios');
const cheerio = require('cheerio');
const { errorNames } = require('../utils/errorNames');

async function getAllUrslsUsingAxios(url, CRAWL_PAGE_LIMIT) {
  url = addForwardSlashToUrl(url);
  try {
    const resp = await axios.get(`${url}robots.txt`);
    let data = await findAllUrlsFromRobotsTxt(resp.data, CRAWL_PAGE_LIMIT);
    return data;
  } catch (error) {
    console.log(error.name, 'robots.txt File not found', url);
    return { urls: [], phones: [], emails: [], socialMedia: [], error: error };
  }
}

async function findAllUrlsFromRobotsTxt(robotsTxt, CRAWL_PAGE_LIMIT) {
  let xmlUrls = [];
  let httpsUrls = [];

  try {
    const urls = [];

    console.log('found robots.txt in the site');
    // split the robots.txt file into lines
    const lines = robotsTxt.split('\n');

    // loop through each line to find the sitemap URL
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // check if the line is a sitemap directive
      if (line.startsWith('Sitemap:')) {
        // get the URL from the line
        const url = line.substring('Sitemap:'.length).trim();

        // add the URL to the list of URLs
        xmlUrls.push(url);
      } else if (line.startsWith('sitemap:')) {
        const url = line.substring('sitemap:'.length).trim();
        xmlUrls.push(url);
      }
    }

    if (xmlUrls.length === 0) {
      console.log('sitemap File not Found in robots.txt');
      return {
        urls: [],
        error: {
          name: errorNames.NO_ROBOT_TXT,
          message: errorNames.NO_ROBOT_TXT,
          phones: [],
          emails: [],
          socialMedia: [],
        },
      };
    }

    for (let xmlUrl of xmlUrls) {
      await findAllXmlUrls(xmlUrl);
    }
  } catch (error) {
    console.log(error.name);
    return { urls: [], phones: [], emails: [], socialMedia: [], error: error };
  }

  // recursive function to get the xml urls
  async function findAllXmlUrls(xmlUrl) {

    if (httpsUrls.length === CRAWL_PAGE_LIMIT) {
      return;
    }
    try {
      const xmlResp = await axios.get(xmlUrl, { timout: 5000 });

      const $ = cheerio.load(xmlResp.data, { xmlMode: true });

      $('loc').each(async function () {
        const nXmlUrl = $(this).text().trim();
        if (nXmlUrl.endsWith('.xml') || nXmlUrl.toLowerCase().includes('sitemap')) {
          xmlUrls.push(nXmlUrl);
          findAllXmlUrls(nXmlUrl);
        } else {
          if (httpsUrls.length === CRAWL_PAGE_LIMIT) {
            return;
          }
          httpsUrls.push(nXmlUrl);
        }
      });
    } catch (error) {
      if (error.name === "AxiosError") {
        console.log(xmlUrl);
        console.log(error.response.status)
      }
    }
  }

  return {
    urls: httpsUrls,
    error: '',
    phones: [],
    emails: [],
    socialMedia: [],
  };
}

function addForwardSlashToUrl(url) {
  if (!url.endsWith('/')) {
    url += '/';
  }
  return url;
}

module.exports = {
  getAllUrslsUsingAxios,
};
