/* Školní dobrodružství 50.4.1 – školy, měsíční plány a samostatné obrazovky. */
(()=>{'use strict';
const SUBJECTS={math:'Matematika',czech:'Český jazyk',english:'Angličtina',nature:'Přírodověda',geography:'Vlastivěda'};
const MONTHS=['Září','Říjen','Listopad','Prosinec','Leden','Únor','Březen','Duben','Květen','Červen'];
const DBKEY='sd52_schools_plans_v1', ACTIVE='matematika-karticky-progress-v3-active',PROFILES='matematika-karticky-progress-v3-profiles';
const state={screen:'',subject:'math',school:null,month:0,selected:[],quiz:[],pos:0,correct:0,answers:[],settings:{count:10},origin:'',manageParent:false};
let db;try{db=JSON.parse(localStorage.getItem(DBKEY)||'{}')}catch{db={}};
if(!db||typeof db!=='object')db={};db.schools??=[];db.assignments??={};db.plans??={};db.results??={};db.archivedSchools??={};
const save=()=>localStorage.setItem(DBKEY,JSON.stringify(db));
const active=()=>document.body.classList.contains('parent-role')?'parent':(document.body.classList.contains('child-role')?(sessionStorage.getItem('skolni-live-v441')||localStorage.getItem(ACTIVE)||'parent'):(localStorage.getItem(ACTIVE)||'parent'));
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
const planKey=(school,sub,month)=>`${school}|${sub}|${month}`;
function reloadDb(){try{const data=JSON.parse(localStorage.getItem(DBKEY)||'{}');if(data&&typeof data==='object'){
  db=data;db.schools??=[];db.assignments??={};db.plans??={};db.results??={};db.archivedSchools??={};
 }}catch(e){console.warn('Měsíční plány: synchronizace',e)}}
const selectedSchool=()=>window.SDSchoolContext827?.activeSchoolId?.()||null;
const schoolName=()=>{const v=chosenSchool();return v?.city||v?.name||'Nepřiřazená škola'};
const currentSchool=()=>{const id=selectedSchool();return db.schools.find(s=>s.id===id && assigned().some(x=>x.id===id))?.id||assigned()[0]?.id||null};
const plannedMonths=()=>MONTHS.map((_,i)=>i).filter(i=>Object.keys(SUBJECTS).some(sub=>(db.plans[planKey(state.school,sub,i)]||[]).length));
const monthSubjects=i=>Object.entries(SUBJECTS).map(([sub,name])=>[sub,name,(db.plans[planKey(state.school,sub,i)]||[]).length]);
function overview(){reloadDb();state.origin='overview';state.screen='overview-months';state.school=currentSchool();
 const m=plannedMonths();
 show('Měsíční plán · '+schoolName(),`<h1>Školní učivo · ${esc(schoolName())}</h1><p>Vyber měsíc, potom předmět a pokračuj do jeho výuky nebo testu.</p>${m.length?grid(m.map(i=>card(MONTHS[i],'overview-month',`${Object.keys(SUBJECTS).reduce((n,sub)=>n+(db.plans[planKey(state.school,sub,i)]||[]).length,0)} témat`,`data-index="${i}"`))):'<p>Pro tuto školu zatím nejsou vyplněné měsíční plány. Rodič je může doplnit ve Správě škol.</p>'}`);
}
function overviewSubjects(i){state.origin='overview';state.month=i;state.screen='overview-subjects';
 show('Výběr předmětu',`<h1>${esc(MONTHS[i])} · ${esc(schoolName())}</h1><p>Vyber předmět pro tuto školu.</p>${grid(monthSubjects(i).map(([sub,name,count])=>card(name,'overview-subject',count?`${count} témat`:'Plán zatím nezadán',`data-subject="${sub}"`)))}`)
}
function openOverview(){overview()}

const assigned=()=>isParent()?db.schools:db.schools.filter(s=>(db.assignments[active()]||[]).includes(s.id));
const chosenSchool=()=>db.schools.find(s=>s.id===state.school);
const title=()=>SUBJECTS[state.subject];
function subjectMenu(sub){reloadDb();state.subject=sub;state.origin='subject';state.screen='subject';state.school=currentSchool();const schools=assigned();show(title(),`<h1>${esc(title())}</h1><p>Aktivní škola: <strong>${esc(schoolName())}</strong>. Výuka a procvičování z měsíčního plánu vycházejí pouze z této školy. Ostatní kapitoly jsou obecné.</p>`+grid([
card('Výuka','curriculum','Kapitoly a vysvětlení'),card('Procvičování','curriculum','Samostatná cvičení'),card('Příprava na školní test','search','Vyhledat a spojit témata'),card('Měsíční plán','school-select','Učivo podle měsíců'),card('Opakování','repeat-select','Spojit více měsíců'),card('Závěrečný test','repeat-select','Test z vybraných měsíců'),card('Nastavení','settings','Počet otázek a pravidla'),...(isParent()?[card('Správa škol a plánů','manage','Pouze rodič')]:[])]));}
function schoolSelect(next){state.origin=next;const a=assigned();state.school=currentSchool();state.screen='schools';if(!a.length){show('Měsíční plán',`<h1>Škola zatím není přiřazena</h1><p>Rodič může přidat školu a měsíční učivo ve Správě škol.</p>${isParent()?card('Správa škol','manage'):''}`);return}if(state.school&&a.some(s=>s.id===state.school)){return next==='repeat'?repeat():months()}show('Výběr školy',`<h1>Vyber školu</h1>`+grid(a.map(s=>card(s.city||s.name,'choose-school',s.name,`data-id="${esc(s.id)}"`))))}
function months(){state.screen='months';const s=chosenSchool();show('Měsíční plán',`<h1>${esc(title())} · ${esc(s?.city||s?.name)}</h1><p>Otevři měsíc a vyber učivo k procvičování.</p>`+grid(MONTHS.map((m,i)=>{const p=db.plans[planKey(state.school,state.subject,i)]||[];return card(m,'month',p.length?`${p.length} témat: ${p.slice(0,2).join(', ')}`:'Plán zatím nezadán',`data-index="${i}"`)}))+card('Opakovat více měsíců','repeat','Výběr měsíců a závěrečný test'))}
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
const schoolLabel=s=>`${s.city||''} · ${s.name} · ${s.grade||'bez třídy'}`;
const schoolShortId=s=>s.id==='zstgm_fulnek_5_2026'?'Přednastavený záznam':`Záznam ${String(s.id).slice(-6)}`;
function schoolTile(s){const st=schoolStats(s.id),dupe=db.schools.some(other=>other.id!==s.id&&norm(other.city)===norm(s.city));
 return `<article class="sd828-school-item"><div class="sd828-school-top"><strong>${esc(s.name)}</strong>${dupe?'<span class="sd828-school-duplicate">Stejné město jako další škola</span>':''}</div>
 <p><b>Město:</b> ${esc(s.city||'neuvedeno')} · <b>Třída:</b> ${esc(s.grade||'neuvedena')}</p>
 <small>${esc(schoolTag(s))} · ${esc(schoolShortId(s))}</small>
 <p>${st.plans} měsíčních plánů, ${st.topics} témat · ${st.people.length} přiřazených profilů · ${st.results} záznamů výsledků</p>
 <button class="sd828-school-edit" type="button" data-act="edit-school" data-id="${esc(s.id)}">Spravovat tuto konkrétní školu</button></article>`;
}
function schoolManage(fromParent){if(!isParent()){show('Rodičovský režim','<h1>Správa je dostupná pouze rodiči</h1>');return}
 if(fromParent===true)state.manageParent=true;
 if(fromParent===false)state.manageParent=false;
 reloadDb();state.screen='manage';const ps=profiles();const archived=Object.values(db.archivedSchools||{});
 show('Správa škol',`<h1>Správa škol a měsíčních plánů</h1><p>Každá škola je samostatný záznam. Dva záznamy „Fulnek“ <b>neznamenají stejné uložené plány</b>; podle počtu témat a původu poznáš, který používáš.</p>
 <div class="sd52-panel"><h2>Přidat školu</h2><form id="sd52add"><label>Název školy<input name="name" required placeholder="ZŠ ..."></label><label>Město<input name="city" required placeholder="Fulnek"></label><label>Třída<input name="grade" placeholder="5.B"></label><button type="submit">Přidat školu</button></form></div>
 <h2>Moje školy (${db.schools.length})</h2><div class="sd828-school-list">${db.schools.map(schoolTile).join('')||'<p>Zatím žádná škola.</p>'}</div>
 <div class="sd52-panel"><h2>Přiřazení škol dětem</h2>${Object.entries(ps).filter(([id])=>id!=='parent').map(([id,p])=>`<div class="sd52-person"><strong>${esc(p.name||id)}</strong>${db.schools.map(s=>`<label class="sd52-check"><input type="checkbox" data-assign="${esc(id)}" data-school="${esc(s.id)}" ${(db.assignments[id]||[]).includes(s.id)?'checked':''}> <span>${esc(s.city||s.name)} – ${esc(s.name)} <small>(${esc(schoolShortId(s))})</small></span></label>`).join('')}<label class="sd52-default-label">Výchozí škola <select data-default-profile="${esc(id)}">${(db.assignments[id]||[]).map(sid=>db.schools.find(s=>s.id===sid)).filter(Boolean).map(s=>`<option value="${esc(s.id)}" ${window.SDSchoolContext827?.defaultSchoolId?.(id)===s.id?'selected':''}>${esc(s.city||s.name)} – ${esc(schoolShortId(s))}</option>`).join('')}</select></label></div>`).join('')||'<p>Nejdříve vytvoř dětský profil.</p>'}</div>
 ${archived.length?`<div class="sd52-panel"><h2>Archivované školy (${archived.length})</h2><p>Archivace nic nevymaže: učivo a výsledky zůstávají uložené a školu lze obnovit.</p>${archived.map(record=>`<div class="sd828-archived"><b>${esc(schoolLabel(record.school))}</b><small>${esc(schoolShortId(record.school))}</small><button type="button" data-act="restore-school" data-id="${esc(record.school.id)}">Obnovit školu</button></div>`).join('')}</div>`:''}`);
}
function editSchool(id){reloadDb();state.school=id;state.screen='edit-school';const s=chosenSchool();if(!s)return schoolManage();
 const st=schoolStats(id);
 show('Úprava školy',`<h1>${esc(s.name)}</h1><div class="sd52-panel"><p><b>Město:</b> ${esc(s.city||'neuvedeno')} · <b>Třída:</b> ${esc(s.grade||'neuvedena')}</p><p><b>${esc(schoolTag(s))}</b> · ${esc(schoolShortId(s))}</p><p>${st.plans} uložených měsíčních plánů, ${st.topics} témat, ${st.results} záznamů výsledků</p></div>
 <h2>Upravovat učivo této školy</h2><label>Předmět<select id="sd52sub">${Object.entries(SUBJECTS).map(([k,v])=>`<option value="${k}" ${state.subject===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Měsíc<select id="sd52month">${MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}</select></label>${card('Upravit měsíční plán','edit-plan')}
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
 try{save()}catch(e){db.schools.push(s);delete db.archivedSchools[s.id];for(const pid of people){db.assignments[pid]??=[];if(!db.assignments[pid].includes(s.id))db.assignments[pid].push(s.id)}alert('Archivaci se nepodařilo bezpečně uložit. Škola zůstává aktivní.');return}
 state.school=null;window.SDSchoolContext827?.refresh?.();schoolManage();
}
function restoreSchool(id){const item=db.archivedSchools?.[id];if(!item)return;
 if(!confirm(`Obnovit školu ${item.school.name} (${item.school.city||''})?`))return;
 db.schools.push(item.school);
 for(const pid of item.assignedTo||[])if(profiles()[pid]){db.assignments[pid]??=[];if(!db.assignments[pid].includes(id))db.assignments[pid].push(id)}
 delete db.archivedSchools[id];try{save()}catch(e){alert('Obnovení se nepodařilo uložit.');return}
 window.SDSchoolContext827?.refresh?.();schoolManage();
}
function editPlan(){state.subject=document.getElementById('sd52sub').value;state.month=Number(document.getElementById('sd52month').value);state.screen='edit-plan';const key=planKey(state.school,state.subject,state.month);const topics=db.plans[key]||[];show('Úprava měsíčního plánu',`<h1>${esc(MONTHS[state.month])} · ${esc(title())}</h1><p>Jedno téma na každý řádek. Můžeš zadat názvy kapitol, slovíček nebo gramatiky.</p><textarea id="sd52plan" rows="11" placeholder="Např. a/an&#10;čísla&#10;there is / there are">${esc(topics.join('\n'))}</textarea>${card('Uložit plán','save-plan')}`)}
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
function drawQuiz(){if(state.pos>=state.quiz.length){const k=`${active()}|${state.school||'general'}|${state.subject}`;db.results[k]??=[];db.results[k].push({date:new Date().toISOString(),kind:state.kind,score:state.correct,total:state.quiz.length,additionalReview:state.quiz.filter(q=>q.additionalReview).length});db.results[k]=db.results[k].slice(-40);save();state.screen='finished';show('Výsledky',`<h1>Výsledek: ${state.correct}/${state.quiz.length}</h1><p>Výsledek je uložený k dětskému profilu.</p>${state.answers.filter(a=>!a.ok).map(a=>`<article class="sd52-panel"><strong>${esc(a.q)}</strong><p>Správně: ${esc(a.correct)}</p></article>`).join('')||'<p>Všechny odpovědi správně.</p>'}${card('Zpět k předmětu','subject')}`);return}const q=state.quiz[state.pos];show(state.kind==='test'?'Závěrečný test':'Procvičování',`<h1>${esc(q.name)}</h1><p>Otázka ${state.pos+1} z ${state.quiz.length}</p><div class="sd52-panel">${q.additionalReview?`<p class="sd832-extra-note">Doplňkové obecné procvičování z předmětu ${esc(title())}; není součástí plánu vybrané školy.</p>`:''}<h2>${esc(q.q)}</h2>${q.choices.map((v,i)=>`<button class="sd52-choice" data-act="answer" data-choice="${i}">${esc(v)}</button>`).join('')}<div id="sd52feedback"></div></div>`)}
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
 if(kind==='practice'&&topics.length>0&&topics.length<Math.max(5,state.settings.count))return quiz([...topics,...buildReview(topics)],kind);
 return quiz(topics,kind);
}
function runMonth(kind){const bank=state.school==='zstgm_fulnek_5_2026'?(window.SDFulnekBank825?.[state.subject]?.[state.month]||[]):[];
 if(bank.length){const questions=bank.map(t=>({name:t[0],info:t[1],q:t[2],correct:t[3],choices:t.slice(3,7)}));
  if(kind==='learning')learning(questions,'month');else quiz(questions,kind);
 }else runTopics(currentMonthTerms(),kind,'month')
}
function runRepeat(kind){const banks=state.school==='zstgm_fulnek_5_2026'?state.selected.flatMap(m=>window.SDFulnekBank825?.[state.subject]?.[m]||[]):[];
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
 if(state.screen==='manage'){hide();if(state.manageParent)document.body.classList.add('sd54-admin-open')}
 else if(state.screen==='confirm-archive')editSchool(state.school);
 else if(state.screen==='subject'){hide()}
 else if(['month','repeat'].includes(state.screen))months();
 else if(state.screen==='edit-plan')editSchool(state.school);
 else if(state.screen==='edit-school')schoolManage();
 else subjectMenu(state.subject);return}

if(act==='overview-month')return overviewSubjects(Number(b.dataset.index));
if(act==='overview-subject'){state.subject=b.dataset.subject;state.origin='overview';return month(state.month)}
if(act==='subject')return subjectMenu(state.subject);
if(act==='manage')return schoolManage(false);if(act==='choose-school'){state.school=b.dataset.id;return state.origin==='repeat'?repeat():months()}
if(act==='school-select')return schoolSelect('months');if(act==='repeat-select')return schoolSelect('repeat');if(act==='month')return month(Number(b.dataset.index));if(act==='repeat')return repeat();if(act==='settings')return settings();if(act==='search')return search();if(act==='find')return find();
if(act==='save-settings'){state.settings.count=Number(document.getElementById('sd52count').value);return subjectMenu(state.subject)}
if(act==='edit-school')return editSchool(b.dataset.id);if(act==='prepare-archive')return prepareArchive();if(act==='cancel-archive')return editSchool(state.school);if(act==='archive-school')return archiveSchool();if(act==='restore-school')return restoreSchool(b.dataset.id);if(act==='edit-plan')return editPlan();if(act==='save-plan'){db.plans[planKey(state.school,state.subject,state.month)]=uniq(document.getElementById('sd52plan').value.split('\n').map(s=>s.trim()).filter(Boolean));save();return editSchool(state.school)}
// Odstraňování je nahrazeno bezpečnou archivací, která ponechává učivo i výsledky.
if(act==='curriculum'){hide();if(window.SDCurriculum501?.topics)window.SDCurriculum501.topics(state.subject,'schoolPlans');return}
if(act==='month-learning')return runMonth('learning');if(act==='month-practice')return runMonth('practice');if(act==='month-test')return runMonth('test');
if(act==='repeat-practice'||act==='repeat-test'){state.selected=[...root.querySelectorAll('[data-month]:checked')].map(e=>Number(e.dataset.month));return runRepeat(act==='repeat-test'?'test':'practice')}
if(act==='search-learning'||act==='search-practice'||act==='search-test'){state.selected=[...root.querySelectorAll('[data-topic-id]:checked')].map(e=>e.dataset.topicId);const t=selectedTopics();return act==='search-learning'?learning(t,'search'):quiz(t,act==='search-test'?'test':'practice')}
if(act==='answer'){if(b.disabled)return;const q=state.quiz[state.pos],choice=q.choices[Number(b.dataset.choice)],ok=String(choice)===String(q.correct);if(ok)state.correct++;state.answers.push({q:q.q,correct:q.correct,ok});root.querySelectorAll('[data-act="answer"]').forEach(x=>x.disabled=true);document.getElementById('sd52feedback').innerHTML=`<p><strong>${ok?'Správně!':'Správná odpověď: '+esc(q.correct)}</strong></p>${state.kind!=='test'?`<p>${esc(q.info)}</p>`:''}${ok?'':card('Další otázka','next')}`;
 if(ok){b.classList.add('sd825-correct');const prior=state.pos;setTimeout(()=>{if(state.screen==='quiz'&&prior===state.pos){state.pos++;drawQuiz()}},850)}return}
if(act==='next'){state.pos++;return drawQuiz()}}
root.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b)handle(b.dataset.act,b)});
root.addEventListener('change',e=>{const t=e.target;if(t.matches('[data-assign]')){const id=t.dataset.assign,s=t.dataset.school;db.assignments[id]??=[];db.assignments[id]=t.checked?uniq([...db.assignments[id],s]):db.assignments[id].filter(x=>x!==s);save();window.SDSchoolContext827?.refresh?.();schoolManage()}if(t.matches('[data-default-profile]')){window.SDSchoolContext827?.setDefault?.(t.dataset.defaultProfile,t.value)}});
root.addEventListener('submit',e=>{if(e.target.id!=='sd52add')return;e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')).trim(),city=String(f.get('city')).trim(),grade=String(f.get('grade')).trim();
 if(db.schools.some(s=>norm(s.name)===norm(name)&&norm(s.city)===norm(city))){alert('Stejná škola už v seznamu existuje. Otevři její kartu ve Správě škol.');return}
 if(db.schools.some(s=>norm(s.city)===norm(city))&&!confirm('V tomto městě už je škola. Opravdu chceš přidat další samostatný záznam?'))return;
 db.schools.push({id:'school_'+Date.now()+'_'+Math.floor(Math.random()*10000),name,city,grade});save();schoolManage()});
function install(){for(const [id,screen] of [['math','mathScreen'],['czech','czechScreen'],['english','englishScreen']]){const el=document.getElementById(screen);if(!el)continue;const b=document.createElement('button');b.className='sd52-launch';b.textContent='📅 Výuka · Měsíční plán · Školní test · Nastavení';b.onclick=()=>subjectMenu(id);el.prepend(b)}const home=document.getElementById('homeScreen');if(home){const admin=document.getElementById('authAdmin');if(admin){const b=document.createElement('button');b.type='button';b.className='sd54-schools-btn';b.textContent='🏫 Správa škol a měsíčních plánů';b.onclick=()=>{document.body.classList.remove('sd54-admin-open');schoolManage(true)};admin.insertBefore(b,admin.firstChild.nextSibling)}}if(home){for(const [cls,id] of [['nature','nature'],['history','geography']]){const tile=home.querySelector('.v23-extra.'+cls);if(tile){tile.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();subjectMenu(id)},true)}}}const old=home?.querySelector('.sd-launch');if(old)old.style.display='none';const badge=document.createElement('div');badge.className='sd52-version';badge.textContent='Školní dobrodružství · 50.4.1';badge.style.display='none';document.body.append(badge)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.SDSchoolPlans52={open:subjectMenu,openOverview,manage:schoolManage,reloadDb,close:hide,back:()=>handle('back'),current:()=>({screen:state.screen,subject:(['overview-months','overview-subjects'].includes(state.screen)?'school':(['manage','edit-school','edit-plan','confirm-archive'].includes(state.screen)?'admin':state.subject)),origin:state.origin,school:state.school,manageParent:state.manageParent})};
})();
