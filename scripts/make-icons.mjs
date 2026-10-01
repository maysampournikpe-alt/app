// Draws the app icons (PNG) from one SVG using "sharp". Run: npm run icons
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";

const logo = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#0b6b66"/>
  <rect width="64" height="64" rx="16" fill="#0b6b66"/>
  <circle cx="32" cy="34" r="18" fill="#f59e0b" opacity="0.95"/>
  <path d="M8 44h48v12a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="#08534f"/>
  <path d="M32 12 40 34 32 30 24 34z" fill="#ffffff"/>
  <path d="M32 56 24 34 32 38 40 34z" fill="#fde6d6"/>
</svg>`;

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon.svg", logo(0));
const jobs = [
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
  ["apple-touch-icon.png", 180, 4],
  ["icon-maskable-512.png", 512, 14],
  ["favicon-32.png", 32, 0],
];
for (const [name, size, pad] of jobs) {
  await sharp(Buffer.from(logo(pad))).resize(size, size).png().toFile(`public/icons/${name}`);
}
console.log("icons written");
