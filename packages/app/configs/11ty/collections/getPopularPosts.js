const getAllPosts = require('./getAllPosts')

module.exports = function getPopularPostsCollection(collection) {
  const allPosts = getAllPosts(collection)

  return allPosts.sort((a, b) => b.data.likes - a.data.likes).slice(0, 3)
}
