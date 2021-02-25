function calcDiffPercentage(value1, value2, reverseColor) {
  reverseColor = reverseColor || false;
  const diff = value1 - value2;
  const percent = Math.round((100 / (value2 || 1)) * diff);
  const symbol = percent > 0 ? '+' : percent === 0 ? '=' : '';
  const classPercent = reverseColor ? percent * -1 : percent;
  return [
    `${symbol}${percent}`,
    classPercent > 0 ? 'plus' : classPercent < 0 ? 'minus' : '',
  ];
}

async function main() {
  const selectElem = document.getElementById('select-7ti');

  selectElem.addEventListener('change', (event) => {
    const bundeslandID = parseInt(event.target.value, 10);
    document.querySelectorAll('.overview-table .data-row').forEach((elem) => {
      const elemBundeslandID = parseInt(
        elem.getAttribute('data-bundesland'),
        10
      );
      if (elemBundeslandID === bundeslandID) {
        elem.classList.remove('hide');
      } else {
        elem.classList.add('hide');
      }
    });
  });
}

window.onload = main;
