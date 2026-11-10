/* Školní dobrodružství 50.8.17 — správné přiřazení motivů domovské obrazovky.
 * Jeden obrázek na kartu, nezměněné původní události kliknutí a stav profilů.
 */
(()=>{'use strict';
const SUBJECTS={
 math:['matematika','math','Matematika'],
 english:['anglictina','english','Angličtina'],
 czech:['cestina','czech','Čeština'],
 nature:['prirodopis','nature','Přírodopis'],
 history:['vlastiveda','history','Vlastivěda'],
 music:['hudebni-vychova','music','Hudební výchova']
};
const BASE='./assets/ikony/';
const CARDS='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
const AVAILABLE=new Set(['glass','stone','adventure','parchment','guild']);
function picture(style,s){
 if(style==='stone')return BASE+'home-adventure/'+s[0]+'.png';
 if(style==='adventure')return BASE+'hradni-styl-'+s[1]+'.webp';
 return BASE+({glass:'home-crystal',parchment:'home-parchment',guild:'home-guild'}[style])+'/'+s[0]+'.webp';
}
function apply(){
 const style=document.body.dataset.cardStyle;
 const enabled=AVAILABLE.has(style);
 document.querySelectorAll(CARDS).forEach(card=>{
  const entry=Object.entries(SUBJECTS).find(([k])=>card.classList.contains(k));
  if(!entry)return;
  const [,subject]=entry;
  card.classList.toggle('sd817-themed',enabled);
  card.classList.toggle('sd817-photo-mode',enabled&&style==='adventure');
  card.classList.toggle('sd817-image-mode',enabled&&style!=='adventure');
  let img=card.querySelector(':scope > img.sd817-home-art');
  let label=card.querySelector(':scope > div.sd817-photo-title');
  if(!enabled){if(img)img.hidden=true;if(label)label.hidden=true;return}
  if(!img){img=document.createElement('img');img.className='sd817-home-art';img.alt='';img.decoding='async';img.draggable=false;img.setAttribute('aria-hidden','true');card.prepend(img)}
  const src=picture(style,subject);if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  img.hidden=false;
  if(style==='adventure'){
   if(!label){label=document.createElement('div');label.className='sd817-photo-title';label.setAttribute('aria-hidden','true');card.append(label)}
   label.textContent=subject[2];label.hidden=false;
  }else if(label)label.hidden=true;
  card.setAttribute('aria-label',subject[2]+(card.getAttribute('aria-disabled')==='true'?' – brzy':''));
 });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
function start(){schedule();
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd88-wallpaper-changed',schedule);
 window.addEventListener('pageshow',schedule);
 const mo=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-card-style'){schedule();return}
   if(r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('#homeScreen .subject,.subject-grid,.v23-extra-grid')||n.querySelector?.('#homeScreen .subject')))){schedule();return}
  }
 });
 mo.observe(document.body,{attributes:true,attributeFilter:['data-card-style'],childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.SDHomeButtons50817=Object.freeze({refresh:schedule,version:'50.8.17'});
})();
