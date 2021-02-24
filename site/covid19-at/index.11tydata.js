const fetch = require('node-fetch');
const neatCsv = require('neat-csv');

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
  return { timeline, provinces };
};
