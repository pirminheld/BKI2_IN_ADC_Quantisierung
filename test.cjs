'use strict';
const assert=require('node:assert/strict');
const M=require('./model.js');
let checks=0;
function equal(a,b){assert.equal(a,b);checks++;}
function near(a,b){assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);checks++;}
for(const bits of [2,3,4,8])for(const ref of [3.3,4,5]){
  const n=2**bits,step=ref/n;
  equal(M.adc(0,bits,ref).code,0);equal(M.adc(ref,bits,ref).code,n-1);
  for(let k=0;k<n;k++){
    const a=M.adc(k*step,bits,ref);
    equal(a.code,k);equal(a.binary.length,bits);equal(parseInt(a.binary,2),k);
    equal(M.adc((k+.5)*step,bits,ref).code,k);
    if(k>0)equal(M.adc(k*step-step*1e-7,bits,ref).code,k-1);
    near(a.upper-a.lower,step);
  }
}
for(const [u,code] of [[.8,0],[1.6,1],[2.2,1],[2.5,2],[4.9,3],[5,3],[2.49,1],[2.51,2]])equal(M.adc(u,2,5).code,code);
equal(M.adc(1.2,3,4).code,2);
for(const u of [-1,5.01,NaN,Infinity]){assert.throws(()=>M.adc(u,2,5),RangeError);checks++;}
for(const n of [0,1.5,17]){assert.throws(()=>M.adc(0,n,5),RangeError);checks++;}
for(const ref of [0,-1,NaN,Infinity]){assert.throws(()=>M.adc(0,2,ref),RangeError);checks++;}
for(const t of [4,8])for(const ta of [1,.5,.25]){
  const m=M.sampling(t,ta);equal(m.frequency,1000/t);equal(m.sampleFrequency,1000/ta);equal(m.points.length,8/ta+1);
  near(m.points[0].u,2);near(m.points.at(-1).t,8);near(m.points.at(-1).u,2);
  m.points.forEach((p,i)=>{near(p.t,i*ta);assert.ok(p.u>=1-1e-10&&p.u<=3+1e-10);checks++;});
}
M.sampling(4,1).points.forEach((p,i)=>near(p.u,[2,3,2,1,2,3,2,1,2][i]));
for(const args of [[0,1],[4,0],[4,-1],[Infinity,1],[4,.00001]]){assert.throws(()=>M.sampling(...args),RangeError);checks++;}
console.log(`${checks} fachliche Prüfungen bestanden.`);
