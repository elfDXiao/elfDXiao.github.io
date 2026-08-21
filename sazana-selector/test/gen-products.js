// gen-products.js — 从 sazana-data.json 生成 web/data/products.js（window.SAZANA_DATA）
// 用法：node test/gen-products.js
// 转换：meta.typeBasePrices → size category options 的 pricesByType；无价格字段补 priceDiff:0
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/toto-sazana/data/sazana-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.priceBySurround) out.priceBySurround = o.priceBySurround;   // 壁柄アクセント×周辺组合价
  if (o.pricesBySize) out.pricesBySize = o.pricesBySize;
  if (o.availability && typeof o.availability === 'object') {
    const sizes = Object.keys(o.availability).filter(k => o.availability[k] !== false);
    if (sizes.length) out.sizes = sizes;
  }
  if (o.types && Array.isArray(o.types)) out.types = o.types;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  // ★ t32 浴缸颜色拆分：YQABA 裙板白（N タイプ基本）补全全タイプ 0（目录：标准白裙板全タイプ可用）
  if (catId === 'bathtub' && o.code === 'YQABA') out.priceByType = { P: 0, T: 0, S: 0, N: 0, F: 0 };
  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.priceBySurround || out.pricesBySize;
  if (!hasPrice && catId !== 'type' && catId !== 'size') out.priceDiff = 0;
  return out;
}

// ---------- size category（typeBasePrices 重建） ----------
const typeBase = d.meta.typeBasePrices;
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  Object.keys(typeBase).forEach(t => {
    pricesByType[t] = (typeBase[t] && typeBase[t][s.code] != null) ? typeBase[t][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.inner_mm) o.inner_mm = s.inner_mm;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [111],
  description_zh: '选择浴室尺寸（10 種）；F タイプ仅 1620/1616/1618，N タイプ无 1220',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;
  let options = c.options.map(o => convertOption(o, c.id));
  // ★ wall 分类重构：把 HⅡ/HⅠ/BASIC クラス占位展开为 4面同色柄独立选项（第一段直接可选）
  if (c.id === 'wall') {
    options = [];
    c.options.forEach(o => {
      const conv = convertOption(o, c.id);
      if ((o.code === 'HⅡ' || o.code === 'HⅠ' || o.code === 'BASIC') && o.note) {
        // note 解析「柄名/品番、柄名/品番...」→ 每柄独立选项
        const re = /([^/、]+)\/([A-Za-z0-9]+)/g;
        let m;
        const cls = String(o.name_ja || '').split('柄')[0].trim();
        while ((m = re.exec(o.note)) !== null) {
          options.push({
            code: m[2],
            name_ja: m[1].replace(/^柄[:：]\s*/, '') + '（' + cls + '）',
            name_zh: m[1].replace(/^柄[:：]\s*/, ''),
            priceByType: conv.priceByType || {},
            grade: cls,
            class: cls,
            fourSame: true
          });
        }
      } else {
        if (conv.code === 'EGAA1' || conv.code === 'EGAC3' || conv.code === 'EGAH6' || conv.code === 'EGAW4') {
          conv.grade = 'プレミアムグレード';
          conv.class = 'プレミアムグレード';
          conv.fourSame = true;
        }
        options.push(conv);
      }
    });
  }
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: c.step, pages: c.pages || [],
    description_zh: c.description_zh || '',
    options: options
  });
});

const meta = {
  source: d.meta.source || 'TOTO サザナ（Sazana）システムバスルーム 2025.12 価格掲載版',
  brand: d.meta.brand || 'TOTO Sazana（サザナ）',
  series: 'HTV',
  productNo: String(d.meta.partNumberPattern || 'HTV{サイズ}U{タイプ}X6{ドア位置}{架台}').split('\n')[0].split('例：')[0].trim(),
  productNoExample: 'HTV1616UPX6DR',
  product: d.meta.product || 'システムバスルーム（整体浴室）',
  currency: d.meta.currency || 'JPY',
  taxRate: (typeof d.meta.taxRate === 'number' && d.meta.taxRate > 0 && d.meta.taxRate < 1) ? d.meta.taxRate : 0.10,
  rmbRate: 0.7,                          // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は税抜き価格です（不含税）。＋＝加价 －＝减价（相对各タイプ標準仕様価格）。',
  basePlan: d.meta.basePlan || { size: '1620', type: 'T', price: 1449000 },
  typeBasePrices: typeBase,
  typeNames: d.meta.typeNames || {},
  typeNote: d.meta.typeNote || '',
  types: d.meta.types || Object.keys(typeBase),
  sizes: d.meta.sizes || d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  sizeGroups: d.meta.sizeGroups || {},
  doorPositions: d.meta.doorPositions || ['A', 'B', 'C', 'D'],
  sizeMatrixColumns: d.meta.sizeMatrixColumns || [],
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t19 数据接入',
  method: '从 data/sazana-data.json（data-analyst 提取）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || 'セットプラン価格 = 本体価格 + オプション合計価格；本体価格不含組立費。',
  coldRegionPatterns: d.meta.coldRegionPatterns || {},
  basePriceMatrixCount: d.meta.basePriceMatrixCount || 0,
  _stats: d.meta._stats || {}
};

const out = { meta, categories };

// ---------- 壁柄花纹级数据（sazana-wall-patterns.json：accentPatterns 37 + surroundPatterns 8 + accentPriceMatrix） ----------
try {
  const wp = JSON.parse(fs.readFileSync('D:/DSH工作区/toto-sazana/data/sazana-wall-patterns.json', 'utf8'));
  out.sazanaWallPatterns = wp;
  console.log('sazanaWallPatterns merged: accent=' + (wp.accentPatterns || []).length + ', surround=' + (wp.surroundPatterns || []).length);
} catch (e) {
  console.warn('wall-patterns merge failed: ' + e.message);
  out.sazanaWallPatterns = { meta: {}, accentPriceMatrix: {}, accentPatterns: [], surroundPatterns: [] };
}

const header = '/* TOTO サザナ（Sazana）选型报价系统数据（由 gen-products.js 从 sazana-data.json + sazana-wall-patterns.json 生成，请勿手改）\n' +
  ' * 命名空间：window.SAZANA_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType（タイプ键 P/T/S/N/F 或组键）/ pricesBySize / priceBySurround（アクセント×周辺组合价）\n' +
  ' * sazanaWallPatterns：壁柄花纹级数据（accentPatterns 37・surroundPatterns 8・accentPriceMatrix 4×3）\n' +
  ' * 人民币系数 rmbRate=0.7 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
fs.writeFileSync(DST, header + 'window.SAZANA_DATA = ' + JSON.stringify(out) + ';\n', 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(header + 'window.SAZANA_DATA = ' + JSON.stringify(out) + ';\n'));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
