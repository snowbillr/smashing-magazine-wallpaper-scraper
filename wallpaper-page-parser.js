const axios = require('axios');
const cheerio = require('cheerio');

const WALLPAPER_TITLE_SELECTOR = '#article__content .c-garfield-the-cat h3[id]';
const WALLPAPER_LINK_SELECTOR = `${WALLPAPER_TITLE_SELECTOR} + p + figure + ul li:nth-child(2) a:last-child`;

module.exports = async function getWallpaperInfo(url) {
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
