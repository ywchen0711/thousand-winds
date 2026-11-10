// Story scripts for 千風群英譚 Saga of a Thousand Winds. Each one is async and gets E, the toolbox
// main.js hands over. Every line is written as L('中文', 'English').
import { ITEMS, SHOPS, HEROES, STONES } from './data.js';
import { S } from './party.js';
import { L } from './i18n.js';

const town = (e) => (e && e.id ? e.id.split('_')[0] : S.loc);
const nm = (id) => HEROES[id].name;
const leadIs = (id) => S.lead === id;

// ---------- rumours in the taverns ----------
// the first one you have not heard yet is told; some open new places on the world map
const RUMORS = {
  valmont: [
    { id: 'v_aq', text: ['聽說城裡的「晨之鐘」不響了。地下的舊水道冒出一股冰冷的空氣，連老鼠都不動了。', 'They say the Dawn Bell has gone silent. Cold air seeps up from the old aqueduct underground. Even the rats have stopped moving.'], reveal: ['aqueduct'] },
    { id: 'v_mist', text: ['往西走就是霧港。小偷和走私販子很多，不過什麼消息都打聽得到。', 'Head west and you reach Mistport. Full of thieves and smugglers, but you can hear any news there.'], reveal: ['mistport'] },
    { id: 'v_grass', text: ['東邊的草海住著跟著風遷徙的遊牧民。最近風停了，他們的羊群都不肯走呢。', 'Nomads who follow the wind live on the Grass Sea to the east. Now the wind has stopped, their herds will not move.'], reveal: ['grassea'] },
    { id: 'v_astra', cond: () => S.era >= 1, text: ['北邊湖畔的星塔學院在研究風變弱的原因。也許去那裡能知道些什麼。', 'The Astral Academy on the northern lake is studying why the winds are failing. You might learn something there.'], reveal: ['astralis'] },
    { id: 'v_salt', cond: () => S.era >= 1, text: ['南方的鹽岬港是海盜的窩。聽說那邊的海連一絲風都沒有，船都出不了港。', 'Saltreach in the south is a pirate nest. They say not a breath of wind stirs on that sea, and no ship can sail.'], reveal: ['saltreach'] },
  ],
  mistport: [
    { id: 'm_cave', text: ['海蝕洞那邊有走私船進出。聽說他們在收購得了「止息病」的人……真噁心。', 'Smuggler boats go in and out of the sea cave. They say they are buying people with the stillness sickness... Disgusting.'], reveal: ['seacave'] },
    { id: 'm_salt', text: ['南邊的鹽岬港有個老船長叫卡隆，聽說他二十年前在無風之海上活了下來。', 'There is an old captain in Saltreach called Karon. They say he survived the windless sea twenty years ago.'], reveal: ['saltreach'] },
    { id: 'm_ghost', cond: () => S.era >= 2, text: ['最近有人在南方的海上看到一艘破爛的船，船帆在沒有風的海上鼓得滿滿的……是幽靈船啊。', 'Lately someone saw a rotten ship on the southern sea, its sails full on a sea with no wind... A ghost ship.'], reveal: ['ghostship'] },
  ],
  grassea: [
    { id: 'g_gorge', text: ['東北的風鳴峽谷，以前總是有風在唱歌。現在那裡只有狼嚎……是「風喰狼王」吃掉了東風啊。', 'The Howling Gorge to the north-east always sang with wind. Now there is only howling... The Windeater has swallowed the east wind.'], reveal: ['gorge'] },
    { id: 'g_dune', text: ['往南走，草會變成沙。沙丘城的商隊以前常來交換羊毛。', 'Go south and the grass turns to sand. The caravans of Dunehold used to come to trade for wool.'], reveal: ['dunehold'] },
    { id: 'g_iron', text: ['北方山裡的鐵爪堡，聚集了很多傭兵。想找幫手可以去那裡。', 'Many mercenaries gather at Ironclaw Keep in the northern mountains. Go there if you need hired help.'], reveal: ['ironclaw'] },
  ],
  ironclaw: [
    { id: 'i_mine', text: ['礦坑深處出現了一個全身灰燼的騎士。進去的礦工全都變成了不會動的石像……', 'A knight covered in ash has appeared deep in the mines. The miners who went in all turned into motionless statues...'], reveal: ['mines'] },
    { id: 'i_astra', text: ['往東南是星塔學院。那些學者整天在算風的速度，真是閒。', 'South-east lies the Astral Academy. The scholars there spend all day measuring the speed of the wind. Must be nice.'], reveal: ['astralis'] },
    { id: 'i_frost', cond: () => S.era >= 3, text: ['北邊的雪嶺山路通了！不過那邊的雪好像從來沒有停過……', 'The pass to Frostpeak in the north is open! Though the snow up there never seems to stop...'], reveal: ['frostpeak'] },
  ],
  saltreach: [
    { id: 's_ghost', cond: () => S.era >= 2, text: ['幽靈船又出現了，就在西邊的海上。船首上站著一個人影，像是在等誰……', 'The ghost ship has come back, on the western sea. A figure stands at the bow, as if waiting for someone...'], reveal: ['ghostship'] },
    { id: 's_dune', text: ['往東沿著海岸走是沙丘城。那裡的蘇丹很有錢，也很怕死。', 'Follow the coast east to Dunehold. Its sultan is very rich, and very afraid of dying.'], reveal: ['dunehold'] },
    { id: 's_mist', text: ['霧港那邊的人跟我們做生意，偶爾也搶我們的生意。哈哈。', 'The folk of Mistport trade with us, and sometimes steal our trade. Hah.'], reveal: ['mistport'] },
  ],
  dunehold: [
    { id: 'd_temple', text: ['沙漠深處的沙之神殿，以前是王族的陵墓。現在沙子不再流動，整座神殿都被凍結在沙裡了。', 'The Temple of Sand in the deep desert was once a royal tomb. Now the sand has stopped flowing and the whole temple is frozen in it.'], reveal: ['sandtemple'] },
    { id: 'd_grass', text: ['往北是草海。那些遊牧民能讀懂風，是很了不起的人。', 'North lies the Grass Sea. Those nomads can read the wind. Remarkable people.'], reveal: ['grassea'] },
  ],
  frostpeak: [
    { id: 'f_ice', text: ['村子東邊的冰之迴廊裡住著冰后。從她來了以後，這裡就再也沒有春天了。', 'The Frost Queen lives in the Ice Corridor east of the village. Since she came, spring has never returned here.'], reveal: ['icecorridor'] },
  ],
};
const GENERIC = [
  ['風之石有八顆。聽說集得越多，被封印的神就越弱。', 'There are eight Wind Stones. They say the more you gather, the weaker the sealed god becomes.'],
  ['在戰鬥中拚命揮劍，有時候會突然「靈光一閃」，學會新的招式喔。', 'Swing your weapon hard enough in battle and sometimes inspiration strikes, and you learn a new technique.'],
  ['倒下太多次的人，生命力（LP）會用完。在旅店好好休息才能恢復。', 'Fall too many times and your life points run out. Only a good rest at an inn brings them back.'],
  ['越強的魔物，越能讓人成長。不過別把命丟了。', 'Stronger monsters make you grow faster. Just do not lose your life over it.'],
  ['時間是會往前走的。有些事，晚了就再也來不及了。', 'Time moves on. Some things, once too late, are too late forever.'],
];

export const SCRIPTS = {
  // ---------- generic objects ----------
  async chest(E, e) {
    if (e.open) { await E.say(null, L('寶箱是空的。', 'The chest is empty.')); return; }
    e.open = true; S.flags['chest:' + e.id] = true;
    E.sfx('chest');
    if (e.gold) { S.gold += e.gold; await E.say(null, L(`得到了 ${e.gold} 金幣！`, `Found ${e.gold} gold!`)); return; }
    E.give(e.item, e.n || 1);
    await E.say(null, L(`得到了${ITEMS[e.item].name}${e.n > 1 ? '×' + e.n : ''}！`, `Found ${e.n > 1 ? e.n + ' × ' : ''}${ITEMS[e.item].name}!`));
  },
  async save(E) {
    E.sfx('heal');
    for (const m of S.members) { m.hp = Math.max(m.hp, 1); }
    const r = await E.ask(null, L('風之水晶靜靜地發著光。\n要記錄目前的冒險嗎？', 'A wind crystal glows quietly.\nSave your adventure?'), [L('記錄', 'Save'), L('不用', 'No')]);
    if (r === 0) { E.save(); E.sfx('save'); await E.say(null, L('記錄完成。', 'Saved.')); }
  },
  async lockedHouse(E) { await E.say(null, L('門鎖著。', 'The door is locked.')); },
  async inn(E) {
    const price = 10 * S.members.length;
    const r = await E.ask('老闆', L(`歡迎光臨！住一晚 ${price} 金幣。好好睡一覺，連生命力都會恢復喔。`, `Welcome! A night is ${price} gold. A good sleep restores even your life points.`), [L('住宿', 'Stay'), L('不用', 'No')]);
    if (r !== 0) { await E.say('老闆', L('歡迎再來！', 'Come again!')); return; }
    if (S.gold < price) { await E.say('老闆', L('錢好像不太夠呢……', "Looks like you're a little short...")); return; }
    S.gold -= price;
    await E.rest(L('早安！祝你們旅途順利。', 'Good morning! Safe travels.'), '老闆');
  },
  async items(E, e) { await E.shop(SHOPS[town(e)].items, L('藥草、解毒草，旅行的必需品都在這裡。', 'Herbs, antidotes: everything a traveller needs.')); },
  async arms(E, e) { await E.shop(SHOPS[town(e)].arms, L('武器和防具都在這裡。誰都能拿任何武器，用得多了自然就會變強。', 'Weapons and armour, all here. Anyone can use any weapon; the more you use one, the better you get.')); },
  async magic(E, e) { await E.spellShop(SHOPS[town(e)].spells || [], L('魔法要一個人一個人地學。施放得越多，那個系統的等級就越高喔。', 'Spells are learned one person at a time. The more you cast, the higher that school climbs.')); },
  async pub(E, e) {
    const t = town(e);
    for (;;) {
      const r = await E.ask('老闆', L('要喝點什麼？還是想聽聽傳聞？', 'Something to drink? Or a bit of gossip?'), [L('聽傳聞', 'Rumours'), L('同伴離隊', 'Part ways'), L('離開', 'Leave')]);
      if (r === 0) {
        const list = (RUMORS[t] || []).filter((x) => (!x.cond || x.cond()) && (!x.reveal || x.reveal.some((id) => !S.known[id]) || !S.flags['rum_' + x.id]));
        const fresh = list.find((x) => !S.flags['rum_' + x.id]) || list[0];
        if (fresh) {
          S.flags['rum_' + fresh.id] = true;
          await E.say('老闆', L(fresh.text[0], fresh.text[1]));
          if (fresh.reveal) await E.reveal(...fresh.reveal);
        } else {
          const g = GENERIC[Math.floor(Math.random() * GENERIC.length)];
          await E.say('老闆', L(g[0], g[1]));
        }
      } else if (r === 1) await E.partyMenu();
      else return;
    }
  },

  // ---------- recruits ----------
  async recruit_rion(E, e) {
    await E.say(nm('rion'), L('我是瓦爾蒙的見習騎士利恩。國王派我調查風停下的原因，可是一個人什麼都做不到……', "I'm Rion, a squire of Valmont. The king sent me to find out why the winds are failing, but alone I can do nothing..."));
    if (await E.ask(nm('rion'), L('可以讓我跟你們一起走嗎？', 'May I come with you?'), [L('一起走吧', "Let's go"), L('現在不用', 'Not now')]) === 0) await E.recruit('rion', e);
  },
  async recruit_sela(E, e) {
    await E.say(nm('sela'), L('奶奶說，風會帶我遇見該遇見的人。……是你們嗎？', 'Grandmother says the wind will bring me to the people I am meant to meet. ...Is it you?'));
    if (await E.ask(nm('sela'), L('我的弓很準喔。帶我一起去吧！', 'My aim is true. Take me with you!'), [L('歡迎', 'Welcome'), L('下次吧', 'Next time')]) === 0) await E.recruit('sela', e);
  },
  async recruit_gusta(E, e) {
    await E.say(nm('gusta'), L('要僱傭兵？哼，現在這種時局，錢還有什麼用。……不過看你們挺順眼的。', 'Hiring a sword? Hmph, what good is money these days. ...But I like the look of you.'));
    if (await E.ask(nm('gusta'), L('算我一份，免費的。', "Count me in. Free of charge."), [L('拜託了', 'Please'), L('不用', 'No')]) === 0) await E.recruit('gusta', e);
  },
  async recruit_mico(E, e) {
    await E.say(nm('mico'), L('喂，你們看起來很有錢……開玩笑的。聽說你們在找風之石？我妹妹的病，也許跟那個有關。', "Hey, you look rich... Kidding. I hear you're after the Wind Stones? My sister's illness might have something to do with them."));
    if (await E.ask(nm('mico'), L('我開鎖很厲害喔。帶我一起？', "I'm great with locks. Take me along?"), [L('好啊', 'Sure'), L('算了', 'Never mind')]) === 0) await E.recruit('mico', e);
  },
  async recruit_fia(E, e) {
    await E.say(nm('fia'), L('伊黛老師留下一封信就不見了……「別來找我」，可是怎麼可能不找嘛！', 'Master Ide left a letter and vanished... "Don\'t look for me." As if I could not look!'));
    if (await E.ask(nm('fia'), L('我的火焰魔法可以幫上忙的！', 'My fire magic can help you!'), [L('一起來吧', 'Come along'), L('之後再說', 'Later')]) === 0) await E.recruit('fia', e);
  },
  async recruit_karon(E, e) {
    await E.say(nm('karon'), L('年輕人，風停了，船就是一堆木頭。……不過我這把老骨頭還能走路。', "Young one, without wind a ship is just a pile of wood. ...But these old bones can still walk."));
    if (await E.ask(nm('karon'), L('帶上我吧，我有件二十年前的事要了結。', 'Take me along. I have something from twenty years ago to settle.'), [L('上船吧', 'All aboard'), L('改天', 'Another day')]) === 0) await E.recruit('karon', e);
  },
  async recruit_bass(E, e) {
    await E.say(nm('bass'), L('我是巴斯！拳頭就是我的武器！最近對手都變得軟趴趴的，一點都不好玩。', "I'm Bass! My fists are my weapons! Lately every opponent has gone limp. No fun at all."));
    if (await E.ask(nm('bass'), L('你們要去打大傢伙對吧？帶我去！', "You're off to fight something big, right? Take me!"), [L('好', 'All right'), L('不了', 'No')]) === 0) await E.recruit('bass', e);
  },
  async recruit_lulu(E, e) {
    await E.say(nm('lulu'), L('我是旅行的治療師露露。止息病的人越來越多了，我想去源頭看看。', "I'm Lulu, a travelling healer. More and more people have the stillness sickness. I want to see where it begins."));
    if (await E.ask(nm('lulu'), L('受傷了就交給我吧。', 'Leave the wounds to me.'), [L('請多指教', 'Welcome'), L('下次', 'Next time')]) === 0) await E.recruit('lulu', e);
  },
  async recruit_tarin(E, e) {
    await E.say(nm('tarin'), L('我叫塔林，一個流浪的槍兵。沙漠的風停了以後，我的故鄉被沙埋了。', "I'm Tarin, a wandering lancer. When the desert wind died, my home was buried in sand."));
    if (await E.ask(nm('tarin'), L('如果你們要去沙之神殿，我的槍借給你們。', 'If you are going to the Temple of Sand, my spear is yours.'), [L('一起走', 'Join us'), L('不用', 'No')]) === 0) await E.recruit('tarin', e);
  },

  // ---------- 序章: one for each hero ----------
  async prologue_rion(E) {
    await E.warp('valmont_hall', 7, 6, 'u');
    await E.wait(20);
    await E.talk('國王', L('見習騎士利恩，上前來。', 'Squire Rion, step forward.'), L('……本來今天應該是你的授劍儀式。可是今天早上，城塔上的「晨之鐘」再也不響了。', '...Today should have been the day you received your sword. But this morning the Dawn Bell on the castle tower stopped ringing.'));
    await E.say('大臣', L('陛下，從地下舊水道湧出的冷氣越來越強。碰到的人，手腳就會慢慢「停下來」。', 'Your Majesty, the cold rising from the old aqueduct grows stronger. Those it touches slowly stop moving.'));
    await E.say('國王', L('如果你的哥哥摩根還在……不，七年前那場瘟疫之後，他就離開了。現在只能拜託你了。', 'If only your brother Morgan were here... No. He left after the plague seven years ago. I must ask this of you.'));
    await E.say(nm('rion'), L('……哥哥。我一定會找到原因的，陛下。', '...Brother. I will find the cause, Your Majesty.'));
    await E.say('國王', L('去舊水道看看吧。這些錢拿去準備。城裡的酒館有很多消息，也有願意幫忙的人。', 'Go and look in the aqueduct. Take this to prepare. The tavern in town has news, and people willing to help.'));
    S.gold += 200; E.sfx('chest');
    await E.say(null, L('得到了 200 金幣！', 'Received 200 gold!'));
    S.known.aqueduct = true;
    await E.say(null, L('──利恩的旅程，從這裡開始了。\n（出城後可以在世界地圖上選擇目的地。）', "── Rion's journey begins here.\n(Leave town to choose where to go on the world map.)"));
  },
  async prologue_sela(E) {
    await E.warp('grassea_home', 4, 4, 'u');
    await E.wait(20);
    await E.talk('奶奶', L('賽菈，妳聽到了嗎？……草不唱歌了。', 'Sela, do you hear it? ...The grass has stopped singing.'), L('我活了七十年，第一次聽不見東風。羊群不肯走，鳥也不飛了。', "In seventy years I have never stopped hearing the east wind. The herds won't move and the birds won't fly."));
    await E.say(nm('sela'), L('是東北的峽谷吧？那裡傳來的不是風聲，是狼嚎。', "It's the gorge to the north-east, isn't it? What comes from there isn't wind. It's howling."));
    await E.say('奶奶', L('拿著這根風之羽。就算風再弱，它也會告訴妳風往哪裡吹。', 'Take this Wind Feather. However weak the wind, it will tell you which way it blows.'));
    E.give('windfeather'); E.sfx('chest');
    await E.say(null, L('得到了風之羽！', 'Received the Wind Feather!'));
    await E.say('奶奶', L('別一個人去峽谷。先到外面的世界走走，找到同伴，變強了再去。……風會等妳的。', 'Do not go to the gorge alone. Walk the world first, find companions, grow strong. ...The wind will wait for you.'));
    S.known.gorge = true;
    await E.say(null, L('──賽菈的旅程，從這裡開始了。\n（出營地後可以在世界地圖上選擇目的地。）', "── Sela's journey begins here.\n(Leave the camp to choose where to go on the world map.)"));
  },
  async prologue_gusta(E) {
    await E.warp('ironclaw_pub', 5, 6, 'u');
    await E.wait(20);
    await E.talk('公會長', L('古斯塔，礦坑那邊出事了。一個全身灰燼的騎士佔據了最深處，進去的礦工全都變成了石像。', "Gusta, there's trouble at the mines. A knight covered in ash has taken the deepest level, and every miner who went in has turned to stone."), L('公會出高價，可是沒有一個傭兵敢接。', 'The guild is paying well, but not one sword will take the job.'));
    await E.say(nm('gusta'), L('哼，我也不接。那種東西，不是錢能解決的。', "Hmph, nor will I. That's not something money can fix."));
    await E.say('寡婦', L('……古斯塔先生。我先生還在礦坑裡。他沒有變成石頭，他只是……停下來了。拜託你。', '...Mister Gusta. My husband is still in the mines. He did not turn to stone, he just... stopped. Please.'));
    await E.say(nm('gusta'), L('……可惡。我最討厭聽到「沒辦法」了。', '...Blast it. I hate hearing that nothing can be done.'));
    await E.say(nm('gusta'), L('不過那騎士不是我一個人能對付的。得先去外面找些幫手，磨磨刀才行。', "But that knight isn't something I can take alone. I need to find help out there and sharpen my blade first."));
    S.known.mines = true;
    await E.say(null, L('──古斯塔的旅程，從這裡開始了。\n（出城後可以在世界地圖上選擇目的地。）', "── Gusta's journey begins here.\n(Leave the keep to choose where to go on the world map.)"));
  },
  async prologue_mico(E) {
    await E.warp('mistport_home', 3, 4, 'r');
    await E.wait(20);
    const pim = E.ent('mistport_resident'); if (pim) pim.sprite = 'pim';
    await E.talk('皮姆', L('哥哥，你回來了……今天手又更慢了。像風一樣，慢慢地停下來。', "Brother, you're back... My hands were slower again today. Like the wind, slowly stopping."), L('哥哥偷東西的事，皮姆都知道喔。不要為了我做壞事。', 'I know you steal, brother. Do not do bad things for me.'));
    await E.say(nm('mico'), L('……笨蛋。哥哥會想辦法的。聽說海蝕洞的走私販子在收購得了止息病的人，他們一定知道些什麼。', "...Silly. Your brother will find a way. They say the smugglers in the sea cave are buying people with the stillness sickness. They must know something."));
    await E.say('皮姆', L('要回來喔。一定要回來喔。', 'Come back. Promise you will come back.'));
    S.known.seacave = true;
    await E.say(null, L('──米可的旅程，從這裡開始了。\n（出港後可以在世界地圖上選擇目的地。）', "── Mico's journey begins here.\n(Leave the harbour to choose where to go on the world map.)"));
  },
  async prologue_fia(E) {
    await E.warp('astralis_hall', 7, 6, 'u');
    await E.wait(20);
    await E.talk('學院長', L('妃雅，妳的考試合格了。……可惜伊黛不在這裡為妳高興。', "Fia, you passed your examination. ...A pity Ide isn't here to be glad for you."), L('她三天前留下一封信就不見了。信是給妳的。', 'She left a letter three days ago and disappeared. It is for you.'));
    await E.say(null, L('「妃雅：我要去一個什麼都不會被忘記的地方。別來找我。──伊黛」', '"Fia: I am going to a place where nothing is ever forgotten. Do not look for me. ── Ide"'));
    await E.say(nm('fia'), L('什麼都不會被忘記的地方……地下的沉沒書庫？可是那裡已經封鎖一百年了！', 'A place where nothing is forgotten... the Sunken Library below? But it has been sealed for a hundred years!'));
    await E.say('學院長', L('書庫的鑰匙不能交給一個見習生。去外面的世界歷練吧，等妳帶著兩顆以上的風之石回來，我就相信妳。', 'I cannot give the library key to an apprentice. Go and see the world. Come back with two Wind Stones or more, and I will trust you.'));
    S.known.library = true;
    await E.say(null, L('──妃雅的旅程，從這裡開始了。\n（出學院後可以在世界地圖上選擇目的地。）', "── Fia's journey begins here.\n(Leave the academy to choose where to go on the world map.)"));
  },
  async prologue_karon(E) {
    await E.wait(20);
    await E.talk('老水手', L('船長，帆又垂下來了。三天了，一絲風都沒有。', "Captain, the sails are slack again. Three days now, not a breath of wind."), L('就跟二十年前，布雷克船長失蹤的那天一模一樣……', 'Just like the day Captain Blake was lost, twenty years ago...'));
    await E.say(nm('karon'), L('……別提那個名字。', "...Don't say that name."));
    await E.say(nm('karon'), L('那天，我們兩艘船一起駛進了無風之海。我的船漂了回來，他的沒有。我到現在都不知道，為什麼活下來的是我。', 'That day our two ships sailed into the windless sea together. Mine drifted home. His did not. To this day I do not know why I was the one who lived.'));
    await E.say('老水手', L('船長……', 'Captain...'));
    await E.say(nm('karon'), L('風停了，船出不了海。那我就用這雙腿走吧。去霧港和王都打聽看看，這些怪事一定有個源頭。', "Without wind no ship can sail. Then I will walk on these legs. I'll ask around in Mistport and the capital. All this has a source somewhere."));
    S.known.mistport = true;
    await E.say(null, L('──卡隆的旅程，從這裡開始了。\n（出港後可以在世界地圖上選擇目的地。）', "── Karon's journey begins here.\n(Leave the harbour to choose where to go on the world map.)"));
  },

  // ---------- the people of Valmont ----------
  async valmont_lord(E) {
    if (S.flags.b_ooze && !S.flags.dawnThanks) {
      S.flags.dawnThanks = true;
      await E.talk('國王', L('晨之鐘又響了！你們做得太好了。', 'The Dawn Bell rings again! Splendid work.'), L('水道深處的牆上留著一個用灰燼寫的字：「M」……那是摩根的簽名。', 'On a wall deep in the aqueduct, a single letter was written in ash: "M"... It is Morgan\'s mark.'));
      if (E.has('rion')) await E.say(nm('rion'), L('哥哥……你到底在做什麼？', 'Brother... what are you doing?'));
      S.gold += 300; E.sfx('chest');
      await E.say(null, L('得到了 300 金幣！', 'Received 300 gold!'));
      await E.reveal('ironclaw', 'astralis');
      return;
    }
    if (S.flags.b_nul) { await E.say('國王', L('風回來了。艾瑟蘭欠你們一份還不清的恩情。', 'The winds have returned. Aethra owes you a debt it can never repay.')); return; }
    if (!S.flags.b_ooze) { await E.say('國王', L('舊水道的冷氣再這樣下去，整座王都都會停下來。拜託了。', 'If the cold from the aqueduct goes on, the whole capital will stop. I am counting on you.')); if (!S.known.aqueduct) await E.reveal('aqueduct'); return; }
    await E.say('國王', L(`風之石已經集了 ${E.stones()} 顆了嗎……據說集齊越多，被封印的神就越弱。`, `You have ${E.stones()} Wind Stones already... They say the more are gathered, the weaker the sealed god becomes.`));
  },
  async valmont_guard(E) { await E.say('衛兵', S.flags.b_ooze ? L('晨之鐘又響了，大家終於能好好起床了。', 'The Dawn Bell rings again. Everyone can wake up properly at last.') : L('這裡是瓦爾蒙城。最近連城門的旗子都不飄了……', 'This is Valmont Castle. Lately not even the flags on the gate will fly...')); },
  async valmont_child(E) { await E.say('男孩', L('我的風箏飛不起來了。大人說風生病了，風也會生病嗎？', "My kite won't fly. The grown-ups say the wind is sick. Can the wind get sick?")); },
  async valmont_merchant(E) { await E.say('商人', L('風停了，風車不轉，麵粉就磨不出來。這樣下去大家都要餓肚子了。', 'No wind, no windmills, no flour. At this rate everyone will go hungry.')); },
  async valmont_old(E) { await E.talk('老人', L('一千年前，八位風之精靈把止息之神封印了。', 'A thousand years ago, eight wind spirits sealed away the God of Stillness.'), L('祂說：「沒有風，就沒有離別，也沒有死亡。」……聽起來很美，對吧？可是那也代表，什麼都不會再開始了。', 'He said, "Without wind there is no parting and no death." ...Sounds beautiful, doesn\'t it? But it also means nothing would ever begin again.')); },
  async valmont_lady(E) { await E.say('婦人', L('七年前的瘟疫，帶走了好多人。摩根大人的未婚妻艾爾莎小姐也是……', 'The plague seven years ago took so many. Lady Elsa, Sir Morgan\'s betrothed, was one of them...')); },
  async valmont_house(E) { await E.say('老騎士', L('摩根是我教過最好的騎士。艾爾莎死後，他在她的墓前跪了三天三夜，然後就消失了。', 'Morgan was the finest knight I ever trained. After Elsa died he knelt at her grave three days and nights, then vanished.')); },

  // ---------- Mistport ----------
  async mistport_sailor(E) { await E.say('水手', L('霧港的霧也不散了。沒有風，霧就一直卡在港口裡。', "Even Mistport's fog won't clear. Without wind it just sits in the harbour.")); },
  async mistport_fishwife(E) { await E.say('魚販', L('隔壁的老頭得了止息病，現在只能坐著眨眼睛。可憐啊。', 'The old man next door caught the stillness sickness. All he can do now is sit and blink. Poor soul.')); },
  async mistport_beggar(E) { await E.say('乞丐', S.flags.b_smuggler ? L('那些被賣掉的人都回來了……謝謝你們。', 'The people they sold have all come back... Thank you.') : L('走私販的頭子叫格雷夫。他說得了止息病的人，有一個「灰燼騎士」出高價收購。', 'The smugglers\' chief is called Grave. He says an "Ash Knight" pays good money for people with the stillness sickness.')); },
  async mistport_guard(E) { await E.say('衛兵', L('海蝕洞在港口西南邊。那裡是走私販的地盤，別亂闖。', 'The sea cave is south-west of the harbour. Smuggler ground. Watch yourself.')); },
  async mistport_girl(E) { await E.say('小女孩', L('皮姆是我的好朋友！她說等病好了，要跟我一起去看海鳥。', 'Pim is my best friend! She says when she gets better we will go and watch the seabirds.')); },
  async mistport_home(E, e) {
    if (e) e.sprite = 'pim';
    if (S.flags.b_nul) { await E.say('皮姆', L('哥哥！我的手可以動了！我們去看海鳥吧！', 'Brother! My hands can move! Let\'s go and watch the seabirds!')); return; }
    await E.say('皮姆', E.has('mico') ? L('哥哥，你回來了！……皮姆很好喔，只是有點睏。', "Brother, you're home! ...I'm fine, just a little sleepy.") : L('你們是哥哥的朋友嗎？哥哥說，總有一天風會再吹起來的。', "Are you my brother's friends? He says one day the wind will blow again."));
  },

  // ---------- Grass Sea Camp ----------
  async grassea_herder(E) { await E.say('牧童', S.flags.eastLost ? L('東風再也回不來了……奶奶說，草海會慢慢變成沙漠。', 'The east wind is never coming back... Grandmother says the Grass Sea will slowly turn to desert.') : L('羊群不肯走，牠們在等風。我也在等。', "The herds won't move. They're waiting for the wind. So am I.")); },
  async grassea_rider(E) { await E.say('騎手', L('風鳴峽谷的狼王，連影子都比人高。要去的話，至少要有四個人。', 'The wolf king of the Howling Gorge has a shadow taller than a man. If you go, take at least four.')); },
  async grassea_weaver(E) { await E.say('織布婦', L('我們的帳篷布上織著風的形狀。風往哪裡吹，我們就往哪裡去。', 'We weave the shape of the wind into our tent cloth. Where the wind goes, we go.')); },
  async grassea_scout(E) { await E.say('哨兵', S.flags.b_wolfking ? L('東風回來了！你聽，草又在唱歌了！', 'The east wind is back! Listen, the grass is singing again!') : S.flags.eastLost ? L('……峽谷被沙暴吞掉了。我們晚了一步。', '...The gorge has been swallowed by a sandstorm. We were too late.') : L('峽谷在東北邊。時間不多了，草一天比一天乾。', 'The gorge is to the north-east. Time is short; the grass grows drier every day.')); },
  async grassea_home(E) {
    if (S.flags.b_wolfking) { await E.say('奶奶', L('東風回來了。妳聽到了嗎？草在唱歌，是在謝謝你們喔。', 'The east wind is back. Do you hear? The grass is singing. It is thanking you.')); return; }
    await E.say('奶奶', S.flags.eastLost ? L('東風被奪走了……可是孩子們，別停下來。只要還有一陣風，就還有希望。', 'The east wind was taken... But children, do not stop. As long as one wind still blows, there is hope.') : L('風之羽會告訴妳風的方向。峽谷的狼王很強，要小心。', 'The Wind Feather will show you which way the wind blows. The wolf king in the gorge is strong. Be careful.'));
  },

  // ---------- Ironclaw Keep ----------
  async ironclaw_miner(E) { await E.say('礦工', S.flags.b_morgan ? L('礦坑裡的大家都醒過來了！跟做了一場很長的夢一樣。', 'Everyone in the mines has woken up! Like waking from a very long dream.') : L('灰燼騎士說：「再也不會有人死了。」……可是那些「停下來」的人，跟死了有什麼不同？', 'The Ash Knight said, "No one will ever die again." ...But how are the ones who stopped any different from the dead?')); },
  async ironclaw_smith(E) { await E.say('鐵匠', L('沒有風，鍛造爐的火就燒不旺。我的錘子都快生鏽了。', 'Without wind the forge fire will not burn hot. My hammer is rusting.')); },
  async ironclaw_guard(E) { await E.say('衛兵', S.era >= 3 ? L('北邊通往雪嶺村的山路通了，不過那邊冷得要命。', 'The road north to Frostpeak is open now, but it is bitterly cold.') : L('北邊的山路被雪封住了，現在誰也過不去。', 'The road north is buried in snow. No one can get through.')); },
  async ironclaw_widow(E) { await E.say('寡婦', S.flags.b_morgan ? L('我先生回來了……他說，在夢裡一直聽到有人在哭。謝謝你們。', 'My husband came home... He says in his dream he kept hearing someone cry. Thank you.') : L('我先生還在礦坑裡……他只是停下來了。', 'My husband is still in the mines... He only stopped.')); },
  async ironclaw_house(E) { await E.say('公會長', S.flags.b_morgan ? L('你們真的辦到了。公會的報酬……什麼？不要？哈，跟古斯塔一個樣。', 'You really did it. The guild\'s fee... What? You won\'t take it? Hah, just like Gusta.') : L('礦坑在城的西北邊。灰燼騎士強得離譜，別勉強。', 'The mines are north-west of the keep. The Ash Knight is absurdly strong. Do not overreach.')); },

  // ---------- Astral Academy ----------
  async astralis_lord(E) {
    if (S.flags.b_ide) { await E.say('學院長', L('伊黛回來了。她忘了很多事，可是她記得妃雅，記得一直在笑。……這樣就夠了。', 'Ide has come back. She has forgotten much, but she remembers Fia, and she smiles all the time. ...That is enough.')); return; }
    if (S.inv.libkey) { await E.say('學院長', L('書庫在學院東北的湖底。伊黛……就拜託你們了。', 'The library lies beneath the lake north-east of the academy. Please... bring Ide back.')); return; }
    if (E.stones() >= 2) {
      await E.talk('學院長', L(`你們帶著 ${E.stones()} 顆風之石……我明白了。`, `You carry ${E.stones()} Wind Stones... I understand.`), L('伊黛是我見過最聰明的人。她開始忘記事情的時候，比誰都害怕。也許她去了書庫，想把記憶永遠留下來。', 'Ide is the wisest person I have known. When she began to forget things, she was more afraid than anyone. Perhaps she went to the library to keep her memories forever.'));
      E.give('libkey'); E.sfx('chest');
      await E.say(null, L('得到了書庫之鑰！', 'Received the Library Key!'));
      await E.reveal('library');
      return;
    }
    await E.say('學院長', L('書庫被封印了一百年，裡面滿是危險。等你們帶著兩顆以上的風之石來，我就把鑰匙交給你們。', 'The library has been sealed for a century and is full of danger. Bring two Wind Stones or more, and I will give you the key.'));
  },
  async astralis_student(E) { await E.say('學生', L('伊黛老師最近常常叫錯我的名字……她以前從來不會這樣的。', 'Master Ide often called me by the wrong name lately... She never used to.')); },
  async astralis_student2(E) { await E.say('學生', L('風之石其實是風之精靈的心臟。集齊八顆，就能聽見精靈們說話喔……是傳說啦。', 'The Wind Stones are really the hearts of the wind spirits. Gather all eight and you can hear them speak... It is only a legend.')); },
  async astralis_scholar(E) { await E.say('學者', L('根據計算，風速每天下降百分之一。照這樣下去……一百天後，世界就會完全靜止。', 'By my calculations, wind speed falls by one percent a day. At this rate... in a hundred days the world will be completely still.')); },
  async astralis_keeper(E) { await E.say('管理員', L('魔法店在學院右邊。學得越多，能用的就越多，可是 JP 只有睡一覺才會回來喔。', 'The magic shop is on the right. The more you learn, the more you can cast, but JP only comes back with a good night\'s sleep.')); },

  // ---------- Saltreach ----------
  async saltreach_pirate(E) { await E.say('海盜', L('沒風就沒法搶船，沒法搶船就沒錢喝酒。這是什麼世道！', 'No wind, no ships to rob. No ships, no money for drink. What a world!')); },
  async saltreach_pirate2(E) { await E.say('海盜', L('卡隆老大二十年前在無風之海漂了四十天，回來的時候頭髮全白了。', "Boss Karon drifted forty days on the windless sea twenty years ago. When he came back, his hair had turned white.")); },
  async saltreach_oldsalt(E) { await E.say('老水手', S.flags.b_captain ? L('布雷克船長……終於可以休息了吧。', 'Captain Blake... can finally rest, I suppose.') : L('幽靈船上的人影，一定是布雷克船長。他還在等著誰去接他。', 'The figure on the ghost ship must be Captain Blake. He is still waiting for someone to come for him.')); },
  async saltreach_guard(E) { await E.say('衛兵', L('這裡是鹽岬港。海盜的港口，也是最講義氣的港口。', 'This is Saltreach. A pirate port, and the most loyal port there is.')); },
  async saltreach_home(E) {
    if (!S.inv.shipwheel && (S.era >= 2 || E.has('karon') || leadIs('karon'))) {
      await E.talk('老婆婆', L('你們要去找幽靈船嗎？……那就帶上這個吧。這是布雷克船長的舊舵輪。', 'Are you going after the ghost ship? ...Then take this. It is Captain Blake\'s old wheel.'), L('他是我的兒子。如果他還在等，就讓他知道，有人一直記得他。', 'He was my son. If he is still waiting, let him know someone always remembered him.'));
      E.give('shipwheel'); E.sfx('chest');
      await E.say(null, L('得到了幽靈船的舵！', "Received the Ghost Ship's Wheel!"));
      return;
    }
    await E.say('老婆婆', L('我的兒子二十年前出海後就沒有回來。卡隆每年都會來看我，帶一瓶酒，什麼也不說。', 'My son went to sea twenty years ago and never came back. Every year Karon visits me with a bottle and says nothing at all.'));
  },

  // ---------- Dunehold ----------
  async dunehold_lord(E) {
    if (S.flags.b_sandking) { await E.say('蘇丹', L('沙又開始流動了，綠洲的水也回來了。你們是沙丘城的恩人！', 'The sand flows again, and water has returned to the oases. You are the saviours of Dunehold!')); return; }
    if (S.inv.sunseal) { await E.say('蘇丹', L('神殿在東南的沙漠深處。拉赫……是我的祖先啊。', 'The temple lies deep in the south-eastern desert. Rah... was my ancestor.')); return; }
    if (E.stones() >= 3) {
      await E.talk('蘇丹', L(`三顆以上的風之石……你們是真正的英雄。`, 'Three Wind Stones or more... You are true heroes.'), L('沙之神殿裡沉睡著古代的王，拉赫。他的王國被沙暴吞沒之後，他發誓要讓沙子永遠停下來。', 'In the Temple of Sand sleeps an ancient king, Rah. After a sandstorm swallowed his kingdom, he swore to make the sand stop forever.'));
      E.give('sunseal'); E.sfx('chest');
      await E.say(null, L('得到了太陽印記！', 'Received the Sun Seal!'));
      await E.reveal('sandtemple');
      return;
    }
    await E.say('蘇丹', L('神殿的通行證只能交給證明過自己的人。帶著三顆風之石來吧。', 'The temple pass goes only to those who have proved themselves. Come back with three Wind Stones.'));
  },
  async dunehold_trader(E) { await E.say('商人', L('沙子不動了，駱駝走在上面就像走在石頭上。好走是好走，可是總覺得哪裡不對。', 'The sand has stopped moving. Camels walk on it as if it were stone. Easier, yes, but it feels wrong.')); },
  async dunehold_dancer(E) { await E.say('舞者', L('我的舞是跟著風跳的。風停了，我也不知道該怎麼跳了。', 'I dance with the wind. Now it has stopped, I do not know how to dance.')); },
  async dunehold_guard(E) { await E.say('衛兵', L('這裡是蘇丹的宮殿。沒事不要靠近。', "This is the Sultan's palace. Keep away unless you have business.")); },
  async dunehold_nomad(E) { await E.say('旅人', L('沙之神殿裡有沙之魔像守著。牠們怕水，記住了。', 'Sand golems guard the Temple of Sand. They fear water. Remember that.')); },

  // ---------- Frostpeak ----------
  async frostpeak_hunter(E) { await E.say('獵人', L('冰后來了之後，這裡就只剩冬天。雪下了三年，沒有停過一天。', 'Since the Frost Queen came, there has only been winter. Three years of snow, without a single day\'s rest.')); },
  async frostpeak_child(E) { await E.say('小女孩', S.flags.b_frostqueen ? L('雪停了！你看，屋頂上有冰柱在滴水！', 'The snow has stopped! Look, the icicles on the roofs are dripping!') : L('我從來沒看過春天。春天是什麼顏色的？', 'I have never seen spring. What colour is spring?')); },
  async frostpeak_elder(E) { await E.say('長老', L('三年前那場暴風雪，村裡的孩子凍死了好幾個。守護村子的巫女雪蘿……從那天起就變了。', 'In the blizzard three years ago, several of the village children froze to death. Sirol, the shrine maiden who guarded us, changed from that day.')); },
  async frostpeak_guard(E) { await E.say('衛兵', L('冰之迴廊在村子東邊。很冷，記得多帶點藥。', 'The Ice Corridor is east of the village. It is very cold. Bring plenty of medicine.')); },
  async frostpeak_home(E) { await E.say('村長夫人', L('雪蘿以前常常抱著我們的孩子唱歌。她只是……不想再失去任何人了。', 'Sirol used to hold our children and sing to them. She only... did not want to lose anyone ever again.')); },

  // ---------- bosses ----------
  async boss_ooze(E) {
    if (S.flags.b_ooze) return;
    await E.say(null, L('一團灰色的泥塊靜靜地堵在水道深處。被它碰到的水，全都停止了流動。', 'A grey mass of sludge blocks the depths of the aqueduct. Every drop of water it touches stops flowing.'));
    const r = await E.battle(['ooze'], { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.b_ooze = true; E.removeEnt('ooze');
    await E.say(null, L('泥塊散開後，牆上浮現出一個用灰燼寫的字：「M」。', 'As the sludge breaks apart, a letter written in ash appears on the wall: "M".'));
    await E.stone('st_dawn');
    await E.say(null, L('遠方傳來了鐘聲。晨之鐘，又響了。', 'Far away, a bell rings. The Dawn Bell rings again.'));
  },
  async boss_smuggler(E) {
    if (S.flags.b_smuggler) return;
    await E.say('格雷夫', L('喲，又有客人來了。要買貨嗎？止息病的人可是好貨，不吃不喝也不會跑。', 'Well, more customers. Buying? Stillness folk make fine goods. No food, no water, and they never run away.'));
    if (E.has('mico')) await E.say(nm('mico'), L('……你這個混帳。我妹妹不是貨！', '...You scum. My sister is not goods!'));
    await E.say('格雷夫', L('灰燼騎士大人出的價錢可高了。礙事的，就一起沉進海裡吧！', 'The Ash Knight pays a handsome price. Anyone in the way can sink with them!'));
    const r = await E.battle(['smuggler', 'crab1', 'crab1'], { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.b_smuggler = true; E.removeEnt('smuggler');
    await E.say(null, L('被綁著的人們眼裡，慢慢地有了光。他們還不能動，可是在哭。', 'Light slowly returns to the eyes of the bound captives. They still cannot move, but they are crying.'));
    await E.stone('st_west');
    if (E.has('mico')) await E.say(nm('mico'), L('皮姆……再等哥哥一下。我會把風全部找回來的。', 'Pim... wait for me a little longer. I will bring back every wind.'));
    await E.reveal('saltreach');
  },
  async boss_wolfking(E) {
    if (S.flags.b_wolfking) return;
    await E.say(null, L('巨大的狼王張開嘴，峽谷裡的風全都被吸進牠的喉嚨。', 'The great wolf king opens its jaws, and every wind in the gorge is drawn down its throat.'));
    if (E.has('sela')) await E.say(nm('sela'), L('把東風還給草海！奶奶、羊群、大家都在等它！', 'Give the east wind back to the Grass Sea! Grandmother, the herds, everyone is waiting for it!'));
    const r = await E.battle(['wolfking', 'wolf2'], { boss: true, bg: 'forest' });
    if (r !== 'win') return;
    S.flags.b_wolfking = true; E.removeEnt('wolfking');
    await E.say(null, L('狼王倒下的瞬間，一陣溫暖的風從峽谷吹向草海。', 'As the wolf king falls, a warm wind rushes out of the gorge toward the Grass Sea.'));
    await E.stone('st_east');
  },
  async boss_morgan(E) {
    if (S.flags.b_morgan) return;
    await E.say('灰燼騎士', L('……你們是來奪走「永恆」的嗎。', '...Have you come to take eternity away?'));
    if (E.has('rion')) {
      await E.say(nm('rion'), L('哥哥！是我，利恩！', "Brother! It's me, Rion!"));
      await E.say('摩根', L('利恩……你長大了。可是你不懂。艾爾莎死的時候，我什麼都做不到。', 'Rion... you have grown. But you do not understand. When Elsa died, I could do nothing.'));
      await E.say('摩根', L('只要涅爾大人醒來，世界就會停下來。不會再有人生病，不會再有人死去。', 'Once Lord Nul wakes, the world will stop. No one will fall ill again. No one will die again.'));
      await E.say(nm('rion'), L('那也沒有人會再笑了！艾爾莎姐姐最喜歡的，是春天的風啊！', 'Then no one will ever laugh again either! What Elsa loved most was the spring wind!'));
    } else {
      await E.say('摩根', L('只要涅爾大人醒來，就不會再有人死去。礙事的人，就在灰燼中靜止吧。', 'Once Lord Nul wakes, no one will die again. Those who stand in the way will be stilled in ash.'));
    }
    const r = await E.battle(['morgan'], { boss: true, bg: 'mine' });
    if (r !== 'win') return;
    S.flags.b_morgan = true; E.removeEnt('morgan');
    await E.say('摩根', L('……風的味道。我都忘了，原來是這個味道。', "...The smell of the wind. I had forgotten. So this is how it smells."));
    if (E.has('rion')) await E.say('摩根', L('利恩，對不起。我會去贖罪的。……在世界的盡頭，我們會再見面。', 'Rion, I am sorry. I will go and atone. ...At the end of the world, we will meet again.'));
    await E.stone('st_gale');
    await E.say(null, L('礦坑深處，一個又一個「停下來」的礦工，開始慢慢地呼吸。', 'Deep in the mines, one by one, the miners who had stopped begin to breathe.'));
  },
  async boss_ide(E) {
    if (S.flags.b_ide) return;
    await E.say('伊黛', L('……妃雅？我不是叫妳別來嗎。', '...Fia? Did I not tell you not to come?'));
    if (E.has('fia')) {
      await E.say(nm('fia'), L('老師！我們回去吧！大家都在等妳！', "Master! Let's go home! Everyone is waiting for you!"));
      await E.say('伊黛', L('回去做什麼呢？每天早上醒來，我都會忘記一點點。昨天忘了學生的名字，今天忘了怎麼泡茶。', 'Go back to what? Every morning I wake up and a little more is gone. Yesterday a student\'s name. Today, how to make tea.'));
      await E.say('伊黛', L('總有一天，我也會忘記妳。所以我要讓時間停下來，讓記憶永遠停在這裡。', 'One day I will forget you too. So I will stop time, and keep my memories here forever.'));
      await E.say(nm('fia'), L('就算老師忘記了，我也會記得！我會記得老師的一切，然後一次一次地告訴妳！', 'Even if you forget, I will remember! I will remember everything about you, and tell you again and again!'));
    } else await E.say('伊黛', L('在這座書庫裡，什麼都不會被忘記。打擾這份寧靜的人，就一起被封存在書頁裡吧。', 'In this library nothing is ever forgotten. Those who disturb its silence will be sealed in its pages.'));
    const r = await E.battle(['ide'], { boss: true, bg: 'library' });
    if (r !== 'win') return;
    S.flags.b_ide = true; E.removeEnt('ide');
    await E.say('伊黛', L('……是嗎。那就拜託妳替我記住吧，妃雅。', '...I see. Then please remember for me, Fia.'));
    await E.stone('st_breeze');
    await E.say(null, L('一陣微風吹過，書庫裡的書頁，嘩啦嘩啦地翻了起來。', 'A breeze blows through, and the pages of every book in the library begin to turn.'));
  },
  async boss_captain(E) {
    if (S.flags.b_captain) return;
    await E.say('布雷克', L('……二十年了。風還是沒有來。我們還在等風……等風把我們送回家……', '...Twenty years. The wind still has not come. We are still waiting... for a wind to carry us home...'));
    if (E.has('karon')) {
      await E.say(nm('karon'), L('布雷克！是我，卡隆！我來接你了！', "Blake! It's me, Karon! I've come for you!"));
      await E.say('布雷克', L('卡隆……？為什麼你的船回去了，我的沒有？你為什麼要丟下我們！', 'Karon...? Why did your ship go home and mine did not? Why did you leave us!'));
      await E.say(nm('karon'), L('……我也一直在問自己。所以今天，我回來了。', '...I have asked myself that every day. So today, I came back.'));
    }
    const r = await E.battle(['captain', 'bones4', 'bones4'], { boss: true, bg: 'ship' });
    if (r !== 'win') return;
    S.flags.b_captain = true; E.removeEnt('captain');
    if (S.inv.shipwheel) await E.say(null, L('你把舊舵輪放在船長的手邊。他輕輕地握住了它。', "You set the old wheel beside the captain's hand. Gently, he takes hold of it."));
    await E.say('布雷克', L('啊……風。是南風啊。……卡隆，幫我跟老媽說，我回來了。', "Ah... wind. The south wind. ...Karon, tell my old mother I made it home."));
    await E.stone('st_south');
    if (E.has('karon')) await E.say(nm('karon'), L('……一路順風，老友。', '...Fair winds, old friend.'));
  },
  async boss_sandking(E) {
    if (S.flags.b_sandking) return;
    await E.say('拉赫', L('凡人啊。你們知道沙暴是怎麼吞掉一個王國的嗎？一夜之間，我的子民、我的城、我的一切，全都埋在沙裡。', 'Mortals. Do you know how a sandstorm swallows a kingdom? In one night my people, my city, everything I had, lay buried in sand.'));
    await E.say('拉赫', L('所以我讓沙子停下來了。只要沒有風，就不會再有沙暴。', 'So I made the sand stand still. With no wind, there will never be another sandstorm.'));
    if (E.has('tarin')) await E.say(nm('tarin'), L('我的故鄉，就是在風停了以後，被不再流動的沙壓垮的！', 'My home was crushed by sand that would not flow, after the wind died!'));
    const r = await E.battle(['sandking', 'golem5'], { boss: true, bg: 'desert' });
    if (r !== 'win') return;
    S.flags.b_sandking = true; E.removeEnt('sandking');
    await E.say('拉赫', L('……沙在流動。像河一樣……我都忘了，沙漠原來這麼美。', '...The sand is flowing. Like a river... I had forgotten how beautiful the desert is.'));
    await E.stone('st_dusk');
  },
  async boss_frostqueen(E) {
    if (S.flags.b_frostqueen) return;
    await E.say('雪蘿', L('又有人來了。……別擔心，在我的冬天裡，誰都不會再死去。', 'More visitors. ...Do not be afraid. In my winter, no one will ever die again.'));
    await E.say('雪蘿', L('三年前，我沒能保護那些孩子。春天來的時候，我抱著的只剩冰冷的身體。所以，我不要春天了。', 'Three years ago I could not protect those children. When spring came, all I held were cold bodies. So I want no more spring.'));
    const r = await E.battle(['frostqueen', 'wisp4'], { boss: true, bg: 'ice' });
    if (r !== 'win') return;
    S.flags.b_frostqueen = true; E.removeEnt('frostqueen');
    await E.say(null, L('冰之迴廊開始融化。水滴的聲音裡，好像有孩子們在笑。', 'The Ice Corridor begins to melt. In the sound of the dripping water, there seems to be children laughing.'));
    await E.say('雪蘿', L('……是你們嗎。原諒我……我要去春天了。', "...Is it you? Forgive me... I am going to spring now."));
    await E.stone('st_north');
  },
  async enter_sanctum(E) {
    if (S.flags.b_nul || S.flags.sanctumIntro) return;
    S.flags.sanctumIntro = true;
    await E.say(null, L(`這裡連空氣都不會動。\n你們帶著 ${E.stones()} 顆風之石。石頭在發燙，像是在說「快一點」。`, `Even the air does not move here.\nYou carry ${E.stones()} Wind Stones. They burn warm, as if saying "hurry".`));
    if (S.flags.b_morgan) await E.say('摩根', L('……我說過，會在世界的盡頭再見面。這裡的魔物交給我，你們往前走！', '...I said we would meet again at the end of the world. Leave the monsters here to me. Go on ahead!'));
  },
  async boss_nul(E) {
    if (S.flags.b_nul) return;
    E.music(null);
    await E.wait(30);
    await E.say('涅爾', L('……為何要讓風吹。', '...Why must the wind blow?'));
    await E.say('涅爾', L('風帶來季節，也帶走生命。風帶來相遇，也帶來離別。只要一切靜止，就不會再有任何悲傷。', 'The wind brings the seasons, and carries life away. It brings meetings, and partings too. If everything stood still, there would be no more sorrow.'));
    const lead = S.lead;
    const replies = {
      rion: ['可是靜止的世界裡，也不會有人笑！我要的不是不會失去的世界，是值得珍惜的世界！', "But in a still world no one would laugh! I don't want a world where nothing is lost. I want a world worth holding on to!"],
      sela: ['風會帶走東西，可是也會帶來新的東西！草海的每一個春天，都是風送來的！', 'The wind takes things away, but it brings new things too! Every spring on the Grass Sea was carried in by the wind!'],
      gusta: ['我最討厭聽到「沒辦法」了。你只是放棄了而已，神也一樣！', 'I hate hearing that nothing can be done. You just gave up. Even a god can give up!'],
      mico: ['皮姆說，等她好了要去看海鳥。海鳥是要乘著風飛的！我不准你拿走她的明天！', "Pim wants to watch the seabirds when she's better. Seabirds fly on the wind! I won't let you take her tomorrow!"],
      fia: ['就算會忘記，就算會失去，那些記憶也是真的存在過！停下來的時間裡，什麼都不會留下！', 'Even if we forget, even if we lose, those memories were real! In stopped time, nothing would remain at all!'],
      karon: ['我在無風的海上漂了四十天。那裡不是天堂，是地獄。風，就是活著的證明！', 'I drifted forty days on a windless sea. That was no paradise. It was hell. The wind is the proof that we are alive!'],
    };
    await E.say(nm(lead), L(replies[lead][0], replies[lead][1]));
    await E.say('涅爾', L(`……那麼，就讓我看看。你們帶來的 ${E.stones()} 陣風，能不能吹動永恆。`, `...Then show me. Let me see whether the ${E.stones()} winds you carry can move eternity.`));
    const r = await E.battle(['nul'], { boss: true, bg: 'sanctum', music: 'final', scale: E.nulScale() });
    if (r !== 'win') return;
    S.flags.b_nul = true; E.removeEnt('nul');
    E.shake(40); E.sfx('boom');
    await E.say('涅爾', L('……好溫暖。原來風，是溫暖的。', '...How warm. So the wind is warm.'));
    for (let i = 0; i < 3; i++) { E.flash('#ffffff', 12); E.sfx('holy'); await E.wait(26); }
    await E.say(null, L('八顆風之石同時亮了起來。千萬道風，從聖域吹向整片大陸。', 'All the Wind Stones blaze at once. A thousand winds rush out of the sanctum across the whole land.'));
    await E.ending();
  },

  // ---------- epilogue ----------
  async epilogue(E) {
    const lead = S.lead;
    await E.say(null, L('──風回到了艾瑟蘭。\n風車轉了，帆鼓起來了，停下來的人們，一個接一個地醒了過來。', '── The winds returned to Aethra.\nWindmills turned, sails filled, and the people who had stopped woke up one by one.'));
    const ends = {
      rion: [['國王', '晨之鐘每天早上都會響。利恩，今天就補辦你的授劍儀式吧。', 'The Dawn Bell rings every morning now. Rion, let us hold your knighting at last.'], ['利恩', '……陛下，可以讓我先去一個地方嗎？哥哥說，他在艾爾莎姐姐的墓前等我。', '...Your Majesty, may I go somewhere first? My brother said he would wait for me at Elsa\'s grave.']],
      sela: [['奶奶', '妳聽，草在唱歌。羊群也開始往東走了。', 'Listen, the grass is singing. The herds have begun moving east.'], ['賽菈', '奶奶，我要繼續跟著風走。這個世界還有好多地方，我想親眼去看看。', 'Grandmother, I will keep following the wind. There are so many places in this world I want to see with my own eyes.']],
      gusta: [['寡婦', '古斯塔先生，我先生說，要請你喝一整年的酒。', 'Mister Gusta, my husband says he will buy your drinks for a whole year.'], ['古斯塔', '哼，一年太短了。……下次再有人說「沒辦法」，就來鐵爪堡找我吧。', 'Hmph, a year is too short. ...Next time someone says nothing can be done, tell them to come and find me at Ironclaw.']],
      mico: [['皮姆', '哥哥！海鳥！好多好多海鳥！', 'Brother! Seabirds! So many seabirds!'], ['米可', '……嗯。我答應過妳的。以後哥哥不偷東西了，去當船員，帶妳去看更遠的海。', '...Yeah. I promised you. I won\'t steal any more. I\'ll be a sailor and take you to see the far seas.']],
      fia: [['伊黛', '……妳是，妃雅？對不起，我又忘了。', '...You are, Fia? I am sorry, I forgot again.'], ['妃雅', '沒關係，老師。我是妃雅，是老師最得意的學生。……明天，我也會再告訴妳一次。', "It's all right, Master. I'm Fia, your best student. ...And tomorrow, I will tell you again."]],
      karon: [['老婆婆', '卡隆，謝謝你。我夢見布雷克回來了，在海邊對我揮手。', 'Karon, thank you. I dreamed Blake came home and waved to me from the shore.'], ['卡隆', '……他說，他回來了。來，老太婆，我們去海邊喝一杯。為了南風。', '...He said he made it home. Come, old girl, let us have a drink by the sea. For the south wind.']],
    };
    for (const [who, zh, en] of ends[lead]) await E.say(who === '利恩' || who === '賽菈' || who === '古斯塔' || who === '米可' || who === '妃雅' || who === '卡隆' ? nm(lead) : who, L(zh, en));
    for (const m of S.members) {
      if (m.id === lead) continue;
      const lines = {
        rion: ['我要回王都當一個真正的騎士。一個保護春天的騎士。', 'I will go home and become a true knight. A knight who protects the spring.'],
        sela: ['風往哪裡吹，我就往哪裡去。說不定，我們還會再見面喔！', 'Wherever the wind blows, I will go. Maybe we will meet again!'],
        gusta: ['下次有麻煩，記得來找我。免費的。', 'Next time there is trouble, come and find me. Free of charge.'],
        mico: ['我要回去看皮姆了！她一定在等我！', "I'm going home to Pim! She's waiting for me, I know it!"],
        fia: ['我要回學院，把這趟旅行全部寫下來。一個字都不會忘記。', 'I am going back to the academy to write down this whole journey. I will not forget a single word.'],
        karon: ['風回來了，船又能出海了。老骨頭也該回到甲板上了。', 'The wind is back and ships can sail again. Time these old bones went back on deck.'],
        bass: ['哈哈！跟神打過架的拳頭，我可以吹一輩子了！', 'Hah! I punched a god. I will be bragging about it for the rest of my life!'],
        lulu: ['止息病的人都好起來了。我要繼續旅行，去治療更多的人。', 'Everyone with the stillness sickness is getting better. I will keep travelling and heal more people.'],
        tarin: ['沙又開始流動了。我要回去，把故鄉從沙裡挖出來。', 'The sand flows again. I am going home to dig my village out of the sand.'],
      }[m.id];
      if (lines) await E.say(m.name, L(lines[0], lines[1]));
    }
    await E.say(null, L(`${nm(lead)}抬起頭。風吹過臉頰，帶著遠方的花香。\n旅程結束了。可是風，會一直吹下去。`, `${nm(lead)} looks up. The wind brushes past, carrying the scent of faraway flowers.\nThe journey is over. But the wind will keep on blowing.`));
  },
};
void STONES;
