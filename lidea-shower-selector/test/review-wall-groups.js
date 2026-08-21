// reviewer t24: verify wall class groups (dim-group-title)
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM } = require('D:/DSH工作区/rakuviac-bathroom/scripts/node_modules/jsdom');
const ROOT = 'D:/DSH工作区/lidea-shower/web';
const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), { runScripts: 'outside-only', url: 'file:///D:/DSH工作区/lidea-shower/web/index.html' });
const { window } = dom, { document } = window;
['data/products.js', 'js/price.js', 'js/quote.js', 'js/wizard.js'].forEach(f => window.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
window.LSHOWER.wizard.init(window.LSHOWER_DATA);
document.querySelector('#wizStepper .wstep[data-step="2"]').click();
const radios = Array.from(document.querySelectorAll('#wizBody input[type="radio"]'));
radios[0].checked = true;
radios[0].dispatchEvent(new window.Event('change', { bubbles: true }));
const titles = Array.from(document.querySelectorAll('#wizBody .dim-group-title')).map(e => e.textContent.replace(/\s+/g, ' ').trim());
console.log('分组标题:', JSON.stringify(titles));
const patternCards = document.querySelectorAll('#wizBody .opt-card.small').length;
console.log('花纹卡片数:', patternCards);
console.log('分组标题 >= 2:', titles.length >= 2, '| 花纹 >= 13:', patternCards >= 13);
const wallText = document.querySelector('#wizBody').textContent;
console.log('无「无该型号」:', !wallText.includes('无该型号'));
dom.window.close();



