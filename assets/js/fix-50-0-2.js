/* 50.7.3: Single version badge. Former duplicate avatar event handlers removed. */
(()=>{'use strict';
function updateVersion(){
 const current=window.SDApp?.version||'nezjištěná';
 let badge=document.getElementById('schoolVersion502');
 if(!badge){badge=document.createElement('div');badge.id='schoolVersion502';document.body.append(badge)}
 badge.textContent='Školní dobrodružství · verze '+current;
 badge.title='Informace o verzi';badge.onclick=()=>document.getElementById('appVersionDialog')?.classList.add('open');
 const gate=document.getElementById('authGate');
 badge.classList.toggle('on-login',!!gate&&!gate.classList.contains('off'));
 const prior=document.getElementById('schoolVersionAtLogin');if(prior)prior.hidden=true;
}
updateVersion();window.addEventListener('school-account',()=>setTimeout(updateVersion,0));
window.addEventListener('pageshow',updateVersion);
window.SDShowVersion=updateVersion;
})();
