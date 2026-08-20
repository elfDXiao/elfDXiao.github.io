# LIXIL SPAGE（スパージュ）选型报价系统

> 部署目标：`elfDXiao.github.io/spage-selector/`
> 基准范例：lidea-bathroom（同为 LIXIL 体系：BA 品番・C+H(C) 地域・写真セット），遵循《选型系统构建规范》
> 数据源：LIXIL スパージュ（SPAGE）システムバスルーム 戸建・マンション用（発売商品掲載版）；`data/spage-data.json`（data-analyst）+ `研究文档-SPAGE选型流程.md`（t14）

## 一、文件清单

```
lidea-spage/
├── data/
│   ├── spage-data.json        data-analyst 价格数据（33 分类 472 选项，タイプ×サイズ×設置 三重矩阵）
│   └── 数据提取说明.md          提取说明与不确定项
└── web/
    ├── index.html             页面结构（16 步向导 + 报价单 tab；命名空间 window.SPAGE）
    ├── css/style.css          设计系统（沿用规范配色/组件）
    ├── js/price.js            价格解析（priceDiff / price / priceByType 多样键 / pricesBySize）
    ├── js/quote.js            维度配置 DIMS(31) + 计价引擎 + 条件键（タイプ/設置）+ 约束 + 品番 BAU + 漢数字 + CSV
    ├── js/wizard.js           UI：radio/multi 渲染 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js       主数据 window.SPAGE_DATA（由 test/gen-products.js 生成，122KB）
    └── test/
        ├── gen-products.js    数据转换脚本（spage-data.json → products.js）
        ├── smoke-test.js      核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js        UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（16 步，索引 0-15）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE·INSTALL | サイズ・タイプ・設置 | 尺寸·型号·設置 | size（卡片 11）、type（P/C/S/V/A）、install（U/M）、region（H/C） |
| 1 | DOORPOS | ドア位置・下部据付 | 门位置·基础 | door_position（20）、kudai（14 戸建/マンション別）、bathtub_pan（W/S，タイプ/設置键） |
| 2 | WALL | 壁パネル | 壁面 | wall（16：L パネル/アーテクト P/C/セラミック グラン） |
| 3 | FLOOR | 床 | 地板 | floor（10：グランフロア 4/サッとキレイ 6） |
| 4 | BATHTUB | 浴槽 | 浴缸 | bt_shape（8）、bt_material（7 グランザ/パールクォーツ）、bt_drain（2）、bt_bar（2）、bt_headrest（3） |
| 5 | LID·APRON | フロフタ・エプロン | 浴缸盖·裙板 | bt_lid（11）、bt_lidhook、bt_apron（4） |
| 6 | CEILING | 天井 | 天花板 | ceiling（26：J/R/P/E/S/Q/K × 壁高 4 档） |
| 7 | VENT | 換気設備 | 换气设备 | fan（13＋基本：換気乾燥暖房機/グリル/ランドリーパイプ/洗面室暖房機） |
| 8 | DOOR | ドア | 门 | door（33：折り/開き/片引/2枚＋テンパードア）、partition_unit（12） |
| 9 | COUNTER·FAUCET | カウンター・水栓 | 台面·水龙头 | counter（7）、faucet（8＋基本：シャワーシステム/壁付サーモ）、body_hug（2）、tub_faucet（4＋なし）、faucet_misc（2） |
| 10 | SHOWER·PURIFIED | シャワー・浄水 | 花洒·净水 | shower_head（11＋基本：ファインバブル SPA U）、shower_hook（9）、urutuya（2）、hose_hook（4） |
| 11 | LIGHT | 照明 | 照明 | lighting（17：ダウンライト/調光調色/ライン照明/アクアフィールライト等） |
| 12 | MIRROR | ミラー | 镜子 | mirror（9） |
| 13 | STORAGE | 収納・マグネット | 收纳·磁吸件 | storage（25）、magnet（24 multi） |
| 14 | TOWEL·GRIP | タオル・握りバー | 毛巾杆·扶手 | towel（7）、grip_bar（11＋なし） |
| 15 | OPTION | 付加オプション | 附加选项 | support_pack（2）、bathroom_tv（2 multi）、aqua_feil（2）、osouji（2 multi）、window_frame（51 multi）、water_pipe（10）、oidaki（11）、misc_options（45 multi） |

**標準仕様価格矩阵（税抜，meta.typeBasePrices）**：5 タイプ（P/C/S/V/A）× 11 尺寸 × 設置（戸建 U/マンション M），75 格。
- 1620 P 戸建 ¥3,377,000（basePlan）；マンション = 戸建 +¥70,000~170,000
- **設置限定**：1624 仅戸建、1622/1418/1317 仅マンション、1318 仅戸建；A タイプ无 1624/1622/1418/1318/1317/1216
- 寒冷地（region C）：標準 ＋¥5,000
- **品番**：`BAUW/BAUS（戸建）/BAMW（マンション）-サイズタイプ-C+H(C)ドア位置`（简化版省略壁パネル/床/浴槽段）

## 三、数据 schema（products.js → `window.SPAGE_DATA`）

```json
{
  "meta": {
    "brand": "LIXIL SPAGE（スパージュ）", "series": "BA", "taxRate": 0.10, "rmbRate": 0.75,
    "typeBasePrices": {"P":{"1620":{"U":3377000,"M":3447000},...},"C":{...},"S":{...},"V":{...},"A":{...}},
    "basePlan": {"size":"1620","type":"P","install":"U","price":3377000}
  },
  "categories": [
    { "id":"bathtub_pan", "options":[{"code":"W","priceByType":{"P/U":0,"C/U":0,"A/U":100000,"P/M":0,...}},{"code":"S","priceByType":{"P/U":-100000,...,"P/M":null}}] },
    { "id":"aqua_feil", "options":[{"code":"K53","priceByType":{"P":0,"C":0,"S":0,"V":0,"A/U":229000,"A/M":259000}}] }
  ]
}
```

### 价格字段

| 字段 | 含义 | 示例 |
| :--- | :--- | :--- |
| `priceDiff` | 固定差价（全タイプ共通） | `240000`（グランフロア） |
| `price` | 单品绝对价 | `334000`（浴室テレビ） |
| `priceByType` | タイプ键（P/C/S/V/A）或组键 | `{"P":0,"C":0,"S":0,"V":0,"A/U":229000}` |
| `priceByType` 条件键 | **タイプ/設置 键（P/U・A/M）**——引擎通用解析；另有水栓種/浴槽側/うるつや条件键 | `{"P/U":0,"A/U":100000}` |
| `pricesBySize` | 尺寸档差价 | — |
| `constraints` / `note` | 组合限制/备注 | — |

### 计价（与规范一致；人民币系数不显示）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ][設置]`（＋寒冷地 ¥5,000）＋ Σ选项差价（タイプ/設置/条件键取值）
- 税込 ＝ 税抜 × 1.10
- ★ 大陆地区价格 ＝ 税込 × 汇率 × `rmbRate(0.75)`，**页面/报价单不显示系数与算式**，仅标注「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- 写真セット価格 ＝ 標準仕様価格 ＋ オプション合計価格

## 四、已实现的组合约束（disabledReason / autoFix）

1. 設置限定：1624 仅 U、1622/1418/1317 仅 M（setSize/install 自动修复，如切 1622 自动转 M）；タイプ/サイズ无定价禁选
2. アクアフィール（K53）/おそうじ浴槽（K55）→ 浴槽パンあり（autoFix 自动切 W）；アクアフィールライト（K60）→ パン+アクアフィール 必须
3. セラミックパネル（CH/GRB/GRC）× マグネットアイテム/マグネットメタルシェルフ/内組平天井/まる洗いカウンター
4. P タイプ时ダウンライト（GP）不可（調光調色選択）
5. サポートパック P/S タイプ不可
6. シャワーシステム（H3/H4）× まる洗いカウンター/浴槽側水栓
7. ワイドミラー × 浴室テレビ
8. グランフロア 1416/1318/1316/1216 不可
9. 大開口室内窓 13□□/1216/A タイプ不可
10. 寒冷地 ＋¥5,000；浴槽パン W/S タイプ・設置别差价（P/U:0・A/U:+100,000・マンション S null 禁选）
11. 数据驱动：sizes/types/priceByType 限定自动生效

## 五、壁パネル花纹级 UI（wallPatterns 47 柄）

- **两段选择**：第一段=クラス/張り方（wall 16 选项）；第二段=具体花纹（47 柄按 class 过滤显示，含未指定 chip）
- **价格叠加**：花纹净差 = `pattern.prices[張り方] − 类级 priceDiff`（同 class 柄价格一致 → 净差 0，如 プレミアムⅡ 全面=0/Ⅰ=−40,000/ハイ=−70,000/アーテクトC=+90,000/P=+240,000；アクセント セラミック=+460,000）；花纹选择不重复计价
- **品番输出**：报价单明细含花纹名 + 花纹品番（全面 → `partNumbers['全面張り']`；アクセント → 第一个 `アクセントベース` 列码，如 セラミック ストラータム=2X）
- **标记**：照明限定柄（37 柄）→ ⚠警告「需增加灯数或追加ダウンライト（HP）」；長納期柄（20 柄）→ 納期提示
- **约束**：セラミック（グランクラス）仅アクセント張り（全面 null 禁选）；花纹 class 与当前 wall 选项不匹配禁选；戸建1216/内組平天井/壁高1900 与セラミック互斥（沿用）
- **数据**：`spage-wall-patterns.json` 并入 `products.js` 的 `window.SPAGE_DATA.wallPatterns`（47 柄：プレミアムⅡ 7/プレミアムⅠ 3/ハイ 15/アーテクトC 10/アーテクトP 10/グラン 2）

## 六、人民币说明规范（★ 用户明确要求，全站统一）

- 系数 `rmbRate=0.75` 仅存在于 `products.js meta` 与 `quote.js` 计算代码
- 页面可见位置（rate-hint / sec-sub / 报价单 doc-footer / sumRMB 标签 / copyList / meta description）一律**不显示系数或算式**
- 只允许出现：「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」式描述
- 已通过「无公式 grep 自查」：index.html / wizard.js / price.js 渲染路径不含 `0.75`、`75折`、`×汇率` 等字样

## 六、事件绑定（规范踩坑遵守）

- `bindDelegated()`：#wizBody 的 change/click 仅 init 时委托绑定一次（radio data-code/data-basic/data-none、multi data-code）
- `bindStatic()`：导航/tab/语言/汇率/客户表单/打印 仅 init 绑定一次
- 严禁在 renderStep 中重复 addEventListener；t() 返 HTML、tp() 返纯文本；价格符号全角 ＋－

## 七、测试

```bash
node test/gen-products.js   # 重新生成 products.js（数据更新后必跑）
node test/smoke-test.js     # 核心逻辑 ✅（0.75 计价/三重矩阵/install 双取价/条件键/约束/品番/CSV）
node test/dom-test.js       # UI 渲染 ✅（jsdom 模拟 file:// 直开）
```

smoke 特有断言：**0.75 人民币计价（P1620U：3,377,000→税込 3,714,700→×0.05×0.75=139,301）**、U/M 双取价（P1620M=3,447,000、P1622M=3,547,000、1622 自动转 M）、aqua_feil A/U・A/M 条件键、bathtub_pan タイプ/設置键、约束（P×GP、セラミック×マグネット、アクアフィール→パンW、サポートパック P/S 不可、グランフロア 1216 不可）、品番 BAUW/BAMW、CSV。

## 八、部署前收尾建议

- [ ] reviewer 终核 `数据提取说明.md` 不确定项（天井 46 格 unknown、シャワーヘッド RD/SD、壁パネル CH、浴槽カラー CW1）与 `研究文档 §8`
- [ ] 部署 `elfDXiao.github.io/spage-selector/`（复制 web/ 内容），并在 kitchen.html 加 select-card 入口
- [ ] 生成 SPAGE 手册 PDF 下载链接（当前占位）
- [ ] 可选：品番完整化（壁パネル L/床 A/浴槽 2 段）、写真セット PLAN 复现校验
