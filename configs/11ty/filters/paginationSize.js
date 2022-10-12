// Get the first `n` elements of a collection.
module.exports = (items, countOnPage) => {
  return Math.ceil(items / countOnPage) + 1;
};
