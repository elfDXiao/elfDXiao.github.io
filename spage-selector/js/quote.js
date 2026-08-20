/**
 * quote.js — LIXIL SPAGE（スパージュ）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.SPAGE.quote。
 * 依赖：window.SPAGE_DATA（products.js，由 spage-data.json 生成）、window.SPAGE.price
 *
 * 计价模型（全部手册价为税抜き）：
 *   本体価格（税抜）= 標準仕様価格（meta.typeBasePrices[タイプ][サイズ][設置 U/M]） + Σ选项差价
 *   税込 = 本体 × 1.10（消費税10%）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.75）—— 系数仅在计算代码中，页面不显示算式
 *
 * 条件键 priceByType（非タイプ字符键）按当前选择解析：
 *   aqua_feil    A/U・A/M（タイプ A × 設置）——精确键 `${type}/${install}` 优先
 *   water_pipe   FaucetNone/WallFaucet（浴槽側水栓 有無）
 *   shower_head  ThermoMetal/ShowerSystem 等（水栓種）
 *   其余：タイプ字符匹配（P/C/S/V/A 或组键，price.js priceByTypeValue）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（16 步：0-15） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ・設置', titleZh: '尺寸·型号·設置', note: '选择尺寸（11 種）、型号（P/C/S/V/A）与設置（戸建 U/マンション M）＋地域，決定標準仕様価格（タイプ×サイズ×設置矩阵）。' },
    { n: 1, title: 'ドア位置・下部据付', titleZh: '门位置·基础', note: 'ドア位置（RL/LR/RC/LC＋移動）、ボルト脚/吊架台（戸建・マンション別）、浴槽パン S/W。' },
    { n: 2, title: '壁パネル', titleZh: '壁面', note: 'Lパネル（プレミアムⅡ/Ⅰ/ハイ）、アーテクトパネル（P/C クラス）、セラミックパネル（グランクラス・長納期）。' },
    { n: 3, title: '床', titleZh: '地板', note: 'グランフロア 4 種／サッとキレイサーモフロア 6 種。' },
    { n: 4, title: '浴槽', titleZh: '浴缸', note: 'グランフィット/リクライニング/マルチボード/ハイレスト/ストレートライン×グランザ/パールクォーツ＋排水栓＋握りバー。' },
    { n: 5, title: 'フロフタ・エプロン', titleZh: '浴缸盖·裙板', note: 'サーモバスS 有無×薄型保温/腰掛付/マルチボード付フタ、フロフタフック、エプロン 4 色。' },
    { n: 6, title: '天井', titleZh: '天花板', note: '平天井（J/R/P）・内組平天井（E/S/Q）・廻し縁付（K）×壁高 2200/2100/2000/1900。' },
    { n: 7, title: '換気設備', titleZh: '换气设备', note: '換気乾燥暖房機（100/200V・プラズマクラスター・2/3室）、換気グリル、ランドリーパイプ、洗面室暖房機。' },
    { n: 8, title: 'ドア', titleZh: '门', note: '折り戸/開き戸/片引戸/2枚引戸＋テンパードア（開き/片引/2枚）＋間仕切りユニット。' },
    { n: 9, title: 'カウンター・水栓', titleZh: '台面·水龙头', note: 'フローベンチ/まる洗い/なし＋カウンタープッシュ＋洗い場側（S=V シャワーシステム/壁付サーモ）＋ボディハグ＋浴槽側。' },
    { n: 10, title: 'シャワー・浄水', titleZh: '花洒·净水', note: 'ファインバブルシャワー SPA U/エコアクアPlus＋うるつや浄水＋シャワーフック/スライドフック付握りバー。' },
    { n: 11, title: '照明', titleZh: '照明', note: 'ダウンライト/調光調色/ライン照明（B面・C面・B・E面）/アクアフィールライト/シャワーライト/フロアライト。' },
    { n: 12, title: 'ミラー', titleZh: '镜子', note: 'マグネットミラー/タテ長/ワイド/1555/なし＋キレイ鏡。' },
    { n: 13, title: '収納・マグネット', titleZh: '收纳·磁吸件', note: 'マグネットメタルシェルフ/メタルシェルフ/メタルバスケット＋追加マグネットアイテム。' },
    { n: 14, title: 'タオル・握りバー', titleZh: '毛巾杆·扶手', note: 'マグネットメタルマルチバー/タオル掛/リング＋握りバー（Ⅰ型/L型）。' },
    { n: 15, title: '付加オプション', titleZh: '附加选项', note: 'サポートパック/浴室テレビ/アクアフィール/おそうじ浴槽/大開口窓/窓額縁/給水給湯/追いだき/保温材・その他。' }
  ];

  /* ---------------- 维度配置 ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['P', 'C', 'S', 'V', 'A'], titleJa: 'タイプ', titleZh: '型号' },
    { id: 'install', step: 0, cat: 'install', kind: 'radio',
      basic: { code: 'INSTALL_U', nameJa: '戸建用（U）', nameZh: '户建用（U）' },
      codes: ['M'], titleJa: '設置', titleZh: '設置' },
    { id: 'region', step: 0, cat: 'region', kind: 'radio',
      basic: { code: 'REGION_H', nameJa: '一般地（H）', nameZh: '一般地区（H）' },
      codes: ['C'], titleJa: '地域区分', titleZh: '地域' },
    // step 1
    { id: 'door_position', step: 1, cat: 'door_position', kind: 'radio', codes: 'ALL', titleJa: 'ドア位置', titleZh: '门位置' },
    { id: 'kudai', step: 1, cat: 'kudai', kind: 'radio', codes: 'ALL', titleJa: 'ボルト脚・吊架台', titleZh: '螺栓脚·吊架台' },
    { id: 'bathtub_pan', step: 1, cat: 'bathtub_pan', kind: 'radio', codes: ['W', 'S'], titleJa: '浴槽パン', titleZh: '浴缸底盘' },
    // step 2
    { id: 'wall', step: 2, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁パネル', titleZh: '壁面' },
    // step 3
    { id: 'floor', step: 3, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床', titleZh: '地板' },
    // step 4
    { id: 'bt_shape', step: 4, cat: 'bathtub', kind: 'radio', codes: ['FULL', 'WIDE', 'GRF', 'RECW', 'REC', 'MULTI', 'HI', 'STR'], titleJa: '浴槽形状', titleZh: '浴缸形状' },
    { id: 'bt_material', step: 4, cat: 'bathtub', kind: 'radio', codes: ['AG98', 'AG28', 'AG08', 'AG09', 'AG02', 'CN1', 'CW1'], titleJa: '浴槽材質・カラー', titleZh: '浴缸材质·色' },
    { id: 'bt_drain', step: 4, cat: 'bathtub', kind: 'radio', codes: ['3', '5'], titleJa: '浴槽排水栓', titleZh: '浴缸排水栓' },
    { id: 'bt_bar', step: 4, cat: 'bathtub', kind: 'radio', codes: ['2', 'N'], titleJa: '浴槽内握りバー', titleZh: '浴缸内扶手' },
    { id: 'bt_headrest', step: 4, cat: 'bathtub', kind: 'radio', none: true, codes: ['HR1', 'HR2', 'HR8'], titleJa: 'ヘッドレスト', titleZh: '头枕' },
    // step 5
    { id: 'bt_lid', step: 5, cat: 'bathtub', kind: 'radio', codes: ['A', 'NTHER', 'D', 'E', 'F', 'G', 'H', 'J', 'L', 'K', 'Q'], titleJa: 'フロフタ', titleZh: '浴缸盖' },
    { id: 'bt_lidhook', step: 5, cat: 'bathtub', kind: 'radio', none: true, codes: ['FHOOK'], titleJa: 'フロフタフック', titleZh: '浴缸盖挂钩' },
    { id: 'bt_apron', step: 5, cat: 'bathtub', kind: 'radio', codes: ['EPG', 'EPH', '3EP', '2EP'], titleJa: 'エプロン', titleZh: '裙板' },
    // step 6
    { id: 'ceiling', step: 6, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    // step 7
    { id: 'fan', step: 7, cat: 'fan', kind: 'radio',
      basic: { code: 'FAN_BASIC', nameJa: '天井換気扇（基本）', nameZh: '天井换气扇（基本）' },
      codes: 'ALL', titleJa: '換気設備', titleZh: '换气设备' },
    // step 8
    { id: 'door', step: 8, cat: 'door', kind: 'radio',
      basic: { code: 'DOOR_BASIC', nameJa: '折り戸 800（基本仕様）', nameZh: '折叠门 800（基本）' },
      codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    { id: 'partition_unit', step: 8, cat: 'partition_unit', kind: 'radio', none: true, codes: 'ALL', titleJa: '間仕切りユニット', titleZh: '隔断单元' },
    // step 9
    { id: 'counter', step: 9, cat: 'counter', kind: 'radio',
      basic: { code: 'COUNTER_BASIC', nameJa: 'カウンター（タイプ別基本）', nameZh: '台面（按型号）' },
      codes: ['YW', 'YV', 'XU', 'XV', 'NN'], titleJa: 'カウンター', titleZh: '台面' },
    { id: 'faucet', step: 9, cat: 'faucet', kind: 'radio',
      basic: { code: 'FAUCET_BASIC', nameJa: '基本水栓（タイプ別）', nameZh: '基本水龙头（按型号）' },
      codes: ['H3', 'H4', 'Q4', 'Q5', 'QS', 'QT', 'M1', 'M2'], titleJa: '洗い場側水栓', titleZh: '洗手区水龙头' },
    { id: 'body_hug', step: 9, cat: 'faucet', kind: 'radio', codes: ['A', 'B'], titleJa: 'ボディハグシャワー', titleZh: '环抱式花洒' },
    { id: 'tub_faucet', step: 9, cat: 'faucet', kind: 'radio',
      basic: { code: 'TUB_NONE', nameJa: '浴槽側水栓なし（NN）', nameZh: '无浴缸侧水龙头（NN）' },
      codes: ['BV', 'BW', 'BR', 'BT'], titleJa: '浴槽側水栓', titleZh: '浴缸侧水龙头' },
    { id: 'faucet_misc', step: 9, cat: 'faucet', kind: 'multi', codes: ['A80', 'A81'], titleJa: '取付脚断熱カバー', titleZh: '安装脚隔热罩' },
    // step 10
    { id: 'shower_head', step: 10, cat: 'shower_head', kind: 'radio',
      basic: { code: 'SHOWER_BASIC', nameJa: 'シャワーヘッド（基本）', nameZh: '花洒头（基本）' },
      codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'shower_hook', step: 10, cat: 'shower_hook', kind: 'radio', codes: 'ALL', titleJa: 'シャワーフック・スライドバー', titleZh: '花洒挂钩·滑杆' },
    { id: 'urutuya', step: 10, cat: 'urutuya', kind: 'radio',
      basic: { code: 'URU_BASIC', nameJa: 'うるつや浄水（タイプ別基本）', nameZh: '润泽净水（按型号）' },
      codes: ['A', 'N'], titleJa: 'うるつや浄水', titleZh: '润泽净水' },
    { id: 'hose_hook', step: 10, cat: 'shower_hose_hook', kind: 'radio', none: true, codes: 'ALL', titleJa: 'シャワーホースフック', titleZh: '花洒软管挂钩' },
    // step 11
    { id: 'lighting', step: 11, cat: 'lighting', kind: 'radio',
      basic: { code: 'LIGHT_BASIC', nameJa: '照明（基本）', nameZh: '照明（基本）' },
      codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    // step 12
    { id: 'mirror', step: 12, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    // step 13
    { id: 'storage', step: 13, cat: 'storage', kind: 'radio',
      codes: ['UD', 'UT', 'VD', 'VT', 'SS', 'TS', 'SC', 'TC', '2G', '3G', '2T', '3T', '2V', '2W', '4F', '4S', 'L2', 'L3', '2Q', '3Q', '2E', '2M', 'M4', '4R', 'NN'],
      titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'magnet', step: 13, cat: 'storage', kind: 'multi',
      codes: ['A40', 'A53', 'A39', 'A52', 'M04', 'M05', 'A70', 'A71', 'A83', 'A84', 'M06', 'M07', 'A75', 'A76', 'M10', 'M11', 'A88', 'A89', 'A96', 'A97', 'M09', 'A98', 'A99', 'M03'],
      titleJa: '追加マグネットアイテム', titleZh: '追加磁吸件' },
    // step 14
    { id: 'towel', step: 14, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛', titleZh: '毛巾杆' },
    { id: 'grip_bar', step: 14, cat: 'grip_bar', kind: 'radio', none: true, codes: 'ALL', titleJa: '握りバー', titleZh: '扶手' },
    // step 15
    { id: 'support_pack', step: 15, cat: 'support_pack', kind: 'radio', none: true, codes: 'ALL', titleJa: 'サポートパック', titleZh: '支援套装' },
    { id: 'bathroom_tv', step: 15, cat: 'bathroom_tv', kind: 'multi', codes: 'ALL', titleJa: '浴室テレビ', titleZh: '浴室电视' },
    { id: 'aqua_feil', step: 15, cat: 'aqua_feil', kind: 'radio', codes: ['K53', 'N'], titleJa: 'アクアフィール', titleZh: '水波浴' },
    { id: 'osouji', step: 15, cat: 'osouji', kind: 'multi', codes: 'ALL', titleJa: 'おそうじ浴槽・IoT', titleZh: '自动清洁浴缸·IoT' },
    { id: 'window_frame', step: 15, cat: 'window_frame', kind: 'multi', codes: 'ALL', titleJa: '大開口窓・窓額縁', titleZh: '大开口窗·窗框' },
    { id: 'water_pipe', step: 15, cat: 'water_pipe', kind: 'radio', codes: 'ALL', titleJa: '給水給湯配管', titleZh: '给水给汤配管' },
    { id: 'oidaki', step: 15, cat: 'oidaki', kind: 'radio', none: true, codes: 'ALL', titleJa: '追いだき加工', titleZh: '追焚加工' },
    { id: 'misc_options', step: 15, cat: 'misc_options', kind: 'multi', codes: 'ALL', titleJa: '保温材・その他', titleZh: '保温材·其他' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1620',            // 尺寸 code（默认 1620）
    doorPos: 'RL',           // ドア位置（默认 RL）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    sub: {},                 // { wall_pattern: 花纹 code }  壁パネル花纹选择
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
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'P');
  }
  function sizeCode() { return state.size || '1620'; }
  function installCode() {
    var o = selOpt('install');
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.install) || 'U');
  }
  function doorPosCode() {
    var c = state.sel.door_position;
    return c ? c : 'RL';
  }
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /* ---------------- 壁パネル花纹（wallPatterns，47 柄） ---------------- */
  /** wall 选项 code → 花纹 class（第一段选项的 class 组） */
  var WALL_CLASS = {
    '0': 'プレミアムⅡ', '1': 'プレミアムⅠ', '2': 'ハイクラス',
    '1B': 'プレミアムⅡ', '2B': 'プレミアムⅡ', '1A': 'プレミアムⅠ', '2A': 'プレミアムⅠ',
    '1H': 'ハイクラス', '2H': 'ハイクラス',
    'PALL': 'アーテクトP', 'CALL': 'アーテクトC',
    'GRB': 'グランクラス(セラミック)', 'GRC': 'グランクラス(セラミック)',
    'PP': 'アーテクトP', 'CC': 'アーテクトC', 'CH': 'アーテクトC'
  };
  /** wall 选项 code → 張り方（prices 键） */
  var WALL_FURI = {
    '0': '全面張り', '1': '全面張り', '2': '全面張り', 'PALL': '全面張り', 'CALL': '全面張り',
    '1B': 'アクセントB面', '2B': 'アクセントC面', '1A': 'アクセントB面', '2A': 'アクセントC面',
    '1H': 'アクセントB面', '2H': 'アクセントC面', 'GRB': 'アクセントB面', 'GRC': 'アクセントC面',
    'PP': 'アクセントB面', 'CC': 'アクセントB面', 'CH': 'アクセントB面'
  };
  function wallPatterns() { return (DATA.wallPatterns && DATA.wallPatterns.patterns) || []; }
  function wallPattern(code) {
    return wallPatterns().find(function (p) { return String(p.code) === String(code); }) || null;
  }
  /** 当前 wall 选项对应花纹 class（未选返回 null） */
  function wallClassOfOption() {
    var c = state.sel.wall;
    return c ? (WALL_CLASS[c] || null) : null;
  }
  /** 当前张り方（prices 键） */
  function wallFuriOfOption() {
    var c = state.sel.wall;
    return c ? (WALL_FURI[c] || '全面張り') : '全面張り';
  }
  /** 花纹品番：全面 → partNumbers['全面張り']；アクセント → 第一个アクセントベース列码 */
  function wallPatternPartNo(pat, furi) {
    if (!pat || !pat.partNumbers) return '';
    if (furi === '全面張り') return pat.partNumbers['全面張り'] || '';
    var keys = Object.keys(pat.partNumbers);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('アクセントベース') === 0) return pat.partNumbers[keys[i]] || '';
    }
    return '';
  }
  /** 花纹净差：pattern.prices[張り方] − 类级 priceDiff（同 class 柄价格一致时净差 0） */
  function wallPatternContribution() {
    var wallCode = state.sel.wall;
    var patCode = state.sub.wall_pattern;
    if (!wallCode || !patCode) return 0;
    var pat = wallPattern(patCode);
    if (!pat || !pat.prices) return 0;
    var furi = wallFuriOfOption();
    var p = pat.prices[furi];
    if (p == null) return 0;   // 该张り方不可（セラミック全面 null）
    var wallOpt = opt('wall', wallCode);
    var base = (wallOpt && typeof wallOpt.priceDiff === 'number') ? wallOpt.priceDiff : 0;
    return P.toAmount(p) - base;
  }

  /** 基本セット価格（meta.typeBasePrices[タイプ][サイズ][設置]）＋寒冷地加价 */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    var v = 0;
    if (tbp) {
      var bySize = tbp[typeCode()];
      if (bySize) {
        var um = bySize[sizeCode()];
        if (um && typeof um[installCode()] === 'number') v = um[installCode()];
      }
    }
    if (selIs('region', 'C')) v += 5000;
    return v;
  }

  function isVirtualBasic(code) {
    return code === 'INSTALL_U' || code === 'REGION_H' || code === 'PAN_S' || code === 'FAUCET_BASIC' ||
      code === 'TUB_NONE' || code === 'SHOWER_BASIC' || code === 'URU_BASIC' || code === 'LIGHT_BASIC' ||
      code === 'DOOR_BASIC' || code === 'FAN_BASIC' || code === 'COUNTER_BASIC';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 条件键上下文（非タイプ字符键） ---------------- */
  function currentFaucetKind() {
    var c = state.sel.faucet;
    if (c === 'H3' || c === 'H4') return 'ShowerSystem';
    if (c === 'Q5' || c === 'M2') return 'BlackFaucet';
    return 'ThermoMetal';   // 默认壁付サーモ（GA2 等）
  }
  function currentBathtubFaucet() {
    var c = state.sel.tub_faucet;
    return (c === 'BV' || c === 'BW' || c === 'BR' || c === 'BT') ? 'WallFaucet' : 'FaucetNone';
  }
  function currentUru() {
    return selIs('urutuya', 'A') ? 'UruAri' : 'UruNashi';
  }
  /** 条件键 priceByType 解析（返回数字/文本或 null） */
  function contextPrice(option, dimId) {
    if (!option || !option.priceByType) return null;
    var p = option.priceByType;
    var t = typeCode(), inst = installCode();
    // 通用：タイプ/設置 精确键（如 P/U・A/M —— bathtub_pan/aqua_feil 等）
    var exact = t + '/' + inst;
    if (Object.prototype.hasOwnProperty.call(p, exact)) return p[exact];
    if (dimId === 'aqua_feil') {
      // 键 A/U・A/M：タイプ A × 設置 精确匹配；其余タイプ字符匹配
      if (Object.prototype.hasOwnProperty.call(p, t)) return p[t];
      var best = null, bestLen = Infinity;
      Object.keys(p).forEach(function (k) {
        if (k.indexOf(t) === 0 && k.length < bestLen) { best = p[k]; bestLen = k.length; }
      });
      return best;
    }
    var key = null;
    if (dimId === 'water_pipe') key = currentBathtubFaucet();
    else if (dimId === 'shower_head') key = currentFaucetKind();
    else if (dimId === 'shower_hook') key = currentUru();
    if (key == null) return null;
    return Object.prototype.hasOwnProperty.call(p, key) ? p[key] : null;
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
        if (c == null) return null;
        var base = radioContribution(dimId, c);
        if (dimId === 'wall') {
          var extra = wallPatternContribution();
          if (extra !== 0) return (base == null ? 0 : base) + extra;
        }
        return base;
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
        // 壁パネル：附加花纹名与品番
        if (dimId === 'wall') {
          var pc = state.sub.wall_pattern;
          if (pc) {
            var pat = wallPattern(pc);
            if (pat) {
              out.nameZh += '・' + (pat.name_zh || pat.code);
              out.nameJa += '・' + (pat.name_ja || pat.code);
              out.extra = pat.patternNo + (pat.finish ? '・' + pat.finish : '') +
                (pat.lightingLimited ? ' ⚠照明限定' : '') +
                (pat.longLeadTime ? ' 納期+' + (typeof pat.longLeadTime === 'string' ? pat.longLeadTime : '1週間') : '');
              out.model = wallPatternPartNo(pat, wallFuriOfOption());
            }
          }
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
      nameZh: '標準仕様 ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + typeCode() + 'タイプ' +
        (installCode() === 'M' ? '（マンション）' : '（戸建）') + (selIs('region', 'C') ? '・寒冷地' : ''),
      nameJa: base ? base.name_ja + ' ' + typeCode() + 'タイプ' + (installCode() === 'M' ? '（マンション）' : '（戸建）') + (selIs('region', 'C') ? '・寒冷地' : '') : sizeCode(),
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
    // 大陆地区价格（人民币含安装费）= 日元税込 × 汇率 × rmbRate(0.75)；无有效汇率时为 null
    var rmbRate = (DATA.meta.rmbRate != null) ? DATA.meta.rmbRate : 0.75;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * rmbRate) : null;
    return {
      base: base, basePrice: basePriceValue,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: sizeCode(), type: typeCode(), doorPos: doorPosCode(), install: installCode()
    };
  }

  /** 本体品番：BAU{W/S}/BAMW-サイズタイプ-C+H(C)ドア位置（简化：省略壁パネルL/床A/浴槽2 段；未选パン默认 W 有パン） */
  function productNo() {
    var pan = 'W';
    if (selIs('bathtub_pan', 'S')) pan = 'S';
    var pre = installCode() === 'M' ? 'BAM' + pan : 'BAU' + pan;
    return pre + '-' + sizeCode() + typeCode() + '-C+H(C)' + doorPosCode();
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

  /** セラミックパネル（wall CH）选中判断 */
  function ceramicWall() {
    return selIs('wall', 'CH') || selIs('wall', 'GRB') || selIs('wall', 'GRC');
  }

  /**
   * 判断某维度某选项是否禁用；返回 reason 字符串或 null。
   * 规则：数据 schema 限定 + 研究文档 §4 关键互斥/必须搭配硬编码。
   */
  function disabledReason(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var isVB = isVirtualBasic(code);
    var isPattern = (dimId === 'wall' && wallPattern(code) != null);   // 壁パネル花纹 code（不在 wall 分类）
    var o = opt(dimId, code);
    if (!o && !isVB && !isPattern) return null;
    var size = sizeCode();
    var type = typeCode();

    // ---- 数据 schema 限定 ----
    if (!isVB && o) {
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
      if (tbp && tbp[code] && tbp[code][size] && tbp[code][size][installCode()] == null) {
        return '该タイプ无 ' + size + ' 尺寸/' + installCode() + ' 設置定价';
      }
    }
    if (dimId === 'install') {
      var tbp2 = DATA.meta.typeBasePrices;
      if (tbp2 && tbp2[type] && tbp2[type][size] && tbp2[type][size][code] == null) {
        return size + ' 尺寸不提供 ' + (code === 'M' ? 'マンション用' : '戸建用');
      }
    }

    // ---- アクアフィール/おそうじ → 浴槽パンあり ----
    var needPan = selIs('aqua_feil', 'K53') || multiHas('osouji', 'K55');
    if (needPan && dimId === 'bathtub_pan' && code === 'PAN_S') return 'アクアフィール/おそうじ浴槽选择时浴槽パン须あり（W）';
    if (dimId === 'aqua_feil' && code === 'K53' && !selIs('bathtub_pan', 'W') && !state.sel.bathtub_pan) {
      return 'アクアフィール需浴槽パンあり（W）';
    }

    // ---- セラミックパネル × マグネットアイテム / 内組平天井 / まる洗いカウンター ----
    var ceramic = ceramicWall();
    if (ceramic && dimId === 'magnet') return 'セラミックパネル时マグネットアイテム不可';
    if (ceramic && dimId === 'storage' && (code === 'UD' || code === 'VD' || code === 'SS' || code === 'TS')) {
      return 'セラミックパネル时マグネットメタルシェルフ不可';
    }
    if (ceramic && dimId === 'ceiling' && (code.indexOf('E') === 0 || code.indexOf('S') === 0 || code.indexOf('Q') === 0 || code.indexOf('K') === 0)) {
      return 'セラミックパネル时内組平天井不可';
    }
    if (ceramic && dimId === 'counter' && code === 'XU') return 'セラミックパネル时まる洗いカウンター不可';

    // ---- P タイプはダウンライト（GP）不可 ----
    if (dimId === 'lighting' && code === 'GP' && type === 'P') return 'P タイプ时ダウンライト不可（調光調色を選択）';

    // ---- アクアフィールライト（K60）→ パンあり+アクアフィール+調光調色 ----
    if (dimId === 'lighting' && code === 'K60' && !selIs('aqua_feil', 'K53')) return 'アクアフィールライト需アクアフィール';
    if (dimId === 'lighting' && code === 'K60' && !selIs('bathtub_pan', 'W') && !state.sel.bathtub_pan) return 'アクアフィールライト需浴槽パンあり';

    // ---- サポートパック（V・A）→ まる洗いカウンター必須 ----
    if (dimId === 'support_pack' && (type === 'P' || type === 'S')) return 'サポートパック仅 C/V/A タイプ';
    if (dimId === 'counter' && code === 'XU' && !selIs('support_pack', ['B35', 'B37']) && (type === 'V' || type === 'A')) {
      // 提示性：V/A サポートパック时须まる洗い；反向：サポートパック选择时须まる洗い
    }
    if ((type === 'V' || type === 'A') && selIs('support_pack', ['B35', 'B37']) && dimId === 'counter' && code !== 'XU' && code !== 'COUNTER_BASIC') {
      return 'サポートパック（V/A）时カウンター须まる洗い';
    }

    // ---- シャワーシステム（H3/H4）関連 ----
    var showerSys = selIs('faucet', ['H3', 'H4']);
    if (showerSys && dimId === 'counter' && code === 'XU') return 'シャワーシステム时不可选まる洗いカウンター';

    // ---- ワイドミラー × 浴室テレビ ----
    var wideMirror = selIs('mirror', 'CA');
    if (wideMirror && dimId === 'bathroom_tv') return 'ワイドミラー时浴室テレビ不可';

    // ---- 兼用水栓/浴槽側 ----
    if (dimId === 'tub_faucet' && selIs('faucet', ['H3', 'H4'])) return 'シャワーシステム时浴槽側水栓不可';

    // ---- グランフロア 尺寸限定（1416/1318/1316/1216 不可） ----
    if (dimId === 'floor' && (code === 'EA' || code === 'EB' || code === 'ED' || code === 'EC') &&
        /^1416|^1318|^1316|^1216/.test(size)) {
      return 'グランフロア不适用于 ' + size;
    }

    // ---- 大開口室内窓 13□□/1216/A タイプ不可 ----
    if (dimId === 'window_frame' && /^F6[5-9]|^F70/.test(code) && (/^13/.test(size) || size === '1216' || type === 'A')) {
      return '大開口室内窓不适用于当前型号/尺寸';
    }

    // ---- 壁パネル花纹约束（code 为花纹时校验 class/張り方匹配当前 wall 选项） ----
    if (dimId === 'wall') {
      var patCheck = wallPattern(code);
      if (patCheck) {
        var needClass = wallClassOfOption();
        if (needClass && patCheck.class !== needClass) {
          return '该花纹不适用于当前クラス';
        }
        var furiCheck = wallFuriOfOption();
        if (patCheck.prices && patCheck.prices[furiCheck] == null) {
          return '该花纹不提供' + furiCheck;
        }
      }
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    if (dimId === 'aqua_feil' && code === 'K53') {
      if (!state.sel.bathtub_pan || state.sel.bathtub_pan === 'PAN_S') state.sel.bathtub_pan = 'W';
    }
    if (dimId === 'osouji' && code === 'K55') {
      if (!state.sel.bathtub_pan || state.sel.bathtub_pan === 'PAN_S') state.sel.bathtub_pan = 'W';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ/設置（该尺寸无定价时） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    var t = typeCode(), inst = installCode();
    if (tbp && tbp[t] && tbp[t][code] && tbp[t][code][inst] == null) {
      // 试另一設置
      var otherInst = inst === 'M' ? 'U' : 'M';
      if (tbp[t][code] && tbp[t][code][otherInst] != null) {
        state.sel.install = otherInst;
      } else {
        // 换タイプ
        var fallback = ['C', 'S', 'V', 'P', 'A'];
        for (var i = 0; i < fallback.length; i++) {
          var f = fallback[i];
          if (tbp[f] && tbp[f][code] && tbp[f][code][inst] != null) { state.sel.type = f; break; }
        }
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
      ['サイズ', r.size], ['タイプ', r.type], ['設置', r.install], ['ドア位置', r.doorPos],
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
  window.SPAGE = window.SPAGE || {};
  window.SPAGE.quote = {
    init: function (data) { DATA = data; P = window.SPAGE.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    wallPatterns: wallPatterns, wallPattern: wallPattern,
    wallClassOfOption: wallClassOfOption, wallFuriOfOption: wallFuriOfOption,
    wallPatternPartNo: wallPatternPartNo, wallPatternContribution: wallPatternContribution,
    typeCode: typeCode, sizeCode: sizeCode, typeGroup: typeGroup, basePrice: basePrice,
    installCode: installCode, doorPosCode: doorPosCode,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.multi = {}; state.sub = {};
      state.size = '1620';
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
