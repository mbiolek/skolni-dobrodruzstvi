/* Školní dobrodružství 50.7.5 – jediný centrální správce návratu.
   Veškeré systémové návraty a hlavní tlačítka používají stejný router.
   Namísto ukládání starých obrazovek v zásobníku odvozujeme aktuální trasu z DOM.
   Tím není možné, aby se uzamčená Čeština stala rodičem Matematice. */
(()=>{'use strict';
const KEY='school-diagnostics-v456',MAX=300;
const $=id=>document.getElementById(id);
const version=()=>window.SDApp?.version||'50.7.6';
function record(type,detail=''){
 try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');a.push({time:new Date().toISOString(),type,detail:String(detail).slice(0,350)});if(a.length>MAX)a.splice(0,a.length-MAX);localStorage.setItem(KEY,JSON.stringify(a))}catch(e){console.warn('Diagnostika:',e)}
}
window.schoolDiagnostic=record;
const shown=id=>{const e=$(id);return !!e&&!e.hidden};
const activeScreen=()=>document.querySelector('.screen.visible')?.id||'homeScreen';
const hub=$('subjectHub'),adv=$('advSubjectMenu'),auth=$('authGate');
const guardKey='sd-navigation-5075';
let handling=false, restoring=false, lastRoute='';
function state(){
 if(shown('sd55-modal'))return 'merlinHelp';
 if($('v24-avatar-dialog')?.classList.contains('open'))return 'avatarDialog';
 if($('v452-badges')?.classList.contains('open'))return 'badgesDialog';
 if($('skinDialog')?.classList.contains('skin-open'))return 'skinDialog';
 if(shown('sdCurriculum'))return 'curriculum';
 if(shown('sd52'))return 'schoolPlans';
 if(shown('sdCzechHub5074'))return 'czechMenu';
 if($('v496TopicPanel')?.classList.contains('open'))return 'mathTopics';
 if(hub?.classList.contains('open'))return 'subjectMenu('+hub.dataset.subject+')';
 if(adv?.classList.contains('on'))return 'subjectMenu('+($('advMenuTitle')?.textContent||'')+')';
 const current=activeScreen();
 if(current==='vlastScreen'&&(($('map462')&&!$('map462').hidden)||($('v46map')&&!$('v46map').hidden)))return 'vlastMap';
 return current;
}
function logRoute(){if(restoring)return;const route=state();if(lastRoute!==route){record('navigation',lastRoute+' -> '+route);lastRoute=route}}
function showHome(){
 document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('visible',e.id==='homeScreen'));
 hub?.classList.remove('open');adv?.classList.remove('on');$('v496TopicPanel')?.classList.remove('open');
 document.body.style.overflow='';window.scrollTo(0,0);
}
function openHub(subject){
 showHome();
 if(hub){hub.dataset.subject=subject;const title=$('hubTitle');if(title)title.textContent=subject==='english'?'🇬🇧 Angličtina':'📐 Matematika';hub.classList.add('open');}
 else if(adv){const title=$('advMenuTitle');if(title)title.textContent=subject==='english'?'Angličtina':'Matematika';adv.classList.add('on')}
 document.body.style.overflow='hidden';window.scrollTo(0,0);
}
function closeDialogs(){
 if(shown('sd55-modal'))window.SDMerlin56?.close?.();
 if($('v24-avatar-dialog')?.classList.contains('open'))$('v24-avatar-close')?.click();
 $('v452-badges')?.classList.remove('open');
 if($('skinDialog')?.classList.contains('skin-open'))$('skinCancel')?.click();
 window.SDCzechHub5074?.close?.();
 if(shown('sd52'))window.SDSchoolPlans52?.close?.();
 if(shown('sdCurriculum'))window.SDCurriculum501?.close?.();
}
function reset(reason){
 restoring=true;
 try{closeDialogs();showHome();record('navigation-reset',reason+' -> homeScreen');lastRoute='homeScreen'}
 finally{queueMicrotask(()=>{restoring=false})}
}
function goBack(source='button'){
 const route=state();
 if(auth&&!auth.classList.contains('off')){record('back',source+' | authentication');return 'handled'}
 if(route==='merlinHelp'){window.SDMerlin56?.close?.();}
 else if(route==='avatarDialog'){$('v24-avatar-close')?.click();}
 else if(route==='badgesDialog'){$('v452-badges')?.classList.remove('open');}
 else if(route==='skinDialog'){$('skinCancel')?.click();}
 else if(route==='curriculum'){$('sdBack')?.click();}
 else if(route==='schoolPlans'){$('sd52')?.querySelector('[data-act="back"]')?.click();}
 else if(route==='czechMenu'){window.SDCzechHub5074?.close?.();showHome();}
 else if(route==='mathTopics'){$('v496TopicBack')?.click();}
 else if(route.startsWith('subjectMenu(')){hub?.classList.remove('open');adv?.classList.remove('on');showHome();}
 else if(route==='czechScreen'){showHome();window.SDCzechHub5074?.open?.();}
 else if(['mathScreen','diagScreen','orderScreen'].includes(route)){openHub('math');}
 else if(route==='englishScreen'){openHub('english');}
 else if(route==='vlastMap'){
  const m=$('map462'),old=$('v46map');if(m)m.hidden=true;if(old)old.hidden=true;
  const u=$('vlUnits'),w=$('vlWork');if(u)u.hidden=false;if(w)w.hidden=true;window.scrollTo(0,0);
 }
 else if(route!=='homeScreen'){showHome();}
 else {
  record('back',source+' | home-confirm');
  if(confirm('Chceš ukončit Školní dobrodružství?')){record('exit','confirmed');return 'exit'}
 }
 record('back',source+' | '+route+' -> '+state());logRoute();return 'handled';
}
function arm(){
 try{history.pushState({[guardKey]:true},'',location.href)}catch(e){record('history-error',e.message)}
}
try{history.scrollRestoration='manual'}catch(e){}
// Only one listener handles Android back. The previous implementation stored
// a stale cross-subject stack, and account reset happened before the screen changed.
arm();
window.addEventListener('popstate',()=>{
 if(handling)return;handling=true;
 let result='handled';
 try{result=goBack('android-gesture')}catch(e){record('back-error',e.stack||e.message)}
 finally{if(result!=='exit')arm();handling=false}
});
const obs=new MutationObserver(logRoute);
function watch(){
 for(const el of document.querySelectorAll('.screen,#subjectHub,#advSubjectMenu,#v496TopicPanel,#sdCzechHub5074,#sdCurriculum,#sd52,#sd55-modal,#v24-avatar-dialog')){
  obs.observe(el,{attributes:true,attributeFilter:['class','hidden']});
 }
}
watch();
window.addEventListener('school-account',e=>{record('account',e.detail?.id?'login':'lock');if(!e.detail?.id)reset('account lock');});
window.addEventListener('school-resume-login',()=>{record('resume-login','profile');reset('resume login')});
window.addEventListener('error',e=>record('javascript-error',(e.message||'')+' '+(e.filename||'').split('/').pop()+':'+e.lineno));
window.addEventListener('unhandledrejection',e=>record('promise-error',e.reason?.message||String(e.reason)));
window.addEventListener('pagehide',()=>record('pagehide',state()));
window.addEventListener('pageshow',e=>record('pageshow',e.persisted?'bfcache':'normal'));
document.addEventListener('visibilitychange',()=>record(document.hidden?'background':'foreground',state()));
record('startup',version()+' '+location.pathname+' | '+state());lastRoute=state();
// Preserve existing diagnostic export and local data; never clear it during update.
const admin=$('authAdmin');
if(admin){
 const box=document.createElement('section');box.className='authitem';
 box.innerHTML='<strong>Diagnostika aplikace · '+version()+'</strong><p>Zaznamenává navigaci a chyby jen na tomto zařízení. PINy se do logu neukládají.</p><button type="button" id="diag456Export">Exportovat diagnostiku</button> <button type="button" id="diag456Clear">Smazat log</button><p id="diag456Message" aria-live="polite"></p>';
 admin.append(box);
 $('diag456Export').onclick=()=>{record('export','user requested');const rows=JSON.parse(localStorage.getItem(KEY)||'[]');const body=['Školní dobrodružství · diagnostika '+version(),'Export: '+new Date().toISOString(),'User agent: '+navigator.userAgent,'',...rows.map(x=>x.time+' | '+x.type+' | '+x.detail)].join('\n');const blob=new Blob([body],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Skolni_dobrodruzstvi_LOG_'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('diag456Message').textContent='Soubor diagnostiky je připraven.'};
 $('diag456Clear').onclick=()=>{localStorage.removeItem(KEY);record('log-cleared');$('diag456Message').textContent='Diagnostický záznam byl smazán.'};
}
window.SDNavigation=Object.freeze({back:goBack,home:()=>{reset('home button');logRoute()},current:state,reset});
})();
