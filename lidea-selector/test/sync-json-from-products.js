// sync-json-from-products.js — 一次性反向同步：把线上 data/products.js 里「生成器不产出」的字段回填到源 JSON
//   （2026-10-19 官方核对修订用；源头 lidea-data.json 落后于线上修复批次 b39f50e/feced9a/096a71e/6486737/1c065e8，
//     不回填就直接跑 gen-products.js 会把线上的水栓按タイプ重键与寒冷地价覆盖回去。）
// 用法：node test/sync-json-from-products.js [--dry]
// 只回填白名单字段：priceDiff / price / priceByType / pricesBySize / coldPriceDiff / coldPriceByType /
//   coldPricesBySize / coldPrice / coldIsBasic / constraints / note —— 且仅在两者不同时覆盖。
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = 'E:/自媒体账号阶段性成活/个人主页管理/lidea-bathroom/data/lidea-data.json';
const WEB = path.join(__dirname, '..');
const DRY = process.argv.indexOf('--dry') >= 0;

const FIELDS = ['priceDiff', 'price', 'priceByType', 'pricesBySize',
  'coldPriceDiff', 'coldPriceByType', 'coldPricesBySize', 'coldPrice', 'coldIsBasic',
  'constraints', 'note'];

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const ctx = { window: {}, console, Blob: function () {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(WEB, 'data', 'products.js'), 'utf8'), ctx);
const DEP = ctx.window.LIDEA_DATA;
const depCats = new Map(DEP.categories.map(c => [c.id, c]));

let changed = 0;
d.categories.forEach(c => {
  if (c.id === 'size') return;   // size 维度由 gen-products 从 d.sizes + meta.typeBasePrices 重建，不回填
  const dc = depCats.get(c.id);
  if (!dc) return;
  const dm = new Map(dc.options.map(o => [String(o.code), o]));
  c.options.forEach(o => {
    const t = dm.get(String(o.code));
    if (!t) return;
    FIELDS.forEach(k => {
      const a = JSON.stringify(o[k]), b = JSON.stringify(t[k]);
      if (a === b) return;
      if (t[k] === undefined) { delete o[k]; }
      else { o[k] = JSON.parse(JSON.stringify(t[k])); }
      changed++;
      console.log((DRY ? '[dry] ' : '') + c.id + ' | ' + o.code + ' | ' + k + ' → ' + (b === undefined ? '(删除)' : b).slice(0, 120));
    });
  });
});

if (!DRY) fs.writeFileSync(SRC, JSON.stringify(d, null, 2) + '\n', 'utf8');
console.log('fields synced: ' + changed + (DRY ? ' (dry run, 未写入)' : '，已写回 ' + SRC));