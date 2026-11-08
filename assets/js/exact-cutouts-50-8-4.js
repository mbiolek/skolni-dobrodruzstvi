/* Školní dobrodružství 50.8.4 — jednotlivé skutečně vyříznuté grafické karty.
   Původní button a jeho klikací události zůstávají zachované. Vektorový obal
   zachovává přesně bitmapovou malbu (nepředstírá vektorové překreslení). */
(()=>{'use strict';
const DIR='./assets/ui-exact-50-8-4/';
const KEY_BY_TITLE={
  'vyuka':'vyuka','procvicovani':'procvicovani','priprava na skolni test':'test',
  'mesicni plan':'mesicni_plan','opakovani':'opakovani','zaverecny test':'zaverecny_test'
};
const STYLES=new Set(['stone','guild','glass']);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs').replace(/\s+/g,' ').trim();
const style=()=>document.body.dataset.cardStyle;
function titleOf(btn){
 const el=btn.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > .sd-layer-caption > .sd-ui-card__title');
 if(!el)return '';
 return Array.from(el.childNodes).map(n=>n.nodeType===1&&n.tagName==='BR'?' ':n.textContent).join('');
}
function patch(btn){
 const value=normalize(titleOf(btn));const key=KEY_BY_TITLE[value];const typ=style();
 const active=!!key&&STYLES.has(typ);
 let img=btn.querySelector(':scope > .sd-layer-art > .sd84-exact-picture');
 btn.classList.toggle('sd84-exact-card',active);
 if(!active){if(img)img.remove();return;}
 const parent=btn.querySelector(':scope > .sd-layer-art');if(!parent)return;
 if(!img){img=document.createElement('img');img.className='sd84-exact-picture';img.alt='';img.draggable=false;img.decoding='async';img.setAttribute('aria-hidden','true');parent.append(img);}
 const src=`${DIR}${typ}/${key}.svg`;
 if(img.getAttribute('src')!==src)img.src=src;
 img.loading='eager';
 btn.dataset.sd84Key=key;
 btn.setAttribute('aria-label',btn.getAttribute('aria-label')||titleOf(btn));
}
function navigation(){
 const typ=style();const active=STYLES.has(typ);
 for(const [action,key] of [['back','zpet'],['home','domu']]){
  for(const el of document.querySelectorAll(`#sd52 header button[data-act="${action}"]`)){
   el.classList.toggle('sd84-exact-nav',active);
   if(active)el.style.setProperty('--sd84-nav-img',`url("${DIR}${typ}/${key}.svg")`);
   else el.style.removeProperty('--sd84-nav-img');
  }
 }
 const h=document.querySelector('#sd52main > h1');
 if(h){const matches=normalize(h.textContent)==='vlastiveda';h.classList.toggle('sd84-exact-title',matches&&active);
  if(matches&&active)h.style.setProperty('--sd84-title-img',`url("${DIR}${typ}/nadpis_vlastiveda.svg")`);
  else h.style.removeProperty('--sd84-title-img');}
}
function scan(){document.querySelectorAll('button.sd-layered').forEach(patch);navigation();}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan();})}
function setup(){
 scan();
 const obs=new MutationObserver(rs=>{
  for(const r of rs){
   if(r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-card-style'){schedule();return;}
   if(r.type==='childList'&&Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('button.sd-layered,button.sd-ui-card,#sd52main,#sd5081Samples,.sd-ui-grid')||n.querySelector?.('button.sd-layered,button.sd-ui-card')))){schedule();return;}
   if(r.type==='childList'&&r.target.id==='sd52main'){schedule();return;}
  }
 });
 obs.observe(document.body,{attributes:true,attributeFilter:['data-card-style'],childList:true,subtree:true});
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd-style-preview',schedule);
 window.SDExact5084={scan,version:'50.8.4'};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
