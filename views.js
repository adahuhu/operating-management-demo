'use strict';

const ROUTES = [
  ['goals','目标制定'],['profit','利润分析'],['revenue','销售与回款分析'],
  ['goods','商品与库存分析'],['cost','成本与投入分析'],
  ['channel','店铺利润与投入产出'],['todos','经营待办']
];
const COLORS = ['#587EB8','#C79A58','#509D93','#B4757B','#8D7CB1'];
const STORES = [
  {name:'店铺 A',line:'品线 A',platform:'Amazon',country:'美国',income:360,expense:320,profit:40,target:50,orders:4500},
  {name:'店铺 B',line:'品线 A',platform:'Amazon',country:'美国',income:210,expense:184,profit:26,target:20,orders:2600},
  {name:'店铺 C',line:'品线 A',platform:'Walmart',country:'美国',income:140,expense:126,profit:14,target:30,orders:2200},
  {name:'店铺 D',line:'品线 B',platform:'Amazon',country:'英国',income:280,expense:235,profit:45,target:45,orders:3500},
  {name:'店铺 E',line:'品线 C',platform:'TikTok Shop',country:'英国',income:230,expense:195,profit:35,target:35,orders:3200}
];
const TEAMS = [
  {name:'品线 A 团队',income:710,expense:630,profit:80,target:100,stock:300,old:40,veryOld:12},
  {name:'品线 B 团队',income:280,expense:235,profit:45,target:45,stock:110,old:16,veryOld:6},
  {name:'品线 C 团队',income:230,expense:195,profit:35,target:35,stock:100,old:12,veryOld:2}
];
const PLATFORMS = [
  {name:'Amazon',income:850,expense:739,profit:111,orders:10600},
  {name:'Walmart',income:140,expense:126,profit:14,orders:2200},
  {name:'TikTok Shop',income:230,expense:195,profit:35,orders:3200}
];
const FEES = [
  {name:'履约 / 物流',value:80},{name:'广告',value:64},{name:'平台',value:45},
  {name:'仓储',value:30},{name:'售后',value:22},{name:'汇率及其他',value:19}
];
const INVENTORY = [
  {name:'平台仓',value:230,old:20},{name:'海外仓',value:150,old:32},
  {name:'国内仓',value:80,old:16},{name:'在途',value:50,old:0}
];
const ITEMS = [
  {name:'新品 A-006',stage:'验证中',result:'销售 32 / 阶段目标 30',investment:'投入 6.5 / 上限 7',quality:'质量反馈待阶段检查',next:'10.25 汇总销售、投入和质量反馈'},
  {name:'商品 B-102',stage:'在售',result:'利润 +14；可售 9 天',investment:'在途预计 17 天后到',quality:'缺货风险',next:'核到货时间与可调拨量'},
  {name:'商品 C-008',stage:'待调整',result:'销售 17 / 阶段目标 25；利润 −3',investment:'累计投入 5.8 / 上限 6',quality:'退货率 4.1%',next:'核退货原因和后续投入'},
  {name:'商品 D-021',stage:'待处理',result:'货值 16；超过 90 天',investment:'其中 12 万拟处理',quality:'需核出库方式',next:'确认处理方案和资金回收'},
  {name:'商品 E-011',stage:'在售',result:'利润 +9；货值 18',investment:'库龄 31—90 天',quality:'继续观察',next:'继续看周转与利润'}
];
const GOODS = [
  {id:'B102',name:'商品 B-102',line:'品线 A',tag:'缺货风险',tags:['shortage'],result:'利润 +14 万',stock:'平台仓 8 万',risk:'可售 9 天；在途预计 17 天后到',input:'先核可调拨量',next:'确认到货日、可调拨量和订单节奏，再决定补货或调拨。',known:['本月利润 +14 万','平台仓货值 8 万','可售 9 天，在途预计 17 天后到'],check:'确认真实到货日、可调拨库存与未来订单量。'},
  {id:'C008',name:'商品 C-008',line:'品线 A',tag:'亏损且有积压',tags:['loss','aged'],result:'利润 −3 万；销售 17 / 目标 25',stock:'海外仓 22 万',risk:'其中 10 万超过 90 天',input:'投入 5.8 / 上限 6；退货率 4.1%',next:'先查退货与费用，再判断是否继续投入及处理库存。',known:['本月利润 −3 万','海外仓货值 22 万，其中 10 万超过 90 天','累计投入 5.8 / 上限 6 万；退货率 4.1%'],check:'核退货原因、后续订单和继续投入的利润影响。'},
  {id:'D021',name:'商品 D-021',line:'品线 B',tag:'高库龄待处理',tags:['aged'],result:'商品利润待核',stock:'国内仓 16 万',risk:'全部超过 90 天',input:'其中 12 万拟处理',next:'确认具体出库方式、可回收金额和处理后的占资变化。',known:['国内仓货值 16 万','全部超过 90 天','其中 12 万拟处理'],check:'比较调拨、促销和清货的回款与损失；出库前不计资金释放。'},
  {id:'A006',name:'新品 A-006',line:'品线 A',tag:'新品验证中',tags:['new'],result:'销售 32 / 阶段目标 30',stock:'平台仓 26 万',risk:'0—30 天，正常销售',input:'投入 6.5 / 上限 7',next:'10.25 汇总销售、投入、利润和质量反馈，再决定是否继续投入。',known:['阶段销售 32 / 目标 30 万','累计投入 6.5 / 上限 7 万','平台仓货值 26 万，库龄 0—30 天'],check:'汇总利润及质量反馈；销售达标不等于阶段验证通过。'},
  {id:'E011',name:'商品 E-011',line:'品线 C',tag:'正常观察',tags:['normal'],result:'利润 +9 万',stock:'海外仓 18 万',risk:'库龄 31—90 天',input:'继续看投入与周转',next:'保持销售观察，核利润、周转和后续补货节奏。',known:['本月利润 +9 万','海外仓货值 18 万','库龄 31—90 天'],check:'持续核利润和周转；当前没有需立即处理的异常。'}
];
const ACTIONS = [
  {name:'确认商品 A 尾程费用适用范围',id:'A-017 · M-017',status:'已核对',next:'比较承运商费用和时效，确认处理方案。',result:'费用范围已核对；利润影响尚未测算。',owner:'对接人 A',due:'10.17',kind:'check'},
  {name:'完成新品 A-006 阶段验证',id:'A-006 · 原定计划',status:'正常推进',next:'10.25 汇总销量、投入和质量反馈。',result:'销售 32 / 目标 30；投入 6.5 / 上限 7，验证未结束。',owner:'对接人 B',due:'10.25',kind:'open'},
  {name:'落实品线 A 广告投入再分配',id:'A-021 · M-021',status:'已执行待验证',next:'10.23 核对广告效果及利润影响。',result:'广告预计 64 / 预算 60；调整效果待核。',owner:'对接人 C',due:'10.23',kind:'check'},
  {name:'核验店铺 B 履约安排调整',id:'A-026 · M-026',status:'效果未达标',next:'比较承运商费用和订单结构。',result:'单均费用 18 → 16 元，仍高于 15 元目标。',owner:'对接人 D',due:'10.22',kind:'bad'},
  {name:'核对店铺 D 高库龄库存处理方案',id:'A-031 · M-031',status:'方案待确认',next:'确认拟处理 12 万对应商品与出库方式。',result:'90 天以上货值 16 万；尚未出库。',owner:'对接人 E',due:'10.22',kind:'open'},
  {name:'调整店铺 C 低效投入并查退货',id:'A-032 · M-032',status:'进行中',next:'核商品 C-008 退货原因及费用。',result:'利润预计 14 / 目标 30；退货率 4.1%，效果待核。',owner:'对接人 F',due:'10.21',kind:'open'}
];
const number = n => Number(n).toLocaleString('zh-CN');
const pct = (part,total) => (part/total*100).toFixed(1) + '%';
const link = (route,text) => `<a class="view-link" href="#${route}">${text} ↗</a>`;
function nav() {
  document.getElementById('viewNav').innerHTML = `<a href="./index.html">经营总控</a><a href="#goals" data-route="goals">目标制定</a><span class="nav-label">结果分析</span>${ROUTES.slice(1,-1).map(([key,name])=>`<a class="sub" href="#${key}" data-route="${key}">${name}</a>`).join('')}<a href="#todos" data-route="todos">经营待办</a>`;
  document.getElementById('viewMobileNav').innerHTML = `<a href="./index.html">经营总控</a>${ROUTES.map(([key,name])=>`<a href="#${key}" data-route="${key}">${name}</a>`).join('')}`;
}
function head(title,description) {
  return `<header class="view-head view-head-compact"><h1 class="sr-only">${title}</h1><div class="view-context">2026 年 10 月 · 截至 10.18 · 演示数据 · 人民币 / 万元</div></header>`;
}
function kpis(items) {
  return `<div class="view-kpis">${items.map(([label,value,unit,note,tone])=>`<div class="view-kpi"><span>${label}</span><strong>${value}<small> ${unit||''}</small></strong><em class="${tone||''}">${note}</em></div>`).join('')}</div>`;
}
function section(title,note,body) {
  return `<section class="view-section"><div class="sectionhead"><h2>${title}</h2></div>${body}</section>`;
}
function panel(title,note,body,extra='') {
  return `<article class="view-panel ${extra}"><div class="panelhead"><h3>${title}</h3><span>${note||''}</span></div>${body}</article>`;
}
function table(headers,rows,cls='') {
  return `<div class="scroll"><table class="table ${cls}"><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function bars(rows,maxValue) {
  const max=maxValue||Math.max(...rows.map(x=>x.value));
  return `<div class="view-bars">${rows.map(row=>`<div class="view-bar ${row.tone||''}"><span>${row.name}</span><div class="rail"><i style="width:${Math.max(2,row.value/max*100).toFixed(1)}%"></i></div><b>${number(row.value)} ${row.unit||'万'}</b></div>`).join('')}</div>`;
}
function goalTracks(rows) {
  return `<div class="view-goals">${rows.map(row=>`<div class="view-goal-row"><div><b>${row.name}</b><span>预计 ${number(row.forecast)} / 目标 ${number(row.target)} 万</span></div><div class="view-goal-rail"><i style="width:${Math.min(100,row.forecast/row.target*100).toFixed(1)}%"></i></div><strong class="${row.forecast<row.target?'bad':'good'}">${row.forecast<row.target?'少 '+number(row.target-row.forecast):row.forecast>row.target?'多 '+number(row.forecast-row.target):'达标'}${row.forecast===row.target?'':' 万'}</strong></div>`).join('')}</div>`;
}
function pie(data,valueKey='value') {
  const total=data.reduce((sum,row)=>sum+row[valueKey],0);
  let offset=0;
  const stops=data.map((row,i)=>{const start=offset;offset+=row[valueKey]/total*100;return `${COLORS[i%COLORS.length]} ${start.toFixed(3)}% ${offset.toFixed(3)}%`;});
  return `<div class="view-pie-row"><div class="view-pie" role="img" aria-label="${data.map(row=>`${row.name}${pct(row[valueKey],total)}`).join('，')}" style="background:conic-gradient(${stops.join(',')})"></div><div class="view-legend">${data.map((row,i)=>`<div><i style="background:${COLORS[i%COLORS.length]}"></i><span>${row.name}</span><b>${pct(row[valueKey],total)}</b></div>`).join('')}</div></div>`;
}
function focus(title,description,meta='',route='') {
  return `<div class="view-focus"><h4>${title}</h4><p>${description}</p>${meta?`<div class="meta">${meta}</div>`:''}${route?link(route,'查看分析'):''}</div>`;
}
function lineChart(values,labels) {
  const max=Math.ceil(Math.max(...values)*1.16),min=Math.max(0,Math.floor(Math.min(...values)*.78));
  const x=i=>46+i*750/Math.max(1,values.length-1), y=v=>181-(v-min)/(max-min)*145;
  const path=values.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area=`${path} L${x(values.length-1).toFixed(1)} 181 L46 181 Z`;
  const ticks=Array.from({length:5},(_,i)=>min+(max-min)*i/4);
  return `<svg class="view-line-chart" viewBox="0 0 840 210" role="img" aria-label="${labels[0]}至${labels[labels.length-1]}变化趋势"><path class="area" d="${area}"/>${ticks.map(v=>`<path class="grid" d="M46 ${y(v).toFixed(1)}H807"/><text x="5" y="${(y(v)+4).toFixed(1)}">${v.toFixed(0)}</text>`).join('')}<path class="series" d="${path}"/>${values.map((v,i)=>`<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${i===values.length-1?4.8:2.5}"><title>${labels[i]}：${v} 万</title></circle>`).join('')}</svg><div class="view-chart-foot"><span>${labels[0]}</span><span>${labels[Math.floor(labels.length/2)]}</span><span>${labels[labels.length-1]}</span></div>`;
}
function archiveNote() {
  return `<div class="view-archive">${link('goals','目标制定')}　<a href="./index.html">经营总控 ↗</a></div>`;
}

function goals() {
  const rows=TEAMS.map(t=>[t.name,`${t.target} 万`,`${t.profit} 万`,`<b class="${t.profit<t.target?'bad':'good'}">${t.profit<t.target?'缺口 '+(t.target-t.profit)+' 万':'预计达标'}</b>`,`${t.income} 万`]);
  return head('目标制定','把公司目标分到品线负责团队，并把预算、上限和需要验证的动作单独列清。')+
    kpis([['利润目标','180','万','期末预计 160 · 缺口 20','bad'],['收入目标','1,200','万','期末预计 1,220 · 高于 20','good'],['毛利目标','430','万','期末预计 420 · 缺口 10','bad'],['库存月末上限','420','万','期末预计 430 · 超 10','bad']])+
    section('品线团队目标','利润目标 100＋45＋35＝180 万；同一目标不重复汇总',
      `<div class="view-grid one-three">${panel('利润目标分解','品线负责团队 · 万元',table(['团队','本月目标','月末预计','差额','收入预计'],rows)+`<p class="view-note">品线 A 承担当前 20 万利润缺口；品线 B、C 预计达到各自目标。</p>`)}${panel('收入、毛利与回款目标','每个指标分别对照自身目标',goalTracks([{name:'收入',forecast:1220,target:1200},{name:'毛利',forecast:420,target:430},{name:'回款',forecast:265,target:260}])+`<p class="view-note">广告预算 60 万、库存月末上限 420 万属于约束，不与收入和利润目标相加。</p>`)}</div>`)+
    section('预算与上限','把目标、预算、上限和测算值分开',
      panel('预算与上限明细','本月预计',table(['项目','确认口径','本月预计','当前判断'],[
        ['广告费','预算 60 万','64 万','<b class="bad">预计超预算 4 万</b>'],
        ['库存占资','月末上限 420 万','430 万','<b class="bad">预计超上限 10 万</b>'],
        ['经营费用及汇率影响','倒推参考值 250 万（非预算）','260 万','<b class="warn">多 10 万，来源待核</b>']
      ])+`<p class="view-note">250 万是毛利目标 430 − 利润目标 180 倒推的可承受额，不是已经批准的费用预算。</p>`))+
    section('原定经营动作','原定动作与偏差产生的事项分开',
      `<div class="view-steps"><div><b>新品 A-006 阶段验证</b><p>按原计划推进，10.25 汇总销售、投入和质量反馈。</p></div><div><b>品线 A 广告再分配</b><p>调整已执行；10.23 继续核对投入产出和利润影响。</p></div><div><b>库存占资控制</b><p>先分清库龄、仓位和商品，再决定调拨、促销或清货。</p></div></div>`)+archiveNote();
}

const SEPTEMBER=Array.from({length:30},(_,i)=>Math.round((5.05+Math.sin(i*1.13)*.48+Math.cos(i*.63)*.31)*10)/10);
SEPTEMBER[29]=Math.round((SEPTEMBER[29]+Math.round((152-SEPTEMBER.reduce((a,b)=>a+b,0))*10)/10)*10)/10;
const OCTOBER=[4.3,4.6,4.4,4.8,4.7,4.2,4.9,4.5,4.6,5.0,4.6,5.0,4.6,4.8,5.2,4.1,5.5,5.2];
const DAILY_PROFIT=new Map([...SEPTEMBER.map((v,i)=>[`2026-09-${String(i+1).padStart(2,'0')}`,v]),...OCTOBER.map((v,i)=>[`2026-10-${String(i+1).padStart(2,'0')}`,v])]);
function profit() {
  const teamRows=TEAMS.map(t=>[t.name,`${t.income} 万`,`${t.profit} / ${t.target} 万`,pct(t.profit,t.income),`<b class="${t.profit<t.target?'bad':'good'}">${t.profit<t.target?'少 '+(t.target-t.profit)+' 万':'达标'}</b>`]);
  return head('利润分析','先看利润差额，再定位到品线负责团队、店铺和具体商品。')+
    kpis([['本月利润预计','160','万','目标 180 · 缺口 20','bad'],['截至 10.18 实际','85','万','阶段计划 90 · 少 5','bad'],['本月毛利预计','420','万','目标 430 · 少 10','bad'],['预计利润率','13.1','%','160 ÷ 1,220']])+
    section('利润随时间怎么变化','按日可查询最多 30 天，按月看完整月实际与本月预测',
      panel('利润进度',`<div class="tiny-tabs" role="tablist"><button type="button" data-profit-period="day" class="active" aria-selected="true">按日</button><button type="button" data-profit-period="month" aria-selected="false">按月</button></div>`,
        `<div data-profit-view="day"><div class="view-controls"><span>每日利润</span><span class="push"></span><label>开始 <input class="view-filter" id="viewProfitStart" type="date" min="2026-09-01" max="2026-10-18" value="2026-09-19"></label><label>结束 <input class="view-filter" id="viewProfitEnd" type="date" min="2026-09-01" max="2026-10-18" value="2026-10-18"></label><button class="view-btn" id="viewProfitApply" type="button">查询</button></div><div id="viewProfitChart"></div><p class="view-note" id="viewProfitMessage" aria-live="polite"></p></div><div data-profit-view="month" hidden>${lineChart([135,143,149,146,152,160],['5 月','6 月','7 月','8 月','9 月','10 月预计'])}<p class="view-note">5—9 月为完整月实际；10 月为预计利润 160 万，目标 180 万。截至 10.18 累计实际 85 万。</p></div>`))+
    section('差额落在哪些经营对象','先分清盈利与达标，再看商品盈亏',
      `<div class="view-grid">${panel('品线负责团队盈亏','公司合计 160 / 目标 180 万',table(['团队','收入预计','利润预计 / 目标','利润率','判断'],teamRows)+`<p class="view-note">三支团队均盈利；只有品线 A 预计少于目标 20 万。</p>`)}${panel('商品盈亏','只列重点商品，不代表全公司合计',`<div class="summaryline"><span>在营 <b>48</b> 款</span><span>盈利 <b>35</b> 款</span><span>亏损 <b class="bad">8</b> 款</span><span>持平 <b>5</b> 款</span></div>${table(['商品','利润','近三日变化'],[['商品 B-102','<b class="good">+14 万</b>','0.7 → 0.8 → 0.9'],['新品 D-014','<b class="good">+11 万</b>','0.4 → 0.5 → 0.5'],['商品 C-008','<b class="bad">−3 万</b>','−0.2 → −0.4 → −0.6'],['商品 A-014','<b class="bad">−2 万</b>','−0.1 → −0.2 → −0.2']])}<p class="view-note">连续亏损或突然变化需继续核商品、费用和退货明细。</p>`)}</div>`)+
    section('店铺利润与目标','品线 A 的缺口需要看到店铺层',panel('五家店铺',`利润合计 ${STORES.reduce((s,x)=>s+x.profit,0)} 万`,table(['店铺','所属品线','平台','预计利润','目标','差额'],STORES.map(s=>[s.name,s.line,s.platform,`${s.profit} 万`,`${s.target} 万`,`<b class="${s.profit<s.target?'bad':'good'}">${s.profit<s.target?'少 '+(s.target-s.profit):s.profit>s.target?'多 '+(s.profit-s.target):'达标'} 万</b>`]))+`<p class="view-note">店铺 A、C 合计缺口 26 万，店铺 B 高于目标 6 万；三店净缺口 20 万。</p>`))+archiveNote();
}

function revenue() {
  const daily=[31,34,35,37,36,39,42];
  return head('销售与回款分析','收入、订单和现金回款分开看，再按平台与店铺定位结构。')+
    kpis([['本月收入预计','1,220','万','目标 1,200 · 多 20','good'],['截至 10.18 收入','650','万','阶段计划 630 · 多 20','good'],['本月订单预计','16,000','单','五店合计'],['本月回款预计','265','万','目标 260 · 多 5','good']])+
    section('收入每天怎么变','近七日实际；收入与利润使用同一日期口径',
      `<div class="view-grid one-three">${panel('每日收入','10.12—10.18 · 万元',lineChart(daily,['10.12','10.13','10.14','10.15','10.16','10.17','10.18'])+`<p class="view-note">10.18 收入 42 万，比前一日多 3 万；是否形成利润需结合成本和费用判断。</p>`)}${panel('收入与回款','两种结果，不互相替代',`<div class="view-split-number"><span>累计收入实际</span><b>650 万</b></div><div class="view-split-number"><span>累计现金回款实际</span><b>120 万</b></div><div class="view-split-number"><span>月末回款预计 / 目标</span><b>265 / 260 万</b></div><p class="view-note">平台结算与到账时点会影响回款；现有演示数据不足以将差额归因到具体账期。</p>`)}</div>`)+
    section('订单和收入来自哪里','平台与店铺为同一批订单的不同分组，不能重复相加',
      `<div class="view-grid">${panel('订单分布','预计 16,000 单',pie(PLATFORMS,'orders')+table(['平台','预计订单','占比'],PLATFORMS.map(p=>[p.name,`${number(p.orders)} 单`,pct(p.orders,16000)])))}${panel('平台收入分布','预计收入 1,220 万',pie(PLATFORMS,'income')+table(['平台','预计收入','占比'],PLATFORMS.map(p=>[p.name,`${p.income} 万`,pct(p.income,1220)])))}</div>`)+
    section('店铺收入分布','五店汇总与公司 1,220 万一致',panel('店铺收入','按平台归属查看',pie(STORES,'income')+table(['平台 / 店铺','预计订单','预计收入','收入占比'],STORES.map(s=>[`${s.platform} · ${s.name}`,`${number(s.orders)} 单`,`${s.income} 万`,pct(s.income,1220)]))))+archiveNote();
}

function cost() {
  return head('成本与投入分析','先把采购成本、经营费用和利润算清，再判断费用偏差与投入效果。')+
    kpis([['收入预计','1,220','万','同一经营口径'],['采购成本预计','800','万','形成毛利 420'],['经营费用及汇率影响','260','万','六类费用合计'],['利润预计','160','万','目标 180 · 少 20','bad']])+
    section('收入如何形成利润','收入 1,220 − 采购成本 800 − 费用 260 ＝ 利润 160',
      panel('本月预计利润计算','单位：万元',`<div class="view-flow"><div><span>收入</span><b>1,220</b><small>目标 1,200</small></div><div><span>减：采购成本</span><b>800</b><small>得到毛利 420</small></div><div><span>减：经营费用及汇率影响</span><b>260</b><small>广告、履约、平台等</small></div><div><span>利润</span><b>160</b><small>目标 180 · 少 20</small></div></div><div class="view-callout"><b>收入多 20 万，利润仍少 20 万：</b>毛利比目标少 10 万；费用比按目标倒推的可承受额 250 万多 10 万。费用差额来源还需核对。</div>`))+
    section('支出落在哪些经营对象','总支出 1,060 万＝采购成本 800＋经营费用 260',
      panel('支出分布',`<div class="tiny-tabs" role="tablist"><button type="button" data-spend-view="store" class="active" aria-selected="true">按店铺</button><button type="button" data-spend-view="line" aria-selected="false">按品线</button><button type="button" data-spend-view="platform" aria-selected="false">按平台</button></div>`,`<div class="view-grid one-three"><div id="spendPie"></div><div id="spendTable"></div></div><p class="view-note">同一笔支出只计一次。店铺、品线负责团队和平台只是三种观察维度，不互相相加。</p>`))+
    section('费用具体花在哪里','经营费用及汇率影响合计 260 万，采购成本单列',
      `<div class="view-grid">${panel('费用分布','本月预计 · 万元',bars(FEES)+`<p class="view-note">履约／物流 80、广告 64、平台 45、仓储 30、售后 22、汇率及其他 19，合计 260 万。</p>`)}${panel('费用分析','偏差与效果要分开',`<div class="view-stack">${focus('广告费预计 64 / 预算 60','预计超预算 4 万。先定位店铺和商品，再看相应利润。','品线 A 的调整已执行，10.23 核验效果。','todos')}${focus('商品 C-008 的投入接近上限','累计投入 5.8 / 上限 6 万；销售 17 / 目标 25，退货率 4.1%。','继续投入前先查退货与利润。','goods')}${focus('店铺 B 履约费仍高于目标','单均费用 18 → 16 元，目标不高于 15 元。','核时效、订单结构与后续利润。','channel')}</div>`)}</div>`)+archiveNote();
}

function goodsDetail(item) {
  return `<div class="goods-detail-head"><div><span class="view-badge ${item.tags.includes('loss')?'bad':item.tags.includes('shortage')||item.tags.includes('aged')?'warn':'good'}">${item.tag}</span><h3>${item.name}</h3></div><span>${item.line} · 重点商品样本</span></div><div class="goods-detail-grid"><div><h4>已知数据</h4><ul>${item.known.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>待核数据</h4><p>${item.check}</p><h4>处理动作</h4><p>${item.next}</p></div></div>`;
}
function goods() {
  const ages=[['0—30 天',250],['31—90 天',192],['91—179 天',48],['180 天以上',20]];
  const ageBar=`<div class="view-age" role="img" aria-label="${ages.map(x=>x[0]+x[1]+'万元').join('，')}">${ages.map(x=>`<span style="width:${(x[1]/510*100).toFixed(4)}%"></span>`).join('')}</div><div class="view-age-key">${ages.map(x=>`<div><span>${x[0]}</span><b>${x[1]} 万</b></div>`).join('')}</div>`;
  const productRows=GOODS.map(x=>`<tr data-good-row data-good-line="${x.line}" data-good-tags="${x.tags.join(' ')}"><td><b>${x.name}</b><span class="small">${x.line}</span></td><td>${x.result}</td><td>${x.stock}</td><td>${x.risk}</td><td>${x.input}</td><td><button type="button" class="goods-row-button" data-good-select="${x.id}" aria-label="查看${x.name}的分析依据">查看依据 ↗</button></td></tr>`).join('');
  const profitSamples=[['B102','商品 B-102',14],['E011','商品 E-011',9],['C008','商品 C-008',-3]];
  const profitGraphic=`<div class="goods-profit-axis"><span>亏损</span><span>0</span><span>盈利</span></div>${profitSamples.map(([id,name,value])=>`<button type="button" class="goods-profit-row" data-good-select="${id}" aria-label="查看${name}，利润${value>0?'+':''}${value}万元"><span>${name}</span><span class="goods-profit-track"><i class="zero"></i><i class="goods-profit-bar ${value<0?'loss':'gain'}" style="left:${value<0?25-Math.abs(value)/3*22:25}%;width:${value<0?Math.abs(value)/3*22:value/14*68}%"></i></span><b class="${value<0?'bad':'good'}">${value>0?'+':''}${value} 万</b></button>`).join('')}<div class="goods-pending"><button type="button" data-good-select="A006">新品 A-006 <span>阶段验证</span></button><button type="button" data-good-select="D021">商品 D-021 <span>利润待核</span></button></div>`;
  const inventoryGraphic=`<div class="goods-stock-legend"><span><i class="young"></i>90 天内</span><span><i class="old"></i>90 天以上</span></div>${INVENTORY.map(x=>`<div class="goods-stock-row"><span>${x.name}</span><div class="goods-stock-track"><div class="goods-stock-total" style="width:${(x.value/230*100).toFixed(1)}%"><i class="young" style="width:${((x.value-x.old)/x.value*100).toFixed(1)}%"></i><i class="old" style="width:${(x.old/x.value*100).toFixed(1)}%"></i></div></div><b>${x.value} 万</b></div>`).join('')}<div class="goods-stock-summary"><span>货值合计 <b>510 万</b></span><span>90 天以上 <b class="bad">68 万</b></span></div>`;
  return head('商品与库存分析','先看哪些商品值得继续做、哪些货可能断供或积压，再落到同一商品的处理依据。')+
    kpis([['在营商品','48','款','盈利 35 · 亏损 8 · 持平 5'],['当前货值','510','万','位置与库龄分别观察'],['90 天以上货值','68','万','其中 180 天以上 20','bad'],['重点样本缺货风险','1','款','商品 B-102 · 可能断货 8 天','bad']])+
    section('商品盈亏与库存结构','',`<div class="view-grid goods-overview">${panel('重点商品盈亏','五款重点样本 · 万元',profitGraphic)}${panel('库存货值分布','按仓位及库龄 · 万元',inventoryGraphic)}</div>`)+
    section('重点商品清单','按品线和当前情况筛选；这里只列五款重点样本',
      panel('商品明细',`<div class="goods-filter-line"><label>品线 <select class="view-filter" id="goodsLine"><option value="all">全部</option><option value="品线 A">品线 A</option><option value="品线 B">品线 B</option><option value="品线 C">品线 C</option></select></label><span id="goodsCount">显示 5 款重点商品</span></div>`,
        `<div class="tiny-tabs goods-tabs" role="tablist"><button type="button" data-goods-filter="all" class="active" aria-selected="true">全部</button><button type="button" data-goods-filter="loss" aria-selected="false">亏损</button><button type="button" data-goods-filter="shortage" aria-selected="false">缺货风险</button><button type="button" data-goods-filter="aged" aria-selected="false">高库龄</button><button type="button" data-goods-filter="new" aria-selected="false">新品验证</button></div><div class="scroll"><table class="table goods-table"><thead><tr><th>商品 / 品线</th><th>经营表现</th><th>货值位置</th><th>库龄 / 风险</th><th>投入 / 质量</th><th>分析</th></tr></thead><tbody>${productRows}</tbody></table></div><p class="view-note" id="goodsEmpty" hidden>当前条件下没有重点商品样本；可切换品线或情况查看。</p><div class="goods-detail" id="goodsDetail" aria-live="polite">${goodsDetail(GOODS[0])}</div><p class="view-note">商品利润、货值和投入属于不同口径，不能直接相加；点击商品可看到决定前需要核对的条件。</p>`))+
    section('货值位置','货在哪里：平台仓、海外仓、国内仓和在途合计 510 万',
      `<div class="view-map">${document.getElementById('inventoryMapTemplate').innerHTML}</div>`)+
    section('库龄与品线归属','同一批货的两种观察维度，不能把两张表的金额再相加',
      `<div class="view-grid">${panel('库龄分布','90 天以上 68 万',ageBar+`<p class="view-note">180 天以上 20 万已包含在 90 天以上 68 万中。高库龄提示资金占用，处理方式还要看利润、回款和缺货风险。</p>`)}${panel('品线货值','货值合计 510 万',table(['负责团队','货值','90 天以上','其中 180 天以上'],TEAMS.map(x=>[x.name,`${x.stock} 万`,`${x.old} 万`,`${x.veryOld} 万`]))+`<p class="view-note">品线 A 货值 300 万、90 天以上 40 万；需继续落到具体商品和仓位。</p>`)}</div>`)+archiveNote();
}

function channel() {
  return head('店铺利润与投入产出','按平台、店铺比较收入、支出与利润；广告投产只能说明其中一项投入效率。')+
    kpis([['预计收入','1,220','万','五店合计'],['预计支出','1,060','万','五店合计'],['预计利润','160','万','目标 180 · 少 20','bad'],['在营店铺','5','家','分属 3 个平台']])+
    section('平台之间有什么差异','平台数值按所属店铺汇总，与公司合计一致',
      `<div class="view-grid one-three">${panel('平台收入分布','预计收入 1,220 万',pie(PLATFORMS,'income'))}${panel('平台经营结果','收入 − 支出＝利润',table(['平台','收入','支出','利润','利润率'],PLATFORMS.map(p=>[p.name,`${p.income} 万`,`${p.expense} 万`,`${p.profit} 万`,pct(p.profit,p.income)]))+`<p class="view-note">Amazon 含店铺 A、B、D；Walmart 含 C；TikTok Shop 含 E。</p>`)}</div>`)+
    section('店铺哪家赚钱、哪家没达标','同层对比利润与目标，不把广告投产当作利润',
      panel('五家店铺','点击平台筛选店铺',`<div class="tiny-tabs" role="tablist"><button type="button" data-channel-platform="all" class="active" aria-selected="true">全部平台</button>${PLATFORMS.map(p=>`<button type="button" data-channel-platform="${p.name}" aria-selected="false">${p.name}</button>`).join('')}</div><div id="channelRows"></div>`))+
    section('店铺 B 能否追加投入','利润高于目标，但履约约束仍未达到',
      `<div class="view-grid">${panel('当前已经知道的结果','店铺 B · 本月预计',`<div class="view-split-number"><span>收入 / 支出 / 利润</span><b>210 / 184 / 26 万</b></div><div class="view-split-number"><span>利润目标</span><b>20 万</b></div><div class="view-split-number"><span>广告投产样例</span><b>4.0</b></div><p class="view-note">广告投产＝广告归因销售额 ÷ 广告费，不含采购、履约、售后等全部成本。</p>`)}${panel('做决定前还要核对什么','管理约束',`<div class="view-stack">${focus('履约费用未达预期','单均费用由 18 元降至 16 元，仍高于 15 元目标。')}${focus('订单与库存承接能力','若追加投入，需要核对新增订单的履约时效和库存。')}${focus('完整投入与利润影响','不能只依据广告投产 4.0 或利润高于目标 6 万就直接增配。','','todos')}</div>`)}</div>`)+archiveNote();
}

function todos() {
  const rows=ACTIONS.map(a=>`<tr data-action-kind="${a.kind}"><td><b>${a.name}</b><span class="small">${a.id}</span></td><td><span class="view-badge ${a.kind==='bad'?'bad':a.kind==='open'?'warn':'good'}">${a.status}</span></td><td>${a.next}</td><td>${a.result}</td><td>${a.owner}<span class="view-result">${a.due}</span></td></tr>`).join('');
  return head('经营待办','把需要拍板的事项与已经安排的动作分开；执行后还要看实际结果。')+
    kpis([['待决策事项','2','项','店铺增配、商品缺货'],['动作记录','6','条','原定计划和事项动作并存'],['已执行待验证','1','条','广告再分配'],['效果未达标','1','条','店铺 B 履约费用','bad']])+
    section('待决策事项','这里放需要作出选择的事，已有动作在下方查看',
      `<div class="view-decision-grid"><article class="view-decision"><h3>店铺 B 投入增配</h3><div class="summaryline"><span>利润预计 <b>26 万</b></span><span>目标 <b>20 万</b></span><span>履约费 <b>16 元/单</b></span></div><p>利润高于目标 6 万，但履约费仍高于 15 元目标。需核完整费用、库存及可承接订单量。</p><details><summary>决策依据</summary><p>广告投产样例 4.0 只包含广告归因销售与广告费；不能单独作为追加资源的依据。</p>${link('channel','店铺分析')}</details></article><article class="view-decision"><h3>商品 B-102 缺货处理</h3><div class="summaryline"><span>可售 <b>9 天</b></span><span>在途预计 <b>17 天后</b>到</span><span>可能断货 <b class="bad">8 天</b></span></div><p>先确认真实到货日和可调拨量，再决定补货、调拨或销售安排。</p><details><summary>决策依据</summary><p>当前 8 天是按可售天数与预计到货差额计算的风险窗口，实际影响需核订单节奏和可调拨库存。</p>${link('goods','商品与库存分析')}</details></article></div>`)+
    section('最近动作监控','执行状态、下一步和实际结果分开记录',
      panel('动作清单',`<div class="tiny-tabs" role="tablist"><button class="active" data-action-filter="all" aria-selected="true">全部 6 条</button><button data-action-filter="open" aria-selected="false">待推进</button><button data-action-filter="check" aria-selected="false">待验证</button><button data-action-filter="bad" aria-selected="false">效果未达标</button></div>`,`<div class="scroll"><table class="table view-actions-table"><thead><tr><th>动作 / 来源</th><th>执行状态</th><th>下一步</th><th>实际结果</th><th>负责人 / 时间</th></tr></thead><tbody id="actionRows">${rows}</tbody></table></div>`))+archiveNote();
}

const PAGES={goals,profit,revenue,goods,cost,channel,todos};
function revealPies() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const play=pie=>{pie.classList.remove('revealing');void pie.offsetWidth;pie.classList.add('revealing');};
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){play(entry.target);observer.unobserve(entry.target);}}),{threshold:.35});
    document.querySelectorAll('.view-pie').forEach(pie=>observer.observe(pie));
  } else document.querySelectorAll('.view-pie').forEach(play);
}
function bindProfit() {
  if (!document.getElementById('viewProfitChart')) return;
  const draw=()=>{
    const from=document.getElementById('viewProfitStart').value,to=document.getElementById('viewProfitEnd').value;
    const days=Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000)+1;
    const msg=document.getElementById('viewProfitMessage');
    if(!from||!to||days<1||days>30||from<'2026-09-01'||to>'2026-10-18') {msg.textContent='请选择 2026.09.01—10.18 之间、最多 30 天的日期范围。';msg.classList.add('bad');return;}
    const entries=[...DAILY_PROFIT].filter(([date])=>date>=from&&date<=to);
    if(entries.length!==days){msg.textContent='所选日期缺少演示数据。';msg.classList.add('bad');return;}
    msg.classList.remove('bad');
    msg.textContent=`显示 ${from.slice(5).replace('-','.')}—${to.slice(5).replace('-','.')}，共 ${days} 天；期间合计 ${entries.reduce((s,x)=>s+x[1],0).toFixed(1)} 万。`;
    document.getElementById('viewProfitChart').innerHTML=lineChart(entries.map(x=>x[1]),entries.map(x=>x[0].slice(5).replace('-','.')));
  };
  document.getElementById('viewProfitApply').addEventListener('click',draw);draw();
  document.querySelectorAll('[data-profit-period]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-profit-period]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-selected',String(x===button));});
    document.querySelectorAll('[data-profit-view]').forEach(x=>x.hidden=x.dataset.profitView!==button.dataset.profitPeriod);
  }));
}
function bindSpend() {
  if(!document.getElementById('spendPie'))return;
  const scopes={store:STORES,line:TEAMS,platform:PLATFORMS};
  const draw=key=>{
    const data=scopes[key];
    document.getElementById('spendPie').innerHTML=pie(data,'expense');
    document.getElementById('spendTable').innerHTML=table(['对象','预计支出','占比','预计收入','预计利润'],data.map(x=>[x.name,`${x.expense} 万`,pct(x.expense,1060),`${x.income} 万`,`${x.profit} 万`]));
    document.querySelectorAll('[data-spend-view]').forEach(x=>{x.classList.toggle('active',x.dataset.spendView===key);x.setAttribute('aria-selected',String(x.dataset.spendView===key));});
    revealPies();
  };
  document.querySelectorAll('[data-spend-view]').forEach(x=>x.addEventListener('click',()=>draw(x.dataset.spendView)));
  draw('store');
}
function bindChannel() {
  if(!document.getElementById('channelRows'))return;
  const draw=key=>{
    const data=key==='all'?STORES:STORES.filter(x=>x.platform===key);
    document.getElementById('channelRows').innerHTML=table(['店铺','品线','国家','订单','收入','支出','利润 / 目标','利润率','单均利润','差额'],data.map(s=>[s.name,s.line,s.country,`${number(s.orders)} 单`,`${s.income} 万`,`${s.expense} 万`,`${s.profit} / ${s.target} 万`,pct(s.profit,s.income),`${Math.round(s.profit*10000/s.orders)} 元`,`<b class="${s.profit<s.target?'bad':'good'}">${s.profit<s.target?'少 '+(s.target-s.profit):s.profit>s.target?'多 '+(s.profit-s.target):'达标'}${s.profit===s.target?'':' 万'}</b>`]));
    document.querySelectorAll('[data-channel-platform]').forEach(x=>{x.classList.toggle('active',x.dataset.channelPlatform===key);x.setAttribute('aria-selected',String(x.dataset.channelPlatform===key));});
  };
  document.querySelectorAll('[data-channel-platform]').forEach(x=>x.addEventListener('click',()=>draw(x.dataset.channelPlatform)));
  draw('all');
}
function bindGoods() {
  const selector=document.getElementById('goodsLine');
  if(!selector)return;
  let tag='all';
  const choose=id=>{
    const item=GOODS.find(x=>x.id===id);
    if(!item)return;
    document.getElementById('goodsDetail').innerHTML=goodsDetail(item);
    document.querySelectorAll('[data-good-row]').forEach(row=>row.classList.toggle('selected',row.querySelector('[data-good-select]')?.dataset.goodSelect===id));
  };
  const update=()=>{
    const visible=GOODS.filter(x=>(selector.value==='all'||x.line===selector.value)&&(tag==='all'||x.tags.includes(tag)));
    document.querySelectorAll('[data-good-row]').forEach(row=>row.hidden=!visible.some(x=>x.id===row.querySelector('[data-good-select]').dataset.goodSelect));
    document.getElementById('goodsCount').textContent=`显示 ${visible.length} 款重点商品`;
    document.getElementById('goodsEmpty').hidden=visible.length>0;
    document.getElementById('goodsDetail').hidden=visible.length===0;
    if(visible.length)choose(visible[0].id);
  };
  selector.addEventListener('change',update);
  document.querySelectorAll('[data-goods-filter]').forEach(button=>button.addEventListener('click',()=>{
    tag=button.dataset.goodsFilter;
    document.querySelectorAll('[data-goods-filter]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-selected',String(x===button));});
    update();
  }));
  document.querySelectorAll('[data-good-select]').forEach(button=>button.addEventListener('click',()=>{
    if(button.closest('.goods-overview')){
      selector.value='all';
      tag='all';
      document.querySelectorAll('[data-goods-filter]').forEach(x=>{const selected=x.dataset.goodsFilter==='all';x.classList.toggle('active',selected);x.setAttribute('aria-selected',String(selected));});
      update();
    }
    choose(button.dataset.goodSelect);
    if(button.closest('.goods-overview'))document.getElementById('goodsDetail').scrollIntoView({behavior:'smooth',block:'center'});
  }));
  update();
}
function bindActions() {
  document.querySelectorAll('[data-action-filter]').forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.actionFilter;
    document.querySelectorAll('[data-action-filter]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-selected',String(x===button));});
    document.querySelectorAll('[data-action-kind]').forEach(row=>row.hidden=value!=='all'&&row.dataset.actionKind!==value);
  }));
}
function render() {
  let key=location.hash.slice(1);
  if(key==='product'||key==='inventory') {key='goods';history.replaceState(null,'','#goods');}
  const route=PAGES[key]?key:'goals';
  if(!PAGES[key])history.replaceState(null,'','#goals');
  document.getElementById('routeCrumb').textContent=ROUTES.find(x=>x[0]===route)[1];
  document.title=ROUTES.find(x=>x[0]===route)[1]+'｜经营管理中台';
  document.getElementById('viewMain').innerHTML=PAGES[route]();
  document.querySelectorAll('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===route);if(a.dataset.route===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  bindProfit();bindSpend();bindChannel();bindGoods();bindActions();revealPies();
  window.scrollTo({top:0,behavior:'instant'});
}
nav();window.addEventListener('hashchange',render);
