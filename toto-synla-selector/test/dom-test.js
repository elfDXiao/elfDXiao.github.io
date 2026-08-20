// dom-test.js — TOTO Synla 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：15 步条/默认合计/壁柄两段选择/タイプ联动/multi 渲染/汇率/报价单/双语
'use strict';
const path = require('path');
const { JSDOM } = require(path.join(__dirname, '..', '..', '..', 'rakuviac-bathroom', 'scripts', 'node_modules', 'jsdom'));

let fails = 0;
function assert(name, cond, extra) {
  if (cond) console.log('  ✔', name);
  else { fails++; console.log('  ✘ FAIL:', name, extra != null ? '→ got ' + JSON.stringify(extra) : ''); }
}

function waitFor(win, check, ms) {
  return new Promise(function (resolve, reject) {
    const t0 = Date.now();
    (function poll() {
      let v = null;
      try { v = check(); } catch (e) { /* ignore */ }
      if (v) return resolve(v);
      if (Date.now() - t0 > ms) return reject(new Error('timeout waiting for condition'));
      setTimeout(poll, 50);
    })();
  });
}

(async function main() {
  const htmlFile = path.join(__dirname, '..', 'index.html');
  const dom = await JSDOM.fromFile(htmlFile, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });
  const win = dom.window;
  const doc = win.document;

  await waitFor(win, function () {
    return win.SYNLA && win.SYNLA.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 15;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 15 项', doc.querySelectorAll('#wizStepper .wstep').length === 15);
  assert('尺寸卡片 7 个', doc.querySelectorAll('#wizBody .size-card').length === 7);
  assert('1616 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1616'; })());
  assert('タイプ 5 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 5);
  assert('默认日元合计(税抜) = ￥3,128,000', doc.querySelector('#sumJPY').textContent.indexOf('3,128,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 壁柄两段选择（step 2） ==');
  doc.querySelector('#wizStepper .wstep[data-step="2"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_plan"]').length === 3; }, 2000);
  assert('壁柄 plan 3 个', doc.querySelectorAll('#wizBody input[name="wall_plan"]').length === 3);
  doc.querySelector('#wizBody input[name="wall_plan"][data-code="4SAME"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_mark"]').length >= 30; }, 2000);
  const marks = doc.querySelectorAll('#wizBody input[name="wall_mark"]').length;
  assert('4面同色柄 ≥ 30 个', marks >= 30, marks);
  doc.querySelector('#wizBody input[name="wall_mark"][data-wall-mark="EQA1D"]').click();  // アジャックス（プレミアム）G+31,800
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('3,159,800') >= 0; }, 2000);
  assert('选プレミアム柄后合计 = 3,159,800', doc.querySelector('#sumJPY').textContent.indexOf('3,159,800') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 正面アクセント × 周辺グレード ==');
  doc.querySelector('#wizBody input[name="wall_plan"][data-code="FRONT_ACCENT"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_mark"]').length >= 30; }, 2000);
  doc.querySelector('#wizBody input[name="wall_mark"][data-wall-mark="EQC1D"]').click();  // アジャックス（アクセント柄）
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_grade"]').length === 4; }, 2000);
  assert('周辺グレード 4 档', doc.querySelectorAll('#wizBody input[name="wall_grade"]').length === 4);
  doc.querySelector('#wizBody input[name="wall_grade"][data-wall-grade="hg2"]').click();  // 周辺 hg2：G ±0
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('3,128,000') >= 0; }, 2000);
  assert('FRONT premium柄 + 周辺 hg2 → 3,128,000（±0）', doc.querySelector('#sumJPY').textContent.indexOf('3,128,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== タイプ切换（D）联动套装价 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 5; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="D"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,832,200') >= 0 || doc.querySelector('#sumJPY').textContent.indexOf('1,758,000') >= 0; }, 2000);
  assert('切 D タイプ后合计联动（壁柄 hg2 D=+74,200 → 1,832,200）', doc.querySelector('#sumJPY').textContent.indexOf('1,832,200') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== multi 渲染（step 14） ==');
  doc.querySelector('#wizStepper .wstep[data-step="14"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="multi_opt_parts"]').length >= 15; }, 2000);
  assert('オプション単品 multi ≥ 15 项', doc.querySelectorAll('#wizBody input[name="multi_opt_parts"]').length >= 15, doc.querySelectorAll('#wizBody input[name="multi_opt_parts"]').length);
  const kda = doc.querySelector('#wizBody input[name="multi_opt_parts"][data-code="KDA02"]');
  kda.click();
  await waitFor(win, function () { return doc.querySelector('#sumOpt').textContent.indexOf('81,300') >= 0; }, 2000);
  assert('勾选タオル棚后选项合计 = 81,300（壁柄74,200+タオル棚7,100）', doc.querySelector('#sumOpt').textContent.indexOf('81,300') >= 0, doc.querySelector('#sumOpt').textContent);

  console.log('== 汇率 / 人民币（85折） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  assert('人民币合计已计算（非 —）', doc.querySelector('#sumRMB').textContent !== '—', doc.querySelector('#sumRMB').textContent);

  console.log('== 生成报价单 ==');
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 14 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 HLV', qtext.indexOf('HLV1616U') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单含已含安装人工费说明', qtext.indexOf('已含安装人工费') >= 0 || qtext.indexOf('据付人工費込み') >= 0);

  console.log('== 返回选型 + 语言切换 ==');
  doc.querySelector('#btnBack').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert('返回后向导显示', doc.querySelector('#view-wizard').classList.contains('active'));
  doc.querySelector('#langBar .lang-btn[data-lang="ja"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  const h3 = doc.querySelector('#wizBody .wiz-step-head h3');
  assert('日文模式步骤标题含日文', h3 && (h3.textContent.indexOf('オプション') >= 0 || h3.textContent.indexOf('ドア') >= 0 || h3.textContent.indexOf('サイズ') >= 0), h3 && h3.textContent);
  doc.querySelector('#langBar .lang-btn[data-lang="zh"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert('中文模式步骤标题为中文', /[\u4e00-\u9fff]/.test(doc.querySelector('#wizBody .wiz-step-head h3').textContent), doc.querySelector('#wizBody .wiz-step-head h3').textContent);

  console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
  dom.window.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('测试异常:', e); process.exit(1); });
