// gen-products.js — 从 lidea-data.json 生成 web/data/products.js（window.LIDEA_DATA）
// 用法：node test/gen-products.js
// 转换：meta.typeBasePrices → size category options 的 pricesByType；无价格字段补 priceDiff:0；原样保留 priceByType 条件键
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/lidea-bathroom/data/lidea-data.json';
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
  // ★ t32 浴缸材质 sizes 补齐（《浴缸颜色结构.md》P.71 形状×材质对应）：
  //   パールクォーツ（T6/T7/T8）= ミナモ系 1624/1620/S1818/1618/1616
  //   ルフレトーン/FRP（TR~TD）= ミナモワイド除外 6 形状（全尺寸可用）
  if (catId === 'bathtub' && /^T[0-9A-Z]$/.test(o.code)) {   // T6~T8 / TR~TV / TA~TD
    if (o.code === 'T6' || o.code === 'T7' || o.code === 'T8') {
      out.sizes = ['1624', '1620', 'S1818', '1618', '1616'];
    } else {
      out.sizes = ['1216', '1620', '1624', 'S1818/1618/1616', '1318/1316', 'S1216'];
    }
    out.material = (o.code === 'T6' || o.code === 'T7' || o.code === 'T8') ? 'パールクォーツ'
      : (o.code === 'TR' || o.code === 'TT' || o.code === 'TS' || o.code === 'TW' || o.code === 'TU' || o.code === 'TV') ? 'ルフレトーン'
      : 'FRP';
  }
  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.pricesBySize;
  if (!hasPrice && catId !== 'type' && catId !== 'size') out.priceDiff = 0;
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
  if (s.inner_mm) o.inner_mm = s.inner_mm;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [110],
  description_zh: '选择浴室尺寸（内寸）；1624/S1818 仅 M/C タイプ可选',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;   // size 重建
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: c.step, pages: c.pages || [],
    description_zh: c.description_zh || '',
    options: c.options.map(o => convertOption(o, c.id))
  });
});

const meta = {
  source: d.meta.source || 'LIXIL Lidea（リデア）システムバスルーム 戸建用（2026.08 価格掲載版）',
  brand: d.meta.brand || 'LIXIL Lidea（リデア）',
  series: 'BD',
  productNo: String(d.meta.partNumberPattern || 'BD{U}{S/W}{サイズ}{壁パネル}{床}{タイプ}{浴槽}-A+H（C）{ドア位置}').split('\n')[0].split('例：')[0].trim(),
  productNoExample: 'BDUS-1620LBH2-A+H（C）RC',
  product: d.meta.product || 'システムバスルーム（整体浴室）',
  currency: d.meta.currency || 'JPY',
  taxRate: d.meta.taxRate || 0.10,
  rmbRate: 0.65,                          // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は税抜き価格です（不含税）。＋＝加价 －＝减价（相对標準仕様価格）。',
  basePlan: d.meta.basePlan || { size: '1616', type: 'M', price: 1379000 },
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
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t11 数据接入',
  method: '从 data/lidea-data.json（data-analyst 提取）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || '写真セット価格 = 標準仕様価格 + オプション合計価格；標準仕様価格不含安装费与窗本体。',
  coldRegionPatterns: d.meta.coldRegionPatterns || {},
  basePriceMatrixCount: d.meta.basePriceMatrixCount || 0,
  selectGuideMarkers: d.meta.selectGuideMarkers || {},
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* LIXIL Lidea（リデア）选型报价系统数据（由 gen-products.js 从 lidea-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.LIDEA_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType（タイプ键 H|B|M|C 或组键 HBM/BMC/HMC/BM 或条件键 FaucetNone/ThermoMetal/UruAri 等，引擎按上下文解析）/ pricesBySize\n' +
  ' * 人民币系数 rmbRate=0.65 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
fs.writeFileSync(DST, header + 'window.LIDEA_DATA = ' + JSON.stringify(out) + ';\n', 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(header + 'window.LIDEA_DATA = ' + JSON.stringify(out) + ';\n'));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
