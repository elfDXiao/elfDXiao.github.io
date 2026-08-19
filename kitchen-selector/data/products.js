/* 厨房选型系统数据（由 data/products.json 生成：window.KITCHEN_DATA）
 * 源: 厨房选型系统/data/products.json（v2 手册 188p 全量 + 不选选项）
 * 价格符号：＋(U+FF0B)=加价 －(U+FF0D)=减价；UTF-8 无 BOM；width=cm 字符串。
 */
window.KITCHEN_DATA = {
  "meta": {
    "source": "クリナップ Cleanup Stedia（ステディア）システムキッチン プランニングガイド（0259_stediaca_v2.pdf，188 頁完整版）",
    "brand": "クリナップ Cleanup",
    "product": "システムキッチン（系统厨房）",
    "series": "ステディア（Stedia）",
    "currency": "JPY",
    "taxRate": 0.1,
    "priceNote": "表示価格は税抜き価格です（不含税）。＋=加价、－=减价（相对所选パッケージプラン的基本仕様）。",
    "quoteNote": "取付・設置費は別途。税込=税抜×1.10（四舍五入）；人民币含安装价=税込×汇率×0.7（7折含安装人工费，沿用浴室口径，交付时向用户确认）。",
    "method": "小米 MiMo（mimo-v2.5）逐页读图 108 页 + PDF 文本层数字交叉核对；价格符号统一为全角 ＋(U+FF0B)/－(U+FF0D)。",
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
      "flat": "平面对接式",
      "dual": "双台面对接式",
      "tworow": "双列型"
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
      "stylish": "时尚方案",
      "kirei": "清洁方案"
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
      "price": 1187000
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
    }
  },
  "doorColors": {
    "class1": [
      {
        "code": "AVC",
        "name_ja": "オーク",
        "name_zh": "橡木",
        "handles": [
          "V"
        ]
      },
      {
        "code": "AVY",
        "name_ja": "ウォールナット",
        "name_zh": "胡桃木",
        "handles": [
          "V"
        ]
      },
      {
        "code": "AVG",
        "name_ja": "オークグレー",
        "name_zh": "灰橡木",
        "handles": [
          "V"
        ]
      }
    ],
    "class2": [
      {
        "code": "CJV",
        "name_ja": "ボーテシルバー",
        "name_zh": "波泰银",
        "handles": [
          "F",
          "Z",
          "B"
        ]
      },
      {
        "code": "CFQ",
        "name_ja": "ブロンカッセ",
        "name_zh": "布朗卡塞",
        "handles": [
          "F",
          "Z",
          "B"
        ]
      },
      {
        "code": "CFL",
        "name_ja": "カシミアエトープ",
        "name_zh": "羊绒灰褐",
        "handles": [
          "F",
          "Z",
          "B"
        ]
      },
      {
        "code": "CFU",
        "name_ja": "ティオレローズ",
        "name_zh": "蒂奥雷玫瑰",
        "handles": [
          "F",
          "Z",
          "B"
        ]
      },
      {
        "code": "CFZ",
        "name_ja": "スタウトシリウス",
        "name_zh": "斯托特天狼星",
        "handles": [
          "F",
          "Z",
          "B"
        ]
      },
      {
        "code": "CFV",
        "name_ja": "ブルードゥパリ",
        "name_zh": "巴黎蓝",
        "handles": [
          "F",
          "Z",
          "B"
        ]
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
        ]
      },
      {
        "code": "CHK",
        "name_ja": "パティナオパール",
        "name_zh": "古铜蛋白石",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CHL",
        "name_ja": "パティナマーブル",
        "name_zh": "古铜大理石",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CPG",
        "name_ja": "ソナタグリーズ",
        "name_zh": "奏鸣曲灰",
        "handles": [
          "F",
          "Z",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CPZ",
        "name_ja": "ソナタセピア",
        "name_zh": "奏鸣曲乌贼墨",
        "handles": [
          "F",
          "Z",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CPB",
        "name_ja": "ソナタウッドチェリー",
        "name_zh": "奏鸣曲樱桃木",
        "handles": [
          "F",
          "Z",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CGT",
        "name_ja": "ミースアッシュ",
        "name_zh": "米斯烬灰",
        "handles": [
          "9"
        ]
      },
      {
        "code": "CGV",
        "name_ja": "ミースネイビー",
        "name_zh": "米斯藏青",
        "handles": [
          "9"
        ]
      },
      {
        "code": "CGG",
        "name_ja": "ミースグレー",
        "name_zh": "米斯灰",
        "handles": [
          "9"
        ]
      },
      {
        "code": "CGW",
        "name_ja": "ミースウッドナチュラル",
        "name_zh": "米斯自然木",
        "handles": [
          "F",
          "Z",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CGL",
        "name_ja": "ミースウッドダーク",
        "name_zh": "米斯深木",
        "handles": [
          "F",
          "Z",
          "T",
          "7",
          "8"
        ]
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
        ]
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
        ]
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
        ]
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
        ]
      },
      {
        "code": "C3L",
        "name_ja": "ウォールナットビター",
        "name_zh": "苦胡桃木",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CDK",
        "name_ja": "ユーリベージュ",
        "name_zh": "尤利米色",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CDH",
        "name_ja": "ユーリチャコール",
        "name_zh": "尤利炭色",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CDS",
        "name_ja": "レフティグリーン",
        "name_zh": "左撇子绿",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CDB",
        "name_ja": "カミーナレッド",
        "name_zh": "卡米娜红",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CWT",
        "name_ja": "ペアウッドホワイト",
        "name_zh": "梨木白",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CWX",
        "name_ja": "ペアウッドアッシュ",
        "name_zh": "梨木灰",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "CWZ",
        "name_ja": "マリンウッドダーク",
        "name_zh": "海风深木",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "C8T",
        "name_ja": "コティグレー",
        "name_zh": "科蒂灰",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      },
      {
        "code": "C8Z",
        "name_ja": "コティチャコール",
        "name_zh": "科蒂炭色",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T",
          "7",
          "8"
        ]
      }
    ],
    "class5": [
      {
        "code": "CAT",
        "name_ja": "スエードホワイト",
        "name_zh": "麂皮白",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "CAZ",
        "name_ja": "スエードチャコール",
        "name_zh": "麂皮炭色",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "C9K",
        "name_ja": "ミクスドラテ",
        "name_zh": "混合特拉特",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "ECG",
        "name_ja": "トワルグレー",
        "name_zh": "托瓦尔灰",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "ECU",
        "name_ja": "トワルローズ",
        "name_zh": "托瓦尔玫瑰",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "CKG",
        "name_ja": "ルオントグレージュ",
        "name_zh": "鲁昂灰米",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "E5K",
        "name_ja": "ロッシュグレー",
        "name_zh": "罗什灰",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "CKL",
        "name_ja": "ルオントセピア",
        "name_zh": "鲁昂乌贼墨",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
      },
      {
        "code": "E5H",
        "name_ja": "ロッシュチャコール",
        "name_zh": "罗什炭色",
        "handles": [
          "F",
          "Z",
          "B",
          "U",
          "T"
        ]
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
        ]
      }
    ]
  },
  "handles": {
    "V": {
      "name_ja": "天然木取手",
      "name_zh": "天然木拉手"
    },
    "F": {
      "name_ja": "ロングバーシルバー",
      "name_zh": "长条银拉手"
    },
    "Z": {
      "name_ja": "スリムロングバーブラック",
      "name_zh": "细长黑拉手"
    },
    "B": {
      "name_ja": "ラインシルバー",
      "name_zh": "线条银拉手"
    },
    "U": {
      "name_ja": "ラインブラック",
      "name_zh": "线条黑拉手"
    },
    "T": {
      "name_ja": "ネコアシブラック",
      "name_zh": "猫脚黑拉手"
    },
    "7": {
      "name_ja": "木調取手オーク",
      "name_zh": "木纹橡木拉手"
    },
    "8": {
      "name_ja": "木調取手ウォールナット",
      "name_zh": "木纹胡桃木拉手"
    },
    "9": {
      "name_ja": "ミース扉用ハンドル",
      "name_zh": "米斯门用拉手"
    }
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
    "note": "周辺収納独立单价表（税抜）。columns=間口(cm)，prices.depthNN 或 prices 为 class1–5 的价格数组。",
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
          688000,
          744000,
          825000,
          869000,
          959000,
          1076000
        ],
        "class2": [
          594000,
          648000,
          727000,
          769000,
          857000,
          968000
        ],
        "class3": [
          502000,
          552000,
          625000,
          665000,
          747000,
          848000
        ],
        "class4": [
          430000,
          468000,
          531000,
          557000,
          627000,
          704000
        ],
        "class5": [
          390000,
          424000,
          481000,
          501000,
          565000,
          636000
        ]
      },
      "depth55": {
        "class1": [
          713000,
          771000,
          858000,
          895000,
          998000,
          1112000
        ],
        "class2": [
          619000,
          675000,
          760000,
          795000,
          896000,
          1004000
        ],
        "class3": [
          527000,
          579000,
          658000,
          691000,
          786000,
          884000
        ],
        "class4": [
          455000,
          495000,
          564000,
          583000,
          666000,
          740000
        ],
        "class5": [
          415000,
          451000,
          514000,
          527000,
          604000,
          672000
        ]
      },
      "depth65": {
        "class1": [
          741000,
          797000,
          890000,
          918000,
          1036000,
          1154000
        ],
        "class2": [
          647000,
          701000,
          792000,
          818000,
          934000,
          1046000
        ],
        "class3": [
          555000,
          605000,
          690000,
          714000,
          824000,
          926000
        ],
        "class4": [
          483000,
          521000,
          596000,
          609000,
          704000,
          782000
        ],
        "class5": [
          443000,
          477000,
          546000,
          550000,
          642000,
          714000
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
          934000,
          1075000,
          1200000
        ],
        "class2": [
          836000,
          973000,
          1092000
        ],
        "class3": [
          734000,
          863000,
          972000
        ],
        "class4": [
          640000,
          743000,
          828000
        ],
        "class5": [
          590000,
          681000,
          760000
        ]
      },
      "depth55": {
        "class1": [
          973000,
          1120000,
          1241000
        ],
        "class2": [
          875000,
          1018000,
          1133000
        ],
        "class3": [
          773000,
          908000,
          1013000
        ],
        "class4": [
          679000,
          788000,
          869000
        ],
        "class5": [
          629000,
          726000,
          801000
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
          612000,
          669000,
          740000,
          780000,
          851000,
          955000
        ],
        "class2": [
          520000,
          573000,
          642000,
          682000,
          747000,
          847000
        ],
        "class3": [
          428000,
          477000,
          542000,
          576000,
          637000,
          727000
        ],
        "class4": [
          356000,
          391000,
          446000,
          468000,
          517000,
          585000
        ],
        "class5": [
          316000,
          347000,
          396000,
          412000,
          457000,
          513000
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
          528000,
          557000,
          586000,
          614000,
          642000
        ],
        "class2": [
          442000,
          465000,
          488000,
          511000,
          534000
        ],
        "class3": [
          346000,
          362000,
          378000,
          394000,
          410000
        ],
        "class4": [
          272000,
          284000,
          296000,
          309000,
          322000
        ],
        "class5": [
          220000,
          229000,
          238000,
          246000,
          254000
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
          782000,
          812000,
          834500,
          863500,
          884000
        ],
        "class2": [
          673000,
          696000,
          714500,
          738500,
          757000
        ],
        "class3": [
          551000,
          567000,
          584500,
          600500,
          618000
        ],
        "class4": [
          485000,
          497000,
          510500,
          523500,
          538000
        ],
        "class5": [
          423000,
          432000,
          444500,
          453500,
          467000
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
          731000,
          718000,
          702000,
          735000,
          776000
        ],
        "class2": [
          647000,
          636000,
          619000,
          628000,
          643000
        ],
        "class3": [
          508000,
          520000,
          512000,
          523000,
          541000
        ],
        "class4": [
          450000,
          443000,
          427000,
          441000,
          455000
        ],
        "class5": [
          425000,
          415000,
          397000,
          410000,
          424000
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
          373000,
          388000,
          407000,
          426000
        ],
        "class2": [
          327000,
          340000,
          356000,
          372000
        ],
        "class3": [
          277000,
          284000,
          294000,
          304000
        ],
        "class4": [
          225000,
          232000,
          243000,
          254000
        ],
        "class5": [
          205000,
          210000,
          217000,
          224000
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
      "description_zh": "系统厨房布局（决定价格表组）。Ⅰ型/L型/フラット対面/デュアルトップ対面/2列型。",
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
          "name_zh": "平面对接式",
          "plans": [
            "basic"
          ]
        },
        {
          "code": "dual",
          "name_ja": "デュアルトップ対面",
          "name_zh": "双台面对接式",
          "plans": [
            "basic",
            "stylish"
          ]
        },
        {
          "code": "tworow",
          "name_ja": "2列型",
          "name_zh": "双列型",
          "plans": [
            "basic"
          ]
        }
      ]
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
      "description_zh": "套餐方案（Ⅰ型有基本/时尚/清洁三套，其余布局以基本为主；双台面对接另有时尚方案）。",
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
          "name_zh": "时尚方案",
          "appliesTo": [
            "i",
            "dual"
          ]
        },
        {
          "code": "kirei",
          "name_ja": "きれいプラン",
          "name_zh": "清洁方案",
          "appliesTo": [
            "i"
          ]
        }
      ]
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
      "description_zh": "间口宽度（决定基本セット価格；Ⅰ型 180–300cm 9 档，其他布局各自定义，见 basePrices）。",
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
      ]
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
      "description_zh": "门板等级 class 1–5（与间口共同决定基本セット価格）。",
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
      ]
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
          "name_zh": "橡木",
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
          "name_zh": "波泰银",
          "grade": "class2"
        },
        {
          "code": "CFQ",
          "name_ja": "ブロンカッセ",
          "name_zh": "布朗卡塞",
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
          "name_zh": "蒂奥雷玫瑰",
          "grade": "class2"
        },
        {
          "code": "CFZ",
          "name_ja": "スタウトシリウス",
          "name_zh": "斯托特天狼星",
          "grade": "class2"
        },
        {
          "code": "CFV",
          "name_ja": "ブルードゥパリ",
          "name_zh": "巴黎蓝",
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
          "name_zh": "古铜蛋白石",
          "grade": "class3"
        },
        {
          "code": "CHL",
          "name_ja": "パティナマーブル",
          "name_zh": "古铜大理石",
          "grade": "class3"
        },
        {
          "code": "CPG",
          "name_ja": "ソナタグリーズ",
          "name_zh": "奏鸣曲灰",
          "grade": "class3"
        },
        {
          "code": "CPZ",
          "name_ja": "ソナタセピア",
          "name_zh": "奏鸣曲乌贼墨",
          "grade": "class3"
        },
        {
          "code": "CPB",
          "name_ja": "ソナタウッドチェリー",
          "name_zh": "奏鸣曲樱桃木",
          "grade": "class3"
        },
        {
          "code": "CGT",
          "name_ja": "ミースアッシュ",
          "name_zh": "米斯烬灰",
          "grade": "class3"
        },
        {
          "code": "CGV",
          "name_ja": "ミースネイビー",
          "name_zh": "米斯藏青",
          "grade": "class3"
        },
        {
          "code": "CGG",
          "name_ja": "ミースグレー",
          "name_zh": "米斯灰",
          "grade": "class3"
        },
        {
          "code": "CGW",
          "name_ja": "ミースウッドナチュラル",
          "name_zh": "米斯自然木",
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
          "name_zh": "苦胡桃木",
          "grade": "class4"
        },
        {
          "code": "CDK",
          "name_ja": "ユーリベージュ",
          "name_zh": "尤利米色",
          "grade": "class4"
        },
        {
          "code": "CDH",
          "name_ja": "ユーリチャコール",
          "name_zh": "尤利炭色",
          "grade": "class4"
        },
        {
          "code": "CDS",
          "name_ja": "レフティグリーン",
          "name_zh": "左撇子绿",
          "grade": "class4"
        },
        {
          "code": "CDB",
          "name_ja": "カミーナレッド",
          "name_zh": "卡米娜红",
          "grade": "class4"
        },
        {
          "code": "CWT",
          "name_ja": "ペアウッドホワイト",
          "name_zh": "梨木白",
          "grade": "class4"
        },
        {
          "code": "CWX",
          "name_ja": "ペアウッドアッシュ",
          "name_zh": "梨木灰",
          "grade": "class4"
        },
        {
          "code": "CWZ",
          "name_ja": "マリンウッドダーク",
          "name_zh": "海风深木",
          "grade": "class4"
        },
        {
          "code": "C8T",
          "name_ja": "コティグレー",
          "name_zh": "科蒂灰",
          "grade": "class4"
        },
        {
          "code": "C8Z",
          "name_ja": "コティチャコール",
          "name_zh": "科蒂炭色",
          "grade": "class4"
        },
        {
          "code": "CAT",
          "name_ja": "スエードホワイト",
          "name_zh": "麂皮白",
          "grade": "class5"
        },
        {
          "code": "CAZ",
          "name_ja": "スエードチャコール",
          "name_zh": "麂皮炭色",
          "grade": "class5"
        },
        {
          "code": "C9K",
          "name_ja": "ミクスドラテ",
          "name_zh": "混合特拉特",
          "grade": "class5"
        },
        {
          "code": "ECG",
          "name_ja": "トワルグレー",
          "name_zh": "托瓦尔灰",
          "grade": "class5"
        },
        {
          "code": "ECU",
          "name_ja": "トワルローズ",
          "name_zh": "托瓦尔玫瑰",
          "grade": "class5"
        },
        {
          "code": "CKG",
          "name_ja": "ルオントグレージュ",
          "name_zh": "鲁昂灰米",
          "grade": "class5"
        },
        {
          "code": "E5K",
          "name_ja": "ロッシュグレー",
          "name_zh": "罗什灰",
          "grade": "class5"
        },
        {
          "code": "CKL",
          "name_ja": "ルオントセピア",
          "name_zh": "鲁昂乌贼墨",
          "grade": "class5"
        },
        {
          "code": "E5H",
          "name_ja": "ロッシュチャコール",
          "name_zh": "罗什炭色",
          "grade": "class5"
        },
        {
          "code": "C4B",
          "name_ja": "クラシカルバーチ",
          "name_zh": "古典桦木",
          "grade": "class5"
        }
      ]
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
      "description_zh": "台面材质（ステンレス/アクリストン/フォルテックス/セラミック/天然木），加算额按间口递变（Ⅰ型基本プラン基准，其它プラン基准不同）。",
      "options": [
        {
          "code": "acrystone_solid",
          "name_ja": "アクリストン ソリッド",
          "name_zh": "人造大理石 纯色",
          "isBasic": true,
          "note": "基本プラン基准台面"
        },
        {
          "code": "stainless_coining",
          "name_ja": "ステンレス コイニング",
          "name_zh": "不锈钢 压花",
          "pricesBySize": {
            "180": -48000,
            "195": -51000,
            "210": -54000,
            "225": -57000,
            "240": -60000,
            "255": -63000,
            "270": -66000,
            "285": -69000,
            "300": -72000
          }
        },
        {
          "code": "stainless_hairline",
          "name_ja": "ステンレス ヘアライン",
          "name_zh": "不锈钢 拉丝",
          "note": "Ⅰ型基本プラン基准（按间口递变，含符号翻转）",
          "pricesBySize": {
            "180": 4000,
            "195": 1000,
            "210": -2000,
            "225": -5000,
            "240": -8000,
            "255": -11000,
            "270": -14000,
            "285": -17000,
            "300": -20000
          }
        },
        {
          "code": "stainless_satin",
          "name_ja": "ステンレス サテン",
          "name_zh": "不锈钢 缎面",
          "note": "Ⅰ型基本プラン基准（按间口递变，含符号翻转）",
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
          }
        },
        {
          "code": "stainless_vibration",
          "name_ja": "ステンレス バイブレーション",
          "name_zh": "不锈钢 振动纹",
          "note": "Ⅰ型基本プラン基准（按间口递变，含符号翻转）",
          "pricesBySize": {
            "180": 152000,
            "195": 149000,
            "210": 146000,
            "225": 143000,
            "240": 140000,
            "255": 137000,
            "270": 134000,
            "285": 131000,
            "300": 128000
          }
        },
        {
          "code": "acrystone_powder",
          "name_ja": "アクリストン パウダー",
          "name_zh": "人造大理石 粉彩",
          "note": "Ⅰ型基本プラン基准（按间口递变，含符号翻转）",
          "pricesBySize": {
            "180": 51000,
            "195": 52000,
            "210": 53000,
            "225": 54000,
            "240": 55000,
            "255": 56000,
            "270": 57000,
            "285": 58000,
            "300": 59000
          }
        },
        {
          "code": "acrystone_gran",
          "name_ja": "アクリストン グラン",
          "name_zh": "人造大理石 格兰",
          "note": "Ⅰ型基本プラン基准（按间口递变，含符号翻转）",
          "pricesBySize": {
            "180": 82000,
            "195": 84000,
            "210": 86000,
            "225": 88000,
            "240": 90000,
            "255": 92000,
            "270": 94000,
            "285": 96000,
            "300": 98000
          }
        },
        {
          "code": "fortex_slate",
          "name_ja": "フォルテックス スレート",
          "name_zh": "硬质人造大理石 板岩纹",
          "pricesBySize": {
            "180": 134000,
            "195": 138000,
            "210": 142000,
            "225": 146000,
            "240": 150000,
            "255": 154000,
            "270": 158000,
            "285": 162000,
            "300": 166000
          }
        },
        {
          "code": "fortex_elde",
          "name_ja": "フォルテックス エルデ",
          "name_zh": "硬质人造大理石 艾尔迪",
          "pricesBySize": {
            "180": 174000,
            "195": 178000,
            "210": 182000,
            "225": 186000,
            "240": 190000,
            "255": 194000,
            "270": 198000,
            "285": 202000,
            "300": 206000
          }
        },
        {
          "code": "ceramic",
          "name_ja": "セラミックワークトップ",
          "name_zh": "陶瓷台面",
          "pricesBySize": {
            "180": 301000,
            "195": 308000,
            "210": 315000,
            "225": 322000,
            "240": 329000,
            "255": 336000,
            "270": 343000,
            "285": 350000,
            "300": 357000
          },
          "note": "色：アルバリウム/クレタ/マルモリオ/シリウス"
        },
        {
          "code": "wood",
          "name_ja": "天然木ワークトップ",
          "name_zh": "天然木台面",
          "pricesBySize": {
            "180": 174000,
            "195": 178000,
            "210": 182000,
            "225": 186000,
            "240": 190000,
            "255": 194000,
            "270": 198000,
            "285": 202000,
            "300": 206000
          },
          "note": "色：オーク/オークグレー/ウォールナット；ハイタイプ限定"
        }
      ]
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
      "description_zh": "水槽（标准 SY/SA，可选流レール/美サイレント/フォルテックス）。差价基准为間口255cm。",
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
          ]
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
          ]
        },
        {
          "code": "SV",
          "name_ja": "美・サイレントシンク（SV）",
          "name_zh": "美静音水槽（SV）",
          "priceDiff": -38000,
          "note": "SA/SY→SV －38,000（减价，唯一减价水槽：碗体 W67 比 SA 的 W75 小）",
          "sizes": [
            "195",
            "210",
            "225",
            "240",
            "255"
          ]
        },
        {
          "code": "AE",
          "name_ja": "流レールアクリストンシンク（AE）",
          "name_zh": "流轨人造大理石水槽（AE）",
          "priceDiff": 37000,
          "note": "SA→AE ＋37,000"
        },
        {
          "code": "AK",
          "name_ja": "流レールフォルテックスシンク（AK）",
          "name_zh": "流轨硬质人造大理石水槽（AK）",
          "priceDiff": 63000,
          "note": "SA→AK ＋63,000"
        },
        {
          "code": "RW",
          "name_ja": "流レールシンクワイド（RW）",
          "name_zh": "流轨宽水槽（RW）",
          "priceDiff": 50000,
          "note": "SA→RW ＋50,000（間口255cm 基准）"
        }
      ]
    },
    {
      "id": "cabinet",
      "name_ja": "フロアキャビネット（下柜）",
      "name_zh": "下柜",
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
      "description_zh": "下柜（フロアキャビネット）加装项（可多选）。单元类型见 cabinetTypes（シンク/ベース/コンロ/コーナー，基本仕様无差价）。",
      "additive": true,
      "options": [
        {
          "code": "slidebox",
          "name_ja": "スライドボックス（各キャビネット）",
          "name_zh": "滑动收纳盒（每柜）",
          "priceDiff": 37000,
          "note": "間口255cm基准；间口别 breakdown 在本手册未找到（詳細 P.112 指向别册），待核；「各キャビネット」是否每柜叠加待核"
        },
        {
          "code": "sink_outlet",
          "name_ja": "シンクキャビネット（コンセント付）",
          "name_zh": "水槽柜（带插座）",
          "priceDiff": 31000,
          "model": "ZKIS(S・B)(R・L)-G",
          "note": "専用コンセント シルバー/ブラック；専用シンクキャビネット要（ディスポーザー/開き扉/オープン/奥行60cm 不可）"
        },
        {
          "code": "cooktop_drawer",
          "name_ja": "コンロ横引き出し 扉面材統一",
          "name_zh": "灶侧抽屉门板材质统一",
          "priceDiff": 13000
        },
        {
          "code": "cross_gallery",
          "name_ja": "クロスギャラリー（1本）",
          "name_zh": "侧边层架导轨",
          "pricesBySize": {
            "30": 2000,
            "45": 2000,
            "60": 2500,
            "75": 2500,
            "90": 3000,
            "105": 3500
          },
          "model": "ZKH030CN-K〜ZKH105CN-K",
          "note": "间口=柜体自身间口；付き用（インセットパネル付き）仅 75/90/105 三档，价格同なし用（ZKH075DN-K〜ZKH105DN-K）"
        },
        {
          "code": "bottle_stand",
          "name_ja": "ボトル立て",
          "name_zh": "瓶罐收纳架",
          "pricesBySize": {
            "30": 3000,
            "45": 3000,
            "60": 3500,
            "75": 4500,
            "90": 5000
          },
          "model": "ZKH030EN-K〜ZKH090EN-K"
        },
        {
          "code": "ladle_pocket",
          "name_ja": "レードルポケット",
          "name_zh": "汤勺挂",
          "priceDiff": 2000,
          "model": "ZKHXWN-K"
        },
        {
          "code": "frypan_rack",
          "name_ja": "フライパンラック",
          "name_zh": "平底锅架",
          "priceDiff": 8500,
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
              "price": 4000,
              "model": "ZKHTK(N・B)-K"
            },
            {
              "name_ja": "バー取手用",
              "name_zh": "横杆把手用",
              "price": 4000,
              "model": "ZKHCB(N・B)-K"
            }
          ],
          "note": "2段目引き出し用；バー取手用不可装 75cm シンクキャビネット/class2/class3(CP※) 门"
        },
        {
          "code": "riser",
          "name_ja": "フロアコンテナ用ライザー",
          "name_zh": "地面置物箱垫高架",
          "priceDiff": 5000,
          "model": "ZKCFNN-K"
        }
      ]
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
      "description_zh": "水龙头（浄水器一体型为基本，可选 Efine/タッチレス/グースネック 等）。",
      "options": [
        {
          "code": "joksuiki",
          "name_ja": "浄水器一体型シングルレバー水栓",
          "name_zh": "净水器一体型单把手水龙头",
          "isBasic": true,
          "model": "ZZJFAB466SYX",
          "price": 67000
        },
        {
          "code": "shower",
          "name_ja": "シングルレバー水栓（シャワーホースタイプ）",
          "name_zh": "单把手水龙头（花洒软管式）",
          "priceDiff": 4000,
          "priceDiffCold": 6000,
          "model": "ZZKM5021TEC",
          "note": "一般地 ＋4,000 / 寒冷地 ＋6,000"
        },
        {
          "code": "touchless",
          "name_ja": "タッチレス水栓",
          "name_zh": "感应水龙头",
          "priceDiff": 51000,
          "priceDiffCold": 54000,
          "model": "ZZSFNAA451SY",
          "note": "一般地 ＋51,000 / 寒冷地 ＋54,000"
        },
        {
          "code": "efine",
          "name_ja": "スタイリッシュ水栓 Efine（浄水器兼用タイプ）",
          "name_zh": "时尚水龙头 Efine（净水器兼用式）",
          "priceDiff": 76000,
          "model": "ZZKM6381EC",
          "note": "＋76,000（カートリッジ ZSPBZ300R14AC 含む）"
        },
        {
          "code": "gooseneck",
          "name_ja": "グースネック水栓",
          "name_zh": "鹅颈水龙头",
          "priceDiff": null,
          "model": "ZZKM6061EC",
          "note": "单元价 ¥92,000（差价待核）"
        },
        {
          "code": "gracia",
          "name_ja": "GRACIA L型（電解水素水生成器兼用）",
          "name_zh": "GRACIA L型（电解水素水生成器兼用）",
          "priceDiff": null,
          "model": "ZZGRACIAL",
          "note": "单元价 ¥47,000（差价待核）"
        },
        {
          "code": "handsfree",
          "name_ja": "ハンズフリー水栓（浄水器兼用タイプ）",
          "name_zh": "免触水龙头（净水器兼用式）",
          "priceDiff": null,
          "model": "ZZJFNA411SY",
          "note": "单元价 ¥207,000（差价待核）"
        },
        {
          "code": "none",
          "name_ja": "水栓なし",
          "name_zh": "不装水龙头",
          "priceDiff": -67000,
          "note": "手册未显式写「不选」减额，按本体价推断（纯物料价，不含安装）（基准=浄水器一体型シングルレバー水栓本体）"
        }
      ]
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
      "description_zh": "洗碗机（ビルトイン；间口240cm 未满不可，L型シンク側 240cm 未满不可）。差价基准为間口255cm・class5。",
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
          "priceDiff": 125000,
          "model": "ZWPP45M21GDS/21GDK"
        },
        {
          "code": "liteco",
          "name_ja": "ライトエコ付ストリーム除菌タイプ",
          "name_zh": "轻环保蒸汽除菌型",
          "priceDiff": 192000,
          "model": "ZWPP45M21BDS"
        },
        {
          "code": "plasma",
          "name_ja": "プラズマクラスター＆重曹洗浄コース付タイプ",
          "name_zh": "等离子簇+小苏打清洗型",
          "priceDiff": 217000,
          "model": "ZWPM45R22DDU"
        },
        {
          "code": "econavi",
          "name_ja": "省エネナビ付ストリーム除菌タイプ",
          "name_zh": "节能导航蒸汽除菌型",
          "priceDiff": 224000,
          "model": "ZWPM45M21CDU"
        }
      ]
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
      "description_zh": "灶具（ガスコンロ XSS 为基本，可选 Lisse/DELICIA/IH/ハイブリッド Dual Chef）。",
      "options": [
        {
          "code": "XSS",
          "name_ja": "ガラストップコンロ（XSS）",
          "name_zh": "玻璃面板燃气灶（XSS）",
          "isBasic": true,
          "model": "ZGFVK6R22XSS-K"
        },
        {
          "code": "FSS",
          "name_ja": "ガラストップコンロ（FSS）",
          "name_zh": "玻璃面板燃气灶（FSS）",
          "priceDiff": 44000,
          "model": "ZGGRK6R24FSS-K"
        },
        {
          "code": "lisse",
          "name_ja": "ガラストップコンロ Lisse（リッセ）",
          "name_zh": "玻璃面板燃气灶 Lisse",
          "priceDiff": 150000,
          "model": "ZGGRK7R24QUS-K"
        },
        {
          "code": "delicia",
          "name_ja": "ガラストップコンロ DELICIA（デリシア）",
          "name_zh": "玻璃面板燃气灶 DELICIA",
          "priceDiff": 276000,
          "model": "ZGGCK7R24VUS-K",
          "note": "含专用切板 ¥17,000"
        },
        {
          "code": "ih2",
          "name_ja": "2口IH＋ラジエントヒーター",
          "name_zh": "双口IH+辐射加热器",
          "priceDiff": 140000,
          "model": "ZZCSG318MSR"
        },
        {
          "code": "ih3",
          "name_ja": "3口IHヒーター",
          "name_zh": "三口IH电磁炉",
          "priceDiff": 154000,
          "model": "ZEHCZ6H22RSS"
        },
        {
          "code": "ih3allmetal",
          "name_ja": "1口オールメタル対応3口IHヒーター",
          "name_zh": "单口全金属三口IH电磁炉",
          "priceDiff": 351000,
          "model": "ZEHRA6M24NSS"
        },
        {
          "code": "dualchef",
          "name_ja": "ハイブリッドコンロ Dual Chef（デュアルシェフ）",
          "name_zh": "混合灶 Dual Chef（燃气+IH）",
          "priceDiff": null,
          "model": "ZHAR7R17AGK-K",
          "note": "差价待核"
        },
        {
          "code": "none",
          "name_ja": "コンロなし",
          "name_zh": "不装燃气灶",
          "priceDiff": -171000,
          "note": "手册未显式写「不选」减额，按本体价推断（纯物料价，不含安装）（基准=ガラストップコンロ XSS 本体）"
        }
      ]
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
      "description_zh": "抽油烟机（シンプルスリム为基本，可选深型/とってもクリン/洗エール）。深型差价按 class 递变。",
      "options": [
        {
          "code": "simpleslim",
          "name_ja": "シンプルスリムレンジフード（鋼板前・横幕板）",
          "name_zh": "简约超薄抽油烟机（钢板前挡）",
          "isBasic": true,
          "model": "ZRS90ACK24FS(R-L)"
        },
        {
          "code": "deep",
          "name_ja": "深型レンジフード（シロッコファン）",
          "name_zh": "深型抽油烟机（西洛克风机）",
          "priceMatrix": {
            "class1": -85000,
            "class2": -64000,
            "class3": -33000,
            "class4": -27000,
            "class5": -24000
          },
          "model": "ZRS90NAY20FSZ",
          "note": "深型为减价（相对シンプルスリム基本）"
        },
        {
          "code": "tottemo",
          "name_ja": "とってもクリンフード",
          "name_zh": "超易清洗抽油烟机",
          "priceDiff": 50000,
          "model": "ZRS90ACH22FSZ"
        },
        {
          "code": "araiyell",
          "name_ja": "洗エールレンジフード",
          "name_zh": "自动清洗抽油烟机",
          "priceDiff": 111500,
          "model": "ZRS90ACF22MSZ"
        },
        {
          "code": "federica",
          "name_ja": "フェデリカ（デザインタイプ）",
          "name_zh": "费德丽卡（设计款）",
          "priceDiff": null,
          "model": "ZZFedL952S1",
          "note": "差价待核"
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
          "note": "対面専用；单元价 サイド ¥199,000–223,000 / センター ¥248,000–272,000；差价待核（page-79，非 page-8 共通オプション）"
        },
        {
          "code": "none",
          "name_ja": "レンジフードなし",
          "name_zh": "不装抽油烟机",
          "priceMatrix": {
            "class1": -209000,
            "class2": -188000,
            "class3": -157000,
            "class4": -151000,
            "class5": -148000
          },
          "note": "手册未显式写「不选」减额，按本体价推断（纯物料价，不含安装）（基准=シンプルスリムレンジフード本体，随 class 递变）"
        }
      ]
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
      "description_zh": "吊柜（单元类型见 wallCabinetUnits：ハンドムーブ/アイエリアボックス/オートムーブ/吊戸棚/シースルー/ムーブダウン/LED灯）。ハンドムーブ价表=class×间口75/90×照明付/無。",
      "options": [
        {
          "code": "automove",
          "name_ja": "オートムーブシステム",
          "name_zh": "电动升降吊柜",
          "prices": {
            "class1": {
              "240": 340000,
              "255": 350000,
              "270": 358000
            },
            "class2": {
              "240": 340000,
              "255": 346000,
              "270": 353000
            },
            "class3": {
              "240": 313000,
              "255": 320000,
              "270": 326000
            },
            "class4": {
              "240": 336000,
              "255": 346000,
              "270": 356000
            },
            "class5": {
              "240": 353000,
              "255": 367000,
              "270": 380000
            }
          }
        },
        {
          "code": "handmove",
          "name_ja": "ハンドムーブ",
          "name_zh": "手动升降吊柜",
          "prices": {
            "class1": {
              "240": 194000,
              "255": 189000,
              "270": 183000
            },
            "class2": {
              "240": 199000,
              "255": 196000,
              "270": 194000
            },
            "class3": {
              "240": 155000,
              "255": 152000,
              "270": 147000
            },
            "class4": {
              "240": 167000,
              "255": 167000,
              "270": 167000
            },
            "class5": {
              "240": 147000,
              "255": 151000,
              "270": 154000
            }
          }
        },
        {
          "code": "none",
          "name_ja": "吊戸棚なし",
          "name_zh": "不安装吊柜",
          "prices": {
            "class1": {
              "240": -169000,
              "255": -182000,
              "270": -196000
            },
            "class2": {
              "240": -116000,
              "255": -126000,
              "270": -135000
            },
            "class3": {
              "240": -104000,
              "255": -113000,
              "270": -124000
            },
            "class4": {
              "240": -66000,
              "255": -71000,
              "270": -76000
            },
            "class5": {
              "240": -44000,
              "255": -45000,
              "270": -47000
            }
          }
        }
      ]
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
          "name_zh": "滑动储物柜（基本系列）",
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
          "name_zh": "滑动储物柜（高度关怀系列）",
          "sizes": [
            "120",
            "150",
            "180"
          ],
          "depth": [
            "45",
            "55"
          ],
          "ref": "peripheralPrices.pantry_care"
        },
        {
          "code": "pantry_short",
          "name_ja": "スライドパントリー（ショートタイプ）",
          "name_zh": "滑动储物柜（矮型）",
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
          "name_zh": "单面落地柜台",
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
          "name_zh": "单面高落地柜台",
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
          "name_zh": "咖啡馆风收纳（餐边柜+落地柜台）",
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
          "name_zh": "咖啡馆风收纳（单面落地柜台）",
          "sizes": [
            "135",
            "150",
            "165",
            "180"
          ],
          "ref": "peripheralPrices.cafe_counter"
        }
      ]
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
      "description_zh": "クリン壁パネル / リンクシェルフ / 资料下载。",
      "options": [
        {
          "code": "link_shelf_hook",
          "name_ja": "リンクシェルフ（フックタイプ）",
          "name_zh": "置物架（挂钩式）",
          "price": 13000,
          "price45": 16500,
          "model": "ZKR030RH※-K",
          "note": "間口30cm ¥13,000 / 45cm ¥16,500"
        },
        {
          "code": "link_shelf_bar",
          "name_ja": "リンクシェルフ バー",
          "name_zh": "置物架 横杆",
          "price": 7000,
          "price45": 8500,
          "model": "ZKR030BN(S※)-K",
          "note": "間口30cm ¥7,000 / 45cm ¥8,500"
        },
        {
          "code": "link_shelf_magnet",
          "name_ja": "ピタッとリンクシェルフ（マグネット）",
          "name_zh": "磁吸置物架",
          "price": 17500,
          "price45": 21000,
          "model": "ZKR030RM※-K",
          "note": "間口30cm ¥17,500 / 45cm ¥21,000"
        }
      ],
      "downloads": [
        {
          "label": "Stedia プランニングガイド（手册 PDF）",
          "file": "manual/0259_stediaca_unlocked.pdf"
        },
        {
          "label": "Cleanup Stedia 官网",
          "url": "https://cleanup.jp/"
        }
      ],
      "note": "カップボード / 扉付トール家電収納庫：规格见手册 P100/102，价格在别册プランニングカタログ，本系统暂不收录。"
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
        "class1": 1696000,
        "class2": 1505000,
        "class3": 1287000,
        "class4": 1172000,
        "class5": 1110000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "195",
      "name_ja": "間口195cm",
      "name_zh": "宽195cm",
      "prices": {
        "class1": 1608000,
        "class2": 1476000,
        "class3": 1291000,
        "class4": 1185000,
        "class5": 1096000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "210",
      "name_ja": "間口210cm",
      "name_zh": "宽210cm",
      "prices": {
        "class1": 1654000,
        "class2": 1525000,
        "class3": 1334000,
        "class4": 1212000,
        "class5": 1120000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "225",
      "name_ja": "間口225cm",
      "name_zh": "宽225cm",
      "prices": {
        "class1": 1706000,
        "class2": 1578000,
        "class3": 1379000,
        "class4": 1241000,
        "class5": 1150000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "240",
      "name_ja": "間口240cm",
      "name_zh": "宽240cm",
      "prices": {
        "class1": 1728000,
        "class2": 1587000,
        "class3": 1418000,
        "class4": 1262000,
        "class5": 1171000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "255",
      "name_ja": "間口255cm",
      "name_zh": "宽255cm",
      "prices": {
        "class1": 1768000,
        "class2": 1623000,
        "class3": 1448000,
        "class4": 1286000,
        "class5": 1187000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "270",
      "name_ja": "間口270cm",
      "name_zh": "宽270cm",
      "prices": {
        "class1": 1889000,
        "class2": 1728000,
        "class3": 1535000,
        "class4": 1364000,
        "class5": 1258000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "285",
      "name_ja": "間口285cm",
      "name_zh": "宽285cm",
      "prices": {
        "class1": 1950000,
        "class2": 1787000,
        "class3": 1569000,
        "class4": 1400000,
        "class5": 1294000
      }
    },
    {
      "layout": "i",
      "plan": "basic",
      "width": "300",
      "name_ja": "間口300cm",
      "name_zh": "宽300cm",
      "prices": {
        "class1": 2000000,
        "class2": 1838000,
        "class3": 1614000,
        "class4": 1430000,
        "class5": 1316000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "180",
      "name_ja": "間口180cm",
      "name_zh": "宽180cm",
      "prices": {
        "class1": 1061000,
        "class2": 983000,
        "class3": 879000,
        "class4": 802000,
        "class5": 750000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "195",
      "name_ja": "間口195cm",
      "name_zh": "宽195cm",
      "prices": {
        "class1": 1086000,
        "class2": 1008000,
        "class3": 897000,
        "class4": 818000,
        "class5": 763000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "210",
      "name_ja": "間口210cm",
      "name_zh": "宽210cm",
      "prices": {
        "class1": 1120000,
        "class2": 1047000,
        "class3": 930000,
        "class4": 840000,
        "class5": 782000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "225",
      "name_ja": "間口225cm",
      "name_zh": "宽225cm",
      "prices": {
        "class1": 1143000,
        "class2": 1074000,
        "class3": 952000,
        "class4": 849000,
        "class5": 795000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "240",
      "name_ja": "間口240cm",
      "name_zh": "宽240cm",
      "prices": {
        "class1": 1179000,
        "class2": 1112000,
        "class3": 986000,
        "class4": 874000,
        "class5": 808000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "255",
      "name_ja": "間口255cm",
      "name_zh": "宽255cm",
      "prices": {
        "class1": 1203000,
        "class2": 1135000,
        "class3": 1004000,
        "class4": 890000,
        "class5": 820000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "270",
      "name_ja": "間口270cm",
      "name_zh": "宽270cm",
      "prices": {
        "class1": 1294000,
        "class2": 1215000,
        "class3": 1064000,
        "class4": 947000,
        "class5": 873000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "285",
      "name_ja": "間口285cm",
      "name_zh": "宽285cm",
      "prices": {
        "class1": 1318000,
        "class2": 1238000,
        "class3": 1082000,
        "class4": 963000,
        "class5": 885000
      }
    },
    {
      "layout": "i",
      "plan": "stylish",
      "width": "300",
      "name_ja": "間口300cm",
      "name_zh": "宽300cm",
      "prices": {
        "class1": 1352000,
        "class2": 1276000,
        "class3": 1115000,
        "class4": 985000,
        "class5": 903000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "180",
      "name_ja": "間口180cm",
      "name_zh": "宽180cm",
      "prices": {
        "class1": 1514000,
        "class2": 1436000,
        "class3": 1332000,
        "class4": 1255000,
        "class5": 1203000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "195",
      "name_ja": "間口195cm",
      "name_zh": "宽195cm",
      "prices": {
        "class1": 1539000,
        "class2": 1461000,
        "class3": 1350000,
        "class4": 1271000,
        "class5": 1216000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "210",
      "name_ja": "間口210cm",
      "name_zh": "宽210cm",
      "prices": {
        "class1": 1573000,
        "class2": 1500000,
        "class3": 1383000,
        "class4": 1293000,
        "class5": 1235000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "225",
      "name_ja": "間口225cm",
      "name_zh": "宽225cm",
      "prices": {
        "class1": 1609000,
        "class2": 1540000,
        "class3": 1418000,
        "class4": 1315000,
        "class5": 1261000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "240",
      "name_ja": "間口240cm",
      "name_zh": "宽240cm",
      "prices": {
        "class1": 1645000,
        "class2": 1578000,
        "class3": 1452000,
        "class4": 1340000,
        "class5": 1274000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "255",
      "name_ja": "間口255cm",
      "name_zh": "宽255cm",
      "prices": {
        "class1": 1669000,
        "class2": 1601000,
        "class3": 1470000,
        "class4": 1356000,
        "class5": 1286000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "270",
      "name_ja": "間口270cm",
      "name_zh": "宽270cm",
      "prices": {
        "class1": 1773000,
        "class2": 1694000,
        "class3": 1543000,
        "class4": 1426000,
        "class5": 1352000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "285",
      "name_ja": "間口285cm",
      "name_zh": "宽285cm",
      "prices": {
        "class1": 1797000,
        "class2": 1717000,
        "class3": 1561000,
        "class4": 1442000,
        "class5": 1364000
      }
    },
    {
      "layout": "i",
      "plan": "kirei",
      "width": "300",
      "name_ja": "間口300cm",
      "name_zh": "宽300cm",
      "prices": {
        "class1": 1831000,
        "class2": 1755000,
        "class3": 1594000,
        "class4": 1464000,
        "class5": 1382000
      }
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "180",
      "name_ja": "間口180cm",
      "name_zh": "宽180cm",
      "prices": {
        "class1": 2167000,
        "class2": 1935000,
        "class3": 1657000,
        "class4": 1499000,
        "class5": 1388000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "195",
      "name_ja": "間口195cm",
      "name_zh": "宽195cm",
      "prices": {
        "class1": 2172000,
        "class2": 1925000,
        "class3": 1673000,
        "class4": 1502000,
        "class5": 1394000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "210",
      "name_ja": "間口210cm",
      "name_zh": "宽210cm",
      "prices": {
        "class1": 2324000,
        "class2": 2074000,
        "class3": 1816000,
        "class4": 1643000,
        "class5": 1534000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "225",
      "name_ja": "間口225cm",
      "name_zh": "宽225cm",
      "prices": {
        "class1": 2396000,
        "class2": 2146000,
        "class3": 1871000,
        "class4": 1688000,
        "class5": 1574000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "240",
      "name_ja": "間口240cm",
      "name_zh": "宽240cm",
      "prices": {
        "class1": 2435000,
        "class2": 2184000,
        "class3": 1895000,
        "class4": 1709000,
        "class5": 1593000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "255",
      "name_ja": "間口255cm",
      "name_zh": "宽255cm",
      "prices": {
        "class1": 2556000,
        "class2": 2290000,
        "class3": 1982000,
        "class4": 1787000,
        "class5": 1664000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "l",
      "plan": "basic",
      "width": "270",
      "name_ja": "間口270cm",
      "name_zh": "宽270cm",
      "prices": {
        "class1": 2626000,
        "class2": 2346000,
        "class3": 2025000,
        "class4": 1824000,
        "class5": 1682000
      },
      "note": "コンロ側165cm 标准；コンロ側180cm 时 class1–5 加算 ＋45,000/＋45,000/＋38,000/＋40,000/＋36,000，工作台加算：ステンレス －3,000 / パウダー ＋1,000 / グラン ＋2,000 / スレート ＋4,000 / エルデ ＋4,000 / セラミック ＋7,000"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "243",
      "name_ja": "間口243cm・奥行80cm",
      "name_zh": "宽243cm·深度80cm",
      "prices": {
        "class1": 2259000,
        "class2": 1929000,
        "class3": 1751000,
        "class4": 1610000,
        "class5": 1509000
      },
      "depth": "80"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "258",
      "name_ja": "間口258cm・奥行80cm",
      "name_zh": "宽258cm·深度80cm",
      "prices": {
        "class1": 2321000,
        "class2": 1988000,
        "class3": 1805000,
        "class4": 1662000,
        "class5": 1557000
      },
      "depth": "80"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "273",
      "name_ja": "間口273cm・奥行80cm",
      "name_zh": "宽273cm·深度80cm",
      "prices": {
        "class1": 2463000,
        "class2": 2117000,
        "class3": 1914000,
        "class4": 1768000,
        "class5": 1659000
      },
      "depth": "80"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "243",
      "name_ja": "間口243cm・奥行98cm",
      "name_zh": "宽243cm·深度98cm",
      "prices": {
        "class1": 2507000,
        "class2": 2185000,
        "class3": 1890000,
        "class4": 1717000,
        "class5": 1629000
      },
      "depth": "98"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "258",
      "name_ja": "間口258cm・奥行98cm",
      "name_zh": "宽258cm·深度98cm",
      "prices": {
        "class1": 2570000,
        "class2": 2248000,
        "class3": 1948000,
        "class4": 1773000,
        "class5": 1680000
      },
      "depth": "98"
    },
    {
      "layout": "flat",
      "plan": "basic",
      "width": "273",
      "name_ja": "間口273cm・奥行98cm",
      "name_zh": "宽273cm·深度98cm",
      "prices": {
        "class1": 2713000,
        "class2": 2381000,
        "class3": 2061000,
        "class4": 1883000,
        "class5": 1785000
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "242.5",
      "name_ja": "間口242.5cm・奥行80cm",
      "name_zh": "宽242.5cm·深度80cm",
      "prices": {
        "class1": 1842500,
        "class2": 1647500,
        "class3": 1490500,
        "class4": 1437500,
        "class5": 1419500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "257.5",
      "name_ja": "間口257.5cm・奥行80cm",
      "name_zh": "宽257.5cm·深度80cm",
      "prices": {
        "class1": 1866500,
        "class2": 1671500,
        "class3": 1513500,
        "class4": 1461500,
        "class5": 1443500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "272.5",
      "name_ja": "間口272.5cm・奥行80cm",
      "name_zh": "宽272.5cm·深度80cm",
      "prices": {
        "class1": 1944500,
        "class2": 1749500,
        "class3": 1590500,
        "class4": 1539500,
        "class5": 1521500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "242.5",
      "name_ja": "間口242.5cm・奥行98cm",
      "name_zh": "宽242.5cm·深度98cm",
      "prices": {
        "class1": 1932500,
        "class2": 1740500,
        "class3": 1581500,
        "class4": 1527500,
        "class5": 1509500
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "257.5",
      "name_ja": "間口257.5cm・奥行98cm",
      "name_zh": "宽257.5cm·深度98cm",
      "prices": {
        "class1": 1956500,
        "class2": 1764500,
        "class3": 1605500,
        "class4": 1551500,
        "class5": 1533500
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "basic",
      "width": "272.5",
      "name_ja": "間口272.5cm・奥行98cm",
      "name_zh": "宽272.5cm·深度98cm",
      "prices": {
        "class1": 2455500,
        "class2": 2184500,
        "class3": 1874500,
        "class4": 1703500,
        "class5": 1611500
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "242.5",
      "name_ja": "間口242.5cm・奥行80cm",
      "name_zh": "宽242.5cm·深度80cm",
      "prices": {
        "class1": 1664500,
        "class2": 1469500,
        "class3": 1312500,
        "class4": 1259500,
        "class5": 1241500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "257.5",
      "name_ja": "間口257.5cm・奥行80cm",
      "name_zh": "宽257.5cm·深度80cm",
      "prices": {
        "class1": 1549500,
        "class2": 1354500,
        "class3": 1196500,
        "class4": 1144500,
        "class5": 1126500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "272.5",
      "name_ja": "間口272.5cm・奥行80cm",
      "name_zh": "宽272.5cm·深度80cm",
      "prices": {
        "class1": 1611500,
        "class2": 1416500,
        "class3": 1257500,
        "class4": 1206500,
        "class5": 1188500
      },
      "depth": "80"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "242.5",
      "name_ja": "間口242.5cm・奥行98cm",
      "name_zh": "宽242.5cm·深度98cm",
      "prices": {
        "class1": 1376500,
        "class2": 1246500,
        "class3": 1142500,
        "class4": 1106500,
        "class5": 1094500
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "257.5",
      "name_ja": "間口257.5cm・奥行98cm",
      "name_zh": "宽257.5cm·深度98cm",
      "prices": {
        "class1": 1555500,
        "class2": 1360500,
        "class3": 1202500,
        "class4": 1150500,
        "class5": 1132500
      },
      "depth": "98"
    },
    {
      "layout": "dual",
      "plan": "stylish",
      "width": "272.5",
      "name_ja": "間口272.5cm・奥行98cm",
      "name_zh": "宽272.5cm·深度98cm",
      "prices": {
        "class1": 1617500,
        "class2": 1422500,
        "class3": 1263500,
        "class4": 1212500,
        "class5": 1194500
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
        "class1": 2132000,
        "class2": 1957000,
        "class3": 1757000,
        "class4": 1584000,
        "class5": 1490000
      },
      "note": "2列型合计价 = コンロ側180 + シンク側181.5"
    }
  ],
  "wallCabinetUnits": {
    "note": "上柜（ウォールキャビネット）单元类型，来源 v2 手册 PDF 156–161。间口=柜体自身间口(cm)；价表含 class×间口×照明 或 间口×照明×タイプ。",
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
            "照明付": 211000,
            "照明無": 187000
          },
          "90": {
            "照明付": 219000,
            "照明無": 195000
          }
        },
        "class2": {
          "75": {
            "照明付": 187000,
            "照明無": 163000
          },
          "90": {
            "照明付": 194000,
            "照明無": 170000
          }
        },
        "class3": {
          "75": {
            "照明付": 159000,
            "照明無": 135000
          },
          "90": {
            "照明付": 165000,
            "照明無": 141000
          }
        },
        "class4": {
          "75": {
            "照明付": 146000,
            "照明無": 122000
          },
          "90": {
            "照明付": 151000,
            "照明無": 127000
          }
        },
        "class5": {
          "75": {
            "照明付": 125000,
            "照明無": 101000
          },
          "90": {
            "照明付": 130000,
            "照明無": 106000
          }
        }
      },
      "note": "高さ50/60/70cm；収納/水切りタイプ同价；价表为高さ70cm基准",
      "racks": {
        "サポートラック": 9000,
        "ペーパーラック": 7000,
        "皿立てラック": 7000,
        "レードルラック": 4000,
        "まな板ラック": 7000,
        "カトラリーラック": 7000
      }
    },
    "eyearea": {
      "name_ja": "アイエリアボックス",
      "name_zh": "眼部区域收纳盒",
      "types": {
        "seasoning": "調味料棚タイプ",
        "draining": "水切りカウンタータイプ"
      },
      "prices": {
        "45": {
          "seasoning": {
            "照明無": 40000
          }
        },
        "75": {
          "seasoning": {
            "照明無": 47000,
            "照明付": 73000
          },
          "draining": {
            "照明無": 49000,
            "照明付": 74000
          }
        },
        "90": {
          "seasoning": {
            "照明無": 50000,
            "照明付": 75000
          },
          "draining": {
            "照明無": 51000,
            "照明付": 76000
          }
        }
      },
      "note": "間口45/75/90cm，奥行30cm，下降42cm；45cm 仅调味料棚且无照明付"
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
        "サポートラック(W300)": 10000,
        "サポートラック(W500)": 13000,
        "皿立てラック": 8000,
        "レードルラック": 4000,
        "ふきんラック": 6000,
        "ペーパーラック": 7000,
        "カトラリーラック": 7000
      },
      "note": "高さ70cm，奥行37.5cm；専用不燃板 ¥10,000 / 専用化粧板 ¥4,000（別売）；间口75cm 不可"
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
      "note": "取手レス吊戸棚 / サイレントダンパー付"
    },
    "seethrough": {
      "name_ja": "シースルー吊戸棚",
      "name_zh": "透视吊柜",
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
        "name_zh": "LED跷跷板开关灯",
        "pricesBySize": {
          "60": 21000,
          "90": 26000
        },
        "model": "ZZKLDB060MW/090MW"
      },
      "touchless": {
        "name_ja": "LEDタッチレス",
        "name_zh": "LED感应灯",
        "pricesBySize": {
          "60": 36000
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
    "note": "下柜（フロアキャビネット）单元类型，来源 v2 手册 PDF 122–127。类型为基本仕様（无加减差价，类型差价在别册）；対応間口=柜体间口(cm)，奥行=D650/D600。手册原表対応間口为 mm（750/900/1050/1100mm 等），数据已统一换算为 cm。",
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
          "name_zh": "带工具袋嵌入式面板",
          "isBasic": true
        },
        {
          "name_ja": "ツールポケット付きタイプ",
          "name_zh": "带工具袋"
        },
        {
          "name_ja": "ツールポケット付き既設配水管対応タイプ",
          "name_zh": "带工具袋既有配水管对应"
        },
        {
          "name_ja": "スライドボックス＋ツールポケット付きインセットパネルタイプ",
          "name_zh": "滑动盒+工具袋嵌入式面板"
        },
        {
          "name_ja": "スライドボックス＋ツールポケット付き",
          "name_zh": "滑动盒+工具袋"
        },
        {
          "name_ja": "インセットパネルタイプ",
          "name_zh": "嵌入式面板"
        },
        {
          "name_ja": "シンプルタイプ",
          "name_zh": "简约"
        },
        {
          "name_ja": "シンプルタイプ既設配水管対応タイプ",
          "name_zh": "简约既有配水管对应"
        },
        {
          "name_ja": "シンプルタイプディスポーザー対応タイプ",
          "name_zh": "简约垃圾处理器对应"
        },
        {
          "name_ja": "開き扉タイプ",
          "name_zh": "对开门"
        },
        {
          "name_ja": "オープンタイプ",
          "name_zh": "开放"
        },
        {
          "name_ja": "オープンタイプ横組み込み間口15cm包丁差し付スライドタイプ",
          "name_zh": "开放横嵌15cm带刀架滑动"
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
          "name_zh": "双层抽屉带滑动盒"
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
          "name_zh": "开放"
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
          "name_zh": "燃气/IH共用带工具袋",
          "isBasic": true
        },
        {
          "name_ja": "ガス用/IH用スライドボックス＋ツールポケット付きタイプ",
          "name_zh": "燃气/IH滑动盒+工具袋"
        },
        {
          "name_ja": "グリルレス用スライドボックス＋ツールポケット付きタイプ",
          "name_zh": "无烤架滑动盒+工具袋"
        },
        {
          "name_ja": "グリルレス用ツールポケット付きタイプ",
          "name_zh": "无烤架带工具袋"
        },
        {
          "name_ja": "ガス・IH共用シンプルタイプ",
          "name_zh": "燃气/IH共用简约"
        },
        {
          "name_ja": "グリルレス用シンプルタイプ",
          "name_zh": "无烤架简约"
        },
        {
          "name_ja": "コンロ横組み込み間口15cm（網カゴ付き/ボトル対応）",
          "name_zh": "灶侧嵌15cm（网篮/瓶罐）"
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
          "name_zh": "推车型"
        },
        {
          "name_ja": "棚板タイプ",
          "name_zh": "搁板型"
        }
      ]
    }
  }
};