// cold-region-test.js — 寒冷地（region=C）选项价通道自测（Node vm，无 DOM）
// ① 一般地 vs 寒冷地逐格对比：差异必须只出现在 cold* 登记的格（现网＝手册 8 青字格，蓝字＝替换值）
// ② cold* 字段替换语义：对当前 タイプ×尺寸/条件键「有格才生效，无格回落一般地价」，显式 null = 寒冷地不可选
// ③ 冷地标准价通道 meta.coldTypeBasePrices / coldBaseAdd（无字段时维持 ＋¥5,000）
// 用法：node test/cold-region-test.js
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
const P = ctx.window.LIDEA.price;
const Q = ctx.window.LIDEA.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}
const TYPES = ['H', 'B', 'M', 'C'];
const SIZES = ['1216', '1316', '1318', '1616', '1618', '1620', '1624', 'S1818', 'S1216'];
const COLD_KEYS = ['coldPriceDiff', 'coldPriceByType', 'coldPricesBySize', 'coldPrice', 'coldIsBasic'];

function codesOf(d) { return Array.isArray(d.codes) ? d.codes.slice() : Q.catOpts(d).map(o => o.code); }

/** 全量扫：每个 尺寸×タイプ 下所有选项的 contribution / disabledReason / 标准价 */
function snapshot(cold) {
  const cell = {}, base = {};
  Q.reset();
  SIZES.forEach(sz => TYPES.forEach(tp => {
    Q.setSize(sz);
    Q.state.sel.type = tp;
    if (cold) Q.state.sel.region = 'C'; else delete Q.state.sel.region;
    const t = Q.typeCode(), k = sz + '/' + t;
    base[k] = Q.basePrice();
    Q.DIMS.forEach(d => {
      if (d.step === 0) return;
      codesOf(d).forEach(code => {
        if (d.kind === 'radio') Q.state.sel[d.id] = code;
        else { Q.state.multi[d.id] = {}; Q.state.multi[d.id][code] = true; }
        cell[k + '/' + d.id + '/' + code] = [Q.contributionFor(d.id), Q.disabledReason(d.id, code)];
      });
    });
  }));
  return { cell, base };
}

console.log('== ① 现网数据：一般地 / 寒冷地逐格对比 ==');
const hot = snapshot(false);
const cold = snapshot(true);
const keys = Object.keys(hot.cell);
const expectCells = SIZES.length * TYPES.length * Q.DIMS.reduce((n, d) => n + (d.step === 0 ? 0 : codesOf(d).length), 0);
let diff = [];
keys.forEach(k => {
  const a = hot.cell[k], b = cold.cell[k];
  if (a[0] !== b[0] || a[1] !== b[1]) diff.push(k + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
});
assert('扫描格数 = 全维度选项 × 9 尺寸 × 4 タイプ（' + expectCells + '）', keys.length === expectCells, keys.length);
// ★水栓 7 行 patch 后：现网 cold* 录数 = 手册 8 青字格（P.122×3＋P.123×5，蓝字＝寒冷地替换值）。
//   一般/寒冷差异必须只落在这 7 个选项的有格タイプ：D5(H/B/M)＋H3(H)＋H4(H)＋BP/BQ/BR/BT(全4类型) × 9 尺寸 = 189 格
const ALLOW = /\/(faucet\/(D5|H3|H4)|tub_faucet\/(BP|BQ|BR|BT))$/;
assert('一般/寒冷 diff 仅落在 8 青字格登记的 7 选项（189 格）',
  diff.length === 189 && diff.every(dd => ALLOW.test(dd.slice(0, dd.indexOf(':')))), diff.slice(0, 3));
const baseDiff = Object.keys(hot.base).filter(k => hot.base[k] !== 5000 && cold.base[k] !== hot.base[k] + 5000);
assert('标准价差异恒为 ＋¥5,000（现网无 coldTypeBasePrices）', baseDiff.length === 0, baseDiff.slice(0, 3));
const EXPECT_COLD = {
  'faucet/D5': { coldPriceByType: { H: 60000, B: 79600, M: 79600 } },
  'faucet/H3': { coldPriceByType: { H: 149700 } },
  'faucet/H4': { coldPriceByType: { H: 249700 } },
  'faucet/BP': { coldPriceDiff: 148200 },
  'faucet/BQ': { coldPriceDiff: 208200 },
  'faucet/BR': { coldPriceDiff: 69600 },
  'faucet/BT': { coldPriceDiff: 116500 }
};
const seen = {};
DATA.categories.forEach(c => c.options.forEach(o => {
  const cold = {};
  COLD_KEYS.forEach(k => { if (o[k] != null) cold[k] = o[k]; });
  if (Object.keys(cold).length) seen[c.id + '/' + o.code] = cold;
}));
assert('cold* 录数恰为手册 8 青字格（7 选项），逐格值一致', JSON.stringify(seen) === JSON.stringify(EXPECT_COLD), seen);

console.log('== ② cold* 字段替换语义（合成夹具，用完即撤） ==');
function pick(dimId, pred) {
  const d = Q.dim(dimId);
  return codesOf(d).map(c => Q.opt(dimId, c)).find(pred) || null;
}
/** 在指定 dim/type/size/region 下取 contribution + disabledReason */
function probe(dimId, code, type, size, cold) {
  Q.setSize(size);
  Q.state.sel = {};
  Q.state.multi = {};
  Q.state.sel.type = type;
  if (cold) Q.state.sel.region = 'C';
  const d = Q.dim(dimId);
  if (d.kind === 'radio') Q.state.sel[dimId] = code;
  else { Q.state.multi[dimId] = {}; Q.state.multi[dimId][code] = true; }
  return { v: Q.contributionFor(dimId), dis: Q.disabledReason(dimId, code) };
}

// (a) タイプ键价：H3 寒冷地 +¥149,700（手册 寒冷地仕様 口径）→ 一般地保持原价
const oH3 = Q.opt('faucet', 'H3');
const hotH3 = probe('faucet', 'H3', 'H', '1616', false).v;
oH3.coldPriceByType = { H: 149700 };
const coldH3 = probe('faucet', 'H3', 'H', '1616', true);
assert('H3 寒冷地取 coldPriceByType（149,700）', coldH3.v === 149700, coldH3.v);
assert('H3 一般地不受 cold 字段影响', probe('faucet', 'H3', 'H', '1616', false).v === hotH3, hotH3);
probe('faucet', 'H3', 'H', '1616', true);   // 让 state 处于寒冷地 H 再验卡片显示口径
assert('卡片显示同口径（optionPriceSummary 走 effective）', P.optionPriceSummary(Q.effective(oH3, 'faucet'), 'H', '1616').text === '＋￥149,700',
  P.optionPriceSummary(Q.effective(oH3, 'faucet'), 'H', '1616').text);
// (b) cold 表无当前タイプ的格 → 回落一般地价（「異なる差額のみ記載」）
assert('cold 表无 M 格时 H3@寒冷地回落一般地价', (function () {
  const hotM = probe('faucet', 'H3', 'M', '1616', false).v;
  return probe('faucet', 'H3', 'M', '1616', true).v === hotM;
})());
// (c) 显式 null = 寒冷地不可选
oH3.coldPriceByType = { H: null };
assert('cold 显式 null → contribution = null', probe('faucet', 'H3', 'H', '1616', true).v === null);
assert('cold 显式 null → 禁用并给理由', !!probe('faucet', 'H3', 'H', '1616', true).dis);
assert('cold 显式 null 不影响一般地', probe('faucet', 'H3', 'H', '1616', false).v === hotH3);
delete oH3.coldPriceByType;

// (d) 嵌套尺寸表（タイプ×尺寸）cold 覆盖
const oMirror = pick('mirror', o => o.priceByType && typeof o.priceByType.H === 'object') || pick('mirror', o => !!o.priceByType);
const mHot1624 = probe('mirror', oMirror.code, 'H', '1624', false).v;
oMirror.coldPriceByType = { H: { '1624': 999000, '□□16': 888000 } };
assert('嵌套 cold：1624 取 999,000', probe('mirror', oMirror.code, 'H', '1624', true).v === 999000, probe('mirror', oMirror.code, 'H', '1624', true).v);
assert('嵌套 cold：组键 □□16 命中 1616 → 888,000', probe('mirror', oMirror.code, 'H', '1616', true).v === 888000, probe('mirror', oMirror.code, 'H', '1616', true).v);
assert('嵌套 cold：无格尺寸 1620 → 不可选（与一般地嵌套语义一致）',
  probe('mirror', oMirror.code, 'H', '1620', true).v === null && !!probe('mirror', oMirror.code, 'H', '1620', true).dis);
assert('嵌套 cold 不影响一般地', probe('mirror', oMirror.code, 'H', '1624', false).v === mHot1624, mHot1624);
delete oMirror.coldPriceByType;

// (e) pricesBySize 档价 cold 覆盖
const oFan = pick('fan', o => !!o.pricesBySize);
const fHot1616 = probe('fan', oFan.code, 'M', '1616', false).v;
oFan.coldPricesBySize = { '1624': 7000 };
assert('coldPricesBySize：1624 取 7,000', probe('fan', oFan.code, 'M', '1624', true).v === 7000, probe('fan', oFan.code, 'M', '1624', true).v);
assert('coldPricesBySize 无当前尺寸格 → 回落一般地', probe('fan', oFan.code, 'M', '1616', true).v === fHot1616, fHot1616);
delete oFan.coldPricesBySize;

// (f) priceDiff / price 固定差价 cold 覆盖（全库找任一数字 priceDiff 的选项）
let fT = null;
Q.DIMS.forEach(d => {
  if (fT || d.step === 0) return;
  codesOf(d).forEach(c => {
    if (fT) return;
    const o = Q.opt(d.id, c);
    if (o && typeof o.priceDiff === 'number') fT = { dimId: d.id, o: o };
  });
});
assert('库内存在数字 priceDiff 选项（coldPriceDiff 夹具前置）', !!fT);
const oTowel = fT.o;
oTowel.coldPriceDiff = 12345;
assert('coldPriceDiff 覆盖固定差价', probe(fT.dimId, oTowel.code, 'M', '1616', true).v === 12345, probe(fT.dimId, oTowel.code, 'M', '1616', true).v);
assert('coldPriceDiff 不影响一般地', probe(fT.dimId, oTowel.code, 'M', '1616', false).v === oTowel.priceDiff);
delete oTowel.coldPriceDiff;

// (g) 一般地 / 未命中时 effective() 返回原对象（零拷贝、零影响）
Q.reset();
Q.setSize('1616');
Q.state.sel.type = 'M';
assert('一般地：effective() 原样返回同一对象', Q.effective(oFan, 'fan') === oFan);
assert('寒冷地但无 cold 字段：effective() 原样返回同一对象', (function () {
  Q.state.sel.region = 'C';
  return Q.effective(oFan, 'fan') === oFan;
})());

console.log('== ③ 冷地标准价通道 ==');
Q.reset();
Q.setSize('1616');
Q.state.sel.type = 'H';
const hotBase = Q.basePrice();
Q.state.sel.region = 'C';
assert('无 coldTypeBasePrices 时 = 一般地 + 5,000', Q.basePrice() === hotBase + 5000, Q.basePrice());
DATA.meta.coldTypeBasePrices = { H: { '1616': 900000 } };
assert('coldTypeBasePrices 有格 → 顶替标准价（900,000）', Q.basePrice() === 900000, Q.basePrice());
assert('一般地不受 coldTypeBasePrices 影响', (function () { delete Q.state.sel.region; return Q.basePrice() === hotBase; })());
Q.state.sel.region = 'C';
DATA.meta.coldBaseAdd = 1234;
assert('coldBaseAdd 可覆盖加价金额（一般地 + 1,234）', (function () {
  DATA.meta.coldTypeBasePrices = { H: { '1624': 1 } };   // 使 1616 无格 → 走加价分支
  return Q.basePrice() === hotBase + 1234;
})(), Q.basePrice());
delete DATA.meta.coldTypeBasePrices;
delete DATA.meta.coldBaseAdd;
assert('撤掉字段后恢复 ＋¥5,000', Q.basePrice() === hotBase + 5000, Q.basePrice());

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);