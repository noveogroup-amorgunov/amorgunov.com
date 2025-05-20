module.exports = function getAllPosts(collection) {
  const posts = collection.getFilteredByGlob(`src/posts/*.md`)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
}
