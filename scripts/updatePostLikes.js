const fs = require('fs');
const path = require('path');
const axios = require('axios');

function walk(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      walk(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function getLikes(slug) {
  const url = `https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/${slug}/likes`;
  const { data } = await axios(url);

  return data.love + data.like;
}

async function updatePostLikes(file) {
  const data = fs.readFileSync(file, 'utf-8');
  const slug = file.replace(/src\/posts\/(.*)\.md/i, '$1');
  const likes = await getLikes(slug);

  const fixedData = data.replace(/likes: (\d+)/gi, `likes: ${likes}`);

  fs.writeFileSync(file, fixedData, 'utf-8');

  console.log(`Update likes in ${file} to ${likes} count`);
}

Promise
  .all(walk('./src/posts', /\.md$/).map(updatePostLikes))
  .then(() => console.log('Done'));
