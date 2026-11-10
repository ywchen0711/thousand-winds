// Every place: eight towns built from one template, their inns, taverns, shops and halls, the
// dungeons laid out by a seeded generator, and the list of places on the world map.
import { hash } from './gfx.js';
import { localize } from './i18n.js';
import { ENEMIES, GROUPS } from './data.js';

// characters shared by all maps
const BASE = {
  '.': 'grass', ',': 'flower', ';': 'tall', '=': 'dirt', ':': 'sand', '*': 'snow', 'T': 'tree', 'P': 'pine', 'n': 'bush', 'o': 'rock', 'u': 'stump',
  'w': 'water', 'W': 'deep', 'k': 'dock', '#': 'bridge', 'F': 'fence', 's': 'sign', 'O': 'well', 'L': 'lamp', 'X': 'wall', 'C': 'cliff',
  'R': 'roof_r', 'B': 'roof_b', 'G': 'roof_g', 'Q': 'roof_p', 'H': 'hwall', 'N': 'window', 'D': 'door', 'h': 'shop', 'S': 'swall', 'V': 'swin', 'E': 'sdoor',
  '_': 'floor', 'I': 'iwall', 'r': 'carpet', 'c': 'counter', 't': 'table', 'd': 'bed', 'l': 'shelf', 'p': 'pot', 'y': 'barrel', 'x': 'crate', 'f': 'hearth', 'A': 'altar', 'e': 'pew',
  '^': 'stairs', 'v': 'down',
};
// rows + legend -> a map; legend values are a tile kind or { k: kind, e: entity | (x, y, n) => entity }
function grid(rows, legend = {}, meta = {}) {
  const Lg = { ...BASE, ...legend }, h = rows.length, w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${meta.id} row ${i} is ${r.length} wide, not ${w}`); });
  const ents = [], kinds = [], count = {};
  for (let y = 0; y < h; y++) {
    kinds.push([]);
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x], v = Lg[ch];
      if (v === undefined) throw new Error(`${meta.id}: no legend for '${ch}'`);
      if (typeof v === 'string') { kinds[y].push(v); continue; }
      kinds[y].push(v.k);
      const n = (count[ch] = (count[ch] || 0) + 1) - 1;
      const e = typeof v.e === 'function' ? v.e(x, y, n) : v.e;
      if (e) for (const one of [].concat(e)) ents.push({ x, y, ...one });
    }
  }
  return { w, h, kindAt: (x, y) => kinds[y][x], ents, ...meta };
}
function canvasMap(w, h, fill) {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  const b = {
    g, w, h,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : null; },
    rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) b.set(x + i, y + j, c); },
    rows() { return g.map((r) => r.join('')); },
  };
  return b;
}
const warp = (to, tx, ty, dir = 'd', extra = {}) => ({ type: 'warp', to, tx, ty, dir, ...extra });
const npc = (id, spriteName, talk, extra = {}) => ({ type: 'npc', id, sprite: spriteName, talk, ...extra });
export const WORLD = '@world';
export const MAPS = {};

// ---------- towns ----------
// slots: building spots in two rows; a town says what stands in each
const SLOT_X = [4, 12, 24, 31];
const ROOF = { inn: 'G', pub: 'Q', arms: 'R', items: 'R', magic: 'B', house: 'R', home: 'R', locked: 'Q' };
export const TOWNS = {
  valmont: { name: '瓦爾蒙王都', music: 'town', castle: 'B', slots: { a0: 'inn', a3: 'pub', b0: 'arms', b1: 'items', b2: 'house', b3: 'locked' },
    npcs: [['guard', 'guard', 'valmont_guard', 17, 9, 'd'], ['guard2', 'guard', 'valmont_guard', 22, 9, 'd'], ['child', 'boy', 'valmont_child', 9, 12, 'r'], ['merchant', 'merchant', 'valmont_merchant', 29, 12, 'l'], ['old', 'elder', 'valmont_old', 10, 21, 'd'], ['lady', 'mom', 'valmont_lady', 30, 21, 'l']] },
  mistport: { name: '霧港', music: 'town', harbour: true, slots: { a0: 'inn', a1: 'pub', a2: 'items', a3: 'arms', b0: 'home', b3: 'locked' },
    npcs: [['sailor', 'sailor', 'mistport_sailor', 18, 23, 'd'], ['fishwife', 'mom', 'mistport_fishwife', 26, 21, 'l'], ['beggar', 'elder', 'mistport_beggar', 8, 12, 'r'], ['guard', 'guard', 'mistport_guard', 21, 2, 'd'], ['girl', 'girl', 'mistport_girl', 30, 12, 'l']] },
  grassea: { name: '草海營地', music: 'town', border: 'n', roofs: 'G', slots: { a0: 'inn', a1: 'pub', a3: 'home', b0: 'items', b1: 'arms' },
    npcs: [['herder', 'boy', 'grassea_herder', 10, 21, 'r'], ['rider', 'sailor', 'grassea_rider', 28, 12, 'l'], ['weaver', 'mom', 'grassea_weaver', 30, 21, 'l'], ['scout', 'guard', 'grassea_scout', 21, 27, 'u']] },
  ironclaw: { name: '鐵爪堡', music: 'town', ground: '=', border: 'o', slots: { a0: 'inn', a1: 'pub', a2: 'arms', a3: 'items', b0: 'house', b1: 'locked' },
    npcs: [['miner', 'merchant', 'ironclaw_miner', 9, 12, 'r'], ['smith', 'fisher', 'ironclaw_smith', 29, 12, 'l'], ['guard', 'guard', 'ironclaw_guard', 21, 27, 'u'], ['widow', 'mom', 'ironclaw_widow', 30, 21, 'l']] },
  astralis: { name: '星塔學院', music: 'town', castle: 'Q', slots: { a0: 'inn', a3: 'magic', b0: 'items', b1: 'arms', b3: 'locked' },
    npcs: [['student', 'girl', 'astralis_student', 9, 12, 'r'], ['student2', 'boy', 'astralis_student2', 29, 12, 'l'], ['scholar', 'elder', 'astralis_scholar', 10, 21, 'd'], ['keeper', 'nun', 'astralis_keeper', 30, 21, 'l']] },
  saltreach: { name: '鹽岬港', music: 'town', harbour: true, slots: { a0: 'inn', a1: 'pub', a2: 'arms', a3: 'items', b0: 'home', b2: 'locked' },
    npcs: [['pirate', 'sailor', 'saltreach_pirate', 9, 12, 'r'], ['pirate2', 'sailor', 'saltreach_pirate2', 26, 21, 'l'], ['oldsalt', 'fisher', 'saltreach_oldsalt', 20, 23, 'd'], ['guard', 'guard', 'saltreach_guard', 21, 2, 'd']] },
  dunehold: { name: '沙丘城', music: 'town', ground: ':', border: 'o', castle: 'R', slots: { a0: 'inn', a3: 'pub', b0: 'arms', b1: 'items', b2: 'magic' },
    npcs: [['trader', 'merchant', 'dunehold_trader', 9, 12, 'r'], ['dancer', 'girl', 'dunehold_dancer', 29, 12, 'l'], ['guard', 'guard', 'dunehold_guard', 17, 9, 'd'], ['guard2', 'guard', 'dunehold_guard', 22, 9, 'd'], ['nomad', 'sailor', 'dunehold_nomad', 10, 21, 'd']] },
  frostpeak: { name: '雪嶺村', music: 'town', ground: '*', border: 'P', tint: 'rgba(200,220,255,0.12)', slots: { a0: 'inn', a1: 'pub', b0: 'items', b1: 'arms', b2: 'home' },
    npcs: [['hunter', 'sailor', 'frostpeak_hunter', 9, 12, 'r'], ['child', 'girl', 'frostpeak_child', 29, 12, 'l'], ['elder', 'elder', 'frostpeak_elder', 10, 21, 'd'], ['guard', 'guard', 'frostpeak_guard', 21, 27, 'u']] },
};
// who waits where to be asked along (only if they are not the hero you chose)
export const RECRUITS = {
  rion: ['valmont_hall', 10, 4, 'l'], lulu: ['valmont_pub', 7, 5, 'l'], mico: ['mistport_pub', 7, 5, 'l'], sela: ['grassea_home', 6, 3, 'l'],
  gusta: ['ironclaw_pub', 7, 5, 'l'], bass: ['ironclaw_pub', 3, 6, 'r'], fia: ['astralis_hall', 10, 4, 'l'], karon: ['saltreach', 21, 25, 'l'], tarin: ['dunehold_pub', 7, 5, 'l'],
};
function buildTown(id) {
  const T = TOWNS[id], Wd = 40, Hd = 30, ground = T.ground || '.', border = T.border || 'T';
  const b = canvasMap(Wd, Hd, ground);
  // the border, with a gap for the road out
  b.rect(0, 0, Wd, 2, border); b.rect(0, 0, 2, Hd, border); b.rect(Wd - 2, 0, 2, Hd, border); b.rect(0, Hd - 2, Wd, 2, border);
  for (let y = 2; y < Hd - 2; y++) for (const x of [2, Wd - 3]) if (hash(x, y, 9) > 0.55) b.set(x, y, border);
  const exitTop = !!T.harbour;
  if (T.harbour) { b.rect(0, 23, Wd, 1, ':'); b.rect(0, 24, Wd, 6, 'w'); b.rect(0, 27, Wd, 3, 'W'); b.rect(17, 24, 6, 4, 'k'); }
  // roads
  b.rect(19, exitTop ? 0 : 2, 2, exitTop ? 24 : Hd - 2, '='); if (!exitTop) b.rect(19, Hd - 2, 2, 2, '=');
  b.rect(3, 10, 34, 2, '='); b.rect(3, 20, 34, 1, '=');
  const ents = [];
  const door = (x, y, to, tx, ty) => ents.push({ ...warp(to, tx, ty, 'u'), x, y });
  const path = (x, y0, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) if (b.get(x, y) !== '=') b.set(x, y, '='); };
  const house = (x, y, w, roof, kind) => {
    b.rect(x, y, w, 2, roof); b.rect(x, y + 2, w, 2, 'H');
    b.set(x + 1, y + 2, 'N'); b.set(x + w - 2, y + 2, 'N');
    const dx = x + Math.floor(w / 2);
    b.set(dx, y + 3, 'D');
    if (kind === 'arms' || kind === 'items' || kind === 'magic') { b.set(x + 1, y + 3, 'h'); b.set(x + w - 2, y + 3, 'h'); }
    return dx;
  };
  // the castle or hall at the top
  if (T.castle) {
    b.rect(12, 2, 16, 3, T.castle); b.rect(12, 5, 16, 4, 'S');
    for (const x of [14, 17, 22, 25]) b.set(x, 6, 'V');
    b.set(19, 8, 'E'); b.set(20, 8, 'E');
    door(19, 8, id + '_hall', 7, 9); door(20, 8, id + '_hall', 7, 9);
  }
  for (const [key, kind] of Object.entries(T.slots)) {
    const row = key[0] === 'a' ? 4 : 14, i = +key[1];
    if (T.castle && row === 4 && (i === 1 || i === 2)) continue;
    const x = SLOT_X[i], roof = T.roofs || ROOF[kind];
    const dx = house(x, row, 6, roof, kind);
    path(dx, row + 4, row === 4 ? 10 : 20);
    if (kind === 'locked') ents.push({ type: 'solid', talk: 'lockedHouse', x: dx, y: row + 3 });
    else door(dx, row + 3, id + '_' + kind, 5, 7);
    T.doors = T.doors || {}; T.doors[kind] = [dx, row + 4];
  }
  // decoration
  b.set(23, 23 - (T.harbour ? 2 : 0), 'O');
  for (const [x, y] of [[18, 12], [21, 12], [18, 19], [21, 19]]) b.set(x, y, 'L');
  for (let k = 0; k < 40; k++) { const x = 3 + Math.floor(hash(k, 1, id.length) * 34), y = 3 + Math.floor(hash(k, 2, id.length) * 24); if (b.get(x, y) === ground && !(x >= 17 && x <= 22)) b.set(x, y, ground === '.' ? (k % 3 ? ',' : 'n') : ground === '*' ? (k % 4 ? '*' : 'P') : (k % 5 ? ground : 'o')); }
  // what makes each town itself
  const deco = (icon, x, y, extra = {}) => ents.push({ type: 'deco', icon, x, y, ...extra });
  if (id === 'grassea') { for (const [x, y] of [[7, 23], [12, 24], [27, 23], [32, 24], [9, 8], [33, 8]]) { b.set(x, y, '.'); deco('tent', x, y); } for (let k = 0; k < 30; k++) { const x = 3 + Math.floor(hash(k, 5) * 34), y = 22 + Math.floor(hash(k, 6) * 5); if (b.get(x, y) === '.') b.set(x, y, ';'); } }
  if (T.harbour) { deco('ship', 12, 26, { bob: true }); deco('ship', 28, 26, { bob: true }); }
  if (id === 'dunehold') { b.rect(26, 23, 6, 3, 'w'); for (const [x, y] of [[25, 22], [32, 22], [25, 26], [32, 26]]) b.set(x, y, 'T'); }
  if (id === 'astralis') { b.rect(6, 23, 7, 3, 'w'); deco('tower', 33, 25); }
  if (id === 'ironclaw') { for (const [x, y] of [[8, 22], [9, 22], [30, 22], [31, 23]]) b.set(x, y, 'x'); for (const [x, y] of [[10, 22], [29, 22]]) b.set(x, y, 'y'); }
  if (id === 'frostpeak') { for (let k = 0; k < 24; k++) { const x = 3 + Math.floor(hash(k, 8) * 34), y = 22 + Math.floor(hash(k, 9) * 5); if (b.get(x, y) === '*' && !(x >= 17 && x <= 22)) b.set(x, y, 'P'); } }
  // exits back to the world map
  for (const x of [19, 20]) ents.push({ ...warp(WORLD, 0, 0, 'd', { exit: true }), x, y: exitTop ? 0 : Hd - 1 });
  const m = grid(b.rows(), { x: { k: 'crate' }, y: { k: 'barrel' } }, { id, ents: [] });
  m.ents.push(...ents);
  const free = (x, y) => { const k = m.kindAt(x, y); return ['grass', 'flower', 'dirt', 'sand', 'snow', 'dock'].includes(k) && !m.ents.some((e) => e.x === x && e.y === y); };
  for (const [nid, sp, talk, x, y, dir] of T.npcs) {
    let nx = x, ny = y;
    for (let r = 0; r < 4 && !free(nx, ny); r++) { nx = x + r; if (free(nx, ny)) break; nx = x - r; }
    m.ents.push(npc(id + '_' + nid, sp, talk, { x: nx, y: ny, dir, wander: !nid.startsWith('guard') }));
  }
  for (const [hid, [map, x, y, dir]] of Object.entries(RECRUITS)) if (map === id) m.ents.push(npc('r_' + hid, hid, 'recruit_' + hid, { x, y, dir, cond: (f) => f.lead !== hid && !f[hid] && !f['gone_' + hid] }));
  m.entry = exitTop ? [19, 1, 'd'] : [19, Hd - 2, 'u'];
  m.tint = T.tint;
  return m;
}
// rooms inside a town: the door they came in by is where they leave
function interior(town, kind) {
  const T = TOWNS[town], back = (T.doors && T.doors[kind]) || [19, 12];
  const out = { ...warp(town, back[0], back[1], 'd') };
  const L = {};
  let rows, ents = [];
  if (kind === 'inn') { rows = ['IIIIIIIIIII', 'IIllIIIyIII', 'I______d_dI', 'Iccc___d_dI', 'I_________I', 'I_tt___d_dI', 'I______d_dI', 'I_rrr_____I', 'IIIII_IIIII']; ents.push(npc(town + '_innkeeper', 'merchant', 'inn', { x: 2, y: 2, dir: 'd' })); }
  else if (kind === 'pub') { rows = ['IIIIIIIIIII', 'IIlyIIIlyII', 'I_________I', 'Icccc_____I', 'I_____tt__I', 'I_tt______I', 'I______tt_I', 'I_________I', 'IIIII_IIIII']; ents.push(npc(town + '_barkeep', 'fisher', 'pub', { x: 2, y: 2, dir: 'd' })); }
  else if (kind === 'arms' || kind === 'items' || kind === 'magic') { rows = ['IIIIIIIIIII', 'Ill_IIIlllI', 'I_________I', 'Icccc_ccccI', 'I_________I', 'Iy_______pI', 'Iy__rrr__pI', 'I_________I', 'IIIII_IIIII']; ents.push(npc(town + '_' + kind + 'keeper', kind === 'magic' ? 'nun' : kind === 'arms' ? 'fisher' : 'merchant', kind, { x: 5, y: 2, dir: 'd' })); }
  else if (kind === 'hall') { rows = ['IIIIIIIIIIIIIII', 'IIIllIIAIIllIII', 'I______r______I', 'Ie_____r_____eI', 'I______r______I', 'Ie_____r_____eI', 'I______r______I', 'I______r______I', 'I______r______I', 'I______r______I', 'IIIIIII_IIIIIII']; ents.push(npc(town + '_lord', town === 'astralis' ? 'elder' : town === 'dunehold' ? 'merchant' : 'elder', town + '_lord', { x: 7, y: 2, dir: 'd' })); out.tx = 19; out.ty = 9; }
  else { rows = ['IIIIIIIII', 'IIlfIIlII', 'Id______I', 'Id__tt__I', 'I_______I', 'I_______I', 'IIII_IIII']; ents.push(npc(town + '_resident', town === 'grassea' ? 'elder' : town === 'mistport' ? 'girl' : town === 'saltreach' ? 'elder' : town === 'frostpeak' ? 'elder' : 'mom', town + '_' + kind, { x: 5, y: 3, dir: 'l' })); }
  const m = grid(rows, L, { id: town + '_' + kind });
  const exitX = rows[rows.length - 1].indexOf('_');
  m.ents.push(...ents, { ...out, x: exitX, y: rows.length - 1 });
  if (kind === 'pub' || kind === 'home' || kind === 'hall') for (const [hid, [map, x, y, dir]] of Object.entries(RECRUITS)) if (map === town + '_' + kind) m.ents.push(npc('r_' + hid, hid, 'recruit_' + hid, { x, y, dir, cond: (f) => f.lead !== hid && !f[hid] && !f['gone_' + hid] }));
  m.entry = [exitX, rows.length - 2, 'u'];
  return m;
}
for (const id of Object.keys(TOWNS)) {
  MAPS[id] = { name: TOWNS[id].name, music: 'town', safe: true, town: id, build: () => buildTown(id) };
  const kinds = new Set(Object.values(TOWNS[id].slots).filter((k) => k !== 'locked'));
  if (TOWNS[id].castle) kinds.add('hall');
  for (const k of kinds) MAPS[id + '_' + k] = { name: '', music: 'town', safe: true, town: id, build: () => interior(id, k) };
}

// ---------- dungeons ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const THEMES = {
  cave: { K: 'cwall', '.': 'cfloor', m: 'stal', '*': 'crystal', music: 'cave', bg: 'cave', dark: 0.5 },
  mine: { K: 'cwall', '.': 'cfloor', m: 'crate', '*': 'barrel', music: 'cave', bg: 'mine', dark: 0.55, tint: 'rgba(20,20,30,0.18)' },
  tower: { K: 'twall', '.': 'tfloor', m: 'tpillar', '*': 'tpillar', music: 'tower', bg: 'tower' },
  ship: { K: 'iwall', '.': 'floor', m: 'barrel', '*': 'crate', music: 'cave', bg: 'ship', tint: 'rgba(10,30,60,0.28)' },
  library: { K: 'iwall', '.': 'floor', m: 'shelf', '*': 'shelf', music: 'tower', bg: 'library', tint: 'rgba(40,20,60,0.16)' },
  temple: { K: 'twall', '.': 'tfloor', m: 'tpillar', '*': 'tpillar', music: 'tower', bg: 'desert', tint: 'rgba(200,130,40,0.2)' },
  ice: { K: 'twall', '.': 'tfloor', m: 'tpillar', '*': 'tpillar', music: 'cave', bg: 'ice', tint: 'rgba(150,200,255,0.22)' },
  gorge: { K: 'cliff', '.': 'grass', m: 'rock', '*': 'pine', music: 'cave', bg: 'forest' },
  sanctum: { K: 'twall', '.': 'tfloor', m: 'tpillar', '*': 'tpillar', music: 'tower', bg: 'sanctum', tint: 'rgba(60,50,90,0.2)' },
};
export const DUNGEONS = {
  aqueduct:   { name: '舊水道', theme: 'cave', seed: 11, rooms: 6, tier: 1, boss: { id: 'ooze', art: 'jelly', sat: 0.15, scale: 1, talk: 'boss_ooze', flag: 'b_ooze' }, chests: [{ id: 'aq1', item: 'herb', n: 2 }, { id: 'aq2', gold: 120 }, { id: 'aq3', item: 'broadsword' }] },
  seacave:    { name: '海蝕洞', theme: 'cave', seed: 23, rooms: 6, tier: 1, boss: { id: 'smuggler', art: 'brigand', scale: 0.8, talk: 'boss_smuggler', flag: 'b_smuggler' }, chests: [{ id: 'sc1', item: 'dirk' }, { id: 'sc2', gold: 150 }, { id: 'sc3', item: 'smoke', n: 2 }] },
  gorge:      { name: '風鳴峽谷', theme: 'gorge', seed: 37, rooms: 7, tier: 2, boss: { id: 'wolfking', art: 'wolfr', sat: 1.2, scale: 0.7, talk: 'boss_wolfking', flag: 'b_wolfking' }, chests: [{ id: 'go1', item: 'longbow' }, { id: 'go2', item: 'tonic', n: 2 }, { id: 'go3', gold: 260 }] },
  mines:      { name: '鐵爪廢礦', theme: 'mine', seed: 41, rooms: 8, tier: 3, boss: { id: 'morgan', art: 'knight', scale: 0.7, talk: 'boss_morgan', flag: 'b_morgan' }, chests: [{ id: 'mi1', item: 'battleaxe' }, { id: 'mi2', item: 'powerbelt' }, { id: 'mi3', item: 'hiherb', n: 2 }] },
  library:    { name: '沉沒書庫', theme: 'library', seed: 53, rooms: 8, tier: 3, need: 'libkey', boss: { id: 'ide', art: 'witch', scale: 0.7, talk: 'boss_ide', flag: 'b_ide' }, chests: [{ id: 'li1', item: 'sagestaff' }, { id: 'li2', item: 'ether', n: 3 }, { id: 'li3', item: 'sagering' }] },
  ghostship:  { name: '幽靈船', theme: 'ship', seed: 67, rooms: 7, tier: 4, boss: { id: 'captain', art: 'bones', hue: 180, scale: 1, talk: 'boss_captain', flag: 'b_captain' }, chests: [{ id: 'gh1', item: 'moonfang' }, { id: 'gh2', gold: 600 }, { id: 'gh3', item: 'lifewind' }] },
  sandtemple: { name: '沙之神殿', theme: 'temple', seed: 79, rooms: 9, tier: 4, need: 'sunseal', boss: { id: 'sandking', art: 'sandking', scale: 0.7, talk: 'boss_sandking', flag: 'b_sandking' }, chests: [{ id: 'sa1', item: 'skylance' }, { id: 'sa2', item: 'featherboots' }, { id: 'sa3', item: 'hiherb', n: 3 }] },
  icecorridor:{ name: '冰之迴廊', theme: 'ice', seed: 83, rooms: 9, tier: 5, boss: { id: 'frostqueen', art: 'witch', hue: 170, scale: 0.7, talk: 'boss_frostqueen', flag: 'b_frostqueen' }, chests: [{ id: 'ic1', item: 'galebow' }, { id: 'ic2', item: 'stormaxe' }, { id: 'ic3', item: 'lifewind' }] },
  sanctum:    { name: '止息聖域', theme: 'sanctum', seed: 97, rooms: 10, tier: 6, boss: { id: 'nul', art: 'nul', scale: 0.6, talk: 'boss_nul', flag: 'b_nul' }, chests: [{ id: 'sn1', item: 'windblade' }, { id: 'sn2', item: 'dragonfang' }, { id: 'sn3', item: 'windmail' }, { id: 'sn4', item: 'starstaff' }] },
};
function buildDungeon(id) {
  const D = DUNGEONS[id], th = THEMES[D.theme], R = rng(D.seed);
  const Wd = 44, Hd = 36, b = canvasMap(Wd, Hd, 'K');
  const ri = (a, c) => a + Math.floor(R() * (c - a + 1));
  // the boss room at the top, the entrance at the bottom, other rooms in between
  const rooms = [{ x: Wd / 2 - 5, y: 2, w: 11, h: 7, boss: true }];
  const entrance = { x: Wd / 2 - 3, y: Hd - 8, w: 7, h: 5 };
  rooms.push(entrance);
  for (let tries = 0; rooms.length < D.rooms + 2 && tries < 600; tries++) {
    const w = ri(5, 9), h = ri(4, 7), x = ri(2, Wd - w - 2), y = ri(10, Hd - h - 10);
    if (rooms.some((r) => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y)) continue;
    rooms.push({ x, y, w, h });
  }
  const mid = rooms.slice(2);
  // a chain from the entrance through the nearest rooms to the boss
  const chain = [entrance]; const left = [...mid];
  while (left.length) { const c = chain[chain.length - 1]; left.sort((a, r) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(r.x - c.x, r.y - c.y)); chain.push(left.shift()); }
  chain.push(rooms[0]);
  for (const r of rooms) b.rect(r.x, r.y, r.w, r.h, '.');
  const cx = (r) => r.x + Math.floor(r.w / 2), cy = (r) => r.y + Math.floor(r.h / 2);
  const dig = (a, c, wide) => {
    let x = cx(a), y = cy(a); const tx = cx(c), ty = cy(c), hfirst = R() < 0.5;
    const put = () => { b.set(x, y, '.'); if (wide) b.set(x + 1, y, '.'); };
    if (hfirst) { while (x !== tx) { put(); x += Math.sign(tx - x); } while (y !== ty) { put(); y += Math.sign(ty - y); } }
    else { while (y !== ty) { put(); y += Math.sign(ty - y); } while (x !== tx) { put(); x += Math.sign(tx - x); } }
    put();
  };
  for (let i = 0; i + 1 < chain.length; i++) dig(chain[i], chain[i + 1], R() < 0.3);
  for (let k = 0; k < 2; k++) { const a = mid[Math.floor(R() * mid.length)], c = mid[Math.floor(R() * mid.length)]; if (a && c && a !== c) dig(a, c, false); }
  // the way out at the bottom
  const ex = cx(entrance);
  for (let y = entrance.y + entrance.h; y < Hd; y++) b.set(ex, y, '.');
  b.set(ex, Hd - 1, 'X');
  // decoration in room corners, never in the middle of a path
  for (const r of mid) if (r.w >= 6 && r.h >= 5) for (const [x, y] of [[r.x, r.y], [r.x + r.w - 1, r.y + r.h - 1]]) if (R() < 0.7) b.set(x, y, R() < 0.5 ? 'm' : '*');
  const L = { K: th.K, '.': th['.'], m: th.m, '*': th['*'], X: { k: th['.'], e: warp(WORLD, 0, 0, 'd', { exit: true }) } };
  const m = grid(b.rows(), L, { id, name: D.name });
  // monsters, chests, crystals, the boss
  const floor = (x, y) => m.kindAt(x, y) === th['.'] && !m.ents.some((e) => e.x === x && e.y === y);
  const spot = (r) => { for (let k = 0; k < 30; k++) { const x = ri(r.x, r.x + r.w - 1), y = ri(r.y, r.y + r.h - 1); if (floor(x, y)) return [x, y]; } return null; };
  const groups = GROUPS[D.tier];
  mid.forEach((r, i) => {
    const n = r.w * r.h > 40 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const s = spot(r); if (!s) continue;
      const troop = groups[Math.floor(R() * groups.length)][1], lead = ENEMIES[troop[0]];
      m.ents.push({ type: 'enemy', n: i * 2 + k, troop, art: lead.art, hue: lead.hue || 0, sat: lead.sat || 1, x: s[0], y: s[1], hx: s[0], hy: s[1], range: 5, sight: 5 });
    }
  });
  D.chests.forEach((c, i) => { const r = mid[(i * 3 + 1) % mid.length] || entrance; const s = spot(r); if (s) m.ents.push({ type: 'chest', ...c, x: s[0], y: s[1] }); });
  { const s = spot(entrance); if (s) m.ents.push({ type: 'save', x: s[0], y: s[1] }); }
  { const r = chain[chain.length - 2]; const s = r && spot(r); if (s) m.ents.push({ type: 'save', x: s[0], y: s[1] }); }
  const boss = rooms[0], bx = cx(boss), by = boss.y + 2;
  m.ents.push({ type: 'boss', id: D.boss.id, art: D.boss.art, hue: D.boss.hue || 0, sat: D.boss.sat || 1, scale: D.boss.scale, talk: D.boss.talk, x: bx, y: by, cond: (f) => !f[D.boss.flag] });
  for (let x = boss.x; x < boss.x + boss.w; x++) m.ents.push({ type: 'trigger', run: D.boss.talk, x, y: boss.y + boss.h - 2, cond: (f) => !f[D.boss.flag] });
  m.entry = [ex, Hd - 2, 'u'];
  m.dark = th.dark; m.tint = th.tint; m.bg = th.bg;
  return m;
}
for (const id of Object.keys(DUNGEONS)) MAPS[id] = { name: DUNGEONS[id].name, music: THEMES[DUNGEONS[id].theme].music, dungeon: id, tier: DUNGEONS[id].tier, build: () => buildDungeon(id) };

// ---------- the world map ----------
// x, y in world tiles; tier is how strong the monsters are on the way there
export const PLACES = {
  valmont:    { x: 32, y: 30, icon: 'castle', tier: 1, kind: 'town' },
  aqueduct:   { x: 37, y: 34, icon: 'cave', tier: 1, kind: 'dungeon' },
  mistport:   { x: 12, y: 30, icon: 'town', tier: 1, kind: 'town' },
  seacave:    { x: 7, y: 37, icon: 'cave', tier: 1, kind: 'dungeon' },
  grassea:    { x: 49, y: 27, icon: 'tent', tier: 2, kind: 'town' },
  gorge:      { x: 55, y: 19, icon: 'cave', tier: 2, kind: 'dungeon', open: (S) => !S.flags.eastLost },
  ironclaw:   { x: 23, y: 14, icon: 'castle', tier: 2, kind: 'town' },
  mines:      { x: 17, y: 9, icon: 'cave', tier: 3, kind: 'dungeon' },
  astralis:   { x: 42, y: 18, icon: 'tower', tier: 2, kind: 'town' },
  library:    { x: 46, y: 13, icon: 'shrine', tier: 3, kind: 'dungeon' },
  saltreach:  { x: 27, y: 41, icon: 'town', tier: 2, kind: 'town' },
  ghostship:  { x: 16, y: 44, icon: 'ship', tier: 4, kind: 'dungeon', open: (S) => S.era >= 2 && !S.flags.b_captain },
  dunehold:   { x: 52, y: 40, icon: 'castle', tier: 3, kind: 'town' },
  sandtemple: { x: 59, y: 44, icon: 'shrine', tier: 4, kind: 'dungeon' },
  frostpeak:  { x: 41, y: 5, icon: 'town', tier: 4, kind: 'town', open: (S) => S.era >= 3 || S.lead === 'sela' && S.era >= 2 },
  icecorridor:{ x: 51, y: 4, icon: 'shrine', tier: 5, kind: 'dungeon', open: (S) => S.era >= 3 },
  sanctum:    { x: 33, y: 22, icon: 'tower', tier: 6, kind: 'dungeon', open: (S) => !!S.flags.sanctumOpen },
};
for (const [id, p] of Object.entries(PLACES)) p.id = id;
export const placeName = (id) => (MAPS[id] ? MAPS[id].name : id);

// ---------- English place names ----------
localize(MAPS, {
  valmont: ['Royal Valmont'], mistport: ['Mistport'], grassea: ['Grass Sea Camp'], ironclaw: ['Ironclaw Keep'], astralis: ['Astral Academy'],
  saltreach: ['Saltreach'], dunehold: ['Dunehold'], frostpeak: ['Frostpeak'],
  aqueduct: ['The Old Aqueduct'], seacave: ['Sea Cave'], gorge: ['Howling Gorge'], mines: ['Ironclaw Mines'], library: ['Sunken Library'],
  ghostship: ['The Ghost Ship'], sandtemple: ['Temple of Sand'], icecorridor: ['Ice Corridor'], sanctum: ['Sanctum of Stillness'],
}, ['name']);
localize(TOWNS, {
  valmont: ['Royal Valmont'], mistport: ['Mistport'], grassea: ['Grass Sea Camp'], ironclaw: ['Ironclaw Keep'], astralis: ['Astral Academy'],
  saltreach: ['Saltreach'], dunehold: ['Dunehold'], frostpeak: ['Frostpeak'],
}, ['name']);
localize(DUNGEONS, {
  aqueduct: ['The Old Aqueduct'], seacave: ['Sea Cave'], gorge: ['Howling Gorge'], mines: ['Ironclaw Mines'], library: ['Sunken Library'],
  ghostship: ['The Ghost Ship'], sandtemple: ['Temple of Sand'], icecorridor: ['Ice Corridor'], sanctum: ['Sanctum of Stillness'],
}, ['name']);
