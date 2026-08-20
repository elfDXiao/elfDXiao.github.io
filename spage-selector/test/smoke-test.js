// smoke-test.js — LIXIL SPAGE 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（spage-data.json 生成）：標準仕様価格矩阵（タイプ×サイズ×設置）/0.75 人民币/条件键/约束/品番 BAU/CSV
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

const DATA = ctx.window.SPAGE_DATA;
const P = ctx.window.SPAGE.price;
const Q = ctx.window.SPAGE.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 33', DATA.categories.length === 33, DATA.categories.length);
assert('size options = 11', Q.cat('size').options.length === 11);
assert('type options = 5（P/C/S/V/A）', Q.cat('type').options.length === 5);
assert('install options = 2（U/M）', Q.cat('install').options.length === 2);
assert('meta.rmbRate = 0.75', DATA.meta.rmbRate === 0.75, DATA.meta.rmbRate);

console.log('== 標準仕様価格矩阵（タイプ×サイズ×設置） ==');
const PRICES = { 'P 1620 U': 3377000, 'P 1620 M': 3447000, 'C 1616 U': 2737000, 'S 1616 U': 2313000, 'V 1616 U': 1907000, 'A 1620 U': 1606000, 'P 1624 U': 3587000, 'P 1622 M': 3547000 };
Object.keys(PRICES).forEach(function (key) {
  const p = key.split(' ');
  assert('標準仕様 ' + key + ' = ' + PRICES[key], DATA.meta.typeBasePrices[p[0]][p[1]][p[2]] === PRICES[key]);
});
assert('P 1624 M = null（仅戸建）', DATA.meta.typeBasePrices.P['1624'].M == null);
assert('P 1622 U = null（仅マンション）', DATA.meta.typeBasePrices.P['1622'].U == null);

console.log('== 默认配置（1620 + P + 戸建 U） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 3,377,000', r.totalEx === 3377000, r.totalEx);
assert('默认 tax = 337,700', r.tax === 337700, r.tax);
assert('默认 totalInc = 3,714,700', r.totalInc === 3714700, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = BAUW-1620P-C+H(C)RL', Q.productNo() === 'BAUW-1620P-C+H(C)RL', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.75（税込×汇率×0.75） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(3,714,700×0.05×0.75) = 139,301', r.rmbAllIn === 139301, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== ★ install 维度（U/M）双取价 ==');
Q.state.sel.install = 'M';
r = Q.computeQuote();
assert('P1620 マンション → 3,447,000', r.totalEx === 3447000, r.totalEx);
assert('品番 BAMW-1620P-C+H(C)RL', Q.productNo() === 'BAMW-1620P-C+H(C)RL', Q.productNo());
Q.setSize('1622');
assert('1622 自动修复 install → M（U 无 1622 定价）', Q.installCode() === 'M', Q.installCode());
r = Q.computeQuote();
assert('P1622 マンション → 3,547,000', r.totalEx === 3547000, r.totalEx);
assert('1622 时 U 禁用', !!Q.disabledReason('install', 'U'));
Q.setSize('1620');
Q.reset();

console.log('== 寒冷地（region C）标准价 +5,000 ==');
Q.state.sel.region = 'C';
r = Q.computeQuote();
assert('P1620U 寒冷地 → 3,382,000', r.totalEx === 3382000, r.totalEx);
Q.reset();

console.log('== 条件键 aqua_feil（A/U・A/M） ==');
assert('aqua_feil K53 P = 0', P.toAmount(Q.opt('aqua_feil', 'K53').priceByType['P']) === 0);
assert('aqua_feil K53 A/U = 229,000', P.toAmount(Q.opt('aqua_feil', 'K53').priceByType['A/U']) === 229000);
assert('aqua_feil K53 A/M = 259,000', P.toAmount(Q.opt('aqua_feil', 'K53').priceByType['A/M']) === 259000);
Q.state.sel.type = 'A';
Q.state.sel.aqua_feil = 'K53';
assert('A タイプ戸建 K53 = +229,000', Q.contributionFor('aqua_feil') === 229000, Q.contributionFor('aqua_feil'));
Q.state.sel.install = 'M';
assert('A タイプマンション K53 = +259,000', Q.contributionFor('aqua_feil') === 259000, Q.contributionFor('aqua_feil'));
Q.reset();

console.log('== 选项差价（壁パネル/床） ==');
Q.state.sel.wall = 'PALL';   // アーテクトP 全面張り（价格见数据）
const wallV = Q.contributionFor('wall');
assert('wall PALL 差价已解析（非 null）', wallV != null, wallV);
Q.reset();
Q.state.sel.floor = 'EA';    // グランフロア ライトストーン +240,000（P C S V）
r = Q.computeQuote();
assert('P1620U + グランフロア(+240,000) → 3,617,000', r.totalEx === 3617000, r.totalEx);
Q.reset();

console.log('== multi 叠加 ==');
Q.state.multi.bathroom_tv = { K56: true };
r = Q.computeQuote();
assert('浴室テレビ(+334,000) → 3,711,000', r.totalEx === 3711000, r.totalEx);
Q.reset();

console.log('== 约束 ==');
// P タイプダウンライト不可
Q.state.sel.type = 'P';
assert('P タイプ时 GP 禁用', !!Q.disabledReason('lighting', 'GP'));
Q.reset();
// セラミックパネル × マグネット
Q.state.sel.wall = 'CH';
assert('セラミックパネル时 magnet A70 禁用', !!Q.disabledReason('magnet', 'A70'));
Q.reset();
// アクアフィール → パン W 自动
Q.state.sel.aqua_feil = 'K53';
Q.autoFix('aqua_feil', 'K53');
assert('アクアフィール自动切浴槽パン W', Q.state.sel.bathtub_pan === 'W', Q.state.sel.bathtub_pan);
Q.reset();
// サポートパック P/S 不可
Q.state.sel.type = 'P';
assert('P タイプ时 support_pack 禁用', !!Q.disabledReason('support_pack', 'B35'));
Q.reset();
// グランフロア 1216 不可
Q.setSize('1216');
Q.state.sel.type = 'C';
assert('1216 时グランフロア EA 禁用', !!Q.disabledReason('floor', 'EA'));
Q.reset();

console.log('== 漢数字 ==');
assert('3,714,700 → 参佰柒拾壱万肆仟柒佰円', Q.kanjiYen(3714700) === '参佰柒拾壱万肆仟柒佰円', Q.kanjiYen(3714700));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 BAUW-1620P', csv.indexOf('BAUW-1620P') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
