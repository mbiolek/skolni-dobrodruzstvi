(function(){'use strict';
 const KEY='skolni-resume-v441',ACTIVE='matematika-karticky-progress-v3-active';
 const gate=document.getElementById('authGate'),menu=document.getElementById('advSubjectMenu');
 let restoring=false, lastAccount=null, pending=null;
 function account(){try{return sessionStorage.getItem('skolni-live-v441')}catch{return null}}
 function snapshot(){if(restoring||!gate.classList.contains('off'))return;
  const id=account();if(!id||id==='parent')return;
  const visible=document.querySelector('.screen.visible');
  const state={id,screen:visible?.id||'homeScreen',menu:menu.classList.contains('on'),subject:document.getElementById('advMenuTitle')?.textContent||'',scroll:window.scrollY,at:Date.now()};
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
 }
 function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&Date.now()-s.at<7*86400000?s:null}catch{return null}}
 function restore(id){const state=read();if(!state||state.id!==id)return;
  restoring=true;
  try{
   if(state.menu&&/Matematika|Angličtina/.test(state.subject)){
    const which=state.subject.includes('Matematika')?'math':'english';
    document.querySelector('#homeScreen [data-open="'+which+'"]')?.click();
   }else if(state.screen&&state.screen!=='homeScreen'){
    const which=state.screen.replace(/Screen$/,'');
    const btn=document.querySelector('#homeScreen [data-open="'+which+'"]');
    if(btn){btn.click();if(menu.classList.contains('on')){document.querySelector('#advSubjectMenu [data-adv-mode="practice"]')?.click()}}
   }
   requestAnimationFrame(()=>window.scrollTo(0,Math.max(0,state.scroll||0)));
  }finally{setTimeout(()=>{restoring=false;snapshot()},400)}
 }
 window.addEventListener('school-resume-login',e=>{if(e.detail?.id&&e.detail.id!=='parent')setTimeout(()=>restore(e.detail.id),0)});
 // A previously authenticated local profile can resume after a cold start.
 // A still-live tab can resume immediately even if Android recreated its document.
 if(account()&&gate.classList.contains('off'))setTimeout(()=>restore(account()),0);
 document.addEventListener('click',()=>setTimeout(snapshot,120),true);
 document.addEventListener('change',()=>setTimeout(snapshot,120),true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)snapshot()});
 window.addEventListener('pagehide',snapshot);
 window.addEventListener('scroll',()=>{if(!restoring&&gate.classList.contains('off'))snapshot()},{passive:true});
 new MutationObserver(()=>{if(!restoring)setTimeout(snapshot,0)}).observe(menu,{attributes:true,attributeFilter:['class']});
 document.querySelectorAll('.screen').forEach(el=>new MutationObserver(()=>{if(!restoring)setTimeout(snapshot,0)}).observe(el,{attributes:true,attributeFilter:['class']}));
})();
