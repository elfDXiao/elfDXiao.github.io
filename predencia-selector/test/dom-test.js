// dom-test.js — Predencia 选型报价系统 DOM 集成测试（jsdom）
// 用法：node test/dom-test.js
// 依赖：D:/DSH工作区/rakuviac-bathroom/scripts/node_modules/jsdom
// 覆盖：初始化渲染、模式切换、プラン/サイズ選択、浴槽・機能・水栓連動、报价单渲染、无公式泄漏
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('D:/DSH工作区/rakuviac-bathroom/scripts/node_modules/jsdom');

const WEB = path.join(__dirname, '..');
function load(f) { return fs.readFileSync(path.join(WEB, f), 'utf8'); }

const html = load('index.html')
  .replace('data/products.js', 'data/products.js')
  .replace('js/price.js', 'js/price.js')
  .replace('js/quote.js', 'js/quote.js')
  .replace('js/wizard.js', 'js/wizard.js');

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'file:///D:/DSH工作区/takara-predencia/web/index.html' });
const { window } = dom;
const { document } = window;

// 注入脚本（顺序：数据 → price → quote → wizard → init）
window.eval(load('data/products.js'));
window.eval(load('js/price.js'));
window.eval(load('js/quote.js'));
window.eval(load('js/wizard.js'));
window.eval('window.PREDENCIA.wizard.init(window.PREDENCIA_DATA);');

const Q = window.PREDENCIA.quote;
const P = window.PREDENCIA.price;

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fail++; console.log('  ❌ ' + msg); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

/* ---------- 初始渲染 ---------- */
section('初始渲染');
const stepper = document.querySelector('#wizStepper');
ok(stepper && stepper.children.length === 12, 'stepper 12 步');
const body = document.querySelector('#wizBody');
ok(body.innerHTML.includes('尺寸模式') || body.innerHTML.includes('サイズモード'), 'step0 显示模式选择');
ok(body.innerHTML.includes('标准尺寸') || body.innerHTML.includes('規格サイズ'), 'step0 显示規格サイズ chip');
ok(!body.innerHTML.includes('高设计套餐') && !body.innerHTML.includes('ハイデザインプラン') && !body.querySelector('input[name="dim_plan"]'), 'step0 无套餐（第一页仅尺寸选择）');
ok(body.innerHTML.includes('1616'), 'step0 显示尺寸卡片');
ok(body.querySelectorAll('.size-card').length === 6, '6 个尺寸卡片');
ok(document.querySelector('#sumBase').textContent.includes('1,394,000'), '默认 1616 套装基准价 1,394,000（ベーシック）');

/* ---------- 模式切换：ぴったり ---------- */
section('模式切换：ぴったり');
const modePitari = body.querySelector('input[name="dim_mode"][data-code="pitari"]');
modePitari.checked = true;
modePitari.dispatchEvent(new window.Event('change', { bubbles: true }));
ok(Q.state.mode === 'pitari', 'mode 切换为 pitari');
ok(body.innerHTML.includes('間口') || body.innerHTML.includes('间口'), 'ぴったり模式显示間口区分');
ok(body.innerHTML.includes('浴槽行'), 'ぴったり模式显示浴槽行');
ok(body.querySelectorAll('input[data-pitari-col]').length === 13, '間口 13 区分');
ok(body.querySelectorAll('input[data-pitari-row]').length === 9, '浴槽行 9 種');

// 选間口+浴槽行
const col = body.querySelector('input[data-pitari-col="C12"]');
col.checked = true;
col.dispatchEvent(new window.Event('change', { bubbles: true }));
const row = body.querySelector('input[data-pitari-row="RLB2"]');
row.checked = true;
row.dispatchEvent(new window.Event('change', { bubbles: true }));
const sumBase = document.querySelector('#sumBase');
ok(sumBase.textContent.includes('2,117,000'), 'ぴったり套装价 2,117,000（实际 ' + sumBase.textContent + '）');

/* ---------- 切回規格，走完整流程 ---------- */
section('規格模式完整流程');
const modeStd = body.querySelector('input[name="dim_mode"][data-code="std"]');
modeStd.checked = true;
modeStd.dispatchEvent(new window.Event('change', { bubbles: true }));
ok(Q.state.mode === 'std', 'mode 切回 std');

// 第一页只选尺寸（默认 1616，基准套装价=ベーシック 1,394,000；套餐已移除）
ok(document.querySelector('#sumBase').textContent.includes('1,394,000'), '1616 套装基准价 1,394,000（ベーシック構成）');

// step1 浴槽
document.querySelector('#btnNext').click();  // → step 1
let tubRadio = body.querySelector('input[name="dim_bathtub"][data-code="relax_lounge_bench"]');
ok(tubRadio && !tubRadio.disabled, '1616 でくつろぎラウンジ（ベンチ付）選択可');
tubRadio.checked = true;
tubRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
const colorRadio = body.querySelector('input[name="dim_bathtub_color"][data-code="WP"]');
colorRadio.checked = true;
colorRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
const apronRadio = body.querySelector('input[name="dim_apron_color"][data-code="W"]');
apronRadio.checked = true;
apronRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
const gripRadio = body.querySelector('input[name="dim_bathtub_grip"][data-code="grip_1"]');
gripRadio.checked = true;
gripRadio.dispatchEvent(new window.Event('change', { bubbles: true }));

// step2 機能：肩包み湯
document.querySelector('#btnNext').click();  // → step 2
const syRadio = body.querySelector('input[name="dim_shoulder_yumi"][data-code="shoulder_yumi"]');
ok(syRadio && !syRadio.disabled, 'ベンチ付浴槽で肩包み湯選択可');
syRadio.checked = true;
syRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
// ヘルシージェットは肩包み湯と併用不可 → disabled
const hjRadio = body.querySelector('input[name="dim_healthy_jet"][data-code="HJPN_100N2"]');
ok(hjRadio && hjRadio.disabled, '肩包み湯選択中はヘルシージェット disabled');

// step3-5 快速通过
document.querySelector('#btnNext').click();  // → 3 風呂フタ
document.querySelector('#btnNext').click();  // → 4 床
const floorRadio = body.querySelector('input[name="dim_floor"][data-code="XW"]');
floorRadio.checked = true;
floorRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
document.querySelector('#btnNext').click();  // → 5 壁
// 壁デザインパターン三模式 chips（Sazana 式）
const wdChips = body.querySelectorAll('input[name="dim_wall_design"]').length;
ok(wdChips === 3, '壁デザインパターン三模式 chips（1面/全面4面/2トーン）', wdChips);
const wdRadio = body.querySelector('input[name="dim_wall_design"][data-code="1FACE"]');
wdRadio.checked = true;
wdRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
const wpRadio = body.querySelector('input[name="dim_wall_panel"][data-code="JWX"]');
ok(wpRadio && !wpRadio.disabled, '壁柄 プレミアム選択可');
wpRadio.checked = true;
wpRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
// 切 2TONE → 周辺柄 chips 出现
const wd2 = body.querySelector('input[name="dim_wall_design"][data-code="2TONE"]');
wd2.checked = true;
wd2.dispatchEvent(new window.Event('change', { bubbles: true }));
const wsChips = body.querySelectorAll('input[name="wall_surround"]').length;
ok(wsChips > 0, '2トーン周辺柄 chips 出现', wsChips);
// 切回 1FACE（保持后续合计断言含墙价 15,000）
const wdBack = body.querySelector('input[name="dim_wall_design"][data-code="1FACE"]');
wdBack.checked = true;
wdBack.dispatchEvent(new window.Event('change', { bubbles: true }));

/* ---------- カウンター×水栓連動 ---------- */
section('カウンター×水栓連動（規格）');
document.querySelector('#btnNext').click();  // → 6 カウンター・水栓
const counterRadio = body.querySelector('input[name="dim_counter"][data-code="QS_dual"]');
counterRadio.checked = true;
counterRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
// faucet が連動表示
const faucetSb = body.querySelector('input[name="dim_faucet"][data-code="SB280L_RABHK"]');
ok(faucetSb && !faucetSb.disabled, 'デュアルカウンターで SB280L/RABHK 選択可');
const faucetFtb = body.querySelector('input[name="dim_faucet"][data-code="FTB230K"]');
ok(!faucetFtb || faucetFtb.disabled, 'デュアルカウンターで FTB230K は非表示 or disabled');
faucetSb.checked = true;
faucetSb.dispatchEvent(new window.Event('change', { bubbles: true }));
// 选项合计 = 肩包み湯199,500 + XW29,000 + JWX15,000 + グリップ10,000 + QS_dual276,000 + SB280L71,000 = 600,500
ok(document.querySelector('#sumOpt').textContent.includes('600,500'), '选项合计 600,500（实际 ' + document.querySelector('#sumOpt').textContent + '）');

/* ---------- 报价单 ---------- */
section('报价单');
document.querySelector('#sumToQuote').click();
const quoteDoc = document.querySelector('#quoteDoc');
ok(quoteDoc.innerHTML.includes('見 積 書') || quoteDoc.innerHTML.includes('報 价 单'), '报价单标题渲染');
ok(quoteDoc.innerHTML.includes('プレデンシア') || quoteDoc.innerHTML.includes('Predencia'), '报价单品牌名');
const quoteText = quoteDoc.textContent;
ok(!quoteText.includes('rmbRate') && !quoteText.includes('1.2') && !quoteText.includes('× 汇率'), '报价单无公式/系数泄漏');

/* ---------- 复制清单 ---------- */
section('复制清单');
window.navigator.clipboard = { writeText: function () { return Promise.resolve(); } };
document.querySelector('#sumCopy').click();
// 无异常即可

/* ---------- 页面级无公式泄漏 ---------- */
section('页面级无公式泄漏');
const htmlAll = load('index.html');
ok(!htmlAll.includes('rmbRate') && !htmlAll.includes('×1.2') && !htmlAll.includes('× 1.2') && !htmlAll.includes('系数'), 'index.html 无 rmbRate/×1.2/系数');
const wizSrc = load('js/wizard.js');
ok(!wizSrc.includes('rmbRate') && !wizSrc.includes('×1.2') && !wizSrc.includes('× 1.2'), 'wizard.js 无 rmbRate/×1.2 算式');
ok(quoteDoc.textContent.includes('据付人工費込み') || quoteDoc.textContent.includes('已含安装人工费'), '报价单含「已含安装人工费/据付人工費込み」');

/* ---------- 全步骤可走通（finish） ---------- */
section('全步骤走通');
// 回到 wizard 视图
document.querySelector('#btnBack').click();
// 快速跳到最后一步
Q.state.step = 11;
window.PREDENCIA.wizard.renderAll();
ok(document.querySelector('#btnFinish') && !document.querySelector('#btnFinish').hidden, 'step11 显示生成报价单按钮');

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
