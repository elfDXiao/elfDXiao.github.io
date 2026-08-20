// smoke-test.js — TOTO シャワールーム 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（shower-data.json 生成）：套装价 7 组合/0.8 人民币计价/priceByType 多样键/约束/品番 JSV/CSV
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

const DATA = ctx.window.SHOWER_DATA;
const P = ctx.window.SHOWER.price;
const Q = ctx.window.SHOWER.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 17', DATA.categories.length === 17, DATA.categories.length);
assert('size options = 3', Q.cat('size').options.length === 3);
assert('type options = 4', Q.cat('type').options.length === 4);
assert('meta.rmbRate = 0.8', DATA.meta.rmbRate === 0.8, DATA.meta.rmbRate);
assert('品番模板 JSV{size}U{type}W6', (DATA.meta.productNo || '').indexOf('JSV') === 0, DATA.meta.productNo);

console.log('== 套装价 7 组合（typeBasePrices 矩阵） ==');
const COMBOS = { 'G 0816': 1132000, 'X 0816': 906000, 'X 0812': 815000, 'T 0812': 618000, 'T 0808': 527000, 'L 0812': 465000, 'L 0808': 374000 };
Object.keys(COMBOS).forEach(function (key) {
  const parts = key.split(' ');
  const t = parts[0], s = parts[1];
  assert('套装价 ' + key + ' = ' + COMBOS[key], DATA.meta.typeBasePrices[t][s] === COMBOS[key]);
});

console.log('== 默认配置（0816 + G） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 1,132,000', r.totalEx === 1132000, r.totalEx);
assert('默认 tax = 113,200', r.tax === 113200, r.tax);
assert('默认 totalInc = 1,245,200', r.totalInc === 1245200, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = JSV0816UGW6', Q.productNo() === 'JSV0816UGW6', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.8（税込×汇率×0.8） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(1,245,200×0.05×0.8) = 49,808', r.rmbAllIn === 49808, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== タイプ×サイズ 联动 ==');
Q.state.sel.type = 'X';
Q.state.size = '0812';
r = Q.computeQuote();
assert('X 0812 → 815,000', r.totalEx === 815000, r.totalEx);
assert('品番 JSV0812UXW6', Q.productNo() === 'JSV0812UXW6', Q.productNo());
Q.setSize('0808');
assert('0808 自动修复タイプ → T（X 无 0808 定价）', Q.typeCode() === 'T', Q.typeCode());
r = Q.computeQuote();
assert('T 0808 → 527,000', r.totalEx === 527000, r.totalEx);
assert('0816 时 T タイプ禁用', (function () { Q.setSize('0816'); return !!Q.disabledReason('type', 'T'); })());
Q.reset();

console.log('== priceByType 多样键（GXT|L / GX|TL / 4列） ==');
assert('壁柄 EVAQ7 G = 32,100', P.priceFor(Q.cat('wall').options.find(o => o.code === 'EVAQ7'), 'G', '0816') === 32100);
assert('壁柄 EVAQ7 L = 96,300', P.priceFor(Q.cat('wall').options.find(o => o.code === 'EVAQ7'), 'L', '0812') === 96300);
assert('シャワー SRW01 G = 0（GX 基本）', P.priceFor(Q.cat('shower_head').options.find(o => o.code === 'SRW01'), 'G', '0816') === 0);
assert('シャワー SRW01 L = 19,900', P.priceFor(Q.cat('shower_head').options.find(o => o.code === 'SRW01'), 'L', '0812') === 19900);
assert('収納 ESH4H G = 0 / X = 2,600 / L = null', P.priceFor(Q.cat('storage').options.find(o => o.code === 'ESH4H'), 'G', '0816') === 0 && P.priceFor(Q.cat('storage').options.find(o => o.code === 'ESH4H'), 'X', '0816') === 2600 && P.priceFor(Q.cat('storage').options.find(o => o.code === 'ESH4H'), 'L', '0812') === null);
assert('照明 KSDQ1 GXT = 0 / L = 8,000', P.priceFor(Q.cat('lighting').options.find(o => o.code === 'KSDQ1'), 'G', '0816') === 0 && P.priceFor(Q.cat('lighting').options.find(o => o.code === 'KSDQ1'), 'L', '0812') === 8000);
assert('スライドバー SBA31 GX = 0 / L = 10,200', P.priceFor(Q.cat('slide_bar').options.find(o => o.code === 'SBA31'), 'G', '0816') === 0 && P.priceFor(Q.cat('slide_bar').options.find(o => o.code === 'SBA31'), 'L', '0812') === 10200);
assert('タオル KTA21 GX = 3,150 / TL = null', P.priceFor(Q.cat('towel').options.find(o => o.code === 'KTA21'), 'G', '0816') === 3150 && P.priceFor(Q.cat('towel').options.find(o => o.code === 'KTA21'), 'L', '0812') === null);

console.log('== 约束 ==');
// 0812 X 四角鏡不可
Q.state.sel.type = 'X'; Q.state.size = '0812';
assert('0812 X 时 KURS1 禁用', !!Q.disabledReason('mirror', 'KURS1'));
Q.reset();
// 0808 換気扇 IKJC5/IKA00 不可
Q.state.size = '0808';
assert('0808 时 IKJC5 禁用', !!Q.disabledReason('fan', 'IKJC5'));
assert('0808 时 IKA00 禁用', !!Q.disabledReason('fan', 'IKA00'));
Q.reset();
// SSA00 → シャワーヘッド不可
Q.state.sel.faucet = 'SSA00';
assert('SSA00 时 SRW01 禁用', !!Q.disabledReason('shower_head', 'SRW01'));
Q.reset();
// HDR3F × 縦長鏡 × KTA21（0816 G X）
Q.state.sel.door = 'HDR3F';
assert('HDR3F 时 KURF3 禁用', !!Q.disabledReason('mirror', 'KURF3'));
assert('HDR3F 时 KTA21 禁用', !!Q.disabledReason('towel', 'KTA21'));
Q.state.sel.mirror = 'KUMF3';
assert('縦長鏡时 HDR3F 禁用', !!Q.disabledReason('door', 'HDR3F'));
Q.reset();
// 収納 × 鏡 互斥
Q.state.sel.storage = 'ESH4H';
assert('ESH4H 时 KURS1 禁用', !!Q.disabledReason('mirror', 'KURS1'));
Q.state.sel.mirror = 'KURS1';
assert('四角鏡时 ESH4H 禁用', !!Q.disabledReason('storage', 'ESH4H'));
Q.reset();
// DHS11 × SSGFK
Q.state.sel.elbow = 'DHS11';
assert('DHS11 时 SSGFK 禁用', !!Q.disabledReason('faucet', 'SSGFK'));
Q.reset();
// KSTM1 0812 X 不可；IKA05 × KSTM1
Q.state.sel.type = 'X'; Q.state.size = '0812';
assert('0812 X 时 KSTM1 禁用', !!Q.disabledReason('lighting', 'KSTM1'));
Q.reset();
Q.state.sel.lighting = 'KSTM1';
Q.state.sel.fan = 'IKA05';
assert('KSTM1 × IKA05 互斥（fan 侧）', !!Q.disabledReason('fan', 'IKA05'));
Q.reset();
// HDP3F 仅 0816 X
assert('G 0816 时 HDP3F 禁用', !!Q.disabledReason('door', 'HDP3F'));
Q.state.sel.type = 'X';
assert('X 0816 时 HDP3F 可用', !Q.disabledReason('door', 'HDP3F'));
Q.reset();
// HDR3F ドア位置 A 限定
Q.state.sel.door = 'HDR3F'; Q.state.doorPos = 'B';
assert('HDR3F ドア位置 B 禁用', !!Q.disabledReason('door', 'HDR3F'));
Q.state.doorPos = 'A';
assert('HDR3F ドア位置 A 可用', !Q.disabledReason('door', 'HDR3F'));
Q.reset();

console.log('== 选项差价计入（壁柄 GXT +32,100） ==');
Q.state.sel.wall = 'EVAQ7';
r = Q.computeQuote();
assert('G0816 + 壁柄 EVAQ7(+32,100) → 1,164,100', r.totalEx === 1164100, r.totalEx);
Q.reset();

console.log('== multi 叠加（付加オプション） ==');
Q.state.multi.options = { KCA11: true, ACA01: true };
r = Q.computeQuote();
assert('非常コール(10,500)+保温カバー(1,650) → 1,144,150', r.totalEx === 1144150, r.totalEx);
Q.reset();

console.log('== 漢数字 ==');
assert('1,245,200 → 壱佰弐拾肆万伍仟弐佰円', Q.kanjiYen(1245200) === '壱佰弐拾肆万伍仟弐佰円', Q.kanjiYen(1245200));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 JSV0816UGW6', csv.indexOf('JSV0816UGW6') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
