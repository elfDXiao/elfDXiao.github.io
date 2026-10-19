// fix-official-20261019.js — 依 2026-08 価格掲載版 カタログ P110-P147 逐表复核结果修正源 JSON
//   依据：E:/.../lidea-bathroom/_verify_official_20261019/（official_p*.txt 表抽提 + imgs/*.png 放大图）
//   用法：node test/fix-official-20261019.js [--dry]   → 修改 lidea-data.json（之后跑 test/gen-products.js 生成 products.js）
//   原备注：本轮只改「官方明确可读」的格；形状维度（エコベンチ等）未建，形状相关差异写进 note 记为已知局限。
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
  Object.keys(patch).forEach(k => {
    if (patch[k] === undefined) delete o[k]; else o[k] = patch[k];
  });
  const after = {};
  Object.keys(patch).forEach(k => { after[k] = JSON.stringify(o[k]); });
  const chg = Object.keys(patch).filter(k => before[k] !== after[k]);
  if (chg.length) log.push(c + ' | ' + code + ' | ' + chg.map(k => k + ': ' + before[k] + ' → ' + after[k]).join(' ; '));
}
function add(c, option, atIndex) {
  const arr = cat(c).options;
  if (arr.some(o => String(o.code) === String(option.code))) return;
  if (atIndex == null) arr.push(option); else arr.splice(atIndex, 0, option);
  log.push(c + ' | +' + option.code + ' | ' + option.name_ja);
}

/* ============ P.114 床：Cタイプ列（1E/1C/1A=+50,000、1F/1D/1B=+70,000）・2E/2C/2A は C 専用 ============ */
set('floor', '1E', { priceDiff: undefined, priceByType: { HBM: 0, C: 50000 }, note: 'P.114：HBM標準仕様／C+¥50,000（C列は1Aまで同額）' });
set('floor', '1C', { priceDiff: undefined, priceByType: { HBM: 0, C: 50000 } });
set('floor', '1A', { priceDiff: undefined, priceByType: { HBM: 0, C: 50000 }, note: undefined });
set('floor', '1F', { priceDiff: undefined, priceByType: { HBM: 20000, C: 70000 }, note: 'P.114：HBM+¥20,000／C+¥70,000（C列は1Bまで同額）' });
set('floor', '1D', { priceDiff: undefined, priceByType: { HBM: 20000, C: 70000 } });
set('floor', '1B', { priceDiff: undefined, priceByType: { HBM: 20000, C: 70000 } });
['2E', '2C', '2A'].forEach(code => set('floor', code, { priceDiff: undefined, priceByType: { C: 0 }, types: ['C'], note: 'P.114：Cタイプ専用（H/B/Mは―）' }));

/* ============ P.117 浴槽排水栓：プッシュ=HBM±0/C+15,000、ゴム栓=HBM(FRP)−15,000/C(FRP)±0（パール不可） ============ */
set('bathtub', 'DRAIN3', { priceByType: { HBM: 0, C: 15000 }, note: 'P.117：プッシュワンウェイ＝HBM標準仕様／C+¥15,000（材質問わず）' });
set('bathtub', 'DRAIN1', {
  priceByType: { PearlQuartz: { HBM: null, C: null }, FRP: { HBM: -15000, C: 0 } },
  note: 'P.117：ゴム栓＝HBM(FRP/ルフレトーン)−¥15,000／C(FRP/ルフレトーン)標準仕様／パール・クォーツは―'
});

/* ============ P.128 カウンター：NY（カウンターなし 585mm）=HBM−35,000/C±0、XV は C ―、AC1/AC2 は M/C×1624・S1818 ============ */
set('counter', 'NY', { priceDiff: undefined, priceByType: { HBM: -35000, C: 0 }, note: 'P.128：カウンターなし（洗い場側水栓取付高さUB.FL〜585mm）＝HBM−¥35,000／C±¥0' });
set('counter', 'XV', { priceDiff: undefined, priceByType: { HBM: 0 }, note: 'P.128：Cタイプは―（XU行と同額セル）' });
['AC1', 'AC2'].forEach(code => set('counter', code, { sizes: ['1624', 'S1818'], types: ['M', 'C'], note: 'P.128：アッパーカウンターは1624・S1818サイズ専用（M/Cタイプ）' }));

/* ============ P.129 照明：EC/EH 標準灯数=±0（+17,900 は「1灯多い」版）／YC・YH・PC の 1620系=+3,900/+15,900 ============ */
set('lighting', 'EC', { pricesBySize: { '全サイズ': 0 }, note: 'P.129：標準仕様（1624・1620系=3灯／1616・13系・1216系=2灯）。＋1灯版は EC_UP' });
set('lighting', 'EH', { pricesBySize: { '全サイズ': 0 }, note: 'P.129：±¥0（1624・1620系=3灯／1616・13系・1216系=2灯）。＋1灯版は EH_UP' });
set('lighting', 'YC', { pricesBySize: { '1624': 3900, '1620': 3900, 'S1818': 3900, '1618': 3900, '1616': 21800, '1316': 21800, '1318': 21800, '1216': 21800, 'S1216': 21800 }, note: 'P.129：1624・1620系+¥3,900（2灯）／1616・13系・1216系+¥21,800（2灯）。1灯版は YC1' });
set('lighting', 'YH', { pricesBySize: { '1624': 3900, '1620': 3900, 'S1818': 3900, '1618': 3900, '1616': 21800, '1316': 21800, '1318': 21800, '1216': 21800, 'S1216': 21800 } });
set('lighting', 'PC', { pricesBySize: { '1624': 15900, '1620': 15900, 'S1818': 15900, '1618': 15900, '1616': 33800, '1316': 33800, '1318': 33800, '1216': 33800, 'S1216': 33800 }, note: 'P.129：1624・1620系+¥15,900（2灯）／1616・13系・1216系+¥33,800（2灯）。1灯版は PC1' });
add('lighting', { code: 'EC_UP', name_ja: 'パネルダウンライト（電球色LED）＋1灯', name_zh: '面板筒灯（暖色LED）+1灯', priceDiff: 17900, note: 'P.129：＋¥17,900（1624・1620系=4灯、1616・13系・1216系=3灯）' });
add('lighting', { code: 'EH_UP', name_ja: 'パネルダウンライト（昼光色LED）＋1灯', name_zh: '面板筒灯（昼光色LED）+1灯', priceDiff: 17900, note: 'P.129：＋¥17,900（1624・1620系=4灯、1616・13系・1216系=3灯）' });
add('lighting', { code: 'YC1', name_ja: 'スリムレクタ照明（電球色LED）（1灯）', name_zh: '细长矩形照明（暖色LED）（1灯）', pricesBySize: { '1616': -7000, '1316': -7000, '1318': -7000, '1216': -7000, 'S1216': -7000 }, note: 'P.129：1616・13系・1216系の1灯仕様 −¥7,000（照明限定壁＋追加ダウンライト併用時など）' });
add('lighting', { code: 'YH1', name_ja: 'スリムレクタ照明（昼光色LED）（1灯）', name_zh: '细长矩形照明（昼光色LED）（1灯）', pricesBySize: { '1616': -7000, '1316': -7000, '1318': -7000, '1216': -7000, 'S1216': -7000 } });
add('lighting', { code: 'PC1', name_ja: 'キュービック照明（LED）（1灯）', name_zh: '方块照明（LED）（1灯）', pricesBySize: { '1616': -1000, '1316': -1000, '1318': -1000, '1216': -1000, 'S1216': -1000 }, note: 'P.129：1616・13系・1216系の1灯仕様 −¥1,000' });

/* ============ P.130 ミラー：NN（ミラーなし）B/M/C 価格、EA は H×シャワーシステム専用、BA は C 専用、キレイ鏡は B/M/C ============ */
set('mirror', 'NN', { priceByType: { H: 0, B: { '1620': -40500, '□□18': -37500, '□□16': -31500 }, M: -13500, C: -8700 }, note: 'P.130：ミラーなし B−¥40,500〜−¥31,500（サイズ別）／M−¥13,500／C−¥8,700／H±¥0' });
set('mirror', 'EA', { priceByType: { 'H_SS': 10000 }, note: 'P.130：ミラー（1555）はHタイプ×シャワーシステム時+¥10,000（ボディハグシャワー時・B/M/Cは―）' });
set('mirror', 'BA', { types: ['C'], note: 'P.130：ミラー（3060）はCタイプ専用（B/Mは―）' });
['KIREI_N', 'KIREI_C'].forEach(code => set('mirror', code, { types: ['B', 'M', 'C'], note: 'P.130：キレイ鏡はB/M/Cタイプのみ（Hはミラー（1555）またはミラーなし）' }));

/* ============ P.132 収納：KD=HD 同価、GT=FT 同価、JT/KT=HT 同価、メタルシェルフは H(シャワーシステム)/M(S1818・以外) で分岐 ============ */
const HD = opt('storage', 'HD').priceByType, FT = opt('storage', 'FT').priceByType, HT = opt('storage', 'HT').priceByType;
const hbh = v => { const o = {}; Object.keys(v).forEach(k => { o[k === 'H' ? 'H_BH' : k] = v[k]; }); return o; };
set('storage', 'FD', { priceByType: hbh(opt('storage', 'FD').priceByType), note: 'P.132：H=ボディハグシャワー標準仕様／シャワーシステムは―。M/CはS1818以外+¥14,800/+¥24,800' });
set('storage', 'GD', { priceByType: hbh(opt('storage', 'GD').priceByType) });
set('storage', 'HD', { priceByType: hbh(HD), note: 'P.132：H(ボディハグ)−¥20,000／M S1818−¥20,000・以外−¥5,200／C S1818±¥0・以外+¥4,800（シャワーシステムは―）' });
set('storage', 'JD', { priceByType: hbh(opt('storage', 'JD').priceByType) });
set('storage', 'KD', { priceDiff: undefined, priceByType: JSON.parse(JSON.stringify(hbh(HD))), note: 'P.132：ライトグレー。価格は HD/JD と同一（価格列は HD〜KD の縦結合セル）' });
set('storage', 'FT', { priceByType: hbh(FT) });
set('storage', 'GT', { priceDiff: undefined, priceByType: JSON.parse(JSON.stringify(hbh(FT))), note: 'P.132：ブラック。価格は FT と同一（価格列は FT〜GT の縦結合セル）' });
set('storage', 'HT', { priceByType: hbh(HT), note: 'P.132：H(ボディハグ)−¥13,100／M S1818−¥13,100・以外+¥1,700／C S1818+¥6,900・以外+¥11,700' });
add('storage', { code: 'JT', name_ja: 'マグネットシェルフ180W〈ブラック〉（3段）', name_zh: '磁吸置架180W〈黑〉（3层）', priceByType: JSON.parse(JSON.stringify(hbh(HT))), note: 'P.132：価格は HT と同一（価格列は HT〜KT の縦結合セル）' });
add('storage', { code: 'KT', name_ja: 'マグネットシェルフ180W〈ライトグレー〉（3段）', name_zh: '磁吸置架180W〈浅灰〉（3层）', priceByType: JSON.parse(JSON.stringify(hbh(HT))), note: 'P.132：価格は HT と同一（価格列は HT〜KT の縦結合セル）' });

// メタルシェルフ8種：H=シャワーシステム+値／M=S1818と以外で分岐／C=―
const metal = {
  '2G': { hss: -11800, mNotS: 3000 }, '2T': { hss: 200, mNotS: 15000 },
  '3G': { hss: -800, mNotS: 14000 }, '3T': { hss: 17200, mNotS: 32000 },
  'L2': { hss: 6200, mNotS: 21000 }, '2Q': { hss: 18200, mNotS: 33000 },
  'L3': { hss: 26200, mNotS: 41000 }, '3Q': { hss: 44200, mNotS: 59000 }
};
Object.keys(metal).forEach(code => {
  const m = metal[code];
  const yen = n => (n < 0 ? '−¥' : '+¥') + Math.abs(n).toLocaleString('en-US');
  const sz = {};
  ['1216', '1316', '1318', '1616', '1618', '1620', '1624', 'S1216'].forEach(s => { sz[s] = m.mNotS; });
  sz['S1818'] = m.hss;
  set('storage', code, {
    priceDiff: undefined,
    priceByType: { 'H_SS': m.hss, M: sz },
    note: 'P.132：H×シャワーシステム' + yen(m.hss) +
      '／M S1818 ' + yen(m.hss) + '・S1818以外 +¥' + m.mNotS.toLocaleString('en-US') + '／Cは―'
  });
});
['1U', '2U', 'SB4', 'SB5', 'SB3'].forEach(code => set('storage', code, { types: ['B'], note: 'P.131：Bタイプ専用（スマートエスコートバー）' }));
set('storage', 'AA', { priceDiff: undefined, priceByType: { 'H_SS': 60000 }, note: 'P.131：浴槽側メタルシェルフ600WはH×シャワーシステム専用 +¥60,000' });
set('storage', 'BA', { priceDiff: undefined, priceByType: { 'H_SS': 70000 }, note: 'P.131：浴槽側メタルシェルフ600W〈ブラック〉はH×シャワーシステム専用 +¥70,000' });

/* ============ P.140 保温：S20 トラップ保温材は寒冷地 ±0 ============ */
set('misc_options', 'S20', { priceByType: undefined, priceDiff: 3000, coldPriceDiff: 0, note: 'P.140：一般地+¥3,000／寒冷地±¥0' });

/* ============ P.126 シャワーヘッド：FF/FG は B/M/C のみ（H表に無い） ============ */
['FF', 'FG'].forEach(code => set('shower_head', code, {
  priceByType: { 'ThermoMetal/WideLever': { B: 0, M: 0, C: 22000 } },
  note: 'P.126：スイッチ付エコアクアシャワーSPA。B/M標準仕様・C+¥22,000（Hタイプは―／黒水栓・シャワーシステムは―）'
}));

/* ============ P.127 シャワーフック・スライドバー：B 専用モデルの分岐、GC/HC の M/C 価格 ============ */
set('shower_hook', 'GE', { priceByType: { 'UruAri': { B: 0 }, 'UruNashi': null }, note: 'P.127：Bタイプ（うるつや浄水あり）標準仕様' });
set('shower_hook', 'GF', { priceByType: { 'UruAri': { B: -5000 }, 'UruNashi': null }, note: 'P.127：Bタイプ（うるつや浄水あり）−¥5,000' });
set('shower_hook', 'GC', { priceByType: { 'UruAri': null, 'UruNashi': { B: 0, M: -3000, C: 25000 } }, note: 'P.127：B±¥0（うるつやなし）／M−¥3,000／C+¥25,000' });
set('shower_hook', 'GD', { priceByType: { 'UruAri': null, 'UruNashi': { B: -5000 } }, note: 'P.127：Bタイプ（うるつや浄水なし）−¥5,000・M/Cは―' });
set('shower_hook', 'HC', { priceByType: { 'UruAri': null, 'UruNashi': { B: 6000, M: 3000, C: null } }, note: 'P.127：B+¥6,000／M+¥3,000／Cは―' });
set('shower_hook', 'HD', { priceByType: { 'UruAri': null, 'UruNashi': { B: 1000 } }, note: 'P.127：Bタイプ＋¥1,000・M/Cは―' });

/* ============ P.128 シャワーホースフック：うるつや×サイズ（M S1818）×兼用水栓 で分岐 ============ */
const HK = {
  'HK1': { UruNashi_BM_Futsu: 1000, UruNashi_MS_Futsu: -2000, UruNashi_C_Futsu: -2000 },
  'HK2': { UruNashi_BM_Futsu: 3000, UruNashi_MS_Futsu: 0, UruNashi_C_Futsu: 0 },
  'HK4': { UruNashi_BM_Futsu: 3000, UruNashi_MS_Futsu: 0 },
  'HK5': { UruNashi_BM_Futsu: 3500, UruNashi_MS_Futsu: 500, UruNashi_C_Futsu: 500 },
  'HK_N': { UruAri_BM: 0, UruNashi_BM_Kan: 0, UruAri_C: -3000, UruNashi_C_Kan: -3000 }
};
Object.keys(HK).forEach(code => set('urutuya', code, {
  priceDiff: undefined, priceByType: HK[code],
  note: 'P.128：うるつや浄水あり／なし（兼用水栓・以外）×B/M S1818以外・M S1818・C で分岐（表の空欄＝―）'
}));

/* ============ P.144 給水給湯配管：エ・ニ 追加、ウ（U）は浴槽側水栓あり専用 ============ */
set('water_pipe', 'U', { priceDiff: undefined, priceByType: { FaucetNone: null, WallFaucet: 0 }, note: 'P.144：浴槽パンなし・延長配管なし・浴槽側B面壁貫通金具（浴槽側水栓あり専用 ±¥0）' });
add('water_pipe', { code: 'E', name_ja: '給水給湯配管（エ）B面壁貫通金具', name_zh: '给水给汤配管（エ）B面壁贯通用金具', priceByType: { FaucetNone: null, WallFaucet: 0 }, note: 'P.144：浴槽パンあり・延長配管なし・洗い場側ブッシング／浴槽側B面壁貫通金具（浴槽側水栓あり専用 ±¥0）' });
add('water_pipe', { code: 'NI', name_ja: '給水給湯配管（ニ）床貫通＋B面壁貫通金具', name_zh: '给水给汤配管（ニ）地面贯通用金具＋B面壁贯通用金具', priceByType: { FaucetNone: null, WallFaucet: 59000 }, note: 'P.144：浴槽パンあり・延長配管あり・洗い場側床貫通金具＋樹脂管3.5m／浴槽側B面壁貫通金具（浴槽側水栓あり +¥59,000／なしは―）' });

/* ============ 输出 ============ */
if (!DRY) fs.writeFileSync(SRC, JSON.stringify(d, null, 2) + '\n', 'utf8');
log.forEach(l => console.log((DRY ? '[dry] ' : '') + l));
console.log('---- changes: ' + log.length + (DRY ? ' (dry run)' : '，已写回 lidea-data.json；请跑 node test/gen-products.js'));