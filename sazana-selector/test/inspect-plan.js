// inspect-sazana-plan.js
const fs = require('fs'), vm = require('vm');
const code = fs.readFileSync('E:/自媒体账号阶段性成活/个人主页管理/toto-sazana/web/data/products.js', 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(code, ctx);
const j = ctx.window.SAZANA_DATA;
const wall = j.categories.find(c => c.id === 'wall');
['4SAME', 'FRONT_ACCENT', 'SIDE_ACCENT', 'ACC_PRE', 'SHUHEN_H2'].forEach(c => {
  const o = wall.options.find(x => x.code === c);
  console.log('=== ' + c + ' ===');
  console.log(JSON.stringify(o, null, 1).slice(0, 1200));
});
