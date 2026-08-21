// smoke-test.js — LIXIL シャワーユニット NS 报价系统核心逻辑自测（Node vm，无 DOM）
// 真实数据（shower-data.json 生成）：標準仕様価格矩阵（4×4）/0.8 人民币/壁パネル两段式（23柄3クラス）/水栓種条件键/约束/品番 NSPB/CSV
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

const DATA = ctx.window.LSHOWER_DATA;
const P = ctx.window.LSHOWER.price;
const Q = ctx.window.LSHOWER.quote;
Q.init(DATA);

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

console.log('== 数据加载 ==');
assert('categories = 32', DATA.categories.length === 32, DATA.categories.length);
assert('size options = 4', Q.cat('size').options.length === 4);
assert('type options = 4（UZ/UX/FZ/FX）', Q.cat('type').options.length === 4);
assert('meta.rmbRate = 0.8', DATA.meta.rmbRate === 0.8, DATA.meta.rmbRate);
assert('壁柄 23（wall_pattern）', Q.wallPatterns().length === 23, Q.wallPatterns().length);
assert('写真セット 12（photo_set）', Q.cat('photo_set').options.length === 12);
assert('总选项 = 210', DATA.categories.reduce((n, c) => n + c.options.length, 0) === 210, DATA.categories.reduce((n, c) => n + c.options.length, 0));

console.log('== 標準仕様価格矩阵（16 组合全断言） ==');
const PRICES = {
  'UZ': { '1216': 1726000, '0914': 1318000, '0912': 1300000, '0812': 1260000 },
  'UX': { '1216': 1053000, '0914': 904000, '0912': 886000, '0812': 846000 },
  'FZ': { '1216': 1266000, '0914': 858000, '0912': 840000, '0812': 800000 },
  'FX': { '1216': 844000, '0914': 695000, '0912': 677000, '0812': 637000 }
};
let matrixOK = true;
Object.keys(PRICES).forEach(function (t) {
  Object.keys(PRICES[t]).forEach(function (s) {
    if (DATA.meta.typeBasePrices[t][s] !== PRICES[t][s]) matrixOK = false;
  });
});
assert('4 タイプ × 4 サイズ = 16 组合全矩阵一致', matrixOK);

console.log('== 默认配置（1216 + UX） ==');
let r = Q.computeQuote();
assert('默认 totalEx = 1,053,000', r.totalEx === 1053000, r.totalEx);
assert('默认 tax = 105,300', r.tax === 105300, r.tax);
assert('默认 totalInc = 1,158,300', r.totalInc === 1158300, r.totalInc);
assert('默认无 unknown', r.unknown.length === 0, r.unknown);
assert('默认品番 = NSPB-1216LBU X-C+H(C)RL 前缀正确', Q.productNo().indexOf('NSPB-1216LB') === 0, Q.productNo());

console.log('== ★ 人民币计价 rmbRate=0.8（税込×汇率×0.8） ==');
Q.setRate(0.05);
r = Q.computeQuote();
assert('rate=0.05 → rmbAllIn = round(1,158,300×0.05×0.8) = 46,332', r.rmbAllIn === 46332, r.rmbAllIn);
Q.setRate(0);
r = Q.computeQuote();
assert('rate=0 → rmbAllIn null', r.rmbAllIn === null, r.rmbAllIn);
Q.setRate(null);

console.log('== タイプ×サイズ 联动与品番 ==');
Q.state.sel.type = 'FZ';
r = Q.computeQuote();
assert('FZ 1216 → 1,266,000', r.totalEx === 1266000, r.totalEx);
Q.reset();
Q.state.sel.type = 'FX';
Q.setSize('0812');
r = Q.computeQuote();
assert('FX 0812 → 637,000', r.totalEx === 637000, r.totalEx);
Q.reset();
// 品番 floor コード：タイル床 A / FRP床 B
Q.state.sel.floor = '9J';
Q.state.sel.type = 'UX';
Q.setSize('1216');
assert('タイル床 → NSPB-1216LAUX-C+H(C)RL', Q.productNo() === 'NSPB-1216LAUX-C+H(C)RL', Q.productNo());
Q.reset();
Q.state.sel.floor = 'BE';
Q.state.sel.type = 'UZ';
Q.setSize('0914');
assert('FRP床 → NSPB-0914LBUZ-C+H(C)RL', Q.productNo() === 'NSPB-0914LBUZ-C+H(C)RL', Q.productNo());
Q.reset();
// SU02G 写真セット品番验证
Q.state.sel.type = 'UZ';
Q.state.sel.floor = '9J';
Q.setSize('0914');
assert('SU02G 品番 = NSPB-0914LAUZ-C+H(C)RL', Q.productNo() === 'NSPB-0914LAUZ-C+H(C)RL', Q.productNo());
Q.reset();

console.log('== 寒冷地（region C）标准价 +5,000 ==');
Q.state.sel.region = 'C';
r = Q.computeQuote();
assert('UX1216 寒冷地 → 1,058,000', r.totalEx === 1058000, r.totalEx);
Q.reset();

console.log('== 壁パネル两段式（wall + wall_pattern） ==');
// 全面張り：默认（无花纹）= 0（鏡面ホワイト ハイクラス）
Q.state.sel.wall = '0';
assert('全面張り 无花纹 → 0', Q.contributionFor('wall') === 0, Q.contributionFor('wall'));
// プレミアムⅠ HN972（カルカッタゴールド）→ +30,000（SU04F 实证）
Q.state.sub.wall_pattern = 'HN972';
assert('全面張り HN972 → +30,000', Q.contributionFor('wall') === 30000, Q.contributionFor('wall'));
assert('HN972 全面張り品番 = XB', Q.wallPatternPartNo('HN972') === 'XB', Q.wallPatternPartNo('HN972'));
// ハイクラス HN987 → ±0
Q.state.sub.wall_pattern = 'HN987';
assert('全面張り HN987 → 0', Q.contributionFor('wall') === 0, Q.contributionFor('wall'));
// ベーシック LE301 → −50,000
Q.state.sub.wall_pattern = 'LE301';
assert('全面張り LE301 → −50,000', Q.contributionFor('wall') === -50000, Q.contributionFor('wall'));
Q.reset();
// アクセントB面 + ベース HT541 + HT513（premium1）→ +10,000（SU02G 实证）
Q.state.sel.wall = '1';
Q.state.sub.wall_base = 'HT541';
Q.state.sub.wall_pattern = 'HT513';
assert('アクセント HT513×HT541 → +10,000', Q.contributionFor('wall') === 10000, Q.contributionFor('wall'));
assert('HT513×HT541 組合品番 = XV', Q.wallPatternPartNo('HT513') === 'XV', Q.wallPatternPartNo('HT513'));
// ハイ×ハイ：HT612×HT611 → ±0（SU07F 实证）
Q.state.sub.wall_base = 'HT611';
Q.state.sub.wall_pattern = 'HT612';
assert('アクセント HT612×HT611 → 0', Q.contributionFor('wall') === 0, Q.contributionFor('wall'));
assert('HT612×HT611 組合品番 = E5', Q.wallPatternPartNo('HT612') === 'E5', Q.wallPatternPartNo('HT612'));
// LE301 ベース + premium1 → −10,000
Q.state.sub.wall_base = 'LE301';
Q.state.sub.wall_pattern = 'HT513';
assert('アクセント HT513×LE301 → −10,000', Q.contributionFor('wall') === -10000, Q.contributionFor('wall'));
// ベース不可：LE301 柄自身（fullwall 扱い）
Q.state.sub.wall_base = 'HN301';
Q.state.sub.wall_pattern = 'LE301';
assert('LE301 アクセント禁用', !!Q.wallPatternDisabled('LE301'));
// 全面張り时ベース禁用提示
Q.state.sel.wall = '0';
assert('全面張り时 wall_base 禁用提示', !!Q.wallBaseDisabled('HN301'));
Q.reset();

console.log('== 水栓種条件键（shower_head/hook） ==');
// UX 标准 H3（シャワーシステム）→ AA 不可选（シャワーシステムにハンドシャワー付属）
Q.state.sel.type = 'UX';
Q.state.sel.faucet = 'H3';
Q.state.sel.shower_head = 'AA';
assert('UX+H3 AA → null（不可选，システムにハンドシャワー付）', Q.contributionFor('shower_head') === null, Q.contributionFor('shower_head'));
// UX 未选水栓（默认 H3）→ AA 同样不可选
Q.state.sel.faucet = null;
Q.state.sel.shower_head = 'AA';
assert('UX 默认水栓 AA → null', Q.contributionFor('shower_head') === null, Q.contributionFor('shower_head'));
// UX + G8（アクアタワー）→ AA 标准 0
Q.state.sel.faucet = 'G8';
assert('UX+G8 AA → 0', Q.contributionFor('shower_head') === 0, Q.contributionFor('shower_head'));
// FZ 标准 QU → CF エコアクア 0
Q.reset();
Q.state.sel.type = 'FZ';
Q.state.sel.faucet = 'QU';
Q.state.sel.shower_head = 'CF';
assert('FZ+QU CF → 0', Q.contributionFor('shower_head') === 0, Q.contributionFor('shower_head'));
// FZ + QU → EF SPA +12,000
Q.state.sel.shower_head = 'EF';
assert('FZ+QU EF → +12,000', Q.contributionFor('shower_head') === 12000, Q.contributionFor('shower_head'));
// FZ + D2（壁付サーモOG1ブラック）→ CF 不可（FZFX_bst null）
Q.state.sel.faucet = 'D2';
Q.state.sel.shower_head = 'CF';
assert('FZ+D2 CF → null（不可选）', Q.contributionFor('shower_head') === null, Q.contributionFor('shower_head'));
Q.reset();
// shower_hook：UZ 标准 BA 0；UX+H3 NN 0（フック機能付）
Q.state.sel.type = 'UZ';
Q.state.sel.faucet = 'G8';
Q.state.sel.shower_hook = 'BA';
assert('UZ+G8 BA → 0', Q.contributionFor('shower_hook') === 0, Q.contributionFor('shower_hook'));
Q.state.sel.shower_hook = 'GC';
assert('UZ+G8 GC → +27,500（SU03G 实证）', Q.contributionFor('shower_hook') === 27500, Q.contributionFor('shower_hook'));
Q.reset();
Q.state.sel.type = 'UX';
Q.state.sel.faucet = 'H3';
Q.state.sel.shower_hook = 'NN';
assert('UX+H3 NN → 0', Q.contributionFor('shower_hook') === 0, Q.contributionFor('shower_hook'));
Q.state.sel.shower_hook = 'GB';
assert('UX+H3 GB → +33,000（SU14C 实证）', Q.contributionFor('shower_hook') === 33000, Q.contributionFor('shower_hook'));
Q.reset();
// FZ 标准 DG 0
Q.state.sel.type = 'FZ';
Q.state.sel.faucet = 'QU';
Q.state.sel.shower_hook = 'DG';
assert('FZ+QU DG → 0', Q.contributionFor('shower_hook') === 0, Q.contributionFor('shower_hook'));
Q.state.sel.shower_hook = 'GD';
assert('FZ+QU GD → −5,000（SU17A 实证）', Q.contributionFor('shower_hook') === -5000, Q.contributionFor('shower_hook'));
Q.reset();

console.log('== 选项差价（床/天井/照明/ドア） ==');
Q.state.sel.floor = '9J';
r = Q.computeQuote();
assert('UX1216 + タイル9J(+350,000) → 1,403,000', r.totalEx === 1403000, r.totalEx);
Q.reset();
Q.state.sel.ceiling = 'P0';
Q.state.sel.type = 'UZ';
r = Q.computeQuote();
assert('UZ1216 + 平天井P0(+48,000) → 1,774,000', r.totalEx === 1774000, r.totalEx);
Q.reset();
Q.state.sel.lighting = 'QD';
Q.state.sel.type = 'UX';
Q.setSize('0912');
r = Q.computeQuote();
assert('UX0912 + タテライン(+248,000) → 1,134,000', r.totalEx === 1134000, r.totalEx);
Q.reset();
Q.state.sel.lighting = 'GP2';
r = Q.computeQuote();
assert('UX1216 + ダウンライト2灯(+28,000) → 1,081,000', r.totalEx === 1081000, r.totalEx);
Q.reset();
Q.state.sel.door = 'TE';
Q.state.sel.type = 'UX';
r = Q.computeQuote();
assert('UX1216 + テンパー2枚引き戸(+509,000) → 1,562,000', r.totalEx === 1562000, r.totalEx);
Q.reset();

console.log('== multi 叠加（その他オプション） ==');
Q.state.multi.other_options = { S26: true, S25: true };
r = Q.computeQuote();
assert('S26(5,200)+S25(5,600) → 1,063,800', r.totalEx === 1063800, r.totalEx);
Q.reset();

console.log('== 写真セット ==');
Q.state.sel.photo_set = 'SU02G';
Q.state.sel.type = 'UZ';
Q.setSize('0914');
r = Q.computeQuote();
assert('SU02G UZ0914 → 2,428,800（= 1,318,000 + 1,110,800）', r.totalEx === 2428800, r.totalEx);
Q.reset();
Q.state.sel.photo_set = 'SU07F';
Q.state.sel.type = 'FX';
Q.setSize('0812');
r = Q.computeQuote();
assert('SU07F FX0812 → 728,200（= 637,000 + 91,200）', r.totalEx === 728200, r.totalEx);
Q.reset();

console.log('== 约束 ==');
// ベンチ：UX/FX 不可
Q.state.sel.type = 'UX';
assert('UX タイプ时 bench A1 禁用', !!Q.disabledReason('bench', 'A1'));
Q.reset();
Q.state.sel.type = 'FZ';
Q.setSize('0914');
assert('FZ0914 时 bench A1 可用', !Q.disabledReason('bench', 'A1'));
Q.reset();
assert('1216 时 bench A1 禁用（グランザ専用）', !!Q.disabledReason('bench', 'A1'));
Q.reset();
// 換気乾燥暖房機：UZ/UX 不可、0914/0912/0812 不可
Q.state.sel.type = 'UX';
assert('UX 时 fan P 禁用', !!Q.disabledReason('fan', 'P'));
Q.reset();
Q.state.sel.type = 'FZ';
Q.setSize('0912');
assert('FZ0912 时 fan P 禁用', !!Q.disabledReason('fan', 'P'));
Q.reset();
Q.state.sel.type = 'FZ';
assert('FZ1216 时 fan P 可用', !Q.disabledReason('fan', 'P'));
Q.reset();
// タテライン照明：0812 不可 / UZ×RC 不可
Q.setSize('0812');
assert('0812 时 lighting QD 禁用', !!Q.disabledReason('lighting', 'QD'));
Q.reset();
Q.state.sel.type = 'UZ';
Q.state.sel.door_position = 'RC';
assert('UZ×RC 时 lighting QD 禁用', !!Q.disabledReason('lighting', 'QD'));
Q.reset();
// スリム照明：UZ/UX 不可
Q.state.sel.type = 'UX';
assert('UX 时 lighting CB 禁用', !!Q.disabledReason('lighting', 'CB'));
Q.reset();
Q.state.sel.type = 'FZ';
Q.state.sel.ceiling = 'P0';
assert('平天井ブラック时 lighting CB 禁用', !!Q.disabledReason('lighting', 'CB'));
Q.reset();
// ダウンライト1灯 × 平天井ブラック
Q.state.sel.ceiling = 'P0';
assert('平天井ブラック时 lighting GP 禁用', !!Q.disabledReason('lighting', 'GP'));
Q.reset();
// ドアカラー
Q.state.sel.door = 'ケ1';
assert('折り戸800W时 door_color 9 禁用', !!Q.disabledReason('door_color', '9'));
Q.state.sel.door = 'ケE';
assert('折り戸900W时 door_color 9 可用', !Q.disabledReason('door_color', '9'));
Q.state.sel.door = 'TE';
assert('テンパー2枚引き戸时 door_color 6 可用', !Q.disabledReason('door_color', '6'));
assert('テンパー2枚引き戸时 door_color 3 禁用', !!Q.disabledReason('door_color', '3'));
Q.reset();
// 開き戸ハンドル：折り戸不可
Q.state.sel.door = 'ケ1';
assert('折り戸时 door_handle HD 禁用', !!Q.disabledReason('door_handle', 'HD'));
Q.state.sel.door = 'A1';
assert('開き戸时 door_handle HD 可用', !Q.disabledReason('door_handle', 'HD'));
Q.reset();
// 間仕切りユニット
Q.state.sel.door_position = 'RC';
Q.setSize('0912');
assert('0912×RC 时 partition F27 禁用', !!Q.disabledReason('partition', 'F27'));
Q.reset();
Q.state.sel.type = 'UZ';
Q.setSize('0914');
assert('UZ0914 时 partition F27 禁用', !!Q.disabledReason('partition', 'F27'));
Q.reset();
Q.state.sel.door = 'ケ1';
assert('折り戸时 partition F27 禁用', !!Q.disabledReason('partition', 'F27'));
Q.reset();
// ボディハグ：UX のみ + OG1 必須
Q.state.sel.type = 'UZ';
assert('UZ 时 bodyhug A 禁用', !!Q.disabledReason('bodyhug', 'A'));
Q.reset();
Q.state.sel.type = 'UX';
Q.state.sel.faucet = 'G8';
assert('UX+G8 时 bodyhug A 禁用（需OG1）', !!Q.disabledReason('bodyhug', 'A'));
Q.state.sel.bodyhug = 'A';
assert('bodyhug 后 faucet G8 禁用', !!Q.disabledReason('faucet', 'G8'));
Q.reset();
// スイッチ付シャワー × シャワーシステム
Q.state.sel.type = 'UX';
Q.state.sel.faucet = 'H3';
assert('H3 时 shower_head DB 禁用', !!Q.disabledReason('shower_head', 'DB'));
Q.reset();
// E面接続：1216 不可
Q.setSize('1216');
assert('1216 时 supply_piping 2 禁用', !!Q.disabledReason('supply_piping', '2'));
Q.reset();
// 吊架台：UX/FX のみ
Q.state.sel.type = 'UZ';
assert('UZ 时 mount H 禁用', !!Q.disabledReason('mount', 'H'));
Q.reset();
Q.state.sel.type = 'UX';
Q.state.sel.door = 'TE';
assert('TE 时 mount H 禁用', !!Q.disabledReason('mount', 'H'));
Q.reset();
// ドレン排水管 × 吊架台
Q.state.sel.type = 'UX';
Q.state.sel.mount = 'H';
assert('吊架台时 other_options S81 禁用', !!Q.disabledReason('other_options', 'S81'));
Q.reset();
// 防振ゴム × 根太受け
Q.state.sel.misc = 'S14';
assert('根太受け时 other_options S13 禁用', !!Q.disabledReason('other_options', 'S13'));
Q.reset();
// シャワーホースフック：UX/FX 不可
Q.state.sel.type = 'UX';
assert('UX 时 shower_hose_hook 2 禁用', !!Q.disabledReason('shower_hose_hook', '2'));
Q.reset();

console.log('== 全流程（UX1216 完整选配） ==');
Q.state.sel.type = 'UX';
Q.state.sel.region = 'REGION_H';
Q.state.sel.wall = '0';
Q.state.sub.wall_pattern = 'HN972';   // +30,000
Q.state.sel.floor = '9G';             // +350,000（1216）
Q.state.sel.ceiling = 'P0';           // +48,000（1216）
Q.state.sel.fan = 'C';
Q.state.sel.lighting = 'QD';          // +276,000（1216）
Q.state.sel.door = 'TE';              // +509,000
Q.state.sel.door_color = '6';
Q.state.sel.faucet = 'G8';            // UX +272,000
Q.state.sel.shower_head = 'CB';       // UX+G8 +5,000
Q.state.sel.shower_hook = 'NN';
Q.state.sel.mirror = 'NN';
Q.state.sel.storage = '2G';
Q.state.sel.towel = 'N';
Q.state.sel.supply_piping = 'J';
Q.state.sel.mount = 'L';
r = Q.computeQuote();
// 1,053,000 + 30,000 + 350,000 + 48,000 + 276,000 + 509,000 + 272,000 + 5,000 = 2,543,000
assert('全流程 totalEx = 2,543,000', r.totalEx === 2543000, r.totalEx);
assert('全流程无 unknown', r.unknown.length === 0, r.unknown);
assert('全流程品番 = NSPB-1216LAUX-C+H(C)RL', Q.productNo() === 'NSPB-1216LAUX-C+H(C)RL', Q.productNo());
Q.reset();

console.log('== 无「无该型号」渲染保障 ==');
let altOK = true;
Object.keys(PRICES).forEach(function (t) {
  Q.state.sel.type = t;
  ['1216', '0914', '0912', '0812'].forEach(function (s) {
    const alt = Q.sizeAltPrice(s);
    if (!alt || typeof alt.price !== 'number') altOK = false;
  });
});
assert('16 组合下 sizeAltPrice 全部可用（无「无该型号」）', altOK);
Q.reset();

console.log('== 漢数字 ==');
assert('1,158,300 → 壱佰壱拾伍万捌仟参佰円', Q.kanjiYen(1158300) === '壱佰壱拾伍万捌仟参佰円', Q.kanjiYen(1158300));
assert('0 → 零円', Q.kanjiYen(0) === '零円', Q.kanjiYen(0));

console.log('== CSV ==');
Q.state.sel.type = 'UX';
const csv = Q.toCSV();
assert('CSV 含 BOM', csv.charCodeAt(0) === 0xFEFF);
assert('CSV 含税込合計行', csv.indexOf('税込合計') >= 0);
assert('CSV 含品番 NSPB', csv.indexOf('NSPB-1216LB') >= 0);

console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
process.exit(fails === 0 ? 0 : 1);
