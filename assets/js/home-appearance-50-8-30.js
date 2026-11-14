/* 50.8.38 – Jediný renderer domovských karet.
 * Domů používá stejné skutečné obrazové šablony jako nabídky uvnitř předmětu,
 * nikoli staré soubory home-50-8-21. Zachovává stávající obsluhu kliknutí a XP.
 */
(()=>{'use strict';
const STYLES=new Set(['glass','stone','parchment','guild','adventure']);
const SUBJECTS={
 math:{slug:'matematika',title:'Matematika',template:'opakovani'},
 english:{slug:'anglictina',title:'Angličtina',template:'procvicovani'},
 czech:{slug:'cestina',title:'Čeština',template:'vyuka'},
 nature:{slug:'prirodoveda',title:'Přírodověda',template:'mesicni_plan'},
 history:{slug:'vlastiveda',title:'Vlastivěda',template:'test'},
 music:{slug:'hudebni-vychova',title:'Hudební výchova',template:'zaverecny_test'}
};
const SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
function style(){let s=document.body.dataset.cardStyle;return STYLES.has(s)?s:'guild'}
function item(card){const key=Object.keys(SUBJECTS).find(k=>card.classList.contains(k));return key?SUBJECTS[key]:null}
let queued=false;
function apply(){
 queued=false;
 const selected=style();
 document.querySelectorAll(SELECTOR).forEach(card=>{
  const d=item(card);if(!d)return;
  const adventure=selected==='adventure';
  // Exact same files as inner menu (ui-exact-50-8-4/<theme>/blanks/*.svg).
  // Adventure has its own illustrated cards with the printed subject title.
  const src=adventure
   ?`./assets/ikony/cards-50-8-35/${d.slug}.webp`
   :`./assets/ui-exact-50-8-4/${selected}/blanks/${d.template}.svg`;
  card.classList.add('sd821-card','sd830-subject','sd838-home-card');
  card.classList.toggle('sd835-home-art',adventure);
  card.dataset.sd838Style=selected;
  card.setAttribute('aria-label',d.title);
  // Remove renderer leftovers, never remove XP footer, click handlers or buttons.
  card.querySelectorAll(':scope > img.sd812-home-art,:scope > img.sd815-home-art,:scope > img.sd816-home-art,:scope > img.sd817-home-art,:scope > .sd817-photo-title,:scope > .sd-layer-art,:scope > .sd-layer-caption,:scope > .sd87-card-title,:scope > .sd87-topic-medallion,:scope > img.sd-subject-title-svg').forEach(n=>n.remove());
  card.classList.remove('sd815-art-card','sd816-painted-card','sd817-themed','sd817-image-mode','sd817-photo-mode','sd84-exact-card','sd-layered','sd814-unified-home-card');
  let visual=card.querySelector(':scope > .sd821-visual');
  if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true');card.prepend(visual)}
  let image=visual.querySelector(':scope > img');
  if(!image){visual.replaceChildren();image=document.createElement('img');visual.appendChild(image)}
  if(image.getAttribute('src')!==src)image.setAttribute('src',src);
  image.alt='';image.decoding='async';image.draggable=false;
  let label=card.querySelector(':scope > .sd821-label');
  if(!label){label=document.createElement('span');label.className='sd821-label';label.setAttribute('aria-hidden','true');visual.after(label)}
  if(label.textContent!==d.title)label.textContent=d.title;
  label.setAttribute('aria-hidden','true');
 });
}
function refresh(){if(queued)return;queued=true;requestAnimationFrame(apply)}
function boot(){
 refresh();
 ['sd-card-style-change','sd-style-preview','sd88-wallpaper-changed'].forEach(e=>document.addEventListener(e,refresh));
 window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 new MutationObserver(ms=>{if(ms.some(m=>m.attributeName==='data-card-style'))refresh()}).observe(document.body,{attributes:true,attributeFilter:['data-card-style']});
 const home=document.getElementById('homeScreen');if(home)new MutationObserver(ms=>{
  if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.subject,.subject-grid,.v23-extra-grid')||n.querySelector?.('.subject')))))refresh();
 }).observe(home,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDHomeAppearance50830=Object.freeze({refresh,version:'50.8.38'});
})();
