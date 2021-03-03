function round(value) {
  value = parseFloat(value);
  if (isNaN(value)) {
    return null;
  }
  return Math.round(parseFloat(value));
}

function formatNumber(value, isPercent = false) {
  if (value === null || value === undefined) {
    return '-';
  }
  const formatter = new Intl.NumberFormat('de-DE');
  return `${formatter.format(value)}${isPercent ? '%' : ''}`;
}

module.exports = {
  round,
  formatNumber,
};
