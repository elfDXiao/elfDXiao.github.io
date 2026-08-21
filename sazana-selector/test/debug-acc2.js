// debug-sazana-acc2.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {}, console }; vm.createContext(ctx);
['data/products.js', 'js/price.js', 'js/quote.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join('D:/DSH工作区/toto-sazana/web', f), 'utf8'), ctx));
const Q = ctx.window.SAZANA.quote; Q.init(ctx.window.SAZANA_DATA);
Q.state.sel.type = 'P';
Q.state.sel.wall = 'ACC_PRE';
Q.state.sub.wall_surround = '周辺ハイグレードⅡ';
const o = Q.opt('wall', 'ACC_PRE');
console.log('opt ACC_PRE: ' + !!o);
console.log('priceBySurround: ' + JSON.stringify(o.priceBySurround));
console.log('sub.wall_surround: ' + Q.state.sub.wall_surround);
console.log('wallCode: ' + Q.state.sel.wall);
// 手动执行 wallContribution 逻辑
const sg = Q.state.sub.wall_surround;
const v = o.priceBySurround[sg];
console.log('v: ' + v);
console.log('contributionFor: ' + Q.contributionFor('wall'));
