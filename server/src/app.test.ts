import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from './app.js';

test('API health, validation, and readiness endpoints respond with safe contracts',async t=>{
 const server=app.listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.once('listening',resolve));
 const address=server.address();if(!address||typeof address==='string')throw new Error('Could not open API test server');
 const base=`http://127.0.0.1:${address.port}`;
 t.after(()=>new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve())));
 const health=await fetch(`${base}/api/health`);assert.equal(health.status,200);assert.equal((await health.json() as {status:string}).status,'healthy');
 const status=await fetch(`${base}/api/config/status`);assert.equal(status.status,200);const readiness=await status.json() as Record<string,unknown>;assert.deepEqual(Object.keys(readiness).sort(),['bifrostReachable','modelConfigured','tavilyConfigured']);
 const invalid=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({answer:'   '})});assert.equal(invalid.status,400);assert.equal((await invalid.json() as {error:{code:string}}).error.code,'INVALID_REQUEST');
 const oversized=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({answer:'x'.repeat(20001)})});assert.equal(oversized.status,413);
});
