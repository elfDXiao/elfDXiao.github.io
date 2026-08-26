/**
 * quote.js — TAKARA STANDARD プレデンシア（Predencia）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.PREDENCIA.quote。
 * 依赖：window.PREDENCIA_DATA（products.js，由 predencia-data.json 生成）、window.PREDENCIA.price
 *
 * 计价模型（全部手册价为税抜き・搬入/取付費別途）：
 *   規格サイズ：本体価格（税抜）= プラン套装价（meta.planPrices[プラン][サイズ]）＋Σ选项差价
 *   ぴったりサイズ：本体価格（税抜）= 間口×浴槽行套装价（meta.pitariMatrix 9行×13列）＋Σ选项差价（受注生産品）
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（1.2）—— 系数仅在计算代码中，页面不显示算式
 *
 * 无タイプ概念：プラン（12）× サイズ（6）矩阵 或 ぴったりサイズ（間口 13 × 浴槽行 9）矩阵。
 * 品番：部品/オプションごとの独立品番（SB182-HB1HK 等）；プラン品番 PLAN01〜形式未確定（meta.productNo note）。
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（12 步：0-11） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ選択', titleZh: '尺寸选择', note: '規格サイズ：6 尺寸（套装基准价＝基本配置・ベーシック構成）。ぴったりサイズ：間口 13 区分×浴槽行 9 種套装价（受注生産）。' },
    { n: 1, title: '浴槽', titleZh: '浴缸', note: '浴槽形状（くつろぎラウンジ/ワイド/ラウンド）→ カラー（WP/DA/K）→ エプロン色 → 浴槽グリップ。' },
    { n: 2, title: '浴槽機能', titleZh: '浴缸功能', note: '肩包み湯（＋199,500・戸建のみ）／うるぽか湯ファイン／ラグジュアリーライト／ヘルシージェット（＋121,000・戸建のみ）／浴室テレビ。' },
    { n: 3, title: '風呂フタ・フック・バー', titleZh: '浴缸盖·挂钩·扶手', note: '断熱風呂フタ／フロフタフック／ハンドバー。' },
    { n: 4, title: '床・排水口', titleZh: '地板·排水口', note: 'キープクリーンフロア（プレミアム ＋29,000／ハイ 基本）＋排水口カバー。' },
    { n: 5, title: '壁', titleZh: '壁面', note: '壁デザインパターン（1面/全面4面/2トーン）＋ホーロークリーン浴室パネル柄（プレミアム 15 柄＋15,000／ハイ 19 柄基本）。' },
    { n: 6, title: 'カウンター・水栓', titleZh: '台面·水龙头', note: 'カウンター（クォーツデュアル/クォーツ/人造大理石/なし）→ 洗い場用水栓（カウンター連動）→ シャワーヘッド → 浴槽用水栓。' },
    { n: 7, title: 'ドア', titleZh: '门', note: 'キープクリーンドア（折戸/開き戸/引戸）＋ドアオプション。' },
    { n: 8, title: '天井・換気・暖房', titleZh: '天花·换气·暖风', note: '天井（高光沢フラット/カラーフラット）＋換気扇＋浴室暖房乾燥機。' },
    { n: 9, title: '照明・ミラー', titleZh: '照明·镜子', note: '照明（調光調色/ダウンライト/スクエア等）＋ミラー（ラグジュアリー/ワイドクリア/ロング等）。' },
    { n: 10, title: '収納・タオル・ラック', titleZh: '收纳·毛巾·置物架', note: '収納棚＋タオル掛け＋どこでもラック（MGSB）。' },
    { n: 11, title: 'その他・別売部品', titleZh: '其他·另售配件', note: '窓枠／ルームヒーター／循環金具／設置用別売部品（価格未掲載品は選択不可）。' }
  ];

  /* ---------------- 维度配置 ---------------- */
  var DIMS = [
    // step 0
    { id: 'mode', step: 0, cat: 'mode', kind: 'radio', codes: 'ALL', titleJa: 'サイズモード', titleZh: '尺寸模式' },
    { id: 'plan', step: 0, cat: 'plan', kind: 'radio', codes: 'ALL', titleJa: 'プラン', titleZh: '方案' },
    { id: 'pitari_col', step: 0, cat: 'pitari_col', kind: 'radio', codes: 'ALL', titleJa: '間口区分', titleZh: '间口分区' },
    { id: 'pitari_row', step: 0, cat: 'pitari_row', kind: 'radio', codes: 'ALL', titleJa: '浴槽行', titleZh: '浴缸行' },
    // step 1 浴槽
    { id: 'bathtub', step: 1, cat: 'bathtub', kind: 'radio', codes: 'ALL', titleJa: '浴槽形状', titleZh: '浴缸形状' },
    { id: 'bathtub_color', step: 1, cat: 'bathtub_color', kind: 'radio', codes: 'ALL', titleJa: '浴槽カラー', titleZh: '浴缸颜色' },
    { id: 'apron_color', step: 1, cat: 'apron_color', kind: 'radio', codes: 'ALL', titleJa: 'エプロン色', titleZh: '裙板色' },
    { id: 'bathtub_grip', step: 1, cat: 'bathtub_grip', kind: 'radio', codes: 'ALL', titleJa: '浴槽グリップ', titleZh: '浴缸扶手' },
    // step 2 浴槽機能
    { id: 'shoulder_yumi', step: 2, cat: 'shoulder_yumi', kind: 'radio', codes: 'ALL', titleJa: '肩包み湯', titleZh: '肩部包裹浴' },
    { id: 'urupoka', step: 2, cat: 'urupoka', kind: 'radio', codes: 'ALL', titleJa: 'うるぽか湯ファイン', titleZh: '润泡汤fine' },
    { id: 'luxury_light', step: 2, cat: 'luxury_light', kind: 'radio', codes: 'ALL', titleJa: 'ラグジュアリーライト', titleZh: '奢华灯带' },
    { id: 'healthy_jet', step: 2, cat: 'healthy_jet', kind: 'radio', codes: 'ALL', titleJa: 'ヘルシージェット', titleZh: '健康喷流' },
    { id: 'bath_tv', step: 2, cat: 'bath_tv', kind: 'radio', codes: 'ALL', titleJa: '浴室テレビ', titleZh: '浴室电视' },
    // step 3 風呂フタ等
    { id: 'bath_lid', step: 3, cat: 'bath_lid', kind: 'radio', codes: 'ALL', titleJa: '風呂フタ', titleZh: '浴缸盖' },
    { id: 'bath_lid_hook', step: 3, cat: 'bath_lid_hook', kind: 'radio', codes: 'ALL', titleJa: '風呂フタフック', titleZh: '浴缸盖挂钩' },
    { id: 'hand_bar', step: 3, cat: 'hand_bar', kind: 'multi', codes: 'ALL', titleJa: 'ハンドバー', titleZh: '扶手' },
    // step 4 床
    { id: 'floor', step: 4, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床（色柄）', titleZh: '地板' },
    { id: 'drain_cover', step: 4, cat: 'drain_cover', kind: 'radio', codes: 'ALL', titleJa: '排水口カバー', titleZh: '排水口盖' },
    // step 5 壁
    { id: 'wall_design', step: 5, cat: 'wall_design', kind: 'radio', codes: 'ALL', titleJa: '壁デザインパターン', titleZh: '壁面设计' },
    { id: 'wall_panel', step: 5, cat: 'wall_panel', kind: 'radio', codes: 'ALL', titleJa: '壁柄', titleZh: '壁面花纹' },
    // step 6 カウンター・水栓
    { id: 'counter', step: 6, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター', titleZh: '台面' },
    { id: 'faucet', step: 6, cat: 'faucet', kind: 'radio', codes: 'ALL', titleJa: '洗い場用水栓', titleZh: '洗浴区水龙头' },
    { id: 'shower_head', step: 6, cat: 'shower_head', kind: 'radio', codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒喷头' },
    { id: 'bathtub_faucet', step: 6, cat: 'bathtub_faucet', kind: 'radio', codes: 'ALL', titleJa: '浴槽用水栓', titleZh: '浴缸侧水龙头' },
    // step 7 ドア
    { id: 'door', step: 7, cat: 'door', kind: 'radio', codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    { id: 'door_option', step: 7, cat: 'door_option', kind: 'multi', codes: 'ALL', titleJa: 'ドアオプション', titleZh: '门配件' },
    // step 8 天井・換気・暖房
    { id: 'ceiling', step: 8, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花' },
    { id: 'ventilation_fan', step: 8, cat: 'ventilation_fan', kind: 'radio', codes: 'ALL', titleJa: '換気扇（天井）', titleZh: '换气扇（天花）' },
    { id: 'wall_fan', step: 8, cat: 'wall_fan', kind: 'radio', codes: 'ALL', titleJa: '壁付換気扇', titleZh: '壁装换气扇' },
    { id: 'bathroom_heater', step: 8, cat: 'bathroom_heater', kind: 'radio', codes: 'ALL', titleJa: '浴室暖房乾燥機', titleZh: '浴室暖风干燥机' },
    // step 9 照明・ミラー
    { id: 'lighting', step: 9, cat: 'lighting', kind: 'radio', codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    { id: 'mirror', step: 9, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    // step 10 収納等
    { id: 'storage_shelf', step: 10, cat: 'storage_shelf', kind: 'multi', codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'towel_hook', step: 10, cat: 'towel_hook', kind: 'multi', codes: 'ALL', titleJa: 'タオル掛け', titleZh: '毛巾杆' },
    { id: 'doko_demo_rack', step: 10, cat: 'doko_demo_rack', kind: 'multi', codes: 'ALL', titleJa: 'どこでもラック', titleZh: '任意贴装置物架' },
    // step 11 その他
    { id: 'window_frame', step: 11, cat: 'window_frame', kind: 'radio', codes: 'ALL', titleJa: '窓枠', titleZh: '窗框' },
    { id: 'room_heater', step: 11, cat: 'room_heater', kind: 'radio', codes: 'ALL', titleJa: 'ルームヒーター', titleZh: '房间加热器' },
    { id: 'circulation_fitting', step: 11, cat: 'circulation_fitting', kind: 'multi', codes: 'ALL', titleJa: '循環金具', titleZh: '循环接头' },
    { id: 'installation_parts', step: 11, cat: 'installation_parts', kind: 'multi', codes: 'ALL', titleJa: '設置用別売部品', titleZh: '安装另售配件' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    mode: 'std',           // std=規格サイズ / pitari=ぴったりサイズ
    size: '1616',          // 規格尺寸 code（默认 1616）
    pitariCol: null,       // ぴったり間口区分 code（C0..C12）
    pitariRow: null,       // ぴったり浴槽行 code（S12..RLB2）
    sel: {},               // { dimId: option code }
    multi: {},             // { dimId: { code: true } }
    rate: null,
    quoteHead: { no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: '' },
    lang: 'both'
  };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }

  /** ぴったりモードでは counter/faucet/door/lighting/mirror を pitari_* 分類に切替 */
  function catIdOf(d) {
    if (state.mode === 'pitari') {
      if (d.id === 'counter') return 'pitari_counter';
      if (d.id === 'faucet') return 'pitari_faucet';
      if (d.id === 'door') return 'pitari_door';
      if (d.id === 'lighting') return 'pitari_lighting';
      if (d.id === 'mirror') return 'pitari_mirror';
    }
    return d.cat;
  }
  /** 洗い場用水栓の候補分類：規格=faucet+faucet_none_counter+overhead_shower+dual_faucet（カウンター連動で絞る）／ぴったり=pitari_faucet */
  function faucetCatIds() {
    if (state.mode === 'pitari') return ['pitari_faucet'];
    return ['faucet', 'faucet_none_counter', 'overhead_shower', 'dual_faucet'];
  }
  function catOpts(d) {
    if (d.id === 'faucet') {
      var ids = faucetCatIds();
      var opts = [];
      ids.forEach(function (id) { var c = cat(id); if (c) opts = opts.concat(c.options); });
      return opts;
    }
    return cat(catIdOf(d)) ? cat(catIdOf(d)).options : [];
  }
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
  function planCode() {
    // 第一页不做套餐选择：套装基准价固定锚定「基本套餐（ベーシック）」各尺寸价
    return 'basic';
  }
  function planName() {
    return 'ベーシック';
  }
  function sizeCode() { return state.size || '1616'; }
  function isPitari() { return state.mode === 'pitari'; }
  function pitariColIdx() {
    if (state.pitariCol == null) return 0;
    var n = parseInt(String(state.pitariCol).replace('C', ''), 10);
    return isFinite(n) ? n : 0;
  }
  function pitariRowIdx() {
    if (state.pitariRow == null) return 0;
    var m = DATA.meta.pitariMatrix;
    if (!m) return 0;
    for (var i = 0; i < m.rows.length; i++) {
      if (m.rows[i].code === state.pitariRow) return i;
    }
    return 0;
  }
  function pitariColName() {
    var m = DATA.meta.pitariMatrix;
    if (!m) return '';
    return m.cols[pitariColIdx()].name_ja;
  }
  function pitariRowName() {
    var m = DATA.meta.pitariMatrix;
    if (!m) return '';
    var r = m.rows[pitariRowIdx()];
    return r ? r.name_ja : '';
  }

  /** 基本套装价：規格=ベーシック構成×サイズ；ぴったり=間口×浴槽行 */
  function basePrice() {
    if (isPitari()) {
      var m = DATA.meta.pitariMatrix;
      if (!m) return 0;
      var r = m.rows[pitariRowIdx()];
      if (!r) return 0;
      var v = r.prices[pitariColIdx()];
      return typeof v === 'number' ? v : 0;
    }
    var pp = DATA.meta.planPrices;
    var v = 0;
    if (pp && pp.basic) v = typeof pp.basic[sizeCode()] === 'number' ? pp.basic[sizeCode()] : 0;
    return v;
  }

  /** 尺寸卡片备用价（防御性：基准套装未定价时取其他方案最低价） */
  function sizeAltPrice(code) {
    var pp = DATA.meta.planPrices;
    if (!pp) return null;
    if (pp.basic && typeof pp.basic[code] === 'number') return { price: pp.basic[code], plan: 'ベーシック' };
    var best = null;
    var keys = Object.keys(pp);
    for (var i = 0; i < keys.length; i++) {
      var fp = keys[i];
      if (fp === 'basic') continue;
      var v = pp[fp] && pp[fp][code];
      if (typeof v === 'number' && (!best || v < best.price)) best = { price: v, plan: fp };
    }
    return best;
  }

  function isVirtualBasic(code) { return false; }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 计价 ---------------- */

  /** カウンター分類選択 → 価格（faucet が total なら 0：faucet 総額に含まれる） */
  function counterContribution() {
    var c = state.sel.counter;
    if (c == null) return 0;               // 未選択：基本セット（人造大理石カウンター）扱い
    var f = selOpt('faucet');
    if (f && f.priceMode === 'total') return 0;   // 水栓総額にカウンター差額含む
    var o = opt('counter', c);
    if (!o) return 0;
    if (o.price != null) return o.price;
    if (o.pricesBySize) {
      var v = P.priceBySize(o, isPitari() ? null : sizeCode());
      if (v != null) return P.toAmount(v);
    }
    if (o.priceDiff != null) return o.priceDiff;
    return 0;
  }

  /** 洗い場用水栓 → 価格（part=水栓単体、total=総額） */
  function faucetContribution() {
    var c = state.sel.faucet;
    if (c == null) return 0;
    var o = opt('faucet', c);
    if (!o) return 0;
    if (o.price != null) return o.price;
    if (o.pricesBySize) {
      var v = P.priceBySize(o, isPitari() ? null : sizeCode());
      if (v != null) return P.toAmount(v);
    }
    if (o.priceDiff != null) return o.priceDiff;
    return 0;
  }

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    // カウンター・水栓は特別処理（連動）
    if (dimId === 'counter') return counterContribution();
    if (dimId === 'faucet') return faucetContribution();
    var o = opt(dimId, code);
    if (!o) return null;
    if (o.priceUnknown) return null;      // 価格未掲載 → unknown
    if (o.price != null) return o.price;
    if (o.pricesBySize) {
      var v = P.priceBySize(o, isPitari() ? null : sizeCode());
      if (v != null) return P.toAmount(v);
    }
    if (o.priceByType) {
      var tv = P.priceByTypeValue(o, planCode());
      if (tv != null) return P.toAmount(tv);
    }
    if (o.priceDiff != null) return o.priceDiff;
    if (o.isBasic === true) return 0;
    return null;
  }

  /** 柄クラス：premium=P、其余 H */
  function wallClsOf(code) {
    var o = opt('wall_panel', code);
    return (o && o.cls === 'premium') ? 'P' : 'H';
  }
  /** 墙面价格：壁デザインパターン × 柄クラス 组合矩阵（壁柄本身无价；2TONE=カウンター面クラス+周辺クラス） */
  function wallContribution() {
    var mode = state.sel.wall_design;
    if (!mode) return null;
    var pc = state.sel.wall_panel;
    if (!pc) return null;
    var wd = opt('wall_design', mode);
    if (!wd || !wd.priceByClass) return null;
    var m = wd.priceByClass;
    var v;
    if (mode === '2TONE') {
      var sc = state.sel.wall_surround;
      if (!sc) return null;
      var key = wallClsOf(pc) + wallClsOf(sc);
      v = m[key];
    } else {
      v = m[wallClsOf(pc)];
    }
    return typeof v === 'number' ? v : null;
  }

  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'radio': {
        var c = state.sel[dimId];
        if (dimId === 'wall_design') return wallContribution();   // 墙价=模式×柄クラス矩阵
        if (c == null) return null;
        if (dimId === 'wall_panel') return 0;   // 柄本身无差价（矩阵已含），防重复与 unknown
        return radioContribution(dimId, c);
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
        out.model = o.partNumber || '';
        // 壁柄：2TONE 时追加周辺柄名
        if (dimId === 'wall_panel' && state.sel.wall_design === '2TONE' && state.sel.wall_surround) {
          var so = opt('wall_panel', state.sel.wall_surround);
          if (so) {
            out.nameZh += '・周辺' + (so.name_zh || state.sel.wall_surround);
            out.nameJa += '・周辺' + (so.name_ja || state.sel.wall_surround);
            out.extra = (out.extra ? out.extra + '；' : '') + '2トーン';
          }
        }
        if (o.priceUnknown) out.extra = '価格未掲載（要問合せ）';
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
    var total = basePrice();
    var lines = [];
    var unknown = [];
    if (isPitari()) {
      lines.push({
        step: 0, stepZh: STEPS[0].titleZh, stepJa: STEPS[0].title,
        nameZh: 'ぴったりサイズ套装 ' + pitariColName() + '間口 × ' + pitariRowName(),
        nameJa: 'ぴったりサイズ セット（' + pitariColName() + ' × ' + pitariRowName() + '）',
        code: 'PITARI-' + (state.pitariCol || 'C0') + '-' + (state.pitariRow || 'S12'),
        model: '受注生産品', extra: 'カウンターあり（人造大理石）基準・取付費別',
        diff: 0, base: true
      });
    } else {
      lines.push({
        step: 0, stepZh: STEPS[0].titleZh, stepJa: STEPS[0].title,
        nameZh: sizeCode() + 'サイズ 基准套装（基本配置）',
        nameJa: sizeCode() + 'サイズ 基準セット（基本構成）',
        code: sizeCode(),
        model: productNo(), extra: '基准套装价（ベーシック構成）・取付設置費別',
        diff: 0, base: true
      });
    }
    DIMS.forEach(function (d) {
      if (d.step === 0) return;            // プラン/間口/浴槽行 は base 行体现
      if (d.id === 'mode') return;
      // ぴったりモード：規格専用 dim（bathtub 形状）スキップ
      if (isPitari() && d.id === 'bathtub') return;
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
    var rmbRate = (DATA.meta.rmbRate != null) ? DATA.meta.rmbRate : 1.2;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * rmbRate) : null;
    return {
      base: null, basePrice: basePrice(),
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: isPitari() ? 'PITARI' : sizeCode(),
      plan: isPitari() ? 'ぴったり' : 'ベーシック構成',
      mode: state.mode
    };
  }

  /** 本体品番（簡略）：規格=PREDENCIA-{サイズ}／ぴったり=PITARI-{間口}×{浴槽行} */
  function productNo() {
    if (isPitari()) return 'PREDENCIA-PITARI-' + (state.pitariCol || 'C0') + 'x' + (state.pitariRow || 'S12');
    return 'PREDENCIA-' + sizeCode();
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
  function sizeIs(codes) {
    var list = Array.isArray(codes) ? codes : [codes];
    return list.indexOf(sizeCode()) >= 0;
  }
  function pitariRowIs(codes) {
    if (!isPitari()) return false;
    return codes.indexOf(state.pitariRow) >= 0;
  }
  /** ぴったり浴槽行 → 対応する規格形状（制約判定用） */
  function pitariRowShape() {
    var row = state.pitariRow;
    if (row === 'S12' || row === 'R12' || row === 'R13' || row === 'R14' || row === 'ROUND' || row === 'R16') return 'round';
    if (row === 'RL') return 'relax_lounge';
    if (row === 'RLB' || row === 'RLB2') return 'relax_lounge_bench';
    return null;
  }
  /** ぴったり浴槽行の奥行最大値（機能制約判定：肩包み湯/ヘルシージェット=1668〜1868） */
  function pitariRowDepth() {
    var m = DATA.meta.pitariMatrix;
    if (!m) return 0;
    var r = m.rows[pitariRowIdx()];
    if (!r) return 0;
    var mm = r.name_ja.match(/奥行([\d/]+)/);
    if (!mm) return 0;
    var vals = mm[1].split('/').map(Number);
    return Math.max.apply(null, vals);
  }

  /** 判断某维度某选项是否禁用；返回 reason 字符串或 null。 */
  function disabledReason(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var isVB = isVirtualBasic(code);
    var o = opt(dimId, code);
    if (!o && !isVB) return null;

    // ---- データ schema 限定 ----
    if (!isVB && o) {
      if (Array.isArray(o.sizes)) {
        var okS = false;
        for (var i = 0; i < o.sizes.length; i++) {
          if (P.sizeKeyMatches(o.sizes[i], sizeCode())) { okS = true; break; }
        }
        if (!okS) return '该选项不适用于 ' + sizeCode() + ' 尺寸';
      }
      if (o.priceUnknown) return '価格未掲載（要問合せ）';
    }

    // ---- 規格プラン×サイズ ----
    if (dimId === 'plan' && !isPitari()) {
      var pp = DATA.meta.planPrices;
      if (pp && pp[code] && pp[code][sizeCode()] == null) return '该方案无 ' + sizeCode() + ' 尺寸定价';
    }

    // ---- ぴったりモード：plan 不可（ぴったりはプラン概念なし） ----
    if (dimId === 'plan' && isPitari()) return 'ぴったりサイズはプラン選択不可（受注生産セット）';

    // ---- 浴槽形状×サイズ（規格） ----
    if (dimId === 'bathtub' && !isPitari()) {
      var sz = sizeCode();
      if ((code === 'relax_lounge_bench' || code === 'relax_lounge' || code === 'wide_bench') && (sz !== '1616' && sz !== '1620')) {
        return 'くつろぎラウンジ/ワイド浴槽は1616/1620サイズのみ';
      }
      if (code === 'round' && (sz === '1616' || sz === '1620')) {
        return 'ラウンド浴槽はS1216/1216/1317/1418サイズのみ';
      }
    }
    // ぴったりモード：浴槽形状は浴槽行で決定（bathtub dim は非表示）
    if (dimId === 'bathtub' && isPitari()) return 'ぴったりサイズは浴槽行で決定';

    // ---- 肩包み湯：くつろぎラウンジ（ベンチ付）のみ・1616/1620のみ・ヘルシージェット併用不可 ----
    if (dimId === 'shoulder_yumi' && code === 'shoulder_yumi') {
      if (isPitari()) {
        if (!pitariRowIs(['RLB', 'RLB2'])) return '肩包み湯はくつろぎラウンジ浴槽（ベンチ付）のみ';
      } else {
        if (sizeCode() !== '1616' && sizeCode() !== '1620') return '肩包み湯は戸建て仕様（1616/1620）のみ';
        if (state.sel.bathtub !== 'relax_lounge_bench') return '肩包み湯はくつろぎラウンジ浴槽（ベンチ付）のみ';
      }
      if (selIs('healthy_jet', 'HJPN_100N2')) return '肩包み湯とヘルシージェットは併用不可';
    }
    if (dimId === 'healthy_jet' && code === 'HJPN_100N2') {
      if (isPitari()) {
        var dp = pitariRowDepth();
        if (dp < 1668) return 'ヘルシージェットは奥行1668〜1868の浴槽行のみ';
      } else {
        if (sizeCode() !== '1616' && sizeCode() !== '1620') return 'ヘルシージェットは戸建て仕様（1616/1620）のみ';
      }
      if (selIs('shoulder_yumi', 'shoulder_yumi')) return '肩包み湯とヘルシージェットは併用不可';
    }

    // ---- うるぽか湯：くつろぎラウンジ系のみ・ワイド不可 ----
    if (dimId === 'urupoka') {
      if (isPitari()) {
        if (!pitariRowIs(['RL', 'RLB', 'RLB2'])) return 'うるぽか湯ファインはくつろぎラウンジ系浴槽行のみ';
      } else {
        if (sizeCode() !== '1616' && sizeCode() !== '1620') return 'うるぽか湯ファインは戸建て仕様（1616/1620）のみ';
        if (state.sel.bathtub === 'wide_bench') return 'うるぽか湯ファインはワイド浴槽では選択不可';
      }
    }

    // ---- ラグジュアリーライト：調光調色照明併設必須 ----
    if (dimId === 'luxury_light' && code === 'luxury_light') {
      var lt = state.sel.lighting;
      if (lt == null) return 'ラグジュアリーライトは調光調色照明（ストレート/ダウンライト）併設必須';
      if (!/dimmable|luxury/.test(String(lt))) return 'ラグジュアリーライトは調光調色照明（ストレート/ダウンライト）併設必須';
    }
    if (dimId === 'lighting' && /^straight_plain|^downlight_plain|^square_ceiling|^soft_square|^cubic_clear/.test(code)) {
      if (selIs('luxury_light', 'luxury_light')) return 'ラグジュアリーライト選択中は調光調色照明が必要';
    }

    // ---- カウンター×水栓連動 ----
    var counterSel = state.sel.counter;
    if (dimId === 'faucet') {
      var cf = o ? o.counterFor : null;
      if (isPitari()) {
        if (counterSel == null) {
          if (cf !== 'ART') return 'ぴったり基本は人造大理石カウンター：まずカウンターを選択';
        } else if (counterSel === 'QS_dual_p') {
          if (cf !== 'QS_dual') return 'デュアルカウンター用はSB280L/RABHKのみ';
        } else if (counterSel === 'QS_p') {
          if (cf !== 'QS') return 'クォーツカウンター用の水栓を選択';
        } else if (counterSel === 'ART_p' || counterSel === 'cover_p') {
          if (cf !== 'ART') return '人造大理石カウンター用の水栓を選択';
        } else if (counterSel === 'none') {
          if (cf !== 'none') return 'カウンターなし時はカウンターなし仕様の水栓を選択';
        }
      } else {
        if (counterSel === 'QS_dual') {
          if (cf !== 'QS_dual') return 'デュアルカウンター用はSB280L/RABHKのみ';
        } else if (counterSel === 'QS' || counterSel === 'ART') {
          if (cf !== 'QS_ART') return 'クォーツ/人造大理石カウンター用の水栓を選択';
        } else if (counterSel === 'none') {
          if (cf !== 'none') return 'カウンターなし時はカウンターなし仕様の水栓を選択';
        }
      }
    }
    // オーバーヘッドシャワー：カウンターなしのみ・ミラーなし/スリムロングのみ・照明制約
    if (dimId === 'faucet' && /^SBHS18C|^overhead/.test(String(code))) {
      if (isPitari()) {
        if (counterSel !== 'none' && counterSel != null) return 'オーバーヘッドシャワーはカウンターなしのみ';
      } else if (counterSel !== 'none') {
        return 'オーバーヘッドシャワーはカウンターなしのみ';
      }
      var mir = state.sel.mirror;
      if (mir && mir !== 'no_mirror' && mir !== 'slim_long' && mir !== 'no_mirror_p' && mir !== 'slim_long_p') {
        return 'オーバーヘッドシャワーはミラーなし/スリムロングミラーのみ';
      }
      var lig = state.sel.lighting;
      if (lig && /^soft_square|^cubic_clear/.test(String(lig))) return 'オーバーヘッドシャワーはソフトスクエア/キュービック照明不可';
    }
    // 兼用水栓 × 浴槽側水栓 同時選択不可
    if (dimId === 'bathtub_faucet' && /^KF3000TTKS|^dual|^TBV03415SC_1EN2/.test(String(state.sel.faucet || ''))) {
      return '兼用水栓と浴槽用水栓は同時選択不可';
    }
    if (dimId === 'faucet' && (/^KF3000TTKS/.test(String(code)) || /^dual_/.test(String(code)) || /^dual_p/.test(String(code))) && selected('bathtub_faucet')) {
      return '兼用水栓と浴槽用水栓は同時選択不可';
    }

    // ---- 浴槽用水栓：ワイド浴槽（ベンチ付）では TO-TBV034ZTKN 不可；ラウンドサイズのみ KM83GCUTK ----
    if (dimId === 'bathtub_faucet') {
      if (code === 'KM83GCUTK' && (sizeCode() === '1616' || sizeCode() === '1620')) return 'KM83GCUTKはラウンド浴槽サイズ（S1216〜1418）のみ';
      if (code === 'TO_TBV034ZTKN' && state.sel.bathtub === 'wide_bench') return 'ワイド浴槽（ベンチ付）では選択不可';
      if (code === 'KM159GCR24' && state.sel.bathtub === 'relax_lounge_bench' && /^luxury|^wide_clear/.test(String(state.sel.mirror || ''))) {
        return 'ベンチ付浴槽×ラグジュアリー/ワイドクリアミラー時は選択不可';
      }
    }

    // ---- ドアオプション：開き戸/引戸専用 ----
    var doorSel = state.sel.door || '';
    if (dimId === 'door_option') {
      if ((code === 'towel_hook_out' || code === 'towel_hook_out_W' || code === 'towel_hook_out_p' || code === 'towel_hook_out_W_p') && !/^hinged/.test(String(doorSel))) {
        return 'ドア外タオル掛けは開き戸のみ';
      }
      if ((code === 'pinch_stopper' || code === 'pinch_stopper_p') && !/^sliding|^double|^triple/.test(String(doorSel))) {
        return '指はさみ防止ストッパーは引戸のみ';
      }
    }

    // ---- 壁柄：2TONE カウンター面柄（wall_panel）P/H 均可；周辺柄禁用由 wizard 渲染判断（wallClsOf） ----

    // ---- 照明×サイズ（規格） ----
    if (dimId === 'lighting' && !isPitari() && o && Array.isArray(o.sizes)) {
      var okL = false;
      for (var j = 0; j < o.sizes.length; j++) {
        if (P.sizeKeyMatches(o.sizes[j], sizeCode())) { okL = true; break; }
      }
      if (!okL) return '该照明不适用于 ' + sizeCode() + ' 尺寸';
    }

    // ---- ミラー×サイズ（規格） ----
    if (dimId === 'mirror' && !isPitari() && o && Array.isArray(o.sizes)) {
      var okM = false;
      for (var k = 0; k < o.sizes.length; k++) {
        if (P.sizeKeyMatches(o.sizes[k], sizeCode())) { okM = true; break; }
      }
      if (!okM) return '该镜子不适用于 ' + sizeCode() + ' 尺寸';
    }

    // ---- 壁付換気扇：マンション仕様のみ（規格 1620=戸建不可） ----
    if (dimId === 'wall_fan' && !isPitari() && sizeCode() === '1620') return '壁付換気扇はマンション仕様のみ（1620不可）';

    // ---- ぴったり：開き戸 奥行1443以下不可 ----
    if (dimId === 'door' && isPitari() && /^hinged/.test(String(code))) {
      if (pitariRowDepth() < 1443) return '開き戸は奥行1443mm以上の浴槽行のみ';
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    // 壁デザインパターン切替：非 2TONE 时清周辺柄
    if (dimId === 'wall_design' && code !== '2TONE') delete state.sel.wall_surround;
    // モード切替：サイズ系を初期化
    if (dimId === 'mode') {
      delete state.sel.plan;
      delete state.sel.bathtub;
      state.pitariCol = null;
      state.pitariRow = null;
    }
    // 浴槽形状変更：機能をリセット（肩包み湯等の適合リセット）
    if (dimId === 'bathtub') {
      delete state.sel.shoulder_yumi;
      delete state.sel.urupoka;
      delete state.sel.healthy_jet;
    }
    // カウンター変更：水栓をリセット（連動選択のため）
    if (dimId === 'counter') delete state.sel.faucet;
    // 肩包み湯×ヘルシージェット併用不可の相互解除
    if (dimId === 'shoulder_yumi' && code === 'shoulder_yumi') delete state.sel.healthy_jet;
    if (dimId === 'healthy_jet' && code === 'HJPN_100N2') delete state.sel.shoulder_yumi;
    // ぴったり浴槽行変更：機能をリセット
    if (dimId === 'pitari_row') {
      delete state.sel.shoulder_yumi;
      delete state.sel.urupoka;
      delete state.sel.healthy_jet;
      delete state.sel.bathtub_faucet;
    }
  }

  /** 尺寸切换（規格） */
  function setSize(code) {
    state.size = code;
    var pp = DATA.meta.planPrices;
    if (pp && pp[planCode()] && pp[planCode()][code] == null) {
      var order = DATA.meta.plans || [];
      for (var i = 0; i < order.length; i++) {
        if (pp[order[i]] && pp[order[i]][code] != null) { state.sel.plan = order[i]; break; }
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
      ['サイズ', r.size], ['基準構成', r.plan],
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
  window.PREDENCIA = window.PREDENCIA || {};
  window.PREDENCIA.quote = {
    init: function (data) { DATA = data; P = window.PREDENCIA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts, catIdOf: catIdOf,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    planCode: planCode, planName: planName, sizeCode: sizeCode, basePrice: basePrice,
    sizeAltPrice: sizeAltPrice, isPitari: isPitari,
    pitariColIdx: pitariColIdx, pitariRowIdx: pitariRowIdx,
    pitariColName: pitariColName, pitariRowName: pitariRowName,
    pitariRowDepth: pitariRowDepth,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    wallClsOf: wallClsOf, wallContribution: wallContribution,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.multi = {};
      state.size = '1616'; state.mode = 'std';
      state.pitariCol = null; state.pitariRow = null;
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
