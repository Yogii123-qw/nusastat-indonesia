// Router and controls. Hash routes only, no network, no offline cache.
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { DATA } from './data.js';
import { barChart, groupedBarChart } from './charts.js';
import {
  economyView,
  educationView,
  healthView,
  missingView,
  overviewView,
  populationView,
  provincesView,
} from './views.js';

const app = document.getElementById('app');
const themeButton = document.getElementById('theme-toggle');

function currentTheme() {
  try {
    return localStorage.getItem('nusastat-theme');
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  const chosen =
    theme || currentTheme() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', chosen);
  if (themeButton) themeButton.textContent = chosen === 'dark' ? 'Light mode' : 'Dark mode';
}

if (themeButton) {
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('nusastat-theme', next);
    } catch {
      // Storage is a nicety, not a need. The toggle still works for this visit.
    }
    applyTheme(next);
  });
}

applyTheme();

// Trade chart notes, keyed by the toggle the visitor picks.
const TRADE_NOTES = {
  grouped: '2024: exports US$264.70bn, up 2.29% on 2023; imports US$233.66bn; surplus US$31.04bn, the fifth straight surplus year.',
  exports: 'Exports in US$ billion: 231.61 in 2021, 291.90 in 2022, 258.82 in 2023 and 264.70 in 2024, up 2.29% on 2023.',
  imports: 'Imports in US$ billion: 196.27 in 2021, 237.44 in 2022, 221.93 in 2023 and 233.66 in 2024.',
  surplus: 'Trade surplus in US$ billion: 35.34 in 2021, 54.46 in 2022, 36.89 in 2023 and 31.04 in 2024.',
};

function tradeChart(mode) {
  const years = DATA.economy.trade.map((t) => String(t.year));
  if (mode === 'grouped') {
    return groupedBarChart(
      DATA.economy.trade.map((t) => ({ label: String(t.year), values: [t.exports, t.imports] })),
      [
        { name: 'Exports', color: '#0e7a6b' },
        { name: 'Imports', color: '#2563eb' },
      ],
      { format: (v) => `$${v.toFixed(0)}bn`, title: 'Exports and imports, 2021 to 2024' },
    );
  }
  const key = mode === 'exports' ? 'exports' : mode === 'imports' ? 'imports' : 'surplus';
  const color = key === 'exports' ? '#0e7a6b' : key === 'imports' ? '#2563eb' : '#b45309';
  return barChart(
    DATA.economy.trade.map((t, i) => ({ label: years[i], value: t[key] })),
    { color, format: (v) => `$${v.toFixed(2)}bn`, title: `Trade ${key}, 2021 to 2024` },
  );
}

function wireEconomy() {
  document.querySelectorAll('[data-metric]').forEach((button) => {
    button.addEventListener('click', () => {
      location.hash = `#/economy/${button.getAttribute('data-metric')}`;
    });
  });
  document.querySelectorAll('[data-trade]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-trade]').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const mode = button.getAttribute('data-trade');
      const holder = document.getElementById('trade-chart');
      const note = document.getElementById('trade-note');
      if (holder) holder.innerHTML = tradeChart(mode);
      if (note) note.textContent = TRADE_NOTES[mode] || TRADE_NOTES.grouped;
    });
  });
}

function wireProvinces() {
  const search = document.getElementById('province-search');
  const rows = document.getElementById('province-rows');
  const detail = document.getElementById('province-detail');
  if (!rows || !detail) return;

  function showDetail(index) {
    const p = DATA.provinces[index];
    if (!p) return;
    const share = p.share === null ? 'Share not published for this province.' : `Share of Indonesia: ${p.share.toFixed(2)}%.`;
    detail.innerHTML = `<h3>${p.name}</h3>
<p class="detail-num">${p.population.toFixed(2)} million people</p>
<p>${share}</p>
<p>${p.note}</p>
<p class="source">Source: BPS, mid-2024</p>`;
    rows.querySelectorAll('tr').forEach((tr) => tr.classList.remove('selected'));
    const row = rows.querySelector(`tr[data-index="${index}"]`);
    if (row) row.classList.add('selected');
  }

  function rowHtml(list) {
    return list
      .map(
        (p) => {
          const i = DATA.provinces.indexOf(p);
          return `<tr data-index="${i}" tabindex="0">
  <td>${i + 1}</td>
  <td>${p.name}</td>
  <td class="num">${p.population.toFixed(2)}</td>
  <td class="num">${p.share === null ? 'n/a' : `${p.share.toFixed(2)}%`}</td>
</tr>`;
        },
      )
      .join('');
  }

  function applyFilter() {
    const query = (search ? search.value : '').trim().toLowerCase();
    const active = document.querySelector('[data-sort].active');
    const sort = active ? active.getAttribute('data-sort') : 'population';
    let list = DATA.provinces.filter((p) => p.name.toLowerCase().includes(query));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'share') list = [...list].sort((a, b) => (b.share ?? -1) - (a.share ?? -1));
    else list = [...list].sort((a, b) => b.population - a.population);
    rows.innerHTML = list.length
      ? rowHtml(list)
      : '<tr><td colspan="4">No province matches that search.</td></tr>';
  }

  rows.addEventListener('click', (event) => {
    const tr = event.target.closest('tr[data-index]');
    if (tr) showDetail(Number(tr.getAttribute('data-index')));
  });
  rows.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const tr = event.target.closest('tr[data-index]');
    if (tr) {
      event.preventDefault();
      showDetail(Number(tr.getAttribute('data-index')));
    }
  });
  if (search) search.addEventListener('input', applyFilter);
  document.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-sort]').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      applyFilter();
    });
  });
}

const ROUTES = {
  '': overviewView,
  '/': overviewView,
  '/overview': overviewView,
  '/population': populationView,
  '/economy': () => economyView('growth'),
  '/economy/growth': () => economyView('growth'),
  '/economy/trade': () => economyView('trade'),
  '/economy/prices': () => economyView('prices'),
  '/health': healthView,
  '/education': educationView,
  '/provinces': provincesView,
};

function render() {
  window.__shotReady = false;
  const path = location.hash.replace(/^#/, '') || '/';
  const view = ROUTES[path] || null;
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const base = href.replace(/^#/, '').split('/').slice(0, 2).join('/');
    a.classList.toggle('active', path === href.replace(/^#/, '') || (base !== '' && path.startsWith(base) && base !== '/'));
  });
  if (view) {
    app.innerHTML = view();
    document.title = `NusaStat: Indonesia in Numbers | ${document.querySelector('h1') ? document.querySelector('h1').textContent : 'Overview'}`;
    if (path.startsWith('/economy')) wireEconomy();
    if (path === '/provinces') wireProvinces();
  } else {
    app.innerHTML = missingView();
    document.title = 'Page not found | NusaStat: Indonesia in Numbers';
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
