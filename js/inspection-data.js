/* =========================================================
   工作室内部工地巡检数据库（inspection.html 使用 · 需访问密码）
   结构：省份 adcode → 城市 adcode → 巡检记录列表
   （与 js/case-gallery-data.js 的浴室案例同构，但卡片显示工地地址、且一条记录
     可以带多张 360° 全景）

   每条记录字段：
     id          唯一标识（英文+数字）
     title       小区名字
     building    楼栋号
     unit        门牌号
     meta        卡片副标题（填「楼栋号 门牌号」，与 building/unit 拼合结果一致）
     panos       多张 360° 全景（本页区别于浴室案例的核心字段，见下）
     image       单张 360° 全景（可选；没有 panos 时的简写形式）
     thumb       卡片缩略图（800×400，可选；不填则用第一张全景当缩略图）
     date        年份（可选）

   panos 写法（推荐，可浏览多张）：
     panos: [
       { image: 'img/inspect/i-bj-01-01.jpg', label: '客厅' },   // label 可选，
       { image: 'img/inspect/i-bj-01-02.jpg', label: '主卧' },   //   会显示在查看器
       { image: 'img/inspect/i-bj-01-03.jpg' }                   //   顶部的场景切换条上
     ]
     2 张以上时查看器自动出现 ‹ › 场景切换条（也可用键盘 ← →），并循环切换。
     卡片角标会显示「N 个场景」。

   ★ 新增巡检记录：360 图放 img/inspect/，在本文件对应 省份/城市 下追加一条记录即可
     （无需改任何代码）。360 图须为等距柱状投影、比例 2:1；缩略图建议 800×400。
   ※ 本页内容为真实工地地址，属内部资料。注意：密码门控是前端的，数据本身
     仍在公开的 JS 文件里，不要把不便公开的信息放进来。
   ========================================================= */
window.CASE_INSPECTION = {

  label: '工作室内部工地巡检',
  hue: 205,          // 卡片占位图色相（与浴室 155 / 全屋定制 25 区分开）
  intro: '工作室内部工地巡检记录：拖动鼠标即可第一人称环顾施工现场。点击地图省份选择城市查看。',

  provinces: {
    // 示例（把下面注释去掉并替换为真实数据即可）：
    //
    // '110000': { name: '北京市', cities: {
    //   '110000': { name: '北京市', cases: [
    //     {
    //       pano: true,
    //       id: 'i-bj-01',
    //       title: '小区名字',
    //       building: '3栋',
    //       unit: '1501',
    //       meta: '3栋 1501',
    //       panos: [
    //         { image: 'img/inspect/i-bj-01-01.jpg', label: '客厅' },
    //         { image: 'img/inspect/i-bj-01-02.jpg', label: '主卧' },
    //         { image: 'img/inspect/i-bj-01-03.jpg', label: '卫生间' }
    //       ],
    //       thumb: 'img/inspect/i-bj-01-01-thumb.jpg'
    //     }
    //   ] }
    // } }
  }
};