const dayjs = require('dayjs');

function filterTimeline(timeline) {
  return {
    province: (province) => {
      return {
        date: (date) => {
          const dateStr = date.format('DD.MM.YYYY [00:00:00]');
          return timeline.find((entry) => {
            return entry.BundeslandID == province && entry.Time === dateStr;
          });
        },
      };
    },
  };
}

function covid19AtByProvince(timeline, province) {
  const date = dayjs();
  const filter = filterTimeline(timeline).province(province);
  return {
    yesterday: filter.date(date.subtract(1, 'day')),
    beforeYesterday: filter.date(date.subtract(2, 'day')),
    lastWeek: filter.date(date.subtract(8, 'day')),
    lastMonth: filter.date(date.subtract(31, 'day')),
  };
}

module.exports = {
  covid19AtByProvince,
};
