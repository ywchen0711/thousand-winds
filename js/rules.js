// Battle arithmetic with no drawing, so it can be simulated outside the browser.
import { ENEMIES, TECHS } from './data.js';

export const rand = (a, b) => a + Math.random() * (b - a);
const buffK = (b, k) => (b && b[k] > 0 ? 1.3 : 1);

// how hard a hero hits with a weapon: the weapon, strength and how practised they are with it
export const weaponAtk = (w, s, skill) => w.atk + s.str * 0.6 + skill * 1.4;
// how strong a hero's spell is: will and the level in that school
export const spellPow = (power, s, lv) => power + s.wil * 1.1 + lv * 2.2;

// a fighter is { atk, dfn, agi, buffs, defending }
export function physical(a, t, mult = 1, { crit = 0.06, pierce = false } = {}) {
  const miss = Math.max(0.02, Math.min(0.2, 0.05 + (t.agi - a.agi) * 0.005));
  if (Math.random() < miss) return { miss: true };
  const isCrit = Math.random() < crit;
  const atk = a.atk * buffK(a.buffs, 'str') * rand(0.9, 1.1);
  const def = t.dfn * buffK(t.buffs, 'def') * (isCrit || pierce ? 0.3 : 1);
  let d = (atk - def * 0.5) * mult * (isCrit ? 1.5 : 1);
  if (t.defending) d *= 0.5;
  d = Math.max(1, Math.round(d));
  return { dmg: d, crit: isCrit };
}
// pow is already the full power of the spell (spellPow for heroes, power + int * k for monsters)
export function magic(pow, t, el) {
  let d = pow * rand(0.92, 1.08) - t.dfn * buffK(t.buffs, 'def') * 0.25;
  if (t.weak && t.weak === el) d *= 1.6;
  if (t.resist && t.resist === el) d *= 0.4;
  if (t.undead && el === 'light') d *= 1.4;
  if (t.defending) d *= 0.6;
  return { dmg: Math.max(1, Math.round(d)), weak: t.weak === el, resist: t.resist === el };
}
export const healAmount = (pow) => Math.round(pow * 1.6 * rand(0.95, 1.05));

// a monster picks an action
export function foeAction(foe, round) {
  const def = ENEMIES[foe.id];
  const acts = def.acts || [['atk', 1]];
  // the god of stillness turns to its strongest attack every third round once wounded
  if (foe.id === 'nul' && foe.hp < foe.maxhp * 0.6 && round % 3 === 0) return 'stillness';
  const total = acts.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [a, w] of acts) { r -= w; if (r <= 0) return a; }
  return 'atk';
}
export const isTech = (a) => !!TECHS[a];

// the chance of an inspiration when a hero attacks: weapon skill near the technique's level and
// stronger monsters both help
export function glimmerChance(skill, art, tier) {
  if (skill + 4 < art.lv || tier + 1 < art.tier) return 0;
  return Math.min(0.22, 0.03 + tier * 0.02 + Math.max(0, skill - art.lv) * 0.003);
}
