// dom-test.js — LIXIL Lidea 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：16 步条/默认合计/壁パネル联动/タイプ联动/条件键/multi/汇率 0.7/报价单/双语/无公式检查
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
    return win.LIDEA && win.LIDEA.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 16;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 16 项', doc.querySelectorAll('#wizStepper .wstep').length === 16);
  assert('尺寸卡片 9 个', doc.querySelectorAll('#wizBody .size-card').length === 9);
  assert('1616 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1616'; })());
  assert('タイプ 4 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4);
  assert('地域 2 项（一般地基本+C 寒冷地）', doc.querySelectorAll('#wizBody input[name="dim_region"]').length === 2, doc.querySelectorAll('#wizBody input[name="dim_region"]').length);
  assert('默认日元合计(税抜) = ￥1,379,000', doc.querySelector('#sumJPY').textContent.indexOf('1,379,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 壁パネル联动（step 2） ==');
  doc.querySelector('#wizStepper .wstep[data-step="2"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 11; }, 2000);
  assert('壁パネル 11 选项', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 11);
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="W0"]').click();  // 全面張り プレミアムⅡ +130,000
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,509,000') >= 0; }, 2000);
  assert('选 W0 后合计 = 1,509,000', doc.querySelector('#sumJPY').textContent.indexOf('1,509,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== タイプ切换（H）联动標準仕様 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="H"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,812,000') >= 0; }, 2000);
  assert('切 H タイプ后合计 1,682,000+130,000 = 1,812,000', doc.querySelector('#sumJPY').textContent.indexOf('1,812,000') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 条件键联动（水栓→シャワー） ==');
  doc.querySelector('#wizStepper .wstep[data-step="9"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_faucet"]').length >= 9; }, 2000);
  assert('水栓选项 ≥ 9', doc.querySelectorAll('#wizBody input[name="dim_faucet"]').length >= 9);
  doc.querySelector('#wizBody input[name="dim_faucet"][data-code="H3"]').click();  // シャワーシステム
  doc.querySelector('#wizStepper .wstep[data-step="10"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_shower_head"]').length >= 17; }, 2000);
  assert('シャワーヘッド ≥ 17 选项', doc.querySelectorAll('#wizBody input[name="dim_shower_head"]').length >= 17);

  console.log('== multi 渲染（step 13 追加マグネット） ==');
  doc.querySelector('#wizStepper .wstep[data-step="13"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="multi_magnet"]').length >= 25; }, 2000);
  assert('追加マグネット multi ≥ 25 项', doc.querySelectorAll('#wizBody input[name="multi_magnet"]').length >= 25);
  doc.querySelector('#wizBody input[name="multi_magnet"][data-code="A70"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumOpt').textContent.indexOf('297,900') >= 0; }, 2000);
  assert('勾选 A70 后选项合计 = 297,900（W0 130,000+H3 151,000+A70 16,900）', doc.querySelector('#sumOpt').textContent.indexOf('297,900') >= 0, doc.querySelector('#sumOpt').textContent);

  console.log('== 汇率 / 人民币（0.65 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  const rmbTxt = doc.querySelector('#sumRMB').textContent;
  assert('人民币合计已计算（非 —）', rmbTxt !== '—', rmbTxt);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.7') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  doc.querySelector('#wizStepper .wstep[data-step="15"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return !doc.querySelector('#btnFinish').hidden; }, 2000);
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 15 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 BDU', qtext.indexOf('BDUS-1616') >= 0 || qtext.indexOf('BDU') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.7 / ×汇率）', qtext.indexOf('0.7') < 0 && qtext.indexOf('×') < 0 && qtext.indexOf('汇率') < 0, qtext.slice(0, 200));
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
