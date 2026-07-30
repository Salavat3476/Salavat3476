// Генератор полноэкранных сцен «Зверограда» — ночной город зверей (SVG -> PNG).
const sharp = require("sharp");
const path = require("path");

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function catGroup(x, y, scale, fill) {
  return `<g transform="translate(${x},${y}) scale(${scale})" fill="${fill}">
    <path d="M -8 -6 C -36 -10, -44 -36, -24 -48" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="-20" rx="20" ry="22"/>
    <circle cx="7" cy="-48" r="13"/>
    <path d="M -3 -56 L -8 -72 L 6 -62 Z"/>
    <path d="M 12 -59 L 20 -73 L 22 -56 Z"/>
  </g>`;
}

function foxEars(x, y, w, fill) {
  // «звериная» башня: два треугольных уха на крыше
  return `<path d="M ${x} ${y} L ${x + w * 0.18} ${y - 46} L ${x + w * 0.36} ${y} Z" fill="${fill}"/>
          <path d="M ${x + w * 0.64} ${y} L ${x + w * 0.82} ${y - 46} L ${x + w} ${y} Z" fill="${fill}"/>`;
}

function birds(cx, cy, color) {
  let out = "";
  const pos = [[0, 0], [55, -18], [110, 6], [160, -26], [205, -4]];
  for (const [dx, dy] of pos) {
    out += `<path d="M ${cx + dx} ${cy + dy} l 11 -7 l 11 7" stroke="${color}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  }
  return out;
}

function sceneSVG(opts) {
  const {
    skyTop, skyMid, skyBottom, moonColor, backFill, frontFill,
    windowColor, seed, moonX = 1450, moonY = 230, cat = true, showBirds = true,
  } = opts;
  const r = rng(seed);
  const W = 1920, H = 1080;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${skyTop}"/>
      <stop offset="0.55" stop-color="${skyMid}"/>
      <stop offset="1" stop-color="${skyBottom}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.62"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>`;

  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * 620, rad = 0.8 + r() * 1.9, op = 0.25 + r() * 0.6;
    svg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" fill="#FFFFFF" opacity="${op.toFixed(2)}"/>`;
  }

  svg += `<circle cx="${moonX}" cy="${moonY}" r="150" fill="${moonColor}" opacity="0.14"/>
          <circle cx="${moonX}" cy="${moonY}" r="88" fill="${moonColor}"/>
          <circle cx="${moonX - 30}" cy="${moonY - 18}" r="14" fill="#000000" opacity="0.06"/>
          <circle cx="${moonX + 24}" cy="${moonY + 26}" r="9" fill="#000000" opacity="0.05"/>`;

  if (showBirds) svg += birds(300 + r() * 500, 240 + r() * 120, frontFill);

  // дальний силуэт города
  let x = -20;
  const horizon = 850;
  while (x < W + 40) {
    const w = 70 + r() * 130;
    const h = 140 + r() * 300;
    svg += `<rect x="${x.toFixed(0)}" y="${(horizon - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${backFill}" opacity="0.8"/>`;
    if (r() > 0.72) svg += `<rect x="${(x + w / 2 - 2).toFixed(0)}" y="${(horizon - h - 44).toFixed(0)}" width="4" height="44" fill="${backFill}" opacity="0.8"/>`;
    x += w + 8 + r() * 30;
  }

  // ближний силуэт с окнами, ушастыми башнями и котом
  x = -30;
  const front = [];
  while (x < W + 60) {
    const w = 120 + r() * 190;
    const h = 240 + r() * 330;
    front.push({ x, w, h });
    x += w + 10 + r() * 40;
  }
  const earIdx = Math.floor(r() * front.length);
  const domeIdx = (earIdx + 2) % front.length;
  let tallest = front[0];
  for (const b of front) if (b.h > tallest.h) tallest = b;

  for (let i = 0; i < front.length; i++) {
    const b = front[i];
    const top = H - b.h;
    svg += `<rect x="${b.x.toFixed(0)}" y="${top.toFixed(0)}" width="${b.w.toFixed(0)}" height="${b.h.toFixed(0)}" fill="${frontFill}"/>`;
    if (i === earIdx) svg += foxEars(b.x + b.w * 0.15, top, b.w * 0.7, frontFill);
    if (i === domeIdx) svg += `<circle cx="${(b.x + b.w / 2).toFixed(0)}" cy="${top.toFixed(0)}" r="${(b.w * 0.28).toFixed(0)}" fill="${frontFill}"/>`;
    // окна
    const cols = Math.max(2, Math.floor(b.w / 46));
    const rows = Math.max(3, Math.floor(b.h / 64));
    for (let cxi = 0; cxi < cols; cxi++) {
      for (let cyi = 0; cyi < rows; cyi++) {
        if (r() < 0.24) {
          const wx = b.x + 20 + cxi * ((b.w - 40) / Math.max(1, cols - 1)) - 5;
          const wy = top + 34 + cyi * ((b.h - 70) / Math.max(1, rows - 1)) - 8;
          svg += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="11" height="16" rx="2" fill="${windowColor}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
        }
      }
    }
  }
  if (cat) {
    const roof = front.find((b) => b !== tallest && b.x > 180 && b.x < 900) || front[1];
    svg += catGroup(roof.x + roof.w * 0.55, H - roof.h, 1.5, frontFill);
  }

  svg += `<rect x="0" y="${H - 470}" width="${W}" height="470" fill="url(#fade)"/></svg>`;
  return svg;
}

// тонкая полоса-силуэт для нижнего края тёмных слайдов
function stripSVG({ fill, seed }) {
  const r = rng(seed);
  const W = 1920, H = 220;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  let x = -20;
  const shapes = [];
  while (x < W + 40) {
    const w = 60 + r() * 120;
    const h = 40 + r() * 150;
    shapes.push({ x, w, h });
    svg += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${fill}"/>`;
    x += w + 6 + r() * 24;
  }
  const b = shapes[Math.floor(shapes.length * 0.35)];
  svg += foxEars(b.x + b.w * 0.15, H - b.h, b.w * 0.7, fill);
  const c = shapes[Math.floor(shapes.length * 0.7)];
  svg += catGroup(c.x + c.w * 0.5, H - c.h, 1.05, fill);
  svg += `</svg>`;
  return svg;
}

async function buildScenes(outDir) {
  const scenes = {
    sunset: sceneSVG({ skyTop: "#160B33", skyMid: "#4A1E63", skyBottom: "#C2452E", moonColor: "#FFD98A", backFill: "#2A1445", frontFill: "#12081F", windowColor: "#FFC94D", seed: 11 }),
    teal: sceneSVG({ skyTop: "#071B2E", skyMid: "#0C3B52", skyBottom: "#12766F", moonColor: "#D9FFF4", backFill: "#0A2A40", frontFill: "#04121C", windowColor: "#7DF5DC", seed: 23, moonX: 420, moonY: 200 }),
    plum: sceneSVG({ skyTop: "#1D0A2E", skyMid: "#4E1A56", skyBottom: "#A33B6B", moonColor: "#FFE3F1", backFill: "#33104A", frontFill: "#150620", windowColor: "#FF9DCB", seed: 37, moonX: 1550, moonY: 300 }),
    indigo: sceneSVG({ skyTop: "#0A1030", skyMid: "#1D2C6B", skyBottom: "#3E5FA8", moonColor: "#F3F6FF", backFill: "#16204C", frontFill: "#070B1E", windowColor: "#9DBBFF", seed: 51, moonX: 520, moonY: 260 }),
    amber: sceneSVG({ skyTop: "#221208", skyMid: "#6B3010", skyBottom: "#D98324", moonColor: "#FFF1C9", backFill: "#402008", frontFill: "#190C03", windowColor: "#FFD98A", seed: 67, moonX: 1380, moonY: 320, showBirds: true }),
  };
  const out = {};
  for (const [name, svg] of Object.entries(scenes)) {
    const p = path.join(outDir, `scene-${name}.png`);
    await sharp(Buffer.from(svg)).png().toFile(p);
    out[name] = p;
  }
  const stripPath = path.join(outDir, "strip.png");
  await sharp(Buffer.from(stripSVG({ fill: "#0E0724", seed: 5 }))).png().toFile(stripPath);
  out.strip = stripPath;
  return out;
}

module.exports = { buildScenes };
