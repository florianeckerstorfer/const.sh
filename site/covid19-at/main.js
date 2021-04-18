async function main() {
  const selectElem = document.getElementById('select-7ti');

  selectElem.addEventListener('change', (event) => {
    const bundeslandID = parseInt(event.target.value, 10);
    document.querySelectorAll('.covid19-table__cell ').forEach((elem) => {
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

  const vaccProgressToggle = document.querySelector(
    '#covid19-vacc-progress-toggle'
  );
  vaccProgressToggle.querySelector('a').addEventListener('click', (event) => {
    event.preventDefault();
    const bars = document.querySelectorAll('.covid19-progress');
    if (vaccProgressToggle.classList.contains('collapsed')) {
      vaccProgressToggle.classList.add('expanded');
      vaccProgressToggle.classList.remove('collapsed');
      bars.forEach((bar) => {
        bar.style.display = 'block';
      });
    } else {
      vaccProgressToggle.classList.remove('expanded');
      vaccProgressToggle.classList.add('collapsed');
      bars.forEach((bar) => {
        if (!bar.id.match(/-10/)) {
          bar.style.display = 'none';
        }
      });
    }
  });
}

window.onload = main;
