// The world map of Aethra. You pick where to go from the places you have heard of; the party walks
// there across the map, and monsters can ambush them on the way.
import { ctx, W, H, text, textW, windowBox, HAND_D, hash } from './gfx.js';
import { renderMap } from './tiles.js';
import { sprite } from './sprites.js';
import { iconArt } from './field.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { S } from './party.js';
import { PLACES, MAPS } from './maps.js';
import { ITEMS, STONES } from './data.js';
import { L } from './i18n.js';

const MW = 64, MH = 48;
let tex = null;
// the land: noise-shaped continent, a lake in the middle, snow to the north, desert to the south-east
function noise(x, y, s, k) {
  const X = Math.floor(x / s), Y = Math.floor(y / s), fx = x / s - X, fy = y / s - Y, l = (a, b, t) => a + (b - a) * t * t * (3 - 2 * t);
  return l(l(hash(X, Y, k), hash(X + 1, Y, k), fx), l(hash(X, Y + 1, k), hash(X + 1, Y + 1, k), fx), fy);
}
export function worldKinds(flags = {}) {
  const k = [];
  for (let y = 0; y < MH; y++) {
    k.push([]);
    for (let x = 0; x < MW; x++) {
      const d = Math.hypot((x - 32) / 29, (y - 24) / 21.5) + (noise(x, y, 6, 1) - 0.5) * 0.5;
      let t = d < 1 ? 'ograss' : 'osea';
      if (t !== 'osea') {
        const n = noise(x + 20, y + 7, 4, 2);
        if (y < 10) t = 'osnow';
        else if (x > 46 && y > 33) t = 'osand';
        if (y >= 6 && y <= 16 && x >= 10 && x <= 30 && n > 0.5) t = 'omount';
        else if (t === 'ograss' && n > 0.62) t = 'oforest';
        else if (t === 'ograss' && n < 0.2) t = 'ohill';
        if (y < 10 && n > 0.58) t = 'omount';
        if (x > 46 && y > 33 && n > 0.7) t = 'ohill';
      }
      // the lake at the heart of the land, and the island that rises when the sanctum opens
      const ld = Math.hypot(x - 33, (y - 22) * 1.1);
      if (ld < 4.6) t = flags.sanctumOpen && ld < 1.6 ? 'osand' : 'water';
      k[y].push(t);
    }
  }
  // roads between neighbouring places
  const road = (a, b) => { const A = PLACES[a], B = PLACES[b]; const n = Math.max(Math.abs(A.x - B.x), Math.abs(A.y - B.y)); for (let i = 0; i <= n; i++) { const x = Math.round(A.x + (B.x - A.x) * i / n), y = Math.round(A.y + (B.y - A.y) * i / n); if (k[y][x] !== 'osea' && k[y][x] !== 'water') k[y][x] = 'oroad'; } };
  for (const [a, b] of [['valmont', 'mistport'], ['valmont', 'aqueduct'], ['valmont', 'grassea'], ['valmont', 'saltreach'], ['valmont', 'astralis'], ['astralis', 'ironclaw'], ['astralis', 'library'], ['grassea', 'gorge'], ['grassea', 'dunehold'], ['dunehold', 'sandtemple'], ['ironclaw', 'mines'], ['astralis', 'frostpeak'], ['frostpeak', 'icecorridor'], ['mistport', 'seacave']]) road(a, b);
  for (const p of Object.values(PLACES)) if (p.kind === 'town' && k[p.y][p.x] === 'osea') k[p.y][p.x] = 'osand';
  return k;
}
function build() {
  const k = worldKinds(S.flags);
  const kinds = [], idx = {}, g = new Uint8Array(MW * MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const t = k[y][x]; if (idx[t] === undefined) { idx[t] = kinds.length; kinds.push(t); } g[y * MW + x] = idx[t]; }
  const m = { w: MW, h: MH, kinds, tile: (x, y) => g[y * MW + x] };
  tex = renderMap(m);
  tex.key = !!S.flags.sanctumOpen;
}

// ---------- the scene ----------
const WM = { at: 'valmont', sel: 'valmont', t: 0, travel: null, cam: { x: 0, y: 0 }, busy: false };
export const worldState = WM;
export const visible = () => Object.values(PLACES).filter((p) => S.known[p.id] && (!p.open || p.open(S)));
export function openWorld(at) {
  if (!tex || tex.key !== !!S.flags.sanctumOpen) build();
  WM.at = at; WM.sel = at; WM.travel = null; S.loc = at;
  const p = PLACES[at]; WM.cam.x = p.x * 16 + 8 - W / 2; WM.cam.y = p.y * 16 + 8 - H / 2;
}
// hooks filled in by main.js
export const WorldHooks = { enter: null, ambush: null, menu: null };
function nextIn(dir) {
  const cur = PLACES[WM.sel], [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  let best = null, bs = Infinity;
  for (const p of visible()) {
    if (p.id === cur.id) continue;
    const vx = p.x - cur.x, vy = p.y - cur.y, along = vx * dx + vy * dy;
    if (along <= 0) continue;
    const side = Math.abs(vx * dy - vy * dx), score = along + side * 2;
    if (score < bs) { bs = score; best = p; }
  }
  return best;
}
export function updateWorld() {
  WM.t++;
  if (WM.travel) {
    const tr = WM.travel;
    tr.k = Math.min(1, tr.k + tr.speed);
    if (!tr.ambushed && tr.ambushAt !== null && tr.k >= tr.ambushAt) { tr.ambushed = true; WM.busy = true; WorldHooks.ambush(PLACES[tr.to].tier).then((r) => { WM.busy = false; if (r === 'flee') { /* keep walking */ } }); return; }
    if (tr.k >= 1) { WM.travel = null; WM.at = tr.to; WM.sel = tr.to; S.loc = tr.to; WM.busy = true; Promise.resolve(WorldHooks.enter(tr.to)).then(() => { WM.busy = false; }); }
    return;
  }
  if (WM.busy) return;
  for (const d of ['up', 'down', 'left', 'right']) if (input.repeat(d)) { const n = nextIn(d); if (n) { WM.sel = n.id; sfx('cursor'); } }
  if (input.pressed('a')) {
    sfx('ok');
    if (WM.sel === WM.at) { WM.busy = true; Promise.resolve(WorldHooks.enter(WM.at)).then(() => { WM.busy = false; }); return; }
    const A = PLACES[WM.at], B = PLACES[WM.sel], dist = Math.hypot(A.x - B.x, A.y - B.y);
    // the farther you go, the more likely something finds you on the way
    const ambush = Math.random() < Math.min(0.75, 0.25 + dist * 0.025);
    WM.travel = { from: WM.at, to: WM.sel, k: 0, speed: 1 / Math.max(30, dist * 5), ambushAt: ambush ? 0.3 + Math.random() * 0.4 : null };
    S.time += Math.round(dist * 30);
  } else if (input.pressed('b') || input.pressed('menu')) { WM.busy = true; Promise.resolve(WorldHooks.menu()).then(() => { WM.busy = false; }); }
}
function partyPos() {
  if (!WM.travel) { const p = PLACES[WM.at]; return [p.x * 16, p.y * 16]; }
  const A = PLACES[WM.travel.from], B = PLACES[WM.travel.to], k = WM.travel.k;
  return [(A.x + (B.x - A.x) * k) * 16, (A.y + (B.y - A.y) * k) * 16];
}
export function drawWorld() {
  if (!tex) build();
  const [px, py] = partyPos();
  const focus = WM.travel ? [px, py] : [PLACES[WM.sel].x * 16, PLACES[WM.sel].y * 16];
  const tx = Math.max(0, Math.min(MW * 16 - W, focus[0] + 8 - W / 2)), ty = Math.max(0, Math.min(MH * 16 - H, focus[1] + 8 - H / 2));
  WM.cam.x += (tx - WM.cam.x) * 0.2; WM.cam.y += (ty - WM.cam.y) * 0.2;
  const cx = Math.round(WM.cam.x), cy = Math.round(WM.cam.y);
  ctx.drawImage(tex.frames[Math.floor(WM.t / 20) % tex.frames.length], -cx, -cy);
  ctx.drawImage(tex.upper, -cx, -cy);
  // routes from where you stand to every place you know
  const here = PLACES[WM.at];
  for (const p of visible()) {
    const a = iconArt(p.icon), x = p.x * 16 - cx + 8, y = p.y * 16 - cy + 16;
    ctx.drawImage(a, Math.round(x - a.width / 2), Math.round(y - a.height));
    if (p.id === WM.sel && !WM.travel) ctx.drawImage(HAND_D, Math.round(x - 5), Math.round(y - a.height - 12 + ((WM.t >> 3) % 2)));
  }
  void here;
  // the party
  const lead = S.members[0] ? S.members[0].id : 'rion';
  const fr = sprite(lead)[WM.travel ? (PLACES[WM.travel.to].x > PLACES[WM.travel.from].x ? 'r' : 'l') : 'd'][WM.travel ? Math.floor(WM.t / 8) % 4 : 0];
  // standing beside the place, not on top of its marker
  ctx.drawImage(fr, Math.round(px - cx + (WM.travel ? 0 : 12)), Math.round(py - cy - 6));
  // the name of the selected place and the wind stones you carry
  const name = MAPS[WM.sel] ? MAPS[WM.sel].name : WM.sel;
  const w = textW(name) + 24;
  windowBox(4, 4, w, 24); text(name, 16, 10, '#f8f8f8');
  const held = STONES.filter((s) => S.inv[s]).length;
  windowBox(W - 82, 4, 78, 24);
  text(L('風之石', 'Stones'), W - 74, 10, '#a0c0f8'); text(`${held}/8`, W - 12, 10, '#f8e070', { align: 'right' });
  if (!WM.travel && WM.sel !== WM.at) text(L('Z：出發', 'Z: travel'), W / 2, H - 16, '#f8f8f8', { align: 'center' });
  else if (!WM.travel) text(L('Z：進入　X：選單', 'Z: enter   X: menu'), W / 2, H - 16, '#f8f8f8', { align: 'center' });
  void ITEMS;
}
