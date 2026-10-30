# LIXIL Lidea（リデア）选型报价系统

> 部署目标：`elfDXiao.github.io/lidea-selector/`
> 基准范例：toto-synla（タイプ×サイズ矩阵 + セレクト記号选项），遵循《选型系统构建规范》
> 数据源：LIXIL リデア（Lidea）システムバスルーム 戸建用（2026.08 価格掲載版，147 页）；`data/lidea-data.json`（data-analyst）+ `研究文档-Lidea选型流程.md`（t10）

## 一、文件清单

```
lidea-bathroom/
├── data/
│   ├── lidea-data.json        data-analyst 价格数据（31 分类 457 选项）
│   └── 数据提取说明.md          提取说明与不确定项
└── web/
    ├── index.html             页面结构（16 步向导 + 报价单 tab；命名空间 window.LIDEA）
    ├── css/style.css          设计系统（沿用规范配色/组件）
    ├── js/price.js            价格解析（priceDiff / price / priceByType 多样键 / pricesBySize）
    ├── js/quote.js            维度配置 DIMS(33) + 计价引擎 + 条件键解析 + 约束 + 品番 BDU + 漢数字 + CSV
    ├── js/wizard.js           UI：radio/multi 渲染 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js       主数据 window.LIDEA_DATA（由 test/gen-products.js 生成，97KB）
    └── test/
        ├── gen-products.js    数据转换脚本（lidea-data.json → products.js）
        ├── smoke-test.js      核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js        UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（16 步，索引 0-15，贴近手册 Select Guide 顺序）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ | 尺寸与型号 | size（卡片 9）、type（H/B/M/C）、region（一般 H/寒冷地 C） |
| 1 | DOORPOS | ドア位置・下部据付 | 门位置·基础 | door_position（20：RL/LR/RC/LC＋移動）、kudai（10）、bathtub_pan（S/W） |
| 2 | WALL | 壁パネル | 壁面 | wall（11：全面/アクセント×4 クラス） |
| 3 | FLOOR | 床 | 地板 | floor（9 色） |
| 4 | BATHTUB | 浴槽 | 浴缸 | bt_tub（14）、bt_apron（6）、bt_drain（3）、bt_bar（3）、bt_headrest（2） |
| 5 | LID | フロフタ・フック | 浴缸盖·挂钩 | bt_lid（5）、bt_lidhook（10） |
| 6 | CEILING | 天井 | 天花板 | ceiling（9） |
| 7 | VENT | 換気設備 | 换气设备 | fan（14：換気乾燥暖房機/ランドリーパイプ/洗面室暖房機） |
| 8 | DOOR | ドア | 门 | door（33） |
| 9 | FAUCET | 水栓 | 水龙头 | faucet（9＋基本）、body_hug（3）、tub_faucet（4＋なし）、faucet_misc（2） |
| 10 | SHOWER | シャワー | 花洒 | shower_head（17＋基本）、shower_hook（22） |
| 11 | PURIFIED·COUNTER | うるつや・カウンター | 净水·台面 | urutuya（A/N）、hose_hook（4）、counter（7） |
| 12 | LIGHT·MIRROR | 照明・ミラー | 照明·镜子 | lighting（8＋基本）、mirror（12） |
| 13 | STORAGE | 収納・マグネット | 收纳·磁吸件 | storage（43）、magnet（28 multi） |
| 14 | TOWEL·GRIP | タオル・握りバー | 毛巾杆·扶手 | towel（10）、grip_bar（10＋なし） |
| 15 | OPTION | 付加オプション | 附加选项 | support_pack（2）、bathroom_tv（4 multi）、oidaki（8）、aqua_jet（3）、osouji（2 multi）、window_frame（47 multi）、water_pipe（6）、misc_options（35 multi） |

**標準仕様価格矩阵（税抜，meta.typeBasePrices）**：4 タイプ（H/B/M/C）× 9 尺寸；1624/S1818 仅 M/C。
1616 标准价：H ¥1,682,000 ｜ B ¥1,528,000 ｜ M ¥1,379,000（basePlan）｜ C ¥1,125,000。
**品番**：`BDUS/BDUW-サイズタイプ-A+H(C)ドア位置`（简化版，省略壁パネル L/床 B/浴槽 2 段；完整规则见 meta.productNo）。
**寒冷地**：region=C → 標準仕様価格 ＋¥5,000。

## 三、数据 schema（products.js → `window.LIDEA_DATA`）

```json
{
  "meta": {
    "brand": "LIXIL Lidea（リデア）", "series": "BD", "taxRate": 0.10, "rmbRate": 0.6,
    "typeBasePrices": {"H":{"1616":1682000,...},"B":{...},"M":{...},"C":{...}},
    "sizeGroups": {"16□□":"1624・1620・1618・1616","13□□":"1318・1316","□□18":"S1818・1618・1318","□□16":"1616・1316・1216・S1216"},
    "coldRegionPatterns": {...}, "photoSetFormula": {...}
  },
  "categories": [
    { "id":"faucet", "options":[{"code":"D4","priceByType":{"H":0,"BMC":19600}}] },
    { "id":"water_pipe", "options":[{"code":"A","priceByType":{"FaucetNone":0,"WallFaucet":15000}}] },
    { "id":"shower_head", "options":[{"code":"EF","priceByType":{"ThermoMetal/WideLever":0,"ShowerSystem":7000}}] },
    { "id":"support_pack", "options":[{"code":"B35","priceByType":{"H16":127000,"B16":108000,"M16":143000,"H13":108000,...}}] }
  ]
}
```

### 价格字段

| 字段 | 含义 | 示例 |
| :--- | :--- | :--- |
| `priceDiff` | 固定差价（全タイプ共通） | `130000`（壁パネル W0） |
| `price` | 单品绝对价 | `334000`（浴室テレビ） |
| `priceByType` | タイプ键（H/B/M/C）或组键（HBM/BMC/HMC/BM） | `{"H":0,"BMC":19600}` |
| `priceByType` 条件键 | 按当前选择解析：水栓種（ThermoMetal/WideLever/ShowerSystem/BlackFaucet）、浴槽側水栓（FaucetNone/WallFaucet）、うるつや（UruAri/UruNashi）、サポートパック（タイプ+尺寸组 H16/H13）、**浴槽材質（PearlQuartz/FRP：P.117 排水栓）**、**H×シャワーシステム（H_SS/H_BH：P.130/132）**、**シャワーホースフック复合键（UruAri_BM／UruNashi_MS_Futsu／UruNashi_BM_Kan 等：P.128）** | `{"FaucetNone":0,"WallFaucet":15000}` |
| `sizes` / `types` | 適用尺寸/タイプ限定（直接数组，或由 `availability` 派生） | `["1624","S1818"]` |
| `material` | 浴槽材質标签（T6-T8=パールクォーツ／TR-TV=ルフレトーン／TA-TD=FRP）——排水栓可/不可与价格按此分支 | `"FRP"` |
| `pricesBySize` | 尺寸档差价（键为尺寸或尺寸组） | `{"1624":0,"1620/S1818/1618":0,...}` |
| `constraints` / `note` | 组合限制/备注 | — |

### 计价（与规范一致；人民币系数不显示）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ]`（＋寒冷地 ¥5,000）＋ Σ选项差价（タイプ/条件键/尺寸取值）
- 税込 ＝ 税抜 × 1.10
- ★ 大陆地区价格 ＝ 税込 × 汇率 × `rmbRate(0.6)`，**页面/报价单不显示系数与算式**，仅标注「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- 写真セット価格 ＝ 標準仕様価格 ＋ オプション合計価格（手册各 PLAN 可复现）

## 四、已实现的组合约束（disabledReason / autoFix）

1. 尺寸・タイプ限定：1624/S1818 仅 M/C（setSize 自动修复）；アクアジェット4穴（K20）13□□/1216/S1216 不可；サポートパック C タイプ/1624/S1818 不可
2. 互斥：シャワーシステム（H3/H4）× まる洗いカウンター／ダウンライト以外照明；うるつや浄水 × 壁付サーモブラック（D5）／兼用水栓（S5）／とるピカスリム（VM）／ブラック・白系フック；兼用水栓 × 浴槽側水栓；ワイドミラー × 浴室テレビ；おそうじ浴槽 × アクアジェット；おそうじ浴槽 × サーモバスSなし
3. 必须搭配：アクアジェット/おそうじ浴槽 → 浴槽パンあり（autoFix 自动切 W）；洗面室暖房機（K58）→ プラズマクラスター搭載換気乾燥暖房機（Q/T）；浴槽側水栓 → 給水給湯 WallFaucet 差价联动
4. 条件键价格自动解析（water_pipe/shower_head/shower_hook/support_pack）
5. 数据驱动：sizes/types/priceByType 限定自动生效

## 五、人民币说明规范（★ 用户明确要求，全站统一）

- 系数 `rmbRate=0.6` 仅存在于 `products.js meta` 与 `quote.js` 计算代码
- 页面可见位置（rate-hint / sec-sub / 报价单 doc-footer / sumRMB 标签 / copyList / meta description）一律**不显示系数或算式**
- 只允许出现：「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」式描述
- 已通过「无公式 grep 自查」：index.html / wizard.js / price.js 渲染路径不含 `0.7`、`7折`、`×汇率` 等字样

## 六、事件绑定（规范踩坑遵守）

- `bindDelegated()`：#wizBody 的 change/click 仅 init 时委托绑定一次（radio data-code/data-basic/data-none、multi data-code）
- `bindStatic()`：导航/tab/语言/汇率/客户表单/打印 仅 init 绑定一次
- 严禁在 renderStep 中重复 addEventListener；t() 返 HTML、tp() 返纯文本；价格符号全角 ＋－

## 七、测试

```bash
node test/gen-products.js            # 重新生成 products.js（数据更新后必跑；源=lidea-data.json）
node test/smoke-test.js              # 核心逻辑 ✅
node test/dom-test.js                # UI 渲染 ✅（jsdom 模拟 file:// 直开）
node test/cold-region-test.js        # 寒冷地（region=C）选项价通道 ✅
node test/official-verify-20261019.js  # ★ 官方 P110-P147 逐表核对门禁（85 断言）✅
node test/probe-ds-diff.js           # 与 d51c8f8 基线逐格对比（历史探针）
node test/snapshot-region.js         # 一般地/寒冷地全量 contribution 快照；`--old <dir>` 可做前后 diff
node test/sync-json-from-products.js # 维护工具：把 products.js 独有字段回填 lidea-data.json（--dry 试跑）
node test/fix-official-20261019.js   # 维护工具：2026-10-19 官方修订数据脚本（--dry 试跑；page 出处写在每条 note）
python test/browser-check.py         # ★ 真实浏览器门禁（20 项，需 python playwright；仓库根目录起 8093 服务）
```

### 寒冷地（region=C）选项价通道

手册口径「寒冷地仕様価格（一般地と異なる差額のみ記載）」→ 实现为 **按当前上下文生效的字段替换**：

- 选项上可写 `coldPriceByType` / `coldPricesBySize` / `coldPriceDiff` / `coldPrice` / `coldIsBasic`，语义与对应普通字段完全相同（含条件键、嵌套尺寸表、组键 □□18/□□16）。
- 寒冷地时，`Q.effective(option, dimId)` 在该 cold 字段**对当前 タイプ×尺寸（或水栓/うるつや条件键）有格**时顶替普通字段；**没有格 → 沿用一般地价**（「異なる差額のみ記載」的自然结果）；格的值写 `null` = 寒冷地不可选（`disabledReason` 会给出理由）。
- 计价链（`radioContribution` → `describe` → `computeQuote`/`toCSV`）与卡片显示（wizard 的 `priceFor`/`optionPriceSummary`）都过 `effective()`，所以明细与合计必然同口径。
- 标准价：`meta.coldTypeBasePrices[タイプ][尺寸]` 有格则顶替一般地标准价；无该字段时维持原有全局 `＋¥5,000`（金额可用 `meta.coldBaseAdd` 覆盖）。
- **现网数据无任何 cold* 字段**，`effective()` 原样返回同一对象 → 一般地与旧数据行为逐字节不变（`snapshot-region.js --old` 的 diff 为 0）。

smoke 特有断言：**0.65 人民币计价（M1616：1,379,000→税込 1,516,900→×0.05×0.6=45,507）**、標準仕様価格矩阵抽查、寒冷地 +5,000、1624 自动修复タイプ→M、条件键（water_pipe FaucetNone/WallFaucet、shower_head ThermoMetal/ShowerSystem、support_pack H16/H13）、约束（サポートパック C 不可、シャワーシステム×カウンター、うるつや×D5、兼用×浴槽側、K58 需 Q/T、アクアジェット→パン W autoFix、K20 尺寸限定）、品番 BDUS-1616M-A+H(C)RL、CSV。

## 八、2026-10-19 官方逐表核对修订（P110-P147）

以官方 PDF（与本地目录 P110-P147 文本层逐字节一致的 2026.08 価格掲載版）逐表比对后修订；
证据存 `E:/自媒体账号阶段性成活/个人主页管理/lidea-bathroom/_verify_official_20261019/`（official_p*.txt 表抽提 + imgs/*.png 放大图）。

**修了的价格（右上为官方页）**：

| 位置 | 官方 | 修订前 |
| :--- | :--- | :--- |
| 床 P.114 | C タイプ列：1E/1C/1A +¥50,000、1F/1D/1B +¥70,000；2E/2C/2A 仅 C | C 列为 0 / 全タイプ共通 +20,000；2E/2C/2A 全タイプ可选 |
| 浴槽排水栓 P.117 | プッシュ：HBM±0／C+15,000；ゴム栓：HBM(FRP)−15,000／C(FRP)±0／パールは― | 按材質键（HBM+FRP 多算 15,000＋两项少算/多减） |
| カウンター P.128 | NY（なし・585mm）=HBM−35,000／C±0；XV は C―；アッパーカウンターは 1624・S1818×M/C 専用 | NY=0；AC1/AC2 无限制 |
| 照明 P.129 | EC/EH 標準灯数=±0（+17,900 是「1灯多い」版，另设 EC_UP/EH_UP）；YC/YH・PC の 1620系=+3,900/+15,900；1灯版 −7,000/−1,000（另设 YC1/YH1/PC1）；1216×シャワーシステムは GP/RW が3灯 | EC/EH 小尺寸默认 +17,900；YC/PC 1620系用了小尺寸的 1灯值 |
| ミラー P.130 | NN（ミラーなし）B−40,500〜−31,500／M−13,500／C−8,700；EA は H×シャワーシステム+10,000；BA は C 専用；キレイ鏡は B/M/C | B/M/C 不能选なし；EA 写反；BA/キレイ镜无类型限定 |
| 収納 P.132 | KD=HD 同額、GT=FT 同額、**JT/KT（新設）=HT 同額**；メタルシェルフは H×シャワーシステム／M S1818・以外で分岐（C は―）；H（ボディハグ）列与シャワーシステム列分开 | KD/GT 固定值；JT/KT 缺失；メタルシェルフ按尺寸一口价 |
| 収納 P.131 | 1U/2U/SB は B 専用；浴槽側メタルシェルフ600W（AA/BA）は H×シャワーシステム専用 | 无类型/条件限定 |
| 給水給湯配管 P.144 | 全 8 種（A/ウ/B/D/**エ/ニ**）；パンなし=A/ウ/B、パンあり=D/エ/F/R/ニ | 6 種；无パン区分（ウ 在无壁付水栓时也可选） |
| シャワーヘッド P.126 | FF/FG 仅 B/M/C（H表无） | H 可采（−12,000） |
| シャワーフック P.127 | GE/GF/GD/HD 为 B 专用；GC/HC 的 M/C 价不同（GC：M−3,000/C+25,000） | B 值通用于所有タイプ |
| シャワーホースフック P.128 | うるつや有無 ×（B/M・M S1818・C）× 兼用水栓 三维持价（含 HK_N） | 5 个代表值（C/M S1818 价错） |
| 保温材 P.140 | S20 トラップ保温材：一般地+3,000／寒冷地±0 | 用 `一般地/寒冷地` 键（引擎不识别 → 禁用） |
| ドア高×壁高 P.123 | 壁高1900 时 2000H 门不可 | 未执行 |

**管线（重要）**：源数据 = `lidea-bathroom/data/lidea-data.json`，线上 `data/products.js` 由 `test/gen-products.js` 生成。
本轮先跑 `test/sync-json-from-products.js` 把线上修復批次（水栓按タイプ重键、8 青字格寒冷地价、T6-T8 尺寸限定）**回填源 JSON**，再改新修正——
否则直接生成会把线上已修好的那幾项覆盖回旧值。现在的回归链：JSON → gen-products → products.js（与修订前逐字节可复现）+ 四套 Node 门禁 + 无头浏览器门禁。

### 第二批（同日）：形状维度・门位移矩阵・壁柄矩阵（之前列为"局限"的三项，已实现）

**① 浴槽形状维度（P.115 表14 / P.116 表1-2）**
- 新维度 `bt_shape`：MW ミナモワイド／WD ワイド／MN ミナモ／EB エコベンチ／SL ストレートライン／L16 1600ロング／L12 1200ロング；形状本身 ±0，适用尺寸随形状（未选＝按尺寸取标准形：1624=WD，其余=MN）。
- 浴槽材质/颜色按形状限定（`shapes` 字段）：T6-T8 パール限定「ミナモ」；**新增 S6/S7/S8（パール・ミナモワイド，各+165,000）**；TR〜TV ルフレトーン、TA〜TD FRP 限 6 形状（ワイド/ミナモ/エコベンチ/ストレートライン/1600ロング/1200ロング）。
- 形状分支的价格：握りバー BAR2（エコベンチ/1600ロング/ストレートライン 与 1318/1316 → +27,000，其余+37,000）· フロフタ FT_F（1624/1620ワイド +9,000 / 非ワイド +6,000 / 1216・S1216 不可）· FT_H 适用限制（1624・S1818・ワイド・ミナモワイド・ストレートライン 不可）· 床気密材 S21（ワイド +11,000 / 其余 +10,000）· エプロン色 EP7/EPB/EPC/EPD（ミナモワイド/ミナモのみ）· とるピカスリム VM（エコベンチ×浴槽側壁付水栓 不可）。

**② ドア位置移動の適否マトリクス（P.123）**
- 官方两张 35 列表（5 移動量 × 7 ドア種）抽表进 `meta.doorMoveMatrix`（RL･LR 3 行 / RC･LC 4 行）；引擎按「浴室尺寸×形状 → 行、ドア種 → 列」查表，**ドア位置侧与ドア侧双向拦截**。
- 脚注 ＊1（Cタイプ×B面窓開口用レイアウト変更）・＊2（シャワーシステム）也一并执行；无移动（RL/LR/RC/LC）不查表。

**③ 壁パネル 35 柄 × 7 列マトリクス（P.113）**
- 新维度 `wall_design`（35 柄，含 `panelCodes` 7 列品番码与 `lightingOnly` 标记）・`wall_base`（7 列：全面張り＋ハイクラス5柄＋ベーシック）・`wall_limited`（照明限定壁パネル）。
- 价格仍由既有 `wall`（全面張り4クラス＋アクセント7组合）决定；新维度做**整合校验**：柄クラス×張り方×ベース列が一致しない組合せは不可（AC7＝鏡面ホワイト柄×マットホワイト基板 专用）。
- 照明限定壁パネル：只允许矩阵中带「照明限定」标记的柄×基板；并执行 P.129 的灯数联动（※1 EC/EH 须＋1灯版 EC_UP/EH_UP、※2 1灯 的 YC1/YH1/PC1 须併用 HP、※3 1624 的 YC/YH/PC 须併用 HP）。**HP（追加ダウンライト）从照明 radio 移到 `lighting_add`（multi）**。

**第四批（同日）：P.145 斜め天井/自由梁板禁则 + 品番补全**
- 新维度联动：`misc_options` 的 C01/C02（斜め天井C面 200×400 / 400×800）、C33（B面 200×400）、S79/S80（フリーサイズ梁パネルキット C面/B面）按 P.145 全部注记执行，双向拦截（选斜め天井时冲突项禁用，反之亦然）。
- 品番补全（P.41 品番の見方）：`BDU{S/W}-{サイズ}LB{タイプ}{浴槽}-A+H（C）{ドア位置}`；L＝壁パネル、B＝FRP床为固定段；第 8 段「2」（ミナモ浴）仅 1620 尺寸且浴槽为ミナモ时表记。
- 门禁：新增 `test/slope-beam-20261019.js`（39 项，全部通过）；smoke/dom/official-verify 三套回归同步通过。
- **已核实**：ドア移動 200/300/400mm 与 100mm 同价（+9,000）——PDF P.109 该价格单元格为跨 4 行的合并单元格（文字中心 y≈147 落在 4 行 120–171 的中央），现网口径正确。

**仍存的局限**：写真セット PLAN（P.41-P.59 共 14 套含税別セット価格）尚未收录为「按 PLAN 一键复现」入口；1226 等尺寸外の浴槽品番第 8 段（非 1620/ミナモ）手册未给出规则，暂不表记。

## 九、部署前收尾建议

- [x] ドア位置移動 200-400mm 価格：已核实为同一 +9,000（P.109 合并单元格）
- [x] 品番完整化（壁パネル L／床 B／浴槽 2 段）：已实现（P.41 规则）
- [ ] 写真セット 14 组合：未收录（需逐 PLAN 抽 43-59 页仕様）
- [ ] reviewer 终核 `数据提取说明.md` 与 `研究文档 §8` 其余不确定项（1620 ワイド浴槽区分、壁柄コード表、寒冷地オプション差額網羅、サポートパック 6 価格のサイズ対応、マグネットアイテム取付位置制限）
- [ ] 部署 `elfDXiao.github.io/lidea-selector/`（复制 web/ 内容），并在 kitchen.html 加 select-card 入口
- [ ] 生成 Lidea 手册 PDF 下载链接（当前占位）
- [ ] 可选：品番完整化（壁パネル L/床 B/浴槽 2 段）、写真セット PLAN 复现校验
