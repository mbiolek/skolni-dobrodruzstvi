/* 50.8.88 – přehledná příprava Martina. Originální A/B/C otázky jsou ze samostatného souboru. */
(()=>{'use strict';
const BANK=window.MARTIN_ORIGINAL_ABC88;
const ORAL=window.MARTIN_DATA?.oral||[];
const LESSONS=window.MARTIN_ORAL_LESSONS||{};
if(!BANK?.categories?.length)return;
const $=s=>document.querySelector(s), el=(p,tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;p.append(n);return n};
const button=(p,txt,fn,cls)=>{const b=el(p,'button',txt,'sd888-btn '+(cls||''));b.type='button';b.addEventListener('click',fn);return b};
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const live=()=>{try{return sessionStorage.getItem('skolni-live-v441')||''}catch{return ''}};
const resultsKey=()=>`sd888_martin_abc_results_${live()}`;
const testing=()=>!!window.__SD878Preview||new URLSearchParams(location.search).get('test')==='parent';
// 50.8.91 – independent training, exam and mistake review.
const allQuestions=()=>BANK.categories.flatMap((c,cat)=>c.questions.map((q,idx)=>({...q,subject:c.name,cat,reviewKey:cat+':'+idx})));
// 50.8.92 – local adaptive learning. Legacy wrong questions are imported once.
const adaptiveKey=()=>`sd892_martin_adaptive_${live()}`;
const legacyKey=()=>`sd891_martin_wrong_${live()}`;
let previewStats={},volatileStats=new Map();
const isPreview=()=>testing()||!live();
function readStats(){
 if(isPreview())return {...previewStats};
 const key=adaptiveKey();
 if(volatileStats.has(key))return {...volatileStats.get(key)};
 try{
  const value=JSON.parse(localStorage.getItem(key)||'null');
  if(value&&typeof value==='object'&&!Array.isArray(value))return value;
  const legacy=JSON.parse(localStorage.getItem(legacyKey())||'[]'),out={};
  if(Array.isArray(legacy))for(const k of legacy)if(typeof k==='string')out[k]={hard:true,wrong:true};
  return out;
 }catch{return {}}
}
function writeStats(stats){
 if(isPreview()){previewStats=stats;return}
 const key=adaptiveKey();
 try{localStorage.setItem(key,JSON.stringify(stats));volatileStats.delete(key)}catch{volatileStats.set(key,stats)}
}
const threshold=q=>Math.max(25,Math.ceil((q.q+' '+q.a.join(' ')).trim().split(/\s+/).length/3));
function recordAnswer(q,selected,seconds,flag=''){
 const stats=readStats(),old=stats[q.reviewKey]||{},correct=selected===q.correct,slow=seconds>=threshold(q);
 const mastered=correct&&flag==='easy';
 const hard=!correct||(!mastered&&(slow||flag==='hard'));
 stats[q.reviewKey]={...old,seen:(old.seen||0)+1,wrong:!correct,slow,manual:flag==='hard',hard,mastered:mastered||(correct&&!hard&&old.mastered&&flag!=='hard')||false,seconds:Math.round(seconds),updated:Date.now()};
 writeStats(stats);
 return stats[q.reviewKey];
}
function reviseFlag(answer,flag){
 if(answer.selected!==answer.q.correct&&flag==='easy')return;
 const stats=readStats(),old=stats[answer.q.reviewKey]||{};
 const wrong=answer.selected!==answer.q.correct,slow=answer.seconds>=threshold(answer.q);
 stats[answer.q.reviewKey]={...old,wrong,slow,manual:flag==='hard',hard:wrong||flag==='hard'||(flag!=='easy'&&slow),mastered:!wrong&&flag==='easy'};
 writeStats(stats);answer.flag=flag;
}
function pendingQuestions(){const stats=readStats();return allQuestions().filter(q=>stats[q.reviewKey]?.hard)}
function masteredQuestions(){const stats=readStats();return allQuestions().filter(q=>stats[q.reviewKey]?.mastered)}
function startWrong(items=pendingQuestions()){
 if(!items.length){testIndex();return}
 activeTest={name:'Obtížné otázky',mode:'review',items:shuffle(items),pos:0,answers:[],started:Date.now()};
 section='test';renderQuestion();
}
function modeLabel(mode){return mode==='exam'?'Test nanečisto':mode==='review'?'Opakování obtížných otázek':'Procvičovací test'}
function prioritized(pool,size,includeMastered=false){
 const stats=readStats(),eligible=pool.filter(q=>includeMastered||!stats[q.reviewKey]?.mastered);
 const hard=shuffle(eligible.filter(q=>stats[q.reviewKey]?.hard));
 const fresh=shuffle(eligible.filter(q=>!stats[q.reviewKey]?.hard&&!stats[q.reviewKey]?.seen&&!stats[q.reviewKey]?.mastered));
 const other=shuffle(eligible.filter(q=>!stats[q.reviewKey]?.hard&&stats[q.reviewKey]?.seen&&!stats[q.reviewKey]?.mastered));
 const easy=shuffle(eligible.filter(q=>stats[q.reviewKey]?.mastered&&!stats[q.reviewKey]?.hard));
 const limit=Math.min(size,eligible.length),picked=hard.splice(0,Math.ceil(limit*.6));
 return shuffle([...picked,...fresh,...other,...hard,...easy].slice(0,limit));
}
let questionClock=null;
function stopClock(){if(questionClock){questionClock.pause();document.removeEventListener('visibilitychange',questionClock.visibility);questionClock=null}}
function makeClock(){
 let total=0,since=null,paused=false;
 const pause=()=>{if(since!==null){total+=Math.max(0,performance.now()-since);since=null}};
 const resume=()=>{if(!paused&&document.visibilityState!=='hidden'&&since===null)since=performance.now()};
 const visibility=()=>{if(document.visibilityState==='hidden')pause();else resume()};
 const clock={pause:()=>{paused=true;pause()},resume:()=>{paused=false;resume()},visibility,seconds:()=>{pause();return total/1000}};
 document.addEventListener('visibilitychange',visibility);resume();return clock;
}
let modal, main, section='home', activeTest=null, locked=false, timer=null,historyGuard=false;
function clearTimer(){if(timer){clearInterval(timer);timer=null}}
function clear(){stopClock();clearTimer();main.replaceChildren();main.scrollTop=0;locked=false}
function heading(title,desc){if(section!=='home'){const nav=el(main,'div',undefined,'sd889-nav');button(nav,'← Zpět',back,'sd888-back')}el(main,'h2',title);if(desc)el(main,'p',desc,'sd888-desc')}
function footerHome(){button(main,'← Přehled zkoušek',home,'sd888-back')}
function armBack(){try{history.pushState({...history.state,sd888Exam:true},'');historyGuard=true}catch(err){historyGuard=false;console.warn('Historie testovacího náhledu není dostupná:',err)}}
function open(){if(!modal)mount();if(modal.hidden){modal.hidden=false;document.body.classList.add('sd888-open');home();armBack()}}
function closeDirect(){stopClock();clearTimer();activeTest=null;if(modal)modal.hidden=true;document.body.classList.remove('sd888-open')}
function close(){if(!modal||modal.hidden)return;closeDirect();if(historyGuard){historyGuard=false;history.back()}}
function askExit(){
 clearTimer();
 if(!activeTest){testIndex();return}
 // Browser confirm() may be suppressed inside the isolated parent test iframe.
 // A real in-page prompt always allows the user to complete the action.
 const existing=main.querySelector('#sd889ExitConfirm');if(existing){existing.remove();if(!locked)questionClock?.resume();return}
 questionClock?.pause();
 const box=el(main,'section',undefined,'sd888-card sd889-exit-confirm');box.id='sd889ExitConfirm';
 box.setAttribute('role','group');box.setAttribute('aria-label','Ukončení testu');
 el(box,'h3','Ukončit tento pokus?');
 el(box,'p','Dosavadní odpovědi můžeš vyhodnotit, nebo se vrátit k otázce.');
 const choices=el(box,'div',undefined,'sd888-actions');
 button(choices,'Ano, ukončit a vyhodnotit',()=>{if(!activeTest?.answers.length){activeTest=null;testIndex()}else complete(true)},'sd888-primary');
 button(choices,'Pokračovat v testu',()=>{box.remove();if(!locked)questionClock?.resume()},'sd888-secondary');
 box.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function back(){
 if(section==='test'){askExit();return}
 if(section==='results'){activeTest=null;testIndex();return}
 if(section==='learn-detail'){learnIndex();return}
 if(section==='practice-detail'){practiceIndex();return}
 if(section==='learn'||section==='practice'||section==='test-index'||section==='history'||section==='mastered'){home();return}
 closeDirect();
}
window.addEventListener('popstate',()=>{
 if(!modal||modal.hidden)return;
 historyGuard=false;
 back();
 if(modal&&!modal.hidden)armBack();
});
function home(){section='home';clear();heading('Příprava k výuční zkoušce – Autoelektrikář','Tři samostatné způsoby přípravy. Ústní okruhy vycházejí z původního školního seznamu 2026. Písemné testy A/B/C jsou z dodaného ZIP archivu. Nejde o potvrzené zadání zkoušky 2027.');
 const grid=el(main,'div',undefined,'sd888-home-grid');
 const cards=[['Výuka – 25 ústních okruhů','Nejdřív se naučit principy, prohlédnout schéma a projít původní školní zadání.',learnIndex],['Procvičování ústní odpovědi','Bez výkladu zkusit vlastními slovy vysvětlit otázku. Teprve potom zobrazit nápovědu.',practiceIndex],['Původní testy A/B/C','1 133 úplných otázek ze sedmi dodaných souborů. Trénink nebo zkušební test.',testIndex]];
 for(const [name,desc,act] of cards){const card=el(grid,'section',undefined,'sd888-card');el(card,'h3',name);el(card,'p',desc);button(card,'Otevřít',act,'sd888-primary')}
 const note=el(main,'section',undefined,'sd888-note');el(note,'strong','Rozdíl mezi režimy');el(note,'p','Výuka obsahuje vysvětlení, procvičování ověřuje samostatné vybavení znalostí a test vyhodnocuje skutečné možnosti A, B, C z původního archivu.');
 adaptiveMenu(main);
 button(main,'Historie testů',showResults);
}
function chooseOral(action){clear();heading(action==='learn'?'Výuka – vyber ústní okruh':'Procvičování – vyber ústní okruh','25 dvojic podle školního seznamu. Elektrotechnická a automobilová část zůstávají oddělené.');
 const grid=el(main,'div',undefined,'sd888-oral-grid');
 ORAL.forEach((q,i)=>{button(grid,String(q.number||i+1)+'. '+(q.tech||'Elektrotechnika'),()=>action==='learn'?lesson(i):practice(i))});
 footerHome();
}
function learnIndex(){section='learn';chooseOral('learn')}
function practiceIndex(){section='practice';chooseOral('practice')}
function lesson(i){section='learn-detail';clear();const q=ORAL[i],details=LESSONS[q?.number];if(!q){learnIndex();return}
 heading('Výuka – okruh '+q.number,'Nejdřív se seznam s vysvětlením a původním zadáním, až potom přejdi k procvičování.');
 for(const [name,title,requirements,bullets] of [['Elektrotechnika',q.tech,q.techRequirements,details?.t],['Automobilová technika',q.auto,q.autoRequirements,details?.a]]){
  const box=el(main,'section',undefined,'sd888-card');el(box,'h3',name+' – '+(title||''));el(box,'p',requirements||'');if(Array.isArray(bullets)&&bullets.length){const ul=el(box,'ul');bullets.forEach(t=>el(ul,'li',t))}
 }
 if(Array.isArray(details?.d)&&details.d.length){const box=el(main,'section',undefined,'sd888-card');el(box,'h3','Diagnostika a bezpečnost');const ul=el(box,'ul');details.d.forEach(t=>el(ul,'li',t))}
 const img=el(main,'img');img.src='./schema/oral-'+String(q.number).padStart(2,'0')+'.svg';img.alt='Výukové schéma okruhu '+q.number;img.className='sd888-diagram';
 button(main,'Přejít na procvičování bez nápovědy',()=>practice(i),'sd888-primary');button(main,'← Seznam okruhů',learnIndex,'sd888-back');
}
function practice(i){section='practice-detail';clear();const q=ORAL[i],details=LESSONS[q?.number];if(!q){practiceIndex();return}
 heading('Procvičování – okruh '+q.number,'Zkus odpovědět nahlas bez čtení učebního textu. Správnost si ověř až po stisknutí tlačítka Nápověda.');
 const prompts=Array.isArray(details?.q)&&details.q.length?details.q:[q.tech,q.auto].filter(Boolean);
 const hints=[...(details?.t||[]),...(details?.a||[]),...(details?.d||[])];
 for(let j=0;j<prompts.length;j++){const card=el(main,'section',undefined,'sd888-card');el(card,'h3','Otázka '+(j+1));el(card,'p',prompts[j]);const detail=el(card,'div',undefined,'sd888-hint');detail.hidden=true;el(detail,'p','Kontrolní body z výuky:');const ul=el(detail,'ul');hints.slice(j*3,j*3+5).concat(hints.length<=j*3?hints.slice(0,5):[]).forEach(t=>el(ul,'li',t));button(card,'Zobrazit nápovědu',()=>{detail.hidden=!detail.hidden},'sd888-secondary')}
 const btns=el(main,'div',undefined,'sd888-actions');button(btns,'← Seznam okruhů',practiceIndex,'sd888-back');button(btns,'Otevřít výklad',()=>lesson(i));
}
function testIndex(){section='test-index';clear();heading('Originální testy A/B/C','Otázky, možnosti a správné odpovědi jsou převzaté z archivu „Autoelektrikář test abc.zip“. Zdroj má možnosti A, B, C – čtvrtá odpověď D v něm není.');
 const cats=el(main,'div',undefined,'sd888-card');el(cats,'h3','Vyber oblast');
 const select=el(cats,'select');select.id='sd888-category';const all=el(select,'option','Všechny oblasti (1 133 otázek)');all.value='all';
 BANK.categories.forEach((c,i)=>{const opt=el(select,'option',c.name+' ('+c.questions.length+')');opt.value=String(i)});
 const controls=el(main,'div',undefined,'sd888-card');el(controls,'h3','Rozsah testu');const count=el(controls,'select');
 for(const [key,name] of [['20','20 otázek'],['40','40 otázek'],['all','Všechny dostupné otázky vybrané oblasti']]){const opt=el(count,'option',name);opt.value=key}
 const label=el(controls,'label',undefined,'sd892-check');
 const include=el(label,'input');include.type='checkbox';el(label,'span','Zahrnout i zvládnuté otázky (úplná kontrola znalostí)');
 el(controls,'p','Běžný výběr upřednostňuje obtížné a dosud neznámé otázky, zvládnuté vynechává. Při nedostatku otázek může být test kratší.','sd888-muted');
 const actions=el(main,'div',undefined,'sd888-actions');
 button(actions,'Procvičovací test – správnost ihned',()=>startTest(select.value,count.value,'training',include.checked),'sd888-primary');
 button(actions,'Test nanečisto – vyhodnocení na konci',()=>startTest(select.value,count.value,'exam',include.checked));
 adaptiveMenu(main);
 el(main,'p','Procvičování: další otázku otevřeš ručně. Test nanečisto: po výběru se automaticky přejde dál, správnost se ukáže až na konci. Chyby, pomalé odpovědi a ruční označení se ukládají pro tento profil na tomto zařízení.','sd888-muted');
 el(main,'p','Původní ZIP obsahuje otázky a vyznačené správné možnosti, nikoli hotový výklad. U vybraných principů najdeš doplněné vysvětlení, u ostatních alespoň rozbor zadání a správnou odpověď.','sd888-muted');footerHome();
}
function adaptiveMenu(parent){
 const hard=pendingQuestions(),easy=masteredQuestions();
 const box=el(parent,'section',undefined,'sd888-card sd892-menu');
 el(box,'h3','Chytré opakování');
 el(box,'p','Obtížné: '+hard.length+' • Zvládnuté: '+easy.length);
 button(box,'Procvičit obtížné otázky ('+hard.length+')',()=>startWrong(),'sd888-primary').disabled=!hard.length;
 button(box,'Zvládnuté otázky ('+easy.length+')',showMastered,'sd888-secondary');
 el(box,'p','Dlouhé přemýšlení (od 25 sekund, u dlouhých zadání více), chyba nebo označení „Nejsem si jistý“ zařadí otázku k opakování.','sd888-muted');
}
function showMastered(){
 section='mastered';clear();heading('Zvládnuté otázky','Tyto otázky běžný test vynechává. Jednotlivé otázky můžeš vrátit do opakování.');
 const items=masteredQuestions();
 if(!items.length)el(main,'p','Zatím žádné zvládnuté otázky.');
 let shown=0;const list=el(main,'div');
 const more=button(main,'Zobrazit další',()=>load(),'sd888-secondary');
 function load(){
  for(const q of items.slice(shown,shown+40)){
   const card=el(list,'section',undefined,'sd888-card');el(card,'strong',q.q);
   button(card,'Vrátit do opakování',()=>{const s=readStats();s[q.reviewKey]={...s[q.reviewKey],mastered:false,hard:true,manual:true};writeStats(s);card.remove()},'sd888-secondary');
  }
  shown=Math.min(items.length,shown+40);more.hidden=shown>=items.length;
 }
 load();footerHome();
}
function startTest(category,amount,mode,includeMastered=false){
 const pool=allQuestions().filter(q=>category==='all'||q.cat===Number(category));
 const size=amount==='all'?pool.length:Math.min(Number(amount)||20,pool.length);
 const items=includeMastered?shuffle(pool).slice(0,size):prioritized(pool,size);
 if(!items.length){testIndex();el(main,'p','Všechny otázky této oblasti jsou zvládnuté. Zaškrtni zahrnutí zvládnutých otázek pro nový test.','sd888-feedback');return}
 activeTest={name:category==='all'?'Všechny oblasti':BANK.categories[Number(category)].name,mode,items,pos:0,answers:[],started:Date.now()};
 section='test';renderQuestion();
}
/* Zachováno původní znění A/B/C; vysvětlení je oddělená nová učební vrstva. */
function showExplanation(container,q,selected){
 container.replaceChildren();
 el(container,'h3','Proč je tato odpověď správná?');
 el(container,'p','Otázka: '+q.q);
 const original=el(container,'p','Označeno správně v původním ZIPu: '+String.fromCharCode(65+q.correct)+') '+q.a[q.correct]);
 original.className='sd890-source-answer';
 if(Number.isInteger(selected)){
  const your=el(container,'p','Tvoje odpověď: '+String.fromCharCode(65+selected)+') '+q.a[selected]);
  if(selected!==q.correct)your.className='sd890-different-answer';
 }
 const e=window.MartinABCExplanations90?.get(q);
 if(e){
  el(container,'strong',e.topic);
  el(container,'p',e.text);
  const note=el(container,'p',e.kind==='Vysvětlení odborného principu'?'Výklad je učební doplněk k původní otázce, ne doslovný text z archivu.':'Tuto otázku je nutné ještě odborně rozpracovat.');
  note.className='sd888-muted';
 }else{
  el(container,'p','Vysvětlení se nepodařilo načíst. Původní odpověď z archivu zůstává zachovaná.');
 }
 container.hidden=false;
}
function markAnswers(answers,q,selected){
 [...answers.querySelectorAll('button')].forEach((b,i)=>{
  b.disabled=true;
  if(i===q.correct){b.classList.add('sd891-right');b.textContent+=' ✓ Správná odpověď'}
  else if(i===selected){b.classList.add('sd891-wrong');b.textContent+=' ✗ Tvoje chybná odpověď'}
 });
}
function reviewChoices(card,q,selected){
 const rows=el(card,'div',undefined,'sd888-answer-grid');
 q.a.forEach((value,i)=>{
  const row=el(rows,'div',String.fromCharCode(65+i)+') '+value,'sd891-review-choice');
  if(i===q.correct){row.classList.add('sd891-right');row.textContent+=' ✓ Správná odpověď'}
  else if(i===selected){row.classList.add('sd891-wrong');row.textContent+=' ✗ Tvoje chybná odpověď'}
 });
}
function renderQuestion(){
 clear();const t=activeTest;if(!t)return testIndex();if(t.pos>=t.items.length)return complete(false);
 const q=t.items[t.pos];
 heading(modeLabel(t.mode)+' – '+t.name,'Otázka '+(t.pos+1)+' z '+t.items.length+' • '+q.subject);
 const card=el(main,'section',undefined,'sd888-card');el(card,'h3',q.q);
 const feedback=el(card,'p','','sd888-feedback');feedback.hidden=true;feedback.setAttribute('role','status');
 const answers=el(card,'div',undefined,'sd888-answer-grid');
 const explanation=el(card,'div',undefined,'sd888-hint sd889-explanation');explanation.hidden=true;
 const explainBtn=button(card,'Vysvětlit otázku a odpověď',()=>{
  const answered=t.answers.find(a=>a.index===t.pos);
  if(!answered||t.mode==='exam')return;
  if(explanation.hidden)showExplanation(explanation,q,answered.selected);else explanation.hidden=true;
 },'sd888-secondary');explainBtn.hidden=true;
 const pos=t.pos;
 let flag='',answer=null;
 const flags=el(card,'div',undefined,'sd892-flags');
 const status=el(flags,'p','Označení je dobrovolné. Nejdřív vyber, pokud si nejsi jistý, nebo otázku umíš; poté odpověz.','sd888-muted');
 function toggle(value){
  if(activeTest!==t||section!=='test'||t.pos!==pos||(answer&&answer.selected!==q.correct&&value==='easy'))return;
  flag=flag===value?'':value;
  easy.setAttribute('aria-pressed',String(flag==='easy'));hard.setAttribute('aria-pressed',String(flag==='hard'));
  easy.textContent=flag==='easy'?'✓ Lehká – označeno':'Lehká – umím ji';
  hard.textContent=flag==='hard'?'✓ Nejsem si jistý – označeno':'Nejsem si jistý – zopakovat';
  if(answer)reviseFlag(answer,flag);
  status.textContent=flag==='easy'?'Po správné odpovědi se otázka vyřadí z běžného výběru.':flag==='hard'?'Otázka se vrátí k opakování.':'Bez ručního označení rozhodne správnost a čas.';
 }
 const easy=button(flags,'Lehká – umím ji',()=>toggle('easy'),'sd892-easy');
 const hard=button(flags,'Nejsem si jistý – zopakovat',()=>toggle('hard'),'sd892-hard');
 easy.setAttribute('aria-pressed','false');hard.setAttribute('aria-pressed','false');
 // Put flags above answer choices so an exam answer can advance immediately.
 card.insertBefore(flags,answers);
 const advance=()=>{if(activeTest!==t||section!=='test'||!locked||t.pos!==pos)return;t.pos++;renderQuestion()};
 const next=button(card,t.pos===t.items.length-1?'Vyhodnotit':'Další otázka',advance,'sd888-primary');next.hidden=true;
 q.a.forEach((value,i)=>button(answers,String.fromCharCode(65+i)+') '+value,()=>{
  if(locked||activeTest!==t||section!=='test'||t.pos!==pos)return;
  locked=true;
  const seconds=questionClock?.seconds()??0;stopClock();
  answer={q,selected:i,index:t.pos,seconds,flag};t.answers.push(answer);
  const stats=recordAnswer(q,i,seconds,flag);
  if(i!==q.correct){easy.disabled=true;if(flag==='easy'){flag='';answer.flag='';easy.setAttribute('aria-pressed','false');easy.textContent='Lehká – umím ji'}}
  if(t.mode!=='exam')status.textContent=i!==q.correct?'Chybná odpověď bude zopakována.':stats.mastered?'Zvládnuto – otázka bude v běžném výběru vynechána.':stats.hard?'Otázka se vrátí k opakování.':'Odpověď byla správná. Můžeš ještě upravit označení.';
  if(t.mode==='exam'){for(const b of answers.querySelectorAll('button'))b.disabled=true;advance();return}
  markAnswers(answers,q,i);feedback.hidden=false;
  feedback.textContent=i===q.correct?'Správně.':'Nesprávně. Správná odpověď je '+String.fromCharCode(65+q.correct)+') '+q.a[q.correct];
  feedback.className='sd888-feedback '+(i===q.correct?'sd888-correct':'sd888-wrong');
  explainBtn.hidden=false;next.hidden=false;
 },'sd888-answer'));
 button(main,'Ukončit tento pokus',askExit,'sd888-secondary sd889-exit');
 questionClock=makeClock();
}
function saveTest(t,correct){try{if(testing())return;const key=resultsKey();const prev=JSON.parse(localStorage.getItem(key)||'[]');prev.unshift({date:new Date().toISOString(),topic:t.name,mode:t.mode,correct,total:t.answers.length});localStorage.setItem(key,JSON.stringify(prev.slice(0,40)))}catch{}}
function complete(early=false){
 clearTimer();const t=activeTest;if(!t)return testIndex();
 section='results';clear();const score=t.answers.reduce((n,a)=>n+(a.q.correct===a.selected),0);
 heading(early?'Předčasně ukončený test':'Výsledek testu',t.name+' • '+modeLabel(t.mode));
 el(main,'p',score+' z '+t.answers.length+' správně ('+(t.answers.length?Math.round(score/t.answers.length*100):0)+' %).','sd888-score');
 if(!t.saved){saveTest(t,score);t.saved=true}
 const wrong=t.answers.filter(a=>a.q.correct!==a.selected);
 const stats=readStats(),difficult=t.answers.filter(a=>stats[a.q.reviewKey]?.hard),slow=t.answers.filter(a=>a.seconds>=threshold(a.q)),mastered=t.answers.filter(a=>stats[a.q.reviewKey]?.mastered);
 el(main,'p','Obtížné: '+difficult.length+' • Delší přemýšlení: '+slow.length+' • Zvládnuté: '+mastered.length,'sd888-desc');
 if(difficult.length)button(main,'Zopakovat obtížné otázky z tohoto testu ('+difficult.length+')',()=>startWrong(difficult.map(a=>a.q)),'sd888-primary');
 if(wrong.length){
  el(main,'h3','Chybné odpovědi – zopakuj si');
  button(main,'Znovu procvičit chybné otázky ('+wrong.length+')',()=>startWrong(wrong.map(a=>a.q)),'sd888-primary');
  for(const a of wrong){
   const card=el(main,'section',undefined,'sd888-card');
   el(card,'strong',a.q.q);
   reviewChoices(card,a.q,a.selected);
   el(card,'p','Čas odpovědi: '+Math.round(a.seconds)+' s','sd888-muted');
   const explanation=el(card,'div',undefined,'sd888-hint');explanation.hidden=true;
   button(card,'Vysvětlit správnou odpověď',()=>{if(explanation.hidden)showExplanation(explanation,a.q,a.selected);else explanation.hidden=true},'sd888-secondary');
  }
 }else el(main,'p','Všechny zodpovězené otázky byly správně.');
 const correctAnswers=t.answers.filter(a=>a.q.correct===a.selected);
 if(correctAnswers.length){
  const group=el(main,'section',undefined,'sd888-card');
  el(group,'h3','Správné odpovědi – proč platí?');
  el(group,'p','Můžeš si přečíst výklad i u otázek, které jsi zodpověděl správně.');
  const list=el(group,'div',undefined,'sd890-correct-review');
  let shown=0;
  const loadMore=button(group,'Zobrazit další správné odpovědi',()=>{
   const take=Math.min(shown+25,correctAnswers.length);
   for(let i=shown;i<take;i++){
    const a=correctAnswers[i],card=el(list,'section',undefined,'sd888-card');
    el(card,'strong',a.q.q);
    reviewChoices(card,a.q,a.selected);
    el(card,'p','Čas odpovědi: '+Math.round(a.seconds)+' s'+(a.seconds>=threshold(a.q)?' • Delší přemýšlení':''),'sd888-muted');
    const out=el(card,'div',undefined,'sd888-hint sd889-explanation');out.hidden=true;
    button(card,'Vysvětlit odborný princip',()=>{
     if(out.hidden)showExplanation(out,a.q,a.selected);
     else out.hidden=true;
    },'sd888-secondary');
   }
   shown=take;
   if(shown===correctAnswers.length)loadMore.hidden=true;
   else loadMore.textContent='Zobrazit další správné odpovědi ('+(correctAnswers.length-shown)+')';
  },'sd888-secondary');
 }
 const btns=el(main,'div',undefined,'sd888-actions');
 const remaining=pendingQuestions();
 if(remaining.length)button(btns,'Všechny obtížné otázky ('+remaining.length+')',()=>startWrong(),'sd888-primary');
 else if(t.mode==='review')el(main,'p','Všechny uložené obtížné otázky jsou zvládnuté nebo zodpovězené správně bez váhání.');
 button(btns,'Zkusit další test',()=>{activeTest=null;testIndex()},'sd888-primary');
 button(btns,'← Přehled zkoušek',()=>{activeTest=null;home()});
}
function showResults(){section='history';clear();heading('Historie testů','Uložené pouze pro právě přihlášený profil a toto zařízení. V rodičovském náhledu se výsledky nepřenášejí dítěti.');
 let arr=[];try{arr=JSON.parse(localStorage.getItem(resultsKey())||'[]')}catch{}if(!arr.length)el(main,'p','Zatím žádný uložený test.');
 for(const a of arr){const box=el(main,'section',undefined,'sd888-card');el(box,'strong',a.topic);el(box,'p',new Date(a.date).toLocaleString('cs-CZ')+' · '+a.correct+'/'+a.total+' správně · '+modeLabel(a.mode))}footerHome();
}
function mount(){modal=el(document.body,'section',undefined,'sd888-modal');modal.id='sd888ExamCenter';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Příprava na výuční zkoušky');
 const shell=el(modal,'div',undefined,'sd888-shell');const head=el(shell,'header',undefined,'sd888-head');el(head,'strong','Autoelektrikář • výuční zkoušky');button(head,'Zavřít',close,'sd888-close');main=el(shell,'main',undefined,'sd888-main');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
}
function launch(){
 const target=$('#app .shell');if(!target)return;
 // The original screen already has a numbered '2 • Závěrečné zkoušky'.
 // Replace its duplicate actions with one clear entry into the new center.
 const existing=target.querySelector('#sd888Launcher');if(existing)existing.remove();
 const sections=[...target.querySelectorAll('.sd65-section')];
 const oral=sections.find(v=>v.querySelector('.sd65-no')?.textContent.trim()==='2');
 if(!oral)return;
 const actions=oral.querySelector('.sd65-actions');if(!actions)return;
 actions.replaceChildren();
 button(actions,'Otevřít výuku, procvičování a původní testy A/B/C',open,'sd65-action sd888-primary sd889-center-entry');
 const paragraph=oral.querySelector('.sd65-foot');
 if(paragraph)paragraph.textContent='25 ústních okruhů školy a původní testy A/B/C jsou oddělené režimy. Testy ze staršího ZIPu nejsou potvrzeným zadáním závěrečné zkoušky 2027.';
}
function init(){mount();const app=$('#app');if(!app)return;launch();const observer=new MutationObserver(()=>{if(modal.hidden){const a=app.querySelector('.sd65-section .sd889-center-entry');if(!a)launch()}});observer.observe(app,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.MartinExamCenter88={open,close};
})();
