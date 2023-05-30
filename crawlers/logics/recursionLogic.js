const { socialDomains } = require('../utils/socialMediaDomains');
const axios = require('axios');
const cheerio = require('cheerio');
const { errorNames } = require('../utils/errorNames');

/**
 * @param baseUrl: base url for the website
 */
async function getPagesToCrawl(baseUrl) {
  const visited = new Set();
  const pages = [];
  let phones = new Set();
  let emails = new Set();
  let socialMedia = new Set();

  const stack = [baseUrl];
  while (stack.length > 0) {
    const currentUrl = stack.pop();
    if (!visited.has(currentUrl)) {
      try {
        // console.log(`visiting... ${currentUrl}`);

        visited.add(currentUrl);
        const response = await axios.get(currentUrl);
        const $ = cheerio.load(response.data);
        pages.push(currentUrl);
        const pageLinks = $('a')
          .map((i, el) => $(el).attr('href'))
          .get();

        const newLink = [];
        for (const link of pageLinks) {
          if (link.startsWith('mailto:')) {
            emails.add(link.split('mailto:')[1]);
          } else if (link.startsWith('tel:')) {
            phones.add(link.split('tel:')[1]);
          } else {
            try {
              const linkAsUrl = new URL(link, baseUrl);
              const h = linkAsUrl.href;

              if (!h.startsWith(baseUrl)) {
                let socialMediaLink = Object.entries(socialDomains) //TODO: only allow social handles
                  .map(([domain, name]) => ({
                    name,
                    url: h.includes(domain) ? h : null,
                  }))
                  .filter((socialMedia) => socialMedia.url);

                let smString = socialMediaLink.reduce((acc, curr) => {
                  return `${curr.name} ${curr.url}`;
                }, ``);

                if (smString.length > 0) socialMedia.add(smString);
                continue;
              }

              if (
                !isValidHttpUrl(h) ||
                !hasAllowedExtension(linkAsUrl) ||
                !linkNoHash(linkAsUrl) ||
                visited.has(h)
              ) {
                continue;
              }

              newLink.push(h);
            } catch (e) {
              if (e.code === 'ERR_INVALID_URL') {
                console.log('Found malformed url ->', e.input);
              }
            }
          }
        }
        stack.push(...newLink);
      } catch (e) {
        if (e.code === 'ENOTFOUND') {
          console.log(e.name, e.code);
          break;
        } else if (e.name === errorNames.AXIOS) {
          console.log(`${e.name} ${e.response.status} -> ${currentUrl}`);
        }
      }
    }
  }

  phones = [...phones];
  emails = [...emails];
  let socialMedia_arr = [];
  for (let social of socialMedia) {
    const [name, url] = social.split(' ');
    socialMedia_arr.push({
      name,
      url,
    });
  }

  return {
    urls: pages,
    phones,
    emails,
    socialMedia: socialMedia_arr,
    error: '',
  };
}

function isValidHttpUrl(link) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i',
  );
  return pattern.test(link);
}

function linkNoHash(url) {
  if (url.hash || url.pathname === '/') {
    // console.log(url.href);
    return false;
  }

  return true;
}

function hasAllowedExtension(link) {
  const extensions = /^([^.]+$|\.(asp|aspx|cgi|htm|html|jsp|php)$)/;

  const testString = link.pathname.slice(-5);
  return extensions.test(testString);
}

module.exports = { getPagesToCrawl };
