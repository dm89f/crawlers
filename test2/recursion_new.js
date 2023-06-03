const cheerio = require('cheerio');

const { getSocialHandle, isLinkContact, isLinkMail, convertRelToAbsUrl, getPageHTMLContent, urlToPath, isUrlValid, hasPathAllowedExtension, isUrlfromSameOrigin, getUrlDomain, isLinkRelative } = require('./utils/recursionUtils')


const recursiveCrawler = async (base_url) => {

  const links_to_crawl = [base_url];
  let social_links = new Set;
  let mail_links = new Set();
  let contact_links = new Set();
  let visited_paths = new Set();
  const root_node = {
    id: '0000000',
    name: "",
    path: "",
    url: "",
    parentId: "-1",
    children: [],
  }

  while (links_to_crawl.length !== 0) {

    let crawl_url = links_to_crawl.pop();
    let url_path = urlToPath(crawl_url);

    try {
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

        if (!isUrlValid(link)) continue;

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
            // console.log("leaving", getUrlDomain(link));
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
  const all_social_links = Array.from(social_links).map(linkStr => ({ name: linkStr.split(',')[0], url: linkStr.split(',')[1] }));

  console.log(all_website_pages);
  console.log(all_mail_links);
  console.log(all_contact_links);
  console.log(all_social_links);
}


const test = () => {

  recursiveCrawler('https://google.com');

}

test();


module.exports = { recursiveCrawler };