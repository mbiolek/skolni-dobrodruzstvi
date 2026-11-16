/* 50.8.39 — Vlastivěda / jednotné sedmidílné menu.
 * Zdrojové onclick, data-act, výběr školy, výsledky a měsíční plán zůstávají beze změny.
 * Nové dobrodružné obrázky už obsahují původní popis. Při sjednocení se kreslí
 * jedna vlastní titulková lišta, která zakryje starý baked-in titulek.
 */
(()=>{'use strict';
const SUBJECT='geography', ROOT='./assets/ikony/cards-50-8-45/', FIXED='./assets/ikony/cards-50-8-45/', CLEAN='./assets/ikony/cards-clean-50-8-50/';
const ENTRIES=[
 {title:'Výuka',image:'vyuka.webp'},
 {title:'Procvičování',image:'procvicovani.webp'},
 {title:'Příprava na školní test',image:'priprava-na-skolni-test.webp'},
 {title:'Měsíční plán',image:'mesicni-plan.webp'},
 {title:'Opakování',image:'opakovani.webp'},
 {title:'Závěrečný test',image:'zaverecny-test.webp'},
 {title:'Nastavení',image:'nastaveni.webp'}
];
const normal=s=>String(s||'').replace(/\s+/g,' ').trim();
function findTitle(btn){
 const source=btn.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > .sd-layer-caption > .sd-ui-card__title,:scope > strong,:scope > b');
 if(!source)return normal(btn.dataset.sd839Title||'');
 const copy=source.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
 return normal(copy.textContent);
}
let busy=false;
function update(){
 busy=false;
 const root=document.getElementById('sd52'), current=window.SDSchoolPlans52?.current?.();
 if(!root)return;
 const visible=!root.hidden&&current?.screen==='subject'&&current?.subject===SUBJECT;
 const grid=root.querySelector('#sd52main > .sd52-grid, #sd52main > .sd-ui-grid');
 if(!grid)return;
 if(!visible){grid.classList.remove('sd839-geo-grid');return;}
 const buttons=[...grid.children].filter(x=>x.tagName==='BUTTON');
 if(buttons.length<7)return;
 const matched=[];
 for(const info of ENTRIES){const b=buttons.find(b=>findTitle(b)===info.title);if(!b)return;matched.push([b,info])}
 grid.classList.add('sd839-geo-grid');
 const adventure=document.body.dataset.cardStyle==='adventure';
 for(const [btn,info] of matched){
  btn.classList.add('sd839-geo-card');
  btn.classList.toggle('sd839-geo-adventure',adventure);
  btn.dataset.sd839Title=info.title;
  if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label',info.title);
  let image=btn.querySelector(':scope > img.sd839-geo-image');
  btn.querySelectorAll(':scope > span.sd839-geo-label').forEach(n=>n.remove());
  let caption=btn.querySelector(':scope > span.sd843-geo-caption');
  if(!caption){caption=document.createElement('span');caption.className='sd843-geo-caption';btn.append(caption)}
  caption.textContent=info.title;caption.setAttribute('aria-hidden','true');
  if(!image){image=document.createElement('img');image.className='sd839-geo-image';image.alt='';image.setAttribute('aria-hidden','true');image.draggable=false;btn.append(image)}
  // Název je vytištěn již na ilustraci; nevytvářet druhou HTML vrstvu.
  const src=adventure ? CLEAN+info.image : (['priprava-na-skolni-test.webp','opakovani.webp','zaverecny-test.webp'].includes(info.image)?FIXED:ROOT)+info.image;
  if(image.getAttribute('src')!==src)image.setAttribute('src',src);

 }
 buttons.filter(x=>!matched.some(pair=>pair[0]===x)).forEach(x=>{
  x.classList.remove('sd839-geo-card','sd839-geo-adventure');
  x.querySelector(':scope > img.sd839-geo-image')?.remove();
  x.querySelector(':scope > span.sd839-geo-label')?.remove();
  x.querySelector(':scope > span.sd843-geo-caption')?.remove();
 });
}
function schedule(){if(!busy){busy=true;requestAnimationFrame(update)}}
function init(){
 document.addEventListener('sd-route-change',schedule);
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd87-cards-ready',schedule);
 document.addEventListener('sd-style-preview',schedule);
 window.addEventListener('pageshow',schedule);
 const root=document.getElementById('sd52');
 if(root)new MutationObserver(records=>{
  if(records.some(r=>r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1&&(
   n.matches?.('.sd52-grid')||n.querySelector?.('.sd52-grid')))))schedule();
 }).observe(root,{childList:true,subtree:true});
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-card-style']});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.SDVlastivedaMenu50839=Object.freeze({refresh:schedule,version:'50.8.50'});
})();
