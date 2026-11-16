/* 50.8.40 — jediné skutečné vykreslení domovských předmětů.
   Žádný souběžný HTML titulek přes již nadepsaný obrázek. */
(()=>{'use strict';
const STYLES=new Set(['glass','stone','parchment','guild','adventure']);
const ITEMS={
 math:{name:'Matematika',art:'matematika',base:'vyuka'},
 english:{name:'Angličtina',art:'anglictina',base:'procvicovani'},
 czech:{name:'Čeština',art:'cestina',base:'vyuka'},
 nature:{name:'Přírodověda',art:'prirodoveda',base:'mesicni_plan'},
 history:{name:'Vlastivěda',art:'vlastiveda',base:'test'},
 music:{name:'Hudební výchova',art:'hudebni-vychova',base:'zaverecny_test'}
};
const SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
function currentStyle(){let v=document.body.dataset.cardStyle;return STYLES.has(v)?v:'guild'}
function infoOf(card){return Object.keys(ITEMS).find(x=>card.classList.contains(x))}
let queued=false;
function apply(){
 queued=false;
 const style=currentStyle(),adventure=style==='adventure';
 document.querySelectorAll(SELECTOR).forEach(card=>{
  const key=infoOf(card);if(!key)return;
  const data=ITEMS[key];
  const path=adventure
   ?`./assets/ikony/cards-clean-50-8-50/${data.art}.webp`
   :`./assets/ui-exact-50-8-4/${style}/blanks/${data.base}.svg`;
  card.dataset.sd840Style=style;
  card.classList.add('sd821-card','sd830-subject','sd838-home-card','sd840-home-card');
  card.classList.toggle('sd835-home-art',adventure);
  card.setAttribute('aria-label',data.name);
  // Keep only the picture and the LIVE XP counters. The button itself and its
  // original click handlers are never replaced.
  let visual=card.querySelector(':scope > .sd821-visual');
  if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true')}
  let image=visual.querySelector(':scope > img');
  if(!image){visual.replaceChildren();image=document.createElement('img');visual.append(image)}
  if(image.getAttribute('src')!==path)image.setAttribute('src',path);
  image.alt='';image.draggable=false;image.decoding='async';image.setAttribute('aria-hidden','true');
  let footer=card.querySelector(':scope > .v451-footer');
  if(!footer){footer=document.createElement('span');footer.className='v451-footer';footer.setAttribute('aria-hidden','true');footer.innerHTML='<span>★ 0 XP</span><span>🏅 0 bodů</span>'}
  // Keep a single live title INSIDE the artwork. Previous releases positioned it
  // against the whole card (including XP footer), so it fell BELOW the plaque.
  const old=card.querySelector(':scope > .sd821-label');
  if(old)old.remove();
  let label=visual.querySelector(':scope > .sd842-caption');
  if(adventure){
    if(!label){label=document.createElement('span');label.className='sd842-caption';label.setAttribute('aria-hidden','true');visual.append(label)}
    if(label.textContent!==data.name)label.textContent=data.name;
  }
  else {
    if(!label){label=document.createElement('span');label.className='sd842-caption';label.setAttribute('aria-hidden','true');visual.append(label)}
    if(label.textContent!==data.name)label.textContent=data.name;
  }
  // Do not recreate button, listeners, footer or image during a periodic repaint.
  if(card.children.length!==2||card.children[0]!==visual||card.children[1]!==footer)
    card.replaceChildren(visual,footer);

 });
}
function refresh(){if(queued)return;queued=true;requestAnimationFrame(apply)}
function boot(){
 refresh();
 for(const type of ['sd-card-style-change','sd-style-preview','sd88-wallpaper-changed','sd87-cards-ready'])document.addEventListener(type,refresh);
 window.addEventListener('pageshow',refresh);
 window.addEventListener('focus',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 new MutationObserver(records=>{
  if(records.some(r=>r.type==='attributes'&&r.attributeName==='data-card-style'))refresh();
 }).observe(document.body,{attributes:true,attributeFilter:['data-card-style']});
 const home=document.getElementById('homeScreen');
 if(home)new MutationObserver(records=>{
  if(records.some(r=>r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('.subject-grid,.v23-extra-grid,.subject')||n.querySelector?.('.subject-grid,.v23-extra-grid,.subject')))))refresh();
 }).observe(home,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDHomeAppearance50830=Object.freeze({refresh,version:'50.8.50'});
})();
