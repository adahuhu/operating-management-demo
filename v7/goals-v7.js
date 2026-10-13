'use strict';

// Target planning is a local demo draft. Confirmed V1 remains the report baseline.
const GOAL_DRAFT_KEY = 'operating-demo-goals-v7-draft';
const GOAL_SCOPE = {
  company:{label:'公司',parent:null,children:['teamA','teamB','teamC']},
  teamA:{label:'品线 A 团队',parent:'company',children:['storeA','storeB','storeC']},
  teamB:{label:'品线 B 团队',parent:'company',children:['storeD']},
  teamC:{label:'品线 C 团队',parent:'company',children:['storeE']},
  storeA:{label:'店铺 A · 品线 A',parent:'teamA',children:[]},
  storeB:{label:'店铺 B · 品线 A',parent:'teamA',children:[]},
  storeC:{label:'店铺 C · 品线 A',parent:'teamA',children:[]},
  storeD:{label:'店铺 D · 品线 B',parent:'teamB',children:[]},
  storeE:{label:'店铺 E · 品线 C',parent:'teamC',children:[]}
};
const GOAL_TREE = ['company','teamA','storeA','storeB','storeC','teamB','storeD','teamC','storeE'];
const GOAL_METRICS = {
  profit:{name:'利润',kind:'result',targetLabel:'目标',actualLabel:'累计实际',gapLabel:'预计差额',group:'core',analysis:'profit'},
  ads:{name:'广告费',kind:'limit',targetLabel:'预算',actualLabel:'已使用',gapLabel:'预计超额',group:'core',analysis:'cost'},
  tail:{name:'尾程费',kind:'limit',targetLabel:'预算',actualLabel:'已发生',gapLabel:'预计超额',group:'core',analysis:'cost'},
  stock:{name:'库存占资',kind:'limit',targetLabel:'阶段上限',actualLabel:'当前占资',gapLabel:'月末超额',group:'core',analysis:'goods'},
  revenue:{name:'收入',kind:'result',targetLabel:'目标',actualLabel:'累计实际',gapLabel:'预计差额',group:'results',analysis:'revenue'},
  gross:{name:'毛利',kind:'result',targetLabel:'目标',actualLabel:'累计实际',gapLabel:'预计差额',group:'results',analysis:'profit'},
  cash:{name:'现金回款',kind:'result',targetLabel:'目标',actualLabel:'累计实际',gapLabel:'预计差额',group:'results',analysis:'revenue'},
  procurement:{name:'采购成本',kind:'limit',targetLabel:'参考线',actualLabel:'已发生',gapLabel:'预计超额',group:'results',analysis:'cost'}
};
const GOAL_BASE = {
  company:{profit:[180,85,90,160],ads:[60,32,30,64],tail:[40,18,20,42],stock:[480,510,480,430],revenue:[1200,650,630,1220],gross:[430,220,230,420],cash:[260,120,115,265],procurement:[770,430,420,800]},
  teamA:{profit:[100,40,50,80],ads:[30,18,17,32],tail:[20,9,10,21],stock:[270,300,270,250],revenue:[700,370,360,710],gross:[250,125,135,240],cash:[145,70,65,150],procurement:[450,260,250,470]},
  teamB:{profit:[45,25,22,45],ads:[16,9,8,18],tail:[12,6,6,12],stock:[120,110,120,100],revenue:[270,150,140,280],gross:[100,50,52,100],cash:[65,30,30,65],procurement:[170,95,95,180]},
  teamC:{profit:[35,20,18,35],ads:[10,5,5,10],tail:[8,3,4,9],stock:[90,100,90,80],revenue:[230,130,130,230],gross:[80,45,43,80],cash:[50,20,20,50],procurement:[150,75,75,150]},
  storeA:{profit:[50,20,24,40],ads:[15,10,9,16],tail:[10,5,5,10],stock:[150,160,150,145],revenue:[350,185,180,360],gross:[130,65,68,125],cash:[75,35,34,78],procurement:[230,130,125,240]},
  storeB:{profit:[20,8,10,26],ads:[8,5,5,9],tail:[6,3,3,6],stock:[70,80,70,65],revenue:[210,110,105,210],gross:[70,38,40,70],cash:[45,20,20,46],procurement:[135,80,75,142]},
  storeC:{profit:[30,12,16,14],ads:[5,3,3,7],tail:[4,1,2,5],stock:[50,60,50,40],revenue:[140,75,75,140],gross:[50,22,27,45],cash:[25,15,11,26],procurement:[85,50,50,88]},
  storeD:{profit:[45,25,22,45],ads:[16,9,8,18],tail:[12,6,6,12],stock:[120,110,120,100],revenue:[270,150,140,280],gross:[100,50,52,100],cash:[65,30,30,65],procurement:[170,95,95,180]},
  storeE:{profit:[35,20,18,35],ads:[10,5,5,10],tail:[8,3,4,9],stock:[90,100,90,80],revenue:[230,130,130,230],gross:[80,45,43,80],cash:[50,20,20,50],procurement:[150,75,75,150]}
};
const GOAL_UNALLOCATED = {
  company:{profit:0,ads:4,tail:0,stock:0,revenue:0,gross:0,cash:0,procurement:0},
  teamA:{profit:0,ads:2,tail:0,stock:0,revenue:0,gross:0,cash:0,procurement:0},
  teamB:{profit:0,ads:0,tail:0,stock:0,revenue:0,gross:0,cash:0,procurement:0},
  teamC:{profit:0,ads:0,tail:0,stock:0,revenue:0,gross:0,cash:0,procurement:0}
};
const GOAL_MONTH_END_STOCK_CAP = {company:420,teamA:230,teamB:110,teamC:80,storeA:130,storeB:60,storeC:40,storeD:110,storeE:80};
const GOAL_DEFAULT_DRAFT = Object.fromEntries(Object.keys(GOAL_BASE).map(scope=>[scope,Object.fromEntries(Object.keys(GOAL_METRICS).map(metric=>[metric,GOAL_BASE[scope][metric][0]]))]));
const goalState={mode:'compile',scope:'company',metric:'profit',group:'core',treeMode:'hierarchy',filter:'',notice:'',draft:loadGoalDraft()};

function loadGoalDraft(){
  try{
    const saved=JSON.parse(localStorage.getItem(GOAL_DRAFT_KEY)||'null');
    if(!saved||typeof saved!=='object')return structuredClone(GOAL_DEFAULT_DRAFT);
    const draft=structuredClone(GOAL_DEFAULT_DRAFT);
    for(const scope of Object.keys(draft))for(const metric of Object.keys(draft[scope])){
      const value=saved[scope]?.[metric];
      if(Number.isFinite(value)&&value>=0)draft[scope][metric]=value;
    }
    return draft;
  }catch{return structuredClone(GOAL_DEFAULT_DRAFT);}
}
const goalFmt=value=>Number(value).toLocaleString('zh-CN',{maximumFractionDigits:1});
const goalEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const goalTarget=(scope,metric)=>goalState.mode==='compile'?goalState.draft[scope][metric]:GOAL_BASE[scope][metric][0];
function goalGap(scope,metric){
  const m=GOAL_METRICS[metric],forecast=GOAL_BASE[scope][metric][3];
  const target=metric==='stock'?GOAL_MONTH_END_STOCK_CAP[scope]:GOAL_BASE[scope][metric][0];
  return m.kind==='limit'?forecast-target:forecast-target;
}
function goalGapText(scope,metric){
  const diff=goalGap(scope,metric),limit=GOAL_METRICS[metric].kind==='limit';
  if(diff===0)return {text:'达标',tone:'good'};
  const under=metric==='stock'?'低于上限':metric==='procurement'?'低于参考线':'低于预算';
  return {text:`${limit?(diff>0?'超':under):(diff>0?'多':'少')} ${goalFmt(Math.abs(diff))} 万`,tone:limit?(diff>0?'bad':'good'):(diff>0?'good':'bad')};
}
function goalCrumbs(scope){
  const chain=[];let node=scope;
  while(node){chain.unshift(GOAL_SCOPE[node].label);node=GOAL_SCOPE[node].parent;}
  return chain.join(' › ');
}
function goalTreeItems(){
  const term=goalState.filter.trim();
  const items=goalState.treeMode==='stores'?['company','storeA','storeB','storeC','storeD','storeE']:GOAL_TREE;
  const filtered=items.filter(id=>!term||GOAL_SCOPE[id].label.includes(term)||id==='company');
  return filtered.map(id=>{const depth=id==='company'?0:id.startsWith('team')?1:goalState.treeMode==='stores'?1:2;return `<button type="button" role="treeitem" aria-level="${depth+1}" aria-selected="${goalState.scope===id}" class="goal-tree-item depth-${depth} ${goalState.scope===id?'active':''}" data-goal-scope="${id}"><span>${goalEscape(GOAL_SCOPE[id].label)}</span></button>`;}).join('');
}
function goalTree(){
  return `<aside class="goal-tree view-panel"><div class="goal-tree-head"><h2>责任树</h2><span>按经营归属汇总</span></div>
    <div class="goal-tree-tools"><label class="sr-only" for="goalTreeMode">责任树视图</label><select id="goalTreeMode" class="view-filter"><option value="hierarchy" ${goalState.treeMode==='hierarchy'?'selected':''}>责任层级</option><option value="stores" ${goalState.treeMode==='stores'?'selected':''}>店铺清单</option></select><label class="sr-only" for="goalTreeSearch">搜索责任对象</label><input id="goalTreeSearch" class="view-filter" type="search" placeholder="搜索品线或店铺" value="${goalEscape(goalState.filter)}"></div>
    <div class="goal-tree-list" role="tree">${goalTreeItems()}</div>
    <div class="goal-tree-foot"><b>查看口径</b><span>切换视图不改变归属；共用店铺只计所选品线的金额。</span></div></aside>`;
}
function goalContext(){
  return `<div class="goal-context"><div><span>目标方案</span><strong>2026 年 10 月经营目标</strong></div><div><span>周期</span><strong>月度</strong></div><div><span>当前范围</span><strong id="goalScopeName">${goalEscape(GOAL_SCOPE[goalState.scope].label)}</strong></div><div><span>版本</span><strong>${goalState.mode==='compile'?'草案 V2':'已确认 V1'}</strong></div></div>
    <div class="goal-scope-line"><div><span>责任视角</span><strong id="goalScopeTrail">${goalEscape(goalCrumbs(goalState.scope))}</strong></div><span>切换：品线负责团队 / 店铺经营范围</span></div>`;
}
function goalTabBar(){return `<div class="goal-tabs" role="tablist" aria-label="目标制定视图"><button type="button" data-goal-mode="compile" role="tab" aria-selected="${goalState.mode==='compile'}" class="${goalState.mode==='compile'?'active':''}">目标编制</button><button type="button" data-goal-mode="report" role="tab" aria-selected="${goalState.mode==='report'}" class="${goalState.mode==='report'?'active':''}">目标报表</button></div>`;}
function goalInput(scope,metric){
  const value=goalTarget(scope,metric);
  return `<input type="number" inputmode="decimal" min="0" step="0.1" value="${value}" data-goal-edit="${scope}:${metric}" aria-label="${GOAL_SCOPE[scope].label}${GOAL_METRICS[metric].name}${GOAL_METRICS[metric].targetLabel}">`;
}
function goalCompileMetrics(){return goalState.group==='core'?['profit','ads','tail','stock']:['revenue','gross','cash','procurement'];}
function goalCompileTable(){
  const scope=goalState.scope,children=GOAL_SCOPE[scope].children,metrics=goalCompileMetrics();
  const rows=children.length?children:[scope];
  const head=`<tr><th rowspan="2">${children.length?'直接下级':'当前对象'}</th>${metrics.map(metric=>`<th colspan="2">${GOAL_METRICS[metric].name}</th>`).join('')}</tr><tr>${metrics.map(metric=>`<th>${GOAL_METRICS[metric].targetLabel}</th><th>${GOAL_METRICS[metric].actualLabel}</th>`).join('')}</tr>`;
  const total=children.length?`<tr class="goal-total"><td>${goalEscape(GOAL_SCOPE[scope].label)}合计</td>${metrics.map(metric=>`<td>${goalInput(scope,metric)}</td><td>${goalFmt(GOAL_BASE[scope][metric][1])}</td>`).join('')}</tr>`:'';
  const body=rows.map(id=>`<tr><td>${children.length?`<button type="button" class="goal-row-link" data-goal-scope="${id}">${goalEscape(GOAL_SCOPE[id].label)} <span>›</span></button>`:goalEscape(GOAL_SCOPE[id].label)}</td>${metrics.map(metric=>`<td>${goalInput(id,metric)}</td><td>${goalFmt(GOAL_BASE[id][metric][1])}</td>`).join('')}</tr>`).join('');
  const unallocated=children.length?`<tr class="goal-unallocated"><td>待分解 / 待分摊</td>${metrics.map(metric=>{const diff=goalState.draft[scope][metric]-children.reduce((sum,id)=>sum+goalState.draft[id][metric],0);return `<td class="${diff<0?'bad':diff>0?'warn':''}" data-goal-remainder="${metric}">${goalFmt(diff)}</td><td>—</td>`;}).join('')}</tr>`:'';
  return `<div class="goal-table-scroll"><table class="goal-table goal-compile-table"><thead>${head}</thead><tbody>${total}${body}${unallocated}</tbody></table></div>`;
}
function goalCompile(){
  const scope=goalState.scope,metrics=goalCompileMetrics();
  const core=goalState.group==='core';
  return `<div class="goal-work-head"><div><h2>${scope==='company'?'目标与预算编制':`${goalEscape(GOAL_SCOPE[scope].label)} · 目标分解`}</h2><p>金额单位：万元 · 实际金额只读 · 修改目标或预算后保存为本地演示草案</p></div><div class="goal-actions"><label class="sr-only" for="goalMetricGroup">指标列</label><select id="goalMetricGroup" class="view-filter"><option value="core" ${core?'selected':''}>利润 / 广告 / 尾程 / 库存</option><option value="results" ${!core?'selected':''}>收入 / 毛利 / 回款 / 采购成本</option></select><button type="button" id="goalSave" class="view-btn">保存草案</button></div></div>
    <div class="goal-pairs">${metrics.map(metric=>{const m=GOAL_METRICS[metric],target=goalTarget(scope,metric),actual=GOAL_BASE[scope][metric][1];return `<div class="goal-pair"><span>${m.name}</span><strong>${goalFmt(target)} <small>万</small></strong><em>${m.targetLabel}　/　${m.actualLabel} ${goalFmt(actual)} 万</em></div>`;}).join('')}</div>
    ${goalCompileTable()}<div id="goalValidation" class="goal-validation" aria-live="polite"></div><p class="goal-footnote">${core?'库存占资为时点余额，当前值不能把每天的库存相加。':'采购成本 770 万是按收入与毛利目标倒推的参考线；与已批准预算分开。'}</p>`;
}
function goalReportMetrics(){return ['profit','revenue','gross','cash','procurement','ads','tail','stock'];}
function goalReportRow(metric){
  const scope=goalState.scope,m=GOAL_METRICS[metric],data=GOAL_BASE[scope][metric],cap=metric==='stock'?GOAL_MONTH_END_STOCK_CAP[scope]:data[0],gap=goalGapText(scope,metric);
  return `<button type="button" class="goal-report-row ${goalState.metric===metric?'active':''}" data-goal-metric="${metric}" aria-pressed="${goalState.metric===metric}"><span class="name">${m.name}</span><span>${goalFmt(cap)}</span><span>${goalFmt(data[1])}</span><span>${goalFmt(data[2])}</span><span>${goalFmt(data[3])}</span><strong class="${gap.tone}">${gap.text}</strong></button>`;
}
function goalBreakdown(){
  const scope=goalState.scope,metric=goalState.metric,m=GOAL_METRICS[metric],children=GOAL_SCOPE[scope].children;
  const rows=children.length?children:[scope];
  const max=Math.max(...rows.map(id=>GOAL_BASE[id][metric][0]),1);
  const rowHtml=rows.map(id=>{const data=GOAL_BASE[id][metric],target=metric==='stock'?GOAL_MONTH_END_STOCK_CAP[id]:data[0],gap=goalGapText(id,metric),ratio=Math.min(100,data[3]/Math.max(max,target,1)*100);return `<button type="button" class="goal-break-row" ${children.length?`data-goal-scope="${id}"`:'data-goal-leaf="true"'}><span class="label">${goalEscape(GOAL_SCOPE[id].label)}</span><span class="goal-break-track"><i style="width:${ratio.toFixed(1)}%"></i></span><span class="numbers">预测 ${goalFmt(data[3])} / ${m.kind==='limit'?'上限':'目标'} ${goalFmt(target)}</span><strong class="${gap.tone}">${gap.text}</strong><span class="arrow">${children.length?'›':''}</span></button>`;}).join('');
  const extra=scope==='company'&&metric==='ads'?`<div class="goal-break-extra">待分摊预算 4 万：公司预算 60 万，三支团队预算合计 56 万。</div>`:'';
  return `<div class="goal-break-head"><h3>${m.name}${m.kind==='limit'?'超额':'差额'}归属</h3><strong class="${goalGapText(scope,metric).tone}">${goalGapText(scope,metric).text}</strong></div><div class="goal-break-list">${rowHtml}</div>${extra}<div class="goal-break-bottom">${children.length?'选择责任对象，左侧责任树同步定位。':`${GOAL_SCOPE[scope].label}已是最小责任范围。`} <a href="#${m.analysis}" class="goal-analysis-link">进入${m.analysis==='goods'?'商品与库存':m.analysis==='cost'?'成本与投入':m.analysis==='revenue'?'销售与回款':'利润'}分析 ↗</a></div>`;
}
function goalReport(){
  const scope=goalState.scope,metric=goalState.metric,m=GOAL_METRICS[metric],data=GOAL_BASE[scope][metric],target=metric==='stock'?GOAL_MONTH_END_STOCK_CAP[scope]:data[0],gap=goalGapText(scope,metric),stageGap=data[1]-data[2];
  const stageText=metric==='stock'?`当前${stageGap>0?'超':'低于'}阶段上限 ${goalFmt(Math.abs(stageGap))}`:m.kind==='limit'?`当前${stageGap>0?'超':'低于'}阶段计划 ${goalFmt(Math.abs(stageGap))}`:`当前${stageGap<0?'少':'多'} ${goalFmt(Math.abs(stageGap))}`;
  const targetName=metric==='stock'?'月末上限':m.targetLabel==='预算'?'月度预算':m.targetLabel==='参考线'?'采购成本参考线':'月度目标';
  return `<div class="goal-work-head"><div><h2>目标执行结果</h2><p>2026 年 10 月 · 演示数据截至 10.18 · 金额单位：万元</p></div></div>
    <div class="goal-result-hero"><div><span>当前选中 · ${m.name}</span><strong class="${gap.tone}">${m.kind==='limit'?(gap.tone==='bad'?'月末预计超 '+goalFmt(Math.abs(goalGap(scope,metric)))+' 万':gap.text):(gap.tone==='bad'?'月底预计少 '+goalFmt(Math.abs(goalGap(scope,metric)))+' 万':gap.text)}</strong></div><div><b>${targetName} ${goalFmt(target)} / 期末预测 ${goalFmt(data[3])}</b><span>截至 10.18：${metric==='stock'?'当前':m.actualLabel} ${goalFmt(data[1])} / ${metric==='stock'?'阶段上限':'阶段计划'} ${goalFmt(data[2])} · ${stageText}</span></div></div>
    <div class="goal-report-head"><h3>各项目标执行情况</h3><span>点选一行，下方直接显示差额归属</span></div><div class="goal-report-table"><div class="goal-report-labels"><span>指标</span><span>目标 / 预算 / 上限</span><span>累计实际 / 当前</span><span>阶段计划 / 上限</span><span>期末预测</span><span>预计差额</span></div>${goalReportMetrics().map(goalReportRow).join('')}</div><p class="goal-footnote">库存占资按时点比较：当前对阶段上限、期末预测对月末上限。采购成本 770 万为目标倒推参考线，不代表已批准预算。</p>
    <div class="goal-breakdown" id="goalBreakdown">${goalBreakdown()}</div>`;
}
function v7Goals(){
  return `<div class="goal-page">${goalTabBar()}${goalContext()}<div class="goal-layout">${goalTree()}<section class="goal-work view-panel" aria-label="${goalState.mode==='compile'?'目标编制':'目标报表'}">${goalState.mode==='compile'?goalCompile():goalReport()}</section></div><div class="goal-toast" id="goalToast" role="status" aria-live="polite">${goalEscape(goalState.notice)}</div></div>`;
}
function goalValidate(){
  const scope=goalState.scope,children=GOAL_SCOPE[scope].children,box=document.getElementById('goalValidation');
  if(!box)return;
  if(!children.length){box.innerHTML='<span class="good">当前为店铺经营范围，已填写的金额将参与上级汇总。</span>';return;}
  const diffs=goalCompileMetrics().map(metric=>({metric,diff:goalState.draft[scope][metric]-children.reduce((sum,id)=>sum+goalState.draft[id][metric],0)}));
  box.innerHTML=`<b>编制校验</b>${diffs.map(({metric,diff})=>`<span class="${diff<0?'bad':diff>0?'warn':'good'}">${GOAL_METRICS[metric].name}：${diff===0?'已分解':diff>0?`待分解 ${goalFmt(diff)} 万`:`下级超出 ${goalFmt(-diff)} 万`}</span>`).join('')}`;
  document.querySelectorAll('[data-goal-remainder]').forEach(cell=>{const item=diffs.find(x=>x.metric===cell.dataset.goalRemainder);if(!item)return;cell.textContent=goalFmt(item.diff);cell.className=item.diff<0?'bad':item.diff>0?'warn':'';});
}
function bindGoalScopeButtons(root){
  root.querySelectorAll('[data-goal-scope]').forEach(button=>button.addEventListener('click',()=>{goalState.scope=button.dataset.goalScope;goalState.notice='';render();}));
}
function bindGoalMetricButtons(root){
  root.querySelectorAll('[data-goal-metric]').forEach(button=>button.addEventListener('click',()=>{
    goalState.metric=button.dataset.goalMetric;
    const work=document.querySelector('.goal-work');
    work.innerHTML=goalReport();
    bindGoalMetricButtons(work);
    bindGoalScopeButtons(work);
    const hero=work.querySelector('.goal-result-hero');
    if(hero.getBoundingClientRect().top<75)window.scrollTo({top:window.scrollY+hero.getBoundingClientRect().top-75,behavior:'smooth'});
  }));
}
function bindGoalsV7(){
  const root=document.querySelector('.goal-page');if(!root)return;
  root.querySelectorAll('[data-goal-mode]').forEach(button=>button.addEventListener('click',()=>{goalState.mode=button.dataset.goalMode;goalState.notice='';render();}));
  bindGoalScopeButtons(root);
  bindGoalMetricButtons(root);
  root.querySelector('#goalMetricGroup')?.addEventListener('change',event=>{goalState.group=event.target.value;render();});
  root.querySelector('#goalTreeMode')?.addEventListener('change',event=>{goalState.treeMode=event.target.value;render();});
  root.querySelector('#goalTreeSearch')?.addEventListener('input',event=>{goalState.filter=event.target.value;const list=root.querySelector('.goal-tree-list');list.innerHTML=goalTreeItems();list.querySelectorAll('[data-goal-scope]').forEach(button=>button.addEventListener('click',()=>{goalState.scope=button.dataset.goalScope;render();}));});
  root.querySelectorAll('[data-goal-edit]').forEach(input=>input.addEventListener('input',()=>{const [scope,metric]=input.dataset.goalEdit.split(':');if(input.value==='')return;const value=Number(input.value);if(!Number.isFinite(value)||value<0)return;goalState.draft[scope][metric]=value;goalValidate();root.querySelectorAll(`[data-goal-edit="${scope}:${metric}"]`).forEach(other=>{if(other!==input)other.value=input.value;});const pair=root.querySelector('.goal-pairs');if(pair)pair.innerHTML=goalCompileMetrics().map(key=>{const m=GOAL_METRICS[key];return `<div class="goal-pair"><span>${m.name}</span><strong>${goalFmt(goalTarget(goalState.scope,key))} <small>万</small></strong><em>${m.targetLabel}　/　${m.actualLabel} ${goalFmt(GOAL_BASE[goalState.scope][key][1])} 万</em></div>`;}).join('');}));
  root.querySelector('#goalSave')?.addEventListener('click',()=>{const inputs=[...root.querySelectorAll('[data-goal-edit]')];const invalid=inputs.some(input=>input.value===''||!Number.isFinite(Number(input.value))||Number(input.value)<0);if(invalid){goalState.notice='请输入 0 或更大的金额。';root.querySelector('#goalToast').textContent=goalState.notice;return;}localStorage.setItem(GOAL_DRAFT_KEY,JSON.stringify(goalState.draft));goalState.notice='草案已保存在当前浏览器；已确认 V1 报表不受影响。';root.querySelector('#goalToast').textContent=goalState.notice;});
  goalValidate();
}
window.bindGoalsV7=bindGoalsV7;
