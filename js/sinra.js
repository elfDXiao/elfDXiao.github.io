(function(){
  'use strict';
  const D = window.SINRA_DATA;
  const UI = {
    zh:{ appTitle:"TOTO シンラ 整体浴室选型", rate:"当日汇率（1日元=人民币）", rateHint:"请手动输入当日汇率", base:"基本规格价", total:"合计", rmb:"大陆地区价格", totalJPY:"日元合计（税抜）", totalRMB:"大陆地区价格合计", type:"类型", size:"尺寸", ref:"原图对照", hideRef:"收起原图", note:"本步骤的详细选项与价格正在整理中；请先对照上方原图进行确认。", prev:"← 上一步", next:"下一步 →", finish:"生成报价单", back:"← 返回修改", print:"导出报价 PDF", reset:"重新选择", quotationTitle:"TOTO シンラ 整体浴室 · 选型报价单", date:"报价日期", customer:"客户信息", name:"客户名称", phone:"联系电话", note2:"备注", formula:"大陆地区价格已按手动输入汇率折算（四舍五入）", step:"步骤" },
    ja:{ appTitle:"TOTO シンラ システムバスルーム選定", rate:"当日の為替（1円=人民元）", rateHint:"当日の為替を手入力してください", base:"基本仕様価格", total:"合計", rmb:"中国本土価格", totalJPY:"円合計（税抜）", totalRMB:"中国本土価格合計", type:"タイプ", size:"サイズ", ref:"原図参照", hideRef:"原図を閉じる", note:"本ステップの詳細オプションと価格は整理中です。上記原図をご確認ください。", prev:"← 戻る", next:"次へ →", finish:"見積書を作成", back:"← 編集に戻る", print:"見積書 PDF 出力", reset:"最初から", quotationTitle:"TOTO シンラ システムバスルーム · 選定見積書", date:"見積日", customer:"顧客情報", name:"お名前", phone:"電話番号", note2:"備考", formula:"中国本土価格は手入力為替で換算済み（四捨五入）", step:"ステップ" }
  };
  const state = { lang:'zh', step:0, type:'G', size:'1624', rate:null };
  function t(k){ return UI[state.lang][k]||k; }
  function n(v){ return v[state.lang]; }
  function jpy(v){ return '¥'+Math.round(v).toLocaleString('ja-JP'); }
  function cny(v){ return '¥'+Math.round(v).toLocaleString('zh-CN'); }
  function $(s){ return document.querySelector(s); }
  function el(tag,cls){ const e=document.createElement(tag); if(cls)e.className=cls; return e; }

  function init(){
    state.size = firstAvailableSize(state.type);
    bind();
    renderAll();
  }
  function firstAvailableSize(type){
    const keys=D.sizeOrder;
    for(const s of keys){ if(D.basePrices[s][type]!=null) return s; }
    return keys[0];
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
  function reset(){ state.step=0; state.type='G'; state.size=firstAvailableSize('G'); state.rate=null; $('#rate').value=''; $('#customerName').value=''; $('#customerPhone').value=''; $('#customerNote').value=''; $('#resultSection').hidden=true; $('#wizardView').hidden=false; renderAll(); }

  function renderAll(){
    $('#appTitle').textContent=t('appTitle');
    document.title=t('appTitle')+' · elf_D老肖的世界';
    renderNav();
    renderStep();
    renderSummary();
    updateButtons();
  }
  function renderNav(){
    const ol=$('#wizardSteps'); ol.innerHTML='';
    D.steps.forEach((s,i)=>{
      const li=el('li'); const a=el('a','step-link'+(i===state.step?' active':''));
      a.href='#'; a.innerHTML='<span class="step-no">'+s.no+'</span><span class="step-name">'+n(s.title)+'</span>';
      a.onclick=e=>{e.preventDefault(); state.step=i; renderAll();};
      li.appendChild(a); ol.appendChild(li);
    });
  }
  function renderStep(){
    const s=D.steps[state.step];
    $('#stepNo').textContent=s.no;
    $('#stepTitle').textContent=n(s.title);
    $('#stepBody').innerHTML='';
    const body=$('#stepBody');
    if(s.id==='type'){
      const tw=el('div','base-row'); tw.appendChild(label(t('type')));
      Object.keys(D.types).forEach(tid=>{
        const b=el('button','chip'+(state.type===tid?' on':''));
        b.textContent=n(D.types[tid].name);
        b.onclick=()=>{ state.type=tid; if(D.basePrices[state.size][tid]==null) state.size=firstAvailableSize(tid); renderAll(); };
        tw.appendChild(b);
      });
      body.appendChild(tw);
      const sw=el('div','base-row'); sw.appendChild(label(t('size')));
      D.sizeOrder.forEach(sid=>{
        const price=D.basePrices[sid][state.type];
        const b=el('button','chip'+(state.size===sid?' on':'')+(price==null?' off':''));
        b.textContent=n(D.sizes[sid]);
        b.disabled = price==null;
        b.onclick=()=>{ state.size=sid; renderAll(); };
        sw.appendChild(b);
      });
      body.appendChild(sw);
    } else {
      const note=el('p','hint'); note.textContent=t('note'); body.appendChild(note);
    }
    // 原图
    const refs=$('#refPages'); refs.innerHTML='';
    s.pages.forEach(src=>{ const img=el('img'); img.src=src; img.alt=n(s.title); refs.appendChild(img); });
  }
  function label(txt){ const s=el('span','base-label'); s.textContent=txt; return s; }

  function renderSummary(){
    $('#sumType').textContent = n(D.types[state.type].name);
    $('#sumSize').textContent=n(D.sizes[state.size]);
    $('#sumBase').textContent=jpy(D.basePrices[state.size][state.type]);
    updateSummary();
  }
  function updateSummary(){
    const base=D.basePrices[state.size][state.type];
    const total=base;
    const rmb=(state.rate&&state.rate>0)? total*state.rate*0.8 : null;
    $('#sumJPY').textContent=jpy(total);
    $('#sumRMB').textContent=rmb!=null?cny(rmb):'—';
  }
  function updateButtons(){
    $('#btnPrev').disabled=state.step===0;
    $('#btnNext').hidden=state.step>=D.steps.length-1;
    $('#btnFinish').hidden=state.step<D.steps.length-1;
    $('#stepCount').textContent=(state.step+1)+' / '+D.steps.length;
  }

  function generateQuote(){
    const base=D.basePrices[state.size][state.type];
    const total=base;
    const rmb=(state.rate&&state.rate>0)? total*state.rate*0.8 : null;
    const doc=$('#quoteDoc'); doc.innerHTML='';
    const header=el('div','doc-header');
    header.innerHTML='<div class="doc-brand"><span>TOTO · シンラ</span><span>elf_D老肖の世界</span></div><h1>'+t('quotationTitle')+'</h1><div class="doc-meta"><span>'+t('date')+'：'+new Date().toLocaleDateString(state.lang==='zh'?'zh-CN':'ja-JP')+'</span><span>'+t('rate')+'：'+(state.rate&&state.rate>0?('1 JPY = '+state.rate+' CNY'):'—')+'</span></div>';
    doc.appendChild(header);
    const sec1=docSection(t('base'));
    [
      [t('type'), n(D.types[state.type])],
      [t('size'), n(D.sizes[state.size])],
      [t('base'), jpy(base)]
    ].forEach(r=>{ const row=el('div','doc-row'); row.innerHTML='<span class="doc-q">'+r[0]+'</span><span class="doc-a">'+r[1]+'</span>'; sec1.appendChild(row); });
    doc.appendChild(sec1);
    const sec2=docSection(t('total'));
    sec2.innerHTML+='<div class="doc-row"><span class="doc-q">'+t('totalJPY')+'</span><span class="doc-a">'+jpy(total)+'</span></div><div class="doc-row big accent"><span class="doc-q">'+t('totalRMB')+'</span><span class="doc-a">'+(rmb!=null?cny(rmb):'—')+'</span></div><p class="doc-formula">'+t('formula')+'</p>';
    doc.appendChild(sec2);
    const cname=$('#customerName').value, cphone=$('#customerPhone').value, cnote=$('#customerNote').value;
    if(cname||cphone||cnote){ const sec3=docSection(t('customer')); if(cname)sec3.appendChild(crow(t('name'),cname)); if(cphone)sec3.appendChild(crow(t('phone'),cphone)); if(cnote)sec3.appendChild(crow(t('note2'),cnote)); doc.appendChild(sec3); }
    const footer=el('div','doc-footer'); footer.innerHTML='<p>TOTO シンラ</p><p>'+t('formula')+'</p>'; doc.appendChild(footer);
    $('#wizardView').hidden=true; $('#resultSection').hidden=false; window.scrollTo({top:0});
  }
  function docSection(txt){ const s=el('div','doc-section'); const h=el('div','doc-sec-title'); h.innerHTML='<span>·</span>'+txt; s.appendChild(h); return s; }
  function crow(q,a){ const r=el('div','doc-row'); r.innerHTML='<span class="doc-q">'+q+'</span><span class="doc-a">'+a+'</span>'; return r; }

  document.addEventListener('DOMContentLoaded', init);
})();
