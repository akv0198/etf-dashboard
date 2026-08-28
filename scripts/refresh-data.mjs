import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const configs=await readJson('config/etfs.json'); const marketConfigs=await readJson('config/markets.json');
let previous={etfs:[],markets:[]}; try{previous=await readJson('public/data/dashboard.json')}catch{}
const warnings=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchJson(url, tries=3){let last;for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 ETF-Dashboard/1.0','Accept':'application/json'}});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return await r.json()}catch(e){last=e;await wait(700*(i+1))}}throw last}
async function resolveYahooSymbol(c){if(c.yahooSymbol)return c.yahooSymbol; const q=encodeURIComponent(c.isin||c.ticker);const j=await fetchJson(`https://query1.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=10&newsCount=0`);const hit=(j.quotes||[]).find(x=>x.isin===c.isin)||j.quotes?.[0];return hit?.symbol||null}
async function chart(symbol,range='5y'){const j=await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includeAdjustedClose=true&events=div%2Csplits`);const r=j.chart?.result?.[0];if(!r)throw new Error(`No chart result for ${symbol}`);const timestamps=r.timestamp||[];const q=r.indicators?.adjclose?.[0]?.adjclose||r.indicators?.quote?.[0]?.close||[];const history=timestamps.map((t,i)=>({date:new Date(t*1000).toISOString().slice(0,10),close:q[i]})).filter(x=>Number.isFinite(x.close));return {history,meta:r.meta||{}}}
const returnBetween=(latest,old)=>latest&&old?((latest/old)-1)*100:null;
function atOrBefore(history,target){for(let i=history.length-1;i>=0;i--)if(new Date(history[i].date)<=target)return history[i].close;return null}
function metrics(history){if(history.length<2)return {performance:{day:null,week:null,month:null,ytd:null,year:null,threeYear:null,fiveYear:null},high52:null,low52:null,volatility:null,maxDrawdown:null};const last=history.at(-1);const lastPx=last.close,lastDate=new Date(last.date); const p=d=>atOrBefore(history,new Date(lastDate.getTime()-d*864e5));const ytd=atOrBefore(history,new Date(Date.UTC(lastDate.getUTCFullYear(),0,1)));const yearHist=history.filter(x=>new Date(x.date)>=new Date(lastDate.getTime()-365*864e5)); const dailyReturns=[];for(let i=1;i<yearHist.length;i++)dailyReturns.push(yearHist[i].close/yearHist[i-1].close-1);const mean=dailyReturns.reduce((a,b)=>a+b,0)/(dailyReturns.length||1);const vol=dailyReturns.length>1?Math.sqrt(dailyReturns.reduce((s,x)=>s+(x-mean)**2,0)/(dailyReturns.length-1))*Math.sqrt(252)*100:null;let peak=-Infinity,mdd=0;for(const x of history){peak=Math.max(peak,x.close);mdd=Math.min(mdd,(x.close/peak-1)*100)}return {performance:{day:returnBetween(lastPx,history.at(-2)?.close),week:returnBetween(lastPx,p(7)),month:returnBetween(lastPx,p(30)),ytd:returnBetween(lastPx,ytd),year:returnBetween(lastPx,p(365)),threeYear:returnBetween(lastPx,p(365*3)),fiveYear:returnBetween(lastPx,p(365*5))},high52:yearHist.length?Math.max(...yearHist.map(x=>x.close)):null,low52:yearHist.length?Math.min(...yearHist.map(x=>x.close)):null,volatility:vol,maxDrawdown:mdd};}
function nullPerf(){return {day:null,week:null,month:null,ytd:null,year:null,threeYear:null,fiveYear:null}}

async function yahooTopHoldings(symbol){
  try{
    const j=await fetchJson(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=topHoldings`);
    const t=j.quoteSummary?.result?.[0]?.topHoldings;
    const raw=t?.holdings||[];
    const holdings=raw.slice(0,25).map(h=>({
      name:h.holdingName||h.symbol||'Unknown holding', ticker:h.symbol||null,
      weight:typeof h.holdingPercent?.raw==='number'?h.holdingPercent.raw*100:null,
      sector:null,country:null
    })).filter(h=>typeof h.weight==='number');
    const sectors=(t?.sectorWeightings||[]).flatMap(x=>Object.entries(x).map(([name,v])=>({name,weight:typeof v?.raw==='number'?v.raw*100:Number(v)*100}))).filter(x=>Number.isFinite(x.weight));
    return {holdings,sectors};
  }catch(e){warnings.push(`Top holdings ${symbol}: ${e.message}`);return {holdings:[],sectors:[]}}
}


async function yahooProfile(symbol){
  try{
    const j=await fetchJson(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`);
    const p=j.quoteSummary?.result?.[0]?.assetProfile||{};
    return {sector:p.sector||null,country:p.country||null};
  }catch{return {sector:null,country:null}}
}

async function enrichHolding(h){if(!h.ticker)return {...h,price:null,currency:null,daily:null,week:null,month:null,ytd:null,contribution:null};try{const {history,meta}=await chart(h.ticker,'1y');const m=metrics(history);const price=history.at(-1)?.close??null;return {...h,price,currency:meta.currency||null,daily:m.performance.day,week:m.performance.week,month:m.performance.month,ytd:m.performance.ytd,contribution:m.performance.day==null?null:(h.weight/100)*m.performance.day}}catch(e){warnings.push(`Holding ${h.ticker}: ${e.message}`);return {...h,price:null,currency:null,daily:null,week:null,month:null,ytd:null,contribution:null}}
}
async function buildEtf(c){const old=previous.etfs?.find(x=>x.isin===c.isin);let symbol=null,history=[],meta={},m={performance:nullPerf(),high52:null,low52:null,volatility:null,maxDrawdown:null};try{symbol=await resolveYahooSymbol(c);if(!symbol)throw new Error('Ticker resolution failed');const out=await chart(symbol);history=out.history;meta=out.meta;m=metrics(history)}catch(e){warnings.push(`${c.isin}: ${e.message}`); if(old){history=old.history||[];m={performance:old.performance||nullPerf(),high52:old.high52??null,low52:old.low52??null,volatility:old.volatility??null,maxDrawdown:old.maxDrawdown??null}}}
 const refreshHoldings=process.env.REFRESH_HOLDINGS==='1'||!(old?.holdings?.length);
 const auto=refreshHoldings&&symbol?await yahooTopHoldings(symbol):{holdings:[],sectors:[]};
 let sourceHoldings=auto.holdings.length?auto.holdings:(old?.holdings?.length?old.holdings:(c.seedHoldings||[]).slice(0,25));
 const reference=[...(c.seedHoldings||[]),...(old?.holdings||[])];
 sourceHoldings=sourceHoldings.map(h=>{const ref=reference.find(r=>(h.ticker&&r.ticker===h.ticker)||r.name===h.name);return {...h,sector:h.sector||ref?.sector||null,country:h.country||ref?.country||null}});
 if(refreshHoldings){for(const h of sourceHoldings){if(h.ticker&&(!h.sector||!h.country)){const p=await yahooProfile(h.ticker);h.sector=h.sector||p.sector;h.country=h.country||p.country;await wait(80)}}}
 const holdings=[];for(const h of sourceHoldings.slice(0,25)){holdings.push(await enrichHolding(h));await wait(80)}
 return {id:c.isin.toLowerCase(),isin:c.isin,name:c.name||meta.longName||meta.shortName||c.isin,ticker:c.ticker||meta.symbol||null,yahooSymbol:symbol,provider:c.provider||null,exchange:c.exchange||meta.exchangeName||null,tradingCurrency:c.tradingCurrency||meta.currency||null,fundCurrency:c.fundCurrency||null,ter:c.ter??null,fundSize:c.fundSize??null,fundSizeCurrency:c.fundSizeCurrency||null,incomeUse:c.incomeUse||null,price:history.at(-1)?.close??old?.price??null,performance:m.performance,high52:m.high52,low52:m.low52,volatility:m.volatility,maxDrawdown:m.maxDrawdown,history,holdings,sectors:auto.sectors.length?auto.sectors:(old?.sectors?.length?old.sectors:(c.seedSectors||[])),countries:old?.countries?.length?old.countries:(c.seedCountries||[]),holdingsAsOf:auto.holdings.length?new Date().toISOString().slice(0,10):(old?.holdingsAsOf||c.holdingsAsOf||null),sourceUrl:c.sourceUrl||null};}
async function buildMarket(c){const old=previous.markets?.find(x=>x.id===c.id);try{const {history,meta}=await chart(c.symbol);const m=metrics(history);return {id:c.id,name:c.name,symbol:c.symbol,price:history.at(-1)?.close??null,currency:meta.currency||null,performance:m.performance,history}}catch(e){warnings.push(`${c.name}: ${e.message}`);return old||{id:c.id,name:c.name,symbol:c.symbol,price:null,currency:null,performance:nullPerf(),history:[]}}}
const etfs=[];for(const c of configs){console.log('ETF',c.isin);etfs.push(await buildEtf(c))}
const markets=[];for(const c of marketConfigs){console.log('Market',c.name);markets.push(await buildMarket(c));await wait(100)}
const payload={generatedAt:new Date().toISOString(),delayed:true,delayNote:'Delayed public market data; scheduled refresh approximately hourly. ETF holdings are updated less frequently.',etfs,markets,warnings:warnings.slice(0,100)};
await fs.mkdir(path.join(root,'public/data'),{recursive:true});await fs.writeFile(path.join(root,'public/data/dashboard.json'),JSON.stringify(payload,null,2)+'\n');console.log(`Wrote dashboard.json with ${warnings.length} warning(s)`);
