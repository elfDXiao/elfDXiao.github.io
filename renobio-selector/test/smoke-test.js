// smoke-test.js — LIXIL Renobio Fit 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（renobio-data.json 生成）：標準仕様価格矩阵（4×4）/0.8 人民币/壁パネル两段式/约束/品番 BKS-BLKS/CSV
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

const DATA = ctx.window.RENOBIO_DATA;
const P = ctx.window.RENOBIO.price;
const Q = ctx.window.RENOBIO.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 40', DATA.categories.length === 40, DATA.categories.length);
assert('size options = 4', Q.cat('size').options.length === 4);
assert('type options = 4（N/T/C/B）', Q.cat('type').options.length === 4);
assert('meta.rmbRate = 0.8', DATA.meta.rmbRate === 0.8, DATA.meta.rmbRate);
assert('壁柄 13（wall_pattern）', Q.wallPatterns().length === 13, Q.wallPatterns().length);
assert('写真セット 6（photo_set）', Q.cat('photo_set').options.length === 6);
assert('总选项 = 287', DATA.categories.reduce((n, c) => n + c.options.length, 0) === 287, DATA.categories.reduce((n, c) => n + c.options.length, 0));

console.log('== 標準仕様価格矩阵（16 组合全断言） ==');
const PRICES = {
  'N': { '1216': 841500, '1116': 821500, '1115': 806500, '1014': 781500 },
  'T': { '1216': 756500, '1116': 736500, '1115': 721500, '1014': 696500 },
  'C': { '1216': 744100, '1116': 724100, '1115': 709100, '1014': 684100 },
  'B': { '1216': 838500, '1116': 818500, '1115': 803500, '1014': 778500 }
};
let matrixOK = true;
Object.keys(PRICES).forEach(function (t) {
  Object.keys(PRICES[t]).forEach(function (s) {
    const v = DATA.meta.typeBasePrices[t][s];
    if (v !== PRICES[t][s]) matrixOK = false;
  });
});
assert('4 タイプ × 4 サイズ = 16 组合全矩阵一致', matrixOK);
assert('矩阵无 null（16 全可配）', (function () {
  let ok = true;
  Object.keys(PRICES).forEach(function (t) {
    Object.keys(PRICES[t]).forEach(function (s) {
      if (DATA.meta.typeBasePrices[t][s] == null) ok = false;
    });
  });
  return ok;
})());

console.log('== 默认配置（1216 + N） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 841,500', r.totalEx === 841500, r.totalEx);
assert('默认 tax = 84,150', r.tax === 84150, r.tax);
assert('默认 totalInc = 925,650', r.totalInc === 925650, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = BKS-1216LBN-B+H(C)RL', Q.productNo() === 'BKS-1216LBN-B+H(C)RL', Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.8（税込×汇率×0.8） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(925,650×0.05×0.8) = 37,026', r.rmbAllIn === 37026, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== タイプ×サイズ 联动与品番 ==');
Q.state.sel.type = 'B';
Q.setSize('1116');
r = Q.computeQuote();
assert('B 1116 → 818,500', r.totalEx === 818500, r.totalEx);
assert('Bタイプ品番 = BLKS-1116LBB-B+H(C)RL', Q.productNo() === 'BLKS-1116LBB-B+H(C)RL', Q.productNo());
Q.reset();
Q.state.sel.type = 'C';
Q.setSize('1014');
r = Q.computeQuote();
assert('C 1014 → 684,100', r.totalEx === 684100, r.totalEx);
assert('C1014 品番 = BKS-1014LBC-B+H(C)RL', Q.productNo() === 'BKS-1014LBC-B+H(C)RL', Q.productNo());
Q.reset();

console.log('== 寒冷地（region C）标准价 +5,000 ==');
Q.state.sel.region = 'C';
r = Q.computeQuote();
assert('N1216 寒冷地 → 846,500', r.totalEx === 846500, r.totalEx);
Q.reset();

console.log('== 壁パネル两段式（wall + wall_pattern） ==');
// 全面張り：默认（无花纹）= 0（マットホワイト标准）
Q.state.sel.wall = '0';
assert('全面張り 无花纹 → 0', Q.contributionFor('wall') === 0, Q.contributionFor('wall'));
// 全面張り + ハイクラス柄 HN987（ストーンシェルグレー）→ +70,000
Q.state.sub.wall_pattern = 'HN987';
assert('全面張り HN987 → +70,000', Q.contributionFor('wall') === 70000, Q.contributionFor('wall'));
assert('HN987 全面張り品番 = H2', Q.wallPatternPartNo('HN987') === 'H2', Q.wallPatternPartNo('HN987'));
// 全面張り + LE301（マットホワイト）→ 0
Q.state.sub.wall_pattern = 'LE301';
assert('全面張り LE301 → 0', Q.contributionFor('wall') === 0, Q.contributionFor('wall'));
// 全面張り不可柄（HN662 fullWallCode=null）禁用
Q.state.sub.wall_pattern = 'HN662';
assert('HN662 全面張り禁用', !!Q.wallPatternDisabled('HN662'));
assert('HN662 全面張り → null（未计）', Q.contributionFor('wall') === null, Q.contributionFor('wall'));
Q.reset();
// アクセントB面 + ベース LE301 + HN951 → +10,000（BK96A 实证）
Q.state.sel.wall = '1';
Q.state.sub.wall_base = 'LE301';
Q.state.sub.wall_pattern = 'HN951';
assert('アクセントB面 LE301 HN951 → +10,000', Q.contributionFor('wall') === 10000, Q.contributionFor('wall'));
assert('HN951 LE301 組合品番 = NJ', Q.wallPatternPartNo('HN951') === 'NJ', Q.wallPatternPartNo('HN951'));
// アクセント + ハイクラスベース HN986 + HN985 → +70,000（BK93A 实证）
Q.state.sub.wall_base = 'HN986';
assert('アクセント HN986 HN985 → +70,000', Q.contributionFor('wall') === 70000, Q.contributionFor('wall'));
assert('HN985 HN986 組合品番 = K6', Q.wallPatternPartNo('HN985') === 'K6', Q.wallPatternPartNo('HN985'));
// アクセント不可柄（LE301 自身）：wallPatternDisabled
Q.state.sub.wall_base = 'LE301';
Q.state.sub.wall_pattern = 'LE301';
assert('LE301 アクセント禁用', !!Q.wallPatternDisabled('LE301'));
// 全面張り时ベース禁用提示
Q.state.sel.wall = '0';
assert('全面張り时 wall_base LE301 禁用提示', !!Q.wallBaseDisabled('LE301'));
Q.reset();

console.log('== 选项差价（浴槽/照明/收纳） ==');
Q.state.sel.bathtub_drain = '3';
r = Q.computeQuote();
assert('N1216 + 排水栓3(+15,000) → 856,500', r.totalEx === 856500, r.totalEx);
Q.reset();
Q.state.sel.bathtub_bar = '2';
r = Q.computeQuote();
assert('N1216 + 浴槽内握りバー(+37,000) → 878,500', r.totalEx === 878500, r.totalEx);
Q.reset();
Q.state.sel.lighting = 'GP';
r = Q.computeQuote();
assert('N1216 + ダウンライト GP(+39,200) → 880,700', r.totalEx === 880700, r.totalEx);
Q.reset();
Q.state.sel.mirror = 'CA';
r = Q.computeQuote();
assert('N1216 + ワイドミラー(+22,000) → 863,500', r.totalEx === 863500, r.totalEx);
Q.reset();

console.log('== multi 叠加（磁吸配件） ==');
Q.state.multi.magnet_items = { A72: true, A96: true };
r = Q.computeQuote();
assert('A72(6,900)+A96(19,000) → 867,400', r.totalEx === 867400, r.totalEx);
Q.reset();

console.log('== 写真セット ==');
Q.state.sel.photo_set = 'BK93A';
r = Q.computeQuote();
assert('BK93A N1216 → 1,071,040（= 841,500 + 229,540）', r.totalEx === 1071040, r.totalEx);
Q.reset();
Q.state.sel.photo_set = 'BK98A';
Q.state.sel.type = 'B';
Q.setSize('1116');
r = Q.computeQuote();
assert('BK98A B1116 → 955,300（= 818,500 + 136,800）', r.totalEx === 955300, r.totalEx);
Q.reset();

console.log('== 约束 ==');
// C/B タイプ：カウンター不可
Q.state.sel.type = 'C';
assert('C タイプ时 counter 禁用', !!Q.disabledReason('counter', 'M1'));
Q.reset();
Q.state.sel.type = 'B';
assert('B タイプ时 counter 禁用', !!Q.disabledReason('counter', 'M1'));
Q.reset();
// N/T/C：アクリル化粧棚不可（B のみ）
Q.state.sel.type = 'N';
assert('N タイプ时 vanity_shelf 禁用', !!Q.disabledReason('vanity_shelf', 'A23'));
Q.reset();
Q.state.sel.type = 'B';
assert('B タイプ时 vanity_shelf A23 可用', !Q.disabledReason('vanity_shelf', 'A23'));
Q.reset();
// 浴槽〈ピンク〉× 床〈グレー〉
Q.state.sel.floor = '4A';
assert('床グレー时 浴槽ピンク 禁用', !!Q.disabledReason('bathtub', 'D'));
Q.state.sel.bathtub = 'D';
assert('浴槽ピンク时 床グレー 禁用', !!Q.disabledReason('floor', '4A'));
Q.reset();
// 壁高1900 × 2000H ドア / スライドフック 1000L
Q.state.sel.ceiling = 'E9';
assert('壁高1900时 door W1(2000H) 禁用', !!Q.disabledReason('door', 'W1'));
assert('壁高1900时 shower_hook GB(1000L) 禁用', !!Q.disabledReason('shower_hook', 'GB'));
Q.reset();
// ワイドミラー × シャワーフック2個
Q.state.sel.mirror = 'CA';
assert('ワイドミラー时 shower_hook KA(2個) 禁用', !!Q.disabledReason('shower_hook', 'KA'));
assert('ワイドミラー时 shower_hook GB(滑钩) 可用', !Q.disabledReason('shower_hook', 'GB'));
Q.reset();
// 浴槽側水栓 BS：N のみ（T 禁用由 priceByType null）
Q.state.sel.type = 'T';
assert('T タイプ时 faucet BS 禁用', !!Q.disabledReason('faucet', 'BS'));
Q.reset();
Q.state.sel.type = 'N';
assert('N タイプ时 faucet BS 可用', !Q.disabledReason('faucet', 'BS'));
Q.reset();
// 浴槽内握りバー：1014 不可（sizes）
Q.setSize('1014');
assert('1014 时 bathtub_bar 2 禁用', !!Q.disabledReason('bathtub_bar', '2'));
Q.reset();
// 開き戸800W/2枚引き戸800W：1216 のみ（sizes）
Q.setSize('1116');
assert('1116 时 door X1(800W) 禁用', !!Q.disabledReason('door', 'X1'));
assert('1116 时 door F1(2枚引き戸) 禁用', !!Q.disabledReason('door', 'F1'));
Q.reset();
Q.setSize('1216');
assert('1216 时 door X1 可用', !Q.disabledReason('door', 'X1'));
Q.reset();
// ボルト脚接着剤速乾 × 配管避け架台
Q.state.sel.bolt_adhesive = 'S42';
assert('S42 时 misc S12 禁用', !!Q.disabledReason('misc_options', 'S12'));
Q.reset();
// 2枚引き戸 × ドア額縁
Q.state.sel.door = 'F1';
assert('F1 时 door_frame S90 禁用', !!Q.disabledReason('door_frame', 'S90'));
Q.reset();
// 化粧棚790W × 収納棚
Q.state.sel.vanity_shelf = 'A42';
Q.state.sel.type = 'B';
assert('A42 时 storage V3 禁用', !!Q.disabledReason('storage', 'V3'));
assert('A42 时 storage NN 可用', !Q.disabledReason('storage', 'NN'));
Q.reset();

console.log('== 全流程（N1216 完整选配） ==');
Q.state.sel.type = 'N';
Q.state.sel.region = 'REGION_H';
Q.state.sel.floor = '4A';
Q.state.sel.wall = '0';
Q.state.sub.wall_pattern = 'HN987';
Q.state.sel.bathtub = 'A';
Q.state.sel.bathtub_drain = '3';
Q.state.sel.bathtub_bar = 'N';
Q.state.sel.bathtub_lid = '1';
Q.state.sel.bath_lid_hook = 'N';
Q.state.sel.ceiling = 'E0';
Q.state.sel.fan = 'N';
Q.state.sel.door = 'W1';
Q.state.sel.faucet = 'QM';
Q.state.sel.shower_head = 'PF';
Q.state.sel.shower_hook = 'GB';
Q.state.sel.counter = 'M1';
Q.state.sel.lighting = 'FB';
Q.state.sel.mirror = 'AA';
Q.state.sel.kirei_mirror = 'N';
Q.state.sel.storage = 'V3';
Q.state.sel.towel = 'B';
Q.state.sel.floor_height = 'L';
Q.state.sel.bolt_adhesive = 'S26';
Q.state.sel.supply_piping = 'A';
r = Q.computeQuote();
// 841,500 + 壁 70,000 + 排水栓 15,000 = 926,500
assert('全流程 totalEx = 926,500', r.totalEx === 926500, r.totalEx);
assert('全流程无 unknown', r.unknown.length === 0, r.unknown);
assert('全流程品番 = BKS-1216LBN-B+H(C)RL', Q.productNo() === 'BKS-1216LBN-B+H(C)RL', Q.productNo());
Q.reset();

console.log('== 无「无该型号」渲染保障 ==');
// 16 组合 × 全タイプ切换：sizeAltPrice 始终返回可用价
let altOK = true;
Object.keys(PRICES).forEach(function (t) {
  Q.state.sel.type = t;
  ['1216', '1116', '1115', '1014'].forEach(function (s) {
    const alt = Q.sizeAltPrice(s);
    if (!alt || typeof alt.price !== 'number') altOK = false;
  });
});
assert('16 组合下 sizeAltPrice 全部可用（无「无该型号」）', altOK);
Q.reset();

console.log('== 漢数字 ==');
assert('925,650 → 玖拾弐万伍仟陸佰伍拾円', Q.kanjiYen(925650) === '玖拾弐万伍仟陸佰伍拾円', Q.kanjiYen(925650));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
Q.state.sel.type = 'N';
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 BKS-1216LBN', csv.indexOf('BKS-1216LBN-B+H(C)RL') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
