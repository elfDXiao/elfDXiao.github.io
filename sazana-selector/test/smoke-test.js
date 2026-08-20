// smoke-test.js — TOTO Sazana 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（sazana-data.json 生成）：本体価格矩阵/0.7 人民币/priceByType 多样键/约束/品番 HTV/CSV
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

const DATA = ctx.window.SAZANA_DATA;
const P = ctx.window.SAZANA.price;
const Q = ctx.window.SAZANA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 27', DATA.categories.length === 27, DATA.categories.length);
assert('size options = 10', Q.cat('size').options.length === 10);
assert('type options = 5（P/T/S/N/F）', Q.cat('type').options.length === 5);
assert('meta.rmbRate = 0.7', DATA.meta.rmbRate === 0.7, DATA.meta.rmbRate);

console.log('== 本体価格矩阵（抽查） ==');
const PRICES = { 'T 1620': 1449000, 'P 1620': 1636000, 'S 1616': 1126000, 'N 1616': 904000, 'F 1620': 1832000, 'P 1624': 1905000, 'T 1618': 1322000 };
Object.keys(PRICES).forEach(function (key) {
  const p = key.split(' ');
  assert('本体価格 ' + key + ' = ' + PRICES[key], DATA.meta.typeBasePrices[p[0]][p[1]] === PRICES[key]);
});
assert('F 1624 = null（仅 1620/1616/1618）', DATA.meta.typeBasePrices.F['1624'] == null);
assert('N 1220 = null（N タイプ无 1220）', DATA.meta.typeBasePrices.N['1220'] == null);

console.log('== 默认配置（1620 + T） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 1,449,000', r.totalEx === 1449000, r.totalEx);
assert('默认 tax = 144,900', r.tax === 144900, r.tax);
assert('默认 totalInc = 1,593,900', r.totalInc === 1593900, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = HTV1620UTX6AF', Q.productNo() === 'HTV1620UTX6AF', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.7（税込×汇率×0.7） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(1,593,900×0.05×0.7) = 55,787', r.rmbAllIn === 55787, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== タイプ×サイズ 联动 ==');
Q.state.sel.type = 'P';
r = Q.computeQuote();
assert('P 1620 → 1,636,000', r.totalEx === 1636000, r.totalEx);
Q.setSize('1624');
r = Q.computeQuote();
assert('P 1624 → 1,905,000', r.totalEx === 1905000, r.totalEx);
assert('1624 时 F タイプ禁用', !!Q.disabledReason('type', 'F'));
Q.reset();
Q.setSize('1220');
assert('1220 自动修复タイプ → T（N 无 1220 定价）', (function () { Q.state.sel.type = 'N'; Q.setSize('1220'); return Q.typeCode() !== 'N'; })());
Q.reset();

console.log('== priceByType 多样键 ==');
assert('壁柄 EGAA1 P = 105,000', P.priceFor(Q.cat('wall').options.find(o => o.code === 'EGAA1'), 'P', '1620') === 105000);
assert('シャワーヘッド SRW11 N = 7,300', P.priceFor(Q.cat('shower_head').options.find(o => o.code === 'SRW11'), 'N', '1620') === 7300);
assert('ミラー KURA2 S = null（不可）', P.priceFor(Q.cat('mirror').options.find(o => o.code === 'KURA2'), 'S', '1620') == null);
assert('スライドバー SBRER F = null', P.priceFor(Q.cat('slide_bar').options.find(o => o.code === 'SBRER'), 'F', '1620') == null);

console.log('== 选项差价（壁柄/浴槽） ==');
Q.state.sel.wall = 'EGAA1';
r = Q.computeQuote();
assert('T1620 + EGAA1(+126,000) → 1,575,000', r.totalEx === 1575000, r.totalEx);
Q.reset();
Q.state.multi.clean_other = { YFS32: true };
Q.autoFix('clean_other', 'YFS32');
assert('おそうじ浴槽自动切断熱防水パン CXX01', Q.state.sel.kudai === 'CXX01', Q.state.sel.kudai);
r = Q.computeQuote();
assert('おそうじ浴槽(+189,700)+CXX01 计入', r.totalEx === 1449000 + 189700 + Q.contributionFor('kudai'), r.totalEx);
Q.reset();

console.log('== multi 叠加 ==');
Q.state.multi.misc_options = { K56: true };
Q.reset();

console.log('== 约束 ==');
// 勾配天井 × ダウンライト
Q.state.sel.ceiling = 'ISJ64';
assert('勾配天井时 KSDQ4 禁用', !!Q.disabledReason('lighting', 'KSDQ4'));
Q.reset();
// 浴室クリアキープ需三乾王/暖房換気扇
Q.state.sel.clear = 'CQH01';
assert('CQH01 时 IKA00 禁用', !!Q.disabledReason('fan', 'IKA00'));
Q.reset();
// カラリ床 × 床ワイパー
Q.state.sel.floor = 'CFF01';
assert('カラリ床时 wiper CQF01 禁用', !!Q.disabledReason('wiper', 'CQF01'));
Q.reset();
// おそうじ浴槽 × 寒冷地水栓
Q.state.multi.clean_other = { YFS32: true };
assert('おそうじ浴槽时 SEA5K 禁用', !!Q.disabledReason('faucet', 'SEA5K'));
Q.reset();
// エアインオーバーヘッド 尺寸限定
Q.setSize('1317');
assert('1317 时 SHA2S 禁用', !!Q.disabledReason('oh_shower', 'SHA2S'));
Q.reset();

console.log('== 漢数字 ==');
assert('1,593,900 → 壱佰伍拾玖万参仟玖佰円', Q.kanjiYen(1593900) === '壱佰伍拾玖万参仟玖佰円', Q.kanjiYen(1593900));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 HTV1620UT', csv.indexOf('HTV1620UT') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
