// Boot, the main loop, the title screen (a Mode 7 flight over Aethra), choosing your hero, the world
// map, transitions, and the glue between the field, battles, menus and story scripts.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, tint } from './gfx.js';
import * as gfx from './gfx.js';
import { input, pollInput, endInput, setupTouch } from './input.js';
import { initAudio, playMusic, stopMusic, sfx } from './audio.js';
import { UI, uiTick, say, talk, ask, wait, menu, notice } from './ui.js';
import { S, reset, addItem, fullHeal, save, load, hasSave, stats, rejoin, MAX_PARTY, afterBattle } from './party.js';
import { GROUPS, HEROES, LEADS, ITEMS, STONES } from './data.js';
import { MAPS, PLACES, WORLD, DUNGEONS } from './maps.js';
import { F, setMaps, loadMap, updateField, drawField, walkEnt, walkPlayer, findEnt } from './field.js';
import { renderMap } from './tiles.js';
import { startBattle, updateBattle, drawBattle, _B } from './battle.js';
import { fieldMenu, shop, spellShop, loadSettings, partyMenu, statusMenu } from './menu.js';
import { openWorld, updateWorld, drawWorld, WorldHooks, worldKinds, worldState } from './worldmap.js';
import { SCRIPTS } from './story.js';
import { sprite } from './sprites.js';
import { L, LANG, isEn, setLang, onLang } from './i18n.js';

setMaps(MAPS);
function pageLang() {
  document.documentElement.lang = isEn() ? 'en' : 'zh-Hant';
  const mb = document.getElementById('menuBtn'); if (mb) mb.textContent = L('選單', 'MENU');
}
pageLang();
onLang(pageLang);
loadSettings();

let scene = 'boot';
const G = (window.G = { S, F, get scene() { return scene; }, SCRIPTS });

// ---------- transitions ----------
const T = { dark: 0, col: '#000', mosaic: 0, job: null };
function trans(kind, n = 16, col = '#000') { return new Promise((res) => { T.job = { kind, n, t: 0, res }; T.col = col; }); }
function updateTrans() {
  const j = T.job;
  if (!j) return;
  j.t++;
  const k = Math.min(1, j.t / j.n);
  if (j.kind === 'out') T.dark = Math.ceil(k * 15) / 15;
  if (j.kind === 'in') T.dark = Math.floor((1 - k) * 15) / 15;
  if (j.kind === 'battle') { T.mosaic = Math.floor(k * 12); T.dark = k > 0.6 ? (k - 0.6) / 0.4 : 0; T.flash = j.t < 12 && j.t % 4 < 2; }
  if (j.t >= j.n) { T.job = null; T.mosaic = 0; T.flash = false; if (j.kind === 'battle') T.dark = 1; j.res(); }
}
function drawTrans() {
  if (T.mosaic > 1) {
    const m = T.mosaic + 1, small = canvas(Math.ceil(W / m), Math.ceil(H / m));
    small.x.drawImage(ctx.canvas, 0, 0, small.width, small.height);
    ctx.drawImage(small, 0, 0, small.width * m, small.height * m);
  }
  if (T.flash) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (T.dark > 0) { ctx.globalAlpha = T.dark; ctx.fillStyle = T.col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (FX.flash > 0) { ctx.globalAlpha = Math.min(1, FX.flash / FX.flashN); ctx.fillStyle = FX.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
const FX = { flash: 0, flashN: 1, flashCol: '#fff' };

// ---------- the toolbox handed to story scripts ----------
const mapMusic = () => (F.def ? F.def.music : 'field');
const heldStones = () => STONES.filter((s) => S.inv[s]).length;
const E = {
  say, talk, ask, wait, sfx, notice, menu,
  music: (n) => (n ? playMusic(n) : stopMusic(0.6)),
  ent: (id) => findEnt(id),
  walk: (e, path, sp) => walkEnt(e, path, sp),
  walkPlayer,
  has: (id) => !!S.members.find((m) => m.id === id),
  get lead() { return S.lead; },
  get p() { return F.p; },
  give(id, n = 1) { addItem(id, n); },
  heal: fullHeal,
  save: () => save(0),
  async rest(msg, name = null) {
    await trans('out', 20);
    playMusic('inn', { restart: true });
    fullHeal();
    await wait(170);
    playMusic(mapMusic());
    await trans('in', 20);
    if (msg) await say(name, msg);
  },
  shop, spellShop, partyMenu,
  battle: (troop, opts) => runBattle(troop, opts),
  removeEnt(x) { const e = typeof x === 'string' ? findEnt(x) : x; if (e) e.gone = true; },
  spawn(e) { const o = { px: e.x * 16, py: e.y * 16, ...e }; F.ents.push(o); return o; },
  flash(col, n) { FX.flash = n; FX.flashN = n; FX.flashCol = col; },
  shake(n) { F.shake = n; },
  async warp(to, x, y, dir) { await warpTo(to, x, y, dir); },
  // places you hear of appear on the world map
  async reveal(...ids) {
    for (const id of ids) {
      if (S.known[id]) continue;
      S.known[id] = true;
      sfx('chest');
      await say(null, L(`得知了「${MAPS[id].name}」的位置！`, `You learned where ${MAPS[id].name} is!`));
    }
  },
  knows: (id) => !!S.known[id],
  // someone asks to come along
  async recruit(id, ent) {
    if (S.members.length >= MAX_PARTY) { await say(null, L('隊伍已經滿了。可以在酒館讓同伴暫時離隊。', 'Your party is full. You can have someone wait at a tavern.')); return false; }
    rejoin(id); S.flags[id] = true;
    if (ent) ent.gone = true;
    sfx('level');
    await say(null, L(`${HEROES[id].name}加入了隊伍！`, `${HEROES[id].name} joined the party!`));
    return true;
  },
  // a wind stone: the world moves on a little each time
  async stone(id) {
    if (S.inv[id]) return;
    addItem(id, 1); sfx('holy'); E.flash('#e0fff0', 30);
    await say(null, L(`得到了${ITEMS[id].name}！\n一陣溫柔的風吹了過來。`, `Got the ${ITEMS[id].name}!\nA gentle wind blows past.`));
    await E.advance();
  },
  async advance() {
    S.era++;
    if (S.era >= 4 && !S.flags.b_wolfking && !S.flags.eastLost) S.flags.eastLost = true;
    if (!S.flags.sanctumOpen && (heldStones() >= 5 || S.era >= 7)) {
      S.flags.sanctumOpen = true; S.known.sanctum = true;
      E.shake(40); sfx('quake');
      await say(null, L('大地傳來低沉的震動……\n大陸中央的湖面上，升起了一座灰色的島。', 'A low tremor runs through the earth...\nIn the lake at the heart of the land, a grey island has risen.'));
    }
  },
  get era() { return S.era; },
  stones: heldStones,
  nulScale: () => 1 + 0.12 * (8 - heldStones()),
  ending: () => ending(),
  async toWorld() { await toWorld(); },
};
F.E = E;
F.runScript = async (name, ent) => {
  const fn = SCRIPTS[name];
  if (!fn) { console.warn('no script', name); return; }
  F.busy = true;
  try { await fn(E, ent); } catch (err) { console.error(err); }
  F.busy = false;
};
F.onWarp = async (w) => {
  F.busy = true;
  if (w.to === WORLD) { sfx('door'); await toWorld(); F.busy = false; return; }
  sfx('door');
  await warpTo(w.to, w.tx, w.ty, w.dir);
  F.busy = false;
};
F.onMenu = async () => {
  F.busy = true; sfx('ok');
  await fieldMenu({ canSave: !!F.def.safe });
  F.busy = false;
};
F.onTouchEnemy = async (foe) => {
  F.busy = true;
  const r = await runBattle(foe.troop, { bg: F.map.bg || 'cave' });
  if (r === 'win') foe.gone = true;
  else { foe.stun = 4; }
  F.busy = false;
};
F.onStep = () => {
  if (S.steps % 4 === 0) for (const m of S.members) if (m.status.poison && m.hp > 1) { m.hp--; FX.flash = 3; FX.flashN = 6; FX.flashCol = '#a040c0'; }
};

async function warpTo(to, x, y, dir) {
  await trans('out', 14);
  const def = MAPS[to];
  if (x === undefined || x === null) { const m = def.build(); [x, y, dir] = m.entry; }
  loadMap(to, x, y, dir);
  if (F.map.tint) F.map.tint = F.map.tint;
  playMusic(mapMusic());
  await trans('in', 14);
}
async function toWorld() {
  await trans('out', 14);
  scene = 'map';
  openWorld(S.loc);
  playMusic('field');
  await trans('in', 14);
}
// arriving somewhere from the world map
async function enterPlace(id) {
  const P = PLACES[id], D = DUNGEONS[id];
  if (D && D.need && !S.inv[D.need]) {
    await say(null, D.need === 'libkey' ? L('沉沒書庫的門緊緊鎖著。需要學院的鑰匙。', 'The door of the Sunken Library is locked. It needs the academy\'s key.') : L('神殿的門上刻著太陽的紋樣。沒有通行證進不去。', 'A sun is carved on the temple door. You cannot enter without a pass.'));
    return;
  }
  S.loc = id;
  await trans('out', 14);
  scene = 'field';
  const m = MAPS[id].build();
  loadMap(id, m.entry[0], m.entry[1], m.entry[2]);
  playMusic(mapMusic());
  await trans('in', 14);
  if (SCRIPTS['enter_' + id]) F.runScript('enter_' + id);
  void P;
}
WorldHooks.enter = (id) => enterPlace(id);
WorldHooks.ambush = async (tier) => {
  const table = GROUPS[tier], total = table.reduce((s, [w]) => s + w, 0);
  let r = Math.random() * total, troop = table[0][1];
  for (const [w, t] of table) { r -= w; if (r <= 0) { troop = t; break; } }
  const at = PLACES[worldState.travel ? worldState.travel.to : S.loc];
  const bg = at.y < 10 ? 'snow' : at.x > 46 && at.y > 33 ? 'desert' : at.kind === 'dungeon' && at.icon === 'ship' ? 'shore' : 'field';
  return runBattle(troop, { bg, back: 'map' });
};
WorldHooks.menu = async () => { sfx('ok'); await fieldMenu({ canSave: true }); };

async function runBattle(troop, opts = {}) {
  sfx('encounter');
  stopMusic();
  const back = opts.back || 'field';
  await trans('battle', 36);
  scene = 'battle';
  T.dark = 0;
  const r = await startBattle(troop, opts);
  const lead = S.members.find((m) => m.id === S.lead);
  if (r === 'lose' || !lead || lead.lp <= 0) { afterBattle(); gameOver(); return new Promise(() => {}); }
  scene = back;
  T.dark = 1;
  playMusic(back === 'map' ? 'field' : mapMusic(), { restart: true });
  await trans('in', 16);
  return r;
}

// ---------- title ----------
let worldTex = null;
function buildTitle() {
  const k = worldKinds({});
  const kinds = [], idx = {}, g = [];
  for (let y = 0; y < k.length; y++) for (let x = 0; x < k[0].length; x++) { const t = k[y][x]; if (idx[t] === undefined) { idx[t] = kinds.length; kinds.push(t); } g.push(idx[t]); }
  const m = { w: k[0].length, h: k.length, kinds, tile: (x, y) => g[y * k[0].length + x] };
  const r = renderMap(m);
  worldTex = r.frames.map((c) => ({ w: c.width, h: c.height, d: new Uint32Array(c.x.getImageData(0, 0, c.width, c.height).data.buffer) }));
}
const m7 = canvas(W, H);
const m7img = m7.x.createImageData(W, H), m7d = new Uint32Array(m7img.data.buffer);
function mode7(camX, camY, ang, horizon, frame) {
  const tex = worldTex[Math.floor(frame / 20) % worldTex.length];
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = horizon + 1; y < H; y++) {
    const dist = 5200 / (y - horizon), fog = Math.min(1, dist / 2600), rx = camX + ca * dist, ry = camY + sa * dist, span = dist * 0.9;
    for (let x = 0; x < W; x++) {
      const o = (x - W / 2) / (W / 2) * span, tx = Math.floor(rx - sa * o), ty = Math.floor(ry + ca * o);
      let c = tx >= 0 && ty >= 0 && tx < tex.w && ty < tex.h ? tex.d[ty * tex.w + tx] : tex.d[(((ty % 64) + 64) % 64) * tex.w + (((tx % 64) + 64) % 64)];
      if (fog > 0.35) { const f = (fog - 0.35) / 0.65, r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255; c = 0xff000000 | (Math.round(b + (240 - b) * f) << 16) | (Math.round(g + (200 - g) * f) << 8) | Math.round(r + (168 - r) * f); }
      m7d[y * W + x] = c;
    }
  }
  m7.x.putImageData(m7img, 0, 0, 0, horizon + 1, W, H - horizon - 1);
  return m7;
}
function bigText(s, x, y, top, bot, scale = 2) {
  const w = textW(s) + 4, c = canvas(w, 16);
  c.x.drawImage(gfx.glyphs(s, '#ffffff'), 1, 0);
  const id = c.x.getImageData(0, 0, w, 16), d = id.data;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < w; xx++) { const i = (yy * w + xx) * 4; if (d[i + 3] > 110) { const t = yy / 14; d[i] = top[0] + (bot[0] - top[0]) * t; d[i + 1] = top[1] + (bot[1] - top[1]) * t; d[i + 2] = top[2] + (bot[2] - top[2]) * t; d[i + 3] = 255; } else d[i + 3] = 0; }
  c.x.putImageData(id, 0, 0);
  const o = canvas(w + 2, 18);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2], [2, 2]]) o.x.drawImage(tint(c, '#101030'), dx, dy);
  o.x.drawImage(c, 1, 1);
  ctx.drawImage(o, Math.round(x - (o.width * scale) / 2), y, o.width * scale, o.height * scale);
}
const title = { t: 0, sel: 0, ready: false };
const titleOpts = () => [{ id: 'new', label: L('新的冒險', 'New Game') }, { id: 'cont', label: L('繼續冒險', 'Continue'), disabled: !hasSave(0) }, { id: 'lang', label: LANG === 'en' ? 'Language: English' : '語言：中文' }];
function updateTitle() {
  title.t++;
  if (!title.ready) { if (input.anyPressed()) { title.ready = true; sfx('ok'); } return; }
  if (UI.active || T.job) return;
  const opts = titleOpts();
  if (input.repeat('down')) { title.sel = (title.sel + 1) % opts.length; sfx('cursor'); }
  if (input.repeat('up')) { title.sel = (title.sel + opts.length - 1) % opts.length; sfx('cursor'); }
  if (input.pressed('a')) {
    if (opts[title.sel].disabled) { sfx('buzz'); return; }
    sfx('ok');
    if (opts[title.sel].id === 'new') toSelect();
    else if (opts[title.sel].id === 'lang') setLang(LANG === 'en' ? 'zh' : 'en');
    else continueGame();
  }
  if (input.pressed('b')) title.ready = false;
}
function drawTitle() {
  const t = title.t, horizon = 84;
  for (let y = 0; y <= horizon; y++) { const k = Math.floor((y / horizon) * 10) / 10; ctx.fillStyle = `rgb(${40 + k * 170},${60 + k * 150},${110 + k * 120})`; ctx.fillRect(0, y, W, 1); }
  // wind streaks across the sky
  for (let i = 0; i < 9; i++) { const x = ((i * 61 + t * (0.8 + (i % 3) * 0.4)) % 320) - 40, y = 10 + (i * 23) % 64; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(Math.round(x), y, 24 + (i % 4) * 8, 1); ctx.fillRect(Math.round(x) + 8, y + 2, 12, 1); }
  const ang = -Math.PI / 2 + Math.sin(t / 900) * 0.35, cx = 512 + Math.cos(t / 700) * 120, cy = 760 - (t * 0.3) % 600;
  ctx.drawImage(mode7(cx, cy, ang, horizon, t), 0, 0);
  if (isEn()) {
    bigText('SAGA OF A', W / 2, 10, [255, 248, 200], [240, 160, 48], 2);
    bigText('THOUSAND WINDS', W / 2, 40, [210, 248, 230], [80, 180, 140], 2);
    text('千風群英譚', W / 2, 92, '#e0f0ff', { align: 'center', shadow: '#101030' });
  } else {
    bigText('千風群英譚', W / 2, 22, [255, 248, 200], [240, 160, 48], 3);
    text('SAGA OF A THOUSAND WINDS', W / 2, 78, '#e0f0ff', { align: 'center', shadow: '#101030' });
  }
  if (!title.ready) {
    if ((t >> 5) % 2) text('PRESS START', W / 2, 170, '#ffffff', { align: 'center' });
    text(L('Z 決定　X 取消／選單　方向鍵 移動', 'Z: OK   X: Cancel/Menu   Arrows: Move'), W / 2, 190, '#e8f0ff', { align: 'center', shadow: '#101030' });
  } else {
    const opts = titleOpts();
    windowBox(66, 136, 124, 64);
    opts.forEach((o, i) => text(o.label, 90, 144 + i * 18, o.disabled ? '#8088a8' : '#f8f8f8'));
    ctx.drawImage(HAND, 74 + ((t >> 3) % 2), 145 + title.sel * 18);
  }
  text(L('© 2026 原創作品', '© 2026 An original game'), W / 2, H - 16, '#e8f0ff', { align: 'center', shadow: '#101030' });
}

// ---------- choosing a hero ----------
const BLURB = {
  rion: ['瓦爾蒙王國的見習騎士。正直、不服輸。七年前，他的哥哥在一場瘟疫後離開了王都，從此沒有消息。', "A squire of Valmont: honest and stubborn. Seven years ago his brother left the capital after a plague and was never heard from again."],
  sela: ['在草海上隨風遷徙的遊牧民族之女，箭術一流。她相信風會告訴她該往哪裡去。', 'A daughter of the nomads who follow the wind across the Grass Sea, and a superb archer. She believes the wind tells her where to go.'],
  gusta: ['在鐵爪堡混飯吃的傭兵。嘴巴壞、心腸軟，最討厭的就是「沒辦法」這三個字。', 'A mercenary scraping a living at Ironclaw Keep. Rough tongue, soft heart, and he hates the words "nothing can be done".'],
  mico: ['霧港的小偷少年。偷東西是為了生病的妹妹皮姆。她得了一種身體慢慢「停下來」的怪病。', 'A young thief of Mistport. He steals for his sister Pim, who has a strange illness that is slowly making her body stop.'],
  fia: ['星塔學院的見習魔導士，好奇心比魔力還強。她的老師伊黛最近總是心不在焉。', "An apprentice at the Astral Academy whose curiosity outshines her magic. Lately her teacher, Ide, has seemed far away."],
  karon: ['鹽岬港的老船長，人稱「不沉的卡隆」。二十年前，他在無風的海上失去了最好的朋友。', 'The old captain of Saltreach they call "Karon the Unsinkable". Twenty years ago, on a windless sea, he lost his best friend.'],
};
const sel = { i: 0, t: 0 };
async function toSelect() { await trans('out', 20); scene = 'select'; sel.i = 0; sel.t = 0; T.dark = 0; }
function updateSelect() {
  sel.t++;
  if (T.job || UI.active) return;
  if (input.repeat('right') || input.repeat('down')) { sel.i = (sel.i + 1) % LEADS.length; sfx('cursor'); }
  if (input.repeat('left') || input.repeat('up')) { sel.i = (sel.i + LEADS.length - 1) % LEADS.length; sfx('cursor'); }
  if (input.pressed('b')) { sfx('cancel'); (async () => { await trans('out', 14); scene = 'title'; await trans('in', 14); })(); }
  if (input.pressed('a')) {
    sfx('ok');
    (async () => {
      const id = LEADS[sel.i];
      const r = await ask(null, L(`要以${HEROES[id].name}的身分展開冒險嗎？`, `Begin your story as ${HEROES[id].name}?`), [L('出發', 'Begin'), L('再想想', 'Not yet')]);
      if (r === 0) newGame(id);
    })();
  }
}
function drawSelect() {
  ctx.fillStyle = '#101830'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { const x = ((i * 47 + sel.t * (0.6 + (i % 3) * 0.3)) % 300) - 30, y = 8 + (i * 19) % 200; ctx.fillStyle = 'rgba(160,200,255,0.18)'; ctx.fillRect(Math.round(x), y, 30, 1); }
  text(L('選擇你的主角', 'Choose your hero'), W / 2, 8, '#f8e070', { align: 'center' });
  LEADS.forEach((id, i) => {
    const x = 18 + i * 38, y = 30, on = i === sel.i;
    windowBox(x - 4, y - 2, 34, 42);
    const fr = sprite(id).d[on ? Math.floor(sel.t / 8) % 4 : 0];
    ctx.drawImage(fr, x + 5, y + 8);
    if (on) ctx.drawImage(HAND, x + 6, y + 44 + ((sel.t >> 3) % 2));
  });
  const id = LEADS[sel.i], H0 = HEROES[id];
  windowBox(6, 92, W - 12, 126);
  text(`${H0.name}　${H0.title}`, 16, 100, '#f8e070');
  const lines = wrapText(L(BLURB[id][0], BLURB[id][1]), W - 34);
  lines.slice(0, 4).forEach((l, i) => text(l, 16, 118 + i * 15));
  const sk = Object.entries(H0.skills).map(([k]) => k);
  text(L('擅長：', 'Skills: ') + sk.map((k) => L(['劍', '大劍', '斧', '槍', '弓', '短劍', '體術', '杖', '火', '水', '風', '地', '光', '闇'][['sword', 'great', 'axe', 'spear', 'bow', 'dagger', 'fist', 'staff', 'fire', 'water', 'wind', 'earth', 'light', 'dark'].indexOf(k)], ({ sword: 'sword', great: 'greatsword', axe: 'axe', spear: 'spear', bow: 'bow', dagger: 'dagger', fist: 'martial', staff: 'staff', fire: 'fire', water: 'water', wind: 'wind', earth: 'earth', light: 'light', dark: 'dark' })[k])).join(L('、', ', ')), 16, 182, '#a0c0f8');
  text(L(`出身：${MAPS[H0.home].name}`, `Home: ${MAPS[H0.home].name}`), 16, 198, '#a0c0f8');
}
import { wrap as wrapText } from './ui.js';

// ---------- a new story ----------
const PROLOGUE = {
  zh: ['在艾瑟蘭大陸，', '千萬道風吹過山野與海洋，', '帶來季節、帶走時間、守護著記憶。', '', '一千年前，止息之神涅爾', '想讓所有的風停下，讓世界永遠靜止。', '八位風之精靈化為「風之石」，', '將祂封印在大陸的中心。', '', '如今，風一天比一天微弱了。'],
  en: ['On the continent of Aethra,', 'a thousand winds blow over land and sea.', 'They bring the seasons, carry time away', 'and keep the memories of the world.', '', 'A thousand years ago, Nul, God of Stillness,', 'tried to stop every wind and freeze the world.', 'Eight wind spirits became the Wind Stones', 'and sealed him at the heart of the land.', '', 'Now, day by day, the winds grow weaker.'],
};
const intro = { t: 0, lead: 'rion' };
async function newGame(lead) {
  await trans('out', 30);
  reset(lead);
  S.flags.lead = lead;
  const home = HEROES[lead].home;
  for (const id of [home, 'valmont']) S.known[id] = true;
  scene = 'intro'; intro.t = 0; intro.lead = lead;
  T.dark = 0;
  playMusic('title', { restart: true });
}
function updateIntro() {
  intro.t++;
  const lines = isEn() ? PROLOGUE.en : PROLOGUE.zh;
  const done = intro.t > lines.length * 50 + 200;
  if ((input.pressed('a') || input.pressed('b') || done) && !T.job && !intro.leaving) {
    intro.leaving = true;
    (async () => {
      await trans('out', 30);
      intro.leaving = false;
      scene = 'field';
      const home = HEROES[intro.lead].home, m = MAPS[home].build();
      S.loc = home;
      loadMap(home, m.entry[0], m.entry[1] - 1, m.entry[2]);
      playMusic('town');
      await trans('in', 30);
      F.runScript('prologue_' + intro.lead);
    })();
  }
}
function drawIntro() {
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const x = ((i * 47 + intro.t * (0.5 + (i % 3) * 0.3)) % 300) - 30, y = 8 + (i * 17) % 210; ctx.fillStyle = 'rgba(160,200,255,0.16)'; ctx.fillRect(Math.round(x), y, 30, 1); }
  const lines = isEn() ? PROLOGUE.en : PROLOGUE.zh;
  lines.forEach((l, i) => {
    const a = Math.max(0, Math.min(1, (intro.t - i * 50) / 40));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    text(l, W / 2, 20 + i * 17, '#e8e8f8', { align: 'center' });
  });
  ctx.globalAlpha = 1;
}

// ---------- continue / game over ----------
async function continueGame() {
  await trans('out', 20);
  if (!load(0)) { await trans('in', 10); return; }
  if (S.map === WORLD) { scene = 'map'; openWorld(S.loc); playMusic('field'); }
  else { scene = 'field'; loadMap(S.map, S.x, S.y, S.dir); playMusic(mapMusic()); }
  await trans('in', 20);
}
const over = { t: 0 };
function gameOver() {
  scene = 'over'; over.t = 0; T.dark = 0; UI.clear(); F.busy = false;
  playMusic('gameover', { restart: true });
}
function updateOver() {
  over.t++;
  if (over.t > 90 && input.pressed('a') && !T.job) {
    (async () => { await trans('out', 30); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 30); })();
  }
}
function drawOver() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = Math.min(1, over.t / 60);
  bigText('GAME OVER', W / 2, 80, [248, 96, 96], [160, 24, 40], 2);
  text(L('風，停了……', 'The wind has stopped...'), W / 2, 130, '#c0c0d0', { align: 'center' });
  if (over.t > 90 && (over.t >> 5) % 2) text(L('按 Z 回到標題畫面', 'Press Z to return to the title'), W / 2, 170, '#f8f8f8', { align: 'center' });
  ctx.globalAlpha = 1;
}

// ---------- ending ----------
async function ending() {
  await trans('out', 60, '#ffffff');
  T.col = '#ffffff';
  const home = HEROES[S.lead].home, m = MAPS[home].build();
  loadMap(home, 19, 13, 'd');
  F.banner = 0;
  playMusic('ending', { restart: true });
  await trans('in', 60, '#ffffff');
  T.col = '#000';
  await wait(30);
  F.busy = true;
  try { await SCRIPTS.epilogue(E); } catch (err) { console.error(err); }
  F.busy = false;
  await wait(40);
  await trans('out', 60);
  scene = 'credits'; credits.t = 0;
  playMusic('ending', { restart: true });
  T.dark = 0;
  save(1);
  void m;
}
const CREDITS_ZH = [
  ['千風群英譚', 'big'], [''], ['SAGA OF A THOUSAND WINDS'], [''], [''],
  ['— 群英 —', 'y'], ['利恩　瓦爾蒙的見習騎士'], ['賽菈　草海的獵人'], ['古斯塔　鐵爪堡的傭兵'], ['米可　霧港的小偷'], ['妃雅　星塔學院的見習魔導士'], ['卡隆　鹽岬港的老船長'], ['巴斯　露露　塔林'], [''],
  ['— 止息的使徒 —', 'y'], ['灰燼騎士 摩根'], ['靜默女巫 伊黛'], ['沙之王 拉赫'], ['冰后 雪蘿'], [''], ['止息之神 涅爾'], [''], [''],
  ['故事、畫面、音樂'], ['全部以程式碼繪製與合成'], [''], ['怪物圖像 (CC-BY 3.0)'], ['Charles Gabriel (Antifarea)'], ['Stephen "Redshrike" Challener'], ['OpenGameArt.org'], [''], ['字型：俐方體11號 (Cubic 11)'], [''], [''],
  ['風會一直吹下去。'], ['帶著季節，帶著時間，'], ['也帶著你走過的每一段路。'], [''], [''],
  ['感謝你的遊玩！', 'y'], [''], [''], ['—— 完 ——', 'big'],
];
const CREDITS_EN = [
  ['SAGA OF A', 'big'], [''], ['THOUSAND WINDS', 'big'], [''], ['千風群英譚'], [''], [''],
  ['- THE HEROES -', 'y'], ['Rion - squire of Valmont'], ['Sela - huntress of the Grass Sea'], ['Gusta - mercenary of Ironclaw'], ['Mico - thief of Mistport'], ['Fia - apprentice of the Academy'], ['Karon - old captain of Saltreach'], ['Bass   Lulu   Tarin'], [''],
  ['- THE APOSTLES OF STILLNESS -', 'y'], ['Morgan the Ash Knight'], ['Ide the Silent Witch'], ['Rah the Sand King'], ['Sirol the Frost Queen'], [''], ['Nul, God of Stillness'], [''], [''],
  ['Story, art and music'], ['all made in code'], [''], ['Monster sprites (CC-BY 3.0)'], ['Charles Gabriel (Antifarea)'], ['Stephen "Redshrike" Challener'], ['hosted by OpenGameArt.org'], [''], ['Font: Cubic 11'], [''], [''],
  ['The wind will keep on blowing,'], ['carrying the seasons and the years,'], ['and every road you walked.'], [''], [''],
  ['THANK YOU FOR PLAYING!', 'y'], [''], [''], ['THE END', 'big'],
];
const creditList = () => (isEn() ? CREDITS_EN : CREDITS_ZH);
const credits = { t: 0 };
function updateCredits() {
  credits.t++;
  const end = creditList().length * 18 * 2 + H * 2;
  if ((credits.t > end && input.pressed('a')) && !T.job) {
    (async () => { await trans('out', 40); scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 40); })();
  }
}
function drawCredits() {
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, W, H);
  const y0 = H - credits.t / 2, list = creditList();
  list.forEach(([s, k], i) => {
    let y = y0 + i * 18;
    if (k === 'big' && i === list.length - 1) y = Math.max(y, 90);
    if (y < -20 || y > H) return;
    if (k === 'big') bigText(s, W / 2, y - 6, [255, 248, 200], [240, 160, 48], 2);
    else text(s, W / 2, y, k === 'y' ? '#f8e070' : '#e8e8f8', { align: 'center' });
  });
  ctx.fillStyle = '#386838'; ctx.fillRect(0, H - 22, W, 22);
  S.members.forEach((m, i) => { const fr = sprite(m.id).r[Math.floor(credits.t / 8) % 4]; ctx.drawImage(fr, ((credits.t * 0.5 + 40 - i * 20) % (W + 80)) - 40, H - 34); });
}

// ---------- the loop ----------
let acc = 0, last = performance.now();
function step() {
  pollInput();
  uiTick();
  updateTrans();
  if (FX.flash > 0) FX.flash--;
  if (scene === 'field' || scene === 'battle' || scene === 'map') S.time++;
  if (UI.active) UI.update();
  switch (scene) {
    case 'title': updateTitle(); break;
    case 'select': updateSelect(); break;
    case 'intro': updateIntro(); break;
    case 'field': if (!T.job) updateField(); else F.frame++; break;
    case 'map': if (!T.job && !UI.active) updateWorld(); break;
    case 'battle': updateBattle(); break;
    case 'over': updateOver(); break;
    case 'credits': updateCredits(); break;
  }
  if (scene === 'map') S.map = WORLD;
  endInput();
}
function draw() {
  switch (scene) {
    case 'boot': ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('Loading…', W / 2, H / 2 - 6, '#fff', { align: 'center' }); break;
    case 'title': drawTitle(); break;
    case 'select': drawSelect(); break;
    case 'intro': drawIntro(); break;
    case 'field': drawField(); break;
    case 'map': drawWorld(); break;
    case 'battle': drawBattle(); break;
    case 'over': drawOver(); break;
    case 'credits': drawCredits(); break;
  }
  UI.draw();
  drawTrans();
}
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  while (acc >= 1000 / 60 && n < 4) { step(); acc -= 1000 / 60; n++; }
  if (n) { draw(); if (gfx.present) gfx.present(!document.body.classList.contains('noscan')); }
  requestAnimationFrame(frame);
}
const unlock = () => initAudio();
addEventListener('keydown', unlock); addEventListener('pointerdown', unlock); addEventListener('touchstart', unlock);
async function boot() {
  try { await document.fonts.load('12px Cubic11'); } catch (e) { /* fall back */ }
  await new Promise((r) => setTimeout(r, 30));
  buildTitle();
  setupTouch();
  scene = 'title';
  playMusic('title');
  window.READY = 1;
}
requestAnimationFrame(frame);
boot();

// debugging hooks for automated checks
G.T = T; G._B = _B; G.UI = UI; G.E = E; G.stats = stats; G.trans = trans; G.runBattle = runBattle; G.enterPlace = enterPlace; G.toWorld = toWorld;
G.newGame = newGame; G.statusMenu = statusMenu;
G.go = (map, x, y) => { scene = 'field'; T.dark = 0; const m = MAPS[map].build(); loadMap(map, x === undefined ? m.entry[0] : x, y === undefined ? m.entry[1] : y, 'u'); playMusic(MAPS[map].music); };
G.world = (at) => { scene = 'map'; T.dark = 0; openWorld(at || S.loc); };
void menu; void notice; void talk;
