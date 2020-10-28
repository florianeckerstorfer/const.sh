function selectText(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn('Could not select text in node: Unsupported browser.');
  }
}

function main() {
  const emojicon = document.querySelector('#emojicon');
  const input = emojicon.querySelector('#emoji');
  const canvas = emojicon.querySelector('#canvas');
  const dataUrl = emojicon.querySelector('#data-url');
  const context = canvas.getContext('2d');
  context.font = '96px sans-serif';

  function handleValue(value) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!value || value.length === 0) {
      dataUrl.value = '';
      return;
    }

    const measure = context.measureText(value);
    const positionX = (canvas.width - measure.width) / 2;
    const positionY = measure.actualBoundingBoxAscent;
    context.fillText(value, positionX, positionY);

    dataUrl.textContent = canvas.toDataURL('image/png');
  }

  emojicon.addEventListener('submit', (event) => {
    event.preventDefault();
    handleValue(input.value);
  });

  input.addEventListener('input', (event) => {
    handleValue(event.target.value);
  });

  emojicon.querySelectorAll('.examples a').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      input.value = event.target.innerHTML;
      handleValue(input.value);
    });
  });

  dataUrl.addEventListener('click', (event) => {
    event.preventDefault();
    selectText(dataUrl);
  });
}

main();
