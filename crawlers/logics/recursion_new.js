const { Axios } = require('../config/axiosInstance');
const cheerio = require('cheerio');
const { socialMediaDomains } = require('../utils/socialMediaDomains')

const recursiveCrawler = async (base_url) => {

  const links_to_crawl = [base_url];
  let social_links = new Set;
  let mail_links = new Set();
  let contact_links = new Set();
  let visited_paths = new Set();

  while (links_to_crawl.length !== 0) {

    try {
      let crawl_url = links_to_crawl.pop();
      let url_path = urlToPath(crawl_url);
      if (visited_paths.has(url_path)) continue;
      visited_paths.add(url_path);
      console.log("visiting", crawl_url);
      const { html_data, error } = await getPageHTMLContent(crawl_url);
      if (error) {
        continue;
      }

      if (!html_data) continue;

      const $ = cheerio.load(html_data);
      const pageLinks = $('a')
        .map((i, el) => $(el).attr('href'))
        .get();

      for (let link of pageLinks) {

        if (isLinkRelative(link)) {
          let abs_url = convertRelToAbsUrl(link, base_url);
          let url_path = urlToPath(abs_url);
          if (!visited_paths.has(url_path) && hasPathAllowedExtension(url_path)) {
            links_to_crawl.push(abs_url);
          }
        } else if (isUrlfromSameOrigin(link, base_url)) {
          let url_path = urlToPath(link);
          if (!visited_paths.has(url_path) && hasPathAllowedExtension(url_path)) {
            links_to_crawl.push(link);
          }
        } else if (isLinkMail(link)) {
          let mail_link = link.split('mailto:')[1];
          if (!mail_links.has(mail_link)) {
            mail_links.add(mail_link);
          }
        } else if (isLinkContact(link)) {
          let contact_link = link.split('tel:')[1];
          if (!contact_links.has(contact_link)) {
            contact_links.add(contact_link)
          }
        } else {
          let social_str = getSocialHandle(link)
          if (social_str) {
            social_links.add(social_str);
          } else {
            // console.log("leaving", link);
          }
        }
      }

    } catch (error) {

      console.log(error);
    }



  }

  const all_website_pages = Array.from(visited_paths).map((relative) => convertRelToAbsUrl(relative, base_url));
  const all_mail_links = Array.from(mail_links)
  const all_contact_links = Array.from(contact_links);
  const all_social_links = Array.from(social_links).map(linkStr => ({ name: linkStr.split(',')[0], url: linkStr.split(',')[1] }))
  console.log(all_website_pages);
  console.log(all_mail_links);
  console.log(all_contact_links);
  console.log(all_social_links);
}

const isLinkRelative = (link = "") => link.startsWith('/');

const convertRelToAbsUrl = (relative, base) => {
  let url = new URL(relative, base);
  return url.href;
}

const urlToPath = (url) => {
  let urlObj = new URL(url);
  return urlObj.pathname;
}

const getPageHTMLContent = async (url) => {

  try {
    const resp = await Axios.get(url);
    const contentType = resp.headers['content-type'];
    if (contentType && !contentType.includes('text/html')) {
      throw new Error('Invalid content type. Expected HTML.');
    }
    return { html_data: resp.data, error: null };
  } catch (error) {
    if (error.name === 'Error') {
      console.log(error);
      return { html_data: null, error: error.name }
    } else if (error.name === 'AxiosError') {
      console.log(error.response.status);
      return { html_data: null, error: error.name }
    } else {
      console.log(error);
      return { html_data: null, error: error.name };
    }

  }

}

const isUrlValid = (url) => {

  try {
    let test_url = new URL(url);
    return test_url ? true : false
  } catch (error) {
    return false;
  }

}
const getUrlOrigin = (url) => {
  if (isUrlValid(url)) {
    let urlObj = new URL(url);
    return urlObj.origin
  }
  return null
}

const isUrlfromSameOrigin = (current_url, base_url) => {

  const curr_url_origin = getUrlOrigin(current_url);
  const base_url_origin = getUrlOrigin(base_url);

  if (!curr_url_origin || !base_url_origin) return false;

  return curr_url_origin === base_url_origin;

}

function hasPathAllowedExtension(pathname) {
  const extensions = /^([^.]+$|\.(asp|aspx|cgi|htm|html|jsp|php)$)/;
  const testString = pathname.slice(-5);
  return extensions.test(testString);
}

const isLinkMail = (link = "") => {
  return link.startsWith('mailto:')
}


const isLinkContact = (link = "") => {
  return link.startsWith('tel:');
}

const getSocialHandle = (url = "") => {
  if (!isUrlValid(url)) return null;
  for ([social_link, social_name] of Object.entries(socialMediaDomains)) {
    if (url.includes(social_link)) {
      return `${social_name},${url}`;
    }
  }
  return null;
}

module.exports = { recursiveCrawler };
