const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = async function downloadWallpapers(wallpapers, folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  return Promise.all(wallpapers.map(wallpaper => {
    console.log(`Downloading ${wallpaper.name}`);
    return downloadWallpaper(wallpaper, folder)
  }));
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
