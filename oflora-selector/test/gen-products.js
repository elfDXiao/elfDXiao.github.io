// gen-products.js — 从 oflora-data.json 生成 web/data/products.js（window.OFLORA_DATA）
// 用法：node test/gen-products.js
// 转换：meta.planPrices → size 分类 pricesByType（plan 键）；install 价格按研究文档 §3.3 修正（标准项 0、架台按尺寸 3 档）；
//       mirror B4/A4 スリムハイ补价（H2150 40,700，H2000 时 -3,850 注记）；无价格字段补 priceDiff:0（plan/size 除外）。
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/panasonic-oflora/data/oflora-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const SIZES6 = ['1621', '1818', '1618', '1616', '1316', '1216'];

function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceBySize) out.pricesBySize = o.priceBySize;
  if (o.priceByType) out.priceByType = o.priceByType;         // Oflora 无タイプ，但保留（兼容）
  if (o.priceByFaucetGroup) out.priceByFaucetGroup = o.priceByFaucetGroup;   // back_piping 裏配管
  if (o.partNumber) out.partNumber = o.partNumber;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  if (o.default) out.default = true;
  // 受注終了品（★）标记
  if (o.note && /★|受注終了/.test(o.note)) out.discontinued = true;

  // ★ install 价格修正（研究文档 §3.3）：1階標準/高床/低床/2階 アジャスターボルト = ±0；架台 = 尺寸别 3 档
  if (catId === 'install') {
    if (o.code === 'SBFL1' || o.code === 'SBFL2' || o.code === 'SBFL3' || o.code === 'SBFL2F') {
      out.pricesBySize = { '1621': 0, '1818': 0, '1618': 0, '1616': 0, '1316': 0, '1216': 0 };
      out.note = (o.note ? o.note + '；' : '') + '標準仕様 ±¥0（data 修正：原 SBFL1/2F 誤含架台価格）';
    }
    if (o.code === 'SBFL4') {
      out.pricesBySize = { '1621': 51700, '1818': 57750, '1618': 51700, '1616': 51700, '1316': 48400, '1216': 48400 };
      out.note = (o.note ? o.note + '；' : '') + '架台設置：1621/1618/1616 +51,700／1818 +57,750／1316/1216 +48,400';
    }
  }
  // ★ mirror スリムハイ（B4/A4）补价：H2150 用 +40,700（H2000 时 -3,850 注记）
  if (catId === 'mirror' && (o.code === 'B4' || o.code === 'A4')) {
    out.price = 40700;
    out.note = (o.note ? o.note + '；' : '') + 'スリムハイ（H2150）＋¥40,700／H2000 時 ＋¥36,850（-3,850）';
  }

  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.pricesBySize || out.priceByType || out.priceByFaucetGroup;
  if (!hasPrice && catId !== 'plan' && catId !== 'size') out.priceDiff = 0;
  return out;
}

// ---------- size 分类（meta.planPrices 重建 pricesByType = plan 键） ----------
const planPrices = d.meta.planPrices || {};
const PLAN_KEYS = Object.keys(planPrices);
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  PLAN_KEYS.forEach(p => {
    pricesByType[p] = (planPrices[p] && planPrices[p][s.code] != null) ? planPrices[p][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.dimensions) o.dimensions = s.dimensions;
  if (s.note) o.note = s.note;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [62],
  description_zh: '选择浴室尺寸（6 種）；プラン×サイズ 4×6 组合套装价矩阵（タイプ概念なし）',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: 0, pages: c.pages || [],
    description_zh: c.note || '',
    options: c.options.map(o => convertOption(o, c.id))
  });
});

const meta = {
  source: 'パナソニック オフローラ（Oflora）システムバスルーム（2026年10月価格改定版，PDF 113頁）',
  brand: 'Panasonic オフローラ（Oflora）',
  series: 'BGF',
  productNo: 'BGF{サイズ記号 2-7}{プランコード 1-4}（簡略；正式は 35 字段，研究文档 §7）',
  productNoExample: 'BGF51（1616 ベースプラン）',
  product: 'システムバスルーム（整体浴室・タイプ概念なし）',
  currency: 'JPY',
  taxRate: 0.10,
  rmbRate: 0.65,                           // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '希望小売価格（税抜）・取付設置費別。＋＝加价、－＝減价（プラン標準仕様基準）。',
  basePlan: d.meta.basePlan || { plan: 'BASE', size: '1616', price: 1273250 },
  planPrices: planPrices,
  planNames: d.meta.planNames || {},
  plans: PLAN_KEYS.slice(),
  sizes: d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  doorHand: d.meta.doorHand || ['AR', 'AL', 'BR', 'BL'],
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t37 数据接入',
  method: '从 data/oflora-data.json（data-analyst 提取）转换；install 价按研究文档 §3.3 修正、mirror スリムハイ补价；不确定项见 数据提取说明.md 第5章',
  quoteNote: '2026年10月末 受注終了品（照明 Q2/F1 換気扇/旧握りバー等 ★印）提示。',
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* Panasonic オフローラ（Oflora）选型报价系统数据（由 gen-products.js 从 oflora-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.OFLORA_DATA\n' +
  ' * 价格字段：priceDiff / price / pricesBySize（6 尺寸键）/ priceByType（plan 键 BASE/SUGOPIKA_CLEAN/MODERN_STYLE/MINIMUM_SELECT）/ priceByFaucetGroup\n' +
  ' * 无タイプ概念：プラン（4）× サイズ（6）= 套装价矩阵（meta.planPrices）；价格 = プラン套装价 + Σ差 + Σオプション\n' +
  ' * 人民币系数 rmbRate=0.65 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
const body = header + 'window.OFLORA_DATA = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(DST, body, 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(body));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
