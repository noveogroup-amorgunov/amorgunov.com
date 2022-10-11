const getAllPosts = require('./getAllPosts');
const {getAllUniqueKeyValues} = require('./utils');

module.exports = function getAllTags(collection) {
  const allPosts = getAllPosts(collection);
  const tags = getAllUniqueKeyValues(allPosts, 'tags');

  return tags;
};
