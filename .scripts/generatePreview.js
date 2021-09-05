/**
 * Generate image preview of article
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const puppeteer = require('puppeteer');
const {ImagePool} = require('@squoosh/lib');
const {argv} = require('yargs');

const dirPath = `./src/assets/images/${argv.slug}/`;

const port = process.env.PORT || 7563;
const endpoint = `http://localhost:${port}`; 

function runServer() {
    const app = express();

    app.use(express.static(path.join(__dirname, '../dist')));
    
    app.listen(port, () => console.log(`express server start listen on ${port}`));
    
    return app;
}

function getScreenshotPath(fileName = 'preview-not-optimized.jpg') {
    return path.join(__dirname, '..', dirPath, fileName);
}

async function makeScreenshot() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();  

    await page.goto(`${endpoint}/posts/${argv.slug}/`);   

    page.setViewport({width: 400, height: 300, deviceScaleFactor: 1});

    await page.screenshot({path: getScreenshotPath()})

    await browser.close();
}

async function optimizeScreenshot() {
    const imagePool = new ImagePool();
    const image = imagePool.ingestImage(getScreenshotPath());

    const encodeOptions = {
        mozjpeg: {},
        jxl: {
            quality: 90,
        },
    };
    
    await image.encode(encodeOptions);

    const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;

    fs.writeFileSync(getScreenshotPath('preview.jpg'), rawEncodedImage);

    fs.unlinkSync(getScreenshotPath());

    await imagePool.close();
}


async function run() {
    await runServer()
    await makeScreenshot();
    await optimizeScreenshot();

    process.exit(0);
}

if (!argv.slug) {
    throw new Error(
        'The post slug is required.\n' +
        'You should run script like `node ./scripts/generatePreview --slug=<slug>`.'
    );
}

// TODO: Check that dir exists

run();
