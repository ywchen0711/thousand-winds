// The field menu (items, techniques, magic, equipment, status, order, save, settings), the shops,
// the spell shops where heroes learn magic, and the tavern where companions can wait for you.
import { ctx, W, H, text, textW, windowBox, HAND_D } from './gfx.js';
import { sprite } from './sprites.js';
import { ITEMS, SPELLS, ARTS, HEROES, WEAPONS, SCHOOLS, KIND_NAMES } from './data.js';
import { S, stats, addItem, count, save, weaponsOf } from './party.js';
import { menu, panel, notice, ask, pressKey, widget, wrap, fit } from './ui.js';
import { input } from './input.js';
import { sfx, vol, setVolumes, music, setMusic } from './audio.js';
import { healAmount, spellPow } from './rules.js';
import { L, LANG, isEn, setLang } from './i18n.js';

export const settings = { scan: true };
const SKEY = 'thousandwinds-settings';
const fmtTime = (t) => { const s = Math.floor(t / 60), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; };
const kname = (k) => L(KIND_NAMES[k][0], KIND_NAMES[k][1]);
const SLOTS = () => [['weapon', L('武器一', 'Weapon 1')], ['weapon2', L('武器二', 'Weapon 2')], ['armor', L('防具', 'Armour')], ['acc', L('飾品', 'Accessory')]];

// while a member is being chosen the party panel itself is the picker: { i, ok }
let pick = null;
// sub-screens that cover the whole top of the screen hide the party/gold panels behind them
let base = true;
function drawParty(x, y, w, sel = -1) {
  windowBox(x, y, w, 8 + S.members.length * 40);
  S.members.forEach((m, i) => {
    const s = stats(m), yy = y + 6 + i * 40;
    if (i === sel) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 4, yy - 2, w - 8, 38); }
    ctx.drawImage(sprite(m.id).d[0], x + 8, yy + 6);
    text(m.name, x + 30, yy, '#f8f8f8');
    text(`LP ${m.lp}/${s.maxlp}`, x + w - 8, yy, m.lp <= 2 ? '#f86060' : '#f878a8', { align: 'right' });
    text(`HP ${m.hp}/${s.maxhp}`, x + 30, yy + 13, m.hp < s.maxhp / 4 ? '#f8e070' : '#f8f8f8');
    text(`WP ${m.wp}  JP ${m.jp}`, x + 30, yy + 25, '#c0d0f8');
    if (pick && !pick.ok(m)) { ctx.fillStyle = 'rgba(8,8,40,0.55)'; ctx.fillRect(x + 4, yy - 2, w - 8, 38); }
  });
}
// choose a member right on the party panel, so no extra window covers their LP and HP;
// the panel is drawn here too, so this also works in the shops (ty moves the title below a gold window)
async function pickMember(title, filter = () => true, ty = 4) {
  const keep = base; base = true;
  let t = 0;
  pick = { i: Math.max(0, S.members.findIndex(filter)), ok: filter };
  const r = await widget({
    update() {
      const n = S.members.length;
      t++;
      if (input.repeat('down')) { pick.i = (pick.i + 1) % n; sfx('cursor'); }
      if (input.repeat('up')) { pick.i = (pick.i + n - 1) % n; sfx('cursor'); }
      if (input.pressed('a')) { if (!filter(S.members[pick.i])) { sfx('buzz'); return; } sfx('ok'); this.done(pick.i); } else if (input.pressed('b')) { sfx('cancel'); this.done(-1); }
    },
    draw() {
      drawParty(4, 4, 150, pick.i);
      // the title stays right of the party panel; a long one wraps onto a second line
      const tl = wrap(title, 76);
      windowBox(158, ty, 94, 12 + tl.length * 14); tl.forEach((l, k) => text(l, 167, ty + 6 + k * 14, '#f8e070'));
      ctx.drawImage(HAND_D, 15, 4 + pick.i * 40 + ((t >> 3) % 2));
    },
  });
  pick = null; base = keep;
  return r < 0 ? null : S.members[r];
}

// ---------- field menu ----------
export async function fieldMenu(ctxInfo) {
  const close = panel(() => {
    if (!base) return;
    drawParty(4, 4, 150, -1);
    windowBox(158, 168, 94, 52);
    text(`${S.gold} G`, 244, 174, '#f8e070', { align: 'right' });
    text(fmtTime(S.time), 244, 190, '#f8f8f8', { align: 'right' });
    text(L(`第 ${S.era + 1} 紀`, `Era ${S.era + 1}`), 244, 204, '#a0c0f8', { align: 'right' });
  });
  let last = 0;
  for (;;) {
    const r = await menu([
      L('道具', 'Items'), L('技能', 'Arts'), L('魔法', 'Magic'), L('裝備', 'Equip'), L('狀態', 'Status'), L('隊形', 'Order'), { label: L('存檔', 'Save'), disabled: !ctxInfo.canSave }, L('設定', 'Config'),
    ], { x: 162, y: 4, w: 90, start: last });
    if (r < 0) break;
    last = r;
    if (r === 0) await itemMenu();
    if (r === 1) await artsMenu();
    if (r === 2) await magicMenu();
    if (r === 3) await equipMenu();
    if (r === 4) await statusMenu();
    if (r === 5) await orderMenu();
    if (r === 6) { const ok = save(0); sfx(ok ? 'save' : 'buzz'); await notice(ok ? L('記錄完成。', 'Saved.') : L('無法存檔（瀏覽器不允許）。', "Can't save (the browser blocked it).")); }
    if (r === 7) await settingsMenu();
  }
  close();
}
function itemDesc(it) {
  if (it.desc) return it.desc;
  const parts = [];
  if (it.kind) parts.push(kname(it.kind));
  if (it.atk) parts.push(`${L('攻擊', 'ATK')}+${it.atk}`);
  if (it.def) parts.push(`${L('防禦', 'DEF')}+${it.def}`);
  for (const [k, v] of Object.entries(it.bonus || {})) parts.push(`${L({ str: '力', vit: '體', agi: '速', wil: '意' }, { str: 'STR', vit: 'VIT', agi: 'AGI', wil: 'WIL' })[k]}+${v}`);
  return parts.join('  ');
}
async function itemMenu() {
  for (;;) {
    const list = Object.keys(S.inv).sort((a, b) => (ITEMS[a].key ? 2 : ITEMS[a].slot ? 1 : 0) - (ITEMS[b].key ? 2 : ITEMS[b].slot ? 1 : 0));
    if (!list.length) { await notice(L('什麼都沒有。', 'Nothing here.')); return; }
    let desc = '';
    base = false;
    const close = panel(() => { windowBox(4, 182, W - 8, 38); wrap(desc, W - 28).slice(0, 2).forEach((l, i) => text(l, 14, (l === desc ? 194 : 187) + i * 15)); });
    const r = await menu(list.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].key ? '' : S.inv[id], color: ITEMS[id].stone ? '#a0f8d0' : undefined })), { x: 4, y: 4, w: W - 8, cols: 2, maxRows: 10, onMove: (i) => { desc = itemDesc(ITEMS[list[i]]); } });
    close(); base = true;
    if (r < 0) return;
    const id = list[r], it = ITEMS[id];
    if (!it.use || it.use === 'escape') { sfx('buzz'); continue; }
    const target = await pickMember(L('給誰使用？', 'Use on whom?'));
    if (!target) continue;
    useItemOn(id, target);
  }
}
export function useItemOn(id, m) {
  const it = ITEMS[id], s = stats(m);
  if (it.use === 'heal') m.hp = Math.min(s.maxhp, m.hp + it.power);
  if (it.use === 'wp') m.wp = Math.min(s.maxwp, m.wp + it.power);
  if (it.use === 'jp') m.jp = Math.min(s.maxjp, m.jp + it.power);
  if (it.use === 'lp') m.lp = Math.min(s.maxlp, m.lp + it.power);
  if (it.use === 'cure') delete m.status.poison;
  addItem(id, -1); sfx('heal');
}
async function artsMenu() {
  const m = await pickMember(L('查看誰的技能？', 'Whose arts?'));
  if (!m) return;
  const list = m.arts.length ? m.arts : [];
  if (!list.length) { await notice(L('還沒有學會任何技能。戰鬥中會靈光一閃喔！', 'No arts yet. Inspiration strikes in battle!')); return; }
  await menu(list.map((a) => ({ label: `${ARTS[a].name}`, right: `${kname(ARTS[a].kind)} ${ARTS[a].wp}` })), { x: 30, y: 20, w: 196, title: `${m.name}  WP ${m.wp}`, maxRows: 10 });
}
async function magicMenu() {
  const healing = (id) => ['heal', 'healrain', 'cure', 'revive'].includes(id);
  const caster = await pickMember(L('誰要施法？', 'Who casts?'), (m) => m.hp > 0 && m.spells.some(healing));
  if (!caster) return;
  for (;;) {
    const list = caster.spells;
    const r = await menu(list.map((id) => ({ label: SPELLS[id].name, right: SPELLS[id].jp, disabled: !healing(id) || SPELLS[id].jp > caster.jp })), { x: 60, y: 40, w: 170, title: `${caster.name}  JP ${caster.jp}` });
    if (r < 0) return;
    const sp = SPELLS[list[r]], st = stats(caster), pow = spellPow(sp.power || 0, st, caster.skills[sp.school] || 0);
    if (sp.target === 'allies') { caster.jp -= sp.jp; for (const m of S.members) if (m.hp > 0) m.hp = Math.min(stats(m).maxhp, m.hp + healAmount(pow * 0.7)); sfx('heal'); continue; }
    const t = await pickMember(L('對誰施放？', 'Cast on whom?'), (m) => (sp.type === 'revive' ? m.hp <= 0 : true));
    if (!t) continue;
    caster.jp -= sp.jp; sfx('heal');
    if (sp.type === 'heal') t.hp = Math.min(stats(t).maxhp, t.hp + healAmount(pow));
    if (sp.type === 'cure') delete t.status.poison;
    if (sp.type === 'revive') t.hp = Math.round(stats(t).maxhp * 0.5);
  }
}
async function equipMenu() {
  const m = await pickMember(L('誰要換裝備？', 'Equip whom?'));
  if (!m) return;
  base = false;
  try { await equipScreen(m); } finally { base = true; }
}
async function equipScreen(m) {
  for (;;) {
    const close = panel(() => {
      const st = stats(m), ws = weaponsOf(m);
      windowBox(4, 126, W - 8, 58);
      text(`${L('防禦', 'DEF')} ${st.dfn}   ${L('力', 'STR')} ${st.str}  ${L('體', 'VIT')} ${st.vit}  ${L('速', 'AGI')} ${st.agi}  ${L('意', 'WIL')} ${st.wil}`, 14, 133, '#c0d0f8');
      // one weapon per line: the name, then its skill on the right
      ws.forEach((w, i) => { text(fit(w.id ? ITEMS[w.id].name : L('空手', 'Fists'), 150), 14, 148 + i * 14); text(`${kname(w.kind)} Lv${m.skills[w.kind] || 0}`, W - 14, 148 + i * 14, '#c0d0f8', { align: 'right' }); });
    });
    const r = await menu(SLOTS().map(([k, n]) => ({ label: n, right: m.equip[k] ? ITEMS[m.equip[k]].name : '──' })), { x: 4, y: 28, w: 220, title: L(`${m.name}的裝備`, `${m.name}'s equipment`) });
    close();
    if (r < 0) return;
    const slot = SLOTS()[r][0], want = slot === 'weapon2' ? 'weapon' : slot;
    const opts = Object.keys(S.inv).filter((id) => ITEMS[id].slot === want);
    const labels = [{ label: L('（卸下）', '(Remove)') }, ...opts.map((id) => ({ label: ITEMS[id].name, right: S.inv[id] }))];
    let info = '';
    const close2 = panel(() => { if (info) { windowBox(4, 186, W - 8, 34); text(fit(info, W - 28), 14, 196); } });
    const k = await menu(labels, { x: 40, y: 28, w: 196, title: SLOTS()[r][1], maxRows: 8, onMove: (i) => { info = i === 0 ? '' : itemDesc(ITEMS[opts[i - 1]]); } });
    close2();
    if (k < 0) continue;
    const cur = m.equip[slot];
    if (cur) addItem(cur, 1);
    if (k === 0) m.equip[slot] = null;
    else { m.equip[slot] = opts[k - 1]; addItem(opts[k - 1], -1); }
    sfx('ok');
  }
}
export async function statusMenu() {
  const m = await pickMember(L('查看誰的狀態？', 'Whose status?'));
  if (!m) return;
  const close = panel(() => {
    const st = stats(m);
    windowBox(4, 4, W - 8, H - 8);
    ctx.drawImage(sprite(m.id).d[0], 14, 14);
    text(`${m.name}`, 38, 12, '#f8e070'); text(HEROES[m.id].title, 38, 26, '#c0d0f8');
    text(`LP ${m.lp}/${st.maxlp}`, 160, 12, '#f878a8'); text(`HP ${m.hp}/${st.maxhp}`, 160, 26);
    text(`WP ${m.wp}/${st.maxwp}`, 14, 46); text(`JP ${m.jp}/${st.maxjp}`, 90, 46); text(`${L('防禦', 'DEF')} ${st.dfn}`, 170, 46);
    text(`${L('力', 'STR')} ${st.str}`, 14, 62); text(`${L('體', 'VIT')} ${st.vit}`, 74, 62); text(`${L('速', 'AGI')} ${st.agi}`, 134, 62); text(`${L('意', 'WIL')} ${st.wil}`, 194, 62);
    text(L('技能等級', 'Skill levels'), 14, 82, '#a0c0f8');
    const ks = [...WEAPONS, ...SCHOOLS];
    ks.forEach((k, i) => { const x = 14 + (i % 4) * 58, y = 98 + Math.floor(i / 4) * 15, lv = m.skills[k] || 0; text(isEn() && k === 'great' ? 'Great' : kname(k), x, y, lv ? '#f8f8f8' : '#6870a0'); text(String(lv), x + 52, y, lv ? '#f8e070' : '#6870a0', { align: 'right' }); });
    text(L(`技能 ${m.arts.length} 種　魔法 ${m.spells.length} 種`, `${m.arts.length} arts   ${m.spells.length} spells`), 14, 164, '#a0c0f8');
    const sp = m.spells.map((s) => SPELLS[s].name).join(L('、', ', '));
    text(fit(sp, W - 28), 14, 180);
    text(fit(L(`裝備：${['weapon', 'weapon2'].map((k) => (m.equip[k] ? ITEMS[m.equip[k]].name : '──')).join(' / ')}`, `Arms: ${['weapon', 'weapon2'].map((k) => (m.equip[k] ? ITEMS[m.equip[k]].name : '--')).join(' / ')}`), W - 28), 14, 198);
  });
  await pressKey();
  close();
}
async function orderMenu() {
  if (S.members.length < 2) return;
  const a = await pickMember(L('要和誰換位置？', 'Swap whom?'));
  if (!a) return;
  const b = await pickMember(L('換到哪裡？', 'With whom?'), (m) => m !== a);
  if (!b) return;
  const i = S.members.indexOf(a), j = S.members.indexOf(b);
  [S.members[i], S.members[j]] = [S.members[j], S.members[i]];
  sfx('ok');
}
async function settingsMenu() {
  for (;;) {
    const lv = (v) => '■'.repeat(Math.round(v * 5)) + '□'.repeat(5 - Math.round(v * 5));
    const r = await menu([{ label: L('音樂', 'Music'), right: music.on ? lv(vol.music) : L('關', 'Off') }, { label: L('音效', 'Sound'), right: lv(vol.sfx) }, { label: L('掃描線', 'Scanlines'), right: settings.scan ? L('開', 'On') : L('關', 'Off') }, { label: L('語言', 'Language'), right: LANG === 'en' ? 'English' : '中文' }], { x: 60, y: 60, w: 170, title: L('設定', 'Config') });
    if (r < 0) return;
    // turning it up from off switches the music back on; past the top it goes off
    if (r === 0) { if (!music.on) setMusic(true); else if (vol.music >= 1) setMusic(false); else vol.music = Math.min(1, (Math.round(vol.music * 5) + 1) / 5); }
    if (r === 1) vol.sfx = (Math.round(vol.sfx * 5) + 1) % 6 / 5;
    if (r === 2) { settings.scan = !settings.scan; document.body.classList.toggle('noscan', !settings.scan); }
    if (r === 3) setLang(LANG === 'en' ? 'zh' : 'en');
    setVolumes();
    try { localStorage.setItem(SKEY, JSON.stringify({ music: vol.music, sfx: vol.sfx, scan: settings.scan })); } catch (e) { /* private mode */ }
  }
}
export function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(SKEY)); if (s) { vol.music = s.music; vol.sfx = s.sfx; settings.scan = s.scan; document.body.classList.toggle('noscan', !s.scan); } } catch (e) { /* none */ }
}

// ---------- shops ----------
export async function shop(stock, greeting = L('歡迎光臨！', 'Welcome!')) {
  const close = panel(() => { windowBox(170, 4, 82, 24); text(`${S.gold} G`, 244, 10, '#f8e070', { align: 'right' }); });
  for (;;) {
    const r = await ask('店員', greeting, [L('購買', 'Buy'), L('出售', 'Sell'), L('離開', 'Leave')], { cancel: true });
    if (r === 0) await buy(stock);
    else if (r === 1) await sell();
    else break;
    greeting = L('還需要什麼嗎？', 'Anything else?');
  }
  close();
}
async function buy(stock) {
  let info = '';
  for (;;) {
    const close = panel(() => { windowBox(4, 174, W - 8, 46); if (info) info.split('\n').forEach((l, i) => text(l, 12, 180 + i * 16)); });
    const r = await menu(stock.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].price, disabled: ITEMS[id].price > S.gold })), {
      x: 4, y: 32, w: 170, maxRows: 7, title: L('要買什麼？', 'Buy what?'),
      onMove: (i) => { const it = ITEMS[stock[i]]; info = `${itemDesc(it)}\n${L('持有', 'Owned')} ${count(stock[i])}`; },
    });
    close();
    if (r < 0) return;
    const id = stock[r], it = ITEMS[id];
    if (it.price > S.gold) { sfx('buzz'); continue; }
    S.gold -= it.price; addItem(id); sfx('chest');
  }
}
async function sell() {
  for (;;) {
    const list = Object.keys(S.inv).filter((id) => !ITEMS[id].key && ITEMS[id].price > 0);
    if (!list.length) { await notice(L('沒有可以賣的東西。', 'Nothing to sell.')); return; }
    const r = await menu(list.map((id) => ({ label: `${ITEMS[id].name}×${S.inv[id]}`, right: Math.floor(ITEMS[id].price / 2) })), { x: 4, y: 32, w: 190, maxRows: 9, title: L('要賣什麼？', 'Sell what?') });
    if (r < 0) return;
    addItem(list[r], -1); S.gold += Math.floor(ITEMS[list[r]].price / 2); sfx('ok');
  }
}
// spells are taught to one hero at a time
export async function spellShop(stock, greeting = L('想學什麼魔法呢？', 'Which spell would you like to learn?')) {
  const close = panel(() => { windowBox(170, 4, 82, 24); text(`${S.gold} G`, 244, 10, '#f8e070', { align: 'right' }); });
  await ask('店員', greeting, [L('看看', 'Browse')], { cancel: true });
  for (;;) {
    let info = '';
    const c2 = panel(() => { windowBox(4, 174, W - 8, 46); if (info) info.split('\n').forEach((l, i) => text(l, 12, 180 + i * 16)); });
    const r = await menu(stock.map((id) => ({ label: SPELLS[id].name, right: SPELLS[id].price, disabled: SPELLS[id].price > S.gold })), {
      x: 4, y: 32, w: 170, maxRows: 7, title: L('魔法', 'Spells'),
      onMove: (i) => { const sp = SPELLS[stock[i]]; const who = S.members.filter((m) => m.spells.includes(stock[i])).map((m) => m.name).join(L('、', ', ')); info = `${kname(sp.school)}  JP ${sp.jp}\n${who ? L(`已學會：${who}`, `Known by: ${who}`) : ''}`; },
    });
    c2();
    if (r < 0) break;
    const id = stock[r], sp = SPELLS[id];
    if (sp.price > S.gold) { sfx('buzz'); continue; }
    const m = await pickMember(L('教給誰？', 'Teach whom?'), (x) => !x.spells.includes(id), 32);
    if (!m) continue;
    S.gold -= sp.price; m.spells.push(id); if (!m.skills[sp.school]) m.skills[sp.school] = 1;
    sfx('level');
    await notice(L(`${m.name}學會了${sp.name}！`, `${m.name} learned ${sp.name}!`));
  }
  close();
}
// the tavern: companions can wait here and be asked back later
export async function partyMenu() {
  const others = S.members.filter((m) => m.id !== S.lead);
  if (!others.length) { await notice(L('現在沒有同伴。', 'You have no companions right now.')); return; }
  const r = await menu(others.map((m) => ({ label: m.name, right: `LP ${m.lp}` })), { x: 80, y: 40, w: 160, title: L('誰要暫時離隊？', 'Who will wait here?') });
  if (r < 0) return;
  const m = others[r];
  S.members.splice(S.members.indexOf(m), 1);
  S.bench = S.bench || {}; S.bench[m.id] = m;
  S.flags[m.id] = false;
  sfx('ok');
  await notice(L(`${m.name}回到了原本的地方。`, `${m.name} went back to where you first met.`));
}
void textW;
