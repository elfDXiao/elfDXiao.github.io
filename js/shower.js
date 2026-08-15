(function () {
  'use strict';
  const D = window.SHOWER_DATA;
  const UI = {
    zh: {
      langZh:"中文", langJa:"日本語",
      baseStep:"基本规格", baseTitle:"选择型号与尺寸", baseType:"类型", baseSize:"尺寸", baseModel:"本体品番", baseDoor:"门位", baseDrain:"排水方向", basePrice:"基本规格价",
      ref:"原图对照", hideRef:"收起原图",
      jpy:"日元(税抜)", rmb:"大陆地区价格", rate:"当前汇率（1日元=人民币）", rateHint:"请手动输入当日汇率（1日元=人民币）",
      total:"合计", baseSpec:"基本规格价", optionSum:"选项合计", installNote:"大陆地区价格已按当前汇率折算（四舍五入）",
      prev:"← 上一步", next:"下一步 →", finish:"生成报价单",
      quote:"报价单预览", backEdit:"← 返回修改", printPdf:"导出报价 PDF", reset:"重新选择",
      selectOne:"请选择一项", noOption:"（无可选项）", notAvailable:"本型号不可选", included:"基本配置", plus:"加价", minus:"减价",
      customer:"客户信息", customerName:"客户名称", customerPhone:"联系电话", customerNote:"备注",
      quotationTitle:"TOTO 整体淋浴房 · 选型报价单", quotationSub:"Select Shower Room · Quotation", date:"报价日期",
      item:"项目", spec:"规格/选型编号", unitJPY:"日元价(税抜)", unitRMB:"大陆地区价格",
      totalJPY:"日元合计（税抜）", totalRMB:"大陆地区价格合计", rateUsed:"使用汇率", formula:"大陆地区价格已按手动输入汇率折算",
      grade:"等级", color:"颜色", panelChange:"长边墙2块面板",
      floorHeight:"地面加高选项", ventEquip:"通风设备", ventOpening:"开口尺寸", ventWood:"加固木", slide:"滑杆", towel:"毛巾架", elbow:"弯头",
      bar:"辅助扶手", barNone:"不安装", extraOptions:"附加选项", pipe:"杂排水管", pipeNone:"不选择",
      stepNum:"步骤", stepTotal:"本步小计",
      darkNote:"※深色系可能让浴室显得较暗"
    },
    ja: {
      langZh:"中文", langJa:"日本語",
      baseStep:"基本仕様", baseTitle:"タイプ・サイズを選ぶ", baseType:"タイプ", baseSize:"サイズ", baseModel:"本体品番", baseDoor:"ドア位置", baseDrain:"雑排水管の方向", basePrice:"基本仕様価格",
      ref:"原図参照", hideRef:"原図を閉じる",
      jpy:"円(税抜)", rmb:"中国本土価格", rate:"現在の為替（1円=人民元）", rateHint:"当日の為替（1円=人民元）を手入力してください",
      total:"合計", baseSpec:"基本仕様価格", optionSum:"オプション合計", installNote:"中国本土価格は現在の為替で換算済み（四捨五入）",
      prev:"← 戻る", next:"次へ →", finish:"見積書を作成",
      quote:"見積書プレビュー", backEdit:"← 編集に戻る", printPdf:"見積書 PDF 出力", reset:"最初から",
      selectOne:"1つ選択してください", noOption:"（選択肢なし）", notAvailable:"この型では選択不可", included:"基本仕様", plus:"加算", minus:"減算",
      customer:"顧客情報", customerName:"お名前", customerPhone:"電話番号", customerNote:"備考",
      quotationTitle:"TOTO シャワールーム · 選定見積書", quotationSub:"Select Shower Room · Quotation", date:"見積日",
      item:"項目", spec:"仕様/選定記号", unitJPY:"円価格(税抜)", unitRMB:"中国本土価格",
      totalJPY:"円合計（税抜）", totalRMB:"中国本土価格合計", rateUsed:"適用為替", formula:"中国本土価格は手入力為替で換算済み",
      grade:"グレード", color:"カラー", panelChange:"長辺壁2枚パネル",
      floorHeight:"床高さオプション", ventEquip:"換気設備", ventOpening:"開口寸法", ventWood:"補強木", slide:"スライドバー", towel:"タオル掛け", elbow:"エルボ",
      bar:"手すり", barNone:"なし", extraOptions:"追加オプション", pipe:"雑排水管", pipeNone:"選択しない",
      stepNum:"ステップ", stepTotal:"本ステップ小計",
      darkNote:"※濃色は浴室が暗く感じられる場合があります"
    }
  };

  const state = {
    lang: 'zh',
    step: 0,
    type: 'G',
    size: '0816',
    door: 'A',
    drain: 'slab',
    rate: null,
    sel: {}
  };

  function t(k){ return UI[state.lang][k] || k; }
  function n(v){ return v[state.lang]; }
  function jpy(v){ return '¥' + Math.round(v).toLocaleString('ja-JP'); }
  function cny(v){ return '¥' + Math.round(v).toLocaleString('zh-CN'); }

  const $ = (s, el) => (el||document).querySelector(s);

  function init(){
    // 默认尺寸按类型
    state.size = D.types[state.type].sizes[0];
    state.door = D.types[state.type].door;
    applyDefaults();
    bindStatic();
    renderAll();
  }

  function bindStatic(){
    $('#langZh').addEventListener('click', ()=>setLang('zh'));
    $('#langJa').addEventListener('click', ()=>setLang('ja'));
    $('#rate').addEventListener('input', (e)=>{
      const v = parseFloat(e.target.value);
      state.rate = (!isNaN(v) && v > 0) ? v : null; updateSummary();
    });
    $('#btnPrev').addEventListener('click', ()=>{ if(state.step>0){ state.step--; renderAll(); } });
    $('#btnNext').addEventListener('click', ()=>{ if(state.step<steps().length-1){ state.step++; renderAll(); } });
    $('#btnFinish').addEventListener('click', generateQuote);
    $('#btnBack').addEventListener('click', ()=>{ $('#resultSection').hidden=true; $('#wizardView').hidden=false; window.scrollTo({top:0}); });
    $('#btnReset').addEventListener('click', reset);
    $('#btnPrint').addEventListener('click', ()=>window.print());
  }

  function steps(){ return D.steps; }
  function applyDefaults(){
    var t = state.type;
    state.sel = {
      wall: (t==='L') ? 'EVH85' : 'EVAA3',
      panelChange: false,
      floor: 'floorBase',
      floorHeight: false,
      storage: ({G:'ESH4H',X:'ESE4H',T:'ESA51',L:'ESA00'})[t],
      mirror: 'M00',
      faucet: (t==='G') ? 'SBR' : ((t==='X') ? 'SEP' : 'SSGFS'),
      shower: (t==='G'||t==='X') ? 'SRW01' : 'SRG01',
      door: 'D00',
      light: (t==='L') ? 'KSWE1' : 'KSDQ1',
      ventEquip:'V00', ventOpening:'OP00', ventWood:'W00',
      slide: (t==='G') ? null : ((t==='L') ? 'SBA00' : 'SBA31'),
      towel: (t==='G'||t==='X') ? 'KTA21' : 'KTAWH',
      elbow:'E00',
      bars:{}, extras:{}, pipeMaterial:null, pipeDirection:null
    };
  }

  function stepDef(){ return steps()[state.step]; }

  function setLang(l){ state.lang=l; document.documentElement.lang = l==='zh'?'zh-CN':'ja'; renderAll(); }

  function reset(){
    state.step=0; state.type='G'; state.size=D.types.G.sizes[0]; state.door=D.types.G.door; state.drain='slab'; state.rate=D.exchangeRateDefault; state.sel={};
    $('#rate').value = state.rate;
    $('#customerName').value=''; $('#customerPhone').value=''; $('#customerNote').value='';
    $('#resultSection').hidden=true; $('#wizardView').hidden=false;
    renderAll();
  }

  function renderAll(){
    $('#appTitle').textContent = n({zh:'TOTO 整体淋浴房选型', ja:'TOTO シャワールームセレクト'});
    document.title = n({zh:'TOTO 整体淋浴房选型 · elf_D老肖的世界', ja:'TOTO シャワールームセレクト · elf_D老肖の世界'});
    renderBase();
    renderStepsNav();
    renderStep();
    renderSummary();
    updateButtons();
  }

  function renderBase(){
    const cont = $('#basePanel');
    if(!cont) return;
    cont.innerHTML = '';
    const typeWrap = el('div','base-row');
    typeWrap.appendChild(labelEl(t('baseType')));
    for(const tid of Object.keys(D.types)){
      const b = el('button','chip' + (state.type===tid?' on':''));
      b.textContent = n(D.types[tid].name);
      b.onclick = ()=>{ state.type=tid; state.size=D.types[tid].sizes[0]; state.door=D.types[tid].door; applyDefaults(); renderAll(); };
      typeWrap.appendChild(b);
    }
    cont.appendChild(typeWrap);

    const sizeWrap = el('div','base-row');
    sizeWrap.appendChild(labelEl(t('baseSize')));
    for(const s of D.types[state.type].sizes){
      const b = el('button','chip' + (state.size===s?' on':''));
      b.textContent = s;
      b.onclick = ()=>{ state.size=s; applyDefaults(); renderAll(); };
      sizeWrap.appendChild(b);
    }
    cont.appendChild(sizeWrap);

    const model = D.types[state.type].models[state.size];
    const row = el('div','base-meta');
    row.appendChild(labelEl(t('baseModel') + '：' + model.code));
    cont.appendChild(row);

    const doorWrap = el('div','base-row');
    doorWrap.appendChild(labelEl(t('baseDoor')));
    for(const d of ['A','B','C','D']){
      const b = el('button','chip' + (state.door===d?' on':''));
      b.textContent = n(D.doorPositions[d]);
      b.onclick = ()=>{ state.door=d; renderAll(); };
      doorWrap.appendChild(b);
    }
    cont.appendChild(doorWrap);

    const drainWrap = el('div','base-row');
    drainWrap.appendChild(labelEl(t('baseDrain')));
    for(const d of ['slab','through']){
      const b = el('button','chip' + (state.drain===d?' on':''));
      b.textContent = n(D.drains[d]);
      b.onclick = ()=>{ state.drain=d; renderAll(); };
      drainWrap.appendChild(b);
    }
    cont.appendChild(drainWrap);
  }

  function renderStepsNav(){
    const ol = $('#wizardSteps'); ol.innerHTML='';
    // 基本规格 + 每个 step
    const items = steps().map(s=>({id:s.id,no:s.no,title:n(s.title)}));
    items.forEach((it, i)=>{
      const li = el('li');
      const a = el('a','step-link' + (i===state.step?' active':''));
      a.href='#';
      a.innerHTML = '<span class="step-no">'+it.no+'</span><span class="step-name">'+it.title+'</span>';
      a.onclick = (e)=>{ e.preventDefault(); state.step=i; renderAll(); };
      li.appendChild(a); ol.appendChild(li);
    });
  }

  function renderStep(){
    const sd = stepDef();
    $('#stepNo').textContent = sd.no;
    $('#stepTitle').textContent = n(sd.title);
    $('#stepRefImg').src = sd.ref;
    $('#stepRefImg').alt = n(sd.title);
    $('#refBtn').textContent = t('ref');
    $('#stepBody').innerHTML='';
    const body = $('#stepBody');

    if(sd.id==='wall') renderWall(body, sd);
    else if(sd.id==='floor') renderFloor(body, sd);
    else if(sd.id==='vent') renderVent(body, sd);
    else if(sd.id==='extra') renderExtra(body, sd);
    else renderOptions(body, sd, sd.id);
  }

  function renderWall(body, sd){
    const info = el('p','hint'); info.textContent = t('selectOne'); body.appendChild(info);
    sd.grades.forEach(g=>{
      const h = el('h4','grade-title'); h.textContent = n(g.name) + ' · ' + jpyDelta(g.price); body.appendChild(h);
      const grid = el('div','opt-grid');
      g.colors.forEach(c=>{
        const on = state.sel.wall === c.id;
        const card = el('button','opt-card'+(on?' on':''));
        card.innerHTML = '<span class="opt-name">'+n(c.name)+(c.dark?' <em class="dark">'+t('darkNote')+'</em>':'')+'</span>'+
          '<span class="opt-code">'+c.code+'</span>'+
          '<span class="opt-price">'+deltaText(g.price)+'</span>';
        card.onclick = ()=>{ state.sel.wall = c.id; renderAll(); };
        grid.appendChild(card); body.appendChild(grid);
      });
    });
    // panel change
    const pc = sd.panelChange;
    if(priceFor(pc)!=null){
      const lab = el('label','check-row');
      const cb = el('input'); cb.type='checkbox'; cb.checked = !!state.sel.panelChange; cb.onchange=(e)=>{ state.sel.panelChange=e.target.checked; renderAll(); };
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(n(pc.name)+' '+pc.code+' · '+deltaText(pc.price)));
      body.appendChild(lab);
    }
  }

  function renderFloor(body, sd){
    const grid = el('div','opt-grid');
    sd.options.forEach(o=>{
      const on = state.sel.floor === o.id;
      const card = optionCard(o, on, ()=>{ state.sel.floor=o.id; renderAll(); });
      grid.appendChild(card); body.appendChild(grid);
    });
    const ho = sd.heightOption;
    const lab = el('label','check-row');
    const cb = el('input'); cb.type='checkbox'; cb.checked = !!state.sel.floorHeight; cb.onchange=(e)=>{ state.sel.floorHeight=e.target.checked; renderAll(); };
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(n(ho.name)+' '+ho.code+' · '+deltaText(ho.price)));
    body.appendChild(lab);
  }

  function renderVent(body, sd){
    body.appendChild(sectionLabel(t('ventEquip')));
    const g1 = el('div','opt-grid');
    sd.options.forEach(o=>{
      const av = available(o);
      const on = state.sel.ventEquip===o.id;
      const card = optionCard(o, on && av, ()=>{ if(av){ state.sel.ventEquip=o.id; renderAll(); } }, !av);
      g1.appendChild(card); body.appendChild(g1);
    });
    body.appendChild(sectionLabel(t('ventOpening')));
    const g2 = el('div','opt-grid');
    sd.opening.forEach(o=>{
      const av = available(o);
      const on = state.sel.ventOpening===o.id;
      const card = optionCard(o, on && av, ()=>{ if(av){ state.sel.ventOpening=o.id; renderAll(); } }, !av);
      g2.appendChild(card); body.appendChild(g2);
    });
    body.appendChild(sectionLabel(t('ventWood')));
    const g3 = el('div','opt-grid');
    sd.wood.forEach(o=>{
      const on = state.sel.ventWood===o.id;
      const card = optionCard(o, on, ()=>{ state.sel.ventWood=o.id; renderAll(); });
      g3.appendChild(card); body.appendChild(g3);
    });
  }

  function renderExtra(body, sd){
    body.appendChild(sectionLabel(t('bar')));
    const grid = el('div','opt-grid');
    sd.bars.forEach(bar=>{
      const card = el('div','opt-card bar-card'+(state.sel.bars&&state.sel.bars[bar.id]?' on':''));
      card.innerHTML = '<span class="opt-name">'+n(bar.name)+'</span>'+(bar.img?'<img class="opt-img" src="'+bar.img+'" alt="">':'')+'<span class="opt-note">'+(bar.note?n(bar.note):'')+'</span>';
      const sel = el('select'); sel.className='mini-select';
      const none = el('option'); none.value=''; none.textContent=t('barNone'); sel.appendChild(none);
      sd.barColors.forEach(c=>{ const o=el('option'); o.value=c.id; o.textContent=n(c.name)+(c.price===0 ? ' (0)' : ' (' + jpy(bar.price) + ')'); sel.appendChild(o); });
      sel.value = (state.sel.bars&&state.sel.bars[bar.id])||'';
      sel.onchange=(e)=>{ state.sel.bars = state.sel.bars||{}; state.sel.bars[bar.id]=e.target.value||null; renderAll(); };
      card.appendChild(sel); grid.appendChild(card); body.appendChild(grid);
    });
    body.appendChild(sectionLabel(t('extraOptions')));
    const g2 = el('div','opt-grid');
    sd.extras.forEach(o=>{
      const av = (o.id!=='ATA00' || state.drain==='through');
      const on = !!state.sel.extras && state.sel.extras[o.id];
      const card = el('button','opt-card'+(on&&av?' on':'')+(av?'':' disabled'));
      card.innerHTML = '<span class="opt-name">'+n(o.name)+'</span>'+(o.img?'<img class="opt-img" src="'+o.img+'" alt="">':'')+'<span class="opt-code">'+o.code+'</span><span class="opt-price">'+deltaText(o.price)+'</span>';
      card.onclick = ()=>{ if(!av) return; state.sel.extras=state.sel.extras||{}; state.sel.extras[o.id]=!state.sel.extras[o.id]; renderAll(); };
      g2.appendChild(card); body.appendChild(g2);
    });
    body.appendChild(sectionLabel(t('pipe')));
    const pw = el('div','pipe-row');
    const matSel = el('select'); matSel.className='mini-select';
    const none = el('option'); none.value=''; none.textContent=t('pipeNone'); matSel.appendChild(none);
    sd.pipeMaterial.forEach(m=>{ const o=el('option'); o.value=m.id; o.textContent=n(m.name); matSel.appendChild(o); });
    matSel.value = state.sel.pipeMaterial||'';
    matSel.onchange=(e)=>{ state.sel.pipeMaterial=e.target.value||null; if(!state.sel.pipeMaterial) state.sel.pipeDirection=null; renderAll(); };
    pw.appendChild(matSel);
    const dirSel = el('select'); dirSel.className='mini-select';
    dirSel.disabled = !state.sel.pipeMaterial;
    const dn = el('option'); dn.value=''; dn.textContent=t('pipeNone'); dirSel.appendChild(dn);
    sd.pipeDirection.forEach(d=>{ const o=el('option'); o.value=d.id; o.textContent=n(d.name); dirSel.appendChild(o); });
    dirSel.value = state.sel.pipeDirection||'';
    dirSel.onchange=(e)=>{ state.sel.pipeDirection=e.target.value||null; renderAll(); };
    pw.appendChild(dirSel);
    body.appendChild(pw);
  }

  function renderOptions(body, sd, id){
    const info = el('p','hint'); info.textContent = t('selectOne'); body.appendChild(info);
    const grid = el('div','opt-grid');
    sd.options.forEach(o=>{
      const av = available(o);
      const on = state.sel[id] === o.id;
      const card = optionCard(o, on && av, ()=>{ if(av){ state.sel[id]=o.id; renderAll(); } }, !av);
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }

  function optionCard(o, on, onclick, disabled){
    const card = el('button','opt-card'+(on?' on':'')+(disabled?' disabled':''));
    if(o.img) card.innerHTML += '<img class="opt-img" src="'+o.img+'" alt="">';
    card.innerHTML += '<span class="opt-name">'+n(o.name)+'</span>'+
      '<span class="opt-code">'+(o.code||'')+'</span>'+
      '<span class="opt-price">'+deltaText(o.price)+'</span>';
    card.onclick = onclick;
    return card;
  }

  function sectionLabel(txt){
    const h = el('h4','grade-title'); h.textContent = txt; return h;
  }
  function labelEl(txt){ const s=el('span','base-label'); s.textContent=txt; return s; }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

  function priceFor(o){
    if(!o) return null;
    if(typeof o === "number") return o;
    if(o.price){
      if(typeof o.price === "number") return o.price;
      if(state.type in o.price) return o.price[state.type];
      if((state.type==="G"||state.type==="X") && "GX" in o.price) return o.price.GX;
      return null;
    }
    if(state.type in o) return o[state.type];
    if((state.type==="G"||state.type==="X") && "GX" in o) return o.GX;
    return null;
  }
  function available(o){
    const p = priceFor(o);
    if(p===null) return false;
    if(o.sizeNotAllowed && o.sizeNotAllowed.indexOf(state.size)>=0) return false;
    if(o.id==="HDR3F") return hdr3fAllowed();
    if(o.id==="HDP3F") return state.type==="X" && state.size==="0816";
    return true;
  }
  function hdr3fAllowed(){
    return (state.size==='0816' && (state.type==='G'||state.type==='X') || (state.type==='L' && state.size==='0812')) && (state.door==='A'||state.door==='C');
  }
  function deltaText(price){
    const p = priceFor(price);
    if(p===null) return '<span class="muted">'+t('notAvailable')+'</span>';
    if(p===0) return '<span class="ok">'+t('included')+' 0</span>';
    return (p>0?'<span class="plus">'+t('plus')+' '+jpy(p)+'</span>':'<span class="minus">'+t('minus')+' '+jpy(Math.abs(p))+'</span>');
  }
  function jpyDelta(price){
    const p = priceFor(price);
    return p===null? '' : (p===0? '±0' : (p>0?'+':'')+p.toLocaleString('ja-JP'));
  }

  function updateButtons(){
    const total = steps().length;
    $('#btnPrev').disabled = state.step===0;
    $('#btnNext').hidden = state.step>=total-1;
    $('#btnFinish').hidden = state.step<total-1;
    $('#stepCount').textContent = (state.step+1)+' / '+total;
  }

  function renderSummary(){
    $('#sumType').textContent = n(D.types[state.type].name);
    $('#sumSize').textContent = state.size;
    $('#sumModel').textContent = D.types[state.type].models[state.size].code;
    $('#sumDoor').textContent = n(D.doorPositions[state.door]);
    $('#sumDrain').textContent = n(D.drains[state.drain]);
    $('#rate').value = state.rate;
    updateSummary();
  }

  function compute(){
    const base = D.types[state.type].models[state.size].price;
    let opt = 0;
    const items = [];
    // wall
    if(state.sel.wall){
      const color = findColor(state.sel.wall);
      if(color){ const p = priceFor(color.grade.price); if(p!=null) opt += p; items.push({name:n(color.name), code:color.code, price:p}); }
      if(state.sel.panelChange){ const p=priceFor(D.steps[0].panelChange); if(p!=null){ opt+=p; items.push({name:n(D.steps[0].panelChange.name), code:'EBB01', price:p}); } }
    }
    // floor height
    if(state.sel.floorHeight){ const o=D.steps[1].heightOption; const p=priceFor(o); if(p!=null){ opt+=p; items.push({name:n(o.name), code:o.code, price:p}); } }
    // simple single-choice steps
    ['storage','mirror','faucet','shower','door','light','slide','towel','elbow'].forEach(stepId=>{
      const sd = D.steps.find(s=>s.id===stepId);
      const o = sd.options.find(x=>x.id===state.sel[stepId]);
      if(o){ const p=priceFor(o); if(p!=null){ opt+=p; items.push({name:n(o.name), code:o.code, price:p}); } }
    });
    // vent
    const v = D.steps.find(s=>s.id==='vent');
    ['ventEquip','ventOpening','ventWood'].forEach(key=>{
      const o = (key==='ventEquip' ? v.options : (key==='ventOpening' ? v.opening : v.wood)).find(x=>x.id===state.sel[key]);
      if(o){ const p=priceFor(o); if(p!=null){ opt+=p; items.push({name:n(o.name), code:o.code, price:p}); } }
    });
    // extra
    const ex = D.steps.find(s=>s.id==='extra');
    if(state.sel.bars){ ex.bars.forEach(b=>{ const cid=state.sel.bars[b.id]; if(cid){ const c=ex.barColors.find(c=>c.id===cid); const p = c.price===0 ? 0 : b.price; opt+=p; items.push({name:n(b.name)+' · '+n(c.name), code:b.id, price:p}); } }); }
    if(state.sel.extras){ ex.extras.forEach(o=>{ if(state.sel.extras[o.id]){ const p=priceFor(o); if(p!=null){ opt+=p; items.push({name:n(o.name), code:o.code, price:p}); } } }); }
    if(state.sel.pipeMaterial && state.sel.pipeDirection){ const mat=state.sel.pipeMaterial; const dir=ex.pipeDirection.find(d=>d.id===state.sel.pipeDirection); const p=dir?dir.price[mat][state.type]:null; if(p!=null){ opt+=p; items.push({name:n(ex.pipeMaterial.find(m=>m.id===mat).name)+' · '+n(dir.name), code:dir.id, price:p}); } }
    const total = base + opt;
    const rmb = (state.rate && state.rate>0) ? total * state.rate * 0.8 : null;
    return { base, opt, total, rmb, items };
  }

  function findColor(id){
    for(const g of D.steps[0].grades){ const c=g.colors.find(c=>c.id===id); if(c) return Object.assign({grade:g}, c); }
    return null;
  }

  function updateSummary(){
    const c = compute();
    $('#sumBase').textContent = jpy(c.base);
    $('#sumOpt').textContent = jpy(c.opt);
    $('#sumJPY').textContent = jpy(c.total);
    $('#sumRMB').textContent = (c.rmb!=null) ? cny(c.rmb) : '—';
  }

  function generateQuote(){
    const c = compute();
    const doc = $('#quoteDoc'); doc.innerHTML='';
    const header = el('div','doc-header');
    header.innerHTML = '<div class="doc-brand"><span>TOTO · Select Shower Room</span><span>elf_D老肖の世界</span></div>'+
      '<h1>'+t('quotationTitle')+'</h1><p class="doc-sub">'+t('quotationSub')+'</p>'+
      '<div class="doc-meta"><span>'+t('date')+'：'+new Date().toLocaleDateString(state.lang==='zh'?'zh-CN':'ja-JP')+'</span>'+
      '<span>'+t('rateUsed')+'：'+(state.rate&&state.rate>0 ? ('1 JPY = '+state.rate+' CNY') : '—')+'</span></div>';
    doc.appendChild(header);

    // 基本规格
    const sec1 = docSection(t('baseSpec'));
    const rows = [
      [t('baseType'), n(D.types[state.type].name)],
      [t('baseSize'), state.size],
      [t('baseModel'), D.types[state.type].models[state.size].code],
      [t('baseDoor'), n(D.doorPositions[state.door])],
      [t('baseDrain'), n(D.drains[state.drain])],
      [t('basePrice'), jpy(c.base)]
    ];
    rows.forEach(r=>{ const row=el('div','doc-row'); row.innerHTML='<span class="doc-q">'+r[0]+'</span><span class="doc-a">'+r[1]+'</span>'; sec1.appendChild(row); });
    doc.appendChild(sec1);

    // 选项
    const sec2 = docSection(t('item'));
    if(c.items.length===0){ const e=el('p','doc-empty'); e.textContent=t('noOption'); sec2.appendChild(e); }
    else {
      const table = el('table','quote-table');
      table.innerHTML = '<thead><tr><th>'+t('item')+'</th><th>'+t('spec')+'</th><th class="num">'+t('unitJPY')+'</th><th class="num">'+t('unitRMB')+'</th></tr></thead>';
      const tb = el('tbody');
      c.items.forEach(it=>{
        const tr=el('tr');
        const rmb = (state.rate&&state.rate>0) ? Math.round(it.price*state.rate*0.8) : null;
        tr.innerHTML = '<td>'+it.name+'</td><td>'+it.code+'</td><td class="num">'+jpy(it.price)+'</td><td class="num">'+((rmb!=null)?cny(rmb):'—')+'</td>';
        tb.appendChild(tr);
      });
      table.appendChild(tb); sec2.appendChild(table);
    }
    doc.appendChild(sec2);

    // 合计
    const sec3 = docSection(t('total'));
    sec3.innerHTML += '<div class="doc-row"><span class="doc-q">'+t('baseSpec')+'</span><span class="doc-a">'+jpy(c.base)+'</span></div>'+
      '<div class="doc-row"><span class="doc-q">'+t('optionSum')+'</span><span class="doc-a">'+jpy(c.opt)+'</span></div>'+
      '<div class="doc-row big"><span class="doc-q">'+t('totalJPY')+'</span><span class="doc-a">'+jpy(c.total)+'</span></div>'+
      '<div class="doc-row big accent"><span class="doc-q">'+t('totalRMB')+'</span><span class="doc-a">'+((c.rmb!=null)?cny(c.rmb):'—')+'</span></div>'+
      '<p class="doc-formula">'+t('formula')+'</p>';
    doc.appendChild(sec3);

    // 客户信息
    const cname=$('#customerName').value, cphone=$('#customerPhone').value, cnote=$('#customerNote').value;
    if(cname||cphone||cnote){
      const sec4 = docSection(t('customer'));
      if(cname) sec4.appendChild(customerRow(t('customerName'), cname));
      if(cphone) sec4.appendChild(customerRow(t('customerPhone'), cphone));
      if(cnote) sec4.appendChild(customerRow(t('customerNote'), cnote));
      doc.appendChild(sec4);
    }

    const footer = el('div','doc-footer');
    footer.innerHTML = '<p>TOTO Select Shower Room</p><p>'+t('installNote')+'</p>';
    doc.appendChild(footer);

    $('#wizardView').hidden = true;
    $('#resultSection').hidden = false;
    window.scrollTo({top:0});
  }

  function docSection(txt){ const s=el('div','doc-section'); const h=el('div','doc-sec-title'); h.innerHTML='<span>·</span>'+txt; s.appendChild(h); return s; }
  function customerRow(q,a){ const r=el('div','doc-row'); r.innerHTML='<span class="doc-q">'+q+'</span><span class="doc-a">'+a+'</span>'; return r; }

  // 折叠原图
  document.addEventListener('DOMContentLoaded', function(){
    const refBox=$('#refBox');
    const btn=$('#refBtn');
    if(btn){ btn.addEventListener('click', function(){ refBox.classList.toggle('open'); btn.textContent = refBox.classList.contains('open') ? t('hideRef') : t('ref'); }); }
    init();
  });
})();
