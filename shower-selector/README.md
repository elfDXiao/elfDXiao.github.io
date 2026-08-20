# TOTO シャワールーム（Shower Room）选型报价系统

> 部署目标：`elfDXiao.github.io/shower-selector/`
> 基准范例：toto-synla（同为 TOTO 品牌，JSV 品番体系、タイプ×サイズ矩阵），遵循《选型系统构建规范》
> 数据源：TOTO シャワールーム／押入れシャワールーム（2026.6・2026.8 発売予定，7 页）；`data/shower-data.json`（data-analyst）+ `研究文档-Shower选型流程.md`（t6）

## 一、文件清单

```
toto-shower/
├── data/
│   ├── shower-data.json        data-analyst 价格数据（17 分类 95 选项）
│   └── 数据提取说明.md           提取说明与不确定项
└── web/
    ├── index.html              页面结构（12 步向导 + 报价单 tab；命名空间 window.SHOWER）
    ├── css/style.css           设计系统（沿用规范配色/组件）
    ├── js/price.js             价格解析（priceDiff / price / priceByType 多样键 / pricesBySize）
    ├── js/quote.js             维度配置 DIMS(17) + 计价引擎 + 组合约束 + 品番 JSV + 漢数字 + CSV
    ├── js/wizard.js            UI：radio/multi 渲染 + 合计 + 报价单 + 双语 + 事件委托
    ├── data/products.js        主数据 window.SHOWER_DATA（由 test/gen-products.js 生成，27KB）
    └── test/
        ├── gen-products.js     数据转换脚本（shower-data.json → products.js）
        ├── smoke-test.js       核心逻辑自测（Node vm）—— 58 项全部通过
        └── dom-test.js         UI 渲染自测（jsdom）—— 20 项全部通过
```

## 二、STEPS 清单（12 步，索引 0-11，贴近手册 1~9 顺序）

| # | ID | 日文标题 | 中文标题 | DIMS 维度 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ | 尺寸与型号 | size（卡片 3，タイプ×サイズ矩阵）、type（radio 4：G/X/T/L） |
| 1 | WALL | 壁柄を選ぶ | 墙面花纹 | wall（radio 14 柄，GXT｜L 2 列差） |
| 2 | BASE | 床・トラップ | 床·存水弯 | frame（CTA02）、elbow（DHE00/DHS11） |
| 3 | STORAGE | 収納を選ぶ | 收纳 | storage（radio 7，G/X/T/L 4 列差） |
| 4 | MIRROR | 鏡を選ぶ | 镜子 | mirror（radio 4 + 基本「鏡なし」） |
| 5 | FAUCET | 水栓金具を選ぶ | 水龙头金具 | faucet（radio 3：SSGFS/SSGFK/SSA00） |
| 6 | SHOWER | シャワーを選ぶ | 花洒头 | shower_head（radio 8 + 基本，GX｜TL 2 列差） |
| 7 | DOOR | ドアを選ぶ | 门 | door（radio 5 + 基本「折戸800」） |
| 8 | LIGHT | 照明を選ぶ | 照明 | lighting（radio 4 + 基本，GXT｜L 2 列差） |
| 9 | VENT | 換気扇を選ぶ | 换气扇 | fan（radio 6 + 基本） |
| 10 | SLIDEBAR·TOWEL | タオル・スライドバー | 毛巾杆·滑杆 | towel（radio 5）、slide_bar（radio 3） |
| 11 | OPTION | 付加オプション | 附加选项 | interior_bar（radio 15）、options（multi 4）、drain_pipe（multi 6）、trap_misc（multi 1） |

**套装价矩阵（税抜，meta.typeBasePrices）**：

| タイプ＼サイズ | 0816 | 0812 | 0808 |
| :--- | :--- | :--- | :--- |
| G | ¥1,132,000 | — | — |
| X | ¥906,000 | ¥815,000 | — |
| T | — | ¥618,000 | ¥527,000 |
| L | — | ¥465,000 | ¥374,000 |

**品番**：`JSV{size}U{type}W6`（例 JSV0816UGW6，无 X3+架台）。

## 三、数据 schema（products.js → `window.SHOWER_DATA`）

```json
{
  "meta": {
    "brand": "TOTO シャワールーム（Shower Room）", "series": "JSV",
    "productNo": "JSV{size}U{type}W6", "taxRate": 0.10, "rmbRate": 0.8,
    "typeBasePrices": {"G":{"0816":1132000},"X":{"0816":906000,"0812":815000},"T":{"0812":618000,"0808":527000},"L":{"0812":465000,"0808":374000}},
    "sizeAvailability": {"0816":["G","X"],"0812":["G","X","T","L"],"0808":["T","L"]}
  },
  "categories": [
    { "id":"wall", "options":[{"code":"EVAQ7","priceByType":{"GXT":32100,"L":96300}}] },
    { "id":"storage", "options":[{"code":"ESH4H","priceByType":{"G":0,"X":2600,"T":6900,"L":null}}] },
    { "id":"faucet", "options":[{"code":"SSGFS","priceByType":{"G":0,"X":-68000,"T":0,"L":0}}] },
    { "id":"shower_head", "options":[{"code":"SRW01","priceByType":{"GX":0,"TL":19900}}] },
    { "id":"slide_bar", "options":[{"code":"SBA31","priceByType":{"GX":0,"T":0,"L":10200}}] },
    { "id":"drain_pipe", "options":[{"code":"AHV01","pricesBySize":{"0816/0812":1500,"0808":1400}}] }
  ]
}
```

### 价格字段（引擎统一优先级：priceDiff → priceByType → pricesBySize → price → isBasic）

| 字段 | 含义 | 示例 |
| :--- | :--- | :--- |
| `priceDiff` | 固定差价（全タイプ共通） | `17600`（鏡 KURF3） |
| `price` | 单品绝对价 | `14100`（ZPUBA021） |
| `priceByType` | タイプ分组差价，键多样（GXT｜L / GX｜TL / G X T L 4 列 / XTL 等）；null=该タイプ不可选 | `{"GXT":32100,"L":96300}` |
| `pricesBySize` | 尺寸档差价（键为尺寸或尺寸组） | `{"0816/0812":1500,"0808":1400}` |
| `constraints` / `note` | 组合限制/备注 | — |

### 计价（与规范一致；人民币系数不显示）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ]` ＋ Σ选项差价（按タイプ/尺寸取值）
- 税込 ＝ 税抜 × 1.10
- ★ 大陆地区价格 ＝ 税込 × 汇率 × `rmbRate(0.8)`，**页面/报价单不显示系数与算式**，仅标注「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- 本体品番 ＝ `JSV{size}U{type}W6`（无门位/架台段）

## 四、已实现的组合约束（disabledReason / autoFix）

1. 尺寸・タイプ限定：縦長鏡（KURF3/KUMF3）仅 0816；四角鏡（KURS1/KUMS1）0812 X 不可；KSTM1 照明 0812 X 不可；IKJC5/IKA00/IKA01/IKA05 换气扇 0808 不可；ESH4H 收纳 L タイプ不可（priceByType null 自动）；HDP3F 仅 0816 X；HDR3F 仅 0816 G/X・0812 L 且ドア位置 A；インテリア・バー 0808/0812 X 制限（KAR1/KNR7）
2. 互斥：SSA00（水栓なし）× シャワーヘッド；HDR3F × 縦長鏡 × KTA21（0816 G X 三者）；ESH4H × 四角鏡；W185 収納 × 縦長鏡；ESE71 × 縦長鏡；ESA51 × 四角鏡；ESH4H × KNR7（T）；KER8 × タオル掛け（T 基本/KTA22）；DHS11 × SSGFK（寒冷地）；KSTM1 × IKA05；ハイグレードⅠ壁柄 × L タイプ基本
3. 自动修复：选 SSA00 时清空已选シャワーヘッド；切尺寸自动修复タイプ（0816→0808：G→T；0808→0816：T→G）
4. 数据驱动：选项 `sizes`/`types`/`priceByType` 限定自动生效

## 五、人民币说明规范（★ 用户明确要求，全站统一）

- 系数 `rmbRate=0.8` 仅存在于 `products.js meta` 与 `quote.js` 计算代码
- 页面可见位置（rate-hint / sec-sub / 报价单 doc-footer / sumRMB 标签 / copyList / meta description）一律**不显示系数或算式**
- 只允许出现：「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」式描述
- 已通过「无公式 grep 自查」：index.html / wizard.js 渲染路径不含 `0.8`、`8折`、`×汇率`、`算式` 等字样

## 六、事件绑定（规范踩坑遵守）

- `bindDelegated()`：#wizBody 的 change/click 仅 init 时委托绑定一次（radio data-code/data-basic/data-none、multi data-code）
- `bindStatic()`：导航/tab/语言/汇率/客户表单/打印 仅 init 绑定一次
- 严禁在 renderStep 中重复 addEventListener；t() 返 HTML、tp() 返纯文本；价格符号全角 ＋－

## 七、测试

```bash
node test/gen-products.js   # 重新生成 products.js（数据更新后必跑）
node test/smoke-test.js     # 核心逻辑 58 项 ✅
node test/dom-test.js       # UI 渲染 20 项 ✅（jsdom 模拟 file:// 直开）
```

smoke 特有断言：套装价 7 组合逐一、**0.8 人民币计价（G0816：1,132,000→税込1,245,200→×0.05×0.8=49,808）**、品番 JSV0816UGW6、priceByType 多样键（GXT|L / GX|TL / 4 列 / XTL）、约束 16 类、CSV。
dom 特有断言：12 步条、壁柄联动、タイプ联动、multi、**页面无公式**（rate-hint/报价单文本不含 0.8/×汇率）。

## 八、部署前收尾建议

- [ ] reviewer 终核 `数据提取说明.md` 与 `研究文档 §8` 不确定项（壁柄名、水栓 G 列、収納品名、換気扇 0808 制限、スライドバー G タイプ位置、KAR1 0812 制限、EBB01 品名）
- [ ] 部署 `elfDXiao.github.io/shower-selector/`（复制 web/ 内容），并在 kitchen.html 加 select-card 入口
- [ ] 生成 Shower Room 手册 PDF 下载链接（当前占位）
- [ ] 可选：ドア位置 A/B/C/D 加入选型 UI（当前仅 HDR3F 约束使用，默认 A）
