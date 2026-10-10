'use strict';

// All figures on the detail pages use the same demonstration ledger as the home page.
const V5_DAYS = ['10.12','10.13','10.14','10.15','10.16','10.17','10.18'];
const V5_INCOME = [31,34,35,37,36,39,42];
const V5_PURCHASE = [20,22,23,24,24,25.7,28];
const V5_FEES = [6,7.4,7.2,7.8,7.9,7.8,8.8];
const V5_PROFIT = [5,4.6,4.8,5.2,4.1,5.5,5.2];
const V5_STORE_COST = [
  {store:'店铺 A',purchase:240,fee:80},
  {store:'店铺 B',purchase:142,fee:42},
  {store:'店铺 C',purchase:90,fee:36},
  {store:'店铺 D',purchase:180,fee:55},
  {store:'店铺 E',purchase:148,fee:47}
];
const V5_AGE = [
  ['平台仓',130,80,15,5],['海外仓',50,68,22,10],
  ['国内仓',30,34,11,5],['在途',40,10,0,0]
];

const v5Signed = n => n === 0 ? '达标' : `${n > 0 ? '多' : '少'} ${number(Math.abs(n))} 万`;
const v5Tone = n => n < 0 ? 'bad' : 'good';
const v5Gap = (actual,target) => `<b class="${v5Tone(actual-target)}">${v5Signed(actual-target)}</b>`;
function v5Target(rows) {
  return `<div class="v5-targets">${rows.map(r=>{
    const delta=r.limit ? r.target-r.forecast : r.forecast-r.target;
    const ratio=Math.min(100,r.forecast/r.target*100);
    return `<div class="v5-target"><div class="v5-target-top"><b>${r.name}</b><strong class="${v5Tone(delta)}">${r.limit?delta<0?'超 '+number(-delta)+' 万':'未超':v5Signed(delta)}</strong></div><div class="v5-track"><i style="width:${ratio.toFixed(1)}%"></i><em></em></div><div class="v5-target-foot"><span>预计 ${number(r.forecast)} 万</span><span>${r.limit?'上限':'目标'} ${number(r.target)} 万</span></div></div>`;
  }).join('')}</div>`;
}
function v5Action(rows) {
  return `<div class="v5-action-list">${rows.map(r=>`<div class="v5-action-row"><div><b>${r.name}${r.status?`<i class="v5-pill ${r.statusTone||''}">${r.status}</i>`:''}</b><span>${r.object}</span></div><div><small>当前结果</small><strong>${r.result}</strong></div><div><small>下一次核验</small><strong>${r.next}</strong></div><div>${link(r.route,r.route==='todos'?'事项详情':'查看分析')}</div></div>`).join('')}</div>`;
}
function v5Matrix(headers,rows) {return table(headers,rows,'v5-table');}
function v5DayTable() {
  const rows=V5_DAYS.map((d,i)=>[d,`${V5_INCOME[i]} 万`,`${V5_PURCHASE[i]} 万`,`${V5_FEES[i]} 万`,`${V5_PROFIT[i]} 万`]);
  return v5Matrix(['日期','收入','采购成本','经营费用','利润'],rows);
}
function v5DailyCheck() {
  return '<p class="v5-footnote">10.12—10.18 为演示日报；每日收入 − 采购成本 − 经营费用 = 利润。金额单位：万元。</p>';
}
function v5StoreTable() {
  return v5Matrix(['店铺','平台','品线团队','收入','采购成本','费用','利润','目标差额'],STORES.map((s,i)=>[
    s.name,s.platform,s.line,`${s.income} 万`,`${V5_STORE_COST[i].purchase} 万`,`${V5_STORE_COST[i].fee} 万`,`${s.profit} 万`,v5Gap(s.profit,s.target)
  ]));
}
function v5StageProgress(rows) {
  return `<div class="v5-stage">${rows.map(r=>`<div class="v5-stage-row"><div><b>${r.name}</b><strong class="${v5Tone(r.actual-r.plan)}">${v5Signed(r.actual-r.plan)}</strong></div><div class="v5-track"><i style="width:${Math.min(100,r.actual/r.plan*100).toFixed(1)}%"></i><em></em></div><small>实际 ${r.actual} 万 · 阶段计划 ${r.plan} 万</small></div>`).join('')}</div>`;
}
function v5Scatter() {
  return `<div class="depth-scatter" role="img" aria-label="五家店铺收入与利润率对比"><div class="depth-scatter-axis y">利润率</div><div class="depth-scatter-axis x">收入 →</div><span class="depth-scatter-tick" style="left:16%;bottom:-18px">0</span><span class="depth-scatter-tick" style="left:52%;bottom:-18px">180</span><span class="depth-scatter-tick" style="left:88%;bottom:-18px">360 万</span>${STORES.map(s=>`<div class="depth-scatter-dot" style="left:${(16+s.income/360*72).toFixed(1)}%;bottom:${(14+s.profit/s.income/.17*69).toFixed(1)}%" title="${s.name}：收入${s.income}万，利润率${pct(s.profit,s.income)}"><i></i><span>${s.name}</span></div>`).join('')}</div>`;
}

function v5Goals() {
  return head('目标制定','')+
    kpis([['利润目标','180','万','月末预计 160 · 少 20','bad'],['收入目标','1,200','万','月末预计 1,220 · 多 20','good'],['毛利目标','430','万','月末预计 420 · 少 10','bad'],['回款目标','260','万','月末预计 265 · 多 5','good']])+
    section('公司目标与预计结果','',`<div class="view-grid">${panel('结果目标','月末预计 / 目标',v5Target([{name:'利润',forecast:160,target:180},{name:'收入',forecast:1220,target:1200},{name:'毛利',forecast:420,target:430},{name:'现金回款',forecast:265,target:260}]))}${panel('预算与占资上限','约束单独判断',v5Target([{name:'广告费',forecast:64,target:60,limit:true},{name:'月末库存占资',forecast:430,target:420,limit:true}])+`<div class="v5-inline-stats"><span>当前货值 <b>510 万</b></span><span>90 天以上 <b>68 万</b></span></div>`)}</div>`)+
    section('截至 10.18 阶段进度','',`<div class="view-grid one-three">${panel('实际与阶段计划','',v5StageProgress([{name:'利润',actual:85,plan:90},{name:'收入',actual:650,plan:630}]))}${panel('截至当日实际','',v5Matrix(['指标','实际','阶段计划','差额'],[['利润','85 万','90 万','<b class="bad">少 5 万</b>'],['收入','650 万','630 万','<b class="good">多 20 万</b>']])+`<div class="v5-inline-stats"><span>现金回款实际 <b>120 万</b></span></div>`)}</div>`)+
    section('品线与店铺利润目标','',`<div class="view-grid one-three">${panel('品线负责团队','三队目标合计 180 万',TEAMS.map(t=>`<div class="v5-team"><div><b>${t.name}</b><strong class="${v5Tone(t.profit-t.target)}">${v5Signed(t.profit-t.target)}</strong></div><div class="v5-track"><i style="width:${Math.min(100,t.profit/t.target*100)}%"></i></div><small>预计 ${t.profit} 万 / 目标 ${t.target} 万</small></div>`).join(''))}${panel('店铺目标','五店目标合计 180 万',v5Matrix(['店铺','目标','预计','差额'],STORES.map(s=>[s.name,`${s.target} 万`,`${s.profit} 万`,v5Gap(s.profit,s.target)])))}</div>`)+
    section('目标明细','',panel('店铺预计结果','收入、成本、费用与利润同口径',v5StoreTable()))+
    section('目标与动作','',panel('按对象核验','',v5Action([
      {name:'广告投入再分配',status:'待验证',statusTone:'warn',object:'品线 A · A-021',result:'广告预计 64 / 预算 60 万',next:'10.23 核广告效果和利润',route:'cost'},
      {name:'新品阶段验证',status:'进行中',object:'新品 A-006',result:'销售 32 / 目标 30 万；投入 6.5 / 上限 7 万',next:'10.25 核利润与质量',route:'goods'},
      {name:'高库龄库存处理',status:'方案待确认',statusTone:'warn',object:'店铺 D · 商品 D-021',result:'货值 16 万；拟处理 12 万，尚未出库',next:'核处理方式和回款',route:'goods'}
    ])))+archiveNote();
}

function v5Profit() {
  const products=[['商品 B-102','品线 A','+14 万','盈利 · 可售 9 天'],['商品 E-011','品线 C','+9 万','盈利 · 库龄 31—90 天'],['商品 C-008','品线 A','−3 万','亏损 · 海外仓货值 22 万'],['商品 A-014','品线 A','−2 万','亏损 · 近三日连续亏损']];
  return head('利润分析','')+
    kpis([['月末利润预计','160','万','目标 180 · 少 20','bad'],['截至 10.18 实际','85','万','阶段计划 90 · 少 5','bad'],['预计利润率','13.1','%','160 ÷ 1,220'],['毛利预计','420','万','目标 430 · 少 10','bad']])+
    section('利润进度','',`<div class="view-grid one-three">${panel('每日利润',`<div class="tiny-tabs" role="tablist"><button type="button" data-profit-period="day" class="active" aria-selected="true">按日</button><button type="button" data-profit-period="month" aria-selected="false">按月</button></div>`,`<div data-profit-view="day"><div class="view-controls"><label>开始 <input class="view-filter" id="viewProfitStart" type="date" min="2026-09-01" max="2026-10-18" value="2026-09-19"></label><label>结束 <input class="view-filter" id="viewProfitEnd" type="date" min="2026-09-01" max="2026-10-18" value="2026-10-18"></label><button class="view-btn" id="viewProfitApply" type="button">查询</button></div><div id="viewProfitChart"></div><p class="v5-footnote" id="viewProfitMessage" aria-live="polite"></p></div><div data-profit-view="month" hidden>${lineChart([135,143,149,146,152,160],['5 月','6 月','7 月','8 月','9 月','10 月预计'])}</div>`)}${panel('目标差额','公司 · 品线 · 店铺',v5Target([{name:'公司利润',forecast:160,target:180},{name:'品线 A 团队',forecast:80,target:100}])+`<div class="v5-compact-list"><span>店铺 A <b class="bad">少 10 万</b></span><span>店铺 C <b class="bad">少 16 万</b></span><span>店铺 B <b class="good">多 6 万</b></span></div>`)}</div>`)+
    section('财务日报','',`<div class="view-grid one-three">${panel('近七日收入、成本和利润','10.12—10.18',v5DayTable()+v5DailyCheck())}${panel('品线利润贡献','三支品线负责团队',TEAMS.map(t=>`<div class="v5-team"><div><b>${t.name}</b><strong>${t.profit} 万</strong></div><div class="v5-track"><i style="width:${t.profit/80*100}%"></i></div><small>收入 ${t.income} 万 · 利润率 ${pct(t.profit,t.income)}</small></div>`).join(''))}</div>`)+
    section('店铺与商品盈亏','',`<div class="view-grid one-three">${panel('五店利润与目标','',v5Matrix(['店铺','利润','目标','差额','利润率'],STORES.map(s=>[s.name,`${s.profit} 万`,`${s.target} 万`,v5Gap(s.profit,s.target),pct(s.profit,s.income)])))}${panel('重点商品盈亏','仅列样本',v5Matrix(['商品','品线','利润','当前情况'],products.map(p=>[p[0],p[1],`<b class="${p[2].startsWith('−')?'bad':'good'}">${p[2]}</b>`,p[3]]))+`<div class="depth-inline-link">${link('goods','商品明细')}</div>`)}</div>`)+
    section('店铺利润构成','',panel('五店收入、成本与费用','收入 − 采购成本 − 经营费用 = 利润',v5StoreTable()))+
    section('对应动作','',panel('差额处理','',v5Action([
      {name:'核店铺 C 低效投入及退货',status:'进行中',object:'店铺 C · 商品 C-008',result:'店铺利润预计 14 / 目标 30 万；商品亏损 3 万',next:'核退货原因与后续投入',route:'todos'},
      {name:'核店铺 A 尾程费用',status:'费用已核',statusTone:'good',object:'店铺 A · A-017',result:'利润预计 40 / 目标 50 万；费用范围已核',next:'测算利润影响',route:'todos'}
    ])))+archiveNote();
}

function v5RevenueMap(countries) {
  const storeNames=country=>STORES.filter(s=>s.country===country).map(s=>s.name.replace('店铺 ','')).join(' / ');
  const positions={
    美国:{x:280,y:153,boxX:105,boxY:220,path:'M280 153 V220'},
    加拿大:{x:223,y:86,boxX:18,boxY:26,path:'M223 86 H208 L193 61'},
    英国:{x:587,y:109,boxX:398,boxY:24,path:'M587 109 L573 81'},
    德国:{x:615,y:139,boxX:651,boxY:170,path:'M615 139 L651 170'},
    马来西亚:{x:885,y:248,boxX:832,boxY:295,path:'M885 248 V295'}
  };
  return `<div class="v5-revenue-map" role="group" aria-label="销售国家分布：${countries.map(c=>`${c.name} ${number(c.income)} 万元、${number(c.orders)} 单，店铺 ${storeNames(c.name)}`).join('；')}">
    <svg viewBox="0 20 1200 390" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="销售国家地图">
      <image href="./world-map.svg" width="1200" height="470" opacity=".76"/>
      ${countries.map(c=>{const p=positions[c.name];return `<g class="v5-revenue-map-country" data-country-select="${c.name}" role="button" tabindex="0" aria-label="查看${c.name}店铺" aria-pressed="false"><path class="v5-revenue-map-line" d="${p.path}"/><circle class="v5-revenue-map-halo" cx="${p.x}" cy="${p.y}" r="22"/><circle class="v5-revenue-map-dot" cx="${p.x}" cy="${p.y}" r="8"/><g class="v5-revenue-map-label" transform="translate(${p.boxX} ${p.boxY})"><rect width="190" height="66" rx="4"/><text x="12" y="25" class="country">${c.name}</text><text x="178" y="25" text-anchor="end" class="amount">${number(c.income)} 万</text><text x="12" y="50" class="orders">店铺 ${storeNames(c.name)} · ${number(c.orders)} 单</text></g></g>`;}).join('')}
    </svg>
    <div class="v5-revenue-map-mobile">${countries.map(c=>`<button type="button" data-country-select="${c.name}" aria-pressed="false"><b>${c.name}</b><strong>${number(c.income)} 万</strong><span>店铺 ${storeNames(c.name)} · ${number(c.orders)} 单</span></button>`).join('')}</div>
    <div class="v5-revenue-map-caption">按订单销售国家归属 · 点位表示国家位置</div>
  </div>`;
}

function v5Revenue() {
  const cash=[['Amazon',85,190],['Walmart',15,30],['TikTok Shop',20,45]];
  const countries=[...new Set(STORES.map(s=>s.country))].map(name=>({name,income:STORES.filter(s=>s.country===name).reduce((sum,s)=>sum+s.income,0),orders:STORES.filter(s=>s.country===name).reduce((sum,s)=>sum+s.orders,0)})).sort((a,b)=>b.income-a.income);
  return head('销售与回款分析','')+
    kpis([['月末收入预计','1,220','万','目标 1,200 · 多 20','good'],['截至 10.18 收入','650','万','阶段计划 630 · 多 20','good'],['订单预计','16,000','单','五店合计'],['月末回款预计','265','万','目标 260 · 多 5','good']])+
    section('收入目标与日变化','',`<div class="view-grid one-three">${panel('近七日收入','10.12—10.18 · 万元',lineChart(V5_INCOME,V5_DAYS)+`<div class="v5-inline-stats"><span>10.12 <b>31 万</b></span><span>10.18 <b>42 万</b></span><span>七日合计 <b>254 万</b></span></div>`)}${panel('收入与回款目标','',v5Target([{name:'销售收入',forecast:1220,target:1200},{name:'现金回款',forecast:265,target:260}])+`<div class="v5-inline-stats"><span>截至 10.18 已回款 <b>120 万</b></span></div>`)}</div>`)+
    section('订单与收入分布','',`<div class="view-grid">${panel('平台订单','16,000 单',pie(PLATFORMS,'orders')+v5Matrix(['平台','订单','客单价'],PLATFORMS.map(p=>[p.name,`${number(p.orders)} 单`,`${Math.round(p.income*10000/p.orders)} 元`])))}${panel('平台收入','1,220 万',pie(PLATFORMS,'income')+v5Matrix(['平台','收入','收入占比'],PLATFORMS.map(p=>[p.name,`${p.income} 万`,pct(p.income,1220)])))}</div>`)+
    section('店铺和国家','',`${panel('销售国家分布','按国家查看店铺',v5RevenueMap(countries))}<div class="view-grid one-three v5-revenue-map-details">${panel('五店收入与客单价','<button class="v5-country-reset" type="button" id="countryReset" hidden>显示全部国家</button>',v5Matrix(['店铺','平台','国家','订单','收入','客单价'],STORES.map(s=>[s.name,s.platform,s.country,number(s.orders),`${s.income} 万`,`${Math.round(s.income*10000/s.orders)} 元`])))}${panel('国家汇总','',countries.map(c=>`<button type="button" class="v5-team v5-country-row" data-country-select="${c.name}" aria-pressed="false"><div><b>${c.name}</b><strong>${c.income} 万</strong></div><div class="v5-track"><i style="width:${c.income/countries[0].income*100}%"></i></div><small>${number(c.orders)} 单 · 客单价 ${Math.round(c.income*10000/c.orders)} 元</small></button>`).join(''))}</div>`)+
    section('平台结算与现金回款','',panel('到账进度','截至 10.18 实际 / 月末预计',cash.map(([name,actual,forecast])=>`<div class="depth-receipt"><span>${name}</span><div class="depth-bar-rail"><i style="width:${(actual/forecast*100).toFixed(1)}%"></i></div><b>${actual} / ${forecast} 万</b></div>`).join('')+`<div class="v5-inline-stats"><span>累计已到账 <b>120 万</b></span><span>月末预计 <b>265 万</b></span><span>回款目标 <b>260 万</b></span></div>`))+
    section('待到账核对','',panel('平台结算明细','月末预计减去截至 10.18 已到账',v5Matrix(['平台','已到账','月末预计','预计剩余到账','待核'],cash.map(([name,actual,forecast])=>[name,`${actual} 万`,`${forecast} 万`,`${forecast-actual} 万`,'结算单、预计到账日']))))+archiveNote();
}

function v5Cost() {
  return head('成本与投入分析','')+
    kpis([['采购成本预计','800','万','收入 1,220 − 成本 800 = 毛利 420'],['经营费用及汇率','260','万','六类费用合计'],['广告预计','64','万','预算 60 · 超 4','bad'],['利润预计','160','万','目标 180 · 少 20','bad']])+
    section('成本、费用与利润','',`<div class="view-grid one-three">${panel('利润计算','本月预计 · 万元',`<div class="depth-waterfall"><div><span>收入</span><b>1,220</b></div><div><span>采购成本</span><b>−800</b></div><div><span>毛利</span><b>420</b></div><div><span>经营费用及汇率</span><b>−260</b></div><div><span>利润</span><b>160</b></div></div><div class="v5-inline-stats"><span>毛利目标 <b>430 万</b></span><span>利润目标 <b>180 万</b></span></div>`)}${panel('费用预算','',v5Target([{name:'广告费',forecast:64,target:60,limit:true},{name:'月末库存占资',forecast:430,target:420,limit:true}]))}</div>`)+
    section('财务日报','',`<div class="view-grid one-three">${panel('近七日采购成本与经营费用','10.12—10.18',v5DayTable()+v5DailyCheck())}${panel('费用结构','合计 260 万',bars(FEES)+`<div class="v5-inline-stats"><span>履约 / 物流 <b>80 万</b></span><span>广告 <b>64 万</b></span></div>`)}</div>`)+
    section('店铺成本与费用','',panel('五店成本、费用与利润','同一店铺收入 − 采购成本 − 费用 = 利润',v5StoreTable()))+
    section('总支出分布','',panel('支出占比','采购成本及经营费用合计 1,060 万',`<div class="tiny-tabs" role="tablist"><button type="button" data-spend-view="store" class="active" aria-selected="true">店铺</button><button type="button" data-spend-view="line" aria-selected="false">品线</button><button type="button" data-spend-view="platform" aria-selected="false">平台</button></div><div class="view-grid one-three"><div id="spendPie"></div><div id="spendTable"></div></div>`))+
    section('费用偏差与动作','',panel('已调整与待核验','',v5Action([
      {name:'品线 A 广告投入再分配',status:'待验证',statusTone:'warn',object:'A-021',result:'广告预计 64 / 预算 60 万；调整已执行',next:'10.23 核效果与利润',route:'todos'},
      {name:'店铺 B 履约安排调整',status:'未达目标',statusTone:'bad',object:'A-026',result:'单均履约费 18 → 16 元；目标 15 元',next:'10.22 核订单结构与费用',route:'todos'},
      {name:'商品 C-008 投入核对',status:'进行中',object:'店铺 C · 商品 C-008',result:'投入 5.8 / 上限 6 万；利润 −3 万',next:'核退货原因和继续投入',route:'goods'}
    ])))+archiveNote();
}

function v5Goods() {
  const age=[['0—30 天',250],['31—90 天',192],['91—179 天',48],['180 天以上',20]];
  const productRows=GOODS.map(x=>`<tr data-good-row data-good-line="${x.line}" data-good-tags="${x.tags.join(' ')}"><td><b>${x.name}</b><span class="small">${x.line}</span></td><td>${x.result}</td><td>${x.stock}</td><td>${x.risk}</td><td>${x.input}</td><td><button type="button" class="goods-row-button" data-good-select="${x.id}" aria-label="查看${x.name}的明细">查看 ↗</button></td></tr>`).join('');
  const profitGraphic=`<div class="goods-profit-axis"><span>亏损</span><span>0</span><span>盈利</span></div>${[['B102','商品 B-102',14],['E011','商品 E-011',9],['C008','商品 C-008',-3]].map(([id,name,value])=>`<button type="button" class="goods-profit-row" data-good-select="${id}" aria-label="查看${name}利润${value}万元"><span>${name}</span><span class="goods-profit-track"><i class="zero"></i><i class="goods-profit-bar ${value<0?'loss':'gain'}" style="left:${value<0?25-Math.abs(value)/3*22:25}%;width:${value<0?Math.abs(value)/3*22:value/14*68}%"></i></span><b class="${value<0?'bad':'good'}">${value>0?'+':''}${value} 万</b></button>`).join('')}<div class="goods-pending"><button type="button" data-good-select="A006">新品 A-006 <span>阶段验证</span></button><button type="button" data-good-select="D021">商品 D-021 <span>利润待核</span></button></div>`;
  const inventoryGraphic=`<div class="goods-stock-legend"><span><i class="young"></i>90 天内</span><span><i class="old"></i>90 天以上</span></div>${INVENTORY.map(x=>`<div class="goods-stock-row"><span>${x.name}</span><div class="goods-stock-track"><div class="goods-stock-total" style="width:${(x.value/230*100).toFixed(1)}%"><i class="young" style="width:${((x.value-x.old)/x.value*100).toFixed(1)}%"></i><i class="old" style="width:${(x.old/x.value*100).toFixed(1)}%"></i></div></div><b>${x.value} 万</b></div>`).join('')}<div class="goods-stock-summary"><span>货值合计 <b>510 万</b></span><span>90 天以上 <b class="bad">68 万</b></span></div>`;
  const heat=`<div class="scroll"><table class="table depth-heat"><thead><tr><th>仓位</th><th>0—30 天</th><th>31—90 天</th><th>91—179 天</th><th>180 天以上</th><th>合计</th></tr></thead><tbody>${V5_AGE.map(row=>`<tr><td>${row[0]}</td>${row.slice(1).map((v,i)=>`<td><span class="depth-heat-cell age-${i}" style="--alpha:${(v/130*.65+.08).toFixed(2)}">${v} 万</span></td>`).join('')}<td><b>${row.slice(1).reduce((a,b)=>a+b,0)} 万</b></td></tr>`).join('')}</tbody></table></div>`;
  return head('商品与库存分析','')+
    kpis([['在营商品','48','款','盈利 35 · 亏损 8 · 持平 5'],['当前货值','510','万','月末预计 430 · 上限 420','bad'],['90 天以上货值','68','万','其中 180 天以上 20','bad'],['缺货风险样本','1','款','商品 B-102 · 可能断货 8 天','bad']])+
    section('商品盈亏与库存货值','',`<div class="view-grid goods-overview">${panel('重点商品盈亏','万',profitGraphic)}${panel('仓位与库龄','万',inventoryGraphic)}</div>`)+
    section('库存目标与库龄结构','',`<div class="view-grid one-three">${panel('月末库存占资','',v5Target([{name:'月末库存占资',forecast:430,target:420,limit:true}])+`<div class="v5-inline-stats"><span>当前货值 <b>510 万</b></span><span>月末预计 <b>430 万</b></span></div>`)}${panel('库龄分布','货值合计 510 万',`<div class="view-age" role="img" aria-label="库龄分布">${age.map(x=>`<span style="width:${(x[1]/510*100).toFixed(4)}%"></span>`).join('')}</div><div class="view-age-key">${age.map(x=>`<div><span>${x[0]}</span><b>${x[1]} 万</b></div>`).join('')}</div>`)}</div>`)+
    section('重点商品明细','',panel('商品清单',`<div class="goods-filter-line"><label>品线 <select class="view-filter" id="goodsLine"><option value="all">全部</option><option value="品线 A">品线 A</option><option value="品线 B">品线 B</option><option value="品线 C">品线 C</option></select></label><span id="goodsCount">显示 5 款重点商品</span></div>`,`<div class="tiny-tabs goods-tabs" role="tablist"><button type="button" data-goods-filter="all" class="active" aria-selected="true">全部</button><button type="button" data-goods-filter="loss" aria-selected="false">亏损</button><button type="button" data-goods-filter="shortage" aria-selected="false">缺货风险</button><button type="button" data-goods-filter="aged" aria-selected="false">高库龄</button><button type="button" data-goods-filter="new" aria-selected="false">新品验证</button></div><div class="scroll"><table class="table goods-table"><thead><tr><th>商品 / 品线</th><th>经营表现</th><th>货值位置</th><th>库龄 / 风险</th><th>投入 / 质量</th><th>明细</th></tr></thead><tbody>${productRows}</tbody></table></div><p class="view-note" id="goodsEmpty" hidden>当前筛选无商品。</p><div class="goods-detail" id="goodsDetail" aria-live="polite">${goodsDetail(GOODS[0])}</div>`))+
    section('货值位置','',`<div class="view-map">${document.getElementById('inventoryMapTemplate').innerHTML}</div>`)+
    section('仓位与库龄交叉','',panel('货值交叉表','单位：万元',heat))+
    section('商品处理动作','',panel('按商品核验','',v5Action([
      {name:'核到货与调拨',status:'待决策',statusTone:'warn',object:'商品 B-102',result:'可售 9 天；在途预计 17 天后到',next:'核可能断货 8 天的覆盖方式',route:'todos'},
      {name:'核退货与继续投入',status:'进行中',object:'商品 C-008',result:'利润 −3 万；海外仓 22 万，其中 10 万超 90 天',next:'核退货原因和费用',route:'todos'},
      {name:'核高库龄处理',status:'方案待确认',statusTone:'warn',object:'商品 D-021',result:'国内仓 16 万；拟处理 12 万，尚未出库',next:'核出库方式及可回款额',route:'todos'}
    ])))+archiveNote();
}

function v5Channel() {
  return head('店铺利润与投入产出','')+
    kpis([['平台','3','个','Amazon / Walmart / TikTok Shop'],['店铺','5','家','分属三支品线负责团队'],['店铺利润合计','160','万','公司目标 180 · 少 20','bad'],['低于利润目标','2','家','店铺 A、C','bad']])+
    section('平台经营结果','',`<div class="view-grid one-three">${panel('平台收入与利润','万元',PLATFORMS.map(p=>`<div class="depth-dual-row"><b>${p.name}</b><div class="depth-bar"><span>收入</span><div class="depth-bar-rail"><i style="width:${p.income/850*100}%"></i></div><b>${p.income} 万</b></div><div class="depth-bar alt"><span>利润</span><div class="depth-bar-rail"><i style="width:${p.profit/850*100}%"></i></div><b>${p.profit} 万</b></div></div>`).join(''))}${panel('平台损益','',v5Matrix(['平台','收入','支出','利润','利润率','订单'],PLATFORMS.map(p=>[p.name,`${p.income} 万`,`${p.expense} 万`,`${p.profit} 万`,pct(p.profit,p.income),number(p.orders)])))}</div>`)+
    section('店铺目标与利润率','',`<div class="view-grid one-three">${panel('收入与利润率','点代表一家店铺',v5Scatter())}${panel('目标差额','',STORES.map(s=>`<div class="v5-team"><div><b>${s.name}</b><strong class="${v5Tone(s.profit-s.target)}">${v5Signed(s.profit-s.target)}</strong></div><div class="v5-track"><i style="width:${Math.min(100,s.profit/s.target*100)}%"></i></div><small>利润 ${s.profit} / 目标 ${s.target} 万 · 利润率 ${pct(s.profit,s.income)}</small></div>`).join(''))}</div>`)+
    section('五店明细','',panel('按平台查看',`<div class="tiny-tabs" role="tablist"><button type="button" data-channel-platform="all" class="active" aria-selected="true">全部</button>${PLATFORMS.map(p=>`<button type="button" data-channel-platform="${p.name}" aria-selected="false">${p.name}</button>`).join('')}</div>`,`<div id="channelRows"></div>`))+
    section('收入、费用与单均利润','',panel('店铺投入产出','',v5Matrix(['店铺','收入','支出','利润','订单','客单价','单均利润'],STORES.map(s=>[s.name,`${s.income} 万`,`${s.expense} 万`,`${s.profit} 万`,number(s.orders),`${Math.round(s.income*10000/s.orders)} 元`,`${Math.round(s.profit*10000/s.orders)} 元`]))))+
    section('对应动作','',panel('店铺差额处理','',v5Action([
      {name:'店铺 C 低效投入与退货',status:'进行中',object:'Walmart · 品线 A',result:'利润预计 14 / 目标 30 万；商品 C-008 退货率 4.1%',next:'核利润与退货原因',route:'todos'},
      {name:'店铺 A 尾程费用',status:'费用已核',statusTone:'good',object:'Amazon · 品线 A',result:'利润预计 40 / 目标 50 万；费用范围已核',next:'测算费用变化后的利润',route:'todos'},
      {name:'店铺 B 增配待决策',status:'待决策',statusTone:'warn',object:'Amazon · 品线 A',result:'利润预计 26 / 目标 20 万；履约费 16 / 目标 15 元',next:'核新增订单与费用影响',route:'todos'}
    ])))+archiveNote();
}

function v5Todos() {
  const rows=ACTIONS.map(a=>`<tr data-action-kind="${a.kind}"><td><b>${a.name}</b><span class="small">${a.id}</span></td><td><span class="view-badge ${a.kind==='bad'?'bad':a.kind==='open'?'warn':'good'}">${a.status}</span></td><td>${a.result}</td><td>${a.next}</td><td>${a.owner}<span class="view-result">${a.due}</span></td></tr>`).join('');
  return head('经营待办','')+
    kpis([['待决策','2','项','店铺 B 增配、商品 B-102 缺货'],['动作记录','6','条','含原定计划与事项动作'],['需继续核验','2','条','尾程费用、广告效果'],['效果未达标','1','条','店铺 B 履约费','bad']])+
    section('两项决策的关键数据','',`<div class="view-grid">${panel('店铺 B 投入增配','利润达标 · 履约费未达标',`<div class="v5-decision-metrics"><div><span>利润预计 / 目标</span><b class="good">26 / 20 万</b><div class="v5-track"><i style="width:100%"></i><em></em></div></div><div><span>履约费当前 / 目标</span><b class="bad">16 / 15 元</b><div class="v5-track bad"><i style="width:100%"></i><em></em></div></div></div>`)}${panel('商品 B-102 缺货处理','可售天数短于在途时间',`<div class="v5-days"><div class="covered" style="width:52.9%">可售 9 天</div><div class="gap" style="width:47.1%">风险 8 天</div></div><div class="v5-inline-stats"><span>在途预计 <b>17 天后到</b></span><span>当前利润 <b>+14 万</b></span></div>`)}</div>`)+
    section('待决策事项','',panel('决策台账','',v5Matrix(['事项','已知结果','需选择','决策前需核','关联分析'],[
      ['店铺 B 是否增配','利润预计 26 / 目标 20 万；履约费 16 / 目标 15 元','追加或保持现有投入','新增订单能否承接；完整费用及利润影响',link('channel','店铺分析')],
      ['商品 B-102 缺货处理','利润 +14 万；可售 9 天；在途 17 天后到','调拨、补货或调整销售安排','真实到货日、可调拨量、未来订单',link('goods','商品分析')]
    ])))+
    section('动作效果核验','',`<div class="view-grid">${panel('店铺 B 履约费用','A-026 · 调整已执行',`<div class="v5-compare"><div><span>调整前</span><b>18 元/单</b></div><div><span>当前</span><b>16 元/单</b></div><div><span>目标</span><b>15 元/单</b></div></div><div class="v5-status bad">当前仍高 1 元/单 · 10.22 核承运商和订单结构</div>`)}${panel('品线 A 广告再分配','A-021 · 待验证',`<div class="v5-compare"><div><span>广告预算</span><b>60 万</b></div><div><span>当前预计</span><b>64 万</b></div><div><span>预计超出</span><b>4 万</b></div></div><div class="v5-status">10.23 核广告效果及利润；当前不标记为已达效</div>`)}</div>`)+
    section('最近动作监控','',panel('六条动作',`<div class="tiny-tabs" role="tablist"><button type="button" class="active" data-action-filter="all" aria-selected="true">全部 6 条</button><button type="button" data-action-filter="open" aria-selected="false">待推进</button><button type="button" data-action-filter="check" aria-selected="false">待核验</button><button type="button" data-action-filter="bad" aria-selected="false">未达目标</button></div>`,`<div class="scroll"><table class="table view-actions-table"><thead><tr><th>动作 / 来源</th><th>状态</th><th>当前结果</th><th>下一步</th><th>负责人 / 日期</th></tr></thead><tbody id="actionRows">${rows}</tbody></table></div>`))+
    section('其他待核对象','',panel('商品与库存','',v5Action([
      {name:'新品 A-006 阶段验证',status:'进行中',object:'品线 A',result:'销售 32 / 目标 30 万；投入 6.5 / 上限 7 万',next:'10.25 核利润与质量',route:'goods'},
      {name:'商品 D-021 库存处理',status:'方案待确认',statusTone:'warn',object:'店铺 D · 国内仓',result:'90 天以上货值 16 万；拟处理 12 万，尚未出库',next:'核处理方案和可回款额',route:'goods'}
    ])))+archiveNote();
}

PAGES.goals=v5Goals;
PAGES.profit=v5Profit;
PAGES.revenue=v5Revenue;
PAGES.goods=v5Goods;
PAGES.cost=v5Cost;
PAGES.channel=v5Channel;
PAGES.todos=v5Todos;
render();
