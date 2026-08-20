window.SINRA_DATA = {
  brand:"TOTO",
  series:{zh:"シンラ 系统浴室", ja:"システムバスルーム「シンラ」"},
  types:{
    G:{name:{zh:"G型（高端）", ja:"Gタイプ"}},
    B:{name:{zh:"B型", ja:"Bタイプ"}},
    R:{name:{zh:"R型", ja:"Rタイプ"}},
    D:{name:{zh:"D型", ja:"Dタイプ"}},
    C:{name:{zh:"C型（紧凑）", ja:"Cタイプ"}}
  },
  sizeOrder:["1624","1620","1717","1616","1317","1216","1618"],
  sizes:{
    "1624":{zh:"1624 · 1.5坪", ja:"1624 · 1.5坪"},
    "1620":{zh:"1620 · 1.25坪", ja:"1620 · 1.25坪"},
    "1717":{zh:"1717 · 1坪", ja:"1717 · 1坪"},
    "1616":{zh:"1616 · 1坪", ja:"1616 · 1坪"},
    "1317":{zh:"1317 · 0.75坪强", ja:"1317 · 0.75坪強"},
    "1216":{zh:"1216 · 0.75坪", ja:"1216 · 0.75坪"},
    "1618":{zh:"1618 · 米制模数", ja:"1618 · メーターモジュール"}
  },
  basePrices:{
    "1624":{G:3682000,B:3343000,R:2819000,D:2312000,C:1936000},
    "1620":{G:3406000,B:3067000,R:2543000,D:2036000,C:1660000},
    "1717":{G:3213000,B:2874000,R:2350000,D:1843000,C:1467000},
    "1616":{G:3128000,B:2789000,R:2265000,D:1758000,C:1382000},
    "1317":{G:null,B:null,R:null,D:1735000,C:1359000},
    "1216":{G:null,B:null,R:null,D:1675000,C:1299000},
    "1618":{G:3243000,B:2904000,R:2380000,D:1873000,C:1497000}
  },
  steps:[
    {id:"type", no:"0", title:{zh:"选择类型与尺寸", ja:"タイプ・サイズを選ぶ"}, pages:["assets/sinra/pages/page-04.png","assets/sinra/pages/page-05.png"], desc:{zh:"基本规格价按所选类型与尺寸确定。", ja:"基本仕様価格はタイプ・サイズで決まります。"}},
    {id:"wall", no:"1", title:{zh:"选择墙面花色", ja:"壁柄を選ぶ"}, pages:["assets/sinra/pages/page-06.png","assets/sinra/pages/page-07.png","assets/sinra/pages/page-08.png","assets/sinra/pages/page-09.png"]},
    {id:"tub", no:"2", title:{zh:"选择浴缸", ja:"浴槽を選ぶ"}, pages:["assets/sinra/pages/page-10.png","assets/sinra/pages/page-11.png","assets/sinra/pages/page-12.png","assets/sinra/pages/page-13.png"]},
    {id:"counter", no:"3", title:{zh:"选择台面", ja:"カウンターを選ぶ"}, pages:["assets/sinra/pages/page-12.png","assets/sinra/pages/page-13.png"]},
    {id:"floor", no:"4", title:{zh:"选择地面", ja:"床を選ぶ"}, pages:["assets/sinra/pages/page-14.png","assets/sinra/pages/page-15.png"]},
    {id:"items", no:"5", title:{zh:"便利功能物品", ja:"暮らしを便利にするアイテムを選ぶ"}, pages:["assets/sinra/pages/page-14.png","assets/sinra/pages/page-15.png"]},
    {id:"light", no:"6", title:{zh:"选择照明", ja:"照明を選ぶ"}, pages:["assets/sinra/pages/page-16.png","assets/sinra/pages/page-17.png"]},
    {id:"vent", no:"7", title:{zh:"选择换气扇", ja:"換気扇を選ぶ"}, pages:["assets/sinra/pages/page-16.png","assets/sinra/pages/page-17.png","assets/sinra/pages/page-18.png","assets/sinra/pages/page-19.png"]},
    {id:"heater", no:"8", title:{zh:"洗面所暖房机", ja:"洗面所暖房機を選ぶ"}, pages:["assets/sinra/pages/page-32.png","assets/sinra/pages/page-33.png"]},
    {id:"faucet", no:"9", title:{zh:"水栓·花洒·毛巾架·滑杆", ja:"水栓・シャワー・タオル掛け・スライドバーを選ぶ"}, pages:["assets/sinra/pages/page-18.png","assets/sinra/pages/page-19.png","assets/sinra/pages/page-20.png","assets/sinra/pages/page-21.png"]},
    {id:"mirror", no:"10", title:{zh:"选择镜子", ja:"鏡を選ぶ"}, pages:["assets/sinra/pages/page-22.png","assets/sinra/pages/page-23.png"]},
    {id:"ceiling", no:"11", title:{zh:"选择吊顶", ja:"天井を選ぶ"}, pages:["assets/sinra/pages/page-24.png","assets/sinra/pages/page-25.png"]},
    {id:"storage", no:"12", title:{zh:"选择收纳架", ja:"収納棚を選ぶ"}, pages:["assets/sinra/pages/page-24.png","assets/sinra/pages/page-25.png"]},
    {id:"door", no:"13", title:{zh:"选择门", ja:"ドアを選ぶ"}, pages:["assets/sinra/pages/page-26.png","assets/sinra/pages/page-27.png","assets/sinra/pages/page-28.png","assets/sinra/pages/page-29.png"]},
    {id:"extra", no:"14", title:{zh:"追加选项", ja:"さらに浴室を快適にするオプションを選ぶ"}, pages:["assets/sinra/pages/page-28.png","assets/sinra/pages/page-29.png","assets/sinra/pages/page-30.png","assets/sinra/pages/page-31.png","assets/sinra/pages/page-32.png","assets/sinra/pages/page-33.png","assets/sinra/pages/page-34.png","assets/sinra/pages/page-35.png","assets/sinra/pages/page-36.png","assets/sinra/pages/page-37.png","assets/sinra/pages/page-38.png","assets/sinra/pages/page-39.png","assets/sinra/pages/page-40.png","assets/sinra/pages/page-41.png","assets/sinra/pages/page-42.png","assets/sinra/pages/page-43.png","assets/sinra/pages/page-44.png","assets/sinra/pages/page-45.png","assets/sinra/pages/page-46.png","assets/sinra/pages/page-47.png","assets/sinra/pages/page-48.png","assets/sinra/pages/page-49.png","assets/sinra/pages/page-50.png","assets/sinra/pages/page-51.png","assets/sinra/pages/page-52.png"]}
  ]
};
