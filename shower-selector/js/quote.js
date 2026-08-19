/**
 * quote.js — TOTO シャワールーム（Shower Room）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.SHOWER.quote。
 * 依赖：window.SHOWER_DATA（products.js，由 shower-data.json 生成）、window.SHOWER.price
 *
 * 计价模型（全部手册价为税抜き）：
 *   本体価格（税抜）= 基本セット価格（meta.typeBasePrices[タイプ][サイズ]） + Σ选项差价
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.8）—— 系数仅在计算代码中，页面不显示算式
 *
 * 维度 kind：
 *   radio — 单选（state.sel[dimId] = option code）；可带 none:true（「なし」chip）或 basic:{...}（虚拟基本项）
 *   multi — 多选（state.multi[dimId] = {code: true}），适合单品/可叠加项
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（12 步：0-11，贴近手册 1~9 顺序） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ', titleZh: '尺寸与型号', note: '选择淋浴房型号（G/X/T/L）与尺寸（0816/0812/0808），7 种固定组合决定基本セット価格。' },
    { n: 1, title: '壁柄を選ぶ', titleZh: '墙面花纹', note: '入れ替えドアの壁柄をグレード制で選択（G X T ｜ L タイプ別 2 列差）。' },
    { n: 2, title: '床・トラップ', titleZh: '床·存水弯', note: 'フレーム高さ（基本 H187／CTA02 H227）、エルボ交換（DHE00/DHS11）。' },
    { n: 3, title: '収納を選ぶ', titleZh: '收纳', note: 'セパレート収納棚（W270/W185）、コーナー収納棚、収納なし（G X T L タイプ別 4 列差）。' },
    { n: 4, title: '鏡を選ぶ', titleZh: '镜子', note: '基本＝鏡なし；縦長ミラー（W298×H950）/四角ミラー（W340×H455）。' },
    { n: 5, title: '水栓金具を選ぶ', titleZh: '水龙头金具', note: 'サーモスタット（一般地 SSGFS／寒冷地 SSGFK）、水栓なし SSA00。' },
    { n: 6, title: 'シャワーを選ぶ', titleZh: '花洒头', note: 'コンフォートウエーブ 4 種＋スプレーシャワーS（G X ｜ T L タイプ別 2 列差）。' },
    { n: 7, title: 'ドアを選ぶ', titleZh: '门', note: '基本＝折戸 800（開放固定式）；バリアフリー仕様（HDR36/3F/37、HDP3F）。' },
    { n: 8, title: '照明を選ぶ', titleZh: '照明', note: 'ダウンライト／フラット形／半球形／丸形（G X T ｜ L タイプ別 2 列差）。' },
    { n: 9, title: '換気扇を選ぶ', titleZh: '换气扇', note: '換気扇（抗菌・防カビ／パイプファン）、換気開口 φ177/φ225、換気なし。' },
    { n: 10, title: 'タオル・スライドバー', titleZh: '毛巾杆·滑杆', note: 'タオル掛け（角形 L350/L300）、スライドバー（L635／インテリア・バー L800／なし）。' },
    { n: 11, title: '付加オプション', titleZh: '附加选项', note: 'インテリア・バー（5 種×3 色）、非常コール、トラップ保温カバー/なし、手すり配管。' }
  ];

  /* ---------------- 维度配置 ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['G', 'X', 'T', 'L'], titleJa: 'タイプ', titleZh: '型号' },
    // step 1
    { id: 'wall', step: 1, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁柄', titleZh: '墙面花纹' },
    // step 2
    { id: 'frame', step: 2, cat: 'frame', kind: 'radio',
      basic: { code: 'FRAME_BASIC', nameJa: 'フレーム高さ 187mm（基本）', nameZh: '底盘高度 187mm（基本）' },
      codes: ['CTA02'], titleJa: 'フレーム高さ', titleZh: '底盘高度' },
    { id: 'elbow', step: 2, cat: 'trap', kind: 'radio', none: true, codes: ['DHE00', 'DHS11'], titleJa: 'エルボ', titleZh: '弯头' },
    // step 3
    { id: 'storage', step: 3, cat: 'storage', kind: 'radio', codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    // step 4
    { id: 'mirror', step: 4, cat: 'mirror', kind: 'radio',
      basic: { code: 'MIRROR_NONE', nameJa: '鏡なし（基本）', nameZh: '无镜子（基本）' },
      codes: ['KURF3', 'KUMF3', 'KURS1', 'KUMS1'], titleJa: '鏡', titleZh: '镜子' },
    // step 5
    { id: 'faucet', step: 5, cat: 'faucet', kind: 'radio', codes: 'ALL', titleJa: '水栓金具', titleZh: '水龙头金具' },
    // step 6
    { id: 'shower_head', step: 6, cat: 'shower_head', kind: 'radio',
      basic: { code: 'SHOWER_BASIC', nameJa: 'シャワーヘッド（基本）', nameZh: '花洒头（基本）' },
      codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    // step 7
    { id: 'door', step: 7, cat: 'door', kind: 'radio',
      basic: { code: 'DOOR_BASIC', nameJa: '折戸 800（基本仕様）', nameZh: '折叠门 800（基本）' },
      codes: ['HDR21', 'HDR36', 'HDR3F', 'HDR37', 'HDP3F'], titleJa: 'ドア', titleZh: '门' },
    // step 8
    { id: 'lighting', step: 8, cat: 'lighting', kind: 'radio',
      basic: { code: 'LIGHT_BASIC', nameJa: '照明（基本）', nameZh: '照明（基本）' },
      codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    // step 9
    { id: 'fan', step: 9, cat: 'fan', kind: 'radio',
      basic: { code: 'FAN_BASIC', nameJa: '換気扇（基本仕様）', nameZh: '换气扇（基本）' },
      codes: 'ALL', titleJa: '換気扇', titleZh: '换气扇' },
    // step 10
    { id: 'towel', step: 10, cat: 'towel', kind: 'radio', none: true, codes: 'ALL', titleJa: 'タオル掛け', titleZh: '毛巾杆' },
    { id: 'slide_bar', step: 10, cat: 'slide_bar', kind: 'radio', codes: 'ALL', titleJa: 'スライドバー', titleZh: '滑杆' },
    // step 11
    { id: 'interior_bar', step: 11, cat: 'interior_bar', kind: 'radio', none: true, codes: 'ALL', titleJa: 'インテリア・バー', titleZh: '内饰扶手杆' },
    { id: 'options', step: 11, cat: 'options', kind: 'multi', codes: 'ALL', titleJa: '付加オプション', titleZh: '附加选项' },
    { id: 'drain_pipe', step: 11, cat: 'drain_pipe', kind: 'multi', codes: 'ALL', titleJa: '手すり配管', titleZh: '扶手配管' },
    { id: 'trap_misc', step: 11, cat: 'trap', kind: 'multi', codes: ['EK7502CX2'], titleJa: '配管別売部品', titleZh: '配管另售件' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '0816',            // 尺寸 code（默认 0816）
    doorPos: 'A',            // ドア位置 A/B/C/D（默认 A；只影响可否，不影响价格）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    rate: null,              // 汇率（1日元=人民币）
    quoteHead: { no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: '' },
    lang: 'both'
  };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }
  function catOpts(d) {
    var c = cat(d.cat);
    return c ? c.options : [];
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

  function typeCode() {
    var o = selOpt('type');
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'G');
  }
  function sizeCode() { return state.size || '0816'; }
  function doorPosCode() { return state.doorPos || 'A'; }
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /** 基本セット価格（meta.typeBasePrices[タイプ][サイズ]） */
  function basePrice() {
    var tbp = DATA.meta.typeBasePrices;
    if (!tbp) return 0;
    var bySize = tbp[typeCode()];
    if (!bySize) return 0;
    var v = bySize[sizeCode()];
    return typeof v === 'number' ? v : 0;
  }

  function isVirtualBasic(code) {
    return code === 'FRAME_BASIC' || code === 'MIRROR_NONE' || code === 'SHOWER_BASIC' ||
      code === 'DOOR_BASIC' || code === 'LIGHT_BASIC' || code === 'FAN_BASIC';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    var o = opt(dimId, code);
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
      nameZh: '基本セット ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + typeCode() + 'タイプ',
      nameJa: base ? base.name_ja + ' ' + typeCode() + 'タイプ' : sizeCode(),
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

  /** 本体品番：JSV + サイズ + U + タイプ + W6（例 JSV0816UGW6） */
  function productNo() {
    var fmt = (DATA.meta && DATA.meta.productNo) || 'JSV{size}U{type}W6';
    return fmt
      .replace('{size}', sizeCode())
      .replace('{type}', typeCode());
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
   * 规则：数据 schema 限定（sizes/priceByType null）+ 研究文档 §4 互斥/必须搭配硬编码。
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
        var pv = P.priceByTypeValue(o, type);
        if (pv == null) return '该タイプ不可选';
      }
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价';
    }

    // ---- 尺寸・タイプ限定（手册硬编码） ----
    // 縦長鏡 KURF3/KUMF3：0816 のみ（数据 constraints）；四角鏡 KURS1/KUMS1：0812 X 不可
    if (dimId === 'mirror') {
      if ((code === 'KURF3' || code === 'KUMF3') && size !== '0816') return '縦長鏡仅 0816 尺寸';
      if ((code === 'KURS1' || code === 'KUMS1') && size === '0812' && type === 'X') return '0812 X タイプ不可选四角鏡';
    }
    // 照明 KSTM1：0812 X 不可
    if (dimId === 'lighting' && code === 'KSTM1' && size === '0812' && type === 'X') return '0812 X タイプ不可选平板照明';
    // 換気扇 0808 制限
    if (dimId === 'fan') {
      if (size === '0808' && (code === 'IKJC5' || code === 'IKA00' || code === 'IKA01' || code === 'IKA05')) {
        return '0808 尺寸不可选';
      }
    }
    // ドア HDP3F：0816 X のみ；HDR3F：0816 G/X・0812 L の ドア位置 A のみ
    if (dimId === 'door') {
      if (code === 'HDP3F' && !(size === '0816' && type === 'X')) return 'HDP3F 仅 0816 X タイプ';
      if (code === 'HDR3F') {
        var ok3f = (size === '0816' && (type === 'G' || type === 'X')) || (size === '0812' && type === 'L');
        if (!ok3f) return 'HDR3F 仅 0816 G/X・0812 L タイプ';
        if (ok3f && state.doorPos !== 'A') return 'HDR3F 仅ドア位置 A';
      }
    }
    // インテリア・バー 0808/0812 X 制限
    if (dimId === 'interior_bar') {
      var pre = code.slice(0, 4);   // KAR1/KJR1/KNR7/KWR5/KER8
      if (size === '0808' && pre !== 'KAR1') return '0808 尺寸不可选';
      if ((pre === 'KAR1' || pre === 'KNR7') && size === '0812' && type === 'X') return '0812 X タイプ不可选';
    }
    // 収納 ESH4H：L タイプ不可（priceByType L=null 已自动，额外提示）
    if (dimId === 'storage' && code === 'ESH4H' && type === 'L') return 'L タイプ不可选 W270 収納棚';

    // ---- 互斥 ----
    // SSA00（水栓なし）→ シャワーヘッド不可
    if (dimId === 'shower_head' && selIs('faucet', 'SSA00')) return '水栓なし时不可选シャワーヘッド';
    // シャワーヘッド已选但水栓なし → 禁水栓なし（反向）
    if (dimId === 'faucet' && code === 'SSA00' && selected('shower_head') && !selIs('shower_head', 'SHOWER_BASIC')) {
      return '已选シャワーヘッド时不可选水栓なし';
    }
    // HDR3F（900ドア）× 縦長鏡 × タオル掛け KTA21（0816 G X）
    if (dimId === 'mirror' && (code === 'KURF3' || code === 'KUMF3') && selIs('door', 'HDR3F')) {
      return 'HDR3F（900ドア）时不可选縦長鏡';
    }
    if (dimId === 'towel' && code === 'KTA21' && selIs('door', 'HDR3F')) return 'HDR3F（900ドア）时不可选タオル掛け KTA21';
    if (dimId === 'door' && code === 'HDR3F' && selIs('mirror', ['KURF3', 'KUMF3'])) return '縦長鏡选择时不可选 HDR3F';
    if (dimId === 'door' && code === 'HDR3F' && selIs('towel', 'KTA21')) return 'KTA21 选择时不可选 HDR3F';
    // 収納 × 鏡 互斥
    if (dimId === 'storage') {
      var mirrorSel = selOpt('mirror');
      var mirrorCode = mirrorSel ? mirrorSel.code : null;
      if ((code === 'ESH4H') && (mirrorCode === 'KURS1' || mirrorCode === 'KUMS1')) return 'W270 収納棚与四角鏡互斥';
      if ((code === 'ESE4H' || code === 'ESE4L' || code === 'ESE4M' || code === 'ESE71') && (mirrorCode === 'KURF3' || mirrorCode === 'KUMF3')) return 'W185 収納棚与縦長鏡互斥';
      if (code === 'ESE71' && (mirrorCode === 'KURF3' || mirrorCode === 'KUMF3')) return 'ワイヤーシェルフ与縦長鏡互斥';
      if (code === 'ESA51' && (mirrorCode === 'KURS1' || mirrorCode === 'KUMS1')) return 'コーナー収納棚与四角鏡互斥';
    }
    if (dimId === 'mirror') {
      var storageCode = state.sel.storage;
      if ((code === 'KURS1' || code === 'KUMS1') && storageCode === 'ESH4H') return '四角鏡与 W270 収納棚互斥';
      if ((code === 'KURF3' || code === 'KUMF3') && (storageCode === 'ESE4H' || storageCode === 'ESE4L' || storageCode === 'ESE4M' || storageCode === 'ESE71')) {
        return '縦長鏡与 W185 収納棚互斥';
      }
      if ((code === 'KURS1' || code === 'KUMS1') && storageCode === 'ESA51') return '四角鏡与コーナー収納棚互斥';
    }
    // ESH4H × KNR7（T タイプ）
    if (dimId === 'interior_bar' && code.indexOf('KNR7') === 0 && selIs('storage', 'ESH4H')) return 'W270 収納棚与 KNR7 互斥';
    if (dimId === 'storage' && code === 'ESH4H' && selected('interior_bar') && (state.sel.interior_bar || '').indexOf('KNR7') === 0) {
      return 'KNR7 与 W270 収納棚互斥';
    }
    // KER8 × タオル掛け（T タイプ基本/KTA22）
    if (dimId === 'interior_bar' && code.indexOf('KER8') === 0 && (selIs('towel', 'KTA22') || (type === 'T' && !state.sel.towel))) {
      return 'KER8 与タオル掛け（T 基本/KTA22）互斥';
    }
    // DHS11 × SSGFK（寒冷地水栓）
    if (dimId === 'elbow' && code === 'DHS11' && selIs('faucet', 'SSGFK')) return 'エルボ削除与寒冷地水栓互斥';
    if (dimId === 'faucet' && code === 'SSGFK' && selIs('elbow', 'DHS11')) return '寒冷地水栓与エルボ削除互斥';
    // KSTM1 × IKA05（0812 X）
    if (dimId === 'lighting' && code === 'KSTM1' && selIs('fan', 'IKA05')) return '平板照明与 IKA05 互斥';
    if (dimId === 'fan' && code === 'IKA05' && selIs('lighting', 'KSTM1')) return 'IKA05 与平板照明互斥';

    // ---- 壁柄互斥（简化：ハイグレードⅠ × L 基本；EVH85 × T L 基本） ----
    if (dimId === 'wall') {
      var wallOpt = opt('wall', code);
      if (wallOpt && /ビスケットパターン|アラゴナホワイト|ブラウンブラックウッド|ライトウッドN|プランタスホワイトウッド/.test(wallOpt.name_ja || '') && type === 'L') {
        return 'ハイグレードⅠ壁柄与 L タイプ基本互斥';
      }
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    // SSA00 → 清空シャワーヘッド（若为基本虚拟则不动）
    if (dimId === 'faucet' && code === 'SSA00') {
      if (state.sel.shower_head && !isVirtualBasic(state.sel.shower_head)) delete state.sel.shower_head;
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（0816 仅 G/X、0808 仅 T/L） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    var avail = DATA.meta.sizeAvailability || {};
    var okTypes = avail[code] || [];
    if (okTypes.length && okTypes.indexOf(typeCode()) < 0) {
      state.sel.type = okTypes[0];
    } else if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var fallback = Object.keys(tbp).filter(function (t) { return tbp[t] && tbp[t][code] != null; });
      if (fallback.length) state.sel.type = fallback[0];
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
  window.SHOWER = window.SHOWER || {};
  window.SHOWER.quote = {
    init: function (data) { DATA = data; P = window.SHOWER.price; },
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
      state.size = '0816'; state.doorPos = 'A';
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
