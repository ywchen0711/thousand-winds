// Turn-based battles in the 16-bit style: monsters face you over a painted backdrop, the party stands
// in front with their status windows, everyone picks a command and the round plays out. Weapons give
// techniques that cost WP, spells cost JP, and attacking can spark an inspiration: a new technique
// learned on the spot. Falling in battle costs LP; with none left a hero is gone for good.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, HAND_D, tint, bar, ramp, hash, bayer, snes, hex, rgb } from './gfx.js';
import { sprite } from './sprites.js';
import { fine } from './gfx.js';
import { enemyArt, bossArt } from './enemies.js';
import { ENEMIES, TECHS, SPELLS, ARTS, ITEMS, HEROES, kindName } from './data.js';
import { L, isEn } from './i18n.js';
import { S, stats, weaponsOf, grow, addItem, count, afterBattle } from './party.js';
import { physical, magic, healAmount, foeAction, weaponAtk, spellPow, glimmerChance } from './rules.js';
import { input } from './input.js';
import { sfx, playMusic } from './audio.js';
import { UI, menu, uiTick, wrap, fit } from './ui.js';

let B = null;
export const isBattle = () => !!B;

// ---------- backdrops ----------
const bgCache = {};
function backdrop(kind) {
  if (bgCache[kind]) return bgCache[kind];
  const c = canvas(W, 164), g = c.x;
  const band = (y0, y1, top, bot, steps = 8) => { for (let y = y0; y < y1; y++) { const t = Math.floor(((y - y0) / (y1 - y0)) * steps) / (steps - 1); g.fillStyle = snes(hex(rgb(top).map((v, i) => v + (rgb(bot)[i] - v) * t))); g.fillRect(0, y, W, 1); } };
  const clouds = (n, col = '#f8f8ff', sh = '#c8d8f0') => { for (let k = 0; k < n; k++) { const cx = hash(k, 1) * W, cy = 14 + hash(k, 2) * 40, r = 8 + hash(k, 3) * 10; for (let j = 0; j < 4; j++) { g.fillStyle = j ? col : sh; g.beginPath(); g.ellipse(cx + j * r * 0.7 - r, cy - (j % 2) * 3, r, r * 0.55, 0, 0, Math.PI * 2); g.fill(); } } };
  const ridge = (y, amp, f, col, off = 0) => { g.fillStyle = col; for (let x = 0; x < W; x++) { const h = amp + Math.sin(x * f + off) * amp * 0.5 + Math.sin(x * f * 2.7 + off * 2) * amp * 0.3; g.fillRect(x, y - h, 1, h + 4); } };
  if (kind === 'field' || kind === 'shore') {
    band(0, 80, '#2850c8', '#a8d0f8', 10);
    clouds(7);
    if (kind === 'shore') {
      band(80, 104, '#2858b8', '#4888d8', 4);
      for (let k = 0; k < 40; k++) { g.fillStyle = '#a8d0f8'; g.fillRect(Math.floor(hash(k, 7) * W), 82 + Math.floor(hash(k, 8) * 20), 4 + Math.floor(hash(k, 9) * 6), 1); }
      band(104, 164, '#e8d098', '#b89058', 6);
      for (let k = 0; k < 120; k++) { g.fillStyle = hash(k, 3) > 0.5 ? '#f8e8b8' : '#a08050'; g.fillRect(Math.floor(hash(k, 4) * W), 104 + Math.floor(hash(k, 5) * 60), 1, 1); }
    } else {
      ridge(80, 14, 0.03, '#5878a8'); ridge(88, 7, 0.05, '#3c7840', 2);
      band(88, 164, '#58a848', '#2f7838', 6);
      for (let k = 0; k < 160; k++) { const x = Math.floor(hash(k, 4) * W), y = 92 + Math.floor(hash(k, 5) * 70); g.fillStyle = '#78c060'; g.fillRect(x, y, 1, 1); g.fillRect(x + 2, y, 1, 1); g.fillStyle = '#286028'; g.fillRect(x + 1, y + 1, 1, 1); }
    }
  } else if (kind === 'desert') {
    band(0, 84, '#d86830', '#f8d090', 10);
    g.fillStyle = '#fff0c0'; g.beginPath(); g.arc(196, 30, 12, 0, Math.PI * 2); g.fill();
    ridge(84, 12, 0.02, '#c08050'); ridge(92, 8, 0.035, '#d8a060', 1.5);
    band(92, 164, '#e8c078', '#b07840', 6);
    for (let y = 96; y < 164; y += 7) { g.fillStyle = 'rgba(160,100,50,0.5)'; for (let x = 0; x < W; x++) if (Math.sin(x * 0.06 + y * 0.4) > 0.6) g.fillRect(x, y + Math.round(Math.sin(x * 0.03 + y) * 2), 1, 1); }
  } else if (kind === 'snow') {
    band(0, 84, '#6878a8', '#d8e0f0', 10);
    ridge(84, 18, 0.025, '#a8b8d8'); ridge(92, 9, 0.045, '#e0e8f8', 3);
    band(92, 164, '#f0f4ff', '#b8c4e0', 6);
    for (let k = 0; k < 90; k++) { g.fillStyle = '#ffffff'; g.fillRect(Math.floor(hash(k, 4) * W), Math.floor(hash(k, 5) * 90), 1, 1); }
    for (let k = 0; k < 60; k++) { g.fillStyle = '#98a8c8'; g.fillRect(Math.floor(hash(k, 6) * W), 96 + Math.floor(hash(k, 7) * 66), 2, 1); }
  } else if (kind === 'forest') {
    band(0, 70, '#305878', '#88b8a0', 8);
    for (let k = 0; k < 18; k++) { const x = hash(k, 3) * W, h = 60 + hash(k, 4) * 30; g.fillStyle = k % 2 ? '#1c4028' : '#244e30'; g.beginPath(); g.moveTo(x - 16, 104); g.lineTo(x, 104 - h); g.lineTo(x + 16, 104); g.fill(); }
    band(100, 164, '#3c6c30', '#1c3c1c', 6);
    for (let k = 0; k < 120; k++) { g.fillStyle = hash(k, 5) > 0.5 ? '#58904a' : '#183018'; g.fillRect(Math.floor(hash(k, 6) * W), 104 + Math.floor(hash(k, 7) * 58), 2, 1); }
  } else if (kind === 'ship') {
    band(0, 90, '#081028', '#304070', 8);
    for (let k = 0; k < 40; k++) { g.fillStyle = '#c0c8f0'; g.fillRect(Math.floor(hash(k, 5) * W), Math.floor(hash(k, 6) * 70), 1, 1); }
    g.fillStyle = '#e8e8d0'; g.beginPath(); g.arc(60, 26, 9, 0, Math.PI * 2); g.fill();
    band(90, 104, '#102040', '#183058', 3);
    g.fillStyle = '#3a2818'; g.fillRect(120, 0, 6, 104); g.fillStyle = '#c8c0a8'; g.fillRect(96, 10, 54, 40); g.fillStyle = '#a89878'; g.fillRect(96, 46, 54, 4);
    for (let y = 104; y < 164; y += 6) { g.fillStyle = (y / 6) % 2 ? '#5c3c20' : '#4a3018'; g.fillRect(0, y, W, 6); g.fillStyle = '#2a1808'; g.fillRect(0, y + 5, W, 1); }
  } else if (kind === 'cave' || kind === 'mine') {
    g.fillStyle = '#100808'; g.fillRect(0, 0, W, 164);
    const vn = (x, y, s, k) => { const X = Math.floor(x / s), Y = Math.floor(y / s), fx = x / s - X, fy = y / s - Y, l = (a, b, t) => a + (b - a) * t * t * (3 - 2 * t); return l(l(hash(X, Y, k), hash(X + 1, Y, k), fx), l(hash(X, Y + 1, k), hash(X + 1, Y + 1, k), fx), fy); };
    const RK = kind === 'mine' ? ['#141418', '#24242c', '#3a3a46', '#545462', '#727484'] : ['#1c100a', '#2e1c12', '#4a3020', '#6b4830', '#8c6848'];
    for (let x = 0; x < W; x++) { const n = Math.sin(x * 0.07) * 8 + Math.sin(x * 0.19 + 1) * 5 + hash(x, 0) * 3; for (let y = 0; y < 96 + n; y++) { const h = vn(x, y, 22, 1) * 0.55 + vn(x, y, 9, 2) * 0.3 + vn(x, y, 4, 3) * 0.15, hl = vn(x - 2, y - 2, 22, 1) * 0.55 + vn(x - 2, y - 2, 9, 2) * 0.3 + vn(x - 2, y - 2, 4, 3) * 0.15; const lit = (h - hl) * 6 + h * 0.6 + (bayer(x, y) - 0.5) * 0.12; g.fillStyle = RK[Math.max(0, Math.min(4, Math.floor(lit * 4 + 1.2)))]; g.fillRect(x, y, 1, 1); } }
    band(100, 164, kind === 'mine' ? '#4a4a54' : '#54403a', kind === 'mine' ? '#222228' : '#2a1c18', 6);
    if (kind === 'mine') { g.fillStyle = '#5a3c20'; for (const x of [40, 200]) { g.fillRect(x, 20, 6, 90); } g.fillRect(34, 20, 178, 6); }
    for (let k = 0; k < 5; k++) { const x = 20 + hash(k, 11) * 216, y = 50 + hash(k, 12) * 30; g.fillStyle = kind === 'mine' ? '#f0c040' : '#40c8e8'; g.fillRect(x, y, 2, 4); g.fillStyle = '#ffffe0'; g.fillRect(x, y, 1, 1); }
  } else {
    // tower, library, roof, sanctum, ice
    const pal = { tower: ['#141c38', '#283460', '#3c4c80', '#5868a0'], library: ['#2a1810', '#4a3020', '#6b4830', '#8c6848'], ice: ['#183858', '#2c6088', '#4a88b8', '#88c8e8'], sanctum: ['#181020', '#30283c', '#4c4058', '#6c6078'], roof: ['#141c38', '#283460', '#3c4c80', '#5868a0'] }[kind] || ['#141c38', '#283460', '#3c4c80', '#5868a0'];
    if (kind === 'roof' || kind === 'sanctum') {
      band(0, 110, kind === 'sanctum' ? '#100818' : '#180828', kind === 'sanctum' ? '#584868' : '#682868', 10);
      for (let k = 0; k < 6; k++) { const cy = 10 + k * 14; g.fillStyle = 'rgba(200,200,220,0.25)'; for (let x = 0; x < W; x++) if (Math.sin(x * 0.05 + k * 2) > 0.3) g.fillRect(x, cy + Math.round(Math.sin(x * 0.02 + k) * 4), 1, 2); }
      for (let k = 0; k < 30; k++) { g.fillStyle = '#e0e0f0'; g.fillRect(Math.floor(hash(k, 5) * W), Math.floor(hash(k, 6) * 60), 1, 1); }
    } else {
      g.fillStyle = pal[1]; g.fillRect(0, 0, W, 110);
      for (let y = 0; y < 110; y += 8) for (let x = -(y % 16); x < W; x += 16) { g.fillStyle = pal[hash(x, y) > 0.7 ? 2 : 1]; g.fillRect(x, y, 15, 7); g.fillStyle = pal[0]; g.fillRect(x, y + 7, 16, 1); g.fillRect(x + 15, y, 1, 8); }
      if (kind === 'library') { for (const x of [16, 80, 144, 208]) { g.fillStyle = '#1c0c08'; g.fillRect(x, 12, 40, 90); for (let y = 16; y < 100; y += 12) for (let b = 0; b < 9; b++) { g.fillStyle = ['#a03028', '#305890', '#3c7840', '#c09030'][(b + y) % 4]; g.fillRect(x + 2 + b * 4, y, 3, 10); } } }
      else for (const x of [24, 88, 152, 216]) { g.fillStyle = pal[0]; g.fillRect(x - 10, 0, 20, 110); g.fillStyle = pal[3]; g.fillRect(x - 9, 0, 4, 110); g.fillStyle = pal[2]; g.fillRect(x - 5, 0, 10, 110); }
    }
    band(110, 164, kind === 'ice' ? '#a8d0f0' : kind === 'library' ? '#6b4830' : '#606c88', kind === 'ice' ? '#4a78a8' : kind === 'library' ? '#2a1810' : '#283048', 6);
    for (let y = 110; y < 164; y += 9) { g.fillStyle = 'rgba(16,20,40,0.5)'; g.fillRect(0, y, W, 1); }
    for (let x = -200; x < W + 200; x += 24) { g.strokeStyle = 'rgba(16,20,40,0.4)'; g.beginPath(); g.moveTo(W / 2 + (x - W / 2) * 0.4, 110); g.lineTo(x, 164); g.stroke(); }
  }
  return (bgCache[kind] = c);
}

// ---------- helpers ----------
function frames(n) { return new Promise((r) => B.waits.push({ t: n, r })); }
function msg(s) { B.msg = s; }
async function msgWait(s) {
  B.msg = s; B.msgWait = true;
  await frames(8);
  await new Promise((r) => { B.waitKey = r; });
  B.msgWait = false;
}
function popup(x, y, s, col = '#f8f8f8') { B.pops.push({ x, y, s: String(s), col, t: 0 }); }
const foesAlive = () => B.foes.filter((f) => f.hp > 0);
const heroes = () => S.members;
const heroesAlive = () => S.members.filter((h) => h.hp > 0);
function heroBox(i) { const n = Math.max(4, S.members.length), w = Math.floor((W - 4) / n); return { x: 2 + i * w, y: 164, w, h: 58 }; }
function heroPos(h) { const i = S.members.indexOf(h), b = heroBox(i); return { x: b.x + b.w / 2, y: 150 }; }
function foeFighter(f) { const d = ENEMIES[f.id]; return { atk: f.atk, dfn: f.def, int: f.int, agi: d.agi, buffs: f.buffs, defending: false, weak: d.weak, resist: d.resist, undead: d.undead }; }
function heroFighter(h, w) { const s = stats(h); const ww = w || weaponsOf(h)[0]; return { atk: weaponAtk(ww, s, h.skills[ww.kind] || 0) * (h.buffs.str ? 1.2 : 1), dfn: s.dfn, int: s.wil, agi: s.agi * (h.buffs.agi ? 1.4 : 1), buffs: h.buffs, defending: h.defending }; }
const used = (h) => (B.used[h.id] = B.used[h.id] || { kinds: new Set(), schools: new Set(), arts: 0, spells: 0, hit: false });
function layoutFoes() {
  const list = B.foes, sum = list.reduce((s, f) => s + f.aw, 0), gap = list.length > 1 ? Math.min(8, Math.floor((W - 4 - sum) / (list.length - 1))) : 0;
  const total = list.reduce((s, f) => s + f.aw, 0) + gap * (list.length - 1);
  let x = Math.round((W - total) / 2);
  for (const f of list) { f.x = x + f.aw / 2; f.base = ENEMIES[f.id].boss ? 132 : 122; x += f.aw + gap; }
}

// ---------- start / end ----------
// scale: bosses can come in stronger (the god of stillness grows with every wind stone you lack)
export function startBattle(troop, { bg = 'field', boss = false, music, canFlee = true, scale = 1 } = {}) {
  return new Promise((resolve) => {
    const foes = troop.map((id, i) => {
      const d = ENEMIES[id];
      const k = d.boss ? scale : 1;
      return { get aw() { return artW(this.art); }, get ah() { return artH(this.art); }, id, n: i, name: d.name + (troop.filter((t) => t === id).length > 1 ? 'ABCD'[troop.slice(0, i).filter((t) => t === id).length] : ''), hp: Math.round(d.hp * k), maxhp: Math.round(d.hp * k), atk: Math.round(d.atk * Math.sqrt(k)), def: d.def, int: Math.round(d.int * Math.sqrt(k)), art: d.boss ? bossArt(d.art, d.hue, d.sat) : enemyArt(d.art, d.hue, d.sat), status: {}, buffs: {}, flash: 0, shake: 0, die: 0, bob: Math.random() * 6 };
    });
    B = { troop, foes, bg, boss, canFlee: canFlee && !boss, waits: [], pops: [], parts: [], msg: '', round: 0, active: null, shake: 0, flash: 0, flashCol: '#fff', fade: 30, resolve, heroFx: {}, bolt: null, done: false, used: {}, bulbs: [], tier: Math.max(...troop.map((id) => ENEMIES[id].tier + (ENEMIES[id].boss ? 1 : 0))) };
    for (const h of S.members) { h.buffs = {}; h.defending = false; h.status = { ...h.status }; delete h.status.sleep; delete h.status.stun; }
    // hand-drawn monsters are shown at double size whenever the whole group still fits on screen
    const big = foes.map((f) => (ENEMIES[f.id].boss ? f.art : bossArt(ENEMIES[f.id].art, ENEMIES[f.id].hue, ENEMIES[f.id].sat)));
    // the artists' sprites are already drawn at full size; only the hand-drawn grids are doubled
    if (!foes.some((f) => f.art.fs) && big.reduce((s, a) => s + a.width, 0) <= W + 30 && Math.max(...big.map((a) => a.height)) <= 110) foes.forEach((f, i) => { f.art = big[i]; });
    layoutFoes();
    playMusic(music || (boss ? 'boss' : 'battle'), { restart: true });
    run();
  });
}
async function run() {
  await frames(20);
  const names = [...new Set(B.foes.map((f) => ENEMIES[f.id].name))];
  await msgWait(B.boss ? L(`${names[0]}擋住了去路！`, `${names[0]} blocks the way!`) : L(`${names.join('、')}出現了！`, `${names.join(', ')} appeared!`));
  msg('');
  for (;;) {
    B.round++;
    const r = await inputCommands();
    if (r.flee) {
      const myAgi = heroesAlive().reduce((s, h) => s + stats(h).agi, 0) / Math.max(1, heroesAlive().length);
      const theirAgi = foesAlive().reduce((s, f) => s + ENEMIES[f.id].agi, 0) / foesAlive().length;
      const chance = Math.max(0.3, Math.min(0.9, 0.55 + (myAgi - theirAgi) * 0.03));
      if (r.smoke || Math.random() < chance) { sfx('run'); await msgWait(r.smoke ? L('丟出煙霧彈，趁亂逃走了！', 'Threw a smoke bomb and slipped away!') : L('成功逃走了！', 'Got away safely!')); afterBattle(); return end('flee'); }
      await msgWait(L('沒能逃掉！', "Couldn't escape!"));
      if (await enemyPhase()) return;
      if (await roundEnd()) return;
      continue;
    }
    const order = [];
    heroes().forEach((h, i) => { const c = r.cmds[i]; if (c) order.push({ who: 'hero', h, c, spd: stats(h).agi * (h.buffs.agi ? 1.4 : 1) * (0.8 + Math.random() * 0.4) + (c.type === 'defend' ? 999 : 0) + (c.type === 'art' && ARTS[c.id].first ? 500 : 0) }); });
    for (const f of foesAlive()) order.push({ who: 'foe', f, spd: ENEMIES[f.id].agi * (0.8 + Math.random() * 0.4) });
    order.sort((a, b) => b.spd - a.spd);
    for (const h of heroes()) h.defending = false;
    for (const o of order) if (o.who === 'hero' && o.c.type === 'defend') o.h.defending = true;
    for (const o of order) {
      if (o.who === 'hero') await heroAct(o.h, o.c);
      else if (o.f.hp > 0) await foeAct(o.f);
      if (await checkEnd()) return;
    }
    if (await roundEnd()) return;
  }
}
async function enemyPhase() {
  for (const f of foesAlive()) { await foeAct(f); if (await checkEnd()) return true; }
  return false;
}
async function roundEnd() {
  msg('');
  for (const h of heroesAlive()) {
    if (h.status.poison) { const d = Math.max(1, Math.floor(stats(h).maxhp / 12)); h.hp = Math.max(1, h.hp - d); const p = heroPos(h); popup(p.x, p.y - 20, d, '#c080f8'); }
    if (h.status.sleep && --h.status.sleep <= 0) { delete h.status.sleep; }
    for (const k of Object.keys(h.buffs)) if (--h.buffs[k] <= 0) delete h.buffs[k];
  }
  for (const f of foesAlive()) {
    if (f.status.poison) { const d = Math.max(1, Math.floor(f.maxhp / 16)); f.hp = Math.max(1, f.hp - d); popup(f.x, f.base - f.ah / 2, d, '#c080f8'); }
    if (f.status.sleep && --f.status.sleep <= 0) delete f.status.sleep;
    if (f.status.stun && --f.status.stun <= 0) delete f.status.stun;
    for (const k of Object.keys(f.buffs)) if (--f.buffs[k] <= 0) delete f.buffs[k];
  }
  await frames(10);
  return checkEnd();
}
async function checkEnd() {
  if (!foesAlive().length) { await victory(); return true; }
  if (!heroesAlive().length) { await defeat(); return true; }
  return false;
}
const DROPS = { 1: ['herb'], 2: ['herb', 'antidote'], 3: ['herb', 'tonic', 'ether'], 4: ['hiherb', 'tonic', 'ether'], 5: ['hiherb', 'tonic', 'ether'], 6: ['hiherb', 'lifewind'] };
async function victory() {
  await frames(20);
  playMusic('victory', { restart: true });
  let gold = 0; const drops = [];
  for (const f of B.foes) { const d = ENEMIES[f.id]; gold += d.gold; if (!d.boss && Math.random() < 0.12) { const t = DROPS[d.tier]; drops.push(t[Math.floor(Math.random() * t.length)]); } }
  await msgWait(L('戰鬥勝利！', 'Victory!'));
  if (gold) { S.gold += gold; await msgWait(L(`獲得 ${gold} 金幣。`, `Found ${gold} gold.`)); }
  for (const it of drops) { addItem(it); await msgWait(L(`得到了${ITEMS[it].name}！`, `Found ${ITEMS[it].name}!`)); }
  for (const h of heroes()) {
    const g = grow(h, B.tier, used(h));
    if (g.length) { sfx('level'); await msgWait(`${h.name}  ${g.join(' ')}`); }
  }
  S.battles = (S.battles || 0) + 1;
  await lostHeroes();
  afterBattle();
  end('win');
}
// heroes with no LP left leave for good
async function lostHeroes() {
  for (const h of [...heroes()]) {
    if (h.lp > 0) continue;
    if (h.id === S.lead) continue;
    await msgWait(L(`${h.name}再也站不起來了……`, `${h.name} will not rise again...`));
    S.gone[h.id] = true; S.flags['gone_' + h.id] = true;
    S.members.splice(S.members.indexOf(h), 1);
  }
}
async function defeat() {
  await frames(30);
  await msgWait(L('全員倒下了……', 'The party has fallen...'));
  end('lose');
}
function end(result) {
  B.fadeOut = 1;
  const r = B.resolve;
  setTimeout(() => { B = null; r(result); }, 450);
}

// ---------- commands ----------
async function inputCommands() {
  const hs = heroes(), cmds = [];
  let i = 0;
  const able = (h) => h.hp > 0 && !h.status.sleep;
  while (i < hs.length) {
    const h = hs[i];
    if (!able(h)) { cmds[i] = null; i++; continue; }
    B.active = h;
    const c = await commandMenu(h, hs.slice(0, i).some(able));
    if (c === 'back') { let j = i - 1; while (j >= 0 && !able(hs[j])) j--; if (j >= 0) i = j; continue; }
    if (c.type === 'flee') { B.active = null; return { flee: true, smoke: c.smoke }; }
    cmds[i] = c; i++;
  }
  B.active = null;
  return { cmds };
}
const wName = (w) => (w.id ? ITEMS[w.id].name : L('空手', 'Bare hands'));
async function commandMenu(h, canBack) {
  const box = heroBox(S.members.indexOf(h));
  for (;;) {
    const ws = weaponsOf(h);
    const items = [
      ...ws.map((w) => ({ label: wName(w) })),
      { label: L('魔法', 'Magic'), disabled: !h.spells.length }, { label: L('道具', 'Item') },
      { label: L('防禦', 'Guard') }, { label: L('逃跑', 'Run'), disabled: !B.canFlee },
    ];
    const r = await menu(items, { x: Math.min(W - 108, Math.max(2, box.x + box.w / 2 - 54)), y: 162 - items.length * 16 - 12, w: 108, cancel: canBack, start: Math.min(items.length - 1, (B.lastCmd && B.lastCmd[h.id]) || 0) });
    if (r < 0) return 'back';
    (B.lastCmd = B.lastCmd || {})[h.id] = r;
    const nw = ws.length;
    if (r < nw) {
      // the weapon: a plain attack or one of its techniques
      const w = ws[r];
      const arts = h.arts.filter((a) => ARTS[a].kind === w.kind);
      const list = [{ label: L('攻擊', 'Attack'), right: '' }, ...arts.map((a) => ({ label: ARTS[a].name, right: ARTS[a].wp, disabled: ARTS[a].wp > h.wp }))];
      let k = 0;
      if (list.length > 1) { k = await menu(list, { x: 40, y: 30, w: 176, title: `${wName(w)}  WP ${h.wp}`, maxRows: 7 }); if (k < 0) continue; }
      if (k === 0) { const t = await pickFoe(); if (t) return { type: 'attack', w, target: t }; continue; }
      const id = arts[k - 1], t = await pickTarget(ARTS[id].target, h);
      if (t !== null) return { type: 'art', id, w, target: t };
      continue;
    }
    const rr = r - nw;
    if (rr === 0) {
      const list = h.spells;
      const k = await menu(list.map((id) => ({ label: SPELLS[id].name, right: SPELLS[id].jp, disabled: SPELLS[id].jp > h.jp })), { x: 40, y: 30, w: 176, title: `${h.name}  JP ${h.jp}`, maxRows: 7 });
      if (k < 0) continue;
      const id = list[k], t = await pickTarget(SPELLS[id].target, h);
      if (t !== null) return { type: 'magic', id, target: t };
    }
    if (rr === 1) {
      const list = Object.keys(S.inv).filter((id) => ITEMS[id].use);
      if (!list.length) { sfx('buzz'); continue; }
      const k = await menu(list.map((id) => ({ label: ITEMS[id].name, right: S.inv[id] })), { x: 40, y: 30, w: 176, title: L('道具', 'Items'), maxRows: 7 });
      if (k < 0) continue;
      const id = list[k], it = ITEMS[id];
      if (it.use === 'escape') { if (!B.canFlee) { sfx('buzz'); continue; } addItem(id, -1); return { type: 'flee', smoke: true }; }
      const t = await pickTarget(it.target === 'ally' && it.use === 'lp' ? 'any' : it.target, h);
      if (t !== null) return { type: 'item', id, target: t };
    }
    if (rr === 2) return { type: 'defend' };
    if (rr === 3) return { type: 'flee' };
  }
}
function pickTarget(kind, h) {
  if (kind === 'enemy') return pickFoe();
  if (kind === 'enemies') return Promise.resolve('allFoes');
  if (kind === 'allies') return Promise.resolve('allHeroes');
  if (kind === 'self') return Promise.resolve(h);
  if (kind === 'ally') return pickHero((x) => x.hp > 0);
  if (kind === 'dead') return pickHero((x) => x.hp <= 0);
  if (kind === 'any') return pickHero(() => true);
  return Promise.resolve(null);
}
function pickFoe() {
  return new Promise((res) => {
    let list = foesAlive(), i = 0;
    const w = {
      update() {
        list = foesAlive();
        if (input.repeat('right') || input.repeat('down')) { i = (i + 1) % list.length; sfx('cursor'); }
        if (input.repeat('left') || input.repeat('up')) { i = (i + list.length - 1) % list.length; sfx('cursor'); }
        if (input.pressed('a')) { sfx('ok'); done(list[i]); }
        if (input.pressed('b')) { sfx('cancel'); done(null); }
      },
      draw() { const f = list[i]; if (!f) return; windowBox(4, 4, W - 8, 24); text(f.name, W / 2, 10, '#f8f8f8', { align: 'center' }); drawTags(statusTags(f), W - 12, 10, W / 2 - 20 - textW(f.name) / 2); ctx.drawImage(HAND_D, Math.round(f.x - 5), Math.round(Math.max(31, f.base - f.ah - 10) + ((B.t >> 3) % 2))); },
    };
    const done = (v) => { UI_pop(w); res(v); };
    UI_push(w);
  });
}
function pickHero(ok) {
  return new Promise((res) => {
    const list = S.members.filter(ok);
    if (!list.length) { sfx('buzz'); res(null); return; }
    let i = 0;
    const w = {
      update() {
        if (input.repeat('right') || input.repeat('down')) { i = (i + 1) % list.length; sfx('cursor'); }
        if (input.repeat('left') || input.repeat('up')) { i = (i + list.length - 1) % list.length; sfx('cursor'); }
        if (input.pressed('a')) { sfx('ok'); done(list[i]); }
        if (input.pressed('b')) { sfx('cancel'); done(null); }
      },
      draw() { const b = heroBox(S.members.indexOf(list[i])); ctx.drawImage(HAND_D, b.x + b.w / 2 - 5, 124 + ((B.t >> 3) % 2)); },
    };
    const done = (v) => { UI_pop(w); res(v); };
    UI_push(w);
  });
}
// battle-only widgets ride their own stack above the menus
const widgetStack = [];
function UI_push(w) { widgetStack.push(w); }
function UI_pop(w) { const i = widgetStack.indexOf(w); if (i >= 0) widgetStack.splice(i, 1); }

// ---------- actions ----------
async function stepForward(h) { B.heroFx[h.id] = { dy: 0 }; for (let k = 0; k < 6; k++) { B.heroFx[h.id].dy -= 2; await frames(1); } }
async function stepBack(h) { for (let k = 0; k < 6; k++) { if (B.heroFx[h.id]) B.heroFx[h.id].dy += 2; await frames(1); } delete B.heroFx[h.id]; }
function hurtFoe(f, d, col = '#f8f8f8') {
  f.hp = Math.max(0, f.hp - d); f.flash = 8; f.shake = 10;
  popup(f.x, f.base - f.ah / 2, d, col);
  if (f.status.sleep && Math.random() < 0.5) delete f.status.sleep;
  if (f.hp <= 0) killFoe(f);
}
function killFoe(f) { f.die = 1; sfx(ENEMIES[f.id].boss ? 'boom' : 'die'); }
function hurtHero(h, d, col = '#f8f8f8') {
  const s = stats(h);
  if (h.hp <= 0) return;
  h.hp = Math.max(0, h.hp - d);
  used(h).hit = true;
  B.heroFx[h.id] = { ...(B.heroFx[h.id] || {}), hit: 14 };
  const p = heroPos(h); popup(p.x, p.y - 18, d, col);
  if (h.status.sleep && Math.random() < 0.5) delete h.status.sleep;
  if (h.hp <= 0) { h.status = {}; h.buffs = {}; h.lp = Math.max(0, h.lp - 1); popup(p.x, p.y - 30, 'LP-1', '#f878a8'); }
  if (d > s.maxhp * 0.25) B.shake = 8;
}
function healHero(h, n) { const s = stats(h); const before = h.hp; h.hp = Math.min(s.maxhp, h.hp + n); const p = heroPos(h); popup(p.x, p.y - 18, h.hp - before, '#78f878'); }
const pickAliveFoe = (t) => (t && t.hp > 0 ? t : foesAlive()[Math.floor(Math.random() * foesAlive().length)]);

// a technique, learned before or just now
async function doArt(h, id, w, target, free) {
  const a = ARTS[id], s = stats(h);
  if (!free) { if (h.wp < a.wp) { await msgWait(L(`${h.name}的 WP 不夠了。`, `${h.name} is out of WP.`)); return; } h.wp -= a.wp; }
  used(h).arts++; used(h).kinds.add(w.kind);
  msg(L(`${h.name}：${a.name}！`, `${h.name}: ${a.name}!`));
  await stepForward(h);
  sfx('special');
  const ts = a.target === 'enemies' ? foesAlive() : [pickAliveFoe(target)].filter(Boolean);
  const me = heroFighter(h, w);
  for (let hit = 0; hit < (a.hits || 1); hit++) {
    for (const t of ts) { if (t.hp <= 0) continue; fxArt(a.fx, t); }
    sfx(a.fx === 'quake' ? 'quake' : a.fx === 'wind' ? 'bolt' : 'slash');
    if (a.fx === 'quake') B.shake = 16;
    await frames(a.hits > 2 ? 8 : 14);
    for (const t of ts) {
      if (t.hp <= 0) continue;
      const r = physical(me, foeFighter(t), a.k, { crit: a.crit || 0.06, pierce: a.pierce });
      if (r.miss) { popup(t.x, t.base - t.ah / 2, 'MISS', '#a0a8c0'); continue; }
      hurtFoe(t, r.dmg, r.crit ? '#f8e040' : '#f8f8f8');
      if (a.stun && !ENEMIES[t.id].boss && Math.random() < a.stun) { t.status.stun = 2; popup(t.x, t.base - t.ah, L('定身', 'STUN'), '#f8e070'); }
      if (a.poison && !ENEMIES[t.id].boss && Math.random() < a.poison) { t.status.poison = 1; }
    }
  }
  await frames(22);
  await stepBack(h);
  void s;
}
async function heroAct(h, c) {
  if (h.hp <= 0 || h.status.sleep) return;
  if (c.type === 'defend') return;
  if (c.type === 'attack') {
    const t = pickAliveFoe(c.target);
    if (!t) return;
    const w = c.w, skill = h.skills[w.kind] || 0, tier = ENEMIES[t.id].tier + (ENEMIES[t.id].boss ? 1 : 0);
    // inspiration: a technique of this weapon you have never used
    // one idea at a time: the easiest technique you could have learned by now
    const ideas = Object.keys(ARTS).filter((id) => ARTS[id].kind === w.kind && !h.arts.includes(id) && glimmerChance(skill, ARTS[id], tier) > 0);
    const id = ideas.sort((x, y) => ARTS[x].lv - ARTS[y].lv)[Math.random() < 0.7 ? 0 : ideas.length - 1];
    if (id && Math.random() < glimmerChance(skill, ARTS[id], tier)) {
      await glimmer(h);
      h.arts.push(id);
      await doArt(h, id, w, t, true);
      return;
    }
    used(h).kinds.add(w.kind);
    msg(L(`${h.name}的攻擊！`, `${h.name} attacks!`));
    await stepForward(h);
    sfx('slash'); fxArt(w.kind === 'bow' ? 'arrow' : w.kind === 'spear' ? 'thrust' : w.kind === 'fist' || w.kind === 'staff' ? 'smash' : 'slash', t);
    await frames(10);
    const r = physical(heroFighter(h, w), foeFighter(t));
    if (r.miss) { sfx('miss'); popup(t.x, t.base - t.ah / 2, 'MISS', '#a0a8c0'); }
    else { sfx(r.crit ? 'crit' : 'hit'); if (r.crit) { B.flash = 4; msg(L('會心一擊！', 'Critical hit!')); } hurtFoe(t, r.dmg); }
    await frames(22);
    await stepBack(h);
    return;
  }
  if (c.type === 'art') { await doArt(h, c.id, c.w, c.target, false); return; }
  if (c.type === 'magic') {
    const sp = SPELLS[c.id];
    if (h.jp < sp.jp) { await msgWait(L(`${h.name}的 JP 不夠了。`, `${h.name} is out of JP.`)); return; }
    h.jp -= sp.jp;
    used(h).spells++; used(h).schools.add(sp.school);
    msg(L(`${h.name}施放了${sp.name}！`, `${h.name} casts ${sp.name}!`));
    await stepForward(h);
    await castSpell(h, sp, c.target);
    await stepBack(h);
    return;
  }
  if (c.type === 'item') {
    const it = ITEMS[c.id];
    if (!count(c.id)) { await msgWait(L(`${it.name}已經用完了。`, `No ${it.name} left.`)); return; }
    addItem(c.id, -1);
    const t = c.target;
    msg(L(`${h.name}使用了${it.name}。`, `${h.name} uses ${it.name}.`));
    await frames(12);
    if (it.use === 'lp') { fxHeal(t); sfx('heal'); t.lp = Math.min(stats(t).maxlp, t.lp + it.power); const p = heroPos(t); popup(p.x, p.y - 18, 'LP+' + it.power, '#f878a8'); await frames(20); return; }
    if (t.hp <= 0) { await msgWait(L('沒有效果。', 'No effect.')); return; }
    fxHeal(t); sfx('heal');
    if (it.use === 'heal') healHero(t, it.power);
    if (it.use === 'wp' || it.use === 'jp') { const s = stats(t), k = it.use, mx = k === 'wp' ? s.maxwp : s.maxjp, b = t[k]; t[k] = Math.min(mx, t[k] + it.power); const p = heroPos(t); popup(p.x, p.y - 18, `${k.toUpperCase()}+${t[k] - b}`, '#78c8f8'); }
    if (it.use === 'cure') { delete t.status.poison; }
    await frames(26);
  }
}
async function glimmer(h) {
  B.bulbs.push({ h, t: 50 });
  sfx('glimmer'); B.flash = 6; B.flashCol = '#fff8c0';
  msg(L(`${h.name}靈光一閃！`, `${h.name} has an inspiration!`));
  await frames(40);
}
async function castSpell(h, sp, target) {
  const s = stats(h), pow = spellPow(sp.power || 0, s, h.skills[sp.school] || 0);
  const me = { int: s.wil };
  if (sp.type === 'dmg' || sp.type === 'drain') {
    const ts = target === 'allFoes' ? foesAlive() : [pickAliveFoe(target)].filter(Boolean);
    sfx(sp.fx === 'holy' ? 'holy' : sp.fx === 'rock' || sp.fx === 'quake' ? 'quake' : sp.fx === 'wind' ? 'bolt' : sp.fx === 'drain' ? 'drain' : sp.fx);
    for (const t of ts) fxSpell(sp.fx, t.x, t.base - t.ah / 2, t);
    if (sp.fx === 'quake') B.shake = 20;
    await frames(30);
    for (const t of ts) {
      const r = magic(pow * (ts.length > 1 ? 0.8 : 1), foeFighter(t), sp.school);
      hurtFoe(t, r.dmg, r.weak ? '#f8e040' : '#f8f8f8');
      if (sp.type === 'drain') healHero(h, Math.round(r.dmg * 0.5));
    }
    await frames(24);
  } else if (sp.type === 'heal') {
    const ts = target === 'allHeroes' ? heroesAlive() : [target];
    sfx('heal');
    for (const t of ts) fxHeal(t);
    await frames(20);
    for (const t of ts) if (t.hp > 0) healHero(t, healAmount(pow * (ts.length > 1 ? 0.7 : 1)));
    await frames(24);
  } else if (sp.type === 'cure') {
    sfx('heal'); fxHeal(target); await frames(20); delete target.status.poison; delete target.status.sleep; await frames(10);
  } else if (sp.type === 'revive') {
    sfx('heal'); fxHeal(target); await frames(24);
    if (target.hp <= 0) { target.hp = Math.round(stats(target).maxhp * 0.5); const p = heroPos(target); popup(p.x, p.y - 18, target.hp, '#78f878'); } else await msgWait(L('沒有效果。', 'No effect.'));
    await frames(10);
  } else if (sp.type === 'buff') {
    const ts = heroesAlive();
    sfx('buff');
    for (const t of ts) { fxBuff(t); t.buffs[sp.stat] = 4; }
    await frames(30);
    msg(sp.stat === 'def' ? L('防禦力提升了！', 'Defence rose!') : L('速度提升了！', 'Speed rose!'));
    await frames(20);
  } else if (sp.type === 'sleep') {
    sfx('sleep');
    for (const f of foesAlive()) fxSpell('sleep', f.x, f.base - f.ah / 2);
    await frames(30);
    for (const f of foesAlive()) { const ok = !ENEMIES[f.id].boss && Math.random() < 0.65; if (ok) { f.status.sleep = 2 + Math.floor(Math.random() * 2); popup(f.x, f.base - f.ah / 2, 'ZZZ', '#c0c0ff'); } else popup(f.x, f.base - f.ah / 2, 'MISS', '#a0a8c0'); }
    await frames(24);
  }
  void me;
}
async function foeAct(f) {
  const d = ENEMIES[f.id];
  if (f.status.sleep) { popup(f.x, f.base - f.ah, 'ZZZ', '#c0c0ff'); await frames(20); return; }
  if (f.status.stun) { popup(f.x, f.base - f.ah, L('定身', 'STUN'), '#f8e070'); await frames(16); return; }
  const targets = heroesAlive();
  if (!targets.length) return;
  const act = foeAction(f, B.round);
  const pick = () => { const ts = heroesAlive(); return ts[Math.floor(Math.random() * ts.length)]; };
  f.lunge = 10;
  if (act === 'atk' || act === 'twin') {
    const hits = act === 'twin' ? 2 : 1;
    msg(act === 'twin' ? L(`${f.name}使出連擊！`, `${f.name} strikes twice!`) : L(`${f.name}的攻擊！`, `${f.name} attacks!`));
    await frames(14);
    for (let k = 0; k < hits; k++) {
      const t = pick(); if (!t) break;
      const r = physical(foeFighter(f), heroFighter(t), act === 'twin' ? 0.75 : 1);
      if (r.miss) { sfx('miss'); const p = heroPos(t); popup(p.x, p.y - 18, 'MISS', '#a0a8c0'); }
      else { sfx(r.crit ? 'crit' : 'hurt'); if (r.crit) B.shake = 8; hurtHero(t, r.dmg); }
      await frames(act === 'twin' ? 14 : 24);
    }
    return;
  }
  const tech = TECHS[act];
  msg(L(`${f.name}使出了「${tech.name}」！`, `${f.name} uses ${tech.name}!`));
  await frames(16);
  if (tech.kind === 'magic') {
    const ts = tech.target === 'all' ? heroesAlive() : [pick()];
    sfx(tech.fx === 'abyss' ? 'abyss' : tech.fx === 'bubble' ? 'bubble' : tech.fx === 'quake' ? 'quake' : tech.fx === 'wind' ? 'bolt' : tech.fx);
    if (tech.fx === 'abyss') { B.flash = 16; B.flashCol = '#202040'; B.shake = 24; }
    if (tech.fx === 'quake') B.shake = 20;
    for (const t of ts) { const p = heroPos(t); fxSpell(tech.fx, p.x, p.y - 12); }
    await frames(30);
    const pow = tech.power + f.int * tech.k;
    for (const t of ts) { const r = magic(pow, heroFighter(t), tech.el); hurtHero(t, r.dmg); }
    await frames(26);
  } else if (tech.kind === 'status') {
    const ts = tech.target === 'all' ? heroesAlive() : [pick()];
    sfx(tech.fx === 'still' ? 'sleep' : tech.fx);
    for (const t of ts) { const p = heroPos(t); fxSpell(tech.fx === 'still' ? 'sleep' : tech.fx, p.x, p.y - 12); }
    await frames(30);
    for (const t of ts) {
      const p = heroPos(t);
      if (Math.random() < (tech.status === 'sleep' ? 0.5 : 0.7)) { t.status[tech.status] = tech.status === 'sleep' ? 2 : 1; popup(p.x, p.y - 18, tech.status === 'sleep' ? (tech.fx === 'still' ? L('靜止', 'STILL') : 'ZZZ') : L('中毒', 'POISON'), tech.status === 'sleep' ? '#c0c0ff' : '#c080f8'); }
      else popup(p.x, p.y - 18, 'MISS', '#a0a8c0');
    }
    await frames(20);
  } else if (tech.kind === 'drain') {
    const t = pick(); sfx('drain');
    const p = heroPos(t);
    for (let k = 0; k < 14; k++) B.parts.push({ x: p.x + (Math.random() - 0.5) * 12, y: p.y - 12, tx: f.x, ty: f.base - f.ah / 2, life: 40, col: '#f84060', size: 2, type: 'home', d: k * 2 });
    await frames(30);
    const r = magic(10 + f.int * 0.8, heroFighter(t), 'dark');
    hurtHero(t, r.dmg);
    f.hp = Math.min(f.maxhp, f.hp + r.dmg);
    popup(f.x, f.base - f.ah / 2, r.dmg, '#78f878');
    await frames(24);
  } else if (tech.kind === 'buff') {
    sfx('buff'); f.buffs[tech.stat] = 3;
    await frames(30);
  }
  void d;
}
function fxArt(kind, t) {
  const x = t.x, y = t.base - t.ah / 2;
  if (kind === 'slash') fxSlash(x, y);
  else if (kind === 'moon') { fxSlash(x, y, '#c0c8ff'); fxSlash(x + 6, y - 6, '#ffffff'); }
  else if (kind === 'thrust' || kind === 'arrow') { for (let k = 0; k < 8; k++) B.parts.push({ x: x - 30 + k * 4, y: y + (kind === 'arrow' ? -4 : 0), vx: 3, vy: 0, life: 8, col: kind === 'arrow' ? '#f0e0a0' : '#ffffff', size: 2, d: k }); }
  else if (kind === 'smash') { for (let k = 0; k < 10; k++) B.parts.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 14, col: '#f8f0c0', size: 2 }); B.shake = 6; }
  else if (kind === 'wind') { for (let k = 0; k < 14; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, vx: 2.5, vy: -0.5, life: 16, col: k % 2 ? '#c0f8e0' : '#ffffff', size: 2, d: k }); fxSlash(x, y, '#c0f8e0'); }
  else if (kind === 'quake') { for (let k = 0; k < 12; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: t.base, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 2, g: 0.2, life: 30, col: ['#8c6848', '#b08868'][k % 2], size: 3 }); }
  else if (kind === 'rain') { for (let k = 0; k < 10; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y - 60, vx: 0, vy: 5, life: 14, col: '#f0e0a0', size: 2, d: k * 2 }); }
  else if (kind === 'beam') { for (let k = 0; k < 3; k++) B.parts.push({ type: 'beam', x: x + (k - 1) * 6, y, life: 24, col: '#fffff0', d: k * 3 }); }
}

// ---------- effects ----------
function fxSlash(x, y, col = '#ffffff') { B.parts.push({ type: 'slash', x, y, life: 12, col }); }
function fxHeal(h) { const p = heroPos(h); for (let k = 0; k < 16; k++) B.parts.push({ x: p.x + (Math.random() - 0.5) * 18, y: p.y + Math.random() * 6, vx: 0, vy: -0.6 - Math.random() * 0.8, life: 40 + Math.random() * 10, col: k % 2 ? '#a0f8a0' : '#ffffff', size: k % 3 ? 1 : 2, type: 'spark' }); }
function fxBuff(h) { const p = heroPos(h); B.parts.push({ type: 'ring', x: p.x, y: p.y - 6, life: 30, col: '#f8e070' }); }
function fxSpell(kind, x, y, t) {
  if (kind === 'fire') for (let k = 0; k < 22; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y + 14 + Math.random() * 8, vx: (Math.random() - 0.5) * 0.6, vy: -0.8 - Math.random() * 1.6, life: 26 + Math.random() * 14, col: ['#f8f070', '#f8a030', '#e04818'][k % 3], size: 3 + (k % 3), type: 'flame', d: Math.floor(k / 2) });
  if (kind === 'ice') for (let k = 0; k < 10; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 36, y: y - 50 - Math.random() * 20, vx: 0, vy: 3.5, life: 18, col: '#c0f0ff', size: 3, type: 'shard', ty: y + (Math.random() - 0.5) * 16, d: k * 2 });
  if (kind === 'bolt') { B.bolt = { x, y, t: 18 }; B.flash = 6; B.flashCol = '#ffffff'; }
  if (kind === 'holy') for (let k = 0; k < 4; k++) B.parts.push({ type: 'beam', x: x + (k - 1.5) * 8, y, life: 24, col: '#fffff0', d: k * 3 });
  if (kind === 'sleep' || kind === 'spore') for (let k = 0; k < 10; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, vx: (Math.random() - 0.5) * 0.4, vy: -0.4, life: 40, col: kind === 'sleep' ? '#c0c0ff' : '#c080f8', size: 2, type: kind === 'sleep' ? 'z' : 'spark', d: k * 2 });
  if (kind === 'bubble') for (let k = 0; k < 10; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 24, y: y + 20, vx: (Math.random() - 0.5) * 0.5, vy: -1 - Math.random(), life: 34, col: '#a0d8ff', size: 3 + (k % 3), type: 'bubble', d: k * 2 });
  if (kind === 'wind') for (let k = 0; k < 16; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 36, y: y + (Math.random() - 0.5) * 24, vx: 2.5 + Math.random(), vy: -0.6, life: 20, col: k % 2 ? '#c0f8e0' : '#ffffff', size: 2, d: k });
  if (kind === 'rock' || kind === 'quake') for (let k = 0; k < 12; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y - 40 - Math.random() * 20, vx: 0, vy: 4, life: 14, col: ['#8c6848', '#b08868', '#5c4430'][k % 3], size: 4, d: k * 2 });
  if (kind === 'drain') for (let k = 0; k < 12; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 20, y, vx: (Math.random() - 0.5), vy: 1, life: 24, col: '#a040c0', size: 2, d: k });
  if (kind === 'abyss') for (let k = 0; k < 16; k++) B.parts.push({ x: x + (Math.random() - 0.5) * 30, y: y + 10, vx: (Math.random() - 0.5) * 1.5, vy: -1.5 - Math.random(), life: 36, col: ['#a040c0', '#400060', '#f040a0'][k % 3], size: 4, type: 'flame', d: k });
  void t;
}

// ---------- update / draw ----------
export function updateBattle() {
  if (!B) return;
  B.t = (B.t || 0) + 1;
  uiTick();
  for (const w of [...B.waits]) if (--w.t <= 0) { B.waits.splice(B.waits.indexOf(w), 1); w.r(); }
  if (B.waitKey && (input.pressed('a') || input.pressed('b'))) { const r = B.waitKey; B.waitKey = null; sfx('cursor'); r(); }
  else if (!UI.active && widgetStack.length) widgetStack[widgetStack.length - 1].update();
  for (const p of B.pops) p.t++;
  B.pops = B.pops.filter((p) => p.t < 50);
  for (const p of B.parts) {
    if (p.d > 0) { p.d--; continue; }
    p.life--;
    if (p.type === 'home') { p.x += (p.tx - p.x) * 0.1; p.y += (p.ty - p.y) * 0.1; }
    else { p.x += p.vx || 0; p.y += p.vy || 0; if (p.g) p.vy += p.g; }
    if (p.type === 'shard' && p.y >= p.ty) { p.vy = 0; }
  }
  B.parts = B.parts.filter((p) => p.life > 0);
  for (const f of B.foes) { if (f.flash) f.flash--; if (f.shake) f.shake--; if (f.lunge) f.lunge--; if (f.die && f.die < 40) f.die++; }
  for (const k of Object.keys(B.heroFx)) if (B.heroFx[k].hit) B.heroFx[k].hit--;
  for (const b of B.bulbs) b.t--;
  B.bulbs = B.bulbs.filter((b) => b.t > 0);
  if (B.shake) B.shake--;
  if (B.flash) B.flash--;
  if (B.bolt && --B.bolt.t <= 0) B.bolt = null;
  if (B.fade > 0) B.fade--;
}
const dissolve = new Map();
// a sheet sprite is drawn at its own scale, snapped to whole screen pixels
const artW = (a) => a.width * (a.fs ? fine(a.fs) : 1), artH = (a) => a.height * (a.fs ? fine(a.fs) : 1);
function dissolved(f) {
  // a monster breaking up into pixels as it dies
  const k = f.die, a = f.art;
  const c = canvas(a.width, a.height);
  c.x.drawImage(k < 8 ? tint(a, '#ffffff', 0.8) : a, 0, 0);
  if (k >= 8) {
    const id = c.x.getImageData(0, 0, a.width, a.height), d = id.data, th = (k - 8) / 30;
    for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) if (hash(x, y, f.n) < th + (1 - y / a.height) * 0.0) d[(y * a.width + x) * 4 + 3] = 0;
    c.x.putImageData(id, 0, 0);
  }
  void dissolve;
  return c;
}
// every active status as a short coloured tag, so the windows show at a glance who is poisoned, asleep or buffed
export function statusTags(f) {
  const t = [], st = f.status || {}, bf = f.buffs || {};
  if (st.poison) t.push([L('毒', 'PSN'), '#c080f8']);
  if (st.sleep) t.push([L('眠', 'SLP'), '#c0c0ff']);
  if (st.stun) t.push([L('定', 'STN'), '#f8e070']);
  if (bf.str > 0) t.push([L('攻↑', 'ATK↑'), '#f8a050']);
  if (bf.def > 0) t.push([L('防↑', 'DEF↑'), '#80d8ff']);
  if (bf.agi > 0) t.push([L('速↑', 'SPD↑'), '#80f8a0']);
  if (bf.int > 0) t.push([L('魔↑', 'MAG↑'), '#f080f8']);
  return t;
}
// right-aligned at x: all of them when they fit in room, otherwise one at a time, changing every second
function drawTags(tags, x, y, room) {
  if (!tags.length) return;
  const all = tags.map((t) => t[0]).join(' ');
  if (textW(all) <= room) { for (let i = tags.length - 1; i >= 0; i--) { text(tags[i][0], x, y, tags[i][1], { align: 'right' }); x -= textW(tags[i][0] + ' '); } return; }
  const [s, col] = tags[Math.floor(B.t / 60) % tags.length];
  text(s, x, y, col, { align: 'right' });
}
// a name with its tags beside it; in a window too narrow for both, the name and each tag take turns
function nameTags(name, col, tags, x0, x1, y) {
  // a name wider than its box keeps its last word ("Old Gears" -> "Gears"), else it is cut with "..."
  if (textW(name) > x1 - x0) { const last = name.split(' ').pop(); name = last !== name && textW(last) <= x1 - x0 ? last : fit(name, x1 - x0); }
  const room = x1 - x0 - textW(name) - 3;
  if (!tags.length || Math.max(...tags.map((t) => textW(t[0]))) <= room) { text(name, x0, y, col); drawTags(tags, x1, y, room); return; }
  const k = Math.floor(B.t / 60);
  if (k % 2 === 0) text(name, x0, y, col); else { const [s, c] = tags[(k >> 1) % tags.length]; text(s, x0, y, c); }
}
export function drawBattle() {
  if (!B) return;
  const sx = B.shake ? ((B.shake % 2) * 2 - 1) * Math.min(4, B.shake) : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(backdrop(B.bg), sx, 0);
  // monsters
  for (const f of B.foes) {
    if (f.hp <= 0 && f.die >= 38) continue;
    const bob = ENEMIES[f.id].boss ? Math.sin((B.t + f.bob * 10) / 24) * 2 : 0;
    let x = Math.round(f.x - f.aw / 2 + sx + (f.shake ? ((f.shake % 4) < 2 ? 2 : -2) : 0));
    const y = Math.round(f.base - f.ah + bob + (f.lunge ? Math.sin((10 - f.lunge) / 10 * Math.PI) * 6 : 0));
    if (f.hp <= 0) { ctx.drawImage(dissolved(f), x, y, f.aw, f.ah); continue; }
    if (f.status.sleep) { if ((B.t >> 5) % 2) text('Z', x + f.aw - 4, y - 4 - ((B.t >> 3) % 4), '#c0c0ff'); }
    ctx.drawImage(f.flash && f.flash % 4 < 2 ? tint(f.art, '#ffffff', 0.85) : f.art, x, y, f.aw, f.ah);
  }
  // lightning
  if (B.bolt) {
    ctx.strokeStyle = B.bolt.t % 4 < 2 ? '#ffffff' : '#f8f080'; ctx.lineWidth = 2; ctx.beginPath();
    let x = B.bolt.x + (Math.random() - 0.5) * 20; ctx.moveTo(x, 0);
    for (let y = 0; y < B.bolt.y + 10; y += 10) { x += (Math.random() - 0.5) * 16; ctx.lineTo(x, y); }
    ctx.stroke(); ctx.lineWidth = 1;
  }
  // party, from behind
  S.members.forEach((h, i) => {
    const b = heroBox(i), fx = B.heroFx[h.id] || {}, act = B.active === h;
    const fr = sprite(h.id).u[act && (B.t >> 4) % 2 ? 1 : 0];
    let x = b.x + b.w / 2 - 8 + (fx.hit ? ((fx.hit % 4) < 2 ? 2 : -2) : 0), y = 138 + (fx.dy || 0) + (act ? -4 : 0);
    if (h.hp <= 0) { ctx.globalAlpha = 0.5; ctx.drawImage(tint(fr, '#606080', 0.7), x, y + 6); ctx.globalAlpha = 1; return; }
    ctx.drawImage(fx.hit && fx.hit % 4 < 2 ? tint(fr, '#f84040', 0.6) : fr, x, y);
    if (h.status.sleep && (B.t >> 5) % 2) text('Z', x + 14, y - 6, '#c0c0ff');
  });
  // particles
  for (const p of B.parts) {
    if (p.d > 0) continue;
    const a = Math.min(1, p.life / 10);
    ctx.globalAlpha = a;
    if (p.type === 'slash') { const k = 12 - p.life; ctx.fillStyle = p.col; for (let i = 0; i < 3; i++) for (let j = 0; j < 14; j++) { const t = j - 7; ctx.fillRect(p.x + t * 1.4 + i * 4 - 4 + k, p.y + t * 1.4 - i * 4 + 4 - k * 0.2, 2, 2); } }
    else if (p.type === 'ring') { ctx.strokeStyle = p.col; ctx.beginPath(); ctx.ellipse(p.x, p.y + (30 - p.life) * -0.5, 12 + (30 - p.life) * 0.4, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
    else if (p.type === 'beam') { ctx.fillStyle = p.col; ctx.fillRect(p.x - 1, p.y - 60 + (24 - p.life) * 2, 3, 60); }
    else if (p.type === 'z') { text('z', p.x, p.y, p.col, { shadow: null }); }
    else if (p.type === 'bubble') { ctx.strokeStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 1, p.y - p.size + 1, 1, 1); }
    else { ctx.fillStyle = p.col; const s = p.size || 2; ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); }
  }
  ctx.globalAlpha = 1;
  // status windows
  S.members.forEach((h, i) => {
    const b = heroBox(i), s = stats(h), fx = B.heroFx[h.id] || {};
    const oy = fx.hit ? ((fx.hit % 4) < 2 ? 1 : -1) : 0;
    windowBox(b.x, b.y + oy, b.w, b.h);
    const dead = h.hp <= 0, low = h.hp < s.maxhp / 4;
    nameTags(h.name, B.active === h ? '#f8e070' : dead ? '#f86060' : '#f8f8f8', statusTags(h), b.x + 4, b.x + b.w - 5 - textW(String(h.lp)), b.y + 3 + oy);
    text(String(h.lp), b.x + b.w - 4, b.y + 3 + oy, h.lp <= 2 ? '#f86060' : '#f878a8', { align: 'right' });
    text(String(h.hp), b.x + b.w - 5, b.y + 16 + oy, dead ? '#f86060' : low ? '#f8e070' : '#f8f8f8', { align: 'right' });
    text('HP', b.x + 5, b.y + 16 + oy, h.status.poison ? '#c080f8' : '#a0c0f8');
    text('WP', b.x + 5, b.y + 29 + oy, '#a0c0f8'); text(String(h.wp), b.x + b.w - 5, b.y + 29 + oy, '#f8f8f8', { align: 'right' });
    text('JP', b.x + 5, b.y + 42 + oy, '#a0c0f8'); text(String(h.jp), b.x + b.w - 5, b.y + 42 + oy, '#f8f8f8', { align: 'right' });
  });
  // inspiration: a light bulb over the hero's head
  for (const bl of B.bulbs) { const p = heroPos(bl.h), y = 112 - Math.min(10, 50 - bl.t); ctx.drawImage(bulbArt(), Math.round(p.x - 6), Math.round(y)); }
  // popups
  for (const p of B.pops) {
    const k = p.t, dy = k < 10 ? -k * 1.5 : k < 16 ? -15 + (k - 10) * 1.2 : -8;
    text(p.s, p.x, p.y + dy, p.col, { align: 'center', shadow: '#000010' });
  }
  if (B.msg) {
    // a long line takes two rows instead of running off the window
    const rows = textW(B.msg) > W - 34 ? wrap(B.msg, W - 34) : [B.msg], h = 8 + rows.length * 16;
    windowBox(4, 4, W - 8, h); rows.forEach((r, i) => text(r, 14, 10 + i * 16));
    if (B.msgWait && B.waitKey && (B.t >> 4) % 2) ctx.drawImage(HAND_D, W - 20, h - 8);
  }
  for (const w of widgetStack) w.draw();
  if (B.flash) { ctx.globalAlpha = B.flash / 16; ctx.fillStyle = B.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (B.fade > 0) { ctx.globalAlpha = B.fade / 30; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (B.fadeOut) { B.fadeOut = Math.min(30, B.fadeOut + 1); ctx.globalAlpha = B.fadeOut / 30; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
let bulb = null;
function bulbArt() {
  if (bulb) return bulb;
  const rows = ['....oooo....', '...oyyyyo...', '..oyywyyyo..', '..oywyyyyo..', '..oyyyyyyo..', '..oyyyyyyo..', '...oyyyyo...', '....oyyo....', '....oggo....', '....oGGo....', '....oggo....', '.....oo.....'];
  bulb = canvas(12, 12);
  const P = { o: '#201810', y: '#f8e050', w: '#ffffff', g: '#a0a0b0', G: '#606070' };
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (P[ch]) { bulb.x.fillStyle = P[ch]; bulb.x.fillRect(x, y, 1, 1); } }));
  return bulb;
}
// for testing
export const _B = () => B;
void ramp; void textW; void bar; void isEn; void HEROES; void kindName;
