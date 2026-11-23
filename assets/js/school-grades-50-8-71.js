/* 50.8.71 – jedna škola, různé ročníky a školní roky.
   Migrace je nedestruktivní: původní plány, výsledky a ID škol zůstávají.
   Konfigurace škol je oddělena od osobních výsledků dětí. */
(()=>{'use strict';
const DB='sd52_schools_plans_v1',PROFILES='matematika-karticky-progress-v3-profiles';
const YEAR='2026/2027',FULNEK='zstgm_fulnek_5_2026',DIRTY='sd871_school_config_dirty',REV='sd871_school_config_rev';
const get=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
const put=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
const asObj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const asArr=x=>Array.isArray(x)?x:[];
const norm=x=>String(x||'').trim().toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
const esc=x=>String(x??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function read(){let v={};try{v=JSON.parse(get(DB)||'{}')}catch{}
 v=asObj(v);v.schools=asArr(v.schools);v.plans=asObj(v.plans);v.results=asObj(v.results);
 v.assignments=asObj(v.assignments);v.archivedSchools=asObj(v.archivedSchools);v.enrollments=asObj(v.enrollments);
 v.schoolGradesVersion=1;return v;}
function profiles(){try{return asObj(JSON.parse(get(PROFILES)||'{}'))}catch{return {}}}
function currentYear(){const now=new Date(),y=now.getFullYear();return now.getMonth()>=7?`${y}/${y+1}`:`${y-1}/${y}`}
function validYear(year){return /^20\d{2}\/20\d{2}$/.test(String(year||''))&&(+year.slice(5)===+year.slice(0,4)+1)}
function gradeFromSchool(s){const n=parseInt(String(s?.grade||'').match(/\d+/)?.[0]||'5',10);return n>=1&&n<=9?n:5}
function guessedEnrollment(p,s){const name=norm(p?.name), grade=name==='bara'?6:(name==='matyas'||name==='anetka'?5:gradeFromSchool(s));
 const suffix=String(s?.grade||'').trim().match(/^\d+\s*\.?\s*([A-Za-z])$/)?.[1]?.toUpperCase()||(name==='matyas'||name==='anetka'?'B':'');
 return {grade,className:suffix?grade+'.'+suffix:'',schoolYear:YEAR,history:[]};}
function mergeProfiles(db){let changed=false;const ps=profiles();const fulnek=db.schools.find(s=>s.id===FULNEK);
 const olomouc=db.schools.find(s=>norm(s.city)==='olomouc');
 for(const [id,p] of Object.entries(ps)){
  if(id==='parent'||!p?.name)continue;
  const name=norm(p.name);db.enrollments[id]=asObj(db.enrollments[id]);
  if(!Array.isArray(db.assignments[id]))db.assignments[id]=[];
  // Doplnění školy i když ji aplikace před prvním načtením profilů teprve vytvořila.
  // Již dříve zapsaný ročník zůstává zachován, takže ručně odpojenou školu znovu nepřipojíme.
  const hadFulnek=!!db.enrollments[id][FULNEK];
  if((name==='matyas'||name==='anetka'||name==='bara')&&fulnek&& !hadFulnek && !db.assignments[id].includes(FULNEK)){
   db.assignments[id].push(FULNEK);changed=true;
  }
  const hadOlomouc=!!(olomouc&&db.enrollments[id][olomouc.id]);
  if(name==='matyas'&&olomouc&&!hadOlomouc&&!db.assignments[id].includes(olomouc.id)){
   db.assignments[id].push(olomouc.id);changed=true;
  }
  // Martin nesmí dostat základní školu jen proto, že má profil dítěte.
  for(const sid of db.assignments[id]){
   const s=db.schools.find(x=>x.id===sid);if(!s)continue;
   if(!db.enrollments[id][sid]){db.enrollments[id][sid]=guessedEnrollment(p,s);changed=true;}
  }
 }
 return changed;}
let booted=false;
function migrate(){const db=read();mergeProfiles(db);
 // Migrace sama o sobě není neodsouhlasená změna v cloudu.
 put(DB,JSON.stringify(db));booted=true;return db;
}
function persist(db,mark=true){const old=get(DB);const next=JSON.stringify(db);
 if(old===next)return true;
 if(!put(DB,next))return false;
 if(mark)put(DIRTY,'1');
 window.SDSchoolPlans52?.reloadDb?.();window.SDSchoolContext827?.refresh?.();
 window.dispatchEvent(new CustomEvent('sd871-school-config-change',{detail:{dirty:mark}}));return true;}
function enrollment(profileId,schoolId){const db=read();return db.enrollments?.[profileId]?.[schoolId]||null}
function grade(profileId,schoolId){return Number(enrollment(profileId,schoolId)?.grade)||null}
function label(profileId,schoolId){const v=enrollment(profileId,schoolId);return v?`${v.grade}. ročník${v.className?' · '+v.className:''} · ${v.schoolYear}`:'Ročník nenastaven'}
function courseKey(sid,sub,month,g,year){let db=read(),s=db.schools.find(x=>x.id===sid)||{};
 const gr=Number(g)||5,yr=validYear(year)?year:YEAR;
 if(gr===5&&yr===YEAR&&gradeFromSchool(s)===5)return `${sid}|${sub}|${month}`;
 return `${sid}|y${yr.replace('/','-')}|r${gr}|${sub}|${month}`;
}
function planKey(sid,sub,month,profileId){const v=enrollment(profileId,sid);return courseKey(sid,sub,month,v?.grade,v?.schoolYear)}
function parentLocally(){return document.body.classList.contains('parent-role')||get('matematika-karticky-progress-v3-active')==='parent'}
function update(profileId,sid,info){if(!parentLocally())return {ok:false,error:'Ročníky může měnit pouze rodič.'};const db=read(),s=db.schools.find(x=>x.id===sid),p=profiles()[profileId];if(!s||!p||profileId==='parent')return {ok:false,error:'Dítě nebo škola neexistuje.'};
 const gr=Number(info.grade),year=String(info.schoolYear||'').trim();
 if(!Number.isInteger(gr)||gr<1||gr>9||!validYear(year))return {ok:false,error:'Vyber ročník 1–9 a správný školní rok.'};
 const className=String(info.className||'').trim().slice(0,14);
 if(className&&(!/^\d{1,2}\s*\.?\s*[A-Za-zÁ-ž0-9 -]{0,9}$/.test(className)||parseInt(className,10)!==gr))return {ok:false,error:'Třída musí odpovídat ročníku, např. 6.A.'};
 db.enrollments[profileId]=asObj(db.enrollments[profileId]);
 const old=db.enrollments[profileId][sid]||null;
 const history=asArr(old?.history).slice(-15);
 if(old&&(old.grade!==gr||old.schoolYear!==year)&&!history.some(h=>h.schoolYear===old.schoolYear&&h.grade===old.grade)){
  history.push({grade:old.grade,className:old.className,schoolYear:old.schoolYear});}
 db.enrollments[profileId][sid]={grade:gr,className,schoolYear:year,history};
 if(!asArr(db.assignments[profileId]).includes(sid))db.assignments[profileId]=[...asArr(db.assignments[profileId]),sid];
 if(!persist(db))return {ok:false,error:'Nastavení se nepodařilo uložit.'};return {ok:true};
}
function assign(profileId,sid,enabled){if(!parentLocally())return;const db=read();if(!profiles()[profileId]||!db.schools.some(s=>s.id===sid))return;
 const current=asArr(db.assignments[profileId]);
 db.assignments[profileId]=enabled?[...new Set([...current,sid])]:current.filter(x=>x!==sid);
 db.enrollments[profileId]=asObj(db.enrollments[profileId]);
 // Odpojení školy NEMAŽE historii ročníků, plány ani výsledky.
 if(enabled&&!db.enrollments[profileId][sid])db.enrollments[profileId][sid]=guessedEnrollment(profiles()[profileId],db.schools.find(s=>s.id===sid));
 persist(db);
}
function advance(profileId,sid){if(!parentLocally())return {ok:false,error:'Ročníky může měnit pouze rodič.'};const cur=enrollment(profileId,sid);
 if(!cur||cur.grade>=9)return {ok:false,error:'Po 9. ročníku vyber další školu ručně.'};
 const nextYear=(Number(cur.schoolYear.slice(0,4))+1);const next=`${nextYear}/${nextYear+1}`;
 const className=cur.className?cur.className.replace(/^\s*\d+/,String(cur.grade+1)):`${cur.grade+1}.`;
 return update(profileId,sid,{grade:cur.grade+1,className,schoolYear:next});}
function exportConfig(){const d=read();return {version:1,schools:d.schools.map(s=>({...s})),
  plans:{...d.plans},assignments:{...d.assignments},enrollments:{...d.enrollments},
  archivedSchools:{...d.archivedSchools}};}
function applyRemote(config,revision){if(!config||config.version!==1||!Array.isArray(config.schools))return false;
 if(get(DIRTY)==='1')return false;
 const db=read();db.schools=config.schools;db.assignments=asObj(config.assignments);
 db.enrollments=asObj(config.enrollments);db.archivedSchools=asObj(config.archivedSchools);db.plans=asObj(config.plans);
 // db.results a ostatní osobní údaje se nepřepisují. Přijaté školní nastavení patří rodiči.
 if(!persist(db,false))return false;
 put(REV,String(Number(revision)||0));return true;}
function touch(){put(DIRTY,'1');window.dispatchEvent(new CustomEvent('sd871-school-config-change',{detail:{dirty:true}}));}
function isDirty(){return get(DIRTY)==='1'}
function clearDirty(rev){put(DIRTY,'0');put(REV,String(Number(rev)||0));}
function cloudRevision(){return Number(get(REV)||0)}
function refreshProfiles(){const db=read();if(mergeProfiles(db))persist(db,false);}
function activeId(){try{return document.body.classList.contains('child-role')?(sessionStorage.getItem('skolni-live-v441')||get('matematika-karticky-progress-v3-active')):(get('matematika-karticky-progress-v3-active')||'parent')}catch{return get('matematika-karticky-progress-v3-active')||'parent'}}
function gradeNotice(subject){const id=activeId(),db=read(),schoolId=window.SDSchoolContext827?.activeSchoolId?.(),s=db.schools.find(x=>x.id===schoolId),e=enrollment(id,schoolId);
 let overlay=document.getElementById('sd871GradeNotice');if(!overlay){overlay=document.createElement('div');overlay.id='sd871GradeNotice';overlay.className='sd871-grade-notice';overlay.hidden=true;document.body.append(overlay);}
 overlay.innerHTML=`<div class="sd871-grade-notice-card" role="dialog" aria-modal="true" aria-labelledby="sd871GradeNoticeTitle"><h2 id="sd871GradeNoticeTitle">Učivo ${e?.grade||'?'}. ročníku</h2><p>${esc(subject)} · ${esc(s?.city||'vybraná škola')}</p><p>Pro tento ročník ještě nejsou připravené samostatné výukové otázky. Aby se dítě neučilo učivo jiné třídy, otevři měsíční plán svého ročníku. Rodič do něj může přidat témata.</p><div class="sd871-grade-notice-actions"><button type="button" data-sd871-close>Rozumím</button><button type="button" data-sd871-open-plans>Měsíční plán</button></div></div>`;
 overlay.hidden=false;
 overlay.querySelector('[data-sd871-close]').onclick=()=>{overlay.hidden=true};
 overlay.querySelector('[data-sd871-open-plans]').onclick=()=>{overlay.hidden=true;window.SDSchoolPlans52?.openOverview?.()};
}
function guardFifthGrade(e){if(!document.body||!e.target?.closest)return;
 const tile=e.target.closest('#homeScreen .subject.math,#homeScreen .subject.czech,#homeScreen .subject.english,#homeScreen .subject.nature,#homeScreen .subject.v23-extra.history');
 if(!tile)return;
 const pid=activeId();if(pid==='parent')return;
 const schoolId=window.SDSchoolContext827?.activeSchoolId?.(),info=enrollment(pid,schoolId);
 if(!info||info.grade===5&&info.schoolYear===YEAR)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const label=tile.querySelector('strong')?.textContent||'Předmět';gradeNotice(label);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>document.addEventListener('click',guardFifthGrade,true),{once:true});
else document.addEventListener('click',guardFifthGrade,true);
window.SDGradeSchools871=Object.freeze({read,grade,enrollment,label,courseKey,planKey,update,assign,advance,
 exportConfig,applyRemote,isDirty,touch,clearDirty,cloudRevision,refreshProfiles,migrate,gradeNotice,year:YEAR,validYear});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',migrate,{once:true});else migrate();
window.addEventListener('sd866-updated',refreshProfiles);
})();
