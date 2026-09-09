// Gera os ícones do PWA a partir de public/icons/icon.svg
// Uso: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve('public/icons');
const svg = readFileSync(resolve(dir, 'icon.svg'));

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['maskable-icon-512x512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  await sharp(svg).resize(size, size).png().toFile(resolve(dir, name));
  console.log('ok', name);
}

copyFileSync(resolve(dir, 'icon.svg'), resolve(dir, 'favicon.svg'));
console.log('ok favicon.svg');
