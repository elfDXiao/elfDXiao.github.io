/**
 * quote.js — rakuvia 浴室报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.RAKUVIA.quote。
 * 依赖：window.RAKUVIA_DATA（products.js）、window.RAKUVIA.price（price.js）、
 *       window.RAKUVIA_ACCENT（accent.js，アクセントカラー价格表）
 *
 * 计价模型：
 *   本体価格（税抜）= 基本セット価格（按尺寸） + Σ选项差价（⊕加/⊖减）
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据 ---------------- */
  var STEPS = [
    { n: 0, title: '基本プラン', titleZh: '基本套装', note: '选择浴室尺寸（决定基本セット価格），并确认基本仕様默认配置。' },
    { n: 1, title: 'サイズ・基礎', titleZh: '尺寸与基础结构', note: '地域、地板结构、安装脚、保温材、壁高。套装价不含安装费。' },
    { n: 2, title: 'ドア', titleZh: '门', note: '门型、颜色、位置、位置偏移、双向开门、门框、毛巾架。' },
    { n: 3, title: '壁・天井', titleZh: '墙·天花板', note: '墙色方案（フルカラー/アクセント）、正面壁/周辺壁颜色、天花板。' },
    { n: 4, title: 'フロア・浴槽', titleZh: '地板·浴缸', note: '地板、裙边、毛发收集器、浴缸、排水栓、扶手、气泡浴、浴缸盖。' },
    { n: 5, title: 'カウンター・収納', titleZh: '台面·收纳', note: '台面、软垫椅、收纳架、壁挂毛巾架。' },
    { n: 6, title: '水栓・シャワー', titleZh: '水龙头·淋浴', note: '洗漱区水栓、花洒、滑杆、浴缸侧水栓。' },
    { n: 7, title: 'ミラー', titleZh: '镜子', note: '7 种镜子 + 防污/防雾加热加工。' },
    { n: 8, title: '照明', titleZh: '照明', note: '天花板照明、壁灯、筒灯（3灯/4灯）。' },
    { n: 9, title: '換気扇・機器', titleZh: '换气扇·设备', note: '换气扇、干燥暖风机、晾衣杆、浴室电视。' },
    { n: 10, title: '握りバー', titleZh: '扶手', note: 'I型/L型扶手，先装/后装价格不同。' },
    { n: 11, title: '窓', titleZh: '窗户', note: '宽幅大/小窗、百叶、窗连接框。套装价不含窗本体/窗框。' }
  ];

  /* ---------------- 维度配置 ----------------
   * kind:
   *   radio  — 从分类 options 中按 idxs 单选
   *   items  — 分类指定 option 的 items 单选（+「なし」虚拟项，记为 ii=-1）
   *   lidhook— 分类指定 option 的 items 单选，价格按風呂フタ枚数取 price2/price3
   *   mirror — 单选 option + options 子项（防污加工）二次选择
   *   grab   — 单选 option（I型先付/I型後付/L型/なし）+ items 子项
   *   shift  — 门位置偏移（特殊：按门型×尺寸×位置匹配 option，再选 mm）
   *   window — 窗型单选 + 面格子/サッシ色 子项
   *   frames — 接続枠（finishes 型号单选）
   *   toggle — 复选框（有/无）
   *   none   — 参考展示项（不参与计价）
   */
  var DIMS = [
    // step 0 —— 尺寸（特殊，state.size 直接存 code）
    // step 1
    { id: 'region',          step: 1, cat: 'region',        kind: 'radio', idxs: [0, 1, 2], titleJa: '地域', titleZh: '地域' },
    { id: 'floor_structure', step: 1, cat: 'floor_structure', kind: 'radio', idxs: [0, 1], titleJa: 'フロア構造', titleZh: '地板结构' },
    { id: 'install_leg',     step: 1, cat: 'install_leg',   kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], titleJa: '設置脚', titleZh: '安装脚' },
    { id: 'insulation_floor', step: 1, cat: 'insulation',   kind: 'radio', idxs: [0, 1], titleJa: 'フロア保温材', titleZh: '地板保温材' },
    { id: 'insulation_apron', step: 1, cat: 'insulation',   kind: 'radio', idxs: [2, 3], titleJa: '浴槽エプロン保温材', titleZh: '浴缸围板保温材' },
    { id: 'wall_structure',  step: 1, cat: 'wall_structure', kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], titleJa: '壁構造（壁高さ）', titleZh: '墙结构（墙高）' },
    // step 2
    { id: 'door',            step: 2, cat: 'door',          kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], titleJa: 'ドア種', titleZh: '门型', colorSub: true },
    { id: 'door_shift',      step: 2, cat: 'door_shift',    kind: 'shift', titleJa: 'ドア位置ずらし', titleZh: '门位置偏移' },
    { id: 'door_2way',       step: 2, cat: 'door_2way',     kind: 'radio', idxs: [0, 1], titleJa: 'ドア2方向設置', titleZh: '双向开门' },
    { id: 'door_frame',      step: 2, cat: 'door_2way',     kind: 'items', optIdx: 2, titleJa: '樹脂製ドア額縁', titleZh: '树脂门框' },
    { id: 'door_towel',      step: 2, cat: 'door_2way',     kind: 'items', optIdx: 3, titleJa: 'ドア外付けタオル掛け', titleZh: '门外毛巾架' },
    // step 3
    { id: 'wall_mode',       step: 3, cat: null,            kind: 'custom', titleJa: 'ルームカラー', titleZh: '配色方案' },
    { id: 'wall_front',      step: 3, cat: 'wall_color',    kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], titleJa: '正面壁カラー', titleZh: '正面墙颜色' },
    { id: 'wall_peri',       step: 3, cat: 'wall_color',    kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], titleJa: '周辺壁カラー', titleZh: '周边墙颜色' },
    { id: 'ceiling',         step: 3, cat: 'ceiling',       kind: 'radio', idxs: [0, 1], titleJa: '天井', titleZh: '天花板' },
    // step 4
    { id: 'floor_mat',       step: 4, cat: 'floor',         kind: 'radio', idxs: [0], titleJa: 'フロア', titleZh: '地板' },
    { id: 'apron',           step: 4, cat: 'floor',         kind: 'radio', idxs: [1, 2], titleJa: '浴槽エプロン', titleZh: '浴缸围板' },
    { id: 'hair_catcher',    step: 4, cat: 'floor',         kind: 'radio', idxs: [3, 4], titleJa: 'ヘアキャッチャー', titleZh: '毛发收集器' },
    { id: 'bathtub',         step: 4, cat: 'bathtub',       kind: 'radio', idxs: [0, 1, 2, 3], titleJa: '浴槽', titleZh: '浴缸' },
    { id: 'drain',           step: 4, cat: 'bathtub',       kind: 'radio', idxs: [4, 5], titleJa: '浴槽排水栓', titleZh: '浴缸排水栓' },
    { id: 'handgrip',        step: 4, cat: 'bathtub',       kind: 'radio', idxs: [6, 7], titleJa: 'ハンドグリップ', titleZh: '浴缸扶手' },
    { id: 'jet',             step: 4, cat: 'bathtub',       kind: 'toggle', optIdx: 8, titleJa: '2穴ジェットエアーバス', titleZh: '气泡按摩浴（2穴）' },
    { id: 'bath_lid',        step: 4, cat: 'bath_lid',      kind: 'radio', idxs: [0, 1, 2, 3], titleJa: '風呂フタ', titleZh: '浴缸盖' },
    { id: 'lid_hook',        step: 4, cat: 'bath_lid',      kind: 'lidhook', optIdx: 4, titleJa: '風呂フタフック', titleZh: '浴缸盖挂钩' },
    // step 5
    { id: 'counter',         step: 5, cat: 'counter',       kind: 'radio', idxs: [0, 1], titleJa: 'カウンター', titleZh: '台面' },
    { id: 'counter_color',   step: 5, cat: 'counter',       kind: 'none', optIdx: 2, titleJa: 'カウンターカラー', titleZh: '台面颜色' },
    { id: 'chair',           step: 5, cat: 'counter',       kind: 'radio', idxs: [3, 4, 5], titleJa: 'スムーズクッションチェア', titleZh: '软垫椅' },
    { id: 'storage',         step: 5, cat: 'storage',       kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7], titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'towel_bar',       step: 5, cat: 'storage',       kind: 'radio', idxs: [8, 9, 10], titleJa: '壁付けタオル掛け', titleZh: '壁挂毛巾架' },
    // step 6
    { id: 'basin_faucet',    step: 6, cat: 'faucet_shower', kind: 'radio', idxs: [0, 1, 2, 3, 4, 5], titleJa: '洗い場側水栓', titleZh: '洗漱区水龙头' },
    { id: 'shower',          step: 6, cat: 'faucet_shower', kind: 'radio', idxs: [6, 7, 8, 9, 10, 11, 12], titleJa: 'シャワー', titleZh: '淋浴花洒' },
    { id: 'slide_bar',       step: 6, cat: 'faucet_shower', kind: 'radio', idxs: [14, 15, 16], titleJa: 'スライドバー', titleZh: '滑动杆' },
    { id: 'tub_faucet',      step: 6, cat: 'faucet_shower', kind: 'radio', idxs: [17, 18, 19, 20], titleJa: '浴槽側水栓', titleZh: '浴缸侧水龙头' },
    // step 7
    { id: 'mirror',          step: 7, cat: 'mirror',        kind: 'mirror', idxs: [0, 1, 2, 3, 4, 5, 6], titleJa: 'ミラー', titleZh: '镜子' },
    // step 8
    { id: 'lighting',        step: 8, cat: 'lighting',      kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], titleJa: '照明', titleZh: '照明' },
    // step 9
    { id: 'vent_fan',        step: 9, cat: 'vent',          kind: 'radio', idxs: [0, 1, 2, 3, 4, 5, 6, 7], titleJa: '換気扇', titleZh: '换气扇' },
    { id: 'vent_dryer',      step: 9, cat: 'vent',          kind: 'radio', idxs: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], titleJa: '換気乾燥暖房機', titleZh: '干燥暖风机' },
    { id: 'ceiling_hole',    step: 9, cat: 'vent',          kind: 'radio', idxs: [20, 21], titleJa: '換気機器用天井穴加工', titleZh: '换气设备吊顶开孔' },
    { id: 'drying_bar',      step: 9, cat: 'vent',          kind: 'radio', idxs: [22, 23], titleJa: '物干しバー', titleZh: '晾衣杆' },
    { id: 'bath_tv',         step: 9, cat: 'vent',          kind: 'toggle', optIdx: 24, titleJa: '浴室テレビ', titleZh: '浴室电视' },
    // step 10
    { id: 'grab_bar',        step: 10, cat: 'grab_bar',     kind: 'grab', idxs: [0, 1, 2, 4], titleJa: '握りバー', titleZh: '扶手' },
    { id: 'grab_pos',        step: 10, cat: 'grab_bar',     kind: 'none', optIdx: 3, titleJa: '取付推奨位置', titleZh: '推荐安装位置' },
    // step 11
    { id: 'window_type',     step: 11, cat: 'window',       kind: 'window', idxs: [0, 1, 2], titleJa: '窓', titleZh: '窗户' },
    { id: 'window_blind',    step: 11, cat: 'window',       kind: 'items', optIdx: 3, titleJa: 'ワイド窓用ブラインド', titleZh: '宽窗百叶' },
    { id: 'window_frame',    step: 11, cat: 'window',       kind: 'frames', optIdx: 4, titleJa: 'ワイド窓枠用窓接続枠', titleZh: '宽窗框连接框' },
    { id: 'window_frame_free', step: 11, cat: 'window',     kind: 'frames', optIdx: 5, titleJa: 'フリー窓接続枠', titleZh: '自由窗连接框' },
    { id: 'window_frame_6s', step: 11, cat: 'window',       kind: 'items', optIdx: 6, titleJa: '既存6尺窓対応用接続枠', titleZh: '既有6尺窗连接框' },
    { id: 'window_frame_ang', step: 11, cat: 'window',      kind: 'items', optIdx: 7, titleJa: 'アングル無しサッシ用窓接続枠', titleZh: '无角铝窗连接框' }
  ];

  /* ---------------- シャワー × 洗い場側水栓 联动价格表（P21 価格・対応表） ----------------
   * 键：シャワー code → { 水栓 code: 差价 }；缺列 = 该组合不可选。
   * 数据源：手册 P.107-108（pdf_text.txt 3361-3416 行，reviewer t4 核实）
   * 未选水栓时按 WM（壁出しメッキ，基本）处理；矩阵无对应水栓列时回退选项单值。
   */
  var SHOWER_FAUCET_MATRIX = {
    'M-シャワー': { WM: 0, CM: 68000, KM: 11000 },        // メッキシャワー
    'U':          { WM: 15000 },                          // メッキシャワー（手元止水あり）
    'R':          { WM: 20000, CM: 88000 },               // シルクベールシャワー
    'T':          { CM: 78000 },                          // ワイドシャワー
    'C':          { TM: 148000, TA: 133000 },             // コンフォートウエーブ
    'B':          { TM: 163000, TA: 148000 },             // コンフォートウエーブ（手元止水あり）
    'W-シャワー':  { WW: -2000 }                          // ホワイトシャワーヘッド
  };
  /** 当前所选水栓 code（未选 = WM 基本） */
  function basinFaucetCode() {
    var o = selOpt('basin_faucet');
    return o ? o.code : 'WM';
  }

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1616',            // 尺寸 code
    doorPos: 'R/L',          // R/L | CR/CL
    sel: {},                 // { dimId: optionId }  radio/custom 维度
    sub: {},                 // { dimId: {oi, ii|mm|colorIdx|lattice|sash|finish} } 特殊维度
    toggles: {},             // { dimId: true }  toggle 维度
    rate: null,              // 汇率（1日元=人民币）；<=0/null 时不计算人民币（大陆地区价格）
    quoteHead: {             // 报价单头部（可编辑）
      no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: ''
    },
    lang: 'both'             // both | zh | ja（报价单语言）
  };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function opt(dimId, oi) {
    var d = dim(dimId);
    if (!d || !d.cat) return null;
    return cat(d.cat).options[oi];
  }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }
  function selOpt(dimId) {
    var d = dim(dimId);
    var oid = state.sel[dimId];
    if (oid == null || !d || !d.cat) return null;
    return cat(d.cat).options[Number(oid.split('::')[1])];
  }
  function optionId(dimId, oi) { return dimId + '::' + oi; }
  function sizeOption() { return cat('size').options.find(function (o) { return o.code === state.size; }); }
  function doorOption() { return selOpt('door'); }
  function doorColorIdx() {
    var s = state.sub.door;
    return s && typeof s.colorIdx === 'number' ? s.colorIdx : 0;
  }

  /* 门型 → wall_price/accent 的 doorType 分组；未选门时按基本仕様（折戸 W800） */
  function doorTypeGroup() {
    var o = doorOption();
    if (!o) return '開戸/折戸/片引戸/ガラス面材開戸（W800）';  // 基本仕様门 = 折戸 W800
    switch (o.code) {
      case 'A': case 'C': case 'E': case 'L': case 'N': return '開戸/折戸/片引戸/ガラス面材開戸（W800）';
      case 'B': case 'D': return '開戸/折戸（W700）';
      case 'G': return '2枚引戸（W1000）';
      case 'J': return '3枚引戸（W1450）';
      case 'M': case 'O': return 'ガラス面材開戸+FIX窓';
      default: return null;
    }
  }

  /* 门位置偏移：匹配 door_shift 中「门型组 spec × 尺寸 × 位置」的 option */
  function shiftSpecForDoor() {
    var o = doorOption();
    if (!o) return null;
    switch (o.code) {
      case 'A': case 'C': case 'L': case 'N': case 'M': case 'O': return '折戸/開戸/ガラス面材開戸（W800）';
      case 'B': case 'D': return '折戸/開戸（W700）';
      case 'E': return '片引戸（W800）';
      case 'G': return '2枚引戸（W1000）';
      default: return null; // 3枚引戸 无偏移
    }
  }
  function shiftOption() {
    var spec = shiftSpecForDoor();
    if (!spec) return null;
    return cat('door_shift').options.find(function (o) {
      return o.spec === spec && P.sizeKeyMatches(o.size, state.size) &&
        (o.position === state.doorPos || (o.position || '').indexOf(state.doorPos) >= 0);
    });
  }

  /* wall_price / accent 行查找 */
  function wallPriceRow(mode, wallClassKey, doorType) {
    var list = cat('wall_price').options.filter(function (o) {
      return o.mode === mode && String(o.wallClass).toLowerCase() === String(wallClassKey).toLowerCase() && o.doorType === doorType;
    });
    return list.length ? list[0] : null;
  }
  function accentRow(frontClass, periClass, doorType) {
    var A = window.RAKUVIA_ACCENT;
    if (!A || !A.tables) return null;
    var re = new RegExp('正面壁 Class (\\d+) / 周辺壁 Class (\\d+)');
    for (var i = 0; i < A.tables.length; i++) {
      var m = A.tables[i].title.match(re);
      if (m && Number(m[1]) === frontClass && Number(m[2]) === periClass) {
        var row = A.tables[i].rows.find(function (r) { return r[0] === doorType; });
        return row ? row[1] : null;
      }
    }
    return null;
  }
  function wallClassOf(colorOption) {
    if (!colorOption || !colorOption.class) return null;
    // 'Class 02' → 'class 02'（保留前导零，与 wall_price 的 wallClass 键一致）
    return 'class ' + String(colorOption.class).replace(/^Class\s*/i, '').trim();
  }

  /* ---------------- 计价 ---------------- */

  /** 解析价格单元格 → 数字差价；null 表示无法确定。'基本仕様' 视为 0 元（相对基准价） */
  function cellAmount(cell) {
    if (cell == null) return null;
    var c = P.parseCell(cell);
    if (c.type === 'num') return c.amount;
    if (c.type === 'basic') return 0;   // 基本仕様 → 0 元（P9：不再误报"未计入"）
    return null;
  }

  /** radio 维度选项差价 */
  function radioContribution(optObj) {
    if (!optObj) return null;
    if (typeof optObj.priceDiff === 'number') return optObj.priceDiff;
    if (optObj.isBasic === true) return 0;
    if (optObj.priceMatrix) {
      var cell = P.matrixCell(optObj, state.size, state.doorPos, doorColorIdx());
      return cellAmount(cell);
    }
    if (Array.isArray(optObj.colorRows) && optObj.colorRows.length) {
      var cell2 = P.matrixCell(optObj, state.size, state.doorPos, doorColorIdx());
      return cellAmount(cell2);
    }
    if (optObj.pricesBySize) {
      var v = P.priceBySize(optObj, state.size);
      if (typeof v === 'number') return v;
      return cellAmount(v);
    }
    return null;
  }

  /** 镜子子项差价 */
  function mirrorSubContribution(dimId) {
    var oid = state.sel[dimId];
    if (oid == null) return null;
    var oi = Number(oid.split('::')[1]);
    var o = opt(dimId, oi);
    if (!o) return null;
    var s = state.sub[dimId];
    var si = s && typeof s.si === 'number' ? s.si : 0;
    var sub = Array.isArray(o.options) ? o.options[si] : null;
    if (!sub) return null;
    if (sub.priceBySize) {
      var v = P.priceBySize({ pricesBySize: sub.priceBySize }, state.size);
      return typeof v === 'number' ? v : cellAmount(v);
    }
    var v2 = sub.price1620 != null ? sub.price1620 : sub.price;
    return cellAmount(v2);
  }

  /** 门位置偏移差价 */
  function shiftContribution() {
    var s = state.sub.door_shift;
    if (!s || !s.mm) return null;         // 未选偏移
    var o = shiftOption();
    if (!o || !o.prices) return null;
    var key = s.mm + 'mm';
    return cellAmount(o.prices[key]);
  }

  /** 2方向开门差价（pricesByWallClass，按周辺壁 Class × 门色；P10：アクセント模式下取周辺壁 Class） */
  function door2wayContribution() {
    var oid = state.sel.door_2way;
    if (oid == null) return 0;
    var oi = Number(oid.split('::')[1]);
    var o = opt('door_2way', oi);
    if (!o) return 0;
    if (typeof o.priceDiff === 'number') return o.priceDiff;
    if (!o.pricesByWallClass) return null;
    var mode = state.sel.wall_mode || 'フルカラー';
    var cls;
    var peri = selOpt('wall_peri');
    if (mode === 'アクセントカラー' && peri && peri.class) {
      cls = peri.class;                    // 手册「B 設置面の壁クラス」= CR/CL 侧墙 = 周辺壁
    } else {
      var front = selOpt('wall_front');
      cls = front && front.class ? front.class : 'Class 02';
    }
    var byClass = o.pricesByWallClass[cls];
    if (!byClass) return null;
    var colorKey = doorColorIdx() === 0 ? 'ホワイト' : 'ブラック・グレージュシルバー';
    var v = byClass[colorKey];
    return typeof v === 'number' ? v : null;
  }

  /** 墙色差价（フルカラー → wall_price；アクセント → accent 表；正面 C03 → 壁高組合表回退） */
  function wallColorContribution() {
    var front = selOpt('wall_front');
    if (!front) return null;
    var mode = state.sel.wall_mode || 'フルカラー';
    var doorT = doorTypeGroup();
    if (!doorT) return null;
    if (mode === 'フルカラー') {
      var cls = wallClassOf(front);
      var row = wallPriceRow('フルカラー', cls, doorT);
      if (!row) return null;
      var cell = P.matrixCell(row, state.size, state.doorPos, 0);
      return cellAmount(cell);
    }
    // アクセント：正面壁 Class × 周辺壁 Class
    var peri = selOpt('wall_peri');
    var fClass = Number(String(front.class || '').replace(/\D/g, '')) || 2;
    var pClass = Number(String(peri ? peri.class : '').replace(/\D/g, '')) || 3;
    if (fClass === 3) {
      // 正面壁 Class 03（P3）：手册 P12 表在 wall_price（mode='accent-frontC03'，wallClass=周辺壁 class）
      var row3 = wallPriceRow('accent-frontC03', 'class 0' + pClass, doorT);
      if (!row3) return null;
      var cell3 = P.matrixCell(row3, state.size, state.doorPos, 0);
      return cellAmount(cell3);
    }
    var pm = accentRow(fClass, pClass, doorT);
    if (!pm) return null;
    var cell2 = P.matrixCell({ priceMatrix: pm }, state.size, state.doorPos, 0);
    return cellAmount(cell2);
  }

  /** 窗型差价（prices 按面格子） */
  function windowContribution() {
    var oid = state.sel.window_type;
    if (oid == null) return 0;
    var oi = Number(oid.split('::')[1]);
    var o = opt('window_type', oi);
    if (!o) return 0;
    if (typeof o.priceDiff === 'number') return o.priceDiff;
    if (o.prices) {
      var s = state.sub.window_type;
      var lattice = s && s.lattice === 'あり' ? '面格子あり' : '面格子なし';
      return o.prices[lattice] != null ? o.prices[lattice] : null;
    }
    return 0;
  }

  /** 接続枠（frames）差价 */
  function framesContribution(dimId) {
    var s = state.sub[dimId];
    if (!s || typeof s.fi !== 'number') return null;   // 未选型号
    var o = opt(dimId, s.oi);
    if (!o || !o.finishes) return null;
    var fin = o.finishes[s.finish || 'シーリング仕上げ'];
    if (!Array.isArray(fin)) return null;
    var item = fin[s.fi];
    return item ? (typeof item.price === 'number' ? item.price : cellAmount(item.price)) : null;
  }

  /** items 维度差价（door_frame/door_towel/window_blind/window_frame_6s/ang） */
  function itemsContribution(dimId) {
    var s = state.sub[dimId];
    if (!s || typeof s.ii !== 'number' || s.ii < 0) return null;   // なし 或未选
    var o = opt(dimId, s.oi);
    if (!o || !Array.isArray(o.items)) return null;
    var it = o.items[s.ii];
    if (!it) return null;
    return typeof it.price === 'number' ? it.price : cellAmount(it.price);
  }

  /** 浴缸盖挂钩差价（按風呂フタ枚数取 price2/price3） */
  function lidHookContribution() {
    var s = state.sub.lid_hook;
    if (!s || typeof s.ii !== 'number' || s.ii < 0) return null;
    var o = opt('lid_hook', s.oi);
    if (!o || !Array.isArray(o.items)) return null;
    var it = o.items[s.ii];
    if (!it) return null;
    var lid = selOpt('bath_lid');
    var col = lid && lid.code === 'B' ? 'price3' : 'price2';
    return cellAmount(it[col]);
  }

  /** 扶手（grab）差价 */
  function grabContribution() {
    var oid = state.sel.grab_bar;
    if (oid == null) return 0;
    var oi = Number(oid.split('::')[1]);
    var o = opt('grab_bar', oi);
    if (!o) return 0;
    if (typeof o.priceDiff === 'number') return o.priceDiff;   // なし=0
    var s = state.sub.grab_bar;
    if (!s || typeof s.ii !== 'number' || s.ii < 0) return null;
    var it = Array.isArray(o.items) ? o.items[s.ii] : null;
    return it ? (typeof it.price === 'number' ? it.price : cellAmount(it.price)) : null;
  }

  /** シャワー差价（按洗い場側水栓联动，P4；缺联动列回退单值） */
  function showerContribution() {
    var oid = state.sel.shower;
    if (oid == null) return null;
    var o = opt('shower', Number(oid.split('::')[1]));
    if (!o) return null;
    var row = SHOWER_FAUCET_MATRIX[o.code];
    var fc = basinFaucetCode();
    if (row && Object.prototype.hasOwnProperty.call(row, fc)) return row[fc];
    return radioContribution(o);   // 回退选项单值
  }

  /** 单个维度当前差价（未选/無し → null；含0元也算有效） */
  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'radio': {
        var oid = state.sel[dimId];
        if (oid == null) return null;
        // 特判（P1/P2）：墙色计价走 wallColorContribution；周辺壁本身 0 元；双开门走 pricesByWallClass
        if (dimId === 'wall_front') return wallColorContribution();
        if (dimId === 'wall_peri') return 0;
        if (dimId === 'door_2way') return door2wayContribution();
        if (dimId === 'shower') return showerContribution();
        return radioContribution(opt(dimId, Number(oid.split('::')[1])));
      }
      case 'mirror': {
        var oid2 = state.sel[dimId];
        if (oid2 == null) return null;
        return mirrorSubContribution(dimId);
      }
      case 'grab': return grabContribution();
      case 'shift': return shiftContribution();
      case 'items': return itemsContribution(dimId);
      case 'lidhook': return lidHookContribution();
      case 'frames': return framesContribution(dimId);
      case 'toggle': {
        if (!state.toggles[dimId]) return null;
        var o = opt(dimId, dim(dimId).optIdx);
        return typeof o.priceDiff === 'number' ? o.priceDiff : null;
      }
      case 'custom':
        if (dimId === 'wall_front') return wallColorContribution();
        return null;   // wall_mode / wall_peri 本身不直接计价
      case 'window': return windowContribution();
      case 'none': return null;
      default: return null;
    }
  }

  /** 当前维度所选「行」描述（报价单明细用） */
  function describe(dimId) {
    var d = dim(dimId);
    var out = { nameZh: '', nameJa: '', code: '', model: '', diff: null, extra: '' };
    if (!d) return out;
    var getOpt = function (oi) { return opt(dimId, oi); };
    switch (d.kind) {
      case 'radio': {
        var oid = state.sel[dimId];
        if (oid == null) return out;
        var o = getOpt(Number(oid.split('::')[1]));
        if (!o) return out;
        out.nameZh = o.name_zh || o.name_ja || '';
        out.nameJa = o.name_ja || '';
        out.code = o.code || '';
        if (d.colorSub && o.colorRows) {
          var ci = doorColorIdx();
          var row = o.colorRows[ci];
          if (row) out.extra = row.color_ja || '';
        }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'mirror': {
        var oid2 = state.sel[dimId];
        if (oid2 == null) return out;
        var o2 = getOpt(Number(oid2.split('::')[1]));
        if (!o2) return out;
        out.nameZh = o2.name_zh || o2.name_ja || '';
        out.nameJa = o2.name_ja || '';
        out.code = o2.code || '';
        var s = state.sub[dimId];
        var si = s && typeof s.si === 'number' ? s.si : 0;
        var sub = Array.isArray(o2.options) ? o2.options[si] : null;
        if (sub) { out.nameZh += '（' + (sub.sub_zh || sub.sub_ja || '') + '）'; out.nameJa += '（' + (sub.sub_ja || '') + '）'; }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'grab': {
        var oid3 = state.sel[dimId];
        if (oid3 == null) return out;
        var o3 = getOpt(Number(oid3.split('::')[1]));
        if (!o3) return out;
        out.nameZh = o3.name_zh || o3.name_ja || '';
        out.nameJa = o3.name_ja || '';
        var gs = state.sub[dimId];
        if (gs && typeof gs.ii === 'number' && gs.ii >= 0 && Array.isArray(o3.items)) {
          var it = o3.items[gs.ii];
          if (it) {
            out.extra = [it.color, it.size, it.model].filter(Boolean).join(' ');
            out.model = it.model || '';
          }
        }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'shift': {
        var s2 = state.sub[dimId];
        if (!s2 || !s2.mm) return out;
        out.nameZh = '门位置偏移 ' + s2.mm + 'mm';
        out.nameJa = 'ドア位置ずらし ' + s2.mm + 'mm';
        var so = shiftOption();
        if (so) out.extra = so.spec || '';
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'items': case 'lidhook': {
        var s3 = state.sub[dimId];
        if (!s3) return out;
        var o4 = getOpt(s3.oi);
        if (!o4) return out;
        out.nameZh = o4.name_zh || o4.name_ja || '';
        out.nameJa = o4.name_ja || '';
        if (s3.ii >= 0 && Array.isArray(o4.items)) {
          var it2 = o4.items[s3.ii];
          if (it2) {
            out.extra = [it2.name_ja || it2.color, it2.size, it2.finish, it2.model].filter(Boolean).join(' ');
            out.model = it2.model || '';
          }
        }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'frames': {
        var s4 = state.sub[dimId];
        if (!s4 || typeof s4.fi !== 'number') return out;
        var o5 = getOpt(s4.oi);
        if (!o5) return out;
        out.nameZh = o5.name_zh || o5.name_ja || '';
        out.nameJa = o5.name_ja || '';
        var fin = o5.finishes[s4.finish || 'シーリング仕上げ'] || [];
        var it3 = fin[s4.fi];
        if (it3) {
          out.extra = [it3.finish, it3.size, it3.color, it3.dim, it3.model].filter(Boolean).join(' ');
          out.model = it3.model || '';
        }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'window': {
        var oid4 = state.sel[dimId];
        if (oid4 == null) return out;
        var o6 = getOpt(Number(oid4.split('::')[1]));
        if (!o6) return out;
        out.nameZh = o6.name_zh || o6.name_ja || '';
        out.nameJa = o6.name_ja || '';
        out.code = o6.code || '';
        var ws = state.sub[dimId];
        if (ws && o6.code !== 'Z') {
          out.extra = '面格子' + (ws.lattice || 'なし') + ' ／ サッシ色 ' + (ws.sash || 'ホワイト');
        }
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'toggle': {
        if (!state.toggles[dimId]) return out;
        var o7 = getOpt(d.optIdx);
        if (!o7) return out;
        out.nameZh = o7.name_zh || o7.name_ja || '';
        out.nameJa = o7.name_ja || '';
        out.code = o7.code || '';
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'custom': {
        if (dimId === 'wall_front' || dimId === 'wall_peri') {
          var oid5 = state.sel[dimId];
          if (oid5 == null) return out;
          var o8 = getOpt(Number(oid5.split('::')[1]));
          if (!o8) return out;
          out.nameZh = (dimId === 'wall_front' ? '正面墙 ' : '周边墙 ') + (o8.name_zh || o8.name_ja || '');
          out.nameJa = (dimId === 'wall_front' ? '正面壁 ' : '周辺壁 ') + (o8.name_ja || '');
          out.code = o8.code || '';
          out.extra = o8.class || '';
          if (dimId === 'wall_front') out.diff = wallColorContribution();
          return out;
        }
        return out;
      }
      case 'none': return out;
      default: return out;
    }
  }

  /** 汇总计算 */
  function computeQuote() {
    var base = sizeOption();
    var total = base ? base.price : 0;
    var lines = [];
    var unknown = [];
    lines.push({
      step: 0, stepZh: STEPS[0].titleZh, stepJa: STEPS[0].title,
      nameZh: '基本セット ' + (base ? (base.name_zh || base.code) : state.size),
      nameJa: base ? base.name_ja : state.size,
      code: state.size, model: '', extra: '取付・設置費別（不含安装费）',
      diff: 0, base: true
    });
    // 门位置（R/L 或 CR/CL）作为基础行附加信息
    DIMS.forEach(function (d) {
      if (d.step === 0 || d.kind === 'none') return;
      if (d.id === 'wall_mode') return;                    // 方案本身无价格
      if (d.id === 'wall_peri' && (state.sel.wall_mode || 'フルカラー') !== 'アクセントカラー') return; // フルカラー时周辺壁不单独计价
      var desc = describe(d.id);
      if (!desc.nameZh && !desc.nameJa) return;            // 未选择
      var diff = desc.diff;
      if (diff == null) {
        unknown.push({ dimId: d.id, name: desc.nameZh || desc.nameJa, detail: desc.extra });
        return;
      }
      if (diff === 0 && d.kind !== 'radio') { }            // 0 元选项仍列出（如なし）？
      total += diff;
      lines.push({
        step: d.step, stepZh: STEPS[d.step].titleZh, stepJa: STEPS[d.step].title,
        nameZh: desc.nameZh, nameJa: desc.nameJa, code: desc.code, model: desc.model,
        extra: desc.extra, diff: diff, base: false
      });
    });
    var tax = Math.round(total * 0.10);
    var totalInc = total + tax;
    // 大陆地区价格（人民币含安装费）= 日元税込 × 汇率 × 0.7（7折）；无有效汇率时为 null
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * 0.7) : null;
    return {
      base: base, basePrice: base ? base.price : 0,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: state.size, doorPos: state.doorPos
    };
  }

  /* ---------------- 组合约束 ---------------- */

  function selected(dimId) { return state.sel[dimId] != null || state.toggles[dimId] != null; }
  function selIs(dimId, codes) {
    var o = selOpt(dimId);
    if (!o) return false;
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(o.code) >= 0;
  }
  function wallStructureIs(codes) { return selIs('wall_structure', codes); }

  /**
   * 判断某维度某选项是否禁用；返回 reason 字符串或 null。
   * 规则来源：规格文档 §7.2 + 数据 notes（核心互斥硬编码）。
   */
  function disabledReason(dimId, oi) {
    var o = opt(dimId, oi);
    if (!o) return null;
    var code = o.code;
    var size = state.size;

    // ---- 尺寸相关 ----
    if (dimId === 'door' && code === 'J' && size === '1216') return '1216 型不可选 3枚引戸';
    if (dimId === 'lighting' && code === 'P' && (size === '1620' || size === '1618' || size === '1717')) return '1620/1618/1717 不可选壁灯 1灯';
    // P6：2穴ジェット仅 16＊＊/1717 可装（手册 P16 ※）
    if (dimId === 'jet' && (size === '1216' || size === '1317' || size === '1418')) return '1216/1317/1418 不可选 2穴ジェット（仅16＊＊/1717）';

    // ---- ジェット → 二重パン（正向提示；反向禁选二重パン不需）----
    // ---- 兼用水栓 KM ----
    if (dimId === 'tub_faucet' && code !== 'Z-浴槽水栓' && selIs('basin_faucet', 'KM')) return '兼用水栓与浴缸侧水栓互斥';
    if (dimId === 'basin_faucet' && code === 'KM') {
      var tf = selOpt('tub_faucet');
      if (tf && tf.code !== 'Z-浴槽') return '浴缸侧水栓与兼用水栓互斥';
      if (selIs('storage', ['A', 'C'])) return '兼用水栓与スタイルシェルフ不可并用';
    }
    if (dimId === 'storage' && (code === 'A' || code === 'C') && selIs('basin_faucet', 'KM')) return '兼用水栓与スタイルシェルフ不可并用';

    // P4：シャワー × 洗い場側水栓 不可组合（P21 節湯表 '-' 格）
    if (dimId === 'shower' && SHOWER_FAUCET_MATRIX[code]) {
      var fc = basinFaucetCode();
      if (!Object.prototype.hasOwnProperty.call(SHOWER_FAUCET_MATRIX[code], fc)) {
        return '该シャワー与所选水栓不可组合（P21 節湯表）';
      }
    }
    // 反向：选某シャワー后，水栓若非其可用列则禁（简化：只正向提示，反向不禁水栓）

    // ---- 镜子 ----
    var mirrorCodes = ['M', 'W', 'K'];   // スクエア/ワイド/カドマル
    if (dimId === 'storage' && (code === 'Y' || code === 'N') && selIs('mirror', mirrorCodes)) return 'サイド収納棚与スクエア/ワイド/カドマル镜互斥';
    if (dimId === 'mirror' && mirrorCodes.indexOf(code) >= 0 && selIs('storage', ['Y', 'N'])) return '与サイド収納棚互斥';
    if (dimId === 'mirror' && mirrorCodes.indexOf(code) >= 0 && selIs('storage', 'M')) return 'メタルシェルフ与镜子不可并用';
    if (dimId === 'storage' && code === 'M' && selIs('mirror', 'Z') === false && selected('mirror')) return 'メタルシェルフ与镜子不可并用';
    // P7：メタルシェルフ ↔ カウンター（手册 P20 ※）
    if (dimId === 'counter' && code === 'A' && selIs('storage', 'M')) return 'メタルシェルフ与カウンター不可并用';
    if (dimId === 'storage' && code === 'M' && selIs('counter', 'A')) return 'メタルシェルフ与カウンター不可并用';
    if (dimId === 'mirror' && code === 'H' && selIs('lighting', ['P', 'K'])) return 'ハイロング镜与壁灯互斥';
    if (dimId === 'lighting' && (code === 'P' || code === 'K') && selIs('mirror', 'H')) return '壁灯与ハイロング镜互斥';
    // 低壁（H1900: S/R、現地対応 T）时：壁灯与スリムロング/カドマル镜互斥、ハイロング不可选、スライドバー不可选
    var lowWall = wallStructureIs(['S', 'R', 'T']);
    if (lowWall && dimId === 'mirror' && code === 'H') return '低壁高时ハイロング镜不可选';
    if (lowWall && dimId === 'mirror' && (code === 'S' || code === 'K') && selIs('lighting', ['P', 'K'])) return '低壁高时壁灯与スリムロング/カドマル镜不可并用';
    if (lowWall && dimId === 'lighting' && (code === 'P' || code === 'K') && selIs('mirror', ['S', 'K'])) return '低壁高时壁灯与スリムロング/カドマル镜不可并用';
    if (lowWall && dimId === 'slide_bar' && code !== 'Z-スライド') return '低壁高/現地対応时スライドバー不可选';

    // ---- ワイドミラー → スライドバー（若低壁则镜本身被禁，见上）----
    // ---- 浴缸侧水栓 与 半身浴 ----
    if (dimId === 'bathtub' && (code === 'H' || code === 'Z') && selIs('tub_faucet', ['Y', 'J-浴槽'])) return '壁出し水栓与半身浴浴缸不可组合';
    if (dimId === 'tub_faucet' && (code === 'Y' || code === 'J-浴槽') && selIs('bathtub', ['H', 'Z'])) return '半身浴浴缸时壁出し水栓不可选';

    // ---- シャッターフタ / フタなし → フックなし ----
    if (dimId === 'lid_hook' && selIs('bath_lid', ['S', 'Z'])) return 'シャッター/なし风吕盖时挂钩固定为なし';
    // ---- 物干しバー 与 正面梁欠き ----
    if (dimId === 'drying_bar' && wallStructureIs(['2', '7'])) return '正面梁欠き时物干しバー不可组合';
    if (dimId === 'wall_structure' && (code === '2' || code === '7') && selected('drying_bar')) return '物干しバー与正面梁欠き互斥';
    // ---- 寒冷地 → フロア保温材なし禁 ----
    if (dimId === 'insulation_floor' && code === 'Z-フロア' && selIs('region', ['K', 'G'])) return '寒冷地/極寒冷地时トラップ保温材必含';
    // ---- 欄間パネル対応：偏移不可 ----
    if (dimId === 'door_shift' && wallStructureIs(['L', 'R'])) return '欄間パネル対応墙高时门不可偏移';
    // ---- バスフタ2枚割 + ドア横縦握りバー（部分尺寸）: 简化提示不禁选 ----
    // ---- 窓：なし时ブラインド/接続枠禁 ----
    var winCode = selOpt('window_type');
    var noWin = !winCode || winCode.code === 'Z';
    if ((dimId === 'window_blind' || dimId.indexOf('window_frame') === 0) && noWin) return '未选窗时不可选';
    if (dimId === 'window_type' && code !== 'Z' && oi !== 0) {
      // ブラインド/接続枠已选但换窗型 —— 允许，仅提示
    }
    // ---- ジェット要求（正向）：二重パン 未选时禁选ジェット？不，用 autoFix。反向：无 ----
    if (dimId === 'floor_structure' && code !== 'D' && state.toggles.jet) return '气泡按摩浴需二重パン';
    // ---- 扶手 ----
    if (dimId === 'grab_bar' && selIs('mirror', 'W')) {
      var s = state.sub.grab_bar;
      var isMetal600 = s && s.ii >= 0 && (function () {
        var o = opt('grab_bar', Number(state.sel.grab_bar.split('::')[1]));
        return o && Array.isArray(o.items) && o.items[s.ii] && o.items[s.ii].size === 'W600（台座あり）';
      })();
      if (!isMetal600) return 'ワイド镜时仅可 I型W600 メタル（台座あり）';
    }
    if (dimId === 'grab_bar' && size === '1216') {
      // items 内禁 W800（在子项层处理）
    }
    // P5：矩阵单元格为 "-"（不可选）时禁用（按当前 尺寸×门位置×门色）
    if (o.priceMatrix || (Array.isArray(o.colorRows) && o.colorRows.length)) {
      var cell = P.matrixCell(o, size, state.doorPos, doorColorIdx());
      if (cell === '-') return '该组合不可选（尺寸×位置×颜色）';
    }
    return null;
  }

  /** 选中某维度选项后的自动修复（推荐组合） */
  function autoFix(dimId, oi) {
    var d = dim(dimId);
    if (!d) return;
    // ジェット → 二重パン（P6：仅 16＊＊/1717 允许，且可选时才 autoFix）
    if (dimId === 'jet' && state.toggles.jet) {
      var sz = state.size;
      var jetOk = sz.indexOf('16') === 0 || sz === '1717';
      if (jetOk && !selIs('floor_structure', 'D')) {
        state.sel.floor_structure = optionId('floor_structure', 1);
      }
    }
    // ワイドミラー → スライドバー 台座あり（若未选）
    if (dimId === 'mirror' && oi === 4) {   // W ワイドミラー（分类索引 4）
      var sb = selOpt('slide_bar');
      if (!sb || sb.code === 'Z-スライド') {
        if (!wallStructureIs(['S', 'R', 'T'])) state.sel.slide_bar = optionId('slide_bar', 16); // 台座あり
      }
    }
    // シャッターフタ/フタなし → フックなし
    if (dimId === 'bath_lid' && (oi === 2 || oi === 3)) {
      state.sub.lid_hook = { oi: 4, ii: 6 };   // Z なし
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
  /** 金额 → 中文大写（如 1,078,000 → 壱佰零柒万捌仟円） */
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
      ['サイズ', state.size], ['ドア位置', state.doorPos],
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
    return '\ufeff' + csv;   // BOM 供 Excel 识别 UTF-8
  }

  /* ---------------- 对外 API ---------------- */
  window.RAKUVIA = window.RAKUVIA || {};
  window.RAKUVIA.quote = {
    init: function (data) { DATA = data; P = window.RAKUVIA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt, optionId: optionId,
    sizeOption: sizeOption, doorOption: doorOption, doorColorIdx: doorColorIdx,
    doorTypeGroup: doorTypeGroup, shiftOption: shiftOption,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.sub = {}; state.toggles = {};
      state.size = '1616'; state.doorPos = 'R/L';
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
