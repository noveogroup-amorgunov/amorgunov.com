module.exports = value => {
  const version = process.env.COMMIT_REF || 'dev';

  return `${value}${version}`;
};
