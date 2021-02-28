function round(value) {
  value = parseFloat(value);
  if (isNaN(value)) {
    return null;
  }
  return Math.round(parseFloat(value));
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const formatter = new Intl.NumberFormat('de-DE');
  return formatter.format(value);
}

module.exports = {
  round,
  formatNumber,
};
