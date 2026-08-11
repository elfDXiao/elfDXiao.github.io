/* =========================================================
   客户需求调查 · 问卷数据
   基于 ELF.D《客户需求调查》整理，并按室内设计师视角补充
   （项目概况 / 卧室衣帽间 / 全屋定制与收纳）
   说明：本页面不收集任何个人身份信息，数据仅保存在浏览器本地。
   ========================================================= */
window.SURVEY_DATA = {
  brand: 'ELF.D',
  docTitle: '客户需求调查',
  docSubtitle: '全案设计 · 需求调查表',
  sections: [
    {
      id: 'overview',
      no: '01',
      title: '项目概况',
      note: '先让我们认识一下你的房子和这次装修的轮廓。',
      fields: [
        { id: 'ov_houseType', type: 'radio', label: '房屋类型？', options: ['新房 · 毛坯', '新房 · 精装', '二手房 · 整体翻新', '二手房 · 局部改造', '自建房', '别墅', '其他'] },
        { id: 'ov_area', type: 'number', label: '建筑面积（㎡）？', placeholder: '如：120' },
        { id: 'ov_layout', type: 'text', label: '户型格局？', placeholder: '如：3 室 2 厅 2 卫' },
        { id: 'ov_scope', type: 'checkbox', label: '本次需要哪些服务？（可多选）', options: ['全案设计', '硬装施工', '全屋定制', '软装搭配', '厨卫系统', '整体浴室', '暖通空调', '智能化', '其他'], other: true },
        { id: 'ov_budget', type: 'select', label: '装修总预算范围？', hint: '指硬装 + 定制 + 主材的总体预算', options: ['10 万以下', '10–20 万', '20–40 万', '40–80 万', '80 万以上', '暂时未定'] },
        { id: 'ov_budgetInclude', type: 'checkbox', label: '该预算包含哪些部分？（可多选）', options: ['硬装施工', '主材', '全屋定制柜体', '家电', '家具软装', '不清楚'] },
        { id: 'ov_timeline', type: 'select', label: '计划什么时候开工？', options: ['1 个月内', '1–3 个月', '3–6 个月', '半年以上', '先咨询看看'] },
        { id: 'ov_style', type: 'checkbox', label: '喜欢的风格？（可多选）', options: ['现代', '北欧', '日式', '新中式', '奶油风', '工业风', '美式', '法式', '混搭', '暂时不确定'] },
        { id: 'ov_ref', type: 'textarea', label: '有没有特别喜欢的参考图或案例？', hint: '可以简单描述，例如：喜欢原木色、暖光灯、侘寂风那种安静的感觉', placeholder: '……' }
      ]
    },
    {
      id: 'residents',
      no: '02',
      title: '居住者情况',
      note: '房子是给人住的，先聊聊住在里面的人。',
      fields: [
        { id: 'res_members', type: 'textarea', label: '房屋的居住成员有哪些？年龄？作息时间及睡前活动？', hint: '可以说得随意一些', placeholder: '例如：夫妻俩 30 岁，孩子 5 岁，老人偶尔来住……' },
        { id: 'res_extra', type: 'textarea', label: '是否有与常规生活需求分离的功能需求？', hint: '例如居家办公、团队会议、直播、健身', placeholder: '……' },
        { id: 'res_elder', type: 'textarea', label: '是否有老人居住？居住时间长短？是否有行动障碍或其他不便？', placeholder: '例如：婆婆长住，膝盖不好，需要扶手……' },
        { id: 'res_baby', type: 'radio', label: '家庭的生育计划？', options: ['暂无计划', '1 年内考虑', '2–3 年内', '已有二胎 / 三胎计划'] },
        { id: 'res_childHobby', type: 'textarea', label: '有无对孩子的兴趣培养计划？', hint: '钢琴、架子鼓等占据空间的爱好', placeholder: '……' },
        { id: 'res_rooms', type: 'text', label: '需要几个固定房间？几个机动房间？', placeholder: '如：固定 3 间、机动 1 间' },
        { id: 'res_years', type: 'radio', label: '新房的预期居住年限？', hint: '设备和饰面都有设计寿命，理性回答方便我们做取舍', options: ['5 年以内', '5–10 年', '10–15 年', '15 年以上，打算长住'] }
      ]
    },
    {
      id: 'entryway',
      no: '03',
      title: '玄关',
      note: '回家和出门的第一站，收纳与仪式感都从这里开始。',
      fields: [
        { id: 'en_vehicle', type: 'checkbox', label: '家庭已采购或计划采购的出行设备？（可多选）', options: ['婴儿推车', '电控玩具车', '自行车', '平衡车', '滑板', '电动踏板车', '轮椅'], other: true },
        { id: 'en_hand', type: 'radio', label: '主要家庭成员是左撇子吗？', options: ['都是右利手', '有左撇子', '不确定'] },
        { id: 'en_cam', type: 'radio', label: '门外是否希望有监控？', options: ['希望', '不希望', '与家人商量后再说'] },
        { id: 'en_dirt', type: 'radio', label: '是否希望有土间（落尘区）？', hint: '有段差利于门口鞋类整齐，但不利于老人通过', options: ['不需要土间', '需要 · 有段差', '需要 · 无段差'] },
        { id: 'en_shoes', type: 'radio', label: '门口鞋帽的收纳方式？', options: ['全季鞋帽都收在门口', '门口只收当季鞋帽', '待定'] },
        { id: 'en_gear', type: 'text', label: '是否有护具等需要存放？', placeholder: '如：头盔、球拍、雨具……' },
        { id: 'en_umbrella', type: 'radio', label: '雨伞收纳在哪里？', options: ['土间内', '入户门外', '无所谓'] },
        { id: 'en_func', type: 'checkbox', label: '玄关希望有哪些功能？（可多选）', options: ['衣物挂放', '全身镜', '随身小物品收纳', '扶手', '换鞋凳', '洗手池', '手包放置区'], other: true }
      ]
    },
    {
      id: 'kitchen',
      no: '04',
      title: '厨房',
      note: '厨房是家的心脏。材料、电器、动线，越细越好。',
      fields: [
        { id: 'k_floor', type: 'radio', label: '厨房地面材质？', hint: '客厅为地板时厨房也可用地板，整体性强、可清洁性一般', options: ['地板', '地砖', '待定'] },
        { id: 'k_wall', type: 'radio', label: '厨房墙面材质？', hint: '珐琅板颜值高，但人工费占比会随地区不同而上升', options: ['珐琅板', '耐污板', '砖', '乳胶漆', '其他', '待定'] },
        { id: 'k_sink', type: 'radio', label: '水槽使用偏好？', hint: '人造石可做无缝工艺、颜值高，但台面造价有连带成本', options: ['单槽 · 不锈钢', '单槽 · 人造石', '双槽 · 不锈钢', '双槽 · 人造石', '待定'] },
        { id: 'k_dish', type: 'checkbox', label: '洗碗机偏好？（可多选）', options: ['6–8 套抽屉式', '12–13 套下翻门', '12–13 套双抽', '台面式', '水槽式（不推荐）', '不需要'] },
        { id: 'k_embed', type: 'checkbox', label: '嵌入式烹饪电器需求？（可多选）', options: ['蒸箱', '烤箱', '蒸烤一体机', '蒸烤微一体机', '咖啡机', '暖碟机', '都不需要'] },
        { id: 'k_island', type: 'radio', label: '是否希望有中岛？', options: ['不要中岛', '要中岛（不带水槽和电磁炉）', '中岛带水槽', '中岛带水槽 + 嵌入式电磁炉'] },
        { id: 'k_west', type: 'radio', label: '是否希望中西厨分离？', options: ['是', '否', '待定'] },
        { id: 'k_door', type: 'radio', label: '中厨是否希望有门？', hint: '先自省一下现在烧饭时是否关门', options: ['是', '否', '待定'] },
        { id: 'k_height', type: 'text', label: '厨房使用者的身高？', placeholder: '如：165 cm' },
        { id: 'k_stove', type: 'checkbox', label: '灶具使用偏好？（可多选）', options: ['日式烤箱灶（推荐，32cm 以上锅具家庭除外）', '传统灶台', '集成灶', '电陶炉'] },
        { id: 'k_faucet', type: 'checkbox', label: '水槽龙头与电器需求？（可多选）', options: ['感应出水龙头', '有进口电器（110V）需求', '都不需要'] },
        { id: 'k_smallAppliance', type: 'checkbox', label: '厨房小电器（不完全列举，可多选）', options: ['电饭煲', '空气炸锅', '破壁机', '咖啡机', '电热水壶', '微波炉', '多士炉', '榨汁机'], other: true },
        { id: 'k_video', type: 'radio', label: '中西厨是否有视频需求？', options: ['不需要', '需要视频', '需要视频并同步到客厅 / 书房'] },
        { id: 'k_fridge', type: 'checkbox', label: '冰箱相关需求？（可多选）', options: ['增设冰柜', '厨房外休闲冰箱', '都不需要'] },
        { id: 'k_pantry', type: 'radio', label: '是否需要食品收纳间或食品收纳柜？', options: ['是', '否', '待定'] },
        { id: 'k_laundry', type: 'radio', label: '是否希望家务间或洗衣设备放在厨房附近？', options: ['是', '否', '无所谓'] }
      ]
    },
    {
      id: 'bathroom',
      no: '05',
      title: '卫生间',
      note: '三分离、整体浴室、镜柜……卫生间是最值得花钱的地方。',
      fields: [
        { id: 'b_split', type: 'radio', label: '卫生间格局？', hint: '三分离 = 独立马桶间 + 洗面区 + 浴室', options: ['三分离', '干湿两分离', '普通格局', '待定'] },
        { id: 'b_bath', type: 'radio', label: '洗浴空间选择？', options: ['整体浴室（带浴缸）', '整体淋浴', '普通贴砖淋浴房', '浴缸 + 淋浴'] },
        { id: 'b_toilet', type: 'text', label: '独立马桶间数量？', placeholder: '如：1 个' },
        { id: 'b_toiletFloor', type: 'radio', label: '马桶间地面材质？', options: ['地砖', '地板', '待定'] },
        { id: 'b_mirror', type: 'radio', label: '洗面柜能否接受镜柜形式？', options: ['可以', '更想要开放镜', '待定'] },
        { id: 'b_makeup', type: 'radio', label: '是否需要美妆灯？', hint: '烧钱项', options: ['需要', '不需要'] },
        { id: 'b_volt', type: 'radio', label: '洗面柜电器是否有进口电压需求？', options: ['无', '有 110V 需求', '需 110V + 220V 双插座'] },
        { id: 'b_reheat', type: 'radio', label: '整体浴室是否需要追焚（再加热）功能？', options: ['需要', '不需要', '未使用整体浴室'] },
        { id: 'b_accessible', type: 'radio', label: '独立马桶间是否需要考虑无障碍设施？', options: ['需要', '不需要', '暂不考虑'] },
        { id: 'b_toiletExtra', type: 'checkbox', label: '马桶间附加配置？（可多选）', options: ['手机充电插座', '报刊架', '都不需要'] },
        { id: 'b_care', type: 'checkbox', label: '个人护理电器（不完全列举，可多选）', options: ['剃须刀', '吹风机', '电动牙刷', '洁面仪', '卷发棒'], other: true },
        { id: 'b_laundry', type: 'radio', label: '是否希望家务间或洗衣设备放在浴室附近？', options: ['是', '否', '无所谓'] },
        { id: 'b_scale', type: 'radio', label: '体重计放置位置？', hint: '简单说：前室对应净重，洗面所对应毛重', options: ['前室（净重）', '洗面所（毛重）', '不放置', '无所谓'] }
      ]
    },
    {
      id: 'bedroom',
      no: '06',
      title: '卧室与衣帽间',
      note: '补充板块：睡眠和衣物收纳，决定每天 1/3 时间的幸福感。',
      fields: [
        { id: 'bd_count', type: 'text', label: '卧室数量及各卧室使用者？', placeholder: '如：主卧 2 人、次卧老人 1 人、儿童房孩子 1 人' },
        { id: 'bd_bed', type: 'radio', label: '主卧床的尺寸？', options: ['1.5 m', '1.8 m', '2.0 m', '待定'] },
        { id: 'bd_closet', type: 'radio', label: '是否需要独立衣帽间？', options: ['需要', '不需要', '利用衣柜即可'] },
        { id: 'bd_wardrobe', type: 'checkbox', label: '衣柜内部偏好？（可多选）', options: ['挂区为主', '叠放区为主', '长衣区', '裤架', '拉篮', '首饰抽屉', '全身镜'], other: true },
        { id: 'bd_light', type: 'radio', label: '床头灯光需求？', options: ['两侧阅读灯', '单侧阅读灯', '壁灯', '不需要'] },
        { id: 'bd_curtain', type: 'radio', label: '窗帘遮光需求？', options: ['全遮光', '半遮光', '纱帘为主', '电动窗帘'] },
        { id: 'bd_kids', type: 'radio', label: '儿童房是否需要按成长阶段可调整？', options: ['需要', '不需要', '暂无儿童房'] },
        { id: 'bd_split', type: 'radio', label: '是否有作息不同步、需要分床或分房的情况？', hint: '例如打呼、起夜时间不同', options: ['无', '有，需要分床', '有，需要分房'] }
      ]
    },
    {
      id: 'hvac',
      no: '07',
      title: '暖通',
      note: '空调、地暖、新风、净水……嫌麻烦的可以都交给设计师。',
      fields: [
        { id: 'hv_ac', type: 'checkbox', label: '空调形式？（可多选）', options: ['全空气', '水机（地源热泵或空气源热泵）', '氟机多联机', '壁挂机 + 风管机结合', '辐射制冷', '交给设计师'] },
        { id: 'hv_heat', type: 'checkbox', label: '采暖形式？（可多选）', options: ['地暖（干法）', '地暖（湿法）', '水暖气片', '电暖气片', '空调制热'] },
        { id: 'hv_dehumid', type: 'checkbox', label: '除湿设备？（可多选）', options: ['溶液除湿', '管道除湿', '除湿新风', '独立除湿机', '不需要'] },
        { id: 'hv_fresh', type: 'checkbox', label: '新风设备？（可多选）', options: ['吊顶 · 节能向', '吊顶 · 过滤向', '无管道新风', '窗式新风扇', '被动新风', '不需要'] },
        { id: 'hv_flow', type: 'radio', label: '新风气流组织形式？', options: ['顶送顶回（一进一出）', '顶送顶回（集中回）', '地送顶回', '顶送全正压', '交给设计师'] },
        { id: 'hv_hotwater', type: 'radio', label: '热水即开即热功能是否需求？', options: ['需要', '不需要', '待定'] },
        { id: 'hv_window', type: 'radio', label: '系统门窗需求层级？', options: ['基础款', '中档', '高档（隔热隔音）', '交给设计师'] },
        { id: 'hv_insulate', type: 'checkbox', label: '内保温与声学需求？（可多选）', options: ['增设内保温', '有吸音需求', '有隔音需求', '不需要'] },
        { id: 'hv_water', type: 'checkbox', label: '净水设备？（可多选）', options: ['前置过滤器', '终端直饮机', '中央净水机', '中央软水机', '不需要'] }
      ]
    },
    {
      id: 'smart',
      no: '08',
      title: '智能化 · 影音与照明',
      note: '网络、智能家居、音响、灯光，一次想清楚，后面不后悔。',
      fields: [
        { id: 'sm_net', type: 'radio', label: '网络架构？', options: ['mesh 有线回程', '电力猫', 'AC + AP', '主路由 + 信号放大器', '交给设计师'] },
        { id: 'sm_specialNet', type: 'radio', label: '是否有特殊网络需求？', hint: '例如远程办公、访问外网等（本问卷不涉及具体内容）', options: ['有', '没有'] },
        { id: 'sm_device', type: 'checkbox', label: '需要接入网络的非影音设备？（可多选）', options: ['打印机', 'NAS', '监控安防', '智能门锁', '扫地机器人'], other: true },
        { id: 'sm_proto', type: 'checkbox', label: '智能家居解决方案？（可多选）', options: ['Zigbee 3.0', '蓝牙 mesh', '华为前装 PLC', '暂不计划'] },
        { id: 'sm_curtain', type: 'radio', label: '是否需要电动窗帘？', options: ['需要', '不需要', '部分空间需要'] },
        { id: 'sm_bgm', type: 'radio', label: '是否需要家庭背景音乐？', hint: '通常不建议', options: ['需要', '不需要'] },
        { id: 'sm_avSpeaker', type: 'text', label: '影音场所主要音响设备品牌及型号？', placeholder: '如：Sonos Arc + 低音炮' },
        { id: 'sm_audio', type: 'text', label: '其余听音设备品牌及型号？', placeholder: '如：桌面音箱、耳机' },
        { id: 'sm_projector', type: 'text', label: '是否需要投影？在哪个空间？', placeholder: '如：客厅投影，100 寸幕布' },
        { id: 'sm_tv', type: 'text', label: '是否需要电视？在哪个空间？', placeholder: '如：客厅 85 寸、主卧 55 寸' },
        { id: 'sm_output', type: 'checkbox', label: '影音信号输出设备？（可多选）', options: ['蓝光硬盘播放器', '游戏主机', '手机投屏', 'NAS', '网络机顶盒', '性能主机直连', 'HTPC'] },
        { id: 'sm_light', type: 'radio', label: '照明设计？', hint: '无主灯会呈现明暗相间的视觉感，请知悉', options: ['主灯设计', '无主灯设计', '部分主灯、部分无主灯'] },
        { id: 'sm_temp', type: 'radio', label: '主体色温？', options: ['3000K', '3500K', '4000K', '色温可调（氪金项）'] },
        { id: 'sm_game', type: 'radio', label: '是否需要体感游戏空间？', options: ['需要', '不需要'] }
      ]
    },
    {
      id: 'study',
      no: '09',
      title: '书房',
      note: '开放式书房有助提高家务参与度和家人沟通，但无助于开麦游戏。',
      fields: [
        { id: 'st_open', type: 'radio', label: '是否接受开放式书房？', options: ['接受', '不接受', '待定'] },
        { id: 'st_closed', type: 'radio', label: '是否接受密闭式书房？', hint: '与上一问相反', options: ['接受', '不接受', '待定'] },
        { id: 'st_soundproof', type: 'radio', label: '书房对隔音是否有较高要求？', options: ['是', '否'] },
        { id: 'st_screen', type: 'text', label: '屏幕数量和尺寸？', hint: '有竖屏需告知高度', placeholder: '如：2 台，27 寸 + 24 寸竖屏' },
        { id: 'st_desk', type: 'radio', label: '是否需要电动升降桌？', hint: '很多情况下是伪需求', options: ['需要', '不需要'] },
        { id: 'st_speaker', type: 'radio', label: '是否增加环绕声音箱或书架箱？', options: ['需要', '不需要'] },
        { id: 'st_people', type: 'radio', label: '同时使用书房的人数？', options: ['1 人', '2 人', '3 人及以上', '不确定'] },
        { id: 'st_rgb', type: 'radio', label: '是否需要 RGB 氛围（污染）设计？', options: ['需要', '不需要'] },
        { id: 'st_chair', type: 'text', label: '座椅品牌和型号？', placeholder: '如：Herman Miller Aeron' }
      ]
    },
    {
      id: 'dining',
      no: '10',
      title: '餐厅与家务',
      note: '吃饭、晾晒、洗衣、储物，过日子的事都在这里。',
      fields: [
        { id: 'd_people', type: 'text', label: '常规就餐人数和最大就餐人数？', placeholder: '如：常规 3 人，最多 8 人' },
        { id: 'd_exhaust', type: 'radio', label: '餐厅是否需要增设单向流排气设备？', options: ['需要', '不需要', '待定'] },
        { id: 'd_fan', type: 'radio', label: '是否需要吊扇？', options: ['需要', '不需要'] },
        { id: 'd_tv', type: 'radio', label: '餐桌边是否需要电视？', options: ['需要', '不需要'] },
        { id: 'd_sideboard', type: 'textarea', label: '餐边柜主要收纳哪些物品？', placeholder: '如：酒水、零食、咖啡器具、儿童用品……' },
        { id: 'd_dry', type: 'radio', label: '晾晒形式偏好？', options: ['干衣机 + 室内干燥', '阳光晾晒', '室内干燥为主，偶尔阳光晾晒'] },
        { id: 'd_washers', type: 'text', label: '洗衣机、干衣机数量？', placeholder: '如：洗衣机 1 台、干衣机 1 台' },
        { id: 'd_smallWasher', type: 'checkbox', label: '其他洗衣设备？（可多选）', options: ['台面小洗衣机', '壁挂洗衣机', '衣物护理机', '都不需要'] },
        { id: 'd_iron', type: 'radio', label: '是否需要熨衣板？', options: ['需要', '不需要'] },
        { id: 'd_safe', type: 'textarea', label: '保险箱、应急包、药箱的需求及习惯放置位置？', placeholder: '如：药箱放厨房吊柜，应急包放玄关……' }
      ]
    },
    {
      id: 'cabinetry',
      no: '11',
      title: '全屋定制与收纳',
      note: '补充板块：柜体是全案落地的大头，板材、五金、预算都聊清楚。',
      fields: [
        { id: 'c_space', type: 'checkbox', label: '需要定制的空间？（可多选）', options: ['玄关柜', '电视柜', '餐边柜', '衣柜', '橱柜', '书柜', '榻榻米', '阳台柜', '浴室柜', '护墙板', '隐形门'], other: true },
        { id: 'c_pain', type: 'checkbox', label: '家里的收纳痛点？（可多选）', options: ['鞋多', '衣物多', '杂物多', '包多', '书多', '厨房用品多', '药品多'], other: true },
        { id: 'c_env', type: 'radio', label: '板材环保等级偏好？', options: ['国标 E0', 'ENF 级', '实木', '由设计师推荐'] },
        { id: 'c_material', type: 'radio', label: '板材材质偏好？', options: ['颗粒板', '多层板', '欧松板', '实木', '原木', '由设计师推荐'] },
        { id: 'c_door', type: 'radio', label: '门板工艺偏好？', options: ['平板无把手', '免拉手', '造型吸塑', '模压', '玻璃门', '其他', '由设计师推荐'] },
        { id: 'c_hardware', type: 'text', label: '五金品牌偏好或预算？', placeholder: '如：百隆，预算 8000 左右' },
        { id: 'c_hidden', type: 'checkbox', label: '需要的柜体工艺？（可多选）', options: ['隐形门', '无把手设计', '一门到顶', '悬浮设计', '灯带', '不需要'] },
        { id: 'c_edge', type: 'radio', label: '封边工艺要求？', options: ['激光封边', 'PUR 封边', '普通封边', '不了解'] },
        { id: 'c_budget', type: 'radio', label: '全屋定制预算范围？', options: ['3 万以下', '3–6 万', '6–10 万', '10 万以上', '未定'] }
      ]
    },
    {
      id: 'special',
      no: '12',
      title: 'One More Thing',
      note: '需要功能，但不一定需要一个单一功能空间。',
      fields: [
        { id: 'sp_space', type: 'checkbox', label: '感兴趣的空间或爱好？（可多选）', options: ['酒窖（藏酒 / 品酒区）', '茶室', '儿童游乐', '棋牌', '健身区（有器械 / 无器械）', '舞蹈与瑜伽', '摄影（干燥箱 / 影棚 / 暗室）', '录音（录音室）', '手工空间', '书画空间', '收藏品陈列', '室内泳池', '台球 / 乒乓球 / 壁球', '室内篮球等大球运动', '高压氧舱', '复健运动区', '按摩区', '种植区'] },
        { id: 'sp_detail', type: 'textarea', label: '上述空间的具体想法？', hint: '例如：酒窖需恒温；健身是跑步机还是龙门架；种植大概多少盆……', placeholder: '……' },
        { id: 'sp_pet', type: 'text', label: '宠物数量及品种？', placeholder: '如：1 只猫、1 只柯基' },
        { id: 'sp_extra', type: 'textarea', label: '其他想补充的功能？', placeholder: '……' }
      ]
    },
    {
      id: 'final',
      no: '13',
      title: '家具家电与补充',
      note: '最后一步：旧物、图纸和想说的话。',
      fields: [
        { id: 'fi_move', type: 'textarea', label: '需要搬到新房的家具家电？', hint: '请列出品牌、型号和大致尺寸，照片可后续补充', placeholder: '例如：双门冰箱、实木餐桌 1.6m、布艺沙发……' },
        { id: 'fi_plan', type: 'textarea', label: '户型图 / 设计参考说明？', hint: '本页面不会上传文件，可在后续沟通中提供户型图与参考图', placeholder: '……' },
        { id: 'fi_notes', type: 'textarea', label: '其他想说的话？', hint: '户型痛点、特别想法、任何想说的', placeholder: '……' }
      ]
    }
  ]
};