/* =========================================================
   浴室案例 · 360° 全景数据库（bathroom360.html 使用）
   结构：省份 adcode → 城市 adcode → 案例列表
   每条案例字段：
     id         唯一标识（英文+数字，建议 p-<省拼音>-<序号>）
     title      案例标题
     brand      浴室品牌
     series     浴室系列
     price      含安装人民币价格
     priceNote  价格说明（可选）
     desc       案例说明（可选）
     tags       标签数组（可选）
     image      360° 等距柱状投影（equirectangular）图片路径
     date       安装年份（可选）

   ★ 新增案例：把 360 全景图片放入 img/360/ 目录，
     再在本文件对应 省份/城市 下追加一条记录即可（无需改任何代码）。

   ※ 已清理全部示例/占位案例（2026-08-25），
     当前仅保留真实案例：江苏省南通市 · LIXIL SPAGE 整体浴室。
   ========================================================= */
window.CASE360_DATA = {
  label: '整体浴室 360° 全景实拍',
  hue: 155,
  intro: '日式整体浴室落地实拍 360° 全景：拖动鼠标即可第一人称环顾整个浴室空间。点击地图省份选择城市查看。',
  provinces: {
    '320000': { name: '江苏省', cities: {
      '320600': { name: '南通市', cases: [
        {
          pano: true,
          id: 'p-nt-01',
          title: 'SPAGE 整体浴室 · 南通',
          brand: 'LIXIL（リクシル）',
          series: 'SPAGE（スページ）',
          price: '¥65,000（含安装）',
          desc: 'LIXIL SPAGE 系列整体浴室，含有肩乐汤及腰乐汤。',
          tags: ['SPAGE', '肩乐汤', '腰乐汤'],
          image: 'img/360/spage-nt-01.jpg',
          thumb: 'img/360/spage-nt-01-thumb.jpg'
        }
      ] }
    } }
  }
};
