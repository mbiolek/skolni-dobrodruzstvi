/* 50.8.21 — Responzivní navigační karty, bez změny původních klikacích funkcí. */
(()=>{'use strict';
const DATA={math:['matematika','Matematika'],english:['anglictina','Angličtina'],czech:['cestina','Čeština'],nature:['prirodopis','Přírodopis'],history:['vlastiveda','Vlastivěda'],music:['hudebni-vychova','Hudební výchova']};
const STYLES=new Set(['glass','stone','adventure','parchment','guild']);
const CARD_SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
const GRID_SELECTOR='.sd-ui-grid:not(.sd-ui-grid--covers),#subjectHub .hub-cards,#advSubjectMenu .adv-menu-cards,#sdCzechHub5074 .sd-czech-cards,#vlastScreen #vlUnits,#v496TopicPanel #v496Topics,#enUnit499 #en499topics,#sd52 .sd52-grid,#sdCurriculum .sd-grid';
function paint(){
 const style=STYLES.has(document.body.dataset.cardStyle)?document.body.dataset.cardStyle:'glass';
 document.querySelectorAll(CARD_SELECTOR).forEach(card=>{
  const subject=Object.keys(DATA).find(s=>card.classList.contains(s));if(!subject)return;
  const [slug,title]=DATA[subject];
  card.classList.add('sd821-card');
  let visual=card.querySelector(':scope > .sd821-visual');
  if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true');visual.append(document.createElement('img'));card.prepend(visual)}
  const img=visual.querySelector('img');const src=`./assets/ikony/home-50-8-21/${style}-${slug}.webp`;
  if(img.getAttribute('src')!==src){img.src=src;img.decoding='async';img.alt='';img.draggable=false}
  let label=card.querySelector(':scope > .sd821-label');
  if(!label){label=document.createElement('span');label.className='sd821-label';label.setAttribute('aria-hidden','true');visual.after(label)}
  if(label.textContent!==title)label.textContent=title;
  // aria-label is only updated when the card isn't controlled by another module.
  if(!card.hasAttribute('aria-label'))card.setAttribute('aria-label',title);
 });
}
function layout(){
 document.querySelectorAll(GRID_SELECTOR).forEach(grid=>{
  const children=[...grid.children].filter(el=>el.tagName==='BUTTON' && !el.hidden && !el.classList.contains('hidden') && getComputedStyle(el).display!=='none');
  const six=children.length===6;
  grid.classList.toggle('sd821-six-grid',six);
 });
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint();layout()})}
function boot(){schedule();
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd88-wallpaper-changed',schedule);
 window.addEventListener('pageshow',schedule);
 // Only observe structural changes and theme switching. Avoid modifying answers during a quiz.
 const obs=new MutationObserver(ms=>{
  for(const m of ms){
   if(m.type==='attributes' && m.target===document.body && m.attributeName==='data-card-style'){schedule();return}
   if(m.type==='childList' && [...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.subject,.sd-ui-grid,.sd-ui-card,.hub-cards,.adv-menu-cards')||n.querySelector?.('.subject,.sd-ui-grid,.sd-ui-card')))){schedule();return}
  }
 });
 obs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-card-style'],childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDResponsive50821=Object.freeze({version:'50.8.21',refresh:schedule});
})();
