/**
 * quote.js — TOTO Sazana（サザナ）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.SAZANA.quote。
 * 依赖：window.SAZANA_DATA（products.js，由 sazana-data.json 生成）、window.SAZANA.price
 *
 * 计价模型（全部手册价为税抜き）：
 *   本体価格（税抜）= 本体価格矩阵（meta.typeBasePrices[タイプ][サイズ]） + Σ选项差价
 *   税込 = 本体 × 1.10（消費税10%）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.7）—— 系数仅在计算代码中，页面不显示算式
 *   セットプラン価格 = 本体価格 + オプション合計価格
 *
 * 维度 kind：radio（单选，可带 none/basic）/ multi（多选）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（15 步：0-14） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ', titleZh: '尺寸与型号', note: '选择尺寸（10 種）与型号（P/T/S/N/F），決定本体価格（タイプ×サイズ矩阵）。F タイプ仅 1620/1616/1618、N タイプ无 1220。' },
    { n: 1, title: '架台・配管・ドア位置', titleZh: '架台·配管·门位置', note: '架台（F/S/R/H＋吊架台/断熱防水パン）、給水給湯配管、ドア位置（A/B/C/D＋移動）。' },
    { n: 2, title: '壁柄', titleZh: '壁面花纹', note: '4面同色（P/T）／アクセントプラン（S/N/F）＋グレード（プレミアム/HⅡ/HⅠ/ベーシック）。' },
    { n: 3, title: '浴槽', titleZh: '浴缸', note: '浴槽形状（ゆるリラ/ラウンド/クレイドル等）×材質×色、インテリア・バー、ハンドグリップ、ふろふた。' },
    { n: 4, title: '床・天井', titleZh: '地板·天花板', note: 'ほっカラリ床（ラグ/タイル/単色）・カラリ床（N 基本）、平天井/勾配天井×壁高。' },
    { n: 5, title: 'カウンター', titleZh: '台面', note: '人工大理石（P 基本）／単色（T/S/N）／なし／スマート／ベンチ（F）。' },
    { n: 6, title: '便利アイテム', titleZh: '便利功能件', note: '床ワイパー洗浄、浴室クリアキープ、おそうじ浴槽、自動排水栓、まるごときれい、つながる快適セット。' },
    { n: 7, title: '照明', titleZh: '照明', note: 'シーリング/半球形/キューブ/丸形/ダウンライト/フラット形＋調光システム。' },
    { n: 8, title: '換気・暖房', titleZh: '换气·暖房', note: '換気扇/三乾王/温水式/ミスト＋ランドリーパイプ＋洗面所暖房機・あたたか快適セット。' },
    { n: 9, title: '水栓・シャワー', titleZh: '水龙头·花洒', note: '洗い場水栓（タイプ別基本/寒冷地）、オーバーヘッド、シャワーヘッド、バス水栓、スライドバー、タオル掛け。' },
    { n: 10, title: '鏡', titleZh: '镜子', note: 'フレーム付縦長（P/T）/縦長（S/N）/ワイド/楕円/四角/なし＋くもり止め。' },
    { n: 11, title: '収納棚', titleZh: '收纳架', note: 'セパレート収納棚（W270/W260/W185/W175）、ワイヤー、収納バー、フリーポケット、なし。' },
    { n: 12, title: 'ドア', titleZh: '门', note: '折戸（基本）/開き戸/引戸/FIX窓×カラー×高さ＋ドア外タオル掛け。' },
    { n: 13, title: '窓・追いだき', titleZh: '窗·追焚', note: '引き違い窓/フリーサイズ窓枠＋追いだき加工（循環アダプター）。' },
    { n: 14, title: '快適オプション', titleZh: '舒适选项', note: 'マルチリモコン/ノコリ〜ユECO/断熱材パック/浴室テレビ/浴室オーディオ/窓/福祉機器/単品。' }
  ];

  /* ---------------- 维度配置 ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['P', 'T', 'S', 'N', 'F'], titleJa: 'タイプ', titleZh: '型号' },
    // step 1
    { id: 'kudai', step: 1, cat: 'kudai', kind: 'radio', codes: 'ALL', titleJa: '架台・構造', titleZh: '架台·结构' },
    { id: 'water_pipe', step: 1, cat: 'water_pipe', kind: 'radio', codes: 'ALL', titleJa: '給水給湯配管', titleZh: '给水给汤配管' },
    { id: 'door_position', step: 1, cat: 'door_position', kind: 'radio', codes: 'ALL', titleJa: 'ドア位置', titleZh: '门位置' },
    // step 2
    { id: 'wall', step: 2, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁柄', titleZh: '壁面花纹' },
    // step 3
    { id: 'bathtub', step: 3, cat: 'bathtub', kind: 'radio', codes: 'ALL', titleJa: '浴槽', titleZh: '浴缸' },
    { id: 'bt_extra', step: 3, cat: 'bathtub_extra', kind: 'radio', codes: ['KNA00', 'KNR6R', 'KNR6N', 'KNR6T', 'KNR6G', 'KNR8N', 'KNR8T', 'KNR8G'], titleJa: 'インテリア・バー（浴槽横）', titleZh: '内饰扶手杆（浴缸侧）' },
    { id: 'bt_grip', step: 3, cat: 'bathtub_extra', kind: 'radio', none: true, codes: ['YHH11', 'YHH12', 'YHH23', 'YHH24', 'YHA11', 'YHA01', 'YHH33', 'YHH34'], titleJa: 'ハンドグリップ', titleZh: '浴缸内扶手' },
    { id: 'furofuta', step: 3, cat: 'furofuta', kind: 'radio', codes: 'ALL', titleJa: 'ふろふた', titleZh: '浴缸盖' },
    // step 4
    { id: 'floor', step: 4, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床', titleZh: '地板' },
    { id: 'ceiling', step: 4, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    // step 5
    { id: 'counter', step: 5, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター', titleZh: '台面' },
    // step 6
    { id: 'wiper', step: 6, cat: 'clean_items', kind: 'radio', none: true, codes: ['CQF01', 'CQF1K'], titleJa: '床ワイパー洗浄', titleZh: '地板刮水清洗' },
    { id: 'clear', step: 6, cat: 'clean_items', kind: 'radio', none: true, codes: ['CQH01', 'CQH1K'], titleJa: '浴室クリアキープ', titleZh: '浴室清洁保持' },
    { id: 'clean_other', step: 6, cat: 'clean_items', kind: 'multi', codes: ['YFS32', 'YFE49', 'JLH11', 'FSS01', 'FSS02'], titleJa: 'その他アイテム', titleZh: '其他便利件' },
    // step 7
    { id: 'lighting', step: 7, cat: 'lighting', kind: 'radio',
      basic: { code: 'LIGHT_BASIC', nameJa: 'シーリング照明（基本）', nameZh: '吸顶灯（基本）' },
      codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    // step 8
    { id: 'fan', step: 8, cat: 'fan', kind: 'radio',
      basic: { code: 'FAN_BASIC', nameJa: '換気扇（基本仕様）', nameZh: '换气扇（基本）' },
      codes: ['IKJG8', 'IKJG9', 'IKJN8', 'IKJN9', 'IKJGA', 'IKJGB', 'IKJGC', 'IKJGD', 'IKJNA', 'IKJNB', 'IKJNC', 'IKJND', 'IKK1M', 'IKK2C', 'IKA00', 'IKH4W', 'IKA41'], titleJa: '換気扇・三乾王', titleZh: '换气扇·三乾王' },
    { id: 'laundry', step: 8, cat: 'fan', kind: 'multi', codes: ['KMA11', 'KMB11', 'KMA15', 'KMB15', 'KMB1A', 'KMB2A'], titleJa: 'ランドリーパイプ', titleZh: '晾衣杆' },
    { id: 'wh_heater', step: 8, cat: 'washroom_heater', kind: 'radio', none: true, codes: 'ALL', titleJa: '洗面所暖房機', titleZh: '洗面室暖风机' },
    // step 9
    { id: 'faucet', step: 9, cat: 'faucet', kind: 'radio',
      basic: { code: 'FAUCET_BASIC', nameJa: '基本水栓（タイプ別）', nameZh: '基本水龙头（按型号）' },
      codes: ['BASE', 'SEA5K', 'SEL5K', 'SEL6K', 'SEL7K', 'SEJ2K', 'SEH8S', 'SEH8K', 'SEE1S', 'SEE1K', 'SEH6S', 'SSHHS', 'SSHHK'], titleJa: '洗い場水栓', titleZh: '洗手区水龙头' },
    { id: 'oh_shower', step: 9, cat: 'faucet', kind: 'radio', none: true, codes: ['SHA2S', 'SHA2K'], titleJa: 'エアインオーバーヘッドシャワー', titleZh: 'Air-in 顶喷花洒' },
    { id: 'faucet_misc', step: 9, cat: 'faucet', kind: 'multi', codes: ['SJA01'], titleJa: 'シャワーホース位置変更', titleZh: '花洒软管位置变更' },
    { id: 'shower_head', step: 9, cat: 'shower_head', kind: 'radio',
      basic: { code: 'SHOWER_BASIC', nameJa: 'シャワーヘッド（基本）', nameZh: '花洒头（基本）' },
      codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'bath_faucet', step: 9, cat: 'bath_faucet', kind: 'radio',
      basic: { code: 'BATH_NONE', nameJa: 'バス水栓なし', nameZh: '无浴缸水龙头' },
      codes: ['SFHES', 'SFHEK', 'SFH8S', 'SFH8K', 'SFH4S'], titleJa: 'バス水栓', titleZh: '浴缸水龙头' },
    { id: 'slide_bar', step: 9, cat: 'slide_bar', kind: 'radio', codes: 'ALL', titleJa: 'スライドバー', titleZh: '滑杆' },
    { id: 'towel', step: 9, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛け', titleZh: '毛巾杆' },
    // step 10
    { id: 'mirror', step: 10, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: '鏡', titleZh: '镜子' },
    // step 11
    { id: 'storage', step: 11, cat: 'storage', kind: 'radio', none: true, codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    // step 12
    { id: 'door', step: 12, cat: 'door', kind: 'radio',
      basic: { code: 'DOOR_BASIC', nameJa: '折戸 W800（基本仕様）', nameZh: '折叠门 W800（基本）' },
      codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    // step 13
    { id: 'window', step: 13, cat: 'window', kind: 'multi', codes: 'ALL', titleJa: '窓・窓枠', titleZh: '窗·窗框' },
    { id: 'oidaki', step: 13, cat: 'oidaki', kind: 'radio', none: true, codes: 'ALL', titleJa: '追いだき加工', titleZh: '追焚加工' },
    // step 14
    { id: 'misc_options', step: 14, cat: 'misc_options', kind: 'multi', codes: 'ALL', titleJa: '快適オプション・単品', titleZh: '舒适选项·单品' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1620',            // 尺寸 code（默认 1620）
    doorPos: 'A',            // ドア位置（默认 A）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    sub: {},                 // { wall_pattern, wall_surround, wall_surround_pattern }  壁柄花纹选择
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
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'T');
  }
  function sizeCode() { return state.size || '1620'; }
  function doorPosCode() {
    var c = state.sel.door_position;
    if (!c) return 'A';
    return (c === 'A' || c === 'B' || c === 'C' || c === 'D') ? c : 'A';
  }
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /* ---------------- 壁柄花纹级（sazanaWallPatterns） ---------------- */
  /** ACC_* → アクセントグレード键（accentPriceMatrix 键） */
  var WALL_ACC_GRADE = {
    'ACC_PRE': 'プレミアムグレード', 'ACC_H2': 'ハイグレードⅡ', 'ACC_H1': 'ハイグレードⅠ', 'ACC_BASIC': 'ベーシックグレード'
  };
  /** SHUHEN_* → 周辺グレード键 */
  var WALL_SHUHEN_GRADE = {
    'SHUHEN_H2': '周辺ハイグレードⅡ', 'SHUHEN_H1': '周辺ハイグレードⅠ', 'SHUHEN_BASIC': '周辺ベーシックグレード'
  };
  function sazanaWallPatterns() { return (DATA.sazanaWallPatterns && DATA.sazanaWallPatterns.accentPatterns) || []; }
  function sazanaSurroundPatterns() { return (DATA.sazanaWallPatterns && DATA.sazanaWallPatterns.surroundPatterns) || []; }
  function sazanaAccentPattern(code) {
    return sazanaWallPatterns().find(function (p) { return String(p.code_front) === String(code) || String(p.code_side) === String(code); }) || null;
  }
  function sazanaSurroundPattern(code) {
    return sazanaSurroundPatterns().find(function (p) { return String(p.code) === String(code); }) || null;
  }
  /** 4面同色クラス（HⅡ/HⅠ/BASIC）的柄：从 wall 选项 note 解析「柄名/品番」 */
  function fourSamePatterns(wallCode) {
    var o = opt('wall', wallCode);
    if (!o || !o.note) return [];
    var re = /([^/、]+)\/([A-Za-z0-9]+)/g;
    var out = [], m;
    var cls = String(o.name_ja || '').split('柄')[0].trim();
    while ((m = re.exec(o.note)) !== null) {
      out.push({ code: m[2], name_ja: m[1], name_zh: m[1], class: cls });
    }
    return out;
  }
  /** wall 选项的グレード（4面同色柄=プレミアムグレード；HⅡ/HⅠ/BASIC=クラス名） */
  function wallGradeOf(wallCode) {
    if (WALL_ACC_GRADE[wallCode]) return WALL_ACC_GRADE[wallCode];
    if (WALL_SHUHEN_GRADE[wallCode]) return null;
    if (wallCode === 'EGAA1' || wallCode === 'EGAC3' || wallCode === 'EGAH6' || wallCode === 'EGAW4') return 'プレミアムグレード';
    var o = opt('wall', wallCode);
    return o ? String(o.name_ja || '').split('柄')[0].trim() : null;
  }
  /** アクセントプラン组合价：ACC_* × 周辺グレード（priceBySurround；T タイプ用 accentPriceMatrix L2 调整） */
  function wallContribution() {
    var wallCode = state.sel.wall;
    if (!wallCode) return null;
    var o = opt('wall', wallCode);
    if (!o) return null;
    if (o.priceBySurround) {
      var sg = state.sub.wall_surround;
      if (!sg) return null;   // 未选周辺グレード → 待选择
      var v = o.priceBySurround[sg];
      if (v == null) return null;
      if (typeCode() === 'T') {
        var gradeKey = WALL_ACC_GRADE[wallCode];
        var matrix = (DATA.sazanaWallPatterns && DATA.sazanaWallPatterns.accentPriceMatrix) || {};
        if (gradeKey && matrix[gradeKey] && matrix[gradeKey][sg] && typeof matrix[gradeKey][sg].L2 === 'number') {
          v = matrix[gradeKey][sg].L2;
        }
      }
      return P.toAmount(v);
    }
    return P.priceFor(o, typeCode(), sizeCode());
  }

  /** 本体価格（meta.typeBasePrices[タイプ][サイズ]） */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    if (!tbp) return 0;
    var bySize = tbp[typeCode()];
    if (!bySize) return 0;
    var v = bySize[sizeCode()];
    return typeof v === 'number' ? v : 0;
  }

  /** 尺寸卡片备用价：当前タイプ无价时，返回该尺寸最低可用タイプ价（含タイプ提示） */
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
    return code === 'FAUCET_BASIC' || code === 'BATH_NONE' || code === 'SHOWER_BASIC' ||
      code === 'LIGHT_BASIC' || code === 'FAN_BASIC' || code === 'DOOR_BASIC';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    var o = opt(dimId, code);
    if (!o) return null;
    return P.priceFor(o, typeCode(), sizeCode());
  }

  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'radio': {
        var c = state.sel[dimId];
        if (c == null) return null;
        if (dimId === 'wall') return wallContribution();
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
        out.model = o.selectMark || '';
        // 壁柄：花纹名 + 品番
        if (dimId === 'wall') {
          var pc = state.sub.wall_pattern;
          var sg = state.sub.wall_surround;
          var sp = state.sub.wall_surround_pattern;
          if (o.priceBySurround && sg) {
            // ACC_*：アクセント柄 + 周辺グレード/柄
            if (pc) {
              var ap = sazanaAccentPattern(pc);
              if (ap) {
                out.nameZh += '・' + (ap.name_zh || pc);
                out.nameJa += '・' + (ap.name_ja || pc);
                out.model = ap.code_front || pc;
                out.extra = 'アクセントパネル';
              }
            }
            if (sp) {
              var sp2 = sazanaSurroundPattern(sp);
              if (sp2) {
                out.extra = (out.extra ? out.extra + ' / ' : '') + '周辺パネル ' + (sp2.name_ja || sp);
                out.model = out.model ? out.model + '+' + sp : sp;
              }
            }
            if (!out.extra) out.extra = '周辺グレード ' + sg;
          } else if (pc) {
            // HⅡ/HⅠ/BASIC クラスの柄 / SHUHEN の周辺柄
            var fs = fourSamePatterns(c).find(function (x) { return String(x.code) === String(pc); });
            if (fs) {
              out.nameJa += '・' + fs.name_ja;
              out.nameZh += '・' + fs.name_zh;
              out.model = fs.code;
            } else {
              var sp3 = sazanaSurroundPattern(pc);
              if (sp3) {
                out.nameJa += '・' + sp3.name_ja;
                out.nameZh += '・' + sp3.name_zh;
                out.model = sp3.code;
              } else {
                var ap2 = sazanaAccentPattern(pc);
                if (ap2) { out.nameJa += '・' + ap2.name_ja; out.nameZh += '・' + ap2.name_zh; out.model = ap2.code_front || pc; }
              }
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
      nameZh: '本体セット ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + typeCode() + 'タイプ',
      nameJa: base ? base.name_ja + ' ' + typeCode() + 'タイプ' : sizeCode(),
      code: sizeCode() + typeCode(),
      model: productNo(), extra: '組立費別（不含组装费）',
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

  /** 本体品番：HTV + サイズ + U + タイプ + X6 + ドア位置 + 架台（例 HTV1616UPX6DR） */
  function productNo() {
    var k = 'F';
    var kudai = selOpt('kudai');
    if (kudai && ['F', 'S', 'R', 'H'].indexOf(kudai.code) >= 0) k = kudai.code;
    return 'HTV' + sizeCode() + 'U' + typeCode() + 'X6' + doorPosCode() + k;
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
   * 规则：数据 schema 限定 + 研究文档 §5 关键互斥/必须搭配硬编码。
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
        var tv = P.priceByTypeValue(o, type);
        if (tv == null) return '该タイプ不可选';
      }
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价';
    }

    // ---- おそうじ浴槽（YFS32）→ CXX01 断熱防水パン必須 / 寒冷地不可 ----
    var osoji = multiHas('clean_other', ['YFS32', 'JLH11']);
    if (osoji && dimId === 'kudai' && code === 'CXA01') return 'おそうじ浴槽需専用断熱防水パン CXX01';
    if (osoji && dimId === 'kudai' && (code === 'F' || code === 'S' || code === 'R' || code === 'H') && !selIs('kudai', 'CXX01')) {
      return 'おそうじ浴槽选择时断熱防水パン CXX01 须同时选择';
    }

    // ---- 浴室クリアキープ（CQH01）→ 三乾王/暖房換気扇 必須 ----
    var clear = selIs('clear', ['CQH01', 'CQH1K']);
    if (clear && dimId === 'fan' && code !== 'FAN_BASIC' && /^IKJG|^IKJN/.test(code) === false) {
      return '浴室クリアキープ需三乾王/暖房換気扇';
    }

    // ---- 勾配天井（ISJ64/ISJ62）→ ダウンライト不可 ----
    var gable = selIs('ceiling', ['ISJ64', 'ISJ62']);
    if (gable && dimId === 'lighting' && (code.indexOf('KSD') === 0 || code === 'KSCEA' || code === 'KSCMA' || code === 'KSTM3')) {
      return '勾配天井时ダウンライト不可';
    }

    // ---- FSS02 × 3枚引戸 ----
    if (multiHas('clean_other', 'FSS02') && dimId === 'door' && /^HDJW|^HDJX|^HDJY|^HDJM/.test(code)) {
      return 'FSS02 与3枚引戸互斥';
    }

    // ---- カラリ床（CFF 系）→ 床ワイパー/クリアキープ 互斥 ----
    var karari = String(state.sel.floor || '').indexOf('CFF') === 0;
    if (karari && (dimId === 'wiper' || dimId === 'clear')) return 'カラリ床时床ワイパー/クリアキープ不可';

    // ---- おそうじ浴槽 × 寒冷地水栓（SE*K 等） ----
    if (osoji && dimId === 'faucet' && /K$/.test(code) && code !== 'FAUCET_BASIC' && code !== 'BASE') {
      return 'おそうじ浴槽与寒冷地水栓互斥';
    }

    // ---- エアインオーバーヘッドシャワー 尺寸限定（1317/1216/1116/1220/1818 不可） ----
    if (dimId === 'oh_shower' && /^1317|^1216|^1116|^1220|^1818/.test(size)) {
      return 'オーバーヘッドシャワー不适用于 ' + size;
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    // おそうじ浴槽 → 断熱防水パン CXX01 自动
    if (dimId === 'clean_other' && (code === 'YFS32' || code === 'JLH11')) {
      if (!selIs('kudai', 'CXX01')) state.sel.kudai = 'CXX01';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（F 仅 1620/1616/1618、N 无 1220） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var fallback = ['T', 'P', 'S', 'N', 'F'];
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
  window.SAZANA = window.SAZANA || {};
  window.SAZANA.quote = {
    init: function (data) { DATA = data; P = window.SAZANA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    sazanaWallPatterns: sazanaWallPatterns, sazanaSurroundPatterns: sazanaSurroundPatterns,
    sazanaAccentPattern: sazanaAccentPattern, sazanaSurroundPattern: sazanaSurroundPattern,
    fourSamePatterns: fourSamePatterns, wallGradeOf: wallGradeOf,
    WALL_ACC_GRADE: WALL_ACC_GRADE, WALL_SHUHEN_GRADE: WALL_SHUHEN_GRADE,
    typeCode: typeCode, sizeCode: sizeCode, typeGroup: typeGroup, basePrice: basePrice,
    doorPosCode: doorPosCode,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize, sizeAltPrice: sizeAltPrice,
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
