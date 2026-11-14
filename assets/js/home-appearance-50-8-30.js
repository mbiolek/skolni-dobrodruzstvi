/* 50.8.30: one home renderer; visually distinct assets for each card style. */
(()=>{'use strict';
const STYLES=new Set(['glass','stone','parchment','guild','adventure']);
const ITEMS={math:['matematika','Matematika'],english:['anglictina','Angličtina'],czech:['cestina','Čeština'],nature:['prirodopis','Přírodopis'],history:['vlastiveda','Vlastivěda'],music:['hudebni-vychova','Hudební výchova']};
const SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
let queued=false;
function apply(){
 queued=false;
 const st=STYLES.has(document.body.dataset.cardStyle)?document.body.dataset.cardStyle:'guild';
 document.querySelectorAll(SELECTOR).forEach(card=>{
  const key=Object.keys(ITEMS).find(k=>card.classList.contains(k));if(!key)return;
  const [slug,title]=ITEMS[key];
  card.classList.add('sd821-card','sd830-subject');
  card.dataset.sd830Style=st;
  // Remove abandoned, competing DOM renderers; do not remove click handlers, aria, XP or points.
  card.querySelectorAll(':scope > img.sd812-home-art,:scope > img.sd815-home-art,:scope > img.sd816-home-art,:scope > img.sd817-home-art,:scope > .sd817-photo-title,:scope > .sd-layer-art,:scope > .sd-layer-caption,:scope > .sd87-card-title,:scope > .sd87-topic-medallion,:scope > img.sd-subject-title-svg').forEach(e=>e.remove());
  card.classList.remove('sd815-art-card','sd816-painted-card','sd817-themed','sd817-image-mode','sd817-photo-mode','sd84-exact-card','sd-layered','sd814-unified-home-card');
  let visual=card.querySelector(':scope > .sd821-visual');
  if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true');card.prepend(visual)}
  let image=visual.querySelector('img');
  if(!image){visual.replaceChildren();image=document.createElement('img');visual.append(image)}
  const wanted=st==='adventure'?`./assets/ikony/cards-50-8-35/${slug==='prirodopis'?'prirodoveda':slug}.webp`:`./assets/ikony/home-50-8-21/${st}-${slug}.webp`;
  card.classList.toggle('sd835-home-art',st==='adventure');
  if(image.getAttribute('src')!==wanted)image.setAttribute('src',wanted);
  image.alt='';image.decoding='async';image.draggable=false;
  let label=card.querySelector(':scope > .sd821-label');
  if(!label){label=document.createElement('span');label.className='sd821-label';label.setAttribute('aria-hidden','true');visual.after(label)}
  if(label.textContent!==title)label.textContent=title;
  // The original subject name is retained in the DOM for screen readers, visually hidden by CSS.
  if(!card.getAttribute('aria-label'))card.setAttribute('aria-label',title);
 });
}
function refresh(){if(queued)return;queued=true;requestAnimationFrame(apply)}
function start(){
 refresh();
 ['sd-card-style-change','sd-style-preview','sd88-wallpaper-changed'].forEach(e=>document.addEventListener(e,refresh));
 window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);
 new MutationObserver(ms=>{if(ms.some(m=>m.attributeName==='data-card-style'))refresh()}).observe(document.body,{attributes:true,attributeFilter:['data-card-style']});
 const home=document.getElementById('homeScreen');if(home)new MutationObserver(ms=>{
  if(ms.some(m=>m.addedNodes && Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('.subject,.subject-grid,.v23-extra-grid')||n.querySelector?.('.subject')))))refresh()
 }).observe(home,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.SDHomeAppearance50830=Object.freeze({refresh,version:'50.8.30'});
})();
