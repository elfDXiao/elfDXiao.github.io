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

   ※ 当前为示例数据（占位全景图），待提供真实 360 图片与
     省份/城市/品牌/系列/价格信息后逐条替换。
   ========================================================= */
window.CASE360_DATA = {
  label: '整体浴室 360° 全景实拍',
  hue: 155,
  intro: '日式整体浴室落地实拍 360° 全景：拖动鼠标即可第一人称环顾整个浴室空间。点击地图省份选择城市查看。',
  provinces: {
    '310000': { name: '上海市', cities: {
      '310000': { name: '上海市', cases: [
        {
          pano: true,
          id: 'p-sh-01',
          title: '1.6m 整体浴室 · 浦东',
          brand: 'クリナップ',
          series: 'ラクヴィア（RakuVia）',
          price: '¥68,000 全含',
          priceNote: '含日本进口浴缸、壁板、顶板、地台、安装与运输。',
          desc: '在既有卫生间内整体吊装日式 UNIT BATH，恒温浴缸 + 暖房干燥机，实现干湿真正分离。',
          tags: ['1616', '吊装', '暖房干燥'],
          image: 'img/360/placeholder-01.jpg',
          thumb: 'img/360/placeholder-01.jpg',
          date: '2025'
        }
      ] }
    } },
    '320000': { name: '江苏省', cities: {
      '320500': { name: '苏州市', cases: [
        {
          pano: true,
          id: 'p-sz-01',
          title: '别墅主卫 · 1.4m 整体浴室',
          brand: 'クリナップ',
          series: 'セレヴィア（Serevia）',
          price: '¥52,000 全含',
          priceNote: '含壁板、顶板、地台、门、安装与运输。',
          desc: '别墅主卧卫生间改造，采用日式四件套整体浴室，保温性能优于传统瓷砖湿区。',
          tags: ['1416', '别墅', '四件套'],
          image: 'img/360/placeholder-02.jpg',
          thumb: 'img/360/placeholder-02.jpg',
          date: '2025'
        }
      ] }
    } },
    '330000': { name: '浙江省', cities: {
      '330100': { name: '杭州市', cases: [
        {
          pano: true,
          id: 'p-hz-01',
          title: '高层住宅卫浴改造 · 1.2m',
          brand: 'LIXIL（リクシル）',
          series: 'SPAGE（スページ）',
          price: '¥46,000 全含',
          priceNote: '含壁板、顶板、地台、门、安装与运输。',
          desc: '高层旧卫改造，电梯可入的标准尺寸单元，3 天完成安装，免砸砖。',
          tags: ['1216', '免砸砖', '3天安装'],
          image: 'img/360/placeholder-03.jpg',
          thumb: 'img/360/placeholder-03.jpg',
          date: '2024'
        }
      ] }
    } },
    '440000': { name: '广东省', cities: {
      '440300': { name: '深圳市', cases: [
        {
          pano: true,
          id: 'p-szgd-01',
          title: '公寓卫浴升级 · 1.3m',
          brand: 'TOTO',
          series: 'サザナ（Sazana）',
          price: '¥58,000 全含',
          priceNote: '含壁板、顶板、地台、门、安装与运输。',
          desc: '小户型公寓整体换装，一体成型无卫生死角，抗菌材质更适合出租房高频使用。',
          tags: ['1316', '公寓', '抗菌'],
          image: 'img/360/placeholder-01.jpg',
          thumb: 'img/360/placeholder-01.jpg',
          date: '2025'
        }
      ] }
    } },
    '110000': { name: '北京市', cities: {
      '110000': { name: '北京市', cases: [
        {
          pano: true,
          id: 'p-bj-01',
          title: '北方严寒地区 · 保温款',
          brand: 'TOTO',
          series: 'Synla（シンラ）',
          price: '¥75,000 全含',
          priceNote: '含加强保温壁板、电地暖、安装与运输。',
          desc: '针对北方冬季，选配加强保温壁板与电地暖，浴室内温度更稳定，体感更舒适。',
          tags: ['保温', '电地暖', '严寒'],
          image: 'img/360/placeholder-02.jpg',
          thumb: 'img/360/placeholder-02.jpg',
          date: '2024'
        }
      ] }
    } }
  }
};
