// smoke-test.js — Predencia 选型报价引擎冒烟测试（Node vm 无 DOM）
// 用法：node test/smoke-test.js
// 覆盖：数据完整性、计价（規格プラン×サイズ / ぴったり間口×浴槽行）、约束（肩包み湯/ヘルシージェット/水栓連動/カウンター）、
//       无「无该型号」文案泄漏、rmbRate=1.2 存在但源码 grep 无公式（由 deploy-check 复查）。
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WEB = path.join(__dirname, '..');
function load(f) { return fs.readFileSync(path.join(WEB, f), 'utf8'); }

const sandbox = { window: {} };
sandbox.window.PREDENCIA = {};
vm.createContext(sandbox);
vm.runInContext(load('data/products.js'), sandbox);
vm.runInContext(load('js/price.js'), sandbox);
vm.runInContext(load('js/quote.js'), sandbox);

const Q = sandbox.window.PREDENCIA.quote;
const P = sandbox.window.PREDENCIA.price;
const DATA = sandbox.window.PREDENCIA_DATA;
Q.init(DATA);

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fail++; console.log('  ❌ ' + msg); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

/* ---------- 数据完整性 ---------- */
section('数据完整性');
ok(DATA.categories.length >= 50, 'categories ≥ 50（实际 ' + DATA.categories.length + '）');
const totalOpts = DATA.categories.reduce((n, c) => n + c.options.length, 0);
ok(totalOpts >= 380, 'options ≥ 380（实际 ' + totalOpts + '）');
ok(DATA.meta.rmbRate === 1.2, 'rmbRate = 1.2（用户自定义，仅计算内部）');
ok(DATA.meta.plans.length === 12, 'プラン 12 種');
ok(Object.keys(DATA.meta.planPrices).length === 12, 'planPrices 12 键');
ok(DATA.meta.pitariMatrix && DATA.meta.pitariMatrix.rows.length === 9 && DATA.meta.pitariMatrix.cols.length === 13, 'pitariMatrix 9行×13列');
ok(DATA.meta.planPrices['high_design']['1620'] === 1616500, 'ハイデザイン 1620=1,616,500');
ok(DATA.meta.planPrices['high_design']['1216'] === 1390200, 'ハイデザイン 1216=1,390,200');
ok(DATA.meta.planPrices['shoulder_yumi']['1620'] === 2081500 && DATA.meta.planPrices['shoulder_yumi']['1216'] == null, '肩包み湯プラン 戸建のみ');
ok(DATA.meta.planPrices['shigeki_yiyashi']['1616'] === 2223900, '至高の癒やし 1616=2,223,900');

// 浴槽 sizes
const bt = DATA.categories.find(c => c.id === 'bathtub');
ok(bt.options.every(o => Array.isArray(o.sizes) && o.sizes.length > 0), '浴槽形状全部带 sizes 制約');

// 価格 unknown 项 price=null
const unk = [];
DATA.categories.forEach(c => c.options.forEach(o => { if (o.priceUnknown) unk.push(c.id + '/' + o.code); }));
ok(unk.length >= 7, '価格未掲載项 ≥7 且 price 为 null（' + unk.length + '）');
ok(unk.every(u => true), 'unknown 项存在: ' + unk.slice(0, 3).join(', ') + ' …');

/* ---------- 規格计价 ---------- */
section('規格计价（基准套装·ベーシック×サイズ + 选项）');
Q.reset();
Q.state.size = '1616';
let r = Q.computeQuote();
ok(r.basePrice === 1394000, 'ベーシック 1616 套装基准价 1,394,000（实际 ' + r.basePrice + '）');
ok(r.totalEx === r.basePrice, '无选项时 total = 基准套装价');
ok(Q.planCode() === 'basic', 'planCode 恒为 basic（第一页无套餐）');

// 加选项：浴槽+床+壁
Q.state.sel.bathtub = 'relax_lounge';
Q.state.sel.bathtub_color = 'WP';
Q.state.sel.apron_color = 'W';
Q.state.sel.bathtub_grip = 'grip_1';
Q.state.sel.floor = 'XW';          // +29,000
Q.state.sel.drain_cover = 'TILE';  // +5,000
Q.state.sel.wall_design = '1FACE';
Q.state.sel.wall_panel = 'JWX';    // プレミアム柄 → 模式矩阵 +15,000
r = Q.computeQuote();
ok(r.totalEx === 1394000 + 29000 + 5000 + 15000 + 10000, '选项合计正确（+29,000+5,000+15,000+グリップ10,000）实际 ' + r.totalEx);

// 税込 1.10
ok(r.totalInc === Math.round(r.totalEx * 1.10), '税込 = 本体 × 1.10');

// 肩包み湯：+199,500（くつろぎラウンジベンチ付・1616）
Q.state.sel.bathtub = 'relax_lounge_bench';
Q.state.sel.shoulder_yumi = 'shoulder_yumi';
r = Q.computeQuote();
ok(r.totalEx === 1394000 + 29000 + 5000 + 15000 + 10000 + 199500, '肩包み湯 +199,500');

// ヘルシージェット +121,000（肩包み湯と併用不可 → autoFix で解除済みを確認）
Q.state.sel.healthy_jet = 'HJPN_100N2';
Q.state.sel.shoulder_yumi = 'shoulder_yumi';
Q.autoFix('shoulder_yumi', 'shoulder_yumi');   // 选择肩包み湯时 autoFix 应解除ヘルシージェット
ok(Q.state.sel.healthy_jet == null, '肩包み湯とヘルシージェット併用時は autoFix 解除ヘルシージェット');
// 単独でヘルシージェットだけを選ぶ（肩包み湯なし）
delete Q.state.sel.shoulder_yumi;
Q.state.sel.healthy_jet = 'HJPN_100N2';
r = Q.computeQuote();
ok(r.totalEx === 1394000 + 29000 + 5000 + 15000 + 10000 + 121000, 'ヘルシージェット +121,000');

/* ---------- カウンター×水栓連動 ---------- */
section('カウンター×水栓連動');
Q.reset();
Q.state.size = '1616';
Q.state.sel.counter = 'QS';       // +138,000（1616）
Q.state.sel.faucet = 'FTB230K';   // 水栓単体 +59,000
r = Q.computeQuote();
ok(r.totalEx === 1394000 + 138000 + 59000, 'QSカウンター + 水栓 = 1,394,000+138,000+59,000（实际 ' + r.totalEx + '）');

Q.reset();
Q.state.size = '1616';
Q.state.sel.counter = 'QS_dual';   // +276,000（1616）
Q.state.sel.faucet = 'SB280L_RABHK'; // 水栓単体 71,000（数据已拆）
r = Q.computeQuote();
ok(r.totalEx === 1394000 + 276000 + 71000, 'デュアルカウンター + SB280L = 1,394,000+276,000+71,000（实际 ' + r.totalEx + '）');

// カウンターなし：faucet_none_counter 総額（-37,000 等、カウンター価格 0）
Q.reset();
Q.state.size = '1216';
Q.state.sel.counter = 'none';
Q.state.sel.faucet = 'KF9032ST';  // 1216: -84,000（水栓⊖47,000+カウンター⊖37,000）
r = Q.computeQuote();
ok(r.totalEx === 1243700 - 84000, 'カウンターなし + KF9032ST = 1,243,700-84,000（实际 ' + r.totalEx + '）');

/* ---------- ぴったりサイズ ---------- */
section('ぴったりサイズ');
Q.reset();
Q.state.mode = 'pitari';
Q.state.pitariCol = 'C0';   // 1450/1475
Q.state.pitariRow = 'S12';  // S12浴槽（奥行1218/1243）
r = Q.computeQuote();
ok(r.basePrice === 1284000, 'ぴったり S12×1450/1475 = 1,284,000（实际 ' + r.basePrice + '）');

Q.state.pitariCol = 'C12';  // 2425/2450
Q.state.pitariRow = 'RLB2'; // ベンチ付（奥行1818/1843/1868）
r = Q.computeQuote();
ok(r.basePrice === 2117000, 'ぴったり ベンチ付×2425/2450 = 2,117,000（实际 ' + r.basePrice + '）');

// ぴったりで肩包み湯（RLB2 のみ可）
Q.state.pitariRow = 'RLB2';
Q.state.sel.shoulder_yumi = 'shoulder_yumi';
r = Q.computeQuote();
ok(r.totalEx === 2117000 + 199500, 'ぴったりベンチ付 + 肩包み湯 = 2,117,000+199,500（实际 ' + r.totalEx + '）');
ok(Q.disabledReason('shoulder_yumi', 'shoulder_yumi') == null, 'ぴったりRLB2では肩包み湯選択可');

// ぴったり S12 行では肩包み湯不可
Q.state.pitariRow = 'S12';
ok(Q.disabledReason('shoulder_yumi', 'shoulder_yumi') != null, 'ぴったりS12行では肩包み湯不可');

/* ---------- 约束 ---------- */
section('约束');
Q.reset();
Q.state.size = '1616';
Q.state.sel.plan = 'high_design';
ok(Q.disabledReason('bathtub', 'round') != null, '1616 サイズでラウンド浴槽不可');
Q.state.size = '1216';
ok(Q.disabledReason('bathtub', 'relax_lounge_bench') != null, '1216 サイズでくつろぎラウンジ不可');
Q.state.size = '1317';
ok(Q.disabledReason('plan', 'shoulder_yumi') != null, '1317（マンション）で肩包み湯プラン不可');
Q.state.size = '1216';
ok(Q.disabledReason('plan', 'shigeki_yiyashi') != null, '1216 で至高の癒やしプラン不可（1616/1620 のみ）');

// 水栓連動制約
Q.reset();
Q.state.size = '1616';
Q.state.sel.plan = 'high_design';
Q.state.sel.counter = 'QS_dual';
ok(Q.disabledReason('faucet', 'FTB230K') != null, 'デュアルカウンターで FTB230K 不可');
ok(Q.disabledReason('faucet', 'SB280L_RABHK') == null, 'デュアルカウンターで SB280L/RABHK 可');
Q.state.sel.counter = 'none';
ok(Q.disabledReason('faucet', 'SB182_HB1HK') != null, 'カウンターなしで規格水栓不可');

// ラグジュアリーライト：調光調色照明必須
Q.reset();
Q.state.size = '1616';
Q.state.sel.plan = 'high_design';
Q.state.sel.lighting = 'square_ceiling';
ok(Q.disabledReason('luxury_light', 'luxury_light') != null, '非調光照明でラグジュアリーライト不可');
Q.state.sel.lighting = 'straight_dimmable_L';
ok(Q.disabledReason('luxury_light', 'luxury_light') == null, '調光調色照明でラグジュアリーライト可');

// 価格未掲載（unknown）は選択不可
Q.reset();
Q.state.size = '1616';
ok(Q.disabledReason('bath_lid_hook', 'handbar_integrated') != null, 'ハンドバー一体型フック（価格未掲載）不可');

/* ---------- 无「无该型号」泄漏 ---------- */
section('无「无该型号」泄漏');
const prodJs = load('data/products.js');
const quoteJs = load('js/quote.js');
const wizJs = load('js/wizard.js');
ok(!prodJs.includes('无该型号') && !quoteJs.includes('无该型号') && !wizJs.includes('无该型号'), 'products/quote/wizard 源码无「无该型号」');

/* ---------- rmbRate 仅计算内部 ---------- */
section('rmbRate 仅计算内部');
ok(quoteJs.includes('rmbRate'), 'quote.js 含 rmbRate（计算用）');
ok(!quoteJs.includes('× 1.2') && !quoteJs.includes('×1.2') && !quoteJs.includes('乘1.2'), 'quote.js 无显式 ×1.2 算式文本');

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
