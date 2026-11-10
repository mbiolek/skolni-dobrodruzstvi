/* Školní dobrodružství 50.8.16 — skutečné obrázkové karty pro krystal a dobrodružství.
 * Nemění DOM obsluhu kliknutí, profily ani herní stav.
 */
(()=>{'use strict';
const ASSETS={
 math:{id:'matematika',label:'Matematika'},
 english:{id:'anglictina',label:'Angličtina'},
 czech:{id:'cestina',label:'Čeština'},
 nature:{id:'prirodopis',label:'Přírodopis'},
 history:{id:'vlastiveda',label:'Vlastivěda'},
 music:{id:'hudebni-vychova',label:'Hudební výchova'}
};
const STYLES={
 glass:'home-crystal',
 adventure:'home-adventure',
 parchment:'home-parchment',
 guild:'home-guild'
};
const SELECTOR='#homeScreen .subject-grid .subject, #homeScreen .v23-extra-grid .subject';
const BASE='./assets/ikony/';
function apply(){
 const style=document.body.dataset.cardStyle;
 const folder=STYLES[style]||'';
 document.querySelectorAll(SELECTOR).forEach(card=>{
   const entry=Object.entries(ASSETS).find(([key])=>card.classList.contains(key));
   if(!entry)return;
   const [,meta]=entry;
   const enabled=Boolean(folder);
   card.classList.toggle('sd816-painted-card',enabled);
   let img=card.querySelector(':scope > img.sd816-home-art');
   if(enabled){
     if(!img){img=document.createElement('img');img.className='sd816-home-art';img.alt='';img.decoding='async';img.draggable=false;img.setAttribute('aria-hidden','true');card.prepend(img)}
     const next=BASE+folder+'/'+meta.id+(style==='adventure'?'.png':'.webp');
     if(img.getAttribute('src')!==next)img.setAttribute('src',next);
     img.hidden=false;
     // Explicit label for readers, text remains part of DOM and original click handler stays.
     card.setAttribute('aria-label',meta.label+(card.getAttribute('aria-disabled')==='true'?' – brzy':''));
   }else if(img){img.hidden=true;img.removeAttribute('src');card.classList.remove('sd816-painted-card')}
 });
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
function start(){
 schedule();
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd88-wallpaper-changed',schedule);
 // Cards may be created by older modules after this script is installed.
 const home=document.getElementById('homeScreen');
 if(home){const obs=new MutationObserver(ms=>{
  if(ms.some(m=>m.type==='childList'&&[...m.addedNodes].some(n=>n.nodeType===1&&
    (n.matches?.('.subject')||n.querySelector?.('.subject')))))schedule()
 });obs.observe(home,{childList:true,subtree:true})}
 const obs=new MutationObserver(ms=>{
  if(ms.some(m=>m.type==='attributes'&&m.attributeName==='data-card-style'))schedule()
 });obs.observe(document.body,{attributes:true,attributeFilter:['data-card-style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.SDHomeButtons50816=Object.freeze({refresh:schedule,version:'50.8.16'});
})();
