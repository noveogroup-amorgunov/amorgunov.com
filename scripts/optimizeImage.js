const path = require('path');
const lqip = require('lqip');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const [, , slug] = process.argv;

if (!slug) {
  throw new Error(
    'The image folder path is required.\n' +
    'You should run script like `npm run optimize-image <image-folder>`.'
  );
}

const inputPath = path.join('./src/assets/images', slug, '/');
const outputPath = inputPath;
const folderIsExists = fs.existsSync(inputPath);

if (!folderIsExists) {
  throw new Error(
    `Nothing to optimize in ${inputPath}. Try change folder`
  );
}

async function optimizeImage() {
  try {
    const files = await readdir(inputPath);

    for (const file of files) {
      const [fileName, extension] = file.split('.');

      if (['min', 'gif'].includes(extension)) {
        continue;
      }

      const raw = await lqip.base64(path.join(`${inputPath}${file}`));
      const base64Data = raw.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
      const outputFilename = path.join(outputPath, `${fileName}.min.${extension}`);

      await writeFile(outputFilename, base64Data, 'base64');
    }
  } catch (err) {
    console.error(err);
  }
}

optimizeImage().then(() => {
  console.log('Images were optimize successfully');
});
