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
