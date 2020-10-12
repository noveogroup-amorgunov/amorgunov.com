module.exports = function getTagList(collection) {
  const tagSet = new Set();
  const skippedTag = ['all', 'nav', 'post', 'posts'];

  collection.getAll().forEach(item => {
    if ('tags' in item.data) {
      item.data.tags
        .filter(tagItem => !skippedTag.includes(tagItem))
        .forEach(tag => tagSet.add(tag));
    }
  });

  return [...tagSet];
};
