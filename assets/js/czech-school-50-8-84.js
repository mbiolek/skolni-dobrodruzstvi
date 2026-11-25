/* Školní dobrodružství 50.8.84 – český jazyk Olomouc, předpony.
   Nové původní otázky podle doloženého tématu školní písemky, ne opis písemky. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const DATA=[
 {word:'seskočit',stem:'__skočit z lavičky',why:'Seskočit znamená pohyb shora dolů. Používá se předpona se-.'},
 {word:'sejít',stem:'__jít ze schodů',why:'Sejít ze schodů je pohyb shora dolů, proto se-.'},
 {word:'sjet',stem:'__jet z kopce',why:'Sjet z kopce vyjadřuje pohyb shora dolů, proto s-.'},
 {word:'snášet',stem:'__nášet věci z půdy',why:'Snášet věci dolů, proto s-.'},
 {word:'shromáždit',stem:'__hromáždit pomůcky',why:'Shromáždit znamená dát věci dohromady, proto s-.'},
 {word:'spojit',stem:'__pojit dvě části',why:'Spojit znamená dát dohromady, proto s-.'},
 {word:'sjednotit',stem:'__jednotit pravidla',why:'Sjednotit znamená spojit v jeden celek, proto s-.'},
 {word:'zmenšit',stem:'__menšit obrázek',why:'Zmenšit znamená změnit velikost na menší, proto z-.'},
 {word:'zčervenat',stem:'__červenat studem',why:'Zčervenat znamená změnit barvu či stav, proto z-.'},
 {word:'zesílit',stem:'__sílit zvuk',why:'Zesílit znamená zvýšit intenzitu, změnit stav, proto ze-.'},
 {word:'zblednout',stem:'__blednout strachem',why:'Zblednout vyjadřuje změnu stavu, proto z-.'},
 {word:'zbourat',stem:'__bourat starou zeď',why:'Zbourat znamená změnit stav stavby odstraněním, proto z-.'},
 {word:'zkrátit',stem:'__krátit příběh',why:'Zkrátit znamená změnit délku na kratší, proto z-.'},
 {word:'vzlétnout',stem:'__létnout do vzduchu',why:'Vzlétnout vyjadřuje pohyb vzhůru, proto vz-.'},
 {word:'vznést',stem:'__nést se nad krajinou',why:'Vznést se vyjadřuje pohyb vzhůru, proto vz-.'},
 {word:'vzpřímit',stem:'__přímit záda',why:'Vzpřímit znamená narovnat do vzpřímené polohy, proto vz-.'},
 {word:'vztyčit',stem:'__tyčit vlajku',why:'Vztyčit znamená postavit svisle vzhůru, proto vz-.'},
 {word:'vzejít',stem:'__jít ze semínka',why:'Vzejít znamená vyrůst, objevit se nad povrchem, proto vze-.'}
];
const PREFIXES=['s','se','z','ze','vz','vze'];
const PREFIX_OF=word=>PREFIXES.slice().sort((a,b)=>b.length-a.length).find(prefix=>word.startsWith(prefix))||'';
DATA.forEach(row=>{row.prefix=PREFIX_OF(row.word);if(!row.prefix)throw Error('Neznámá předpona '+row.word)});
const info=[
 ['s-, se-','Často směr shora dolů nebo dohromady','sjet z kopce, seskočit z lavičky, spojit, shromáždit'],
 ['z-, ze-','Často změna stavu nebo výsledku děje','zmenšit obrázek, zčervenat, zesílit'],
 ['vz-, vze-','Často pohyb vzhůru nebo vznik','vzlétnout, vznést se, vztyčit, vzejít']
];
const el=(host,tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;host.append(n);return n};
const button=(host,text,fn,cls)=>{const b=el(host,'button',text,'sd884-btn '+(cls||''));b.type='button';b.onclick=fn;return b};
const shuffle=arr=>{const x=arr.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const norm=s=>String(s||'').trim().toLocaleLowerCase('cs-CZ').normalize('NFC');
const profile=()=>sessionStorage.getItem('skolni-live-v441')||localStorage.getItem('matematika-karticky-progress-v3-active')||'';
let host=null,main=null,mode='',current=[],position=0,correct=0,locked=false,timer=null;
function clearTimer(){if(timer!==null){clearTimeout(timer);timer=null}}
function header(title){main.replaceChildren();el(main,'h3',title);el(main,'p','Původní cvičení k tématu školního diktátu z českého jazyka, Olomouc – 5. ročník.','sd884-small')}
function showLesson(){
 clearTimer();mode='lesson';header('Výuka – předpony s-, z-, vz-');
 el(main,'p','Nejdřív pochop význam slova a teprve potom vyber správnou předponu. U některých slov je potřeba pravopis zapamatovat.');
 for(const [prefix,meaning,examples] of info){
  const section=el(main,'section',undefined,'sd884-rule');
  el(section,'h4',prefix);el(section,'p',meaning);el(section,'p','Příklady: '+examples);
 }
 el(main,'h4','Na co si dát pozor');
 el(main,'p','Podoby se-, ze-, vze- jsou rozšířené varianty předpon. Není správné doplňovat je mechanicky do každého slova.');
 el(main,'p','Pravopis některých slov je ustálený. Když si nejsi jistý, ověř konkrétní slovo ve slovníku a všímej si jeho významu.');
 const grid=el(main,'div',undefined,'sd884-actions');
 button(grid,'Procvičovat',()=>start('practice'),'sd884-primary');
 button(grid,'Diktát',()=>start('dictation'));
 button(grid,'Test (15 otázek)',()=>start('test'));
}
function record(which,score,total){
 if(window.__SD878Preview)return; // Rodič v testovacím režimu skutečné výsledky nemění.
 const pid=profile();if(!pid)return;
 try{
  const key='sd884_czech_prefix_scores_'+pid;
  const data=JSON.parse(localStorage.getItem(key)||'[]');
  data.unshift({kind:which,correct:score,total,date:new Date().toISOString()});
  localStorage.setItem(key,JSON.stringify(data.slice(0,25)));
 }catch{}
}
function start(which){
 clearTimer();mode=which;position=0;correct=0;locked=false;
 current=shuffle(DATA).slice(0,which==='test'?15:DATA.length);
 next();
}
function options(row){
 const possible=PREFIXES.filter(p=>p!==row.prefix);
 const decoys=shuffle(possible).slice(0,3);
 return shuffle([row.prefix,...decoys]);
}
function finish(){
 header('Hotovo – '+(mode==='dictation'?'diktát':mode==='test'?'test':'procvičování'));
 el(main,'p','Správně '+correct+' z '+current.length+' odpovědí ('+Math.round(correct/current.length*100)+' %).','sd884-result');
 el(main,'p','Zkus chyby znovu a porovnávej význam předpon. V rodičovském testovacím režimu se výsledky neukládají.');
 record(mode,correct,current.length);
 const actions=el(main,'div',undefined,'sd884-actions');
 button(actions,'Zkusit znovu',()=>start(mode),'sd884-primary');
 button(actions,'Zpět na výuku',showLesson);
}
function next(){
 clearTimer();locked=false;
 if(position>=current.length){finish();return}
 const row=current[position],which=mode;
 header(which==='dictation'?'Diktát – doplň celé slovo':which==='test'?'Test nanečisto':'Procvičování');
 el(main,'p',(position+1)+' / '+current.length+' · Správně '+correct,'sd884-progress');
 el(main,'h4',row.stem,'sd884-prompt');
 const feedback=el(main,'p','','sd884-feedback');
 const actions=el(main,'div',undefined,'sd884-choices');
 const nextBtn=button(main,'Další otázka',()=>{position++;next()},'sd884-next');
 nextBtn.hidden=true;
 function answer(value){
  if(locked)return;
  locked=true;const ok=norm(value)===norm(which==='dictation'?row.word:row.prefix);
  if(ok)correct++;
  feedback.textContent=(ok?'Správně. ':'Správně je „'+row.word+'“ (předpona '+row.prefix+'-). ')+row.why;
  feedback.classList.toggle('sd884-correct',ok);
  feedback.classList.toggle('sd884-wrong',!ok);
  for(const b of actions.querySelectorAll('button'))b.disabled=true;
  nextBtn.hidden=false;
  nextBtn.textContent=position===current.length-1?'Zobrazit výsledky':'Další otázka';
  if(ok){timer=setTimeout(()=>{position++;next()},1100)}
 }
 if(which==='dictation'){
  el(main,'p','Napiš celé slovo, například „seskočit“.','sd884-small');
  const field=el(actions,'input');field.type='text';field.autocomplete='off';field.autocapitalize='none';field.spellcheck=false;field.setAttribute('aria-label','Doplň celé slovo');field.placeholder='Doplň celé slovo';
  button(actions,'Ověřit',()=>answer(field.value),'sd884-primary');
  field.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();answer(field.value)}});
 }else{
  for(const prefix of options(row)){button(actions,prefix+'-',()=>answer(prefix))}
 }
}
function choose(which){if(!host)return;host.hidden=false;mode=which;
 document.body.classList.add('sd884-czech-open');
 if(which==='lesson')showLesson();else start(which);
 window.schoolDiagnostic?.('school-czech-prefix','open '+which);
 try{host.scrollIntoView({block:'start'})}catch{}
}
function close(){clearTimer();if(host)host.hidden=true;document.body.classList.remove('sd884-czech-open')}
function isOlomouc(){return window.SDOlomoucEntry844?.isOlomouc?.()===true}
function addEntry(){
 const hub=$('sdCzechHub5074');if(!hub)return;
 const grid=hub.querySelector('.sd-czech-cards');if(!grid||$('sd884CzechEntry'))return;
 const b=button(grid,'Školní písemky – předpony s-, z-, vz-',()=>choose('lesson'),'sd884-entry');
 b.id='sd884CzechEntry';
 const hint=el(b,'small','Výuka · Procvičování · Diktát · Test');
 hint.setAttribute('aria-hidden','true');
 const update=()=>{b.hidden=!isOlomouc()};
 update();
 window.addEventListener('school-account',update);
 document.addEventListener('sd827-school-change',update);
 document.addEventListener('sd-route-change',update);
 window.addEventListener('pageshow',update);
 hub.addEventListener('click',update,true);
}
function boot(){
 if($('sd884CzechLessons'))return;
 host=document.createElement('section');host.id='sd884CzechLessons';host.hidden=true;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label','Čeština – předpony');
 const shell=el(host,'div',undefined,'sd884-shell');
 const controls=el(shell,'header',undefined,'sd884-head');
 button(controls,'← Čeština',close,'sd884-back');
 el(controls,'strong','Olomouc · 5. třída');
 const nav=el(shell,'nav',undefined,'sd884-nav');
 for(const [key,text] of [['lesson','Výuka'],['practice','Procvičování'],['dictation','Diktát'],['test','Test']]){
  button(nav,text,()=>choose(key));
 }
 main=el(shell,'main',undefined,'sd884-content');
 document.body.append(host);
 addEntry();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!host.hidden)close()});
}
window.SDCzechSchool884={open:choose,close,isOlomouc};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();