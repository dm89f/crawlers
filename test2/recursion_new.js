const cheerio = require('cheerio');
const fs = require('fs');
const { getSocialHandle, isLinkContact, isLinkMail, convertRelToAbsUrl, getPageHTMLContent, urlToPath, isUrlValid, hasPathAllowedExtension, isUrlfromSameOrigin, getUrlDomain, isLinkRelative } = require('./utils/recursionUtils')

const { checkNodeChildLimitInTree, addUrlToTree, } = require('./utils/treeUtils');


const recursiveCrawler = async (base_url) => {

  const links_to_crawl = [base_url];
  let social_links = new Set;
  let mail_links = new Set();
  let contact_links = new Set();
  let visited_paths = new Set();


  // variable to keep track of static and temp pages
  const root_node = {
    id: "000000",
    name: "",
    path: "",
    url: "",
    parentId: "-1",
    children: [],
  };
  const TREE_CHILD_LIMIT = 5;
  const TOTAL_PAGE_CRAWL_LIMIT = 100;
  let node_cnt = 0;
  const static_urls = new Set();
  const template_urls = new Map();
  static_urls.add('/');

  while (links_to_crawl.length !== 0) {

    let crawl_url = links_to_crawl.pop();
    let url_path = urlToPath(crawl_url);

    // stop crawling after a specified limit
    const total_pages_crawled = static_urls.size + template_urls.size
    if (total_pages_crawled >= TOTAL_PAGE_CRAWL_LIMIT) {
      console.log("log 1")
      break;
    };

    if (!isUrlRoot(crawl_url)) {
      // check child limit on the node
      if (!checkNodeChildLimitInTree(root_node, crawl_url, TREE_CHILD_LIMIT)) {
        continue;
      }
    }

    await addUrlToTree(root_node, crawl_url, static_urls, template_urls, ++node_cnt);

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

  // const all_website_pages = Array.from(visited_paths).map((relative) => convertRelToAbsUrl(relative, base_url));
  // const all_mail_links = Array.from(mail_links)
  // const all_contact_links = Array.from(contact_links);
  // const all_social_links = Array.from(social_links).map(linkStr => ({ name: linkStr.split(',')[0], url: linkStr.split(',')[1] }));

  // console.log(all_website_pages);
  // console.log(all_mail_links);
  // console.log(all_contact_links);
  // console.log(all_social_links);
  console.log(static_urls.keys());
  console.log(template_urls.entries());
  fs.appendFileSync('sample_tree.json', JSON.stringify(root_node))

}


const isUrlRoot = (crawl_url) => {
  if (isUrlValid(crawl_url)) {
    const pathname = urlToPath(crawl_url);
    return pathname === '/'
  }

  return false;

}

const test = async () => {

  await recursiveCrawler('https://sparrowstartup.com/');

}

test();


module.exports = { recursiveCrawler };