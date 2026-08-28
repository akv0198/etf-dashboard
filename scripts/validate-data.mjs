import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('../public/data/dashboard.json',import.meta.url),'utf8'));
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(typeof d.generatedAt==='string','generatedAt missing');assert(Array.isArray(d.etfs)&&d.etfs.length,'No ETFs');assert(Array.isArray(d.markets)&&d.markets.length,'No markets');
for(const e of d.etfs){assert(e.isin,'ETF ISIN missing');assert(e.performance,'ETF performance missing');for(const n of ['price','high52','low52','ter','fundSize'])assert(e[n]===null||typeof e[n]==='number',`${e.isin} invalid ${n}`);}
console.log(`Data valid: ${d.etfs.length} ETFs, ${d.markets.length} markets`);
