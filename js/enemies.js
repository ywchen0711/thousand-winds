// Battle art for every monster, painted from lit blobs, plus small field sprites for the ones
// that walk around in dungeons.
import { Painter, ramp, canvas } from './gfx.js';
import { hasPix, pixArt, pixMini } from './pixmon.js';

const K = '#100818', WHITE = '#ffffff';
const eye = (p, x, y, col = K, glint = true, h = 2) => { for (let i = 0; i < h; i++) p.px(x, y + i, col); if (glint) p.px(x, y, WHITE); };

const ART = {
  jelly(c = '#58c858') {
    const p = new Painter(40, 32), R = ramp(c, 6);
    p.ball(20, 19, 17, 12, R, { spec: 0.5, cut: (u, v) => v > 0.8 });
    p.ball(20, 10, 5, 4, R, { z: 9, spec: 0.6 });
    p.ball(13, 14, 3, 2, ramp(c, 6).map((x, i) => R[Math.min(5, i + 2)]), { z: 13 });
    eye(p, 14, 17, K, false, 3); eye(p, 25, 17, K, false, 3); p.px(15, 17, WHITE); p.px(26, 17, WHITE);
    p.dots([[18, 23], [19, 24], [20, 24], [21, 24], [22, 23]], R[0]);
    return p.finish();
  },
  redjelly() {
    const c = ART.jelly('#e05838'), p = new Painter(40, 40);
    const R = ramp('#f8a030', 5);
    p.ball(20, 8, 4, 6, R, { z: 2 }); p.ball(13, 10, 2.5, 4, R, { z: 1 }); p.ball(27, 11, 2.5, 4, R, { z: 1 });
    const f = p.finish(), out = canvas(40, 40);
    out.x.drawImage(f, 0, 0); out.x.drawImage(c, 0, 8);
    return out;
  },
  bird() {
    const p = new Painter(48, 40), R = ramp('#e0c070', 6), W = ramp('#c07838', 5), O = ramp('#f08820', 5);
    p.poly([[30, 20], [46, 30], [40, 34], [28, 26]], W, { z: -2, lum: 0.4 });
    p.ball(24, 22, 11, 9, R, { z: 0 });
    p.poly([[22, 16], [8, 8], [2, 14], [10, 22], [20, 24]], W, { z: 6, lum: 0.6 });
    p.ball(16, 13, 7, 6.5, R, { z: 4 });
    p.poly([[10, 12], [1, 15], [10, 16]], O, { z: 9, lum: 0.75 });
    p.tube([[22, 30, 1.2], [21, 37, 1]], O); p.tube([[28, 30, 1.2], [29, 37, 1]], O);
    p.ball(18, 8, 3, 2, ramp('#d04030', 4), { z: 7 });
    eye(p, 14, 11);
    return p.finish();
  },
  hare() {
    const p = new Painter(44, 44), R = ramp('#d8c8b0', 6), Pk = ramp('#e8a0a0', 4), H = ramp('#f0d050', 5);
    p.ball(24, 30, 13, 10, R, { z: 0 });
    p.tube([[16, 14, 2.6, 2], [12, 2, 2, 2]], R); p.tube([[16, 14, 1.3, 4], [12, 3, 1, 4]], Pk);
    p.tube([[24, 14, 2.6, 2], [28, 2, 2, 2]], R); p.tube([[24, 14, 1.3, 4], [28, 3, 1, 4]], Pk);
    p.ball(20, 19, 8.5, 7.5, R, { z: 6 });
    p.poly([[20, 12], [22, 2], [24, 13]], H, { z: 12, lum: 0.75 });
    p.ball(14, 37, 4, 2.5, R, { z: 8 }); p.ball(30, 38, 4, 2.5, R, { z: 4 });
    p.ball(37, 27, 3.5, 3.5, ramp('#ffffff', 4), { z: 2 });
    eye(p, 16, 18); eye(p, 23, 18); p.dots([[19, 22], [20, 22]], '#c06070');
    return p.finish();
  },
  shroom() {
    const p = new Painter(44, 48), C = ramp('#d03838', 6), S = ramp('#f0e0c0', 5);
    p.tube([[22, 28, 8, 0], [22, 42, 9, 0]], S);
    p.ball(22, 44, 10, 3, S, { z: 2 });
    p.ball(22, 18, 20, 12, C, { z: 4, cut: (u, v) => v > 0.55 });
    p.ball(22, 25, 17, 3, ramp('#e8d0b0', 4), { z: 2 });
    for (const [x, y, r] of [[12, 12, 3], [24, 9, 3.5], [33, 15, 2.5], [18, 18, 2]]) p.ball(x, y, r, r * 0.8, ramp('#ffffff', 4), { z: 16 });
    p.tube([[13, 32, 2, 4], [8, 38, 2, 4]], S); p.tube([[31, 32, 2, 4], [36, 38, 2, 4]], S);
    eye(p, 18, 32); eye(p, 26, 32); p.dots([[21, 36], [22, 37], [23, 36]], '#804030');
    return p.finish();
  },
  bat() {
    const p = new Painter(60, 40), B = ramp('#6a4890', 6), M = ramp('#4a2860', 5);
    const wing = (s) => p.poly([[30, 16], [30 + s * 10, 6], [30 + s * 22, 4], [30 + s * 28, 14], [30 + s * 24, 22], [30 + s * 20, 18], [30 + s * 15, 26], [30 + s * 11, 20], [30 + s * 6, 26]], M, { z: -1, lum: 0.55, grad: 0.4 });
    wing(1); wing(-1);
    p.tube([[30, 16, 0.8, 1], [52, 5, 0.6, 1]], B); p.tube([[30, 16, 0.8, 1], [8, 5, 0.6, 1]], B);
    p.ball(30, 20, 7, 8, B, { z: 4 });
    p.poly([[25, 14], [24, 5], [29, 13]], B, { z: 6, lum: 0.6 }); p.poly([[35, 14], [36, 5], [31, 13]], B, { z: 6, lum: 0.6 });
    p.dots([[27, 18], [28, 18], [32, 18], [33, 18]], '#f83030'); p.dots([[28, 23], [32, 23]], WHITE);
    p.dots([[27, 22], [28, 22], [29, 22], [30, 22], [31, 22], [32, 22], [33, 22]], K);
    return p.finish();
  },
  crab(c = '#b85838', big = 1) {
    const S = big, p = new Painter(64 * S, 48 * S), R = ramp(c, 6), L = ramp(c, 5);
    const legs = (s) => { for (let k = 0; k < 3; k++) p.tube([[(32 + s * (12 + k * 5)) * S, (30 + k) * S, 2.2 * S, 0], [(32 + s * (22 + k * 4)) * S, (24 + k * 3) * S, 2 * S, 0], [(32 + s * (26 + k * 3)) * S, (42 + k) * S, 1.4 * S, 0]], L); };
    legs(1); legs(-1);
    p.ball(32 * S, 28 * S, 20 * S, 12 * S, R, { z: 4 * S, spec: 0.3 });
    for (let k = -2; k <= 2; k++) p.ball((32 + k * 7) * S, 20 * S, 2.2 * S, 2.2 * S, R, { z: 14 * S });
    const claw = (s) => {
      p.tube([[(32 + s * 14) * S, 26 * S, 3.5 * S, 8 * S], [(32 + s * 22) * S, 16 * S, 3.5 * S, 10 * S]], R);
      p.ball((32 + s * 24) * S, 11 * S, 7 * S, 6 * S, R, { z: 14 * S, spec: 0.3 });
      p.poly([[(32 + s * 20) * S, 6 * S], [(32 + s * 22) * S, -1 * S], [(32 + s * 27) * S, 5 * S]], R, { z: 18 * S, lum: 0.7 });
    };
    claw(1); claw(-1);
    p.tube([[28 * S, 20 * S, 1 * S, 10 * S], [27 * S, 13 * S, 1 * S, 10 * S]], R); p.tube([[36 * S, 20 * S, 1 * S, 10 * S], [37 * S, 13 * S, 1 * S, 10 * S]], R);
    p.ball(27 * S, 12 * S, 2 * S, 2 * S, ramp('#f8f0e0', 4), { z: 14 * S }); p.ball(37 * S, 12 * S, 2 * S, 2 * S, ramp('#f8f0e0', 4), { z: 14 * S });
    p.px(Math.round(27 * S), Math.round(12 * S), K); p.px(Math.round(37 * S), Math.round(12 * S), K);
    return p.finish({ inner: 2 * S });
  },
  bones() {
    const p = new Painter(48, 68), B = ramp('#e8e0c8', 5), M = ramp('#a0a8b8', 5), Wd = ramp('#8c5428', 5);
    p.tube([[18, 44, 2, 0], [16, 54, 1.8, 0], [15, 64, 1.8, 0]], B); p.tube([[28, 44, 2, 0], [30, 54, 1.8, 0], [31, 64, 1.8, 0]], B);
    p.ball(23, 42, 7, 3.5, B, { z: 2 });
    p.tube([[23, 22, 1.5, 0], [23, 42, 1.5, 0]], B);
    for (let k = 0; k < 4; k++) p.ball(23, 25 + k * 4, 8 - k * 0.8, 1.5, B, { z: 3 });
    p.tube([[15, 23, 2, 2], [12, 33, 1.6, 6], [16, 40, 1.5, 9]], B);
    p.tube([[31, 23, 2, 2], [36, 32, 1.6, 4], [40, 26, 1.5, 6]], B);
    p.poly([[38, 28], [44, 2], [46, 3], [41, 28]], M, { z: 10, lum: 0.75 }); p.poly([[36, 28], [44, 26], [44, 29], [36, 31]], Wd, { z: 11 });
    p.ball(11, 36, 8, 10, Wd, { z: 12, flat: 0.4 }); p.ball(11, 36, 3, 3, M, { z: 20 });
    p.ball(23, 13, 8, 8.5, B, { z: 6 });
    p.ball(23, 19, 5, 3, B, { z: 8 });
    for (const [x, y] of [[19, 12], [20, 12], [19, 13], [20, 13], [26, 12], [27, 12], [26, 13], [27, 13], [23, 16]]) p.px(x, y, K);
    p.px(19, 12, '#f84030'); p.px(26, 12, '#f84030');
    p.dots([[20, 20], [22, 20], [24, 20], [26, 20]], K);
    return p.finish();
  },
  clawmaw() {
    const c = ART.crab('#c04828', 2), p = new Painter(128, 100);
    const out = canvas(132, 104);
    out.x.drawImage(c, 2, 8);
    // spikes on the shell
    const s = new Painter(132, 40), R = ramp('#f0d0a0', 4);
    for (let k = -3; k <= 3; k++) s.poly([[66 + k * 9 - 3, 34], [66 + k * 9, 22 - Math.abs(k) * -1], [66 + k * 9 + 3, 34]], R, { z: 2, lum: 0.7 });
    out.x.drawImage(s.finish(), 0, 6);
    void p;
    return out;
  },
  merrow() {
    const p = new Painter(56, 72), G = ramp('#3a9880', 6), F = ramp('#58c8c8', 5), M = ramp('#b8c0d0', 5), Wd = ramp('#7c5030', 5);
    p.tube([[46, 4, 1.2, 8], [46, 70, 1.2, 8]], Wd);
    p.poly([[43, 6], [46, -2], [49, 6]], M, { z: 9, lum: 0.8 }); p.poly([[42, 6], [50, 6], [50, 8], [42, 8]], M, { z: 9 });
    p.tube([[22, 48, 3.5], [18, 60, 3], [16, 70, 3]], G); p.tube([[30, 48, 3.5], [34, 60, 3], [36, 70, 3]], G);
    p.ball(14, 70, 5, 2, F, { z: 3 }); p.ball(38, 70, 5, 2, F, { z: 3 });
    p.ball(26, 36, 11, 15, G, { z: 2 });
    p.ball(26, 38, 7, 11, ramp('#d8e8c0', 5), { z: 8 });
    p.poly([[18, 22], [26, 6], [34, 22]], F, { z: 0, lum: 0.6 });
    p.tube([[16, 28, 3, 6], [12, 40, 2.6, 8], [16, 48, 2.4, 10]], G);
    p.tube([[36, 28, 3, 6], [42, 34, 2.6, 10], [46, 34, 2.4, 12]], G);
    p.ball(26, 18, 9, 8, G, { z: 8 });
    p.poly([[17, 16], [10, 12], [16, 22]], F, { z: 10 }); p.poly([[35, 16], [42, 12], [36, 22]], F, { z: 10 });
    p.ball(26, 23, 6, 3, ramp('#2a6858', 4), { z: 13 });
    eye(p, 21, 16, '#f8e040', false); eye(p, 31, 16, '#f8e040', false); p.px(21, 17, K); p.px(31, 17, K);
    p.dots([[23, 23], [25, 23], [27, 23], [29, 23]], WHITE);
    return p.finish();
  },
  wisp() {
    const p = new Painter(44, 52), O = ['#801808', '#c83810', '#f07020', '#f8b030', '#f8e070', '#fffff0'];
    p.ball(22, 32, 13, 14, O, { amb: 0.5, z: 0 });
    p.ball(17, 20, 7, 9, O, { amb: 0.5, z: 2 }); p.ball(27, 14, 6, 10, O, { amb: 0.5, z: 2 }); p.ball(22, 8, 3, 7, O, { amb: 0.6, z: 4 });
    p.ball(22, 34, 8, 8, O.slice(3), { amb: 0.7, z: 10 });
    p.dots([[17, 30], [18, 30], [17, 31], [18, 31], [26, 30], [27, 30], [26, 31], [27, 31]], '#401008');
    p.dots([[19, 37], [20, 38], [21, 38], [22, 38], [23, 38], [24, 37]], '#401008');
    return p.finish({ out: '#401008' });
  },
  gargoyle() {
    const p = new Painter(72, 68), S = ramp('#8890a0', 6), D = ramp('#606878', 5);
    const wing = (s) => p.poly([[36 + s * 8, 24], [36 + s * 24, 4], [36 + s * 34, 8], [36 + s * 32, 22], [36 + s * 28, 18], [36 + s * 26, 30], [36 + s * 20, 26], [36 + s * 14, 34]], D, { z: -2, lum: 0.5, grad: 0.4 });
    wing(1); wing(-1);
    p.tube([[28, 50, 4], [24, 58, 3.5], [22, 66, 3]], S); p.tube([[44, 50, 4], [48, 58, 3.5], [50, 66, 3]], S);
    p.ball(36, 40, 13, 15, S, { z: 2 });
    p.tube([[24, 30, 4, 6], [18, 42, 3.4, 10], [22, 50, 3, 14]], S); p.tube([[48, 30, 4, 6], [54, 42, 3.4, 10], [50, 50, 3, 14]], S);
    for (const x of [19, 23, 49, 53]) p.poly([[x - 1, 50], [x, 56], [x + 1, 50]], ramp('#e8e0d0', 3), { z: 18 });
    p.ball(36, 22, 9, 8, S, { z: 10 });
    p.poly([[28, 18], [22, 6], [30, 15]], ramp('#d8d0b8', 4), { z: 12 }); p.poly([[44, 18], [50, 6], [42, 15]], ramp('#d8d0b8', 4), { z: 12 });
    p.ball(36, 27, 6, 3.5, S, { z: 15 });
    eye(p, 32, 21, '#f8d030', false); eye(p, 40, 21, '#f8d030', false);
    p.dots([[33, 28], [35, 29], [37, 29], [39, 28]], WHITE);
    return p.finish();
  },
  serpent() {
    const p = new Painter(72, 76), G = ramp('#2878a8', 6), B = ramp('#e8d8a0', 5), F = ramp('#e85848', 5);
    p.tube([[10, 70, 6, 0], [30, 66, 9, 0], [54, 62, 10, 0], [60, 48, 9, 4], [44, 40, 9, 8], [28, 36, 8, 10], [26, 22, 7, 14], [34, 12, 7, 16]], G, { spec: 0.2 });
    p.tube([[28, 36, 4, 18], [26, 22, 4, 20]], B);
    p.poly([[22, 24], [12, 14], [20, 30]], F, { z: 18 }); p.poly([[32, 24], [40, 16], [34, 30]], F, { z: 18 });
    p.ball(36, 12, 10, 8, G, { z: 18 });
    p.ball(44, 15, 7, 4, G, { z: 20 });
    p.poly([[30, 6], [36, -2], [42, 6]], F, { z: 22 });
    eye(p, 37, 9, '#f8e040', false); p.px(38, 10, K);
    p.dots([[48, 17], [46, 18], [44, 18], [42, 18]], K); p.dots([[46, 19], [43, 19]], WHITE);
    return p.finish();
  },
  seren() {
    const p = new Painter(96, 112), D = ramp('#482868', 6), Sk = ramp('#c8d0e8', 6), H = ramp('#e0e8f8', 6), T = ramp('#40d8c8', 5), M = ramp('#b0b8d0', 5);
    // trailing hair and mist
    p.tube([[46, 20, 9, -4], [38, 44, 10, -4], [30, 70, 7, -4], [20, 88, 4, -4]], H);
    p.tube([[52, 20, 9, -4], [62, 44, 10, -4], [68, 70, 7, -4], [76, 88, 4, -4]], H);
    p.poly([[30, 44], [66, 44], [80, 100], [62, 94], [50, 106], [38, 94], [18, 100]], D, { z: 2, lum: 0.55, grad: 0.5 });
    p.poly([[42, 44], [54, 44], [58, 90], [48, 98], [38, 90]], ramp('#683898', 5), { z: 3, lum: 0.6 });
    p.ball(48, 40, 11, 9, D, { z: 6 });
    p.ball(48, 36, 7, 4, Sk, { z: 10 });
    p.tube([[38, 36, 3, 8], [28, 48, 2.6, 12], [22, 40, 2.2, 16]], Sk); p.tube([[58, 36, 3, 8], [68, 46, 2.6, 12], [74, 52, 2.2, 16]], Sk);
    p.tube([[80, 8, 1.4, 14], [70, 100, 1.4, 14]], M);
    p.ball(80, 10, 5, 5, T, { z: 18, spec: 0.8, amb: 0.5 });
    p.ball(22, 38, 5, 5, T, { z: 18, spec: 0.8, amb: 0.5 });
    p.ball(48, 20, 9, 10, Sk, { z: 12 });
    p.ball(48, 12, 10, 7, H, { z: 14, cut: (u, v) => v > 0.35 });
    p.tube([[39, 14, 3, 14], [38, 26, 2.5, 13]], H); p.tube([[57, 14, 3, 14], [58, 26, 2.5, 13]], H);
    p.poly([[42, 6], [48, -1], [54, 6]], T, { z: 20 });
    eye(p, 44, 20, '#e02060', false); eye(p, 51, 20, '#e02060', false);
    p.dots([[47, 26], [48, 26]], '#8890b0');
    return p.finish({ out: '#100418' });
  },
  ordath() {
    const p = new Painter(160, 132), A = ramp('#305860', 6), G = ramp('#6a7848', 6), C = ramp('#e0b040', 6), E = ['#401008', '#c02018', '#f85030', '#f8d070'];
    // tentacles
    for (let k = 0; k < 6; k++) { const x = 40 + k * 16, s = k % 2 ? 1 : -1; p.tube([[x, 96, 7, 0], [x + s * 10, 112, 5, 0], [x - s * 4, 128, 3, 0]], G); }
    p.ball(80, 84, 46, 30, A, { z: 2 });
    p.ball(36, 56, 18, 16, A, { z: 8, spec: 0.3 }); p.ball(124, 56, 18, 16, A, { z: 8, spec: 0.3 });
    for (const x of [26, 36, 46]) p.poly([[x - 4, 46], [x, 30], [x + 4, 46]], ramp('#d0d8c8', 4), { z: 14 });
    for (const x of [114, 124, 134]) p.poly([[x - 4, 46], [x, 30], [x + 4, 46]], ramp('#d0d8c8', 4), { z: 14 });
    p.tube([[30, 66, 9, 10], [20, 90, 8, 14], [28, 108, 7, 18]], A); p.tube([[130, 66, 9, 10], [142, 88, 8, 14], [146, 70, 7, 18]], A);
    p.tube([[150, 4, 2.4, 20], [140, 124, 2.4, 20]], C);
    for (const dx of [-8, 0, 8]) p.poly([[150 + dx - 2, 10], [150 + dx * 1.2, -2], [150 + dx + 2, 10]], C, { z: 22 });
    p.ball(80, 50, 22, 20, G, { z: 14 });
    for (let k = -2; k <= 2; k++) p.tube([[80 + k * 7, 60, 4, 20], [80 + k * 9, 76, 3, 22], [80 + k * 8, 92, 1.8, 22]], G);
    p.ball(80, 30, 18, 6, C, { z: 22, spec: 0.5 });
    for (let k = -2; k <= 2; k++) p.poly([[80 + k * 8 - 4, 28], [80 + k * 8, 14 - (k === 0 ? 6 : 0)], [80 + k * 8 + 4, 28]], C, { z: 24 });
    p.ball(80, 21, 3, 3, ramp('#e83050', 4), { z: 30, spec: 0.8 });
    p.ball(70, 46, 5, 4, E, { z: 30, amb: 0.7 }); p.ball(90, 46, 5, 4, E, { z: 30, amb: 0.7 });
    p.dots([[70, 46], [90, 46]], '#ffffff');
    return p.finish({ out: '#081018', inner: 3 });
  },
  // ---------- Earthfall: the Ark's machines ----------
  drone() {
    const p = new Painter(52, 48), M = ramp('#8890a8', 6), D = ramp('#4a5068', 5), R = ['#401010', '#a01818', '#f03828', '#f8a070'], F = ['#802008', '#e06010', '#f8b030', '#f8f0a0'];
    p.ball(26, 42, 5, 4, F, { z: -2, amb: 0.7 });
    p.poly([[18, 20], [2, 12], [4, 26], [16, 28]], D, { z: -1, lum: 0.5 });
    p.poly([[34, 20], [50, 12], [48, 26], [36, 28]], D, { z: -1, lum: 0.5 });
    p.ball(26, 22, 15, 14, M, { z: 2, spec: 0.6 });
    p.ball(26, 34, 9, 4, D, { z: 6 });
    p.tube([[26, 4, 1, 8], [26, 10, 1.4, 8]], D); p.ball(26, 3, 2, 2, R, { z: 10, amb: 0.8 });
    p.ball(26, 21, 7, 6, ramp('#20242e', 4), { z: 12 });
    p.ball(26, 21, 4, 4, R, { z: 16, amb: 0.8, spec: 0.8 });
    p.dots([[25, 20]], '#ffffff');
    return p.finish({ out: '#0c0c18' });
  },
  knight() {
    const p = new Painter(96, 112), A = ramp('#7880a0', 6), D = ramp('#40465a', 6), Cp = ramp('#8a2030', 6), Cy = ['#105060', '#20a0c0', '#60e8f0', '#e0ffff'], S = ramp('#c8d0e0', 6);
    // cape behind
    p.poly([[30, 34], [66, 34], [78, 104], [60, 98], [48, 108], [36, 98], [18, 104]], Cp, { z: -4, lum: 0.5, grad: 0.5 });
    // legs
    p.tube([[40, 70, 7, 2], [38, 88, 6, 4], [36, 104, 6.5, 6]], A); p.tube([[56, 70, 7, 2], [58, 88, 6, 4], [60, 104, 6.5, 6]], A);
    p.ball(36, 106, 8, 4, D, { z: 8 }); p.ball(60, 106, 8, 4, D, { z: 8 });
    // body
    p.ball(48, 54, 17, 20, A, { z: 6, spec: 0.5 });
    p.ball(48, 70, 15, 5, D, { z: 10 });
    p.ball(48, 50, 5, 5, Cy, { z: 20, amb: 0.8, spec: 0.8 });
    // arms down to the hilt of a greatsword planted before him
    p.tube([[32, 40, 6, 14], [26, 56, 5, 18], [44, 64, 4.5, 30]], A);
    p.tube([[64, 40, 6, 14], [70, 56, 5, 18], [52, 64, 4.5, 30]], A);
    p.ball(30, 38, 9, 8, D, { z: 20, spec: 0.5 }); p.ball(66, 38, 9, 8, D, { z: 20, spec: 0.5 });
    p.tube([[48, 70, 3.4, 40], [48, 110, 1.6, 40]], S);
    p.tube([[36, 70, 2, 42], [60, 70, 2, 42]], ramp('#c0a040', 4));
    p.tube([[48, 54, 1.6, 44], [48, 68, 1.6, 44]], ramp('#5a3020', 4));
    p.ball(48, 53, 2.6, 2.6, Cy, { z: 48, amb: 0.8 });
    p.ball(48, 64, 7, 4, D, { z: 50, spec: 0.5 });
    // helmet with a glowing visor
    p.ball(48, 22, 11, 12, A, { z: 18, spec: 0.6 });
    p.poly([[42, 6], [48, -2], [54, 6]], Cp, { z: 20 });
    p.ball(48, 24, 8, 2, ramp('#101420', 3), { z: 26 });
    p.dots([[43, 24], [44, 24], [45, 24], [51, 24], [52, 24], [53, 24]], '#60e8f0');
    return p.finish({ out: '#080a14' });
  },
  core() {
    const p = new Painter(160, 120), M = ramp('#a0a8c0', 6), D = ramp('#4a5068', 6), G = ramp('#c8a048', 5), I = ['#101018', '#801838', '#e83050', '#f8a0b0'], Cy = ['#105060', '#20a0c0', '#60e8f0', '#e0ffff'];
    // hanging cables
    for (let k = 0; k < 7; k++) { const x = 32 + k * 16, s = k % 2 ? 1 : -1; p.tube([[x, 76, 4, 0], [x + s * 8, 96, 3.4, 0], [x - s * 3, 114, 2.6, 0]], D); p.ball(x - s * 3, 114, 3, 3, Cy, { z: 2, amb: 0.8 }); }
    // a ring around it: the back half hides behind the shell, the front half crosses it
    const ring = []; for (let a = 0; a <= 32; a++) { const t = (a / 32) * Math.PI * 2; ring.push([80 + Math.cos(t) * 70, 52 + Math.sin(t) * 18, 4, 20 + Math.sin(t) * 44]); }
    p.tube(ring, G);
    // armour shell and plates
    p.ball(80, 50, 40, 36, D, { z: 4, spec: 0.3 });
    for (const [x, y] of [[50, 26], [110, 26], [46, 70], [114, 70]]) p.ball(x, y, 13, 11, M, { z: 26, spec: 0.6 });
    p.ball(80, 50, 28, 27, M, { z: 20, spec: 0.7 });
    // the eye
    p.ball(80, 50, 18, 18, ramp('#181a24', 4), { z: 50 });
    p.ball(80, 50, 11, 11, I, { z: 70, amb: 0.85, spec: 0.9 });
    p.ball(80, 50, 4, 4, ['#100008', '#200010', '#400020', '#600030'], { z: 84 });
    p.dots([[76, 45], [77, 45], [76, 46]], '#ffffff');
    for (const [x, y] of [[80, 14], [40, 48], [120, 48], [80, 86]]) p.ball(x, y, 3, 3, Cy, { z: 95, amb: 0.8 });
    return p.finish({ out: '#080a14', inner: 3 });
  },

  // ---------- Saga of a Thousand Winds ----------
  wolf() {
    const p = new Painter(64, 48), F = ramp('#8890a8', 6), D = ramp('#4a5068', 5), E = ['#401010', '#c02818', '#f86030', '#f8e0a0'];
    p.poly([[10, 22], [0, 14], [4, 26]], F, { z: -2, lum: 0.5 });
    p.tube([[18, 34, 3.4, 0], [16, 46, 2.8, 0]], D); p.tube([[44, 34, 3.4, 0], [46, 46, 2.8, 0]], D);
    p.ball(32, 28, 20, 11, F, { z: 2, spec: 0.3 });
    p.tube([[24, 34, 3.6, 6], [22, 46, 3, 6]], F); p.tube([[50, 32, 3.6, 6], [52, 46, 3, 6]], F);
    p.ball(52, 20, 9, 8, F, { z: 10 });
    p.poly([[56, 18], [64, 22], [58, 27]], F, { z: 12, lum: 0.6 });
    p.poly([[46, 14], [48, 2], [52, 13]], D, { z: 12, lum: 0.6 }); p.poly([[53, 13], [56, 2], [58, 14]], F, { z: 13, lum: 0.7 });
    p.ball(55, 18, 1.6, 1.6, E, { z: 20, amb: 0.9 });
    p.dots([[60, 26], [58, 27]], '#ffffff');
    return p.finish();
  },
  golem() {
    const p = new Painter(72, 76), S = ramp('#c8a060', 6), D = ramp('#8a6838', 5), G = ['#105060', '#20a0c0', '#60e8f0', '#e0ffff'];
    p.tube([[26, 54, 7, 0], [24, 72, 7, 0]], D); p.tube([[46, 54, 7, 0], [48, 72, 7, 0]], D);
    p.ball(36, 40, 22, 20, S, { z: 2, spec: 0.2 });
    p.tube([[14, 30, 8, 8], [8, 50, 7, 10], [10, 62, 8, 12]], S); p.tube([[58, 30, 8, 8], [64, 50, 7, 10], [62, 62, 8, 12]], S);
    p.ball(36, 16, 12, 10, S, { z: 10 });
    for (const [x, y] of [[26, 34], [44, 46], [34, 58]]) p.ball(x, y, 4, 3, D, { z: 24 });
    p.ball(31, 15, 2.5, 2, G, { z: 26, amb: 0.9 }); p.ball(41, 15, 2.5, 2, G, { z: 26, amb: 0.9 });
    p.ball(36, 40, 4, 4, G, { z: 30, amb: 0.8 });
    return p.finish();
  },
  yeti() {
    const p = new Painter(72, 76), F = ramp('#e8ecf8', 6), Sk = ramp('#8898b8', 5), E = ['#102040', '#2060a0', '#60b0f0', '#e0f8ff'];
    p.tube([[26, 56, 8, 0], [24, 74, 8, 0]], F); p.tube([[46, 56, 8, 0], [48, 74, 8, 0]], F);
    p.ball(36, 42, 24, 22, F, { z: 2 });
    p.tube([[12, 30, 9, 8], [6, 52, 8, 10], [10, 66, 9, 12]], F); p.tube([[60, 30, 9, 8], [66, 52, 8, 10], [62, 66, 9, 12]], F);
    p.ball(36, 18, 14, 12, F, { z: 12 });
    p.ball(36, 22, 9, 7, Sk, { z: 22 });
    p.ball(31, 18, 2, 2, E, { z: 30, amb: 0.9 }); p.ball(41, 18, 2, 2, E, { z: 30, amb: 0.9 });
    p.dots([[33, 26], [34, 26], [38, 26], [39, 26]], '#ffffff');
    return p.finish({ out: '#202838' });
  },
  brigand() {
    const p = new Painter(64, 84), Sk = ramp('#e0a878', 5), C = ramp('#7a3828', 6), L = ramp('#4a3828', 5), M = ramp('#c8d0e0', 5), H = ramp('#302018', 5);
    p.tube([[24, 56, 6, 0], [22, 82, 5.5, 0]], L); p.tube([[40, 56, 6, 0], [42, 82, 5.5, 0]], L);
    p.ball(32, 42, 16, 18, C, { z: 4 });
    p.ball(32, 56, 15, 4, ramp('#3a2818', 4), { z: 10 });
    p.tube([[18, 30, 5, 10], [10, 44, 4.5, 14], [6, 30, 4, 16]], C); p.tube([[46, 30, 5, 10], [54, 44, 4.5, 14], [56, 56, 4, 16]], C);
    p.tube([[6, 32, 1.6, 30], [8, 2, 1, 30]], M); p.tube([[1, 30, 1.2, 32], [11, 30, 1.2, 32]], ramp('#c0a040', 3));
    p.ball(32, 16, 10, 11, Sk, { z: 14 });
    p.ball(32, 9, 11, 6, H, { z: 18, cut: (u, v) => v > 0.5 });
    p.ball(32, 24, 8, 4, H, { z: 20 });
    p.dots([[28, 16], [36, 16]], '#201010'); p.dots([[26, 14], [27, 14], [28, 14], [29, 14], [30, 14]], '#201010');
    return p.finish();
  },
  witch(c = '#482868') { return ART.seren(); },
  sandking() {
    const p = new Painter(140, 120), G = ramp('#d0a040', 6), D = ramp('#8a6020', 6), Cl = ramp('#e8d8b0', 5), E = ['#401008', '#c02818', '#f86030', '#f8e0a0'];
    p.poly([[40, 40], [100, 40], [120, 118], [20, 118]], ramp('#a83828', 6), { z: -2, lum: 0.5, grad: 0.5 });
    p.ball(70, 70, 28, 34, Cl, { z: 4 });
    p.ball(70, 56, 24, 12, G, { z: 10, spec: 0.5 });
    p.tube([[46, 50, 7, 12], [32, 72, 6, 14], [36, 92, 6, 16]], Cl); p.tube([[94, 50, 7, 12], [110, 70, 6, 14], [114, 52, 6, 16]], Cl);
    p.tube([[118, 6, 2.4, 24], [110, 116, 2.4, 24]], G); p.ball(118, 8, 7, 7, ramp('#40d8c8', 4), { z: 30, spec: 0.8 });
    p.ball(70, 30, 15, 16, ramp('#6a4a30', 5), { z: 16 });
    p.poly([[52, 22], [70, -2], [88, 22], [84, 30], [56, 30]], G, { z: 22, lum: 0.7, grad: 0.4 });
    p.ball(70, 14, 3, 3, ramp('#40d8c8', 4), { z: 30, spec: 0.8 });
    p.ball(64, 32, 2.4, 2, E, { z: 30, amb: 0.9 }); p.ball(76, 32, 2.4, 2, E, { z: 30, amb: 0.9 });
    return p.finish({ out: '#180c04' });
  },
  nul() {
    const p = new Painter(170, 132), V = ramp('#d8dce8', 6), D = ramp('#383c58', 6), Ey = ['#101018', '#304060', '#80a0d0', '#e8f0ff'];
    // the halo of still air behind it
    const ring = []; for (let a = 0; a <= 36; a++) { const t = (a / 36) * Math.PI * 2; ring.push([85 + Math.cos(t) * 76, 52 + Math.sin(t) * 46, 2.2, -10]); }
    p.tube(ring, ramp('#a8b0d0', 4));
    // robe
    p.poly([[56, 50], [114, 50], [140, 130], [30, 130]], D, { z: 0, lum: 0.5, grad: 0.6 });
    p.poly([[74, 50], [96, 50], [104, 130], [66, 130]], ramp('#585c80', 5), { z: 2, lum: 0.6 });
    // arms held wide, as if to stop the wind
    p.tube([[60, 56, 6, 6], [36, 60, 5, 8], [14, 48, 4, 10]], V); p.tube([[110, 56, 6, 6], [134, 60, 5, 8], [156, 48, 4, 10]], V);
    p.ball(12, 46, 6, 6, V, { z: 12 }); p.ball(158, 46, 6, 6, V, { z: 12 });
    // a mask without a mouth
    p.ball(85, 34, 20, 24, V, { z: 14, spec: 0.5 });
    p.ball(77, 32, 4, 3, Ey, { z: 32, amb: 0.9 }); p.ball(93, 32, 4, 3, Ey, { z: 32, amb: 0.9 });
    p.poly([[70, 8], [85, -2], [100, 8], [96, 14], [74, 14]], ramp('#f0e8c0', 5), { z: 30, lum: 0.7 });
    for (const [x, y] of [[40, 100], [130, 100], [85, 118], [20, 24], [150, 24]]) p.ball(x, y, 3, 3, ramp('#e8f0ff', 4), { z: 40, amb: 0.9 });
    return p.finish({ out: '#080a14', inner: 3 });
  },
};

// small 16x16 walkers for dungeon maps
const MINI = {
  wolf() { const p = new Painter(18, 14), F = ramp('#8890a8', 5); p.ball(8, 8, 6, 4, F, { z: 1 }); p.ball(14, 5, 3.5, 3, F, { z: 3 }); p.poly([[13, 3], [14, -1], [16, 3]], F, { z: 4, lum: 0.6 }); p.tube([[4, 11, 1, 0], [4, 14, 1, 0]], F); p.tube([[11, 11, 1, 0], [11, 14, 1, 0]], F); p.dots([[15, 5]], '#f03828'); return p.finish(); },
  golem() { const p = new Painter(16, 18), S = ramp('#c8a060', 5); p.ball(8, 10, 6, 6, S, { z: 1 }); p.ball(8, 4, 3.5, 3, S, { z: 3 }); p.dots([[7, 4], [9, 4]], '#60e8f0'); return p.finish(); },
  yeti() { const p = new Painter(16, 18), F = ramp('#e8ecf8', 5); p.ball(8, 10, 6, 6, F, { z: 1 }); p.ball(8, 4, 4, 3.5, F, { z: 3 }); p.dots([[7, 4], [9, 4]], '#2060a0'); return p.finish({ out: '#202838' }); },
  jelly() { const p = new Painter(16, 14), R = ramp('#58c858', 5); p.ball(8, 9, 7, 5, R, { spec: 0.5, cut: (u, v) => v > 0.8 }); p.dots([[6, 8], [10, 8]], K); return p.finish(); },
  bird() { const p = new Painter(16, 14), R = ramp('#e0c070', 5); p.ball(8, 8, 5, 4, R, { z: 1 }); p.poly([[8, 7], [1, 2], [3, 9]], ramp('#c07838', 4), { z: 3, lum: 0.6 }); p.dots([[11, 6]], K); return p.finish(); },
  drone() { const p = new Painter(16, 16), M = ramp('#8890a8', 5); p.poly([[5, 7], [0, 4], [1, 10]], ramp('#4a5068', 4), { lum: 0.5 }); p.poly([[11, 7], [16, 4], [15, 10]], ramp('#4a5068', 4), { lum: 0.5 }); p.ball(8, 8, 5, 5, M, { z: 2, spec: 0.6 }); p.ball(8, 14, 2, 1.5, ['#802008', '#e06010', '#f8b030', '#f8f0a0'], { amb: 0.8 }); p.dots([[8, 8]], '#f03828'); p.dots([[7, 7]], '#ffffff'); return p.finish(); },
  bat() { const p = new Painter(18, 14), B = ramp('#6a4890', 5); p.poly([[9, 6], [1, 2], [0, 8], [4, 7], [6, 11]], B, { lum: 0.5 }); p.poly([[9, 6], [17, 2], [18, 8], [14, 7], [12, 11]], B, { lum: 0.5 }); p.ball(9, 7, 3, 3.5, B, { z: 3 }); p.dots([[8, 6], [10, 6]], '#f83030'); return p.finish(); },
  crab() { const p = new Painter(18, 14), R = ramp('#b85838', 5); p.ball(9, 9, 7, 4, R, { z: 1 }); p.ball(2.5, 5, 2.5, 2.5, R, { z: 3 }); p.ball(15.5, 5, 2.5, 2.5, R, { z: 3 }); p.dots([[7, 6], [11, 6]], K); return p.finish(); },
  bones() { const p = new Painter(16, 20), B = ramp('#e8e0c8', 4); p.tube([[8, 9, 1, 0], [8, 15, 1, 0]], B); p.tube([[6, 15, 1, 0], [5, 19, 1, 0]], B); p.tube([[10, 15, 1, 0], [11, 19, 1, 0]], B); p.ball(8, 11, 4, 1.2, B, { z: 2 }); p.ball(8, 5, 4, 4, B, { z: 3 }); p.dots([[6, 5], [10, 5]], K); return p.finish(); },
  shroom() { const p = new Painter(16, 16), C = ramp('#d03838', 5), S = ramp('#f0e0c0', 4); p.tube([[8, 9, 3, 0], [8, 14, 3.5, 0]], S); p.ball(8, 7, 7, 4.5, C, { z: 3, cut: (u, v) => v > 0.5 }); p.dots([[5, 5], [10, 4]], WHITE); p.dots([[7, 11], [9, 11]], K); return p.finish(); },
  merrow() { const p = new Painter(16, 22), G = ramp('#3a9880', 5); p.tube([[6, 14, 1.5], [5, 21, 1.4]], G); p.tube([[10, 14, 1.5], [11, 21, 1.4]], G); p.ball(8, 11, 4, 5, G, { z: 1 }); p.ball(8, 5, 4, 3.5, G, { z: 3 }); p.poly([[8, 0], [5, 3], [11, 3]], ramp('#58c8c8', 4), { z: 4 }); p.tube([[13, 2, 0.6, 5], [13, 21, 0.6, 5]], ramp('#b8c0d0', 4)); p.dots([[6, 5], [10, 5]], '#f8e040'); return p.finish(); },
  wisp() { const p = new Painter(16, 18), O = ['#801808', '#c83810', '#f07020', '#f8b030', '#f8e070']; p.ball(8, 11, 6, 6, O, { amb: 0.5 }); p.ball(8, 5, 3, 5, O, { amb: 0.6, z: 2 }); p.dots([[6, 11], [10, 11]], '#401008'); return p.finish({ out: '#401008' }); },
  gargoyle() { const p = new Painter(20, 20), S = ramp('#8890a0', 5); p.poly([[10, 8], [1, 2], [2, 10]], S, { lum: 0.4 }); p.poly([[10, 8], [19, 2], [18, 10]], S, { lum: 0.4 }); p.ball(10, 12, 5, 6, S, { z: 2 }); p.ball(10, 6, 3.5, 3, S, { z: 4 }); p.dots([[9, 6], [11, 6]], '#f8d030'); return p.finish(); },
  serpent() { const p = new Painter(18, 18), G = ramp('#2878a8', 5); p.tube([[3, 16, 2.5, 0], [12, 14, 3, 1], [12, 8, 2.6, 3], [8, 4, 2.6, 5]], G); p.ball(9, 4, 3.5, 3, G, { z: 7 }); p.px(9, 3, '#f8e040'); return p.finish(); },
};

const cache = new Map();
// a family's stronger members are the same picture in other colours, like the 16-bit palette swaps
function recolor(src, hue = 0, sat = 1) {
  const c = canvas(src.width, src.height);
  c.x.drawImage(src, 0, 0);
  const id = c.x.getImageData(0, 0, src.width, src.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx - mn < 0.06) continue; // keep outlines, greys and whites
    const dd = mx - mn, sv = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
    let h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    h = (h * 60 + hue) % 360; if (h < 0) h += 360;
    const s2 = Math.min(1, sv * sat), q = l < 0.5 ? l * (1 + s2) : l + s2 - l * s2, pp = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? pp + (q - pp) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? pp + (q - pp) * (2 / 3 - t) * 6 : pp; };
    d[i] = Math.round(f(h / 360 + 1 / 3) * 255); d[i + 1] = Math.round(f(h / 360) * 255); d[i + 2] = Math.round(f(h / 360 - 1 / 3) * 255);
  }
  c.x.putImageData(id, 0, 0);
  return c;
}
export function enemyArt(key, hue = 0, sat = 1) {
  const k = key + '|' + hue + '|' + sat;
  // hand-drawn art first; the painted shapes are only a fallback
  if (!cache.has(k)) cache.set(k, hue || sat !== 1 ? recolor(enemyArt(key), hue, sat) : hasPix(key) ? pixArt(key) : ART[key]());
  return cache.get(k);
}
export function miniArt(key, hue = 0, sat = 1) {
  const k = 'mini:' + key + '|' + hue + '|' + sat;
  if (!cache.has(k)) cache.set(k, hue || sat !== 1 ? recolor(miniArt(key), hue, sat) : hasPix(key) ? pixMini(key) : MINI[key] ? MINI[key]() : enemyArt(key));
  return cache.get(k);
}
// bosses are drawn twice as large in battle, every pixel doubled
export function bossArt(key, hue = 0, sat = 1) {
  const k = 'boss:' + key + '|' + hue + '|' + sat;
  if (!cache.has(k)) {
    const a = enemyArt(key, hue, sat);
    if (!hasPix(key)) { cache.set(k, a); return a; }
    const c = canvas(a.width * 2, a.height * 2); c.x.imageSmoothingEnabled = false; c.x.drawImage(a, 0, 0, c.width, c.height);
    cache.set(k, c);
  }
  return cache.get(k);
}
export const ART_KEYS = Object.keys(ART);
