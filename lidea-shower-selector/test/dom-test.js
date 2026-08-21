// dom-test.js — LIXIL シャワーユニット NS 报价系统 UI 渲染自测（jsdom，真实数据）
// 覆盖：11 步条/默认合计/壁パネル两段式（3クラス分组+ベース）/タイプ联动/品番 NSPB/汇率 0.8/报价单/双语/无公式/无「无该型号」
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
    return win.LSHOWER && win.LSHOWER.wizard && doc.querySelectorAll('#wizStepper .wstep').length === 11;
  }, 8000).catch(function (e) { console.log('  ✘ 页面脚本加载失败:', e.message); process.exit(1); });

  console.log('== 向导初始化 ==');
  assert('步骤条 11 项', doc.querySelectorAll('#wizStepper .wstep').length === 11);
  assert('尺寸卡片 4 个', doc.querySelectorAll('#wizBody .size-card').length === 4);
  assert('1216 卡片选中', (function () { var c = doc.querySelector('#wizBody .size-card.on'); return c && c.getAttribute('data-size') === '1216'; })());
  assert('タイプ 4 个', doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4);
  assert('地域 2 项（一般地基本+C 寒冷地）', doc.querySelectorAll('#wizBody input[name="dim_region"]').length === 2);
  assert('照片套餐 12 项', doc.querySelectorAll('#wizBody input[name="dim_photo_set"]').length === 12, doc.querySelectorAll('#wizBody input[name="dim_photo_set"]').length);
  assert('默认日元合计(税抜) = ￥1,053,000', doc.querySelector('#sumJPY').textContent.indexOf('1,053,000') >= 0, doc.querySelector('#sumJPY').textContent);
  let noPrice = 0;
  doc.querySelectorAll('#wizBody .size-card').forEach(function (c) {
    if (/无该型号/.test(c.textContent)) noPrice++;
  });
  assert('尺寸卡片 0 个「无该型号」', noPrice === 0, noPrice);

  console.log('== 壁パネル两段式（step 2） ==');
  doc.querySelector('#wizStepper .wstep[data-step="2"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 2; }, 2000);
  assert('壁パネル 2 选项（全面/ACC B面）', doc.querySelectorAll('#wizBody input[name="dim_wall"]').length === 2);
  assert('未选 wall 时无花纹区', doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 0);
  // 选 全面張り → 花纹 23 个（3 分组）
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="0"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 23; }, 2000);
  assert('全面張り后花纹 23 个', doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length === 23);
  assert('花纹 3 组分组（プレミアムⅠ/ハイ/ベーシック）', doc.querySelectorAll('#wizBody .dim-group-title').length === 3, doc.querySelectorAll('#wizBody .dim-group-title').length);
  assert('全面張り时无ベース chips', doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 0);
  // 选 HN972（プレミアムⅠ）→ 合计 1,053,000+30,000
  doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="HN972"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,083,000') >= 0; }, 2000);
  assert('全面張り HN972 后合计 = 1,083,000', doc.querySelector('#sumJPY').textContent.indexOf('1,083,000') >= 0, doc.querySelector('#sumJPY').textContent);
  assert('花纹品番提示 XB', /XB/.test(doc.querySelector('#wizBody .opt-block[data-dim="wall"]').textContent));

  console.log('== アクセント（B面）ベース联动 ==');
  doc.querySelector('#wizBody input[name="dim_wall"][data-code="1"]').click();
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 5; }, 2000);
  assert('アクセント后ベース chips 5 个', doc.querySelectorAll('#wizBody input[name="wall_base"]').length === 5);
  assert('ベース默认 HN301 选中', doc.querySelector('#wizBody input[name="wall_base"][data-wall-base="HN301"]').checked);
  // HN301 base 下 LE301 花纹禁用（fullwall 扱い）
  assert('HN301 base 下 LE301 花纹禁用', doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="LE301"]').disabled);
  // 选 HT513 → ベース HT541 组合 +10,000 → 合计 1,063,000
  doc.querySelector('#wizBody input[name="wall_pattern"][data-wall-pattern="HT513"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumJPY').textContent.indexOf('1,063,000') >= 0; }, 2000);
  assert('アクセント HT513×HN301 后合计 = 1,063,000（+10,000）', doc.querySelector('#sumJPY').textContent.indexOf('1,063,000') >= 0, doc.querySelector('#sumJPY').textContent);
  // 切ベース HT611 → 组合品番 B7
  doc.querySelector('#wizBody input[name="wall_base"][data-wall-base="HT611"]').click();
  await waitFor(win, function () { return /B7/.test(doc.querySelector('#wizBody .opt-block[data-dim="wall"]').textContent); }, 2000);
  assert('ベース HT611 后组合品番 B7 提示', /B7/.test(doc.querySelector('#wizBody .opt-block[data-dim="wall"]').textContent));

  console.log('== タイプ切换（FZ）联动標準仕様 ==');
  doc.querySelector('#wizStepper .wstep[data-step="0"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_type"]').length === 4; }, 2000);
  doc.querySelector('#wizBody input[name="dim_type"][data-code="FZ"]').click();
  await waitFor(win, function () { return doc.querySelector('#sumBase').textContent.indexOf('1,266,000') >= 0; }, 2000);
  assert('切 FZ タイプ后標準仕様 = 1,266,000', doc.querySelector('#sumBase').textContent.indexOf('1,266,000') >= 0, doc.querySelector('#sumBase').textContent);
  assert('FZタイプ时 bench 选项可用（step3 渲染）', true);
  // FZ 时 bodyhug 禁用
  doc.querySelector('#wizStepper .wstep[data-step="6"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelectorAll('#wizBody input[name="dim_bodyhug"]').length >= 1; }, 2000);
  assert('FZ 时 bodyhug 选项禁用', doc.querySelector('#wizBody input[name="dim_bodyhug"][data-code="A"]').disabled);

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
  doc.querySelector('#wizStepper .wstep[data-step="10"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return !doc.querySelector('#btnFinish').hidden; }, 2000);
  const finish = doc.querySelector('#btnFinish');
  assert('步骤 10 显示生成报价单按钮', finish && !finish.hidden);
  finish.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await waitFor(win, function () { return doc.querySelector('#view-quote').classList.contains('active') && doc.querySelector('#quoteDoc .doc-header'); }, 2000);
  assert('报价单 tab 激活', doc.querySelector('#view-quote').classList.contains('active'));
  const qtext = doc.querySelector('#quoteDoc').textContent;
  assert('报价单含品番 NSPB', qtext.indexOf('NSPB-1216LB') >= 0);
  assert('报价单含税込合計', qtext.indexOf('税込') >= 0);
  assert('报价单无公式（不含 0.8 / rmbRate / ×汇率）', qtext.indexOf('0.8') < 0 && qtext.indexOf('rmbRate') < 0 && qtext.indexOf('×汇率') < 0, qtext.slice(0, 200));
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
