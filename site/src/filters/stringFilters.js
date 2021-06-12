function removeTrailingSlash(value) {
  return value.replace(/(\/)$/, '');
}

module.exports = {
  removeTrailingSlash,
};
