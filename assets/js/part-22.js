
(()=>{
const $=id=>document.getElementById(id);
const home=$('homeScreen');if(!home)return;
const profilesKey='matematika-karticky-progress-v3-profiles';
const activeKey='matematika-karticky-progress-v3-active';
const panel=document.createElement('section');panel.id='v452-profile';panel.className='child';
panel.innerHTML='<span class="avatar">🧒</span><div class="info"><strong>Profil</strong><small>Výsledky a odznaky</small></div>';
/* v45.3: profil je již v horní kartě home-hero, druhou duplicitní kartu nevkládáme. */
const overlay=document.createElement('div');overlay.id='v452-badges';
overlay.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-label="Moje odznaky"><button type="button" id="v452-close">← Zpět</button><h2>🏅 Moje odznaky</h2><div id="v452-badge-content"></div></div>';
document.body.append(overlay);
$('v452-close').onclick=()=>overlay.classList.remove('open');
overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
let signed=null;
function refresh(){
 let ps={};try{ps=JSON.parse(localStorage.getItem(profilesKey)||'{}')}catch{}
 const id=signed||localStorage.getItem(activeKey);
 const isParent=id==='parent';
 panel.className=isParent?'parent':'child';
 const profile=ps[id]||{};
 const name=isParent?'Rodič – správce':profile.name||'Dětský profil';
 panel.querySelector('.avatar').textContent=isParent?'🔐':'🧒';
 panel.querySelector('strong').textContent=name;
 const totals=profile.totals||{};
 const done=Number(totals.done)||0,correct=Number(totals.correct)||0;
 panel.querySelector('small').textContent=isParent?'Správa profilů a výsledků dětí':`Dokončeno: ${done} · Správně: ${correct} · Odznaky`;
}
window.addEventListener('school-account',e=>{signed=e.detail?.id||null;refresh()});
refresh();
const requirements=[['🥉 První krok',1],['🥈 Vytrvalec',20],['🥇 Mistr',100]];
function openBadges(subject){
 let ps={};try{ps=JSON.parse(localStorage.getItem(profilesKey)||'{}')}catch{}
 const profile=ps[signed||localStorage.getItem(activeKey)]||{};
 const correct=Number(profile.totals?.correct)||0;
 const safe=document.createElement('div');
 const intro=document.createElement('p');intro.textContent=`${subject}: odznaky za správné odpovědi. Dostupné výsledky: ${correct}.`;
 safe.append(intro);
 requirements.forEach(([name,goal])=>{
  const item=document.createElement('div');item.className='item'+(correct<goal?' locked':'');
  item.textContent=(correct>=goal?'✓ ':'🔒 ')+name+` — ${Math.min(correct,goal)}/${goal} správných odpovědí`;
  safe.append(item);
 });
 const note=document.createElement('small');note.textContent='Pozn.: starší výsledky jsou souhrnné za profil, nikoliv za jednotlivé předměty.';safe.append(note);
 $('v452-badge-content').replaceChildren(safe);
 overlay.classList.add('open');
}
const names={math:'Matematika',english:'Angličtina',czech:'Čeština',nature:'Přírodověda',history:'Vlastivěda',music:'Hudební výchova'};
home.querySelectorAll('.subject').forEach(tile=>{
 const sub=Object.keys(names).find(k=>tile.classList.contains(k));if(!sub)return;
 const footer=tile.querySelector('.v451-footer');if(!footer)return;
 const label=footer.lastElementChild;if(!label)return;
 label.textContent='🏅';
 label.classList.add('v452-badge-btn');
 label.setAttribute('title','Zobrazit odznaky');
 label.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openBadges(names[sub])});
});
/* v45.7: Android system gesture is handled exclusively by popstate.
   Do not also click a Back button on touchend (double navigation). */
})();

