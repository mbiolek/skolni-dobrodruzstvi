/* 50.8.78 – skutečná dobrodružná mapa postupu bez vymyšlených výsledků. */
(()=>{'use strict';
const SUBJECTS=[['math','Matematika','📐'],['czech','Čeština','📖'],['english','Angličtina','🇬🇧'],['nature','Přírodověda','🌿'],['geography','Vlastivěda','🌍']];
const P='matematika-karticky-progress-v3-profiles';
const el=(h,t,x,c)=>{const n=document.createElement(t);if(x!==undefined)n.textContent=x;if(c)n.className=c;h.append(n);return n};
const btn=(h,x,cb,c)=>{const b=el(h,'button',x,'sd878-btn '+(c||''));b.type='button';b.onclick=cb;return b};
const json=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
function show(){
 const host=document.getElementById('sd878Map');if(!host)return;host.replaceChildren();
 el(host,'p','Dobrodružná cesta je vytvořená z reálně uložených výsledků. Nevyplněné části neznamenají, že je dítě nezvládlo.','sd878-description');
 const ps=Object.entries(json(P)).filter(([id,p])=>id!=='parent'&&p?.name);
 if(!ps.length){el(host,'p','Zatím nejsou vytvořené dětské profily.');return}
 const label=el(host,'label','Zobrazit dítě','sd878-field'),select=el(label,'select');
 for(const [id,p] of ps){const option=el(select,'option',p.name);option.value=id}
 const graphic=el(host,'section',undefined,'sd878-adventure-map');
 el(graphic,'h3','Mapa školního dobrodružství');
 const track=el(graphic,'div',undefined,'sd878-map-track');
 const details=el(host,'section',undefined,'sd878-map-details');
 const redraw=()=>{
  track.replaceChildren();details.replaceChildren();
  const pid=select.value,p=json(P)[pid]||{},school=json('sd52_schools_plans_v1');
  const records=school.results||{};
  const practice=json('sd878_extra_practice_'+pid);
  const matches=Object.entries(records).filter(([k])=>k.startsWith(pid+'|')||k.includes('|'+pid+'|'));
  for(let i=0;i<SUBJECTS.length;i++){
   const [sub,name,icon]=SUBJECTS[i];
   const events=matches.filter(([k])=>k.includes('|'+sub+'|'));
   const total=events.reduce((n,[,v])=>n+(Array.isArray(v)?v.length:0),0);
   const extra=Object.values(practice).filter(v=>v?.subject===sub);
   const attempts=extra.reduce((n,v)=>n+(Number(v.attempts)||0),0);
   const node=btn(track,icon+'\n'+name+'\n'+(total+attempts?'Záznamy: '+(total+attempts):'Nezaznamenáno'),()=>{
    details.replaceChildren();el(details,'h3',name);
    el(details,'p',total?'Výsledky v měsíčních plánech: '+total+'.':'Měsíční plány zatím nemají samostatné výsledky pro tento předmět.');
    el(details,'p',attempts?'Procvičování doplněného učiva: '+attempts+' pokusů.':'Z doplněného učiva tu zatím nejsou záznamy.');
    for(const [,v] of extra)el(details,'p',(v.title||'Téma')+': '+(v.correct||0)+' správně z '+(v.total||0)+' odpovědí.');
   },'sd878-map-node');
   node.style.setProperty('--sd878-step',String(i));
  }
  const global=el(details,'div',undefined,'sd878-map-total');
  el(global,'h3','Celkový pokrok: '+(p.name||'Dítě'));
  for(const [name,n] of [['Procvičeno',p.totals?.done],['Správně',p.totals?.correct],['XP',p.xp]])
   if(n!==undefined&&n!==null&&Number.isFinite(Number(n)))el(global,'p',name+': '+Number(n));
  el(global,'p','Kliknutím na oblast mapy otevřeš její výsledky.');
 };
 select.onchange=redraw;redraw();
}
window.SDPortalMap878={show};
})();