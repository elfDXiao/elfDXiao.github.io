// slope-beam-20261019.js — P.145 斜め天井・フリーサイズ梁パネルキット 禁则门禁
// 用法：node test/slope-beam-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const web = path.join(__dirname, '..');
const ctx = { window: {}, console };
vm.createContext(ctx);
function load(f) { vm.runInContext(fs.readFileSync(path.join(web, f), 'utf8'), ctx); }
load('data/products.js');
load('js/price.js');
load('js/quote.js');
const Q = ctx.window.LIDEA.quote;
Q.init(ctx.window.LIDEA_DATA);

let pass = 0, fail = 0;
function assert(name, cond, extra) {
  if (cond) { pass++; console.log('  ✔ ' + name); }
  else { fail++; console.log('  ✘ ' + name + (extra !== undefined ? '  ← ' + JSON.stringify(extra) : '')); }
}
const set = (d, c) => { Q.state.sel[d] = c; };
const setSize = (s) => { Q.state.size = s; };
const multi = (d, c) => { Q.state.multi[d] = Q.state.multi[d] || {}; Q.state.multi[d][c] = true; };
const clearMulti = (d, c) => { if (Q.state.multi[d]) delete Q.state.multi[d][c]; };
const dis = (d, c) => Q.disabledReason(d, c);

console.log('== 斜め天井C面（C01）==');
setSize('1616'); set('type', 'M'); set('ceiling', 'E2'); set('fan', 'M');
multi('misc_options', 'C01');
assert('C01 选中后 ダウンライト EC 不可', !!dis('lighting', 'EC'));
assert('C01 选中后 追加ダウンライト HP 不可', !!dis('lighting_add', 'HP'));
assert('C01 选中后 サウンドシステム K28 不可', !!dis('bathroom_tv', 'K28'));
assert('C01 选中后 シャワーシステム H3 不可', !!dis('faucet', 'H3'));
assert('C01 选中后 換気乾燥暖房機 P 不可', !!dis('fan', 'P'));
assert('C01 选中后 2室天井換気扇 D 不可', !!dis('fan', 'D'));
assert('C01 选中后 自由梁板 S79 不可', !!dis('misc_options', 'S79'));
assert('C01 选中后 自由梁板 S80 不可', !!dis('misc_options', 'S80'));
set('ceiling', 'E9');
assert('C01 + 壁高1900：天井 E9 不可', !!dis('ceiling', 'E9'));
set('ceiling', 'E2');
clearMulti('misc_options', 'C01');
console.log('== 斜め天井C面（C02）==');
multi('misc_options', 'C02');
assert('C02 选中后 内組平天井（廻し縁なし）E2 不可', !!dis('ceiling', 'E2'));
assert('C02 选中后 内組平天井（廻し縁なし）E0 不可', !!dis('ceiling', 'E0'));
assert('C02 选中后 平天井 J2 可', !dis('ceiling', 'J2'));
clearMulti('misc_options', 'C02');
console.log('== 斜め天井C面 × ドア位置移動 × 引き戸 ==');
multi('misc_options', 'C01'); set('door_position', 'RLS'); set('door', 'F1');
assert('RLS（RL100移动）× C01：引き戸 F1 不可', !!dis('door', 'F1'));
set('door_position', 'RL');
assert('RL（无移动）× C01：引き戸 F1 可', !dis('door', 'F1'));
set('door_position', 'RLS');
assert('反向：已选 F1 + RLS 时 C01 不可', (() => { clearMulti('misc_options', 'C01'); const r = !!Q.disabledReason('misc_options', 'C01'); multi('misc_options', 'C01'); return r; })());
clearMulti('misc_options', 'C01'); set('door', null); set('door_position', 'RL');
console.log('== 斜め天井B面（C33）==');
setSize('1624');
assert('C33 在 1624 尺寸不可', !!dis('misc_options', 'C33'));
setSize('S1216'); set('door_position', 'RC');
multi('misc_options', 'C33');
assert('S1216 × ドア位置 RC：C33 不可', (() => { clearMulti('misc_options', 'C33'); const r = !!Q.disabledReason('misc_options', 'C33'); multi('misc_options', 'C33'); return r; })());
assert('S1216 × RC 时 ドア位置 RC 不可选', !!dis('door_position', 'RC'));
setSize('1316'); set('door_position', 'RLS');
multi('misc_options', 'C33');
assert('1316 × ドア位置移動 RCS：不可', !!dis('door_position', 'RCS'));
assert('1316 × ドア位置 RL（无移动）可', !dis('door_position', 'RL'));
assert('C33 × ダウンライト EC 不可', !!dis('lighting', 'EC'));
assert('C33 × フルフォール DB 不可', !!dis('shower_hook', 'DB'));
assert('C33 × タテ長ミラー AD 不可', !!dis('mirror', 'AD'));
set('door_position', 'RC');
assert('C33 + ドア位置 RC：間仕切り F27 不可', !!dis('door', 'F27'));
set('door_position', 'RL');
assert('C33 + ドア位置 RL：間仕切り F27 可', !dis('door', 'F27'));
set('ceiling', 'E0');
assert('C33 + 壁高2000：握りバー GB(1000L) 不可', !!dis('shower_hook', 'GB'));
assert('C33 + 壁高2000：タテ長ミラー AB(30100) 不可', !!dis('mirror', 'AB'));
set('type', 'M'); set('support_pack', 'B35');
assert('C33 + 壁高2000 + M：サポートパック 不可', !!dis('support_pack', 'B35'));
set('type', 'H');
assert('C33 + 壁高2000 + H：サポートパック 可', !dis('support_pack', 'B35'));
clearMulti('misc_options', 'C33');
console.log('== フリーサイズ梁パネルキット（S79/S80）==');
set('ceiling', 'E2'); setSize('1616'); set('type', 'M'); set('fan', 'M'); set('shower_hook', null); set('mirror', null); set('support_pack', null);
multi('misc_options', 'S79');
assert('S79 × サウンド K28 不可', !!dis('bathroom_tv', 'K28'));
assert('S79 × 斜め天井 C01 不可', !!dis('misc_options', 'C01'));
clearMulti('misc_options', 'S79');
multi('misc_options', 'S80');
assert('S80 × ダウンライト GP 不可', !!dis('lighting', 'GP'));
assert('S80 × シャワーシステム H4 不可', !!dis('faucet', 'H4'));
assert('S80 × フルフォール DB 不可', !!dis('shower_hook', 'DB'));
assert('S80 × サポートパック不可', !dis('support_pack', null) ? !!Q.disabledReason('support_pack', 'B35') : true);
setSize('1216');
assert('S80 + 1216 × 換気乾燥暖房機 R 不可', !!dis('fan', 'R'));
assert('S80 + 1216 × サウンド K28 不可', !!dis('bathroom_tv', 'K28'));
setSize('1616'); set('type', 'B'); set('shower_hook', null);
assert('S80 + Bタイプ：握りバー GC(800L) 不可', !!dis('shower_hook', 'GC'));
set('type', 'M');
assert('S80 + Mタイプ：握りバー GC(800L) 可', !dis('shower_hook', 'GC'));

console.log('\n' + (fail === 0 ? '✅ 全部通过' : '❌ 失败 ' + fail + ' 项') + '（' + pass + '/' + (pass + fail) + '）');
process.exit(fail === 0 ? 0 : 1);