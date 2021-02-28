function round(value) {
  value = parseFloat(value);
  if (isNaN(value)) {
    return null;
  }
  return Math.round(parseFloat(value));
}

module.exports = {
  round,
};
