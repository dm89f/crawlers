const { Axios } = require('../config/axiosInstance');

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
  if (isLinkRelative(url)) return true;
  try {
    let test_url = new URL(url);
    return test_url ? true : false
  } catch (error) {
    return false;
  }
}

const isUrlfromSameOrigin = (current_url, base_url) => {

  const curr_url_origin = getUrlDomain(current_url);
  const base_url_origin = getUrlDomain(base_url);

  if (!curr_url_origin || !base_url_origin) return false;
  return curr_url_origin === base_url_origin;

}

const getUrlDomain = (url) => {

  let urlObj = new URL(url);
  let host = urlObj.host;
  let urlDomain = "";
  if (host.startsWith('www.')) {
    urlDomain = host.substring('www.'.length)
  } else {
    urlDomain = host;
  }
  return urlDomain;
}

const hasPathAllowedExtension = (pathname) => {
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


// constants
const socialMediaDomains = {
  'facebook.com': 'Facebook',
  'twitter.com': 'Twitter',
  'instagram.com': 'Instagram',
  'linkedin.com': 'LinkedIn',
  'youtube.com': 'YouTube',
  'pinterest.com': 'Pinterest',
  'tumblr.com': 'Tumblr',
  'reddit.com': 'Reddit',
  'snapchat.com': 'Snapchat',
  'weibo.com': 'Weibo',
  'wechat.com': 'WeChat',
  'whatsapp.com': 'WhatsApp',
  'telegram.org': 'Telegram',
  'signal.org': 'Signal',
  'tiktok.com': 'TikTok',
  'vine.co': 'Vine',
  'medium.com': 'Medium',
  'quora.com': 'Quora',
  'flickr.com': 'Flickr',
  'soundcloud.com': 'SoundCloud',
};

module.exports = {
  isLinkRelative,
  convertRelToAbsUrl,
  urlToPath,
  getPageHTMLContent,
  isUrlValid,
  isUrlfromSameOrigin,
  getUrlDomain,
  hasPathAllowedExtension,
  isLinkMail,
  isLinkContact,
  getSocialHandle,
}