# TAKARA STANDARD プレデンシア（Predencia）选型报价系统

本地开发部署目录：`D:\DSH工作区\takara-predencia\web\`（不推送 git，部署时拷到 elfDXiao.github.io 对应目录）。

## 页面
- 入口：`index.html`（双击即可直开，file:// 可用；数据内嵌于 `data/products.js`，无 fetch）
- 命名空间：`window.PREDENCIA`（`PREDENCIA_DATA` 数据 / `PREDENCIA.price` / `PREDENCIA.quote` / `PREDENCIA.wizard`）

## 系统特性
- 品牌：タカラスタンダード プレデンシア（Takara Standard Predencia）システムバスルーム，2026 価格掲載版（131 頁 PDF）
- 第一页为尺寸选择（无套餐预设，按手册 LET'S MAKE A BATHROOM 流程：先尺寸 → 浴槽 → 各部件）：
  - 規格サイズ：6 尺寸（1620=戸建のみ、1216/1317/1418=マンションのみ、1616/S1216=両用），套装基准价＝基本配置（ベーシック構成）各尺寸价（`meta.planPrices.basic`）
  - ぴったりサイズ：間口 13 区分 × 浴槽行 9 種 = 套装价矩阵（`meta.pitariMatrix`，1,284,000〜2,117,000），受注生産品
- 12 步向导：尺寸选择 → 浴槽 → 浴槽機能 → 風呂フタ等 → 床・排水口 → 壁 → カウンター・水栓 → ドア → 天井・換気・暖房 → 照明・ミラー → 収納・タオル → その他・別売部品
- 中日双语（页面右上角切换）、汇率输入 → 大陆地区人民币含安装价
- 报价单打印/PDF、CSV 导出、复制选型清单

## 计价模型
- 本体価格（税抜）= 套装基准价（規格=ベーシック構成×サイズ 或 ぴったり間口×浴槽行）＋ Σ选项差价（相对基准配置的 ⊕/⊖）
- 税込 = 本体 × 1.10；人民币含安装价 = 税込 × 汇率 × meta.rmbRate（**rmbRate=1.2**，用户自定义）
- ★ 页面任何可见位置（rate-hint/sec-sub/报价单/复制清单）不显示计算系数/算式，仅写「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」
- カウンター×水栓連動：QS_dual→SB280L/RABHK；QS/ART→SB182系/FTB230K；なし→カウンターなし仕様（faucet_none_counter/overhead_shower/dual_faucet の総額）
- 価格未掲載（unknown）项显示「価格未掲載」且不可选（不虚增价格）

## 关键约束
- 肩包み湯/ヘルシージェット/うるぽか湯ファイン = 戸建て仕様（1616/1620）のみ；肩包み湯×ヘルシージェット併用不可
- 肩包み湯 = くつろぎラウンジ浴槽（ベンチ付）のみ；うるぽか湯 = くつろぎラウンジ系のみ（ワイド不可）
- ラグジュアリーライト = 調光調色照明併設必須
- 浴槽形状×サイズ：くつろぎラウンジ/ワイド=1616/1620、ラウンド=S1216/1216/1317/1418
- ぴったり：開き戸=奥行1443mm以上、ヘルシージェット=奥行1668〜1868
- オーバーヘッドシャワー=カウンターなしのみ・ミラーなし/スリムロングのみ・ソフトスクエア/キュービック照明不可
- 兼用水栓×浴槽用水栓 同時選択不可

## 数据链路
- 数据源：`D:\DSH工作区\takara-predencia\data\predencia-data.json`（50 分类/382 选项，data-analyst 提取）
- 生成：`node test/gen-products.js` → `web/data/products.js`（window.PREDENCIA_DATA）
- 不确定项：`data\数据提取说明.md` §5（設置用別売部品受梁/吊金具等 6 项 unknown、風呂フタフック ハンドバー一体型 unknown → 选择不可）

## 测试
- `node test/smoke-test.js`：数据完整性 + 计价（規格基准套装/ぴったり）+ 约束 + 无公式/无「无该型号」
- `node test/dom-test.js`：jsdom 全流程（模式切换/尺寸/浴槽/水栓連動/报价单）+ 页面无公式泄漏
- 部署前检查：grep 无 `rmbRate`（index/wizard/price）、无 `×1.2`、无「无该型号」

## 品番
- 部品/オプションは個別品番（SB182-HB1HK、VD-10ZC10-TK 等）が各选项 partNumber に表示
- 本体品番簡略表示：`PREDENCIA-{サイズ}` / `PREDENCIA-PITARI-{間口}x{浴槽行}`（SET PLAN プラン品番 PLAN01〜は参考資料として data に残置）
