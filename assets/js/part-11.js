/* Version details dialog; the visible badge is created by the central version module. */
(()=>{'use strict';
const dialog=document.getElementById('appVersionDialog');
if(!dialog)return;
const close=()=>dialog.classList.remove('open');
document.getElementById('appVersionTag')?.addEventListener('click',()=>dialog.classList.add('open'));
document.getElementById('appVersionClose')?.addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
