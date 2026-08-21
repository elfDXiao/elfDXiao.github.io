/**
 * quote.js — LIXIL シャワーユニット NS 选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.LSHOWER.quote。
 * 依赖：window.LSHOWER_DATA（products.js，由 shower-data.json 生成）、window.LSHOWER.price
 *
 * 计价模型（全部手册价为税抜き・取付費別途・オプション別）：
 *   本体価格（税抜）= 標準仕様価格（meta.typeBasePrices[タイプ][サイズ]）＋Σ选项差价（寒冷地 +¥5,000）
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.8）—— 系数仅在计算代码中，页面不显示算式
 *   写真セット価格 = 標準仕様価格 + オプション合計価格（photo_set 维度参考）
 *
 * 壁パネル两段式：wall（0 全面張り／1 アクセント張りB面）→ wall_pattern（柄 23 種）
 *   - 全面張り：priceByClass（premium1 +30,000／high ±0／basic −50,000；鏡面ホワイト/HN301 標準）
 *   - アクセント：priceByCombo（premium1×high +10,000／premium1×basic −10,000／high×high ±0／high×basic −20,000）
 *   - ベース 5 種（HN301/HT541/HT613/HT611 = ハイクラス、LE301 = ベーシック）由 accentCodeByBase 校验
 *
 * 条件键（水栓種連動）：
 *   shower_head   priceByFaucetGroup（UZUX_tower/UZUX_sysMetal/UZUX_black/FZFX_other/FZFX_bst）
 *   shower_hook   priceByTypeFaucet（UZ/UX_tower/UX_sys/FZFX_other/FZFX_bst）
 *   shower_hose_hook priceByFaucetGroup（tower/sysMetal/sysBlack/other/bst）
 *   storage       priceByTypeGroup（UZUX/FZFX）
 *   door_handle / door_color 6  priceByDoorType（開き戸/開き戸強化ガラス/テンパー開き戸2000H/2200H/テンパー2枚引き戸）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（11 步：0-10，シャワーユニット＝無浴槽） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ・地域', titleZh: '尺寸·型号·地域', note: '选择尺寸（4 種内寸）与型号（UZ/UX/FZ/FX）＋地域区分（一般/寒冷地＋¥5,000），決定標準仕様価格（タイプ×サイズ矩阵）。照片组合套餐（12 プラン）参考。' },
    { n: 1, title: 'ドア位置', titleZh: '门位置', note: 'ドア位置（RL/LR/RC/LC 標準仕様，100mm移動なし）。テンパー2枚引き戸は RL/LR のみ等、ドア位置により選択できるドア種が異なる。' },
    { n: 2, title: '壁パネル', titleZh: '壁面', note: '全面張り（プレミアムⅠ +30,000／ハイ ±0／ベーシック −50,000）／アクセント張りB面（組合せ ＋10,000〜−20,000）→ 柄 23 種（プレミアムⅠ/ハイ/ベーシック）。' },
    { n: 3, title: '床・ベンチ', titleZh: '地板·座椅', note: '岩肌調単色 標準／サーモフロア（UZ/FZ +30,000）／200mm角タイル（+210,000〜370,000・長納期）。ベンチ（UZ/FZ のみ：フルワイド 1216以外・グランザ 1216）。' },
    { n: 4, title: '天井・換気・照明', titleZh: '天花板·换气·照明', note: '平天井（ホワイト/ブラック×壁高2000/2100/2200）＋換気設備（グリル/換気扇/換気乾燥暖房機 1216・FZ/FXのみ）＋照明（ダウンライト/タテライン/スリム）。' },
    { n: 5, title: 'ドア', titleZh: '门', note: '折り戸 標準／開き戸 キレイドア／開き戸（強化ガラス）／テンパー開き戸／テンパー2枚引き戸＋ドアカラー・開き戸ハンドル・間仕切りユニット。' },
    { n: 6, title: '水栓', titleZh: '水龙头', note: 'UZ=アクアタワー 標準／UX=シャワーシステム（OG1）標準／FZ・FX=壁付サーモ水栓（クロマーレS）シャワー専用標準＋ボディハグシャワー（UX・壁付サーモOG1と組合せ）。' },
    { n: 7, title: 'シャワー・フック', titleZh: '花洒·挂钩', note: 'シャワーヘッド（UZ/UX=スプレー・FZ/FX=エコアクア 標準）＋シャワーフック・スライドフック付握りバー＋シャワーホースフック。' },
    { n: 8, title: 'ミラー・収納・タオル', titleZh: '镜子·收纳·毛巾', note: 'ミラー（なし 標準／1555／スリットミラー UZのみ）＋収納（メタルシェルフ/コーナー棚）＋タオル掛。' },
    { n: 9, title: '握りバー・配管・据付', titleZh: '扶手·配管·安装', note: '握りバー（Ⅰ型/L型）＋給水給湯配管（壁貫通金具 標準／E面接続）＋下部据付方法（ボルト脚/吊架台 UX・FXのみ）。' },
    { n: 10, title: 'オプション', titleZh: '附加选项', note: 'ドレン排水管/ボルト脚用接着剤/防振ゴム/配管避けボルト脚架台/排水フレキホース＋フリーサイズドア額縁・窓額縁・根太受けプレート。' }
  ];

  /* ---------------- 维度配置（32 分类映射，door 分类拆分 4 维度） ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['UZ', 'UX', 'FZ', 'FX'], titleJa: 'タイプ', titleZh: '型号' },
    { id: 'region', step: 0, cat: 'region', kind: 'radio',
      basic: { code: 'REGION_H', nameJa: '一般地仕様（H）', nameZh: '一般地区（H）' },
      codes: ['C'], titleJa: '地域区分', titleZh: '地域' },
    { id: 'photo_set', step: 0, cat: 'photo_set', kind: 'radio', codes: 'ALL', titleJa: '写真セット（セットプラン）', titleZh: '照片组合套餐' },
    // step 1
    { id: 'door_position', step: 1, cat: 'door_position', kind: 'radio', codes: 'ALL', titleJa: 'ドア位置', titleZh: '门位置' },
    // step 2
    { id: 'wall', step: 2, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁パネル', titleZh: '壁面' },
    // step 3
    { id: 'floor', step: 3, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床', titleZh: '地板' },
    { id: 'bench', step: 3, cat: 'bench', kind: 'radio', codes: 'ALL', titleJa: 'ベンチ（UZ/FZ のみ）', titleZh: '座椅' },
    // step 4
    { id: 'ceiling', step: 4, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    { id: 'fan', step: 4, cat: 'fan', kind: 'radio', codes: 'ALL', titleJa: '換気設備', titleZh: '换气设备' },
    { id: 'lighting', step: 4, cat: 'lighting', kind: 'radio', codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    // step 5
    { id: 'door', step: 5, cat: 'door', kind: 'radio', codes: ['ケ1', 'ケE', 'A1', 'A8', 'B1', 'オ1', 'オ9', 'TE'], titleJa: 'ドア', titleZh: '门' },
    { id: 'door_color', step: 5, cat: 'door_color', kind: 'radio', codes: 'ALL', titleJa: 'ドアカラー', titleZh: '门色' },
    { id: 'door_handle', step: 5, cat: 'door', kind: 'radio', none: true, codes: ['HD', 'HB', 'HC'], titleJa: '開き戸ハンドル', titleZh: '平开门把手' },
    { id: 'door_towel_bar', step: 5, cat: 'door', kind: 'radio', none: true, codes: ['A60'], titleJa: 'ドア外タオル掛', titleZh: '门外毛巾架' },
    { id: 'partition', step: 5, cat: 'partition', kind: 'radio', none: true, codes: 'ALL', titleJa: '間仕切りユニット（FIX窓）', titleZh: '隔断单元' },
    // step 6
    { id: 'faucet', step: 6, cat: 'faucet', kind: 'radio', codes: 'ALL', titleJa: '水栓', titleZh: '水龙头' },
    { id: 'bodyhug', step: 6, cat: 'bodyhug', kind: 'radio', none: true, codes: 'ALL', titleJa: 'ボディハグシャワー（UX のみ）', titleZh: '拥抱花洒' },
    { id: 'faucet_cover', step: 6, cat: 'faucet_cover', kind: 'radio', none: true, codes: 'ALL', titleJa: '取付脚断熱カバー', titleZh: '安装脚隔热罩' },
    // step 7
    { id: 'shower_head', step: 7, cat: 'shower_head', kind: 'radio', codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'shower_hook', step: 7, cat: 'shower_hook', kind: 'radio', codes: 'ALL', titleJa: 'シャワーフック・握りバー', titleZh: '花洒挂钩·扶手' },
    { id: 'shower_hose_hook', step: 7, cat: 'shower_hose_hook', kind: 'radio', none: true, codes: 'ALL', titleJa: 'シャワーホースフック', titleZh: '花洒软管挂钩' },
    // step 8
    { id: 'mirror', step: 8, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    { id: 'storage', step: 8, cat: 'storage', kind: 'radio', codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'towel', step: 8, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛', titleZh: '毛巾架' },
    // step 9
    { id: 'grip_bar', step: 9, cat: 'grip_bar', kind: 'radio', none: true, codes: 'ALL', titleJa: '握りバー', titleZh: '扶手' },
    { id: 'supply_piping', step: 9, cat: 'supply_piping', kind: 'radio', codes: 'ALL', titleJa: '給水給湯配管', titleZh: '给水给汤配管' },
    { id: 'mount', step: 9, cat: 'mount', kind: 'radio', codes: 'ALL', titleJa: '下部据付方法', titleZh: '下部安装方式' },
    // step 10
    { id: 'window_frame', step: 10, cat: 'window_frame', kind: 'radio', none: true, codes: 'ALL', titleJa: 'フリーサイズ窓額縁・補強', titleZh: '自由尺寸窗框' },
    { id: 'door_frame', step: 10, cat: 'door_frame', kind: 'radio', none: true, codes: 'ALL', titleJa: 'フリーサイズドア額縁・化粧枠', titleZh: '自由尺寸门框' },
    { id: 'other_options', step: 10, cat: 'other_options', kind: 'multi', codes: 'ALL', titleJa: 'その他オプション', titleZh: '其他选项' },
    { id: 'misc', step: 10, cat: 'misc', kind: 'radio', none: true, codes: 'ALL', titleJa: '根太受けプレート', titleZh: '地梁托板' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1216',            // 尺寸 code（默认 1216）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    sub: {},                 // { wall_pattern: 柄 code, wall_base: ベース code }  壁パネル第二段
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
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'UX');
  }
  function sizeCode() { return state.size || '1216'; }
  function doorPosCode() {
    var c = state.sel.door_position;
    return c ? c : 'RL';
  }

  /** 壁パネル花纹数据 */
  function wallPatterns() { return (cat('wall_pattern') && cat('wall_pattern').options) || []; }
  function wallPattern(code) {
    return wallPatterns().find(function (p) { return String(p.code) === String(code); }) || null;
  }
  function wallMode() {
    var w = state.sel.wall;
    return w == null ? null : String(w);
  }
  /** 壁パネルベース（四面墙板色）公共表（meta.wallBases，wizard 渲染/quote 缺省读取） */
  function wallBases() {
    return (DATA.meta && DATA.meta.wallBases) || [
      { code: 'HN301', name_ja: '鏡面ホワイト', name_zh: '镜面白', cls: 'high' },
      { code: 'LE301', name_ja: 'マットホワイト', name_zh: '哑光白', cls: 'basic' }
    ];
  }
  /** 当前ベース（アクセント時；默认 = 数据表 default 标记或第一个） */
  function wallBase() {
    if (state.sub.wall_base) return state.sub.wall_base;
    var bs = wallBases();
    var def = null;
    for (var i = 0; i < bs.length; i++) { if (bs[i].default) { def = bs[i].code; break; } }
    return def || (bs.length ? bs[0].code : 'HN301');
  }
  /** ベースクラス：HN301/HT541/HT613/HT611=ハイ、LE301=ベーシック */
  function baseClassOf(b) { return b === 'LE301' ? 'basic' : 'high'; }

  /** 壁パネル贡献（wall 选项 priceByClass/priceByCombo × 花纹 class） */
  function wallContribution() {
    var w = wallMode();
    if (w == null) return null;
    var wallOpt = opt('wall', w);
    var pc = state.sub.wall_pattern;
    if (w === '0') {
      if (!pc) return 0;                       // 未指定柄 = 鏡面ホワイト（ハイクラス 標準）
      var pat = wallPattern(pc);
      if (!pat || !pat.class) return null;
      var byClass = wallOpt && wallOpt.priceByClass;
      var v = byClass ? byClass[pat.class] : null;
      return typeof v === 'number' ? v : null;
    }
    // アクセント張りB面
    var base = wallBase();
    if (!pc) return null;                      // 需选花纹
    var p2 = wallPattern(pc);
    if (!p2 || !p2.accentCodeByBase) return null;
    var combo = p2.accentCodeByBase[base];
    if (!combo || combo === 'fullwall') return null;
    var clsKey = p2.class === 'premium1' ? 'premium' : p2.class;
    var key = clsKey + 'X' + baseClassOf(base);   // premiumXhigh / premiumXbasic / highXhigh / highXbasic
    var byCombo = wallOpt && wallOpt.priceByCombo;
    var v2 = byCombo ? byCombo[key] : null;
    return typeof v2 === 'number' ? v2 : null;
  }

  /** 花纹品番（注文コード）：全面 → fullWallCode；アクセント → accentCodeByBase[ベース] */
  function wallPatternPartNo(code) {
    var pat = wallPattern(code);
    if (!pat) return '';
    var w = wallMode();
    if (w === '0') return pat.fullWallCode || '';
    if (w === '1') {
      var base = wallBase();
      var combo = pat.accentCodeByBase && pat.accentCodeByBase[base];
      return (combo && combo !== 'fullwall') ? combo : '';
    }
    return '';
  }

  /** 花纹禁用原因（wall_pattern 第二段） */
  function wallPatternDisabled(code) {
    var pat = wallPattern(code);
    if (!pat) return '花纹不存在';
    var w = wallMode();
    if (w === '0') return null;                // 全柄可全面張り
    if (w === '1') {
      var base = wallBase();
      var combo = pat.accentCodeByBase && pat.accentCodeByBase[base];
      if (!combo) return '该花纹不支持ベース ' + base;
      if (combo === 'fullwall') return '该ベース下为全面張り扱い，不可作アクセント';
      return null;
    }
    return null;
  }

  /** ベース选项禁用原因（アクセント時 base chips） */
  function wallBaseDisabled(baseCode) {
    var w = wallMode();
    if (w === '0') return '全面張り时无需ベース';
    var has = wallPatterns().some(function (p) {
      var c = p.accentCodeByBase && p.accentCodeByBase[baseCode];
      return c && c !== 'fullwall';
    });
    return has ? null : '无花纹支持该ベース';
  }

  /** 花纹价格文本（全面/アクセント对应） */
  function wallPatternPrice(code) {
    var w = wallMode();
    var wallOpt = opt('wall', w);
    var pat = wallPattern(code);
    if (!pat) return null;
    if (w === '0') {
      var v = wallOpt && wallOpt.priceByClass ? wallOpt.priceByClass[pat.class] : null;
      return typeof v === 'number' ? v : null;
    }
    if (w === '1') {
      var base = wallBase();
      var combo = pat.accentCodeByBase && pat.accentCodeByBase[base];
      if (!combo || combo === 'fullwall') return null;
      var clsKey2 = pat.class === 'premium1' ? 'premium' : pat.class;
      var key = clsKey2 + 'X' + baseClassOf(base);
      var v2 = wallOpt && wallOpt.priceByCombo ? wallOpt.priceByCombo[key] : null;
      return typeof v2 === 'number' ? v2 : null;
    }
    return null;
  }

  /** 基本セット価格（meta.typeBasePrices[タイプ][サイズ]）＋寒冷地加价 */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    var v = 0;
    if (tbp) {
      var bySize = tbp[typeCode()];
      if (bySize) v = typeof bySize[sizeCode()] === 'number' ? bySize[sizeCode()] : 0;
    }
    if (selIs('region', 'C')) v += 5000;
    return v;
  }

  /** 尺寸卡片备用价（防御性：16 组合全有价） */
  function sizeAltPrice(code) {
    var tbp = DATA.meta.typeBasePrices;
    if (!tbp) return null;
    var t = typeCode();
    if (tbp[t] && typeof tbp[t][code] === 'number') {
      return { price: tbp[t][code], type: t };
    }
    var best = null;
    var keys = Object.keys(tbp);
    for (var i = 0; i < keys.length; i++) {
      var ft = keys[i];
      if (ft === t) continue;
      var v = tbp[ft] && tbp[ft][code];
      if (typeof v === 'number' && (!best || v < best.price)) {
        best = { price: v, type: ft };
      }
    }
    return best;
  }

  function isVirtualBasic(code) {
    return code === 'REGION_H';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 条件键（水栓種連動） ---------------- */
  function faucetCode() { return state.sel.faucet; }
  /** shower_head 组键 */
  function currentHeadGroup() {
    var t = typeCode(), f = faucetCode();
    if (t === 'UZ' || t === 'UX') {
      if (f == null) return t === 'UX' ? 'UZUX_sysMetal' : 'UZUX_tower';   // タイプ別標準（UX=H3/UZ=G8）
      if (f === 'G8' || f === 'G1' || f === 'G2') return 'UZUX_tower';
      if (f === 'H3' || f === 'D1') return 'UZUX_sysMetal';
      if (f === 'G9' || f === 'H4' || f === 'D2') return 'UZUX_black';
      return 'UZUX_tower';
    }
    if (f === 'D2') return 'FZFX_bst';
    return 'FZFX_other';
  }
  /** shower_hook 键 */
  function currentHookKey() {
    var t = typeCode(), f = faucetCode();
    if (t === 'UZ') return 'UZ';
    if (t === 'UX') {
      if (f == null) return 'UX_sys';   // UX 標準 H3（シャワーシステム）
      if (f === 'G8' || f === 'G9' || f === 'G1' || f === 'G2') return 'UX_tower';
      return 'UX_sys';
    }
    if (f === 'D2') return 'FZFX_bst';
    return 'FZFX_other';
  }
  /** hose_hook 键 */
  function currentHoseKey() {
    var t = typeCode(), f = faucetCode();
    if (t === 'UZ' || t === 'UX') {
      if (f === 'G8' || f === 'G1' || f === 'G2') return 'tower';
      if (f === 'H3' || f === 'D1') return 'sysMetal';
      return 'sysBlack';
    }
    if (f === 'D2') return 'bst';
    return 'other';
  }
  /** storage 组键 */
  function currentStorageGroup() {
    return (typeCode() === 'UZ' || typeCode() === 'UX') ? 'UZUX' : 'FZFX';
  }
  /** door 種キー：開き戸/開き戸強化ガラス（door_handle 用） */
  function currentDoorKindKey() {
    var c = state.sel.door;
    if (c === 'A1' || c === 'A8') return '開き戸';
    if (c === 'B1') return '開き戸強化ガラス';
    return null;
  }
  /** door 種キー：テンパー系（door_color 6 用） */
  function currentTempDoorKey() {
    var c = state.sel.door;
    if (c === 'オ1') return 'テンパー開き戸2000H';
    if (c === 'オ9') return 'テンパー開き戸2200H';
    if (c === 'TE') return 'テンパー2枚引き戸';
    return null;
  }
  /** 当前门宽（door 选项名） */
  function currentDoorWidth() {
    var o = selOpt('door');
    if (!o) return null;
    var m = String(o.name_ja || '').match(/(\d{3})W/);
    return m ? m[1] : null;
  }
  /** 当前 floor 是否タイル床 */
  function floorIsTile() {
    var o = selOpt('floor');
    return o ? /^9/.test(String(o.code)) : false;
  }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    if (dimId === 'wall') return wallContribution();
    if (dimId === 'photo_set') {
      var o = opt(dimId, code);
      if (!o || o.photoSetPrice == null) return null;
      return o.photoSetPrice - basePrice();     // 套装价 − 标准规格价 = 套餐差额
    }
    var o = opt(dimId, code);
    if (!o) return null;
    // 条件键
    if (dimId === 'shower_head' && o.priceByFaucetGroup) {
      var g = currentHeadGroup();
      return P.toAmount(o.priceByFaucetGroup[g]);
    }
    if (dimId === 'shower_hook' && o.priceByTypeFaucet) {
      var hk = currentHookKey();
      return P.toAmount(o.priceByTypeFaucet[hk]);
    }
    if (dimId === 'shower_hose_hook' && o.priceByFaucetGroup) {
      var hg = currentHoseKey();
      return P.toAmount(o.priceByFaucetGroup[hg]);
    }
    if (dimId === 'storage' && o.priceByTypeGroup) {
      var sg = currentStorageGroup();
      return P.toAmount(o.priceByTypeGroup[sg]);
    }
    if (dimId === 'door_handle' && o.priceByDoorType) {
      var dk = currentDoorKindKey();
      if (!dk) return null;
      return P.toAmount(o.priceByDoorType[dk]);
    }
    if (dimId === 'door_color' && o.priceByDoorType) {
      var tk = currentTempDoorKey();
      if (!tk) return null;
      return P.toAmount(o.priceByDoorType[tk]);
    }
    if (dimId === 'door_color' && o.priceByDoorWidth) {
      var dw = currentDoorWidth();
      if (!dw) return null;
      return P.toAmount(o.priceByDoorWidth[dw]);
    }
    // tile 特殊键（吊架台/根太受け：タイル床時）
    if (o.pricesBySize && o.pricesBySize.tile !== undefined && floorIsTile()) {
      return P.toAmount(o.pricesBySize.tile);
    }
    if (o.priceByType) {
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
        out.model = o.partNumber || o.selectMark || '';
        if (dimId === 'wall') {
          var pc = state.sub.wall_pattern;
          if (pc) {
            var pat = wallPattern(pc);
            if (pat) {
              out.nameZh += '・' + (pat.name_zh || pat.code);
              out.nameJa += '・' + (pat.name_ja || pat.code);
              out.model = wallPatternPartNo(pc);
              if (wallMode() !== '0' && pat.accentCodeByBase) {
                var bn = pat.accentCodeByBase[wallBase()];
                out.extra = bn && bn !== 'fullwall' ? 'ベース' + wallBase() : '';
              }
            }
          }
        }
        if (dimId === 'photo_set' && o.photoSetPrice != null) {
          out.extra = '写真セット価格 ' + P.yen(o.photoSetPrice);
        }
        if (o.longLeadTime) out.extra = (out.extra ? out.extra + '；' : '') + '長納期（+2週間）';
        if (o.note && /★|販売終了/.test(o.note)) {
          out.extra = (out.extra ? out.extra + '；' : '') + '⚠販売終了予定';
        }
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
      if (d.step === 0 && d.id !== 'photo_set') return;
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
    // 大陆地区价格（人民币含安装费）= 日元税込 × 汇率 × rmbRate(0.8)；无有效汇率时为 null
    var rmbRate = (DATA.meta.rmbRate != null) ? DATA.meta.rmbRate : 0.8;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * rmbRate) : null;
    return {
      base: base, basePrice: basePriceValue,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: sizeCode(), type: typeCode(), doorPos: doorPosCode()
    };
  }

  /** 本体品番：NSPB-サイズL{床A/B}タイプ-C+H(C)ドア位置（A=タイル床/B=FRP床） */
  function productNo() {
    var floorOpt = selOpt('floor');
    var fc = (floorOpt && floorOpt.floorCode) ? floorOpt.floorCode : 'B';
    return 'NSPB-' + sizeCode() + 'L' + fc + typeCode() + '-C+H(C)' + doorPosCode();
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
  function mountIs(codes) {
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(state.sel.mount) >= 0;
  }
  function isTempDoor() { return selIs('door', ['オ1', 'オ9', 'TE']); }
  function isFoldDoor() { return selIs('door', ['ケ1', 'ケE']); }

  /**
   * 判断某维度某选项是否禁用；返回 reason 字符串或 null。
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
      if (o.pricesBySize && o.pricesBySize.tile === undefined) {
        var v = P.priceBySize(o, size);
        if (v == null) return '该选项不适用于 ' + size + ' 尺寸';
      }
      if (o.priceByType) {
        var tv = P.priceByTypeValue(o, type);
        if (tv == null) return '该タイプ不可选';
      }
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价';
    }

    // ---- ベンチ：UZ/FZ のみ ----
    if (dimId === 'bench' && typeIs(['UX', 'FX'])) return 'ベンチはUZ/FZタイプのみ選択可';

    // ---- ファン：換気乾燥暖房機（P）1216・FZ/FX のみ / 壁高2000 不可 ----
    if (dimId === 'fan' && code === 'P') {
      if (typeIs(['UZ', 'UX'])) return '換気乾燥暖房機はFZ/FXタイプのみ';
      if (selIs('ceiling', ['J0', 'P0'])) return '換気乾燥暖房機は壁高2000とは同時選択不可';
    }

    // ---- 照明 ----
    if (dimId === 'lighting' && code === 'QD') {
      if (size === '0812') return '0812サイズはタテライン照明選択不可';
      if (typeIs(['UZ', 'FZ']) && selIs('door_position', ['RC', 'LC'])) return 'UZ/FZタイプはタテライン照明がドア位置RL/LRのみ';
    }
    if (dimId === 'lighting' && code === 'CB') {
      if (typeIs(['UZ', 'UX'])) return 'スリム照明はFZ/FXタイプのみ';
      if (selIs('ceiling', ['P0', 'P1', 'P2'])) return 'スリム照明と平天井〈ブラック〉は同時選択不可';
      var pc0 = state.sub.wall_pattern;
      if (pc0) {
        var pat0 = wallPattern(pc0);
        if (pat0 && pat0.slimLimited === 'all' && size !== '0812') return 'この壁柄とスリム照明は同時選択不可';
        if (pat0 && pat0.slimLimited === '1216' && size === '1216') return 'この壁柄とスリム照明は同時選択不可';
      }
    }
    if (dimId === 'lighting' && code === 'GP' && selIs('ceiling', ['P0', 'P1', 'P2'])) {
      return 'ダウンライト(1灯)と平天井〈ブラック〉は同時選択不可';
    }
    // 壁柄＊1＊2 × スリム照明（反向：CB 选中时花纹禁用提示）
    if (dimId === 'wall_pattern' && selIs('lighting', 'CB')) {
      var wp = wallPattern(code);
      if (wp && wp.slimLimited === 'all' && size !== '0812') return 'この壁柄とスリム照明は同時選択不可';
      if (wp && wp.slimLimited === '1216' && size === '1216') return 'この壁柄とスリム照明は同時選択不可';
    }

    // ---- ドアカラー ----
    if (dimId === 'door_color') {
      var dc = state.sel.door;
      var isOpenA = (dc === 'A1' || dc === 'A8');
      var isOpenGlass = (dc === 'B1');
      var isTempOpen = (dc === 'オ1' || dc === 'オ9');
      var isTempSlide = (dc === 'TE');
      if (code === '9' && dc !== 'ケE') return 'ドアカラー9は折り戸(900W)のみ';
      if (code === '6' && !(isTempOpen || isTempSlide)) return 'ドアカラー6はテンパー系ドアのみ';
      if (code === '5' && !isTempSlide) return 'ドアカラー5はテンパー2枚引き戸のみ';
      if (code === '8' && !isOpenGlass) return 'ドアカラー8は開き戸(強化ガラス)のみ';
      if ((code === '4' || code === '2') && (isTempOpen || isTempSlide)) return 'ドアカラー4/2はテンパー系ドア不可';
      if (code === '3' && isTempSlide) return 'ドアカラー3はテンパー2枚引き戸不可';
    }

    // ---- 開き戸ハンドル：開き戸系のみ ----
    if (dimId === 'door_handle') {
      var kind = currentDoorKindKey();
      if (!kind) return '開き戸ハンドルは開き戸/開き戸(強化ガラス)のみ';
      if (o.priceByDoorType && o.priceByDoorType[kind] == null) return '该ドア種不可选';
    }

    // ---- ドア外タオル掛：開き戸系のみ ----
    if (dimId === 'door_towel_bar' && !selIs('door', ['A1', 'A8', 'B1'])) {
      return 'ドア外タオル掛は開き戸/開き戸(強化ガラス)のみ';
    }

    // ---- 間仕切りユニット ----
    if (dimId === 'partition') {
      if (size !== '1216' && selIs('door_position', ['RC', 'LC'])) return '0914/0912/0812はドア位置RC/LCと同時選択不可';
      if (size !== '1216' && typeIs(['UZ', 'FZ'])) return 'UZ/FZタイプの0914/0912/0812とは同時選択不可';
      if (isFoldDoor() || selIs('door', 'TE')) return '間仕切りユニットと折り戸/テンパー2枚引き戸は同時選択不可';
      var isDoor2200 = selIs('door', 'オ9');
      var isPart2200 = code === 'F45';
      if (isDoor2200 !== isPart2200 && (isDoor2200 || isPart2200)) return 'ドア高と間仕切りユニット高の組合せ不可';
    }

    // ---- 水栓：ボディハグシャワー × 壁付サーモ(OG1) 必須 ----
    var bodyhug = selIs('bodyhug', ['A', 'B']);
    if (bodyhug && dimId === 'faucet' && !selIs('faucet', ['D1', 'D2'])) {
      return 'ボディハグシャワーは壁付サーモ水栓(OG1)との組合せのみ';
    }
    if (dimId === 'bodyhug') {
      if (!typeIs('UX')) return 'ボディハグシャワーはUXタイプのみ';
      if (state.sel.faucet && !selIs('faucet', ['D1', 'D2'])) return 'ボディハグシャワーは壁付サーモ水栓(OG1)との組合せのみ';
    }

    // ---- シャワー：スイッチ付 × シャワーシステム/ボディハグ ----
    var switchShower = /^(DB|DC|FB|FC|DF|DG|FF|FG)$/.test(code);
    if (dimId === 'shower_head' && switchShower) {
      if (selIs('faucet', ['H3', 'H4']) || bodyhug) return 'スイッチ付シャワーとシャワーシステム/ボディハグシャワーは同時選択不可';
    }

    // ---- 収納：0812 ボディハグ × メタルシェルフ180W ----
    if (dimId === 'storage' && (code === '2G' || code === '2T') && size === '0812' && bodyhug) {
      return '0812サイズはボディハグシャワーとメタルシェルフ180Wは同時選択不可';
    }
    // 間仕切り × メタルシェルフ290W/コーナー棚
    if (dimId === 'storage' && selected('partition')) {
      if (size !== '1216' && (code === 'L2' || code === 'L1' || code === '2Q' || code === '1Q')) return '間仕切りユニットとメタルシェルフ290Wは同時選択不可';
      if ((size === '0912' || size === '0812') && code === 'A2') return '間仕切りユニットとコーナー棚は同時選択不可';
    }

    // ---- 給水給湯：E面接続 1216 不可 / × テンパー2枚引き戸・間仕切り ----
    if (dimId === 'supply_piping' && code === '2') {
      if (size === '1216') return '1216サイズはE面接続選択不可';
      if (selIs('door', 'TE') || selected('partition')) return 'E面接続とテンパー2枚引き戸/間仕切りユニットは同時選択不可';
    }

    // ---- 下部据付：吊架台 UX/FX のみ / × テンパー2枚引き戸 ----
    if (dimId === 'mount' && (code === 'H' || code === 'J')) {
      if (!typeIs(['UX', 'FX'])) return '吊架台はUX/FXタイプのみ';
      if (selIs('door', 'TE')) return '吊架台とテンパー2枚引き戸は同時選択不可';
    }

    // ---- その他オプション ----
    if (dimId === 'other_options') {
      if (code === 'S81') {
        if (mountIs(['H', 'J'])) return 'ドレン排水管と吊架台は同時選択不可';
        if (typeIs(['UZ', 'FZ']) && (size === '0912' || size === '0812') && state.sel.mirror && !selIs('mirror', 'NN')) {
          return 'UZ/FZタイプの0912/0812ではミラーと同時選択不可';
        }
      }
      if (code === 'S26' && mountIs(['H', 'J'])) return 'ボルト脚用接着剤と吊架台は同時選択不可';
      if (code === 'S13') {
        if (mountIs(['H', 'J'])) return '防振ゴムと吊架台は同時選択不可';
        if (multiHas('other_options', ['S85', 'S83']) || selIs('misc', 'S14')) return '防振ゴムと配管避け架台/根太受けプレートは同時選択不可';
      }
      if ((code === 'S85' || code === 'S83') && (multiHas('other_options', 'S13') || selIs('misc', 'S14'))) {
        return '配管避け架台と防振ゴム/根太受けプレートは同時選択不可';
      }
    }
    if (dimId === 'misc' && code === 'S14') {
      if (mountIs(['H', 'J'])) return '根太受けプレートと吊架台は同時選択不可';
      if (multiHas('other_options', ['S13', 'S85', 'S83'])) return '根太受けプレートと防振ゴム/配管避け架台は同時選択不可';
    }

    // ---- ドア額縁 ----
    if (dimId === 'door_frame') {
      if (code === 'S96' && !selected('door_frame')) {
        return '化粧枠はフリーサイズドア額縁と組合せて使用';
      }
      if (code === 'S97' && (selIs('door', ['ケE', 'TE']) || selected('partition'))) {
        return 'ドア用化粧下枠と折り戸900W/各種引き戸/間仕切りは同時選択不可';
      }
      if (code === 'S90' || code === 'S92' || code === 'S93' || code === 'S94' || code === 'S95' || code === 'S08') {
        if (selIs('door', ['A8', 'オ9']) || (selected('partition') && selIs('partition', 'F45'))) {
          return 'フリーサイズドア額縁と2200H/2100Hドア・間仕切り2200Hは同時選択不可';
        }
      }
    }

    // ---- シャワーホースフック：UZ/FZ のみ ----
    if (dimId === 'shower_hose_hook' && typeIs(['UX', 'FX'])) {
      return 'シャワーホースフックはUZ/FZタイプのみ';
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    if (dimId === 'wall' && code === '0') {
      var pc = state.sub.wall_pattern;
      if (pc && wallPatternDisabled(pc)) delete state.sub.wall_pattern;
    }
    if (dimId === 'bodyhug' && (code === 'A' || code === 'B')) {
      // 自动切到壁付サーモ(OG1)
      if (state.sel.faucet && !selIs('faucet', ['D1', 'D2'])) state.sel.faucet = 'D1';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（矩阵无价时 fallback） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var order = ['UZ', 'UX', 'FZ', 'FX'];
      for (var i = 0; i < order.length; i++) {
        if (tbp[order[i]] && tbp[order[i]][code] != null) { state.sel.type = order[i]; break; }
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
  window.LSHOWER = window.LSHOWER || {};
  window.LSHOWER.quote = {
    init: function (data) { DATA = data; P = window.LSHOWER.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    typeCode: typeCode, sizeCode: sizeCode, basePrice: basePrice,
    doorPosCode: doorPosCode, sizeAltPrice: sizeAltPrice,
    wallPatterns: wallPatterns, wallPattern: wallPattern, wallBases: wallBases, wallMode: wallMode, wallBase: wallBase,
    wallContribution: wallContribution, wallPatternPartNo: wallPatternPartNo,
    wallPatternDisabled: wallPatternDisabled, wallBaseDisabled: wallBaseDisabled, wallPatternPrice: wallPatternPrice,
    currentHeadGroup: currentHeadGroup, currentHookKey: currentHookKey, currentDoorKindKey: currentDoorKindKey,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.multi = {}; state.sub = {};
      state.size = '1216';
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
