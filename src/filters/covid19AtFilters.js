const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

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

function covid19AtRowByProvince(timeline, province, dates) {
  const lastDay = dayjs(dates.yesterday, 'DD.MM.YYYY');
  const dayBefore = dayjs(dates.beforeYesterday, 'DD.MM.YYYY');
  const lastWeek = dayjs(dates.lastWeek, 'DD.MM.YYYY');
  const lastMonth = dayjs(dates.lastMonth, 'DD.MM.YYYY');

  const filter = filterTimeline(timeline).province(province);
  return {
    yesterday: filter.date(lastDay),
    beforeYesterday: filter.date(dayBefore),
    lastWeek: filter.date(lastWeek),
    lastMonth: filter.date(lastMonth),
  };
}

module.exports = {
  covid19AtRowByProvince,
};
