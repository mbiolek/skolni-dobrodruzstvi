/* 50.8.44 – aktivní škola Olomouc: samostatné učivo ze sešitů.
   Fulnek neměníme. Nepřepisujeme stávající školní plány ani testy. */
(()=>{'use strict';
const data=()=>{try{return JSON.parse(localStorage.getItem('sd52_schools_plans_v1')||'{}')||{}}catch{return {}}};
const selected=()=>window.SDSchoolContext827?.activeSchoolId?.();
const isOlomouc=()=>{const id=selected(),school=(data().schools||[]).find(s=>s.id===id);return !!school&&/olomouc/i.test((school.city||'')+' '+(school.name||''))};
const createLink=(id,href,title,subtitle)=>{
 let a=document.getElementById(id);
 if(!a){a=document.createElement('a');a.id=id;a.className='sd844-entry';a.href=href;a.innerHTML=`<span aria-hidden="true">📚</span><span><strong>${title}</strong><small>${subtitle}</small></span><span aria-hidden="true">›</span>`;}
 return a;
};
function update(){
 const on=isOlomouc(),home=document.querySelector('#homeScreen .app');
 if(home){const a=createLink('sd844-home-entry','./olomouc-sesity/index.html','Olomouc · učivo ze sešitů','Matematika, čeština, angličtina a přírodověda');
  const grid=home.querySelector('.sd825-home-grid')||home.querySelector('.subject-grid');
  if(!a.isConnected && grid)grid.insertAdjacentElement('beforebegin',a);a.hidden=!on;
 }
 const hub=document.getElementById('subjectHub');
 if(hub){const a=createLink('sd844-hub-entry','./olomouc-sesity/index.html#math','Olomouc · školní sešity','Výuka, procvičování a test');
  const h=hub.querySelector('.hub-cards');if(!a.isConnected&&h)h.insertAdjacentElement('beforebegin',a);
  const which=hub.dataset.subject==='english'?'english':'math';a.href='./olomouc-sesity/index.html#'+which;a.hidden=!on;
 }
 const cz=document.getElementById('sdCzechHub5074');
 if(cz){const a=createLink('sd844-czech-entry','./olomouc-sesity/index.html#czech','Olomouc · český jazyk','Učivo ze školního sešitu');const grid=cz.querySelector('.sd-czech-cards');if(!a.isConnected&&grid)grid.insertAdjacentElement('beforebegin',a);a.hidden=!on;}
}
let pending=false;function soon(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;update()})}
function boot(){update();document.addEventListener('sd827-school-change',soon);document.addEventListener('sd-route-change',soon);window.addEventListener('school-account',soon);window.addEventListener('school-resume-login',soon);window.addEventListener('pageshow',soon);
 const hub=document.getElementById('subjectHub');if(hub)new MutationObserver(soon).observe(hub,{attributes:true,attributeFilter:['class','data-subject']});
 window.addEventListener('storage',e=>{if(!e.key||e.key.startsWith('sd827_')||e.key==='sd52_schools_plans_v1')soon()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDOlomoucEntry844=Object.freeze({isOlomouc,refresh:soon});
})();
