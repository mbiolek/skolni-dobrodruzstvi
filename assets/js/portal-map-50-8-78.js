/* 50.8.79 – Mapa postupu: skutečné výsledky, včetně základní násobilky a dělení. */
(()=>{'use strict';
const SUBJECTS=[['math','Matematika','📐'],['czech','Čeština','📖'],['english','Angličtina','🇬🇧'],['nature','Přírodověda','🌿'],['geography','Vlastivěda','🌍']];
const PROFILE_KEY='matematika-karticky-progress-v3-profiles';
const $=id=>document.getElementById(id);
const el=(host,tag,value,cls)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(cls)node.className=cls;host.append(node);return node};
const json=(key,def={})=>{try{return JSON.parse(localStorage.getItem(key)||'null')||def}catch{return def}};
const numeric=x=>{const n=Number(x);return Number.isFinite(n)&&n>=0?n:0};
const cnt=v=>Array.isArray(v)?v.length:typeof v==='number'&&v>0?v:0;
function totals(profile){
 const memory=profile?.memory&&typeof profile.memory==='object'?profile.memory:{};
 const relevant=Object.keys(memory).filter(key=>/^(?:mul|div)-/i.test(key));
 const done=numeric(profile?.totals?.done),correct=numeric(profile?.totals?.correct);
 return {done,correct,skills:relevant.length,multiplication:relevant.filter(k=>k.startsWith('mul-')).length,division:relevant.filter(k=>k.startsWith('div-')).length};
}
function show(){
 const host=$('sd878Map');if(!host)return;host.replaceChildren();
 el(host,'p','Mapa zobrazuje skutečně uložené výsledky, včetně násobilky a dělení. „Bez záznamu“ neznamená, že dítě dané učivo nezvládá.','sd878-description');
 const profiles=Object.entries(json(PROFILE_KEY)).filter(([id,p])=>id!=='parent'&&p?.name);
 if(!profiles.length){el(host,'p','Nejsou dostupné dětské profily.');return}
 const label=el(host,'label','Zobrazit dítě','sd878-field');
 const select=el(label,'select');
 for(const [id,p] of profiles){const opt=el(select,'option',p.name);opt.value=id}
 const graphic=el(host,'section',undefined,'sd878-adventure-map');
 el(graphic,'h3','Mapa školního dobrodružství');
 const track=el(graphic,'div',undefined,'sd878-map-track');
 const details=el(host,'section',undefined,'sd878-map-details');
 function redraw(){
  track.replaceChildren();details.replaceChildren();
  const pid=select.value,profilesNow=json(PROFILE_KEY),profile=profilesNow[pid]||{};
  const school=json('sd52_schools_plans_v1'),records=school?.results||{};
  const practice=json('sd878_extra_practice_'+pid);
  const achievements=totals(profile);
  const raw=Object.entries(records).filter(([key])=>key.startsWith(pid+'|')||key.includes('|'+pid+'|'));
  for(let i=0;i<SUBJECTS.length;i++){
   const [sub,name,icon]=SUBJECTS[i];
   const relevant=raw.filter(([key])=>key.includes('|'+sub+'|'));
   const recorded=relevant.reduce((n,[,v])=>n+cnt(v),0);
   const saved=Object.values(practice).filter(v=>v&&v.subject===sub);
   const attempts=saved.reduce((n,v)=>n+numeric(v.attempts),0);
   const baseDone=sub==='math'?achievements.done:0;
   const hasRecord=recorded+attempts+baseDone>0;
   const descriptor=sub==='math'&&baseDone?baseDone+' příkladů':hasRecord?'Záznamy: '+(recorded+attempts):'Bez záznamu';
   const node=el(track,'button',icon+'\n'+name+'\n'+descriptor,'sd878-btn sd878-map-node '+(hasRecord?'sd879-has-progress':'sd879-no-progress'));
   node.type='button';node.style.setProperty('--sd878-step',String(i));
   node.setAttribute('aria-label',name+': '+descriptor);
   node.addEventListener('click',()=>{
    details.replaceChildren();
    el(details,'h3',name);
    if(sub==='math'&&baseDone){
     el(details,'p','Násobilka a dělení: '+baseDone+' procvičených příkladů, z toho '+achievements.correct+' správně.');
     if(achievements.skills)el(details,'p','Zaznamenáno '+achievements.skills+' různých typů příkladů ('+achievements.multiplication+' násobení, '+achievements.division+' dělení).');
    }
    if(recorded)el(details,'p','Další výsledky měsíčních plánů: '+recorded+' záznamů.');
    if(attempts)el(details,'p','Procvičování doplněného učiva: '+attempts+' pokusů.');
    for(const v of saved)el(details,'p',(v.title||'Téma')+': '+numeric(v.correct)+' správně z '+numeric(v.total)+' odpovědí.');
    if(!hasRecord)el(details,'p','Pro tuto oblast zatím nemáme uložené výsledky. Po procvičování se zde zobrazí její záznamy.');
   });
  }
  const global=el(details,'div',undefined,'sd878-map-total');
  el(global,'h3','Celkový pokrok: '+(profile.name||'Dítě'));
  if(achievements.done){
   el(global,'p','Matematika – procvičeno: '+achievements.done);
   el(global,'p','Matematika – správné odpovědi: '+achievements.correct);
  }else el(global,'p','Základní násobilka a dělení zatím nemají záznam.');
  if(profile.xp!==undefined&&Number.isFinite(Number(profile.xp)))el(global,'p','XP: '+numeric(profile.xp));
  el(global,'p','Klepnutím na oblast mapy otevřeš podrobnosti příslušného předmětu.');
 }
 select.addEventListener('change',redraw);redraw();
}
window.SDPortalMap878={show};
})();