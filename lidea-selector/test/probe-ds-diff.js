// probe-ds-diff.js — replica of DS's diff scan: all options × 4 types × {1216,1616,1624}, compare old (d51c8f8) vs new pricing/disabled
// Expected after fix: only FT_F@1216/S1216-type size cases remain as intentional disables (3 FT_F + K20 etc.)
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const tmp = process.env.TMPDIR || 'D:/HermesHome/profiles/tangjie/cache/scratch';

function loadEngine(files) {
  const ctx = { window: {}, console, Blob: function () {} };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
  const Q = ctx.window.LIDEA.quote;
  Q.init(ctx.window.LIDEA_DATA);
  return Q;
}

const oldQ = loadEngine([path.join(tmp, 'old-products.js'), path.join(tmp, 'old-price.js'), path.join(tmp, 'old-quote.js')]);
const newQ = loadEngine(['data/products.js', 'js/price.js', 'js/quote.js'].map(f => path.join(process.cwd(), f)));

const TYPES = ['H', 'B', 'M', 'C'];
const SIZES = ['1216', '1616', '1624'];
let gone = [], priceChange = [];

SIZES.forEach(sz => {
  TYPES.forEach(tp => {
    oldQ.DIMS.forEach(d => {
      if (d.step === 0) return;
      d.codes === 'ALL' ? oldQ.catOpts(d).forEach(o => scan(d, o.code)) : (Array.isArray(d.codes) ? d.codes.forEach(c => scan(d, c)) : 0);
      function scan(d, code) {
        // old price
        oldQ.state.sel = {}; oldQ.state.multi = {}; oldQ.setSize(sz); oldQ.state.sel.type = tp;
        if (oldQ.disabledReason(d.id, code)) return;   // was already disabled
        if (d.kind === 'radio') oldQ.state.sel[d.id] = code;
        else { oldQ.state.multi[d.id] = {}; oldQ.state.multi[d.id][code] = true; }
        const ro = oldQ.computeQuote();
        const lo = ro.lines.find(l => l.code === code && !l.base);
        const oldDiff = lo ? lo.diff : null;
        if (oldDiff == null) return;   // old was unpriced (silent drop) — not DS's category
        // new state
        newQ.state.sel = {}; newQ.state.multi = {}; newQ.setSize(sz); newQ.state.sel.type = tp;
        const dr = newQ.disabledReason(d.id, code);
        if (dr) { gone.push(sz + '/' + tp + '/' + d.id + '/' + code + ' → ' + dr + ' (was ' + oldDiff + ')'); return; }
        if (d.kind === 'radio') newQ.state.sel[d.id] = code;
        else { newQ.state.multi[d.id] = {}; newQ.state.multi[d.id][code] = true; }
        const rn = newQ.computeQuote();
        const ln = rn.lines.find(l => l.code === code && !l.base);
        const newDiff = ln ? ln.diff : null;
        if (newDiff == null) { gone.push(sz + '/' + tp + '/' + d.id + '/' + code + ' → DROPPED (was ' + oldDiff + ')'); return; }
        if (newDiff !== oldDiff) priceChange.push(sz + '/' + tp + '/' + d.id + '/' + code + ': ' + oldDiff + ' → ' + newDiff);
      }
    });
  });
});

console.log('=== 有价→禁用 (regressions DS counts; expect only FT_F@1216 etc.) ===');
gone.forEach(g => console.log('  ' + g));
console.log('total:', gone.length);
console.log('=== 价格变化 (old→new) ===');
priceChange.forEach(c => console.log('  ' + c));
console.log('total:', priceChange.length);
