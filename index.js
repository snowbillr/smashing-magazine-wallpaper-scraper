const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.smashingmagazine.com/2019/09/desktop-wallpaper-calendars-october-2019/';
const TARGET_FOLDER = './downloads';

const WALLPAPER_TITLE_SELECTOR = '#article__content .c-garfield-the-cat h3[id]';
const WALLPAPER_LINK_SELECTOR = `${WALLPAPER_TITLE_SELECTOR} + p + figure + ul li:nth-child(2) a:last-child`;

async function downloadImage(image) {
  const { name, url, fileType } = image;

  const downloadPath = path.resolve(TARGET_FOLDER, `${name}${fileType}`);
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

async function getDOM() {
  const response = await axios.get(URL);
  const $ = cheerio.load(response.data);
  return $;
}

async function scrape() {
  const $ = await getDOM();

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

  wallpapers.forEach(downloadImage);
}

scrape();
