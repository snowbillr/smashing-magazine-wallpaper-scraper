const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = './downloads';

const WALLPAPER_TITLE_SELECTOR = '#article__content .c-garfield-the-cat h3[id]';
const WALLPAPER_LINK_SELECTOR = `${WALLPAPER_TITLE_SELECTOR} + p + figure + ul li:nth-child(2) a:last-child`;

function processArguments() {
  if (process.argv.indexOf('-f') === -1 || process.argv.indexOf('-u') === -1) {
    console.log('need both -f and -u args');
    process.exit(1);
  }

  const folder = process.argv[process.argv.indexOf('-f') + 1];
  const url = process.argv[process.argv.indexOf('-u') + 1];

  return {
    folder,
    url
  }
}

async function getDOM(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $;
}

async function downloadWallpaper(image, folder) {
  const { name, url, fileType } = image;

  const downloadPath = path.resolve(folder, `${name}${fileType}`);
  const fileWriter = fs.createWriteStream(downloadPath)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(fileWriter)

  return new Promise((resolve, reject) => {
    fileWriter.on('finish', resolve)
    fileWriter.on('error', reject)
  });
}


async function scrape() {
  const { folder, url } = processArguments();

  const $ = await getDOM(url);

  const wallpapers = [];

  const wallpaperSectionTitles = $(WALLPAPER_TITLE_SELECTOR);
  const wallpaperLinks = $(WALLPAPER_LINK_SELECTOR);

  wallpaperSectionTitles.each(function() {
    const wallpaperTitle = $(this).text().toLowerCase().replace(/\s/g, '-');

    wallpapers.push({
      name: wallpaperTitle,
    }) ;
  });

  wallpaperLinks.each(function(i) {
    const url = $(this).attr('href');
    const size = $(this).text();
    const fileType = /\.[a-z]+$/.exec(url)[0];

    wallpapers[i].size = size;
    wallpapers[i].url = url;
    wallpapers[i].fileType = fileType;
  });

  Promise.all(wallpapers.map(wallpaper => downloadWallpaper(wallpaper, folder)))
    .then(() => {
      process.exit(0);
    });
}

scrape();
