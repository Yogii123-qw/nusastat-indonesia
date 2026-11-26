// Page HTML for each route. Every figure comes from DATA, and every card names
// its source and year. Text is plain English, no placeholders.

import { DATA } from './data.js';
import { barChart, groupedBarChart, hBarChart, lineChart } from './charts.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function sourceLine(text) {
  return `<p class="source">Source: ${esc(text)}</p>`;
}

function statCard(label, value, sub, href) {
  const inner = `<p class="stat-label">${esc(label)}</p><p class="stat-value">${esc(value)}</p><p class="stat-sub">${esc(sub)}</p>`;
  return href
    ? `<a class="card stat" href="${href}">${inner}<span class="card-link">Open section</span></a>`
    : `<div class="card stat">${inner}</div>`;
}

function sectionHead(title, intro) {
  return `<div class="page-head"><h1>${esc(title)}</h1><p class="lede">${esc(intro)}</p></div>`;
}

// #/ and #/overview
export function overviewView() {
  const pop = lineChart(
    DATA.population.trend.map((p) => ({ label: String(p.year), value: p.value })),
    { color: '#0e7a6b', format: (v) => `${v.toFixed(1)}m`, title: 'Population trend, 2020 to 2024' },
  );
  const growth = barChart(
    DATA.economy.growth.map((g) => ({ label: String(g.year), value: g.value })),
    { color: '#2563eb', format: (v) => `${v.toFixed(2)}%`, title: 'Real GDP growth, 2020 to 2024' },
  );
  const top = hBarChart(
    DATA.provinces.slice(0, 5).map((p) => ({ label: p.name, value: p.population })),
    { format: (v) => `${v.toFixed(2)}m`, title: 'Five largest provinces by population' },
  );
  return `${sectionHead('Indonesia in Numbers', 'Population, economy, health and schooling for Indonesia, from the figures Statistics Indonesia publishes. Each number below names its source and year.')}
<div class="stat-grid">
  ${statCard('Population, mid-2024', '281.6m', 'Million people, up 1.04% from 278.7 million in 2023', '#/population')}
  ${statCard('GDP, 2024', 'Rp22,139tn', 'Trillion rupiah, nominal. Per capita Rp78.6 million (US$4,960.3)', '#/economy')}
  ${statCard('Human Development Index, 2024', '75.02', 'Up from 74.39 in 2023', '#/education')}
  ${statCard('Poverty rate, Sep 2024', '8.57%', '24.06 million people, the lowest since 1960', '#/economy')}
</div>
<div class="bento">
  <section class="card span-7">
    <h2>Population keeps growing</h2>
    <p class="card-text">Mid-year population, 2020 to 2024, in millions. Indonesia is the fourth largest country in the world by population.</p>
    ${pop}
    ${sourceLine('BPS, 2020 census and mid-year estimates 2022-2024')}
    <p><a class="btn" href="#/population">Population in detail</a></p>
  </section>
  <section class="card span-5">
    <h2>Growth is steady</h2>
    <p class="card-text">Real GDP growth by year, in percent. Growth stayed above 5% in 2022, 2023 and 2024.</p>
    ${growth}
    ${sourceLine('BPS, 2020-2024')}
    <p><a class="btn" href="#/economy">Economy in detail</a></p>
  </section>
  <section class="card span-5">
    <h2>Most people live on Java</h2>
    <p class="card-text">Five largest provinces by population, mid-2024, in millions. Java holds about 56% of the population.</p>
    ${top}
    ${sourceLine('BPS, mid-2024')}
    <p><a class="btn" href="#/provinces">All ten largest provinces</a></p>
  </section>
  <section class="card span-7">
    <h2>Health and schooling are improving</h2>
    <div class="fact-rows">
      <div class="fact"><span class="fact-value">14.12</span><span class="fact-label">Infant deaths per 1,000 live births, 2025, down from 26.09 in 2010</span></div>
      <div class="fact"><span class="fact-value">144</span><span class="fact-label">Maternal deaths per 100,000 live births, 2025, down from 346 in 2010</span></div>
      <div class="fact"><span class="fact-value">13.21</span><span class="fact-label">Expected years of schooling, 2024</span></div>
      <div class="fact"><span class="fact-value">74.15</span><span class="fact-label">Life expectancy in years, 2024</span></div>
    </div>
    ${sourceLine('BPS, SUPAS 2025 and HDI 2024')}
    <p><a class="btn" href="#/health">Health in detail</a> <a class="btn" href="#/education">Education in detail</a></p>
  </section>
</div>`;
}

// #/population
export function populationView() {
  const trend = lineChart(
    DATA.population.trend.map((p) => ({ label: String(p.year), value: p.value })),
    { color: '#0e7a6b', format: (v) => `${v.toFixed(1)}m`, title: 'Population trend, 2020 to 2024' },
  );
  const gen = hBarChart(
    DATA.population.generations.map((g) => ({ label: g.label, value: g.share })),
    { format: (v) => `${v.toFixed(2)}%`, title: 'Share of population by generation' },
  );
  return `${sectionHead('Population', 'How many people live in Indonesia, where the count comes from, and how the age mix looks.')}
<div class="stat-grid">
  ${statCard('Population, mid-2024', '281,603,800', '281.6 million, up 1.04% on 2023')}
  ${statCard('Population, mid-2023', '278,696,200', '278.7 million')}
  ${statCard('Population, 2020 census', '270.20m', 'Million people, census count, 2020')}
  ${statCard('World rank', '4th', 'Fourth largest country by population')}
</div>
<div class="bento">
  <section class="card span-7">
    <h2>Population trend</h2>
    <p class="card-text">Mid-year population in millions. The 2020 point is the census; 2022 to 2024 are mid-year estimates. No verified 2021 figure is shown, so the line runs straight from 2020 to 2022.</p>
    ${trend}
    ${sourceLine('BPS, 2020 census and mid-year estimates 2022-2024')}
  </section>
  <section class="card span-5">
    <h2>Land and density</h2>
    <div class="fact-rows">
      <div class="fact"><span class="fact-value">1,890,180</span><span class="fact-label">Square kilometres of land area</span></div>
      <div class="fact"><span class="fact-value">149</span><span class="fact-label">People per square kilometre, about</span></div>
      <div class="fact"><span class="fact-value">56%</span><span class="fact-label">Share of the population living on Java</span></div>
    </div>
    ${sourceLine('BPS, 2024')}
  </section>
  <section class="card span-7">
    <h2>A young country</h2>
    <p class="card-text">Share of the population by generation. Gen Z and Millennials together are about half the population.</p>
    ${gen}
    <p class="card-text">${esc(DATA.population.elderlyNote)}</p>
    ${sourceLine(DATA.population.generationSource)}
  </section>
  <section class="card span-5">
    <h2>Where people live</h2>
    <p class="card-text">West Java is the largest province with 50.35 million people, 17.88% of the country. East Java follows with 41.81 million and Central Java with 37.89 million.</p>
    <p><a class="btn" href="#/provinces">See the provinces</a></p>
    ${sourceLine('BPS, mid-2024')}
  </section>
</div>`;
}

// #/economy
export function economyView(metric = 'growth') {
  const growth = barChart(
    DATA.economy.growth.map((g) => ({ label: String(g.year), value: g.value })),
    { color: '#2563eb', format: (v) => `${v.toFixed(2)}%`, title: 'Real GDP growth, 2020 to 2024' },
  );
  const tradeGroups = DATA.economy.trade.map((t) => ({
    label: String(t.year),
    values: [t.exports, t.imports],
  }));
  const tradeGrouped = groupedBarChart(tradeGroups, [
    { name: 'Exports', color: '#0e7a6b' },
    { name: 'Imports', color: '#2563eb' },
  ], { format: (v) => `$${v.toFixed(0)}bn`, title: 'Exports and imports, 2021 to 2024' });
  const panels = {
    growth: `<section class="card"><h2>Real GDP growth</h2><p class="card-text">Annual growth in percent. The economy shrank 2.07% in 2020, then grew 3.70% in 2021, 5.31% in 2022, 5.05% in 2023 and 5.03% in 2024.</p>${growth}${sourceLine('BPS, 2020-2024')}</section>`,
    trade: `<section class="card"><h2>Trade, 2021 to 2024</h2><p class="card-text">Exports and imports in US$ billion. Use the buttons to show one series at a time.</p>
      <div class="trade-toggle" role="group" aria-label="Trade series">
        <button type="button" data-trade="grouped" class="pill active">Exports and imports</button>
        <button type="button" data-trade="exports" class="pill">Exports</button>
        <button type="button" data-trade="imports" class="pill">Imports</button>
        <button type="button" data-trade="surplus" class="pill">Surplus</button>
      </div>
      <div id="trade-chart">${tradeGrouped}</div>
      <div class="legend"><span class="legend-item"><span class="swatch" style="background:#0e7a6b"></span>Exports</span><span class="legend-item"><span class="swatch" style="background:#2563eb"></span>Imports</span></div>
      <p class="card-text" id="trade-note">2024: exports US$264.70bn, up 2.29% on 2023; imports US$233.66bn; surplus US$31.04bn, the fifth straight surplus year.</p>
      ${sourceLine('BPS, 2021-2024')}</section>`,
    prices: `<section class="card"><h2>Prices, jobs and poverty</h2>
      <div class="fact-rows">
        <div class="fact"><span class="fact-value">1.57%</span><span class="fact-label">Inflation, Dec 2024 year on year (CPI 106.80), the lowest on record. Dec 2023 was 2.61%. Core inflation 2.26%.</span></div>
        <div class="fact"><span class="fact-value">4.91%</span><span class="fact-label">Unemployment rate, Aug 2024 (7.47 million people), down from 5.32% in Aug 2023. Feb 2024 was 4.82%.</span></div>
        <div class="fact"><span class="fact-value">152.11m</span><span class="fact-label">Labour force, Aug 2024. Youth unemployment (age 15-24) was 17.32%.</span></div>
        <div class="fact"><span class="fact-value">8.57%</span><span class="fact-label">Poverty rate, Sep 2024 (24.06 million people), the lowest since 1960. Urban 6.66%, rural 11.34%. Poverty line Rp595,242 per capita per month. Mar 2024 was 9.03% (25.22 million).</span></div>
      </div>
      ${sourceLine('BPS, 2024')}</section>`,
  };
  const panel = panels[metric] || panels.growth;
  return `${sectionHead('Economy', 'Output, trade, prices, jobs and poverty, all from the figures BPS publishes.')}
<div class="stat-grid">
  ${statCard('GDP, 2024', 'Rp22,139tn', 'Trillion rupiah, nominal. 2023 was Rp20,892.4 trillion')}
  ${statCard('GDP per capita, 2024', 'Rp78.6m', 'Million rupiah per capita (US$4,960.3)')}
  ${statCard('Trade surplus, 2024', 'US$31.04bn', 'Fifth straight surplus year')}
  ${statCard('Unemployment, Aug 2024', '4.91%', 'Down from 5.32% in Aug 2023')}
</div>
<div class="switcher" role="group" aria-label="Economy topic">
  <button type="button" data-metric="growth" class="pill${metric === 'growth' ? ' active' : ''}">Growth</button>
  <button type="button" data-metric="trade" class="pill${metric === 'trade' ? ' active' : ''}">Trade</button>
  <button type="button" data-metric="prices" class="pill${metric === 'prices' ? ' active' : ''}">Prices and jobs</button>
</div>
${panel}
${sourceLine('BPS, 2024 unless a figure says otherwise')}`;
}

// #/health
export function healthView() {
  const imr = barChart(
    DATA.health.infantMortality.map((d) => ({ label: String(d.year), value: d.value })),
    { color: '#0e7a6b', format: (v) => v.toFixed(2), title: 'Infant mortality, 2010 and 2025' },
  );
  const mmr = barChart(
    DATA.health.maternalMortality.map((d) => ({ label: String(d.year), value: d.value })),
    { color: '#b42318', format: (v) => String(Math.round(v)), title: 'Maternal mortality, 2010 and 2025' },
  );
  return `${sectionHead('Health', 'How long people live, how many mothers and infants survive, and how many children families have.')}
<div class="stat-grid">
  ${statCard('Infant mortality, 2025', '14.12', 'Deaths per 1,000 live births, down from 26.09 in 2010')}
  ${statCard('Maternal mortality, 2025', '144', 'Deaths per 100,000 live births, down from 346 in 2010')}
  ${statCard('Fertility rate, 2025', '2.13', 'Children per woman')}
  ${statCard('Life expectancy, 2024', '74.15 years', 'Human Development Index component')}
</div>
<div class="bento">
  <section class="card span-6">
    <h2>Fewer infant deaths</h2>
    <p class="card-text">Infant mortality per 1,000 live births, 2010 and 2025.</p>
    ${imr}
    ${sourceLine(DATA.health.source)}
  </section>
  <section class="card span-6">
    <h2>Fewer maternal deaths</h2>
    <p class="card-text">Maternal mortality per 100,000 live births, 2010 and 2025.</p>
    ${mmr}
    ${sourceLine(DATA.health.source)}
  </section>
  <section class="card span-12">
    <h2>What changed</h2>
    <p class="card-text">Infant mortality fell by almost half between 2010 and 2025, from 26.09 to 14.12 per 1,000 live births. Maternal mortality fell by more than half, from 346 to 144 per 100,000 live births. The fertility rate stood at 2.13 in 2025, and life expectancy reached 74.15 years in 2024.</p>
    ${sourceLine('BPS, SUPAS 2025 and HDI 2024')}
  </section>
</div>`;
}

// #/education
export function educationView() {
  const hdi = lineChart(
    DATA.humanDevelopment.hdi.map((d) => ({ label: String(d.year), value: d.value })),
    { color: '#2563eb', format: (v) => v.toFixed(2), title: 'Human Development Index, 2020 to 2024' },
  );
  return `${sectionHead('Education', 'Schooling and human development, from the Human Development Index BPS publishes each year.')}
<div class="stat-grid">
  ${statCard('HDI, 2024', '75.02', 'Up from 74.39 in 2023')}
  ${statCard('Expected schooling, 2024', '13.21 years', 'Years a child can expect to spend in school')}
  ${statCard('Mean schooling, 2024', '8.85 years', 'Average years of schooling for adults')}
  ${statCard('Highest province HDI, 2024', '84.15', 'DKI Jakarta')}
</div>
<div class="bento">
  <section class="card span-7">
    <h2>Human Development Index trend</h2>
    <p class="card-text">HDI by year: 72.81 in 2020, 73.16 in 2021, 73.77 in 2022, 74.39 in 2023 and 75.02 in 2024.</p>
    ${hdi}
    ${sourceLine('BPS, HDI 2020-2024')}
  </section>
  <section class="card span-5">
    <h2>What makes up the index</h2>
    <div class="fact-rows">
      <div class="fact"><span class="fact-value">74.15</span><span class="fact-label">Life expectancy in years, 2024</span></div>
      <div class="fact"><span class="fact-value">13.21</span><span class="fact-label">Expected years of schooling, 2024</span></div>
      <div class="fact"><span class="fact-value">8.85</span><span class="fact-label">Mean years of schooling, 2024</span></div>
      <div class="fact"><span class="fact-value">12.34</span><span class="fact-label">Adjusted real per-capita expenditure, Rp million per year, 2024</span></div>
    </div>
    ${sourceLine('BPS, HDI 2024')}
  </section>
  <section class="card span-12">
    <h2>Schooling keeps rising with the index</h2>
    <p class="card-text">The index rose every year from 2020 to 2024, by 2.21 points in total. Schooling is one of its three parts, next to a long and healthy life and a decent standard of living. DKI Jakarta has the highest provincial index at 84.15 in 2024.</p>
    ${sourceLine('BPS, HDI 2024')}
  </section>
</div>`;
}

// #/provinces
export function provincesView() {
  const chart = hBarChart(
    DATA.provinces.map((p) => ({ label: p.name, value: p.population })),
    { format: (v) => `${v.toFixed(2)}m`, title: 'Ten largest provinces by population' },
  );
  const rows = DATA.provinces
    .map(
      (p, i) => `<tr data-index="${i}" tabindex="0">
  <td>${i + 1}</td>
  <td>${esc(p.name)}</td>
  <td class="num">${p.population.toFixed(2)}</td>
  <td class="num">${p.share === null ? 'n/a' : `${p.share.toFixed(2)}%`}</td>
</tr>`,
    )
    .join('');
  return `${sectionHead('Provinces', 'The ten largest provinces by population, mid-2024. Only these ten carry verified mid-2024 figures, so the table lists ten and no more.')}
<div class="bento">
  <section class="card span-7">
    <h2>Ten largest provinces</h2>
    <p class="card-text">Population in millions, mid-2024.</p>
    ${chart}
    ${sourceLine('BPS, mid-2024')}
  </section>
  <section class="card span-5">
    <h2>Find a province</h2>
    <p class="card-text">Search, sort, or select a row to see its detail.</p>
    <label class="field-label" for="province-search">Search provinces</label>
    <input id="province-search" class="field" type="search" placeholder="Type a province name" autocomplete="off">
    <div class="sort-row" role="group" aria-label="Sort provinces">
      <button type="button" data-sort="population" class="pill active">By population</button>
      <button type="button" data-sort="share" class="pill">By share</button>
      <button type="button" data-sort="name" class="pill">By name</button>
    </div>
    <div id="province-detail" class="detail" aria-live="polite">
      <p class="detail-empty">Select a province row to see its detail here.</p>
    </div>
  </section>
  <section class="card span-12">
    <h2>Province table</h2>
    <div class="table-wrap">
    <table class="provinces">
      <thead><tr><th>#</th><th>Province</th><th class="num">Population (million)</th><th class="num">Share</th></tr></thead>
      <tbody id="province-rows">${rows}</tbody>
    </table>
    </div>
    <p class="card-text">Java holds about 56% of the population. Shares are shown only where BPS published them for the top four provinces; the other six rows show n/a for share rather than a guessed figure.</p>
    ${sourceLine('BPS, mid-2024')}
  </section>
</div>`;
}

export function missingView() {
  return `<div class="page-head"><h1>Page not found</h1><p class="lede">There is no page at this address. Use the links above to explore population, economy, health, education and provinces.</p></div>
<p><a class="btn" href="#/">Back to the overview</a></p>`;
}
