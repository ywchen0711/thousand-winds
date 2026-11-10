# 千風群英譚 · Saga of a Thousand Winds

An original free-scenario RPG in the style of the 16-bit console era, playable in Traditional Chinese and English. It plays in the browser at the old 256×224 resolution, scaled up with crisp pixels and optional scanlines.

**Play:** https://ywchen0711.github.io/thousand-winds/

## The story

On the continent of Aethra, a thousand winds carry the seasons, the years and the memories of the world. A thousand years ago, Nul, the God of Stillness, tried to stop every wind so that nothing would ever change, part or die. Eight wind spirits became the eight **Wind Stones** and sealed him at the heart of the land.

Now the winds are failing. Windmills stand still, ships cannot sail, and more and more people catch the **stillness sickness**, a slow stopping of the body. Four apostles of stillness have taken up Nul's cause. Each is someone who lost too much and decided that a world without change would be kinder:

- **Morgan the Ash Knight** lost his betrothed to a plague.
- **Ide the Silent Witch** is losing her memories.
- **Rah the Sand King** watched a sandstorm bury his kingdom.
- **Sirol the Frost Queen** could not save the children of her village.

## The heroes

You choose one of six heroes. Each has a home town, an opening and an ending of their own. The other five, along with three more companions, can be met and recruited around the world.

| Hero | Home | Strengths |
|---|---|---|
| 利恩 Rion, a squire looking for his lost brother | Royal Valmont | sword, spear |
| 賽菈 Sela, a huntress of the Grass Sea | Grass Sea Camp | bow, spear, wind |
| 古斯塔 Gusta, a mercenary who hates "nothing can be done" | Ironclaw Keep | greatsword, axe |
| 米可 Mico, a thief stealing for his sick sister | Mistport | dagger, martial arts |
| 妃雅 Fia, an apprentice mage searching for her teacher | Astral Academy | staff, fire, water, earth |
| 卡隆 Karon, an old captain who survived the windless sea | Saltreach | axe, sword |

Bass the brawler, Lulu the healer and Tarin the lancer can be recruited too. Up to four people travel together. Companions can wait at a tavern and rejoin later, keeping everything they learned.

## How it plays

- **A free scenario.** There is no fixed order. Tavern rumours and conversations reveal places on the world map, and you choose where to go next. Some places need a key or a pass that someone will only give you once you have proved yourself.
- **Time moves on.** Every Wind Stone you recover moves the world into a new era. New events appear, roads open, and some troubles grow worse if you leave them too long. If the Grass Sea is not helped in time, its wind is lost for good.
- **The Wind Stones.** Gathering five stones makes the Sanctum of Stillness rise in the central lake; otherwise it rises after the seventh era. The final battle is harder for every stone you have not recovered.
- **No levels.** Heroes grow after each battle. Depending on what they did and how strong the monsters were, they may gain:
  - more HP, WP or JP;
  - a point of strength, vitality, agility or will;
  - a level in the weapon or magic school they used.
- **Inspiration.** Attacking with a weapon can spark a sudden inspiration (a light bulb), which teaches a new technique and uses it on the spot. There are 31 techniques across eight weapon types.
- **Two weapons each.** Anyone can equip any weapon. Each hero carries up to two, so the commands in battle are your weapons, then Magic, Item, Guard and Run.
- **WP, JP and LP.**
  - Techniques cost WP and spells cost JP.
  - HP comes back fully after every battle, but WP and JP only return at an inn.
  - A hero who falls in battle loses 1 LP (life point). A companion with no LP left is gone for good; if your chosen hero runs out, the adventure ends. Inns restore LP.
- **Spells.** Magic shops teach 17 spells across six schools (fire, water, wind, earth, light and dark), one hero at a time.
- **Monsters.** Strength is fixed by region and never scales with you. Monsters come in families that change colour as they get stronger. In dungeons you can see them coming, and they chase you. Travelling across the world map can also lead to an ambush.

## Controls

| | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move, choose on the map | arrow keys / WASD | d-pad / stick | on-screen d-pad |
| Confirm, talk, travel | Z / Enter / Space | A | A |
| Cancel, open the menu | X / Esc | B | B |
| Menu | C / Tab | Y / Start | MENU |

Switch between Chinese and English on the title screen or in Config.

## Files

- `js/story.js` holds every opening, conversation, rumour, recruitment, boss event and ending.
- `js/data.js` holds the heroes, weapons, techniques, spells, items, monsters and shops.
- `js/maps.js` holds the town template and its eight towns, their rooms, the dungeon generator and the places on the world map.
- `js/worldmap.js` is the world map: places, travel and ambushes.
- `js/battle.js` contains battles, inspiration, LP and growth.
- `js/rules.js` has the battle maths. It has no drawing code, so balance can be simulated in Node.
- `js/party.js` covers heroes, growth after battle and saving.
- `js/menu.js` covers the field menu, equipment, status, shops, spell shops and the tavern.
- `js/main.js` runs the main loop, the title, choosing your hero, transitions and the ending.
- `js/gfx.js`, `js/sprites.js`, `js/enemies.js` and `js/tiles.js` draw everything.
- `js/audio.js` is the synthesizer and soundtrack.
- `js/i18n.js` switches the language.

The engine and pixel style are shared with [蒼潮魔塔傳 Spire of the Blue Tide](https://ywchen0711.github.io/spire-tide/). The world, characters, story, art and music are all original. There is no build step: open `index.html` through any static web server.
