const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const WALLPAPER_TITLE_SELECTOR = '#article__content .c-garfield-the-cat h3[id]';
const WALLPAPER_LINK_SELECTOR = `${WALLPAPER_TITLE_SELECTOR} + p + figure + ul li:nth-child(2) a:last-child`;

function processArguments() {
  if (process.argv.indexOf('-f') === -1 || process.argv.indexOf('-u') === -1) {
    console.log('Scraper help:')
    console.log('-f FOLDER_PATH');
    console.log('-u URL');

    process.exit(1);
  }

  return {
    folder: process.argv[process.argv.indexOf('-f') + 1],
    url: process.argv[process.argv.indexOf('-u') + 1]
  }
}

async function getWallpaperInfo(url) {
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

  return wallpapers;
}

async function getDOM(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $;
}

async function downloadWallpapers(wallpapers, folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  Promise.all(wallpapers.map(wallpaper => {
    console.log(`Downloading ${wallpaper.name}`);
    downloadWallpaper(wallpaper, folder)
  })).then(() => {
      console.log(`Downloaded all ${wallpapers.length} wallpapers.`);
      process.exit(0);
    });
}

async function downloadWallpaper(wallpaper, folder) {
  const { name, url, fileType } = wallpaper;

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

  const wallpapers = await getWallpaperInfo(url);

  downloadWallpapers(wallpapers, folder);
}

scrape();
