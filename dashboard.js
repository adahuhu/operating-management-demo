const demoProfit = new Map();
const september = Array.from({length: 30}, (_, i) => Math.round((5.05 + Math.sin(i * 1.13) * .48 + Math.cos(i * .63) * .31) * 10) / 10);
const septemberCorrection = Math.round((152 - september.reduce((sum, value) => sum + value, 0)) * 10) / 10;
september[29] = Math.round((september[29] + septemberCorrection) * 10) / 10;
september.forEach((value, i) => demoProfit.set(`2026-09-${String(i + 1).padStart(2, '0')}`, value));
const october = [4.3,4.6,4.4,4.8,4.7,4.2,4.9,4.5,4.6,5.0,4.6,5.0,4.6,4.8,5.2,4.1,5.5,5.2];
october.forEach((value, i) => demoProfit.set(`2026-10-${String(i + 1).padStart(2, '0')}`, value));

function displayDate(iso) { return iso.slice(5).replace('-', '.'); }
function utcDay(iso) { return Date.parse(`${iso}T00:00:00Z`); }
function renderDailyProfit() {
  const from = document.getElementById('profitStart').value;
  const to = document.getElementById('profitEnd').value;
  const message = document.getElementById('profitRangeMessage');
  const dayCount = Math.round((utcDay(to) - utcDay(from)) / 86400000) + 1;
  if (!from || !to || !Number.isFinite(dayCount) || dayCount < 1 || dayCount > 30 || from < '2026-09-01' || to > '2026-10-18') {
    message.textContent = '请选择 2026.09.01—10.18 之间、最多 30 天的日期范围。';
    message.classList.add('error');
    return;
  }
  const entries = [...demoProfit].filter(([date]) => date >= from && date <= to);
  if (entries.length !== dayCount) {
    message.textContent = '所选日期缺少演示数据，请重新选择。';
    message.classList.add('error');
    return;
  }
  message.classList.remove('error');
  message.textContent = `显示 ${displayDate(from)}—${displayDate(to)}，共 ${dayCount} 天`;
  const x = i => 46 + i * 758 / Math.max(1, entries.length - 1);
  const y = value => 195 - value * 20;
  const line = entries.map(([, value], i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(entries.length - 1).toFixed(1)},195 L46,195 Z`;
  const grid = [0,2,4,6,8].map(value => `<path class="chart-grid" d="M46 ${y(value)}H804"/><text class="daily-y" x="13" y="${y(value)+3}">${value}</text>`).join('');
  const dots = entries.map(([date,value],i) => `<circle class="daily-dot" cx="${x(i).toFixed(1)}" cy="${y(value).toFixed(1)}" r="${i === entries.length-1 ? 5 : 2.8}"><title>${displayDate(date)}：${value.toFixed(1)} 万</title></circle>`).join('');
  const last = entries[entries.length - 1];
  const labelX = Math.min(744,Math.max(60,x(entries.length - 1)-23));
  const svg = document.getElementById('profitDailyChart');
  svg.innerHTML = `${grid}<path class="daily-fill" d="${area}"/><path class="daily-line" d="${line}"/>${dots}<text class="daily-label" x="${labelX}" y="${Math.max(22,y(last[1])-11)}">${last[1].toFixed(1)} 万</text>`;
  svg.setAttribute('aria-label', `${displayDate(from)}至${displayDate(to)}每日利润变化，共${dayCount}天；最后一天${last[1].toFixed(1)}万元`);
  const ticks = Math.min(6,entries.length);
  document.getElementById('profitDailyAxis').innerHTML = Array.from({length:ticks},(_,i) => `<span>${displayDate(entries[Math.round(i*(entries.length-1)/Math.max(1,ticks-1))][0])}</span>`).join('');
  const values = entries.map(([,value]) => value);
  const total = Math.round(values.reduce((a,b) => a+b,0)*10)/10;
  const max = Math.max(...values), min = Math.min(...values);
  document.getElementById('profitRangeSummary').innerHTML = `期间利润 <b>${total.toFixed(1)} 万</b> · 日均 ${(total/dayCount).toFixed(1)} 万 · 最高 ${max.toFixed(1)} / 最低 ${min.toFixed(1)} 万`;
}
document.getElementById('profitRangeApply').addEventListener('click', renderDailyProfit);
renderDailyProfit();

const expenseData = {
  store: [
    {name:'店铺 A',expense:320,income:360,profit:40},
    {name:'店铺 B',expense:184,income:210,profit:26},
    {name:'店铺 C',expense:126,income:140,profit:14},
    {name:'店铺 D',expense:235,income:280,profit:45},
    {name:'店铺 E',expense:195,income:230,profit:35}
  ],
  line: [
    {name:'品线 A 团队',expense:630,income:710,profit:80},
    {name:'品线 B 团队',expense:235,income:280,profit:45},
    {name:'品线 C 团队',expense:195,income:230,profit:35}
  ],
  platform: [
    {name:'Amazon',expense:739,income:850,profit:111},
    {name:'Walmart',expense:126,income:140,profit:14},
    {name:'TikTok Shop',expense:195,income:230,profit:35}
  ]
};
const expenseColors = ['#587EB8','#C79A58','#509D93','#B4757B','#8D7CB1'];
function renderExpense(scope) {
  const rows = expenseData[scope];
  const total = rows.reduce((sum,row) => sum+row.expense,0);
  let offset = 0;
  const slices = rows.map((row,i) => {
    const start = offset;
    offset += row.expense / total * 100;
    return `${expenseColors[i]} ${start.toFixed(4)}% ${offset.toFixed(4)}%`;
  });
  const pie = document.getElementById('expensePie');
  pie.style.background = `conic-gradient(${slices.join(',')})`;
  pie.setAttribute('aria-label', `按${{store:'店铺',line:'品线',platform:'平台'}[scope]}查看支出分布：${rows.map(row=>`${row.name}${row.expense}万元`).join('，')}`);
  document.getElementById('expenseLegend').innerHTML = rows.map((row,i) => `<div><i style="background:${expenseColors[i]}"></i><span>${row.name}</span><b>${(row.expense/total*100).toFixed(1)}%</b></div>`).join('');
  document.getElementById('expenseRows').innerHTML = rows.map(row => `<tr><td>${row.name}</td><td>${row.expense} 万</td><td>${(row.expense/total*100).toFixed(1)}%</td><td>${row.income} 万</td><td>${row.profit} 万</td></tr>`).join('') + `<tr><td>合计</td><td>${total.toLocaleString()} 万</td><td>100%</td><td>1,220 万</td><td>160 万</td></tr>`;
  document.querySelectorAll('[data-expense-scope]').forEach(button => button.setAttribute('aria-selected',String(button.dataset.expenseScope===scope)));
}
document.querySelectorAll('[data-expense-scope]').forEach(button => button.addEventListener('click',() => {
  renderExpense(button.dataset.expenseScope);
  revealPie(document.getElementById('expensePie'));
}));
renderExpense('store');

const reducedPieMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function revealPie(pie) {
  if (reducedPieMotion.matches) return;
  pie.classList.remove('pie-revealing');
  void pie.offsetWidth;
  pie.classList.add('pie-revealing');
}
if ('IntersectionObserver' in window) {
  const pieObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealPie(entry.target);
      pieObserver.unobserve(entry.target);
    });
  }, {threshold:.35});
  document.querySelectorAll('.pie').forEach(pie => pieObserver.observe(pie));
} else {
  document.querySelectorAll('.pie').forEach(revealPie);
}

// The four scope controls use the same store-level demonstration totals as the analysis views.
const scopeStores = [
  {name:'店铺 A',line:'品线 A',platform:'Amazon',country:'美国',income:360,purchase:240,fee:80,profit:40,target:50,orders:4500,stock:150,old:16},
  {name:'店铺 B',line:'品线 A',platform:'Amazon',country:'美国',income:210,purchase:142,fee:42,profit:26,target:20,orders:2600,stock:90,old:14},
  {name:'店铺 C',line:'品线 A',platform:'Walmart',country:'美国',income:140,purchase:90,fee:36,profit:14,target:30,orders:2200,stock:60,old:10},
  {name:'店铺 D',line:'品线 B',platform:'Amazon',country:'英国',income:280,purchase:180,fee:55,profit:45,target:45,orders:3500,stock:110,old:16},
  {name:'店铺 E',line:'品线 C',platform:'TikTok Shop',country:'英国',income:230,purchase:148,fee:47,profit:35,target:35,orders:3200,stock:100,old:12}
];
const scopeProducts = [
  {store:'店铺 A',name:'新品 A-006',state:'阶段验证中',detail:'销售 32 / 阶段目标 30 万；投入 6.5 / 上限 7 万'},
  {store:'店铺 B',name:'商品 B-102',state:'缺货风险',detail:'可售 9 天；在途预计 17 天后到'},
  {store:'店铺 C',name:'商品 C-008',state:'亏损且有积压',detail:'利润 −3 万；海外仓货值 22 万，其中 10 万超过 90 天'},
  {store:'店铺 D',name:'商品 D-021',state:'高库龄待处理',detail:'90 天以上货值 16 万；其中 12 万拟处理'},
  {store:'店铺 E',name:'商品 E-011',state:'正常观察',detail:'利润 +9 万；海外仓货值 18 万'}
];
const scopeActions = [
  {store:'店铺 A',name:'核对商品 A 尾程费用',state:'利润影响待测算',date:'10.17'},
  {store:'店铺 A',name:'新品 A-006 阶段验证',state:'10.25 汇总销量、投入和质量',date:'10.25'},
  {store:'店铺 A',name:'品线 A 广告投入再分配',state:'10.23 核效果与利润',date:'10.23'},
  {store:'店铺 B',name:'店铺 B 履约安排调整',state:'16 元/单，仍高于 15 元目标',date:'10.22'},
  {store:'店铺 C',name:'店铺 C 低效投入与退货',state:'核商品 C-008 退货原因',date:'10.21'},
  {store:'店铺 D',name:'店铺 D 高库龄库存处理',state:'拟处理 12 万，方案待确认',date:'10.22'}
];
const scopeControls = {
  store:document.getElementById('filterStore'),
  line:document.getElementById('filterLine'),
  platform:document.getElementById('filterPlatform'),
  country:document.getElementById('filterCountry')
};
const fullCompanySections = [...document.querySelectorAll('main > .section, main > .footer')];
const filteredOverview = document.getElementById('filteredOverview');
const filterReset = document.getElementById('filterReset');
const scopeSum = (rows,key) => rows.reduce((total,row) => total+row[key],0);
const scopeNumber = value => value.toLocaleString('zh-CN');
const scopeDiff = value => value<0 ? `<span class="bad">少 ${-value} 万</span>` : value>0 ? `<span class="good">多 ${value} 万</span>` : '<span class="good">达到目标</span>';

function updateScope() {
  const selected = Object.fromEntries(Object.entries(scopeControls).map(([key,control]) => [key,control.value]));
  const active = Object.values(selected).some(value => value!=='all');
  filterReset.hidden = !active;
  fullCompanySections.forEach(section => { section.hidden=active; });
  filteredOverview.hidden = !active;
  if (!active) { filteredOverview.innerHTML=''; return; }

  const rows = scopeStores.filter(row => Object.entries(selected).every(([key,value]) => value==='all'||row[key==='store'?'name':key]===value));
  const labels = [['store','店铺'],['line','品线'],['platform','平台'],['country','国家']]
    .filter(([key]) => selected[key]!=='all').map(([key,label]) => key==='store'||key==='line'?selected[key]:`${label} ${selected[key]}`);
  const heading = labels.join(' · ');
  if (!rows.length) {
    filteredOverview.innerHTML = `<section class="section"><div class="sectionhead"><h2>当前筛选 · ${heading}</h2></div><div class="panel scope-empty">这些条件下没有对应的演示店铺。请调整筛选项或点击“重置筛选”。</div></section>`;
    return;
  }

  const total = Object.fromEntries(['income','purchase','fee','profit','target','orders','stock','old'].map(key => [key,scopeSum(rows,key)]));
  const margin = ((total.income-total.purchase)/total.income*100).toFixed(1);
  const names = new Set(rows.map(row=>row.name));
  const products = scopeProducts.filter(item=>names.has(item.store));
  const actions = scopeActions.filter(item=>names.has(item.store));
  const maxIncome = Math.max(...rows.map(row=>row.income));
  const cards = [
    ['利润 · 本月预计',total.profit,'万',`目标 ${total.target} 万 · ${scopeDiff(total.profit-total.target)}`],
    ['收入 · 本月预计',total.income,'万',`${scopeNumber(total.orders)} 单 · ${rows.length} 家店铺`],
    ['毛利率 · 本月预计',margin,'%',`毛利 ${total.income-total.purchase} 万`],
    ['采购成本 · 本月预计',total.purchase,'万',`收入减成本得毛利 ${total.income-total.purchase} 万`],
    ['经营费用 · 本月预计',total.fee,'万',`收入 − 成本 − 费用 = 利润 ${total.profit} 万`],
    ['货值 · 当前库存占资',total.stock,'万',`其中 90 天以上 ${total.old} 万`]
  ];
  filteredOverview.innerHTML = `
    <section class="section"><div class="sectionhead"><h2>经营结果分析</h2><span>当前筛选：${heading} · ${rows.length} 家店铺</span></div>
      <div class="hero">${cards.map(([title,value,unit,note])=>`<article class="hero-card scope-card"><div class="tagline"><span>${title}</span></div><div class="big">${scopeNumber(value)} <small>${unit}</small></div><div class="compare">${note}</div></article>`).join('')}</div>
    </section>
    <section class="section"><div class="sectionhead"><h2>利润与收入分析</h2><span>本月预计 · 万元</span></div>
      <div class="grid2 wide-left"><article class="panel"><div class="panelhead"><h3>经营对象表现</h3><span>按筛选范围汇总</span></div>
        <div class="scroll"><table class="table scope-table"><thead><tr><th>店铺 / 品线</th><th>平台 / 国家</th><th>收入</th><th>成本</th><th>费用</th><th>利润 / 目标</th><th>订单</th></tr></thead><tbody>
        ${rows.map(row=>`<tr><td>${row.name}<small>${row.line}</small></td><td>${row.platform}<small>${row.country}</small></td><td>${row.income}</td><td>${row.purchase}</td><td>${row.fee}</td><td>${row.profit} / ${row.target}</td><td>${scopeNumber(row.orders)}</td></tr>`).join('')}
        <tr><td>合计</td><td>${rows.length} 家店铺</td><td>${total.income}</td><td>${total.purchase}</td><td>${total.fee}</td><td>${total.profit} / ${total.target}</td><td>${scopeNumber(total.orders)}</td></tr>
        </tbody></table></div></article>
        <article class="panel"><div class="panelhead"><h3>收入贡献与利润目标</h3></div>
        ${rows.map(row=>`<div class="scope-contribution"><div><strong>${row.name}</strong><span>收入 ${row.income} 万 · 利润 ${row.profit} 万</span></div><div class="rail"><i style="width:${(row.income/maxIncome*100).toFixed(1)}%"></i></div><small>利润目标 ${row.target} 万 · ${scopeDiff(row.profit-row.target)}</small></div>`).join('')}</article></div>
    </section>
    <section class="section"><div class="sectionhead"><h2>成本与货值分析</h2><span>同一筛选范围</span></div>
      <div class="grid2"><article class="panel"><div class="panelhead"><h3>成本与费用</h3><span>预计合计 ${total.purchase+total.fee} 万</span></div>
        <div class="lineage scope-lineage"><div><span>收入</span><b>${total.income}</b></div><div><span>减：采购成本</span><b>${total.purchase}</b></div><div><span>减：经营费用</span><b>${total.fee}</b></div><div><span>利润</span><b>${total.profit}</b></div></div></article>
      <article class="panel"><div class="panelhead"><h3>货值与库龄</h3><span>当前合计 ${total.stock} 万</span></div>
        ${rows.map(row=>`<div class="scope-stock-row"><span>${row.name}</span><span>货值 ${row.stock} 万</span><b>90 天以上 ${row.old} 万</b></div>`).join('')}</article></div>
    </section>
    <section class="section"><div class="sectionhead"><h2>重点商品与动作</h2><span>与当前筛选对象对应</span></div>
      <div class="grid2"><article class="panel"><div class="panelhead"><h3>商品情况</h3></div>
        ${products.map(item=>`<div class="scope-list-row"><b>${item.name}</b><span>${item.state}</span><small>${item.detail}</small></div>`).join('')}</article>
      <article class="panel"><div class="panelhead"><h3>最近动作监控</h3></div>
        ${actions.length?actions.map(item=>`<div class="scope-list-row"><b>${item.name}</b><span>${item.date}</span><small>${item.state}</small></div>`).join(''):'<p class="panelnote">当前筛选范围内没有待推进的演示动作。</p>'}</article></div>
    </section>
    <p class="scope-disclaimer">筛选结果按演示店铺归属汇总；以上数字、商品和动作均为虚构演示数据。</p>`;
}
Object.values(scopeControls).forEach(control=>control.addEventListener('change',updateScope));
filterReset.addEventListener('click',()=>{Object.values(scopeControls).forEach(control=>{control.value='all';});updateScope();});
updateScope();
