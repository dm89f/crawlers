const { formatUrlString } = require('./utils/formatUrl');
const fs = require('fs')
const { data_set: wordpress_sitemap } = require('./website_dataset/wordpress-sites_sitemap')
// const { data_set: wordpress_no_sitemap } = require('./website_dataset/wordpress-sites_nositemap')
// const { data_set: wix_no_sitemap } = require('./website_dataset/wix_no_sitemap');
const { data_set: wix_sitemap } = require('./website_dataset/wix_site_map');
const { data_set: square_site_map } = require('./website_dataset/square_site_map');
// const { data_set: square_no_site_map } = require('./website_dataset/square_space_no_sitemap');
const { getPagesToCrawl } = require('../crawlers/logics/recursion_new');
const { createPageTree, findPagesCategory } = require('../crawlers/utils/createPageTree');


const test = async () => {

  const square_no_site_map = [
    {
      "url": "https://omakase.coolhunting.com/" // incomplete urls
    }
  ];  // done

  const wix_no_sitemap = [
    {
      "url": "http://www.goodfeelinggoods.com/" //404
    },
    {
      "url": "https://www.vintique-watch.com/"  //broken link
    },
    {
      "url": "https://www.twoonestudio.com/"  //404
    },
    {
      "url": "https://www.eat-live-sleep.com/"
    },
    {
      "url": "https://www.stolengoodsgoods.com/"
    },
    {
      "url": "http://www.liam-rinat.com/"
    },
    {
      "url": "https://www.valeriamonis.com/"
    },
    {
      "url": "https://www.thegrilledcheesefactory.fr/"
    },
    {
      "url": "https://www.soflocakeandcandyexpo.com/"
    },
    {
      "url": "https://www.adamgrant.net/"
    },
    {
      "url": "https://www.charliedwellingtons.com/"
    },
    {
      "url": "https://www.stylistsincrime.com/"
    },
    {
      "url": "https://www.samaschool.org/"
    },
    {
      "url": "https://www.apollopeak.com/"
    },
    {
      "url": "https://www.loomai.com/"
    },
    {
      "url": "https://www.mintspringsfarm.net/"
    },
    {
      "url": "http://www.adamgrant.net/"
    },
    {
      "url": "https://www.simpply.com.au/"
    },
    {
      "url": "https://revo.ru/"
    },
    {
      "url": "http://www.ebulletins.com/"
    },
    {
      "url": "https://thegreatinflatablerace.com/"
    },
    {
      "url": "http://www.aquilis.in/"
    },
    {
      "url": "https://www.achievemore.com.br/"
    },
    {
      "url": "https://www.bhpcbag.com/"
    },
    {
      "url": "http://www.omlet.me/"
    },
    {
      "url": "https://www.tinktankstudio.com/"
    },
    {
      "url": "https://www.kunstrukt.com/"
    },
    {
      "url": "https://www.michellelhk.com/"
    },
    {
      "url": "https://en.chicosantos.org/"
    },
    {
      "url": "https://www.sketchhaven.com/"
    },
    {
      "url": "jpbscanada.com"
    }
  ]

  const wordpress_no_sitemap = [
    {
      "url": "https://blog.playstation.com/"
    },
    {
      "url": "https://cnnpressroom.blogs.cnn.com/"
    },
    {
      "url": "https://books.disney.com/"
    },
    {
      "url": "https://rollingstones.com/"
    },
    {
      "url": "https://newsroom.spotify.com/"
    },
    {
      "url": "https://hypebeast.com/"
    },
    {
      "url": "https://news.microsoft.com/"
    },
    {
      "url": "https://boingboing.net/"
    },
    {
      "url": "https://blogs.windows.com/"
    },
    {
      "url": "https://evernote.com/blog/"
    },
    {
      "url": "https://www.starwars.com/news"
    },
    {
      "url": "https://blog.flickr.net/en/"
    },
    {
      "url": "https://www.wpexplorer.com/"
    },
    {
      "url": "https://crankyflier.com/"
    },
    {
      "url": "https://digital-photography-school.com/"
    },
    {
      "url": "https://www.mavs.com/"
    },
    {
      "url": "https://blog.etsy.com/en/"
    },
    {
      "url": "https://blog.ted.com/"
    },
    {
      "url": "https://blog.yelp.com/"
    },
    {
      "url": "https://blog.cpanel.com/"
    },
    {
      "url": "http://thenextweb.com/"
    },
    {
      "url": "https://snoopdogg.com/"
    },
    {
      "url": "http://www.blogs.xerox.com/"
    },
    {
      "url": "https://overclothing.com/"
    },
    {
      "url": "http://querohms.com/"
    },
    {
      "url": "https://neilpatel.com/"
    },
    {
      "url": "http://www.batmanarkhamknight.com/"
    },
    {
      "url": "http://www.papazian.gr/"
    },
    {
      "url": "http://www.beoplay.com/products/beoplaya6#MadeForMornings"
    },
    {
      "url": "https://www.lily.camera/"
    },
    {
      "url": "http://www.amctv.com/shows/the-walking-dead"
    },
    {
      "url": "http://le-mugs.com/"
    },
    {
      "url": "http://leenheyne.nl/"
    },
    {
      "url": "http://www.bata.com/"
    },
    {
      "url": "https://briansmith.com/"
    },
    {
      "url": "http://acme-world.com/"
    },
    {
      "url": "http://newjumoconcept.com/en"
    },
    {
      "url": "http://www.indusuni.ac.in/"
    },
    {
      "url": "http://justintimberlake.com/"
    },
    {
      "url": "http://kobebryant.com/"
    },
    {
      "url": "https://www.toyota.com.br/"
    },
    {
      "url": "https://mindtouch.com/"
    },
    {
      "url": "http://snoopdogg.com/"
    },
    {
      "url": "https://themegrill.com/"
    },
    {
      "url": "https://athemes.com/"
    },
    {
      "url": "http://www.beyonce.com/"
    },
    {
      "url": "http://www.martinasperl.at/"
    },
    {
      "url": "http://www.rollingstones.com/"
    },
    {
      "url": "http://kristianlevenphotography.co.uk/"
    },
    {
      "url": "https://tucows.com/"
    },
    {
      "url": "http://www.vivianmaier.com/"
    },
    {
      "url": "http://yolive.me/"
    },
    {
      "url": "http://www.borngroup.com/"
    },
    {
      "url": "http://emrl.com/"
    },
    {
      "url": "http://fh-studio.com/"
    },
    {
      "url": "http://waaark.com/"
    },
    {
      "url": "http://wandaprint.com/home/"
    },
    {
      "url": "http://whoisleon.com/"
    },
    {
      "url": "https://creativecommons.org/"
    },
    {
      "url": "https://www.mavs.com/"
    },
    {
      "url": "https://blacklivesmatter.com/"
    },
    {
      "url": "https://www.obama.org/"
    },
    {
      "url": "https://invisiblechildren.com/"
    },
    {
      "url": "https://www.nod.org/"
    },
    {
      "url": "https://www.archivesfoundation.org/"
    },
    {
      "url": "https://theglobalchurchproject.com/"
    },
    {
      "url": "https://jquery.com/"
    },
    {
      "url": "https://www.ripleys.com/"
    },
    {
      "url": "https://umaine.edu/"
    },
    {
      "url": "http://www.washington.edu/"
    },
    {
      "url": "http://www.gsu.edu/"
    },
    {
      "url": "http://www.msoe.edu/"
    },
    {
      "url": "http://cure.org/"
    },
    {
      "url": "http://invisiblechildren.com/"
    },
    {
      "url": "http://trefectamobility.com/"
    },
    {
      "url": "https://www.thewho.com/"
    },
    {
      "url": "https://africa.si.edu/"
    },
    {
      "url": "https://www.gsu.edu/"
    },
    {
      "url": "https://sprott2.carleton.ca/"
    },
    {
      "url": "https://www.nicholls.edu/"
    },
    {
      "url": "https://methodhome.com/"
    },
    {
      "url": "https://www.kawaiibox.com/"
    },
    {
      "url": "https://wakamiglobal.com/"
    },
    {
      "url": "https://www.houseofwhiskyscotland.com/"
    },
    {
      "url": "https://parallaxphotographic.coop/"
    },
    {
      "url": "https://momofuku.com/"
    },
    {
      "url": "https://www.snoozeeatery.com/"
    },
    {
      "url": "https://www.restaurantoliva.nl/"
    },
    {
      "url": "https://thenextweb.com/"
    },
    {
      "url": "https://www.artmil.com/"
    },
    {
      "url": "https://studioouam.com/en"
    },
    {
      "url": "https://www.weareunconquered.co/"
    },
    {
      "url": "https://www.hachettebookgroup.com/"
    },
    {
      "url": "https://blog.grubhub.com/"
    },
    {
      "url": "https://blog.us.playstation.com/"
    },
    {
      "url": "http://blog.ebay.com/"
    },
    {
      "url": "http://blogs.reuters.com/us/"
    },
    {
      "url": "http://blog.flickr.net/en"
    },
    {
      "url": "http://www.marieforleo.com/blog/"
    },
    {
      "url": "https://www.hachettebookgroup.com/"
    },
    {
      "url": "https://blog.grubhub.com/"
    },
    {
      "url": "https://news.microsoft.com/"
    },
    {
      "url": "https://99u.adobe.com/"
    },
    {
      "url": "https://blog.ted.com/"
    },
    {
      "url": "https://newsroom.spotify.com/"
    },
    {
      "url": "https://blog.playstation.com/"
    }
  ]
  // fs.appendFileSync('wix_no_sitemap.js', "[")

  const resp = await getPagesToCrawl(formatUrlString(wordpress_no_sitemap[5].url));
  console.log(resp);

  // fs.appendFileSync('wix_no_sitemap.js', "]")


}
test();