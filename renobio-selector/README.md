# LIXIL Renobio Fit（リノビオフィット）选型报价系统

> 部署目标：`elfDXiao.github.io/renobio-selector/`
> 基准范例：lidea-bathroom（タイプ×サイズ矩阵 + セレクト記号选项 + 无公式），遵循《选型系统构建规范》
> 数据源：LIXIL リノビオフィット システムバスルーム マンションリフォーム用（2026.08 価格掲載版，39 页）；`data/renobio-data.json`（data-analyst）+ `研究文档-Renobio选型流程.md`（t23）

## 一、文件清单

```
lidea-renobio/
├── data/
│   ├── renobio-data.json       data-analyst 价格数据（40 分类 287 选项，4 タイプ×4 サイズ矩阵）
│   ├── 数据提取说明.md           提取说明与不确定项
│   └── pages/                  手册页扫描图（page_01~39.png）
└── web/
    ├── index.html             页面结构（15 步向导 + 报价单 tab；命名空间 window.RENOBIO）
    ├── css/style.css          设计系统（沿用规范配色/组件 + dim-group-title/size-alt/opt-card.small）
    ├── js/price.js            价格解析（priceDiff / price / priceByType / pricesBySize / photoSet 套装价）
    ├── js/quote.js            维度配置 DIMS(33) + 计价引擎 + 壁パネル两段式 + 约束 + 品番 BKS/BLKS + 漢数字 + CSV
    ├── js/wizard.js           UI：radio/multi 渲染 + 壁柄分组 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js       主数据 window.RENOBIO_DATA（由 test/gen-products.js 生成，92KB）
    └── test/
        ├── gen-products.js    数据转换脚本（renobio-data.json → products.js）
        ├── smoke-test.js      核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js        UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（15 步，索引 0-14，贴近手册 Select Guide 顺序）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ・地域 | 尺寸·型号·地域 | size（卡片 4：1216/1116/1115/1014）、type（N/T/C/B）、region（一般 H/寒冷地 C＋¥5,000）、photo_set（6 プラン） |
| 1 | DOORPOS | ドア位置 | 门位置 | door_position（8：RL/LR/RC/LC＋100mm移動） |
| 2 | FLOOR | 床 | 地板 | floor（3：4E 標準/4C/4A 岩肌調単色） |
| 3 | WALL | 壁パネル | 壁面 | wall（0 全面/1 ACC B面/2 ACC C面）＋ wall_pattern（13 柄，ハイ/ベーシック分组）＋ wall_base（LE301/HN301/HN986） |
| 4 | BATHTUB | 浴槽 | 浴缸 | bathtub（3 FRP 色）、bathtub_drain（2）、bathtub_bar（2） |
| 5 | LID | フロフタ・フック | 浴缸盖·挂钩 | bathtub_lid（3）、bath_lid_hook（7） |
| 6 | CEILING | 天井・換気 | 天花板·换气 | ceiling（4）、fan（9）、laundry_pipe（1） |
| 7 | DOOR | ドア | 门 | door（38）、door_towel_bar（1） |
| 8 | FAUCET | 水栓 | 水龙头 | faucet（7：洗い場側 QM/SP/SS/SM＋浴槽側 NN/BS/BU）、faucet_cover（2 multi） |
| 9 | SHOWER | シャワー | 花洒 | shower_head（7）、shower_hook（12） |
| 10 | COUNTER | カウンター・照明 | 台面·照明 | counter（4 N/Tのみ）、vanity_shelf（2 Bのみ）、lighting（6）、washbasin（1 B） |
| 11 | MIRROR | ミラー | 镜子 | mirror（8）、kirei_mirror（2） |
| 12 | STORAGE | 収納・タオル | 收纳·毛巾 | storage（11）、towel（5） |
| 13 | FLOOR·PIPE | 床高・配管・追いだき | 地面·配管·追焚 | floor_height（2）、bolt_adhesive（2）、supply_piping（4）、oidaki（6） |
| 14 | OPTION | オプション | 附加选项 | magnet_items（20 multi）、grip_bar（12 multi）、door_frame（6）、window_frame（27 multi）、beam_panel（20 multi）、misc_options（8 multi） |

## 三、计价模型

1. **標準仕様価格**（本体価格・税抜・取付費別途）＝ タイプ（N/T/C/B）× サイズ（1216/1116/1115/1014）16 组合矩阵；寒冷地 ＋¥5,000（meta.typeBasePrices + region C）。
2. **セレクト価格**：全て標準仕様価格を基準とした ＋/− 差額（priceDiff / price / priceByType{N,T,C,B} / pricesBySize）。
3. **壁パネル两段式**：wall（0 全面張り／1 アクセント B面／2 アクセント C面）→ wall_pattern（13 柄）：
   - 全面張り：LE301（マットホワイト）= 標準（0）、其他可全面張り柄 = ＋¥70,000；fullWallCode=null 的柄不可（HN662/HN985/HT614/HT615/HT611/HT612）。
   - アクセント：ベース LE301（ベーシック）= ＋¥10,000／HN301・HN986（ハイクラス）= ＋¥70,000；花纹×ベース组合由 accentCodeByBase 校验（fullwall = 全面張り扱い不可）。
   - 花纹注文コード：全面張り = fullWallCode（如 H2/H1/81）；アクセント = accentCodeByBase[ベース]（如 NJ/L2/K6）。
4. **写真セット**（photo_set，6 プラン）：BK93A〜BK98A，photoSetPriceBySize[尺寸]（= 標準仕様 + オプション合計，BK93A N1216=¥1,071,040 实证 ✓）。
5. **税込** = 本体 × 1.10；**人民币含安装价** = 税込 × 汇率 × rmbRate（**0.8**，系数仅存在于 quote.js 计算内部，页面任何位置不显示算式）。
6. **本体品番**：`BKS-{サイズ}LB{タイプ}-B+H(C){ドア位置}`（B タイプ=BLKS 洗面器付き），例 BKS-1216LBN-B+H(C)RL / BLKS-1116LBB-B+H(C)RL。

## 四、组合约束（§5 关键互斥，已全量实现）

- C・B タイプ：カウンター選択不可；N・T・C：アクリル化粧棚不可（B のみ）；丸形洗面器 B のみ。
- 浴槽〈ピンク〉× 床〈グレー〉同時不可。
- 壁高1900（E9/K9）× 2000H ドア／スライドフック付握りバー(1000L) 同時不可。
- ワイドミラー × シャワーフック(2個)／化粧棚400W；Bタイプ ワイドミラー × 収納棚/壁高1900/滑钩800L。
- 大型ミラー × 各種収納棚/マグネットシェルフ。
- 化粧棚790W × 収納棚/マグネットシェルフ。
- 浴槽側水栓（BS/BU）N タイプのみ（priceByType null 自动禁用）。
- 浴槽内握りバー 1014 不可；開き戸800W/2枚引き戸800W 1216 のみ；フィラー付折り戸 1216/1116 のみ。
- ボルト脚接着剤(速乾) × 配管避け架台/防振/根太受け；天井点検口移動 × 梁パネルキット。
- 梁型パネル B面/C面 同時不可；B面 × ダウンライト；1014 C面 × 3室換気；Bタイプ B面 × ワイドミラー。
- 窓：1014 全面開口不可；全面開口 × 巻フタフック。
- 2枚引き戸 × フリーサイズドア額縁/化粧下枠。

## 五、无公式规范（全站统一）

页面任何可见位置（rate-hint / sec-sub / 报价单 / 复制清单）不显示人民币计算系数或算式，仅描述：
「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」。rmbRate=0.8 仅存在于 `js/quote.js` 计算内部。

## 六、测试与验证

```bash
node test/gen-products.js    # 数据转换 → products.js
node test/smoke-test.js      # 核心逻辑自测（计价矩阵/壁パネル/品番/约束/CSV）
node test/dom-test.js        # UI 渲染自测（jsdom，模拟 file://）
```

- 无公式 grep：index.html / wizard.js / price.js 不含 `rmbRate`、`折`、`×汇率`（quote.js 含 rmbRate 属正常）。
- 无「无该型号」：16 组合全矩阵 + sizeAltPrice 兜底，dom-test 断言尺寸卡片 0 个「无该型号」。
- 部署前再跑一遍 smoke + dom + 无公式 grep。
