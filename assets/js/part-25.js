
(()=>{'use strict';
 const home=document.querySelector('#homeScreen .app');if(!home)return;
 const bar=document.createElement('div');bar.id='v26-playerbar';bar.innerHTML='<div id="v26-playerpic" aria-hidden="true"></div><div class="v26-playerinfo"><strong id="v26-name">Můj profil</strong><small id="v26-level">Moje školní dobrodružství</small><div class="v26-progress" aria-label="Postup k dalšímu milníku"><span id="v26-fill"></span></div></div><div class="v26-trophy" aria-hidden="true">🏆<small id="v26-count">0 úloh</small></div>';
 home.insertBefore(bar,home.firstChild);
 const label=document.getElementById('v26-name'),count=document.getElementById('v26-count'),level=document.getElementById('v26-level'),fill=document.getElementById('v26-fill');
 let child=null;
 function update(){if(!child)return;
   let name=child;
   const buttons=[...document.querySelectorAll('#authUsers .userbtn')];
   const candidate=buttons.find(b=>b.dataset.userId===child||b.dataset.id===child||b.dataset.accountId===child);
   if(candidate)name=candidate.querySelector('strong')?.textContent||name;
   if(name===child){try{const obj=JSON.parse(localStorage.getItem('matematika-karticky-progress-v3-profiles')||'{}');name=obj[child]?.name||name}catch(e){}}
   label.textContent=name;
   const done=Number(document.getElementById('allDone')?.textContent?.replace(/[^0-9]/g,''))||0;
   count.textContent=done+' úloh';level.textContent='Milník '+(Math.floor(done/100)+1)+' · '+(done%100)+'/100 úloh';fill.style.width=(done%100)+'%';
 }
 window.addEventListener('school-account',e=>{child=e.detail?.id&&e.detail.id!=='parent'?e.detail.id:null;update()});
 const counter=document.getElementById('allDone');if(counter)new MutationObserver(update).observe(counter,{childList:true,characterData:true,subtree:true});
 // Existing profile data and avatars remain stored unchanged.
})();

