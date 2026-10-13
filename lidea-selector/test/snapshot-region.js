// snapshot-region.js — 区域（一般地/寒冷地）全量 contribution 快照，供合并前后 diff 复验
// 用法：
//   node test/snapshot-region.js > before.tsv        # 合并前留基线
//   node test/snapshot-region.js > after.tsv         # 合并后
//   diff before.tsv after.tsv                        # 逐格差异（一般地列应逐字节不变）
// stderr 每行给出该区域快照的 md5 与格数，便于一句话比对。
//   node test/snapshot-region.js --old <dir>        # 用 <dir> 里的 price.js/quote.js（旧版本）跑，做前后对比
// 覆盖：9 尺寸 × 4 タイプ × 全部维度选项（radio 单选 / multi 单勾）→ contribution + disabledReason
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const web = path.join(__dirname, '..');
const oldIdx = process.argv.indexOf('--old');
const jsDir = oldIdx >= 0 ? process.argv[oldIdx + 1] : path.join(web, 'js');
const ctx = { window: {}, console, Blob: function () {} };
vm.createContext(ctx);
[path.join(web, 'data/products.js'), path.join(jsDir, 'price.js'), path.join(jsDir, 'quote.js')].forEach(f => {
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
});
const Q = ctx.window.LIDEA.quote;
Q.init(ctx.window.LIDEA_DATA);

const TYPES = ['H', 'B', 'M', 'C'];
const SIZES = ['1216', '1316', '1318', '1616', '1618', '1620', '1624', 'S1818', 'S1216'];
function codesOf(d) { return Array.isArray(d.codes) ? d.codes.slice() : Q.catOpts(d).map(o => o.code); }

function run(region) {
  const lines = [];
  Q.reset();
  SIZES.forEach(sz => TYPES.forEach(tp => {
    Q.setSize(sz);
    Q.state.sel.type = tp;
    if (region === 'C') Q.state.sel.region = 'C'; else delete Q.state.sel.region;
    const t = Q.typeCode();
    lines.push(['base', region, t, sz, Q.basePrice()].join('\t'));
    Q.DIMS.forEach(d => {
      if (d.step === 0) return;
      codesOf(d).forEach(code => {
        if (d.kind === 'radio') Q.state.sel[d.id] = code;
        else { Q.state.multi[d.id] = {}; Q.state.multi[d.id][code] = true; }
        const v = Q.contributionFor(d.id);
        const dis = Q.disabledReason(d.id, code);
        lines.push([region, t, sz, d.id, code, v == null ? 'null' : v, dis == null ? '' : dis].join('\t'));
      });
    });
  }));
  return lines;
}

const hot = run('H');
const cold = run('C');
process.stdout.write(hot.concat(cold).join('\n') + '\n');
process.stderr.write('一般地( H ) md5=' + crypto.createHash('md5').update(hot.join('\n')).digest('hex') + ' 行=' + hot.length + '\n');
process.stderr.write('寒冷地( C ) md5=' + crypto.createHash('md5').update(cold.join('\n')).digest('hex') + ' 行=' + cold.length + '\n');