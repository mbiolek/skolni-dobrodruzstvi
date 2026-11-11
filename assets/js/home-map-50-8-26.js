/* 50.8.26 — kompaktní domovská lišta + Mapa dobrodružství s XP, body a milníky. */
(()=>{'use strict';
const DBKEY='sd52_schools_plans_v1';
const ACTIVE='matematika-karticky-progress-v3-active';
const PROFILES='matematika-karticky-progress-v3-profiles';
const CURR_KEY_PREFIX='sd_curriculum_v501_';
const HOME_MAP={
 math:{label:'Matematika',icon:'📐'},
 czech:{label:'Čeština',icon:'📖'},
 english:{label:'Angličtina',icon:'🇬🇧'},
 nature:{label:'Přírodopis',icon:'🌿'},
 geography:{label:'Vlastivěda',icon:'🌍'},
 music:{label:'Hudební výchova',icon:'🎵'}
};
const MILESTONES=[0,50,120,220,350,500,750,1000];

function safeGet(key,fb){try{const v=localStorage.getItem(key);return v==null?fb:v}catch{return fb}}
function jsonGet(key,fb){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fb:v}catch{return fb}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(x){return String(x||'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function pct(n,d){return d?Math.round((n/d)*100):0}
function activeId(){return safeGet(ACTIVE,'parent')||'parent'}
function profiles(){const p=jsonGet(PROFILES,{});return p&&typeof p==='object'?p:{}}
function activeName(){const id=activeId();const p=profiles();return p[id]?.name||p.parent?.name||'zařízení'}

function collectStats(){
 const by={};
 const ensure=sub=>by[sub]??={xp:0,points:0,correct:0,total:0,attempts:0};
 const add=(sub,correct,total,kind='practice')=>{
  const s=ensure(sub);
  correct=Number(correct)||0; total=Number(total)||0;
  s.correct+=correct; s.total+=total; s.attempts++;
  s.xp += correct*10;
  let base=kind==='test'?3:2;
  let scorePct=total?pct(correct,total):0;
  s.points += base + (scorePct>=80?2:0) + (scorePct===100?1:0);
 };
 const db=jsonGet(DBKEY,{}); const id=activeId();
 const results=db?.results||{};
 for(const [k,arr] of Object.entries(results)){
  if(!k.startsWith(id+'|')||!Array.isArray(arr))continue;
  const sub=k.split('|')[1];
  arr.forEach(r=>add(sub,r.score,r.total,r.kind||'practice'));
 }
 const name=activeName();
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i)||'';
   if(!key.startsWith(CURR_KEY_PREFIX+name+'_'))continue;
   const parts=key.substring((CURR_KEY_PREFIX+name+'_').length).split('_');
   const sub=parts[0];
   const entries=jsonGet(key,[]);
   if(!Array.isArray(entries))continue;
   entries.forEach(r=>add(sub,r.score,r.total,r.mode||'practice'));
  }
 }catch{}
 const total={xp:0,points:0,correct:0,total:0,attempts:0};
 for(const sub of Object.keys(by)){
  const s=by[sub]; total.xp+=s.xp; total.points+=s.points; total.correct+=s.correct; total.total+=s.total; total.attempts+=s.attempts;
 }
 total.success=pct(total.correct,total.total);
 total.badges=badgeList(total);
 for(const s of Object.values(by))s.success=pct(s.correct,s.total);
 return {by,total};
}
function badgeList(total){
 const out=[];
 if(total.xp>=10)out.push('🌟 První kroky');
 if(total.points>=10)out.push('🏅 Sbírač bodů');
 if(total.success>=90 && total.total>0)out.push('🎯 Přesná muška');
 if(total.attempts>=5)out.push('📚 Pilný učedník');
 if(total.xp>=200)out.push('🗺️ Dobrodruh');
 return out;
}
function nextMilestone(xp){return MILESTONES.find(v=>v>xp) ?? null}
function levelFor(xp){let idx=0;for(let i=0;i<MILESTONES.length;i++)if(xp>=MILESTONES[i])idx=i;return idx}

function ensureMapScreen(){
 let root=document.getElementById('sd826Map');
 if(root)return root;
 root=document.createElement('section');
 root.id='sd826Map'; root.className='screen'; root.hidden=true;
 root.innerHTML='<div class="sd826-wrap"><header class="sd826-top"><button type="button" data-sd826="back">← Zpět</button><strong>🗺️ Mapa dobrodružství</strong><button type="button" data-sd826="home">⌂ Domů</button></header><main class="sd826-main"></main></div>';
 document.body.append(root);
 root.addEventListener('click',e=>{
  const btn=e.target.closest('[data-sd826]'); if(!btn)return;
  if(btn.dataset.sd826==='back' || btn.dataset.sd826==='home') closeMap();
 });
 return root;
}
function renderMap(){
 const root=ensureMapScreen();
 const main=root.querySelector('.sd826-main');
 const {by,total}=collectStats();
 const name=activeName();
 const next=nextMilestone(total.xp);
 const lv=levelFor(total.xp);
 const currentMilestone=MILESTONES[lv] || 0;
 const nextBase=next ?? currentMilestone;
 const progress=next ? Math.max(0,Math.min(100,Math.round(((total.xp-currentMilestone)/(next-currentMilestone))*100))) : 100;
 const subjects=Object.entries(HOME_MAP).map(([k,meta])=>{
  const s=by[k]||{xp:0,points:0,success:0,attempts:0};
  return `<article class="sd826-subject"><h3>${meta.icon} ${esc(meta.label)}</h3><div class="sd826-sub-grid"><span>XP <b>${s.xp}</b></span><span>Body <b>${s.points}</b></span><span>Úspěšnost <b>${s.success} %</b></span></div></article>`;
 }).join('');
 const milestones=MILESTONES.map((m,i)=>{
   const state=total.xp>=m?'done':(next===m?'next':'');
   const label=i===0?'Start':`Milník ${i}`;
   return `<li class="${state}"><span class="sd826-dot"></span><div><b>${label}</b><small>${m} XP</small></div></li>`;
 }).join('');
 const badges=total.badges.length ? total.badges.map(b=>`<span class="sd826-badge">${esc(b)}</span>`).join('') : '<span class="sd826-empty">Odznaky se začnou odemykat po prvních úkolech.</span>';
 const note=activeId()==='parent'
  ? '<p class="sd826-note">Jsi v rodičovském profilu. Mapa ukazuje souhrnný rodičovský pohled. Nejzajímavější postup uvidíš po přepnutí do dětského profilu.</p>'
  : '<p class="sd826-note">XP získáváš za správné odpovědi, body úspěchu za splněná procvičování a testy. Mapa slouží jako přehled budoucího herního postupu.</p>';
 main.innerHTML=`
  <section class="sd826-hero">
   <div class="sd826-hero-left">
    <h1>${esc(name)}</h1>
    <p>Tvoje cesta učením pokračuje.</p>
   </div>
   <div class="sd826-hero-right">
    <span class="sd826-big">${total.xp}</span>
    <small>celkem XP</small>
   </div>
  </section>
  <section class="sd826-stats">
   <article><span>⚡ XP</span><b>${total.xp}</b></article>
   <article><span>🏅 Body</span><b>${total.points}</b></article>
   <article><span>🎯 Úspěšnost</span><b>${total.success} %</b></article>
  </section>
  <section class="sd826-path-card">
    <div class="sd826-path-head"><h2>Mapa postupu</h2><small>${next?`Další milník za ${Math.max(0,next-total.xp)} XP`:'Všechny základní milníky splněny'}</small></div>
    <div class="sd826-progress"><div style="width:${progress}%"></div></div>
    <div class="sd826-progress-label">${currentMilestone} XP → ${nextBase} XP</div>
    <ol class="sd826-path">${milestones}</ol>
  </section>
  <section class="sd826-badges-wrap"><h2>Odznaky a úspěchy</h2><div class="sd826-badges">${badges}</div></section>
  <section class="sd826-subjects-wrap"><h2>Přehled podle předmětů</h2><div class="sd826-subjects">${subjects}</div></section>
  ${note}
 `;
}
function openMap(){
 renderMap();
 const root=ensureMapScreen();
 root.hidden=false; root.classList.add('visible');
 document.body.classList.add('sd826-map-open');
 window.scrollTo(0,0);
}
function closeMap(){
 const root=ensureMapScreen();
 root.hidden=true; root.classList.remove('visible');
 document.body.classList.remove('sd826-map-open');
}
function patchHomePanel(){
 const home=document.getElementById('homeScreen'); if(!home)return;
 let panel=home.querySelector('.sd822-progress');
 if(!panel){
  const app=home.querySelector('.app');
  if(!app)return;
  panel=document.createElement('section');
  panel.className='sd822-progress';
  const after=app.querySelector('#v24-avatar-open');
  if(after?.parentNode)after.parentNode.insertBefore(panel, after.nextSibling); else app.prepend(panel);
 }
 if(panel.dataset.sd826Built==='1')return;
 panel.dataset.sd826Built='1';
 panel.classList.add('sd826-compact-panel');
 panel.innerHTML=`<div class="sd826-home-actions">
   <button type="button" class="sd826-home-btn sd826-map-btn">🗺️ Mapa dobrodružství</button>
   <button type="button" class="sd826-home-btn sd826-plan-btn">📅 Měsíční plán</button>
  </div>
  <p class="sd826-home-note">XP, body úspěchu a budoucí mapa postupu jsou schované pod ikonou mapy.</p>`;
 panel.querySelector('.sd826-map-btn')?.addEventListener('click',openMap);
 panel.querySelector('.sd826-plan-btn')?.addEventListener('click',()=>window.SDSchoolPlans52?.openOverview?.());
 }
function refresh(){patchHomePanel(); if(document.body.classList.contains('sd826-map-open'))renderMap();}
function boot(){
 ensureMapScreen();
 refresh();
 document.addEventListener('sd-route-change',()=>setTimeout(refresh,40));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 window.addEventListener('focus',refresh);
 window.addEventListener('storage',e=>{if(!e.key || [DBKEY,ACTIVE].includes(e.key) || e.key.startsWith(CURR_KEY_PREFIX))refresh()});
 const home=document.getElementById('homeScreen');
 if(home){
  const obs=new MutationObserver(()=>{clearTimeout(boot._t);boot._t=setTimeout(refresh,30)});
  obs.observe(home,{childList:true,subtree:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.SDHomeMap50826=Object.freeze({open:openMap,close:closeMap,refresh,version:'50.8.26'});
})();
