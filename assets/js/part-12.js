
(()=>{'use strict';const hub=document.getElementById('subjectHub');let subject='math',bypass=false;
 document.querySelectorAll('#homeScreen button[data-open]').forEach(b=>b.addEventListener('click',e=>{if(b.dataset.open==='czech')return;if(bypass){bypass=false;return}e.stopImmediatePropagation();e.preventDefault();subject=b.dataset.open;hub.dataset.subject=subject;document.getElementById('hubTitle').textContent=subject==='math'?'📐 Matematika':'🇬🇧 Angličtina';hub.classList.add('open');},true));
 document.getElementById('hubBack').onclick=()=>hub.classList.remove('open');
 document.querySelectorAll('[data-hub-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.hubMode;hub.classList.remove('open');document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('visible',x.id===(subject==='math'?'mathScreen':'englishScreen')));window.scrollTo(0,0);if(subject==='english'){document.getElementById('enExtended').classList.add('on');document.getElementById('enSetup').classList.add('hidden')}return;const original=document.querySelector('#homeScreen button[data-open="'+subject+'"]');if(original){bypass=true;original.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))}
 if(subject==='math'){
  if(mode==='teach'){const x=document.getElementById('visualDiv');if(x){/* teaching tools remain in the math screen */}}
  if(mode==='test'){const x=document.getElementById('diagLaunch');if(x){setTimeout(()=>x.scrollIntoView({behavior:'smooth',block:'center'}),120)}}
 }
 });
})();

