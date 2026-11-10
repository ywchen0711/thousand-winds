// 千風群英譚 Saga of a Thousand Winds: heroes, weapons, techniques, spells, items and monsters.
// There are no levels. Heroes grow after battles, and monster strength is fixed by region tier.
import { localize } from './i18n.js';

// weapon types and magic schools; every hero keeps a skill level in each
export const WEAPONS = ['sword', 'great', 'axe', 'spear', 'bow', 'dagger', 'fist', 'staff'];
export const SCHOOLS = ['fire', 'water', 'wind', 'earth', 'light', 'dark'];
export const KIND_NAMES = {
  sword: ['劍', 'Sword'], great: ['大劍', 'Greatsword'], axe: ['斧', 'Axe'], spear: ['槍', 'Spear'], bow: ['弓', 'Bow'],
  dagger: ['短劍', 'Dagger'], fist: ['體術', 'Martial'], staff: ['杖', 'Staff'],
  fire: ['火', 'Fire'], water: ['水', 'Water'], wind: ['風', 'Wind'], earth: ['地', 'Earth'], light: ['光', 'Light'], dark: ['闇', 'Dark'],
};

// ---------- heroes ----------
// the six who can start the story, then three who can only be recruited
export const HEROES = {
  rion:  { name: '利恩', title: '見習騎士', home: 'valmont', lead: true, base: { hp: 82, wp: 12, jp: 4, lp: 10, str: 13, vit: 11, agi: 10, wil: 7 }, skills: { sword: 5, spear: 2, light: 1 }, arts: ['double'], spells: [], equip: { weapon: 'shortsword', weapon2: null, armor: 'leather', acc: null } },
  sela:  { name: '賽菈', title: '草原的獵人', home: 'grassea', lead: true, base: { hp: 72, wp: 12, jp: 6, lp: 11, str: 11, vit: 9, agi: 14, wil: 9 }, skills: { bow: 5, spear: 3, wind: 3 }, arts: ['quickshot'], spells: ['windblade'], equip: { weapon: 'huntbow', weapon2: 'shortspear', armor: 'hide', acc: null } },
  gusta: { name: '古斯塔', title: '傭兵', home: 'ironclaw', lead: true, base: { hp: 96, wp: 14, jp: 2, lp: 12, str: 15, vit: 13, agi: 7, wil: 5 }, skills: { great: 5, axe: 4 }, arts: ['rockbreak'], spells: [], equip: { weapon: 'claymore', weapon2: 'handaxe', armor: 'chain', acc: null } },
  mico:  { name: '米可', title: '港口的小偷', home: 'mistport', lead: true, base: { hp: 66, wp: 12, jp: 4, lp: 9, str: 10, vit: 8, agi: 16, wil: 8 }, skills: { dagger: 6, fist: 3, dark: 1 }, arts: ['sneak'], spells: [], equip: { weapon: 'knife', weapon2: null, armor: 'cloth', acc: 'thiefring' } },
  fia:   { name: '妃雅', title: '見習魔導士', home: 'astralis', lead: true, base: { hp: 60, wp: 4, jp: 16, lp: 8, str: 7, vit: 7, agi: 10, wil: 15 }, skills: { staff: 3, fire: 5, water: 3, earth: 2 }, arts: [], spells: ['fireball', 'heal', 'stone'], equip: { weapon: 'oakstaff', weapon2: null, armor: 'robe', acc: null } },
  karon: { name: '卡隆', title: '老船長', home: 'saltreach', lead: true, base: { hp: 90, wp: 12, jp: 4, lp: 10, str: 14, vit: 12, agi: 9, wil: 8 }, skills: { axe: 5, sword: 4, water: 2 }, arts: ['heavychop'], spells: [], equip: { weapon: 'cutlass', weapon2: 'handaxe', armor: 'coat', acc: null } },
  bass:  { name: '巴斯', title: '拳鬥士', home: 'ironclaw', base: { hp: 92, wp: 14, jp: 2, lp: 11, str: 14, vit: 12, agi: 11, wil: 4 }, skills: { fist: 6, axe: 2 }, arts: ['jab'], spells: [], equip: { weapon: null, weapon2: null, armor: 'hide', acc: null } },
  lulu:  { name: '露露', title: '旅行的治療師', home: 'valmont', base: { hp: 62, wp: 4, jp: 16, lp: 9, str: 7, vit: 8, agi: 11, wil: 14 }, skills: { staff: 3, water: 6, light: 3 }, arts: [], spells: ['heal', 'icearrow', 'cure'], equip: { weapon: 'oakstaff', weapon2: null, armor: 'robe', acc: null } },
  tarin: { name: '塔林', title: '流浪槍兵', home: 'dunehold', base: { hp: 88, wp: 14, jp: 4, lp: 10, str: 13, vit: 12, agi: 12, wil: 6 }, skills: { spear: 7, sword: 2 }, arts: ['twinthrust'], spells: [], equip: { weapon: 'longspear', weapon2: null, armor: 'chain', acc: null } },
};
export const LEADS = Object.keys(HEROES).filter((k) => HEROES[k].lead);

// ---------- weapons and gear ----------
// atk for weapons, def for armour; anyone can carry anything, the skill level decides how well
export const ITEMS = {
  herb:     { name: '藥草', price: 12, use: 'heal', power: 60, target: 'ally', desc: '回復 60 HP' },
  hiherb:   { name: '特效藥', price: 60, use: 'heal', power: 220, target: 'ally', desc: '回復 220 HP' },
  tonic:    { name: '氣力酒', price: 50, use: 'wp', power: 10, target: 'ally', desc: '回復 10 WP' },
  ether:    { name: '術力水', price: 50, use: 'jp', power: 10, target: 'ally', desc: '回復 10 JP' },
  antidote: { name: '解毒草', price: 8, use: 'cure', target: 'ally', desc: '解除中毒' },
  smoke:    { name: '煙霧彈', price: 25, use: 'escape', target: 'none', desc: '戰鬥中必定逃跑' },
  lifewind: { name: '生命之風', price: 0, use: 'lp', power: 3, target: 'ally', desc: '回復 3 LP' },
  // swords
  shortsword: { name: '短劍', price: 40, slot: 'weapon', kind: 'sword', atk: 12 },
  broadsword: { name: '寬刃劍', price: 220, slot: 'weapon', kind: 'sword', atk: 24 },
  cutlass:    { name: '彎刀', price: 120, slot: 'weapon', kind: 'sword', atk: 18 },
  knightsword:{ name: '騎士劍', price: 680, slot: 'weapon', kind: 'sword', atk: 38 },
  windblade:  { name: '千風劍', price: 0, slot: 'weapon', kind: 'sword', atk: 58, bonus: { agi: 4 } },
  // greatswords
  claymore:   { name: '雙手劍', price: 160, slot: 'weapon', kind: 'great', atk: 22 },
  zweihander: { name: '巨劍', price: 820, slot: 'weapon', kind: 'great', atk: 44 },
  dragonfang: { name: '龍牙大劍', price: 0, slot: 'weapon', kind: 'great', atk: 64 },
  // axes
  handaxe:    { name: '手斧', price: 60, slot: 'weapon', kind: 'axe', atk: 15 },
  battleaxe:  { name: '戰斧', price: 380, slot: 'weapon', kind: 'axe', atk: 32 },
  stormaxe:   { name: '暴風斧', price: 0, slot: 'weapon', kind: 'axe', atk: 56 },
  // spears
  shortspear: { name: '短槍', price: 70, slot: 'weapon', kind: 'spear', atk: 15 },
  longspear:  { name: '長槍', price: 300, slot: 'weapon', kind: 'spear', atk: 28 },
  skylance:   { name: '天空之槍', price: 0, slot: 'weapon', kind: 'spear', atk: 54 },
  // bows
  huntbow:    { name: '獵弓', price: 60, slot: 'weapon', kind: 'bow', atk: 14 },
  longbow:    { name: '長弓', price: 340, slot: 'weapon', kind: 'bow', atk: 28 },
  galebow:    { name: '疾風弓', price: 0, slot: 'weapon', kind: 'bow', atk: 50, bonus: { agi: 4 } },
  // daggers
  knife:      { name: '小刀', price: 30, slot: 'weapon', kind: 'dagger', atk: 11 },
  dirk:       { name: '匕首', price: 260, slot: 'weapon', kind: 'dagger', atk: 24 },
  moonfang:   { name: '月牙', price: 0, slot: 'weapon', kind: 'dagger', atk: 46, bonus: { agi: 6 } },
  // martial arts gear
  cestus:     { name: '鐵拳套', price: 280, slot: 'weapon', kind: 'fist', atk: 22 },
  // staves
  oakstaff:   { name: '橡木杖', price: 40, slot: 'weapon', kind: 'staff', atk: 8, bonus: { wil: 2 } },
  sagestaff:  { name: '賢者之杖', price: 520, slot: 'weapon', kind: 'staff', atk: 18, bonus: { wil: 8 } },
  starstaff:  { name: '星辰杖', price: 0, slot: 'weapon', kind: 'staff', atk: 26, bonus: { wil: 14 } },
  // armour
  cloth:      { name: '布衣', price: 20, slot: 'armor', def: 3 },
  robe:       { name: '法袍', price: 80, slot: 'armor', def: 5, bonus: { wil: 2 } },
  hide:       { name: '獸皮甲', price: 90, slot: 'armor', def: 7 },
  leather:    { name: '皮甲', price: 70, slot: 'armor', def: 6 },
  coat:       { name: '船長大衣', price: 160, slot: 'armor', def: 8 },
  chain:      { name: '鎖子甲', price: 240, slot: 'armor', def: 11 },
  plate:      { name: '板甲', price: 720, slot: 'armor', def: 20 },
  sagerobe:   { name: '賢者長袍', price: 600, slot: 'armor', def: 12, bonus: { wil: 5 } },
  windmail:   { name: '風之鎧', price: 0, slot: 'armor', def: 30, bonus: { agi: 3 } },
  // accessories
  thiefring:  { name: '盜賊指環', price: 0, slot: 'acc', bonus: { agi: 3 } },
  powerbelt:  { name: '力量腰帶', price: 400, slot: 'acc', bonus: { str: 5 } },
  guardring:  { name: '守護指環', price: 400, slot: 'acc', bonus: { vit: 5 } },
  sagering:   { name: '賢者指環', price: 400, slot: 'acc', bonus: { wil: 5 } },
  featherboots:{ name: '羽毛靴', price: 400, slot: 'acc', bonus: { agi: 5 } },
  windfeather:{ name: '風之羽', price: 0, slot: 'acc', bonus: { agi: 4, wil: 4 } },
  // the eight wind stones and other keys
  st_dawn:   { name: '晨風之石', price: 0, key: true, stone: true, desc: '喚醒早晨的風。' },
  st_west:   { name: '西風之石', price: 0, key: true, stone: true, desc: '把船推向遠方的風。' },
  st_east:   { name: '東風之石', price: 0, key: true, stone: true, desc: '帶來春雨的風。' },
  st_gale:   { name: '疾風之石', price: 0, key: true, stone: true, desc: '在山間奔跑的風。' },
  st_breeze: { name: '微風之石', price: 0, key: true, stone: true, desc: '翻動書頁的風。' },
  st_south:  { name: '南風之石', price: 0, key: true, stone: true, desc: '溫暖的、帶著鹽味的風。' },
  st_dusk:   { name: '暮風之石', price: 0, key: true, stone: true, desc: '把一天送走的風。' },
  st_north:  { name: '北風之石', price: 0, key: true, stone: true, desc: '冰冷卻清澈的風。' },
  shipwheel: { name: '幽靈船的舵', price: 0, key: true, desc: '老船長的舊舵輪。' },
  libkey:    { name: '書庫之鑰', price: 0, key: true, desc: '星塔學院地下書庫的鑰匙。' },
  sunseal:   { name: '太陽印記', price: 0, key: true, desc: '沙之神殿的通行證。' },
};
export const STONES = ['st_dawn', 'st_west', 'st_east', 'st_gale', 'st_breeze', 'st_south', 'st_dusk', 'st_north'];

// ---------- weapon techniques (learned by inspiration in battle) ----------
// wp: cost; k: power multiplier; lv: weapon skill needed to have the inspiration; tier: monster tier that can spark it
export const ARTS = {
  // sword
  double:     { name: '二段斬', kind: 'sword', wp: 2, k: 0.95, lv: 1, tier: 1, target: 'enemy', hits: 2, fx: 'slash' },
  windcut:    { name: '風切', kind: 'sword', wp: 3, k: 1.25, lv: 6, tier: 1, target: 'enemies', fx: 'wind' },
  galethrust: { name: '疾風突', kind: 'sword', wp: 4, k: 2.4, lv: 10, tier: 2, target: 'enemy', fx: 'thrust', first: true },
  moonshade:  { name: '月影斬', kind: 'sword', wp: 6, k: 3.2, lv: 16, tier: 3, target: 'enemy', fx: 'moon' },
  thousand:   { name: '千風斬', kind: 'sword', wp: 10, k: 1.3, lv: 24, tier: 4, target: 'enemies', hits: 2, fx: 'wind' },
  // greatsword
  rockbreak:  { name: '碎岩擊', kind: 'great', wp: 2, k: 1.9, lv: 1, tier: 1, target: 'enemy', fx: 'smash' },
  whirl:      { name: '迴旋斬', kind: 'great', wp: 4, k: 1.4, lv: 6, tier: 1, target: 'enemies', fx: 'slash' },
  steelcleave:{ name: '斷鋼閃', kind: 'great', wp: 6, k: 3.4, lv: 14, tier: 3, target: 'enemy', fx: 'smash', pierce: true },
  skyfall:    { name: '天崩', kind: 'great', wp: 11, k: 2.6, lv: 22, tier: 4, target: 'enemies', fx: 'quake' },
  // axe
  heavychop:  { name: '重劈', kind: 'axe', wp: 2, k: 1.9, lv: 1, tier: 1, target: 'enemy', fx: 'smash' },
  tomahawk:   { name: '投斧', kind: 'axe', wp: 3, k: 2.0, lv: 5, tier: 1, target: 'enemy', fx: 'slash' },
  groundsplit:{ name: '大地裂', kind: 'axe', wp: 5, k: 1.6, lv: 11, tier: 2, target: 'enemies', fx: 'quake' },
  bearrage:   { name: '狂熊擊', kind: 'axe', wp: 8, k: 3.6, lv: 19, tier: 4, target: 'enemy', fx: 'smash' },
  // spear
  twinthrust: { name: '二連刺', kind: 'spear', wp: 2, k: 0.95, lv: 1, tier: 1, target: 'enemy', hits: 2, fx: 'thrust' },
  charge:     { name: '突擊', kind: 'spear', wp: 3, k: 2.3, lv: 6, tier: 1, target: 'enemy', fx: 'thrust' },
  dragontail: { name: '龍尾', kind: 'spear', wp: 5, k: 1.6, lv: 12, tier: 2, target: 'enemies', fx: 'slash' },
  heavenlance:{ name: '天槍', kind: 'spear', wp: 9, k: 3.8, lv: 20, tier: 4, target: 'enemy', fx: 'beam' },
  // bow
  quickshot:  { name: '速射', kind: 'bow', wp: 1, k: 1.4, lv: 1, tier: 1, target: 'enemy', first: true, fx: 'arrow' },
  stitch:     { name: '影縫', kind: 'bow', wp: 3, k: 1.3, lv: 5, tier: 1, target: 'enemy', stun: 0.6, fx: 'arrow' },
  arrowrain:  { name: '箭雨', kind: 'bow', wp: 5, k: 1.3, lv: 11, tier: 2, target: 'enemies', fx: 'rain' },
  starfall:   { name: '星墜', kind: 'bow', wp: 9, k: 3.4, lv: 20, tier: 4, target: 'enemy', fx: 'beam' },
  // dagger
  sneak:      { name: '偷襲', kind: 'dagger', wp: 2, k: 1.6, lv: 1, tier: 1, target: 'enemy', crit: 0.5, fx: 'slash' },
  venom:      { name: '毒刃', kind: 'dagger', wp: 3, k: 1.3, lv: 5, tier: 1, target: 'enemy', poison: 0.8, fx: 'slash' },
  swallow:    { name: '燕返', kind: 'dagger', wp: 5, k: 0.85, lv: 11, tier: 2, target: 'enemy', hits: 3, fx: 'slash' },
  thousandfang:{ name: '千刃', kind: 'dagger', wp: 9, k: 0.75, lv: 19, tier: 4, target: 'enemies', hits: 3, fx: 'slash' },
  // martial arts
  jab:        { name: '連拳', kind: 'fist', wp: 1, k: 0.85, lv: 1, tier: 1, target: 'enemy', hits: 2, fx: 'smash' },
  suplex:     { name: '背摔', kind: 'fist', wp: 3, k: 2.4, lv: 6, tier: 1, target: 'enemy', fx: 'smash' },
  whirlkick:  { name: '旋風腿', kind: 'fist', wp: 5, k: 1.5, lv: 12, tier: 2, target: 'enemies', fx: 'wind' },
  hundredfist:{ name: '百裂拳', kind: 'fist', wp: 9, k: 0.7, lv: 20, tier: 4, target: 'enemy', hits: 6, fx: 'smash' },
  // staff
  bonk:       { name: '敲擊', kind: 'staff', wp: 1, k: 1.4, lv: 1, tier: 1, target: 'enemy', fx: 'smash' },
  stunstrike: { name: '氣絕擊', kind: 'staff', wp: 3, k: 1.4, lv: 6, tier: 2, target: 'enemy', stun: 0.7, fx: 'smash' },
};

// ---------- spells (bought in magic shops) ----------
// jp: cost; power plus will and school level; type dmg / heal / cure / revive / buff / sleep / drain
export const SPELLS = {
  fireball:  { name: '火球', school: 'fire', jp: 2, type: 'dmg', power: 20, target: 'enemy', fx: 'fire', price: 150 },
  firewall:  { name: '火焰牆', school: 'fire', jp: 5, type: 'dmg', power: 26, target: 'enemies', fx: 'fire', price: 400 },
  inferno:   { name: '爆炎', school: 'fire', jp: 9, type: 'dmg', power: 70, target: 'enemy', fx: 'fire', price: 1200 },
  heal:      { name: '治癒水', school: 'water', jp: 2, type: 'heal', power: 40, target: 'ally', fx: 'heal', price: 120 },
  icearrow:  { name: '冰矢', school: 'water', jp: 3, type: 'dmg', power: 26, target: 'enemy', fx: 'ice', price: 200 },
  healrain:  { name: '恢復雨', school: 'water', jp: 7, type: 'heal', power: 36, target: 'allies', fx: 'heal', price: 900 },
  cure:      { name: '淨化', school: 'water', jp: 2, type: 'cure', target: 'ally', fx: 'heal', price: 100 },
  windblade: { name: '風刃', school: 'wind', jp: 2, type: 'dmg', power: 18, target: 'enemy', fx: 'wind', price: 120 },
  haste:     { name: '疾風之足', school: 'wind', jp: 4, type: 'buff', stat: 'agi', target: 'allies', fx: 'buff', price: 500 },
  tornado:   { name: '龍捲', school: 'wind', jp: 8, type: 'dmg', power: 40, target: 'enemies', fx: 'wind', price: 1300 },
  stone:     { name: '石彈', school: 'earth', jp: 2, type: 'dmg', power: 22, target: 'enemy', fx: 'rock', price: 120 },
  stoneskin: { name: '岩膚', school: 'earth', jp: 4, type: 'buff', stat: 'def', target: 'allies', fx: 'buff', price: 500 },
  quake:     { name: '地震', school: 'earth', jp: 8, type: 'dmg', power: 42, target: 'enemies', fx: 'quake', price: 1300 },
  holy:      { name: '聖光', school: 'light', jp: 4, type: 'dmg', power: 36, target: 'enemy', fx: 'holy', price: 700 },
  revive:    { name: '復甦', school: 'light', jp: 9, type: 'revive', target: 'dead', fx: 'heal', price: 1500 },
  drain:     { name: '吸取', school: 'dark', jp: 3, type: 'drain', power: 24, target: 'enemy', fx: 'drain', price: 400 },
  sleep:     { name: '沉睡', school: 'dark', jp: 3, type: 'sleep', target: 'enemies', fx: 'sleep', price: 300 },
};

// ---------- monsters ----------
// fixed stats by tier; families share art and change colour (hue) with the tier
const T = { 1: [70, 19, 6, 8, 8, 6, 10], 2: [170, 36, 13, 16, 11, 14, 20], 3: [330, 54, 21, 24, 14, 26, 36], 4: [560, 74, 30, 34, 17, 42, 60], 5: [860, 94, 39, 44, 20, 60, 85], 6: [1250, 114, 48, 54, 24, 80, 120] };
const mon = (name, art, tier, extra = {}) => { const [hp, atk, def, int, agi, , gold] = T[tier]; return { name, art, tier, hp: Math.round(hp * (extra.hpk || 1)), atk: Math.round(atk * (extra.atkk || 1)), def, int: Math.round(int * (extra.intk || 1)), agi: agi + (extra.agi || 0), gold, ...extra }; };
export const ENEMIES = {
  // slimes
  slime1: mon('青凝膠', 'jelly', 1, { hue: 160, hpk: 0.9 }),
  slime2: mon('毒凝膠', 'jelly', 2, { hue: 150, acts: [['atk', 3], ['spore', 1]] }),
  slime4: mon('熔岩凝膠', 'redjelly', 4, { acts: [['atk', 2], ['ember', 1]] }),
  slime5: mon('寶石凝膠', 'jelly', 5, { hue: 40, sat: 1.3, hpk: 1.2, resist: 'fire' }),
  // birds
  bird1: mon('風雀', 'bird', 1, { agi: 8, hpk: 0.8 }),
  bird3: mon('雷鷹', 'bird', 3, { hue: 200, agi: 8, acts: [['atk', 3], ['bolt', 1]] }),
  bird5: mon('霧鷲', 'bird', 5, { hue: 280, agi: 10, acts: [['atk', 2], ['gust', 1]] }),
  // beasts
  hare1: mon('角兔', 'hare', 1),
  wolf2: mon('靜默之狼', 'wolf', 2, { agi: 4 }),
  wolf4: mon('灰影狼', 'wolf', 4, { hue: 200, agi: 6, acts: [['atk', 3], ['twin', 1]] }),
  // fungi
  shroom1: mon('毒菇', 'shroom', 1, { acts: [['atk', 3], ['spore', 1]] }),
  shroom3: mon('瘴氣菇', 'shroom', 3, { hue: 120, acts: [['atk', 2], ['spore', 1], ['sleepdust', 1]] }),
  // bats
  bat2: mon('洞窟蝙蝠', 'bat', 2, { agi: 6, acts: [['atk', 3], ['drain', 1]] }),
  bat4: mon('吸血蝠', 'bat', 4, { hue: 330, agi: 8, acts: [['atk', 2], ['drain', 2]] }),
  // crabs
  crab1: mon('沙蟹', 'crab', 1, { atkk: 1.1 }),
  crab3: mon('鐵甲蟹', 'crab', 3, { hue: 200, def: 30, acts: [['atk', 3], ['bubble', 1]] }),
  // the dead
  bones2: mon('礦坑骷髏', 'bones', 2, { undead: true, weak: 'light' }),
  bones4: mon('溺死的水手', 'bones', 4, { hue: 150, undead: true, weak: 'light', acts: [['atk', 3], ['twin', 1]] }),
  bones6: mon('止息之兵', 'bones', 6, { hue: 230, undead: true, weak: 'light', acts: [['atk', 3], ['twin', 1]] }),
  // sea folk
  merrow3: mon('魚人', 'merrow', 3, { acts: [['atk', 3], ['twin', 1]] }),
  merrow5: mon('深海魚人', 'merrow', 5, { hue: 260, acts: [['atk', 3], ['wave', 1]] }),
  // wisps
  wisp2: mon('鬼火', 'wisp', 2, { undead: true, weak: 'water', resist: 'fire', acts: [['atk', 1], ['ember', 2]] }),
  wisp4: mon('冷焰', 'wisp', 4, { hue: 190, undead: true, weak: 'fire', resist: 'water', acts: [['atk', 1], ['frost', 2]] }),
  wisp6: mon('虛無之焰', 'wisp', 6, { hue: 270, undead: true, weak: 'light', acts: [['atk', 1], ['still', 1], ['ember', 1]] }),
  // stone
  garg4: mon('石像鬼', 'gargoyle', 4, { weak: 'wind', def: 36 }),
  garg6: mon('黑曜石像', 'gargoyle', 6, { hue: 250, weak: 'wind', def: 50, acts: [['atk', 3], ['quakeT', 1]] }),
  golem5: mon('沙之魔像', 'golem', 5, { weak: 'water', def: 42, hpk: 1.3, acts: [['atk', 3], ['quakeT', 1]] }),
  // serpents
  serp3: mon('沼澤蛇', 'serpent', 3, { hue: 100, acts: [['atk', 3], ['spore', 1]] }),
  serp5: mon('冰之海蛇', 'serpent', 5, { hue: 180, weak: 'fire', acts: [['atk', 3], ['frost', 1]] }),
  // sand and snow
  scorp4: mon('沙漠蠍', 'crab', 4, { hue: 30, sat: 0.7, acts: [['atk', 3], ['spore', 1]] }),
  yeti5: mon('雪原巨猿', 'yeti', 5, { hpk: 1.2, weak: 'fire', acts: [['atk', 3], ['frost', 1]] }),
  // ---------- bosses ----------
  ooze:    mon('止息之泥', 'jelly', 2, { boss: true, hue: 220, hpk: 3.5, atkk: 0.9, gold: 200, acts: [['atk', 3], ['spore', 1], ['still', 1]] }),
  smuggler:mon('走私頭目 格雷夫', 'brigand', 2, { boss: true, hpk: 4.2, gold: 300, acts: [['atk', 3], ['twin', 2]] }),
  wolfking:mon('風喰狼王', 'wolf', 3, { boss: true, hue: 300, hpk: 5.5, agi: 8, gold: 400, acts: [['atk', 2], ['twin', 2], ['gust', 1]] }),
  morgan:  mon('灰燼騎士 摩根', 'knight', 4, { boss: true, hpk: 5.5, atkk: 1.05, gold: 600, acts: [['atk', 3], ['twin', 2], ['still', 1], ['ashfire', 1]] }),
  ide:     mon('靜默女巫 伊黛', 'witch', 4, { boss: true, hpk: 5.2, intk: 1.5, gold: 600, acts: [['frost', 2], ['ember', 2], ['sleepdust', 1], ['still', 1]] }),
  captain: mon('溺死的船長 布雷克', 'bones', 5, { boss: true, hue: 180, hpk: 4.8, gold: 800, undead: true, weak: 'light', acts: [['atk', 3], ['twin', 2], ['wave', 1]] }),
  sandking:mon('沙之王 拉赫', 'sandking', 5, { boss: true, hpk: 5.2, gold: 900, weak: 'water', acts: [['atk', 2], ['quakeT', 2], ['sandstorm', 2], ['still', 1]] }),
  frostqueen:mon('冰后 雪蘿', 'witch', 5, { boss: true, hue: 170, hpk: 5.6, intk: 1.6, gold: 900, weak: 'fire', acts: [['frost', 3], ['blizzard', 2], ['atk', 1], ['still', 1]] }),
  nul:     mon('止息之神 涅爾', 'nul', 6, { boss: true, hpk: 6.4, atkk: 1.1, intk: 1.4, gold: 0, acts: [['atk', 2], ['stillness', 2], ['blizzard', 1], ['ashfire', 1], ['twin', 1]] }),
};
// what monsters do besides hitting
export const TECHS = {
  spore:     { name: '毒孢子', kind: 'status', status: 'poison', target: 'one', fx: 'spore' },
  sleepdust: { name: '睡眠粉', kind: 'status', status: 'sleep', target: 'all', fx: 'sleep' },
  ember:     { name: '火球', kind: 'magic', power: 14, k: 1.0, el: 'fire', target: 'one', fx: 'fire' },
  frost:     { name: '冰息', kind: 'magic', power: 16, k: 1.0, el: 'water', target: 'one', fx: 'ice' },
  bolt:      { name: '落雷', kind: 'magic', power: 18, k: 1.0, el: 'wind', target: 'one', fx: 'bolt' },
  gust:      { name: '狂風', kind: 'magic', power: 12, k: 0.7, el: 'wind', target: 'all', fx: 'wind' },
  drain:     { name: '吸血', kind: 'drain', power: 1.0, target: 'one', fx: 'drain' },
  twin:      { name: '連擊', kind: 'twin', target: 'one', fx: 'slash' },
  bubble:    { name: '泡沫', kind: 'magic', power: 14, k: 0.7, el: 'water', target: 'all', fx: 'bubble' },
  wave:      { name: '海嘯', kind: 'magic', power: 22, k: 0.8, el: 'water', target: 'all', fx: 'bubble' },
  quakeT:    { name: '地鳴', kind: 'magic', power: 20, k: 0.8, el: 'earth', target: 'all', fx: 'quake' },
  sandstorm: { name: '沙暴', kind: 'magic', power: 26, k: 0.9, el: 'earth', target: 'all', fx: 'wind' },
  blizzard:  { name: '暴風雪', kind: 'magic', power: 30, k: 0.9, el: 'water', target: 'all', fx: 'ice' },
  ashfire:   { name: '灰燼之火', kind: 'magic', power: 28, k: 1.0, el: 'fire', target: 'all', fx: 'fire' },
  still:     { name: '止息', kind: 'status', status: 'sleep', target: 'one', fx: 'still' },
  stillness: { name: '永恆的靜止', kind: 'magic', power: 46, k: 1.0, el: 'dark', target: 'all', fx: 'abyss' },
};

// ---------- where monsters live ----------
// encounter tables per region tier: [weight, [enemy ids]]
export const GROUPS = {
  1: [[4, ['slime1', 'slime1']], [3, ['bird1', 'hare1']], [3, ['shroom1', 'slime1']], [2, ['crab1']], [2, ['hare1', 'hare1', 'bird1']]],
  2: [[3, ['wolf2', 'wolf2']], [3, ['slime2', 'bat2']], [2, ['bones2', 'bones2']], [2, ['wisp2', 'bat2']], [2, ['wolf2', 'slime2', 'bird1']]],
  3: [[3, ['shroom3', 'serp3']], [3, ['bird3', 'bird3']], [2, ['merrow3', 'crab3']], [2, ['wolf2', 'wolf2', 'bird3']], [2, ['serp3']]],
  4: [[3, ['wolf4', 'wolf4']], [3, ['bat4', 'wisp4']], [2, ['garg4']], [2, ['scorp4', 'scorp4']], [2, ['bones4', 'bones4', 'wisp4']]],
  5: [[3, ['yeti5']], [3, ['serp5', 'bird5']], [2, ['golem5']], [2, ['merrow5', 'merrow5']], [2, ['slime5', 'bird5']]],
  6: [[3, ['bones6', 'bones6']], [3, ['garg6']], [2, ['wisp6', 'wisp6']], [2, ['bones6', 'wisp6', 'garg6']]],
};

// ---------- shops ----------
export const SHOPS = {
  valmont:  { items: ['herb', 'hiherb', 'antidote', 'smoke', 'tonic'], arms: ['shortsword', 'broadsword', 'shortspear', 'longspear', 'leather', 'chain', 'plate', 'guardring'] },
  mistport: { items: ['herb', 'antidote', 'smoke', 'ether'], arms: ['knife', 'dirk', 'cutlass', 'huntbow', 'cloth', 'leather', 'featherboots'] },
  grassea:  { items: ['herb', 'antidote', 'tonic'], arms: ['huntbow', 'longbow', 'shortspear', 'longspear', 'hide'] },
  ironclaw: { items: ['herb', 'hiherb', 'tonic'], arms: ['claymore', 'zweihander', 'handaxe', 'battleaxe', 'cestus', 'chain', 'plate', 'powerbelt'] },
  astralis: { items: ['herb', 'ether', 'antidote'], arms: ['oakstaff', 'sagestaff', 'robe', 'sagerobe', 'sagering'], spells: ['fireball', 'firewall', 'heal', 'icearrow', 'cure', 'windblade', 'stone', 'stoneskin', 'haste', 'sleep', 'drain'] },
  saltreach:{ items: ['herb', 'hiherb', 'ether', 'smoke'], arms: ['cutlass', 'broadsword', 'handaxe', 'battleaxe', 'coat', 'dirk'] },
  dunehold: { items: ['hiherb', 'tonic', 'ether'], arms: ['knightsword', 'zweihander', 'longspear', 'longbow', 'plate'], spells: ['inferno', 'healrain', 'tornado', 'quake', 'holy', 'revive'] },
  frostpeak:{ items: ['hiherb', 'tonic', 'ether', 'antidote'], arms: ['knightsword', 'battleaxe', 'longbow', 'sagestaff', 'plate', 'sagerobe'] },
};

// ---------- English ----------
localize(HEROES, {
  rion: ['Rion', 'Squire'], sela: ['Sela', 'Grass Sea Huntress'], gusta: ['Gusta', 'Mercenary'], mico: ['Mico', 'Harbour Thief'],
  fia: ['Fia', 'Apprentice Mage'], karon: ['Karon', 'Old Captain'], bass: ['Bass', 'Brawler'], lulu: ['Lulu', 'Wandering Healer'], tarin: ['Tarin', 'Wandering Lancer'],
}, ['name', 'title']);
localize(ITEMS, {
  herb: ['Herb', 'Restores 60 HP'], hiherb: ['Elixir', 'Restores 220 HP'], tonic: ['Vigour Wine', 'Restores 10 WP'], ether: ['Spirit Water', 'Restores 10 JP'],
  antidote: ['Antidote', 'Cures poison'], smoke: ['Smoke Bomb', 'Always escape a battle'], lifewind: ['Breath of Life', 'Restores 3 LP'],
  shortsword: ['Short Sword'], broadsword: ['Broadsword'], cutlass: ['Cutlass'], knightsword: ['Knight Sword'], windblade: ['Thousand Winds'],
  claymore: ['Claymore'], zweihander: ['Zweihander'], dragonfang: ['Dragonfang'], handaxe: ['Hand Axe'], battleaxe: ['Battle Axe'], stormaxe: ['Storm Axe'],
  shortspear: ['Short Spear'], longspear: ['Long Spear'], skylance: ['Sky Lance'], huntbow: ['Hunting Bow'], longbow: ['Longbow'], galebow: ['Gale Bow'],
  knife: ['Knife'], dirk: ['Dirk'], moonfang: ['Moonfang'], cestus: ['Iron Cestus'], oakstaff: ['Oak Staff'], sagestaff: ['Sage Staff'], starstaff: ['Star Staff'],
  cloth: ['Clothes'], robe: ['Robe'], hide: ['Hide Armour'], leather: ['Leather'], coat: ["Captain's Coat"], chain: ['Chain Mail'], plate: ['Plate Armour'],
  sagerobe: ['Sage Robe'], windmail: ['Wind Mail'], thiefring: ["Thief's Ring"], powerbelt: ['Power Belt'], guardring: ['Guard Ring'], sagering: ['Sage Ring'],
  featherboots: ['Feather Boots'], windfeather: ['Wind Feather'],
  st_dawn: ['Dawn Stone', 'The wind that wakes the morning.'], st_west: ['West Stone', 'The wind that carries ships far away.'],
  st_east: ['East Stone', 'The wind that brings spring rain.'], st_gale: ['Gale Stone', 'The wind that runs through the mountains.'],
  st_breeze: ['Breeze Stone', 'The wind that turns the pages of books.'], st_south: ['South Stone', 'A warm wind that tastes of salt.'],
  st_dusk: ['Dusk Stone', 'The wind that sends the day away.'], st_north: ['North Stone', 'A cold wind, but a clear one.'],
  shipwheel: ["Ghost Ship's Wheel", "The old captain's wheel."], libkey: ['Library Key', 'The key to the vault beneath the Astral Academy.'],
  sunseal: ['Sun Seal', 'A pass into the Sand Temple.'],
});
localize(ARTS, {
  double: ['Double Slash'], windcut: ['Wind Cut'], galethrust: ['Gale Thrust'], moonshade: ['Moonshadow'], thousand: ['Thousand Winds'],
  rockbreak: ['Rockbreaker'], whirl: ['Whirlwind'], steelcleave: ['Steelcleave'], skyfall: ['Skyfall'],
  heavychop: ['Heavy Chop'], tomahawk: ['Tomahawk'], groundsplit: ['Ground Split'], bearrage: ['Bear Rage'],
  twinthrust: ['Twin Thrust'], charge: ['Charge'], dragontail: ['Dragon Tail'], heavenlance: ['Heaven Lance'],
  quickshot: ['Quick Shot'], stitch: ['Shadowstitch'], arrowrain: ['Arrow Rain'], starfall: ['Starfall'],
  sneak: ['Sneak Stab'], venom: ['Venom Edge'], swallow: ['Swallow Turn'], thousandfang: ['Thousand Fangs'],
  jab: ['Jab Combo'], suplex: ['Suplex'], whirlkick: ['Whirl Kick'], hundredfist: ['Hundred Fists'],
  bonk: ['Bonk'], stunstrike: ['Stun Strike'],
});
localize(SPELLS, {
  fireball: ['Fireball'], firewall: ['Fire Wall'], inferno: ['Inferno'], heal: ['Healing Water'], icearrow: ['Ice Arrow'], healrain: ['Healing Rain'],
  cure: ['Purify'], windblade: ['Wind Blade'], haste: ['Swift Feet'], tornado: ['Tornado'], stone: ['Stone Bullet'], stoneskin: ['Stoneskin'],
  quake: ['Quake'], holy: ['Holy Light'], revive: ['Revive'], drain: ['Drain'], sleep: ['Sleep'],
});
localize(ENEMIES, {
  slime1: ['Blue Jelly'], slime2: ['Venom Jelly'], slime4: ['Lava Jelly'], slime5: ['Gem Jelly'], bird1: ['Wind Sparrow'], bird3: ['Thunder Hawk'], bird5: ['Mist Eagle'],
  hare1: ['Horn Hare'], wolf2: ['Silent Wolf'], wolf4: ['Shadow Wolf'], shroom1: ['Toadstool'], shroom3: ['Miasma Cap'], bat2: ['Cave Bat'], bat4: ['Vampire Bat'],
  crab1: ['Sand Crab'], crab3: ['Iron Crab'], bones2: ['Mine Skeleton'], bones4: ['Drowned Sailor'], bones6: ['Stilled Soldier'], merrow3: ['Merrow'], merrow5: ['Deep Merrow'],
  wisp2: ['Will-o-Wisp'], wisp4: ['Cold Flame'], wisp6: ['Void Flame'], garg4: ['Gargoyle'], garg6: ['Obsidian Gargoyle'], golem5: ['Sand Golem'],
  serp3: ['Marsh Serpent'], serp5: ['Ice Serpent'], scorp4: ['Desert Scorpion'], yeti5: ['Snow Ape'],
  ooze: ['The Still Ooze'], smuggler: ['Grave the Smuggler'], wolfking: ['Windeater'], morgan: ['Morgan the Ash Knight'],
  ide: ['Ide the Silent Witch'], captain: ['Blake the Drowned'], sandking: ['Rah the Sand King'], frostqueen: ['Sirol the Frost Queen'], nul: ['Nul, God of Stillness'],
});
localize(TECHS, {
  spore: ['Poison Spore'], sleepdust: ['Sleep Dust'], ember: ['Fireball'], frost: ['Frost Breath'], bolt: ['Lightning'], gust: ['Gale'], drain: ['Blood Drain'],
  twin: ['Double Hit'], bubble: ['Bubbles'], wave: ['Tidal Wave'], quakeT: ['Earth Rumble'], sandstorm: ['Sandstorm'], blizzard: ['Blizzard'], ashfire: ['Ash Fire'],
  still: ['Stillness'], stillness: ['Eternal Stillness'],
});
export const kindName = (k) => { const n = KIND_NAMES[k] || [k, k]; return n; };
