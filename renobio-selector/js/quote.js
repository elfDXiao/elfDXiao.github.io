/**
 * quote.js — LIXIL Renobio Fit（リノビオフィット）选型报价系统：维度配置 + 状态 + 计价引擎 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.RENOBIO.quote。
 * 依赖：window.RENOBIO_DATA（products.js，由 renobio-data.json 生成）、window.RENOBIO.price
 *
 * 计价模型（全部手册价为税抜き・取付費別途）：
 *   本体価格（税抜）= 標準仕様価格（meta.typeBasePrices[タイプ][サイズ]）＋Σ选项差价（寒冷地 +¥5,000）
 *   税込 = 本体 × 1.10（消費税10%，四舍五入到日元）
 *   人民币含安装价 = 税込 × 汇率 × meta.rmbRate（0.8）—— 系数仅在计算代码中，页面不显示算式
 *   写真セット価格 = 標準仕様価格 + オプション合計価格（photo_set 维度参考）
 *
 * 壁パネル两段式：wall（0 全面張り／1 アクセントB面／2 アクセントC面）→ wall_pattern（花纹 13 柄）
 *   - 全面張り：花纹 LE301（マットホワイト）= 標準（0）、其他可全面張り柄 = +¥70,000；fullWallCode=null 的柄不可
 *   - アクセント：ベース（HN301/HN986 ハイクラス = +¥70,000／LE301 ベーシック = +¥10,000）× 花纹组合（accentCodeByBase）
 *   花纹选择存 state.sub.wall_pattern，ベース选择存 state.sub.wall_base（仅アクセント）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  /* ---------------- 步骤元数据（15 步：0-14，参考手册 Select Guide 顺序） ---------------- */
  var STEPS = [
    { n: 0, title: 'サイズ・タイプ・地域', titleZh: '尺寸·型号·地域', note: '选择尺寸（4 種内寸）与型号（N/T/C/B）＋地域区分（一般/寒冷地＋¥5,000），決定標準仕様価格（タイプ×サイズ矩阵）。照片组合套餐（6 プラン）参考。' },
    { n: 1, title: 'ドア位置', titleZh: '门位置', note: 'ドア位置（RL/LR/RC/LC 標準／RLS/LRS/RCS/LCS 100mm移動 ＋¥9,000）。' },
    { n: 2, title: '床', titleZh: '地板', note: '岩肌調 単色（ホワイト/N86 標準・ベージュ/Y71・グレー/U61 ±¥0）。エプロンは床と同色。' },
    { n: 3, title: '壁パネル', titleZh: '壁面', note: '全面張り（マットホワイト標準／他柄 ＋¥70,000）／アクセント張り B面・C面（ベース ベーシック ＋¥10,000・ハイクラス ＋¥70,000）→ 花纹 13 柄。' },
    { n: 4, title: '浴槽', titleZh: '浴缸', note: 'ラウンド形状 FRP 浴槽（ホワイト/NW1 標準・ベージュ/Y71・ピンク/P91 ±¥0）＋排水栓・浴槽内握りバー（1014 ―）。' },
    { n: 5, title: 'フロフタ・フック', titleZh: '浴缸盖·挂钩', note: '巻フタ 標準／組フタ（C/B ―）／フロフタなし（−¥8,000、1014 −¥7,500）＋フロフタフック 7 種。' },
    { n: 6, title: '天井・換気', titleZh: '天花板·换气', note: '内組平天井（壁高 2000/1900）＋換気設備（グリル/換気扇/換気乾燥暖房機）＋ランドリーパイプ。' },
    { n: 7, title: 'ドア', titleZh: '门', note: '折り戸（11/50mm 段差・800/700/600W・2000/1900/1800H）／フィラー付（1216/1116）／2枚引き戸（1216）／開き戸 キレイドア。' },
    { n: 8, title: '水栓', titleZh: '水龙头', note: '洗い場側（N=QM 吐水90・T/C=SP 兼用250・B=SS 兼用170）＋浴槽側（N のみ BS/BU 選択可）＋取付脚断熱カバー。' },
    { n: 9, title: 'シャワー', titleZh: '花洒', note: 'シャワーヘッド（N=ファインバブル エコアクアPlus／T/C/B=エコフル）＋シャワーフック・スライドフック付握りバー。' },
    { n: 10, title: 'カウンター・照明', titleZh: '台面·照明', note: 'とるピカスリムカウンター（N/T のみ・700W/600W）＋アクリル化粧棚（B のみ）＋照明 6 種＋丸形洗面器（B）。' },
    { n: 11, title: 'ミラー', titleZh: '镜子', note: 'タテ長/ミラー/ワイド/大型/マグネットミラー 8 種＋キレイ鏡。C タイプ標準はミラーなし。' },
    { n: 12, title: '収納・タオル', titleZh: '收纳·毛巾', note: '収納棚 180W（クリア/ホワイト・2/3段）＋マグネットシェルフ＋タオル掛。C タイプ標準は収納棚なし。' },
    { n: 13, title: '床高・配管・追いだき', titleZh: '地面·配管·追焚', note: '床高さ（190/230mm ＋¥2,000）＋ボルト脚用接着剤＋給水給湯配管（A/B/J/P）＋追いだき加工 6 種。' },
    { n: 14, title: 'オプション', titleZh: '附加选项', note: '追加マグネットアイテム（禁則なし）・握りバー・フリーサイズドア額縁・窓額縁キット・梁対応・天井点検口移動・工場壁穴加工。' }
  ];

  /* ---------------- 维度配置（40 分类映射） ---------------- */
  var DIMS = [
    // step 0
    { id: 'type', step: 0, cat: 'type', kind: 'radio', codes: ['N', 'T', 'C', 'B'], titleJa: 'タイプ', titleZh: '型号' },
    { id: 'region', step: 0, cat: 'region', kind: 'radio',
      basic: { code: 'REGION_H', nameJa: '一般地仕様（H）', nameZh: '一般地区（H）' },
      codes: ['C'], titleJa: '地域区分', titleZh: '地域' },
    { id: 'photo_set', step: 0, cat: 'photo_set', kind: 'radio', codes: 'ALL', titleJa: '写真セット（セットプラン）', titleZh: '照片组合套餐' },
    // step 1
    { id: 'door_position', step: 1, cat: 'door_position', kind: 'radio', codes: 'ALL', titleJa: 'ドア位置', titleZh: '门位置' },
    // step 2
    { id: 'floor', step: 2, cat: 'floor', kind: 'radio', codes: 'ALL', titleJa: '床（岩肌調 単色）', titleZh: '地板' },
    // step 3
    { id: 'wall', step: 3, cat: 'wall', kind: 'radio', codes: 'ALL', titleJa: '壁パネル', titleZh: '壁面' },
    // step 4
    { id: 'bathtub', step: 4, cat: 'bathtub', kind: 'radio', codes: 'ALL', titleJa: '浴槽カラー（FRP）', titleZh: '浴缸色' },
    { id: 'bathtub_drain', step: 4, cat: 'bathtub_drain', kind: 'radio', codes: 'ALL', titleJa: '浴槽排水栓', titleZh: '浴缸排水栓' },
    { id: 'bathtub_bar', step: 4, cat: 'bathtub_bar', kind: 'radio', codes: 'ALL', titleJa: '浴槽内握りバー', titleZh: '浴缸内扶手' },
    // step 5
    { id: 'bathtub_lid', step: 5, cat: 'bathtub_lid', kind: 'radio', codes: 'ALL', titleJa: 'フロフタ', titleZh: '浴缸盖' },
    { id: 'bath_lid_hook', step: 5, cat: 'bath_lid_hook', kind: 'radio', codes: 'ALL', titleJa: 'フロフタフック', titleZh: '浴缸盖挂钩' },
    // step 6
    { id: 'ceiling', step: 6, cat: 'ceiling', kind: 'radio', codes: 'ALL', titleJa: '天井', titleZh: '天花板' },
    { id: 'fan', step: 6, cat: 'fan', kind: 'radio', codes: 'ALL', titleJa: '換気設備', titleZh: '换气设备' },
    { id: 'laundry_pipe', step: 6, cat: 'laundry_pipe', kind: 'radio', none: true, codes: 'ALL', titleJa: 'ランドリーパイプ', titleZh: '晾衣管' },
    // step 7
    { id: 'door', step: 7, cat: 'door', kind: 'radio', codes: 'ALL', titleJa: 'ドア', titleZh: '门' },
    { id: 'door_towel_bar', step: 7, cat: 'door_towel_bar', kind: 'radio', none: true, codes: 'ALL', titleJa: 'ドア外タオル掛', titleZh: '门外毛巾架' },
    // step 8
    { id: 'faucet', step: 8, cat: 'faucet', kind: 'radio', codes: 'ALL', titleJa: '水栓（洗い場側・浴槽側）', titleZh: '水龙头' },
    { id: 'faucet_cover', step: 8, cat: 'faucet_cover', kind: 'multi', codes: 'ALL', titleJa: '取付脚断熱カバー', titleZh: '安装脚隔热罩' },
    // step 9
    { id: 'shower_head', step: 9, cat: 'shower_head', kind: 'radio', codes: 'ALL', titleJa: 'シャワーヘッド', titleZh: '花洒头' },
    { id: 'shower_hook', step: 9, cat: 'shower_hook', kind: 'radio', codes: 'ALL', titleJa: 'シャワーフック・握りバー', titleZh: '花洒挂钩·扶手' },
    // step 10
    { id: 'counter', step: 10, cat: 'counter', kind: 'radio', codes: 'ALL', titleJa: 'カウンター（N/T のみ）', titleZh: '台面' },
    { id: 'vanity_shelf', step: 10, cat: 'vanity_shelf', kind: 'radio', none: true, codes: 'ALL', titleJa: 'アクリル化粧棚（B のみ）', titleZh: '化妆架' },
    { id: 'lighting', step: 10, cat: 'lighting', kind: 'radio', codes: 'ALL', titleJa: '照明', titleZh: '照明' },
    { id: 'washbasin', step: 10, cat: 'washbasin', kind: 'radio', codes: 'ALL', titleJa: '丸形洗面器（B のみ）', titleZh: '洗面盆' },
    // step 11
    { id: 'mirror', step: 11, cat: 'mirror', kind: 'radio', codes: 'ALL', titleJa: 'ミラー', titleZh: '镜子' },
    { id: 'kirei_mirror', step: 11, cat: 'kirei_mirror', kind: 'radio', codes: 'ALL', titleJa: 'キレイ鏡', titleZh: '洁净镜' },
    // step 12
    { id: 'storage', step: 12, cat: 'storage', kind: 'radio', codes: 'ALL', titleJa: '収納棚', titleZh: '收纳架' },
    { id: 'towel', step: 12, cat: 'towel', kind: 'radio', codes: 'ALL', titleJa: 'タオル掛', titleZh: '毛巾架' },
    // step 13
    { id: 'floor_height', step: 13, cat: 'floor_height', kind: 'radio', codes: 'ALL', titleJa: '床高さ', titleZh: '地面高度' },
    { id: 'bolt_adhesive', step: 13, cat: 'bolt_adhesive', kind: 'radio', codes: 'ALL', titleJa: 'ボルト脚用接着剤', titleZh: '地脚螺栓粘着剂' },
    { id: 'supply_piping', step: 13, cat: 'supply_piping', kind: 'radio', codes: 'ALL', titleJa: '給水給湯配管', titleZh: '给水给汤配管' },
    { id: 'oidaki', step: 13, cat: 'oidaki', kind: 'radio', none: true, codes: 'ALL', titleJa: '追いだき加工', titleZh: '追焚加工' },
    // step 14
    { id: 'magnet_items', step: 14, cat: 'magnet_items', kind: 'multi', codes: 'ALL', titleJa: '追加マグネットアイテム', titleZh: '追加磁吸配件' },
    { id: 'grip_bar', step: 14, cat: 'grip_bar', kind: 'multi', codes: 'ALL', titleJa: '握りバー（後付補強金具・Lパネル用）', titleZh: '扶手' },
    { id: 'door_frame', step: 14, cat: 'door_frame', kind: 'radio', none: true, codes: 'ALL', titleJa: 'フリーサイズドア額縁・化粧枠', titleZh: '自由尺寸门框' },
    { id: 'window_frame', step: 14, cat: 'window_frame', kind: 'multi', codes: 'ALL', titleJa: 'フリーサイズ窓額縁・既設窓', titleZh: '自由尺寸窗框' },
    { id: 'beam_panel', step: 14, cat: 'beam_panel', kind: 'multi', codes: 'ALL', titleJa: '梁対応（工場梁型加工・梁パネルキット）', titleZh: '梁处理' },
    { id: 'misc_options', step: 14, cat: 'misc_options', kind: 'multi', codes: 'ALL', titleJa: 'その他オプション', titleZh: '其他选项' }
  ];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    size: '1216',            // 尺寸 code（默认 1216）
    sel: {},                 // { dimId: option code }   radio 维度
    multi: {},               // { dimId: { code: true } }  multi 维度
    sub: {},                 // { wall_pattern: 花纹 code, wall_base: ベース code }  壁パネル第二段
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
    return o ? o.code : ((DATA.meta.basePlan && DATA.meta.basePlan.type) || 'N');
  }
  function sizeCode() { return state.size || '1216'; }
  function doorPosCode() {
    var c = state.sel.door_position;
    return c ? c : 'RL';
  }
  function typeGroup() { return P.typeGroupOf(typeCode()); }

  /** 壁パネル花纹数据 */
  function wallPatterns() { return (cat('wall_pattern') && cat('wall_pattern').options) || []; }
  function wallPattern(code) {
    return wallPatterns().find(function (p) { return String(p.code) === String(code); }) || null;
  }
  /** 当前 wall 模式：'0' 全面張り / '1' '2' アクセント B/C 面；未选返回 null */
  function wallMode() {
    var w = state.sel.wall;
    return w == null ? null : String(w);
  }
  /** 壁パネルベース（四面墙板色）公共表（meta.wallBases，wizard 渲染/quote 缺省读取） */
  function wallBases() {
    return (DATA.meta && DATA.meta.wallBases) || [
      { code: 'LE301', name_ja: 'マットホワイト', name_zh: '哑光白', cls: 'basic', priceDiff: 10000 }
    ];
  }
  /** 当前ベース（アクセント時；默认 = 数据表 default 标记或第一个） */
  function wallBase() {
    if (state.sub.wall_base) return state.sub.wall_base;
    var bs = wallBases();
    var def = null;
    for (var i = 0; i < bs.length; i++) { if (bs[i].default) { def = bs[i].code; break; } }
    return def || (bs.length ? bs[0].code : 'LE301');
  }

  /** 壁パネル贡献（wall 选项价 + 花纹差价） */
  function wallContribution() {
    var w = wallMode();
    if (w == null) return null;
    var pc = state.sub.wall_pattern;
    if (w === '0') {
      if (!pc) return 0;                       // 未指定花纹 = 默认マットホワイト（標準）
      var pat = wallPattern(pc);
      if (!pat) return null;
      if (!pat.fullWallCode) return null;      // 全面張り不可
      return pat.code === 'LE301' ? 0 : 70000;
    }
    // アクセント（B面/C面）
    var base = wallBase();
    if (!pc) return null;                      // 需选花纹
    var p2 = wallPattern(pc);
    if (!p2 || !p2.accentCodeByBase) return null;
    var combo = p2.accentCodeByBase[base];
    if (!combo || combo === 'fullwall') return null;
    return base === 'LE301' ? 10000 : 70000;
  }

  /** 花纹品番（注文コード）：全面 → fullWallCode；アクセント → accentCodeByBase[base] */
  function wallPatternPartNo(code) {
    var pat = wallPattern(code);
    if (!pat) return '';
    var w = wallMode();
    if (w === '0') return pat.fullWallCode || '';
    if (w === '1' || w === '2') {
      var base = wallBase();
      var combo = pat.accentCodeByBase && pat.accentCodeByBase[base];
      return (combo && combo !== 'fullwall') ? combo : '';
    }
    return '';
  }

  /** 花纹禁用原因（wall_pattern 第二段 chips） */
  function wallPatternDisabled(code) {
    var pat = wallPattern(code);
    if (!pat) return '花纹不存在';
    var w = wallMode();
    if (w === '0') {
      if (!pat.fullWallCode) return '该花纹不支持全面張り（仅アクセント）';
      return null;
    }
    if (w === '1' || w === '2') {
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
    var pat = wallPattern(code);
    if (!pat) return null;
    var w = wallMode();
    if (w === '0') {
      if (!pat.fullWallCode) return null;
      return pat.code === 'LE301' ? 0 : 70000;
    }
    if (w === '1' || w === '2') {
      var base = wallBase();
      var combo = pat.accentCodeByBase && pat.accentCodeByBase[base];
      if (!combo || combo === 'fullwall') return null;
      return base === 'LE301' ? 10000 : 70000;
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
    // 寒冷地（region=C）標準 ＋¥5,000
    if (selIs('region', 'C')) v += 5000;
    return v;
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
    return code === 'REGION_H';
  }
  function virtualBasicOf(d) { return d.basic ? d.basic : null; }

  /* ---------------- 计价 ---------------- */

  function radioContribution(dimId, code) {
    if (isVirtualBasic(code)) return 0;
    if (dimId === 'wall') return wallContribution();
    if (dimId === 'photo_set') {
      var o = opt(dimId, code);
      if (!o || !o.photoSetPriceBySize) return null;
      var ps = o.photoSetPriceBySize[sizeCode()];
      if (typeof ps !== 'number') return null;
      return ps - basePrice();                 // 套装价 − 标准规格价 = 套餐差额
    }
    if (dimId === 'door_towel_bar') {
      // 门外毛巾架：价格按当前门宽（door 选项名 800W/700W/600W）
      var o2 = opt(dimId, code);
      if (!o2 || !o2.pricesByDoorWidth) return null;
      var dw = currentDoorWidth();
      if (dw == null) return null;
      var v = o2.pricesByDoorWidth[dw];
      return typeof v === 'number' ? v : null;
    }
    var o = opt(dimId, code);
    if (!o) return null;
    if (o.priceByType) {
      var tv = P.priceByTypeValue(o, typeCode());
      if (tv != null) return P.toAmount(tv);
      return null;
    }
    return P.priceFor(o, typeCode(), sizeCode());
  }

  /** 当前门宽（door 选项名 800W/700W/600W → '800'/'700'/'600'） */
  function currentDoorWidth() {
    var o = selOpt('door');
    if (!o) return null;
    var m = String(o.name_ja || '').match(/(\d{3})W/);
    return m ? m[1] : null;
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
        // 壁パネル：附加花纹名与注文コード
        if (dimId === 'wall') {
          var pc = state.sub.wall_pattern;
          if (pc) {
            var pat = wallPattern(pc);
            if (pat) {
              out.nameZh += '・' + (pat.name_zh || pat.code);
              out.nameJa += '・' + (pat.name_ja || pat.code);
              out.model = wallPatternPartNo(pc);
              if (wallMode() !== '0') {
                var baseName = pat.accentCodeByBase && pat.accentCodeByBase[wallBase()] ? 'ベース' + wallBase() : '';
                out.extra = baseName;
              }
            }
          }
        }
        // 写真セット：显示套装价
        if (dimId === 'photo_set' && o.photoSetPriceBySize) {
          var ps = o.photoSetPriceBySize[sizeCode()];
          if (typeof ps === 'number') out.extra = '写真セット価格 ' + P.yen(ps);
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

  /** 本体品番：BKS/BLKS-サイズLBタイプ-B+H(C)ドア位置（Bタイプ=BLKS 洗面器付き） */
  function productNo() {
    var t = typeCode();
    var prefix = t === 'B' ? 'BLKS' : 'BKS';
    return prefix + '-' + sizeCode() + 'LB' + t + '-B+H(C)' + doorPosCode();
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
  /** beam_panel 中 B面（器具面）类是否已选 */
  function beamBSelected() {
    var m = state.multi.beam_panel || {};
    return Object.keys(m).some(function (c) {
      return /^C(0[3-9]|1[01])$/.test(c) && m[c];
    });
  }
  /** beam_panel 中 C面（浴槽面）类是否已选 */
  function beamCSelected() {
    var m = state.multi.beam_panel || {};
    return Object.keys(m).some(function (c) {
      return /^C1[2-9]|^C20$/.test(c) && m[c];
    });
  }
  function beamKitSelected() { return multiHas('beam_panel', ['S79', 'S80']); }
  /** 窗框全面開口类是否已选 */
  function fullOpenSelected() {
    var m = state.multi.window_frame || {};
    return Object.keys(m).some(function (c) {
      return m[c] && /全面開口|^F(75|76|77|78|49|50|51|20|21|57)$/.test(String(opt('window_frame', c) ? (opt('window_frame', c).name_ja || '') : c));
    });
  }
  /** storage 是否已选非「なし」选项 */
  function storageSelected() {
    var c = state.sel.storage;
    return c != null && c !== 'NN';
  }
  /** misc 是否已选配管架台/防振/根太受け */
  function miscLegSelected() {
    return multiHas('misc_options', ['S12', 'S31', 'S13', 'S14']);
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
        var tv = P.priceByTypeValue(o, type);
        if (tv == null) return '该タイプ/条件下不可选';
      }
    }
    if (dimId === 'type') {
      var tbp = DATA.meta.typeBasePrices;
      if (tbp && tbp[code] && tbp[code][size] == null) return '该タイプ无 ' + size + ' 尺寸定价';
    }

    // ---- 壁パネル（wall） ----
    if (dimId === 'wall' && code === '0') {
      // 全面張り：始终可选（花纹层控制）；无额外禁用
    }
    // ---- 写真セット：所有尺寸均有价，不禁 ----

    // ---- タイプ別 禁则（C/B カウンター不可、B のみ化粧棚/洗面器） ----
    if (dimId === 'counter' && typeIs(['C', 'B'])) return 'C・Bタイプではカウンター選択不可';
    if (dimId === 'vanity_shelf' && !typeIs('B')) return 'アクリル化粧棚はBタイプのみ選択可';
    if (dimId === 'washbasin' && !typeIs('B')) return '丸形洗面器はBタイプのみ選択可';
    // 浴槽側水栓（BS/BU）N タイプのみ → priceByType null 自动禁用（已覆盖）

    // ---- 浴槽〈ピンク〉× 床〈グレー〉 ----
    if (dimId === 'bathtub' && code === 'D' && selIs('floor', '4A')) return '浴槽〈ピンク〉と床〈グレー〉は同時選択不可';
    if (dimId === 'floor' && code === '4A' && selIs('bathtub', 'D')) return '浴槽〈ピンク〉と床〈グレー〉は同時選択不可';

    // ---- 壁高1900（E9/K9）相关 ----
    var wallH1900 = selIs('ceiling', ['E9', 'K9']);
    if (wallH1900 && dimId === 'door' && o && /2000H/.test(String(o.name_ja || ''))) {
      return '壁高1900と2000Hドアは同時選択不可';
    }
    if (wallH1900 && dimId === 'shower_hook' && (code === 'GB' || code === 'JB')) {
      return '壁高1900とスライドフック付握りバー(1000L)は同時選択不可';
    }

    // ---- ワイドミラー/大型ミラー 相关 ----
    var wideMirror = selIs('mirror', 'CA');
    var bigMirror = selIs('mirror', 'CD');
    if (dimId === 'shower_hook' && (code === 'BA' || code === 'KA' || code === 'PA' || code === 'QA' || code === 'RA') && wideMirror) {
      return 'ワイドミラーとシャワーフック(2個)は同時選択不可';
    }
    if (dimId === 'vanity_shelf' && code === 'A23' && (wideMirror || bigMirror)) {
      return 'ワイドミラー/大型ミラーと化粧棚400Wは同時選択不可';
    }
    if (dimId === 'storage' && bigMirror && code !== 'NN') return '大型ミラーと各種収納棚/マグネットシェルフは同時選択不可';
    if (dimId === 'magnet_items' && bigMirror) return '大型ミラーと各種収納棚/マグネットシェルフは同時選択不可';
    if (dimId === 'mirror' && code === 'CD' && (storageSelected() || multiHas('magnet_items', codesOf(dim('magnet_items'))))) {
      // 大型ミラー × 収納棚/マグネットシェルフ
      if (storageSelected()) return '大型ミラーと各種収納棚は同時選択不可';
    }
    if (dimId === 'mirror' && code === 'CA' && typeIs('B') && (storageSelected() || multiHas('magnet_items', ['A72', 'A73', 'A74']))) {
      if (storageSelected()) return 'Bタイプ：ワイドミラーと各種収納棚は同時選択不可';
    }
    if (dimId === 'mirror' && code === 'CA' && typeIs('B') && wallH1900) {
      return 'Bタイプ：ワイドミラーと壁高1900は同時選択不可';
    }
    if (dimId === 'shower_hook' && (code === 'GC' || code === 'JC') && typeIs('B') && wideMirror) {
      return 'Bタイプ：ワイドミラーとスライドフック付握りバー(800L)は同時選択不可';
    }

    // ---- 化粧棚790W × 収納棚/マグネットシェルフ ----
    if (dimId === 'vanity_shelf' && code === 'A42' && (storageSelected() || multiHas('magnet_items', codesOf(dim('magnet_items'))))) {
      if (storageSelected()) return '化粧棚790Wと各種収納棚は同時選択不可';
      if (multiHas('magnet_items', codesOf(dim('magnet_items')))) return '化粧棚790Wとマグネットシェルフは同時選択不可';
    }
    if (dimId === 'storage' && selIs('vanity_shelf', 'A42') && code !== 'NN') return '化粧棚790Wと各種収納棚は同時選択不可';
    if (dimId === 'magnet_items' && selIs('vanity_shelf', 'A42')) return '化粧棚790Wとマグネットシェルフは同時選択不可';

    // ---- ボルト脚用接着剤(速乾) × 配管架台/防振/根太受け ----
    if (dimId === 'misc_options' && (code === 'S12' || code === 'S31' || code === 'S13' || code === 'S14') && selIs('bolt_adhesive', 'S42')) {
      return 'ボルト脚用接着剤(速乾タイプ)とは同時選択不可';
    }
    if (dimId === 'bolt_adhesive' && code === 'S42' && miscLegSelected()) {
      return '配管避けボルト脚架台/防振ゴム/根太受けプレートとは同時選択不可';
    }

    // ---- 梁対応（beam_panel） ----
    if (dimId === 'beam_panel') {
      var isB = /^C(0[3-9]|1[01])$/.test(code);
      var isC = /^C1[2-9]|^C20$/.test(code);
      if (isB && beamCSelected()) return '梁型パネルB面とC面は同時選択不可';
      if (isC && beamBSelected()) return '梁型パネルB面とC面は同時選択不可';
      if (code === 'S79' && (multiHas('beam_panel', 'S80') || beamBSelected())) return '梁パネルキットC面とB面用は同時選択不可';
      if (code === 'S80' && (multiHas('beam_panel', 'S79') || beamCSelected())) return '梁パネルキットB面とC面用は同時選択不可';
      // B面用 × ダウンライト/パネルダウンライト
      var dlSelected = selIs('lighting', ['GP', 'EC', 'EH']);
      if ((isB || code === 'S80') && dlSelected) return '梁B面用とダウンライト/パネルダウンライトは同時選択不可';
      if (dimId === 'lighting' && (code === 'GP' || code === 'EC' || code === 'EH') && (beamBSelected() || multiHas('beam_panel', 'S80'))) {
        return '梁B面用とダウンライト/パネルダウンライトは同時選択不可';
      }
      // 1014：C面用 × 3室換気/換気乾燥暖房機(3室)
      if (isC && size === '1014' && selIs('fan', ['E', 'G'])) return '1014サイズ：C面用と3室換気は同時選択不可';
      if (isC && size === '1014' && dimId === 'fan' && (code === 'E' || code === 'G') && beamCSelected()) return '1014サイズ：C面用と3室換気は同時選択不可';
      // Bタイプ B面 × ワイドミラー
      if ((isB || code === 'S80') && typeIs('B') && wideMirror) return 'Bタイプ：B面用とワイドミラーは同時選択不可';
      // 天井点検口移動 × 梁パネルキット
      if (code === 'S79' || code === 'S80') {
        if (multiHas('misc_options', 'IC01')) return '天井点検口移動と梁パネルキットは同時選択不可';
      }
    }
    if (dimId === 'misc_options' && code === 'IC01' && beamKitSelected()) {
      return '天井点検口移動と梁パネルキットは同時選択不可';
    }

    // ---- 窓（window_frame） ----
    var fullOpen = /全面開口/.test(String(o ? (o.name_ja || '') : ''));
    if (dimId === 'window_frame' && fullOpen && size === '1014') return '1014サイズは全面開口選択不可';
    if (dimId === 'window_frame' && fullOpen && selIs('bath_lid_hook', 'B')) return '全面開口と巻フタフックは同時選択不可';
    if (dimId === 'bath_lid_hook' && code === 'B' && fullOpenSelected()) return '全面開口と巻フタフックは同時選択不可';

    // ---- 2枚引き戸 × ドア額縁/化粧下枠 ----
    if (dimId === 'door_frame' && selIs('door', 'F1')) return '2枚引き戸とフリーサイズドア額縁は同時選択不可';
    if (dimId === 'door' && code === 'F1' && (selected('door_frame') || selIs('door_frame', ['S96', 'S97']))) {
      if (selected('door_frame')) return '2枚引き戸とフリーサイズドア額縁は同時選択不可';
    }

    // ---- 工場壁穴加工（WH1/WH2） × ダウンライト/梁 ----
    if (dimId === 'misc_options' && (code === 'WH1' || code === 'WH2')) {
      if (selIs('lighting', ['GP', 'EC', 'EH'])) return 'ダウンライト/パネルダウンライトとは同時選択不可';
      if (beamBSelected() || beamKitSelected()) return '工場梁型加工/梁パネルキットとは同時選択不可';
    }

    if (isVB) return null;
    return null;
  }

  /** 选中某维度选项后的自动修复 */
  function autoFix(dimId, code) {
    // 壁パネル选择：清理不相容的副选择（如从アクセント切回全面張り时保留花纹，由 wallPatternDisabled 控制）
    if (dimId === 'wall' && code === '0') {
      // 保留花纹；若当前花纹不可全面張り则清空
      var pc = state.sub.wall_pattern;
      if (pc && wallPatternDisabled(pc)) delete state.sub.wall_pattern;
    }
    if (dimId === 'mirror' && code === 'CA' && selIs('shower_hook', ['BA', 'KA', 'PA', 'QA', 'RA'])) {
      // ワイドミラー 时自动切シャワーフック → 滑钩（1個系）
      if (selIs('shower_hook', 'KA')) state.sel.shower_hook = 'GB';
    }
  }

  /** 尺寸切换（wizard 调用）：自动修复タイプ（矩阵无价时 fallback） */
  function setSize(code) {
    state.size = code;
    var tbp = DATA.meta.typeBasePrices;
    if (tbp && tbp[typeCode()] && tbp[typeCode()][code] == null) {
      var order = ['N', 'T', 'C', 'B'];
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
  window.RENOBIO = window.RENOBIO || {};
  window.RENOBIO.quote = {
    init: function (data) { DATA = data; P = window.RENOBIO.price; },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, dim: dim, opt: opt, selOpt: selOpt,
    codesOf: codesOf, catOpts: catOpts,
    virtualBasicOf: virtualBasicOf, isVirtualBasic: isVirtualBasic,
    typeCode: typeCode, sizeCode: sizeCode, typeGroup: typeGroup, basePrice: basePrice,
    doorPosCode: doorPosCode, sizeAltPrice: sizeAltPrice,
    wallPatterns: wallPatterns, wallPattern: wallPattern, wallBases: wallBases, wallMode: wallMode, wallBase: wallBase,
    wallContribution: wallContribution, wallPatternPartNo: wallPatternPartNo,
    wallPatternDisabled: wallPatternDisabled, wallBaseDisabled: wallBaseDisabled, wallPatternPrice: wallPatternPrice,
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
