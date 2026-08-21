# LIXIL シャワーユニット NS（SHOWER UNIT）选型报价系统

> 部署目标：`elfDXiao.github.io/shower-selector/`
> 基准范例：lidea-renobio（タイプ×サイズ矩阵 + セレクト差額 + 壁柄分组 + 无公式 + sizeAltPrice），遵循《选型系统构建规范》
> 数据源：LIXIL シャワーユニット NS（2026 価格掲載版，PDF 70頁＝手册 P.1-68；**SP 系列未収録，留待后续**）；`data/shower-data.json`（data-analyst，MiMo 复核壁柄/シャワー表）+ `研究文档-Shower选型流程.md`（t26）

## 一、文件清单

```
lidea-shower/
├── data/
│   ├── shower-data.json       data-analyst 价格数据（32 分类 209 选项，4 タイプ×4 サイズ矩阵）
│   ├── 数据提取说明.md          提取说明与不确定项
│   └── pages/                 手册页扫描图（page_01~70.png）
└── web/
    ├── index.html             页面结构（11 步向导 + 报价单 tab；命名空间 window.LSHOWER）
    ├── css/style.css          设计系统（沿用规范配色/组件 + dim-group-title/size-alt/opt-card.small）
    ├── js/price.js            价格解析（priceDiff / price / priceByType / pricesBySize / 条件键字段）
    ├── js/quote.js            维度配置 DIMS(32) + 计价引擎 + 壁パネル两段式 + 水栓種条件键 + 约束 + 品番 NSPB + 漢数字 + CSV
    ├── js/wizard.js           UI：radio/multi 渲染 + 壁柄 3 クラス分组 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js       主数据 window.LSHOWER_DATA（由 test/gen-products.js 生成，87KB）
    └── test/
        ├── gen-products.js    数据转换脚本（shower-data.json → products.js）
        ├── smoke-test.js      核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js        UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（11 步，索引 0-10，シャワーユニット＝無浴槽）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ・地域 | 尺寸·型号·地域 | size（卡片 4：1216/0914/0912/0812）、type（UZ/UX/FZ/FX）、region（H/C＋¥5,000）、photo_set（12 プラン） |
| 1 | DOORPOS | ドア位置 | 门位置 | door_position（RL/LR/RC/LC） |
| 2 | WALL | 壁パネル | 壁面 | wall（0 全面/1 アクセントB面）＋ wall_pattern（23 柄：プレミアムⅠ/ハイ/ベーシック 分组）＋ wall_base（HN301/HT541/HT613/HT611/LE301） |
| 3 | FLOOR | 床・ベンチ | 地板·座椅 | floor（16：岩肌調/サーモフロア/200mmタイル）、bench（4：フルワイド/グランザ 1216 専用） |
| 4 | CEILING | 天井・換気・照明 | 天花板·换气·照明 | ceiling（J0-J2/P0-P2）、fan（C/M/U/1/P/N）、lighting（GP/GP2/QD/CB） |
| 5 | DOOR | ドア | 门 | door（8：折り戸/開き戸/テンパー）、door_color（7）、door_handle（3）、door_towel_bar（1）、partition（4） |
| 6 | FAUCET | 水栓 | 水龙头 | faucet（11：UZ=アクアタワー/UX=シャワーシステム/FZ・FX=クロマーレS）、bodyhug（2）、faucet_cover（1） |
| 7 | SHOWER | シャワー・フック | 花洒·挂钩 | shower_head（18：水栓種条件键）、shower_hook（11）、shower_hose_hook（3） |
| 8 | MIRROR | ミラー・収納・タオル | 镜子·收纳·毛巾 | mirror（4）、storage（8）、towel（4） |
| 9 | GRIP·PIPE | 握りバー・配管・据付 | 扶手·配管·安装 | grip_bar（8）、supply_piping（2）、mount（4：ボルト脚/吊架台） |
| 10 | OPTION | オプション | 附加选项 | window_frame（8）、door_frame（8）、other_options（6 multi）、misc（1） |

## 三、计价模型

1. **標準仕様価格**（本体価格・税抜・取付費別途・オプション別）＝ タイプ（UZ/UX/FZ/FX）× サイズ（1216/0914/0912/0812）16 组合矩阵；寒冷地 ＋¥5,000（meta.typeBasePrices + region C）。
2. **セレクト価格**：標準仕様価格を基準とした ＋/− 差額（priceDiff / price / priceByType{UZ,UX,FZ,FX} / pricesBySize{1216,other,tile} / 条件键字段）。
3. **壁パネル两段式**：wall（0 全面張り／1 アクセント張りB面）→ wall_pattern（23 柄 3 クラス）：
   - 全面張り：priceByClass（premium1 +30,000／high ±0／basic −50,000；鏡面ホワイト/HN301 標準）。
   - アクセント：priceByCombo（premium1×high +10,000／premium1×basic −10,000／high×high ±0／high×basic −20,000）；ベース 5 種（HN301/HT541/HT613/HT611=ハイ、LE301=ベーシック），組合せコード = accentCodeByBase。
   - 写真套装 12 プラン交叉验证全一致（SU02G HT513×HT541=+10,000 ✓、SU04F HN972 全面=+30,000 ✓、SU07F HT612×HT611=±0 ✓）。
4. **水栓種条件键**（シャワーヘッド/フック/ホースフック按水栓グループ別价格）：
   - shower_head：UZUX_tower（アクアタワー/アクアネオ）・UZUX_sysMetal（シャワーシステムOG1メタル）・UZUX_black（ブラック系）・FZFX_other・FZFX_bst。
   - shower_hook：UZ／UX_tower／UX_sys／FZFX_other／FZFX_bst；storage：UZUX／FZFX。
5. **写真セット**（photo_set，12 プラン）：SU02G〜SU18A，photoSetPrice = standardPrice + optionTotal（SU02G=2,428,800、SU07F=728,200 实证 ✓）。
6. **税込** = 本体 × 1.10；**人民币含安装价** = 税込 × 汇率 × rmbRate（**0.8**，系数仅存在于 quote.js 计算内部，页面任何位置不显示算式）。
7. **本体品番**：`NSPB-{サイズ}L{床A/B}{タイプ}-C+H(C){ドア位置}`（A=タイル床／B=FRP床），例 NSPB-0914LAUZ-C+H(C)RL / NSPB-0812LBFX-C+H(C)RC。

## 四、组合约束（§5 关键互斥，已全量实现）

- ベンチ：UZ/FZ のみ（フルワイド 1216以外／グランザ 1216 専用）。
- 換気乾燥暖房機（P）：**1216・FZ/FX のみ**・壁高2000 不可。
- 照明：タテライン 0812 不可・UZ/FZ×RC/LC 不可；スリム UZ/UX 不可・×平天井ブラック・×壁柄＊1＊2；ダウンライト1灯×平天井ブラック。
- ドアカラー：9 折り戸900Wのみ（販売終了マーク）・6/5 テンパー系のみ・8 開き戸強化ガラスのみ・4/2 テンパー不可。
- 開き戸ハンドル：開き戸/開き戸（強化ガラス）のみ。ドア外タオル掛：開き戸系のみ。
- 間仕切りユニット：0914/0912/0812×RC/LC・UZ/FZ×0914以下・折り戸/テンパー2枚引き戸・ドア高不一致 不可。
- ボディハグシャワー：UX のみ・壁付サーモ水栓（OG1）との組合せ必須・0812×メタルシェルフ180W。
- スイッチ付シャワー × シャワーシステム/ボディハグ 不可。シャワーホースフック：UZ/FZ のみ。
- E面接続：1216 不可・×テンパー2枚引き戸/間仕切り。吊架台：UX/FX のみ・×テンパー2枚引き戸。
- その他：ドレン排水管×吊架台・防振ゴム×吊架台/架台/根太受け・ドア額縁×2200H/2100H ドア。
- ⚠ 販売終了（2026年7月14日）：ドアカラー9〈樹脂ブラックスモーク〉・★付きアイテム；長納期（200mm角タイル+2週間）提示。

## 五、无公式规范（全站统一）

页面任何可见位置（rate-hint / sec-sub / 报价单 / 复制清单）不显示人民币计算系数或算式，仅描述：
「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」。rmbRate=0.8 仅存在于 `js/quote.js` 计算内部。

## 六、测试与验证

```bash
node test/gen-products.js    # 数据转换 → products.js
node test/smoke-test.js      # 核心逻辑自测（矩阵/壁パネル/条件键/约束/品番/CSV）
node test/dom-test.js        # UI 渲染自测（jsdom，模拟 file://）
```

- 无公式 grep：index.html / wizard.js / price.js 不含 `rmbRate`、`折`、`×汇率`（quote.js 含 rmbRate 属正常）。
- 无「无该型号」：16 组合全矩阵 + sizeAltPrice 兜底，dom-test 断言尺寸卡片 0 个「无该型号」。
- 12 写真套装 standardPrice+optionTotal=photoSetPrice 全一致；16 组合 × 全维度 disabledReason 无崩溃。
- 部署前再跑一遍 smoke + dom + 无公式 grep + check 脚本。
