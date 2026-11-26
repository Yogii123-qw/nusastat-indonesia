// Hand-rolled SVG charts. No library, no canvas, no network. Each function takes
// plain data and returns an SVG string sized by viewBox, so it scales to any
// screen. All charts label their values, so the numbers stay readable when the
// image is small.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const COLORS = {
  teal: '#0e7a6b',
  blue: '#2563eb',
  amber: '#b45309',
  red: '#b42318',
  slate: '#64748b',
  grid: 'currentColor',
};

function frame(width, height, inner, title) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(title || 'Chart')}" preserveAspectRatio="xMidYMid meet"><title>${esc(title || 'Chart')}</title>${inner}</svg>`;
}

function axisLabels(width, height, labels, padL, padB) {
  const n = labels.length;
  const step = (width - padL - 12) / Math.max(n - 1, 1);
  return labels
    .map((label, i) => {
      const x = padL + i * step;
      return `<text x="${x.toFixed(1)}" y="${height - 8}" text-anchor="middle" class="axis">${esc(label)}</text>`;
    })
    .join('');
}

function gridLines(width, height, padL, padT, padB, ticks) {
  return ticks
    .map((t) => {
      const y = padT + (1 - t.frac) * (height - padT - padB);
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - 12}" y2="${y.toFixed(1)}" class="grid"/><text x="${padL - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis">${esc(t.label)}</text>`;
    })
    .join('');
}

// Round axis ticks to plain numbers (0, 2, 4 or 270, 275, 280), so the axis
// never shows odd values such as 5.90% or 268.5m.
function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step0 = span / (count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 1e9) / 1e9);
  }
  return ticks;
}

function tickRows(min, max, format) {
  return niceTicks(min, max).map((v) => ({
    frac: (v - min) / (max - min || 1),
    label: format ? format(v) : Number.isInteger(v) ? String(v) : v.toFixed(1),
  }));
}

// Line chart. points: [{label, value}]. The x axis uses the labels as given.
export function lineChart(points, options = {}) {
  const width = 640;
  const height = options.height || 260;
  const padL = 52;
  const padT = 28;
  const padB = 30;
  const color = options.color || COLORS.teal;
  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  const span = max - min || 1;
  min -= span * 0.15;
  max += span * 0.15;
  const x = (i) => padL + (i * (width - padL - 12)) / Math.max(points.length - 1, 1);
  const y = (v) => padT + ((max - v) / (max - min)) * (height - padT - padB);
  const ticks = tickRows(min, max, options.format);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1).toFixed(1)},${y(min).toFixed(1)} L${x(0).toFixed(1)},${y(min).toFixed(1)} Z`;
  const dots = points
    .map((p, i) => {
      const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
      return `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5" fill="${color}"/><text x="${x(i).toFixed(1)}" y="${(y(p.value) - 10).toFixed(1)}" text-anchor="${anchor}" class="value">${esc(options.format ? options.format(p.value) : String(p.value))}</text>`;
    })
    .join('');
  return frame(
    width,
    height,
    `<path d="${area}" fill="${color}" opacity="0.10"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${gridLines(width, height, padL, padT, padB, ticks)}${dots}${axisLabels(width, height, points.map((p) => p.label), padL, padB)}`,
    options.title,
  );
}

// Vertical bar chart. Handles negative values with a zero line.
export function barChart(points, options = {}) {
  const width = 640;
  const height = options.height || 260;
  const padL = 52;
  const padT = 28;
  const padB = 30;
  const color = options.color || COLORS.blue;
  const negColor = options.negativeColor || COLORS.red;
  const values = points.map((p) => p.value);
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  const span = max - min || 1;
  min -= span * 0.08;
  max += span * 0.08;
  const plotH = height - padT - padB;
  const y = (v) => padT + ((max - v) / (max - min)) * plotH;
  const slot = (width - padL - 12) / points.length;
  const barW = Math.min(56, slot * 0.62);
  const ticks = tickRows(min, max, options.format);
  const bars = points
    .map((p, i) => {
      const bx = padL + i * slot + (slot - barW) / 2;
      const top = y(Math.max(p.value, 0));
      const bottom = y(Math.min(p.value, 0));
      const labelY = p.value >= 0 ? top - 8 : bottom + 16;
      return `<rect x="${bx.toFixed(1)}" y="${top.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(bottom - top, 1).toFixed(1)}" rx="5" fill="${p.value < 0 ? negColor : color}"/><text x="${(bx + barW / 2).toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="value">${esc(options.format ? options.format(p.value) : String(p.value))}</text>`;
    })
    .join('');
  const zero = `<line x1="${padL}" y1="${y(0).toFixed(1)}" x2="${width - 12}" y2="${y(0).toFixed(1)}" class="zero"/>`;
  return frame(
    width,
    height,
    `${gridLines(width, height, padL, padT, padB, ticks)}${zero}${bars}${axisLabels(width, height, points.map((p) => p.label), padL, padB)}`,
    options.title,
  );
}

// Grouped vertical bars. groups: [{label, values: [..]}], series: [{name, color}].
export function groupedBarChart(groups, series, options = {}) {
  const width = 640;
  const height = options.height || 280;
  const padL = 52;
  const padT = 28;
  const padB = 30;
  const all = groups.flatMap((g) => g.values);
  let min = 0;
  let max = Math.max(...all);
  const span = max - min || 1;
  max += span * 0.1;
  const plotH = height - padT - padB;
  const y = (v) => padT + ((max - v) / (max - min)) * plotH;
  const slot = (width - padL - 12) / groups.length;
  const barW = Math.min(26, (slot * 0.7) / series.length);
  const ticks = tickRows(min, max, options.format);
  const bars = groups
    .map((g, gi) => {
      const groupX = padL + gi * slot + (slot - barW * series.length) / 2;
      return g.values
        .map((v, si) => {
          const bx = groupX + si * barW;
          return `<rect x="${bx.toFixed(1)}" y="${y(v).toFixed(1)}" width="${(barW - 3).toFixed(1)}" height="${Math.max(plotH + padT - y(v), 1).toFixed(1)}" rx="4" fill="${series[si].color}"><title>${esc(series[si].name)} ${esc(g.label)}: ${esc(options.format ? options.format(v) : String(v))}</title></rect>`;
        })
        .join('');
    })
    .join('');
  return frame(
    width,
    height,
    `${gridLines(width, height, padL, padT, padB, ticks)}${bars}${axisLabels(width, height, groups.map((g) => g.label), padL, padB)}`,
    options.title,
  );
}

// Horizontal bars, for ranked lists such as provinces.
export function hBarChart(rows, options = {}) {
  const rowH = options.rowHeight || 44;
  const width = 640;
  const height = rowH * rows.length + 16;
  const padL = 132;
  const max = Math.max(...rows.map((r) => r.value));
  const bars = rows
    .map((r, i) => {
      const y = 8 + i * rowH;
      const w = ((width - padL - 76) * r.value) / max;
      return `<text x="${padL - 10}" y="${(y + rowH / 2 + 5).toFixed(1)}" text-anchor="end" class="axis label">${esc(r.label)}</text><rect x="${padL}" y="${(y + 8).toFixed(1)}" width="${Math.max(w, 2).toFixed(1)}" height="${(rowH - 20).toFixed(1)}" rx="5" fill="${r.color || COLORS.teal}"/><text x="${(padL + w + 8).toFixed(1)}" y="${(y + rowH / 2 + 5).toFixed(1)}" class="value">${esc(options.format ? options.format(r.value) : String(r.value))}</text>`;
    })
    .join('');
  return frame(width, height, bars, options.title);
}

export { COLORS };
