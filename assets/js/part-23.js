/* Školní dobrodružství 50.7.7 – jednotná navigace DOM + browser history.
 * Oprava: Android smí pro návrat na předměty vidět pouze domovskou položku historie.
 * Neuchovává předchozí předmět v historii. Prohlížeč může při samotném tažení
 * zobrazit vlastní animaci (to webová aplikace nemůže spolehlivě řídit). */
(()=>{'use strict';
const NS='sd-navigation-5077', KEY='school-diagnostics-v456', MAX=400;
const $=id=>document.getElementById(id);
const version=()=>window.SDApp?.version||'50.7.7';
function record(type,detail=''){
 try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]');arr.push({time:new Date().toISOString(),type,detail:String(detail).slice(0,400)});if(arr.length>MAX)arr.splice(0,arr.length-MAX);localStorage.setItem(KEY,JSON.stringify(arr));}catch(e){console.warn('Diagnostika',e)}
}
window.schoolDiagnostic=record;
const isVisible=id=>!!$(id)&&!$(id).hidden;
const activeScreen=()=>document.querySelector('.screen.visible')?.id||'homeScreen';
const hub=$('subjectHub'),adv=$('advSubjectMenu'),auth=$('authGate');
let subject='math', applying=false, syncing=false, rebasing=false, lastRoute='';
const authenticated=()=>!auth||auth.classList.contains('off');
function state(){
 if(isVisible('sd55-modal'))return 'merlinHelp';
 if($('v24-avatar-dialog')?.classList.contains('open'))return 'avatarDialog';
 if($('v452-badges')?.classList.contains('open'))return 'badgesDialog';
 if($('skinDialog')?.classList.contains('skin-open'))return 'skinDialog';
 if(isVisible('sdCurriculum'))return 'curriculum';
 if(isVisible('sd52'))return 'schoolPlans';
 if(isVisible('sdCzechHub5074'))return 'czechMenu';
 if($('v496TopicPanel')?.classList.contains('open'))return 'mathTopics';
 if(hub?.classList.contains('open'))return 'subjectMenu('+(hub.dataset.subject||subject)+')';
 if(adv?.classList.contains('on'))return 'subjectMenu('+($('advMenuTitle')?.textContent||subject)+')';
 const current=activeScreen();
 if(current==='vlastScreen'&&((isVisible('map462'))||(isVisible('v46map'))))return 'vlastMap';
 return current;
}
const subjectFor=(route)=>{
 if(/czech/i.test(route)||route==='czechMenu')return 'czech';
 if(/english|Angličtina/.test(route))return 'english';
 if(/math|Matematika/.test(route)||route==='diagScreen'||route==='orderScreen')return 'math';
 return subject;
};
function describe(){
 const route=state();
 if(route==='homeScreen')return {route,subject:'',depth:0};
 if(route==='subjectMenu('+subject+')'||route.startsWith('subjectMenu(')||route==='czechMenu'||route==='vlastScreen')return {route,subject:subjectFor(route),depth:1};
 if(route==='mathTopics')return {route,subject:'math',depth:2};
 if((route==='schoolPlans'||route==='curriculum')&&(subject==='nature'||subject==='history'))return {route,subject,depth:1};
 if(route==='merlinHelp'||route==='avatarDialog'||route==='badgesDialog'||route==='skinDialog')return {route,subject,depth:3};
 return {route,subject:subjectFor(route),depth:2};
}
const entry=(info,type='screen')=>({[NS]:true,route:info.route,subject:info.subject,depth:info.depth,type});
const currentEntry=()=>history.state?.[NS]?history.state:null;
const infoKey=i=>[i.route,i.subject,i.depth].join('|');
function replaceEntry(i,type='screen'){
 try{history.replaceState(entry(i,type),'',location.href)}catch(e){record('history-error','replace: '+e.message)}
}
function pushEntry(i,type='screen'){
 try{history.pushState(entry(i,type),'',location.href)}catch(e){record('history-error','push: '+e.message)}
}
function observeRoute(){
 const i=describe(),k=infoKey(i);
 if(lastRoute!==k){record('navigation',lastRoute+' -> '+k);lastRoute=k;}
}
function closeDialogs(){
 if(isVisible('sd55-modal'))window.SDMerlin56?.close?.();
 if($('v24-avatar-dialog')?.classList.contains('open'))$('v24-avatar-close')?.click();
 $('v452-badges')?.classList.remove('open');
 if($('skinDialog')?.classList.contains('skin-open'))$('skinCancel')?.click();
 window.SDCzechHub5074?.close?.();
 if(isVisible('sd52'))window.SDSchoolPlans52?.close?.();
 if(isVisible('sdCurriculum'))window.SDCurriculum501?.close?.();
}
function showHome(){
 for(const el of document.querySelectorAll('.screen'))el.classList.toggle('visible',el.id==='homeScreen');
 hub?.classList.remove('open');adv?.classList.remove('on');
 $('v496TopicPanel')?.classList.remove('open');
 document.body.style.overflow='';document.body.classList.remove('sd-czech-hub-open');
 window.scrollTo(0,0);
}
function openHub(which){
 showHome();subject=which;
 if(hub){hub.dataset.subject=which;const h=$('hubTitle');if(h)h.textContent=which==='english'?'🇬🇧 Angličtina':'📐 Matematika';hub.classList.add('open')}
 else if(adv){const h=$('advMenuTitle');if(h)h.textContent=which==='english'?'Angličtina':'Matematika';adv.classList.add('on')}
 document.body.style.overflow='hidden';window.scrollTo(0,0);
}
function showSubject(which){
 closeDialogs();showHome();subject=which||subject;
 if(subject==='czech'){window.SDCzechHub5074?.open?.();}
 else if(subject==='math'||subject==='english'){openHub(subject);}
 else if(subject==='nature'||subject==='history'){window.SDSchoolPlans52?.open?.(subject==='nature'?'nature':'geography');}
 else { const b=document.querySelector('#homeScreen [data-open="'+subject+'"]');if(b)b.click(); }
}
function reset(reason){
 applying=true;
 try{closeDialogs();showHome();subject='math';
  const old=currentEntry();
  if(!rebasing && old?.depth>0){
   rebasing=true;history.go(-old.depth);
   record('history','account reset: return to home entry from depth '+old.depth);
  }else if(!rebasing){replaceEntry({route:'homeScreen',subject:'',depth:0},'root')}
  record('navigation-reset',reason+' -> homeScreen')
 }
 finally{queueMicrotask(()=>{applying=false;observeRoute()})}
}
function backOne(source='button'){
 const route=state();
 if(!authenticated()){record('back',source+' | authentication');return 'handled'}
 applying=true;
 try{
 if(route==='merlinHelp')window.SDMerlin56?.close?.();
 else if(route==='avatarDialog')$('v24-avatar-close')?.click();
 else if(route==='badgesDialog')$('v452-badges')?.classList.remove('open');
 else if(route==='skinDialog')$('skinCancel')?.click();
 else if(route==='curriculum')$('sdBack')?.click();
 else if(route==='schoolPlans')$('sd52')?.querySelector('[data-act="back"]')?.click();
 else if(route==='czechMenu'){window.SDCzechHub5074?.close?.();showHome()}
 else if(route==='mathTopics'){showSubject('math')}
 else if(route.startsWith('subjectMenu(')||route==='vlastScreen'){showHome()}
 else if(route==='czechScreen'){showSubject('czech')}
 else if(route==='englishScreen'){showSubject('english')}
 else if(['mathScreen','diagScreen','orderScreen'].includes(route)){showSubject('math')}
 else if(route==='vlastMap'){
  if($('map462'))$('map462').hidden=true;
  if($('v46map'))$('v46map').hidden=true;
  if($('vlUnits'))$('vlUnits').hidden=false;
  if($('vlWork'))$('vlWork').hidden=true;
 }
 else if(route!=='homeScreen'){showHome()}
 else {record('back',source+' | home-confirm');return 'home';}
 record('back',source+' | '+route+' -> '+state());return 'handled';
 }finally{queueMicrotask(()=>{applying=false;observeRoute()})}
}
/* Zapíšeme obě domovské položky PŘED vstupem do předmětu.
 * Android tak při tažení zpět nenarazí na jiné dříve otevřené předměty. */
const HOME={route:'homeScreen',subject:'',depth:0};
replaceEntry(HOME,'base');pushEntry(HOME,'root');
lastRoute=infoKey(describe());record('startup',version()+' '+location.pathname+' | '+lastRoute);

/* Zachycení volby předmětu ještě před vykreslením jeho karty.
 * Jenom tato událost vytváří položku hned; pro ostatní kroky stačí synchronizace DOM. */
document.addEventListener('click',e=>{
 if(applying||!authenticated())return;
 const t=e.target.closest?.('#homeScreen [data-open],#homeScreen .v23-extra.nature,#homeScreen .v23-extra.history,#homeScreen .subject.nature,#homeScreen .subject.history');if(!t)return;
 if(e.target.closest('.v452-badge-btn,.v451-footer,.v44-xp'))return;
 const next=t.dataset.open || (t.classList.contains('nature')?'nature':t.classList.contains('history')?'history':null);
 if(!['math','english','czech','nature','history','music'].includes(next))return;
 const page=describe(),h=currentEntry();subject=next;
 if(page.depth===0){
  if(!h||h.depth!==0)replaceEntry(HOME,'root');
  pushEntry({route:next==='czech'?'czechMenu':next==='math'||next==='english'?'subjectMenu('+next+')':'schoolPlans',subject:next,depth:1},'subject');
  record('history','home -> '+next+' (before render)');
 }else if(h?.[NS]){replaceEntry({...h,subject:next},'subject-switch')}
 // Pokud starší aplikace kliknutí odmítne, vrátíme historii do stavu domů.
 setTimeout(syncFromDom,0);
},true);

/* Jeden synchronizační bod i pro obsluhy jednotlivých předmětů.
 * Zpět tlačítkem a Zpět gestem musí použít TUTOŽ historii. */
function syncFromDom(){
 if(applying||syncing)return;
 const next=describe(),cur=currentEntry();observeRoute();
 if(!cur)return;
 if(infoKey(next)===infoKey(cur))return;
 const delta=next.depth-cur.depth;
 if(delta>0){pushEntry(next,'inner');record('history','push '+infoKey(next))}
 else if(delta===0){replaceEntry(next,'replace');record('history','replace '+infoKey(next))}
 else { // DOM šel zpět přes tlačítko. Posuneme i browser history na rodičovskou úroveň.
  syncing=true;record('history','button back '+cur.depth+' -> '+next.depth);
  try{history.go(delta)}catch(e){syncing=false;record('history-error',e.message)}
  setTimeout(()=>{syncing=false},250);
 }
}
const obs=new MutationObserver(()=>queueMicrotask(syncFromDom));
obs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden','data-subject']});

let popping=false;
window.addEventListener('popstate',e=>{
 if(popping)return;popping=true;applying=true;syncing=false;
 try{
  const wanted=e.state?.[NS]?e.state:null;
  const previous=describe();
  if(rebasing){
   if(wanted?.depth===0){closeDialogs();showHome();replaceEntry(HOME,'root');rebasing=false;record('history','account reset landed at home');}
   else{history.back();}
   return;
  }
  if(!wanted){ // Uživatelské gesto z kořene: neotvírat starý předmět v cache.
   if(confirm('Chceš ukončit Školní dobrodružství?')){
    record('exit','confirmed from home');return;
   }
   showHome();pushEntry(HOME,'root');record('back','home exit cancelled');return;
  }
  subject=wanted.subject||subject;
  if(wanted.depth===0){closeDialogs();showHome()}
  else if(wanted.depth===1){showSubject(subject)}
  else {
   // Vrátíme obsah aplikace o úroveň, ne stránku starého předmětu v historii.
   backOne('android-gesture');
   const actual=describe();
   if(actual.depth!==wanted.depth||actual.subject!==wanted.subject)replaceEntry(actual,'corrected');
  }
  record('back','android-gesture | '+infoKey(previous)+' -> '+infoKey(describe()));
 }catch(err){record('back-error',err.stack||err.message)}
 finally{queueMicrotask(()=>{applying=false;popping=false;observeRoute()})}
});

window.addEventListener('school-account',e=>{
 record('account',e.detail?.id?'login':'lock');
 if(!e.detail?.id)reset('account lock');
});
window.addEventListener('school-resume-login',()=>{
 record('resume-login','profile');reset('resume login');
});
window.addEventListener('error',e=>record('javascript-error',(e.message||'')+' '+(e.filename||'').split('/').pop()+':'+e.lineno));
window.addEventListener('unhandledrejection',e=>record('promise-error',e.reason?.message||String(e.reason)));
window.addEventListener('pagehide',()=>record('pagehide',infoKey(describe())));
window.addEventListener('pageshow',e=>record('pageshow',e.persisted?'bfcache':'normal'));
document.addEventListener('visibilitychange',()=>record(document.hidden?'background':'foreground',infoKey(describe())));
window.SDNavigation=Object.freeze({back:()=>{const h=currentEntry();if(h?.depth>0)history.back();else backOne('button')},home:()=>{const h=currentEntry();if(h?.depth>0)history.go(-h.depth);else reset('home button')},current:state,reset,route:describe});
const admin=$('authAdmin');
if(admin){
 const box=document.createElement('section');box.className='authitem';
 box.innerHTML='<strong>Diagnostika aplikace · '+version()+'</strong><p>Navigace + historie pro Android, bez ukládání PINů.</p><button type="button" id="diag456Export">Exportovat diagnostiku</button> <button type="button" id="diag456Clear">Smazat log</button><p id="diag456Message" aria-live="polite"></p>';
 admin.append(box);
 $('diag456Export').onclick=()=>{record('export','user requested');const rows=JSON.parse(localStorage.getItem(KEY)||'[]');const body=['Školní dobrodružství · diagnostika '+version(),'Export: '+new Date().toISOString(),'User agent: '+navigator.userAgent,'',...rows.map(x=>x.time+' | '+x.type+' | '+x.detail)].join('\n');const blob=new Blob([body],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Skolni_dobrodruzstvi_LOG_'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('diag456Message').textContent='Soubor diagnostiky je připraven.'};
 $('diag456Clear').onclick=()=>{localStorage.removeItem(KEY);record('log-cleared');$('diag456Message').textContent='Diagnostický záznam byl smazán.'};
}
})();