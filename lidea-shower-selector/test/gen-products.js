// gen-products.js — 从 shower-data.json 生成 web/data/products.js（window.LSHOWER_DATA）
// 用法：node test/gen-products.js
// 转换：meta.typeBasePrices → size 分类 pricesByType；priceBySize{1216,other,tile} → 展开 4 尺寸键（保留 tile 特殊键）；
//       priceByTypeGroup{UZUX,FZFX} 原样保留；lighting GP（priceByLamp）→ 展开 GP(1灯)/GP2(2灯)；
//       floor 选项补 floorCode（A=タイル床/B=FRP床）；wall_pattern note ＊1＊2 → slimLimited 标记；
//       无价格字段补 priceDiff:0（type/size 除外）。
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/lidea-shower/data/shower-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const SIZES4 = ['1216', '0914', '0912', '0812'];
const SIZES_OTHER = ['0914', '0912', '0812'];

/** {1216:X, other:Y} → {1216:X, 0914:Y, 0912:Y, 0812:Y}；保留 tile 特殊键（床仕様依存） */
function expandSizeKey(pbs) {
  if (!pbs) return pbs;
  const out = {};
  Object.keys(pbs).forEach(k => {
    if (k === 'other') SIZES_OTHER.forEach(s => { out[s] = pbs[k]; });
    else out[k] = pbs[k];
  });
  return out;
}

function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.priceByTypeGroup) out.priceByTypeGroup = o.priceByTypeGroup;   // storage UZUX/FZFX
  if (o.priceByFaucetGroup) out.priceByFaucetGroup = o.priceByFaucetGroup; // shower_head / hose_hook
  if (o.priceByTypeFaucet) out.priceByTypeFaucet = o.priceByTypeFaucet;   // shower_hook
  if (o.priceByDoorType) out.priceByDoorType = o.priceByDoorType;         // door_handle / door_color 6
  if (o.priceByDoorWidth) out.priceByDoorWidth = o.priceByDoorWidth;      // door_color 9
  if (o.priceBySize) out.pricesBySize = expandSizeKey(o.priceBySize);
  if (o.priceByClass) out.priceByClass = o.priceByClass;         // wall 全面張り premium1/high/basic
  if (o.priceByCombo) out.priceByCombo = o.priceByCombo;         // wall アクセント premiumXhigh 等
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
  if (o.class) out.class = o.class;
  if (o.fullWallCode != null) out.fullWallCode = o.fullWallCode;
  if (o.accentCodeByBase) out.accentCodeByBase = o.accentCodeByBase;
  if (o.partNumber) out.partNumber = o.partNumber;
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  if (o.default) out.default = true;
  if (o.longLeadTime) out.longLeadTime = true;                   // 長納期（タイル床 +2 週間）
  if (o.reinforcePrice != null) out.reinforcePrice = o.reinforcePrice;
  if (o.reinforcePart) out.reinforcePart = o.reinforcePart;
  // photoSet 专用
  if (o.photoSetPrice != null) out.photoSetPrice = o.photoSetPrice;
  if (o.standardPrice != null) out.standardPrice = o.standardPrice;
  if (o.optionTotal != null) out.optionTotal = o.optionTotal;
  if (o.doorPosition) out.doorPosition = o.doorPosition;
  if (o.baseType) out.baseType = o.baseType;
  if (o.baseSize) out.baseSize = o.baseSize;
  if (o.items) out.items = o.items;
  if (o.coldRegionNote) out.coldRegionNote = o.coldRegionNote;

  // floor：品番床コード（9 开头=タイル床 A，其他=FRP床 B）
  if (catId === 'floor') out.floorCode = /^9/.test(String(o.code)) ? 'A' : 'B';

  // wall_pattern：slimLimited（＊1＝1216/0914/0912、＊2＝1216，スリム照明と同時不可）
  if (catId === 'wall_pattern' && o.note && /＊[12]/.test(o.note)) {
    out.slimLimited = /＊1/.test(o.note) ? 'all' : '1216';
  }

  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.priceByType || out.priceByTypeGroup ||
    out.priceByFaucetGroup || out.priceByTypeFaucet || out.priceByDoorType || out.priceByDoorWidth ||
    out.pricesBySize || out.priceByClass || out.priceByCombo || out.photoSetPrice != null;
  if (!hasPrice && catId !== 'type' && catId !== 'size') out.priceDiff = 0;
  return out;
}

// ---------- size 分类（顶层 sizes + meta.typeBasePrices 重建） ----------
const typeBase = d.meta.typeBasePrices || {};
const TYPE_KEYS = Object.keys(typeBase).filter(k => /^(UZ|UX|FZ|FX)$/.test(k));
const sizeOptions = d.sizes.map(s => {
  const pricesByType = {};
  TYPE_KEYS.forEach(t => {
    pricesByType[t] = (typeBase[t] && typeBase[t][s.code] != null) ? typeBase[t][s.code] : null;
  });
  const o = { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, setPrice: true, pricesByType: pricesByType };
  if (s.dimensions) o.dimensions = s.dimensions;
  return o;
});

const categories = [];
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0, pages: [58],
  description_zh: '选择浴室尺寸（内寸 4 種）；タイプ×サイズ 16 组合标准规格价全矩阵',
  options: sizeOptions
});

d.categories.forEach(c => {
  if (c.id === 'size') return;
  let opts = c.options.map(o => convertOption(o, c.id));
  // lighting GP（priceByLamp）→ 展开 GP(1灯 标准)/GP2(2灯 +28,000，0812 不可)
  if (c.id === 'lighting') {
    opts = [];
    c.options.forEach(o => {
      if (o.code === 'GP' && o.priceByLamp) {
        const gp1 = convertOption(o, c.id);
        delete gp1.priceByLamp;
        gp1.priceDiff = 0;
        gp1.note = (o.note ? o.note + '；' : '') + '標準仕様は1灯';
        opts.push(gp1);
        const gp2 = { code: 'GP2', name_ja: 'ダウンライト（LED）2灯', name_zh: '筒灯(LED) 2灯' };
        gp2.price = 28000;
        gp2.sizes = ['1216', '0914', '0912'];   // 0812 は 2灯/タテライン照明不可
        gp2.partNumber = o.partNumber || '';
        gp2.note = '0812サイズは2灯選択不可';
        opts.push(gp2);
      } else {
        opts.push(convertOption(o, c.id));
      }
    });
  }
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: 0, pages: c.pages || [],
    description_zh: c.note || '',
    options: opts
  });
});

const meta = {
  source: 'LIXIL シャワーユニット NS/SP（2026 価格掲載版，PDF 70頁；SP=スタンダード档 FZ/FX タイプ，已含于 4 タイプ矩阵）',
  brand: 'LIXIL シャワーユニット NS',
  series: 'NS',
  productNo: 'NSPB-{サイズ}L{床A/B}{タイプ}-C+H(C){ドア位置}',
  productNoExample: 'NSPB-0914LAUZ-C+H(C)RL',
  product: 'シャワーユニット（淋浴单元・浴槽なし）',
  currency: 'JPY',
  taxRate: 0.10,
  rmbRate: 0.8,                           // ★ 人民币系数（仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '表示価格は全て税抜（メーカー希望小売価格）、取付費別途・オプション別。＋＝加价、－＝減价。',
  basePlan: d.meta.basePlan || { size: '1216', type: 'UX', price: 1053000 },
  typeBasePrices: typeBase,
  typeNames: d.meta.typeNames || {},
  typeNote: '',
  types: TYPE_KEYS.slice(),
  sizes: d.sizes.map(s => s.code),
  sizeNames: d.meta.sizeNames || {},
  region: { H: { nameJa: '一般地仕様', nameZh: '一般地区规格', add: 0 }, C: { nameJa: '寒冷地仕様', nameZh: '寒冷地区规格', add: 5000 } },
  doorPositions: ['RL', 'LR', 'RC', 'LC'],
  // ★ 壁パネルベース（四面墙板色）公共表 —— wizard/quote 统一读取（跳色花纹先选、四面墙板色后选）
  wallBases: [
    { code: 'HN301', name_ja: '鏡面ホワイト', name_zh: '镜面白', cls: 'high', priceDiff: 0 },
    { code: 'HT541', name_ja: 'ランダムウッド', name_zh: '随机木纹', cls: 'high', priceDiff: 0 },
    { code: 'HT613', name_ja: 'スタッコベージュ', name_zh: '灰泥米色', cls: 'high', priceDiff: 0 },
    { code: 'HT611', name_ja: 'シルバーグレー', name_zh: '银灰', cls: 'high', priceDiff: 0 },
    { code: 'LE301', name_ja: 'マットホワイト', name_zh: '哑光白', cls: 'basic', priceDiff: 0 }
  ],
  photoSetFormula: d.meta.photoSetFormula || '写真セット価格 = 標準仕様価格 + オプション合計価格（税別・取付費別途）',
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t27 数据接入',
  method: '从 data/shower-data.json（data-analyst 提取，MiMo 复核壁柄/シャワー表）转换；不确定项见 数据提取说明.md',
  quoteNote: d.meta.quoteNote || '長納期（200mm角タイル+2週間）・販売終了品（2026年7月14日）に注意。',
  coldRegionPatterns: d.meta.coldRegionPatterns || {},
  _stats: d.meta._stats || {}
};

const out = { meta, categories };
const header = '/* LIXIL シャワーユニット NS 选型报价系统数据（由 gen-products.js 从 shower-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.LSHOWER_DATA\n' +
  ' * 价格字段：priceDiff / price / priceByType(UZ|UX|FZ|FX) / pricesBySize（含 tile 特殊键=タイル床時）/ priceByTypeGroup / priceByFaucetGroup / priceByTypeFaucet / priceByDoorType / priceByDoorWidth / priceByClass / priceByCombo / photoSetPrice\n' +
  ' * 壁パネル两段：wall（0 全面張り/1 アクセントB面）+ wall_pattern（23 柄：premium1/high/basic + fullWallCode/accentCodeByBase 5ベース列）\n' +
  ' * 人民币系数 rmbRate=0.8 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
const body = header + 'window.LSHOWER_DATA = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(DST, body, 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(body));
console.log('categories=' + categories.length + ', options=' + categories.reduce((n, c) => n + c.options.length, 0));
