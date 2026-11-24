/* 50.8.78 – izolovaný rodičovský testovací náhled. Spouští se před ostatními skripty. */
(()=>{'use strict';
const params=new URLSearchParams(location.search);
if(!params.has('sd878preview'))return;
let packet=null;
try{packet=JSON.parse(window.name||'null')}catch{}
window.name='';
if(!packet||packet.version!==1||packet.profileId!==params.get('sd878preview')||!Array.isArray(packet.storage)){
 document.documentElement.dataset.sd878Preview='invalid';
 return;
}
function storage(entries){
 const map=new Map(entries.map(([k,v])=>[String(k),String(v)]));
 const methods={
  getItem:k=>map.has(String(k))?map.get(String(k)):null,
  setItem:(k,v)=>{map.set(String(k),String(v))},
  removeItem:k=>map.delete(String(k)),
  clear:()=>map.clear(),
  key:i=>[...map.keys()][i]??null
 };
 return new Proxy(methods,{
  get:(t,k)=>k==='length'?map.size:k in t?t[k]:typeof k==='string'?map.get(k):undefined,
  set:(t,k,v)=>{map.set(String(k),String(v));return true},
  ownKeys:()=>[...map.keys()],
  getOwnPropertyDescriptor:(t,k)=>map.has(k)?{configurable:true,enumerable:true,value:map.get(k),writable:true}:undefined,
  deleteProperty:(t,k)=>{map.delete(String(k));return true}
 });
}
const active=packet.profileId;
const data=packet.storage.filter(([k])=>!/(?:session|token|jwt|password|secret|pin|auth|sd866_device|school-diagnostics)/i.test(k));
const profiles=JSON.parse(data.find(([k])=>k==='matematika-karticky-progress-v3-profiles')?.[1]||'{}');
if(!profiles[active]){document.documentElement.dataset.sd878Preview='invalid';return}
const local=storage(data);
local.setItem('skolni-auth-v1',JSON.stringify({[active]:{salt:'sandbox',hash:'preview'}}));
local.setItem('sd866_device_mode','parent');
const session=storage([['skolni-live-v441',active],['skolni-session-time-v455',String(Date.now())]]);
try{
 Object.defineProperty(window,'localStorage',{configurable:true,get:()=>local});
 Object.defineProperty(window,'sessionStorage',{configurable:true,get:()=>session});
}catch(e){document.documentElement.dataset.sd878Preview='invalid';return}
window.__SD878Preview=true;
document.documentElement.dataset.sd878Preview='on';
const fetchOrig=window.fetch.bind(window);
window.fetch=(resource,init)=>{
 const url=typeof resource==='string'?resource:resource?.url||'';
 if(/\.supabase\.co\//i.test(url))return Promise.reject(Error('V testovacím náhledu je cloud vypnutý.'));
 return fetchOrig(resource,init);
};
try{Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:undefined})}catch{}
addEventListener('DOMContentLoaded',()=>{
 document.body.classList.add('sd878-test-preview');
 const banner=document.createElement('div');banner.className='sd878-preview-banner';
 banner.textContent='TESTOVACÍ REŽIM RODIČE – výsledky dítěte se neukládají';
 document.body.append(banner);
});
})();