// dom-test.js — TOTO シャワールーム 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：12 步条/默认合计/壁柄联动/タイプ联动/multi/汇率 0.8 计价/报价单/双语/无公式检查
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
    return win.SHOWER && win.SHOWER.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 12;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 12 项', doc.querySelectorAll('#wizStepper .wstep').length === 12);
  assert('尺寸卡片 3 个', doc.querySelectorAll('#wizBody .size-card').length === 3);
  assert('0816 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '0816'; })());
  assert('タイプ 4 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4);
  assert('默认日元合计(税抜) = ￥1,132,000', doc.querySelector('#sumJPY').textContent.indexOf('1,132,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 壁柄选择联动（step 1） ==');
  doc.querySelector('#wizStepper .wstep[data-step="1"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 14; }, 2000);
  assert('壁柄 14 选项', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 14);
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="EVAQ7"]').click();  // プレミアム GXT +32,100
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,164,100') >= 0; }, 2000);
  assert('选 EVAQ7 后合计 = 1,164,100', doc.querySelector('#sumJPY').textContent.indexOf('1,164,100') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== タイプ切换（X）联动套装价 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="X"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('938,100') >= 0; }, 2000);
  assert('切 X タイプ后合计 906,000+32,100 = 938,100', doc.querySelector('#sumJPY').textContent.indexOf('938,100') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== multi 渲染（step 11 付加オプション） ==');
  doc.querySelector('#wizStepper .wstep[data-step="11"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="multi_options"]').length >= 4; }, 2000);
  assert('付加オプション multi ≥ 4 项', doc.querySelectorAll('#wizBody input[name="multi_options"]').length >= 4);
  doc.querySelector('#wizBody input[name="multi_options"][data-code="KCA11"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumOpt').textContent.indexOf('42,600') >= 0; }, 2000);
  assert('勾选非常コール后选项合计 = 42,600（壁柄32,100+非常コール10,500）', doc.querySelector('#sumOpt').textContent.indexOf('42,600') >= 0, doc.querySelector('#sumOpt').textContent);

  console.log('== 汇率 / 人民币（0.8 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent.indexOf('41,738') >= 0; }, 2000);
  assert('rate=0.05 → 人民币合计 = ¥41,738（税込1,043,460×0.05×0.8）', doc.querySelector('#sumRMB').textContent.indexOf('41,738') >= 0, doc.querySelector('#sumRMB').textContent);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.8') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 11 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 JSV0816UXW6', qtext.indexOf('JSV0816UXW6') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.8 / ×汇率）', qtext.indexOf('0.8') < 0 && qtext.indexOf('×') < 0 && qtext.indexOf('汇率') < 0, qtext.slice(0, 200));
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
