const getWallpaperInfo = require('./wallpaper-page-parser');
const downloadWallpapers = require('./wallpaper-downloader');

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

async function scrape() {
  const { folder, url } = processArguments();

  const wallpapers = await getWallpaperInfo(url);

  await downloadWallpapers(wallpapers, folder);

  console.log(`Downloaded all ${wallpapers.length} wallpapers.`);
  process.exit(0);
}

scrape();
