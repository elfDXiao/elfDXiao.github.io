# TOTO Sazana（サザナ）选型报价系统

> 部署目标：`elfDXiao.github.io/sazana-selector/`
> 基准范例：toto-synla（同为 TOTO 体系：タイプ×サイズ本体价矩阵 + セレクト記号选项），遵循《选型系统构建规范》
> 数据源：TOTO サザナ（Sazana）システムバスルーム 2025.12 価格掲載版（176 页）；`data/sazana-data.json`（data-analyst，pdfplumber 无乱码）+ `研究文档-Sazana选型流程.md`（t18）

## 一、文件清单

```
toto-sazana/
├── data/
│   ├── sazana-data.json      data-analyst 价格数据（27 分类 492 选项，本体价矩阵 48 组合）
│   └── 数据提取说明.md         提取说明（unknown 仅 7 处）
└── web/
    ├── index.html            页面结构（15 步向导 + 报价单 tab；命名空间 window.SAZANA）
    ├── css/style.css         设计系统（沿用规范配色/组件）
    ├── js/price.js           价格解析（priceDiff / price / priceByType 多样键 / pricesBySize）
    ├── js/quote.js           维度配置 DIMS(25) + 计价引擎 + 组合约束 + 品番 HTV + 漢数字 + CSV
    ├── js/wizard.js          UI：radio/multi 渲染 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js      主数据 window.SAZANA_DATA（由 test/gen-products.js 生成，116KB）
    └── test/
        ├── gen-products.js   数据转换脚本（sazana-data.json → products.js）
        ├── smoke-test.js     核心逻辑自测（Node vm）—— 全部通过
        └── dom-test.js       UI 渲染自测（jsdom）—— 全部通过
```

## 二、STEPS 清单（15 步，索引 0-14）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ | 尺寸与型号 | size（卡片 10）、type（P/T/S/N/F） |
| 1 | BASE | 架台・配管・ドア位置 | 架台·配管·门位置 | kudai（13）、water_pipe（15）、door_position（8：A/B/C/D＋HCA 移動） |
| 2 | WALL | 壁柄 | 壁面花纹 | wall（14：4面同色/アクセント/周辺×グレード） |
| 3 | BATHTUB | 浴槽 | 浴缸 | bathtub（30 形状×素材×色）、bt_extra（8 インテリアバー）、bt_grip（8 ハンドグリップ）、furofuta（8） |
| 4 | FLOOR·CEILING | 床・天井 | 地板·天花板 | floor（17）、ceiling（4 平/勾配×壁高） |
| 5 | COUNTER | カウンター | 台面 | counter（28：人工大理石/単色/なし/スマート/ベンチ） |
| 6 | ITEM | 便利アイテム | 便利功能件 | wiper（2＋なし）、clear（2＋なし）、clean_other（5 multi） |
| 7 | LIGHT | 照明 | 照明 | lighting（24＋基本） |
| 8 | VENT | 換気・暖房 | 换气·暖房 | fan（17＋基本）、laundry（6 multi）、wh_heater（6＋なし） |
| 9 | FAUCET·SHOWER | 水栓・シャワー | 水龙头·花洒 | faucet（13＋基本）、oh_shower（2）、faucet_misc、shower_head（7＋基本）、bath_faucet（5＋なし）、slide_bar（7）、towel（5） |
| 10 | MIRROR | 鏡 | 镜子 | mirror（15） |
| 11 | STORAGE | 収納棚 | 收纳架 | storage（44＋なし） |
| 12 | DOOR | ドア | 门 | door（46＋基本折戸） |
| 13 | WINDOW·OIDAKI | 窓・追いだき | 窗·追焚 | window（47 multi）、oidaki（17＋なし） |
| 14 | OPTION | 快適オプション | 舒适选项 | misc_options（51 multi） |

**本体価格矩阵（税抜，meta.typeBasePrices）**：5 タイプ（P/T/S/N/F）× 10 尺寸 48 组合；T1620=¥1,449,000（basePlan）；F 仅 1620/1616/1618、N 无 1220。
**品番**：`HTV{サイズ}U{タイプ}X6{ドア位置}{架台}`（例 HTV1616UPX6DR；简化版省略浴槽・仕様コード段）。

## 三、数据 schema（products.js → `window.SAZANA_DATA`）

```json
{
  "meta": {
    "brand": "TOTO Sazana（サザナ）", "series": "HTV", "taxRate": 0.10, "rmbRate": 0.7,
    "typeBasePrices": {"P":{"1620":1636000,...},"T":{...},"S":{...},"N":{...},"F":{"1620":1832000,"1616":1564000,"1618":1705000}}
  },
  "categories": [
    { "id":"wall", "options":[{"code":"EGAA1","priceByType":{"P":105000,"T":126000}}] },
    { "id":"shower_head", "options":[{"code":"SRW11","priceByType":{"P":0,"T":0,"S":0,"F":0,"N":7300}}] },
    { "id":"faucet", "options":[{"code":"BASE","priceDiff":0},{"code":"SEA5K","priceByType":{"P":3700}}] }
  ]
}
```

### 价格字段

| 字段 | 含义 | 示例 |
| :--- | :--- | :--- |
| `priceDiff` | 固定差价（全タイプ共通） | `65000`（床ワイパー CQF01） |
| `price` | 单品绝对价 | — |
| `priceByType` | タイプ键（P/T/S/N/F 5 列或子集）；null=该タイプ不可选 | `{"P":105000,"T":126000}` |
| `pricesBySize` | 尺寸档差价 | — |
| `constraints` / `note` | 组合限制/备注 | — |

### 计价（与规范一致；人民币系数不显示）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ]` ＋ Σ选项差价（タイプ/尺寸取值）
- 税込 ＝ 税抜 × 1.10
- ★ 大陆地区价格 ＝ 税込 × 汇率 × `rmbRate(0.7)`，**页面/报价单不显示系数与算式**，仅标注「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- セットプラン価格 ＝ 本体価格 ＋ オプション合計価格

## 四、已实现的组合约束（disabledReason / autoFix）

1. 尺寸・タイプ限定：F 仅 1620/1616/1618、N 无 1220（setSize 自动修复）；1624 时 F 禁用
2. おそうじ浴槽（YFS32/JLH11）→ 断熱防水パン CXX01 必须（autoFix 自动切）；与寒冷地水栓（SE*K）互斥
3. 浴室クリアキープ（CQH01/CQH1K）→ 三乾王/暖房換気扇（IKJG*/IKJN*）必须（IKA00 等禁选）
4. 勾配天井（ISJ64/ISJ62）→ ダウンライト（KSD*/KSCEA/KSCMA/KSTM3）不可
5. カラリ床（CFF 系）→ 床ワイパー/クリアキープ 不可
6. FSS02 × 3枚引戸（HDJW/HDJX/HDJY/HDJM 系）
7. エアインオーバーヘッドシャワー 1317/1216/1116/1220/1818 不可
8. 数据驱动：sizes/types/priceByType 限定自动生效

## 五、壁柄花纹级 UI（第一段重构：39 柄 4面同色直接可选）

- **第一段直接可选**：wall 分类 46 选项——39 个 4面同色柄（プレミアム 4/HⅡ 25/HⅠ 6/BASIC 4，gen-products 从クラス note 展开为独立选项，各带 priceByType）＋ 4 个 ACC_* ＋ 3 个 SHUHEN_*（移除 HⅡ/HⅠ/BASIC クラス占位）
- **价格**：4面同色柄 priceByType（HⅡ P=63,000/T=84,000、HⅠ P=21,000/T=42,000、BASIC P=−21,000/T=0、プレミアム P=105,000/T=126,000）；ACC_* 组合价 = `priceBySurround[周辺グレード]`（T タイプ用 accentPriceMatrix L2 调整）
- **两段式（仅 ACC_*/SHUHEN_*）**：ACC_* → アクセント柄 chips（37 柄按グレード过滤）＋ 周辺グレード chips ＋ 周辺柄 chips（8 柄）；SHUHEN_* → 周辺柄 chips；4面同色柄选中即完成（无第二段）
- **品番输出**：报价单明细含花纹名 + 品番（4面同色=EGAB5 等；アクセント=EG2J1+EGAG2）
- **数据**：`sazana-wall-patterns.json` 并入 `window.SAZANA_DATA.sazanaWallPatterns`（accentPatterns 37 + surroundPatterns 8 + accentPriceMatrix 4×3）

## 六、人民币说明规范（★ 用户明确要求，全站统一）

- 系数 `rmbRate=0.7` 仅存在于 `products.js meta` 与 `quote.js` 计算代码
- 页面可见位置（rate-hint / sec-sub / 报价单 doc-footer / sumRMB 标签 / copyList / meta description）一律**不显示系数或算式**
- 只允许出现：「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」式描述
- 已通过「无公式 grep 自查」：index.html / wizard.js / price.js 渲染路径不含 `0.7`、`7折`、`×汇率` 等字样

## 六、事件绑定（规范踩坑遵守）

- `bindDelegated()`：#wizBody 的 change/click 仅 init 时委托绑定一次（radio data-code/data-basic/data-none、multi data-code）
- `bindStatic()`：导航/tab/语言/汇率/客户表单/打印 仅 init 绑定一次
- 严禁在 renderStep 中重复 addEventListener；t() 返 HTML、tp() 返纯文本；价格符号全角 ＋－

## 七、测试

```bash
node test/gen-products.js   # 重新生成 products.js（数据更新后必跑）
node test/smoke-test.js     # 核心逻辑 ✅（0.7 计价/矩阵/约束/品番/CSV）
node test/dom-test.js       # UI 渲染 ✅（jsdom 模拟 file:// 直开）
```

smoke 特有断言：**0.7 人民币计价（T1620：1,449,000→税込 1,593,900→×0.05×0.7=55,787）**、本体価格矩阵抽查、品番 HTV1620UTX6AF、priceByType 多样键（壁柄 EGAA1 P=105,000/T=126,000、ミラー KURA2 S=null）、约束（おそうじ→CXX01 autoFix、勾配天井×ダウンライト、CQH01 需三乾王、カラリ床×床ワイパー、1317×オーバーヘッド）、CSV。

## 八、部署前收尾建议

- [ ] reviewer 终核 `数据提取说明.md`（unknown 7 处）与 `研究文档 §8` 待确认项（壁柄縦組みタイプ別対応、セットプラン 19 種内訳）
- [ ] 部署 `elfDXiao.github.io/sazana-selector/`（复制 web/ 内容），并在 kitchen.html 加 select-card 入口
- [ ] 生成 Sazana 手册 PDF 下载链接（当前占位）
- [ ] 可选：セットプラン 19 種一覧参考功能、品番完整化（浴槽・仕様コード段）
