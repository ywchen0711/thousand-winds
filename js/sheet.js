// Monster sprites by other pixel artists, shared under CC-BY 3.0 or CC0; CREDITS.md names them all.
// Each monster was cut out of its sheet, recoloured where needed and packed into assets/monsters.png.
// The boxes are [x, y, w, h, scale]: the scale is how big the sprite is drawn, in game pixels per
// sprite pixel. Below 1 the sprite is drawn with the real screen pixels, so it is smaller and finer.
import { canvas } from './gfx.js';

const ATLAS = { slime1: [195, 237, 29, 22, 0.75], slime2: [225, 237, 29, 22, 0.75], slime4: [255, 237, 29, 22, 0.75], slime5: [285, 237, 29, 22, 0.75], bird1: [45, 111, 47, 67, 0.75], bird3: [93, 111, 47, 67, 0.75], bird5: [141, 111, 47, 67, 0.75], hare1: [0, 181, 63, 55, 0.75], wolf2: [64, 181, 47, 55, 0.75], wolf4: [112, 181, 47, 55, 0.75], shroom1: [208, 181, 46, 53, 0.75], shroom3: [255, 181, 46, 53, 0.75], bat2: [119, 237, 37, 34, 1], bat4: [157, 237, 37, 34, 1], crab1: [315, 237, 41, 22, 1], crab3: [357, 237, 41, 22, 1], bones2: [29, 237, 29, 35, 1], bones4: [59, 237, 29, 35, 1], bones6: [89, 237, 29, 35, 1], merrow3: [311, 0, 74, 75, 0.75], merrow5: [386, 0, 74, 75, 0.75], wisp2: [302, 181, 55, 46, 0.75], wisp4: [358, 181, 55, 46, 0.75], wisp6: [414, 181, 55, 46, 0.75], garg4: [348, 111, 54, 56, 0.75], garg6: [403, 111, 54, 56, 0.75], golem5: [461, 0, 46, 69, 0.75], serp3: [470, 181, 28, 45, 1], serp5: [0, 237, 28, 45, 1], scorp4: [251, 111, 47, 65, 0.75], yeti5: [88, 0, 59, 91, 0.75], ooze: [399, 237, 29, 22, 1.5], smuggler: [299, 111, 48, 64, 1.25], wolfking: [160, 181, 47, 55, 1.5], morgan: [189, 111, 61, 66, 1.5], ide: [148, 0, 50, 91, 1.5], captain: [0, 111, 44, 69, 1.4], sandking: [250, 0, 60, 77, 1.25], frostqueen: [199, 0, 50, 91, 1.5], nul: [0, 0, 87, 110, 1] };

// the module waits for the picture, so every monster is ready before the first battle
const img = new Image();
img.src = 'assets/monsters.png';
let ok = false;
try { await img.decode(); ok = true; } catch (err) { console.warn('monster sheet missing, using the drawn monsters', err); }

const cache = new Map();
export const hasSheet = (k) => ok && !!ATLAS[k];
function cut(k, fs) {
  const [x, y, w, h] = ATLAS[k], c = canvas(w, h);
  c.x.drawImage(img, x, y, w, h, 0, 0, w, h);
  c.fs = fs;
  return c;
}
export function sheetArt(k) {
  if (!cache.has(k)) cache.set(k, cut(k, ATLAS[k][4]));
  return cache.get(k);
}
// the one that walks around the map: the same picture, drawn about 22 game pixels tall
export function sheetMini(k) {
  const key = 'mini:' + k;
  if (!cache.has(key)) { const [, , w, h] = ATLAS[k]; cache.set(key, cut(k, Math.min(1, 22 / Math.max(w, h)))); }
  return cache.get(key);
}
