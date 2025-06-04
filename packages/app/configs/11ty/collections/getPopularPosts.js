const getAllPosts = require('./getAllPosts')

const currentYear = new Date().getFullYear()

function getAdjustedLikes(post) {
  const postYear = (new Date(post.date)).getFullYear()
  const yearDiff = currentYear - postYear
  const adjustedLikes = Math.max(0.5, 1 - (yearDiff / 10))

  return Math.round(post.data.likes * adjustedLikes)
}

module.exports = function getPopularPostsCollection(collection) {
  const allPosts = getAllPosts(collection)

  return allPosts
    .sort((a, b) => getAdjustedLikes(b) - getAdjustedLikes(a))
    .slice(0, 3)
}
