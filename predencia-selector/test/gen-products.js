// gen-products.js — 从 predencia-data.json 生成 web/data/products.js（window.PREDENCIA_DATA）
// 用法：node test/gen-products.js
// 转换：
//  - 尺寸键：S1216/1216/1317/1418/1616/1620（規格 6 サイズ、1620 は戸建のみ、1216/1317/1418 はマンションのみ）
//  - plan 分类：3 個基本プラン（high_design/basic/shoulder_yumi）从 meta.basePriceTable.plans 合并戸建/マンション 2 列 → pricesBySize
//  - size 分类：重建为 6 サイズ卡片，pricesByType = {プランcode: 价格}（无タイプ、プラン×サイズ矩阵）
//  - ぴったりサイズ：meta.pitariMatrix（9 浴槽行 × 13 間口列）从 pitari_size 分类的 priceBySize 重建
//  - 价格字段：priceBySize → pricesBySize；priceDiff/price/priceByType 保留
//  - bathtub 形状 sizes 硬编码（relax/wide → 1616/1620，round → S1216/1216/1317/1418）
//  - faucet 加 counterFor 标注（QS_dual/QS_ART/none）供カウンター連動；pitari_faucet 同
//  - wall_panel/floor 加 cls 标注（premium/high）供分组显示
//  - partNumber 从 name_ja 前缀提取（^[A-Z0-9][A-Z0-9\-/]*）
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'D:/DSH工作区/takara-predencia/data/predencia-data.json';
const DST = path.join(__dirname, '..', 'data', 'products.js');

const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const SIZES = ['S1216', '1216', '1317', '1418', '1616', '1620'];

/* ---------------- 工具 ---------------- */
function extractPartNo(nameJa) {
  if (!nameJa) return '';
  const m = String(nameJa).match(/^[A-Za-z0-9][A-Za-z0-9\-/]{3,}/);
  return m ? m[0].replace(/\/+$/, '') : '';
}

/* 規格 bathtub 形状 → 対応サイズ（研究文档 §8.3） */
const BATHTUB_SIZES = {
  relax_lounge_bench: ['1616', '1620'],
  relax_lounge: ['1616', '1620'],
  wide_bench: ['1616', '1620'],
  round: ['S1216', '1216', '1317', '1418']
};

/* lighting 尺寸（S=1216/S1216，L=1317/1418/1616/1620） */
function lightingSizes(code) {
  if (/_S$/.test(code)) return ['S1216', '1216'];
  if (/_L$/.test(code)) return ['1317', '1418', '1616', '1620'];
  return null;
}

/* mirror 尺寸（code 内嵌） */
function mirrorSizes(code) {
  if (/^(luxury_full_S|luxury_shelf_S|wide_clear_S|wide_clear_shelf)$/.test(code)) return ['S1216', '1216', '1616'];
  if (/^luxury_full_1317|luxury_shelf_1317|wide_clear_1317$/.test(code)) return ['1317'];
  if (/^luxury_full_1418|luxury_shelf_1418|wide_clear_1418$/.test(code)) return ['1418'];
  if (/^luxury_full_1620|luxury_shelf_1620|wide_clear_1620|wide_clear_shelf_1620$/.test(code)) return ['1620'];
  return null; // 其余全尺寸
}

/* bathtub_faucet 尺寸（KM83GCUTK ラウンド浴槽サイズ用） */
function bathtubFaucetSizes(code) {
  if (code === 'KM83GCUTK') return ['S1216', '1216', '1317', '1418'];
  return null; // TO-TBV034ZTKN / KM159GCR24 全サイズ
}

/* 規格 faucet → counterFor */
function faucetCounterFor(catId, code) {
  if (catId === 'faucet') return code === 'SB280L_RABHK' ? 'QS_dual' : 'QS_ART';
  return 'none'; // faucet_none_counter / overhead_shower / dual_faucet
}

/* pitari_faucet → counterFor（code 前缀） */
function pitariFaucetCounterFor(code) {
  if (code === 'SB280L_RABHK_p') return 'QS_dual';
  if (/^(SB182|SB181|FTB)/.test(code)) return 'QS';
  if (/^ART_/.test(code)) return 'ART';
  return 'none'; // none_p_* / overhead_p_* / dual_p_*
}

/* 壁柄クラス（price>0 → premium） */
function clsOf(price) {
  return (typeof price === 'number' && price > 0) ? 'premium' : 'high';
}

function convertOption(o, catId) {
  const out = { code: o.code, name_ja: o.name_ja, name_zh: o.name_zh };
  if (o.priceDiff != null) out.priceDiff = o.priceDiff;
  if (o.price != null) out.price = o.price;
  if (o.priceBySize) out.pricesBySize = o.priceBySize;
  if (o.priceByType) out.priceByType = o.priceByType;
  if (o.priceByCounter) out.priceByCounter = o.priceByCounter;
  if (o.priceByClass) out.priceByClass = o.priceByClass;   // wall_design 壁模式×クラス组合价矩阵
  if (o.pattern) out.pattern = o.pattern;                  // wall_design 模式（1FACE/ALL4/2TONE）
  if (o.constraints) out.constraints = o.constraints;
  if (o.note) out.note = o.note;
  if (o.default) out.default = true;
  const pn = extractPartNo(o.name_ja);
  if (pn && pn.length >= 4) out.partNumber = pn;
  if (o.code === 'handbar_integrated' || (o.price === 'unknown')) out.priceUnknown = true;

  // bathtub 形状 → sizes
  if (catId === 'bathtub' && BATHTUB_SIZES[o.code]) out.sizes = BATHTUB_SIZES[o.code];
  // lighting → sizes
  if (catId === 'lighting') { const ls = lightingSizes(o.code); if (ls) out.sizes = ls; }
  // mirror → sizes
  if (catId === 'mirror') { const ms = mirrorSizes(o.code); if (ms) out.sizes = ms; }
  // bathtub_faucet → sizes
  if (catId === 'bathtub_faucet') { const bs = bathtubFaucetSizes(o.code); if (bs) out.sizes = bs; }
  // floor / wall_panel → cls
  if (catId === 'floor' || catId === 'wall_panel') out.cls = clsOf(o.price);
  // faucet 系 → counterFor + priceMode
  if (catId === 'faucet' || catId === 'faucet_none_counter' || catId === 'overhead_shower' || catId === 'dual_faucet') {
    out.counterFor = faucetCounterFor(catId, o.code);
    // 计价模式：part=水栓単体（另加カウンター価格）；total=総額（含カウンター差額，カウンター不再计）
    out.priceMode = (catId === 'faucet') ? 'part' : 'total';
  }
  if (catId === 'pitari_faucet') {
    out.counterFor = pitariFaucetCounterFor(o.code);
    out.priceMode = 'total'; // ぴったり水栓価格=水栓+カウンター合計
  }
  // ★ 規格 faucet SB280L/RABHK：数据 priceBySize 是「水栓⊕71,000+デュアルカウンター⊕270,000/276,000」総額
  //   → カウンター分類と重複計上しないよう、水栓単体 ⊕71,000 に変換（全尺寸同額）
  if (catId === 'faucet' && o.code === 'SB280L_RABHK') {
    out.price = 71000;
    delete out.pricesBySize;
    out.note = (o.note ? o.note + '；' : '') + '水栓単体 ⊕71,000（デュアルカウンター価格は counter 分類から計上）';
  }
  // ★ 規格 counter none：カウンターなし減額は faucet_none_counter 等の総額に含まれる → 単体価格 0
  if (catId === 'counter' && o.code === 'none') {
    out.pricesBySize = { 'S1216': 0, '1216': 0, '1317': 0, '1418': 0, '1616': 0, '1620': 0 };
    out.note = (o.note ? o.note + '；' : '') + 'カウンターなし減額は洗い場用水栓（カウンターなし仕様）の総額に含まれます';
  }
  // unknown 価格 → 选择不可（不设 priceDiff，避免误计 0 元）
  if (out.priceUnknown) { out.price = null; delete out.priceDiff; }

  const hasPrice = (out.priceDiff != null) || (out.price != null) || out.pricesBySize || out.priceByType;
  if (!hasPrice && !out.priceUnknown && catId !== 'plan' && catId !== 'size' && catId !== 'mode' && catId !== 'bathtub' && catId !== 'bathtub_color' && catId !== 'apron_color' && catId !== 'counter_cover' && catId !== 'bath_lid' && catId !== 'ceiling' && catId !== 'wall_design' && catId !== 'pitari_counter') out.priceDiff = 0;
  return out;
}

/* ---------------- plan 分类：合并 basePriceTable.plans + 自带 priceBySize ---------------- */
const basePlans = (d.meta.basePriceTable && d.meta.basePriceTable.plans) || {};
const PLAN_MERGE = { high_design: 'ハイデザインプラン', basic: 'ベーシックプラン', shoulder_yumi: '肩包み湯プラン' };

function mergePlanPrices(planCode) {
  const name = PLAN_MERGE[planCode];
  const merged = {};
  const entry = basePlans[name];
  if (!entry) return null;
  ['戸建て用', 'マンション・戸建階上用'].forEach(function (col) {
    const bySize = entry[col];
    if (!bySize) return;
    Object.keys(bySize).forEach(function (sz) {
      if (bySize[sz] != null) merged[sz] = bySize[sz];
    });
  });
  return merged;
}

const planCat = d.categories.find(function (c) { return c.id === 'plan'; });
const planOptions = planCat.options.map(function (o) {
  const out = convertOption(o, 'plan');
  if (!out.pricesBySize && PLAN_MERGE[o.code]) {
    const mp = mergePlanPrices(o.code);
    if (mp) out.pricesBySize = mp;
  }
  return out;
});

/* ---------------- size 分类（6 サイズ卡片，pricesByType = plan 键） ---------------- */
const sizeOptions = SIZES.map(function (sz) {
  const pricesByType = {};
  planOptions.forEach(function (p) {
    const v = (p.pricesBySize && typeof p.pricesBySize[sz] === 'number') ? p.pricesBySize[sz] : null;
    pricesByType[p.code] = v;
  });
  const o = { code: sz, name_ja: sz + 'サイズ', name_zh: sz + '尺寸', setPrice: true, pricesByType: pricesByType };
  const sn = (d.meta.sizeNames || {})[sz];
  if (sn) {
    const m = sn.match(/^(.+?)(（.*）)?$/);
    o.name_ja = sn.split('（')[0];
    o.note = sn;
  }
  return o;
});

/* ---------------- ぴったりサイズ meta（9 浴槽行 × 13 間口列） ---------------- */
const pitariSizeCat = d.categories.find(function (c) { return c.id === 'pitari_size'; });
const pitariOpt = pitariSizeCat ? pitariSizeCat.options[0] : null;
const PITARI_COLS = ['1450/1475', '1525/1550', '1625/1650', '1675/1700', '1725/1750', '1825/1850', '1925/1950', '2025', '2050/2075', '2125/2150', '2225/2250', '2325/2350', '2425/2450'];
const PITARI_ROW_ZH = {
  'S12浴槽（奥行1218/1243）': 'S12浴缸（进深1218/1243）',
  '12浴槽ラウンド（奥行1268/1293）': '12浴缸圆角（进深1268/1293）',
  '13浴槽ラウンド（奥行1318/1343/1368/1393）': '13浴缸圆角（进深1318〜1393）',
  '14浴槽ラウンド（奥行1418/1443/1468/1493）': '14浴缸圆角（进深1418〜1493）',
  'ラウンド浴槽（奥行1518/1543/1568/1593）': '圆角浴缸（进深1518〜1593）',
  '16浴槽（奥行1618/1643/1668）': '16浴缸（进深1618〜1668）',
  'くつろぎラウンジ浴槽（奥行1693）': '休闲躺椅浴缸（进深1693）',
  'くつろぎラウンジ浴槽（ベンチ付）（奥行1718/1743/1768/1793）': '休闲躺椅浴缸带座凳（进深1718〜1793）',
  'くつろぎラウンジ浴槽（ベンチ付）（奥行1818/1843/1868）': '休闲躺椅浴缸带座凳（进深1818〜1868）'
};
const PITARI_ROW_CODE = {
  'S12浴槽（奥行1218/1243）': 'S12',
  '12浴槽ラウンド（奥行1268/1293）': 'R12',
  '13浴槽ラウンド（奥行1318/1343/1368/1393）': 'R13',
  '14浴槽ラウンド（奥行1418/1443/1468/1493）': 'R14',
  'ラウンド浴槽（奥行1518/1543/1568/1593）': 'ROUND',
  '16浴槽（奥行1618/1643/1668）': 'R16',
  'くつろぎラウンジ浴槽（奥行1693）': 'RL',
  'くつろぎラウンジ浴槽（ベンチ付）（奥行1718/1743/1768/1793）': 'RLB',
  'くつろぎラウンジ浴槽（ベンチ付）（奥行1818/1843/1868）': 'RLB2'
};
let pitariMatrix = null;
if (pitariOpt && pitariOpt.priceBySize) {
  const rowNames = Object.keys(pitariOpt.priceBySize);
  const prices = rowNames.map(function (r) { return pitariOpt.priceBySize[r]; });
  pitariMatrix = {
    note: pitariOpt.note || '',
    rows: rowNames.map(function (r, i) {
      return { code: PITARI_ROW_CODE[r] || ('P' + i), name_ja: r, name_zh: PITARI_ROW_ZH[r] || r, prices: prices[i] };
    }),
    cols: PITARI_COLS.map(function (c, i) { return { code: 'C' + i, name_ja: c }; })
  };
}

/* ---------------- categories ---------------- */
const categories = [];
// mode 分类（step0 顶部）
categories.push({
  id: 'mode', name_ja: 'サイズモード', name_zh: '尺寸模式', step: 0,
  description_zh: '規格サイズ（プラン×6 尺寸）または ぴったりサイズ（受注生産・間口×浴槽行マトリクス）',
  options: [
    { code: 'std', name_ja: '規格サイズ', name_zh: '标准尺寸', priceDiff: 0, default: true },
    { code: 'pitari', name_ja: 'ぴったりサイズ', name_zh: '严丝合缝尺寸', priceDiff: 0, note: '受注生産品（納期要問合せ）' }
  ]
});
categories.push({
  id: 'size', name_ja: 'サイズ', name_zh: '尺寸', step: 0,
  description_zh: '規格 6 サイズ（1620 戸建のみ、1216/1317/1418 マンションのみ、1616/S1216 両用）。プラン×サイズ套装价矩阵（无タイプ）',
  options: sizeOptions
});

d.categories.forEach(function (c) {
  if (c.id === 'size' || c.id === 'pitari_size') return;
  const opts = c.options.map(function (o) { return convertOption(o, c.id); });
  // ★ pitari_counter に none（カウンターなし）を追加：減額は pitari_faucet の none_p_* 総額に含まれる
  if (c.id === 'pitari_counter') {
    opts.push({ code: 'none', name_ja: 'カウンターなし', name_zh: '无台面', price: 0,
      note: 'カウンターなし減額はぴったり用水栓（カウンターなし仕様 none_p_*）の総額に含まれます', counterFor: 'none' });
  }
  categories.push({
    id: c.id, name_ja: c.name_ja || c.id, name_zh: c.name_zh || c.id,
    step: 0, pages: c.pages || [],
    description_zh: c.note || '',
    options: opts
  });
});

/* ---------------- meta ---------------- */
const meta = {
  source: 'タカラスタンダード プレデンシア（PREDENCIA）システムバスルーム 2026 価格掲載版（PDF 131頁）',
  brand: 'TAKARA STANDARD プレデンシア（Predencia）',
  series: 'PREDENCIA',
  productNo: 'プラン品番 PLAN01〜（形式未確定）；部品/オプションは個別品番（SB182-HB1HK 等）',
  productNoExample: 'プレデンシア規格（例 1616・ハイデザインプラン）／ぴったりサイズ（間口×浴槽行）',
  product: 'システムバスルーム（整体浴室・タイプ概念なし）',
  currency: 'JPY',
  taxRate: 0.10,
  rmbRate: 1.2,                            // ★ 人民币系数（用户自定义，仅计算用，页面不显示）
  priceNote: d.meta.priceNote || '全価格は税抜（希望小売価格・搬入/取付費別途）。⊕=基本セット価格からの加算、⊖=減算。基本部材=差額0。',
  basePlan: d.meta.basePlan || null,
  basePriceTable: d.meta.basePriceTable || null,
  planPrices: (function () {
    const pp = {};
    planOptions.forEach(function (p) { pp[p.code] = p.pricesBySize || {}; });
    return pp;
  })(),
  plans: planOptions.map(function (p) { return p.code; }),
  planNames: (function () {
    const n = {};
    planOptions.forEach(function (p) { n[p.code] = p.name_ja; });
    return n;
  })(),
  sizes: SIZES.slice(),
  sizeNames: d.meta.sizeNames || {},
  pitariMatrix: pitariMatrix,
  photoSetFormula: d.meta.photoSetFormula || '',
  quoteNote: '肩包み湯/うるぽか湯ファイン/ヘルシージェットは戸建て仕様（1616/1620）のみ。ぴったりサイズは受注生産品。うるぽか湯×漏水受け不可（漏水受け部材の選択肢なし）。',
  generatedBy: 'gen-products.js (engineer, AgentTeams 浴室选型系统专家团) — t42 数据接入',
  method: '从 data/predencia-data.json（data-analyst 提取）转换；プラン 3 基本款合并 basePriceTable.plans；ぴったり矩阵重建；价格 unknown 项置 price=null 选择不可；不确定项见 数据提取说明.md §5',
  _stats: d.meta._stats || {}
};

const out = { meta: meta, categories: categories };
const header = '/* タカラスタンダード プレデンシア（Predencia）选型报价系统数据（由 gen-products.js 从 predencia-data.json 生成，请勿手改）\n' +
  ' * 命名空间：window.PREDENCIA_DATA\n' +
  ' * 价格字段：priceDiff / price / pricesBySize（6 規格尺寸键）/ pricesByType（plan 键）\n' +
  ' * 无タイプ概念：プラン（12）× サイズ（6）= 套装价矩阵（meta.planPrices）；价格 = プラン套装价 + Σ差 + Σオプション\n' +
  ' * ぴったりサイズ：meta.pitariMatrix（9 浴槽行 × 13 間口列）套装价主体；counter/faucet/door/lighting/mirror 用 pitari_* 分类\n' +
  ' * 人民币系数 rmbRate=1.2 仅存在于 meta（页面不显示算式）\n' +
  ' */\n';
const body = header + 'window.PREDENCIA_DATA = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(DST, body, 'utf8');
console.log('products.js written, bytes=' + Buffer.byteLength(body));
console.log('categories=' + categories.length + ', options=' + categories.reduce(function (n, c) { return n + c.options.length; }, 0));
if (pitariMatrix) console.log('pitariMatrix rows=' + pitariMatrix.rows.length + ', cols=' + pitariMatrix.cols.length);
