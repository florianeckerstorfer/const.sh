const dayjs = require('dayjs');

function formatDateFilter(date, format) {
  return dayjs(date).format(format);
}

function currentDateFilter(format) {
  return dayjs().format(format);
}

module.exports = {
  formatDateFilter,
  currentDateFilter,
};
