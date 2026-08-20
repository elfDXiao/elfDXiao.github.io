// gen-products.js — 从 spage-data.json 生成 web/data/products.js（window.SPAGE_DATA）
// 用法：node test/gen-products.js
// 转换：meta.typeBasePrices（タイプ×サイズ×U/M 嵌套）→ size category options 的 pricesByType[type][size]={U,M}
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/lidea-spage/data/spage-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.pricesBySize) out.pricesBySize = o.pricesBySize;
  if (o.availability && typeof o.availability === 'object') {
    const sizes = Object.keys(o.availability).filter(k => o.availability[k] !== false);
    if (sizes.length) out.sizes = sizes;
  }
  if (o.types && Array.isArray(o.types)) out.types = o.types;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.pricesBySize;
  if (!hasPrice && catId !== 'type' && catId !== 'size') out.priceDiff = 0;
  return out;
}

// ---------- size category（typeBasePrices 嵌套 {タイプ:{サイズ:{U,M}}} → pricesByType[type][size]={U,M}） ----------
const typeBase = d.meta.typeBasePrices;
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  Object.keys(typeBase).forEach(t => {
    const bySize = typeBase[t];
    pricesByType[t] = (bySize && bySize[s.code] != null) ? bySize[s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.inner_mm) o.inner_mm = s.inner_mm;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [134],
  description_zh: '选择浴室尺寸（内寸）；設置（戸建 U/マンション M）与タイプ决定標準仕様価格',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: c.step, pages: c.pages || [],
    description_zh: c.description_zh || '',
    options: c.options.map(o => convertOption(o, c.id))
  });
});

const meta = {
  source: d.meta.source || 'LIXIL SPAGE（スパージュ）システムバスルーム 戸建・マンション用（発売商品掲載版）',
  brand: d.meta.brand || 'LIXIL SPAGE（スパージュ）',
  series: 'BA',
  productNo: String(d.meta.partNumberPattern || 'BAU{W}{サイズ}{タイプ}-C+H(C){ドア位置}').split('\n')[0].split('例：')[0].trim(),
  productNoExample: 'BAUW-1624LAP-C+H(C)RC',
  product: d.meta.product || 'システムバスルーム（整体浴室）',
  currency: d.meta.currency || 'JPY',
  taxRate: (typeof d.meta.taxRate === 'number' && d.meta.taxRate > 0 && d.meta.taxRate < 1) ? d.meta.taxRate : 0.10,
  rmbRate: 0.75,                          // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は税抜き価格です（不含税）。＋＝加价 －＝减价（相对標準仕様価格）。',
  basePlan: d.meta.basePlan || { size: '1620', type: 'P', install: 'U', price: 3377000 },
  typeBasePrices: typeBase,
  typeNames: d.meta.typeNames || {},
  typeNote: d.meta.typeNote || '',
  types: d.meta.types || Object.keys(typeBase),
  sizes: d.meta.sizes || d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  sizeGroups: d.meta.sizeGroups || {},
  region: d.meta.region || {},
  install: d.meta.install || {},
  doorPositions: d.meta.doorPositions || ['RL', 'LR', 'RC', 'LC'],
  sizeMatrixColumns: d.meta.sizeMatrixColumns || [],
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t15 数据接入',
  method: '从 data/spage-data.json（data-analyst 提取）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || '写真セット価格 = 標準仕様価格 + オプション合計価格；標準仕様価格不含安装费与窗本体。',
  coldRegionPatterns: d.meta.coldRegionPatterns || {},
  basePriceMatrixCount: d.meta.basePriceMatrixCount || 0,
  selectGuideMarkers: d.meta.selectGuideMarkers || {},
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* LIXIL SPAGE（スパージュ）选型报价系统数据（由 gen-products.js 从 spage-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.SPAGE_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType（タイプ键 P/C/S/V/A 或组键或条件键如 A/U・A/M）/ pricesBySize\n' +
  ' * 人民币系数 rmbRate=0.75 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
fs.writeFileSync(DST, header + 'window.SPAGE_DATA = ' + JSON.stringify(out) + ';\n', 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(header + 'window.SPAGE_DATA = ' + JSON.stringify(out) + ';\n'));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
