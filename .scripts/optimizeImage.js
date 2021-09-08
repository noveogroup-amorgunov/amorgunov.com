const path = require('path');
const lqip = require('lqip');
const fs = require('fs');
const { promisify } = require('util');
const { ImagePool } = require('@squoosh/lib');
const {argv} = require('yargs');

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const {slug, replace} = argv;

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

function shouldPrerareFile(file) {
  const [fileName, extension] = file.split('.');

  if (file ==='preview.jpg') {
    return false;
  }
  
  if (!/(png|jpg|jpeg)$/.test(extension)) {
    return false;
  }

  if (['min', 'gif', 'out'].includes(extension)) {
    return false;
  }
  
  return true;
}

async function createPreview(file) {
  const [fileName, extension] = file.split('.');

  const raw = await lqip.base64(path.join(`${inputPath}${file}`));
  const base64Data = raw.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
  const outputFilename = path.join(outputPath, `${fileName}.min.${extension}`);

  await writeFile(outputFilename, base64Data, 'base64');
}

async function compressImage(file, imagePool) {
  const [fileName, extension] = file.split('.');
  const originPath = path.join(`${inputPath}${file}`);
  const image = imagePool.ingestImage(originPath);

  const encodeOptions = {
      mozjpeg: {},
      jxl: {
          quality: 90,
      },
  };
  
  await image.encode(encodeOptions);

  const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;

  fs.writeFileSync(path.join(`${inputPath}${fileName}.out.jpg`), rawEncodedImage);
  
  if (replace) {
    fs.unlinkSync(originPath);
  }
}

async function optimizeImage() {
  const imagePool = new ImagePool();
  const files = await readdir(inputPath);

  for (const file of files) {
    if (!shouldPrerareFile(file)) {
      continue;
    }

    await createPreview(file);
    await compressImage(file, imagePool);
  }

  await imagePool.close();
}

optimizeImage()
  .then(() => console.log('Images were optimize successfully'))
  .catch(err => console.error(err))
  .finally(() => process.exit(0));
