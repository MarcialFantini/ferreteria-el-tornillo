// scripts/generate-product-images.mjs
// Genera placeholders SVG para los productos seed.
// Estética: placa de catálogo / blueprint de ferretería —
// papel cálido + línea ink + un toque de color industrial.
// Cada SVG es 800x800, ~2-3KB, accesible (incluye <title>).

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "products");

// Tokens (mismo idioma que global.css)
const PAPER = "#f5f2ea";
const PAPER_DEEP = "#ebe6d8";
const INK = "#171513";
const IRON = "#5d544a";
const LINE = "#d8d2c2";
const RIVET = "#b63828";
const AMBER = "#c28e3f";
const SAGE = "#4a6741";

// Iconos como paths o formas simples — cada uno se compone en <g>.
const icons = {
  taladro: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="80" y="40" width="320" height="120" rx="14" fill="${INK}"/>
      <rect x="100" y="60" width="160" height="80" rx="6" fill="${IRON}"/>
      <rect x="380" y="80" width="60" height="40" fill="${INK}"/>
      <rect x="440" y="92" width="220" height="16" fill="${INK}"/>
      <circle cx="660" cy="100" r="14" fill="${AMBER}"/>
      <rect x="170" y="200" width="80" height="160" rx="18" fill="${INK}"/>
      <rect x="180" y="220" width="60" height="20" fill="${IRON}"/>
      <rect x="180" y="260" width="60" height="20" fill="${IRON}"/>
      <rect x="120" y="360" width="180" height="40" rx="14" fill="${IRON}"/>
    </g>`,
  amoladora: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="100" y="40" width="380" height="160" rx="20" fill="${INK}"/>
      <rect x="130" y="60" width="100" height="120" fill="${IRON}"/>
      <circle cx="500" cy="120" r="80" fill="${INK}"/>
      <circle cx="500" cy="120" r="60" fill="${IRON}"/>
      <circle cx="500" cy="120" r="14" fill="${AMBER}"/>
      <rect x="200" y="220" width="80" height="200" rx="18" fill="${INK}"/>
      <rect x="320" y="280" width="220" height="40" rx="10" fill="${INK}"/>
    </g>`,
  llaveStilson: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="60" y="80" width="120" height="40" fill="${INK}"/>
      <rect x="180" y="60" width="120" height="80" fill="${INK}"/>
      <polygon points="60,80 60,120 80,160 140,160 140,120 140,80" fill="${INK}"/>
      <polygon points="180,60 300,60 320,80 320,140 300,160 240,160 240,140 200,140" fill="${INK}"/>
      <circle cx="100" cy="100" r="20" fill="${AMBER}"/>
    </g>`,
  llavesAllen: (x, y) => `
    <g transform="translate(${x},${y})">
      ${[0, 1, 2, 3, 4].map((i) => {
        const sizes = [80, 60, 45, 35, 25];
        const s = sizes[i];
        return `<polygon points="${100 + i * 110},${80} ${100 + s / 2 + i * 110},${80 - s / 2} ${100 + s + i * 110},${80} ${100 + s + i * 110},${140} ${100 + s / 2 + i * 110},${140 + s / 2} ${100 + i * 110},${140}" fill="${INK}"/>`;
      }).join("")}
      <rect x="60" y="240" width="640" height="40" rx="6" fill="${AMBER}"/>
    </g>`,
  martillo: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="120" y="60" width="320" height="160" rx="12" fill="${INK}"/>
      <rect x="380" y="80" width="80" height="120" fill="${IRON}"/>
      <rect x="220" y="220" width="100" height="220" rx="14" fill="${INK}"/>
      <rect x="220" y="220" width="100" height="40" fill="${AMBER}"/>
    </g>`,
  canioPVC: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="40" y="100" width="720" height="80" fill="${INK}"/>
      <rect x="40" y="100" width="40" height="80" fill="${IRON}"/>
      <rect x="720" y="100" width="40" height="80" fill="${IRON}"/>
      <rect x="100" y="200" width="600" height="20" fill="${AMBER}"/>
      <text x="400" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="40" fill="${INK}" font-weight="700">Ø 110mm</text>
    </g>`,
  canioPVC50: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="40" y="120" width="720" height="60" fill="${INK}"/>
      <rect x="40" y="120" width="40" height="60" fill="${IRON}"/>
      <rect x="720" y="120" width="40" height="60" fill="${IRON}"/>
      <rect x="100" y="200" width="600" height="20" fill="${AMBER}"/>
      <text x="400" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="40" fill="${INK}" font-weight="700">Ø 50mm</text>
    </g>`,
  sellaRoscas: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="220" y="80" width="120" height="40" fill="${INK}"/>
      <rect x="180" y="120" width="200" height="320" rx="12" fill="${AMBER}"/>
      <rect x="180" y="380" width="200" height="60" fill="${INK}"/>
      <text x="280" y="280" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="40" font-weight="800" fill="${INK}">125</text>
      <text x="280" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${INK}">cm³</text>
    </g>`,
  cable: (x, y) => `
    <g transform="translate(${x},${y})">
      <circle cx="180" cy="240" r="160" fill="none" stroke="${INK}" stroke-width="14"/>
      <circle cx="180" cy="240" r="160" fill="${IRON}"/>
      <circle cx="180" cy="240" r="80" fill="none" stroke="${INK}" stroke-width="6"/>
      <rect x="380" y="120" width="200" height="240" rx="8" fill="${INK}"/>
      <rect x="400" y="140" width="160" height="200" fill="${INK}"/>
      <text x="480" y="220" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="34" fill="${AMBER}" font-weight="700">2.5</text>
      <text x="480" y="260" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="${AMBER}">mm²</text>
    </g>`,
  cable4mm: (x, y) => `
    <g transform="translate(${x},${y})">
      <circle cx="180" cy="240" r="160" fill="none" stroke="${INK}" stroke-width="14"/>
      <circle cx="180" cy="240" r="160" fill="${IRON}"/>
      <circle cx="180" cy="240" r="80" fill="none" stroke="${INK}" stroke-width="6"/>
      <rect x="380" y="120" width="200" height="240" rx="8" fill="${INK}"/>
      <rect x="400" y="140" width="160" height="200" fill="${INK}"/>
      <text x="480" y="220" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="34" fill="${AMBER}" font-weight="700">4.0</text>
      <text x="480" y="260" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="${AMBER}">mm²</text>
    </g>`,
  llaveTermica: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="160" y="60" width="240" height="380" rx="16" fill="${INK}"/>
      <rect x="180" y="100" width="200" height="60" fill="${IRON}"/>
      <rect x="200" y="200" width="160" height="100" rx="6" fill="${AMBER}"/>
      <rect x="200" y="200" width="160" height="50" fill="${INK}"/>
      <rect x="180" y="340" width="200" height="80" fill="${IRON}"/>
      <text x="280" y="460" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="36" font-weight="700" fill="${INK}">25 A</text>
    </g>`,
  llaveTermica40: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="160" y="60" width="240" height="380" rx="16" fill="${INK}"/>
      <rect x="180" y="100" width="200" height="60" fill="${IRON}"/>
      <rect x="200" y="200" width="160" height="100" rx="6" fill="${AMBER}"/>
      <rect x="200" y="200" width="160" height="50" fill="${INK}"/>
      <rect x="180" y="340" width="200" height="80" fill="${IRON}"/>
      <text x="280" y="460" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="36" font-weight="700" fill="${INK}">40 A</text>
    </g>`,
  latex: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="160" y="80" width="240" height="60" fill="${IRON}"/>
      <polygon points="160,140 400,140 380,460 180,460" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <rect x="180" y="220" width="200" height="160" fill="${INK}"/>
      <rect x="200" y="240" width="160" height="14" fill="${AMBER}"/>
      <rect x="200" y="270" width="120" height="10" fill="${PAPER}"/>
      <rect x="200" y="290" width="140" height="10" fill="${PAPER}"/>
      <rect x="200" y="310" width="100" height="10" fill="${PAPER}"/>
      <rect x="200" y="340" width="160" height="20" fill="${AMBER}"/>
    </g>`,
  yeso: (x, y) => `
    <g transform="translate(${x},${y})">
      <polygon points="180,80 380,80 420,140 140,140" fill="${INK}"/>
      <rect x="140" y="140" width="280" height="320" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <rect x="180" y="200" width="200" height="80" fill="${INK}"/>
      <text x="280" y="255" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="36" font-weight="700" fill="${AMBER}">25 kg</text>
      <rect x="180" y="320" width="200" height="60" fill="none" stroke="${INK}" stroke-width="3"/>
      <text x="280" y="358" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="700" fill="${INK}">YESO</text>
    </g>`,
  tornillos: (x, y) => `
    <g transform="translate(${x},${y})">
      ${Array.from({ length: 12 }).map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = 200 + col * 130;
        const cy = 120 + row * 160;
        return `
          <ellipse cx="${cx}" cy="${cy + 10}" rx="46" ry="10" fill="${INK}" opacity="0.15"/>
          <rect x="${cx - 8}" y="${cy - 80}" width="16" height="80" rx="4" fill="${IRON}"/>
          <polygon points="${cx - 24},${cy} ${cx + 24},${cy} ${cx + 14},${cy + 30} ${cx - 14},${cy + 30}" fill="${INK}"/>
          <rect x="${cx - 2}" y="${cy - 80}" width="4" height="40" fill="${INK}"/>
        `;
      }).join("")}
    </g>`,
  flexibleGas: (x, y) => `
    <g transform="translate(${x},${y})">
      <circle cx="160" cy="160" r="60" fill="none" stroke="${INK}" stroke-width="20"/>
      <circle cx="160" cy="160" r="60" fill="none" stroke="${AMBER}" stroke-width="6" stroke-dasharray="6 8"/>
      <circle cx="640" cy="240" r="60" fill="none" stroke="${INK}" stroke-width="20"/>
      <circle cx="640" cy="240" r="60" fill="none" stroke="${AMBER}" stroke-width="6" stroke-dasharray="6 8"/>
      <path d="M 220 160 Q 400 60 580 240" fill="none" stroke="${INK}" stroke-width="20"/>
      <path d="M 220 160 Q 400 60 580 240" fill="none" stroke="${AMBER}" stroke-width="6" stroke-dasharray="6 8"/>
      <rect x="380" y="360" width="40" height="40" rx="4" fill="${RIVET}"/>
      <text x="400" y="460" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="32" fill="${INK}" font-weight="700">40 cm</text>
    </g>`,
  pinturaAsfaltica: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="200" y="60" width="160" height="40" fill="${INK}"/>
      <rect x="170" y="100" width="220" height="60" rx="6" fill="${IRON}"/>
      <rect x="170" y="160" width="220" height="320" fill="${INK}"/>
      <rect x="190" y="220" width="180" height="40" fill="${RIVET}"/>
      <text x="280" y="250" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="${PAPER}">ASFÁLTICA</text>
      <rect x="190" y="280" width="180" height="14" fill="${PAPER}"/>
      <rect x="190" y="310" width="120" height="14" fill="${PAPER}"/>
      <text x="280" y="400" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="44" font-weight="700" fill="${AMBER}">4 L</text>
    </g>`,
  discosCorte: (x, y) => `
    <g transform="translate(${x},${y})">
      ${[0, 1, 2, 3, 4].map((i) => {
        const dy = i * 18;
        return `
          <ellipse cx="380" cy="${120 + dy}" rx="220" ry="22" fill="${INK}" opacity="${0.4 + i * 0.12}"/>
          <ellipse cx="380" cy="${100 + dy}" rx="220" ry="22" fill="${i === 4 ? INK : IRON}"/>
          <ellipse cx="380" cy="${100 + dy}" rx="200" ry="20" fill="none" stroke="${AMBER}" stroke-width="3"/>
          <circle cx="380" cy="${100 + dy}" r="28" fill="${INK}"/>
          <circle cx="380" cy="${100 + dy}" r="14" fill="${PAPER}"/>
        `;
      }).join("")}
    </g>`,
  cintaAisladora: (x, y) => `
    <g transform="translate(${x},${y})">
      <ellipse cx="380" cy="120" rx="200" ry="50" fill="${INK}"/>
      <rect x="180" y="120" width="400" height="260" fill="${INK}"/>
      <ellipse cx="380" cy="380" rx="200" ry="50" fill="${INK}"/>
      <ellipse cx="380" cy="120" rx="180" ry="40" fill="${IRON}"/>
      <ellipse cx="380" cy="380" rx="180" ry="40" fill="${IRON}"/>
      <ellipse cx="380" cy="120" rx="160" ry="32" fill="none" stroke="${AMBER}" stroke-width="4"/>
      <text x="380" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700" fill="${AMBER}">PVC</text>
    </g>`,
  adhesivo: (x, y) => `
    <g transform="translate(${x},${y})">
      <polygon points="300,60 460,60 480,120 280,120" fill="${INK}"/>
      <rect x="280" y="120" width="200" height="60" fill="${IRON}"/>
      <rect x="280" y="180" width="200" height="280" fill="${AMBER}"/>
      <rect x="300" y="220" width="160" height="120" fill="${INK}"/>
      <text x="380" y="270" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="800" fill="${PAPER}">CONTACTO</text>
      <text x="380" y="305" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700" fill="${PAPER}">1 L</text>
    </g>`,
  tuboLED: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="40" y="180" width="720" height="80" rx="40" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <rect x="80" y="200" width="640" height="40" rx="20" fill="${INK}"/>
      <rect x="100" y="210" width="600" height="6" fill="${AMBER}"/>
      <rect x="100" y="225" width="600" height="6" fill="${AMBER}"/>
      <rect x="80" y="260" width="40" height="20" fill="${INK}"/>
      <rect x="680" y="260" width="40" height="20" fill="${INK}"/>
      <text x="400" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="40" font-weight="700" fill="${INK}">LED 18W</text>
      <text x="400" y="380" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="24" fill="${INK}">T8 · 6500K</text>
    </g>`,
  valvulaEsferica: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="40" y="220" width="180" height="60" fill="${INK}"/>
      <rect x="580" y="220" width="180" height="60" fill="${INK}"/>
      <circle cx="400" cy="250" r="120" fill="${INK}"/>
      <circle cx="400" cy="250" r="80" fill="${IRON}"/>
      <circle cx="400" cy="250" r="40" fill="${AMBER}"/>
      <rect x="380" y="100" width="40" height="200" rx="8" fill="${RIVET}"/>
      <rect x="320" y="80" width="160" height="30" rx="6" fill="${RIVET}"/>
    </g>`,
  atornillador: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="160" y="120" width="260" height="140" rx="20" fill="${INK}"/>
      <rect x="170" y="160" width="120" height="100" rx="8" fill="${IRON}"/>
      <rect x="420" y="170" width="120" height="40" fill="${INK}"/>
      <rect x="220" y="260" width="100" height="180" rx="14" fill="${INK}"/>
      <rect x="230" y="280" width="80" height="14" fill="${IRON}"/>
      <rect x="230" y="305" width="80" height="14" fill="${IRON}"/>
      <rect x="320" y="320" width="60" height="40" fill="${AMBER}"/>
      <text x="540" y="240" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${AMBER}" font-weight="700">12V</text>
    </g>`,
  disyuntor: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="160" y="60" width="240" height="380" rx="16" fill="${INK}"/>
      <rect x="180" y="100" width="200" height="60" fill="${IRON}"/>
      <rect x="200" y="200" width="160" height="100" rx="6" fill="${AMBER}"/>
      <rect x="200" y="200" width="160" height="50" fill="${INK}"/>
      <circle cx="280" cy="320" r="22" fill="${RIVET}"/>
      <circle cx="280" cy="320" r="10" fill="${PAPER}"/>
      <text x="280" y="460" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="36" font-weight="700" fill="${INK}">40 A</text>
    </g>`,
  pinzaAmperimetrica: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="240" y="120" width="200" height="320" rx="20" fill="${INK}"/>
      <rect x="260" y="150" width="160" height="100" fill="${IRON}"/>
      <rect x="280" y="170" width="120" height="60" fill="${AMBER}"/>
      <rect x="280" y="240" width="120" height="14" fill="${PAPER}"/>
      <path d="M 340 60 Q 280 60 280 120 L 280 200" fill="none" stroke="${INK}" stroke-width="20"/>
      <path d="M 340 60 Q 400 60 400 120 L 400 200" fill="none" stroke="${INK}" stroke-width="20"/>
      <rect x="260" y="350" width="160" height="60" fill="${IRON}"/>
      <circle cx="380" cy="380" r="14" fill="${AMBER}"/>
    </g>`,
  cintaMetrica: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="220" y="220" width="320" height="200" rx="40" fill="${INK}"/>
      <rect x="240" y="240" width="280" height="160" rx="32" fill="${AMBER}"/>
      <rect x="260" y="260" width="240" height="120" rx="20" fill="${PAPER}"/>
      <text x="380" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="36" font-weight="700" fill="${INK}">5 m</text>
      <text x="380" y="350" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="${INK}">16 ft</text>
      <circle cx="380" cy="200" r="20" fill="${IRON}"/>
    </g>`,
  esmalte: (x, y) => `
    <g transform="translate(${x},${y})">
      <polygon points="240,60 360,60 380,120 220,120" fill="${INK}"/>
      <rect x="220" y="120" width="160" height="40" fill="${IRON}"/>
      <rect x="220" y="160" width="160" height="320" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <rect x="240" y="200" width="120" height="100" fill="${AMBER}"/>
      <text x="300" y="245" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" fill="${INK}">ESMALTE</text>
      <text x="300" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="${INK}">1 L</text>
      <rect x="240" y="340" width="120" height="14" fill="${INK}"/>
      <rect x="240" y="370" width="80" height="10" fill="${INK}"/>
      <text x="300" y="420" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="${INK}">BRILLANTE</text>
    </g>`,
  placaYeso: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="80" y="120" width="640" height="400" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <rect x="80" y="120" width="640" height="40" fill="${IRON}"/>
      <text x="400" y="280" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="36" font-weight="800" fill="${INK}">YESO</text>
      <text x="400" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="28" fill="${INK}">1.20 × 2.40 m</text>
      <text x="400" y="380" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="${AMBER}">12.5 mm espesor</text>
      <circle cx="160" cy="450" r="20" fill="${AMBER}"/>
      <circle cx="400" cy="450" r="20" fill="${AMBER}"/>
      <circle cx="640" cy="450" r="20" fill="${AMBER}"/>
    </g>`,
  tarugos: (x, y) => `
    <g transform="translate(${x},${y})">
      ${Array.from({ length: 24 }).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const cx = 100 + col * 110;
        const cy = 130 + row * 130;
        return `
          <ellipse cx="${cx}" cy="${cy + 6}" rx="38" ry="8" fill="${INK}" opacity="0.18"/>
          <rect x="${cx - 30}" y="${cy - 50}" width="60" height="60" rx="6" fill="${IRON}"/>
          <rect x="${cx - 26}" y="${cy - 46}" width="52" height="20" fill="${AMBER}"/>
          <rect x="${cx - 22}" y="${cy - 20}" width="44" height="14" fill="${INK}"/>
          <rect x="${cx - 22}" y="${cy}" width="44" height="6" fill="${INK}"/>
        `;
      }).join("")}
    </g>`,
  // === Nuevos productos ===
  mangueraJardin: (x, y) => `
    <g transform="translate(${x},${y})">
      <circle cx="200" cy="240" r="160" fill="none" stroke="${SAGE}" stroke-width="34"/>
      <circle cx="200" cy="240" r="160" fill="none" stroke="${INK}" stroke-width="38" stroke-dasharray="6 0" />
      <circle cx="200" cy="240" r="160" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="2 14"/>
      <circle cx="200" cy="240" r="80" fill="${SAGE}" opacity="0.25"/>
      <rect x="380" y="180" width="120" height="120" rx="14" fill="${INK}"/>
      <rect x="396" y="196" width="88" height="88" rx="6" fill="${AMBER}"/>
      <text x="440" y="220" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="${INK}">1/2"</text>
      <text x="440" y="245" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="${INK}">3/4</text>
      <text x="440" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="${INK}">CONEX</text>
      <text x="400" y="380" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="34" fill="${INK}" font-weight="700">15 m</text>
    </g>`,
  tijeraPodar: (x, y) => `
    <g transform="translate(${x},${y})">
      <path d="M 140 380 L 280 220 L 320 240 L 200 420 Z" fill="${AMBER}"/>
      <path d="M 280 220 L 440 80 L 470 100 L 320 240 Z" fill="${INK}"/>
      <path d="M 440 80 L 520 100 L 540 160 L 470 100 Z" fill="${IRON}"/>
      <circle cx="270" cy="240" r="12" fill="${INK}"/>
      <circle cx="270" cy="240" r="4" fill="${AMBER}"/>
      <line x1="170" y1="160" x2="260" y2="220" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <line x1="190" y1="140" x2="280" y2="200" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    </g>`,
  picoRegador: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="280" y="180" width="200" height="160" rx="20" fill="${SAGE}"/>
      <rect x="296" y="196" width="168" height="40" fill="${INK}"/>
      <rect x="380" y="340" width="40" height="80" rx="6" fill="${INK}"/>
      <rect x="356" y="420" width="88" height="80" rx="10" fill="${INK}"/>
      <rect x="360" y="240" width="40" height="60" fill="${AMBER}"/>
      <circle cx="380" cy="170" r="24" fill="${INK}"/>
      <circle cx="380" cy="170" r="14" fill="${PAPER}"/>
      <circle cx="380" cy="170" r="6" fill="${INK}"/>
      <text x="380" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${INK}" font-weight="700">ON</text>
    </g>`,
  candado: (x, y) => `
    <g transform="translate(${x},${y})">
      <path d="M 200 240 L 200 160 A 80 80 0 0 1 360 160 L 360 240" fill="none" stroke="${INK}" stroke-width="32" stroke-linecap="round"/>
      <rect x="140" y="240" width="280" height="220" rx="14" fill="${IRON}" stroke="${INK}" stroke-width="4"/>
      <rect x="160" y="260" width="240" height="180" rx="8" fill="${INK}"/>
      <circle cx="280" cy="350" r="40" fill="${AMBER}"/>
      <circle cx="280" cy="350" r="14" fill="${INK}"/>
      <line x1="280" y1="350" x2="280" y2="320" stroke="${INK}" stroke-width="3"/>
      <text x="280" y="440" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${AMBER}" font-weight="700">50 mm</text>
    </g>`,
  cerradura: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="120" y="120" width="320" height="320" fill="${AMBER}" stroke="${INK}" stroke-width="6"/>
      <rect x="140" y="140" width="280" height="280" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
      <circle cx="280" cy="280" r="60" fill="${INK}"/>
      <circle cx="280" cy="280" r="36" fill="${AMBER}"/>
      <rect x="270" y="220" width="20" height="120" rx="3" fill="${INK}"/>
      <rect x="200" y="400" width="160" height="20" rx="4" fill="${INK}"/>
      <text x="280" y="500" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${INK}" font-weight="700">DOBLE PALETA</text>
    </g>`,
  guantes: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="120" y="140" width="280" height="380" fill="${AMBER}" stroke="${INK}" stroke-width="4"/>
      <rect x="140" y="160" width="240" height="80" fill="${INK}"/>
      <text x="260" y="210" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="${AMBER}">NITRILO</text>
      <path d="M 180 280 L 220 280 L 240 340 L 220 480 L 200 480 L 180 440 Z" fill="${INK}"/>
      <path d="M 240 280 L 280 280 L 300 360 L 280 480 L 240 480 L 240 340 Z" fill="${IRON}"/>
      <path d="M 300 280 L 340 280 L 360 360 L 340 480 L 300 480 L 300 360 Z" fill="${INK}"/>
      <text x="260" y="555" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="${INK}">x 10 PARES</text>
    </g>`,
  mechaWidia: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="380" y="240" width="220" height="50" fill="${INK}"/>
      <rect x="380" y="270" width="220" height="14" fill="${AMBER}"/>
      <rect x="380" y="284" width="220" height="6" fill="${INK}"/>
      <polygon points="380,265 320,290 280,260 280,220 320,200 380,215" fill="${IRON}"/>
      <polygon points="320,200 280,220 270,250 290,260 320,250 350,250 380,240 380,210" fill="${AMBER}"/>
      <polygon points="290,260 280,300 320,310 380,310 380,270 320,260" fill="${INK}"/>
      <text x="490" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="34" fill="${INK}" font-weight="700">10 mm</text>
      <text x="490" y="420" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${INK}">120 mm</text>
    </g>`,
  destornillador: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="380" y="80" width="220" height="60" fill="${IRON}"/>
      <rect x="380" y="140" width="220" height="20" fill="${INK}"/>
      <rect x="380" y="160" width="20" height="160" fill="${INK}"/>
      <polygon points="380,320 400,320 400,360 390,400 380,360" fill="${INK}"/>
      <path d="M 130 240 L 130 380 Q 130 460 220 460 L 360 460 Q 380 460 380 440 L 380 240 Q 380 220 360 220 L 150 220 Q 130 220 130 240 Z" fill="${AMBER}"/>
      <rect x="160" y="250" width="200" height="20" fill="${INK}"/>
      <rect x="160" y="290" width="120" height="14" fill="${INK}"/>
      <rect x="160" y="320" width="160" height="14" fill="${INK}"/>
      <text x="240" y="400" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" fill="${INK}" font-weight="700">PH2 · 150</text>
    </g>`,
  epoxi: (x, y) => `
    <g transform="translate(${x},${y})">
      <rect x="120" y="200" width="120" height="280" rx="6" fill="${INK}"/>
      <rect x="240" y="200" width="120" height="280" rx="6" fill="${IRON}"/>
      <rect x="140" y="220" width="80" height="40" fill="${AMBER}"/>
      <rect x="260" y="220" width="80" height="40" fill="${AMBER}"/>
      <text x="180" y="370" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="44" fill="${PAPER}" font-weight="800">A</text>
      <text x="300" y="370" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="44" fill="${PAPER}" font-weight="800">B</text>
      <rect x="120" y="480" width="240" height="20" fill="${AMBER}"/>
      <rect x="380" y="200" width="160" height="280" rx="20" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
      <text x="460" y="280" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="800" fill="${INK}">EPOXI</text>
      <text x="460" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="28" fill="${INK}" font-weight="700">25 g</text>
      <text x="460" y="360" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="${INK}">5 min</text>
      <line x1="380" y1="380" x2="540" y2="380" stroke="${INK}" stroke-width="2"/>
      <text x="460" y="410" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="${INK}">BICOMPONENTE</text>
    </g>`,
};

// Lista de productos: slug, título (para <title>), color de fondo opcional, icono.
const products = [
  { slug: "taladro-percutor-13mm-gamma", icon: "taladro", bg: PAPER, title: "Taladro percutor 13mm 750W Gamma" },
  { slug: "amoladora-angular-4-bosch", icon: "amoladora", bg: PAPER, title: "Amoladora angular 4½ Bosch 820W" },
  { slug: "llave-stilson-12-crossmaster", icon: "llaveStilson", bg: PAPER, title: "Llave stilson 12 pulgadas Crossmaster" },
  { slug: "juego-llaves-allen-milimetricas", icon: "llavesAllen", bg: PAPER, title: "Juego de llaves Allen milimétricas" },
  { slug: "martillo-carpintero-16oz-stanley", icon: "martillo", bg: PAPER, title: "Martillo carpintero 16oz Stanley" },
  { slug: "canio-pvc-110mm-4m", icon: "canioPVC", bg: PAPER, title: "Caño PVC 110mm x 4 metros" },
  { slug: "canio-pvc-50mm-4m", icon: "canioPVC50", bg: PAPER, title: "Caño PVC 50mm x 4 metros" },
  { slug: "sella-roscas-poxipol-125cc", icon: "sellaRoscas", bg: PAPER_DEEP, title: "Sella roscas 125cc Poxipol" },
  { slug: "cable-unipolar-2-5mm-100m", icon: "cable", bg: PAPER, title: "Cable unipolar 2.5mm² x 100 metros" },
  { slug: "cable-unipolar-4mm-100m", icon: "cable4mm", bg: PAPER, title: "Cable unipolar 4mm² x 100 metros" },
  { slug: "llave-termica-bipolar-25a", icon: "llaveTermica", bg: PAPER_DEEP, title: "Llave térmica bipolar 25A Schneider" },
  { slug: "llave-termica-bipolar-40a", icon: "llaveTermica40", bg: PAPER_DEEP, title: "Llave térmica bipolar 40A Schneider" },
  { slug: "latex-interior-20l-sherwin", icon: "latex", bg: PAPER, title: "Látex interior blanco 20L Sherwin Williams" },
  { slug: "yeso-bolsa-25kg", icon: "yeso", bg: PAPER_DEEP, title: "Yeso bolsa 25 kilogramos" },
  { slug: "tornillos-autoperforantes-t1-x200", icon: "tornillos", bg: PAPER, title: "Tornillos autoperforantes T1 caja x 200 unidades" },
  { slug: "flexible-gas-1-2-40cm", icon: "flexibleGas", bg: PAPER, title: "Flexible gas 1/2 pulgada x 40cm" },
  { slug: "pintura-asfaltica-4l", icon: "pinturaAsfaltica", bg: PAPER_DEEP, title: "Pintura asfáltica 4 litros" },
  { slug: "disco-corte-metal-bosch-x5", icon: "discosCorte", bg: PAPER, title: "Disco corte metal 4½ Bosch pack x 5" },
  { slug: "cinta-aisladora-pvc-20m", icon: "cintaAisladora", bg: PAPER_DEEP, title: "Cinta aisladora PVC 20 metros" },
  { slug: "adhesivo-contacto-1l-poxipol", icon: "adhesivo", bg: PAPER, title: "Adhesivo de contacto 1L Poxipol" },
  { slug: "tubo-led-18w-philips", icon: "tuboLED", bg: PAPER_DEEP, title: "Tubo LED 18W Philips T8" },
  { slug: "valvula-esferica-1-2", icon: "valvulaEsferica", bg: PAPER, title: "Válvula esférica ½ pulgada" },
  { slug: "atornillador-inalambrico-12v", icon: "atornillador", bg: PAPER, title: "Atornillador inalámbrico 12V Bosch" },
  { slug: "disyuntor-diferencial-40a", icon: "disyuntor", bg: PAPER, title: "Disyuntor diferencial bipolar 40A" },
  { slug: "cinta-metrica-5m", icon: "cintaMetrica", bg: PAPER_DEEP, title: "Cinta métrica 5 metros con freno" },
  { slug: "esmalte-sintetico-blanco-1l", icon: "esmalte", bg: PAPER, title: "Esmalte sintético blanco 1L" },
  { slug: "pintura-esmalte-rojo-bermellon-1l", icon: "esmalte", bg: PAPER_DEEP, title: "Esmalte sintético rojo bermellón 1L" },
  { slug: "enduido-interior-bolsa-5kg", icon: "yeso", bg: PAPER, title: "Enduido interior bolsa 5kg" },
  { slug: "pinza-amperimetrica-600v", icon: "pinzaAmperimetrica", bg: PAPER, title: "Pinza amperimétrica digital 600V" },
  { slug: "placa-yeso-estandar-120", icon: "placaYeso", bg: PAPER_DEEP, title: "Placa de yeso estándar 1.20 x 2.40m" },
  { slug: "tarugos-plasticos-n8", icon: "tarugos", bg: PAPER, title: "Tarugos plásticos N°8 bolsa x 100" },
  { slug: "manguera-jardin-reforzada-15m", icon: "mangueraJardin", bg: PAPER, title: "Manguera jardín reforzada 15 metros" },
  { slug: "tijera-podar-bypass-8", icon: "tijeraPodar", bg: PAPER_DEEP, title: "Tijera de podar bypass 8 pulgadas" },
  { slug: "pico-regador-plastico", icon: "picoRegador", bg: PAPER, title: "Pico regador con rociador" },
  { slug: "candado-laminado-50mm", icon: "candado", bg: PAPER, title: "Candado laminado 50mm Master Lock" },
  { slug: "cerradura-embutir-doble-paleta", icon: "cerradura", bg: PAPER_DEEP, title: "Cerradura embutir doble paleta" },
  { slug: "guantes-nitrilo-industriales-x10", icon: "guantes", bg: PAPER, title: "Guantes de nitrilo industriales x 10" },
  { slug: "mecha-widia-10mm-120mm", icon: "mechaWidia", bg: PAPER_DEEP, title: "Mecha widia 10mm x 120mm" },
  { slug: "destornillador-phillips-ph2-150mm", icon: "destornillador", bg: PAPER, title: "Destornillador Phillips PH2 150mm" },
  { slug: "adhesivo-epoxi-25g", icon: "epoxi", bg: PAPER_DEEP, title: "Adhesivo epoxi bicomponente 25g Poxipol" },
];

function svgFor({ icon, bg, title, slug }) {
  const draw = icons[icon] || icons.martillo;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-labelledby="t-${slug}">
  <title id="t-${slug}">${title}</title>
  <rect width="800" height="800" fill="${bg}"/>
  <rect x="0" y="0" width="800" height="800" fill="none" stroke="${LINE}" stroke-width="2"/>
  <!-- corner crosshair marks (pliego técnico feel) -->
  <g stroke="${LINE}" stroke-width="2" fill="none">
    <path d="M 20 60 L 60 60 M 60 20 L 60 60"/>
    <path d="M 780 60 L 740 60 M 740 20 L 740 60"/>
    <path d="M 20 740 L 60 740 M 60 780 L 60 740"/>
    <path d="M 780 740 L 740 740 M 740 780 L 740 740"/>
  </g>
  ${draw(0, 0)}
</svg>
`;
}

await mkdir(outDir, { recursive: true });
for (const p of products) {
  const file = join(outDir, `${p.slug}.svg`);
  await writeFile(file, svgFor(p), "utf8");
}
console.log(`Generated ${products.length} product SVGs in ${outDir}`);