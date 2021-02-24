function getBundeslandColor(bundeslandID) {
  switch (bundeslandID) {
    case 1:
      return '#E8CA43';
    case 2:
      return '#72B32D';
    case 3:
      return '#43BAB8';
    case 4:
      return '#59F7A6';
    case 5:
      return '#9C5A1C';
    case 6:
      return '#A6326E';
    case 7:
      return '#F24EA3';
    case 8:
      return '#699C33';
    case 9:
      return '#D65154';
    case 10:
      return '#7b00fd';
    default:
      return 'blue';
  }
}

function filterBundesland(bundeslandID) {
  return (row) => row.BundeslandID === bundeslandID;
}

async function loadD3() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v6.min.js';
    script.addEventListener('load', () => {
      resolve();
    });
    document.body.appendChild(script);
  });
}

function fitTicksToZoom(svg, tickFactor) {
  svg.selectAll('.x-axis .tick text').each((_, i, nodes) => {
    d3.select(nodes[i]).attr(
      'style',
      `visibility: ${i % tickFactor === 0 ? 'visible' : 'hidden'}`
    );
  });
}

function zoom({ margin, width, height, x, xAxis }) {
  return (svg) => {
    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.top],
    ];

    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 30])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', zoomed)
    );

    function zoomed(event) {
      x.range(
        [margin.left, width - margin.right].map((d) =>
          event.transform.applyX(d)
        )
      );
      svg
        .selectAll('.bars rect')
        .attr('x', (d) => x(d.Time))
        .attr('width', x.bandwidth());

      svg.selectAll('.x-axis').call(xAxis);

      const tickFactor = Math.ceil(30 / x.bandwidth());

      fitTicksToZoom(svg, tickFactor);
    }
  };
}

function chart({ width, height, margin, x, y, xAxis, yAxis, data }) {
  const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, width, height])
    .call(zoom({ width, height, margin, x, xAxis }));

  const tooltip = d3
    .select('#chart-7ti')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  svg
    .append('g')
    .attr('class', 'bars')
    .attr('fill', 'blue')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => x(d.Time))
    .attr('y', (d) => y(d.SiebenTageInzidenzFaelle))
    .attr('height', (d) => y(0) - y(d.SiebenTageInzidenzFaelle))
    .attr('width', x.bandwidth())
    .attr('fill', (d) => getBundeslandColor(d.BundeslandID))
    .on('mouseover', function (event, d) {
      const pointer = d3.pointer(event);
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip
        .html(
          `<strong>7 Tage Inzidenz</strong><br>${
            d.Bundesland
          }<br>${d3.timeFormat('%d.%m.%Y')(d.Time)}: ${
            d.SiebenTageInzidenzFaelle
          }`
        )
        .style('background', getBundeslandColor(d.BundeslandID))
        .style('left', pointer[0] + 'px')
        .style('top', pointer[1] - 28 + 'px');
    })
    .on('mouseout', function (d) {
      tooltip.transition().duration(200).style('opacity', 0);
    });

  svg.append('g').attr('class', 'x-axis').call(xAxis);

  svg.append('g').attr('class', 'y-axis').call(yAxis);

  fitTicksToZoom(svg, Math.floor(30 / x.bandwidth()));

  return svg.node();
}

function renderChart({ data, width, height, margin }) {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.Time))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.SiebenTageInzidenzFaelle)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = (g) =>
    g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x).tickSizeOuter(0).tickFormat(d3.timeFormat('%d.%m'))
      );

  const yAxis = (g) =>
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select('.domain').remove());

  return chart({ width, height, margin, x, y, xAxis, yAxis, data });
}

async function readData() {
  const dateParse = d3.timeParse('%d.%m.%Y %H:%M:%S');

  const file = await fetch('/covid19-at/timeline.csv');

  return d3
    .dsvFormat(';')
    .parse(await file.text(), (row) => ({
      AnzEinwohner: parseInt(row.AnzEinwohner, 10),
      AnzahlFaelle: parseInt(row.AnzahlFaelle, 10),
      AnzahlFaelle7Tage: parseInt(row.AnzahlFaelle7Tage, 10),
      AnzahlFaelleSum: parseInt(row.AnzahlFaelleSum, 10),
      AnzahlGeheiltSum: parseInt(row.AnzahlGeheiltSum, 10),
      AnzahlGeheiltTaeglich: parseInt(row.AnzahlGeheiltTaeglich, 10),
      AnzahlTotSum: parseInt(row.AnzahlGeheiltTaeglich, 10),
      AnzahlTotTaeglich: parseInt(row.AnzahlTotTaeglich, 10),
      Bundesland: row.Bundesland,
      BundeslandID: parseInt(row.BundeslandID, 10),
      SiebenTageInzidenzFaelle: parseInt(row.SiebenTageInzidenzFaelle, 10),
      Time: dateParse(row.Time),
    }))
    .sort((a, b) => a.Time - b.Time);
}

function calcDiffPercentage(value1, value2, reverseColor) {
  reverseColor = reverseColor || false;
  const diff = value1 - value2;
  const percent = Math.round((100 / (value2 || 1)) * diff);
  const symbol = percent > 0 ? '+' : percent === 0 ? '=' : '';
  const classPercent = reverseColor ? percent * -1 : percent;
  return [
    `${symbol}${percent}`,
    classPercent > 0 ? 'plus' : classPercent < 0 ? 'minus' : '',
  ];
}

function overviewTable(data) {
  const dayFormat = d3.timeFormat('%d.%m.%Y');
  const oneDay = 86400000;
  const currentDay =
    data.filter((row) => dayFormat(row.Time) === dayFormat(new Date())).length >
    0
      ? new Date()
      : new Date(Date.now() - oneDay);

  const dayBefore = new Date(currentDay.getTime() - oneDay);
  const weekBefore = new Date(currentDay.getTime() - oneDay * 7);
  const monthBefore = new Date(currentDay.getTime() - oneDay * 30);

  const dataToday = data.filter(
    (row) => dayFormat(row.Time) === dayFormat(currentDay)
  );
  dataToday.forEach((rowToday) => {
    const rowDayBefore = data.find(
      (row) =>
        row.BundeslandID === rowToday.BundeslandID &&
        dayFormat(row.Time) === dayFormat(dayBefore)
    );
    const rowWeekBefore = data.find(
      (row) =>
        row.BundeslandID === rowToday.BundeslandID &&
        dayFormat(row.Time) === dayFormat(weekBefore)
    );
    const rowMonthBefore = data.find(
      (row) =>
        row.BundeslandID === rowToday.BundeslandID &&
        dayFormat(row.Time) === dayFormat(monthBefore)
    );

    const [sevenPercDayBefore, sevenClassDayDefore] = calcDiffPercentage(
      rowToday.SiebenTageInzidenzFaelle,
      rowDayBefore.SiebenTageInzidenzFaelle
    );
    const [sevenPercWeekBefore, sevenClassWeekBefore] = calcDiffPercentage(
      rowToday.SiebenTageInzidenzFaelle,
      rowWeekBefore.SiebenTageInzidenzFaelle
    );
    const [sevenPercMonthBefore, sevenClassMonthBefore] = calcDiffPercentage(
      rowToday.SiebenTageInzidenzFaelle,
      rowMonthBefore.SiebenTageInzidenzFaelle
    );

    const [casesPercDayBefore, casesClassDayBefore] = calcDiffPercentage(
      rowToday.AnzahlFaelle,
      rowDayBefore.AnzahlFaelle
    );
    const [casesPercWeekBefore, casesClassWeekBefore] = calcDiffPercentage(
      rowToday.AnzahlFaelle,
      rowWeekBefore.AnzahlFaelle
    );
    const [casesPercMonthBefore, casesClassMonthBefore] = calcDiffPercentage(
      rowToday.AnzahlFaelle,
      rowMonthBefore.AnzahlFaelle
    );

    const [deathsPercDayBefore, deathsClassDayBefore] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowDayBefore.AnzahlTotTaeglich
    );
    const [deathsPercWeekBefore, deathsClassWeekBefore] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowWeekBefore.AnzahlTotTaeglich
    );
    const [deathsPercMonthBefore, deathsClassMonthBefore] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowMonthBefore.AnzahlTotTaeglich
    );

    const [
      recoveriesPercDayBefore,
      recoveriesClassDayBefore,
    ] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowDayBefore.AnzahlTotTaeglich,
      true
    );
    const [
      recoveriesPercWeekBefore,
      recoveriesClassWeekBefore,
    ] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowWeekBefore.AnzahlTotTaeglich,
      true
    );
    const [
      recoveriesPercMonthBefore,
      recoveriesClassMonthBefore,
    ] = calcDiffPercentage(
      rowToday.AnzahlTotTaeglich,
      rowMonthBefore.AnzahlTotTaeglich,
      true
    );

    const rowElemSeven = document.querySelector(
      `[data-stat="sevenDayIncidence"][data-bundesland="${rowToday.BundeslandID}"]`
    );
    rowElemSeven.querySelector(
      '[data-col="today"]'
    ).innerHTML = `${rowToday.SiebenTageInzidenzFaelle}`;
    rowElemSeven.querySelector(
      '[data-col="yesterday"]'
    ).innerHTML = `${rowDayBefore.SiebenTageInzidenzFaelle} <span class="${sevenClassDayDefore}">(<em>${sevenPercDayBefore}%</em>)</span>`;
    rowElemSeven.querySelector(
      '[data-col="week"]'
    ).innerHTML = `${rowWeekBefore.SiebenTageInzidenzFaelle} <span class="${sevenClassWeekBefore}">(<em>${sevenPercWeekBefore}%)</em></span>`;
    rowElemSeven.querySelector(
      '[data-col="month"]'
    ).innerHTML = `${rowMonthBefore.SiebenTageInzidenzFaelle} <span class="${sevenClassMonthBefore}">(<em>${sevenPercMonthBefore}%</em>)</span>`;

    const rowElemCases = document.querySelector(
      `[data-stat="cases"][data-bundesland="${rowToday.BundeslandID}"]`
    );
    rowElemCases.querySelector('[data-col="today"]').innerHTML =
      rowToday.AnzahlFaelle;
    rowElemCases.querySelector(
      '[data-col="yesterday"]'
    ).innerHTML = `${rowDayBefore.AnzahlFaelle} <span class="${casesClassDayBefore}">(<em>${casesPercDayBefore}%</em>)</span>`;
    rowElemCases.querySelector(
      '[data-col="week"]'
    ).innerHTML = `${rowWeekBefore.AnzahlFaelle} <span class="${casesClassWeekBefore}">(<em>${casesPercWeekBefore}%</em>)</span>`;
    rowElemCases.querySelector(
      '[data-col="month"]'
    ).innerHTML = `${rowMonthBefore.AnzahlFaelle} <span class="${casesClassMonthBefore}">(<em>${casesPercMonthBefore}%</em>)</span>`;

    const rowElemDeaths = document.querySelector(
      `[data-stat="deaths"][data-bundesland="${rowToday.BundeslandID}"]`
    );
    rowElemDeaths.querySelector('[data-col="today"]').innerHTML =
      rowToday.AnzahlTotTaeglich;
    rowElemDeaths.querySelector(
      '[data-col="yesterday"]'
    ).innerHTML = `${rowDayBefore.AnzahlTotTaeglich} <span class="${deathsClassDayBefore}">(<em>${deathsPercDayBefore}%</em>)</span>`;
    rowElemDeaths.querySelector(
      '[data-col="week"]'
    ).innerHTML = `${rowWeekBefore.AnzahlTotTaeglich} <span class="${deathsClassWeekBefore}">(<em>${deathsPercWeekBefore}%</em>)</span>`;
    rowElemDeaths.querySelector(
      '[data-col="month"]'
    ).innerHTML = `${rowMonthBefore.AnzahlTotTaeglich} <span class="${deathsClassMonthBefore}">(<em>${deathsPercMonthBefore}%</em>)</span>`;

    const rowElemRecoveries = document.querySelector(
      `[data-stat="recoveries"][data-bundesland="${rowToday.BundeslandID}"]`
    );
    rowElemRecoveries.querySelector('[data-col="today"]').innerHTML =
      rowToday.AnzahlGeheiltTaeglich;
    rowElemRecoveries.querySelector(
      '[data-col="yesterday"]'
    ).innerHTML = `${rowDayBefore.AnzahlGeheiltTaeglich} <span class="${recoveriesClassDayBefore}">(<em>${recoveriesPercDayBefore}%</em>)</span>`;
    rowElemRecoveries.querySelector(
      '[data-col="week"]'
    ).innerHTML = `${rowWeekBefore.AnzahlGeheiltTaeglich} <span class="${recoveriesClassWeekBefore}">(<em>${recoveriesPercWeekBefore}%</em>)</span>`;
    rowElemRecoveries.querySelector(
      '[data-col="month"]'
    ).innerHTML = `${rowMonthBefore.AnzahlGeheiltTaeglich} <span class="${recoveriesClassMonthBefore}">(<em>${recoveriesPercMonthBefore}%</em>)</span>`;
  });
}

async function main() {
  const chartElem = document.getElementById('chart-7ti');
  const selectElem = document.getElementById('select-7ti');

  const margin = { top: 20, right: 0, bottom: 30, left: 40 };
  const width = chartElem.clientWidth;
  const height = chartElem.clientWidth / 2;
  chartElem.style.height = `${height}px`;

  await loadD3();

  const data = await readData();

  // overviewTable(data);

  let node = renderChart({
    data: data.filter(filterBundesland(10)),
    width,
    height,
    margin,
  });
  chartElem.appendChild(node);

  selectElem.addEventListener('change', (event) => {
    const bundeslandID = parseInt(event.target.value, 10);
    document.querySelectorAll('.overview-table .data-row').forEach((elem) => {
      const elemBundeslandID = parseInt(
        elem.getAttribute('data-bundesland'),
        10
      );
      if (elemBundeslandID === bundeslandID) {
        elem.classList.remove('hide');
      } else {
        elem.classList.add('hide');
      }
    });
    chartElem.removeChild(node);
    const filteredData = data.filter(filterBundesland(bundeslandID));
    node = renderChart({
      data: filteredData,
      width,
      height,
      margin,
    });
    chartElem.appendChild(node);
  });
}

window.onload = main;
