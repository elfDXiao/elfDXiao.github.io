# TOTO Synla（シンラ）整体浴室选型报价系统

> 部署目标：`elfDXiao.github.io/synla-selector/`
> 基准范例：rakuvia 选型系统（`D:\DSH工作区\报价系统\web\`），遵循《选型系统构建规范》
> 数据源：TOTO シンラ プランニング／オプションガイド（52 页，P.136-186）；`data/synla-data.json`（data-analyst MiMo 提取）+ `数据提取说明.md`

## 一、文件清单

```
toto-synla/
├── data/
│   ├── synla-data.json         data-analyst 全量价格数据（318KB，24 分类 692 选项 + 壁柄 99 子项）
│   └── 数据提取说明.md           提取方法/覆盖范围/不确定项（§7 供 reviewer 终核）
└── web/
    ├── index.html              页面结构（15 步向导 + 报价单 tab；命名空间 window.SYNLA）
    ├── css/style.css           设计系统（沿用 rakuvia 规范配色/组件）
    ├── js/price.js             价格解析（priceDiff / price / priceByType 多样键 / pricesBySize / S1S2 尺寸组）
    ├── js/quote.js             维度配置 DIMS(38) + 计价引擎 + 组合约束 + 品番 + 漢数字 + CSV
    ├── js/wizard.js            UI：radio/multi/wall 三类渲染 + 合计 + 报价单 + 双语（t/tp）+ 事件委托
    ├── data/products.js        主数据 window.SYNLA_DATA（由 test/gen-products.js 从 synla-data.json 生成，207KB）
    └── test/
        ├── gen-products.js     数据转换脚本（synla-data.json → products.js）
        ├── smoke-test.js       核心逻辑自测（Node vm）—— 52 项全部通过
        ├── dom-test.js         UI 渲染自测（jsdom）—— 20 项全部通过
        └── stress-render.js    大选项组渲染压力测试（door 93/window 139/misc 68，~30ms）OK
```

## 二、STEPS 清单（15 步，索引 0-14）与 DIMS 维度（38 个）

| # | ID | 日文标题 | 中文标题 | DIMS 维度（id） |
| :--- | :--- | :--- | :--- | :--- |
| 0 | SIZE·TYPE | サイズ・タイプ | 尺寸与型号 | size（卡片，タイプ×サイズ矩阵）、type（radio 5） |
| 1 | BASE | 架台・基礎 | 架台·基础 | kudai（radio 12：F/S/R/H+CGA+CTA+EUA+VVA） |
| 2 | WALL | 壁柄 | 墙面花纹 | wall（两段：3 plan + 99 柄 + 周辺グレード 4 档） |
| 3 | BATHTUB | 浴槽 | 浴缸 | bt_shape（4）、bt_color（6）、bt_headrest（4）、bt_bar（5）、rakuyu（2）、bt_handgrip（7）、bt_lid（2） |
| 4 | FLOOR | 床 | 地板 | floor（radio 10） |
| 5 | COUNTER | カウンター | 台面 | counter（radio 27） |
| 6 | ITEM | 便利アイテム | 便利功能件 | item_wiper（radio 3）、item_clear（radio+なし 2）、item_other（multi 5） |
| 7 | LIGHT | 照明 | 照明 | light（radio 12 + 虚拟基本 LIGHT_BASIC） |
| 8 | VENT | 換気扇・暖房 | 换气扇·暖风机 | vent（radio 36）、wh_heater（radio+なし 26）、laundry（radio+なし 2） |
| 9 | FAUCET | 水栓・シャワー | 水龙头·花洒 | faucet（radio 10+基本）、oh_shower（5）、shower_head（8）、bus_faucet（radio+なし 8）、slide_bar（4）、faucet_misc（multi 4） |
| 10 | MIRROR | 鏡 | 镜子 | mirror（radio 24） |
| 11 | CEILING | 天井 | 天花板 | ceiling（radio 10） |
| 12 | STORAGE | 収納棚 | 收纳架 | storage（radio 8）、storage_misc（multi 13） |
| 13 | DOOR | ドア | 门 | door（radio 92 HD*+虚拟基本）、door_pos（A/B/C/D）、door_hca（radio+なし 4）、door_htb（radio+なし 2） |
| 14 | OPTION | オプション・拡張 | 舒适选项·扩展 | opt_parts（multi 20）、tv_audio（10）、comfort_bar（51）、window（139）、welfare（7）、oidaki（20）、misc（68） |

**维度 kind**：radio（单选，可带「なし」chip / 虚拟基本项）、multi（多选 checkbox，单品可叠加）、wall（壁柄两段选择）。
**状态键**：`state.sel[dimId] = option code` / `state.multi[dimId] = {code:true}` / `state.sub.wall = {mark, grade}`。

## 三、数据 schema（products.js → `window.SYNLA_DATA`）

```json
{
  "meta": {
    "brand": "TOTO Synla（シンラ）", "series": "HLV", "taxRate": 0.10,
    "productNo": "HLV{size}U{type} X3{doorPos} {pedestal}",
    "typeBasePrices": { "G": {"1624":3682000,...,"1618":3243000}, "D": {"1624":2312000,...,"1216":1675000}, ... },
    "typeGroups": {"G":"G","B":"BR","R":"BR","D":"DC","C":"DC"},
    "sizeGroups": {"S1":"1624/1620/1618","S2":"1717/1616/1317/1216","S3":"1624"},
    "_stats": {"分类数":24, "顶层选项数":692, ...}
  },
  "categories": [
    { "id":"size", "options":[{"code":"1616","pricesByType":{"G":3128000,...,"C":1382000},"installation_mm":[1670,1670]}] },
    { "id":"items", "options":[{"code":"CQF01","priceByType":{"GBR":0,"DC":65000},"constraints":[...]}] },
    { "id":"wall", "options":[{"code":"4SAME","subOptions":[{"code":"EQA1D","grade":"プレミアム","priceByType":{"G":31800,"BR":42400,"DC":106000}}]},
      {"code":"FRONT_ACCENT","subOptions":[{"code":"EQC1D","grade":"プレミアム","surroundCodes":{"premium":[...]},
        "surroundPrices":{"premium":{"G":31800,"BR":42400,"DC":106000},"hg2":{"G":0,"BR":10600,"DC":74200},...}}]}] },
    { "id":"fan", "options":[{"code":"IKJN8","pricesBySize":{"1624/1620/1618":-10500,"1717/1616/1317/1216":0}}] }
  ]
}
```

### 选项价格字段（引擎统一优先级：priceDiff → priceByType → pricesBySize → price → isBasic）

| 字段 | 含义 | 示例 |
| :--- | :--- | :--- |
| `priceDiff` | 固定差价（number，相对该タイプ基本仕様） | `179200`（おそうじ浴槽） |
| `price` | 单品绝对价 | `297800`（浴室テレビ） |
| `priceByType` | タイプ別差价，**键多样**：{G,BR,DC}/{G,BRDC}/{GBR,DC}/{GBRD,C}/{GR,B,DC} 等；值 null=该タイプ不可选 | `{"G":0,"BRDC":88800}` |
| `pricesBySize` | 尺寸档差价（键为尺寸/尺寸组；S1/S2 已由 gen 展开为尺寸组串） | `{"1624/1620/1618":74700,...}` |
| `sizes` / `basicSizes` | 适用尺寸（availability 非 false 的键展开）/ 该尺寸基本仕様 | — |
| `constraints` / `note` | 组合限制/备注（部分已接入 disabledReason） | — |
| `subOptions` | 壁柄子选项（grade + priceByType 或 surroundCodes/surroundPrices） | — |

### 计价公式（与规范一致）

- 本体価格（税抜）＝ `typeBasePrices[タイプ][サイズ]` ＋ Σ选项差价（按タイプ/尺寸取值）
- 税込 ＝ 税抜 × 1.10；大陆地区价格 ＝ 税込 × 汇率 × 0.7（无汇率「—」）
- 本体品番 ＝ `HLV{size}U{type} X3{doorPos} {pedestal}`（例 HLV1616UG X3D R）

## 四、已实现的组合约束（disabledReason / autoFix）

**硬编码（quote.js）**：
1. 1317/1216 仅 D/C タイプ（typeBasePrices null → 禁选 + setSize 自动修复到 D）
2. 吊架台（CGA06/16/10）→ 架台必须 F フラット床（选 CGA 自动切 F；架台非 F 时 CGA 禁选）
3. 楽湯なし（FBA00）→ 照明须 KSD3F（G B R）/KSD54（D C）（autoFix 自动切）
4. カウンターなし（TKA/TKC）→ 床ワイパー/クリアキープ/バス水栓/SJA01/SIA1R/台下棚/（D）オーバーヘッド 禁用；且仅 D/C タイプ
5. ワイドミラー（KUWA1）→ 収納棚须 ESA00、スライドバーなし/コンフォートバー/TV 禁用
6. おそうじ浴槽（YFS32/JLH11）→ バス水栓仅サーモ（SFHE/SFH8）、バスリフト互斥
7. オーバーヘッドシャワー × 浴室オーディオ（FOJ01）互斥
8. 寒冷地水栓（SE*K）→ ノコリ～ユECO（YMA01）互斥
9. 天井：目地なし（ISA42/43）仅 G B R、目地付き（ISH32/35）仅 D C
10. 照明タイプ限定（KSD3F 仅 GBR、KSD2F/KSD3F_DC 仅 D、KSD44/KSD54 仅 DC）
11. 濃色壁柄（11 柄清单）→ キューブ形照明（KSKE*/KSKM*）禁选（照度不足）
12. 壁柄：ミネラホワイト/エニーホワイト 仅周辺パネル（4面同色禁选）
13. 尺寸硬限制：1317/1216 无オーバーヘッド/3枚割ふた；1624 浴槽固定スーパーワイド、无ハンドグリップ
14. 数据 schema 限定：option.sizes 不匹配当前尺寸禁选；priceByType 值为 null 禁选

**数据驱动**：选项 `sizes`/`priceByType` 限定自动生效；`constraints` 文本字段保留在数据中供 reviewer/后续扩展。

## 五、关键差异（vs rakuvia）

1. 套装价 = タイプ×サイズ矩阵（meta.typeBasePrices），非 14 列尺寸×门位矩阵
2. 价格字段 priceByType 键多样（G/BR/DC、GBR/DC、G/BRDC…），引擎按键匹配（精确键优先，其次含字符最短键）
3. 尺寸分档键 S1/S2/S3（gen-products 展开为尺寸组串）
4. 壁柄两段选择（plan → 柄 → 周辺グレード），アクセント组合价 = surroundPrices[grade][G/BR/DC]
5. 门位置 A/B/C/D（非 R/L·CR/CL）；架台 F/S/R/H（品番第㋺位）
6. 单品件多选（multi 维度，checkbox）：オプション単品/窓/インテリア・バー/福祉/配管等 315 项

## 六、事件绑定（规范踩坑遵守）

- `bindDelegated()`：#wizBody 的 change/click 仅 init 时委托绑定一次（radio/multi/wall 各 data-* 属性）
- `bindStatic()`：导航/tab/语言/汇率/客户表单/打印 仅 init 绑定一次
- 严禁在 renderStep 中重复 addEventListener；t() 返 HTML、tp() 返纯文本；价格符号全角 ＋－（已校验无 ⊕⊖）

## 七、测试

```bash
node test/gen-products.js   # 重新生成 products.js（数据更新后必跑）
node test/smoke-test.js     # 核心逻辑 52 项 ✅
node test/dom-test.js       # UI 渲染 20 项 ✅
node test/stress-render.js  # 大选项组压力 ✅（door 93/window 139/misc 68，~30ms）
```

smoke 特有断言：1616+G 套装价 3,128,000、1317 选 G 自动禁选+修复 D、壁柄 G/BR/DC 三列差价
（EQA1D：G+31,800/B+42,400/D+106,000）、正面アクセント×周辺グレード联动、多样键 priceByType、
S1/S2 分档、multi 叠加、楽湯なし→KSD3F、吊架台→F、カウンターなし联动。

**file:// 直开**：dom-test 用 JSDOM.fromFile 模拟 file:// 加载（零构建、无 fetch、数据内嵌），通过即等价双击直开可用。

## 八、部署前收尾建议

- [ ] reviewer t4 终核 `数据提取说明.md §7` 不确定项（ドア適応 ○× 矩阵 P.161、壁柄グレード对应、KNR6G 推定价等）
- [ ] 部署 `elfDXiao.github.io/synla-selector/`（复制 web/ 内容），并在 kitchen.html（厨卫选型系统 hub）加 select-card 入口
- [ ] 生成 TOTO Synla 手册 PDF 下载链接（当前为占位 `assets/pdf/TOTO-Synla整体浴室选型手册.pdf`）
- [ ] 可选：约束引擎继续扩全（研究文档 §4 剩余互斥/必须搭配、JK セット电压一致等）
- [ ] 可选：报价单增加「納期注意」（三乾王2室ブラック・フルスクリーン片引戸等 ※4週間）
