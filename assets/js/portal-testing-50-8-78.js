/* Školní dobrodružství 50.8.78 – rodičovský testovací náhled bez zápisu dětem. */
(()=>{'use strict';
const KEY='matematika-karticky-progress-v3-profiles';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
const children=()=>Object.entries(read(KEY)).filter(([id,p])=>id!=='parent'&&p?.name);
const el=(host,tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;host.append(n);return n};
const btn=(host,txt,cb,cls)=>{const b=el(host,'button',txt,'sd878-btn '+(cls||''));b.type='button';b.onclick=cb;return b};
function snapshot(pid){
 const ps=read(KEY),p=ps[pid];if(!p)throw Error('Profil nebyl nalezen');
 const config=read('sd52_schools_plans_v1');
 const subset={...config,assignments:{[pid]:config.assignments?.[pid]||[]},enrollments:{[pid]:config.enrollments?.[pid]||{}},results:{}};
 for(const [key,v] of Object.entries(config.results||{}))if(key.includes(pid))subset.results[key]=v;
 const rows=[[KEY,JSON.stringify({[pid]:p})],['sd52_schools_plans_v1',JSON.stringify(subset)]];
 const allow=/^(sd88-wallpaper|sdCardStyle|skolni-dobrodruzstvi-v37-avatar|sd860_martin_progress_|sd864_cermat_priprava_|sdnature_progress_|sd878_extra_practice_)/;
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i);if(!key||!allow.test(key)||rows.some(([k])=>k===key))continue;
  if(/_p\d+/.test(key)&&!key.endsWith('_'+pid))continue;
  const val=localStorage.getItem(key);if(val!==null)rows.push([key,val]);
 }
 return {version:1,profileId:pid,storage:rows};
}
async function open(pid,name){
 if(!document.body.classList.contains('parent-role'))return;
 let packet;try{packet=snapshot(pid)}catch(e){alert(e.message);return}
 const cloud=window.SDCloud866;
 if(cloud?.isReady?.()){
  try{
   const lessons=await cloud.requestParent('/rest/v1/sd_878_curriculum?status=eq.published&select=*');
   packet.storage.push(['sd878_catalog_snapshot',JSON.stringify(lessons)]);
  }catch(err){console.warn('Testovací kopie: učivo není dostupné',err.message)}
 }
 const payload=JSON.stringify(packet);
 if(payload.length>900000){alert('Testovací kopie je příliš velká.');return}
 document.getElementById('sd878PreviewWindow')?.remove();
 const overlay=el(document.body,'div',undefined,'sd878-preview-window');overlay.id='sd878PreviewWindow';
 const header=el(overlay,'header',undefined,'sd878-preview-bar');
 el(header,'strong','Testuji: '+name);
 el(header,'span','Výsledky dítěte zůstanou beze změny');
 btn(header,'Zavřít',()=>overlay.remove(),'sd878-danger');
 const frame=el(overlay,'iframe');frame.title='Testovací náhled '+name;
 frame.setAttribute('sandbox','allow-scripts allow-forms allow-downloads');
 // srcdoc běží v sandboxu s vlastní neprůhlednou origin. Přenos přes
 // window.name se na některých mobilech z bezpečnostních důvodů vymaže.
 // Předáme kopii dat inline PŘED prvním externím skriptem, bez oprávnění
 // ke cloudu a bez zápisu do skutečného localStorage rodiče.
 frame.name='sd878-isolated-preview';
 // Keep the main child preview alive while an isolated Martin study-plan
 // document is opened. Martin's independent HTML page cannot inherit
 // sessionStorage from a regular sandboxed navigation.
 let martinFrame=null;
 const originalFrame=frame;
 const onMessage=async event=>{
  const msg=event.data;
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='sd878-preview-open-martin'){
   if(event.source!==originalFrame.contentWindow||msg.profileId!==pid||martinFrame)return;
   if(!/^martin(?:\\s|$)/i.test(String(name).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')))return;
   let child=null;
   try{
    const response=await fetch('./martin/index.html',{cache:'no-store'});
    if(!response.ok)throw Error('Martinův studijní plán není dostupný');
    const page=await response.text();
    if(!/<head>/i.test(page))throw Error('Neplatná hlavička Martinova studijního plánu');
    if(!overlay.isConnected)return;
    const base=new URL('./martin/',location.href).href;
    const safePacket=payload.replace(/</g,'\\u003c').replace(/\\u2028/g,'\\u2028').replace(/\\u2029/g,'\\u2029');
    const safeBase=base.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    const inject='<base href="'+safeBase+'"><script>window.__SD878Packet='+safePacket+';<\\/script><script src="../assets/js/preview-isolation-50-8-78.js?v=50887"><\\/script>'
      .replaceAll('<\\/script>','</script>');
    child=document.createElement('iframe');
    child.title='Martinův studijní plán – test rodiče';
    child.setAttribute('sandbox','allow-scripts allow-forms allow-downloads');
    child.className=originalFrame.className;
    child.name='sd878-martin-preview';
    child.srcdoc=page.replace(/<head>/i,'<head>'+inject);
    originalFrame.hidden=true;
    originalFrame.insertAdjacentElement('afterend',child);
    martinFrame=child;
    window.schoolDiagnostic?.('parent-preview','Martinuv plan otevren v izolovanem nahledu');
   }catch(err){
    child?.remove();originalFrame.hidden=false;
    window.schoolDiagnostic?.('parent-preview-error',String(err.message));
    alert('Martinův studijní plán se nepodařilo otevřít: '+err.message);
   }
  }
  if(msg.type==='sd878-preview-back-martin'&&martinFrame&&event.source===martinFrame.contentWindow){
   martinFrame.remove();martinFrame=null;originalFrame.hidden=false;
  }
 };
 window.addEventListener('message',onMessage);
 const closePreview=()=>{
  window.removeEventListener('message',onMessage);
  overlay.remove();
 };
 header.querySelector('.sd878-danger').onclick=closePreview;
 el(overlay,'p','Načítám izolovanou kopii aplikace…','sd878-preview-loading');
 fetch('./index.html',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Nelze načíst aplikaci');return r.text()}).then(html=>{
  const inlinePacket=payload.replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const inject='<script>window.__SD878Packet='+inlinePacket+';<\\/script>'.replace('<\\/script>','</script>');
  if(!/<head>/i.test(html))throw Error('Chybí hlavička aplikace pro testovací režim');
  frame.srcdoc=html.replace(/<head>/i,'<head>'+inject);
  overlay.querySelector('.sd878-preview-loading')?.remove();
 }).catch(err=>{
  overlay.querySelector('.sd878-preview-loading').textContent='Testovací náhled se nepodařilo načíst: '+err.message;
 });
}
function show(){
 const host=document.getElementById('sd878Testing');if(!host)return;
 host.replaceChildren();
 el(host,'p','Vyber dítě. Uvidíš jeho vlastní obrazovky, výuku, procvičování a testy. Vše se otevře jako oddělený testovací náhled.','sd878-description');
 const grid=el(host,'div',undefined,'sd878-people-grid');
 for(const [id,p] of children()){
  const card=el(grid,'article',undefined,'sd878-person-card');
  const img=el(card,'img');let avatar=1;
  try{avatar=Number(JSON.parse(localStorage.getItem('skolni-dobrodruzstvi-v37-avatar')||'{}')[id])||1}catch{}
  img.src=avatar===41?'./assets/avatari/martin-autolektrikar-technik.webp':avatar===42?'./assets/avatari/martin-autolektrikar-diagnostika.webp':'./assets/avatari/avatar-'+(Math.floor((avatar-1)/8)+1)+'-'+(((avatar-1)%8)+1)+'.webp';img.alt='';img.className='sd878-person-avatar';
  el(card,'strong',p.name);el(card,'small','Kompletní výuka očima dítěte');
  btn(card,'Testovat jako '+p.name,()=>open(id,p.name),'sd878-primary');
 }
 if(!grid.childElementCount)el(host,'p','Nejdřív vytvoř dětský profil.');
 el(host,'p','Při hledání chyb použij Export diagnostického logu na hlavní obrazovce rodiče.','sd878-description');
}
window.SDPortalTesting878={show};
})();