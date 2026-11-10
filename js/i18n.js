// Language switching. Text is written in place as L('中文', 'English'); data tables get
// getters so .name and .desc follow the current language.

function initial() {
  try { const v = localStorage.getItem('thousandwinds-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'zh'; }
}
export let LANG = initial();
const hooks = [];
export function onLang(f) { hooks.push(f); }
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem('thousandwinds-lang', l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; } catch (e) { /* node */ }
  for (const f of hooks) f(l);
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);

// table: { id: { name, desc, ... } }; en: { id: [name, desc] } or { id: { name, desc } }
export function localize(table, en, fields = ['name', 'desc']) {
  for (const [id, tr] of Object.entries(en)) {
    const o = table[id];
    if (!o) continue;
    const vals = Array.isArray(tr) ? Object.fromEntries(fields.map((f, i) => [f, tr[i]])) : tr;
    for (const [f, v] of Object.entries(vals)) {
      if (v === undefined) continue;
      const zh = o[f];
      Object.defineProperty(o, f, { get: () => (LANG === 'en' ? v : zh), enumerable: true, configurable: true });
    }
  }
}

// speaker names in dialogue
const NAMES = {
  利恩: 'Rion', 賽菈: 'Sela', 古斯塔: 'Gusta', 米可: 'Mico', 妃雅: 'Fia', 卡隆: 'Karon', 巴斯: 'Bass', 露露: 'Lulu', 塔林: 'Tarin',
  國王: 'King', 大臣: 'Minister', 奶奶: 'Grandmother', 公會長: 'Guildmaster', 寡婦: 'Widow', 皮姆: 'Pim', 學院長: 'Headmaster',
  老水手: 'Old Sailor', 衛兵: 'Guard', 男孩: 'Boy', 商人: 'Merchant', 老人: 'Old Man', 婦人: 'Woman', 老騎士: 'Old Knight', 水手: 'Sailor',
  魚販: 'Fishmonger', 乞丐: 'Beggar', 小女孩: 'Girl', 牧童: 'Shepherd', 騎手: 'Rider', 織布婦: 'Weaver', 哨兵: 'Lookout', 礦工: 'Miner',
  鐵匠: 'Smith', 學生: 'Student', 學者: 'Scholar', 管理員: 'Caretaker', 海盜: 'Pirate', 老婆婆: 'Old Woman', 蘇丹: 'Sultan', 舞者: 'Dancer',
  旅人: 'Traveller', 獵人: 'Hunter', 長老: 'Elder', 村長夫人: "Chief's Wife", 老兵: 'Old Soldier', 格雷夫: 'Grave', 摩根: 'Morgan',
  灰燼騎士: 'Ash Knight', 伊黛: 'Ide', 布雷克: 'Blake', 拉赫: 'Rah', 雪蘿: 'Sirol', 涅爾: 'Nul', 老闆: 'Keeper', 店員: 'Clerk', '？？？': '???',
};
export const speaker = (n) => (n && LANG === 'en' ? NAMES[n] || n : n);
