window.SHOWER_DATA = {
  exchangeRateDefault: 0.042508,   // 1 JPY -> CNY（可按当天中间价修改）
  types: {
    G: { name:{zh:"G型", ja:"Gタイプ"}, sizes:["0816"], models:{"0816":{code:"JSV0816UGW6", price:1132000}}, door:"A" },
    X: { name:{zh:"X型", ja:"Xタイプ"}, sizes:["0816","0812"], models:{"0816":{code:"JSV0816UXW6", price:906000},"0812":{code:"JSV0812UXW6", price:815000}}, door:"C" },
    T: { name:{zh:"T型", ja:"Tタイプ"}, sizes:["0812","0808"], models:{"0812":{code:"JSV0812UTW6", price:618000},"0808":{code:"JSV0808UTW6", price:527000}}, door:"B" },
    L: { name:{zh:"L型", ja:"Lタイプ"}, sizes:["0812","0808"], models:{"0812":{code:"JSV0812ULW6", price:465000},"0808":{code:"JSV0808ULW6", price:374000}}, door:"D" }
  },
  doorPositions: { A:{zh:"门位 A", ja:"ドア位置 A"}, B:{zh:"门位 B", ja:"ドア位置 B"}, C:{zh:"门位 C", ja:"ドア位置 C"}, D:{zh:"门位 D", ja:"ドア位置 D"} },
  drains: { slab:{zh:"楼板上走管（ころがし）", ja:"スラブ上ころがし"}, through:{zh:"穿楼板（スラブ貫通）", ja:"スラブ貫通"} },
  steps: [
    { id:"wall", no:"1", title:{zh:"选择墙面花色", ja:"壁柄を選ぶ"}, ref:"assets/shower/steps/01-wall.png",
      gradeLabel:{zh:"等级", ja:"グレード"},
      grades:[
        { id:"premium", name:{zh:"高级 II（Premium）", ja:"プレミアムグレード"}, price:{G:32100,X:32100,T:32100,L:96300},
          colors:[
            {id:"EVAQ7", name:{zh:"阿贾克斯白（镜面）", ja:"アジャックスホワイト（鏡面）"}, code:"EVAQ7"},
            {id:"EVAP5", name:{zh:"法尔达黑（哑光）", ja:"ファルダブラック（ツヤ消し）"}, code:"EVAP5", dark:true},
            {id:"EVAQ5", name:{zh:"奥莱格雷（哑光）", ja:"オーレグレージュ（ツヤ消し）"}, code:"EVAQ5"}
          ]},
        { id:"high2", name:{zh:"高级（High Grade II）", ja:"ハイグレードⅡ"}, price:{G:0,X:0,T:0,L:64200},
          colors:[
            {id:"EVAA3", name:{zh:"米涅拉白（镜面）", ja:"ミネラホワイト（鏡面）"}, code:"EVAA3"},
            {id:"EVAJ7", name:{zh:"恩佩拉黑（镜面）", ja:"エンペラブラック（鏡面）"}, code:"EVAJ7", dark:true},
            {id:"EVAH5", name:{zh:"诺瓦木（镜面）", ja:"ノワウッド（鏡面）"}, code:"EVAH5"},
            {id:"EVAE2", name:{zh:"青岚（镜面）", ja:"セイラン（鏡面）"}, code:"EVAE2", dark:true}
          ]},
        { id:"high1", name:{zh:"高级 I（High Grade I）", ja:"ハイグレードⅠ"}, price:{G:-32100,X:-32100,T:-32100,L:32100},
          colors:[
            {id:"EVAS2", name:{zh:"比斯科特拉维汀（镜面）", ja:"ビスクトラバーチン（鏡面）"}, code:"EVAS2"},
            {id:"EVAA2", name:{zh:"阿拉戈纳白（镜面）", ja:"アラゴナホワイト（鏡面）"}, code:"EVAA2"},
            {id:"EVAG1", name:{zh:"普拉纳斯棕木（哑光）", ja:"プラナスブラウンウッド（ツヤ消し）"}, code:"EVAG1", dark:true},
            {id:"EVAC2", name:{zh:"浅木纹 N（哑光）", ja:"ライトウッドN（ツヤ消し）"}, code:"EVAC2"},
            {id:"EVAG4", name:{zh:"普拉纳斯白木（哑光）", ja:"プラナスホワイトウッド（ツヤ消し）"}, code:"EVAG4"}
          ]},
        { id:"basic", name:{zh:"基础等级（Basic）", ja:"ベーシックグレード"}, price:{G:-64200,X:-64200,T:-64200,L:0},
          colors:[
            {id:"EVH85", name:{zh:"贝西斯白（哑光）", ja:"ベーシスホワイト（ツヤ消し）"}, code:"EVH85"}
          ]}
      ],
      panelChange:{ id:"EBB01", name:{zh:"长边墙改为2块面板", ja:"長辺壁2枚パネルへ変更"}, code:"EBB01", price:{G:null,X:0,T:null,L:0},
        note:{zh:"仅 X / L 型可选；贝西斯白专用。", ja:"X / Lタイプのみ。ベーシスホワイト専用。"} }
    },
    { id:"floor", no:"2", title:{zh:"选择地面", ja:"床を選ぶ"}, ref:"assets/shower/steps/02-floor.png",
      options:[
        { id:"floorBase", name:{zh:"卡拉里地板（单色）· 白", ja:"カラリ床（単色）· ホワイト"}, code:"UBFL", price:{G:0,X:0,T:0,L:0}, img:"assets/shower-img/p2_i0.png" }
      ],
      heightOption:{ id:"CTA02", name:{zh:"地面加高 227mm（可调227~267mm）", ja:"床高さ227mm（設定可能227〜267mm）"}, code:"CTA02", price:{G:3150,X:3150,T:3150,L:3150} }
    },
    { id:"storage", no:"3", title:{zh:"选择收纳", ja:"収納を選ぶ"}, ref:"assets/shower/steps/03-storage.png",
      options:[
        { id:"ESH4H", name:{zh:"分体收纳架 W270·2层（浅银）", ja:"セパレート収納棚 W270・2段（ライトシルバー）"}, code:"ESH4H", price:{G:0,X:2600,T:6900,L:null}, img:"assets/shower-img/p2_i3.png" },
        { id:"ESE4H", name:{zh:"分体收纳架 W185·2层（浅银）", ja:"セパレート収納棚 W185・2段（ライトシルバー）"}, code:"ESE4H", price:{G:-2600,X:0,T:4300,L:8500}, img:"assets/shower-img/p2_i4.png" },
        { id:"ESE4L", name:{zh:"分体收纳架 W185·2层（白）", ja:"セパレート収納棚 W185・2段（ホワイト）"}, code:"ESE4L", price:{G:-3700,X:-1100,T:3200,L:7400}, img:"assets/shower-img/p2_i10.png" },
        { id:"ESE4M", name:{zh:"分体收纳架 W185·2层（黑）", ja:"セパレート収納棚 W185・2段（ブラック）"}, code:"ESE4M", price:{G:-3700,X:-1100,T:3200,L:7400}, img:"assets/shower-img/p2_i11.png" },
        { id:"ESE71", name:{zh:"金属网架 2层", ja:"ワイヤーシェルフ2段"}, code:"ESE71", price:{G:13900,X:16500,T:20800,L:25000}, img:"assets/shower-img/p2_i8.png" },
        { id:"ESA51", name:{zh:"转角收纳架 2层（浅银）", ja:"コーナー収納棚2段（ライトシルバー）"}, code:"ESA51", price:{G:null,X:null,T:0,L:4200}, img:"assets/shower-img/p2_i6.png" },
        { id:"ESA00", name:{zh:"不安装收纳架", ja:"収納棚なし"}, code:"ESA00", price:{G:-11100,X:-8500,T:-4200,L:0}, img:"assets/shower-img/p2_i5.png" }
      ] },
    { id:"mirror", no:"4", title:{zh:"选择镜子", ja:"鏡を選ぶ"}, ref:"assets/shower/steps/04-mirror.png",
      options:[
        { id:"M00", name:{zh:"不安装镜子", ja:"鏡なし"}, code:"鏡なし", price:{G:0,X:0,T:0,L:0} },
        { id:"KURF3", name:{zh:"易清洁竖长镜 W298×H950", ja:"お掃除ラクラク鏡 縦長ミラー W298×H950"}, code:"KURF3", price:{G:17600,X:17600,T:17600,L:17600}, img:"assets/shower-img/p2_i1.png", sizeNotAllowed:["0812","0808"] },
        { id:"KUMF3", name:{zh:"竖长镜（防水镜）W298×H950", ja:"縦長ミラー（耐水鏡）W298×H950"}, code:"KUMF3", price:{G:7100,X:7100,T:7100,L:7100}, img:"assets/shower-img/p2_i1.png", sizeNotAllowed:["0812","0808"] },
        { id:"KURS1", name:{zh:"易清洁方镜 W340×H455", ja:"お掃除ラクラク鏡 四角ミラー W340×H455"}, code:"KURS1", price:{G:14900,X:14900,T:14900,L:14900}, img:"assets/shower-img/p2_i2.png" },
        { id:"KUMS1", name:{zh:"方镜（防水镜）W340×H455", ja:"四角ミラー（耐水鏡）W340×H455"}, code:"KUMS1", price:{G:4500,X:4500,T:4500,L:4500}, img:"assets/shower-img/p2_i2.png" }
      ] },
    { id:"faucet", no:"5-1", title:{zh:"选择水龙头五金", ja:"水栓金具を選ぶ"}, ref:"assets/shower/steps/05-faucet.png",
      options:[
        { id:"SBR", name:{zh:"淋浴杆（一般地区）", ja:"シャワーバー（一般地）"}, code:"—", price:{G:0,X:null,T:null,L:null}, img:"assets/shower-img/p3_i0.png" },
        { id:"SEP", name:{zh:"分体淋浴·顶喷（固定花洒）一般地区", ja:"セパレートシャワー オーバーヘッドシャワー（固定）一般地"}, code:"—", price:{G:null,X:0,T:null,L:null}, img:"assets/shower-img/p3_i4.png" },
        { id:"SSGFS", name:{zh:"恒温龙头（一般地区）", ja:"サーモスタット（一般地）"}, code:"SSGFS", price:{G:-68000,X:null,T:0,L:0}, img:"assets/shower-img/p3_i1.png" },
        { id:"SSGFK", name:{zh:"恒温龙头（寒冷地区）", ja:"サーモスタット（寒冷地）"}, code:"SSGFK", price:{G:-64800,X:null,T:3200,L:3200}, img:"assets/shower-img/p3_i1.png" },
        { id:"SSA00", name:{zh:"不安装龙头", ja:"水栓なし"}, code:"SSA00", price:{G:-107500,X:-39500,T:-39500,L:-39500} }
      ] },
    { id:"shower", no:"5-2", title:{zh:"选择花洒", ja:"シャワーを選ぶ"}, ref:"assets/shower/steps/05-shower.png",
      options:[
        { id:"SRW1C", name:{zh:"舒适波浪花洒 4模式·Click（金属色）", ja:"コンフォートウエーブシャワー 4モード・クリック（メタル調）"}, code:"SRW1C", price:{G:33500,X:33500,T:53400,L:53400}, img:"assets/shower-img/p3_i7.png" },
        { id:"SRW01", name:{zh:"舒适波浪花洒 3模式·Active（金属色）", ja:"コンフォートウエーブシャワー 3モード・アクティブ（メタル調）"}, code:"SRW01", price:{G:0,X:0,T:19900,L:19900}, img:"assets/shower-img/p3_i7.png" },
        { id:"SRW1B", name:{zh:"舒适波浪花洒 3模式·Mist（金属色）", ja:"コンフォートウエーブシャワー 3モード・ミスト（メタル調）"}, code:"SRW1B", price:{G:8000,X:8000,T:27900,L:27900}, img:"assets/shower-img/p3_i7.png" },
        { id:"SRW11", name:{zh:"舒适波浪花洒 エー（金属色）", ja:"コンフォートウエーブシャワー エー（メタル調）"}, code:"SRW11", price:{G:-10500,X:-10500,T:9400,L:9400}, img:"assets/shower-img/p3_i7.png" },
        { id:"SRW15", name:{zh:"喷雾花洒S Click（金属色）", ja:"スプレーシャワーS クリック（メタル調）"}, code:"SRW15", price:{G:-2100,X:-2100,T:17800,L:17800}, img:"assets/shower-img/p3_i5.png" },
        { id:"SRW16", name:{zh:"喷雾花洒S Click（白）", ja:"スプレーシャワーS クリック（ホワイト）"}, code:"SRW16", price:{G:-17800,X:-17800,T:2100,L:2100}, img:"assets/shower-img/p3_i5.png" },
        { id:"SRW17", name:{zh:"喷雾花洒S Click（白）", ja:"スプレーシャワーS クリック（ホワイト）"}, code:"SRW17", price:{G:-9400,X:-9400,T:10500,L:10500}, img:"assets/shower-img/p3_i5.png" },
        { id:"SRG01", name:{zh:"喷雾花洒S", ja:"スプレーシャワーS"}, code:"SRG01", price:{G:-19900,X:-19900,T:0,L:0}, img:"assets/shower-img/p3_i5.png" }
      ] },
    { id:"door", no:"6", title:{zh:"选择门", ja:"ドアを選ぶ"}, ref:"assets/shower/steps/06-door.png",
      options:[
        { id:"D00", name:{zh:"折叠门 800（通风口固定式）", ja:"折戸 800サイズ（開放固定式）"}, code:"基本仕様", price:{G:0,X:0,T:0,L:0}, img:"assets/shower-img/p4_i0.png" },
        { id:"HDR21", name:{zh:"折叠门 800（通风口开闭式）", ja:"折戸 800サイズ（開閉式）"}, code:"HDR21", price:{G:2150,X:2150,T:2150,L:2150}, img:"assets/shower-img/p4_i0.png" },
        { id:"HDR36", name:{zh:"折叠门 无障碍 800（固定式）", ja:"折戸 バリアフリー 800（開放固定式）"}, code:"HDR36", price:{G:42800,X:42800,T:42800,L:42800}, img:"assets/shower-img/p4_i1.png" },
        { id:"HDR3F", name:{zh:"折叠门 无障碍 900（固定式）", ja:"折戸 バリアフリー 900（開放固定式）"}, code:"HDR3F", price:{G:53500,X:53500,T:53500,L:53500}, img:"assets/shower-img/p4_i1.png", allowNote:{zh:"仅 0816 G/X、0812 L，且门位 A/C", ja:"0816 G/X、0812 L でドア位置A/Cのみ"} },
        { id:"HDR37", name:{zh:"折叠门 无障碍 800（开闭式）", ja:"折戸 バリアフリー 800（開閉式）"}, code:"HDR37", price:{G:44900,X:44900,T:44900,L:44900}, img:"assets/shower-img/p4_i3.png" },
        { id:"HDP3F", name:{zh:"平开门 无障碍 800（阻尼开闭式）", ja:"開き戸 バリアフリー 800（ダンパー開閉式）"}, code:"HDP3F", price:{G:58900,X:58900,T:58900,L:58900}, img:"assets/shower-img/p4_i6.png", allowNote:{zh:"仅 0816 X 型", ja:"0816 Xのみ"} }
      ] },
    { id:"light", no:"7", title:{zh:"选择照明", ja:"照明を選ぶ"}, ref:"assets/shower/steps/07-light.png",
      options:[
        { id:"KSDQ1", name:{zh:"筒灯（LED）〔暖白光〕", ja:"ダウンライト（LED）〔電球色〕"}, code:"KSDQ1", price:{G:0,X:0,T:0,L:8000}, img:"assets/shower-img/p4_i7.png" },
        { id:"KSTM1", name:{zh:"平板灯（LED）〔温白光〕", ja:"フラット形照明（LED）〔温白色〕"}, code:"KSTM1", price:{G:27000,X:27000,T:27000,L:35000}, img:"assets/shower-img/p4_i9.png" },
        { id:"KSWE1", name:{zh:"半球灯（LED灯）〔暖白光〕", ja:"半球形照明（LEDランプ）〔電球色〕"}, code:"KSWE1", price:{G:-8000,X:-8000,T:-8000,L:0}, img:"assets/shower-img/p4_i10.png" },
        { id:"KSQE1", name:{zh:"圆形灯（LED灯）〔暖白光〕", ja:"丸形照明（LEDランプ）〔電球色〕"}, code:"KSQE1", price:{G:-8000,X:-8000,T:-8000,L:0}, img:"assets/shower-img/p4_i8.png" }
      ] },
    { id:"vent", no:"8-1", title:{zh:"替换选项：通风", ja:"入れ替えオプション：換気"}, ref:"assets/shower/steps/08-vent.png",
      options:[
        { id:"V00", name:{zh:"通风格栅", ja:"換気グリル"}, code:"基本仕様", price:{G:0,X:0,T:0,L:0} },
        { id:"IKJC5", name:{zh:"换气扇（抗菌·防霉）", ja:"換気扇（抗菌・防カビ仕様）"}, code:"IKJC5", price:{G:19600,X:19600,T:19600,L:19600}, sizeNotAllowed:["0808"] },
        { id:"IKK85", name:{zh:"换气扇（管道风扇型）", ja:"換気扇（パイプファンタイプ）"}, code:"IKK85", price:{G:15800,X:15800,T:15800,L:15800} }
      ],
      opening:[
        { id:"OP00", name:{zh:"无开口", ja:"開口なし"}, code:"—", price:{G:0,X:0,T:0,L:0} },
        { id:"IKA01", name:{zh:"开口 □177", ja:"開口 □177"}, code:"IKA01", price:{G:2300,X:2300,T:2300,L:2300} },
        { id:"IKA05", name:{zh:"开口 □225", ja:"開口 □225"}, code:"IKA05", price:{G:2300,X:2300,T:2300,L:2300}, sizeNotAllowed:["0808"] }
      ],
      wood:[
        { id:"W00", name:{zh:"有加固木（基本）", ja:"補強木あり（基本）"}, code:"基本仕様", price:{G:0,X:0,T:0,L:0} },
        { id:"IKB00", name:{zh:"无加固木", ja:"補強木なし"}, code:"IKB00", price:{G:-1050,X:-1050,T:-1050,L:-1050} }
      ] },
    { id:"slide", no:"8-2", title:{zh:"替换选项：滑杆 / 毛巾架 / 弯头", ja:"入れ替えオプション：スライドバー/タオル掛け/エルボ"}, ref:"assets/shower/steps/08-slide.png",
      options:[
        { id:"SBA31", name:{zh:"滑杆 L=635", ja:"スライドバー L=635"}, code:"SBA31", price:{G:null,X:0,T:0,L:10200}, img:"assets/shower-img/p5_i4.png" },
        { id:"SBE5R", name:{zh:"带滑挂的置物杆（金属色）L=800", ja:"スライドハンガー付インテリア・バー（メタル調）L=800"}, code:"SBE5R", price:{G:null,X:23000,T:23000,L:33200}, img:"assets/shower-img/p5_i5.png" },
        { id:"SBA00", name:{zh:"不安装滑杆（2个花洒挂）", ja:"スライドバーなし（シャワーハンガー2個）"}, code:"SBA00", price:{G:null,X:-10200,T:-10200,L:0}, img:"assets/shower-img/p5_i6.png" }
      ] },
    { id:"towel", no:"8-2", title:{zh:"替换选项：毛巾架", ja:"入れ替えオプション：タオル掛け"}, ref:"assets/shower/steps/08-towel.png",
      options:[
        { id:"KTA21", name:{zh:"毛巾架（方形）银 L=350", ja:"タオル掛け（角形）シルバー L=350"}, code:"KTA21", price:{G:0,X:0,T:null,L:null}, img:"assets/shower-img/p5_i0.png" },
        { id:"KTA21M", name:{zh:"毛巾架（方形）金属色 L=350", ja:"タオル掛け（角形）メタル調 L=350"}, code:"KTA21", price:{G:3150,X:3150,T:null,L:null}, img:"assets/shower-img/p5_i1.png" },
        { id:"KTA22", name:{zh:"毛巾架（方形）银 L=300", ja:"タオル掛け（角形）シルバー L=300"}, code:"KTA22", price:{G:null,X:null,T:2200,L:2200}, img:"assets/shower-img/p5_i0.png" },
        { id:"KTAWH", name:{zh:"毛巾架（白）L=300", ja:"タオル掛け（ホワイト）L=300"}, code:"—", price:{G:null,X:null,T:0,L:0}, img:"assets/shower-img/p5_i2.png" },
        { id:"KTA00", name:{zh:"不安装毛巾架", ja:"タオル掛けなし"}, code:"KTA00", price:{G:-2600,X:-2600,T:-400,L:-400} }
      ] },
    { id:"elbow", no:"8-2", title:{zh:"替换选项：弯头交换", ja:"入れ替えオプション：エルボ交換"}, ref:"assets/shower/steps/08-elbow.png",
      options:[
        { id:"E00", name:{zh:"给水·给水弯头（基本）", ja:"給水・給湯エルボ（基本）"}, code:"基本仕様", price:{G:0,X:0,T:0,L:0} },
        { id:"DHE00", name:{zh:"不安装弯头", ja:"エルボなし"}, code:"DHE00", price:{G:-3200,X:-3200,T:-3200,L:-3200} },
        { id:"DHS11", name:{zh:"其他厂家龙头BOX用墙加工", ja:"他社水栓BOX用壁加工"}, code:"DHS11", price:{G:-3200,X:-3200,T:-3200,L:-3200} }
      ] },
    { id:"extra", no:"9", title:{zh:"追加选项", ja:"追加オプション"}, ref:"assets/shower/steps/09-extra.png",
      bars:[
        { id:"KNR7", name:{zh:"起身辅助用（I型 L600·竖装）", ja:"立ち座り用（Ⅰ型 L600・縦付け）"}, price:16300, img:"assets/shower-img/p6_i1.png", note:{zh:"0812 X 型不可", ja:"0812 Xタイプは選択不可"} },
        { id:"KWR5", name:{zh:"姿势保持用（I型 L500·横装）", ja:"姿勢保持用（Ⅰ型 L500・横付け）"}, price:15700, img:"assets/shower-img/p6_i1.png", note:{zh:"0808 尺寸不可", ja:"0808サイズは選択不可"} },
        { id:"KER8", name:{zh:"姿势保持用（I型 L800·竖装）", ja:"姿勢保持用（Ⅰ型 L800・縦付け）"}, price:21800, img:"assets/shower-img/p6_i2.png", note:{zh:"0808 尺寸不可", ja:"0808サイズは選択不可"} },
        { id:"KAR1", name:{zh:"进出辅助用（I型 L600·门旁横装）", ja:"出入り用（Ⅰ型 L600・ドア横取り付け）"}, price:16300, img:"assets/shower-img/p6_i1.png", note:{zh:"仅 0812 且门位 A/C", ja:"0812サイズでドア位置A/Cのみ"} },
        { id:"KJR1", name:{zh:"姿势保持用（L型·长边墙安装）", ja:"姿勢保持用（Ｌ型・長辺壁取り付け）"}, price:26500, img:"assets/shower-img/p6_i2.png", note:{zh:"0808 尺寸不可", ja:"0808サイズは選択不可"} }
      ],
      barColors:[
        { id:"WH", name:{zh:"白", ja:"ホワイト"}, price:0 },
        { id:"BE", name:{zh:"微笑米色", ja:"スマイルベージュ"}, price:null }, // price set per bar
        { id:"GR", name:{zh:"收获灰", ja:"ハーベストグレー"}, price:null }
      ],
      extras:[
        { id:"KCA11", name:{zh:"紧急呼叫", ja:"非常コール"}, code:"KCA11", price:{G:10500,X:10500,T:10500,L:10500} },
        { id:"ACA01", name:{zh:"存水弯保温罩", ja:"トラップ保温カバー"}, code:"ACA01", price:{G:1650,X:1650,T:1650,L:1650}, img:"assets/shower-img/p6_i6.png" },
        { id:"ATA00", name:{zh:"不安装存水弯（穿楼板型）", ja:"雑排水トラップなし（スラブ貫通タイプ）"}, code:"ATA00", price:{G:-14100,X:-14100,T:-14100,L:-14100}, note:{zh:"仅穿楼板排水方向", ja:"雑排水管の方向がスラブ貫通の場合のみ"} }
      ],
      pipeMaterial:[
        { id:"VP", name:{zh:"PVC管（VP）", ja:"塩ビ管（VP）"} },
        { id:"AHT", name:{zh:"耐火包覆PVC管（内管VP）", ja:"耐火被覆塩ビ管（内管VP）"} }
      ],
      pipeDirection:[
        { id:"D1", name:{zh:"D1 方向", ja:"D1方向"}, price:{VP:{G:1400,X:1400,T:1400,L:1400}, AHT:{G:4400,X:4400,T:4400,L:4400}} },
        { id:"D2", name:{zh:"D2 方向", ja:"D2方向"}, price:{VP:{G:1500,X:1500,T:1500,L:1500}, AHT:{G:4500,X:4500,T:4500,L:4500}} },
        { id:"D3", name:{zh:"D3 方向", ja:"D3方向"}, price:{VP:{G:1400,X:1400,T:1400,L:1400}, AHT:{G:4400,X:4400,T:4400,L:4400}} }
      ]
    }
  ]
};
