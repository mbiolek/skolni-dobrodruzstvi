/* 50.8.34 – audit prostředí a finální sjednocení karet.
   Cíl: ve všech prostředích stejné rozměry, stejný motiv,
   jeden čitelný popisek a bez ořezaných / překrytých vrstev. */
(()=>{'use strict';
const GRID_CONFIG=[
 ['#subjectHub .hub-cards','hub'],
 ['#advSubjectMenu .adv-menu-cards','adventure'],
 ['#sdCzechHub5074 .sd-czech-cards','czech'],
 ['#vlastScreen #vlUnits','geography'],
 ['#v496TopicPanel #v496Topics','math'],
 ['#enUnit499 #en499topics','english'],
 ['#sd52 .sd52-grid','school'],
 ['#sdCurriculum .sd-grid','curriculum']
];
const HOME_SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
const SUBJECT_LABELS={
 math:'Matematika',english:'Angličtina',czech:'Čeština',nature:'Přírodopis',history:'Vlastivěda',music:'Hudební výchova'
};
const visible=el=>!!el && !el.hidden && getComputedStyle(el).display!=='none';
const cleanText=s=>String(s||'').replace(/\s+/g,' ').trim();
function cardStyle(){return document.body.dataset.cardStyle||'guild'}
function extractTitle(btn){
 const live=btn.querySelector(':scope > .sd87-card-title');
 if(live && cleanText(live.textContent)) return cleanText(live.textContent);
 const label=btn.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > strong,:scope > b,:scope > .sd-ui-card__title');
 if(label) return cleanText(label.textContent);
 return cleanText(btn.getAttribute('aria-label')||btn.textContent);
}
function extractDesc(btn){
 const el=btn.querySelector(':scope > .sd-layer-caption > small,:scope > .sd-ui-card__desc,:scope > small,.hub-desc,.adv-desc');
 return cleanText(el?.textContent||'');
}
function normalizeTitle(btn){
 const titleText=extractTitle(btn); if(!titleText) return;
 // 50.8.37: illustrated adventure cards contain their own printed captions.
 // Do not reinsert the second label after exact-cutouts removes it.
 if(cardStyle()==='adventure' && btn.classList.contains('sd835-picture-card')){
  btn.querySelectorAll(':scope > .sd87-card-title').forEach(n=>n.remove());
  btn.setAttribute('aria-label',titleText);
  return;
 }
 const labels=[...btn.querySelectorAll(':scope > .sd87-card-title')];
 let live=labels.shift();
 labels.forEach(n=>n.remove());
 if(!live){
  live=document.createElement('span');
  live.className='sd87-card-title';
  live.setAttribute('aria-hidden','true');
  btn.appendChild(live);
 }
 if(cleanText(live.textContent)!==titleText) live.textContent=titleText;
 live.classList.toggle('sd87-title-long',titleText.length>17);
 live.classList.toggle('sd87-title-verylong',titleText.length>27);
 const label=btn.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > strong,:scope > b,:scope > .sd-ui-card__title');
 if(label && cleanText(label.textContent)!==titleText) label.textContent=titleText;
 // odstraň volné textové uzly, které vytvářejí "Moje výsledky t" a podobné artefakty
 for(const node of [...btn.childNodes]){
  if(node.nodeType!==3) continue;
  if(cleanText(node.textContent)) node.remove();
 }
 const desc=extractDesc(btn);
 btn.setAttribute('aria-label', desc ? `${titleText} – ${desc}` : titleText);
}
function decorateButton(btn, group){
 if(!btn || btn.tagName!=='BUTTON') return;
 try{ window.SDUICards?.decorate?.(btn,group); }catch{}
 try{ window.SDExact5087?.scan?.(); }catch{}
 btn.classList.add('sd834-nav-card');
 btn.style.removeProperty('height');
 btn.style.removeProperty('min-height');
 btn.style.removeProperty('width');
 btn.style.removeProperty('max-width');
 btn.style.removeProperty('transform');
 normalizeTitle(btn);
}
function normalizeGrid(grid, group){
 if(!grid) return;
 grid.classList.add('sd834-grid');
 const buttons=[...grid.children].filter(el=>el.tagName==='BUTTON'&&visible(el));
 grid.classList.toggle('sd834-grid--six',buttons.length===6);
 buttons.forEach(btn=>decorateButton(btn,group));
}
function normalizeHome(){
 document.querySelectorAll(HOME_SELECTOR).forEach(card=>{
  card.classList.add('sd834-home-card');
  const key=Object.keys(SUBJECT_LABELS).find(k=>card.classList.contains(k));
  const title=key?SUBJECT_LABELS[key]:'';
  const extras=card.querySelectorAll(':scope > .sd87-card-title,:scope > .sd-layer-caption,:scope > .sd817-photo-title,:scope > .sd-layer-art,:scope > img.sd-subject-title-svg');
  extras.forEach(el=>el.remove());
  let label=card.querySelector(':scope > .sd821-label');
  if(!label){label=document.createElement('span');label.className='sd821-label';label.setAttribute('aria-hidden','true');card.appendChild(label)}
  if(title && cleanText(label.textContent)!==title) label.textContent=title;
  if(title) card.setAttribute('aria-label',title);
 });
}
function apply(){
 document.body.dataset.sd834Style=cardStyle();
 try{ window.SDUICards?.scan?.(); }catch{}
 GRID_CONFIG.forEach(([sel,group])=>document.querySelectorAll(sel).forEach(grid=>normalizeGrid(grid,group)));
 try{ window.SDResponsive50821?.refresh?.(); }catch{}
 try{ window.SDHomeAppearance50830?.refresh?.(); }catch{}
 normalizeHome();
 GRID_CONFIG.forEach(([sel,group])=>document.querySelectorAll(sel).forEach(grid=>normalizeGrid(grid,group)));
 try{ window.SDExact5087?.scan?.(); }catch{}
 }
let queued=false;
function schedule(){ if(queued) return; queued=true; requestAnimationFrame(()=>{queued=false; apply();}); }
function boot(){
 schedule();
 ['sd-card-style-change','sd-style-preview','sd88-wallpaper-changed','sd87-cards-ready'].forEach(ev=>document.addEventListener(ev,schedule));
 window.addEventListener('pageshow',schedule);
 window.addEventListener('focus',schedule);
 document.addEventListener('visibilitychange',()=>{ if(!document.hidden) schedule(); });
 const obs=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='attributes' && r.target===document.body && (r.attributeName==='data-card-style' || r.attributeName==='data-game-theme')){schedule();return}
   if(r.type==='childList' && [...r.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('.hub-cards,.adv-menu-cards,.sd-czech-cards,.subject-grid,.v23-extra-grid,button,.subject') || n.querySelector?.('.hub-cards,.adv-menu-cards,.sd-czech-cards,.subject-grid,.v23-extra-grid,button,.subject')))){schedule();return}
  }
 });
 obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style','data-game-theme']});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.SDEnvironmentAudit50834=Object.freeze({refresh:schedule,version:'50.8.34'});
})();
