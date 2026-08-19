// smoke-test.js — TOTO Synla 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（synla-data.json 生成）：套装价矩阵/壁柄 type3/多样键 priceByType/S1S2 分档/multi/约束/品番
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

const DATA = ctx.window.SYNLA_DATA;
const P = ctx.window.SYNLA.price;
const Q = ctx.window.SYNLA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 25（24 data + size 重建）', DATA.categories.length === 25, DATA.categories.length);
assert('选项总数 ≥ 690', DATA.categories.reduce((n, c) => n + c.options.length, 0) >= 690);
assert('size options = 7', Q.cat('size').options.length === 7);
assert('size 选项无单一 price/base_price 字段（计价不依赖）', (function () { var s = Q.cat('size').options.find(o => o.code === '1616'); return s.price == null && s.base_price == null; })(), JSON.stringify(Q.cat('size').options.find(o => o.code === '1616')));
assert('1616 G 套装价 = 3,128,000', Q.cat('size').options.find(o => o.code === '1616').pricesByType.G === 3128000);
assert('1317 G = null（仅 D/C）', Q.cat('size').options.find(o => o.code === '1317').pricesByType.G === null);
assert('door 选项 = 98', Q.cat('door').options.length === 98);
assert('window 选项 = 139', Q.cat('window').options.length === 139);
assert('壁柄 3 plan + 99 子项', Q.cat('wall').options.reduce((n, p) => n + (p.subOptions ? p.subOptions.length : 0), 0) === 99, Q.cat('wall').options.reduce((n, p) => n + (p.subOptions ? p.subOptions.length : 0), 0));

console.log('== 默认配置（1616 + G） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 3,128,000', r.totalEx === 3128000, r.totalEx);
assert('默认 tax = 312,800', r.tax === 312800, r.tax);
assert('默认 totalInc = 3,440,800', r.totalInc === 3440800, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = HLV1616UG X3A F', Q.productNo() === 'HLV1616UG X3A F', Q.productNo());

console.log('== タイプ×サイズ矩阵 ==');
// reviewer 预审点：套装价必须走 meta.typeBasePrices[タイプ][サイズ]，不得用 size.price/base_price
assert('basePrice() 随タイプ矩阵取值（D 1616 = 1,758,000）', (function () { Q.state.sel.type = 'D'; var v = Q.basePrice(); Q.reset(); return v === 1758000; })(), Q.basePrice());
Q.state.sel.type = 'D';
r = Q.computeQuote();
assert('1616 D → 1,758,000', r.totalEx === 1758000, r.totalEx);
Q.state.sel.type = 'C';
r = Q.computeQuote();
assert('1616 C → 1,382,000', r.totalEx === 1382000, r.totalEx);
Q.reset();
Q.state.sel.type = 'G';          // 场景：默认 G 选型，切换 1317
Q.setSize('1317');
assert('1317 自动修复タイプ → D（G 无定价）', Q.typeCode() === 'D', Q.typeCode());
r = Q.computeQuote();
assert('1317 D → 1,735,000', r.totalEx === 1735000, r.totalEx);
assert('1317 时 G タイプ禁用', !!Q.disabledReason('type', 'G'));
Q.reset();

console.log('== 壁柄（4面同色，G/BR/DC 三列差价） ==');
Q.state.sel.wall = '4SAME';
Q.state.sub.wall = { mark: 'EQA1D' };   // アジャックスホワイト（プレミアム）
r = Q.computeQuote();
assert('G + プレミアム柄(+31,800) → 3,159,800', r.totalEx === 3159800, r.totalEx);
Q.state.sel.type = 'B';
r = Q.computeQuote();
assert('B + プレミアム柄(+42,400) → 2,831,400', r.totalEx === 2831400, r.totalEx);
Q.state.sel.type = 'D';
r = Q.computeQuote();
assert('D + プレミアム柄(+106,000) → 1,864,000', r.totalEx === 1864000, r.totalEx);
Q.reset();

console.log('== 壁柄（正面アクセント × 周辺グレード） ==');
Q.state.sel.wall = 'FRONT_ACCENT';
Q.state.sub.wall = { mark: 'EQC1D', grade: 'premium' };  // アジャックス + 周辺プレミアム
r = Q.computeQuote();
assert('G アクセント premium → 3,159,800（同プレミアム4面）', r.totalEx === 3159800, r.totalEx);
Q.state.sub.wall = { mark: 'EQC1D', grade: 'hg2' };      // 周辺ハイグレードⅡ → G ±0
r = Q.computeQuote();
assert('G アクセント hg2 → 3,128,000（±0）', r.totalEx === 3128000, r.totalEx);
Q.reset();

console.log('== 多样键 priceByType ==');
assert('G CQF01 = 0', P.priceFor(Q.cat('items').options.find(o => o.code === 'CQF01'), 'G', '1616') === 0);
assert('D CQF01 = 65,000', P.priceFor(Q.cat('items').options.find(o => o.code === 'CQF01'), 'D', '1616') === 65000);
assert('B HDPLP = 88,800', P.priceFor(Q.cat('door').options.find(o => o.code === 'HDPLP'), 'B', '1616') === 88800);
assert('G FBH01 = 0', P.priceFor(Q.cat('bathtub').options.find(o => o.code === 'FBH01'), 'G', '1616') === 0);
assert('C FBH01 = 211,000', P.priceFor(Q.cat('bathtub').options.find(o => o.code === 'FBH01'), 'C', '1616') === 211000);
assert('G ESH71 = 25,000', P.priceFor(Q.cat('storage').options.find(o => o.code === 'ESH71'), 'G', '1616') === 25000);
assert('D ESH71 = 0', P.priceFor(Q.cat('storage').options.find(o => o.code === 'ESH71'), 'D', '1616') === 0);

console.log('== pricesBySize 尺寸分档（S1/S2 展开） ==');
assert('IKJN8 S1(1624) = -10,500', P.priceFor(Q.cat('fan').options.find(o => o.code === 'IKJN8'), 'G', '1624') === -10500);
assert('IKJN8 S2(1616) = 0', P.priceFor(Q.cat('fan').options.find(o => o.code === 'IKJN8'), 'G', '1616') === 0);
assert('三乾王 IKJNA 1616 = 85,200', P.priceFor(Q.cat('fan').options.find(o => o.code === 'IKJNA'), 'G', '1616') === 85200);
assert('三乾王 IKJNA 1624 = 74,700', P.priceFor(Q.cat('fan').options.find(o => o.code === 'IKJNA'), 'G', '1624') === 74700);

console.log('== multi 叠加（单品） ==');
Q.state.multi.opt_parts = { KDA02: true, ZPUBK181W1: true };
r = Q.computeQuote();
assert('タオル棚(7,100)+ボトルラック(9,100) → 3,144,200', r.totalEx === 3144200, r.totalEx);
assert('明细含 2 项', r.lines.some(l => (l.nameZh || '').indexOf('毛巾架') >= 0) && r.lines.some(l => (l.nameZh || '').indexOf('瓶架') >= 0));
Q.reset();

console.log('== 约束 ==');
Q.state.sel.rakuyu = 'FBA00';
Q.autoFix('rakuyu', 'FBA00');
assert('楽湯なし自动切照明 KSD3F', Q.state.sel.light === 'KSD3F', Q.state.sel.light);
assert('楽湯なし时 LIGHT_BASIC 禁用', !!Q.disabledReason('light', 'LIGHT_BASIC'));
Q.reset();
Q.state.sel.kudai = 'S';
Q.autoFix('kudai', 'CGA06');
assert('吊架台自动切架台 F', Q.state.sel.kudai === 'F', Q.state.sel.kudai);
Q.reset();
Q.state.sel.type = 'D';
Q.state.sel.counter = 'TKAJW';
assert('カウンターなし时 item_wiper CQF01 禁用', !!Q.disabledReason('item_wiper', 'CQF01'));
assert('カウンターなし仅 D/C（G 时禁用）', (function () { Q.state.sel.type = 'G'; return !!Q.disabledReason('counter', 'TKAJW'); })());
Q.reset();
Q.state.sel.mirror = 'KUWA1';
assert('ワイドミラー时 storage ESH71 禁用', !!Q.disabledReason('storage', 'ESH71'));
assert('ワイドミラー时 storage ESA00 可用', !Q.disabledReason('storage', 'ESA00'));
Q.reset();
Q.state.sel.faucet = 'SEBE2';
assert('寒冷地水栓时 YMA01 禁用', !!Q.disabledReason('welfare', 'YMA01'));
Q.reset();
Q.state.sel.type = 'G';
assert('G 时 ISH32（目地付き）禁用', !!Q.disabledReason('ceiling', 'ISH32'));
assert('G 时 ISA42（目地なし H2000）可用', !Q.disabledReason('ceiling', 'ISA42'));
Q.state.sel.type = 'D';
assert('D 时 ISH32 可用', !Q.disabledReason('ceiling', 'ISH32'));
assert('D 时 ISA42 禁用', !!Q.disabledReason('ceiling', 'ISA42'));
Q.reset();

console.log('== オーバーヘッド × 浴室オーディオ ==');
Q.state.sel.oh_shower = 'SHA5S';
assert('SHA5S 时 FOJ01 禁用', !!Q.disabledReason('tv_audio', 'FOJ01'));
Q.reset();

console.log('== 漢数字 ==');
assert('3,440,800 → 参佰肆拾肆万捌佰円', Q.kanjiYen(3440800) === '参佰肆拾肆万捌佰円', Q.kanjiYen(3440800));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番', csv.indexOf('HLV1616UG X3A F') >= 0);

console.log('== 汇率 / 人民币 ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(3,440,800×0.05×0.7) = 120,428', r.rmbAllIn === 120428, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
