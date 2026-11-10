// The party, inventory, gold, story flags and saving. There are no levels: after each battle the
// heroes may gain HP, WP, JP, a stat point or a weapon or magic skill level, depending on what they
// did and how strong the monsters were.
import { HEROES, ITEMS, WEAPONS, SCHOOLS, KIND_NAMES } from './data.js';
import { L, onLang } from './i18n.js';

export const S = {
  members: [], inv: {}, gold: 0, flags: {}, map: 'valmont', x: 0, y: 0, dir: 'd', time: 0, steps: 0,
  lead: 'rion', era: 0, loc: 'valmont', known: {}, battles: 0, gone: {},
};
export const MAX_PARTY = 4;

export function makeHero(id) {
  const H = HEROES[id];
  const h = {
    id, name: H.name,
    max: { hp: H.base.hp, wp: H.base.wp, jp: H.base.jp, lp: H.base.lp },
    stat: { str: H.base.str, vit: H.base.vit, agi: H.base.agi, wil: H.base.wil },
    skills: Object.fromEntries([...WEAPONS, ...SCHOOLS].map((k) => [k, (H.skills && H.skills[k]) || 0])),
    arts: [...(H.arts || [])], spells: [...(H.spells || [])],
    equip: { ...H.equip }, status: {}, buffs: {},
  };
  h.hp = h.max.hp; h.wp = h.max.wp; h.jp = h.max.jp; h.lp = h.max.lp;
  return h;
}
// totals with equipment
export function stats(h) {
  const s = { maxhp: h.max.hp, maxwp: h.max.wp, maxjp: h.max.jp, maxlp: h.max.lp, ...h.stat, dfn: 0 };
  for (const slot of ['weapon', 'weapon2', 'armor', 'acc']) {
    const it = ITEMS[h.equip[slot]];
    if (!it) continue;
    s.dfn += it.def || 0;
    for (const [k, v] of Object.entries(it.bonus || {})) s[k] += v;
  }
  s.dfn += s.vit;
  // for the shared field code
  s.atk = s.str; s.int = s.wil;
  return s;
}
// the weapons a hero can fight with this turn: up to two, or bare hands
export function weaponsOf(h) {
  const out = [];
  for (const slot of ['weapon', 'weapon2']) { const id = h.equip[slot]; if (id && ITEMS[id]) out.push({ slot, id, kind: ITEMS[id].kind, atk: ITEMS[id].atk }); }
  if (!out.length) out.push({ slot: null, id: null, kind: 'fist', atk: 6 });
  return out;
}
export const alive = () => S.members.filter((m) => m.hp > 0);
export const spellsOf = (h) => h.spells;

export function addMember(id) {
  if (S.members.find((m) => m.id === id) || S.gone[id]) return false;
  if (S.members.length >= MAX_PARTY) return false;
  S.members.push(makeHero(id));
  S.flags[id] = true;
  return true;
}
export function removeMember(id) {
  const i = S.members.findIndex((m) => m.id === id);
  if (i > 0) { const [m] = S.members.splice(i, 1); for (const slot of ['weapon', 'weapon2', 'armor', 'acc']) { /* heroes keep their own gear */ void slot; } S.bench = S.bench || {}; S.bench[id] = m; return m; }
  return null;
}
// someone who left the party can come back as they were
export function rejoin(id) {
  if (S.bench && S.bench[id]) { if (S.members.length >= MAX_PARTY) return false; S.members.push(S.bench[id]); delete S.bench[id]; return true; }
  return addMember(id);
}

// ---------- growth after a battle ----------
const chance = (p) => Math.random() < p;
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const kname = (k) => L(KIND_NAMES[k][0], KIND_NAMES[k][1]);
// used: { kinds: Set, schools: Set, arts: n, spells: n, hit: bool }
export function grow(h, tier, used) {
  const out = [];
  if (h.hp <= 0 && !used.revived) return out;
  const capHp = 60 + tier * 95, capWp = 14 + tier * 12, capStat = 10 + tier * 7;
  if (h.max.hp < capHp && chance(0.55)) { const n = Math.min(capHp - h.max.hp, ri(2, 5) + tier * 2); h.max.hp += n; out.push(`HP+${n}`); }
  if ((used.arts || used.kinds.size) && h.max.wp < capWp && chance(used.arts ? 0.45 : 0.2)) { h.max.wp++; h.wp++; out.push('WP+1'); }
  if (used.spells && h.max.jp < capWp && chance(0.45)) { h.max.jp++; h.jp++; out.push('JP+1'); }
  for (const k of [...used.kinds, ...used.schools]) {
    const lv = h.skills[k] || 0;
    const p = Math.max(0.03, Math.min(0.7, 0.45 - (lv - tier * 5) * 0.06));
    if (lv < 50 && chance(p)) { h.skills[k] = lv + 1; out.push(L(`${kname(k)}Lv${lv + 1}`, `${kname(k)} Lv${lv + 1}`)); }
  }
  const bump = (k, p, label) => { if (h.stat[k] < capStat && chance(p)) { h.stat[k]++; out.push(label); } };
  if (used.kinds.size) bump('str', 0.12, L('力+1', 'STR+1'));
  if (used.hit) bump('vit', 0.12, L('體+1', 'VIT+1'));
  bump('agi', 0.06, L('速+1', 'AGI+1'));
  if (used.spells) bump('wil', 0.14, L('意+1', 'WIL+1'));
  return out;
}

export function addItem(id, n = 1) { S.inv[id] = (S.inv[id] || 0) + n; if (S.inv[id] <= 0) delete S.inv[id]; }
export const count = (id) => S.inv[id] || 0;
// the inn: everything back, LP too
export function fullHeal() { for (const m of S.members) { const s = stats(m); m.hp = s.maxhp; m.wp = s.maxwp; m.jp = s.maxjp; m.lp = s.maxlp; m.status = {}; } }
// after every battle HP comes back by itself; LP, WP and JP do not
export function afterBattle() { for (const m of S.members) { const s = stats(m); m.hp = s.maxhp; m.status = {}; m.buffs = {}; } }

// names are stored in the save, so follow the current language
export function refreshNames() { for (const m of [...S.members, ...Object.values(S.bench || {})]) m.name = HEROES[m.id].name; }
onLang(refreshNames);

// ---------- save ----------
const KEY = 'thousandwinds-save';
export function save(slot = 0) {
  try { localStorage.setItem(KEY + slot, JSON.stringify({ ...S, savedAt: Date.now() })); return true; } catch (e) { return false; }
}
export function hasSave(slot = 0) { try { return !!localStorage.getItem(KEY + slot); } catch (e) { return false; } }
export function load(slot = 0) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY + slot));
    if (!d) return false;
    Object.assign(S, { members: [], inv: {}, flags: {}, known: {}, gone: {}, bench: {} }, d);
    refreshNames();
    return true;
  } catch (e) { return false; }
}
export function reset(lead) {
  Object.assign(S, { members: [], inv: { herb: 4 }, gold: 150, flags: {}, map: HEROES[lead].home, x: 0, y: 0, dir: 'd', time: 0, steps: 0, lead, era: 0, loc: HEROES[lead].home, known: {}, battles: 0, gone: {}, bench: {} });
  addMember(lead);
}
