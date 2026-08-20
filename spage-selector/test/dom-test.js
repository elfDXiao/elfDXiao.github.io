// dom-test.js — LIXIL SPAGE 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：16 步条/尺寸 11/install U/M/默认合计/壁パネル联动/install 切换/汇率 0.75/报价单/双语/无公式检查
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
    return win.SPAGE && win.SPAGE.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 16;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 16 项', doc.querySelectorAll('#wizStepper .wstep').length === 16);
  assert('尺寸卡片 11 个', doc.querySelectorAll('#wizBody .size-card').length === 11);
  assert('1620 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1620'; })());
  assert('タイプ 5 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 5);
  assert('設置 2 项（U 基本+M）', doc.querySelectorAll('#wizBody input[name="dim_install"]').length === 2, doc.querySelectorAll('#wizBody input[name="dim_install"]').length);
  assert('默认日元合计(税抜) = ￥3,377,000', doc.querySelector('#sumJPY').textContent.indexOf('3,377,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 壁パネル联动（step 2） ==');
  doc.querySelector('#wizStepper .wstep[data-step="2"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 16; }, 2000);
  assert('壁パネル 16 选项', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 16);
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="PALL"]').click();  // アーテクトP
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('3,617,000') >= 0; }, 2000);
  assert('选 PALL 后合计 = 3,617,000（3,377,000+240,000）', doc.querySelector('#sumJPY').textContent.indexOf('3,617,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== install 切换（マンション M）联动 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_install"]').length === 2; }, 2000);
  doc.querySelector('#wizBody input[name="dim_install"][data-code="M"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('3,687,000') >= 0; }, 2000);
  assert('切マンション后合计 3,447,000+240,000 = 3,687,000', doc.querySelector('#sumJPY').textContent.indexOf('3,687,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== multi 渲染（step 15 浴室テレビ） ==');
  doc.querySelector('#wizStepper .wstep[data-step="15"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="multi_bathroom_tv"]').length >= 2; }, 2000);
  assert('浴室テレビ multi ≥ 2 项', doc.querySelectorAll('#wizBody input[name="multi_bathroom_tv"]').length >= 2);
  doc.querySelector('#wizBody input[name="multi_bathroom_tv"][data-code="K56"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumOpt').textContent.indexOf('574,000') >= 0; }, 2000);
  assert('勾选浴室テレビ后选项合计 = 574,000（壁240,000+TV334,000）', doc.querySelector('#sumOpt').textContent.indexOf('574,000') >= 0, doc.querySelector('#sumOpt').textContent);

  console.log('== 汇率 / 人民币（0.75 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  const rmbTxt = doc.querySelector('#sumRMB').textContent;
  assert('人民币合计已计算（非 —）', rmbTxt !== '—', rmbTxt);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.75') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 15 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 BAMW-1620P', qtext.indexOf('BAMW-1620P') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.75 / 7折 / ×汇率）', qtext.indexOf('0.75') < 0 && qtext.indexOf('7折') < 0 && qtext.indexOf('×汇率') < 0 && qtext.indexOf('×為替') < 0, qtext.slice(0, 200));
  assert('报价单含安装费描述', qtext.indexOf('安装人工费') >= 0 || qtext.indexOf('据付人工費') >= 0);

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
