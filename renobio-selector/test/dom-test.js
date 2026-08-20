// dom-test.js — LIXIL Renobio Fit 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：15 步条/默认合计/壁パネル两段式（ベース+花纹）/タイプ联动/品番/汇率 0.8/报价单/双语/无公式检查/无「无该型号」
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
    return win.RENOBIO && win.RENOBIO.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 15;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 15 项', doc.querySelectorAll('#wizStepper .wstep').length === 15);
  assert('尺寸卡片 4 个', doc.querySelectorAll('#wizBody .size-card').length === 4);
  assert('1216 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1216'; })());
  assert('タイプ 4 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4);
  assert('地域 2 项（一般地基本+C 寒冷地）', doc.querySelectorAll('#wizBody input[name="dim_region"]').length === 2, doc.querySelectorAll('#wizBody input[name="dim_region"]').length);
  assert('照片套餐 6 项', doc.querySelectorAll('#wizBody input[name="dim_photo_set"]').length === 6, doc.querySelectorAll('#wizBody input[name="dim_photo_set"]').length);
  assert('默认日元合计(税抜) = ￥841,500', doc.querySelector('#sumJPY').textContent.indexOf('841,500') >= 0, doc.querySelector('#sumJPY').textContent);
  // 无「无该型号」：所有尺寸卡片显示价格
  let noPrice = 0;
  doc.querySelectorAll('#wizBody .size-card').forEach(function (c) {
    if (/无该型号/.test(c.textContent)) noPrice++;
  });
  assert('尺寸卡片 0 个「无该型号」', noPrice === 0, noPrice);

  console.log('== 壁パネル两段式（step 3） ==');
  doc.querySelector('#wizStepper .wstep[data-step="3"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 3; }, 2000);
  assert('壁パネル 3 选项（全面/ACC B/ACC C）', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 3);
  assert('未选 wall 时无花纹区', doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 0);
  // 选 全面張り → 花纹 13 出现
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="0"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 13; }, 2000);
  assert('全面張り后花纹 13 个', doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 13, doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length);
  assert('全面張り时无ベース chips', doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 0);
  // HN662（全面張り不可）禁用
  assert('HN662 花纹禁用', doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="HN662"]').disabled);
  // 选 HN987 → 合计 841,500+70,000
  doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="HN987"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('911,500') >= 0; }, 2000);
  assert('全面張り HN987 后合计 = 911,500', doc.querySelector('#sumJPY').textContent.indexOf('911,500') >= 0, doc.querySelector('#sumJPY').textContent);
  assert('花纹品番提示 H2', /H2/.test(doc.querySelector('#wizBody .opt-block[data-dim="wall"]').textContent));

  console.log('== アクセント（B面）ベース联动 ==');
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="1"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 3; }, 2000);
  assert('アクセント后ベース chips 3 个', doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 3);
  assert('ベース默认 LE301 选中', doc.querySelector('#wizBody input[name="wall_base"][data-wall-base="LE301"]').checked);
  // LE301 base 下：LE301 花纹自身禁用（fullwall）
  assert('LE301 base 下 LE301 花纹禁用', doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="LE301"]').disabled);
  // 选 HN951 → +10,000 → 合计 851,500
  doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="HN951"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('851,500') >= 0; }, 2000);
  assert('アクセント LE301 HN951 后合计 = 851,500', doc.querySelector('#sumJPY').textContent.indexOf('851,500') >= 0, doc.querySelector('#sumJPY').textContent);
  // 切ベース HN986 → 哈伊クラス +70,000 → 合计 911,500
  doc.querySelector('#wizBody input[name="wall_base"][data-wall-base="HN986"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('911,500') >= 0; }, 2000);
  assert('ベース HN986 后合计 = 911,500（+70,000）', doc.querySelector('#sumJPY').textContent.indexOf('911,500') >= 0, doc.querySelector('#sumJPY').textContent);
  assert('组合品番 L2 提示', /L2/.test(doc.querySelector('#wizBody .opt-block[data-dim="wall"]').textContent));

  console.log('== タイプ切换（B）联动標準仕様与品番 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="B"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumBase').textContent.indexOf('838,500') >= 0; }, 2000);
  assert('切 B タイプ后標準仕様 = 838,500', doc.querySelector('#sumBase').textContent.indexOf('838,500') >= 0, doc.querySelector('#sumBase').textContent);
  assert('Bタイプ时 counter 选项禁用', doc.querySelector('#wizBody input[name="dim_counter"]') ? doc.querySelector('#wizBody input[name="dim_counter"]').disabled : true);

  console.log('== 汇率 / 人民币（0.8 计价，页面无公式） ==');
  const rate = doc.querySelector('#rate');
  rate.value = '0.05';
  rate.dispatchEvent(new win.Event('input', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#sumRMB').textContent !== '—'; }, 2000);
  const rmbTxt = doc.querySelector('#sumRMB').textContent;
  assert('人民币合计已计算（非 —）', rmbTxt !== '—', rmbTxt);
  const rateHint = doc.querySelector('.rate-hint').textContent;
  assert('rate-hint 无公式（仅含安装费描述）', rateHint.indexOf('安装') >= 0 && rateHint.indexOf('0.8') < 0 && rateHint.indexOf('×') < 0, rateHint);

  console.log('== 生成报价单 ==');
  doc.querySelector('#wizStepper .wstep[data-step="14"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return !doc.querySelector('#btnFinish').hidden; }, 2000);
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 14 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 BKS/BLKS', qtext.indexOf('BLKS-1216LBB-B+H(C)RL') >= 0 || qtext.indexOf('BKS-') >= 0, qtext.slice(0, 120));
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.8 / rmbRate / 汇率算式）', qtext.indexOf('0.8') < 0 && qtext.indexOf('rmbRate') < 0 && qtext.indexOf('×汇率') < 0, qtext.slice(0, 200));
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
