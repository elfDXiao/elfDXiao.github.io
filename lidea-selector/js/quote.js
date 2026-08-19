/**
 * quote.js — LIXIL Lidea（リデア）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.LIDEA.quote。
 * 依赖：window.LIDEA_DATA（products.js，由 lidea-data.json 生成）、window.LIDEA.price
 *
 * 计价模型（全部手册价为税抜き）：
 *   本体価格（税抜）= 標準仕様価格（meta.typeBasePrices[タイプ][サイズ]） + Σ选项差价
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.7）—— 系数仅在计算代码中，页面不显示算式
 *   写真セット価格 = 標準仕様価格 + オプション合計価格
 *
 * 条件键 priceByType（非タイプ字符键）按当前选择解析：
 *   water_pipe    FaucetNone/WallFaucet（浴槽側水栓 有無）
 *   shower_head   ThermoMetal/WideLever・ShowerSystem・BlackFaucet（水栓種）
 *   shower_hook   UruAri/UruNashi（うるつや浄水 有無）
 *   support_pack  H16/B16/M16/H13/...（タイプ+尺寸组）
 *   其余：タイプ字符匹配（H|B|M|C 或组键 HBM/BMC/HMC/BM 等，price.js priceByTypeValue）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（16 步：0-15，参考手册 Select Guide 顺序） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ', titleZh: '尺寸与型号', note: '选择尺寸（9 種）与型号（H/B/M/C）＋地域（一般/寒冷地），決定標準仕様価格（タイプ×サイズ矩阵）。1624/S1818 仅 M/C。' },
    { n: 1, title: 'ドア位置・下部据付', titleZh: '门位置·基础', note: 'ドア位置（RL/LR/RC/LC＋移動 100~400mm）、ボルト脚/吊架台、浴槽パン（S なし/W あり）。' },
    { n: 2, title: '壁パネル', titleZh: '壁面', note: '全面張り/アクセント張り（B面/C面）× 4 クラス（プレミアムⅡ/Ⅰ・ハイ・ベーシック）。' },
    { n: 3, title: '床', titleZh: '地板', note: 'キレイサーモフロア 単色 3/加飾 3＋単色（C タイプ標準 2E）。' },
    { n: 4, title: '浴槽', titleZh: '浴缸', note: '浴槽デザイン×素材×色、エプロン、排水栓、浴槽内握りバー、ヘッドレスト。' },
    { n: 5, title: 'フロフタ・フック', titleZh: '浴缸盖·挂钩', note: 'サーモバスS 有無×薄型保温 2/3 枚・腰掛付、フロフタフック（保温/3点式/マグネット/巻フタ）。' },
    { n: 6, title: '天井', titleZh: '天花板', note: '内組平天井（廻し縁なし/付）×壁高 2200/2000/1900＋平天井 J。' },
    { n: 7, title: '換気設備', titleZh: '换气设备', note: '天井換気扇/換気乾燥暖房機（100/200V・プラズマクラスター・2/3室）＋ランドリーパイプ＋洗面室暖房機。' },
    { n: 8, title: 'ドア', titleZh: '门', note: '開き戸/折り戸/2枚引戸/片引戸/フィラー付×段差×幅×高さ×カラー。' },
    { n: 9, title: '水栓', titleZh: '水龙头', note: '洗い場側（H 専用/B M C）＋ボディハグシャワー＋浴槽側水栓＋兼用水栓。' },
    { n: 10, title: 'シャワー', titleZh: '花洒', note: 'シャワーヘッド（H 専用/B M C）＋シャワーフック/スライドバー/スライドフック付握りバー。' },
    { n: 11, title: 'うるつや・カウンター', titleZh: '净水·台面', note: 'うるつや浄水（B M 標準）＋シャワーホースフック＋カウンター（まる洗い/とるピカスリム/なし）。' },
    { n: 12, title: '照明・ミラー', titleZh: '照明·镜子', note: 'パネルダウンライト/スリムレクタ/キュービック/ダウンライト/調光調色＋ミラー（ワイド/タテ長/マグネット系）。' },
    { n: 13, title: '収納・マグネット', titleZh: '收纳·磁吸件', note: 'スマートエスコートバー/マグネット/メタルシェルフ＋追加マグネットアイテム（禁則なし）。' },
    { n: 14, title: 'タオル・握りバー', titleZh: '毛巾杆·扶手', note: 'タオル掛 10 種＋握りバー（Ⅰ型/L型 メタル/ホワイト）。' },
    { n: 15, title: '付加オプション', titleZh: '附加选项', note: 'サポートパック/浴室テレビ/追いだき/アクアジェット/おそうじ浴槽/窓額縁/給水給湯/保温材・その他。' }
  ];

  /* ---------------- 维度配置 ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['H', 'B', 'M', 'C'], titleJa: 'タイプ', titleZh: '型号' },
    { id: 'region', step: 0, cat: 'region', kind: 'radio',
      basic: { code: 'REGION_H', nameJa: '一般地（H）', nameZh: '一般地区（H）' },
      codes: ['C'], titleJa: '地域区分', titleZh: '地域' },
    // step 1
    { id: 'door_position', step: 1, cat: 'door_position', kind: 'radio', codes: 'ALL', titleJa: 'ドア位置', titleZh: '门位置' },
    { id: 'kudai', step: 1, cat: 'kudai', kind: 'radio', codes: 'ALL', titleJa: 'ボルト脚・吊架台', titleZh: '螺栓脚·吊架台' },
    { id: 'bathtub_pan', step: 1, cat: 'bathtub_pan', kind: 'radio',
      basic: { code: 'PAN_S', nameJa: '浴槽パンなし（S）', nameZh: '无浴缸底盘（S）' },
      codes: ['W'], titleJa: '浴槽パン', titleZh: '浴缸底盘' },
    // step 2
    { id: 'wall', step: 2, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁パネル', titleZh: '壁面' },
    // step 3
    { id: 'floor', step: 3, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床', titleZh: '地板' },
    // step 4
    { id: 'bt_tub', step: 4, cat: 'bathtub', kind: 'radio', codes: ['BT_SHAPE', 'T6', 'T7', 'T8', 'TR', 'TT', 'TS', 'TW', 'TU', 'TV', 'TA', 'TB', 'TC', 'TD'], titleJa: '浴槽（形状・素材・色）', titleZh: '浴缸（形状·材质·色）' },
    { id: 'bt_apron', step: 4, cat: 'bathtub', kind: 'radio', codes: ['EP1', 'EP2', 'EP7', 'EPB', 'EPC', 'EPD'], titleJa: 'エプロン', titleZh: '裙板' },
    { id: 'bt_drain', step: 4, cat: 'bathtub', kind: 'radio', codes: ['DRAIN3', 'DRAIN1', 'DRAIN5'], titleJa: '浴槽排水栓', titleZh: '浴缸排水栓' },
    { id: 'bt_bar', step: 4, cat: 'bathtub', kind: 'radio', codes: ['BAR1', 'BAR2', 'BARN'], titleJa: '浴槽内握りバー', titleZh: '浴缸内扶手' },
    { id: 'bt_headrest', step: 4, cat: 'bathtub', kind: 'radio', none: true, codes: ['A34', 'A35'], titleJa: 'ヘッドレスト', titleZh: '头枕' },
    // step 5
    { id: 'bt_lid', step: 5, cat: 'bathtub', kind: 'radio', codes: ['SB_A', 'SB_B', 'FT_D', 'FT_F', 'FT_H'], titleJa: 'フロフタ', titleZh: '浴缸盖' },
    { id: 'bt_lidhook', step: 5, cat: 'bathtub', kind: 'radio', codes: ['FK_H', 'FK_G', 'FK_F', 'FK_E', 'FK_K', 'FK_L', 'FK_M', 'MAKI1', 'MAKIB', 'FK_N'], titleJa: 'フロフタフック', titleZh: '浴缸盖挂钩' },
    // step 6
    { id: 'ceiling', step: 6, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    // step 7
    { id: 'fan', step: 7, cat: 'fan', kind: 'radio', codes: 'ALL', titleJa: '換気設備', titleZh: '换气设备' },
    // step 8
    { id: 'door', step: 8, cat: 'door', kind: 'radio', codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    // step 9
    { id: 'faucet', step: 9, cat: 'faucet', kind: 'radio',
      basic: { code: 'FAUCET_BASIC', nameJa: '基本水栓（タイプ別）', nameZh: '基本水龙头（按型号）' },
      codes: ['D4', 'D5', 'R1', 'R2', 'H3', 'H4', 'QQ', 'E1', 'S5'], titleJa: '洗い場側水栓', titleZh: '洗手区水龙头' },
    { id: 'body_hug', step: 9, cat: 'faucet', kind: 'radio', codes: ['BDY_A', 'BDY_B', 'BDY_N'], titleJa: 'ボディハグシャワー', titleZh: '环抱式花洒' },
    { id: 'tub_faucet', step: 9, cat: 'faucet', kind: 'radio',
      basic: { code: 'TUB_NONE', nameJa: '浴槽側水栓なし（NN）', nameZh: '无浴缸侧水龙头（NN）' },
      codes: ['BP', 'BQ', 'BR', 'BT'], titleJa: '浴槽側水栓', titleZh: '浴缸侧水龙头' },
    { id: 'faucet_misc', step: 9, cat: 'faucet', kind: 'multi', codes: ['A80', 'A81'], titleJa: '取付脚断熱カバー', titleZh: '安装脚隔热罩' },
    // step 10
    { id: 'shower_head', step: 10, cat: 'shower_head', kind: 'radio',
      basic: { code: 'SHOWER_BASIC', nameJa: 'シャワーヘッド（基本）', nameZh: '花洒头（基本）' },
      codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'shower_hook', step: 10, cat: 'shower_hook', kind: 'radio', codes: 'ALL', titleJa: 'シャワーフック・スライドバー', titleZh: '花洒挂钩·滑杆' },
    // step 11
    { id: 'urutuya', step: 11, cat: 'urutuya', kind: 'radio',
      basic: { code: 'URU_BASIC', nameJa: 'うるつや浄水（タイプ別基本）', nameZh: '润泽净水（按型号）' },
      codes: ['A', 'N'], titleJa: 'うるつや浄水', titleZh: '润泽净水' },
    { id: 'hose_hook', step: 11, cat: 'urutuya', kind: 'radio', none: true, codes: ['HK1', 'HK2', 'HK4', 'HK5'], titleJa: 'シャワーホースフック', titleZh: '花洒软管挂钩' },
    { id: 'counter', step: 11, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター', titleZh: '台面' },
    // step 12
    { id: 'lighting', step: 12, cat: 'lighting', kind: 'radio',
      basic: { code: 'LIGHT_BASIC', nameJa: '照明（基本）', nameZh: '照明（基本）' },
      codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    { id: 'mirror', step: 12, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    // step 13
    { id: 'storage', step: 13, cat: 'storage', kind: 'radio',
      codes: ['1U', '2U', 'SB4', 'SB5', 'SB3', 'AA', 'BA', 'FD', 'GD', 'HD', 'JD', 'KD', 'FT', 'GT', 'HT', '2G', '2T', '3G', '3T', 'L2', '2Q', 'L3', '3Q', 'AS', 'BS', 'CS', 'DS', 'ES', 'LS', 'MS', 'PS', 'QS', 'RS', 'AC', 'BC', 'CC', 'DC', 'EC', 'LC', 'MC', 'PC', 'QC', 'RC'],
      titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'magnet', step: 13, cat: 'storage', kind: 'multi',
      codes: ['A70', 'A71', 'A72', 'A73', 'A74', 'A75', 'A76', 'A77', 'A78', 'A79', 'A83', 'A84', 'A85', 'A86', 'A87', 'A88', 'A89', 'A90', 'A91', 'A92', 'A96', 'A97', 'A98', 'A99', 'M03', 'A93', 'A94', 'A95'],
      titleJa: '追加マグネットアイテム', titleZh: '追加磁吸件' },
    // step 14
    { id: 'towel', step: 14, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛', titleZh: '毛巾杆' },
    { id: 'grip_bar', step: 14, cat: 'grip_bar', kind: 'radio', none: true, codes: 'ALL', titleJa: '握りバー', titleZh: '扶手' },
    // step 15
    { id: 'support_pack', step: 15, cat: 'support_pack', kind: 'radio', none: true, codes: 'ALL', titleJa: 'サポートパック', titleZh: '支援套装' },
    { id: 'bathroom_tv', step: 15, cat: 'bathroom_tv', kind: 'multi', codes: 'ALL', titleJa: '浴室テレビ・サウンド', titleZh: '浴室电视·音响' },
    { id: 'oidaki', step: 15, cat: 'oidaki', kind: 'radio', none: true, codes: 'ALL', titleJa: '追いだき加工', titleZh: '追焚加工' },
    { id: 'aqua_jet', step: 15, cat: 'aqua_jet', kind: 'radio', none: true, codes: 'ALL', titleJa: 'アクアジェット・ふろ水利用', titleZh: '水射流·剩水利用' },
    { id: 'osouji', step: 15, cat: 'osouji', kind: 'multi', codes: 'ALL', titleJa: 'おそうじ浴槽・IoT', titleZh: '自动清洁浴缸·IoT' },
    { id: 'window_frame', step: 15, cat: 'window_frame', kind: 'multi', codes: 'ALL', titleJa: '窓額縁・補強', titleZh: '窗框·加固' },
    { id: 'water_pipe', step: 15, cat: 'water_pipe', kind: 'radio', codes: 'ALL', titleJa: '給水給湯配管', titleZh: '给水给汤配管' },
    { id: 'misc_options', step: 15, cat: 'misc_options', kind: 'multi', codes: 'ALL', titleJa: '保温材・その他', titleZh: '保温材·其他' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1616',            // 尺寸 code（默认 1616）
    doorPos: 'RL',           // ドア位置（默认 RL；由 door_position 维度同步）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    rate: null,              // 汇率（1日元=人民币）
    quoteHead: { no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: '' },
    lang: 'both'
  };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }
  function catOpts(d) { var c = cat(d.cat); return c ? c.options : []; }
  function codesOf(d) {
    if (Array.isArray(d.codes)) return d.codes.slice();
    return catOpts(d).map(function (o) { return o.code; });
  }
  function opt(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var list = catOpts(d);
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].code) === String(code)) return list[i];
    }
    return null;
  }
  function selOpt(dimId) {
    var c = state.sel[dimId];
    return c == null ? null : opt(dimId, c);
  }
  function sizeOption() {
    return cat('size') ? cat('size').options.find(function (o) { return o.code === state.size; }) : null;
  }

  function typeCode() {
    var o = selOpt('type');
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'M');
  }
  function sizeCode() { return state.size || '1616'; }
  function doorPosCode() {
    var c = state.sel.door_position;
    return c ? c : 'RL';
  }
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /** 基本セット価格（meta.typeBasePrices[タイプ][サイズ]）＋寒冷地加价 */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    var v = 0;
    if (tbp) {
      var bySize = tbp[typeCode()];
      if (bySize) v = typeof bySize[sizeCode()] === 'number' ? bySize[sizeCode()] : 0;
    }
    // 寒冷地（region=C）標準 ＋¥5,000
    if (selIs('region', 'C')) v += 5000;
    return v;
  }

  function isVirtualBasic(code) {
    return code === 'REGION_H' || code === 'PAN_S' || code === 'FAUCET_BASIC' || code === 'TUB_NONE' ||
      code === 'SHOWER_BASIC' || code === 'URU_BASIC' || code === 'LIGHT_BASIC';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 条件键上下文（非タイプ字符键） ---------------- */
  function currentFaucetKind() {
    var c = state.sel.faucet;
    if (c === 'H3' || c === 'H4') return 'ShowerSystem';
    if (c === 'D5') return 'BlackFaucet';
    if (c === 'D4' || c === 'R1' || c === 'R2' || c === 'QQ' || c === 'E1' || c === 'S5') return 'ThermoMetal/WideLever';
    return 'ThermoMetal/WideLever';   // 默认 D4 壁付サーモ（メタル）
  }
  function currentBathtubFaucet() {
    var c = state.sel.tub_faucet;
    return (c === 'BP' || c === 'BQ' || c === 'BR' || c === 'BT') ? 'WallFaucet' : 'FaucetNone';
  }
  function currentUru() {
    return selIs('urutuya', 'A') ? 'UruAri' : 'UruNashi';
  }
  /** 尺寸组后缀匹配（support_pack 键 H16/H13 等） */
  function supportPackKeyMatch(rest, size) {
    if (!rest) return true;
    var sg = DATA.meta.sizeGroups || {};
    var g16 = (sg['16□□'] || '').split('・');
    var g1316 = ['1316'];
    if (rest === '16') return g16.indexOf(size) >= 0;
    if (rest === '1316') return size === '1316';
    return String(size).indexOf(rest) === 0;
  }
  /** 条件键 priceByType 解析（返回数字/文本或 null） */
  function contextPrice(option, dimId) {
    if (!option || !option.priceByType) return null;
    var key = null;
    if (dimId === 'water_pipe') key = currentBathtubFaucet();
    else if (dimId === 'shower_head') key = currentFaucetKind();
    else if (dimId === 'shower_hook') key = currentUru();
    else if (dimId === 'support_pack') {
      var p = option.priceByType;
      var t = typeCode();
      var size = sizeCode();
      var best = null;
      Object.keys(p).forEach(function (k) {
        if (k.indexOf(t) !== 0) return;
        var rest = k.slice(t.length);
        if (best == null && supportPackKeyMatch(rest, size)) best = p[k];
      });
      return best;
    }
    if (key == null) return null;
    return Object.prototype.hasOwnProperty.call(option.priceByType, key) ? option.priceByType[key] : null;
  }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    var o = opt(dimId, code);
    if (!o) return null;
    if (o.priceByType) {
      var cv = contextPrice(o, dimId);
      if (cv != null) return P.toAmount(cv);
      var tv = P.priceByTypeValue(o, typeCode());
      if (tv != null) return P.toAmount(tv);
      return null;
    }
    return P.priceFor(o, typeCode(), sizeCode());
  }

  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'radio': {
        var c = state.sel[dimId];
        return c == null ? null : radioContribution(dimId, c);
      }
      case 'multi': {
        var m = state.multi[dimId];
        if (!m) return null;
        var total = 0, allNull = true;
        Object.keys(m).forEach(function (code) {
          if (!m[code]) return;
          var v = radioContribution(dimId, code);
          if (v == null) return;
          total += v; allNull = false;
        });
        return allNull ? null : total;
      }
      default: return null;
    }
  }

  function describe(dimId) {
    var d = dim(dimId);
    var out = { nameZh: '', nameJa: '', code: '', model: '', diff: null, extra: '' };
    if (!d) return out;
    switch (d.kind) {
      case 'radio': {
        var c = state.sel[dimId];
        if (c == null) return out;
        var vb = virtualBasicOf(d);
        if (vb && vb.code === c) {
          out.nameZh = vb.nameZh; out.nameJa = vb.nameJa; out.code = vb.code; out.diff = 0;
          return out;
        }
        var o = opt(dimId, c);
        if (!o) return out;
        out.nameZh = o.name_zh || o.name_ja || '';
        out.nameJa = o.name_ja || '';
        out.code = o.code || '';
        out.model = o.selectMark || '';
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'multi': {
        var m = state.multi[dimId];
        if (!m) return out;
        var names = [], diffs = 0, allNull = true;
        Object.keys(m).forEach(function (code) {
          if (!m[code]) return;
          var o = opt(dimId, code);
          if (!o) return;
          names.push(o.name_zh || o.name_ja || code);
          var v = radioContribution(dimId, code);
          if (v != null) { diffs += v; allNull = false; }
        });
        if (!names.length) return out;
        out.nameZh = names.join('＋');
        out.nameJa = names.join('＋');
        out.diff = allNull ? null : diffs;
        return out;
      }
      default: return out;
    }
  }

  /** 汇总计算 */
  function computeQuote() {
    var base = sizeOption();
    var basePriceValue = basePrice();
    var total = basePriceValue;
    var lines = [];
    var unknown = [];
    lines.push({
      step: 0, stepZh: STEPS[0].titleZh, stepJa: STEPS[0].title,
      nameZh: '標準仕様 ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + typeCode() + 'タイプ' + (selIs('region', 'C') ? '（寒冷地）' : ''),
      nameJa: base ? base.name_ja + ' ' + typeCode() + 'タイプ' + (selIs('region', 'C') ? '（寒冷地）' : '') : sizeCode(),
      code: sizeCode() + typeCode(),
      model: productNo(), extra: '取付・設置費別（不含安装费）',
      diff: 0, base: true
    });
    DIMS.forEach(function (d) {
      if (d.step === 0) return;
      var desc = describe(d.id);
      if (!desc.nameZh && !desc.nameJa) return;
      var diff = desc.diff;
      if (diff == null) {
        unknown.push({ dimId: d.id, name: desc.nameZh || desc.nameJa, detail: desc.extra });
        return;
      }
      total += diff;
      lines.push({
        step: d.step, stepZh: STEPS[d.step].titleZh, stepJa: STEPS[d.step].title,
        nameZh: desc.nameZh, nameJa: desc.nameJa, code: desc.code, model: desc.model,
        extra: desc.extra, diff: diff, base: false
      });
    });
    var tax = Math.round(total * (DATA.meta.taxRate || 0.10));
    var totalInc = total + tax;
    // 大陆地区价格（人民币含安装费）= 日元税込 × 汇率 × rmbRate(0.7)；无有效汇率时为 null
    var rmbRate = (DATA.meta.rmbRate != null) ? DATA.meta.rmbRate : 0.7;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * rmbRate) : null;
    return {
      base: base, basePrice: basePriceValue,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: sizeCode(), type: typeCode(), doorPos: doorPosCode()
    };
  }

  /** 本体品番：BDUS/BDUW-サイズタイプ-A+H(C)ドア位置（简化：省略壁パネルL/床B/浴槽2 段；完整规则见 meta.productNo 参考） */
  function productNo() {
    var pan = selIs('bathtub_pan', 'W') ? 'W' : 'S';
    return 'BDU' + pan + '-' + sizeCode() + typeCode() + '-A+H(C)' + doorPosCode();
  }

  /* ---------------- 组合约束 ---------------- */

  function selected(dimId) { return state.sel[dimId] != null; }
  function selIs(dimId, codes) {
    var c = state.sel[dimId];
    if (c == null) return false;
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(c) >= 0;
  }
  function multiHas(dimId, codes) {
    var m = state.multi[dimId];
    if (!m) return false;
    var list = Array.isArray(codes) ? codes : [codes];
    return list.some(function (c) { return m[c]; });
  }
  function typeIs(codes) {
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(typeCode()) >= 0;
  }
  function sizeIs(codes) {
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(sizeCode()) >= 0;
  }

  /**
   * 判断某维度某选项是否禁用；返回 reason 字符串或 null。
   * 规则：数据 schema 限定 + 研究文档 §4 关键互斥/必须搭配硬编码。
   */
  function disabledReason(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var isVB = isVirtualBasic(code);
    var o = opt(dimId, code);
    if (!o && !isVB) return null;
    var size = sizeCode();
    var type = typeCode();

    // ---- 数据 schema 限定 ----
    if (!isVB) {
      if (Array.isArray(o.sizes)) {
        var okS = false;
        for (var i = 0; i < o.sizes.length; i++) {
          if (P.sizeKeyMatches(o.sizes[i], size)) { okS = true; break; }
        }
        if (!okS) return '该选项不适用于 ' + size + ' 尺寸';
      }
      if (Array.isArray(o.types) && o.types.indexOf(type) < 0) return '该选项不适用于 ' + type + ' タイプ';
      if (o.priceByType) {
        var cv = contextPrice(o, dimId);
        if (cv == null) {
          var tv = P.priceByTypeValue(o, type);
          if (tv == null) return '该タイプ/条件下不可选';
        }
      }
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价';
    }
    // 1624/S1818 仅 M/C（数据矩阵已 null，额外提示）
    if (dimId === 'type' && (size === '1624' || size === 'S1818') && (code === 'H' || code === 'B')) {
      return size + ' 仅 M/C タイプ';
    }

    // ---- 浴槽パン 与 アクアジェット/おそうじ/ふろ水利用 必须搭配 ----
    var needPan = multiHas('aqua_jet', ['K14', 'K20', 'K13']) || multiHas('osouji', 'K55');
    if (dimId === 'bathtub_pan' && code === 'W' && !needPan && false) { /* 无强制 */ }
    if (needPan && dimId === 'bathtub_pan' && code === 'PAN_S') return 'アクアジェット/おそうじ浴槽选择时浴槽パン须あり（W）';
    if (dimId === 'aqua_jet' && selIs('bathtub_pan', 'PAN_S') && !state.sel.bathtub_pan) {
      return '需浴槽パンあり（W）';
    }

    // ---- ドア位置移動 200/300/400mm 待确认（仅 100mm 定价）→ 仅提示不禁 ----

    // ---- シャワーシステム（H3/H4）× まる洗いカウンター/ダウンライト以外 ----
    var showerSys = selIs('faucet', ['H3', 'H4']);
    if (showerSys && dimId === 'counter' && code === 'XU') return 'シャワーシステム时不可选まる洗いカウンター';
    if (showerSys && dimId === 'lighting' && code !== 'GP' && code !== 'RW' && code !== 'LIGHT_BASIC' && code !== 'HP') {
      return 'シャワーシステム时仅ダウンライト可';
    }

    // ---- うるつや浄水 × ブラック/白系フック・とるピカスリム・兼用水栓 ----
    var uruA = selIs('urutuya', 'A');
    if (uruA && dimId === 'faucet' && (code === 'D5' || code === 'S5')) return 'うるつや浄水与壁付サーモブラック/兼用水栓互斥';
    if (uruA && dimId === 'counter' && code === 'VM') return 'うるつや浄水与とるピカスリムカウンター互斥';
    if (uruA && dimId === 'shower_hook' && (code === 'GE' || code === 'GF' || code === 'HC' || code === 'HD' || code === 'JB' || code === 'JC')) {
      // ブラック/ホワイト系フック禁（メタル調選択）
      var hookName = (o ? o.name_ja : '') || '';
      if (/ブラック|ホワイト/.test(hookName)) return 'うるつや浄水时ブラック/ホワイト系フック不可';
    }

    // ---- ワイドミラー × シャワーフック2個/浴室テレビ ----
    var wideMirror = selIs('mirror', ['CA', 'CC']);
    if (wideMirror && dimId === 'bathroom_tv') return 'ワイドミラー时浴室テレビ不可';
    if (wideMirror && dimId === 'shower_hook' && (code === 'PA' || code === 'QA' || code === 'RA' || code === 'AA' && false)) {
      // シャワーフック（2個）不可
      return 'ワイドミラー时シャワーフック（2個）不可';
    }

    // ---- 兼用水栓 × 浴槽側水栓 ----
    if (dimId === 'tub_faucet' && selIs('faucet', 'S5')) return '兼用水栓与浴槽側水栓互斥';
    if (dimId === 'faucet' && code === 'S5' && selected('tub_faucet') && !selIs('tub_faucet', 'TUB_NONE')) {
      return '浴槽側水栓与兼用水栓互斥';
    }

    // ---- おそうじ浴槽 × アクアジェット/ふろ水利用/サーモバスSなし ----
    var osoji = multiHas('osouji', 'K55');
    if (osoji && dimId === 'aqua_jet') return 'おそうじ浴槽时アクアジェット不可';
    if (osoji && dimId === 'bt_lid' && code === 'SB_B') return 'おそうじ浴槽时サーモバスSなし不可';

    // ---- アクアジェット4穴（K20）尺寸限定 ----
    if (dimId === 'aqua_jet' && code === 'K20' && /^13|^1216|^S1216/.test(size)) {
      return 'アクアジェット4穴不适用于 ' + size;
    }

    // ---- サポートパック不可组合（C タイプ/1624/1620ワイド/S1818） ----
    if (dimId === 'support_pack' && (type === 'C' || size === '1624' || size === 'S1818')) {
      return 'サポートパック不适用于当前型号/尺寸';
    }

    // ---- 洗面室暖房機（K58）→ プラズマクラスター搭載換気乾燥暖房機必須 ----
    if (dimId === 'fan' && code === 'K58' && !selIs('fan', ['Q', 'T'])) {
      return '洗面室暖房機需プラズマクラスター搭載換気乾燥暖房機（Q/T）';
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    if (dimId === 'aqua_jet' && (code === 'K14' || code === 'K20' || code === 'K13')) {
      if (!state.sel.bathtub_pan || state.sel.bathtub_pan === 'PAN_S') state.sel.bathtub_pan = 'W';
    }
    if (dimId === 'osouji' && code === 'K55') {
      if (!state.sel.bathtub_pan || state.sel.bathtub_pan === 'PAN_S') state.sel.bathtub_pan = 'W';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（1624/S1818 仅 M/C） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var fallback = ['M', 'C'];
      for (var i = 0; i < fallback.length; i++) {
        if (tbp[fallback[i]] && tbp[fallback[i]][code] != null) { state.sel.type = fallback[i]; break; }
      }
    }
  }

  /* ---------------- 漢数字（合计大写） ---------------- */
  var KANJI = ['零', '壱', '弐', '参', '肆', '伍', '陸', '柒', '捌', '玖'];
  function seg4(n) {
    if (n === 0) return '零';
    var digs = [Math.floor(n / 1000) % 10, Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
    var units = ['仟', '佰', '拾', ''];
    var r = '', prevZero = false;
    for (var i = 0; i < 4; i++) {
      var dgt = digs[i];
      if (dgt > 0) {
        if (prevZero && r) r += '零';
        r += KANJI[dgt] + units[i];
        prevZero = false;
      } else {
        prevZero = true;
      }
    }
    return r;
  }
  function kanjiYen(n) {
    n = Math.round(Number(n) || 0);
    if (n < 0) return 'マイナス' + kanjiYen(-n);
    if (n === 0) return '零円';
    var yi = Math.floor(n / 100000000);
    var man = Math.floor((n % 100000000) / 10000);
    var rest = n % 10000;
    var s = '';
    if (yi > 0) s += seg4(yi) + '億';
    if (man > 0) s += seg4(man) + '万';
    else if (yi > 0 && rest > 0) s += '零';
    if (rest > 0 || (yi === 0 && man === 0)) s += seg4(rest);
    return s + '円';
  }

  /* ---------------- CSV ---------------- */
  function toCSV() {
    var r = computeQuote();
    var rows = [['見積No', state.quoteHead.no], ['日付', state.quoteHead.date], ['有効期限', state.quoteHead.valid],
      ['顧客名', state.quoteHead.customer], ['施工住所', state.quoteHead.address],
      ['販売店/担当', (state.quoteHead.dealer || '') + ' ' + (state.quoteHead.person || '')],
      ['本体品番', productNo()],
      ['サイズ', r.size], ['タイプ', r.type], ['ドア位置', r.doorPos],
      ['', ''], ['区分', '品名（日）', '品名（中）', '記号', '型番', '仕様', '差額(税抜)', '金額']];
    r.lines.forEach(function (l) {
      rows.push([l.stepZh, l.nameJa, l.nameZh, l.code, l.model, l.extra,
        l.base ? '' : l.diff, l.base ? String(l.basePrice) : String(l.diff)]);
    });
    rows.push(['', '', '', '', '', '本体価格（税抜）', r.totalEx]);
    rows.push(['', '', '', '', '', '消費税（10%）', r.tax]);
    rows.push(['', '', '', '', '', '税込合計', r.totalInc]);
    var csv = rows.map(function (row) {
      return row.map(function (v) {
        v = String(v == null ? '' : v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',');
    }).join('\r\n');
    return '\ufeff' + csv;
  }

  /* ---------------- 对外 API ---------------- */
  window.LIDEA = window.LIDEA || {};
  window.LIDEA.quote = {
    init: function (data) { DATA = data; P = window.LIDEA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    typeCode: typeCode, sizeCode: sizeCode, typeGroup: typeGroup, basePrice: basePrice,
    doorPosCode: doorPosCode,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.multi = {};
      state.size = '1616';
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
