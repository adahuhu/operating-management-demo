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
