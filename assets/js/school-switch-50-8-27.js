/* 50.8.27 – školy v dětském profilu, výběr avatara, kompaktní ilustrovaná tlačítka */
(()=>{'use strict';
const DB='sd52_schools_plans_v1', PROFILE='matematika-karticky-progress-v3-active';
const DEFAULT='sd827_default_school_', SELECTED='sd827_active_school_';
const $=sel=>document.querySelector(sel);
const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const data=()=>{try{return JSON.parse(get(DB)||'{}')||{}}catch{return {}}};
const active=()=>{
 if(document.body.classList.contains('parent-role'))return 'parent';
 try{if(document.body.classList.contains('child-role'))return sessionStorage.getItem('skolni-live-v441')||get(PROFILE)||'parent'}catch{}
 return get(PROFILE)||'parent';
};
const assignedSchools=(id=active())=>{
 const db=data(), schools=Array.isArray(db.schools)?db.schools:[];
 if(id==='parent')return schools;
 const chosen=db.assignments?.[id]||[];
 return schools.filter(s=>chosen.includes(s.id));
};
const defaultSchoolId=id=>{
 const schools=assignedSchools(id), saved=get(DEFAULT+id);
 return schools.some(s=>s.id===saved)?saved:(schools[0]?.id||null);
};
const activeSchoolId=()=>{
 const id=active(),schools=assignedSchools(id), saved=get(SELECTED+id);
 if(schools.some(s=>s.id===saved))return saved;
 return defaultSchoolId(id);
};
function setDefault(id,school){
 if(!assignedSchools(id).some(s=>s.id===school))return;
 set(DEFAULT+id,school);set(SELECTED+id,school);
 refresh();
}
function selectSchool(school){
 const id=active();if(!assignedSchools(id).some(s=>s.id===school))return;
 set(SELECTED+id,school);refresh();
 document.dispatchEvent(new CustomEvent('sd827-school-change',{detail:{profile:id,school}}));
}
function updateSchoolSwitch(){
 const home=$('#homeScreen .app');if(!home)return;
 let holder=home.querySelector('#sd827SchoolSwitch');
 if(!holder){holder=document.createElement('div');holder.id='sd827SchoolSwitch';
  const hero=home.querySelector('.home-hero');hero?.insertAdjacentElement('afterend',holder);
  if(!hero)home.prepend(holder);
 }
 const schools=assignedSchools();
 holder.hidden=active()==='parent'||schools.length<=1;
 if(holder.hidden){holder.replaceChildren();return}
 const selected=activeSchoolId();
 holder.innerHTML='<div class="sd827-school-label">🏫 Škola pro dnešní učení</div><div class="sd827-school-choices"></div>';
 const group=holder.querySelector('.sd827-school-choices');
 for(const s of schools){const btn=document.createElement('button');btn.type='button';
  btn.className='sd827-school-btn'+(s.id===selected?' selected':'');
  btn.setAttribute('aria-pressed',String(s.id===selected));
  const loc=s.city||s.name;btn.textContent=loc+(s.grade?' · '+s.grade:'');
  btn.addEventListener('click',()=>selectSchool(s.id));group.append(btn);
 }
}
function showAvatarOnTap(){
 const opener=$('#v24-avatar-open');if(!opener)return;
 const imgs=['#homeScreen .v23-portrait','#v26-playerpic'];
 for(const sel of imgs){const img=$(sel);if(!img||img.dataset.sd827Avatar==='yes')continue;
  img.dataset.sd827Avatar='yes';img.classList.add('sd827-avatar-trigger');
  img.removeAttribute('aria-hidden');img.setAttribute('role','button');img.tabIndex=0;
  img.title='Klepni a vyber avatara';img.setAttribute('aria-label','Změnit avatara');
  img.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();opener.click()});
  img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();opener.click()}});
 }
}
function patchButtons(){
 const home=$('#homeScreen .app'),panel=home?.querySelector('.sd822-progress');
 if(!home||!panel)return;
 let plan=home.querySelector('#sd827PlanCard');
 if(!plan){
  plan=document.createElement('button');plan.type='button';plan.id='sd827PlanCard';
  plan.className='sd827-plan-card';
  plan.innerHTML='<span class="sd827-plan-illustration" aria-hidden="true">📜</span><span class="sd827-plan-copy"><strong>Měsíční plán</strong><small>Učivo tvé školy</small></span><span class="sd827-plan-arrow" aria-hidden="true">›</span>';
  plan.addEventListener('click',()=>window.SDSchoolPlans52?.openOverview?.());
  const grid=home.querySelector('.sd825-home-grid')||home.querySelector('.subject-grid');
  grid?.insertAdjacentElement('beforebegin',plan);
 }
 if(!panel.dataset.sd827Patched){
  panel.dataset.sd827Patched='yes';
  panel.classList.add('sd827-map-holder');
  panel.innerHTML='<button type="button" class="sd827-map-chip"><img alt="" src="./assets/ui-svg/layers/icons/mapa_a_kompas.svg"><span>Mapa dobrodružství</span></button>';
  panel.querySelector('.sd827-map-chip').addEventListener('click',()=>window.SDHomeMap50826?.open?.());
 }
}
function refresh(){updateSchoolSwitch();showAvatarOnTap();patchButtons();window.SDHomeMap50826?.refresh?.()}
let queued=false;
function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;refresh()},40)}
function boot(){refresh();
 document.addEventListener('sd-route-change',schedule);
 window.addEventListener('school-account',schedule);
 window.addEventListener('school-resume-login',schedule);
 window.addEventListener('pageshow',schedule);
 window.addEventListener('storage',e=>{if(!e.key||e.key===DB||e.key===PROFILE||e.key.startsWith(SELECTED)||e.key.startsWith(DEFAULT))schedule()});
 // Do not observe changing XP DOM; only profile login events need the school switch updated.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.SDSchoolContext827=Object.freeze({activeSchoolId,assignedSchools,defaultSchoolId,setDefault,selectSchool,refresh,version:'50.8.27'});
})();
