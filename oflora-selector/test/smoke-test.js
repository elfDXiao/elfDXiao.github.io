// smoke-test.js — Panasonic オフローラ（Oflora）报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（oflora-data.json 生成）：プラン×サイズ 4×6 矩阵/0.65 人民币/35 字段选型/约束/品番 BGF/CSV
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

const DATA = ctx.window.OFLORA_DATA;
const P = ctx.window.OFLORA.price;
const Q = ctx.window.OFLORA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 42', DATA.categories.length === 42, DATA.categories.length);
assert('size options = 6', Q.cat('size').options.length === 6);
assert('plan options = 4（BASE/SUGOPIKA_CLEAN/MODERN_STYLE/MINIMUM_SELECT）', Q.cat('plan').options.length === 4);
assert('meta.rmbRate = 0.65', DATA.meta.rmbRate === 0.65, DATA.meta.rmbRate);
assert('写真セット 2（photo_set）', Q.cat('photo_set').options.length === 2);
assert('总选项 = 355', DATA.categories.reduce((n, c) => n + c.options.length, 0) === 355, DATA.categories.reduce((n, c) => n + c.options.length, 0));

console.log('== プラン×サイズ矩阵（4×6 抽查） ==');
const PRICES = {
  'BASE': { '1621': 1558700, '1818': 1650550, '1616': 1273250, '1216': 1164350 },
  'SUGOPIKA_CLEAN': { '1616': 1359600, '1818': 1736900 },
  'MODERN_STYLE': { '1616': 1458600, '1818': 1835900, '1316': 1403050 },
  'MINIMUM_SELECT': { '1616': 1070850, '1818': 1448150, '1621': 1356300 }
};
let matrixOK = true;
Object.keys(PRICES).forEach(function (p) {
  Object.keys(PRICES[p]).forEach(function (s) {
    if (DATA.meta.planPrices[p][s] !== PRICES[p][s]) matrixOK = false;
  });
});
assert('プラン×サイズ 抽查全一致', matrixOK);

console.log('== 默认配置（1616 + BASE） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 1,273,250', r.totalEx === 1273250, r.totalEx);
assert('默认 tax = 127,325', r.tax === 127325, r.tax);
assert('默认 totalInc = 1,400,575', r.totalInc === 1400575, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = BGF51', Q.productNo() === 'BGF51', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.65（税込×汇率×0.65） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(1,400,575×0.05×0.65) = 45,519', r.rmbAllIn === 45519, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== プラン×サイズ 联动与品番 ==');
Q.state.sel.plan = 'MODERN_STYLE';
r = Q.computeQuote();
assert('MODERN 1616 → 1,458,600', r.totalEx === 1458600, r.totalEx);
assert('MODERN 品番 = BGF53', Q.productNo() === 'BGF53', Q.productNo());
Q.reset();
Q.state.sel.plan = 'MINIMUM_SELECT';
Q.setSize('1216');
r = Q.computeQuote();
assert('MINIMUM 1216 → 961,950', r.totalEx === 961950, r.totalEx);
assert('MINIMUM 品番 = BGF74', Q.productNo() === 'BGF74', Q.productNo());
Q.reset();
Q.state.sel.plan = 'SUGOPIKA_CLEAN';
Q.setSize('1818');
assert('SUGOPIKA 1818 品番 = BGF32', Q.productNo() === 'BGF32', Q.productNo());
Q.reset();

console.log('== 选项差价（床/浴槽/設置） ==');
Q.state.sel.floor = 'B2';
r = Q.computeQuote();
assert('BASE1616 + 床B2(+12,100) → 1,285,350', r.totalEx === 1285350, r.totalEx);
Q.reset();
Q.state.sel.bathtub_material = 'C1';
r = Q.computeQuote();
assert('BASE1616 + アクアマーブル(-55,000) → 1,218,250', r.totalEx === 1218250, r.totalEx);
Q.reset();
Q.state.sel.bathtub_function = 'A2';
r = Q.computeQuote();
assert('BASE1616 + 酸素美泡湯(+220,000) → 1,493,250', r.totalEx === 1493250, r.totalEx);
Q.reset();
Q.state.sel.install = 'SBFL4';
r = Q.computeQuote();
assert('BASE1616 + 架台設置(+51,700) → 1,324,950', r.totalEx === 1324950, r.totalEx);
Q.reset();
Q.state.sel.floor_heating = '2';
r = Q.computeQuote();
assert('BASE1616 + 床暖房(+73,150) → 1,346,400', r.totalEx === 1346400, r.totalEx);
Q.reset();

console.log('== multi 叠加（オプション） ==');
Q.state.multi.grip_bar = { I400: true, I600: true };
r = Q.computeQuote();
assert('握りバー I400(+20,350)+I600(+24,200) → 1,317,800', r.totalEx === 1317800, r.totalEx);
Q.reset();

console.log('== 写真セット（参考项不计价） ==');
Q.state.sel.photo_set = 'BGF5710';
r = Q.computeQuote();
assert('选 BGF5710 后 totalEx 不变（参考不计价）', r.totalEx === 1273250, r.totalEx);
Q.reset();

console.log('== 约束 ==');
// 浴槽形状×尺寸
Q.setSize('1616');
assert('1616 时 bathtub_shape B1 禁用', !!Q.disabledReason('bathtub_shape', 'B1'));
assert('1616 时 bathtub_shape B2 可用', !Q.disabledReason('bathtub_shape', 'B2'));
Q.setSize('1621');
assert('1621 时 bathtub_shape B1 可用', !Q.disabledReason('bathtub_shape', 'B1'));
Q.reset();
// 材质×形状/尺寸
Q.setSize('1616');
Q.state.sel.bathtub_shape = 'B4';
assert('リクライン时 bathtub_material C1 禁用', !!Q.disabledReason('bathtub_material', 'C1'));
Q.reset();
Q.setSize('1316');
assert('1316 时 bathtub_material C1 禁用', !!Q.disabledReason('bathtub_material', 'C1'));
assert('1316 时 bathtub_shape B3 禁用', !!Q.disabledReason('bathtub_shape', 'B3'));
Q.reset();
// カビシャット 1316/1216 不可
Q.setSize('1316');
assert('1316 时 fan GA 禁用', !!Q.disabledReason('fan', 'GA'));
Q.reset();
Q.setSize('1616');
assert('1616 时 fan GA 可用', !Q.disabledReason('fan', 'GA'));
Q.reset();
// ハンドル 1316/1216 なしのみ
Q.setSize('1216');
assert('1216 时 bathtub_handle 3 禁用', !!Q.disabledReason('bathtub_handle', '3'));
Q.reset();
// カウンター 1818 不可（バイザー）
Q.setSize('1818');
assert('1818 时 counter 1 禁用', !!Q.disabledReason('counter', '1'));
Q.reset();
// 照明 1621/1818 不可（サークルLED）
Q.setSize('1621');
assert('1621 时 lighting A1 禁用', !!Q.disabledReason('lighting', 'A1'));
Q.reset();
// 兼用デッキ水栓 × 浴槽側水栓
Q.state.sel.faucet = 'E3';
assert('E3 时 bathtub_faucet 4 禁用', !!Q.disabledReason('bathtub_faucet', '4'));
Q.reset();
// エプロン × ウェーブカウンター
Q.state.sel.counter = 'P';
assert('ウェーブカウンター时 bathtub_apron A1 禁用', !!Q.disabledReason('bathtub_apron', 'A1'));
Q.reset();
// 保温なし × 高断熱仕様
Q.state.sel.bathtub_function = 'B1';
assert('保温なし时 insulation 2 禁用', !!Q.disabledReason('insulation', '2'));
Q.reset();
// 全幅開口窓枠 1818 不可
Q.setSize('1818');
assert('1818 时全幅開口窓枠禁用', (function () {
  const wf = Q.cat('window_frame').options.find(function (o) { return /全幅開口/.test(o.name_ja || ''); });
  return wf ? !!Q.disabledReason('window_frame', wf.code) : false;
})());
Q.reset();

console.log('== 全流程（BASE1616 完整选配） ==');
Q.state.sel.plan = 'BASE';
Q.state.sel.door_hand = 'AR';
Q.state.sel.install = 'SBFL1';
Q.state.sel.bathtub_pan = '1';
Q.state.sel.floor = 'C1';
Q.state.sel.floor_heating = '1';
Q.state.sel.bathtub_shape = 'B2';
Q.state.sel.bathtub_material = 'A1';
Q.state.sel.bathtub_function = 'A1';
Q.state.sel.bathtub_handle = '1';
Q.state.sel.bath_lid = 'D2';
Q.state.sel.bath_lid_hook = 'K';
Q.state.sel.bathtub_apron = 'B1';
Q.state.sel.wall_accent = 'B';
Q.state.sel.wall_pattern = 'B1';
Q.state.sel.ceiling_height = '2';
Q.state.sel.ceiling = '1';
Q.state.sel.fan = 'F9';
Q.state.sel.clothes_bar = '0';
Q.state.sel.ceiling_opening = 'FA';
Q.state.sel.door = 'F1';
Q.state.sel.counter = 'N';
Q.state.sel.faucet = 'P1';
Q.state.sel.shower_head = '1';
Q.state.sel.bathtub_faucet = 'N';
Q.state.sel.lighting = 'U2';
Q.state.sel.mirror = 'MN';
Q.state.sel.storage = 'N';
Q.state.sel.storage_table = 'N';
Q.state.sel.shower_hook = '2';
Q.state.sel.towel = 'N';
Q.state.sel.back_piping = '1';
Q.state.sel.insulation = 'N';
Q.state.sel.insulation_wall = 'N';
Q.state.sel.window_frame = 'N';
r = Q.computeQuote();
assert('全流程 totalEx = 1,273,250（全默认）', r.totalEx === 1273250, r.totalEx);
assert('全流程无 unknown', r.unknown.length === 0, r.unknown);
Q.reset();

console.log('== 无「无该型号」渲染保障 ==');
let altOK = true;
Object.keys(PRICES).forEach(function (p) {
  Q.state.sel.plan = p;
  ['1621', '1818', '1618', '1616', '1316', '1216'].forEach(function (s) {
    const alt = Q.sizeAltPrice(s);
    if (!alt || typeof alt.price !== 'number') altOK = false;
  });
});
assert('24 组合下 sizeAltPrice 全部可用（无「无该型号」）', altOK);
Q.reset();

console.log('== 漢数字 ==');
assert('1,400,575 → 壱佰肆拾万伍佰柒拾伍円', Q.kanjiYen(1400575) === '壱佰肆拾万伍佰柒拾伍円', Q.kanjiYen(1400575));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
Q.state.sel.plan = 'BASE';
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 BGF51', csv.indexOf('BGF51') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
