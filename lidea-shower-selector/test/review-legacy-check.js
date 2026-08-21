// reviewer t24: jsdom verify size cards (1115 detail) + wall two-stage rendering v3
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM } = require('D:/DSH工作区/rakuviac-bathroom/scripts/node_modules/jsdom');
const ROOT = 'D:/DSH工作区/lidea-shower/web';
const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), { runScripts: 'outside-only', url: 'file:///D:/DSH工作区/lidea-shower/web/index.html' });
const { window } = dom, { document } = window;
['data/products.js', 'js/price.js', 'js/quote.js', 'js/wizard.js'].forEach(f => window.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
window.LSHOWER.wizard.init(window.LSHOWER_DATA);

let fails = 0;
function check(name, cond, extra) {
  console.log((cond ? '  ✔ ' : '  ✘ FAIL ') + name + (extra != null ? ' → ' + JSON.stringify(extra) : ''));
  if (!cond) fails++;
}

console.log('== 1115 卡片内容细查 ==');
const sizeCards = Array.from(document.querySelectorAll('#wizBody [data-size]'));
sizeCards.forEach(c => {
  console.log('  [data-size=' + c.getAttribute('data-size') + '] text:', c.textContent.replace(/\s+/g, ' ').slice(0, 90));
});

console.log('== 壁柄两段式（step3 → 选 wall → 花纹） ==');
document.querySelector('#wizStepper .wstep[data-step="2"]').click();
const wallRadios = Array.from(document.querySelectorAll('#wizBody input[type="radio"]'));
wallRadios.forEach(r => console.log('  wall radio:', r.name, '=', r.value));
// select first wall radio (全面張り)
if (wallRadios.length) {
  wallRadios[0].checked = true;
  wallRadios[0].dispatchEvent(new window.Event('change', { bubbles: true }));
}
// after change, re-render shows pattern stage
const afterText = document.querySelector('#wizBody').textContent;
console.log('  选择后文本片段:', afterText.slice(0, 150).replace(/\s+/g, ' '));
const patternOpts = document.querySelectorAll('#wizBody input[type="radio"]').length;
console.log('  选择后 radio 数:', patternOpts);
const hasPattern = /HN\d{3}|LE\d{3}|花纹|柄/.test(afterText);
check('选择 wall 后出现花纹/柄选项', hasPattern, afterText.slice(0, 120));
const groupTitles = document.querySelectorAll('#wizBody .opt-group-title, #wizBody .group-title, #wizBody h5, #wizBody h6').length;
const strong = document.querySelectorAll('#wizBody strong').length;
check('分组标题存在（クラス分组显示）', groupTitles + strong >= 1, groupTitles + strong);

console.log('\n' + (fails === 0 ? '✅ 通过' : '❌ ' + fails + ' 项失败'));
dom.window.close();
process.exit(fails === 0 ? 0 : 1);



