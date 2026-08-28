/* =========================================================
   案例图库数据库（bathroom.html / bathroom360.html / furniture.html 使用）
   结构：板块 → 省份 adcode → 城市 adcode → 案例列表
   板块：
     bathroom   浴室案例（360° 全景，显示 品牌/系列/价格）
     furniture  全屋定制（360° 全景 + 多张实景照片，只显示价格）

   每条案例字段：
     id          唯一标识（英文+数字）
     title       案例标题
     meta        卡片副标题（可选）
     brand       品牌（可选；全屋定制不填）
     series      系列（可选；全屋定制不填）
     price       价格（浴室=含安装人民币价格；全屋定制=价格）
     priceNote   价格说明（可选）
     desc        说明（可选）
     tags        标签数组（可选）
     image       360° 等距柱状投影图片路径（可选；有则卡片可打开全景）
     images      普通实景照片数组，可多张（可选；与 image 可同时存在）
     thumb       卡片缩略图（可选；缺省用 image 或 images[0]）
     date        年份（可选）

   ★ 新增案例：360 全景图放 img/360/，普通照片放 img/<板块>/，
     在本文件对应 板块/省份/城市 下追加一条记录即可（无需改任何代码）。
   ※ furniture 板块当前为示例数据（占位图），待提供真实图片后逐条替换。
   ========================================================= */
window.CASE_GALLERY = {

  bathroom: {
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
  },

  furniture: {
    label: '全屋定制实景案例',
    hue: 25,
    intro: '全屋定制落地实拍：360° 全景与多张现场实景照片。点击地图省份选择城市查看。',
    provinces: {
      '110000': { name: '北京市', cities: {
        '110000': { name: '北京市', cases: [
          {
            pano: true,
            id: 'g-bj-01',
            title: '现代风格全屋定制 · 朝阳',
            meta: '全景 + 现场照片',
            price: '¥186,000',
            priceNote: '含设计费、柜体、五金、安装。',
            desc: '示例数据（待替换）：白蜡木饰面与奶白哑光柜门，强调隐藏收纳与留白。',
            tags: ['现代', '白蜡木'],
            image: 'img/360/placeholder-02.jpg',
            images: ['img/360/placeholder-01.jpg', 'img/360/placeholder-03.jpg'],
            thumb: 'img/360/placeholder-02.jpg',
            date: '2025'
          }
        ] }
      } },
      '310000': { name: '上海市', cities: {
        '310000': { name: '上海市', cases: [
          {
            id: 'g-sh-01',
            title: '奶油原木 · 静安',
            meta: '多张现场照片',
            price: '¥142,000',
            priceNote: '含设计费、柜体、五金、安装。',
            desc: '示例数据（待替换）：低饱和奶油色系搭配原木开放格。',
            tags: ['原木', '奶油风'],
            images: ['img/360/placeholder-01.jpg', 'img/360/placeholder-02.jpg', 'img/360/placeholder-03.jpg'],
            thumb: 'img/360/placeholder-01.jpg',
            date: '2024'
          }
        ] }
      } }
    }
  }
};
