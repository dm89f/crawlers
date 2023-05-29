const { InvalidUrlError } = require("../CustomErrors/CustomErrors");

const hasTLD = (url) => {
  const parsedURL = new URL(url);
  const hostnameParts = parsedURL.hostname.split('.');
  if (hostnameParts[0] === 'www')
    return hostnameParts.length > 2;
  else return hostnameParts.length >= 2;
}

const formatUrlString = (urlStr = "") => {

  let newUrlStr = urlStr.toLowerCase();
  //add https:// as the default protocol if the Url doesnt have one
  if (!newUrlStr.startsWith('https://') && !newUrlStr.startsWith('http://')) {
    newUrlStr = 'https://' + newUrlStr;
  }

  let formtdUrl = "";
  try {
    let urlInput = new URL(newUrlStr);
    let hostname = urlInput.hostname;
    let protocol = urlInput.protocol;

    formtdUrl = protocol + "//" + urlInput.hostname

    if (!hasTLD(formtdUrl))
      throw new Error(`Entered url ${urlStr} does not contain TLD`)

    return formtdUrl;

  } catch (error) {
    throw new InvalidUrlError(error.message);
  }

}

module.exports = {
  formatUrlString
}