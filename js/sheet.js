// Monster sprites drawn by other pixel artists and shared under CC-BY 3.0 (see CREDITS.md):
// Charles Gabriel (Antifarea) and Stephen "Redshrike" Challener, both hosted by OpenGameArt.org.
// They were cut out of their sheets into assets/monsters.png; the boxes below are [x, y, w, h].
import { canvas } from './gfx.js';

const ATLAS = {
  merrow: [0, 0, 74, 75], bird: [75, 0, 47, 67], scorp: [123, 0, 47, 65], gargoyle: [171, 0, 54, 56],
  hare: [0, 76, 63, 55], wolf: [64, 76, 47, 55], wolfb: [112, 76, 47, 55], wolfr: [160, 76, 47, 55],
  shroom: [208, 76, 46, 53], wisp: [0, 132, 55, 46], serpent: [56, 132, 28, 45], bones: [85, 132, 29, 35],
  bat: [115, 132, 37, 34], jelly: [153, 132, 29, 22], redjelly: [183, 132, 29, 22], bluejelly: [213, 132, 29, 22],
  crab: [0, 179, 41, 22],
};

// the module waits for the picture, so every monster is ready before the first battle
const img = new Image();
img.src = 'assets/monsters.png';
let ok = false;
try { await img.decode(); ok = true; } catch (err) { console.warn('monster sheet missing, using the hand-drawn monsters', err); }

const cache = new Map();
export const hasSheet = (k) => ok && !!ATLAS[k];
export function sheetArt(k) {
  if (!cache.has(k)) {
    const [x, y, w, h] = ATLAS[k], c = canvas(w, h);
    c.x.drawImage(img, x, y, w, h, 0, 0, w, h);
    cache.set(k, c);
  }
  return cache.get(k);
}
// the small version that walks around dungeons: averaged down to about 20 pixels, then the edge made hard again
export function sheetMini(k) {
  const key = 'mini:' + k;
  if (cache.has(key)) return cache.get(key);
  const a = sheetArt(k), sc = Math.max(a.width, a.height) / 20;
  const c = canvas(Math.max(1, Math.round(a.width / sc)), Math.max(1, Math.round(a.height / sc)));
  c.x.imageSmoothingEnabled = true; c.x.imageSmoothingQuality = 'high';
  c.x.drawImage(a, 0, 0, c.width, c.height);
  const id = c.x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0;
  c.x.putImageData(id, 0, 0);
  cache.set(key, c);
  return c;
}
