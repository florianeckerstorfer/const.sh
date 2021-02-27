const dayjs = require('dayjs');

function formatDateFilter(date, format) {
  return dayjs(date).format(format);
}

module.exports = {
  formatDateFilter,
};
