const fetch = require('node-fetch');
const neatCsv = require('neat-csv');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { ape } = require('@fec/ape');

dayjs.extend(customParseFormat);

function valueParseInt(value) {
  return parseInt(value, 10);
}

function findDayBeforeValue(ape, date, provinceId, key, defaultValue) {
  const dayBeforeDate = date.subtract(1, 'day').format('YYYY-MM-DD');
  const record = ape.findByIndex({
    DatumYYYYMMDD: dayBeforeDate,
    BundeslandID: provinceId,
  });
  return record ? record[key] : defaultValue;
}

function uniqueProvince(value, index, self) {
  return (
    self.map((item) => item.BundeslandID).indexOf(value.BundeslandID) === index
  );
}

async function getVaccinationData() {
  const response = await fetch(
    'https://info.gesundheitsministerium.gv.at/data/timeline-eimpfpass.csv'
  );
  const text = await response.text();
  let data = ape(
    await neatCsv(text, {
      separator: ';',
      mapHeaders: ({ header }) => (header.match(/Datum/) ? 'Datum' : header),
    })
  );

  data = data
    .mapValue('Datum', (value) =>
      dayjs(value.match(/\d{4}-\d{2}-\d{2}/)[0], 'YYYY-MM-DD')
    )
    .addValue('DatumYYYYMMDD', (record) => record.Datum.format('YYYY-MM-DD'))
    .mapValue('BundeslandID', valueParseInt)
    .createIndex(['DatumYYYYMMDD', 'BundeslandID']);

  function calcDailyPartlyVaccinated({ Teilgeimpfte, Datum, BundeslandID }) {
    return (
      Teilgeimpfte -
      findDayBeforeValue(data, Datum, BundeslandID, 'Teilgeimpfte', 0)
    );
  }

  function calcDailyFullyVaccinated({ Vollimmunisierte, Datum, BundeslandID }) {
    return (
      Vollimmunisierte -
      findDayBeforeValue(data, Datum, BundeslandID, 'Vollimmunisierte', 0)
    );
  }

  return data
    .mapValue('Bevölkerung', valueParseInt)
    .mapValue('EingetrageneImpfungen', valueParseInt)
    .mapValue('EingetrageneImpfungenPro100', valueParseInt)
    .mapValue('Teilgeimpfte', valueParseInt)
    .mapValue('TeilgeimpftePro100', valueParseInt)
    .mapValue('Vollimmunisierte', valueParseInt)
    .mapValue('VollimmunisiertePro100', valueParseInt)
    .addValue('TeilgeimpfteTaeglich', calcDailyPartlyVaccinated)
    .addValue('VollimmunisierteTaeglich', calcDailyFullyVaccinated);
}

async function getCaseData() {
  const response = await fetch(
    'https://covid19-dashboard.ages.at/data/CovidFaelle_Timeline.csv'
  );
  const text = await response.text();
  const timeline = ape(await neatCsv(text, { separator: ';' }));
  return timeline
    .mapValue('BundeslandID', valueParseInt)
    .mapValue('AnzEinwohner', valueParseInt)
    .mapValue('AnzahlFaelle', valueParseInt)
    .mapValue('AnzahlFaelleSum', valueParseInt)
    .mapValue('AnzahlFaelle7Tage', valueParseInt)
    .mapValue('SiebenTageInzidenzFaelle', valueParseInt)
    .mapValue('AnzahlTotTaeglich', valueParseInt)
    .mapValue('AnzahlTotSum', valueParseInt)
    .mapValue('AnzahlGeheiltTaeglich', valueParseInt)
    .mapValue('AnzahlGeheiltSum', valueParseInt)
    .addValue('DatumYYYYMMDD', (record) =>
      dayjs(record.Time, 'DD.MM.YYYY HH:mm:ss').format('YYYY-MM-DD')
    );
}

async function getHealthCareData() {
  const response = await fetch(
    'https://covid19-dashboard.ages.at/data/CovidFallzahlen.csv'
  );
  const text = await response.text();
  let data = ape(await neatCsv(text, { separator: ';' }));
  data = data
    .renameKey('Meldedat', 'Datum')
    .mapValue('Datum', (value) => dayjs(value, 'DD.MM.YYYY'))
    .addValue('DatumYYYYMMDD', (record) => record.Datum.format('YYYY-MM-DD'))
    .mapValue('BundeslandID', valueParseInt)
    .createIndex(['DatumYYYYMMDD', 'BundeslandID']);

  function calcTestValue({ Datum, BundeslandID, TestGesamt }) {
    return (
      TestGesamt -
      findDayBeforeValue(data, Datum, BundeslandID, 'TestGesamt', 0)
    );
  }

  return data
    .mapValue('TestGesamt', valueParseInt)
    .mapValue('FZHosp', valueParseInt)
    .mapValue('FZHospFree', valueParseInt)
    .mapValue('FZICU', valueParseInt)
    .mapValue('FZICUFree', valueParseInt)
    .addValue('FZHospTotal', (record) => record.FZHosp + record.FZHospFree)
    .addValue('FZHospPercent', (record) =>
      Math.round((100 / record.FZHospTotal) * record.FZHosp)
    )
    .addValue('FZICUTotal', (record) => record.FZICU + record.FZICUFree)
    .addValue('FZICUPercent', (record) =>
      Math.round((100 / record.FZICUTotal) * record.FZICU)
    )
    .addValue('Test', calcTestValue);
}

module.exports = async function () {
  const testsAndHospitals = await getHealthCareData();
  const impfungen = await getVaccinationData();
  const timeline = await getCaseData();
  const data = timeline
    .mergeByIndex(['DatumYYYYMMDD', 'BundeslandID'], impfungen.data)
    .mergeByIndex(['DatumYYYYMMDD', 'BundeslandID'], testsAndHospitals.data)
    .data;

  const provinces = data
    .map(({ Bundesland, BundeslandID }) => ({ Bundesland, BundeslandID }))
    .filter(uniqueProvince);

  const lastDay = data.reduce((prev, current) => {
    const thisDate = dayjs(current.Time, 'DD.MM.YYYY HH:mm:ss');
    return !prev || thisDate.isAfter(prev) ? thisDate : prev;
  }, false);

  const dates = {
    yesterday: lastDay.format('DD.MM.YYYY'),
    beforeYesterday: lastDay.subtract(1, 'day').format('DD.MM.YYYY'),
    lastWeek: lastDay.subtract(7, 'day').format('DD.MM.YYYY'),
    lastMonth: lastDay.subtract(30, 'day').format('DD.MM.YYYY'),
  };
  return { timeline: data, testsAndHospitals, provinces, dates };
};
