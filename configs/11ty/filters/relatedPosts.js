module.exports = (arr, pageUrl, tags, n) => {
  const relatedPosts = [...arr];

  relatedPosts.forEach(post => {
    post.related = 0;

    (post.data.tags || []).forEach(tag => {
      if (tags.includes(tag)) {
        post.related += 1;
      }
    });
  });

  return relatedPosts
    .filter(post => post.url !== pageUrl)
    .sort((a, b) => b.related - a.related)
    .slice(0, n);
};
