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
 frame.name=payload;
 el(overlay,'p','Načítám izolovanou kopii aplikace…','sd878-preview-loading');
 fetch('./index.html',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Nelze načíst aplikaci');return r.text()}).then(html=>{
  frame.srcdoc=html;
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
  const img=el(card,'img');img.src='./assets/avatari/avatar-1-1.webp';img.alt='';img.className='sd878-person-avatar';
  el(card,'strong',p.name);el(card,'small','Kompletní výuka očima dítěte');
  btn(card,'Testovat jako '+p.name,()=>open(id,p.name),'sd878-primary');
 }
 if(!grid.childElementCount)el(host,'p','Nejdřív vytvoř dětský profil.');
 el(host,'p','Při hledání chyb použij Export diagnostického logu na hlavní obrazovce rodiče.','sd878-description');
}
window.SDPortalTesting878={show};
})();