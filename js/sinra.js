(function(){
  'use strict';
  const D = window.SINRA_DATA;
  const SEC = window.SINRA_SECTIONS || {};
  const UI = {
    zh:{ appTitle:"TOTO シンラ 整体浴室选型", rate:"当日汇率（1日元=人民币）", rateHint:"请手动输入当日汇率", base:"基本规格价", total:"合计", rmb:"大陆地区价格", totalJPY:"日元合计（税抜）", totalRMB:"大陆地区价格合计", type:"类型", size:"尺寸", ref:"原图对照", hideRef:"收起原图", note:"本步骤的详细选项正在整理中，请先对照上方原图。", prev:"← 上一步", next:"下一步 →", finish:"生成报价单", back:"← 返回修改", print:"导出报价 PDF", reset:"重新选择", quotationTitle:"TOTO シンラ 整体浴室 · 选型报价单", date:"报价日期", customer:"客户信息", name:"客户名称", phone:"联系电话", note2:"备注", formula:"大陆地区价格已按手动输入汇率折算（四舍五入）", standard:"标配", optional:"选配", unavailable:"本型号不可选" },
    ja:{ appTitle:"TOTO シンラ システムバスルーム選定", rate:"当日の為替（1円=人民元）", rateHint:"当日の為替を手入力してください", base:"基本仕様価格", total:"合計", rmb:"中国本土価格", totalJPY:"円合計（税抜）", totalRMB:"中国本土価格合計", type:"タイプ", size:"サイズ", ref:"原図参照", hideRef:"原図を閉じる", note:"本ステップは整理中です。上記原図をご確認ください。", prev:"← 戻る", next:"次へ →", finish:"見積書を作成", back:"← 編集に戻る", print:"見積書 PDF 出力", reset:"最初から", quotationTitle:"TOTO シンラ システムバスルーム · 選定見積書", date:"見積日", customer:"顧客情報", name:"お名前", phone:"電話番号", note2:"備考", formula:"中国本土価格は手入力為替で換算済み（四捨五入）", standard:"基本仕様", optional:"オプション", unavailable:"この型では選択不可" }
  };
  const STEP_MAP = {
    1:{section:'wall', groups:null, wall:true},
    2:{section:'tub', groups:['tub']},
    3:{section:'tub', groups:['counter']},
    4:{section:'tub', groups:['floor']},
    5:null,
    6:{section:'light_vent', groups:['light']},
    7:{section:'light_vent', groups:['vent']},
    8:null,
    9:{section:'faucet', groups:['faucet','shower','towel','slide']},
    10:{section:'mirror', groups:['mirror']},
    11:{section:'mirror', groups:['ceiling']},
    12:{section:'mirror', groups:['storage']},
    13:{section:'door', groups:['door','door_position','pocket']},
    14:null
  };
  const state = { lang:'zh', step:0, type:'G', size:'1624', rate:null, sel:{} };
  function t(k){ return UI[state.lang][k]||k; }
  function n(v){ return v && v[state.lang]; }
  function jpy(v){ return '¥'+Math.round(v).toLocaleString('ja-JP'); }
  function cny(v){ return '¥'+Math.round(v).toLocaleString('zh-CN'); }
  function $(s){ return document.querySelector(s); }
  function el(tag,cls){ const e=document.createElement(tag); if(cls)e.className=cls; return e; }

  function firstAvailableSize(type){ for(const s of D.sizeOrder){ if(D.basePrices[s][type]!=null) return s; } return D.sizeOrder[0]; }
  function imgPath(section, img){
    if(!img) return null;
    if(/^assets\//.test(img)) return img;
    return 'assets/sinra/'+section+'/'+img;
  }
  // 标配类型判定：从 note 中识别类型字母（如 G/B、R/D/C、Gタイプ）
  function standardTypes(opt){
    const txt = (opt.note && (opt.note.zh||opt.note.ja)) || '';
    const map = { G:/G(?=[\/・、,\s]|タイプ|类型|$)/, B:/B(?=[\/・、,\s]|タイプ|类型|$)/, R:/R(?=[\/・、,\s]|タイプ|类型|$)/, D:/D(?=[\/・、,\s]|タイプ|类型|$)/, C:/C(?=[\/・、,\s]|タイプ|类型|$)/ };
    const out = {};
    for(const k in map){ out[k] = map[k].test(txt); }
    return out;
  }
  function priceFor(opt, type){
    if(!opt) return null;
    if(opt.prices){
      const v = opt.prices[type];
      if(typeof v === 'number') return v;
    }
    if(opt.code === '基本仕様'){
      const st = standardTypes(opt);
      if(st[type]) return 0;
      // 无任何类型标注时，视为全类型标配
      if(!st.G && !st.B && !st.R && !st.D && !st.C) return 0;
      return null;
    }
    return null;
  }
  function available(opt, type){ return priceFor(opt,type) !== null; }

  function init(){
    state.size = firstAvailableSize(state.type);
    bind();
    renderAll();
  }
  function bind(){
    $('#langZh').addEventListener('click',()=>setLang('zh'));
    $('#langJa').addEventListener('click',()=>setLang('ja'));
    $('#rate').addEventListener('input',e=>{ const v=parseFloat(e.target.value); state.rate=(!isNaN(v)&&v>0)?v:null; updateSummary(); });
    $('#btnPrev').addEventListener('click',()=>{ if(state.step>0){state.step--; renderAll();} });
    $('#btnNext').addEventListener('click',()=>{ if(state.step<D.steps.length-1){state.step++; renderAll();} });
    $('#btnFinish').addEventListener('click',generateQuote);
    $('#btnBack').addEventListener('click',()=>{ $('#resultSection').hidden=true; $('#wizardView').hidden=false; });
    $('#btnReset').addEventListener('click',reset);
    $('#btnPrint').addEventListener('click',()=>window.print());
    $('#refBtn').addEventListener('click',()=>{ const b=$('#refBox'); b.classList.toggle('open'); $('#refBtn').textContent=b.classList.contains('open')?t('hideRef'):t('ref'); });
  }
  function setLang(l){ state.lang=l; document.documentElement.lang=l==='zh'?'zh-CN':'ja'; renderAll(); }
  function reset(){ state.step=0; state.type='G'; state.size=firstAvailableSize('G'); state.rate=null; state.sel={}; $('#rate').value=''; $('#customerName').value=''; $('#customerPhone').value=''; $('#customerNote').value=''; $('#resultSection').hidden=true; $('#wizardView').hidden=false; renderAll(); }

  function renderAll(){
    $('#appTitle').textContent=t('appTitle');
    document.title=t('appTitle')+' · elf_D老肖的世界';
    renderNav(); renderStep(); renderSummary(); updateButtons();
  }
  function renderNav(){
    const ol=$('#wizardSteps'); ol.innerHTML='';
    D.steps.forEach((s,i)=>{ const li=el('li'); const a=el('a','step-link'+(i===state.step?' active':'')); a.href='#'; a.innerHTML='<span class="step-no">'+s.no+'</span><span class="step-name">'+n(s.title)+'</span>'; a.onclick=e=>{e.preventDefault(); state.step=i; renderAll();}; li.appendChild(a); ol.appendChild(li); });
  }
  function renderStep(){
    const s=D.steps[state.step];
    $('#stepNo').textContent=s.no;
    $('#stepTitle').textContent=n(s.title);
    const body=$('#stepBody'); body.innerHTML='';
    const refs=$('#refPages'); refs.innerHTML='';
    s.pages.forEach(src=>{ const im=el('img'); im.src=src; im.alt=n(s.title); refs.appendChild(im); });

    if(state.step===0){ renderBase(body); return; }
    const map = STEP_MAP[state.step];
    if(!map){ const note=el('p','hint'); note.textContent=t('note'); body.appendChild(note); return; }
    if(map.wall){ renderWall(body); return; }
    const section = SEC[map.section]; if(!section){ const note=el('p','hint'); note.textContent=t('note'); body.appendChild(note); return; }
    map.groups.forEach(gid=>{
      const group = (section.groups||[]).find(g=>g.id===gid); if(!group) return;
      const h=el('h4','grade-title'); h.textContent=n(group.title); body.appendChild(h);
      const grid=el('div','opt-grid');
      group.options.forEach(o=>{ grid.appendChild(optionCard(map.section, o, map.section+'.'+gid)); });
      body.appendChild(grid);
    });
  }
  function renderBase(body){
    const tw=el('div','base-row'); tw.appendChild(label(t('type')));
    Object.keys(D.types).forEach(tid=>{ const b=el('button','chip'+(state.type===tid?' on':'')); b.textContent=n(D.types[tid].name); b.onclick=()=>{ state.type=tid; if(D.basePrices[state.size][tid]==null) state.size=firstAvailableSize(tid); state.sel={}; renderAll(); }; tw.appendChild(b); });
    body.appendChild(tw);
    const sw=el('div','base-row'); sw.appendChild(label(t('size')));
    D.sizeOrder.forEach(sid=>{ const price=D.basePrices[sid][state.type]; const b=el('button','chip'+(state.size===sid?' on':'')+(price==null?' off':'')); b.textContent=n(D.sizes[sid]); b.disabled=price==null; b.onclick=()=>{ state.size=sid; renderAll(); }; sw.appendChild(b); });
    body.appendChild(sw);
  }
  function renderWall(body){
    const w = SEC.wall; if(!w) return;
    const key='wall';
    const grid=el('div','opt-grid');
    (w.options||[]).forEach(o=>{
      const card=el('button','opt-card'+(state.sel[key]===o.id?' on':'')+((!available(o,state.type))?' disabled':''));
      card.innerHTML = '<span class="opt-name">'+n(o.name)+'</span><span class="opt-code">'+(o.code||'')+'</span><span class="opt-price">'+deltaText(o)+'</span>';
      card.onclick=()=>{ if(available(o,state.type)){ state.sel[key]=o.id; renderAll(); } };
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const note=el('p','hint'); note.textContent='组合照片正在生成中：请先对照上方原图。'; body.appendChild(note);
  }
  function optionCard(section, o, key){
    const av = available(o, state.type);
    const on = state.sel[key]===o.id;
    const card=el('button','opt-card'+(on?' on':'')+(av?'':' disabled'));
    const ip=imgPath(section,o.img);
    if(ip) card.innerHTML+='<img class="opt-img" src="'+ip+'" alt="">';
    card.innerHTML+='<span class="opt-name">'+n(o.name)+'</span><span class="opt-code">'+(o.code||'')+'</span><span class="opt-price">'+deltaText(o)+'</span>';
    if(o.note && (o.note.zh||o.note.ja)) card.innerHTML+='<span class="opt-note">'+n(o.note)+'</span>';
    card.onclick=()=>{ if(av){ state.sel[key]=o.id; renderAll(); } };
    return card;
  }
  function deltaText(o){
    const p=priceFor(o,state.type);
    if(p===null) return '<span class="muted">'+t('unavailable')+'</span>';
    if(p===0) return '<span class="ok">'+t('standard')+' 0</span>';
    return (p>0?'<span class="plus">'+t('optional')+' +'+jpy(p)+'</span>':'<span class="minus">'+t('optional')+' '+jpy(p)+'</span>');
  }
  function label(txt){ const s=el('span','base-label'); s.textContent=txt; return s; }

  function renderSummary(){
    $('#sumType').textContent=n(D.types[state.type].name);
    $('#sumSize').textContent=n(D.sizes[state.size]);
    $('#sumBase').textContent=jpy(D.basePrices[state.size][state.type]);
    updateSummary();
  }
  function compute(){
    const base=D.basePrices[state.size][state.type]; let opt=0; const items=[];
    Object.keys(state.sel).forEach(key=>{
      const parts=key.split('.'); const sid=parts[0]; const gid=parts.slice(1).join('.');
      const section=SEC[sid]; if(!section) return;
      let o=null;
      if(sid==='wall'){ o=(section.options||[]).find(x=>x.id===state.sel[key]); }
      else { const g=(section.groups||[]).find(g=>g.id===gid); o=g?g.options.find(x=>x.id===state.sel[key]):null; }
      if(o){ const p=priceFor(o,state.type); if(p!=null && p!==0){ opt+=p; items.push({name:n(o.name), code:o.code||'', price:p}); } }
    });
    const total=base+opt;
    const rmb=(state.rate&&state.rate>0)? total*state.rate*0.8 : null;
    return {base,opt,total,rmb,items};
  }
  function updateSummary(){
    const c=compute();
    $('#sumJPY').textContent=jpy(c.total);
    $('#sumRMB').textContent=(c.rmb!=null)?cny(c.rmb):'—';
  }
  function updateButtons(){
    $('#btnPrev').disabled=state.step===0;
    $('#btnNext').hidden=state.step>=D.steps.length-1;
    $('#btnFinish').hidden=state.step<D.steps.length-1;
    $('#stepCount').textContent=(state.step+1)+' / '+D.steps.length;
  }
  function generateQuote(){
    const c=compute();
    const doc=$('#quoteDoc'); doc.innerHTML='';
    const header=el('div','doc-header');
    header.innerHTML='<div class="doc-brand"><span>TOTO · シンラ</span><span>elf_D老肖の世界</span></div><h1>'+t('quotationTitle')+'</h1><div class="doc-meta"><span>'+t('date')+'：'+new Date().toLocaleDateString(state.lang==='zh'?'zh-CN':'ja-JP')+'</span><span>'+t('rate')+'：'+(state.rate&&state.rate>0?('1 JPY = '+state.rate+' CNY'):'—')+'</span></div>';
    doc.appendChild(header);
    const sec1=docSection(t('base'));
    [[t('type'),n(D.types[state.type].name)],[t('size'),n(D.sizes[state.size])],[t('base'),jpy(c.base)]].forEach(r=>{ const row=el('div','doc-row'); row.innerHTML='<span class="doc-q">'+r[0]+'</span><span class="doc-a">'+r[1]+'</span>'; sec1.appendChild(row); });
    doc.appendChild(sec1);
    const sec2=docSection(t('total'));
    sec2.innerHTML+='<div class="doc-row"><span class="doc-q">'+t('base')+'</span><span class="doc-a">'+jpy(c.base)+'</span></div><div class="doc-row"><span class="doc-q">'+t('optional')+'</span><span class="doc-a">'+jpy(c.opt)+'</span></div><div class="doc-row big"><span class="doc-q">'+t('totalJPY')+'</span><span class="doc-a">'+jpy(c.total)+'</span></div><div class="doc-row big accent"><span class="doc-q">'+t('totalRMB')+'</span><span class="doc-a">'+(c.rmb!=null?cny(c.rmb):'—')+'</span></div><p class="doc-formula">'+t('formula')+'</p>';
    doc.appendChild(sec2);
    if(c.items.length){ const sec3=docSection(t('optional')); c.items.forEach(it=>{ const r=el('div','doc-row'); r.innerHTML='<span class="doc-q">'+it.name+' · '+it.code+'</span><span class="doc-a">'+jpy(it.price)+'</span>'; sec3.appendChild(r); }); doc.appendChild(sec3); }
    const cname=$('#customerName').value, cphone=$('#customerPhone').value, cnote=$('#customerNote').value;
    if(cname||cphone||cnote){ const sec4=docSection(t('customer')); if(cname)sec4.appendChild(crow(t('name'),cname)); if(cphone)sec4.appendChild(crow(t('phone'),cphone)); if(cnote)sec4.appendChild(crow(t('note2'),cnote)); doc.appendChild(sec4); }
    const footer=el('div','doc-footer'); footer.innerHTML='<p>TOTO シンラ</p><p>'+t('formula')+'</p>'; doc.appendChild(footer);
    $('#wizardView').hidden=true; $('#resultSection').hidden=false; window.scrollTo({top:0});
  }
  function docSection(txt){ const s=el('div','doc-section'); const h=el('div','doc-sec-title'); h.innerHTML='<span>·</span>'+txt; s.appendChild(h); return s; }
  function crow(q,a){ const r=el('div','doc-row'); r.innerHTML='<span class="doc-q">'+q+'</span><span class="doc-a">'+a+'</span>'; return r; }

  document.addEventListener('DOMContentLoaded', init);
})();
