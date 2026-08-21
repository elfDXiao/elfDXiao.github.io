// inspect-sazana-wall.js
const fs = require('fs'), vm = require('vm');
const code = fs.readFileSync('D:/DSH工作区/toto-sazana/web/data/products.js', 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(code, ctx);
const j = ctx.window.SAZANA_DATA;
const wall = j.categories.find(c => c.id === 'wall');
console.log('wall options: ' + wall.options.length);
wall.options.forEach(o => {
  console.log(o.code + ' | ' + (o.name_ja || '').slice(0, 30) + ' | fourSame=' + o.fourSame + ' | priceBySurround=' + (o.priceBySurround ? 'Y' : '-'));
});
