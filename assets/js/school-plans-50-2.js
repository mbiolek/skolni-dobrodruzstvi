/* Školní dobrodružství 50.4.1 – školy, měsíční plány a samostatné obrazovky. */
(()=>{'use strict';
const SUBJECTS={math:'Matematika',czech:'Český jazyk',english:'Angličtina',nature:'Přírodověda',geography:'Vlastivěda'};
const MONTHS=['Září','Říjen','Listopad','Prosinec','Leden','Únor','Březen','Duben','Květen','Červen'];
const DBKEY='sd52_schools_plans_v1', ACTIVE='matematika-karticky-progress-v3-active',PROFILES='matematika-karticky-progress-v3-profiles';
const state={screen:'',subject:'math',school:null,month:0,selected:[],quiz:[],pos:0,correct:0,answers:[],settings:{count:10},origin:'',manageParent:false,manageGrade:5,manageYear:'2026/2027',manageTab:'children',manageProfile:null,previewProfile:null,previewSchool:null};
let db;try{db=JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch{db={}};
if(!db||typeof db!=='object')db={};db.schools??=[];db.assignments??={};db.plans??={};db.results??={};db.archivedSchools??={};
const save=(schoolConfigChange=false)=>{localStorage.setItem(DBKEY,JSON.stringify(db));
 if(schoolConfigChange)window.SDGradeSchools871?.touch?.();
};
const active=()=>document.body.classList.contains('parent-role')?'parent':(document.body.classList.contains('child-role')?(sessionStorage.getItem('skolni-live-v441')||localStorage.getItem(ACTIVE)||'parent'):(localStorage.getItem(ACTIVE)||'parent'));
const currentLearner=()=>active()==='parent'&&state.origin==='overview'&&state.previewProfile?state.previewProfile:active();
const isParent=()=>active()==='parent';
const profiles=()=>{try{return JSON.parse(localStorage.getItem(PROFILES)||'{}')}catch{return {}}};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const uniq=a=>[...new Set(a)];
const root=document.createElement('section');root.id='sd52';root.hidden=true;root.innerHTML='<div class="sd52-wrap"><header><button data-act="back">← Zpět</button><strong id="sd52header">Školní dobrodružství 50.4.1</strong><button data-act="home">⌂ Domů</button></header><main id="sd52main"></main></div>';document.body.append(root);
const main=()=>document.getElementById('sd52main');
function show(title,html){root.hidden=false;document.body.classList.add('sd52-open');document.getElementById('sd52header').textContent=title;main().innerHTML=html;root.scrollTop=0;window.scrollTo(0,0);queueMicrotask(()=>document.dispatchEvent(new Event('sd-route-change')))}
function hide(){root.hidden=true;document.body.classList.remove('sd52-open')}
const card=(label,action,detail='',attr='')=>window.SDUICards.html({title:label,description:detail,icon:'auto',attrs:`data-act="${esc(action)}" ${attr}`,className:'sd52-card'});
const grid=items=>window.SDUICards.grid(items,'sd52-grid');
const planKey=(school,sub,month,manage=false)=>{
 const g=window.SDGradeSchools871;
 const enrolled=manage?{grade:state.manageGrade,schoolYear:state.manageYear}:g?.enrollment?.(currentLearner(),school);
 return g?.courseKey?.(school,sub,month,enrolled?.grade,enrolled?.schoolYear)||`${school}|${sub}|${month}`;
};
const currentGrade=()=>window.SDGradeSchools871?.enrollment?.(currentLearner(),state.school)||null;
const gradeDescription=()=>{const v=currentGrade();return v?`${v.grade}. ročník${v.className?' · '+v.className:''} (${v.schoolYear})`:'ročník nepřiřazen'};
const currentPresetGrade=()=>{const v=currentGrade();return v&&v.grade===5&&v.schoolYear==='2026/2027'};
const yearOptions=(year)=>{const now=new Date().getFullYear(),start=Math.min(2026,now-1);return Array.from({length:10},(_,i)=>start+i).map(y=>{const str=`${y}/${y+1}`;return `<option value="${str}" ${year===str?'selected':''}>${str}</option>`}).join('')};
const gradeOptions=(grade)=>Array.from({length:9},(_,i)=>i+1).map(g=>`<option value="${g}" ${Number(grade)===g?'selected':''}>${g}. ročník</option>`).join('');

function reloadDb(){try{const data=JSON.parse(localStorage.getItem(DBKEY)||'{}');if(data&&typeof data==='object'){
  db=data;db.schools??=[];db.assignments??={};db.plans??={};db.results??={};db.archivedSchools??={};
 }}catch(e){console.warn('Měsíční plány: synchronizace',e)}}
const selectedSchool=()=>window.SDSchoolContext827?.activeSchoolId?.()||null;
const schoolName=()=>{const v=chosenSchool();return v?.city||v?.name||'Nepřiřazená škola'};
const currentSchool=()=>{if(active()==='parent'&&state.origin==='overview'&&state.previewProfile){
  const ids=db.assignments[state.previewProfile]||[];return ids.includes(state.previewSchool)?state.previewSchool:ids.find(id=>db.schools.some(s=>s.id===id))||null;
 }const id=selectedSchool();return db.schools.find(s=>s.id===id && assigned().some(x=>x.id===id))?.id||assigned()[0]?.id||null};
const plannedMonths=()=>MONTHS.map((_,i)=>i).filter(i=>Object.keys(SUBJECTS).some(sub=>(db.plans[planKey(state.school,sub,i)]||[]).length));
const monthSubjects=i=>Object.entries(SUBJECTS).map(([sub,name])=>[sub,name,(db.plans[planKey(state.school,sub,i)]||[]).length]);
function overview(){reloadDb();state.origin='overview';state.screen='overview-months';
 const all=profiles();const learners=Object.entries(all).filter(([id,p])=>id!=='parent'&&p?.name&&norm(p.name)!=='martin');
 let selector='';
 if(isParent()){
  if(!learners.some(([id])=>id===state.previewProfile))state.previewProfile=learners.find(([,p])=>norm(p.name)==='matyas')?.[0]||learners[0]?.[0]||null;
  state.school=currentSchool();state.previewSchool=state.school;
  const schools=db.schools.filter(s=>(db.assignments[state.previewProfile]||[]).includes(s.id));
  selector=`<div class="sd872-preview"><strong>Rodičovský náhled školního učiva</strong><label>Dítě<select data-sd872-preview-profile>${learners.map(([id,p])=>`<option value="${esc(id)}" ${id===state.previewProfile?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Škola<select data-sd872-preview-school>${schools.map(s=>`<option value="${esc(s.id)}" ${s.id===state.school?'selected':''}>${esc(s.city||s.name)} · ${esc(window.SDGradeSchools871?.label(state.previewProfile,s.id)||'')}</option>`).join('')}</select></label><p class="sd872-hint">Zobrazuješ plány vybraného dítěte. Nevyplněný plán není chyba aplikace.</p></div>`;
 }else state.school=currentSchool();
 const m=state.school?plannedMonths():[];
 show('Měsíční plán · '+schoolName(),`<h1>Školní učivo · ${esc(state.school?schoolName():'Bez přiřazené školy')}</h1>${selector}<p><strong>${esc(state.school?gradeDescription():'Škola není přiřazena')}</strong></p><p>Vyber měsíc, potom předmět a pokračuj do jeho výuky nebo testu.</p>${m.length?grid(m.map(i=>card(MONTHS[i],'overview-month',`${Object.keys(SUBJECTS).reduce((n,sub)=>n+(db.plans[planKey(state.school,sub,i)]||[]).length,0)} témat`,`data-index="${i}"`))):('<p>Pro tuto školu a ročník zatím nejsou vyplněné měsíční plány. Rodič je může doplnit ve Správě škol.'+(norm(chosenSchool()?.city)==='olomouc'?' Učivo ze sešitů Olomouce je dostupné samostatně na hlavní obrazovce.':'')+'</p>')}`);
}
function overviewSubjects(i){state.origin='overview';state.month=i;state.screen='overview-subjects';
 show('Výběr předmětu',`<h1>${esc(MONTHS[i])} · ${esc(schoolName())}</h1><p>${esc(gradeDescription())}</p><p>Vyber předmět pro tuto školu.</p>${grid(monthSubjects(i).map(([sub,name,count])=>card(name,'overview-subject',count?`${count} témat`:'Plán zatím nezadán',`data-subject="${sub}"`)))}`)
}
function openOverview(){overview()}

const assigned=()=>isParent()?db.schools:db.schools.filter(s=>(db.assignments[active()]||[]).includes(s.id));
const chosenSchool=()=>db.schools.find(s=>s.id===state.school);
const title=()=>SUBJECTS[state.subject];
function subjectMenu(sub){reloadDb();state.subject=sub;state.origin='subject';state.screen='subject';state.school=currentSchool();const schools=assigned();show(title(),`<h1>${esc(title())}</h1><p>${esc(gradeDescription())}</p><p>Aktivní škola: <strong>${esc(schoolName())}</strong>. Výuka a procvičování z měsíčního plánu vycházejí pouze z této školy. Ostatní kapitoly jsou obecné.</p>`+grid([
card('Výuka','curriculum','Kapitoly a vysvětlení'),card('Procvičování','curriculum','Samostatná cvičení'),card('Příprava na školní test','search','Vyhledat a spojit témata'),card('Měsíční plán','school-select','Učivo podle měsíců'),card('Opakování','repeat-select','Spojit více měsíců'),card('Závěrečný test','repeat-select','Test z vybraných měsíců'),card('Nastavení','settings','Počet otázek a pravidla'),...(isParent()?[card('Správa škol a plánů','manage','Pouze rodič')]:[])]));}
function schoolSelect(next){state.origin=next;const a=assigned();state.school=currentSchool();state.screen='schools';if(!a.length){show('Měsíční plán',`<h1>Škola zatím není přiřazena</h1><p>Rodič může přidat školu a měsíční učivo ve Správě škol.</p>${isParent()?card('Správa škol','manage'):''}`);return}if(state.school&&a.some(s=>s.id===state.school)){return next==='repeat'?repeat():months()}show('Výběr školy',`<h1>Vyber školu</h1>`+grid(a.map(s=>card(s.city||s.name,'choose-school',s.name,`data-id="${esc(s.id)}"`))))}
function months(){state.screen='months';const s=chosenSchool();show('Měsíční plán',`<h1>${esc(title())} · ${esc(s?.city||s?.name)}</h1><p><strong>${esc(gradeDescription())}</strong></p><p>Otevři měsíc a vyber učivo k procvičování.</p>`+grid(MONTHS.map((m,i)=>{const p=db.plans[planKey(state.school,state.subject,i)]||[];return card(m,'month',p.length?`${p.length} témat: ${p.slice(0,2).join(', ')}`:'Plán zatím nezadán',`data-index="${i}"`)}))+card('Opakovat více měsíců','repeat','Výběr měsíců a závěrečný test'))}
function month(i){state.month=i;state.screen='month';const p=uniq(db.plans[planKey(state.school,state.subject,i)]||[]);show(MONTHS[i],`<h1>${esc(MONTHS[i])} · ${esc(title())}</h1><p>${esc(chosenSchool()?.city||'')}</p>${p.length?`<div class="sd52-panel"><h2>Učivo měsíce</h2>${p.map(t=>`<p>• ${esc(t)}</p>`).join('')}</div>`:'<p>Rodič pro tento měsíc zatím nepřidal témata.</p>'}${p.length?grid([card('Výuka','month-learning','Vysvětlení vybraných témat'),card('Procvičování','month-practice','Otázky bez opakování'),card('Závěrečný test','month-test','Vyhodnocení znalostí')]):''}`)}
function repeat(){state.screen='repeat';state.selected=[];show('Opakování měsíců',`<h1>Opakování · ${esc(title())}</h1><p>Označ měsíce, které chceš společně zopakovat.</p><div class="sd52-panel">${MONTHS.map((m,i)=>{let n=(db.plans[planKey(state.school,state.subject,i)]||[]).length;return `<label class="sd52-check"><input type="checkbox" data-month="${i}" ${n?'':'disabled'}> ${esc(m)} <small>${n?`(${n} témat)`:'bez plánu'}</small></label>`}).join('')}</div>`+grid([card('Spustit procvičování','repeat-practice'),card('Závěrečný test','repeat-test')]))}
function settings(){state.screen='settings';show('Nastavení',`<h1>Nastavení · ${esc(title())}</h1><div class="sd52-panel"><label>Počet otázek <select id="sd52count">${[5,10,15,20,30].map(n=>`<option value="${n}" ${state.settings.count===n?'selected':''}>${n}</option>`).join('')}</select></label><p>Otázky se v jednom testu neopakují. Pokud je v databázi méně různých otázek, test bude kratší.</p></div>${card('Uložit nastavení','save-settings')}`)}
function schoolStats(id){
 const plans=Object.entries(db.plans||{}).filter(([key,topics])=>key.startsWith(id+'|')&&Array.isArray(topics)&&topics.length);
 const topics=plans.reduce((n,[,x])=>n+x.length,0);
 const people=Object.entries(db.assignments||{}).filter(([,ids])=>Array.isArray(ids)&&ids.includes(id)).map(([pid])=>pid);
 const results=Object.entries(db.results||{}).filter(([key])=>key.includes('|'+id+'|')).reduce((n,[,a])=>n+(Array.isArray(a)?a.length:0),0);
 return {plans:plans.length,topics,people,results};
}
const schoolTag=s=>s.id==='zstgm_fulnek_5_2026'?'Přednastavené učivo Fulnek':'Ručně přidaný záznam';
const schoolLabel=s=>`${s.city||''} · ${s.name}`;
const schoolShortId=s=>s.id==='zstgm_fulnek_5_2026'?'Přednastavený záznam':`Záznam ${String(s.id).slice(-6)}`;
function schoolTile(s){const st=schoolStats(s.id);
 const gs=Object.values(db.enrollments||{}).flatMap(items=>{const en=items?.[s.id];return en?[`${en.grade}. ročník (${en.schoolYear})`]:[]});
 const grades=[...new Set(gs)];
 return `<article class="sd828-school-item"><div class="sd828-school-top"><strong>${esc(s.name)}</strong></div>
 <p><b>Město:</b> ${esc(s.city||'neuvedeno')} · <b>Ročníky:</b> ${grades.map(esc).join(', ')||'dosud nepřiřazeny'}</p>
 <small>${esc(schoolTag(s))} · ${esc(schoolShortId(s))}</small>
 <p>${st.plans} měsíčních plánů, ${st.topics} témat · ${st.people.length} přiřazených profilů · ${st.results} záznamů výsledků</p>
 <button class="sd828-school-edit" type="button" data-act="edit-school" data-id="${esc(s.id)}">Spravovat tuto školu a její ročníky</button></article>`;
}
function profileSchoolCard(id,s){const e=window.SDGradeSchools871?.enrollment(id,s.id)||{grade:5,className:'5.B',schoolYear:'2026/2027',history:[]};
 return `<div class="sd871-enrollment-card" data-owner="${esc(id)}" data-school="${esc(s.id)}">
 <strong>${esc(s.city)} – ${esc(s.name)}</strong>
 <div class="sd871-enrollment-grid">
 <label>Ročník<select data-sd871-grade>${gradeOptions(e.grade)}</select></label>
 <label>Třída (např. 6.A)<input data-sd871-class maxlength="14" value="${esc(e.className||'')}"></label>
 <label>Školní rok<select data-sd871-year>${yearOptions(e.schoolYear)}</select></label>
 </div><div class="sd871-actions"><button type="button" data-act="sd871-save-enrollment" data-profile="${esc(id)}" data-school="${esc(s.id)}">Uložit ročník</button>
 <button type="button" data-act="sd871-advance" data-profile="${esc(id)}" data-school="${esc(s.id)}" class="sd871-next-grade">Postoupit do dalšího ročníku</button></div>
 ${e.history?.length?`<small>Historie: ${e.history.map(v=>esc(`${v.grade}. ročník ${v.className||''} (${v.schoolYear})`)).join('; ')}</small>`:''}</div>`;}
function personSchoolCard(id,p){const schoolIds=db.assignments[id]||[];
 if(norm(p.name)==='martin'){
  const en=window.SDGradeSchools871?.vocational?.(id)||{};
  return `<section class="sd872-vocational"><h3>Martinova střední škola</h3><p>Studium autoelektrikáře je oddělené od základních škol a měsíčních plánů pro 5. třídu.</p>
  <div class="sd872-fields"><label>Název školy<input data-sd872-v-school maxlength="150" value="${esc(en.school||'')}"></label>
  <label>Adresa / město<input data-sd872-v-location maxlength="120" value="${esc(en.location||'')}"></label>
  <label>Obor<input data-sd872-v-program maxlength="100" value="${esc(en.program||'')}"></label>
  <label>Ročník<select data-sd872-v-grade>${[1,2,3,4].map(g=>`<option value="${g}" ${Number(en.grade)===g?'selected':''}>${g}. ročník</option>`).join('')}</select></label>
  <label>Školní rok<select data-sd872-v-year>${yearOptions(en.schoolYear||'2026/2027')}</select></label></div>
  <button type="button" class="sd872-primary" data-act="sd872-save-vocational" data-profile="${esc(id)}">Uložit Martinovu školu</button>
  ${schoolIds.length?`<p class="sd872-warning">V profilu jsou navíc staré přiřazené základní školy. Tyto školní plány Martin nepotřebuje.</p><button data-act="sd872-unassign-primary" data-profile="${esc(id)}">Odebrat chybné základní školy</button>`:''}
  <p class="sd872-hint">Martinovy přijímačky CERMAT a závěrečné zkoušky zůstanou samostatně v jeho výuce.</p></section>`;
 }
 const others=db.schools.filter(s=>schoolIds.includes(s.id));
 return `<section class="sd872-person-editor"><h3>${esc(p.name||id)} · přiřazení škol</h3>
 <div class="sd871-checks">${db.schools.map(s=>`<label class="sd52-check"><input type="checkbox" data-assign="${esc(id)}" data-school="${esc(s.id)}" ${schoolIds.includes(s.id)?'checked':''}> <span>${esc(s.city||s.name)} – ${esc(s.name)}</span></label>`).join('')}</div>
 ${others.map(s=>profileSchoolCard(id,s)).join('')||'<p>Není přiřazena žádná základní škola.</p>'}
 ${others.length>1?`<label class="sd52-default-label">Výchozí škola<select data-default-profile="${esc(id)}">${others.map(s=>`<option value="${esc(s.id)}" ${window.SDSchoolContext827?.defaultSchoolId?.(id)===s.id?'selected':''}>${esc(s.city||s.name)} · ${esc(window.SDGradeSchools871?.label(id,s.id)||'')}</option>`).join('')}</select></label>`:''}</section>`;
}
function shortPersonSchools(id,p){if(norm(p.name)==='martin'){const v=window.SDGradeSchools871?.vocational?.(id)||{};
 return `${v.school||'Střední škola není zadaná'} · ${v.program||'obor nezadaný'} · ${v.grade||'?'}. ročník`;}
 return db.schools.filter(s=>(db.assignments[id]||[]).includes(s.id)).map(s=>{
  const e=window.SDGradeSchools871?.enrollment(id,s.id);
  return `${s.city||s.name} · ${e?.className||((e?.grade||'?')+'. ročník')}`;
 }).join(' / ')||'Škola zatím není přiřazena';}
function schoolManage(fromParent){if(!isParent()){show('Rodičovský režim','<h1>Správa je dostupná pouze rodiči</h1>');return}
 if(fromParent===true){state.manageParent=true;state.manageTab='children';state.manageProfile=null;}
 if(fromParent===false){state.manageParent=false;state.manageTab='children';state.manageProfile=null;}
 reloadDb();db.enrollments??={};state.screen='manage';const ps=profiles();const archived=Object.values(db.archivedSchools||{});
 const people=Object.entries(ps).filter(([id,p])=>id!=='parent'&&p?.name);
 const children=`<div class="sd872-child-list">${people.map(([id,p])=>`<article class="sd872-child-row ${state.manageProfile===id?'sd872-open':''}">
  <div class="sd872-child-summary"><div><strong>${esc(p.name)}</strong><p>${esc(shortPersonSchools(id,p))}</p></div>
  <button type="button" data-act="sd872-person" data-profile="${esc(id)}" aria-expanded="${state.manageProfile===id}">${state.manageProfile===id?'Zavřít':'Upravit'}</button></div>
  ${state.manageProfile===id?personSchoolCard(id,p):''}</article>`).join('')||'<p>Nejdříve vytvoř dětský profil.</p>'}</div>`;
 const schoolSection=`<h2>Základní školy a měsíční plány</h2><p>Martinovu střední školu najdeš v jeho profilu na kartě Děti a jejich školy. Každou základní školu stačí založit jednou. Ročníky dětí nastav v záložce <b>Děti a jejich školy</b>.</p>
 <div class="sd828-school-list">${db.schools.map(schoolTile).join('')||'<p>Zatím žádná škola.</p>'}</div>
 <details class="sd872-disclosure"><summary>Přidat další základní školu</summary><form id="sd52add"><label>Název školy<input name="name" required placeholder="ZŠ …"></label><label>Město<input name="city" required placeholder="Fulnek"></label><button type="submit">Přidat školu</button></form></details>
 ${archived.length?`<details class="sd872-disclosure"><summary>Archivované školy (${archived.length})</summary><p>Archivace nic nemaže: učivo a výsledky zůstávají uložené.</p>${archived.map(record=>`<div class="sd828-archived"><b>${esc(schoolLabel(record.school))}</b><small>${esc(schoolShortId(record.school))}</small><button type="button" data-act="restore-school" data-id="${esc(record.school.id)}">Obnovit školu</button></div>`).join('')}</details>`:''}`;
 show('Správa dětí a škol',`<h1>Správa dětí a škol</h1><p class="sd872-intro">Vyber dítě a uprav pouze jeho školu a ročník. Měsíční plány se nastavují zvlášť.</p>
 <nav class="sd872-tabs" aria-label="Sekce správy"><button type="button" data-act="sd872-tab" data-tab="children" aria-pressed="${state.manageTab==='children'}">Děti a jejich školy</button><button type="button" data-act="sd872-tab" data-tab="schools" aria-pressed="${state.manageTab==='schools'}">Měsíční plány a školy</button></nav>
 ${state.manageTab==='schools'?schoolSection:children}
 <p class="sd871-cloud-notice">Změny škol se na další zařízení přenášejí po cloudové synchronizaci. Výsledky každého dítěte zůstávají oddělené.</p>`);
}
function editSchool(id){reloadDb();state.school=id;state.screen='edit-school';const s=chosenSchool();if(!s)return schoolManage();
 const st=schoolStats(id);
 show('Úprava školy',`<h1>${esc(s.name)}</h1><div class="sd52-panel"><p><b>Město:</b> ${esc(s.city||'neuvedeno')} · <b>Ročníky se nastavují jednotlivým dětem</b></p><p><b>${esc(schoolTag(s))}</b> · ${esc(schoolShortId(s))}</p><p>${st.plans} uložených měsíčních plánů, ${st.topics} témat, ${st.results} záznamů výsledků</p></div>
 <h2>Upravovat učivo této školy</h2><div class="sd871-edit-plan-grade"><label>Pro ročník<select id="sd871ManageGrade">${gradeOptions(state.manageGrade)}</select></label><label>Školní rok<select id="sd871ManageYear">${yearOptions(state.manageYear)}</select></label></div><p>Plány 5. ročníku 2026/2027 zůstávají beze změny. Pro 6. ročník se použije vlastní, oddělený plán.</p><label>Předmět<select id="sd52sub">${Object.entries(SUBJECTS).map(([k,v])=>`<option value="${k}" ${state.subject===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Měsíc<select id="sd52month">${MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}</select></label>${card('Upravit měsíční plán','edit-plan')}
 <div class="sd52-panel sd828-archive-box"><h2>Archivovat pouze tuto školu</h2><p>Pokud máš Fulnek dvakrát, ověř si, zda je to přednastavená škola, nebo tvůj ruční záznam. Archivace pouze <b>skryje vybraný záznam</b>; nesmaže učivo ani výsledky.</p><button type="button" data-act="prepare-archive" class="sd828-archive-button">Zkontrolovat archivaci této školy</button></div>`);
}
function prepareArchive(){state.screen='confirm-archive';const s=chosenSchool();if(!s)return schoolManage();const st=schoolStats(s.id);
 show('Bezpečná archivace',`<h1>Opravdu archivovat tuto školu?</h1><div class="sd52-panel"><h2>${esc(s.name)}</h2><p>${esc(s.city||'')} · ${esc(s.grade||'')} · <strong>${esc(schoolTag(s))}</strong></p><p>${st.plans} měsíčních plánů a ${st.topics} témat; ${st.people.length} přiřazených profilů.</p><p><strong>Ostatní školy zůstanou beze změny.</strong> Všechna témata a výsledky tohoto záznamu zůstanou v databázi a lze ho později obnovit.</p><label>Pro potvrzení opiš slovo ARCHIVOVAT<input id="sd828-archive-confirm" autocomplete="off" placeholder="ARCHIVOVAT"></label><button type="button" data-act="archive-school" class="sd828-archive-button">Archivovat tento konkrétní záznam</button><button type="button" data-act="cancel-archive">Zrušit a vrátit se</button></div>`);
}
function archiveSchool(){const input=document.getElementById('sd828-archive-confirm');if((input?.value||'').trim().toUpperCase()!=='ARCHIVOVAT'){input?.focus();return}
 const s=chosenSchool();if(!s)return schoolManage();const people=schoolStats(s.id).people;
 db.archivedSchools??={};db.archivedSchools[s.id]={school:{...s},assignedTo:people,archivedAt:new Date().toISOString()};
 db.schools=db.schools.filter(x=>x.id!==s.id);
 for(const pid of people){db.assignments[pid]=(db.assignments[pid]||[]).filter(sid=>sid!==s.id);
  for(const prefix of ['sd827_default_school_','sd827_active_school_'])try{if(localStorage.getItem(prefix+pid)===s.id)localStorage.removeItem(prefix+pid)}catch{}}
 try{save(true)}catch(e){db.schools.push(s);delete db.archivedSchools[s.id];for(const pid of people){db.assignments[pid]??=[];if(!db.assignments[pid].includes(s.id))db.assignments[pid].push(s.id)}alert('Archivaci se nepodařilo bezpečně uložit. Škola zůstává aktivní.');return}
 state.school=null;window.SDSchoolContext827?.refresh?.();schoolManage();
}
function restoreSchool(id){const item=db.archivedSchools?.[id];if(!item)return;
 if(!confirm(`Obnovit školu ${item.school.name} (${item.school.city||''})?`))return;
 db.schools.push(item.school);
 for(const pid of item.assignedTo||[])if(profiles()[pid]){db.assignments[pid]??=[];if(!db.assignments[pid].includes(id))db.assignments[pid].push(id)}
 delete db.archivedSchools[id];try{save(true)}catch(e){alert('Obnovení se nepodařilo uložit.');return}
 window.SDSchoolContext827?.refresh?.();schoolManage();
}
function editPlan(){state.subject=document.getElementById('sd52sub').value;state.month=Number(document.getElementById('sd52month').value);state.manageGrade=Number(document.getElementById('sd871ManageGrade').value);state.manageYear=document.getElementById('sd871ManageYear').value;state.screen='edit-plan';const key=planKey(state.school,state.subject,state.month,true);const topics=db.plans[key]||[];show('Úprava měsíčního plánu',`<h1>${esc(MONTHS[state.month])} · ${esc(title())}</h1><p><strong>${state.manageGrade}. ročník · ${esc(state.manageYear)}</strong></p><p>Jedno téma na každý řádek. Můžeš zadat názvy kapitol, slovíček nebo gramatiky.</p><textarea id="sd52plan" rows="11" placeholder="Např. a/an&#10;čísla&#10;there is / there are">${esc(topics.join('\n'))}</textarea>${card('Uložit plán','save-plan')}`)}
const ALIASES={english:{'a/an':['a/an','člen','article'],'numbers':['čísla','cisla','numbers','number'],'time':['čas','hodiny','time','clock'],'there is':['there is','there are','there'],'family':['rodina','family'],'days':['dny','days'],'months':['měsíce','months']}};
function catalog(){const sub=state.subject;const data=window.SDCurriculum501?.data;const topics=data?.[sub]?.topics||[];return topics.map((t,i)=>({id:`${sub}:${i}`,name:t[0],info:t[1],q:t[2],correct:t[3],choices:t.slice(3,7),search:norm(t[0]+' '+t[1])}));}
function matchTopic(t,query){const n=norm(query);if(!n)return false;if(t.search.includes(n)||n.includes(norm(t.name)))return true;if(state.subject==='english'){const aliases=ALIASES.english;return Object.entries(aliases).some(([key,words])=>words.some(w=>norm(w)===n||norm(w).includes(n))&&(t.search.includes(norm(key))||words.some(w=>t.search.includes(norm(w)))))}return false}
function search(){state.screen='search';show('Příprava na školní test',`<h1>Příprava na školní test</h1><p>Zadej více témat oddělených čárkou nebo každé na nový řádek. Například: a/an, čísla, hodiny.</p><textarea id="sd52query" rows="4" placeholder="1. a/an\n2. čísla\n3. čas, hodiny"></textarea>${card('Vyhledat témata','find')}<div id="sd52found"></div>`)}
function find(){const q=document.getElementById('sd52query').value.replace(/(^|\n)\s*\d+[.)]\s*/g,'$1').split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);const matches=catalog().filter(t=>q.some(w=>matchTopic(t,w)));state.selected=matches.map(t=>t.id);const area=document.getElementById('sd52found');area.innerHTML=`<h2>Nalezená témata (${matches.length})</h2>${matches.length?matches.map(t=>`<label class="sd52-check"><input type="checkbox" data-topic-id="${esc(t.id)}" checked> ${esc(t.name)}</label>`).join('')+grid([card('Výuka','search-learning'),card('Procvičování','search-practice'),card('Spustit test','search-test')]):'<p>Pro zadané názvy zatím nemáme odpovídající obsah. Rodič může téma přidat do měsíčního plánu, ale otázky musí být nejdříve připravené.</p>'}`}
function selectedTopics(){return catalog().filter(t=>state.selected.includes(t.id))}
/* 50.8.31: Jedno téma = jedna výuková karta, obsahuje všechny jeho různé poznatky.
 * Původní seznam otázek se nemění, pouze jejich výukové zobrazení. */
function groupLearning(topics){
 const groups=new Map();
 for(const topic of topics){
  const title=String(topic?.name||'Učivo').trim()||'Učivo';
  const info=String(topic?.info||'').trim();
  const key=norm(title).replace(/\s+/g,' ').trim();
  if(!groups.has(key))groups.set(key,{name:title,points:[],seen:new Set()});
  const group=groups.get(key);
  const fingerprint=norm(info).replace(/\s+/g,' ').trim();
  if(fingerprint&&!group.seen.has(fingerprint)){
   group.seen.add(fingerprint);
   group.points.push(info);
  }
 }
 return [...groups.values()];
}
function learning(topics,back){
 state.origin=(back==='month'&&state.origin==='overview')?'overview':back;
 state.screen='learning';
 const sections=groupLearning(topics).map(g=>`<article class="sd52-panel sd831-lesson"><h2>${esc(g.name)}</h2>${g.points.length>1?`<ul class="sd831-lesson-points">${g.points.map(info=>`<li>${esc(info)}</li>`).join('')}</ul>`:`<p>${esc(g.points[0]||'Vysvětlení této kapitoly se připravuje.')}</p>`}</article>`).join('');
 show('Výuka',`<h1>Výuka · ${esc(title())}</h1>${sections||'<p>Pro vybraná témata zatím nejsou k dispozici výkladové materiály.</p>'}`);
}
function quiz(topics,kind){const unique=new Map();topics.forEach(t=>{if(t.q&&t.choices.length===4&&t.choices.some(c=>String(c)===String(t.correct)))unique.set(norm(t.q),t)});const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};state.quiz=shuffle([...unique.values()]).slice(0,state.settings.count).map(t=>({...t,choices:shuffle([...t.choices])}));state.pos=0;state.correct=0;state.answers=[];state.kind=kind;state.screen='quiz';if(!state.quiz.length){state.screen='no-questions';show('Chybějící otázky','<h1>Pro vybraná témata zatím nejsou připravené ověřené otázky.</h1><p>Zkus jiná témata. Test nebude opakovat stejné otázky ani vytvářet náhodné nesmyslné odpovědi.</p>'+card('Zpět k předmětu','subject'));return}drawQuiz()}
function drawQuiz(){if(state.pos>=state.quiz.length){const en=currentGrade();const k=en?`${active()}|${state.school||'general'}|${state.subject}|r${en.grade}|${en.schoolYear.replace('/','-')}`:`${active()}|${state.school||'general'}|${state.subject}`;db.results[k]??=[];db.results[k].push({date:new Date().toISOString(),kind:state.kind,score:state.correct,total:state.quiz.length,additionalReview:state.quiz.filter(q=>q.additionalReview).length});db.results[k]=db.results[k].slice(-40);save();state.screen='finished';show('Výsledky',`<h1>Výsledek: ${state.correct}/${state.quiz.length}</h1><p>Výsledek je uložený k dětskému profilu.</p>${state.answers.filter(a=>!a.ok).map(a=>`<article class="sd52-panel"><strong>${esc(a.q)}</strong><p>Správně: ${esc(a.correct)}</p></article>`).join('')||'<p>Všechny odpovědi správně.</p>'}${card('Zpět k předmětu','subject')}`);return}const q=state.quiz[state.pos];show(state.kind==='test'?'Závěrečný test':'Procvičování',`<h1>${esc(q.name)}</h1><p>Otázka ${state.pos+1} z ${state.quiz.length}</p><div class="sd52-panel">${q.additionalReview?`<p class="sd832-extra-note">Doplňkové obecné procvičování z předmětu ${esc(title())}; není součástí plánu vybrané školy.</p>`:''}<h2>${esc(q.q)}</h2>${q.choices.map((v,i)=>`<button class="sd52-choice" data-act="answer" data-choice="${i}">${esc(v)}</button>`).join('')}<div id="sd52feedback"></div></div>`)}
/* 50.8.32: Když plán obsahuje jen jednu dostupnou otázku, procvičování
 * ji doplní označeným obecným opakováním daného předmětu. Měsíční TEST
 * doplňkovými otázkami nerozšiřujeme, aby nemíchal osnovy škol. */
function buildReview(topics){
 const source=catalog();
 const used=new Set(topics.map(x=>norm(x.q)));
 const extras=[];
 const start=source.findIndex(x=>used.has(norm(x.q)));
 const order=[];
 if(start>=0){for(let r=1;r<source.length;r++){if(start+r<source.length)order.push(start+r);if(start-r>=0)order.push(start-r)}}
 else order.push(...source.map((_,i)=>i));
 for(const i of order){const t=source[i];const id=norm(t.q);if(!id||used.has(id)||t.choices?.length!==4||!t.choices.some(x=>String(x)===String(t.correct)))continue;
  used.add(id);extras.push({...t,additionalReview:true});if(used.size>=Math.max(5,state.settings.count))break;
 }
 // Zeměpisná Vlastivěda má pouze osm samostatných otázek. K dispozici
 // máme také všeobecné otázky o ČR z již existující banky.
 if(state.subject==='geography'&&used.size<Math.max(5,state.settings.count)){
  const bank=window.SDFulnekBank825?.geography||{};
  for(const row of [...(bank['0']||[]),...(bank['2']||[])]){
   const id=norm(row[2]);if(used.has(id))continue;
   const opts=row.slice(3,7);if(opts.length!==4||!opts.some(x=>String(x)===String(row[3])))continue;
   used.add(id);extras.push({name:row[0],info:row[1],q:row[2],correct:row[3],choices:opts,additionalReview:true});
   if(used.size>=Math.max(5,state.settings.count))break;
  }
 }
 return extras;
}
function runTopics(terms,kind,back='subject'){
 const topics=catalog().filter(t=>terms.some(w=>matchTopic(t,w)));
 if(kind==='learning')return learning(topics,back);
 if(kind==='practice'&&currentPresetGrade()&&topics.length>0&&topics.length<Math.max(5,state.settings.count))return quiz([...topics,...buildReview(topics)],kind);
 return quiz(topics,kind);
}
function runMonth(kind){const bank=state.school==='zstgm_fulnek_5_2026'&&currentPresetGrade()?(window.SDFulnekBank825?.[state.subject]?.[state.month]||[]):[];
 if(bank.length){const questions=bank.map(t=>({name:t[0],info:t[1],q:t[2],correct:t[3],choices:t.slice(3,7)}));
  if(kind==='learning')learning(questions,'month');else quiz(questions,kind);
 }else runTopics(currentMonthTerms(),kind,'month')
}
function runRepeat(kind){const banks=state.school==='zstgm_fulnek_5_2026'&&currentPresetGrade()?state.selected.flatMap(m=>window.SDFulnekBank825?.[state.subject]?.[m]||[]):[];
 if(banks.length){const questions=banks.map(t=>({name:t[0],info:t[1],q:t[2],correct:t[3],choices:t.slice(3,7)}));
  if(kind==='learning')learning(questions,'repeat');else quiz(questions,kind)
 }else runTopics(repeatTerms(),kind,'repeat')
}

function currentMonthTerms(){return uniq(db.plans[planKey(state.school,state.subject,state.month)]||[])}
function repeatTerms(){return uniq(state.selected.flatMap(i=>uniq(db.plans[planKey(state.school,state.subject,i)]||[])))}
function handle(act,b){if(act==='home'){hide();return}if(act==='back'){
 if(state.screen==='overview-months'){hide();return}
 if(state.screen==='overview-subjects'){overview();return}
 if(state.origin==='overview'&&state.screen==='month'){overviewSubjects(state.month);return}
 if(state.origin==='overview'&&['learning','quiz','finished','no-questions'].includes(state.screen)){month(state.month);return}
 if(state.screen==='manage'){if(state.manageProfile){state.manageProfile=null;schoolManage();return}if(state.manageTab==='schools'){state.manageTab='children';schoolManage();return}hide();if(state.manageParent)document.body.classList.add('sd54-admin-open')}
 else if(state.screen==='confirm-archive')editSchool(state.school);
 else if(state.screen==='subject'){hide()}
 else if(['month','repeat'].includes(state.screen))months();
 else if(state.screen==='edit-plan')editSchool(state.school);
 else if(state.screen==='edit-school')schoolManage();
 else subjectMenu(state.subject);return}

if(act==='sd872-tab'){state.manageTab=b.dataset.tab==='schools'?'schools':'children';state.manageProfile=null;return schoolManage()}
 if(act==='sd872-person'){state.manageProfile=state.manageProfile===b.dataset.profile?null:b.dataset.profile;return schoolManage()}
 if(act==='sd872-save-vocational'){const form=b.closest('.sd872-vocational');if(!form)return;const obj={school:form.querySelector('[data-sd872-v-school]')?.value,location:form.querySelector('[data-sd872-v-location]')?.value,program:form.querySelector('[data-sd872-v-program]')?.value,grade:Number(form.querySelector('[data-sd872-v-grade]')?.value),schoolYear:form.querySelector('[data-sd872-v-year]')?.value};const r=window.SDGradeSchools871?.updateVocational(b.dataset.profile,obj);if(!r?.ok)return alert(r?.error||'Školu se nepodařilo uložit.');return schoolManage()}
 if(act==='sd872-unassign-primary'){if(!confirm('Odebrat Martinovi všechna chybná přiřazení základních škol? Jeho výsledky a studium autoelektrikáře zůstanou zachované.'))return;for(const s of [...(db.assignments[b.dataset.profile]||[])])window.SDGradeSchools871?.assign(b.dataset.profile,s,false);return schoolManage()}
 if(act==='overview-month')return overviewSubjects(Number(b.dataset.index));
if(act==='overview-subject'){state.subject=b.dataset.subject;state.origin='overview';return month(state.month)}
if(act==='subject')return subjectMenu(state.subject);
if(act==='manage')return schoolManage(false);if(act==='choose-school'){state.school=b.dataset.id;return state.origin==='repeat'?repeat():months()}
if(act==='school-select')return schoolSelect('months');if(act==='repeat-select')return schoolSelect('repeat');if(act==='month')return month(Number(b.dataset.index));if(act==='repeat')return repeat();if(act==='settings')return settings();if(act==='search')return search();if(act==='find')return find();
if(act==='save-settings'){state.settings.count=Number(document.getElementById('sd52count').value);return subjectMenu(state.subject)}
if(act==='sd871-save-enrollment'){
 const box=b.closest('.sd871-enrollment-card');if(!box)return;
 const res=window.SDGradeSchools871?.update(b.dataset.profile,b.dataset.school,{
  grade:Number(box.querySelector('[data-sd871-grade]').value),
  className:box.querySelector('[data-sd871-class]').value,schoolYear:box.querySelector('[data-sd871-year]').value
 });if(!res?.ok){alert(res?.error||'Nastavení se nepodařilo uložit.');return}return schoolManage();}
 if(act==='sd871-advance'){
  const en=window.SDGradeSchools871?.enrollment(b.dataset.profile,b.dataset.school);
  if(!en)return;
  if(!confirm(`Převést dítě do ${en.grade+1}. ročníku a dalšího školního roku? Staré výsledky zůstanou zachovány.`))return;
  const r=window.SDGradeSchools871.advance(b.dataset.profile,b.dataset.school);
  if(!r?.ok){alert(r?.error||'Nepodařilo se postoupit.');return}return schoolManage();}
 if(act==='edit-school')return editSchool(b.dataset.id);if(act==='prepare-archive')return prepareArchive();if(act==='cancel-archive')return editSchool(state.school);if(act==='archive-school')return archiveSchool();if(act==='restore-school')return restoreSchool(b.dataset.id);if(act==='edit-plan')return editPlan();if(act==='save-plan'){db.plans[planKey(state.school,state.subject,state.month,true)]=uniq(document.getElementById('sd52plan').value.split('\n').map(s=>s.trim()).filter(Boolean));save(true);return editSchool(state.school)}
// Odstraňování je nahrazeno bezpečnou archivací, která ponechává učivo i výsledky.
if(act==='curriculum'){hide();if(window.SDCurriculum501?.topics)window.SDCurriculum501.topics(state.subject,'schoolPlans');return}
if(act==='month-learning')return runMonth('learning');if(act==='month-practice')return runMonth('practice');if(act==='month-test')return runMonth('test');
if(act==='repeat-practice'||act==='repeat-test'){state.selected=[...root.querySelectorAll('[data-month]:checked')].map(e=>Number(e.dataset.month));return runRepeat(act==='repeat-test'?'test':'practice')}
if(act==='search-learning'||act==='search-practice'||act==='search-test'){state.selected=[...root.querySelectorAll('[data-topic-id]:checked')].map(e=>e.dataset.topicId);const t=selectedTopics();return act==='search-learning'?learning(t,'search'):quiz(t,act==='search-test'?'test':'practice')}
if(act==='answer'){if(b.disabled)return;const q=state.quiz[state.pos],choice=q.choices[Number(b.dataset.choice)],ok=String(choice)===String(q.correct);if(ok)state.correct++;state.answers.push({q:q.q,correct:q.correct,ok});root.querySelectorAll('[data-act="answer"]').forEach(x=>x.disabled=true);document.getElementById('sd52feedback').innerHTML=`<p><strong>${ok?'Správně!':'Správná odpověď: '+esc(q.correct)}</strong></p>${state.kind!=='test'?`<p>${esc(q.info)}</p>`:''}${ok?'':card('Další otázka','next')}`;
 if(ok){b.classList.add('sd825-correct','sd833-correct');const prior=state.pos;window.SDAutoAnswer833?.afterCorrect(b,()=>{state.pos++;drawQuiz()},850,()=>state.screen==='quiz'&&prior===state.pos&&!root.hidden)}return}
if(act==='next'){state.pos++;return drawQuiz()}}
root.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b)handle(b.dataset.act,b)});
root.addEventListener('change',e=>{const t=e.target;if(t.matches('[data-assign]')){const id=t.dataset.assign,s=t.dataset.school;window.SDGradeSchools871?.assign(id,s,t.checked);schoolManage()}if(t.matches('[data-sd871-grade]')){const row=t.closest('.sd871-enrollment-card'),cl=row?.querySelector('[data-sd871-class]');if(cl)cl.value=cl.value.replace(/^\s*\d+/,t.value)}if(t.matches('[data-default-profile]')){window.SDSchoolContext827?.setDefault?.(t.dataset.defaultProfile,t.value)}
 if(t.matches('[data-sd872-preview-profile]')){state.previewProfile=t.value;state.previewSchool=null;overview()}
 if(t.matches('[data-sd872-preview-school]')){state.previewSchool=t.value;overview()}});
root.addEventListener('submit',e=>{if(e.target.id!=='sd52add')return;e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')).trim(),city=String(f.get('city')).trim();
 if(db.schools.some(s=>norm(s.name)===norm(name)&&norm(s.city)===norm(city))){alert('Stejná škola už v seznamu existuje. Otevři její kartu ve Správě škol.');return}
 if(db.schools.some(s=>norm(s.city)===norm(city))&&!confirm('V tomto městě už je škola. Opravdu chceš přidat další samostatný záznam?'))return;
 db.schools.push({id:'school_'+Date.now()+'_'+Math.floor(Math.random()*10000),name,city});save(true);schoolManage()});
function compactParentAdmin(){const a=document.getElementById('authAdmin');if(!a||a.dataset.sd872Compact)return;
 a.dataset.sd872Compact='yes';
 const newChild=a.querySelector('#adminNewName'),pin=a.querySelector('#adminParentNew');
 if(!newChild||!pin)return;
 const h3s=[...a.children].filter(el=>el.tagName==='H3');
 const createHeading=h3s.find(el=>el.textContent.includes('Nové dítě'));
 const pinHeading=h3s.find(el=>el.textContent.includes('Změna PIN'));
 function wrapSection(start,end,label){if(!start)return;
  const details=document.createElement('details');details.className='sd872-auth-details';
  const summary=document.createElement('summary');summary.textContent=label;details.append(summary);
  a.insertBefore(details,start);
  let cur=start;while(cur&&cur!==end){const next=cur.nextElementSibling;details.append(cur);cur=next;}
 }
 wrapSection(createHeading,pinHeading,'Přidat další dětský profil');
 wrapSection(pinHeading,a.querySelector('#adminMessage'),'Změna rodičovského PINu');
}
function install(){compactParentAdmin();for(const [id,screen] of [['math','mathScreen'],['czech','czechScreen'],['english','englishScreen']]){const el=document.getElementById(screen);if(!el)continue;const b=document.createElement('button');b.className='sd52-launch';b.textContent='📅 Výuka · Měsíční plán · Školní test · Nastavení';b.onclick=()=>subjectMenu(id);el.prepend(b)}const home=document.getElementById('homeScreen');if(home){const admin=document.getElementById('authAdmin');if(admin){const b=document.createElement('button');b.type='button';b.className='sd54-schools-btn';b.textContent='🏫 Děti, školy a ročníky';b.onclick=()=>{document.body.classList.remove('sd54-admin-open');schoolManage(true)};admin.insertBefore(b,admin.firstChild.nextSibling)}}if(home){for(const [cls,id] of [['nature','nature'],['history','geography']]){const tile=home.querySelector('.v23-extra.'+cls);if(tile){tile.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();subjectMenu(id)},true)}}}const old=home?.querySelector('.sd-launch');if(old)old.style.display='none';const badge=document.createElement('div');badge.className='sd52-version';badge.textContent='Školní dobrodružství · 50.4.1';badge.style.display='none';document.body.append(badge)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.SDSchoolPlans52={open:subjectMenu,openOverview,manage:schoolManage,reloadDb,close:hide,back:()=>handle('back'),current:()=>({screen:state.screen,subject:(['overview-months','overview-subjects'].includes(state.screen)?'school':(['manage','edit-school','edit-plan','confirm-archive'].includes(state.screen)?'admin':state.subject)),origin:state.origin,school:state.school,manageParent:state.manageParent})};
})();
