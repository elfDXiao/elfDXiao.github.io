// dom-test.js — TOTO Sazana 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：15 步条/尺寸 10/默认合计/壁柄联动/タイプ联动/multi/汇率 0.7/报价单/双语/无公式检查
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
    return win.SAZANA && win.SAZANA.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 15;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 15 项', doc.querySelectorAll('#wizStepper .wstep').length === 15);
  assert('尺寸卡片 10 个', doc.querySelectorAll('#wizBody .size-card').length === 10);
  assert('1620 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1620'; })());
  assert('タイプ 5 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 5);
  assert('默认日元合计(税抜) = ￥1,449,000', doc.querySelector('#sumJPY').textContent.indexOf('1,449,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 壁柄联动（step 2） ==');
  doc.querySelector('#wizStepper .wstep[data-step="2"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 14; }, 2000);
  assert('壁柄 14 选项', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 14);
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="EGAA1"]').click();  // T タイプ +126,000
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,575,000') >= 0; }, 2000);
  assert('选 EGAA1 后合计 = 1,575,000', doc.querySelector('#sumJPY').textContent.indexOf('1,575,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== タイプ切换（P）联动本体价 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 5; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="P"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,741,000') >= 0; }, 2000);
  assert('切 P タイプ后合计 1,636,000+105,000 = 1,741,000', doc.querySelector('#sumJPY').textContent.indexOf('1,741,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== multi 渲染（step 6 便利アイテム） ==');
  doc.querySelector('#wizStepper .wstep[data-step="6"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="multi_clean_other"]').length >= 4; }, 2000);
  assert('便利アイテム multi ≥ 4 项', doc.querySelectorAll('#wizBody input[name="multi_clean_other"]').length >= 4);
  doc.querySelector('#wizBody input[name="multi_clean_other"][data-code="YFS32"]').click();  // おそうじ浴槽
  await waitFor(win, function () { return doc.querySelector('#sumOpt').textContent.indexOf('294,700') >= 0; }, 2000);
  assert('勾选おそうじ浴槽后选项合计 = 294,700（壁105,000+浴槽189,700）', doc.querySelector('#sumOpt').textContent.indexOf('294,700') >= 0, doc.querySelector('#sumOpt').textContent);

  console.log('== 汇率 / 人民币（0.7 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  const rmbTxt = doc.querySelector('#sumRMB').textContent;
  assert('人民币合计已计算（非 —）', rmbTxt !== '—', rmbTxt);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.7') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  doc.querySelector('#wizStepper .wstep[data-step="14"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return !doc.querySelector('#btnFinish').hidden; }, 2000);
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 14 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 HTV1620UP', qtext.indexOf('HTV1620UP') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.7 / 7折 / ×汇率）', qtext.indexOf('0.7') < 0 && qtext.indexOf('7折') < 0 && qtext.indexOf('×汇率') < 0 && qtext.indexOf('×為替') < 0, qtext.slice(0, 200));
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
