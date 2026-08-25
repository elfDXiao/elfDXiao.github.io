/**
 * quote.js — Panasonic オフローラ（Oflora）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.OFLORA.quote。
 * 依赖：window.OFLORA_DATA（products.js，由 oflora-data.json 生成）、window.OFLORA.price
 *
 * 计价模型（全部手册价为税抜き・取付設置費別）：
 *   本体価格（税抜）= プラン套装价（meta.planPrices[プラン][サイズ]）＋Σ选项差价＋Σオプション
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.65）—— 系数仅在计算代码中，页面不显示算式
 *
 * 无タイプ概念：プラン（BASE/SUGOPIKA_CLEAN/MODERN_STYLE/MINIMUM_SELECT）× サイズ（6 種）矩阵。
 * 品番（简略）：BGF{サイズ記号 2-7}{プランコード 1-4}（正式 35 字段过于复杂，见 meta.productNo note）。
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（15 步：0-14，プランニングガイド 35 字段分组） ---------------- */
  var STEPS = [
    { n: 0, title: 'プラン・サイズ', titleZh: '方案·尺寸', note: '选择方案（ベース/スゴピカクリーン/モダン/ミニマムセレクト）与尺寸（6 種），決定プラン×サイズ 4×6 套装价（タイプ概念なし）。照片套餐参考。' },
    { n: 1, title: 'ドア勝手', titleZh: '门开向', note: 'ドア勝手（AR/AL/BR/BL）。ドア種類により勝手制約あり。' },
    { n: 2, title: '設置階・設置方法', titleZh: '安装楼层·方式', note: '1階/2階 アジャスターボルト（標準）・高床/低床・架台設置（サイズ別 3 档差価）。' },
    { n: 3, title: '浴槽パン', titleZh: '浴缸底盘', note: '浴槽パンなし（標準）／あり（保温浴槽Ⅱ +132,000／保温なし +152,900）。' },
    { n: 4, title: '床・床暖房', titleZh: '地板·地暖', note: 'スミピカフロア（単色 標準/ささっとキレイ/柄付）＋床暖房（+73,150）。' },
    { n: 5, title: '浴槽', titleZh: '浴缸', note: '浴槽形状（ワイド 1621のみ/アーチ/エスライン/リクライン）→ 素材・色柄（スゴピカ/アクアマーブル/FRP）→ 機能（保温浴槽Ⅱ 標準/酸素美泡湯/オイルヴェール）→ ハンドル・排水栓。' },
    { n: 6, title: '風呂フタ・エプロン', titleZh: '浴缸盖·裙板', note: '風呂フタ（断熱組み 2分割 標準/3分割/巻き/なし）＋フタフック＋エプロン（ピュアWH 等 標準/メタリックシルバー）。' },
    { n: 7, title: '壁', titleZh: '壁面', note: '壁アクセント位置（正面 標準/全面同柄/側面）＋壁柄（B グレード 24 柄/D グレード 4 柄）。' },
    { n: 8, title: '天井・換気', titleZh: '天花板·换气', note: '天井高さ（H2000/H2150/H1900 sオーダー）＋天井（グレイスWH 標準/ブラック）＋換気設備（換気扇/カビシャット/オートルーバー）＋物干しバー＋天井開口。' },
    { n: 9, title: 'ドア', titleZh: '门', note: '2枚折り（標準）／スイング／強化ガラス／片引き／3枚引き／2枚引き込。' },
    { n: 10, title: 'カウンター・水栓・シャワー', titleZh: '台面·水龙头·花洒', note: 'カウンター（なし 標準/スゴピカ/ウェーブ/バイザー等）＋洗い場側水栓＋シャワーヘッド・ホース＋浴槽側水栓。' },
    { n: 11, title: '照明・ミラー・収納', titleZh: '照明·镜子·收纳', note: 'フラットラインLED照明S 標準/調色/サークルLED/ダウンライト＋ミラー＋収納棚・収納テーブル＋スライドバー・フック＋タオル掛け。' },
    { n: 12, title: '裏配管・断熱・窓枠', titleZh: '背管·保温·窗框', note: '裏配管（浴槽下/壁接続×接続方式）＋断熱材（床/壁・天井）＋フリーサイズ窓枠。' },
    { n: 13, title: 'オプション', titleZh: '附加选项', note: 'AV（浴室电视/音响）・浴室内機能（ジェットバスE/防振ゴム）・握りバー・その他（排水管/束石/追焚配管/勾配天井/ドア位置移動）・リフォーム部材。' }
  ];

  /* ---------------- 维度配置（42 分类映射） ---------------- */
  var DIMS = [
    // step 0
    { id: 'plan', step: 0, cat: 'plan', kind: 'radio', codes: 'ALL', titleJa: 'プラン', titleZh: '方案' },
    { id: 'photo_set', step: 0, cat: 'photo_set', kind: 'radio', codes: 'ALL', titleJa: '写真セット', titleZh: '照片套餐' },
    // step 1
    { id: 'door_hand', step: 1, cat: 'door_hand', kind: 'radio', codes: 'ALL', titleJa: 'ドア勝手', titleZh: '门开向' },
    // step 2
    { id: 'install', step: 2, cat: 'install', kind: 'radio', codes: 'ALL', titleJa: '設置階・設置方法', titleZh: '安装楼层·方式' },
    // step 3
    { id: 'bathtub_pan', step: 3, cat: 'bathtub_pan', kind: 'radio', codes: 'ALL', titleJa: '浴槽パン', titleZh: '浴缸底盘' },
    // step 4
    { id: 'floor', step: 4, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床（色柄）', titleZh: '地板' },
    { id: 'floor_heating', step: 4, cat: 'floor_heating', kind: 'radio', codes: 'ALL', titleJa: '床暖房', titleZh: '地暖' },
    // step 5
    { id: 'bathtub_shape', step: 5, cat: 'bathtub_shape', kind: 'radio', codes: 'ALL', titleJa: '浴槽形状', titleZh: '浴缸形状' },
    { id: 'bathtub_material', step: 5, cat: 'bathtub_material', kind: 'radio', codes: 'ALL', titleJa: '浴槽（素材・色柄）', titleZh: '浴缸材质·色纹' },
    { id: 'bathtub_function', step: 5, cat: 'bathtub_function', kind: 'radio', codes: 'ALL', titleJa: '浴槽（機能）', titleZh: '浴缸功能' },
    { id: 'bathtub_handle', step: 5, cat: 'bathtub_handle', kind: 'radio', codes: 'ALL', titleJa: '浴槽ハンドル・排水栓', titleZh: '浴缸扶手·排水栓' },
    // step 6
    { id: 'bath_lid', step: 6, cat: 'bath_lid', kind: 'radio', codes: 'ALL', titleJa: '風呂フタ', titleZh: '浴缸盖' },
    { id: 'bath_lid_hook', step: 6, cat: 'bath_lid_hook', kind: 'radio', codes: 'ALL', titleJa: '風呂フタフック', titleZh: '浴缸盖挂钩' },
    { id: 'bathtub_apron', step: 6, cat: 'bathtub_apron', kind: 'radio', codes: 'ALL', titleJa: '浴槽エプロン', titleZh: '浴缸裙板' },
    // step 7
    { id: 'wall_accent', step: 7, cat: 'wall_accent', kind: 'radio', codes: 'ALL', titleJa: '壁アクセント位置', titleZh: '墙面跳色位置' },
    { id: 'wall_pattern', step: 7, cat: 'wall_pattern', kind: 'radio', codes: 'ALL', titleJa: '壁柄', titleZh: '墙面花纹' },
    // step 8
    { id: 'ceiling_height', step: 8, cat: 'ceiling_height', kind: 'radio', codes: 'ALL', titleJa: '天井高さ', titleZh: '天花高度' },
    { id: 'ceiling', step: 8, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花' },
    { id: 'fan', step: 8, cat: 'fan', kind: 'radio', codes: 'ALL', titleJa: '換気設備', titleZh: '换气设备' },
    { id: 'clothes_bar', step: 8, cat: 'clothes_bar', kind: 'radio', codes: 'ALL', titleJa: '物干しバーセット', titleZh: '晾衣杆' },
    { id: 'ceiling_opening', step: 8, cat: 'ceiling_opening', kind: 'radio', codes: 'ALL', titleJa: '天井開口仕様', titleZh: '天花开口' },
    // step 9
    { id: 'door', step: 9, cat: 'door', kind: 'radio', codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    // step 10
    { id: 'counter', step: 10, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター', titleZh: '台面' },
    { id: 'faucet', step: 10, cat: 'faucet', kind: 'radio', codes: 'ALL', titleJa: '洗い場側水栓', titleZh: '洗浴区水龙头' },
    { id: 'shower_head', step: 10, cat: 'shower_head', kind: 'radio', codes: 'ALL', titleJa: 'シャワーヘッド・ホース', titleZh: '花洒头·软管' },
    { id: 'bathtub_faucet', step: 10, cat: 'bathtub_faucet', kind: 'radio', codes: 'ALL', titleJa: '浴槽側水栓', titleZh: '浴缸侧水龙头' },
    // step 11
    { id: 'lighting', step: 11, cat: 'lighting', kind: 'radio', codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    { id: 'mirror', step: 11, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    { id: 'storage', step: 11, cat: 'storage', kind: 'radio', codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'storage_table', step: 11, cat: 'storage_table', kind: 'radio', codes: 'ALL', titleJa: '収納テーブル', titleZh: '收纳桌' },
    { id: 'shower_hook', step: 11, cat: 'shower_hook', kind: 'radio', codes: 'ALL', titleJa: 'スライドバー・シャワーフック', titleZh: '滑杆·花洒挂钩' },
    { id: 'towel', step: 11, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛け', titleZh: '毛巾杆' },
    // step 12
    { id: 'back_piping', step: 12, cat: 'back_piping', kind: 'radio', codes: 'ALL', titleJa: '裏配管', titleZh: '背侧配管' },
    { id: 'insulation', step: 12, cat: 'insulation', kind: 'radio', codes: 'ALL', titleJa: '断熱材（床）', titleZh: '保温材料（地板）' },
    { id: 'insulation_wall', step: 12, cat: 'insulation_wall', kind: 'radio', codes: 'ALL', titleJa: '断熱材（壁・天井）', titleZh: '保温材料（墙·天花）' },
    { id: 'window_frame', step: 12, cat: 'window_frame', kind: 'radio', codes: 'ALL', titleJa: 'フリーサイズ窓枠', titleZh: '自由尺寸窗框' },
    // step 13
    { id: 'av', step: 13, cat: 'av', kind: 'multi', codes: 'ALL', titleJa: 'AV（浴室テレビ/オーディオ）', titleZh: 'AV（浴室电视/音响）' },
    { id: 'bath_function_opts', step: 13, cat: 'bath_function_opts', kind: 'multi', codes: 'ALL', titleJa: '浴室内機能（ジェット/防振）', titleZh: '浴室内功能' },
    { id: 'grip_bar', step: 13, cat: 'grip_bar', kind: 'multi', codes: 'ALL', titleJa: '握りバー', titleZh: '扶手' },
    { id: 'misc_opts', step: 13, cat: 'misc_opts', kind: 'multi', codes: 'ALL', titleJa: 'その他オプション', titleZh: '其他选项' },
    { id: 'reform', step: 13, cat: 'reform', kind: 'multi', codes: 'ALL', titleJa: 'リフォーム適合部材', titleZh: '改造适用部材' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1616',            // 尺寸 code（默认 1616）
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

  function planCode() {
    var o = selOpt('plan');
    return o ? o.code : 'BASE';
  }
  function sizeCode() { return state.size || '1616'; }

  /** 基本套装价（meta.planPrices[プラン][サイズ]） */
  function basePrice() {
    var pp = DATA.meta.planPrices;
    var v = 0;
    if (pp) {
      var bySize = pp[planCode()];
      if (bySize) v = typeof bySize[sizeCode()] === 'number' ? bySize[sizeCode()] : 0;
    }
    return v;
  }

  /** 尺寸卡片备用价（防御性：24 组合全有价） */
  function sizeAltPrice(code) {
    var pp = DATA.meta.planPrices;
    if (!pp) return null;
    var p = planCode();
    if (pp[p] && typeof pp[p][code] === 'number') {
      return { price: pp[p][code], plan: p };
    }
    var best = null;
    var keys = Object.keys(pp);
    for (var i = 0; i < keys.length; i++) {
      var fp = keys[i];
      if (fp === p) continue;
      var v = pp[fp] && pp[fp][code];
      if (typeof v === 'number' && (!best || v < best.price)) {
        best = { price: v, plan: fp };
      }
    }
    return best;
  }

  function isVirtualBasic(code) { return false; }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    if (dimId === 'photo_set') {
      var o = opt(dimId, code);
      if (!o) return null;
      return P.priceFor(o, planCode(), sizeCode()) != null ? null : null;   // photo_set 参考项不单独计价
    }
    var o = opt(dimId, code);
    if (!o) return null;
    if (o.priceByFaucetGroup) {
      // 裏配管：按水栓グループ（简略，取当前 faucet 匹配或首值）
      var fk = currentFaucetGroup();
      var v = o.priceByFaucetGroup[fk];
      if (v != null) return P.toAmount(v);
    }
    if (o.pricesBySize) {
      var v2 = P.priceBySize(o, sizeCode());
      if (v2 != null) return P.toAmount(v2);
    }
    if (o.priceByType) {
      var tv = P.priceByTypeValue(o, planCode());
      if (tv != null) return P.toAmount(tv);
    }
    if (o.priceDiff != null) return o.priceDiff;
    if (o.price != null) return o.price;
    if (o.isBasic === true) return 0;
    return null;
  }

  /** 裏配管水栓グループ：洗い場側水栓 3 群（スゴピカ/メタル/ライン） */
  function currentFaucetGroup() {
    var f = state.sel.faucet;
    if (f === 'S1' || f === 'S3' || f === 'S4') return 'ライン';
    if (f === 'R1' || f === 'R2') return 'メタル';
    return 'スゴピカ';
  }

  /** 柄グレード：D[A-D] = D 级，其余 B 级 */
  function wallGradeOfPattern(code) {
    return /^D[A-D]$/.test(String(code)) ? 'D' : 'B';
  }
  /** 墙面价格（壁アクセント位置 × 柄グレード 组合矩阵；周囲柄无差价；默认模式 B 正面、未选柄按 B 级 0 价） */
  function wallContribution() {
    var mode = state.sel.wall_accent || 'B';
    var pc = state.sel.wall_pattern;
    if (!pc) return 0;   // 未选柄：默认 B 级（0 价），不报 unknown
    var wa = opt('wall_accent', mode);
    if (!wa || !wa.priceByGrade) return 0;
    var grade = wallGradeOfPattern(pc);
    var v = wa.priceByGrade[grade];
    return typeof v === 'number' ? P.toAmount(v) : 0;
  }

  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'radio': {
        if (dimId === 'wall_accent') return wallContribution();   // 墙价=模式×柄グレード矩阵（默认 B 正面，未选也按柄计价）
        var c = state.sel[dimId];
        if (c == null) return null;
        if (dimId === 'photo_set') return null;   // 照片套餐为参考，不计价
        if (dimId === 'wall_pattern') return 0;   // 柄本身无差价（矩阵已含グレード价），避免重复与 unknown 警告
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
        // 壁アクセント位置未选：按默认 B 正面（标准）描述与计价
        if (dimId === 'wall_accent' && c == null) {
          var oB = opt('wall_accent', 'B');
          if (oB) { out.nameZh = oB.name_zh || 'B'; out.nameJa = oB.name_ja || 'B'; out.code = 'B'; }
          out.diff = contributionFor('wall_accent');
          return out;
        }
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
        // 壁柄：跳色模式（B/C）追加周囲柄名
        if (dimId === 'wall_pattern' && state.sel.wall_accent !== 'A' && state.sel.wall_surround) {
          var sg = state.sel.wall_surround;
          var so = opt('wall_pattern', sg);
          if (so) {
            out.nameZh += '・周囲' + (so.name_zh || sg);
            out.nameJa += '・周囲' + (so.name_ja || sg);
            out.extra = (out.extra ? out.extra + '；' : '') + '跳色（' + (state.sel.wall_accent === 'C' ? '側面' : '正面') + '）';
          }
        }
        if (o.note && /★|受注終了/.test(o.note)) {
          out.extra = (out.extra ? out.extra + '；' : '') + '⚠受注終了予定（2026年10月末）';
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
      nameZh: 'プラン套装 ' + (base ? (base.name_zh || base.code) : sizeCode()) + ' ' + planCode() + 'プラン',
      nameJa: base ? base.name_ja + ' ' + planCode() + 'プラン' : sizeCode(),
      code: sizeCode() + planCode(),
      model: productNo(), extra: '取付・設置費別（不含安装费）',
      diff: 0, base: true
    });
    DIMS.forEach(function (d) {
      if (d.step === 0) return;   // plan 在 base 行体现，photo_set 参考不计价
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
    // 大陆地区价格（人民币含安装费）= 日元税込 × 汇率 × rmbRate(0.65)；无有效汇率时为 null
    var rmbRate = (DATA.meta.rmbRate != null) ? DATA.meta.rmbRate : 0.65;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate * rmbRate) : null;
    return {
      base: base, basePrice: basePriceValue,
      lines: lines, unknown: unknown,
      totalEx: total, tax: tax, totalInc: totalInc,
      rmbAllIn: rmbAllIn,
      size: sizeCode(), plan: planCode()
    };
  }

  /** 本体品番（简略）：BGF{サイズ記号 2-7}{プランコード 1-4} */
  var SIZE_CODE = { '1621': '2', '1818': '3', '1618': '4', '1616': '5', '1316': '6', '1216': '7' };
  var PLAN_CODE = { 'BASE': '1', 'SUGOPIKA_CLEAN': '2', 'MODERN_STYLE': '3', 'MINIMUM_SELECT': '4' };
  function productNo() {
    return 'BGF' + (SIZE_CODE[sizeCode()] || '5') + (PLAN_CODE[planCode()] || '1');
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

  /** 判断某维度某选项是否禁用；返回 reason 字符串或 null。 */
  function disabledReason(dimId, code) {
    var d = dim(dimId);
    if (!d) return null;
    var isVB = isVirtualBasic(code);
    var o = opt(dimId, code);
    if (!o && !isVB) return null;
    var size = sizeCode();

    // ---- 数据 schema 限定 ----
    if (!isVB && o) {
      if (Array.isArray(o.sizes)) {
        var okS = false;
        for (var i = 0; i < o.sizes.length; i++) {
          if (P.sizeKeyMatches(o.sizes[i], size)) { okS = true; break; }
        }
        if (!okS) return '该选项不适用于 ' + size + ' 尺寸';
      }
      if (o.pricesBySize) {
        var v = P.priceBySize(o, size);
        if (v == null) return '该选项不适用于 ' + size + ' 尺寸';
      }
      if (o.priceByType) {
        var tv = P.priceByTypeValue(o, planCode());
        if (tv == null) return '该方案下不可选';
      }
    }
    if (dimId === 'plan') {
      var pp = DATA.meta.planPrices;
      if (pp && pp[code] && pp[code][size] == null) return '该方案无 ' + size + ' 尺寸定价';
    }

    // ---- 浴槽形状×尺寸（pricesBySize null 自动）＋材质联动 ----
    var shape = state.sel.bathtub_shape;
    var reclain = shape === 'B4';
    var b1316 = (size === '1316');
    if (dimId === 'bathtub_material' && (code === 'C1' || code === 'C2' || code === 'C5' || code === 'D1' || code === 'D2')) {
      if (reclain) return 'リクライン浴槽はアクアマーブル/FRP不可';
      if (b1316) return 'アクアマーブル/FRPは1316サイズ不可';
    }
    if (dimId === 'bathtub_shape' && (code === 'B3' || code === 'B4') && (size === '1316' || size === '1216')) {
      return 'エスライン/リクラインは1316/1216サイズ不可';
    }
    if (dimId === 'bathtub_shape' && code === 'B1' && size !== '1621') return 'ワイド浴槽は1621サイズのみ';

    // ---- 浴槽機能 × 保温なし（高断熱仕様不可） ----
    var func = state.sel.bathtub_function;
    if (dimId === 'insulation' && (code === '2' || code === '5') && selIs('bathtub_function', ['B1', 'B2', 'B3'])) {
      return '保温浴槽Ⅱなし時は高断熱仕様選択不可';
    }
    if (dimId === 'bathtub_function' && (code === 'B1' || code === 'B2' || code === 'B3') && selIs('insulation', ['2', '5'])) {
      return '高断熱仕様選択中は保温浴槽Ⅱなし不可';
    }

    // ---- ハンドル：1316/1216 なしのみ ----
    if (dimId === 'bathtub_handle' && (size === '1316' || size === '1216') && code !== '1') {
      return '1316/1216はハンドルなしのみ';
    }

    // ---- 浴槽パン × 保温なし ----
    if (dimId === 'bathtub_pan' && code === '2' && selIs('bathtub_function', ['B1', 'B2', 'B3'])) {
      return '保温浴槽Ⅱなし時は浴槽パンあり（保温Ⅱ）不可';
    }

    // ---- カビシャット系換気：1316/1216 不可 ----
    if (dimId === 'fan' && (size === '1316' || size === '1216') && /^(GA|GB|GC|GD|GL|GM|GN|GP|GJ|FT|GG|GH)$/.test(code)) {
      return 'カビシャット/暖房換気乾燥機は1316/1216サイズ不可';
    }

    // ---- エプロン × カウンター（ウェーブ/ワイドスクエア） ----
    var counter = state.sel.counter;
    if (dimId === 'bathtub_apron' && code === 'A1' && counter && (counter === 'P' || counter === 'Q' || counter === 'R' || counter === 'S' || counter === 'M' || counter === 'U')) {
      return 'ウェーブ/ワイドスクエアカウンター時メタリックシルバー不可';
    }
    if (dimId === 'counter' && selIs('bathtub_apron', 'A1') && (code === 'P' || code === 'Q' || code === 'R' || code === 'S' || code === 'M' || code === 'U')) {
      return 'メタリックシルバーエプロン時ウェーブ/ワイドスクエア不可';
    }

    // ---- 兼用デッキ水栓 × 浴槽側水栓 ----
    if (dimId === 'bathtub_faucet' && selIs('faucet', 'E3')) return '兼用デッキ水栓と浴槽側水栓は同時選択不可';
    if (dimId === 'faucet' && code === 'E3' && selected('bathtub_faucet') && !selIs('bathtub_faucet', 'N')) {
      return '兼用デッキ水栓と浴槽側水栓は同時選択不可';
    }

    // ---- セミワイドミラー × シャワーフック ----
    if (dimId === 'shower_hook' && selIs('mirror', ['B7', 'A7'])) return 'セミワイドミラー時シャワーフック不可';
    if (dimId === 'mirror' && (code === 'B7' || code === 'A7') && selected('shower_hook') && !selIs('shower_hook', '1')) {
      return 'セミワイドミラーとシャワーフックは同時選択不可';
    }

    // ---- サークルLED × スリムハイミラー ----
    if (dimId === 'mirror' && (code === 'B4' || code === 'A4') && selIs('lighting', ['A1', 'A2'])) {
      return 'サークルLEDとスリムハイミラーは同時選択不可';
    }
    if (dimId === 'lighting' && (code === 'A1' || code === 'A2') && selIs('mirror', ['B4', 'A4'])) {
      return 'サークルLEDとスリムハイミラーは同時選択不可';
    }

    // ---- 床暖房スイッチ = 床暖房選択時のみ ----
    if (dimId === 'misc_opts' && /床暖房用スイッチ/.test(String(code)) && !selIs('floor_heating', '2')) {
      return '床暖房用スイッチは床暖房選択時のみ';
    }

    // ---- ジェットバスE × リクライン ----
    if (dimId === 'bath_function_opts' && reclain && /ジェットバスE/.test(String(code))) {
      return 'ジェットバスEとリクライン浴槽は同時選択不可';
    }

    // ---- 防振ゴム × 架台設置 ----
    if (dimId === 'bath_function_opts' && /防振ゴム/.test(String(code)) && selIs('install', 'SBFL4')) {
      return '防振ゴムと架台設置は同時選択不可';
    }
    if (dimId === 'install' && code === 'SBFL4' && multiHas('bath_function_opts', codesOf(dim('bath_function_opts')).filter(function (c) { return /防振ゴム/.test(c); }))) {
      return '防振ゴムと架台設置は同時選択不可';
    }

    // ---- 壁柄 D グレード：DA/DB アクセントのみ（壁アクセント位置 B=正面アクセント時のみ） ----
    if (dimId === 'wall_pattern' && (code === 'DA' || code === 'DB') && selIs('wall_accent', 'A')) {
      return 'ツイルネイビー/ボルドー柄はアクセントパネルのみ（全面同柄不可）';
    }

    // ---- 全幅開口用窓枠 1818 不可 ----
    if (dimId === 'window_frame' && /全幅開口/.test(String(o ? (o.name_ja || '') : '')) && size === '1818') {
      return '全幅開口用窓枠は1818サイズ不可';
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    // 壁アクセント位置切换：A 全面同柄时清周囲柄（无周囲）
    if (dimId === 'wall_accent' && code === 'A') delete state.sel.wall_surround;
    // 浴槽形状切换：不適配材质回退
    if (dimId === 'bathtub_shape' && code === 'B4') {
      var m = state.sel.bathtub_material;
      if (m && (m === 'C1' || m === 'C2' || m === 'C5' || m === 'D1' || m === 'D2')) state.sel.bathtub_material = 'A1';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复プラン（矩阵无价时 fallback） */
  function setSize(code) {
    state.size = code;
    var pp = DATA.meta.planPrices;
    if (pp && pp[planCode()] && pp[planCode()][code] == null) {
      var order = ['BASE', 'SUGOPIKA_CLEAN', 'MODERN_STYLE', 'MINIMUM_SELECT'];
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
      ['サイズ', r.size], ['プラン', r.plan],
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
  window.OFLORA = window.OFLORA || {};
  window.OFLORA.quote = {
    init: function (data) { DATA = data; P = window.OFLORA.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    planCode: planCode, sizeCode: sizeCode, basePrice: basePrice,
    sizeAltPrice: sizeAltPrice, currentFaucetGroup: currentFaucetGroup,
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
