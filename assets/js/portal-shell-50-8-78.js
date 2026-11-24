/* 50.8.78 – propojení nového rodičovského centra s původními nástroji. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const pane=v=>document.querySelector('#sd876Center [data-pane="'+v+'"]');
let ready=false;
function setup(){
 if(ready||!$('sd876Center'))return;
 ready=true;
 const intro=document.querySelector('#sd876Center .sd876-head p');
 if(intro)intro.textContent='Testování dětí, správa učiva, dobrodružná mapa a zařízení.';
 const profiles=pane('profiles'),oldProfiles=profiles?.querySelector('#sd874TabProfiles');
 if(oldProfiles){
  const detail=document.createElement('details');detail.className='sd878-advanced';
  const label=document.createElement('summary');label.textContent='Pokročilé úpravy profilů a PINů';
  detail.append(label,oldProfiles);profiles.append(detail);
 }
 const schools=pane('schools'),oldSchools=schools?.querySelector('#sd874TabSchools');
 if(oldSchools){
  const detail=document.createElement('details');detail.className='sd878-advanced';
  const label=document.createElement('summary');label.textContent='Původní správa škol a měsíčních plánů';
  detail.append(label,oldSchools);schools.append(detail);
 }
 const settings=pane('settings');
 if(settings){
  const top=document.createElement('section');top.id='sd878SettingsTop';top.className='sd878-settings-top';
  settings.prepend(top);
 }
 const log=$('sd877LogShortcut');
 if(log){const strong=log.querySelector('strong');if(strong)strong.textContent='Uložit diagnostický log aplikace';}
}
function show(view){
 setup();
 if(view==='testing')window.SDPortalTesting878?.show?.();
 else if(view==='profiles')window.SDPortalProfiles878?.show?.();
 else if(view==='schools')window.SDPortalSchools878?.show?.();
 else if(view==='map')window.SDPortalMap878?.show?.();
 else if(view==='settings')window.SDPortalSettings878?.show?.();
}
function init(){
 if(!$('sd876Center')){setTimeout(init,350);return}
 setup();
 window.addEventListener('sd866-updated',()=>{
  if(document.body.classList.contains('parent-role')&&$('sd876Center')?.dataset.view==='root')return;
  const view=$('sd876Center')?.dataset.view||'';
  if(['testing','profiles','schools','map'].includes(view))setTimeout(()=>show(view),400);
 });
 window.addEventListener('sd871-school-config-change',()=>{if($('sd876Center')?.dataset.view==='schools')setTimeout(()=>show('schools'),450)});
}
window.SDParent878={show};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1480),{once:true});else setTimeout(init,1480);
})();