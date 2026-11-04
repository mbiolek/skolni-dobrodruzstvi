
(()=>{'use strict';
 const menu=document.getElementById('advSubjectMenu'),title=document.getElementById('advMenuTitle'),ico=document.getElementById('advMenuIcon');
 let subject='math',bypass=false;
 document.querySelectorAll('#homeScreen [data-open]').forEach(b=>b.addEventListener('click',e=>{if(b.dataset.open==='czech')return;if(bypass)return;e.preventDefault();e.stopImmediatePropagation();subject=b.dataset.open;title.textContent=subject==='math'?'Matematika':'Angličtina';ico.textContent=subject==='math'?'📐':'🇬🇧';menu.classList.add('on');document.body.style.overflow='hidden';},true));
 function close(){menu.classList.remove('on');document.body.style.overflow=''}
 document.getElementById('advMenuBack').onclick=close;
 document.querySelectorAll('[data-adv-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.advMode;close();const original=document.querySelector('#homeScreen [data-open="'+subject+'"]');if(!original)return;bypass=true;original.click();bypass=false;
  if(subject==='math'){
   if(mode==='teach'){document.getElementById('visualDiv')?.scrollIntoView({behavior:'smooth',block:'center'});}
   else if(mode==='test'){document.getElementById('setup')?.scrollIntoView({behavior:'smooth',block:'start'});}
  }else if(subject==='english'){
   if(mode==='teach')document.getElementById('vocabSetup')?.scrollIntoView({behavior:'smooth',block:'start'});
   else document.getElementById('enSetup')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
 });
 window.addEventListener('school-account',e=>{if(e.detail.id===null)close()});
 const skin=document.getElementById('skinHomeButton');if(skin){skin.textContent='🎨 Změnit moje prostředí';skin.style.display='none';}
 window.addEventListener('school-account',e=>{if(skin)skin.style.display=e.detail.id&&e.detail.id!=='parent'?'flex':'none'});
})();

