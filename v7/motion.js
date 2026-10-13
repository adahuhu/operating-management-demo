/* One motion controller for the home page and every dynamically rendered view. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const kinds=[
    ['pie','.pie,.view-pie'],
    ['line','.spark polyline,.daily-chart .daily-line,.profit-chart .chart-plan,.profit-chart .chart-actual,.profit-chart .chart-forecast,.view-line-chart .series'],
    ['bar','.rail > i,.v5-track > i,.view-goal-rail > i,.depth-bar-rail > i,.goods-stock-total > i,.goods-profit-bar,.view-age > span,.v6-compare-track > i,.goal-break-track > i'],
    ['column','.v6-order-rail > i'],
    ['map','.asset-map,.v5-revenue-map svg'],
    ['graphic','.depth-scatter-dot,.depth-heat-cell,.depth-waterfall,.v5-days,.agebar']
  ];
  const selector=kinds.map(([,value])=>value).join(',');
  const registered=new WeakSet();
  const kindOf=element=>kinds.find(([,value])=>element.matches(value))?.[0];
  const options=(duration,delay=0)=>({duration,delay,easing:'cubic-bezier(.2,.72,.2,1)'});

  function play(element) {
    if(reduced.matches||!element.isConnected||element.closest('[hidden]'))return;
    const kind=kindOf(element);
    element.getAnimations().filter(animation=>animation.id==='chart-motion').forEach(animation=>animation.cancel());
    let animation;
    if(kind==='pie'){
      animation=element.animate([
        {clipPath:'circle(0% at 50% 50%)',opacity:.55,transform:'scale(.88)'},
        {clipPath:'circle(72% at 50% 50%)',opacity:1,transform:'scale(1)'}
      ],options(850));
    }else if(kind==='bar'){
      animation=element.animate([{transform:'scaleX(0)',opacity:.55},{transform:'scaleX(1)',opacity:1}],options(740));
    }else if(kind==='column'){
      animation=element.animate([{transform:'scaleY(0)',transformOrigin:'bottom',opacity:.55},{transform:'scaleY(1)',transformOrigin:'bottom',opacity:1}],options(740));
    }else if(kind==='line'&&typeof element.getTotalLength==='function'){
      const length=element.getTotalLength();
      if(!length)return;
      const oldDash=element.style.strokeDasharray;
      element.style.strokeDasharray=String(length);
      animation=element.animate([
        {strokeDashoffset:String(length),opacity:.4},
        {strokeDashoffset:'0',opacity:1}
      ],options(1050));
      const restore=()=>{element.style.strokeDasharray=oldDash;};
      animation.addEventListener('finish',restore,{once:true});
      animation.addEventListener('cancel',restore,{once:true});
    }else if(kind==='map'){
      animation=element.animate([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],options(880));
    }else if(kind==='graphic'){
      animation=element.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],options(720));
    }
    if(animation)animation.id='chart-motion';
  }

  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);
      play(entry.target);
    });
  },{threshold:.1,rootMargin:'0px 0px 35px 0px'}):null;

  function register(element) {
    if(registered.has(element)||reduced.matches)return;
    registered.add(element);
    if(observer)observer.observe(element);else play(element);
  }
  function scan(root=document) {
    if(!root)return;
    if(root.nodeType===1&&root.matches(selector))register(root);
    root.querySelectorAll?.(selector).forEach(register);
  }
  function replay(element) {if(element)play(element);}
  function replayWithin(root) {
    if(!root)return;
    if(root.matches?.(selector))play(root);
    root.querySelectorAll?.(selector).forEach(play);
  }
  window.chartMotion={scan,replay,replayWithin};

  function start() {
    scan(document);
    const mutations=new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node);}));
    });
    mutations.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  reduced.addEventListener?.('change',()=>{if(!reduced.matches)scan(document);});
})();
