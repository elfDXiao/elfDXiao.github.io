// dom-test.js — Panasonic オフローラ（Oflora）报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：14 步条/默认合计/プラン×サイズ联动/壁柄分组/汇率 0.65/报价单/双语/无公式/无「无该型号」
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
    return win.OFLORA && win.OFLORA.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 14;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 14 项', doc.querySelectorAll('#wizStepper .wstep').length === 14);
  assert('プラン 4 个（step0）', doc.querySelectorAll('#wizBody input[name="dim_plan"]').length === 4, doc.querySelectorAll('#wizBody input[name="dim_plan"]').length);
  assert('尺寸卡片 6 个', doc.querySelectorAll('#wizBody .size-card').length === 6);
  assert('1616 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1616'; })());
  assert('照片套餐 2 项', doc.querySelectorAll('#wizBody input[name="dim_photo_set"]').length === 2);
  assert('默认日元合计(税抜) = ￥1,273,250', doc.querySelector('#sumJPY').textContent.indexOf('1,273,250') >= 0, doc.querySelector('#sumJPY').textContent);
  let noPrice = 0;
  doc.querySelectorAll('#wizBody .size-card').forEach(function (c) {
    if (/无该型号/.test(c.textContent)) noPrice++;
  });
  assert('尺寸卡片 0 个「无该型号」', noPrice === 0, noPrice);

  console.log('== プラン切换（MODERN）联动套装价 ==');
  doc.querySelector('#wizBody input[name="dim_plan"][data-code="MODERN_STYLE"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,458,600') >= 0; }, 2000);
  assert('切 MODERN 后合计 = 1,458,600', doc.querySelector('#sumJPY').textContent.indexOf('1,458,600') >= 0, doc.querySelector('#sumJPY').textContent);
  doc.querySelector('#wizBody input[name="dim_plan"][data-code="BASE"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,273,250') >= 0; }, 2000);
  assert('切回 BASE 后合计 = 1,273,250', doc.querySelector('#sumJPY').textContent.indexOf('1,273,250') >= 0);

  console.log('== 壁柄两段式（step 7，默认跳色模式） ==');
  doc.querySelector('#wizStepper .wstep[data-step="7"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall_pattern"]').length === 26; }, 2000);
  assert('跳色模式壁柄 26 项（B 24 + DA/DB 2）', doc.querySelectorAll('#wizBody input[name="dim_wall_pattern"]').length === 26);
  assert('周囲面板柄 chips 2（DC/DD）', doc.querySelectorAll('#wizBody input[name="wall_surround"]').length === 2, doc.querySelectorAll('#wizBody input[name="wall_surround"]').length);
  assert('两段式分组标题 ≥ 3（跳色柄/周囲）', doc.querySelectorAll('#wizBody .opt-block[data-dim="wall_pattern"] .dim-group-title').length >= 3, doc.querySelectorAll('#wizBody .opt-block[data-dim="wall_pattern"] .dim-group-title').length);
  // 选跳色柄 DA（D 级アクセント）→ -29,150 → 合计 1,244,100
  doc.querySelector('#wizBody input[name="dim_wall_pattern"][data-code="DA"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,244,100') >= 0; }, 2000);
  assert('选跳色柄 DA 后合计 = 1,244,100（-29,150）', doc.querySelector('#sumJPY').textContent.indexOf('1,244,100') >= 0, doc.querySelector('#sumJPY').textContent);
  // 选周囲 DC（无差价）
  doc.querySelector('#wizBody input[name="wall_surround"][data-wall-surround="DC"]').click();
  await waitFor(win, function () { return doc.querySelector('#wizBody').textContent.indexOf('周囲') >= 0; }, 2000);
  assert('选周囲 DC 后合计不变 1,244,100', doc.querySelector('#sumJPY').textContent.indexOf('1,244,100') >= 0, doc.querySelector('#sumJPY').textContent);

  console.log('== 浴槽联动（step 5） ==');
  doc.querySelector('#wizStepper .wstep[data-step="5"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_bathtub_material"]').length === 10; }, 2000);
  assert('浴槽材质 10 项', doc.querySelectorAll('#wizBody input[name="dim_bathtub_material"]').length === 10);
  // 切尺寸 1316 → アクアマーブル禁用
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody .size-card').length === 6; }, 2000);
  doc.querySelector('#wizBody .size-card[data-size="1316"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await sleep(300);
  doc.querySelector('#wizStepper .wstep[data-step="5"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_bathtub_material"]').length === 10; }, 2000);
  const c1 = doc.querySelector('#wizBody input[name="dim_bathtub_material"][data-code="C1"]');
  assert('1316 时アクアマーブル C1 禁用', c1 && c1.disabled);
  // 切回 1616
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody .size-card').length === 6; }, 2000);
  doc.querySelector('#wizBody .size-card[data-size="1616"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await sleep(300);

  console.log('== 汇率 / 人民币（0.65 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  const rmbTxt = doc.querySelector('#sumRMB').textContent;
  assert('人民币合计已计算（非 —）', rmbTxt !== '—', rmbTxt);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.65') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  doc.querySelector('#wizStepper .wstep[data-step="13"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return !doc.querySelector('#btnFinish').hidden; }, 2000);
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 13 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 BGF51', qtext.indexOf('BGF51') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.65 / rmbRate / ×汇率）', qtext.indexOf('0.65') < 0 && qtext.indexOf('rmbRate') < 0 && qtext.indexOf('×汇率') < 0, qtext.slice(0, 200));
  assert('报价单含安装费描述', qtext.indexOf('安装人工费') >= 0 || qtext.indexOf('据付人工費') >= 0);

  console.log('== 返回选型 + 语言切换 ==');
  doc.querySelector('#btnBack').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert('返回后向导显示', doc.querySelector('#view-wizard').classList.contains('active'));
  doc.querySelector('#langBar .lang-btn[data-lang="ja"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  const h3 = doc.querySelector('#wizBody .wiz-step-head h3');
  assert('日文模式步骤标题含日文', h3 && /[\u3040-\u30ff]/.test(h3.textContent), h3 && h3.textContent);
  doc.querySelector('#langBar .lang-btn[data-lang="zh"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert('中文模式步骤标题为中文', /[\u4e00-\u9fff]/.test(doc.querySelector('#wizBody .wiz-step-head h3').textContent), doc.querySelector('#wizBody .wiz-step-head h3').textContent);

  console.log('\n' + (fails === 0 ? '✅ 全部通过' : '❌ ' + fails + ' 项失败'));
  dom.window.close();
  process.exit(fails === 0 ? 0 : 1);

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
})().catch(function (e) { console.error('测试异常:', e); process.exit(1); });
