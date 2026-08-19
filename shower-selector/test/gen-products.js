// gen-products.js — 从 shower-data.json 生成 web/data/products.js（window.SHOWER_DATA）
// 用法：node test/gen-products.js
// 转换：meta.typeBasePrices → size category options 的 pricesByType；无价格字段补 priceDiff:0
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/toto-shower/data/shower-data.json';
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
    const basic = Object.keys(o.availability).filter(k => o.availability[k] === 'basic');
    if (basic.length) out.basicSizes = basic;
  }
  if (o.types && Array.isArray(o.types)) out.types = o.types;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.pricesBySize;
  if (!hasPrice && catId !== 'type') out.priceDiff = 0;
  return out;
}

// ---------- size category（顶层 sizes + typeBasePrices 重建） ----------
const typeBase = d.meta.typeBasePrices;
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  Object.keys(typeBase).forEach(t => {
    pricesByType[t] = (typeBase[t] && typeBase[t][s.code] != null) ? typeBase[t][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.types) o.types = s.types;
  if (s.installation_note) o.installation_note = s.installation_note;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [15],
  description_zh: '选择淋浴房尺寸系列（与タイプ固定组合，7 种套装价）',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size' || c.id === 'type') return;   // size 重建、type 由 size 的 pricesByType 反查
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: c.step, pages: c.pages || [],
    description_zh: c.description_zh || '',
    options: c.options.map(o => convertOption(o, c.id))
  });
});

// type category（从 typeBasePrices 反查）
const typeNames = d.meta.typeNames || {};
const typeCodes = Object.keys(typeBase);
const typeCatData = d.categories.find(c => c.id === 'type');
categories.push({
  id: 'type', name_ja: 'タイプ', name_zh: '型号', step: 0, pages: [15],
  description_zh: '选择型号（G/X/T/L），与尺寸固定组合决定套装价',
  options: typeCodes.map(tc => {
    const src = typeCatData ? typeCatData.options.find(o => o.code === tc) : null;
    return {
      code: tc,
      name_ja: (src && src.name_ja) || (typeNames[tc] || tc + 'タイプ'),
      name_zh: (src && src.name_zh) || (typeNames[tc] || tc + '型'),
      snapshot: typeNames[tc] || ''
    };
  })
});

const meta = {
  source: d.meta.source || 'TOTO シャワールーム カタログ（2026.6・2026.8 発売予定）',
  brand: d.meta.brand || 'TOTO シャワールーム（Shower Room）',
  series: 'JSV',
  productNo: String(d.meta.partNumberPattern || 'JSV{size}U{type}W6').split('（')[0].trim(),
  productNoExample: 'JSV0816UGW6 / JSV0812UTW6',
  product: d.meta.product || 'シャワールーム（淋浴房）',
  currency: d.meta.currency || 'JPY',
  taxRate: d.meta.taxRate || 0.10,
  rmbRate: 0.8,                          // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は税抜き価格です（不含税）。＋＝加价 －＝减价（相对基本仕様/套装价）。',
  basePlan: d.meta.basePlan || { size: '0816', type: 'G', price: 1132000 },
  typeBasePrices: typeBase,
  typeNames: typeNames,
  types: typeCodes,
  sizes: d.meta.sizes || d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  sizeAvailability: d.meta.sizeAvailability || {},
  doorPositions: d.meta.doorPositions || { A: 'A', B: 'B', C: 'C', D: 'D' },
  sizeMatrixColumns: d.meta.sizeMatrixColumns || [],
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t7 数据接入',
  method: '从 data/shower-data.json（data-analyst 提取）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || '套装价（税抜）不含安装费；入れ替えオプション（ドア/鏡/収納等）另选。',
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* TOTO シャワールーム（Shower Room）选型报价系统数据（由 gen-products.js 从 shower-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.SHOWER_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType（タイプ分组键 GXT|L、GX|TL、GXTL、XTL 等）/ pricesBySize / price（单品）\n' +
  ' * 人民币系数 rmbRate=0.8 仅存在于 meta（页面不显示公式）\n' +
  ' */\n';
fs.writeFileSync(DST, header + 'window.SHOWER_DATA = ' + JSON.stringify(out) + ';\n', 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(header + 'window.SHOWER_DATA = ' + JSON.stringify(out) + ';\n'));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
