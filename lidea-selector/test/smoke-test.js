// smoke-test.js — LIXIL Lidea 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（lidea-data.json 生成）：標準仕様価格矩阵/0.65 人民币/条件键 priceByType/约束/品番 BD/CSV
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const web = path.join(__dirname, '..');
const ctx = { window: {}, console, Blob: function () {} };
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(web, file), 'utf8'), ctx);
}

load('data/products.js');
load('js/price.js');
load('js/quote.js');

const DATA = ctx.window.LIDEA_DATA;
const P = ctx.window.LIDEA.price;
const Q = ctx.window.LIDEA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 31', DATA.categories.length === 31, DATA.categories.length);
assert('size options = 9', Q.cat('size').options.length === 9);
assert('type options = 4（H/B/M/C）', Q.cat('type').options.length === 4);
assert('meta.rmbRate = 0.65', DATA.meta.rmbRate === 0.65, DATA.meta.rmbRate);
assert('总选项 ≥ 457', DATA.categories.reduce((n, c) => n + c.options.length, 0) >= 457);

console.log('== 標準仕様価格矩阵（抽查） ==');
const PRICES = { 'H 1616': 1682000, 'B 1616': 1528000, 'M 1616': 1379000, 'C 1616': 1125000, 'M 1624': 1808000, 'C 1624': 1562000, 'M S1818': 1614000 };
Object.keys(PRICES).forEach(function (key) {
  const parts = key.split(' ');
  assert('標準仕様 ' + key + ' = ' + PRICES[key], DATA.meta.typeBasePrices[parts[0]][parts[1]] === PRICES[key]);
});
assert('1624 H = null（仅 M/C）', DATA.meta.typeBasePrices.H['1624'] === null);

console.log('== 默认配置（1616 + M） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 1,379,000', r.totalEx === 1379000, r.totalEx);
assert('默认 tax = 137,900', r.tax === 137900, r.tax);
assert('默认 totalInc = 1,516,900', r.totalInc === 1516900, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = BDUS-1616M-A+H(C)RL', Q.productNo() === 'BDUS-1616M-A+H(C)RL', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.65（税込×汇率×0.65） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(1,516,900×0.05×0.65) = 49,299', r.rmbAllIn === 49299, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== 寒冷地（region C）标准价 +5,000 ==');
Q.state.sel.region = 'C';
r = Q.computeQuote();
assert('M1616 寒冷地 → 1,384,000', r.totalEx === 1384000, r.totalEx);
Q.reset();

console.log('== タイプ×サイズ 联动 ==');
Q.state.sel.type = 'H';
r = Q.computeQuote();
assert('H 1616 → 1,682,000', r.totalEx === 1682000, r.totalEx);
Q.setSize('1624');
assert('1624 自动修复タイプ → M（H 无 1624 定价）', Q.typeCode() === 'M', Q.typeCode());
r = Q.computeQuote();
assert('M 1624 → 1,808,000', r.totalEx === 1808000, r.totalEx);
assert('1624 时 H タイプ禁用', !!Q.disabledReason('type', 'H'));
Q.setSize('1616');
Q.reset();

console.log('== 条件键 priceByType ==');
// water_pipe：FaucetNone（浴槽側水栓なし）
assert('water_pipe A 无浴槽側水栓 = 0', P.toAmount(Q.opt('water_pipe', 'A').priceByType['FaucetNone']) === 0);
Q.state.sel.water_pipe = 'A';
Q.state.sel.tub_faucet = 'BP';   // 壁付サーモ 浴槽側
assert('浴槽側水栓选择后 water_pipe A = +15,000', Q.contributionFor('water_pipe') === 15000, Q.contributionFor('water_pipe'));
Q.reset();
// shower_head：ThermoMetal（默认 D4）
assert('shower_head EF 默认（ThermoMetal）= 0', Q.contributionFor('shower_head') == null);  // 未选
Q.state.sel.shower_head = 'EF';
assert('EF ThermoMetal = 0', Q.contributionFor('shower_head') === 0, Q.contributionFor('shower_head'));
Q.state.sel.faucet = 'H3';   // シャワーシステム
assert('シャワーシステム时 EF = 7,000', (function () { const v = P.toAmount(Q.opt('shower_head', 'EF').priceByType['ShowerSystem']); return v === 7000; })(), P.toAmount(Q.opt('shower_head', 'EF').priceByType['ShowerSystem']));
Q.reset();
// urutuya A：BM=0 / C=+15,000
assert('urutuya A M = 0', P.toAmount(Q.opt('urutuya', 'A').priceByType['BM']) === 0);
assert('urutuya A C = 15,000', P.toAmount(Q.opt('urutuya', 'A').priceByType['C']) === 15000);
// support_pack：H16/B16/M16 + H13...
assert('support_pack B35 M1616 = 143,000', (function () { Q.state.sel.support_pack = 'B35'; const v = Q.contributionFor('support_pack'); Q.reset(); return v === 143000; })(), Q.contributionFor('support_pack'));
Q.reset();

console.log('== 选项差价（壁パネル/浴槽/照明） ==');
Q.state.sel.wall = 'W0';   // 全面張り プレミアムⅡ +130,000
r = Q.computeQuote();
assert('M1616 + W0(+130,000) → 1,509,000', r.totalEx === 1509000, r.totalEx);
Q.reset();
Q.state.sel.bt_tub = 'T6';  // ミナモ浴槽 パールクォーツ +165,000
r = Q.computeQuote();
assert('M1616 + T6(+165,000) → 1,544,000', r.totalEx === 1544000, r.totalEx);
Q.reset();

console.log('== multi 叠加（追加マグネット/窓額縁） ==');
Q.state.multi.magnet = { A70: true, A96: true };
r = Q.computeQuote();
assert('A70(16,900)+A96(19,000) → 1,414,900', r.totalEx === 1414900, r.totalEx);
Q.reset();

console.log('== 约束 ==');
// サポートパック：C タイプ不可
Q.state.sel.type = 'C';
assert('C タイプ时 support_pack 禁用', !!Q.disabledReason('support_pack', 'B35'));
Q.reset();
// シャワーシステム × まる洗いカウンター
Q.state.sel.faucet = 'H3';
assert('H3 时 counter XU 禁用', !!Q.disabledReason('counter', 'XU'));
Q.reset();
// うるつや A × D5（壁付サーモブラック）
Q.state.sel.urutuya = 'A';
assert('うるつや A 时 faucet D5 禁用', !!Q.disabledReason('faucet', 'D5'));
Q.reset();
// 兼用水栓 S5 × 浴槽側水栓
Q.state.sel.faucet = 'S5';
assert('S5 时 tub_faucet BP 禁用', !!Q.disabledReason('tub_faucet', 'BP'));
Q.reset();
// 洗面室暖房機 K58 需 Q/T
Q.state.sel.fan = 'K58';
assert('K58 未配 Q/T 时禁用', !!Q.disabledReason('fan', 'K58'));
Q.state.sel.fan = 'Q';
assert('配 Q 后 K58 可用', !Q.disabledReason('fan', 'K58'));
Q.reset();
// アクアジェット → パン W 自动
Q.state.multi.aqua_jet = { K14: true };
Q.autoFix('aqua_jet', 'K14');
assert('アクアジェット自动切浴槽パン W', state_sel('bathtub_pan') === 'W', state_sel('bathtub_pan'));
Q.reset();
// アクアジェット4穴 尺寸限定
Q.setSize('1216');
Q.state.multi.aqua_jet = { K20: true };
assert('1216 时 K20 禁用', !!Q.disabledReason('aqua_jet', 'K20'));
Q.reset();

console.log('== 漢数字 ==');
assert('1,516,900 → 壱佰伍拾壱万陸仟玖佰円', Q.kanjiYen(1516900) === '壱佰伍拾壱万陸仟玖佰円', Q.kanjiYen(1516900));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 BDUS', csv.indexOf('BDUS-1616M') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);

function state_sel(dimId) { return Q.state.sel[dimId]; }
