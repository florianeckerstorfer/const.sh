const fetch = require('node-fetch');
const neatCsv = require('neat-csv');
const dayjs = require('dayjs');

function uniqueProvince(value, index, self) {
  return (
    self.map((item) => item.BundeslandID).indexOf(value.BundeslandID) === index
  );
}

async function getTimeline() {
  const response = await fetch(
    'https://covid19-dashboard.ages.at/data/CovidFaelle_Timeline.csv'
  );
  const text = await response.text();
  return neatCsv(text, { separator: ';' });
}

module.exports = async function () {
  const timeline = await getTimeline();
  const provinces = timeline
    .map(({ Bundesland, BundeslandID }) => ({ Bundesland, BundeslandID }))
    .filter(uniqueProvince);
  const dates = {
    yesterday: dayjs().subtract(1, 'day').format('DD.MM.YYYY'),
    beforeYesterday: dayjs().subtract(2, 'day').format('DD.MM.YYYY'),
    lastWeek: dayjs().subtract(8, 'day').format('DD.MM.YYYY'),
    lastMonth: dayjs().subtract(31, 'day').format('DD.MM.YYYY'),
  };
  return { timeline, provinces, dates };
};
