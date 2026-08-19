/**
 * quote.js — TOTO Synla（シンラ）浴室报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.SYNLA.quote。
 * 依赖：window.SYNLA_DATA（products.js，由 synla-data.json 生成）、window.SYNLA.price
 *
 * 计价模型（全部手册价为税抜き）：
 *   本体価格（税抜）= 基本セット価格（meta.typeBasePrices[タイプ][サイズ]） + Σ选项差价
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × 0.7（7 折）
 *
 * 维度 kind：
 *   radio — 单选（state.sel[dimId] = option code）；可带 none:true（「なし」chip）或 basic:{...}（虚拟基本项）
 *   multi — 多选（state.multi[dimId] = {code: true}），适合单品/可叠加项
 *   wall  — 壁柄两段选择（state.sel.wall = plan code；state.sub.wall = {mark, grade}）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（15 步：0-14） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ', titleZh: '尺寸与型号', note: '选择尺寸与型号（G/B/R/D/C），决定基本セット価格（タイプ×サイズ矩阵）。1317/1216 仅 D/C タイプ可选。' },
    { n: 1, title: '架台・基礎', titleZh: '架台·基础', note: '架台 F/S/R/H（本体品番第㋺位）、吊架台 CGA、フラット床高さ調整 CTA、スリム構造 EUA01、鋼管立ち上げ VVA。' },
    { n: 2, title: '壁柄', titleZh: '墙面花纹', note: '3 种プラン（4面同色/正面アクセント/浴槽横アクセント）× グレード，价格按タイプ别3列（G|BR|DC）。' },
    { n: 3, title: '浴槽', titleZh: '浴缸', note: '形状（尺寸联动）、カラー、ヘッドレスト、楽湯、インテリア・バー、ハンドグリップ、ふろふた。' },
    { n: 4, title: '床', titleZh: '地板', note: 'お掃除ラクラクほっカラリ床 10 色（全部 ±¥0）。' },
    { n: 5, title: 'カウンター', titleZh: '台面', note: 'タイプ别（カームベンチ/フロスト調/グランツ）＋カウンターなし（D C）。' },
    { n: 6, title: '便利アイテム', titleZh: '便利功能件', note: '床ワイパー洗浄、浴室クリアキープ、おそうじ浴槽、自動排水栓、まるごときれい快適セット。' },
    { n: 7, title: '照明', titleZh: '照明', note: '調光調色システム（G B R 基本）、ダウンライト、キューブ形照明。' },
    { n: 8, title: '換気扇・暖房', titleZh: '换气扇·暖风机', note: '暖房換気扇、三乾王、温水式、ミスト、洗面所暖房機・快適セット、ランドリーパイプ。' },
    { n: 9, title: '水栓・シャワー', titleZh: '水龙头·花洒', note: '洗い場水栓、オーバーヘッドシャワー、シャワーヘッド、バス水栓、スライドバー。' },
    { n: 10, title: '鏡', titleZh: '镜子', note: '縦長ミラー（タイプ别基本）、ワイドミラー、鏡なし（壁高联动）。' },
    { n: 11, title: '天井', titleZh: '天花板', note: '平天井（目地なし/付き）×白/黒×壁高 H2000/2150/2300、勾配天井。' },
    { n: 12, title: '収納棚', titleZh: '收纳架', note: 'ワイヤー、セパレート、ESA00、カウンター下棚、フリーポケット。' },
    { n: 13, title: 'ドア', titleZh: '门', note: '種類×カラー×ハンドル×壁高、ドア位置 A/B/C/D、位置変更 HCA、外タオル掛け。' },
    { n: 14, title: 'オプション・拡張', titleZh: '舒适选项·扩展', note: 'オプション単品、浴室テレビ/オーディオ、インテリア・バー、窓、ノコリ～ユECO・福祉、追いだき・配管、その他パーツ。' }
  ];

  /* ---------------- 维度配置 ----------------
   * codes: 具体 code 数组；'ALL' = 分类全部选项；codePrefix 前缀匹配（如 door 'HD' 排除 HCA/HTB）
   */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['G', 'B', 'R', 'D', 'C'], titleJa: 'タイプ', titleZh: '型号' },
    // step 1
    { id: 'kudai', step: 1, cat: 'kudai', kind: 'radio', codes: 'ALL', titleJa: '架台・基礎', titleZh: '架台·基础' },
    // step 2
    { id: 'wall', step: 2, cat: 'wall', kind: 'wall', codes: 'ALL', titleJa: '壁柄', titleZh: '墙面花纹' },
    // step 3
    { id: 'bt_shape', step: 3, cat: 'bathtub', kind: 'radio', codes: ['BT_SUPERWIDE', 'BT_WIDE', 'BT_STRAIGHT', 'BT_STRAIGHTSTEP'], titleJa: '浴槽形状', titleZh: '浴缸形状' },
    { id: 'bt_color', step: 3, cat: 'bathtub', kind: 'radio', codes: ['BT_COLOR_WHITE', 'BT_COLOR_IVORY', 'BT_COLOR_PINK', 'BT_COLOR_GREY', 'BT_COLOR_MARRON', 'BT_COLOR_BLACK'], titleJa: '浴槽カラー', titleZh: '浴缸颜色' },
    { id: 'bt_headrest', step: 3, cat: 'bathtub', kind: 'radio', codes: ['YDM1N', 'YDM1L', 'YDM1B', 'YDM1K'], titleJa: 'ヘッドレスト', titleZh: '头枕' },
    { id: 'bt_bar', step: 3, cat: 'bathtub', kind: 'radio', codes: ['KNA00', 'KNR6R', 'KNR6N', 'KNR6T', 'KNR6G'], titleJa: 'インテリア・バー（浴槽横）', titleZh: '内饰扶手杆（浴缸侧）' },
    { id: 'rakuyu', step: 3, cat: 'bathtub', kind: 'radio', codes: ['FBH01', 'FBA00'], titleJa: '楽湯', titleZh: '气泡按摩浴' },
    { id: 'bt_handgrip', step: 3, cat: 'bathtub', kind: 'radio', codes: ['HG_NONE', 'YHH23', 'YHH24', 'YHH11', 'YHH12', 'YHH34', 'YHA12'], titleJa: 'ハンドグリップ', titleZh: '浴缸内扶手' },
    { id: 'bt_lid', step: 3, cat: 'bathtub', kind: 'radio', codes: ['FT2', 'YPH13'], titleJa: 'ふろふた', titleZh: '浴缸盖' },
    // step 4
    { id: 'floor', step: 4, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床', titleZh: '地板' },
    // step 5
    { id: 'counter', step: 5, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター', titleZh: '台面' },
    // step 6
    { id: 'item_wiper', step: 6, cat: 'items', kind: 'radio', codes: ['CQF01', 'CQF1K', 'CQA00'], titleJa: '床ワイパー洗浄', titleZh: '地板刮水清洗' },
    { id: 'item_clear', step: 6, cat: 'items', kind: 'radio', none: true, codes: ['CQH01', 'CQH1K'], titleJa: '浴室クリアキープ', titleZh: '浴室清洁保持' },
    { id: 'item_other', step: 6, cat: 'items', kind: 'multi', codes: ['YFS32', 'YFE49', 'JLH11', 'FSS01', 'FSS02'], titleJa: 'その他アイテム', titleZh: '其他便利件' },
    // step 7
    { id: 'light', step: 7, cat: 'lighting', kind: 'radio',
      basic: { code: 'LIGHT_BASIC', nameJa: '調光調色システム（基本）', nameZh: '调光调色系统（基本）' },
      codes: ['KSD3F', 'KSD2F', 'KSD3F_DC', 'KSD44', 'KSD54', 'KSDA4', 'KSDA3', 'KSDA2', 'KSKE2', 'KSKE1', 'KSKM2', 'KSKM1'],
      titleJa: '照明', titleZh: '照明' },
    // step 8
    { id: 'vent', step: 8, cat: 'fan', kind: 'radio', codes: 'ALL', titleJa: '換気扇・三乾王', titleZh: '换气扇·三乾王' },
    { id: 'wh_heater', step: 8, cat: 'washlet_heater', kind: 'radio', none: true,
      codes: ['ILA14', 'ILA23', 'JKBN8', 'JKAN9', 'JKBG8', 'JKAG9', 'JKBM8', 'JKAM9', 'JKBH8', 'JKAH9', 'JKBNA', 'JKANB', 'JKBNC', 'JKAND', 'JKBGA', 'JKAGB', 'JKBGC', 'JKAGD', 'JKBMA', 'JKAMB', 'JKBMC', 'JKAMD', 'JKBHA', 'JKAHB', 'JKBHC', 'JKAHD'],
      titleJa: '洗面所暖房機・快適セット', titleZh: '洗面室暖风机·舒适套装' },
    { id: 'laundry', step: 8, cat: 'washlet_heater', kind: 'radio', none: true, codes: ['KMB11', 'KMB15'], titleJa: 'ランドリーパイプ', titleZh: '晾衣杆' },
    // step 9
    { id: 'faucet', step: 9, cat: 'faucet_shower', kind: 'radio',
      basic: { code: 'FAUCET_BASIC', nameJa: '基本水栓（タイプ別基本仕様）', nameZh: '基本水龙头（按型号）' },
      codes: ['SEBE2', 'SEKE2', 'SEK5K', 'SEK7K', 'SEK8K', 'SEK6S', 'SEK6K', 'SEH8S', 'SEH8K', 'SEH6S'],
      titleJa: '洗い場水栓', titleZh: '洗手区水龙头' },
    { id: 'oh_shower', step: 9, cat: 'faucet_shower', kind: 'radio', codes: ['SHA00', 'SHA5S', 'SHA5K', 'SHA6S', 'SHA6K'], titleJa: 'オーバーヘッドシャワー', titleZh: '顶喷花洒' },
    { id: 'shower_head', step: 9, cat: 'faucet_shower', kind: 'radio', codes: ['SRW01', 'SRWF1', 'SRW11', 'SRWF2', 'SRW1B', 'SRWFB', 'SRW15', 'SRWF6'], titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'bus_faucet', step: 9, cat: 'faucet_shower', kind: 'radio', none: true, codes: ['SFHES', 'SFHEK', 'SFH8S', 'SFH8K', 'SFH4S', 'SFH4K', 'SFH1S', 'SFH1K'], titleJa: 'バス水栓', titleZh: '浴缸水龙头' },
    { id: 'slide_bar', step: 9, cat: 'faucet_shower', kind: 'radio', codes: ['SB_BASIC', 'SBE5R', 'SBRER', 'SBA00'], titleJa: 'スライドバー', titleZh: '滑动杆' },
    { id: 'faucet_misc', step: 9, cat: 'faucet_shower', kind: 'multi', codes: ['SPE02', 'SJA01', 'SIA1R', 'KTA00'], titleJa: 'その他水栓関連', titleZh: '其他水栓件' },
    // step 10
    { id: 'mirror', step: 10, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: '鏡', titleZh: '镜子' },
    // step 11
    { id: 'ceiling', step: 11, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    // step 12
    { id: 'storage', step: 12, cat: 'storage', kind: 'radio', codes: ['ESH72', 'ESH71', 'ESH70', 'ESH78', 'ESE5H', 'ESE4H', 'ESE1H', 'ESA00'], titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'storage_misc', step: 12, cat: 'storage', kind: 'multi', codes: ['EYB11', 'LJE1W', 'LJE2W', 'LJE3W', 'LJE1S', 'LJE2S', 'LJE3S', 'LJG1W', 'LJG2W', 'LJG3W', 'LJG1S', 'LJG2S', 'LJG3S'], titleJa: 'フリーポケット・台下棚', titleZh: '磁吸收纳·台下架' },
    // step 13
    { id: 'door', step: 13, cat: 'door', kind: 'radio', codePrefix: 'HD',
      basic: { code: 'DOOR_BASIC', nameJa: '基本ドア（タイプ別）', nameZh: '基本门（按型号）' },
      titleJa: 'ドア', titleZh: '门' },
    { id: 'door_pos', step: 13, cat: 'door_position', kind: 'radio', codes: ['A', 'B', 'C', 'D'], titleJa: 'ドア位置', titleZh: '门位置' },
    { id: 'door_hca', step: 13, cat: 'door', kind: 'radio', none: true, codes: ['HCA01', 'HCA02', 'HCA03', 'HCA14'], titleJa: 'ドア位置変更', titleZh: '门位置偏移' },
    { id: 'door_htb', step: 13, cat: 'door', kind: 'radio', none: true, codes: ['HTBSA', 'HTBSP'], titleJa: 'ドア外タオル掛け', titleZh: '门外毛巾杆' },
    // step 14
    { id: 'opt_parts', step: 14, cat: 'option_parts', kind: 'multi', codes: 'ALL', titleJa: 'オプション単品', titleZh: '舒适单品' },
    { id: 'tv_audio', step: 14, cat: 'bathroom_tv_audio', kind: 'multi', codes: 'ALL', titleJa: '浴室テレビ・オーディオ', titleZh: '浴室电视·音响' },
    { id: 'comfort_bar', step: 14, cat: 'comfort_bar', kind: 'multi', codes: 'ALL', titleJa: 'インテリア・バー', titleZh: '内饰扶手杆' },
    { id: 'window', step: 14, cat: 'window', kind: 'multi', codes: 'ALL', titleJa: '窓', titleZh: '窗户' },
    { id: 'welfare', step: 14, cat: 'welfare_eco', kind: 'multi', codes: 'ALL', titleJa: 'ノコリ～ユECO・福祉', titleZh: '剩水利用·福祉' },
    { id: 'oidaki', step: 14, cat: 'oidaki_plumbing', kind: 'multi', codes: 'ALL', titleJa: '追いだき・配管', titleZh: '追焚·配管' },
    { id: 'misc', step: 14, cat: 'misc_parts', kind: 'multi', codes: 'ALL', titleJa: 'その他単品パーツ', titleZh: '其他单品件' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1616',            // 尺寸 code（默认 1616；独立字段，点击尺寸卡片更新）
    sel: {},                 // { dimId: option code }   radio / wall 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    sub: {},                 // { dimId: {...} }  特殊维度子选择（wall 的 mark/grade）
    rate: null,              // 汇率（1日元=人民币）
    quoteHead: { no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: '' },
    lang: 'both'
  };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }
  function catOpts(d) {
    var c = cat(d.cat);
    if (!c) return [];
    if (d.codePrefix) return c.options.filter(function (o) { return String(o.code).indexOf(d.codePrefix) === 0; });
    return c.options;
  }
  /** 维度选项 code 列表（codes 数组 / 'ALL' / codePrefix） */
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
    if (c == null) return null;
    return opt(dimId, c);
  }
  function sizeOption() {
    return cat('size') ? cat('size').options.find(function (o) { return o.code === state.size; }) : null;
  }

  /** 当前タイプ code（未选 = G，basePlan） */
  function typeCode() {
    var o = selOpt('type');
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'G');
  }
  function sizeCode() { return state.size || '1616'; }
  function doorPosCode() {
    var o = selOpt('door_pos');
    return o ? o.code : 'A';
  }
  function pedestalCode() {
    var o = selOpt('kudai');
    return o ? o.code : 'F';
  }
  function regionCode() { return '一般地'; }   // 寒冷地通过水栓选项体现，无独立地域维度
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /** 基本セット価格（meta.typeBasePrices[タイプ][サイズ]；null/缺 = 0） */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    if (!tbp) return 0;
    var bySize = tbp[typeCode()];
    if (!bySize) return 0;
    var v = bySize[sizeCode()];
    return typeof v === 'number' ? v : 0;
  }

  /** 虚拟基本项（LIGHT_BASIC/FAUCET_BASIC/DOOR_BASIC）→ 0 差价 */
  function isVirtualBasic(code) {
    return code === 'LIGHT_BASIC' || code === 'FAUCET_BASIC' || code === 'DOOR_BASIC';
  }
  function virtualBasicOf(d) {
    return d.basic ? d.basic : null;
  }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    var o = opt(dimId, code);
    return P.priceFor(o, typeCode(), sizeCode());
  }

  /** 壁柄（wall kind）差价：4SAME → 柄 priceByType；FRONT/SIDE_ACCENT → surroundPrices[grade][typeGroup] */
  function wallContribution() {
    var planCode = state.sel.wall;
    if (!planCode) return null;
    var plan = opt('wall', planCode);
    if (!plan || !Array.isArray(plan.subOptions)) return null;
    var s = state.sub.wall;
    if (!s || !s.mark) return null;
    var sub = plan.subOptions.find(function (x) { return String(x.code) === String(s.mark); });
    if (!sub) return null;
    if (planCode === '4SAME') {
      var v = P.priceByTypeValue(sub, typeCode());
      return P.toAmount(v);
    }
    // アクセントプラン：周辺グレード联动
    var grade = s.grade || sub.grade || 'hg2';
    if (sub.surroundPrices && sub.surroundPrices[grade]) {
      var g = typeGroup();
      var pv = sub.surroundPrices[grade][g];
      return typeof pv === 'number' ? pv : P.toAmount(pv);
    }
    return null;
  }

  /** 单个维度当前差价（未选 → null；含0元也算有效） */
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
        var total = 0, any = false, allNull = true;
        Object.keys(m).forEach(function (code) {
          if (!m[code]) return;
          var v = radioContribution(dimId, code);
          if (v == null) return;
          total += v; any = true; allNull = false;
        });
        return allNull ? null : total;
      }
      case 'wall': return wallContribution();
      default: return null;
    }
  }

  /** 当前维度所选「行」描述（报价单明细用） */
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
        var namesZh = [], namesJa = [], diffs = 0, allNull = true;
        Object.keys(m).forEach(function (code) {
          if (!m[code]) return;
          var o = opt(dimId, code);
          if (!o) return;
          namesZh.push(o.name_zh || o.name_ja || code);
          namesJa.push(o.name_ja || o.name_zh || code);
          var v = radioContribution(dimId, code);
          if (v != null) { diffs += v; allNull = false; }
        });
        if (!namesZh.length) return out;
        out.nameZh = namesZh.join('＋');
        out.nameJa = namesJa.join('＋');
        out.diff = allNull ? null : diffs;
        return out;
      }
      case 'wall': {
        var planCode = state.sel.wall;
        if (!planCode) return out;
        var plan = opt('wall', planCode);
        if (!plan) return out;
        out.nameZh = plan.name_zh || plan.code;
        out.nameJa = plan.name_ja || plan.code;
        out.code = plan.code;
        var s = state.sub.wall;
        if (s && s.mark) {
          var sub = (plan.subOptions || []).find(function (x) { return String(x.code) === String(s.mark); });
          if (sub) {
            out.nameZh += '・' + (sub.name_zh || sub.code);
            out.nameJa += '・' + (sub.name_ja || sub.code);
            if (planCode !== '4SAME') {
              var grade = s.grade || sub.grade || 'hg2';
              var gradeJa = { premium: 'プレミアム', hg2: 'ハイグレードⅡ', hg1: 'ハイグレードⅠ', basic: 'ベーシック' }[grade] || grade;
              out.extra = '周辺グレード ' + gradeJa;
            }
          }
        }
        out.diff = wallContribution();
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
      nameZh: '基本セット ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + typeCode() + 'タイプ',
      nameJa: base ? base.name_ja + ' ' + typeCode() + 'タイプ' : sizeCode(),
      code: sizeCode() + typeCode(),
      model: productNo(), extra: '取付・設置費別（不含安装费）／窓本体・窓枠含まず',
      diff: 0, base: true
    });
    DIMS.forEach(function (d) {
      if (d.step === 0) return;                       // type 价格已在套装价
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
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * 0.7) : null;
    return {
      base: base, basePrice: basePriceValue,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: sizeCode(), type: typeCode(), doorPos: doorPosCode(),
      pedestal: pedestalCode(), region: regionCode()
    };
  }

  /** 本体品番：HLV + サイズ + U + タイプ + X3 + ドア位置 + 架台（例 HLV1616UG X3D R） */
  function productNo() {
    var fmt = (DATA.meta && DATA.meta.productNo) || 'HLV{size}U{type} X3{doorPos} {pedestal}';
    return fmt
      .replace('{size}', sizeCode())
      .replace('{type}', typeCode())
      .replace('{doorPos}', doorPosCode())
      .replace('{pedestal}', pedestalCode());
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

  /** 暗色壁柄列表（濃色柄×照明照度制约，P.141） */
  var DARK_WALLS = ['オーレグレージュ', 'ファルダブラック', 'ストーリアブラック', 'ピエトラグレー', 'シルバーストーンブラック', 'ブラスブラック', 'ラメールブルー', 'クラフティブラック', 'エンペラブラック', 'リーセオーク', 'ラセットウッド'];
  function selectedWallName() {
    var s = state.sub.wall;
    if (!s || !s.mark) return null;
    var plan = opt('wall', state.sel.wall);
    if (!plan) return null;
    var sub = (plan.subOptions || []).find(function (x) { return String(x.code) === String(s.mark); });
    return sub ? sub.name_ja : null;
  }

  /**
   * 判断某维度某选项是否禁用；返回 reason 字符串或 null。
   * 规则：数据 schema 限定（sizes/priceByType null）+ 关键互斥/必须搭配硬编码（研究文档 §4）。
   */
  function disabledReason(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var isVB = isVirtualBasic(code);
    var o = opt(dimId, code);
    if (!o && !isVB) return null;
    var size = sizeCode();
    var type = typeCode();

    // ---- 数据 schema 限定（虚拟基本项跳过） ----
    if (!isVB && Array.isArray(o.sizes)) {
      var okS = false;
      for (var i = 0; i < o.sizes.length; i++) {
        if (P.sizeKeyMatches(o.sizes[i], size)) { okS = true; break; }
      }
      if (!okS) return '该选项不适用于 ' + size + ' 尺寸';
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价（仅 D/C）';
    }
    if (!isVB && o.priceByType) {
      var pv = P.priceByTypeValue(o, type);
      if (pv == null) return '该タイプ不可选';
    }

    // ---- サイズ硬性限制 ----
    if ((size === '1317' || size === '1216') && dimId === 'oh_shower') return '1317/1216 不可选オーバーヘッドシャワー';
    if ((size === '1317' || size === '1216') && dimId === 'bt_lid' && code === 'YPH13') return '1317/1216 不可选3枚割ふた';
    if (size === '1624' && dimId === 'bt_shape' && code !== 'BT_SUPERWIDE') return '1624 浴槽固定スーパーワイド';
    if (size === '1624' && dimId === 'bt_handgrip') return '1624 スーパーワイドにハンドグリップ品揃えなし';

    // ---- 吊架台 → F フラット床 必须 ----
    var cgaSel = selIs('kudai', ['CGA06', 'CGA16', 'CGA10']);
    if (dimId === 'kudai' && cgaSel && code !== 'F' && code.indexOf('CGA') !== 0) return '吊架台使用时架台须 F フラット床';
    if (dimId === 'kudai' && (code === 'CGA06' || code === 'CGA16' || code === 'CGA10') &&
        selected('kudai') && !selIs('kudai', 'F') && state.sel.kudai !== code) {
      return '吊架台须配 F フラット床（当前架台非 F）';
    }

    // ---- カウンターなし（TKA/TKC）联动 ----
    var noCounter = (function () {
      var c = state.sel.counter;
      return c && (String(c).indexOf('TKA') === 0 || String(c).indexOf('TKC') === 0);
    })();
    if (noCounter) {
      if (dimId === 'item_wiper' || dimId === 'item_clear') return 'カウンターなし时不可选';
      if (dimId === 'bus_faucet') return 'カウンターなし时バス水栓不可';
      if (dimId === 'faucet_misc' && (code === 'SJA01' || code === 'SIA1R')) return 'カウンターなし时不可选';
      if (dimId === 'storage_misc' && code === 'EYB11') return 'カウンターなし时カウンター下棚不可';
      if (dimId === 'oh_shower' && type === 'D') return 'D タイプ カウンターなし时オーバーヘッド不可';
    }
    if (dimId === 'counter' && (String(code).indexOf('TKA') === 0 || String(code).indexOf('TKC') === 0) && type !== 'D' && type !== 'C') {
      return 'カウンターなし仅 D/C タイプ';
    }

    // ---- 楽湯なし（FBA00）→ 照明须 KSD3F/KSD54（含虚拟基本项） ----
    var rakuyuNone = selIs('rakuyu', 'FBA00');
    if (rakuyuNone && dimId === 'light' && (code === 'LIGHT_BASIC' || code === 'KSD2F' || code === 'KSD44')) {
      return '楽湯なし时须选 KSD3F（G B R）/KSD54（D C）';
    }

    // ---- 照明タイプ限定 ----
    if (dimId === 'light') {
      if (code === 'KSD3F' && type !== 'G' && type !== 'B' && type !== 'R') return 'KSD3F 仅 G B R タイプ';
      if ((code === 'KSD2F' || code === 'KSD3F_DC') && type !== 'D') return '该选项仅 D タイプ';
      if ((code === 'KSD44' || code === 'KSD54') && type !== 'D' && type !== 'C') return '该选项仅 D C タイプ';
    }

    // ---- 濃色柄 × 照明（キューブ形不支持調光調色 → 禁） ----
    var dark = DARK_WALLS.some(function (n) { var wn = selectedWallName(); return wn && wn.indexOf(n) >= 0; });
    if (dark && dimId === 'light' && (code.indexOf('KSKE') === 0 || code.indexOf('KSKM') === 0)) {
      return '濃色壁柄时キューブ形照明不可选（照度不足）';
    }

    // ---- ワイドミラー → 収納棚 ESA00 必须 / スライドバー・TV 联动 ----
    var wideMirror = selIs('mirror', 'KUWA1');
    if (wideMirror && dimId === 'storage' && code !== 'ESA00') return 'ワイドミラー时収納棚须 ESA00';
    if (wideMirror && dimId === 'slide_bar' && (code === 'SBA00' || code === 'SBRER')) return 'ワイドミラー时スライドバーなし/コンフォートバー不可';
    if (wideMirror && dimId === 'tv_audio') return 'ワイドミラー时浴室テレビ不可';

    // ---- おそうじ浴槽 → バス水栓限定 / バスリフト 互斥 ----
    var osoji = multiHas('item_other', ['YFS32', 'JLH11']);
    if (osoji && dimId === 'bus_faucet' && (code === 'SFH4S' || code === 'SFH4K' || code === 'SFH1S' || code === 'SFH1K')) {
      return 'おそうじ浴槽时バス水栓はサーモ（SFHE/SFH8）のみ';
    }
    if (osoji && dimId === 'welfare' && code === 'EWB100SS') return 'おそうじ浴槽时バスリフト不可';

    // ---- オーバーヘッドシャワー × 浴室オーディオ ----
    var ohSel = selIs('oh_shower', ['SHA5S', 'SHA5K', 'SHA6S', 'SHA6K']);
    if (ohSel && dimId === 'tv_audio' && code === 'FOJ01') return 'オーバーヘッドシャワー与浴室オーディオ互斥';

    // ---- 寒冷地水栓 × ノコリ～ユECO ----
    var coldFaucet = selIs('faucet', ['SEBE2', 'SEKE2', 'SEK5K', 'SEK7K', 'SEK8K', 'SEK6K', 'SEH8K']);
    if (dimId === 'welfare' && code === 'YMA01' && coldFaucet) return 'ノコリ～ユECO 与寒冷地水栓互斥';

    // ---- 壁柄：ミネラホワイト/エニーホワイト 仅周辺パネル（4面同色不可） ----
    if (dimId === 'wall' && state.sel.wall === '4SAME') {
      var sub2 = (function () { var pl = opt('wall', '4SAME'); return pl && pl.subOptions ? pl.subOptions.find(function (x) { return String(x.code) === String(code); }) : null; })();
      if (sub2 && /ミネラホワイト|エニーホワイト/.test(sub2.name_ja)) return '该柄仅可作周辺パネル（不可4面同色）';
    }

    // ---- 天井 目地なし（G B R）/目地付き（D C）----
    if (dimId === 'ceiling') {
      var isDC = type === 'D' || type === 'C';
      var isGBR = !isDC;
      if ((code === 'ISH32' || code === 'ISH35') && isGBR) return '目地付き平天井仅 D C タイプ';
      if ((code === 'ISA42' || code === 'ISA43') && isDC) return '目地なし平天井仅 G B R タイプ';
    }

    // ---- ドア位置変更 × 3枚引戸/フルスクリーン（简化） ----
    if (dimId === 'door_hca') {
      var doorName = (selOpt('door') || {}).name_ja || '';
      if (/3枚|フルスクリーン/.test(doorName)) return '3枚引戸/フルスクリーン时ドア位置変更不可';
    }

    if (isVB) return null;   // 虚拟基本项无其他限制

    return null;
  }

  /** 选中某维度选项后的自动修复（推荐组合） */
  function autoFix(dimId, code) {
    if (dimId === 'kudai' && (code === 'CGA06' || code === 'CGA16' || code === 'CGA10')) {
      if (state.sel.kudai && state.sel.kudai !== 'F') state.sel.kudai = 'F';
    }
    if (dimId === 'rakuyu' && code === 'FBA00') {
      if (!state.sel.light || state.sel.light === 'LIGHT_BASIC') {
        var t = typeCode();
        state.sel.light = (t === 'D' || t === 'C') ? 'KSD54' : 'KSD3F';
      }
    }
    if (dimId === 'mirror' && code === 'KUWA1') {
      if (!state.sel.storage) state.sel.storage = 'ESA00';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（1317/1216 仅 D/C） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var fallback = ['D', 'C'];
      for (var i = 0; i < fallback.length; i++) {
        if (tbp[fallback[i]] && tbp[fallback[i]][code] != null) {
          state.sel.type = fallback[i];
          break;
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
      ['サイズ', r.size], ['タイプ', r.type], ['ドア位置', r.doorPos], ['架台', r.pedestal],
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
  window.SYNLA = window.SYNLA || {};
  window.SYNLA.quote = {
    init: function (data) { DATA = data; P = window.SYNLA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    typeCode: typeCode, sizeCode: sizeCode, typeGroup: typeGroup, basePrice: basePrice,
    doorPosCode: doorPosCode, pedestalCode: pedestalCode, regionCode: regionCode,
    productNo: productNo,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe,
    disabledReason: disabledReason, autoFix: autoFix, setSize: setSize,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.multi = {}; state.sub = {};
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
