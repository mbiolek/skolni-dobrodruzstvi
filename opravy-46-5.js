/* v46.5: one-level Android Back and persistent map entry */
(()=>{'use strict';
const $=id=>document.getElementById(id),home=()=>document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('visible',s.id==='homeScreen'));
const visible=()=>document.querySelector('.screen.visible')?.id||'homeScreen';
const hub=()=>$('subjectHub')?.classList.contains('open');
const adv=()=>$('advSubjectMenu')?.classList.contains('on');
const menuOpen=()=>hub()||adv();
let historyReady=false;
const addGuard=()=>{try{history.pushState({school465:true},'',location.href);historyReady=true}catch(e){}};
// Prevent legacy popstate listener from handling the same gesture a second time.
window.addEventListener('popstate',event=>{
 event.stopImmediatePropagation();
 const root=$('vlastScreen'),map=$('map462'),oldMap=$('v46map'),units=$('vlUnits'),work=$('vlWork');
 if($('authGate')&&!$('authGate').classList.contains('off')){addGuard();return}
 if(visible()==='vlastScreen'){
  if(map&&!map.hidden){map.hidden=true;if(units)units.hidden=false}
  else if(oldMap&&!oldMap.hidden){oldMap.hidden=true;if(units)units.hidden=false}
  else if(work&&!work.hidden){work.hidden=true;if(units)units.hidden=false}
  else home();
 }else if(menuOpen()){
  $('subjectHub')?.classList.remove('open');$('advSubjectMenu')?.classList.remove('on');document.body.style.overflow='';home();
 }else if(visible()!=='homeScreen'){
  // Any exercise screen returns to its subject selection, not to app exit.
  const subject=visible()==='englishScreen'?'english':'math';
  home();const h=$('subjectHub');if(h){h.dataset.subject=subject;h.classList.add('open');}
 }else if(window.__school465Subject){
  window.__school465Subject=false;home();
 }else{
  if(confirm('Chceš ukončit Školní dobrodružství?')){return}
 }
 window.scrollTo(0,0);addGuard();
},true);
// Legacy listener already installed its own guard, but install a fresh one for this handler.
addGuard();
function keepMap(){
 const units=$('vlUnits');if(!units)return;
 let tile=units.querySelector('.v461-map-tile');
 if(!tile){tile=document.createElement('button');tile.className='v461-map-tile';units.prepend(tile)}
 tile.innerHTML='<strong>🗺️ Slepá mapa ČR</strong><small>Výukové mapy a procvičování: kraje, města, řeky, pohoří</small>';
 tile.onclick=()=>{const m=$('map462');if(!m)return;units.hidden=true;const w=$('vlWork');if(w)w.hidden=true;const old=$('v46map');if(old)old.hidden=true;m.hidden=false;const toggle=$('map464toggle');if(toggle)toggle.textContent='Přejít na procvičování – slepá mapa';window.scrollTo(0,0)};
}
function init(){
 keepMap();const units=$('vlUnits');if(units){let updating=false;new MutationObserver(()=>{if(updating)return;updating=true;keepMap();updating=false}).observe(units,{childList:true})}
 document.querySelectorAll('#homeScreen .subject.history').forEach(b=>b.addEventListener('click',()=>queueMicrotask(keepMap)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
