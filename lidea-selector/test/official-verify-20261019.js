// official-verify-20261019.js — 2026-08 価格掲載版 カタログ（P110-P147）逐表核对门禁
//   配套：test/fix-official-20261019.js（数据修订脚本，来源页写在每条 note 里）
//   证据：lidea-bathroom/_verify_official_20261019/（official_p*.txt 表抽提 + imgs/*.png 放大图）
//   用法：node test/official-verify-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const web = path.join(__dirname, '..');
const ctx = { window: {}, console, Blob: function () {} };
vm.createContext(ctx);
['data/products.js', 'js/price.js', 'js/quote.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(web, f), 'utf8'), ctx);
});
const DATA = ctx.window.LIDEA_DATA;
const Q = ctx.window.LIDEA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

/** 设定选择并取该维度选项的 contribution / disabledReason */
function probe(dimId, code, sel, size) {
  Q.state.sel = Object.assign({ type: 'M' }, sel || {});
  Q.state.multi = {};
  Object.keys(Q.state.sel).forEach(k => { if (k.indexOf('multi:') === 0) { /* noop */ } });
  Q.setSize(size || '1616');
  const d = Q.dim(dimId);
  if (d.kind === 'radio') Q.state.sel[dimId] = code;
  else { Q.state.multi[dimId] = {}; Q.state.multi[dimId][code] = true; }
  return { v: Q.contributionFor(dimId), dis: Q.disabledReason(dimId, code) };
}
function v(dimId, code, sel, size) { return probe(dimId, code, sel, size).v; }
function dis(dimId, code, sel, size) { return probe(dimId, code, sel, size).dis; }

console.log('== P.114 床（C列 +50,000/+70,000、2E/2C/2A は C 専用）==');
assert('C×1E = +50,000', v('floor', '1E', { type: 'C' }) === 50000, v('floor', '1E', { type: 'C' }));
assert('C×1C = +50,000', v('floor', '1C', { type: 'C' }) === 50000);
assert('C×1A = +50,000', v('floor', '1A', { type: 'C' }) === 50000);
assert('C×1F = +70,000', v('floor', '1F', { type: 'C' }) === 70000);
assert('C×1D = +70,000', v('floor', '1D', { type: 'C' }) === 70000);
assert('C×1B = +70,000', v('floor', '1B', { type: 'C' }) === 70000);
assert('M×1E = ±0', v('floor', '1E', { type: 'M' }) === 0);
assert('M×1F = +20,000', v('floor', '1F', { type: 'M' }) === 20000);
assert('C×2E = ±0 且可选', v('floor', '2E', { type: 'C' }) === 0 && !dis('floor', '2E', { type: 'C' }));
['H', 'B', 'M'].forEach(t => assert(t + '×2E = 不可选', !!dis('floor', '2E', { type: t }) && v('floor', '2E', { type: t }) === null));
assert('C×2A = ±0（同 2E 合并格）', v('floor', '2A', { type: 'C' }) === 0);

console.log('== P.117 浴槽排水栓（タイプ×材質）==');
assert('M(FRP)×ゴム栓 = −15,000', v('bt_drain', 'DRAIN1', { type: 'M', bt_tub: 'TA' }) === -15000);
assert('C(FRP)×ゴム栓 = ±0', v('bt_drain', 'DRAIN1', { type: 'C', bt_tub: 'TA' }) === 0);
assert('M(パール)×ゴム栓 = 不可选', v('bt_drain', 'DRAIN1', { type: 'M', bt_tub: 'T6' }) === null && !!dis('bt_drain', 'DRAIN1', { type: 'M', bt_tub: 'T6' }));
assert('M(ルフレトーン)×ゴム栓 = −15,000', v('bt_drain', 'DRAIN1', { type: 'M', bt_tub: 'TR' }) === -15000);
assert('M(パール)×プッシュ = ±0', v('bt_drain', 'DRAIN3', { type: 'M', bt_tub: 'T6' }) === 0);
assert('C(パール)×プッシュ = +15,000', v('bt_drain', 'DRAIN3', { type: 'C', bt_tub: 'T6' }) === 15000);
assert('C(FRP)×プッシュ = +15,000（C列はパール/FRP同額）', v('bt_drain', 'DRAIN3', { type: 'C', bt_tub: 'TA' }) === 15000);

console.log('== P.128 カウンター（NY=HBM−35,000／XVはC―／アッパーカウンターは1624・S1818×M/C）==');
assert('M×NY = −35,000', v('counter', 'NY', { type: 'M' }) === -35000);
assert('C×NY = ±0', v('counter', 'NY', { type: 'C' }) === 0);
assert('M×NN = −35,000（NN/NY は同額セル）', v('counter', 'NN', { type: 'M' }) === -35000);
assert('C×XV = 不可选', v('counter', 'XV', { type: 'C' }) === null && !!dis('counter', 'XV', { type: 'C' }));
assert('M×AC1 @1624 = ±0 且可选', v('counter', 'AC1', { type: 'M' }, '1624') === 0 && !dis('counter', 'AC1', { type: 'M' }, '1624'));
assert('M×AC1 @1616 = 不可选（1624・S1818 専用）', !!dis('counter', 'AC1', { type: 'M' }, '1616'));
assert('H×AC2 @S1818 = ±0', v('counter', 'AC2', { type: 'H' }, 'S1818') === 0);

console.log('== P.129 照明（EC/EH標準=0、増灯=+17,900、YC/YH/PC の 1620系、1216×OG1 の3灯）==');
assert('M@1616×EC = ±0', v('lighting', 'EC', { type: 'M' }, '1616') === 0);
assert('M@1624×EC = ±0', v('lighting', 'EC', { type: 'M' }, '1624') === 0);
assert('M@1616×EC_UP = +17,900', v('lighting', 'EC_UP', { type: 'M' }, '1616') === 17900);
assert('M@1624×EC_UP = +17,900（4灯）', v('lighting', 'EC_UP', { type: 'M' }, '1624') === 17900);
assert('M@1616×EH_UP = +17,900', v('lighting', 'EH_UP', { type: 'M' }, '1616') === 17900);
assert('M@1620×YC = +3,900', v('lighting', 'YC', { type: 'M' }, '1620') === 3900);
assert('M@1624×YC = +3,900', v('lighting', 'YC', { type: 'M' }, '1624') === 3900);
assert('M@1616×YC = +21,800（2灯）', v('lighting', 'YC', { type: 'M' }, '1616') === 21800);
assert('M@1616×YC1 = −7,000（1灯）', v('lighting', 'YC1', { type: 'M' }, '1616') === -7000);
assert('M@1620×YC1 = 不可选（1624・1620系に1灯仕様なし）', !!dis('lighting', 'YC1', { type: 'M' }, '1620'));
assert('M@1620×PC = +15,900', v('lighting', 'PC', { type: 'M' }, '1620') === 15900);
assert('M@1616×PC = +33,800（2灯）', v('lighting', 'PC', { type: 'M' }, '1616') === 33800);
assert('M@1616×PC1 = −1,000（1灯）', v('lighting', 'PC1', { type: 'M' }, '1616') === -1000);
assert('M@1216×GP = +20,200（通常2灯）', v('lighting', 'GP', { type: 'M', faucet: 'D4' }, '1216') === 20200);
assert('H@1216×GP×シャワーシステム = +48,200（3灯）', v('lighting', 'GP', { type: 'H', faucet: 'H3' }, '1216') === 48200);
assert('H@1216×RW×シャワーシステム = +114,200（3灯）', v('lighting', 'RW', { type: 'H', faucet: 'H3' }, '1216') === 114200);
assert('H@1616×GP×シャワーシステム = +48,200（3灯・尺寸不変）', v('lighting', 'GP', { type: 'H', faucet: 'H3' }, '1616') === 48200);

console.log('== P.130 ミラー（NN の B/M/C、EA は H×シャワーシステム、BA は C、キレイ鏡は B/M/C）==');
assert('M×NN = −13,500', v('mirror', 'NN', { type: 'M' }) === -13500);
assert('C×NN = −8,700', v('mirror', 'NN', { type: 'C' }) === -8700);
assert('H×NN = ±0', v('mirror', 'NN', { type: 'H' }) === 0);
assert('B@1620×NN = −40,500', v('mirror', 'NN', { type: 'B' }, '1620') === -40500);
assert('B@1618×NN = −37,500（□□18）', v('mirror', 'NN', { type: 'B' }, '1618') === -37500);
assert('B@1616×NN = −31,500（□□16）', v('mirror', 'NN', { type: 'B' }, '1616') === -31500);
assert('H×EA×シャワーシステム = +10,000', v('mirror', 'EA', { type: 'H', faucet: 'H3' }) === 10000);
assert('H×EA×ボディハグ（D4）= 不可选', v('mirror', 'EA', { type: 'H', faucet: 'D4' }) === null && !!dis('mirror', 'EA', { type: 'H', faucet: 'D4' }));
assert('M×EA = 不可选（H専用）', !!dis('mirror', 'EA', { type: 'M', faucet: 'D4' }));
assert('C×BA = ±0', v('mirror', 'BA', { type: 'C' }) === 0);
assert('M×BA = 不可选（C専用）', !!dis('mirror', 'BA', { type: 'M' }));
assert('M×KIREI_C = +10,000', v('mirror', 'KIREI_C', { type: 'M' }) === 10000);
assert('H×KIREI_C = 不可选（キレイ鏡はB/M/C）', !!dis('mirror', 'KIREI_C', { type: 'H' }));
assert('H×CA = ±0（現行どおり）', v('mirror', 'CA', { type: 'H' }) === 0);

console.log('== P.132 収納（KD=HD、GT=FT、JT/KT=HT、メタルシェルフ H×SS／M S1818、1U/AA 等の適用タイプ）==');
assert('M@1616×KD = −5,200（HD と同額）', v('storage', 'KD', { type: 'M' }, '1616') === -5200);
assert('M@S1818×KD = −20,000', v('storage', 'KD', { type: 'M' }, 'S1818') === -20000);
assert('C@1616×KD = +4,800', v('storage', 'KD', { type: 'C' }, '1616') === 4800);
assert('M@1616×GT = +31,700（FT と同額）', v('storage', 'GT', { type: 'M' }, '1616') === 31700);
assert('C@S1818×GT = +36,900', v('storage', 'GT', { type: 'C' }, 'S1818') === 36900);
assert('M@1616×JT = +1,700（HT と同額）', v('storage', 'JT', { type: 'M' }, '1616') === 1700);
assert('M@S1818×JT = −13,100', v('storage', 'JT', { type: 'M' }, 'S1818') === -13100);
assert('C@1616×KT = +11,700', v('storage', 'KT', { type: 'C' }, '1616') === 11700);
assert('H(D4)×FD = ±0（ボディハグ標準）', v('storage', 'FD', { type: 'H', faucet: 'D4' }) === 0);
assert('H(D4)×HD = −20,000', v('storage', 'HD', { type: 'H', faucet: 'D4' }) === -20000);
assert('H(H3)×FD = 不可选（シャワーシステムは―）', v('storage', 'FD', { type: 'H', faucet: 'H3' }) === null && !!dis('storage', 'FD', { type: 'H', faucet: 'H3' }));
assert('H(H3)×HD = 不可选', !!dis('storage', 'HD', { type: 'H', faucet: 'H3' }));
assert('H(H3)×AA = +60,000（浴槽側メタルシェルフ600W）', v('storage', 'AA', { type: 'H', faucet: 'H3' }) === 60000);
assert('H(D4)×AA = 不可选', !!dis('storage', 'AA', { type: 'H', faucet: 'D4' }));
assert('H(H3)×BA = +70,000', v('storage', 'BA', { type: 'H', faucet: 'H3' }) === 70000);
assert('B×1U = ±0', v('storage', '1U', { type: 'B' }) === 0);
assert('M×1U = 不可选（B専用）', !!dis('storage', '1U', { type: 'M' }));
assert('M@1616×2G = +3,000（M S1818以外）', v('storage', '2G', { type: 'M' }, '1616') === 3000);
assert('M@S1818×2G = −11,800', v('storage', '2G', { type: 'M' }, 'S1818') === -11800);
assert('H(H3)×2G = −11,800（H×シャワーシステム）', v('storage', '2G', { type: 'H', faucet: 'H3' }, '1616') === -11800);
assert('H(D4)×2G = 不可选（ボディハグは―）', !!dis('storage', '2G', { type: 'H', faucet: 'D4' }));
assert('C×2G = 不可选（C列は―）', !!dis('storage', '2G', { type: 'C' }));
assert('M@1616×3T = +32,000', v('storage', '3T', { type: 'M' }, '1616') === 32000);
assert('M@1616×L3 = +41,000', v('storage', 'L3', { type: 'M' }, '1616') === 41000);
assert('M@1616×3Q = +59,000', v('storage', '3Q', { type: 'M' }, '1616') === 59000);
assert('M@S1818×2T = +200', v('storage', '2T', { type: 'M' }, 'S1818') === 200);

console.log('== P.144 給水給湯配管（エ・ニ追加、パン有無で適用コード分離）==');
assert('パンなし×A = ±0', v('water_pipe', 'A', { bathtub_pan: undefined, tub_faucet: 'NN' }) === 0);
assert('パンなし×B = +59,000', v('water_pipe', 'B', { tub_faucet: 'NN' }) === 59000);
assert('パンなし×U = 不可选（浴槽側水栓あり専用）', v('water_pipe', 'U', { tub_faucet: 'NN' }) === null && !!dis('water_pipe', 'U', { tub_faucet: 'NN' }));
assert('パンなし×U×浴槽側水栓あり = ±0', v('water_pipe', 'U', { tub_faucet: 'BP' }) === 0);
assert('パンなし×D = 不可选（パンあり専用）', !!dis('water_pipe', 'D', { tub_faucet: 'NN' }));
assert('パンあり×D = ±0', v('water_pipe', 'D', { bathtub_pan: 'W', tub_faucet: 'NN' }) === 0);
assert('パンあり×E×浴槽側水栓あり = ±0', v('water_pipe', 'E', { bathtub_pan: 'W', tub_faucet: 'BP' }) === 0);
assert('パンあり×E×水栓なし = 不可选', !!dis('water_pipe', 'E', { bathtub_pan: 'W', tub_faucet: 'NN' }));
assert('パンあり×NI×浴槽側水栓あり = +59,000', v('water_pipe', 'NI', { bathtub_pan: 'W', tub_faucet: 'BP' }) === 59000);
assert('パンあり×A = 不可选（A/ウ/B はパンなし用）', !!dis('water_pipe', 'A', { bathtub_pan: 'W', tub_faucet: 'NN' }));

console.log('== P.140 保温材 S20（一般地+3,000／寒冷地±0）==');
assert('一般地×S20 = +3,000', v('misc_options', 'S20', { type: 'M' }) === 3000);
assert('寒冷地×S20 = ±0', v('misc_options', 'S20', { type: 'M', region: 'C' }) === 0);

console.log('== P.126 シャワーヘッド FF/FG（H表に無い＝Hは不可选）==');
assert('M×FF = ±0', v('shower_head', 'FF', { type: 'M', faucet: 'D4' }) === 0);
assert('C×FF = +22,000', v('shower_head', 'FF', { type: 'C', faucet: 'D4' }) === 22000);
assert('H×FF = 不可选', v('shower_head', 'FF', { type: 'H', faucet: 'D4' }) === null && !!dis('shower_head', 'FF', { type: 'H', faucet: 'D4' }));

console.log('== P.127 シャワーフック・スライドバー（B専用モデル／GC・HC の M/C 価格）==');
assert('B×GC（うるつやなし）= ±0', v('shower_hook', 'GC', { type: 'B', urutuya: 'N' }) === 0);
assert('M×GC = −3,000', v('shower_hook', 'GC', { type: 'M', urutuya: 'N' }) === -3000);
assert('C×GC = +25,000', v('shower_hook', 'GC', { type: 'C', urutuya: 'N' }) === 25000);
assert('B×GC（うるつやあり）= 不可选', v('shower_hook', 'GC', { type: 'B', urutuya: 'A' }) === null && !!dis('shower_hook', 'GC', { type: 'B', urutuya: 'A' }));
assert('B×GE（うるつやあり）= ±0', v('shower_hook', 'GE', { type: 'B', urutuya: 'A' }) === 0);
assert('M×GE = 不可选（B専用）', !!dis('shower_hook', 'GE', { type: 'M', urutuya: 'A' }));
assert('M×HC = +3,000', v('shower_hook', 'HC', { type: 'M', urutuya: 'N' }) === 3000);
assert('C×HC = 不可选', !!dis('shower_hook', 'HC', { type: 'C', urutuya: 'N' }));
assert('M×HD = 不可选（B専用）', !!dis('shower_hook', 'HD', { type: 'M', urutuya: 'N' }));
assert('B×HD（うるつやなし）= +1,000', v('shower_hook', 'HD', { type: 'B', urutuya: 'N' }) === 1000);

console.log('== P.128 シャワーホースフック（うるつや×M S1818×兼用水栓）==');
assert('M@1616×HK2 = +3,000', v('hose_hook', 'HK2', { type: 'M', urutuya: 'N', faucet: 'D4' }, '1616') === 3000);
assert('M@1616×HK1 = +1,000', v('hose_hook', 'HK1', { type: 'M', urutuya: 'N', faucet: 'D4' }, '1616') === 1000);
assert('M@1616×HK5 = +3,500', v('hose_hook', 'HK5', { type: 'M', urutuya: 'N', faucet: 'D4' }, '1616') === 3500);
assert('M@1616×HK_N = 不可选（うるつやなし・兼用以外）', v('hose_hook', 'HK_N', { type: 'M', urutuya: 'N', faucet: 'D4' }, '1616') === null && !!dis('hose_hook', 'HK_N', { type: 'M', urutuya: 'N', faucet: 'D4' }, '1616'));
assert('M@S1818×HK2 = ±0', v('hose_hook', 'HK2', { type: 'M', urutuya: 'N', faucet: 'D4' }, 'S1818') === 0);
assert('M@S1818×HK1 = −2,000', v('hose_hook', 'HK1', { type: 'M', urutuya: 'N', faucet: 'D4' }, 'S1818') === -2000);
assert('C@1616×HK1 = −2,000', v('hose_hook', 'HK1', { type: 'C', urutuya: 'N', faucet: 'D4' }) === -2000);
assert('C@1616×HK4 = 不可选（Cは―）', !!dis('hose_hook', 'HK4', { type: 'C', urutuya: 'N', faucet: 'D4' }));
assert('C@1616×HK_N（兼用水栓）= −3,000', v('hose_hook', 'HK_N', { type: 'C', urutuya: 'N', faucet: 'S5' }) === -3000);
assert('C@1616×HK_N（兼用以外）= 不可选', !!dis('hose_hook', 'HK_N', { type: 'C', urutuya: 'N', faucet: 'D4' }));
assert('M×HK_N（兼用水栓）= ±0', v('hose_hook', 'HK_N', { type: 'M', urutuya: 'N', faucet: 'S5' }) === 0);
assert('M×HK1（兼用水栓）= 不可选', !!dis('hose_hook', 'HK1', { type: 'M', urutuya: 'N', faucet: 'S5' }));
assert('B×HK_N（うるつやあり）= ±0', v('hose_hook', 'HK_N', { type: 'B', urutuya: 'A', faucet: 'D4' }) === 0);
assert('B×HK2（うるつやあり）= 不可选', !!dis('hose_hook', 'HK2', { type: 'B', urutuya: 'A', faucet: 'D4' }));

console.log('== P.123 ドア高×壁高（壁高1900では 2000H 不可）==');
assert('壁高1900×KE1(2000H) = 不可选', !!dis('door', 'KE1', { ceiling: 'E9' }));
assert('壁高1900×KE2(1900H) = 可选', !dis('door', 'KE2', { ceiling: 'E9' }) && v('door', 'KE2', { ceiling: 'E9' }) === 0);
assert('壁高1900×J5(1900H) = 可选', !dis('door', 'J5', { ceiling: 'E9' }));
assert('壁高1900×R7(片引き2000H) = 不可选', !!dis('door', 'R7', { ceiling: 'E9' }));
assert('壁高2000×KE1 = 可选', !dis('door', 'KE1', { ceiling: 'E0' }));
assert('壁高未选（既定2200）×KE1 = 可选', !dis('door', 'KE1', {}));

console.log('== 基准报价未漂移（M 1616 標準仕様 + 默认选项）==');
Q.reset();
Q.setSize('1616');
Q.state.sel.type = 'M';
const base = Q.computeQuote();
assert('M 1616 標準仕様价 = 1,379,000', base.basePrice === 1379000, base.basePrice);

console.log(fails === 0 ? '\n✅ 全部通过' : '\n❌ ' + fails + ' 项失败');
process.exit(fails === 0 ? 0 : 1);