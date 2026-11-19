/* 厨房选型系统数据（由 data/products.json 生成：window.KITCHEN_DATA）
 * 源: 厨房选型系统/data/products.json（2026.10 価格改定版 188p 全量 + 不选选项）
 * 价格符号：＋(U+FF0B)=加价 －(U+FF0D)=减价；UTF-8 无 BOM；width=cm 字符串。
 */
window.KITCHEN_DATA = {
 "meta": {
  "source": "クリナップ Cleanup STEDIA（ステディア）システムキッチン プランニングガイド 2026.10 価格改定版（0259_stediaca.pdf，188 頁）",
  "brand": "クリナップ Cleanup",
  "product": "システムキッチン（系统厨房）",
  "series": "ステディア（Stedia）",
  "currency": "JPY",
  "taxRate": 0.1,
  "priceNote": "表示価格は税抜き価格です（不含税）。＋=加价、－=减价（相对所选パッケージプラン的基本仕様）。",
  "quoteNote": "取付·設置費は別途。税込=税抜×1.10（四舍五入）；人民币价格为纯物料价格（不含安装/工事费）。",
  "method": "2026.05 版数据 + 2026.10 価格改定版坐标级 PDF 表格解析（tab.py/remap.py）逐表核对；价格符号统一为全角 ＋(U+FF0B)/－(U+FF0D)；改定幅度约 +10%（265 个周边收纳值实测比率 1.02–1.114，均值 1.100）。",
  "generatedBy": "data-analyst（t2 数据提取）",
  "layouts": [
   "i",
   "l",
   "flat",
   "dual",
   "tworow"
  ],
  "layoutNames": {
   "i": "Ⅰ型",
   "l": "L型",
   "flat": "フラット対面",
   "dual": "デュアルトップ対面",
   "tworow": "2列型"
  },
  "layoutNamesZh": {
   "i": "一字型",
   "l": "L型",
   "flat": "齐平对面式",
   "dual": "双层台面对面式",
   "tworow": "双排型（二字型）"
  },
  "plans": [
   "basic",
   "stylish",
   "kirei"
  ],
  "planNames": {
   "basic": "基本プラン",
   "stylish": "スタイリッシュプラン",
   "kirei": "きれいプラン"
  },
  "planNamesZh": {
   "basic": "基本方案",
   "stylish": "简约设计方案",
   "kirei": "易洁方案"
  },
  "grades": [
   "class1",
   "class2",
   "class3",
   "class4",
   "class5"
  ],
  "gradeNames": {
   "class1": "class 1",
   "class2": "class 2",
   "class3": "class 3",
   "class4": "class 4",
   "class5": "class 5"
  },
  "basePlan": {
   "layout": "i",
   "plan": "basic",
   "width": "255",
   "grade": "class5",
   "price": 1317000
  },
  "layoutWidths": {
   "i": [
    "180",
    "195",
    "210",
    "225",
    "240",
    "255",
    "270",
    "285",
    "300"
   ],
   "l": [
    "180",
    "195",
    "210",
    "225",
    "240",
    "255",
    "270"
   ],
   "flat": [
    "243",
    "258",
    "273"
   ],
   "dual": [
    "242.5",
    "257.5",
    "272.5"
   ],
   "tworow": [
    "181.5"
   ]
  },
  "layoutDepths": {
   "flat": [
    "80",
    "98"
   ],
   "dual": [
    "80",
    "98"
   ]
  },
  "priceRevision": "2026.10 価格改定版",
  "priceEffective": "2026年11月現在（P.187）",
  "planBaseSpec": {
   "basic": {
    "worktop": "acrystone_solid",
    "faucet": "joksuiki",
    "cooktop": "XSS",
    "hood_i": "simpleslim",
    "hood_counter": "simpleslimJ",
    "sink": "SA/SY"
   },
   "stylish": {
    "worktop": "stainless_coining",
    "faucet": "shower",
    "cooktop": "XSS",
    "hood_i": "simpleslim",
    "hood_counter": "simpleslimJ",
    "sink": "SA/SY"
   },
   "kirei": {
    "worktop": "stainless_satin_emboss",
    "faucet": "efine",
    "cooktop": "FSS",
    "hood_i": "araiyell",
    "hood_counter": "simpleslimJ",
    "sink": "SA/SY"
   }
  },
  "combinationRules": [
   "食器洗い乾燥機はシンク側間口240cm以上で組み込み可（L型含む、P.98）。",
   "天然木ワークトップはハイタイプのみ対応（P.86/90/91）。",
   "デュアルトップ対面ロータイプでフォルテックス/セラミックワークトップを選ぶ場合はバックガード（現地取付）が必要、加算額に含まれる（P.90/91）。",
   "ミース（CG※）扉は一部の加熱機器と組み合わせ不可（P.100 ※4）。",
   "コンロ側間口180cm は コンロ側165cm 価格に class別 ＋49,000/＋50,000/＋41,000/＋43,000/＋40,000 を加算（L型、P.98）。",
   "2列型はテチテチ（壁付けコンロ側）選択不可（P.96/97 ※）。",
   "スライドボックス付の引出しにはフライパンラック/クロスギャラリー(DN-K)は取付不可（P.127）。"
  ],
  "optionScopeNote": "P.81「共通オプション」表头明示为「基本·シンプル·L型プラン共通」。フラット対面/デュアルトップ対面/2列型 の各ページは独自の＋OPTION（食洗機·ワークトップ·フロントスクリーン等）のみを掲載し、シンク/水栓/加熱機器/レンジフードの変更加算額は載っていない。本系统对対面系布局沿用 P.81 的加算額属于推定，正式报价需向クリナップ営業所確認。",
  "notModelled": [
   "2列型フラット対面（P.97：シンク側184.5/274.5cm × 奥行80パネル/98収納）——现仅建模壁付け（P.96）。",
   "フロントスクリーン加算（P.86/90/91：ロータイプ ブラック ⊕20,000／ハイタイプ シルバー ⊕111,000・ブラック ⊕134,000／なし ⊖46,000；stylish は 24,000/115,000/138,000/⊖46,000）。",
   "デュアルトップ対面 サイド化粧板 class別加算（P.90/91）与 キッチン側扉グレード加算（P.90/91，キッチン側は class5 固定）。",
   "デュアルトップ対面 ダイニング側カウンター（基准メラミン）——价格已存于 diningCounter，但未做成可选维度。",
   "周辺収納の未建模表：P.178 カップボード+片面フロアカウンター4分割構成／カフェスタイル収納の上台あり・吊戸棚あり/なし 4variant（现 cafe_counter 固定取「上台なし」）、P.179 全表、P.180 各2variant、P.181 全表。",
   "スライドボックス シンクキャビネットの単独加算額（P.81 に記載なし）。",
   "オートムーブ 底面コンセント等の専用オプション価格（手册未載単価；該オプションは間口75cm非対応、P.156）。"
  ],
  "manualShare": {
   "url": "https://pan.baidu.com/s/10M37F8PTtY_zOkbmR9Xfvw?pwd=hfba",
   "code": "hfba",
   "file": "0259_stediaca.pdf"
  },
  "widthRule": {
   "rule": "選定間口 W に対し、吊柜横並び合計（Σ非レンジフード上ユニット間口 ＋ レンジフード占位90cm）＝ W、かつ地柜横並び合計（Σ地柜ユニット間口）＝ W でなければならない。不一致はエラー表示。",
   "hoodWidth": 90,
   "strictLayouts": [
    "i",
    "flat",
    "dual"
   ],
   "advisoryLayouts": [
    "l",
    "tworow"
   ],
   "advisoryReason": "L型はコーナーキャビネットが両脚にまたがる／2列型はシンク側・コンロ側の2列に分かれるため、脚別寸法の内訳は未モデル化です。合計は参考表示（エラーではありません）。",
   "hoodUpperUnit": "「レンジフード用」チェック済みユニットはレンジフード上方に設置されるため横並び合計に含めない。",
   "wallOptional": "吊柜は一つも選ばなくてよい（「吊戸棚なし」＝地柜のみ購入）。その場合吊柜側の校验は免除；地柜側の合計は依然として間口と一致が必要。",
   "validateTiming": "校验只在「点下一步／向前跳页／出报价单」时触发；编辑中不报错，任何修改会清除已触发的错误。",
   "advisoryReasonZh": "L型转角柜跨两脚／双排型分水槽侧与灶具侧两列，各脚尺寸明细未建模。合计仅供参考（不是错误）。"
  },
  "translationNote": "中文译名于 2026-11-18 按 188 頁手册逐条复核：修正対面/ツールポケット/ワゴン/開き扉/シロッコファン/シーソースイッチ/ラジエントヒーター/インセットパネル 等术语误译，补译「美コート」「横幕板」，并统一「吊柜/地柜/进深」用语。扉カラー色名为品牌音译，手册无命名释义，未作改动。",
  "colorNamingNote": "扉カラー中文名于 2026-11-19 重做：从手册 P.102–105 渲染图裁取下柜门板区域实测色相并逐张目视校对，按实际颜色/材质命名（日文原名与型号并列显示，下单核对不受影响）。纠正 5 处与实物不符的旧译：ブルードゥパリ(青绿非蓝)、ペアウッドアッシュ(浅黄木非灰)、ミースアッシュ(暖白非灰)、ミクスドラテ(淡米绿非拿铁)、パティナマーブル(暖米白非灰)。swatchHex 为手册渲染图取样近似值（含光照），非材料标准色号。",
  "i18nNote": "2026-11-19 补漏：照明/タイプ/ラック/配件 等以日文为键的选项值加中文对照词典；取手 chips 原只显示日文已改中文；吊柜类型/地柜位置/高さ 等硬编码双语改为随语言切换；纯中文模式隐藏日文副标题（型号仍显示）；分类说明与禁用提示去除日文残留。",
  "seriesZh": "Stedia 系统厨房",
  "optionImgNote": "水槽实物图取自手册 P.114 阵容图；台面取自 P.108/110/111/112/113 材质小样，每个系列取代表色（ソリッド=ナチュラルホワイトN、パウダー=シュクルホワイトA、グラン=グランホワイトL、スレート=スレートホワイトW、エルデ=エルデベージュG、セラミック=アルバリウムE、天然木=オークJ）。图片为手册渲染/实拍，含光照，实物以展厅样板为准。plain サテン 手册无小样，未配图。",
  "jaNote": "分类页头说明于 2026-11-19 补齐日文（description_ja）。用词取自手册原文与数据内 name_ja：壁パネル12品番・認定番号は P.106、吊戸棚タイプは wallCabinetUnits[*].name_ja。同日补 option.note_ja（报价单「仕様」列会显示 note）与 widthRule.advisoryReasonZh（原 advisoryReason 日中混排，已拆为纯日文/纯中文两版）。"
 },
 "doorColors": {
  "class1": [
   {
    "code": "AVC",
    "name_ja": "オーク",
    "name_zh": "原色橡木",
    "handles": [
     "V"
    ],
    "swatchHex": "#c4995d",
    "colorNote": "暖黄橡木纹 #c4995d"
   },
   {
    "code": "AVY",
    "name_ja": "ウォールナット",
    "name_zh": "胡桃木",
    "handles": [
     "V"
    ],
    "swatchHex": "#7a553b",
    "colorNote": "深棕胡桃 #7a553b"
   },
   {
    "code": "AVG",
    "name_ja": "オークグレー",
    "name_zh": "灰橡木",
    "handles": [
     "V"
    ],
    "swatchHex": "#605c59",
    "colorNote": "深灰褐橡木 #605c59"
   }
  ],
  "class2": [
   {
    "code": "CJV",
    "name_ja": "ボーテシルバー",
    "name_zh": "镜面银灰",
    "handles": [
     "F",
     "Z",
     "B"
    ],
    "swatchHex": "#888985",
    "colorNote": "不锈钢镜面银灰 #888985（原「波泰银」为无信息音译）"
   },
   {
    "code": "CFQ",
    "name_ja": "ブロンカッセ",
    "name_zh": "雅白·细框",
    "handles": [
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#d8d8d8",
    "colorNote": "实为白色细框门 #d8d8d8（原「布朗卡塞」音译，且易误以为古铜色）"
   },
   {
    "code": "CFL",
    "name_ja": "カシミアエトープ",
    "name_zh": "羊绒灰褐",
    "handles": [
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#b1ada2",
    "colorNote": "浅灰褐 étoupe #b1ada2"
   },
   {
    "code": "CFU",
    "name_ja": "ティオレローズ",
    "name_zh": "藕粉",
    "handles": [
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#c4b2a4",
    "colorNote": "淡粉褐 #c4b2a4（原「蒂奥雷玫瑰」音译冗长）"
   },
   {
    "code": "CFZ",
    "name_ja": "スタウトシリウス",
    "name_zh": "浓黑",
    "handles": [
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#44413d",
    "colorNote": "深炭黑 stout #44413d（原「斯托特天狼星」不可解）"
   },
   {
    "code": "CFV",
    "name_ja": "ブルードゥパリ",
    "name_zh": "鸭蛋青",
    "handles": [
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#a4afa6",
    "colorNote": "★实为浅青绿 #a4afa6，非蓝（原「巴黎蓝」与实物不符）"
   }
  ],
  "class3": [
   {
    "code": "CNA",
    "name_ja": "ルナホワイト",
    "name_zh": "月光白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#eaeaea",
    "colorNote": "纯白镜面 #eaeaea"
   },
   {
    "code": "CHK",
    "name_ja": "パティナオパール",
    "name_zh": "欧泊白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#ccccd1",
    "colorNote": "乳白偏冷 #ccccd1（原「古铜蛋白石」的「古铜」与实物不符）"
   },
   {
    "code": "CHL",
    "name_ja": "パティナマーブル",
    "name_zh": "云石米白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#d9d0c7",
    "colorNote": "★实为暖米白大理石纹 #d9d0c7（原「云石灰」的「灰」与实物不符；マーブル=云石无误，同系列 CHK=欧泊白）"
   },
   {
    "code": "CPG",
    "name_ja": "ソナタグリーズ",
    "name_zh": "奏鸣米灰",
    "handles": [
     "F",
     "Z",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#bfb9a8",
    "colorNote": "浅米灰 #bfb9a8"
   },
   {
    "code": "CPZ",
    "name_ja": "ソナタセピア",
    "name_zh": "奏鸣深褐",
    "handles": [
     "F",
     "Z",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#635f54",
    "colorNote": "深灰褐 sepia #635f54"
   },
   {
    "code": "CPB",
    "name_ja": "ソナタウッドチェリー",
    "name_zh": "奏鸣樱桃木",
    "handles": [
     "F",
     "Z",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#a87d44",
    "colorNote": "樱桃暖棕 #a87d44"
   },
   {
    "code": "CGT",
    "name_ja": "ミースアッシュ",
    "name_zh": "米斯暖白",
    "handles": [
     "9"
    ],
    "swatchHex": "#e1ddda",
    "colorNote": "★实为暖白 #e1ddda，非灰（原「米斯烬灰」与实物不符）"
   },
   {
    "code": "CGV",
    "name_ja": "ミースネイビー",
    "name_zh": "米斯灰蓝",
    "handles": [
     "9"
    ],
    "swatchHex": "#788385",
    "colorNote": "中灰蓝 #788385（原「藏青」过深，实物为浅灰蓝）"
   },
   {
    "code": "CGG",
    "name_ja": "ミースグレー",
    "name_zh": "米斯中灰",
    "handles": [
     "9"
    ],
    "swatchHex": "#a9a7a2",
    "colorNote": "中灰 #a9a7a2"
   },
   {
    "code": "CGW",
    "name_ja": "ミースウッドナチュラル",
    "name_zh": "米斯原木",
    "handles": [
     "9"
    ],
    "swatchHex": "#cdb690",
    "colorNote": "浅原木 #cdb690"
   },
   {
    "code": "CGL",
    "name_ja": "ミースウッドダーク",
    "name_zh": "米斯深木",
    "handles": [
     "9"
    ],
    "swatchHex": "#7b6753",
    "colorNote": "深棕木 #7b6753"
   }
  ],
  "class4": [
   {
    "code": "CYE",
    "name_ja": "クリスタホワイト",
    "name_zh": "水晶白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#e9eae5",
    "colorNote": "白 #e9eae5"
   },
   {
    "code": "CYW",
    "name_ja": "クリスタブルーグレー",
    "name_zh": "水晶蓝灰",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#b7cad1",
    "colorNote": "浅蓝灰 #b7cad1"
   },
   {
    "code": "C3A",
    "name_ja": "オークラテ",
    "name_zh": "橡木拿铁",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#bca17f",
    "colorNote": "浅暖橡木，确似拿铁 #bca17f"
   },
   {
    "code": "C3B",
    "name_ja": "チェリーブレンド",
    "name_zh": "樱桃混色",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#b68758",
    "colorNote": "樱桃棕混纹 #b68758"
   },
   {
    "code": "C3L",
    "name_ja": "ウォールナットビター",
    "name_zh": "深胡桃",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#876648",
    "colorNote": "深棕 #876648（原「苦胡桃木」为 bitter 直译）"
   },
   {
    "code": "CDK",
    "name_ja": "ユーリベージュ",
    "name_zh": "尤利米白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#d5d2bf",
    "colorNote": "米白 #d5d2bf"
   },
   {
    "code": "CDH",
    "name_ja": "ユーリチャコール",
    "name_zh": "尤利炭黑",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#4d4d47",
    "colorNote": "炭黑 #4d4d47"
   },
   {
    "code": "CDS",
    "name_ja": "レフティグリーン",
    "name_zh": "橄榄灰绿",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#95937e",
    "colorNote": "橄榄灰绿 #95937e（原「左撇子绿」为 lefty 直译，不可解）"
   },
   {
    "code": "CDB",
    "name_ja": "カミーナレッド",
    "name_zh": "赭红",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#9e6559",
    "colorNote": "砖赭红 #9e6559（原「卡米娜红」音译无信息）"
   },
   {
    "code": "CWT",
    "name_ja": "ペアウッドホワイト",
    "name_zh": "白梨木",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#d6dcda",
    "colorNote": "白色木纹 #d6dcda"
   },
   {
    "code": "CWX",
    "name_ja": "ペアウッドアッシュ",
    "name_zh": "浅梨木",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#d3bf9c",
    "colorNote": "★实为浅黄木 #d3bf9c，非灰（原「梨木灰」与实物不符）"
   },
   {
    "code": "CWZ",
    "name_ja": "マリンウッドダーク",
    "name_zh": "深灰木",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#686560",
    "colorNote": "深灰木纹 #686560（原「海洋深木」为 marine 直译）"
   },
   {
    "code": "C8T",
    "name_ja": "コティグレー",
    "name_zh": "科蒂浅灰",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#a9a59c",
    "colorNote": "浅暖灰 #a9a59c"
   },
   {
    "code": "C8Z",
    "name_ja": "コティチャコール",
    "name_zh": "科蒂炭灰",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T",
     "7",
     "8"
    ],
    "swatchHex": "#6f6c67",
    "colorNote": "炭灰 #6f6c67"
   }
  ],
  "class5": [
   {
    "code": "CAT",
    "name_ja": "スエードホワイト",
    "name_zh": "麂皮米白",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#dedad7",
    "colorNote": "米白绒面 #dedad7"
   },
   {
    "code": "CAZ",
    "name_ja": "スエードチャコール",
    "name_zh": "麂皮炭黑",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#43403b",
    "colorNote": "炭黑绒面 #43403b"
   },
   {
    "code": "C9K",
    "name_ja": "ミクスドラテ",
    "name_zh": "米绿",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#d0ceb5",
    "colorNote": "★实为淡米绿 #d0ceb5（原「混合拿铁」与实物不符，该译名为上一轮误判）"
   },
   {
    "code": "ECG",
    "name_ja": "トワルグレー",
    "name_zh": "布纹浅灰",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#b6b2a9",
    "colorNote": "浅灰布纹 toile #b6b2a9"
   },
   {
    "code": "ECU",
    "name_ja": "トワルローズ",
    "name_zh": "布纹藕粉",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#d0bcb6",
    "colorNote": "淡粉布纹 #d0bcb6"
   },
   {
    "code": "CKG",
    "name_ja": "ルオントグレージュ",
    "name_zh": "灰米棕",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#c7b299",
    "colorNote": "灰米棕 greige #c7b299（原「鲁昂灰米」音译）"
   },
   {
    "code": "E5K",
    "name_ja": "ロッシュグレー",
    "name_zh": "岩石暖灰",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#ab9f8f",
    "colorNote": "暖灰褐石纹 roche #ab9f8f"
   },
   {
    "code": "CKL",
    "name_ja": "ルオントセピア",
    "name_zh": "深棕褐",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#836951",
    "colorNote": "深棕褐 sepia #836951（原「鲁昂棕褐」音译）"
   },
   {
    "code": "E5H",
    "name_ja": "ロッシュチャコール",
    "name_zh": "岩石炭黑",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#534d3f",
    "colorNote": "深炭褐 #534d3f"
   },
   {
    "code": "C4B",
    "name_ja": "クラシカルバーチ",
    "name_zh": "古典桦木",
    "handles": [
     "F",
     "Z",
     "B",
     "U",
     "T"
    ],
    "swatchHex": "#a2774e",
    "colorNote": "桦木棕 #a2774e"
   }
  ]
 },
 "handles": {
  "V": {
   "name_ja": "天然木取手",
   "name_zh": "天然木拉手",
   "img": "assets/handles/handle_V.png"
  },
  "F": {
   "name_ja": "ロングバーシルバー",
   "name_zh": "长条银拉手",
   "img": "assets/handles/handle_F.png"
  },
  "Z": {
   "name_ja": "スリムロングバーブラック",
   "name_zh": "细长黑拉手",
   "img": "assets/handles/handle_Z.png"
  },
  "B": {
   "name_ja": "ラインシルバー",
   "name_zh": "线条银拉手",
   "img": "assets/handles/handle_B.png"
  },
  "U": {
   "name_ja": "ラインブラック",
   "name_zh": "线条黑拉手",
   "img": "assets/handles/handle_U.png"
  },
  "T": {
   "name_ja": "ネコアシブラック",
   "name_zh": "猫脚黑拉手",
   "img": "assets/handles/handle_T.png"
  },
  "7": {
   "name_ja": "木調取手オーク",
   "name_zh": "木纹橡木拉手",
   "img": "assets/handles/handle_7.png"
  },
  "8": {
   "name_ja": "木調取手ウォールナット",
   "name_zh": "木纹胡桃木拉手",
   "img": "assets/handles/handle_8.png"
  },
  "9": {
   "name_ja": "ミース扉用ハンドル",
   "name_zh": "米斯门专用拉手",
   "img": "assets/handles/handle_9.png"
  },
  "_imgNote": "实物图取自手册 P.103「■ 取手」图鉴（原始分辨率提取、裁去纯色边框）。F/Z/B/U/T/7/8 为白底产品图；9/V 为门板安装实拍（黑底为源图背景）。"
 },
 "worktopMaterials": [
  {
   "id": "stainless",
   "name_ja": "ステンレスワークトップ",
   "name_zh": "不锈钢台面",
   "colors": [
    "コイニング",
    "ヘアライン",
    "サテン",
    "バイブレーション",
    "サテンエンボス"
   ]
  },
  {
   "id": "acrystone",
   "name_ja": "アクリストンワークトップ",
   "name_zh": "人造大理石台面",
   "colors": [
    "ソリッド",
    "パウダー",
    "グラン"
   ]
  },
  {
   "id": "fortex",
   "name_ja": "フォルテックスワークトップ",
   "name_zh": "硬质人造大理石台面",
   "colors": [
    "スレート",
    "エルデ"
   ]
  },
  {
   "id": "ceramic",
   "name_ja": "セラミックワークトップ",
   "name_zh": "陶瓷台面",
   "colors": [
    "アルバリウム",
    "クレタ",
    "マルモリオ",
    "シリウス"
   ]
  },
  {
   "id": "wood",
   "name_ja": "天然木ワークトップ",
   "name_zh": "天然木台面",
   "colors": [
    "オーク",
    "オークグレー",
    "ウォールナット"
   ]
  }
 ],
 "peripheralPrices": {
  "note": "周辺収納独立单价表（税抜、2026.10 価格改定版 P.177–181）。columns=間口(cm)，prices.depthNN 或 prices 为 class1–5 的价格数组。",
  "pantry_basic": {
   "columns": [
    "90",
    "105",
    "120",
    "135",
    "150",
    "180"
   ],
   "depth45": {
    "class1": [
     758000,
     821000,
     908000,
     957000,
     1056000,
     1183000
    ],
    "class2": [
     654000,
     715000,
     802000,
     847000,
     944000,
     1065000
    ],
    "class3": [
     554000,
     609000,
     690000,
     733000,
     824000,
     933000
    ],
    "class4": [
     476000,
     517000,
     586000,
     615000,
     692000,
     775000
    ],
    "class5": [
     432000,
     469000,
     532000,
     553000,
     624000,
     701000
    ]
   },
   "depth55": {
    "class1": [
     786000,
     850000,
     944000,
     984000,
     1098000,
     1223000
    ],
    "class2": [
     682000,
     744000,
     838000,
     874000,
     986000,
     1105000
    ],
    "class3": [
     582000,
     638000,
     726000,
     760000,
     866000,
     973000
    ],
    "class4": [
     504000,
     546000,
     622000,
     642000,
     734000,
     815000
    ],
    "class5": [
     460000,
     498000,
     568000,
     580000,
     666000,
     741000
    ]
   },
   "depth65": {
    "class1": [
     816000,
     879000,
     979000,
     1011000,
     1140000,
     1268000
    ],
    "class2": [
     712000,
     773000,
     873000,
     901000,
     1028000,
     1150000
    ],
    "class3": [
     612000,
     667000,
     761000,
     787000,
     908000,
     1018000
    ],
    "class4": [
     534000,
     575000,
     657000,
     669000,
     776000,
     860000
    ],
    "class5": [
     490000,
     527000,
     603000,
     607000,
     708000,
     786000
    ]
   }
  },
  "pantry_care": {
   "columns": [
    "120",
    "150",
    "180"
   ],
   "depth45": {
    "class1": [
     1028000,
     1184000,
     1319000
    ],
    "class2": [
     922000,
     1072000,
     1201000
    ],
    "class3": [
     810000,
     952000,
     1069000
    ],
    "class4": [
     706000,
     820000,
     911000
    ],
    "class5": [
     652000,
     752000,
     837000
    ]
   },
   "depth55": {
    "class1": [
     1071000,
     1232000,
     1365000
    ],
    "class2": [
     965000,
     1120000,
     1247000
    ],
    "class3": [
     853000,
     1000000,
     1115000
    ],
    "class4": [
     749000,
     868000,
     957000
    ],
    "class5": [
     695000,
     800000,
     883000
    ]
   }
  },
  "pantry_short": {
   "columns": [
    "90",
    "105",
    "120",
    "135",
    "150",
    "180"
   ],
   "depth45": {
    "class1": [
     673000,
     736000,
     815000,
     857000,
     934000,
     1050000
    ],
    "class2": [
     573000,
     632000,
     707000,
     751000,
     820000,
     930000
    ],
    "class3": [
     473000,
     526000,
     597000,
     635000,
     700000,
     800000
    ],
    "class4": [
     393000,
     432000,
     493000,
     517000,
     568000,
     644000
    ],
    "class5": [
     349000,
     384000,
     437000,
     455000,
     504000,
     566000
    ]
   }
  },
  "floor_counter": {
   "columns": [
    "120",
    "135",
    "150",
    "165",
    "180"
   ],
   "depth45": {
    "class1": [
     583000,
     614000,
     645000,
     676000,
     707000
    ],
    "class2": [
     489000,
     513000,
     537000,
     562000,
     587000
    ],
    "class3": [
     381000,
     399000,
     417000,
     434000,
     451000
    ],
    "class4": [
     301000,
     314000,
     327000,
     341000,
     355000
    ],
    "class5": [
     245000,
     255000,
     265000,
     273000,
     281000
    ]
   }
  },
  "high_floor_counter": {
   "columns": [
    "120",
    "135",
    "150",
    "165",
    "180"
   ],
   "depth45": {
    "class1": [
     862000,
     894000,
     918000,
     950000,
     973000
    ],
    "class2": [
     743000,
     767000,
     786000,
     812000,
     832000
    ],
    "class3": [
     608000,
     626000,
     645000,
     661000,
     679000
    ],
    "class4": [
     536000,
     549000,
     563000,
     578000,
     594000
    ],
    "class5": [
     470000,
     479000,
     492000,
     502000,
     516000
    ]
   }
  },
  "cafe_cupboard_counter": {
   "columns": [
    "120",
    "135",
    "150",
    "165",
    "180"
   ],
   "depth45": {
    "class1": [
     807000,
     792000,
     774000,
     811000,
     855000
    ],
    "class2": [
     715000,
     703000,
     683000,
     692000,
     708000
    ],
    "class3": [
     563000,
     576000,
     567000,
     578000,
     597000
    ],
    "class4": [
     499000,
     491000,
     473000,
     488000,
     503000
    ],
    "class5": [
     471000,
     460000,
     440000,
     454000,
     470000
    ]
   }
  },
  "cafe_counter": {
   "columns": [
    "135",
    "150",
    "165",
    "180"
   ],
   "depth45": {
    "class1": [
     408000,
     427000,
     447000,
     467000
    ],
    "class2": [
     357000,
     375000,
     392000,
     409000
    ],
    "class3": [
     302000,
     313000,
     324000,
     335000
    ],
    "class4": [
     246000,
     257000,
     268000,
     279000
    ],
    "class5": [
     223000,
     231000,
     239000,
     247000
    ]
   }
  }
 },
 "categories": [
  {
   "id": "layout",
   "name_ja": "レイアウト",
   "name_zh": "布局",
   "step": 0,
   "pages": [
    1,
    2,
    11,
    12,
    19
   ],
   "description_zh": "系统厨房布局（决定价格表组）：一字型 / L型 / 齐平对面式 / 双层台面对面式 / 双排型（二字型）。",
   "options": [
    {
     "code": "i",
     "name_ja": "Ⅰ型",
     "name_zh": "一字型",
     "plans": [
      "basic",
      "stylish",
      "kirei"
     ]
    },
    {
     "code": "l",
     "name_ja": "L型",
     "name_zh": "L型",
     "plans": [
      "basic"
     ]
    },
    {
     "code": "flat",
     "name_ja": "フラット対面",
     "name_zh": "齐平对面式",
     "plans": [
      "basic"
     ]
    },
    {
     "code": "dual",
     "name_ja": "デュアルトップ対面",
     "name_zh": "双层台面对面式",
     "plans": [
      "basic",
      "stylish"
     ]
    },
    {
     "code": "tworow",
     "name_ja": "2列型",
     "name_zh": "双排型（二字型）",
     "plans": [
      "basic"
     ]
    }
   ],
   "description_ja": "システムキッチンのレイアウト（価格表グループを決定）：Ⅰ型 / L型 / フラット対面 / デュアルトップ対面 / 2列型。"
  },
  {
   "id": "plan",
   "name_ja": "パッケージプラン",
   "name_zh": "套餐方案",
   "step": 1,
   "pages": [
    5,
    6,
    7,
    8,
    9,
    10
   ],
   "description_zh": "套餐方案（Ⅰ型有基本/时尚/清洁三套，其余布局以基本为主；双台面对接另有简约设计方案）。",
   "options": [
    {
     "code": "basic",
     "name_ja": "基本プラン",
     "name_zh": "基本方案",
     "appliesTo": [
      "i",
      "l",
      "flat",
      "dual",
      "tworow"
     ]
    },
    {
     "code": "stylish",
     "name_ja": "スタイリッシュプラン",
     "name_zh": "简约设计方案",
     "appliesTo": [
      "i",
      "dual"
     ],
     "note": "手册 P.82 原文「デザインを重視しつつアイテムを絞り込んだコストバランスの良いプラン」——重设计、精简配置、性价比档；三方案中价格最低（255cm/class5 ¥910,000）。ツールポケット無、引出し底板为メラミン化粧板。"
    },
    {
     "code": "kirei",
     "name_ja": "きれいプラン",
     "name_zh": "易洁方案",
     "appliesTo": [
      "i"
     ],
     "note": "易清洁配置档：Efine 水龙头＋洗エール自动清洗油烟机＋FSS 灶具＋サテンエンボス台面（P.83）；三方案中价格最高（255cm/class5 ¥1,424,000）。"
    }
   ],
   "description_ja": "パッケージプラン（Ⅰ型：基本・スタイリッシュ・きれい／デュアルトップ対面：基本・スタイリッシュ／その他のレイアウト：基本プランのみ）。"
  },
  {
   "id": "size",
   "name_ja": "間口（幅）",
   "name_zh": "宽度",
   "step": 2,
   "pages": [
    7,
    9,
    10,
    13,
    17,
    18,
    23,
    25
   ],
   "description_zh": "间口宽度（决定基本套装价）：一字型 180–300cm 共 9 档，其他布局各自定义。",
   "options": [
    {
     "code": "180",
     "name_ja": "間口180cm",
     "name_zh": "宽180cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "195",
     "name_ja": "間口195cm",
     "name_zh": "宽195cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "210",
     "name_ja": "間口210cm",
     "name_zh": "宽210cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "225",
     "name_ja": "間口225cm",
     "name_zh": "宽225cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "240",
     "name_ja": "間口240cm",
     "name_zh": "宽240cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "255",
     "name_ja": "間口255cm",
     "name_zh": "宽255cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "270",
     "name_ja": "間口270cm",
     "name_zh": "宽270cm",
     "layouts": [
      "i",
      "l"
     ]
    },
    {
     "code": "285",
     "name_ja": "間口285cm",
     "name_zh": "宽285cm",
     "layouts": [
      "i"
     ]
    },
    {
     "code": "300",
     "name_ja": "間口300cm",
     "name_zh": "宽300cm",
     "layouts": [
      "i"
     ]
    }
   ],
   "description_ja": "間口（幅）：基本セット価格を決定します。Ⅰ型は180〜300cmの9サイズ、その他のレイアウトは専用サイズです。"
  },
  {
   "id": "grade",
   "name_ja": "扉グレード",
   "name_zh": "门板等级",
   "step": 2,
   "pages": [
    7,
    8,
    9,
    10
   ],
   "description_zh": "门板等级 class 1–5（与间口共同决定基本套装价）。",
   "options": [
    {
     "code": "class1",
     "name_ja": "class 1",
     "name_zh": "1 级"
    },
    {
     "code": "class2",
     "name_ja": "class 2",
     "name_zh": "2 级"
    },
    {
     "code": "class3",
     "name_ja": "class 3",
     "name_zh": "3 级"
    },
    {
     "code": "class4",
     "name_ja": "class 4",
     "name_zh": "4 级"
    },
    {
     "code": "class5",
     "name_ja": "class 5",
     "name_zh": "5 级"
    }
   ],
   "description_ja": "扉グレード class 1〜5（間口とともに基本セット価格を決定します）。"
  },
  {
   "id": "door",
   "name_ja": "扉カラー",
   "name_zh": "门板颜色",
   "step": 3,
   "pages": [
    26,
    27,
    28,
    29,
    30,
    31,
    32
   ],
   "description_zh": "门板颜色 44 色（按 class 分组，含于套装价内不另计价；取手按 class 联动，见 doorColors/handles）。",
   "options": [
    {
     "code": "AVC",
     "name_ja": "オーク",
     "name_zh": "原色橡木",
     "grade": "class1"
    },
    {
     "code": "AVY",
     "name_ja": "ウォールナット",
     "name_zh": "胡桃木",
     "grade": "class1"
    },
    {
     "code": "AVG",
     "name_ja": "オークグレー",
     "name_zh": "灰橡木",
     "grade": "class1"
    },
    {
     "code": "CJV",
     "name_ja": "ボーテシルバー",
     "name_zh": "镜面银灰",
     "grade": "class2"
    },
    {
     "code": "CFQ",
     "name_ja": "ブロンカッセ",
     "name_zh": "雅白·细框",
     "grade": "class2"
    },
    {
     "code": "CFL",
     "name_ja": "カシミアエトープ",
     "name_zh": "羊绒灰褐",
     "grade": "class2"
    },
    {
     "code": "CFU",
     "name_ja": "ティオレローズ",
     "name_zh": "藕粉",
     "grade": "class2"
    },
    {
     "code": "CFZ",
     "name_ja": "スタウトシリウス",
     "name_zh": "浓黑",
     "grade": "class2"
    },
    {
     "code": "CFV",
     "name_ja": "ブルードゥパリ",
     "name_zh": "鸭蛋青",
     "grade": "class2"
    },
    {
     "code": "CNA",
     "name_ja": "ルナホワイト",
     "name_zh": "月光白",
     "grade": "class3"
    },
    {
     "code": "CHK",
     "name_ja": "パティナオパール",
     "name_zh": "欧泊白",
     "grade": "class3"
    },
    {
     "code": "CHL",
     "name_ja": "パティナマーブル",
     "name_zh": "云石米白",
     "grade": "class3"
    },
    {
     "code": "CPG",
     "name_ja": "ソナタグリーズ",
     "name_zh": "奏鸣米灰",
     "grade": "class3"
    },
    {
     "code": "CPZ",
     "name_ja": "ソナタセピア",
     "name_zh": "奏鸣深褐",
     "grade": "class3"
    },
    {
     "code": "CPB",
     "name_ja": "ソナタウッドチェリー",
     "name_zh": "奏鸣樱桃木",
     "grade": "class3"
    },
    {
     "code": "CGT",
     "name_ja": "ミースアッシュ",
     "name_zh": "米斯暖白",
     "grade": "class3"
    },
    {
     "code": "CGV",
     "name_ja": "ミースネイビー",
     "name_zh": "米斯灰蓝",
     "grade": "class3"
    },
    {
     "code": "CGG",
     "name_ja": "ミースグレー",
     "name_zh": "米斯中灰",
     "grade": "class3"
    },
    {
     "code": "CGW",
     "name_ja": "ミースウッドナチュラル",
     "name_zh": "米斯原木",
     "grade": "class3"
    },
    {
     "code": "CGL",
     "name_ja": "ミースウッドダーク",
     "name_zh": "米斯深木",
     "grade": "class3"
    },
    {
     "code": "CYE",
     "name_ja": "クリスタホワイト",
     "name_zh": "水晶白",
     "grade": "class4"
    },
    {
     "code": "CYW",
     "name_ja": "クリスタブルーグレー",
     "name_zh": "水晶蓝灰",
     "grade": "class4"
    },
    {
     "code": "C3A",
     "name_ja": "オークラテ",
     "name_zh": "橡木拿铁",
     "grade": "class4"
    },
    {
     "code": "C3B",
     "name_ja": "チェリーブレンド",
     "name_zh": "樱桃混色",
     "grade": "class4"
    },
    {
     "code": "C3L",
     "name_ja": "ウォールナットビター",
     "name_zh": "深胡桃",
     "grade": "class4"
    },
    {
     "code": "CDK",
     "name_ja": "ユーリベージュ",
     "name_zh": "尤利米白",
     "grade": "class4"
    },
    {
     "code": "CDH",
     "name_ja": "ユーリチャコール",
     "name_zh": "尤利炭黑",
     "grade": "class4"
    },
    {
     "code": "CDS",
     "name_ja": "レフティグリーン",
     "name_zh": "橄榄灰绿",
     "grade": "class4"
    },
    {
     "code": "CDB",
     "name_ja": "カミーナレッド",
     "name_zh": "赭红",
     "grade": "class4"
    },
    {
     "code": "CWT",
     "name_ja": "ペアウッドホワイト",
     "name_zh": "白梨木",
     "grade": "class4"
    },
    {
     "code": "CWX",
     "name_ja": "ペアウッドアッシュ",
     "name_zh": "浅梨木",
     "grade": "class4"
    },
    {
     "code": "CWZ",
     "name_ja": "マリンウッドダーク",
     "name_zh": "深灰木",
     "grade": "class4"
    },
    {
     "code": "C8T",
     "name_ja": "コティグレー",
     "name_zh": "科蒂浅灰",
     "grade": "class4"
    },
    {
     "code": "C8Z",
     "name_ja": "コティチャコール",
     "name_zh": "科蒂炭灰",
     "grade": "class4"
    },
    {
     "code": "CAT",
     "name_ja": "スエードホワイト",
     "name_zh": "麂皮米白",
     "grade": "class5"
    },
    {
     "code": "CAZ",
     "name_ja": "スエードチャコール",
     "name_zh": "麂皮炭黑",
     "grade": "class5"
    },
    {
     "code": "C9K",
     "name_ja": "ミクスドラテ",
     "name_zh": "米绿",
     "grade": "class5"
    },
    {
     "code": "ECG",
     "name_ja": "トワルグレー",
     "name_zh": "布纹浅灰",
     "grade": "class5"
    },
    {
     "code": "ECU",
     "name_ja": "トワルローズ",
     "name_zh": "布纹藕粉",
     "grade": "class5"
    },
    {
     "code": "CKG",
     "name_ja": "ルオントグレージュ",
     "name_zh": "灰米棕",
     "grade": "class5"
    },
    {
     "code": "E5K",
     "name_ja": "ロッシュグレー",
     "name_zh": "岩石暖灰",
     "grade": "class5"
    },
    {
     "code": "CKL",
     "name_ja": "ルオントセピア",
     "name_zh": "深棕褐",
     "grade": "class5"
    },
    {
     "code": "E5H",
     "name_ja": "ロッシュチャコール",
     "name_zh": "岩石炭黑",
     "grade": "class5"
    },
    {
     "code": "C4B",
     "name_ja": "クラシカルバーチ",
     "name_zh": "古典桦木",
     "grade": "class5"
    }
   ],
   "description_ja": "扉カラー44色（グレード別に分類。セット価格に含まれ、追加料金はかかりません。取手はグレードに連動します。doorColors/handles 参照）。"
  },
  {
   "id": "worktop",
   "name_ja": "ワークトップ",
   "name_zh": "台面",
   "step": 4,
   "pages": [
    7,
    8,
    9,
    10,
    13,
    17,
    18,
    35,
    36,
    37,
    38,
    39,
    40
   ],
   "description_zh": "台面材质：不锈钢 / 人造大理石 / 硬质人造大理石 / 陶瓷 / 天然木。加算额按间口递变，且各方案基准台面不同。",
   "options": [
    {
     "code": "acrystone_solid",
     "name_ja": "アクリストン ソリッド",
     "name_zh": "人造大理石 纯色",
     "note": "基本方案基准台面",
     "basicFor": [
      "basic"
     ],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 0,
        "195": 0,
        "210": 0,
        "225": 0,
        "240": 0,
        "255": 0,
        "270": 0,
        "285": 0,
        "300": 0
       },
       "l": {
        "180": 0,
        "195": 0,
        "210": 0,
        "225": 0,
        "240": 0,
        "255": 0,
        "270": 0
       },
       "flat": {
        "80": 0,
        "98": 0
       },
       "dual_kitchen": {
        "242.5": 0,
        "257.5": 0,
        "272.5": 0
       },
       "tworow_conro": {
        "180": 0
       },
       "tworow_sink": {
        "181.5": 0
       }
      },
      "stylish": {
       "i": {
        "180": 55000,
        "195": 58000,
        "210": 61000,
        "225": 64000,
        "240": 67000,
        "255": 70000,
        "270": 73000,
        "285": 76000,
        "300": 79000
       },
       "dual_kitchen": {
        "242.5": 67000,
        "257.5": 70000,
        "272.5": 73000
       }
      },
      "kirei": {
       "i": {
        "180": -29000,
        "195": -26000,
        "210": -23000,
        "225": -20000,
        "240": -17000,
        "255": -14000,
        "270": -11000,
        "285": -8000,
        "300": -5000
       }
      }
     },
     "pricesBySize": {
      "180": 0,
      "195": 0,
      "210": 0,
      "225": 0,
      "240": 0,
      "255": 0,
      "270": 0,
      "285": 0,
      "300": 0
     },
     "img": "assets/worktops/worktop_acrystone_solid.jpg",
     "imgSrc": "P.112 ナチュラルホワイト(N)",
     "note_ja": "基本プランの基本仕様ワークトップ"
    },
    {
     "code": "stainless_coining",
     "name_ja": "ステンレス コイニング",
     "name_zh": "不锈钢 点纹压花",
     "pricesBySize": {
      "180": -55000,
      "195": -58000,
      "210": -61000,
      "225": -64000,
      "240": -67000,
      "255": -70000,
      "270": -73000,
      "285": -76000,
      "300": -79000
     },
     "basicFor": [
      "stylish"
     ],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": -55000,
        "195": -58000,
        "210": -61000,
        "225": -64000,
        "240": -67000,
        "255": -70000,
        "270": -73000,
        "285": -76000,
        "300": -79000
       },
       "l": {
        "180": -102000,
        "195": -104000,
        "210": -107000,
        "225": -110000,
        "240": -113000,
        "255": -116000,
        "270": -119000
       },
       "dual_kitchen": {
        "242.5": -67000,
        "257.5": -70000,
        "272.5": -73000
       },
       "tworow_conro": {
        "180": -55000
       },
       "tworow_sink": {
        "181.5": -56000
       }
      },
      "stylish": {
       "i": {
        "180": 0,
        "195": 0,
        "210": 0,
        "225": 0,
        "240": 0,
        "255": 0,
        "270": 0,
        "285": 0,
        "300": 0
       },
       "l": {
        "180": 0,
        "195": 0,
        "210": 0,
        "225": 0,
        "240": 0,
        "255": 0,
        "270": 0
       },
       "flat": {
        "80": 0,
        "98": 0
       },
       "dual_kitchen": {
        "242.5": 0,
        "257.5": 0,
        "272.5": 0
       },
       "tworow_conro": {
        "180": 0
       },
       "tworow_sink": {
        "181.5": 0
       }
      },
      "kirei": {
       "i": {
        "180": -84000,
        "195": -84000,
        "210": -84000,
        "225": -84000,
        "240": -84000,
        "255": -84000,
        "270": -84000,
        "285": -84000,
        "300": -84000
       },
       "tworow_conro": {
        "180": -55000
       },
       "tworow_sink": {
        "181.5": -56000
       }
      }
     },
     "img": "assets/worktops/worktop_stainless_coining.jpg",
     "imgSrc": "P.113 ドット柄コイニング(S)"
    },
    {
     "code": "stainless_hairline",
     "name_ja": "ステンレス ヘアライン",
     "name_zh": "不锈钢 拉丝",
     "pricesBySize": {
      "180": 2000,
      "195": -1000,
      "210": -4000,
      "225": -7000,
      "240": -10000,
      "255": -13000,
      "270": -16000,
      "285": -19000,
      "300": -22000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 2000,
        "195": -1000,
        "210": -4000,
        "225": -7000,
        "240": -10000,
        "255": -13000,
        "270": -16000,
        "285": -19000,
        "300": -22000
       },
       "l": {
        "180": -18000,
        "195": -20000,
        "210": -23000,
        "225": -26000,
        "240": -29000,
        "255": -32000,
        "270": -35000
       },
       "flat": {
        "80": 55000,
        "98": 57000
       },
       "dual_kitchen": {
        "242.5": -10000,
        "257.5": -13000,
        "272.5": -16000
       },
       "tworow_conro": {
        "180": 2000
       },
       "tworow_sink": {
        "181.5": 2000
       }
      },
      "stylish": {
       "i": {
        "180": 57000,
        "195": 57000,
        "210": 57000,
        "225": 57000,
        "240": 57000,
        "255": 57000,
        "270": 57000,
        "285": 57000,
        "300": 57000
       },
       "dual_kitchen": {
        "242.5": 57000,
        "257.5": 57000,
        "272.5": 57000
       },
       "tworow_conro": {
        "180": 2000
       },
       "tworow_sink": {
        "181.5": 2000
       }
      },
      "kirei": {
       "i": {
        "180": -27000,
        "195": -27000,
        "210": -27000,
        "225": -27000,
        "240": -27000,
        "255": -27000,
        "270": -27000,
        "285": -27000,
        "300": -27000
       },
       "tworow_conro": {
        "180": 2000
       },
       "tworow_sink": {
        "181.5": 2000
       }
      }
     },
     "img": "assets/worktops/worktop_stainless_hairline.jpg",
     "imgSrc": "P.113 ヘアライン(L)"
    },
    {
     "code": "stainless_satin_emboss",
     "name_ja": "ステンレス サテンエンボス（美コート+特殊エンボス加工）",
     "name_zh": "不锈钢 缎面压花（美护涂层+特殊压花加工）",
     "note": "易洁方案基准台面（P.83）；基本/简约设计方案在 2026.10 版不可选（旧版 ⊕14,000 已废止）。",
     "basicFor": [
      "kirei"
     ],
     "notOfferedFor": [],
     "planPrices": {
      "kirei": {
       "i": {
        "180": 0,
        "195": 0,
        "210": 0,
        "225": 0,
        "240": 0,
        "255": 0,
        "270": 0,
        "285": 0,
        "300": 0
       }
      }
     },
     "img": "assets/worktops/worktop_stainless_satin_emboss.jpg",
     "imgSrc": "P.113 サテンエンボス(E)",
     "note_ja": "きれいプラン基本仕様ワークトップ（P.83）。基本／スタイリッシュプランでは2026.10版で選択不可（旧版 ⊕14,000 は廃止）。"
    },
    {
     "code": "stainless_satin",
     "name_ja": "ステンレス サテン",
     "name_zh": "不锈钢 缎面",
     "pricesBySize": {
      "180": 29000,
      "195": 26000,
      "210": 23000,
      "225": 20000,
      "240": 17000,
      "255": 14000,
      "270": 11000,
      "285": 8000,
      "300": 5000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 29000,
        "195": 26000,
        "210": 23000,
        "225": 20000,
        "240": 17000,
        "255": 14000,
        "270": 11000,
        "285": 8000,
        "300": 5000
       },
       "l": {
        "180": 41000,
        "195": 39000,
        "210": 36000,
        "225": 33000,
        "240": 30000,
        "255": 27000,
        "270": 24000
       },
       "dual_kitchen": {
        "242.5": 17000,
        "257.5": 14000,
        "272.5": 11000
       },
       "tworow_conro": {
        "180": 29000
       },
       "tworow_sink": {
        "181.5": 29000
       }
      },
      "stylish": {
       "i": {
        "180": 84000,
        "195": 84000,
        "210": 84000,
        "225": 84000,
        "240": 84000,
        "255": 84000,
        "270": 84000,
        "285": 84000,
        "300": 84000
       },
       "dual_kitchen": {
        "242.5": 84000,
        "257.5": 84000,
        "272.5": 84000
       },
       "tworow_conro": {
        "180": 29000
       },
       "tworow_sink": {
        "181.5": 29000
       }
      },
      "kirei": {
       "tworow_conro": {
        "180": 29000
       },
       "tworow_sink": {
        "181.5": 29000
       }
      }
     },
     "imgNote": "手册 P.113 仅刊登サテンエンボス小样，无 plain サテン 实物图，故不配图。"
    },
    {
     "code": "stainless_vibration",
     "name_ja": "ステンレス バイブレーション",
     "name_zh": "不锈钢 振动纹",
     "pricesBySize": {
      "180": 165000,
      "195": 162000,
      "210": 159000,
      "225": 156000,
      "240": 153000,
      "255": 150000,
      "270": 147000,
      "285": 144000,
      "300": 141000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 165000,
        "195": 162000,
        "210": 159000,
        "225": 156000,
        "240": 153000,
        "255": 150000,
        "270": 147000,
        "285": 144000,
        "300": 141000
       },
       "l": {
        "180": 204000,
        "195": 202000,
        "210": 199000,
        "225": 196000,
        "240": 193000,
        "255": 190000,
        "270": 187000
       },
       "flat": {
        "80": 322000,
        "98": 214000
       },
       "dual_kitchen": {
        "242.5": 153000,
        "257.5": 150000,
        "272.5": 147000
       },
       "tworow_conro": {
        "180": 165000
       },
       "tworow_sink": {
        "181.5": 164000
       }
      },
      "stylish": {
       "i": {
        "180": 220000,
        "195": 220000,
        "210": 220000,
        "225": 220000,
        "240": 220000,
        "255": 220000,
        "270": 220000,
        "285": 220000,
        "300": 220000
       },
       "dual_kitchen": {
        "242.5": 220000,
        "257.5": 220000,
        "272.5": 220000
       },
       "tworow_conro": {
        "180": 165000
       },
       "tworow_sink": {
        "181.5": 164000
       }
      },
      "kirei": {
       "i": {
        "180": 136000,
        "195": 136000,
        "210": 136000,
        "225": 136000,
        "240": 136000,
        "255": 136000,
        "270": 136000,
        "285": 136000,
        "300": 136000
       },
       "tworow_conro": {
        "180": 165000
       },
       "tworow_sink": {
        "181.5": 164000
       }
      }
     },
     "note": "注意：齐平对面式基本方案 进深80cm ⊕322,000 / 进深98cm ⊕214,000（P.86 原文如此，与其他材质「进深越大越贵」相反，疑为手册印刷错误；本系统按手册原值录入）。双排型齐平对面式为 212,000/213,000（P.97）。",
     "img": "assets/worktops/worktop_stainless_vibration.jpg",
     "imgSrc": "P.113 バイブレーション(Z)",
     "note_ja": "注意：フラット対面基本プランは 奥行80cm ⊕322,000 / 奥行98cm ⊕214,000（P.86 の原文どおり。他の材質は「奥行が大きいほど高い」ため相反し、カタログの印刷ミスの可能性あり。本システムはカタログの原値をそのまま採用）。2列型フラット対面は 212,000/213,000（P.97）。"
    },
    {
     "code": "acrystone_powder",
     "name_ja": "アクリストン パウダー",
     "name_zh": "人造大理石 粉砂纹",
     "pricesBySize": {
      "180": 56000,
      "195": 57000,
      "210": 58000,
      "225": 59000,
      "240": 60000,
      "255": 61000,
      "270": 62000,
      "285": 63000,
      "300": 64000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 56000,
        "195": 57000,
        "210": 58000,
        "225": 59000,
        "240": 60000,
        "255": 61000,
        "270": 62000,
        "285": 63000,
        "300": 64000
       },
       "l": {
        "180": 103000,
        "195": 105000,
        "210": 106000,
        "225": 107000,
        "240": 108000,
        "255": 109000,
        "270": 110000
       },
       "flat": {
        "80": 44000,
        "98": 44000
       },
       "dual_kitchen": {
        "242.5": 60000,
        "257.5": 61000,
        "272.5": 62000
       },
       "tworow_conro": {
        "180": 56000
       },
       "tworow_sink": {
        "181.5": 58000
       }
      },
      "stylish": {
       "i": {
        "180": 111000,
        "195": 115000,
        "210": 119000,
        "225": 123000,
        "240": 127000,
        "255": 131000,
        "270": 135000,
        "285": 139000,
        "300": 143000
       },
       "dual_kitchen": {
        "242.5": 127000,
        "257.5": 131000,
        "272.5": 135000
       },
       "tworow_conro": {
        "180": 56000
       },
       "tworow_sink": {
        "181.5": 58000
       }
      },
      "kirei": {
       "i": {
        "180": 27000,
        "195": 31000,
        "210": 35000,
        "225": 39000,
        "240": 43000,
        "255": 47000,
        "270": 51000,
        "285": 55000,
        "300": 59000
       },
       "tworow_conro": {
        "180": 56000
       },
       "tworow_sink": {
        "181.5": 58000
       }
      }
     },
     "img": "assets/worktops/worktop_acrystone_powder.jpg",
     "imgSrc": "P.112 シュクルホワイト(A)"
    },
    {
     "code": "acrystone_gran",
     "name_ja": "アクリストン グラン",
     "name_zh": "人造大理石 格兰",
     "pricesBySize": {
      "180": 91000,
      "195": 92000,
      "210": 94000,
      "225": 96000,
      "240": 98000,
      "255": 100000,
      "270": 102000,
      "285": 104000,
      "300": 106000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 91000,
        "195": 92000,
        "210": 94000,
        "225": 96000,
        "240": 98000,
        "255": 100000,
        "270": 102000,
        "285": 104000,
        "300": 106000
       },
       "l": {
        "180": 185000,
        "195": 188000,
        "210": 190000,
        "225": 192000,
        "240": 194000,
        "255": 196000,
        "270": 198000
       },
       "flat": {
        "80": 97000,
        "98": 98000
       },
       "dual_kitchen": {
        "242.5": 98000,
        "257.5": 100000,
        "272.5": 102000
       },
       "tworow_conro": {
        "180": 91000
       },
       "tworow_sink": {
        "181.5": 93000
       }
      },
      "stylish": {
       "i": {
        "180": 146000,
        "195": 150000,
        "210": 155000,
        "225": 160000,
        "240": 165000,
        "255": 170000,
        "270": 175000,
        "285": 180000,
        "300": 185000
       },
       "dual_kitchen": {
        "242.5": 165000,
        "257.5": 170000,
        "272.5": 175000
       },
       "tworow_conro": {
        "180": 91000
       },
       "tworow_sink": {
        "181.5": 93000
       }
      },
      "kirei": {
       "i": {
        "180": 62000,
        "195": 66000,
        "210": 71000,
        "225": 76000,
        "240": 81000,
        "255": 86000,
        "270": 91000,
        "285": 96000,
        "300": 101000
       },
       "tworow_conro": {
        "180": 91000
       },
       "tworow_sink": {
        "181.5": 93000
       }
      }
     },
     "img": "assets/worktops/worktop_acrystone_gran.jpg",
     "imgSrc": "P.112 グランホワイト(L)"
    },
    {
     "code": "fortex_slate",
     "name_ja": "フォルテックス スレート",
     "name_zh": "硬质人造大理石 板岩纹",
     "pricesBySize": {
      "180": 147000,
      "195": 152000,
      "210": 157000,
      "225": 162000,
      "240": 167000,
      "255": 172000,
      "270": 177000,
      "285": 182000,
      "300": 187000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 147000,
        "195": 152000,
        "210": 157000,
        "225": 162000,
        "240": 167000,
        "255": 172000,
        "270": 177000,
        "285": 182000,
        "300": 187000
       },
       "l": {
        "180": 309000,
        "195": 315000,
        "210": 320000,
        "225": 325000,
        "240": 330000,
        "255": 335000,
        "270": 340000
       },
       "flat": {
        "80": 102000,
        "98": 103000
       },
       "dual_kitchen": {
        "242.5": 226000,
        "257.5": 234000,
        "272.5": 242000
       },
       "tworow_conro": {
        "180": 147000
       },
       "tworow_sink": {
        "181.5": 147000
       }
      },
      "stylish": {
       "i": {
        "180": 202000,
        "195": 210000,
        "210": 218000,
        "225": 226000,
        "240": 234000,
        "255": 242000,
        "270": 250000,
        "285": 258000,
        "300": 266000
       },
       "dual_kitchen": {
        "242.5": 293000,
        "257.5": 304000,
        "272.5": 315000
       },
       "tworow_conro": {
        "180": 147000
       },
       "tworow_sink": {
        "181.5": 147000
       }
      },
      "kirei": {
       "i": {
        "180": 118000,
        "195": 126000,
        "210": 134000,
        "225": 142000,
        "240": 150000,
        "255": 158000,
        "270": 166000,
        "285": 174000,
        "300": 182000
       },
       "tworow_conro": {
        "180": 147000
       },
       "tworow_sink": {
        "181.5": 147000
       }
      }
     },
     "img": "assets/worktops/worktop_fortex_slate.jpg",
     "imgSrc": "P.111 スレートホワイト(W)"
    },
    {
     "code": "fortex_elde",
     "name_ja": "フォルテックス エルデ",
     "name_zh": "硬质人造大理石 艾尔迪",
     "pricesBySize": {
      "180": 191000,
      "195": 196000,
      "210": 201000,
      "225": 206000,
      "240": 211000,
      "255": 216000,
      "270": 221000,
      "285": 226000,
      "300": 231000
     },
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 191000,
        "195": 196000,
        "210": 201000,
        "225": 206000,
        "240": 211000,
        "255": 216000,
        "270": 221000,
        "285": 226000,
        "300": 231000
       },
       "l": {
        "180": 397000,
        "195": 403000,
        "210": 408000,
        "225": 413000,
        "240": 418000,
        "255": 423000,
        "270": 428000
       },
       "flat": {
        "80": 157000,
        "98": 158000
       },
       "dual_kitchen": {
        "242.5": 276000,
        "257.5": 284000,
        "272.5": 292000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 191000
       }
      },
      "stylish": {
       "i": {
        "180": 246000,
        "195": 254000,
        "210": 262000,
        "225": 270000,
        "240": 278000,
        "255": 286000,
        "270": 294000,
        "285": 302000,
        "300": 310000
       },
       "dual_kitchen": {
        "242.5": 343000,
        "257.5": 354000,
        "272.5": 365000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 191000
       }
      },
      "kirei": {
       "i": {
        "180": 162000,
        "195": 170000,
        "210": 178000,
        "225": 186000,
        "240": 194000,
        "255": 202000,
        "270": 210000,
        "285": 218000,
        "300": 226000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 191000
       }
      }
     },
     "img": "assets/worktops/worktop_fortex_elde.jpg",
     "imgSrc": "P.111 エルデベージュ(G)"
    },
    {
     "code": "ceramic",
     "name_ja": "セラミックワークトップ",
     "name_zh": "陶瓷台面",
     "pricesBySize": {
      "180": 331000,
      "195": 339000,
      "210": 347000,
      "225": 355000,
      "240": 363000,
      "255": 371000,
      "270": 379000,
      "285": 387000,
      "300": 395000
     },
     "note": "颜色：阿尔巴里姆/克雷塔/马尔莫里奥/西里乌斯",
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 331000,
        "195": 339000,
        "210": 347000,
        "225": 355000,
        "240": 363000,
        "255": 371000,
        "270": 379000,
        "285": 387000,
        "300": 395000
       },
       "l": {
        "180": 623000,
        "195": 632000,
        "210": 640000,
        "225": 648000,
        "240": 656000,
        "255": 664000,
        "270": 672000
       },
       "flat": {
        "80": 490000,
        "98": 489000
       },
       "dual_kitchen": {
        "242.5": 443000,
        "257.5": 454000,
        "272.5": 465000
       },
       "tworow_conro": {
        "180": 331000
       },
       "tworow_sink": {
        "181.5": 334000
       }
      },
      "stylish": {
       "i": {
        "180": 386000,
        "195": 397000,
        "210": 408000,
        "225": 419000,
        "240": 430000,
        "255": 441000,
        "270": 452000,
        "285": 463000,
        "300": 474000
       },
       "dual_kitchen": {
        "242.5": 510000,
        "257.5": 524000,
        "272.5": 538000
       },
       "tworow_conro": {
        "180": 331000
       },
       "tworow_sink": {
        "181.5": 334000
       }
      },
      "kirei": {
       "i": {
        "180": 302000,
        "195": 313000,
        "210": 324000,
        "225": 335000,
        "240": 346000,
        "255": 357000,
        "270": 368000,
        "285": 379000,
        "300": 390000
       },
       "tworow_conro": {
        "180": 331000
       },
       "tworow_sink": {
        "181.5": 334000
       }
      }
     },
     "img": "assets/worktops/worktop_ceramic.jpg",
     "imgSrc": "P.110 アルバリウム(E)",
     "note_ja": "色：アルバリウム／クレタ／マルモリオ／シリウス"
    },
    {
     "code": "wood",
     "name_ja": "天然木ワークトップ",
     "name_zh": "天然木台面",
     "pricesBySize": {
      "180": 191000,
      "195": 196000,
      "210": 201000,
      "225": 206000,
      "240": 211000,
      "255": 216000,
      "270": 221000,
      "285": 226000,
      "300": 231000
     },
     "note": "颜色：橡木/橡木灰/胡桃木；仅限高台型",
     "basicFor": [],
     "notOfferedFor": [],
     "planPrices": {
      "basic": {
       "i": {
        "180": 191000,
        "195": 196000,
        "210": 201000,
        "225": 206000,
        "240": 211000,
        "255": 216000,
        "270": 221000,
        "285": 226000,
        "300": 231000
       },
       "flat": {
        "80": 174000,
        "98": 175000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 192000
       }
      },
      "stylish": {
       "i": {
        "180": 246000,
        "195": 254000,
        "210": 262000,
        "225": 270000,
        "240": 278000,
        "255": 286000,
        "270": 294000,
        "285": 302000,
        "300": 310000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 192000
       }
      },
      "kirei": {
       "i": {
        "180": 162000,
        "195": 170000,
        "210": 178000,
        "225": 186000,
        "240": 194000,
        "255": 202000,
        "270": 210000,
        "285": 218000,
        "300": 226000
       },
       "tworow_conro": {
        "180": 191000
       },
       "tworow_sink": {
        "181.5": 192000
       }
      }
     },
     "img": "assets/worktops/worktop_wood.jpg",
     "imgSrc": "P.108 オーク(J)",
     "note_ja": "色：オーク／オークグレー／ウォールナット。ハイタイプ限定"
    }
   ],
   "description_ja": "ワークトップ材質：ステンレス / アクリストン（人造大理石）/ フォルテックス（硬質人造大理石）/ セラミック / 天然木。加算額は間口により変わり、プランごとに基本仕様のワークトップが異なります。"
  },
  {
   "id": "sink",
   "name_ja": "シンク",
   "name_zh": "水槽",
   "step": 5,
   "pages": [
    8,
    41,
    42,
    43,
    44,
    45,
    46
   ],
   "description_zh": "水槽：标配 SY/SA，可选导流系列 / 美·静音 / 硬质人造大理石。差价基准为间口 255cm。",
   "options": [
    {
     "code": "SY",
     "name_ja": "標準シンク SY（W600）",
     "name_zh": "标准水槽 SY（W600）",
     "isBasic": true,
     "sizes": [
      "180",
      "195",
      "210",
      "225"
     ],
     "note": "适用间口 180～225cm（P.114）；一字型/L型套餐表中 225cm 以上以 SA 为基准（P.80/98）",
     "img": "assets/sinks/sink_SY.jpg",
     "imgSrc": "P.114 xref4960",
     "note_ja": "対応間口180〜225cm（P.114）。Ⅰ型／L型パッケージ表では225cm以上は SA が基本仕様（P.80/98）"
    },
    {
     "code": "SA",
     "name_ja": "標準シンク SA（W750）",
     "name_zh": "标准水槽 SA（W750）",
     "isBasic": true,
     "sizes": [
      "225",
      "240",
      "255",
      "270",
      "285",
      "300"
     ],
     "note": "适用间口 225～300cm（P.114）；齐平对面式/双层台面对面式/双排型的基准水槽（P.86/90/91/96/97）",
     "img": "assets/sinks/sink_SA.jpg",
     "imgSrc": "P.114 xref4959",
     "note_ja": "対応間口225〜300cm（P.114）。フラット対面／デュアルトップ対面／2列型の基本仕様シンク（P.86/90/91/96/97）"
    },
    {
     "code": "SV",
     "name_ja": "美・サイレントシンク（SV）",
     "name_zh": "美·静音水槽（SV）",
     "priceDiff": -42000,
     "note": "SA→SV / SY→SV 均为 −42,000（P.81）；适用间口 195～255cm（P.114）",
     "sizes": [
      "195",
      "210",
      "225",
      "240",
      "255"
     ],
     "img": "assets/sinks/sink_SV.jpg",
     "imgSrc": "P.114 xref4964",
     "note_ja": "SA→SV／SY→SV ともに −42,000（P.81）。対応間口195〜255cm（P.114）"
    },
    {
     "code": "AE",
     "name_ja": "流レールアクリストンシンク（AE）",
     "name_zh": "导流人造大理石水槽（AE）",
     "priceDiff": 40000,
     "note": "SA→AE / SY→AE 均为 ＋40,000（P.81）；适用间口 225～300cm（P.114）",
     "sizes": [
      "225",
      "240",
      "255",
      "270",
      "285",
      "300"
     ],
     "img": "assets/sinks/sink_AE.jpg",
     "imgSrc": "P.114 xref4958",
     "note_ja": "SA→AE／SY→AE ともに ＋40,000（P.81）。対応間口225〜300cm（P.114）"
    },
    {
     "code": "AK",
     "name_ja": "流レールフォルテックスシンク（AK）",
     "name_zh": "导流硬质人造大理石水槽（AK）",
     "priceDiff": 66000,
     "note": "SA→AK / SY→AK 均为 ＋66,000（P.81）；适用间口 225～300cm（P.114）",
     "sizes": [
      "225",
      "240",
      "255",
      "270",
      "285",
      "300"
     ],
     "img": "assets/sinks/sink_AK.jpg",
     "imgSrc": "P.114 xref4957",
     "note_ja": "SA→AK／SY→AK ともに ＋66,000（P.81）。対応間口225〜300cm（P.114）"
    },
    {
     "code": "RW",
     "name_ja": "流レールシンクワイド（RW）",
     "name_zh": "导流宽水槽（RW）",
     "priceDiff": 55000,
     "note": "SA→RW ＋55,000（间口 255cm 时，P.81）；适用间口 225～300cm（P.114）",
     "sizes": [
      "225",
      "240",
      "255",
      "270",
      "285",
      "300"
     ],
     "img": "assets/sinks/sink_RW.jpg",
     "imgSrc": "P.114 xref4962",
     "note_ja": "SA→RW ＋55,000（間口255cm の場合、P.81）。対応間口225〜300cm（P.114）"
    }
   ],
   "description_ja": "シンク：基本仕様は SY/SA。流レールシリーズ / 美・サイレント / 硬質人造大理石から選択できます。差額の基準は間口255cmです。"
  },
  {
   "id": "cabinet",
   "name_ja": "フロアキャビネット",
   "name_zh": "地柜",
   "step": 6,
   "pages": [
    8,
    49,
    50,
    51,
    52,
    53,
    54
   ],
   "description_zh": "地柜加装项（可多选）。单元类型见地柜类型表（水槽柜/基础柜/灶具柜/转角柜），类型本身为基本仕様无差价。",
   "additive": true,
   "options": [
    {
     "code": "slidebox_sink",
     "name_ja": "スライドボックス シンクキャビネット",
     "name_zh": "抽拉收纳盒 水槽柜",
     "priceDiff": null,
     "note": "P.81 に単独加算額の記載なし；コンセント付仕様（ZKIS）は ⊕34,000 を参照"
    },
    {
     "code": "slidebox_base",
     "name_ja": "スライドボックス ベースキャビネット",
     "name_zh": "抽拉收纳盒 基础柜",
     "priceDiff": 40000,
     "note": "間口255cm の場合（P.81）"
    },
    {
     "code": "slidebox_cooktop",
     "name_ja": "スライドボックス コンロキャビネット",
     "name_zh": "抽拉收纳盒 灶具柜",
     "priceDiff": 33000,
     "note": "間口255cm·ガスコンロの場合（P.81）"
    },
    {
     "code": "sink_outlet",
     "name_ja": "シンクキャビネット（コンセント付）",
     "name_zh": "水槽柜（带插座）",
     "priceDiff": 34000,
     "model": "ZKIS(S·B)(R·L)-G",
     "note": "専用コンセント シルバー/ブラック；専用シンクキャビネット要（ディスポーザー/開き扉/オープン/奥行60cm 不可）"
    },
    {
     "code": "cooktop_drawer",
     "name_ja": "コンロ横引き出し 扉面材統一",
     "name_zh": "灶侧抽屉门板材质统一",
     "priceDiff": 15000,
     "note": "⊕15,000（全扉共通、P.126）"
    },
    {
     "code": "cross_gallery",
     "name_ja": "クロスギャラリー（1本）",
     "name_zh": "抽屉横杆",
     "pricesBySize": {
      "30": 3000,
      "45": 3000,
      "60": 3000,
      "75": 3000,
      "90": 4000,
      "105": 4000
     },
     "model": "ZKH030CN-K〜ZKH105CN-K",
     "note": "间口=柜体自身间口（P.127）；付き用（インセットパネル付き DN-K）75/90/105 = 3,000/4,000/4,000",
     "note_ja": "間口＝キャビネット本体の間口（P.127）。付き用（インセットパネル付き DN-K）75/90/105 = 3,000/4,000/4,000"
    },
    {
     "code": "bottle_stand",
     "name_ja": "ボトル立て",
     "name_zh": "瓶罐收纳架",
     "pricesBySize": {
      "30": 4000,
      "45": 4000,
      "60": 4000,
      "75": 5000,
      "90": 6000
     },
     "model": "ZKH030EN-K〜ZKH090EN-K"
    },
    {
     "code": "ladle_pocket",
     "name_ja": "レードルポケット",
     "name_zh": "长柄勺收纳槽",
     "priceDiff": 3000,
     "model": "ZKHXWN-K"
    },
    {
     "code": "frypan_rack",
     "name_ja": "フライパンラック",
     "name_zh": "平底锅架",
     "priceDiff": 10000,
     "model": "ZKHGNN-K",
     "note": "コンロキャビネット引出し用；スライドボックス付引出し不可"
    },
    {
     "code": "towel_holder",
     "name_ja": "シンクキャビネット引き出し用タオル掛け",
     "name_zh": "水槽柜抽屉毛巾挂",
     "items": [
      {
       "name_ja": "ライン取手用",
       "name_zh": "线条把手用",
       "price": 5000,
       "model": "ZKHTK(N·B)-K"
      },
      {
       "name_ja": "バー取手用",
       "name_zh": "横杆把手用",
       "price": 5000,
       "model": "ZKHCB(N·B)-K"
      }
     ],
     "note": "2段目引き出し用；バー取手用不可装 75cm シンクキャビネット/class2/class3(CP※) 门",
     "note_ja": "2段目引き出し用。バー取手用の 75cm シンクキャビネット／class2・class3（CP※）扉には取付不可。"
    },
    {
     "code": "riser",
     "name_ja": "フロアコンテナ用ライザー",
     "name_zh": "落地收纳柜垫高座",
     "priceDiff": 6000,
     "model": "ZKCFNN-K"
    }
   ],
   "description_ja": "フロアキャビネットの追加項目（複数選択可）。ユニットタイプはキャビネットタイプ表（シンクキャビネット / ベースキャビネット / コンロキャビネット / コーナーキャビネット）を参照。タイプ自体は基本仕様で、差額はありません。"
  },
  {
   "id": "faucet",
   "name_ja": "水栓",
   "name_zh": "水龙头",
   "step": 7,
   "pages": [
    8,
    55,
    56,
    57,
    58
   ],
   "description_zh": "水龙头：净水器一体型为基本，可选 Efine / 感应式 / 鹅颈式 等。",
   "options": [
    {
     "code": "joksuiki",
     "name_ja": "浄水器一体型シングルレバー水栓",
     "name_zh": "净水器一体型单把手水龙头",
     "model": "ZZJFAB466SYX",
     "price": 74000,
     "note": "基准规格（P.81）；含滤芯 ZSPBZ300R14AC；寒冷地区 ZZJFAB466SYXN",
     "baseSpec": {
      "basic": true
     },
     "note_ja": "基本仕様（P.81）。カートリッジ ZSPBZ300R14AC 含む。寒冷地 ZZJFAB466SYXN"
    },
    {
     "code": "shower",
     "name_ja": "シングルレバー水栓（シャワーホースタイプ）",
     "name_zh": "单把手水龙头（花洒软管式）",
     "priceDiff": 4000,
     "priceDiffCold": 6000,
     "model": "ZZKM5021TEC",
     "note": "一般地区 ＋4,000 / 寒冷地区 ＋6,000（P.81）；简约设计方案基准规格（P.82）",
     "baseSpec": {
      "stylish": true
     },
     "note_ja": "一般地 ＋4,000／寒冷地 ＋6,000（P.81）。スタイリッシュプラン基本仕様（P.82）"
    },
    {
     "code": "touchless",
     "name_ja": "タッチレス水栓",
     "name_zh": "感应水龙头",
     "priceDiff": 56000,
     "priceDiffCold": 59000,
     "model": "ZZSFNAA451SY",
     "note": "一般地 ＋56,000 / 寒冷地 ＋59,000（P.81）"
    },
    {
     "code": "efine",
     "name_ja": "Efine（エフィーネ）（浄水器兼用タイプ）",
     "name_zh": "Efine（净水器兼用式）",
     "priceDiff": 84000,
     "model": "ZZKM6381EC",
     "note": "＋84,000（P.81）；易洁方案基准规格（P.83）；含滤芯 ZSPBZ300R14AC",
     "baseSpec": {
      "kirei": true
     },
     "note_ja": "＋84,000（P.81）。きれいプラン基本仕様（P.83）。カートリッジ ZSPBZ300R14AC 含む"
    },
    {
     "code": "gooseneck",
     "name_ja": "グースネック水栓",
     "name_zh": "鹅颈水龙头",
     "priceDiff": null,
     "model": "ZZKM6061EC",
     "note": "本体価格 ¥101,000（P.130、2026.10）。手册未载此水栓的套餐加算額，差价待核；不可用「本体价−基准价」推算——Efine 本体¥122,000−¥74,000=48,000，但 P.81 实际加算为 ⊕84,000。",
     "unitPrice": 101000,
     "note_ja": "本体価格 ¥101,000（P.130、2026.10）。この水栓のパッケージ加算額はカタログに記載がなく、差額は未確定。「本体価格−基準価格」での推算は不可——Efine は本体¥122,000−¥74,000=48,000 だが、P.81 の実際の加算額は ⊕84,000。"
    },
    {
     "code": "gracia",
     "name_ja": "GRACIA L型（電解水素水生成器兼用）",
     "name_zh": "GRACIA L型（电解水素水生成器兼用）",
     "priceDiff": null,
     "model": "ZZGRACIAL",
     "note": "本体価格 ¥490,000（P.130、2026.10）。手册未载此水栓的套餐加算額，差价待核；不可用「本体价−基准价」推算——Efine 本体¥122,000−¥74,000=48,000，但 P.81 实际加算为 ⊕84,000。",
     "unitPrice": 490000,
     "note_ja": "本体価格 ¥490,000（P.130、2026.10）。この水栓のパッケージ加算額はカタログに記載がなく、差額は未確定。「本体価格−基準価格」での推算は不可——Efine は本体¥122,000−¥74,000=48,000 だが、P.81 の実際の加算額は ⊕84,000。"
    },
    {
     "code": "handsfree",
     "name_ja": "ハンズフリー水栓（浄水器兼用タイプ）",
     "name_zh": "免触水龙头（净水器兼用式）",
     "priceDiff": null,
     "model": "ZZJFNA411SY",
     "note": "本体価格 ¥227,000（P.130、2026.10）。手册未载此水栓的套餐加算額，差价待核；不可用「本体价−基准价」推算——Efine 本体¥122,000−¥74,000=48,000，但 P.81 实际加算为 ⊕84,000。",
     "unitPrice": 227000,
     "note_ja": "本体価格 ¥227,000（P.130、2026.10）。この水栓のパッケージ加算額はカタログに記載がなく、差額は未確定。「本体価格−基準価格」での推算は不可——Efine は本体¥122,000−¥74,000=48,000 だが、P.81 の実際の加算額は ⊕84,000。"
    },
    {
     "code": "none",
     "name_ja": "水栓なし",
     "name_zh": "不装水龙头",
     "priceDiff": -74000,
     "note": "不选减额=净水器一体型单把手水龙头本体 ¥74,000（P.81）",
     "note_ja": "非選択時の減額＝浄水器一体型シングルレバー水栓 本体 ¥74,000（P.81）"
    }
   ],
   "description_ja": "水栓：浄水器一体型が基本仕様。Efine / タッチレス / グースネックなどから選択できます。"
  },
  {
   "id": "dishwasher",
   "name_ja": "食器洗い乾燥機",
   "name_zh": "洗碗机",
   "step": 8,
   "pages": [
    8,
    59,
    60,
    61,
    62
   ],
   "description_zh": "洗碗机（嵌入式）：间口 240cm 未满不可安装，L型水槽侧同样需 240cm 以上。差价基准为间口 255cm·class5。",
   "options": [
    {
     "code": "none",
     "name_ja": "食器洗い乾燥機なし",
     "name_zh": "不安装洗碗机",
     "isBasic": true
    },
    {
     "code": "std",
     "name_ja": "ストリーム除菌付スタンダードタイプ",
     "name_zh": "蒸汽除菌标准型",
     "priceDiff": 138000,
     "model": "ZWPP45M21GDS/21GDK",
     "note": "基本/易洁方案 ＋138,000（P.81/83）；简约设计方案为 ZWPP45M21GDK ＋152,000（P.82/91）；L型 ＋110,000（水槽侧间口 240cm 以上，P.98）；双排型 ＋161,000（P.96/97）；以间口 255cm 为基准",
     "planDiffs": {
      "basic": {
       "i": 138000,
       "flat": 138000,
       "dual": 138000,
       "tworow": 161000,
       "l": 110000
      },
      "kirei": {
       "i": 138000,
       "flat": 138000,
       "dual": 138000,
       "tworow": 161000,
       "l": 110000
      },
      "stylish": {
       "i": 152000,
       "flat": 152000,
       "dual": 152000,
       "tworow": 161000,
       "l": 110000
      }
     },
     "note_ja": "基本／きれいプラン ＋138,000（P.81/83）。スタイリッシュプランは ZWPP45M21GDK ＋152,000（P.82/91）。L型 ＋110,000（シンク側間口240cm以上、P.98）。2列型 ＋161,000（P.96/97）。間口255cm 基準"
    },
    {
     "code": "liteco",
     "name_ja": "ライトエコ付ストリーム除菌タイプ",
     "name_zh": "轻量节能蒸汽除菌型",
     "priceDiff": 211000,
     "model": "ZWPP45M21BDS"
    },
    {
     "code": "plasma",
     "name_ja": "プラズマクラスター＆重曹洗浄コース付タイプ",
     "name_zh": "等离子簇+小苏打清洗型",
     "priceDiff": 239000,
     "model": "ZWPM45R22DDU"
    },
    {
     "code": "econavi",
     "name_ja": "省エネナビ付ストリーム除菌タイプ",
     "name_zh": "节能向导蒸汽除菌型",
     "priceDiff": 246000,
     "model": "ZWPM45M21CDU"
    }
   ],
   "description_ja": "食器洗い乾燥機（ビルトイン）：間口240cm未満は組み込み不可。L型もシンク側が240cm以上必要です。差額の基準は間口255cm・class5です。"
  },
  {
   "id": "cooktop",
   "name_ja": "加熱機器",
   "name_zh": "灶具",
   "step": 9,
   "pages": [
    8,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72
   ],
   "description_zh": "灶具：玻璃面板燃气灶 XSS 为基本，可选 Lisse / DELICIA / IH 电磁炉。",
   "options": [
    {
     "code": "XSS",
     "name_ja": "ガラストップコンロ（XSS）",
     "name_zh": "玻璃面板燃气灶（XSS）",
     "model": "ZGFVK6R22XSS-K",
     "note": "基准规格（基本/简约设计方案，P.81/82）；本体 ¥188,000",
     "baseSpec": {
      "basic": true,
      "stylish": true
     },
     "note_ja": "基本仕様（基本／スタイリッシュプラン、P.81/82）。本体 ¥188,000"
    },
    {
     "code": "FSS",
     "name_ja": "ガラストップコンロ（FSS）",
     "name_zh": "玻璃面板燃气灶（FSS）",
     "priceDiff": 48000,
     "model": "ZGGRK6R24FSS-K",
     "note": "＋48,000（P.81）；易洁方案基准规格（P.83）",
     "baseSpec": {
      "kirei": true
     },
     "note_ja": "＋48,000（P.81）。きれいプラン基本仕様（P.83）"
    },
    {
     "code": "lisse",
     "name_ja": "ガラストップコンロ Lisse（リッセ）",
     "name_zh": "玻璃面板燃气灶 Lisse",
     "priceDiff": 164000,
     "model": "ZGGRK7R24QUS-K"
    },
    {
     "code": "delicia",
     "name_ja": "ガラストップコンロ DELICIA（デリシア）",
     "name_zh": "玻璃面板燃气灶 DELICIA",
     "priceDiff": 302000,
     "model": "ZGGCK7R24VUS-K",
     "note": "＋302,000；含专用隔板 ¥19,000（P.81）",
     "note_ja": "＋302,000。専用仕切板 ¥19,000 含む（P.81）"
    },
    {
     "code": "ih2",
     "name_ja": "2口IH＋ラジエントヒーター",
     "name_zh": "双口IH+电陶炉",
     "priceDiff": 160000,
     "model": "ZZCSG318MSR"
    },
    {
     "code": "ih3",
     "name_ja": "3口IHヒーター",
     "name_zh": "三口IH电磁炉",
     "priceDiff": 176000,
     "model": "ZEHCZ6H22RSS"
    },
    {
     "code": "ih3allmetal",
     "name_ja": "1口オールメタル対応3口IHヒーター",
     "name_zh": "三口IH（1口全金属锅适用）",
     "priceDiff": 391000,
     "model": "ZEHRA6M24NSS"
    },
    {
     "code": "none",
     "name_ja": "コンロなし",
     "name_zh": "不装灶具",
     "priceDiff": -188000,
     "note": "不选减额=玻璃面板燃气灶（XSS）本体 ¥188,000（P.81）",
     "note_ja": "非選択時の減額＝ガラストップコンロ XSS 本体 ¥188,000（P.81）"
    }
   ],
   "description_ja": "加熱機器：ガラストップコンロ XSS が基本仕様。Lisse / DELICIA / IHクッキングヒーターから選択できます。"
  },
  {
   "id": "hood",
   "name_ja": "レンジフード",
   "name_zh": "抽油烟机",
   "step": 10,
   "pages": [
    8,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80
   ],
   "description_zh": "抽油烟机：简约超薄为基本，可选深型 / 超易清洗 / 自动清洗。深型差价按 class 递变。",
   "options": [
    {
     "code": "simpleslim",
     "name_ja": "シンプルスリムレンジフード（鋼板前・横幕板）",
     "name_zh": "简约超薄抽油烟机（钢板前挡+侧挡板）",
     "model": "ZRS90ACK24FS(R-L)",
     "note": "基准规格（基本/简约设计方案，P.81）；按 class 区分本体 230,000/207,000/173,000/166,000/163,000",
     "baseSpec": {
      "basic": [
       "i",
       "l",
       "tworow"
      ],
      "stylish": [
       "i",
       "l",
       "tworow"
      ]
     },
     "layouts": [
      "i",
      "l",
      "tworow"
     ],
     "hoodWidth": 90,
     "note_ja": "基本仕様（基本／スタイリッシュプラン、P.81）。class別本体 230,000/207,000/173,000/166,000/163,000"
    },
    {
     "code": "deep",
     "name_ja": "深型レンジフード（シロッコファン）",
     "name_zh": "深型抽油烟机（多翼离心风机）",
     "priceMatrix": {
      "class1": -94000,
      "class2": -71000,
      "class3": -37000,
      "class4": -30000,
      "class5": -27000
     },
     "model": "ZRS90NAY20FSZ",
     "note": "深型为减价（相对简约超薄抽油烟机基本规格）",
     "hoodWidth": 90,
     "note_ja": "深型は減額（シンプルスリム基本仕様に対して）"
    },
    {
     "code": "tottemo",
     "name_ja": "とってもクリンフード",
     "name_zh": "超易清洗抽油烟机",
     "priceDiff": 55000,
     "model": "ZRS90ACH22FSZ",
     "hoodWidth": 90
    },
    {
     "code": "araiyell",
     "name_ja": "洗エールレンジフード",
     "name_zh": "自动清洗抽油烟机",
     "priceDiff": 123000,
     "model": "ZRS90ACF22MSZ",
     "note": "＋123,000（P.81）；易洁方案基准规格（P.83）",
     "baseSpec": {
      "kirei": [
       "i",
       "l",
       "tworow"
      ]
     },
     "hoodWidth": 90,
     "note_ja": "＋123,000（P.81）。きれいプラン基本仕様（P.83）"
    },
    {
     "code": "simpleslimJ",
     "name_ja": "シンプルスリムJタイプフード（サイド/センター）",
     "name_zh": "简约超薄J型抽油烟机（侧/中置）",
     "priceDiff": null,
     "layouts": [
      "flat",
      "dual"
     ],
     "model": "ZRS90SCD21FS(R-L)",
     "note": "面对面式（齐平/双层台）基准规格：侧置型 银色（P.86/90/91）。仅本体价格（P.152）：侧置 ZRS90SCD21FW/FS ¥218,000·FT ¥245,000；中置 ZRS90CCE21FWZ/FSZ ¥272,000·FTZ ¥298,000。",
     "baseSpec": {
      "basic": [
       "flat",
       "dual"
      ],
      "stylish": [
       "flat",
       "dual"
      ],
      "kirei": [
       "flat",
       "dual"
      ]
     },
     "hoodWidth": 90,
     "note_ja": "対面（フラット／デュアル）基本仕様：サイドタイプ シルバー（P.86/90/91）。本体のみ価格（P.152）：サイド ZRS90SCD21FW/FS ¥218,000・FT ¥245,000；センター ZRS90CCE21FWZ/FSZ ¥272,000・FTZ ¥298,000。"
    },
    {
     "code": "none",
     "name_ja": "レンジフードなし",
     "name_zh": "不装抽油烟机",
     "priceMatrix": {
      "class1": -230000,
      "class2": -207000,
      "class3": -173000,
      "class4": -166000,
      "class5": -163000
     },
     "note": "不选减额=简约超薄抽油烟机本体（按 class 区分、P.81）",
     "hoodWidth": 0,
     "note_ja": "非選択時の減額＝シンプルスリムレンジフード本体（class別、P.81）"
    },
    {
     "code": "hood_maruta",
     "name_ja": "レンジフード幕板（扉面材タイプ）",
     "name_zh": "油烟机门板同色围板",
     "priceMatrix": {
      "class1": 142000,
      "class2": 111000,
      "class3": 45000,
      "class4": 32000,
      "class5": 26000
     },
     "note": "P.82 简约设计方案 ＋OPTION；油烟机前板与侧板统一采用厨房门板面材。基本/易洁方案页面未载此加算额。",
     "plans": [
      "stylish"
     ],
     "hoodWidth": 90,
     "note_ja": "P.82 スタイリッシュプラン ＋OPTION。レンジフードの前板と横板をキッチン扉面材で統一。基本／きれいプランのページには本加算額の記載なし。"
    }
   ],
   "widthNote": "パッケージのレンジフード品番はすべて ZRS90…＝間口90cm（P.81、P.150–152）。一般ラインナップには60/75cmもあるが本システムのパッケージ选项は90cmのみ。吊柜側の横並び合計にこの90cmを加算する。",
   "description_ja": "レンジフード：シンプルスリムが基本仕様。深型 / とってもクリン / 洗エールから選択できます。深型の差額はグレードにより変わります。"
  },
  {
   "id": "wallcabinet",
   "name_ja": "吊戸棚（ウォールキャビネット）",
   "name_zh": "吊柜",
   "step": 11,
   "pages": [
    156,
    157,
    158,
    159,
    160,
    161
   ],
   "description_zh": "吊柜单元类型：手动升降 / 眼前区收纳盒 / 电动升降 / 吊戸棚 / 半透明门 / 下拉式 / LED灯。手动升降价表＝class × 间口75·90 × 有无照明。",
   "options": [
    {
     "code": "automove",
     "name_ja": "オートムーブシステム",
     "name_zh": "电动升降吊柜",
     "prices": {
      "class1": {
       "240": 373000,
       "255": 384000,
       "270": 394000
      },
      "class2": {
       "240": 373000,
       "255": 379000,
       "270": 389000
      },
      "class3": {
       "240": 344000,
       "255": 352000,
       "270": 359000
      },
      "class4": {
       "240": 369000,
       "255": 380000,
       "270": 391000
      },
      "class5": {
       "240": 388000,
       "255": 403000,
       "270": 418000
      }
     }
    },
    {
     "code": "handmove",
     "name_ja": "ハンドムーブ",
     "name_zh": "手动升降吊柜",
     "prices": {
      "class1": {
       "240": 212000,
       "255": 207000,
       "270": 201000
      },
      "class2": {
       "240": 218000,
       "255": 215000,
       "270": 214000
      },
      "class3": {
       "240": 170000,
       "255": 167000,
       "270": 162000
      },
      "class4": {
       "240": 183000,
       "255": 184000,
       "270": 184000
      },
      "class5": {
       "240": 161000,
       "255": 166000,
       "270": 170000
      }
     }
    },
    {
     "code": "none",
     "name_ja": "吊戸棚なし",
     "name_zh": "不安装吊柜",
     "prices": {
      "class1": {
       "240": -185000,
       "255": -199000,
       "270": -214000
      },
      "class2": {
       "240": -127000,
       "255": -138000,
       "270": -147000
      },
      "class3": {
       "240": -113000,
       "255": -123000,
       "270": -135000
      },
      "class4": {
       "240": -72000,
       "255": -77000,
       "270": -83000
      },
      "class5": {
       "240": -48000,
       "255": -49000,
       "270": -51000
      }
     }
    }
   ],
   "description_ja": "吊戸棚のユニットタイプ：ハンドムーブ / アイエリアボックス / オートムーブシステム / 吊戸棚 / シースルー吊戸棚 / ムーブダウン吊戸棚 / LED照明。ハンドムーブの価格表＝グレード × 間口75・90 × 照明の有無。"
  },
  {
   "id": "peripheral",
   "name_ja": "周辺収納",
   "name_zh": "周边收纳",
   "step": 12,
   "pages": [
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108
   ],
   "description_zh": "周边收纳（独立单价表，间口×class 计价，详见 peripheralPrices）。",
   "options": [
    {
     "code": "pantry_basic",
     "name_ja": "スライドパントリー（基本プラン）",
     "name_zh": "抽拉式储藏高柜（基本系列）",
     "sizes": [
      "90",
      "105",
      "120",
      "135",
      "150",
      "180"
     ],
     "depth": [
      "45",
      "55",
      "65"
     ],
     "ref": "peripheralPrices.pantry_basic"
    },
    {
     "code": "pantry_care",
     "name_ja": "スライドパントリー（高さケアプラン）",
     "name_zh": "抽拉式储藏高柜（高度适配★方案）",
     "sizes": [
      "120",
      "150",
      "180"
     ],
     "depth": [
      "45",
      "55"
     ],
     "ref": "peripheralPrices.pantry_care",
     "note": "手册 P.177 仅列「高さケア★プラン」表名，未给出释义；中文暂译「高度适配」，正式含义待営業所確認。",
     "note_ja": "カタログ P.177 には「高さケア★プラン」の表名のみが掲載され、説明はありません。正式な意味は営業所への確認が必要です。"
    },
    {
     "code": "pantry_short",
     "name_ja": "スライドパントリー（ショートタイプ）",
     "name_zh": "抽拉式储藏高柜（矮型）",
     "sizes": [
      "90",
      "105",
      "120",
      "135",
      "150",
      "180"
     ],
     "depth": [
      "45"
     ],
     "ref": "peripheralPrices.pantry_short"
    },
    {
     "code": "floor_counter",
     "name_ja": "片面フロアカウンター",
     "name_zh": "单面操作台柜",
     "sizes": [
      "120",
      "135",
      "150",
      "165",
      "180"
     ],
     "depth": [
      "45"
     ],
     "ref": "peripheralPrices.floor_counter"
    },
    {
     "code": "high_floor_counter",
     "name_ja": "片面ハイフロアカウンター",
     "name_zh": "单面高操作台柜",
     "sizes": [
      "120",
      "135",
      "150",
      "165",
      "180"
     ],
     "depth": [
      "45"
     ],
     "ref": "peripheralPrices.high_floor_counter"
    },
    {
     "code": "cafe_cupboard_counter",
     "name_ja": "カフェスタイル収納（カップボード+フロアカウンター）",
     "name_zh": "咖啡馆风收纳（餐边柜+操作台柜）",
     "sizes": [
      "120",
      "135",
      "150",
      "165",
      "180"
     ],
     "ref": "peripheralPrices.cafe_cupboard_counter"
    },
    {
     "code": "cafe_counter",
     "name_ja": "カフェスタイル収納（片面フロアカウンター）",
     "name_zh": "咖啡馆风收纳（单面操作台柜）",
     "sizes": [
      "135",
      "150",
      "165",
      "180"
     ],
     "ref": "peripheralPrices.cafe_counter"
    }
   ],
   "description_ja": "周辺収納（独立した単価表。間口×グレードで算出します。peripheralPrices 参照）。"
  },
  {
   "id": "other",
   "name_ja": "その他・資料",
   "name_zh": "其他·资料",
   "step": 13,
   "pages": [
    33,
    34
   ],
   "description_zh": "克林墙面板 / 置物架 / 资料下载。墙面板色号：随机砖纹(EA)·陶瓷深色(GD)·白色大理石(GH)·摩洛哥蓝灰(EV)·陶瓷灰(GG)·斜砖白(GW)·磁吸白(FH)·磁吸颗粒白(FW)·磁吸颗粒灰米(FB)·磁吸水泥灰(HG)·磁吸水泥炭(HD)·透明不锈钢(SD)；认定 NM-2183 / NM-2687(FH) / NM-5872(FW·FB·HG·HD) / NM-5843（P.106）。",
   "options": [
    {
     "code": "link_shelf_hook",
     "name_ja": "リンクシェルフ（フックタイプ）",
     "name_zh": "置物架（挂钩式）",
     "price": 15000,
     "price45": 19000,
     "model": "ZKR030RH※-K",
     "note": "間口30cm ¥15,000 / 45cm ¥19,000（P.107）"
    },
    {
     "code": "link_shelf_bar",
     "name_ja": "リンクシェルフ バー",
     "name_zh": "置物架 横杆",
     "price": 8000,
     "price45": 10000,
     "model": "ZKR030BN（S·B）-K",
     "note": "間口30cm ¥8,000 / 45cm ¥10,000（P.107）"
    },
    {
     "code": "link_shelf_magnet",
     "name_ja": "ピタッとリンクシェルフ（マグネット）",
     "name_zh": "磁吸置物架",
     "price": 20000,
     "price45": 23000,
     "model": "ZKR030RM※-K",
     "note": "間口30cm ¥20,000 / 45cm ¥23,000（P.107）"
    }
   ],
   "downloads": [
    {
     "label": "Stedia プランニングガイド（手册 PDF·2026.10 価格改定版）",
     "url": "https://pan.baidu.com/s/10M37F8PTtY_zOkbmR9Xfvw?pwd=hfba",
     "linkNote": "提取码：hfba"
    },
    {
     "label": "Cleanup Stedia 官网",
     "url": "https://cleanup.jp/"
    }
   ],
   "note": "カップボード / 扉付トール家電収納庫：规格见手册 P100/102，价格在别册プランニングカタログ，本系统暂不收录。",
   "description_ja": "クリン壁パネル / リンクシェルフ / 資料ダウンロード。壁パネル品番：ランダムブリック(EA)・セラミカダーク(GD)・ホワイトマーブル(GH)・モロッコブルーグレー(EV)・セラミカグレー(GG)・オブリックホワイト(GW)・マグネットホワイト(FH)・マグネットクランチホワイト(FW)・マグネットクランチグレージュ(FB)・マグネットモルタルグレー(HG)・マグネットモルタルチャコール(HD)・ステンレスクリア(SD)；国土交通大臣認定 NM-2183 / NM-2687(FH) / NM-5872(FW・FB・HG・HD) / NM-5843（P.106）。"
  }
 ],
 "sizes": [
  {
   "layout": "i",
   "plan": "basic",
   "width": "180",
   "name_ja": "間口180cm",
   "name_zh": "宽180cm",
   "prices": {
    "class1": 1875000,
    "class2": 1666000,
    "class3": 1456000,
    "class4": 1330000,
    "class5": 1233000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "195",
   "name_ja": "間口195cm",
   "name_zh": "宽195cm",
   "prices": {
    "class1": 1778000,
    "class2": 1633000,
    "class3": 1432000,
    "class4": 1315000,
    "class5": 1217000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "210",
   "name_ja": "間口210cm",
   "name_zh": "宽210cm",
   "prices": {
    "class1": 1829000,
    "class2": 1687000,
    "class3": 1479000,
    "class4": 1344000,
    "class5": 1243000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "225",
   "name_ja": "間口225cm",
   "name_zh": "宽225cm",
   "prices": {
    "class1": 1886000,
    "class2": 1745000,
    "class3": 1529000,
    "class4": 1376000,
    "class5": 1276000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "240",
   "name_ja": "間口240cm",
   "name_zh": "宽240cm",
   "prices": {
    "class1": 1910000,
    "class2": 1755000,
    "class3": 1571000,
    "class4": 1399000,
    "class5": 1299000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "255",
   "name_ja": "間口255cm",
   "name_zh": "宽255cm",
   "prices": {
    "class1": 1954000,
    "class2": 1795000,
    "class3": 1604000,
    "class4": 1425000,
    "class5": 1317000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "270",
   "name_ja": "間口270cm",
   "name_zh": "宽270cm",
   "prices": {
    "class1": 2087000,
    "class2": 1910000,
    "class3": 1701000,
    "class4": 1512000,
    "class5": 1396000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "285",
   "name_ja": "間口285cm",
   "name_zh": "宽285cm",
   "prices": {
    "class1": 2155000,
    "class2": 1976000,
    "class3": 1739000,
    "class4": 1552000,
    "class5": 1437000
   }
  },
  {
   "layout": "i",
   "plan": "basic",
   "width": "300",
   "name_ja": "間口300cm",
   "name_zh": "宽300cm",
   "prices": {
    "class1": 2210000,
    "class2": 2032000,
    "class3": 1788000,
    "class4": 1585000,
    "class5": 1461000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "180",
   "name_ja": "間口180cm",
   "name_zh": "宽180cm",
   "prices": {
    "class1": 1172000,
    "class2": 1087000,
    "class3": 973000,
    "class4": 889000,
    "class5": 831000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "195",
   "name_ja": "間口195cm",
   "name_zh": "宽195cm",
   "prices": {
    "class1": 1200000,
    "class2": 1114000,
    "class3": 994000,
    "class4": 907000,
    "class5": 846000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "210",
   "name_ja": "間口210cm",
   "name_zh": "宽210cm",
   "prices": {
    "class1": 1238000,
    "class2": 1157000,
    "class3": 1030000,
    "class4": 931000,
    "class5": 867000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "225",
   "name_ja": "間口225cm",
   "name_zh": "宽225cm",
   "prices": {
    "class1": 1264000,
    "class2": 1187000,
    "class3": 1055000,
    "class4": 941000,
    "class5": 882000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "240",
   "name_ja": "間口240cm",
   "name_zh": "宽240cm",
   "prices": {
    "class1": 1303000,
    "class2": 1229000,
    "class3": 1093000,
    "class4": 969000,
    "class5": 896000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "255",
   "name_ja": "間口255cm",
   "name_zh": "宽255cm",
   "prices": {
    "class1": 1330000,
    "class2": 1255000,
    "class3": 1113000,
    "class4": 987000,
    "class5": 910000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "270",
   "name_ja": "間口270cm",
   "name_zh": "宽270cm",
   "prices": {
    "class1": 1430000,
    "class2": 1343000,
    "class3": 1180000,
    "class4": 1050000,
    "class5": 969000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "285",
   "name_ja": "間口285cm",
   "name_zh": "宽285cm",
   "prices": {
    "class1": 1457000,
    "class2": 1369000,
    "class3": 1200000,
    "class4": 1068000,
    "class5": 983000
   }
  },
  {
   "layout": "i",
   "plan": "stylish",
   "width": "300",
   "name_ja": "間口300cm",
   "name_zh": "宽300cm",
   "prices": {
    "class1": 1495000,
    "class2": 1411000,
    "class3": 1236000,
    "class4": 1093000,
    "class5": 1003000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "180",
   "name_ja": "間口180cm",
   "name_zh": "宽180cm",
   "prices": {
    "class1": 1672000,
    "class2": 1587000,
    "class3": 1473000,
    "class4": 1389000,
    "class5": 1331000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "195",
   "name_ja": "間口195cm",
   "name_zh": "宽195cm",
   "prices": {
    "class1": 1700000,
    "class2": 1614000,
    "class3": 1494000,
    "class4": 1407000,
    "class5": 1346000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "210",
   "name_ja": "間口210cm",
   "name_zh": "宽210cm",
   "prices": {
    "class1": 1738000,
    "class2": 1657000,
    "class3": 1530000,
    "class4": 1431000,
    "class5": 1367000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "225",
   "name_ja": "間口225cm",
   "name_zh": "宽225cm",
   "prices": {
    "class1": 1778000,
    "class2": 1701000,
    "class3": 1569000,
    "class4": 1455000,
    "class5": 1396000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "240",
   "name_ja": "間口240cm",
   "name_zh": "宽240cm",
   "prices": {
    "class1": 1817000,
    "class2": 1743000,
    "class3": 1607000,
    "class4": 1483000,
    "class5": 1410000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "255",
   "name_ja": "間口255cm",
   "name_zh": "宽255cm",
   "prices": {
    "class1": 1844000,
    "class2": 1769000,
    "class3": 1627000,
    "class4": 1501000,
    "class5": 1424000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "270",
   "name_ja": "間口270cm",
   "name_zh": "宽270cm",
   "prices": {
    "class1": 1959000,
    "class2": 1872000,
    "class3": 1709000,
    "class4": 1579000,
    "class5": 1498000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "285",
   "name_ja": "間口285cm",
   "name_zh": "宽285cm",
   "prices": {
    "class1": 1986000,
    "class2": 1898000,
    "class3": 1729000,
    "class4": 1597000,
    "class5": 1512000
   }
  },
  {
   "layout": "i",
   "plan": "kirei",
   "width": "300",
   "name_ja": "間口300cm",
   "name_zh": "宽300cm",
   "prices": {
    "class1": 2024000,
    "class2": 1940000,
    "class3": 1765000,
    "class4": 1622000,
    "class5": 1532000
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "180",
   "name_ja": "間口180cm",
   "name_zh": "宽180cm",
   "prices": {
    "class1": 2393000,
    "class2": 2140000,
    "class3": 1837000,
    "class4": 1663000,
    "class5": 1541000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "195",
   "name_ja": "間口195cm",
   "name_zh": "宽195cm",
   "prices": {
    "class1": 2398000,
    "class2": 2128000,
    "class3": 1853000,
    "class4": 1665000,
    "class5": 1546000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "210",
   "name_ja": "間口210cm",
   "name_zh": "宽210cm",
   "prices": {
    "class1": 2564000,
    "class2": 2291000,
    "class3": 2009000,
    "class4": 1819000,
    "class5": 1700000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "225",
   "name_ja": "間口225cm",
   "name_zh": "宽225cm",
   "prices": {
    "class1": 2644000,
    "class2": 2370000,
    "class3": 2069000,
    "class4": 1869000,
    "class5": 1743000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "240",
   "name_ja": "間口240cm",
   "name_zh": "宽240cm",
   "prices": {
    "class1": 2687000,
    "class2": 2412000,
    "class3": 2096000,
    "class4": 1892000,
    "class5": 1765000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "255",
   "name_ja": "間口255cm",
   "name_zh": "宽255cm",
   "prices": {
    "class1": 2820000,
    "class2": 2529000,
    "class3": 2193000,
    "class4": 1978000,
    "class5": 1845000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "l",
   "plan": "basic",
   "width": "270",
   "name_ja": "間口270cm",
   "name_zh": "宽270cm",
   "prices": {
    "class1": 2897000,
    "class2": 2591000,
    "class3": 2240000,
    "class4": 2019000,
    "class5": 1865000
   },
   "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋49000/50000/41000/43000/40000；工作台加算：ステンレス －3000 / パウダー ＋1000 / グラン ＋2000 / スレート ＋5000 / エルデ ＋5000 / セラミック ＋8000（P.98）",
   "conro180Addon": {
    "grades": {
     "class1": 49000,
     "class2": 50000,
     "class3": 41000,
     "class4": 43000,
     "class5": 40000
    },
    "worktop": {
     "ステンレス": -3000,
     "パウダー": 1000,
     "グラン": 2000,
     "スレート": 5000,
     "エルデ": 5000,
     "セラミック": 8000
    }
   }
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "243",
   "name_ja": "間口243cm・奥行80cm",
   "name_zh": "宽243cm·进深80cm",
   "prices": {
    "class1": 2492000,
    "class2": 2130000,
    "class3": 1939000,
    "class4": 1782000,
    "class5": 1670000
   },
   "depth": "80"
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "258",
   "name_ja": "間口258cm・奥行80cm",
   "name_zh": "宽258cm·进深80cm",
   "prices": {
    "class1": 2561000,
    "class2": 2195000,
    "class3": 1998000,
    "class4": 1839000,
    "class5": 1723000
   },
   "depth": "80"
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "273",
   "name_ja": "間口273cm・奥行80cm",
   "name_zh": "宽273cm·进深80cm",
   "prices": {
    "class1": 2718000,
    "class2": 2337000,
    "class3": 2119000,
    "class4": 1956000,
    "class5": 1836000
   },
   "depth": "80"
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "243",
   "name_ja": "間口243cm・奥行98cm",
   "name_zh": "宽243cm·进深98cm",
   "prices": {
    "class1": 2764000,
    "class2": 2411000,
    "class3": 2090000,
    "class4": 1898000,
    "class5": 1801000
   },
   "depth": "98"
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "258",
   "name_ja": "間口258cm・奥行98cm",
   "name_zh": "宽258cm·进深98cm",
   "prices": {
    "class1": 2833000,
    "class2": 2480000,
    "class3": 2153000,
    "class4": 1959000,
    "class5": 1858000
   },
   "depth": "98"
  },
  {
   "layout": "flat",
   "plan": "basic",
   "width": "273",
   "name_ja": "間口273cm・奥行98cm",
   "name_zh": "宽273cm·进深98cm",
   "prices": {
    "class1": 2990000,
    "class2": 2626000,
    "class3": 2278000,
    "class4": 2080000,
    "class5": 1975000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "242.5",
   "name_ja": "間口242.5cm・奥行80cm",
   "name_zh": "宽242.5cm·进深80cm",
   "prices": {
    "class1": 2034000,
    "class2": 1821000,
    "class3": 1649000,
    "class4": 1592000,
    "class5": 1572000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "257.5",
   "name_ja": "間口257.5cm・奥行80cm",
   "name_zh": "宽257.5cm·进深80cm",
   "prices": {
    "class1": 2061000,
    "class2": 1848000,
    "class3": 1675000,
    "class4": 1618000,
    "class5": 1599000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "272.5",
   "name_ja": "間口272.5cm・奥行80cm",
   "name_zh": "宽272.5cm·进深80cm",
   "prices": {
    "class1": 2148000,
    "class2": 1935000,
    "class3": 1761000,
    "class4": 1704000,
    "class5": 1686000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "242.5",
   "name_ja": "間口242.5cm・奥行98cm",
   "name_zh": "宽242.5cm·进深98cm",
   "prices": {
    "class1": 2133000,
    "class2": 1923000,
    "class3": 1749000,
    "class4": 1689000,
    "class5": 1670000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "257.5",
   "name_ja": "間口257.5cm・奥行98cm",
   "name_zh": "宽257.5cm·进深98cm",
   "prices": {
    "class1": 2160000,
    "class2": 1950000,
    "class3": 1776000,
    "class4": 1716000,
    "class5": 1696000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "basic",
   "width": "272.5",
   "name_ja": "間口272.5cm・奥行98cm",
   "name_zh": "宽272.5cm·进深98cm",
   "prices": {
    "class1": 2247000,
    "class2": 2037000,
    "class3": 1863000,
    "class4": 1803000,
    "class5": 1782000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "242.5",
   "name_ja": "間口242.5cm・奥行80cm",
   "name_zh": "宽242.5cm·进深80cm",
   "prices": {
    "class1": 1685000,
    "class2": 1472000,
    "class3": 1300000,
    "class4": 1243000,
    "class5": 1223000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "257.5",
   "name_ja": "間口257.5cm・奥行80cm",
   "name_zh": "宽257.5cm·进深80cm",
   "prices": {
    "class1": 1709000,
    "class2": 1496000,
    "class3": 1323000,
    "class4": 1266000,
    "class5": 1247000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "272.5",
   "name_ja": "間口272.5cm・奥行80cm",
   "name_zh": "宽272.5cm·进深80cm",
   "prices": {
    "class1": 1778000,
    "class2": 1565000,
    "class3": 1391000,
    "class4": 1334000,
    "class5": 1316000
   },
   "depth": "80"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "242.5",
   "name_ja": "間口242.5cm・奥行98cm",
   "name_zh": "宽242.5cm·进深98cm",
   "prices": {
    "class1": 1691000,
    "class2": 1478000,
    "class3": 1306000,
    "class4": 1249000,
    "class5": 1229000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "257.5",
   "name_ja": "間口257.5cm・奥行98cm",
   "name_zh": "宽257.5cm·进深98cm",
   "prices": {
    "class1": 1715000,
    "class2": 1502000,
    "class3": 1329000,
    "class4": 1272000,
    "class5": 1253000
   },
   "depth": "98"
  },
  {
   "layout": "dual",
   "plan": "stylish",
   "width": "272.5",
   "name_ja": "間口272.5cm・奥行98cm",
   "name_zh": "宽272.5cm·进深98cm",
   "prices": {
    "class1": 1784000,
    "class2": 1571000,
    "class3": 1397000,
    "class4": 1340000,
    "class5": 1322000
   },
   "depth": "98"
  },
  {
   "layout": "tworow",
   "plan": "basic",
   "width": "181.5",
   "name_ja": "シンク側間口181.5cm（＋コンロ側180cm固定）",
   "name_zh": "水槽侧宽181.5cm（+灶侧180cm固定）",
   "prices": {
    "class1": 2355000,
    "class2": 2164000,
    "class3": 1946000,
    "class4": 1756000,
    "class5": 1652000
   },
   "note": "2列型合计价 = コンロ側180cm（class5 ¥911,000）+ シンク側181.5cm（class5 ¥741,000）= ¥1,652,000（P.96）；食洗機組み込み ⊕161,000（P.96）。コンロ側はテチテチ選択不可。"
  }
 ],
 "wallCabinetUnits": {
  "note": "吊柜（ウォールキャビネット）单元类型，来源 v2 手册 PDF 156–161。间口=柜体自身间口(cm)；价表含 class×间口×照明 或 间口×照明×タイプ。",
  "handmove": {
   "name_ja": "ハンドムーブ",
   "name_zh": "手动升降吊柜",
   "widths": [
    "75",
    "90"
   ],
   "lighting": [
    "照明付",
    "照明無"
   ],
   "types": [
    "収納タイプ",
    "水切りタイプ"
   ],
   "prices": {
    "class1": {
     "75": {
      "照明付": 232000,
      "照明無": 205000
     },
     "90": {
      "照明付": 240000,
      "照明無": 214000
     }
    },
    "class2": {
     "75": {
      "照明付": 205000,
      "照明無": 179000
     },
     "90": {
      "照明付": 213000,
      "照明無": 187000
     }
    },
    "class3": {
     "75": {
      "照明付": 175000,
      "照明無": 148000
     },
     "90": {
      "照明付": 181000,
      "照明無": 155000
     }
    },
    "class4": {
     "75": {
      "照明付": 160000,
      "照明無": 134000
     },
     "90": {
      "照明付": 166000,
      "照明無": 140000
     }
    },
    "class5": {
     "75": {
      "照明付": 137000,
      "照明無": 111000
     },
     "90": {
      "照明付": 143000,
      "照明無": 117000
     }
    }
   },
   "note": "高さ50/60/70cm；収納/水切りタイプ同价；价表为高さ70cm基准",
   "racks": {
    "サポートラック": 10000,
    "ペーパーラック": 8000,
    "皿立てラック": 8000,
    "レードルラック": 5000,
    "まな板ラック": 8000,
    "カトラリーラック": 8000
   }
  },
  "eyearea": {
   "name_ja": "アイエリアボックス",
   "name_zh": "眼前区收纳盒",
   "types": {
    "seasoning": "調味料棚タイプ",
    "draining": "水切りカウンタータイプ"
   },
   "prices": {
    "45": {
     "seasoning": {
      "照明無": 44000
     }
    },
    "75": {
     "seasoning": {
      "照明無": 52000,
      "照明付": 80000
     },
     "draining": {
      "照明無": 54000,
      "照明付": 82000
     }
    },
    "90": {
     "seasoning": {
      "照明無": 55000,
      "照明付": 83000
     },
     "draining": {
      "照明無": 56000,
      "照明付": 84000
     }
    }
   },
   "note": "間口45/75/90cm，奥行30cm，下降42cm；45cm 仅调味料棚且无照明付",
   "widths": [
    "45",
    "75",
    "90"
   ]
  },
  "automove": {
   "name_ja": "オートムーブシステム",
   "name_zh": "电动升降吊柜",
   "types": [
    "水切り＆収納タイプ",
    "除菌乾燥＆水切り＆収納タイプ",
    "食器乾燥タイプ",
    "除菌乾燥＆食器乾燥タイプ"
   ],
   "widths": [
    "75",
    "90",
    "120",
    "135",
    "150",
    "165",
    "180"
   ],
   "racks": {
    "サポートラック(W300)": 11000,
    "サポートラック(W500)": 15000,
    "皿立てラック": 9000,
    "レードルラック": 5000,
    "ふきんラック": 7000,
    "ペーパーラック": 8000,
    "カトラリーラック": 8000
   },
   "note": "高さ70cm·奥行37.5cm（P.156）。タイプ別対応間口（P.157）：水切り&収納=75/90/120/135/150/165/180、食器乾燥=75/90、除菌乾燥&食器乾燥=120/135、除菌乾燥&水切り&収納=150/165/180。専用不燃板 ¥11,000／専用化粧板 ¥5,000（別売、P.157）。※「間口75cm 非対応」は底面コンセント（オプション）の制限であり、本体は75cm対応（P.156）。",
   "widthsByType": {
    "水切り＆収納タイプ": [
     "75",
     "90",
     "120",
     "135",
     "150",
     "165",
     "180"
    ],
    "食器乾燥タイプ": [
     "75",
     "90"
    ],
    "除菌乾燥＆食器乾燥タイプ": [
     "120",
     "135"
    ],
    "除菌乾燥＆水切り＆収納タイプ": [
     "150",
     "165",
     "180"
    ]
   },
   "outletNote": "底面コンセントは間口75cm非対応；コンセント使用時（ふた開）は昇降·食器乾燥·除菌乾燥機能使用不可（P.156）。"
  },
  "standard": {
   "name_ja": "吊戸棚",
   "name_zh": "吊柜",
   "heights": [
    "50",
    "60",
    "70",
    "90"
   ],
   "note": "取手レス吊戸棚 / サイレントダンパー付",
   "widths": [
    "15",
    "30",
    "45",
    "60",
    "75",
    "90"
   ],
   "widthsNote": "標準吊戸棚の間口ラインナップは別冊価格表に掲載（本188頁手册には未記載）。此处提供手册内で確認できる吊戸棚ファミリー間口の並集合：梁欠き対応用 15/30/45/60/90·シースルー/ムーブダウン 60/75/90（P.161）。正式間口は営業所確認。"
  },
  "seethrough": {
   "name_ja": "シースルー吊戸棚",
   "name_zh": "半透明门吊柜",
   "widths": [
    "60",
    "75",
    "90"
   ],
   "heights": [
    "70",
    "90"
   ],
   "note": "乳白色のみ；class1–3 ミース(CG※) 时铝框银色"
  },
  "movedown": {
   "name_ja": "ムーブダウン吊戸棚",
   "name_zh": "下拉吊柜",
   "widths": [
    "60",
    "75",
    "90"
   ],
   "heights": [
    "70"
   ],
   "note": "荷重調整機能付，収納目安 15kg"
  },
  "led": {
   "seesaw": {
    "name_ja": "LEDシーソースイッチ",
    "name_zh": "LED翘板开关灯",
    "pricesBySize": {
     "60": 23000,
     "90": 29000
    },
    "model": "ZZKLDB060MW/090MW"
   },
   "touchless": {
    "name_ja": "LEDタッチレス",
    "name_zh": "LED感应灯",
    "pricesBySize": {
     "60": 40000
    },
    "model": "ZZKLDC060LW"
   }
  },
  "extras": {
   "天井幕板": {
    "name_zh": "顶板",
    "widths": [
     "15",
     "30",
     "45",
     "60",
     "90"
    ],
    "heights": [
     "60",
     "70"
    ]
   },
   "梁欠き対応": {
    "name_zh": "梁缺口应对",
    "note": "梁高30cm/奥行23cm以内"
   },
   "開放防止部品付": {
    "name_zh": "防开启部件",
    "note": "地震自动锁"
   }
  }
 },
 "cabinetTypes": {
  "note": "地柜（フロアキャビネット）单元类型，来源 v2 手册 PDF 122–127。类型为基本仕様（无加减差价，类型差价在别册）；対応間口=柜体间口(cm)，奥行=D650/D600。手册原表対応間口为 mm（750/900/1050/1100mm 等），数据已统一换算为 cm。",
  "sink": {
   "name_ja": "シンクキャビネット",
   "name_zh": "水槽柜",
   "widths": [
    "75",
    "90",
    "105",
    "110"
   ],
   "depth": [
    "D650",
    "D600"
   ],
   "types": [
    {
     "name_ja": "ツールポケット付きインセットパネルタイプ",
     "name_zh": "带小物收纳格·收口板",
     "isBasic": true
    },
    {
     "name_ja": "ツールポケット付きタイプ",
     "name_zh": "带小物收纳格"
    },
    {
     "name_ja": "ツールポケット付き既設配水管対応タイプ",
     "name_zh": "带小物收纳格·既有配水管适配"
    },
    {
     "name_ja": "スライドボックス＋ツールポケット付きインセットパネルタイプ",
     "name_zh": "抽拉收纳盒+小物收纳格·收口板"
    },
    {
     "name_ja": "スライドボックス＋ツールポケット付き",
     "name_zh": "抽拉收纳盒+小物收纳格"
    },
    {
     "name_ja": "インセットパネルタイプ",
     "name_zh": "收口板"
    },
    {
     "name_ja": "シンプルタイプ",
     "name_zh": "简约型"
    },
    {
     "name_ja": "シンプルタイプ既設配水管対応タイプ",
     "name_zh": "简约型·既有配水管适配"
    },
    {
     "name_ja": "シンプルタイプディスポーザー対応タイプ",
     "name_zh": "简约型·垃圾处理器适配"
    },
    {
     "name_ja": "開き扉タイプ",
     "name_zh": "平开门"
    },
    {
     "name_ja": "オープンタイプ",
     "name_zh": "开放式"
    },
    {
     "name_ja": "オープンタイプ横組み込み間口15cm包丁差し付スライドタイプ",
     "name_zh": "开放式·横嵌15cm·带刀架抽拉"
    }
   ]
  },
  "base": {
   "name_ja": "ベースキャビネット",
   "name_zh": "基础柜",
   "widths": [
    "25",
    "30",
    "45",
    "60",
    "75",
    "90"
   ],
   "depth": [
    "D650",
    "D600"
   ],
   "types": [
    {
     "name_ja": "2段引出しタイプ",
     "name_zh": "双层抽屉",
     "isBasic": true
    },
    {
     "name_ja": "2段引出しスライドボックス付きタイプ",
     "name_zh": "双层抽屉·带抽拉收纳盒"
    },
    {
     "name_ja": "1段引出しタイプ",
     "name_zh": "单层抽屉"
    },
    {
     "name_ja": "3段引出しタイプ",
     "name_zh": "三层抽屉"
    },
    {
     "name_ja": "オープンタイプ",
     "name_zh": "开放式"
    }
   ]
  },
  "cooktop": {
   "name_ja": "コンロキャビネット",
   "name_zh": "灶具柜",
   "widths": [
    "60",
    "75",
    "90",
    "105"
   ],
   "depth": [
    "D650",
    "D600"
   ],
   "types": [
    {
     "name_ja": "ガス・IH共用ツールポケット付きタイプ",
     "name_zh": "燃气/IH共用·带小物收纳格",
     "isBasic": true
    },
    {
     "name_ja": "ガス用/IH用スライドボックス＋ツールポケット付きタイプ",
     "name_zh": "燃气/IH抽拉收纳盒+小物收纳格"
    },
    {
     "name_ja": "グリルレス用スライドボックス＋ツールポケット付きタイプ",
     "name_zh": "无烤架抽拉收纳盒+小物收纳格"
    },
    {
     "name_ja": "グリルレス用ツールポケット付きタイプ",
     "name_zh": "无烤架·带小物收纳格"
    },
    {
     "name_ja": "ガス・IH共用シンプルタイプ",
     "name_zh": "燃气/IH共用·简约型"
    },
    {
     "name_ja": "グリルレス用シンプルタイプ",
     "name_zh": "无烤架·简约型"
    },
    {
     "name_ja": "コンロ横組み込み間口15cm（網カゴ付き/ボトル対応）",
     "name_zh": "灶侧横嵌15cm（网篮/瓶罐）"
    }
   ]
  },
  "corner": {
   "name_ja": "コーナーキャビネット",
   "name_zh": "转角柜",
   "widths": [
    "90×75",
    "90×90"
   ],
   "depth": [
    "60",
    "65"
   ],
   "types": [
    {
     "name_ja": "ワゴンタイプ",
     "name_zh": "转角拉篮"
    },
    {
     "name_ja": "棚板タイプ",
     "name_zh": "搁板型"
    }
   ]
  }
 },
 "diningCounter": {
  "note": "デュアルトップ対面 ダイニング側カウンター（基准=メラミン）升级价，P.90/91。台面单选只计キッチン側。",
  "prices": {
   "basic": {
    "ソリッド": {
     "242.5": 185000,
     "257.5": 186000,
     "272.5": 187000
    },
    "パウダー": {
     "242.5": 201000,
     "257.5": 202000,
     "272.5": 203000
    },
    "グラン": {
     "242.5": 251000,
     "257.5": 254000,
     "272.5": 257000
    },
    "スレート": {
     "242.5": 291000,
     "257.5": 296000,
     "272.5": 301000
    },
    "エルデ": {
     "242.5": 296000,
     "257.5": 301000,
     "272.5": 306000
    },
    "セラミック": {
     "242.5": 413000,
     "257.5": 429000,
     "272.5": 445000
    },
    "天然木": {
     "242.5": 296000,
     "257.5": 301000,
     "272.5": 306000
    }
   },
   "stylish": {
    "ソリッド": {
     "242.5": 185000,
     "257.5": 186000,
     "272.5": 187000
    },
    "パウダー": {
     "242.5": 201000,
     "257.5": 202000,
     "272.5": 203000
    },
    "グラン": {
     "242.5": 251000,
     "257.5": 254000,
     "272.5": 257000
    },
    "スレート": {
     "242.5": 291000,
     "257.5": 296000,
     "272.5": 301000
    },
    "エルデ": {
     "242.5": 296000,
     "257.5": 301000,
     "272.5": 306000
    },
    "セラミック": {
     "242.5": 413000,
     "257.5": 429000,
     "272.5": 445000
    },
    "天然木": {
     "242.5": 296000,
     "257.5": 301000,
     "272.5": 306000
    }
   }
  }
 }
};
