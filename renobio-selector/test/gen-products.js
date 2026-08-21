// gen-products.js — 从 renobio-data.json 生成 web/data/products.js（window.RENOBIO_DATA）
// 用法：node test/gen-products.js
// 转换：meta.basePriceTable → size 分类 options 的 pricesByType；priceBySize → pricesBySize（引擎键名）；
//       availability/availabilityBySize → sizes 数组；availabilityByType → types 数组；
//       wallPanel priceByClass/priceByCombo、wallPattern class/fullWallCode/accentCodeByBase、photoSet 套装价 原样保留；
//       无价格字段补 priceDiff:0（type/size 除外）；oidaki 2C/3C 补 price 15000（与 1C 同额，手册未明记→推定）。
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/lidea-renobio/data/renobio-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

/** 原样拷贝价格字段（含 priceByClass/priceByCombo/priceBySize 等），无价格补 0 */
function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.priceBySize) out.pricesBySize = o.priceBySize;       // 引擎键名
  if (o.priceByClass) out.priceByClass = o.priceByClass;     // wall 全面張り ハイ/ベーシック
  if (o.priceByCombo) out.priceByCombo = o.priceByCombo;     // wall アクセント baseHigh/baseBasic
  if (o.priceByDoorWidth) out.pricesByDoorWidth = o.priceByDoorWidth; // doorOutsideTowelBar
  // 可用性 → sizes / types 数组
  const av = o.availability || o.availabilityBySize;
  if (av && typeof av === 'object') {
    const sizes = Object.keys(av).filter(k => av[k] === true);
    if (sizes.length) out.sizes = sizes;
  }
  if (o.availabilityByType && typeof o.availabilityByType === 'object') {
    const types = Object.keys(o.availabilityByType).filter(k => o.availabilityByType[k] === true);
    if (types.length) out.types = types;
  }
  if (o.types && Array.isArray(o.types)) out.types = o.types;
  if (o.class) out.class = o.class;                           // wallPattern クラス（high/basic）
  if (o.fullWallCode != null) out.fullWallCode = o.fullWallCode;       // 全面張り注文コード
  if (o.accentCodeByBase) out.accentCodeByBase = o.accentCodeByBase;   // アクセント×ベース組合せ
  if (o.partNumber) out.partNumber = o.partNumber;
  if (o.partNumberBySize) out.partNumbersBySize = o.partNumberBySize;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  if (o.default) out.default = true;
  // photoSet 专用
  if (o.photoSetPriceBySize) out.photoSetPriceBySize = o.photoSetPriceBySize;
  if (o.optionTotalBySize) out.optionTotalBySize = o.optionTotalBySize;
  if (o.doorPosition) out.doorPosition = o.doorPosition;
  if (o.baseType) out.baseType = o.baseType;
  if (o.baseSize) out.baseSize = o.baseSize;
  if (o.items) out.items = o.items;
  // 窗框加固件（reinforcePrice/reinforcePart 原样保留）
  if (o.reinforcePrice != null) out.reinforcePrice = o.reinforcePrice;
  if (o.reinforcePart) out.reinforcePart = o.reinforcePart;

  // oidaki 2C/3C 无价格（与 1C 同为「循環アダプター止め」）→ 补 15000（手册未明记，推定同额）
  if (catId === 'oidaki' && (o.code === '2C' || o.code === '3C') && o.price == null && o.priceDiff == null) {
    out.price = 15000;
    out.note = (o.note ? o.note + '；' : '') + '価格は1Cと同額（+¥15,000、カタログ未明記のため推定）';
  }

  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.pricesBySize ||
    out.priceByClass || out.priceByCombo || out.photoSetPriceBySize;
  if (!hasPrice && catId !== 'type' && catId !== 'size' && catId !== 'wallPattern' && catId !== 'washbasin') {
    out.priceDiff = 0;
  }
  return out;
}

// ---------- size 分类（顶层 sizes + meta.basePriceTable 重建 pricesByType） ----------
const typeBase = d.meta.basePriceTable || d.meta.typeBasePrices || {};
const TYPE_KEYS = Object.keys(typeBase).filter(k => /^[NTBC]$/.test(k));   // 排除 note 等非タイプ键
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  TYPE_KEYS.forEach(t => {
    pricesByType[t] = (typeBase[t] && typeBase[t][s.code] != null) ? typeBase[t][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.dimensions) o.dimensions = s.dimensions;
  if (s.ubNTC) o.ubNTC = s.ubNTC;
  if (s.ubB) o.ubB = s.ubB;
  if (s.bathtubCapacity) o.bathtubCapacity = s.bathtubCapacity;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [24],
  description_zh: '选择浴室尺寸（内寸 4 種）；タイプ×サイズ 16 组合标准规格价全矩阵',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;   // size 重建
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: 0, pages: c.pages || [],
    description_zh: c.note || '',
    options: c.options.map(o => convertOption(o, c.id))
  });
});

const meta = {
  source: 'LIXIL リノビオフィット（Renobio Fit）システムバスルーム マンションリフォーム用（2026.08 価格掲載版，39頁）',
  brand: 'LIXIL Renobio Fit（リノビオフィット）',
  series: 'BK',
  productNo: (d.meta.partNumberPattern && typeof d.meta.partNumberPattern === 'object' && d.meta.partNumberPattern.pattern)
    ? d.meta.partNumberPattern.pattern
    : String(d.meta.partNumberPattern || 'BKS/BLKS-{サイズ}L{壁}B{タイプ}-B+H(C){ドア位置}').split('\n')[0].split('例：')[0].trim(),
  productNoExample: 'BKS-1216LBN-B+H(C)RL',
  product: 'システムバスルーム（整体浴室・マンションリフォーム用）',
  currency: 'JPY',
  taxRate: 0.10,
  rmbRate: 0.8,                           // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は全て税抜（メーカー希望小売価格）、取付費別途。＋＝加价、－＝減价（各タイプ標準仕様価格を基準）。',
  basePlan: d.meta.basePlan || { size: '1216', type: 'N', price: 841500 },
  typeBasePrices: typeBase,
  typeNames: d.meta.typeNames || {},
  typeBaseSpec: d.meta.typeBaseSpec || {},
  typeBaseSpecNote: d.meta.typeBaseSpecNote || '',
  types: TYPE_KEYS.slice(),
  sizes: d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  region: { H: { nameJa: '一般地仕様', nameZh: '一般地区规格', add: 0 }, C: { nameJa: '寒冷地仕様', nameZh: '寒冷地区规格', add: 5000 } },
  doorPositions: ['RL', 'LR', 'RC', 'LC', 'RLS', 'LRS', 'RCS', 'LCS'],
  // ★ 壁パネルベース（四面墙板色）公共表 —— wizard/quote 统一读取（跳色花纹先选、四面墙板色后选）
  wallBases: [
    { code: 'HN301', name_ja: '鏡面ホワイト', name_zh: '镜面白', cls: 'high', priceDiff: 70000 },
    { code: 'HN986', name_ja: 'クルムホワイト', name_zh: '云纹白', cls: 'high', priceDiff: 70000 },
    { code: 'LE301', name_ja: 'マットホワイト', name_zh: '哑光白', cls: 'basic', priceDiff: 10000, default: true }
  ],
  photoSetFormula: d.meta.photoSetFormula || '写真セット価格 = 標準仕様価格 + オプション合計価格（税別・取付費別途）',
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t23 数据接入',
  method: '从 data/renobio-data.json（data-analyst 提取）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || '標準仕様価格（4 タイプ×4 サイズ）基準のセレクト差額方式。寒冷地 +¥5,000。',
  coldRegionPatterns: d.meta.coldRegionPatterns || {},
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* LIXIL Renobio Fit（リノビオフィット）选型报价系统数据（由 gen-products.js 从 renobio-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.RENOBIO_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType（タイプ键 N|T|C|B）/ pricesBySize / priceByClass / priceByCombo / photoSetPriceBySize\n' +
  ' * 壁パネル两段：wall（0 全面張り/1 アクセントB面/2 アクセントC面，priceByClass/priceByCombo）+ wallPattern（class/fullWallCode/accentCodeByBase）\n' +
  ' * 人民币系数 rmbRate=0.8 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
const body = header + 'window.RENOBIO_DATA = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(DST, body, 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(body));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
