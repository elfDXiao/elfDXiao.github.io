// debug-sazana-acc.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {}, console }; vm.createContext(ctx);
['data/products.js', 'js/price.js', 'js/quote.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join('D:/DSH工作区/toto-sazana/web', f), 'utf8'), ctx));
const Q = ctx.window.SAZANA.quote; Q.init(ctx.window.SAZANA_DATA);
console.log('wall options: ' + Q.cat('wall').options.length);
Q.state.sel.type = 'P';
Q.state.sel.wall = 'ACC_PRE';
Q.state.sub.wall_surround = '周辺ハイグレードⅡ';
console.log('P ACC_PRE × 周辺HⅡ: ' + Q.contributionFor('wall') + '（预期 73500）');
Q.state.sel.type = 'T';
console.log('T ACC_PRE × 周辺HⅡ: ' + Q.contributionFor('wall') + '（预期 94500）');
Q.state.sel.wall = 'ACC_BASIC';
Q.state.sub.wall_surround = '周辺ベーシックグレード';
Q.state.sel.type = 'P';
console.log('P ACC_BASIC × 周辺BASIC: ' + Q.contributionFor('wall') + '（预期 -21000）');
// describe
Q.state.sel.type = 'T';
Q.state.sel.wall = 'ACC_PRE';
Q.state.sub.wall_pattern = 'EG2J1';
Q.state.sub.wall_surround = '周辺ベーシックグレード';
const d = Q.describe('wall');
console.log('describe: nameJa=' + d.nameJa + ' model=' + d.model);
