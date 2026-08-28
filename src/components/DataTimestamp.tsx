import { useEffect, useState } from 'react';
import { loadDashboard } from '../services/data';
export default function DataTimestamp(){
  const [value,setValue]=useState<string>('');
  useEffect(()=>{loadDashboard().then(d=>setValue(d.generatedAt)).catch(()=>setValue(''))},[]);
  if(!value) return <span className="text-xs muted">Last Updated: Data unavailable</span>;
  return <span className="text-xs muted">Last Updated: {value.slice(0,16).replace('T',' ')} UTC · delayed</span>;
}
