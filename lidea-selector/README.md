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
    "brand": "LIXIL Lidea（リデア）", "series": "BD", "taxRate": 0.10, "rmbRate": 0.65,
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
| `priceByType` 条件键 | 按当前选择解析：水栓種（ThermoMetal/WideLever/ShowerSystem/BlackFaucet）、浴槽側水栓（FaucetNone/WallFaucet）、うるつや（UruAri/UruNashi）、サポートパック（タイプ+尺寸组 H16/H13） | `{"FaucetNone":0,"WallFaucet":15000}` |
| `pricesBySize` | 尺寸档差价（键为尺寸或尺寸组） | `{"1624":0,"1620/S1818/1618":0,...}` |
| `constraints` / `note` | 组合限制/备注 | — |

### 计价（与规范一致；人民币系数不显示）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ]`（＋寒冷地 ¥5,000）＋ Σ选项差价（タイプ/条件键/尺寸取值）
- 税込 ＝ 税抜 × 1.10
- ★ 大陆地区价格 ＝ 税込 × 汇率 × `rmbRate(0.65)`，**页面/报价单不显示系数与算式**，仅标注「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- 写真セット価格 ＝ 標準仕様価格 ＋ オプション合計価格（手册各 PLAN 可复现）

## 四、已实现的组合约束（disabledReason / autoFix）

1. 尺寸・タイプ限定：1624/S1818 仅 M/C（setSize 自动修复）；アクアジェット4穴（K20）13□□/1216/S1216 不可；サポートパック C タイプ/1624/S1818 不可
2. 互斥：シャワーシステム（H3/H4）× まる洗いカウンター／ダウンライト以外照明；うるつや浄水 × 壁付サーモブラック（D5）／兼用水栓（S5）／とるピカスリム（VM）／ブラック・白系フック；兼用水栓 × 浴槽側水栓；ワイドミラー × 浴室テレビ；おそうじ浴槽 × アクアジェット；おそうじ浴槽 × サーモバスSなし
3. 必须搭配：アクアジェット/おそうじ浴槽 → 浴槽パンあり（autoFix 自动切 W）；洗面室暖房機（K58）→ プラズマクラスター搭載換気乾燥暖房機（Q/T）；浴槽側水栓 → 給水給湯 WallFaucet 差价联动
4. 条件键价格自动解析（water_pipe/shower_head/shower_hook/support_pack）
5. 数据驱动：sizes/types/priceByType 限定自动生效

## 五、人民币说明规范（★ 用户明确要求，全站统一）

- 系数 `rmbRate=0.65` 仅存在于 `products.js meta` 与 `quote.js` 计算代码
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
node test/smoke-test.js     # 核心逻辑 ✅（0.65 计价/矩阵/条件键/约束/品番/CSV）
node test/dom-test.js       # UI 渲染 ✅（jsdom 模拟 file:// 直开）
```

smoke 特有断言：**0.65 人民币计价（M1616：1,379,000→税込 1,516,900→×0.05×0.65=49,299）**、標準仕様価格矩阵抽查、寒冷地 +5,000、1624 自动修复タイプ→M、条件键（water_pipe FaucetNone/WallFaucet、shower_head ThermoMetal/ShowerSystem、support_pack H16/H13）、约束（サポートパック C 不可、シャワーシステム×カウンター、うるつや×D5、兼用×浴槽側、K58 需 Q/T、アクアジェット→パン W autoFix、K20 尺寸限定）、品番 BDUS-1616M-A+H(C)RL、CSV。

## 八、部署前收尾建议

- [ ] reviewer 终核 `数据提取说明.md` 与 `研究文档 §8` 不确定项（ドア位置移動 200-400mm 価格、写真セット 14 组合、1620 ワイド浴槽区分、壁柄コード表、寒冷地オプション差額網羅、サポートパック 6 価格のサイズ対応、マグネットアイテム取付位置制限）
- [ ] 部署 `elfDXiao.github.io/lidea-selector/`（复制 web/ 内容），并在 kitchen.html 加 select-card 入口
- [ ] 生成 Lidea 手册 PDF 下载链接（当前占位）
- [ ] 可选：品番完整化（壁パネル L/床 B/浴槽 2 段）、写真セット PLAN 复现校验
