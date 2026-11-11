/* 50.8.20 – bezpečné otevření nové přírodovědy bez přepsání ostatních předmětů. */
(()=>{'use strict';
const NATURE_PAGE=new window.URL('./prirodoveda-fulnek/index.html',document.baseURI).href;
function open(){location.assign(NATURE_PAGE)}
function install(){
 const home=document.getElementById('homeScreen');if(!home)return;
 // Older versions attach direct click handlers to the nature tile, sometimes even as
 // a disabled div. Catch it at the parent capture phase before those handlers.
 const card=home.querySelector('.subject.nature');
 if(card){card.removeAttribute('aria-disabled');card.setAttribute('tabindex','0');card.setAttribute('role','button');card.style.cursor='pointer';card.setAttribute('aria-label','Přírodověda – 5. třída Fulnek, výuka a testy');
  const txt=card.querySelector('small');if(txt)txt.textContent='Výuka, procvičování a test';
  const status=card.querySelector('.v451-footer > span:last-child');if(status&&!status.classList.contains('v452-badge-btn')){status.textContent='📗 Učit se';}
 }
 home.addEventListener('click',e=>{
  const tile=e.target.closest?.('.subject.nature');if(!tile||!home.contains(tile))return;
  if(e.target.closest('.v452-badge-btn,.v44-xp,.v451-footer'))return; // badges and XP remain independent
  e.preventDefault();e.stopImmediatePropagation();open();
 },true);
 home.addEventListener('keydown',e=>{
  const tile=e.target.closest?.('.subject.nature');if(!tile||!['Enter',' '].includes(e.key))return;
  e.preventDefault();e.stopImmediatePropagation();open();
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.SDNatureFulnekLaunch50820=Object.freeze({open,version:'50.8.20'});
})();
