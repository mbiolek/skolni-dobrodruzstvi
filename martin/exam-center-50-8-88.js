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
let modal, main, section='home', activeTest=null, locked=false, timer=null;
function clearTimer(){if(timer){clearInterval(timer);timer=null}}
function clear(){clearTimer();main.replaceChildren();main.scrollTop=0;locked=false}
function heading(title,desc){el(main,'h2',title);if(desc)el(main,'p',desc,'sd888-desc')}
function footerHome(){button(main,'← Přehled zkoušek',home,'sd888-back')}
function open(){if(!modal){mount()}modal.hidden=false;document.body.classList.add('sd888-open');home()}
function close(){clearTimer();if(modal)modal.hidden=true;document.body.classList.remove('sd888-open')}
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
 el(main,'p','U zdrojových otázek nepřidávám domyšlené odpovědi ani vysvětlení. Po vyhodnocení uvidíš správnou variantu podle souboru.','sd888-muted');footerHome();
}
function startTest(category,amount,mode){let pool=category==='all'?BANK.categories.flatMap((c,i)=>c.questions.map(q=>({...q,subject:c.name,cat:i}))):BANK.categories[Number(category)]?.questions.map(q=>({...q,subject:BANK.categories[Number(category)].name,cat:Number(category)}));
 if(!pool?.length){testIndex();return}const size=amount==='all'?pool.length:Math.min(Number(amount)||20,pool.length);
 activeTest={name:category==='all'?'Všechny oblasti':BANK.categories[Number(category)].name,mode,items:shuffle(pool).slice(0,size),pos:0,answers:[],started:Date.now()};
 section='test';renderQuestion();
}
function renderQuestion(){clear();const t=activeTest;if(!t)return testIndex();if(t.pos>=t.items.length)return complete();
 const q=t.items[t.pos];heading((t.mode==='exam'?'Test nanečisto':'Procvičovací test')+' – '+t.name,'Otázka '+(t.pos+1)+' z '+t.items.length+' • '+q.subject);
 const card=el(main,'section',undefined,'sd888-card');el(card,'h3',q.q);const feedback=el(card,'p','','sd888-feedback');feedback.hidden=true;
 const answers=el(card,'div',undefined,'sd888-answer-grid');const next=button(card,t.pos===t.items.length-1?'Vyhodnotit':'Další otázka',()=>{t.pos++;renderQuestion()},'sd888-primary');next.hidden=true;
 q.a.forEach((text,i)=>{const b=button(answers,String.fromCharCode(65+i)+') '+text,()=>{
  if(locked)return;locked=true;t.answers.push({q,selected:i});
  for(const x of answers.querySelectorAll('button'))x.disabled=true;
  if(t.mode==='training'){feedback.hidden=false;feedback.textContent=i===q.correct?'Správně.':'Nesprávně. Podle původního testu je správně '+String.fromCharCode(65+q.correct)+') '+q.a[q.correct];feedback.className='sd888-feedback '+(i===q.correct?'sd888-correct':'sd888-wrong')}
  next.hidden=false;
  if(t.mode==='training'&&i===q.correct){timer=setTimeout(()=>{t.pos++;renderQuestion()},1200)}
 },'sd888-answer')});
 button(main,'Ukončit tento pokus',()=>{if(confirm('Ukončit test a zobrazit dosavadní výsledky?'))complete()},'sd888-secondary');
}
function saveTest(t,correct){try{if(testing())return;const key=resultsKey();const prev=JSON.parse(localStorage.getItem(key)||'[]');prev.unshift({date:new Date().toISOString(),topic:t.name,mode:t.mode,correct,total:t.answers.length});localStorage.setItem(key,JSON.stringify(prev.slice(0,40)))}catch{}}
function complete(){clearTimer();const t=activeTest;if(!t)return testIndex();section='results';clear();const score=t.answers.reduce((n,a)=>n+(a.q.correct===a.selected),0);
 heading('Výsledek testu',t.name+' • '+(t.mode==='exam'?'Test nanečisto':'Procvičovací režim'));
 el(main,'p',score+' z '+t.answers.length+' správně ('+(t.answers.length?Math.round(score/t.answers.length*100):0)+' %).','sd888-score');
 saveTest(t,score);
 const wrong=t.answers.filter(a=>a.q.correct!==a.selected);if(wrong.length){el(main,'h3','Chybné odpovědi – zopakuj si');for(const a of wrong){const card=el(main,'section',undefined,'sd888-card');el(card,'strong',a.q.q);el(card,'p','Tvoje volba: '+String.fromCharCode(65+a.selected)+') '+a.q.a[a.selected]);el(card,'p','Správná volba podle archivu: '+String.fromCharCode(65+a.q.correct)+') '+a.q.a[a.q.correct])}}else el(main,'p','Všechny zodpovězené otázky byly správně.');
 const btns=el(main,'div',undefined,'sd888-actions');button(btns,'Zkusit další test',testIndex,'sd888-primary');button(btns,'← Přehled zkoušek',home);
}
function showResults(){section='history';clear();heading('Historie testů','Uložené pouze pro právě přihlášený profil a toto zařízení. V rodičovském náhledu se výsledky nepřenášejí dítěti.');
 let arr=[];try{arr=JSON.parse(localStorage.getItem(resultsKey())||'[]')}catch{}if(!arr.length)el(main,'p','Zatím žádný uložený test.');
 for(const a of arr){const box=el(main,'section',undefined,'sd888-card');el(box,'strong',a.topic);el(box,'p',new Date(a.date).toLocaleString('cs-CZ')+' · '+a.correct+'/'+a.total+' správně · '+(a.mode==='exam'?'test nanečisto':'procvičování'))}footerHome();
}
function mount(){modal=el(document.body,'section',undefined,'sd888-modal');modal.id='sd888ExamCenter';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Příprava na výuční zkoušky');
 const shell=el(modal,'div',undefined,'sd888-shell');const head=el(shell,'header',undefined,'sd888-head');el(head,'strong','Autoelektrikář • výuční zkoušky');button(head,'Zavřít',close,'sd888-close');main=el(shell,'main',undefined,'sd888-main');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
}
function launch(){const target=$('#app .shell');if(!target||$('#sd888Launcher'))return;
 // Home and oral screens are rebuilt by martin.js. Re-add the launcher after each render.
 const block=document.createElement('section');block.id='sd888Launcher';block.className='sd888-launcher';const h=el(block,'h2','Výuční zkoušky – přehledně');el(block,'p','Výuka 25 ústních okruhů • samostatné procvičování • originální testy A/B/C ze zaslaného ZIPu.');button(block,'Otevřít přípravu na výuční zkoušky',open,'sd888-primary');
 const first=target.querySelector('.sd65-head');if(first)first.insertAdjacentElement('afterend',block);else target.prepend(block);
}
function init(){mount();const app=$('#app');if(!app)return;launch();const observer=new MutationObserver(()=>{if(modal.hidden&&!$('#sd888Launcher'))launch()});observer.observe(app,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.MartinExamCenter88={open,close};
})();
