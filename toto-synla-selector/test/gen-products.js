// gen-products.js — 从 synla-data.json 生成 web/data/products.js（window.SYNLA_DATA）
// 用法：node test/gen-products.js
// 转换：
//   1. meta.typeBasePrices → size category options 的 pricesByType（反查）
//   2. availability → sizes（值非 false 的尺寸键）
//   3. pricesBySize 的 S1/S2 尺寸组键 → 尺寸组串（S1=1624/1620/1618, S2=1717/1616/1317/1216）
//   4. 无价格字段的选项补 priceDiff:0（手册 ±0 项），避免 unknown
//   5. 保留 constraints/note/subOptions 原样
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/toto-synla/data/synla-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// ---------- 壁柄色名中文映射（从 4SAME plan 的 EQA 子项继承到 FRONT/SIDE_ACCENT 的 EQC） ----------
const WALL_COLOR_ZH = {};
(function buildWallColorMap() {
  const wallCat = d.categories.find(c => c.id === 'wall');
  if (!wallCat) return;
  const plan4 = wallCat.options.find(o => o.code === '4SAME');
  if (!plan4 || !Array.isArray(plan4.subOptions)) return;
  plan4.subOptions.forEach(s => { if (s.name_zh && s.name_ja && !WALL_COLOR_ZH[s.name_ja]) WALL_COLOR_ZH[s.name_ja] = s.name_zh; });
})();

// ---------- 尺寸组定义（手册サイズ2区分/3区分） ----------
const SIZE_GROUPS = {
  S1: '1624/1620/1618',      // 大サイズ系
  S2: '1717/1616/1317/1216', // 小サイズ系
  S3: '1624'                 // 1624 単独（3区分時）
};
function expandSizeKey(key) {
  return SIZE_GROUPS[key] || key;
}

// ---------- 转换单个 option ----------
function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  else if (o.price === null) out.price = null; // 保留 unknown（价格未标注），不得补 0
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.pricesBySize) {
    const pbs = {};
    Object.keys(o.pricesBySize).forEach(k => { pbs[expandSizeKey(k)] = o.pricesBySize[k]; });
    out.pricesBySize = pbs;
  }
  // availability → sizes（值非 false 的尺寸键）
  if (o.availability && typeof o.availability === 'object') {
    const sizes = Object.keys(o.availability).filter(k => o.availability[k] !== false);
    if (sizes.length) out.sizes = sizes.map(expandSizeKey);
    const basicSizes = Object.keys(o.availability).filter(k => o.availability[k] === 'basic');
    if (basicSizes.length) out.basicSizes = basicSizes.map(expandSizeKey);
  }
  if (o.availabilityRaw) out.availabilityRaw = o.availabilityRaw;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  if (o.subOptions) {
    out.subOptions = o.subOptions.map(s => {
      const copy = Object.assign({}, s);
      // 壁柄色名中文继承：缺 name_zh 时按 name_ja（含镜面/哑光后缀）从 4SAME 映射补齐
      if (!copy.name_zh && copy.name_ja && WALL_COLOR_ZH[copy.name_ja]) copy.name_zh = WALL_COLOR_ZH[copy.name_ja];
      return copy;
    });
  }
  // 手册 ±0 项（无任何价格字段且不是纯展示）→ priceDiff:0；price===null 的 unknown 项除外
  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.pricesBySize;
  if (!hasPrice && catId !== 'type' && !out.subOptions && o.price !== null) {
    out.priceDiff = 0;
  }
  return out;
}

// ---------- 构建 categories ----------
const categories = [];

// size category（从顶层 sizes + typeBasePrices 构建）
const typeBase = d.meta.typeBasePrices;
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  Object.keys(typeBase).forEach(t => {
    pricesByType[t] = (typeBase[t] && typeBase[t][s.code] != null) ? typeBase[t][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.installation_mm) o.installation_mm = s.installation_mm;
  if (s.inner_mm) o.inner_mm = s.inner_mm;
  if (s.note) o.note = s.note;
  return o;
});
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [137],
  description_zh: '选择浴室尺寸系列（决定套装价与安装尺寸）；1317/1216 仅 D/C タイプ可选',
  options: sizeOptions
});

// type category（data 原样 + snapshot 从 typeNames）
const typeCat = d.categories.find(c => c.id === 'type');
const typeNames = d.meta.typeNames || {};
categories.push({
  id: 'type', name_ja: 'タイプ', name_zh: '型号', step: 0, pages: [138, 139],
  description_zh: '选择型号（G/B/R/D/C），决定基本配置与基本套装价',
  options: typeCat.options.map(o => {
    const out = convertOption(o, 'type');
    if (typeNames[o.code]) out.snapshot = typeNames[o.code];
    return out;
  })
});

// 其余分类（data 原样转换；size 已由 d.sizes 重建，跳过原 size 分类避免重复）
const SKIP = ['type', 'size'];
d.categories.forEach(c => {
  if (SKIP.indexOf(c.id) >= 0) return;
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: c.step, pages: c.pages || [],
    description_zh: (c.description_zh || ''),
    options: c.options.map(o => convertOption(o, c.id))
  });
});

// ---------- meta ----------
const meta = {
  source: d.meta.source || 'TOTO シンラ プランニング／オプションガイド（52 页）',
  brand: d.meta.brand || 'TOTO Synla（シンラ）',
  series: 'HLV',
  productNo: 'HLV{size}U{type} X3{doorPos} {pedestal}',
  productNoExample: 'HLV1616UG X3D R = 1616サイズ・Gタイプ・ドア位置D・架台R',
  product: d.meta.product || 'システムバスルーム（整体浴室）',
  currency: d.meta.currency || 'JPY',
  taxRate: d.meta.taxRate || 0.10,
  priceNote: d.meta.priceNote || '表示価格は税抜き価格です（不含税）。＋＝加价 －＝减价（相对基本仕様/套装价），基本仕様＝默认包含无差价。',
  basePlan: d.meta.basePlan || { type: 'G', size: '1616', price: 3128000 },
  typeBasePrices: typeBase,
  typeNames: typeNames,
  types: d.meta.types || Object.keys(typeBase),
  typeGroups: { G: 'G', B: 'BR', R: 'BR', D: 'DC', C: 'DC' },
  sizes: d.meta.sizes || d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  sizeGroups: SIZE_GROUPS,
  doorPositions: d.meta.doorPositions || ['A', 'B', 'C', 'D'],
  sizeMatrixColumns: d.meta.sizeMatrixColumns || [],
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — 第二阶段数据接入',
  method: '从 data/synla-data.json（data-analyst MiMo 提取）转换；不确定项见 数据提取说明.md §7',
  quoteNote: d.meta.quoteNote || '套装价不含安装费与窗本体/窗框；本体品番＝HLV＋サイズ＋タイプ＋X3＋ドア位置＋架台。',
  _stats: d.meta._stats || {}
};

const out = {
  meta: meta,
  categories: categories
};

const header = '/* TOTO Synla（シンラ）选型报价系统数据（由 gen-products.js 从 synla-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.SYNLA_DATA\n' +
  ' * 价格字段：priceDiff（固定差价）/ price（单品绝对价）/ priceByType（タイプ別差价，键如 G、BR、DC、GBR、BRDC）/ pricesBySize（尺寸档差价）/ price（单品）\n' +
  ' * 选项限定：sizes（适用尺寸）/ basicSizes（该尺寸基本仕様）/ constraints（组合限制）/ subOptions（壁柄子选项）\n' +
  ' */\n';
const js = header + 'window.SYNLA_DATA = ' + JSON.stringify(out) + ';\n';

fs.writeFileSync(DST, js, 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(js));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
