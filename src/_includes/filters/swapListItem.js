module.exports = (arr, n) => {
  return arr.sort(() => Math.random() - Math.random()).slice(0, n);
};
