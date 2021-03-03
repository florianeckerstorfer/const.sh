const fetch = require('node-fetch');
const neatCsv = require('neat-csv');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

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
  return (await neatCsv(text, { separator: ';' })).map((row) => ({
    ...row,
    BundeslandID: parseInt(row.BundeslandID, 10),
    AnzEinwohner: parseInt(row.AnzEinwohner, 10),
    AnzahlFaelle: parseInt(row.AnzahlFaelle, 10),
    AnzahlFaelleSum: parseInt(row.AnzahlFaelleSum, 10),
    AnzahlFaelle7Tage: parseInt(row.AnzahlFaelle7Tage, 10),
    SiebenTageInzidenzFaelle: parseInt(row.SiebenTageInzidenzFaelle, 10),
    AnzahlTotTaeglich: parseInt(row.AnzahlTotTaeglich, 10),
    AnzahlTotSum: parseInt(row.AnzahlTotSum, 10),
    AnzahlGeheiltTaeglich: parseInt(row.AnzahlGeheiltTaeglich, 10),
    AnzahlGeheiltSum: parseInt(row.AnzahlGeheiltSum, 10),
  }));
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
  const timeline = (await getTimeline()).map((row) => {
    const rowDate = dayjs(row.Time, 'DD.MM.YYYY HH:mm:ss').format('YYYY-MM-DD');
    const found = testsAndHospitals[rowDate]
      ? testsAndHospitals[rowDate][row.BundeslandID]
      : undefined;
    if (found) {
      row.Test = found.Test;
      row.TestGesamt = found.TestGesamt;
      row.FZHosp = found.FZHosp;
      row.FZHospFree = found.FZHospFree;
      row.FZHospTotal = found.FZHospTotal;
      row.FZHospPercent = found.FZHospPercent;
      row.FZICU = found.FZICU;
      row.FZICUFree = found.FZICUFree;
      row.FZICUTotal = found.FZICUTotal;
      row.FZICUPercent = found.FZICUPercent;
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
