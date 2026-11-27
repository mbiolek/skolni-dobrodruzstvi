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
let modal, main, section='home', activeTest=null, locked=false, timer=null,historyGuard=false;
function clearTimer(){if(timer){clearInterval(timer);timer=null}}
function clear(){clearTimer();main.replaceChildren();main.scrollTop=0;locked=false}
function heading(title,desc){if(section!=='home'){const nav=el(main,'div',undefined,'sd889-nav');button(nav,'← Zpět',back,'sd888-back')}el(main,'h2',title);if(desc)el(main,'p',desc,'sd888-desc')}
function footerHome(){button(main,'← Přehled zkoušek',home,'sd888-back')}
function armBack(){history.pushState({...history.state,sd888Exam:true},'',location.href);historyGuard=true}
function open(){if(!modal)mount();if(modal.hidden){modal.hidden=false;document.body.classList.add('sd888-open');home();armBack()}}
function closeDirect(){clearTimer();activeTest=null;if(modal)modal.hidden=true;document.body.classList.remove('sd888-open')}
function close(){if(!modal||modal.hidden)return;closeDirect();if(historyGuard){historyGuard=false;history.back()}}
function askExit(){
 if(!activeTest){testIndex();return}
 // Browser confirm() may be suppressed inside the isolated parent test iframe.
 // A real in-page prompt always allows the user to complete the action.
 const existing=main.querySelector('#sd889ExitConfirm');if(existing){existing.remove();return}
 const box=el(main,'section',undefined,'sd888-card sd889-exit-confirm');box.id='sd889ExitConfirm';
 box.setAttribute('role','group');box.setAttribute('aria-label','Ukončení testu');
 el(box,'h3','Ukončit tento pokus?');
 el(box,'p','Dosavadní odpovědi můžeš vyhodnotit, nebo se vrátit k otázce.');
 const choices=el(box,'div',undefined,'sd888-actions');
 button(choices,'Ano, ukončit a vyhodnotit',()=>{if(!activeTest?.answers.length){activeTest=null;testIndex()}else complete(true)},'sd888-primary');
 button(choices,'Pokračovat v testu',()=>box.remove(),'sd888-secondary');
 box.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function back(){
 if(section==='test'){askExit();return}
 if(section==='results'){activeTest=null;testIndex();return}
 if(section==='learn-detail'){learnIndex();return}
 if(section==='practice-detail'){practiceIndex();return}
 if(section==='learn'||section==='practice'||section==='test-index'||section==='history'){home();return}
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
 for(const [key,name] of [['20','20 náhodných otázek'],['40','40 náhodných otázek'],['all','Všechny otázky vybrané oblasti']]){const opt=el(count,'option',name);opt.value=key}
 const actions=el(main,'div',undefined,'sd888-actions');
 button(actions,'Procvičovací test – správnost ihned',()=>startTest(select.value,count.value,'training'),'sd888-primary');
 button(actions,'Test nanečisto – vyhodnocení na konci',()=>startTest(select.value,count.value,'exam'));
 el(main,'p','Původní ZIP obsahuje otázky a vyznačené správné možnosti, nikoli hotový výklad. U vybraných principů najdeš doplněné vysvětlení, u ostatních alespoň rozbor zadání a správnou odpověď.','sd888-muted');footerHome();
}
function startTest(category,amount,mode){let pool=category==='all'?BANK.categories.flatMap((c,i)=>c.questions.map(q=>({...q,subject:c.name,cat:i}))):BANK.categories[Number(category)]?.questions.map(q=>({...q,subject:BANK.categories[Number(category)].name,cat:Number(category)}));
 if(!pool?.length){testIndex();return}const size=amount==='all'?pool.length:Math.min(Number(amount)||20,pool.length);
 activeTest={name:category==='all'?'Všechny oblasti':BANK.categories[Number(category)].name,mode,items:shuffle(pool).slice(0,size),pos:0,answers:[],started:Date.now()};
 section='test';renderQuestion();
}
/* Vysvětlení rozlišuje údaje z originálního ZIPu a nově doplněné studijní komentáře. */
function explain(q){
 const question=String(q.q||'');const answer=String(q.a?.[q.correct]||'');
 const norm=(question+' '+answer).toLocaleLowerCase('cs-CZ');
 const patterns=[
  [/ohmov|i\s*=\s*u\s*\/\s*r|výpočet odporu|napětí na rezistoru/i,'Ohmův zákon spojuje napětí U, proud I a odpor R. Platí U = R × I, tedy I = U / R a R = U / I. Vždy kontroluj jednotky: volt, ampér a ohm.'],
  [/rezistor.*séri|odpory.*séri|zapojen.*séri|séri.*odpor/i,'Při sériovém zapojení prochází součástkami stejný proud a odpory se sčítají: R = R1 + R2 + …. Například 5 Ω + 5 Ω = 10 Ω.'],
  [/rezistor.*paralel|odpory.*paralel|paraleln.*odpor/i,'U paralelních odporů je na větvích stejné napětí. Platí 1/R = 1/R1 + 1/R2; pro dva stejné odpory je výsledný odpor poloviční.'],
  [/účinnost/i,'Účinnost je poměr užitečného výkonu a příkonu: η = Pužitečný / Ppříkon. Při vyjádření v procentech násobíme 100. Nemůže přesáhnout 100 %, protože existují ztráty.'],
  [/magnetick.*pole|průchodu.*proudu.*vodič/i,'Elektrický proud ve vodiči vytváří kolem vodiče magnetické pole. Směr magnetického pole souvisí se směrem proudu.'],
  [/reaktanc.*cívk|střídav.*napětí na cívce/i,'Ideální cívka má indukční reaktanci XL = 2πfL. S rostoucí frekvencí reaktance roste; u ideální cívky napětí předbíhá proud o 90°.'],
  [/bateri.*séri|články.*séri/i,'Při sériovém spojení článků se sčítají jejich napětí i vnitřní odpory. Výsledný odpor tedy není průměr jednotlivých odporů.'],
  [/wolfram|žárovk.*vlákn/i,'Kovové vlákno běžné žárovky se vyrábí z wolframu, protože má velmi vysokou teplotu tání a může žhnout bez roztavení.'],
  [/voltmetr.*vnitřním odpor/i,'Voltmetr se připojuje paralelně k měřenému prvku. Vysoký vnitřní odpor odebírá menší proud a méně ovlivňuje měřený obvod.'],
  [/teplot.*odpor.*kov|odpor kovov.*teplot/i,'U běžných kovových vodičů odpor s rostoucí teplotou obvykle roste; zvýšené kmitání krystalové mřížky znesnadňuje pohyb elektronů.']
 ];
 const hit=patterns.find(([re])=>re.test(norm));
 return hit?{kind:'Doplněné odborné vysvětlení (není součástí ZIPu)',text:hit[1]}:{kind:'Rozbor podle původního testu',text:'Úkolem je rozpoznat, která z nabízených možností odpovídá zadání. Zdrojový archiv uvádí správnou variantu, ale neobsahuje zdůvodnění. Podrobný odborný výklad této konkrétní otázky zatím není doplněn.'};
}
function showExplanation(container,q,selected){
 container.replaceChildren();
 const h=el(container,'h3','Vysvětlení otázky a odpovědi');
 el(container,'p','Otázka: '+q.q);
 el(container,'p','Správně podle původního ZIPu: '+String.fromCharCode(65+q.correct)+') '+q.a[q.correct]);
 if(Number.isInteger(selected))el(container,'p','Tvoje odpověď: '+String.fromCharCode(65+selected)+') '+q.a[selected]);
 const e=explain(q);el(container,'strong',e.kind);el(container,'p',e.text);
 container.hidden=false;
}
function renderQuestion(){
 clear();const t=activeTest;if(!t)return testIndex();if(t.pos>=t.items.length)return complete(false);
 const q=t.items[t.pos];
 heading((t.mode==='exam'?'Test nanečisto':'Procvičovací test')+' – '+t.name,'Otázka '+(t.pos+1)+' z '+t.items.length+' • '+q.subject);
 const card=el(main,'section',undefined,'sd888-card');
 el(card,'h3',q.q);
 const feedback=el(card,'p','','sd888-feedback');feedback.hidden=true;
 const answers=el(card,'div',undefined,'sd888-answer-grid');
 const explanation=el(card,'div',undefined,'sd888-hint sd889-explanation');explanation.hidden=true;
 const explainBtn=button(card,'Vysvětlit otázku a odpověď',()=>{
  const answered=t.answers.find(a=>a.index===t.pos);
  if(t.mode==='exam'&&!answered){
   feedback.hidden=false;feedback.textContent='V testu nanečisto se správná odpověď ukáže až při závěrečném vyhodnocení.';
   return;
  }
  showExplanation(explanation,q,answered?.selected);
 },'sd888-secondary');
 explainBtn.hidden=t.mode==='exam';
 const next=button(card,t.pos===t.items.length-1?'Vyhodnotit':'Další otázka',()=>{t.pos++;renderQuestion()},'sd888-primary');
 next.hidden=true;
 q.a.forEach((value,i)=>button(answers,String.fromCharCode(65+i)+') '+value,()=>{
  if(locked)return;locked=true;t.answers.push({q,selected:i,index:t.pos});
  for(const x of answers.querySelectorAll('button'))x.disabled=true;
  if(t.mode==='training'){
   feedback.hidden=false;
   feedback.textContent=i===q.correct?'Správně.':'Nesprávně. Podle původního testu je správně '+String.fromCharCode(65+q.correct)+') '+q.a[q.correct];
   feedback.className='sd888-feedback '+(i===q.correct?'sd888-correct':'sd888-wrong');
   explainBtn.hidden=false;
  }
  next.hidden=false;
  // Allow enough time to read the answer; a manual next button is always available.
  // No automatic skipping when explanation is requested.
  if(t.mode==='training'&&i===q.correct){
   timer=setTimeout(()=>{if(explanation.hidden&&activeTest===t&&t.pos<t.items.length){t.pos++;renderQuestion()}},2500);
  }
 },'sd888-answer'));
 button(main,'Ukončit tento pokus',askExit,'sd888-secondary sd889-exit');
}
function saveTest(t,correct){try{if(testing())return;const key=resultsKey();const prev=JSON.parse(localStorage.getItem(key)||'[]');prev.unshift({date:new Date().toISOString(),topic:t.name,mode:t.mode,correct,total:t.answers.length});localStorage.setItem(key,JSON.stringify(prev.slice(0,40)))}catch{}}
function complete(early=false){
 clearTimer();const t=activeTest;if(!t)return testIndex();
 section='results';clear();const score=t.answers.reduce((n,a)=>n+(a.q.correct===a.selected),0);
 heading(early?'Předčasně ukončený test':'Výsledek testu',t.name+' • '+(t.mode==='exam'?'Test nanečisto':'Procvičovací režim'));
 el(main,'p',score+' z '+t.answers.length+' správně ('+(t.answers.length?Math.round(score/t.answers.length*100):0)+' %).','sd888-score');
 if(!t.saved){saveTest(t,score);t.saved=true}
 const wrong=t.answers.filter(a=>a.q.correct!==a.selected);
 if(wrong.length){
  el(main,'h3','Chybné odpovědi – zopakuj si');
  for(const a of wrong){
   const card=el(main,'section',undefined,'sd888-card');
   el(card,'strong',a.q.q);
   el(card,'p','Tvoje volba: '+String.fromCharCode(65+a.selected)+') '+a.q.a[a.selected]);
   const explanation=el(card,'div',undefined,'sd888-hint');explanation.hidden=true;
   button(card,'Vysvětlit správnou odpověď',()=>{if(explanation.hidden)showExplanation(explanation,a.q,a.selected);else explanation.hidden=true},'sd888-secondary');
  }
 }else el(main,'p','Všechny zodpovězené otázky byly správně.');
 const btns=el(main,'div',undefined,'sd888-actions');
 button(btns,'Zkusit další test',()=>{activeTest=null;testIndex()},'sd888-primary');
 button(btns,'← Přehled zkoušek',()=>{activeTest=null;home()});
}
function showResults(){section='history';clear();heading('Historie testů','Uložené pouze pro právě přihlášený profil a toto zařízení. V rodičovském náhledu se výsledky nepřenášejí dítěti.');
 let arr=[];try{arr=JSON.parse(localStorage.getItem(resultsKey())||'[]')}catch{}if(!arr.length)el(main,'p','Zatím žádný uložený test.');
 for(const a of arr){const box=el(main,'section',undefined,'sd888-card');el(box,'strong',a.topic);el(box,'p',new Date(a.date).toLocaleString('cs-CZ')+' · '+a.correct+'/'+a.total+' správně · '+(a.mode==='exam'?'test nanečisto':'procvičování'))}footerHome();
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
 button(actions,'Otevřít výuku, procvičování a původní testy A/B/C',open,'sd888-primary sd889-center-entry');
 const paragraph=oral.querySelector('.sd65-foot');
 if(paragraph)paragraph.textContent='25 ústních okruhů školy a původní testy A/B/C jsou oddělené režimy. Testy ze staršího ZIPu nejsou potvrzeným zadáním závěrečné zkoušky 2027.';
}
function init(){mount();const app=$('#app');if(!app)return;launch();const observer=new MutationObserver(()=>{if(modal.hidden){const a=app.querySelector('.sd65-section .sd889-center-entry');if(!a)launch()}});observer.observe(app,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.MartinExamCenter88={open,close};
})();
