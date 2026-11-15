/* 50.8.18: entry points for new standalone fifth-grade mathematics module.
   Existing cards and their handlers stay untouched. */
(()=>{'use strict';
const url=new URL('./matematika-fulnek/index.html',document.baseURI).href;
function open(){
 const hub=document.getElementById('subjectHub');
 if(hub?.classList.contains('open') && hub.dataset.subject && hub.dataset.subject!=='math')return;
 location.assign(url);
}
function install(){
 const hub=document.querySelector('#subjectHub .hub-cards');
 if(hub&&!hub.querySelector('.sd518-fulnek-hub')){
  const b=document.createElement('button');b.type='button';b.className='hub-card sd518-fulnek-hub';
  b.innerHTML='<b>Matematika – 5. třída · Fulnek</b><span class="hub-emoji" aria-hidden="true">📐</span><small>Výuka, procvičování, školní test a opakování chyb</small><span class="hub-start">Otevřít učivo</span>';
  b.addEventListener('click',open);hub.append(b);
  const toggle=()=>{b.hidden=hub.dataset.subject==='english';};
  new MutationObserver(toggle).observe(hub,{attributes:true,attributeFilter:['data-subject','class']});toggle();
 }
 const grid=document.getElementById('v496Topics');
 if(grid&&!grid.querySelector('.sd518-fulnek-topic')){
  const b=document.createElement('button');b.type='button';b.className='sd518-fulnek-topic';b.textContent='📐 5. třída – Fulnek · učivo do pololetí';b.addEventListener('click',open);grid.append(b);
 }
 const setup=document.getElementById('setup');
 if(setup&&!setup.querySelector('.sd518-fulnek-setup')){
  const b=document.createElement('button');b.type='button';b.className='sd518-fulnek-setup';b.textContent='📚 Matematika – 5. třída · Fulnek';b.addEventListener('click',open);
  const first=setup.querySelector('h2')||setup.firstElementChild;if(first)first.before(b);else setup.prepend(b);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.SDFulnekMathLaunch518={open};
})();
