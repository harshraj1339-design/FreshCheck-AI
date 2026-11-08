import type { Report } from '../types';
export async function getStatus(){ const res=await fetch('/api/config/status'); if(!res.ok) throw new Error('Could not load service status'); return res.json(); }
export async function analyze(answer:string):Promise<Report>{const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answer})});const body=await res.json();if(!res.ok)throw new Error(body.error?.message||'Analysis failed');return body;}
