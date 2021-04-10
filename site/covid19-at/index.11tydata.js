const fetch = require('node-fetch');
const neatCsv = require('neat-csv');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { Ape } = require('@fec/ape');

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

async function getImpfpassData() {
  const response = await fetch(
    'https://info.gesundheitsministerium.gv.at/data/timeline-eimpfpass.csv'
  );
  const text = await response.text();
  const ape = new Ape(
    await neatCsv(text, {
      separator: ';',
      mapHeaders: ({ header }) => (header.match(/Datum/) ? 'Datum' : header),
    })
  );
  ape
    .mapValue('Datum', (value) =>
      typeof value === 'object'
        ? value
        : dayjs(value.match(/\d{4}-\d{2}-\d{2}/)[0], 'YYYY-MM-DD')
    )
    .addProperty('DatumYYYYMMDD', (record) => record.Datum.format('YYYY-MM-DD'))
    .mapValue('Bevoelkerung', valueParseInt)
    .mapValue('EingetrageneImpfungen', valueParseInt)
    .mapValue('EingetrageneImpfungenPro100', valueParseInt)
    .mapValue('Teilgeimpfte', valueParseInt)
    .mapValue('TeilgeimpftePro100', valueParseInt)
    .mapValue('Vollimmunisierte', valueParseInt)
    .mapValue('VollimmunisiertePro100', valueParseInt)
    .createIndex(['DatumYYYYMMDD', 'BundeslandID'])
    .addProperty(
      'TeilgeimpfteTaeglich',
      (record) =>
        record.Teilgeimpfte -
        findDayBeforeValue(
          ape,
          record.Datum,
          record.BundeslandID,
          'Teilgeimpfte',
          0
        )
    )
    .addProperty(
      'VollimmunisierteTaeglich',
      (record) =>
        record.Vollimmunisierte -
        findDayBeforeValue(
          ape,
          record.Datum,
          record.BundeslandID,
          'Vollimmunisierte',
          0
        )
    );
  return new Ape(ape.process()).createIndex(['DatumYYYYMMDD', 'BundeslandID']);
}

async function getTimeline() {
  const response = await fetch(
    'https://covid19-dashboard.ages.at/data/CovidFaelle_Timeline.csv'
  );
  const text = await response.text();
  const timeline = new Ape(await neatCsv(text, { separator: ';' }));
  timeline
    .mapValue('BundeslandID', valueParseInt)
    .mapValue('AnzEinwohner', valueParseInt)
    .mapValue('AnzahlFaelle', valueParseInt)
    .mapValue('AnzahlFaelleSum', valueParseInt)
    .mapValue('AnzahlFaelle7Tage', valueParseInt)
    .mapValue('SiebenTageInzidenzFaelle', valueParseInt)
    .mapValue('AnzahlTotTaeglich', valueParseInt)
    .mapValue('AnzahlTotSum', valueParseInt)
    .mapValue('AnzahlGeheiltTaeglich', valueParseInt)
    .mapValue('AnzahlGeheiltSum', valueParseInt);
  return timeline.process();
}

async function getTestsAndHospitals() {
  const response = await fetch(
    'https://covid19-dashboard.ages.at/data/CovidFallzahlen.csv'
  );
  const text = await response.text();
  const data = await neatCsv(text, { separator: ';' });
  const newData = {};
  for (let i = 0; i < data.length; i += 1) {
    const date = dayjs(data[i].Meldedat, 'DD.MM.YYYY').format('YYYY-MM-DD');
    if (!newData[date]) {
      newData[date] = {};
    }
    const BundeslandID = parseInt(data[i].BundeslandID, 10);
    const dayBefore = dayjs(data[i].Meldedat, 'DD.MM.YYYY')
      .subtract(1, 'day')
      .format('DD.MM.YYYY');
    const dayBeforeRow = data.find((item) => {
      return (
        item.Meldedat === dayBefore &&
        item.BundeslandID === data[i].BundeslandID
      );
    });
    const testsYesterdayGesamt = dayBeforeRow ? dayBeforeRow.TestGesamt : 0;
    const TestGesamt = parseInt(data[i].TestGesamt, 10);
    const Test = TestGesamt - testsYesterdayGesamt;
    const FZHosp = parseInt(data[i].FZHosp, 10);
    const FZHospFree = parseInt(data[i].FZHospFree, 10);
    const FZHospTotal = FZHosp + FZHospFree;
    const FZHospPercent = Math.round((100 / FZHospTotal) * FZHosp);
    const FZICU = parseInt(data[i].FZICU, 10);
    const FZICUFree = parseInt(data[i].FZICUFree, 10);
    const FZICUTotal = FZICU + FZICUFree;
    const FZICUPercent = Math.round((100 / FZICUTotal) * FZICU);
    newData[date][BundeslandID] = {
      ...data[i],
      BundeslandID,
      TestGesamt,
      Test,
      FZHosp,
      FZHospFree,
      FZHospTotal,
      FZHospPercent,
      FZICU,
      FZICUFree,
      FZICUTotal,
      FZICUPercent,
      BundeslandID: parseInt(data[i].BundeslandID, 10),
    };
  }
  return newData;
}

module.exports = async function () {
  const testsAndHospitals = await getTestsAndHospitals();
  const impfungen = await getImpfpassData();
  const timeline = (await getTimeline()).map((row) => {
    const rowDate = dayjs(row.Time, 'DD.MM.YYYY HH:mm:ss').format('YYYY-MM-DD');
    const foundTestRow = testsAndHospitals[rowDate]
      ? testsAndHospitals[rowDate][row.BundeslandID]
      : undefined;
    if (foundTestRow) {
      row.Test = foundTestRow.Test;
      row.TestGesamt = foundTestRow.TestGesamt;
      row.FZHosp = foundTestRow.FZHosp;
      row.FZHospFree = foundTestRow.FZHospFree;
      row.FZHospTotal = foundTestRow.FZHospTotal;
      row.FZHospPercent = foundTestRow.FZHospPercent;
      row.FZICU = foundTestRow.FZICU;
      row.FZICUFree = foundTestRow.FZICUFree;
      row.FZICUTotal = foundTestRow.FZICUTotal;
      row.FZICUPercent = foundTestRow.FZICUPercent;
    }
    const foundVaccinationRow = impfungen.findByIndex({
      DatumYYYYMMDD: rowDate,
      BundeslandID: row.BundeslandID,
    });
    if (foundVaccinationRow) {
      row.TeilgeimpfteTaeglich = foundVaccinationRow.TeilgeimpfteTaeglich;
      row.VollimmunisierteTaeglich =
        foundVaccinationRow.VollimmunisierteTaeglich;
    }
    return row;
  });
  const provinces = timeline
    .map(({ Bundesland, BundeslandID }) => ({ Bundesland, BundeslandID }))
    .filter(uniqueProvince);
  const lastDay = timeline.reduce((prev, current) => {
    const thisDate = dayjs(current.Time, 'DD.MM.YYYY HH:mm:ss');
    return !prev || thisDate.isAfter(prev) ? thisDate : prev;
  }, false);
  const dates = {
    yesterday: lastDay.format('DD.MM.YYYY'),
    beforeYesterday: lastDay.subtract(1, 'day').format('DD.MM.YYYY'),
    lastWeek: lastDay.subtract(7, 'day').format('DD.MM.YYYY'),
    lastMonth: lastDay.subtract(30, 'day').format('DD.MM.YYYY'),
  };
  return { timeline, testsAndHospitals, provinces, dates };
};
