const getAllPosts = require('./getAllPosts');
const getAllTags = require('./getAllTags');

module.exports = function getAllTagsWithPostsCount(collection) {
  const tags = getAllTags(collection);
  const posts = getAllPosts(collection);

  return tags
    .map(tag => ({
      tag,
      posts: posts.filter(post => post.data.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.posts - a.posts);
};
