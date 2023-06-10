const { formatUrlString } = require('./utils/formatUrl');
const fs = require('fs')
const { recursiveCrawler } = require('../crawlers/logics/recursion_new')
const { createPageTree, findPagesCategory } = require('../crawlers/utils/createPageTree');

const test = async () => {

  const saas_pages = ["https://equals.app/",
    "https://mixpanel.com/",
    "https://studio.design/", //empty URL
    "https://bento.me/en/home",
    "https://literal.club/",
    "https://ruul.io/",
    "https://reflect.app/home",
    "https://perawallet.app/",
    "https://www.synthesized.io/",]
  const base_url = "https://sparrowstartup.com/";

  recursiveCrawler(formatUrlString(base_url));
}
test();