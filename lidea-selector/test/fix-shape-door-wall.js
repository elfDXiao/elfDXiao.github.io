// fix-shape-door-wall.js — 第二批官方修订：①浴槽形状维度 ②ドア位置移動适否矩阵 ③壁パネル35柄矩阵
//   依据：_verify_official_20261019/（P.115/P.116 形状×サイズ×材質、P.118/119 フロフタ、P.123 ドア位置移動、
//                                 P.113 壁パネル矩阵；door_matrix.json / wall_matrix.json 为抽表产物）
//   用法：node test/fix-shape-door-wall.js [--dry]   → 改 lidea-data.json，随后 node test/gen-products.js
'use strict';
const fs = require('fs');

const SRC = 'E:/自媒体账号阶段性成活/个人主页管理/lidea-bathroom/data/lidea-data.json';
const DRY = process.argv.indexOf('--dry') >= 0;
const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const cat = id => d.categories.find(c => c.id === id);
const opt = (c, code) => {
  const o = cat(c).options.find(x => String(x.code) === String(code));
  if (!o) throw new Error('option not found: ' + c + ' / ' + code);
  return o;
};
const log = [];
function set(c, code, patch) {
  const o = opt(c, code);
  const before = {};
  Object.keys(patch).forEach(k => { before[k] = JSON.stringify(o[k]); });
  Object.keys(patch).forEach(k => { if (patch[k] === undefined) delete o[k]; else o[k] = patch[k]; });
  const chg = Object.keys(patch).filter(k => JSON.stringify(o[k]) !== before[k]);
  if (chg.length) log.push(c + ' | ' + code + ' | ' + chg.map(k => k + ': ' + before[k] + ' → ' + JSON.stringify(o[k])).join(' ; '));
}
function add(c, option, atIndex) {
  const arr = cat(c).options;
  if (arr.some(o => String(o.code) === String(option.code))) return;
  if (atIndex == null) arr.push(option); else arr.splice(atIndex, 0, option);
  log.push(c + ' | +' + option.code + ' | ' + option.name_ja);
}

/* ============================================================
   ① 浴槽形状（P.115 表14 形状×サイズ、P.116 表1/2 材質×形状）
   ============================================================ */
const MW = ['1624', '1620'], WD = ['1624', '1620'];
const MN = ['1620', 'S1818', '1618', '1616', '1318', '1316', '1216', 'S1216'];
const EB = ['1620', 'S1818', '1618', '1616'];
const SL = ['1620', 'S1818', '1618', '1616', '1318', '1316'];
const L16 = ['1620', 'S1818', '1618', '1616'];
const L12 = ['1216'];
if (!cat('bathtub_shape')) {
  d.categories.push({
    id: 'bathtub_shape', name_ja: '浴槽形状', name_zh: '浴缸形状', step: 4, pages: [115, 116],
    description_zh: '浴槽形状（P.115 表14）：形状本身±0；可选的形状随尺寸变化',
    options: []
  });
  log.push('categories | +bathtub_shape');
}
const SHAPES = [
  { code: 'MW', name_ja: 'ミナモワイド浴槽', name_zh: 'ミナモ宽浴缸', sizes: MW, note: 'P.115：1624・1620（パール/クォーツのみ）' },
  { code: 'WD', name_ja: 'ワイド浴槽', name_zh: '宽浴缸', sizes: WD, note: 'P.115：1624・1620（ルフレトーン/FRPのみ）' },
  { code: 'MN', name_ja: 'ミナモ浴槽', name_zh: 'ミナモ浴缸', sizes: MN, note: 'P.115：1620・S1818・1618・1616・1318・1316・1216・S1216' },
  { code: 'EB', name_ja: 'エコベンチ浴槽', name_zh: '环保坐台浴缸', sizes: EB, note: 'P.115：1620・S1818・1618・1616（ルフレトーン/FRPのみ）' },
  { code: 'SL', name_ja: 'ストレートライン浴槽', name_zh: '直线浴缸', sizes: SL, note: 'P.115：1620・S1818・1618・1616・1318・1316（ルフレトーン/FRPのみ）' },
  { code: 'L16', name_ja: '1600ロング浴槽', name_zh: '1600长浴缸', sizes: L16, note: 'P.115：1620・S1818・1618・1616（ルフレトーン/FRPのみ）' },
  { code: 'L12', name_ja: '1200ロング浴槽', name_zh: '1200长浴缸', sizes: L12, note: 'P.115：1216のみ（ルフレトーン/FRPのみ）' }
];
SHAPES.forEach(s => add('bathtub_shape', { code: s.code, name_ja: s.name_ja, name_zh: s.name_zh, priceDiff: 0, sizes: s.sizes, note: s.note }));

// 材質/カラーの形状限定（P.115 表14 / P.116）
const noPearl = ['ワイド', 'ミナモ', 'エコベンチ', 'ストレートライン', '1600ロング', '1200ロング'];
const ALL9 = ['1624', '1620', '1618', 'S1818', '1616', '1318', '1316', '1216', 'S1216'];
set('bathtub', 'BT_SHAPE', { availability: undefined, sizes: ALL9 });   // 形状は形状维度へ移行
['T6', 'T7', 'T8'].forEach(c => set('bathtub', c, { availability: undefined, sizes: ['1620', 'S1818', '1618', '1616'], shapes: ['ミナモ'] }));
// パール/クォーツ ミナモワイド用（S6/S7/S8）— P.116 表1
[[ 'S6', 'S6', '〈ホワイト/CW1〉'], ['S7', 'S7', '〈ブラック/CN1〉'], ['S8', 'S8', '〈ベージュ/CY1〉']].forEach(([code, , color]) => {
  add('bathtub', {
    code, name_ja: 'パール/クォーツ' + color + '（ミナモワイド）', name_zh: '珍珠石英' + (code === 'S6' ? '（白）' : code === 'S7' ? '（黑）' : '（米）') + '（宽浴缸）',
    priceDiff: 165000, sizes: ['1624', '1620'], shapes: ['ミナモワイド'],
    codesByShape: { 'ミナモワイド': code }, material: 'パールクォーツ',
    note: 'P.116：パール/クォーツ+¥165,000（ミナモワイド浴槽ではS6/S7/S8）'
  });
});
['TR', 'TT', 'TS', 'TW', 'TU', 'TV', 'TA', 'TB', 'TC', 'TD'].forEach(code => set('bathtub', code, { availability: undefined, sizes: ALL9, shapes: noPearl }));

/* P.140 S21 床気密材：1624・1620（ワイド浴槽）=+11,000／それ以外=+10,000（形状キーで分岐） */
set('misc_options', 'S21', { pricesBySize: undefined, priceByType: { 'Wide': 11000, 'Narrow': 10000 }, note: 'P.140：1624・1620（ワイド浴槽）+¥11,000／それ以外 +¥10,000' });

/* ============================================================
   ② ドア位置移動（P.123）：マトリクスを meta に載せる
   ============================================================ */
const dm = JSON.parse(fs.readFileSync('E:/自媒体账号阶段性成活/个人主页管理/lidea-bathroom/_verify_official_20261019/door_matrix.json', 'utf8'));
d.meta.doorMoveMatrix = {
  note: 'P.123 ドア位置移動 適否：35 列 = 5 移動区分（無/100/200/300/400mm）× 7 ドア種（折700/折800・フィラー付700/開700/開800/2枚800/2枚900/片引800）、行 = サイズ区分',
  columns: ['fold700', 'fold800', 'swing700', 'swing800', 'slide800', 'slide900', 'single800'],
  rows: { RL_LR: dm.RL_LR, RC_LC: dm.RC_LC }
};
log.push('meta | doorMoveMatrix（RL/LR 3 行 + RC/LC 4 行 × 35 列）');

/* ============================================================
   ③ 壁パネル 35 柄 × 7 列（P.113）：meta にマトリクス、wall_design/wall_base カテゴリ新設
   ============================================================ */
const wm = JSON.parse(fs.readFileSync('E:/自媒体账号阶段性成活/个人主页管理/lidea-bathroom/_verify_official_20261019/wall_matrix.json', 'utf8'));
const BASE_COLS = [['full', '全面張り', '全面张贴'], ['HN301', '鏡面ホワイト/HN301', '镜面白/HN301'], ['HN986', 'クルムホワイト/HN986', '库鲁姆白/HN986'],
  ['HT614', 'モルティオダーク/HT614', '莫尔蒂奥深色/HT614'], ['HT613', 'スタッコベージュ/HT613', '斯塔科米色/HT613'],
  ['HT611', 'シルバーグレー/HT611', '银灰/HT611'], ['LE301', 'マットホワイト/LE301', '哑光白/LE301']];
d.meta.wallPanelMatrix = {
  note: 'P.113 壁パネル 35 柄 × 7 列（全面張り＋ベースパネル6種）品番コード；照明限定＝照明限定壁パネルに使える柄',
  columns: BASE_COLS.map(c => ({ key: c[0], name_ja: c[1], name_zh: c[2] }))
};
if (!cat('wall_design')) {
  d.categories.push({ id: 'wall_design', name_ja: '壁パネル柄（デザイン）', name_zh: '壁面花色', step: 2, pages: [113], description_zh: '装饰面（アクセント）/全面張り的设计花色（P.113）', options: [] });
  d.categories.push({
    id: 'wall_base', name_ja: 'ベースパネル', name_zh: '基板花色', step: 2, pages: [113],
    description_zh: 'アクセント張り时选基板花色（P.113 7 列）；全面張り时选「全面張り」', options: []
  });
  log.push('categories | +wall_design / +wall_base');
}
BASE_COLS.forEach((c, i) => add('wall_base', {
  code: i === 0 ? 'FULL' : c[0], name_ja: c[1], name_zh: c[2], priceDiff: 0,
  baseRank: i === 0 ? 'full' : (c[0] === 'LE301' ? 'basic' : 'high'),
  note: 'P.113 ベースパネル列'
}));
wm.forEach(it => add('wall_design', {
  code: it.design_code, name_ja: it.design + '/' + it.design_code, name_zh: it.design,
  priceDiff: 0, designClass: it.class.replace('クラス', ''), panelCodes: it.panelCodes, lightingOnly: it.lightingOnly,
  note: 'P.113 ' + it.class + '：全面張り ' + (it.panelCodes.full || '―')
}));
log.push('meta | wallPanelMatrix（' + wm.length + ' 柄）');
if (!cat('wall_limited')) {
  d.categories.push({ id: 'wall_limited', name_ja: '照明限定壁パネル', name_zh: '照明限定壁面板', step: 2, pages: [110, 111, 113],
    description_zh: '照明限定壁パネル（P.113 で「照明限定」标记的柄×ベースのみ）', options: [] });
  add('wall_limited', { code: 'LIMITED', name_ja: '照明限定壁パネル', name_zh: '照明限定壁面板', priceDiff: 0,
    note: 'P.110-P.111/P.113：柄×ベースが照明限定対応の組合せのみ選択可（照明の灯数制限は P.129 ※1-3）' });
  log.push('categories | +wall_limited');
}

/* ============================================================
   ★ 形状で分岐する価格（表示と計算を同じキーで解決）
   ============================================================ */
// P.117 浴槽内握りバー〈メタル〉：1318/1316 と エコベンチ/1600ロング/ストレートライン = +27,000、他 +37,000
set('bathtub', 'BAR2', { pricesBySize: undefined, priceByType: { 'Compact': 27000, 'Eco': 27000, 'Std': 37000 },
  note: 'P.117：1318・1316 と エコベンチ/1600ロング/ストレートライン浴槽+¥27,000／その他（ミナモ系・1216/S1216）+¥37,000' });
// P.118 薄型保温3枚組フタ：1624・1620（ワイド/ミナモワイド）+9,000／他+6,000／1216・S1216 は―
set('bathtub', 'FT_F', { pricesBySize: undefined, priceByType: { 'Wide': 9000, 'Narrow': 6000, 'None': null },
  note: 'P.118：1624・1620（ワイド浴槽）+¥9,000／S1818・1620〜13□□（非ワイド）+¥6,000／1216・S1216 は―' });
// P.117 エプロン色 7/B/C/D：ミナモワイド/ミナモ浴槽のみ
['EP7', 'EPB', 'EPC', 'EPD'].forEach(code => set('bathtub', code, { shapes: ['ミナモワイド', 'ミナモ'],
  note: 'P.117：ミナモワイド浴槽・ミナモ浴槽のみ（ミナモワイド/ミナモ以外は―）' }));

if (!DRY) fs.writeFileSync(SRC, JSON.stringify(d, null, 2) + '\n', 'utf8');
log.forEach(l => console.log((DRY ? '[dry] ' : '') + l));
console.log('---- changes: ' + log.length + (DRY ? ' (dry run)' : '，已写回 lidea-data.json；请跑 node test/gen-products.js'));