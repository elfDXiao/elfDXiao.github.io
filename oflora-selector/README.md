# Panasonic オフローラ（Oflora）选型报价系统

> 部署目标：`elfDXiao.github.io/oflora-selector/`
> 基准范例：lidea-renobio（套装价矩阵 + セレクト差額 + 无公式 + sizeAltPrice），遵循《选型系统构建规范》
> 数据源：パナソニック オフローラ システムバスルーム（2026年10月価格改定版，PDF 113頁）；`data/oflora-data.json`（data-analyst，42 分类 355 选项）+ `研究文档-Oflora选型流程.md`（t36）

## 一、文件清单

```
panasonic-oflora/
├── data/
│   ├── oflora-data.json      data-analyst 价格数据（42 分类 355 选项，プラン×サイズ 4×6 矩阵）
│   ├── 数据提取说明.md          提取说明与不确定项（第 5 章）
│   └── part1~5.json          分块提取数据
└── web/
    ├── index.html             页面结构（14 步向导 + 报价单 tab；命名空间 window.OFLORA）
    ├── css/style.css          设计系统（沿用规范配色/组件 + dim-group-title/size-alt）
    ├── js/price.js            价格解析（priceDiff / price / pricesBySize / priceByType plan 键）
    ├── js/quote.js            维度配置 DIMS(39) + 计价引擎 + 约束 + 品番 BGF + 漢数字 + CSV
    ├── js/wizard.js           UI：radio/multi 渲染 + 壁柄 B/D 分组 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js       主数据 window.OFLORA_DATA（由 test/gen-products.js 生成，71KB）
    └── test/
        ├── gen-products.js    数据转换脚本（oflora-data.json → products.js）
        ├── smoke-test.js      核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js        UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（14 步，索引 0-13，プランニングガイド 35 字段分组）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | PLAN·SIZE | プラン・サイズ | 方案·尺寸 | plan（4：BASE/SUGOPIKA_CLEAN/MODERN_STYLE/MINIMUM_SELECT）+ size（卡片 6）+ photo_set（2 参考） |
| 1 | DOORHAND | ドア勝手 | 门开向 | door_hand（AR/AL/BR/BL） |
| 2 | INSTALL | 設置階・設置方法 | 安装楼层·方式 | install（5：1階/2階/架台，架台尺寸别 3 档） |
| 3 | BTPAN | 浴槽パン | 浴缸底盘 | bathtub_pan（3） |
| 4 | FLOOR | 床・床暖房 | 地板·地暖 | floor（9）+ floor_heating（2） |
| 5 | BATHTUB | 浴槽 | 浴缸 | bathtub_shape（4）+ bathtub_material（10）+ bathtub_function（6）+ bathtub_handle（4） |
| 6 | LID | 風呂フタ・エプロン | 浴缸盖·裙板 | bath_lid（6）+ bath_lid_hook（6）+ bathtub_apron（4） |
| 7 | WALL | 壁 | 壁面 | wall_accent（3）+ wall_pattern（28：B 24 + D 4 分组） |
| 8 | CEILING | 天井・換気 | 天花板·换气 | ceiling_height（3）+ ceiling（2）+ fan（15）+ clothes_bar（5）+ ceiling_opening（4） |
| 9 | DOOR | ドア | 门 | door（21） |
| 10 | COUNTER | カウンター・水栓・シャワー | 台面·水龙头·花洒 | counter（18）+ faucet（12）+ shower_head（10）+ bathtub_faucet（5） |
| 11 | LIGHT | 照明・ミラー・収納 | 照明·镜子·收纳 | lighting（10）+ mirror（11）+ storage（11）+ storage_table（5）+ shower_hook（8）+ towel（6） |
| 12 | PIPE | 裏配管・断熱・窓枠 | 背管·保温·窗框 | back_piping（7）+ insulation（8）+ insulation_wall（5）+ window_frame（25） |
| 13 | OPTION | オプション | 附加选项 | av（6 multi）+ bath_function_opts（5 multi）+ grip_bar（8 multi）+ misc_opts（23 multi）+ reform（16 multi） |

## 三、计价模型

1. **プラン套装价**（本体・税抜・取付設置費別）＝ プラン（4）× サイズ（6）矩阵（meta.planPrices；**タイプ概念なし**），价格 = プラン套装价 + Σセレクト差 + Σオプション。
2. **セレクト差価**：固定差（price/priceDiff）/ サイズ別（pricesBySize 6 键）/ plan 键（priceByType）。
3. **写真セット**（photo_set，BGF5710/BGF5708）：参考项，不计价（仅展示）。
4. **税込** = 本体 × 1.10；**人民币含安装价** = 税込 × 汇率 × rmbRate（**0.65**，系数仅存在于 quote.js 计算内部，页面任何位置不显示算式）。
5. **本体品番**（简略）：`BGF{サイズ記号 2-7}{プランコード 1-4}`（例 BGF51=1616 ベース；正式 35 字段过于复杂，见研究文档 §7）。

## 四、组合约束（§8.3 全量，约 25 条）

- 浴槽形状×尺寸（ワイド 1621 のみ；エスライン/リクライン 1316/1216 不可）；材质×形状（リクライン×アクアマーブル/FRP 不可）・×尺寸（アクアマーブル/FRP 1316 不可）。
- 保温浴槽Ⅱなし × 高断熱仕様（断熱材床 2/5）不可；浴槽パンあり（保温Ⅱ）× 保温なし不可。
- ハンドル：1316/1216 なしのみ。カビシャット系換気：1316/1216 不可。
- エプロンメタリックシルバー × ウェーブ/ワイドスクエアカウンター 不可。
- 兼用デッキ水栓 × 浴槽側水栓 不可；セミワイドミラー × シャワーフック 不可；サークルLED × スリムハイミラー 不可。
- 床暖房スイッチ = 床暖房選択時のみ；ジェットバスE × リクライン；防振ゴム × 架台設置；全幅開口窓枠 1818 不可；壁柄 DA/DB 全面同柄不可。
- ⚠ 2026年10月末 受注終了品（★ 印）提示。

## 五、无公式规范（全站统一）

页面任何可见位置（rate-hint / sec-sub / 报价单 / 复制清单）不显示人民币计算系数或算式，仅描述：
「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」。rmbRate=0.65 仅存在于 `js/quote.js` 计算内部。

## 六、测试与验证

```bash
node test/gen-products.js    # 数据转换 → products.js
node test/smoke-test.js      # 核心逻辑自测（矩阵/差価/约束/品番/CSV）
node test/dom-test.js        # UI 渲染自测（jsdom，模拟 file://）
```

- 无公式 grep：index.html / wizard.js / price.js 不含 `rmbRate`、`×汇率`、`0.65`（quote.js 含 rmbRate 属正常）。
- 无「无该型号」：4×6 全矩阵 + sizeAltPrice 兜底，dom-test 断言尺寸卡片 0 个「无该型号」。
- 数据修正说明：install 设置价按研究文档 §3.3 修正（原数据标准项误含架台价）；mirror スリムハイ（B4/A4）按 H2150 补价 40,700（H2000 时 -3,850 注记）。
- 部署前再跑一遍 smoke + dom + 无公式 grep。
