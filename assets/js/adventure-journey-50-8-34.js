/* 50.8.34 – reference karty pro prostředí Dobrodružná cesta. */
(()=>{'use strict';
const HOME_MAP={math:'matematika',english:'anglictina',czech:'cestina',nature:'prirodopis'};
const NAV_MAP=new Map([['vyuka','vyuka'],['procvičování','procvicovani'],['procvičovani','procvicovani'],['test','test']]);
const HOME_SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
const clean=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function isAdventure(){return document.body.dataset.cardStyle==='adventure'}
function applyHome(){
 const adv=isAdventure();
 document.querySelectorAll(HOME_SELECTOR).forEach(card=>{
  const key=Object.keys(HOME_MAP).find(k=>card.classList.contains(k));
  card.classList.toggle('sd834-adventure-complete-card',adv && !!key);
  if(!adv || !key)return;
  let visual=card.querySelector(':scope > .sd821-visual');
  if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true');card.prepend(visual)}
  let image=visual.querySelector('img');
  if(!image){image=document.createElement('img');visual.replaceChildren(image)}
  const src='./assets/ikony/home-adventure/'+HOME_MAP[key]+'.png';
  if(image.getAttribute('src')!==src)image.setAttribute('src',src);
  image.alt='';image.decoding='async';image.draggable=false;
  const label=card.querySelector(':scope > .sd821-label'); if(label) label.setAttribute('aria-hidden','true');
  const footer=card.querySelector(':scope > .v451-footer'); if(footer) footer.setAttribute('aria-hidden','true');
 });
}
function titleOf(btn){
 const el=btn.querySelector(':scope > .sd87-card-title,:scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > strong,:scope > b,:scope > .sd-ui-card__title');
 return clean(el?.textContent||btn.getAttribute('aria-label')||btn.textContent);
}
function applyNav(){
 const adv=isAdventure();
 document.querySelectorAll('button.sd84-exact-card').forEach(btn=>{
  const key=NAV_MAP.get(titleOf(btn));
  const pic=btn.querySelector(':scope > .sd-layer-art > img.sd84-exact-picture');
  const active=adv && !!key && !!pic;
  btn.classList.toggle('sd834-adventure-complete-nav',active);
  if(active){
   const src='./assets/ui-exact-50-8-8/adventure/'+key+'.png';
   if(pic.getAttribute('src')!==src)pic.setAttribute('src',src);
  }
 });
}
let queued=false;
function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyHome();applyNav();})}
function boot(){
 refresh();
 ['sd-card-style-change','sd87-cards-ready','sd-style-preview','sd88-wallpaper-changed'].forEach(e=>document.addEventListener(e,refresh));
 window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);
 new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes' || m.addedNodes?.length))refresh();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style','class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDAdventureJourney50834=Object.freeze({refresh,version:'50.8.34'});
})();
