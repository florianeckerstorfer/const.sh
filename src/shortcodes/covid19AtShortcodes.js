function covid19AtDiffBetweenValues(
  currentValue,
  compareValue,
  higherIsBetter = false
) {
  currentValue = parseInt(currentValue, 10);
  compareValue = parseInt(compareValue, 10);
  if (isNaN(currentValue) || isNaN(compareValue)) {
    return '';
  }
  const diff = currentValue - compareValue;
  const percent = Math.round((100 / (compareValue || 1)) * diff);
  const symbol = percent > 0 ? '+' : percent === 0 ? '=' : '';
  const classPercent = higherIsBetter ? percent * -1 : percent;
  const className = classPercent > 0 ? 'plus' : classPercent < 0 ? 'minus' : '';

  return `<span class="compare ${className}">${symbol}${percent}%</span>`;
}

module.exports = {
  covid19AtDiffBetweenValues,
};
