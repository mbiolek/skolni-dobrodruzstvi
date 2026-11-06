
(()=>{'use strict';
const LOG='school-diagnostics-v456',MAX=300,VERSION='50.0.1';
function record(type,detail=''){
 try{const arr=JSON.parse(localStorage.getItem(LOG)||'[]');arr.push({time:new Date().toISOString(),type,detail:String(detail).slice(0,350)});if(arr.length>MAX)arr.splice(0,arr.length-MAX);localStorage.setItem(LOG,JSON.stringify(arr))}catch(e){console.warn('Diagnostika:',e)}
}
window.schoolDiagnostic=record;
const $=id=>document.getElementById(id);
const menu=$('advSubjectMenu'),gate=$('authGate');
const current=()=>menu?.classList.contains('on')?'subjectMenu':document.querySelector('.screen.visible')?.id||'homeScreen';
const activePanel=()=>{
 const ids=['map462','v46map','longLesson','game','summary','enGame','enSummary','diagGame','diagResults','orderGame','orderSummary'];
 const root=document.querySelector('.screen.visible');
 return ids.find(id=>{const e=$(id);return e&&root?.contains(e)&&!e.hidden&&!e.classList.contains('hidden')})||'';
};
const state=()=>({screen:document.getElementById('subjectHub')?.classList.contains('open')?'subjectMenu':current(),panel:activePanel(),subject:menu?.classList.contains('on')?($('advMenuTitle')?.textContent||''):document.getElementById('subjectHub')?.classList.contains('open')?($('hubTitle')?.textContent||''):''});
const same=(a,b)=>a.screen===b.screen&&a.panel===b.panel&&a.subject===b.subject;
let stack=[state()],restoring=false,pending=false;
let activeLearningMode=null;
// Keep the parent subject menu for Android Back even when mode opening
// closes the overlay and changes the screen within one event turn.
document.querySelectorAll('#advSubjectMenu [data-adv-mode]').forEach(button=>{
 button.addEventListener('click',()=>{
  const subject=$('advMenuTitle')?.textContent||'Matematika';
  activeLearningMode={subject,mode:button.dataset.advMode};
  const parent={screen:'subjectMenu',panel:'',subject};
  if(!stack.some(x=>same(x,parent)))stack.push(parent);
 },true);
});
function stackInfo(){return stack.map(x=>x.screen+(x.panel?'/'+x.panel:'')+(x.subject?'('+x.subject+')':'')).join(' > ')}
function observe(){
 if(restoring)return;
 const now=state(),last=stack[stack.length-1];if(same(now,last))return;
 // Existing in-app Back buttons may return to a previous level.
 if(stack.length>1&&same(now,stack[stack.length-2]))stack.pop();
 else if(now.screen==='homeScreen'&&stack.some(x=>x.screen==='homeScreen'))stack=stack.slice(0,stack.findIndex(x=>x.screen==='homeScreen')+1);
 else stack.push(now);
 record('navigation',last.screen+(last.panel?'/'+last.panel:'')+' -> '+now.screen+(now.panel?'/'+now.panel:'')+' | '+stackInfo());
}
// The mode handler opens the lesson synchronously and closes the menu in the
// same JS task. MutationObserver alone cannot see that intermediate state.
// Capture the menu before the original click handler runs.
document.querySelectorAll('#subjectHub [data-hub-mode]').forEach(button=>button.addEventListener('click',()=>{const hub=$('subjectHub');activeLearningMode={subject:hub?.dataset.subject==='english'?'Angličtina':'Matematika',mode:button.dataset.hubMode};},true));
document.querySelectorAll('#advSubjectMenu [data-adv-mode]').forEach(button=>{
 button.addEventListener('click',()=>{
  observe();
  record('mode-select',(button.dataset.advMode||'')+' | '+stackInfo());
 },true);
});
const observer=new MutationObserver(observe);
document.querySelectorAll('.screen,#advSubjectMenu,#subjectHub,#vlUnits,#vlWork,#v46map,#longLesson,#game,#summary,#enGame,#enSummary,#diagGame,#diagResults,#orderGame,#orderSummary').forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['class']}));
document.addEventListener('DOMContentLoaded',()=>{const m=$('v46map');if(m)observer.observe(m,{attributes:true,attributeFilter:['hidden']})});
record('startup',VERSION+' '+location.pathname+' | '+stackInfo());
window.addEventListener('error',e=>record('javascript-error',(e.message||'')+' '+(e.filename||'').split('/').pop()+':'+e.lineno));
window.addEventListener('unhandledrejection',e=>record('promise-error',e.reason?.message||e.reason||'unknown'));
window.addEventListener('school-account',e=>{record('account',e.detail?.id?'login':'lock');if(!e.detail?.id){stack=[state()];record('navigation-reset','account lock')}});
window.addEventListener('school-resume-login',()=>record('resume-login','profile'));
window.addEventListener('pagehide',()=>record('pagehide',stackInfo()));
window.addEventListener('pageshow',e=>record('pageshow',e.persisted?'bfcache':'normal')); 
document.addEventListener('visibilitychange',()=>record(document.hidden?'background':'foreground',stackInfo()));
const authBox=gate?.querySelector('.authbox');
if(authBox){const versionLabel=document.createElement('div');versionLabel.id='schoolVersionAtLogin';versionLabel.textContent='Školní dobrodružství · verze '+(window.SDApp?.version||'');versionLabel.style.cssText='margin:14px auto 0;padding:7px 12px;width:max-content;max-width:100%;border-radius:20px;background:#153c88;color:white;font:700 12px system-ui;position:relative;z-index:2';authBox.append(versionLabel)}
const admin=$('authAdmin');
if(admin){const box=document.createElement('section');box.className='authitem';box.innerHTML='<strong>🛠 Diagnostika aplikace · 50.4.1</strong><p>Zaznamenává navigaci a chyby pouze na tomto zařízení. PINy se neukládají do logu.</p><button type="button" id="diag456Export">Exportovat diagnostiku</button> <button type="button" id="diag456Clear">Smazat log</button><p id="diag456Message" aria-live="polite"></p>';admin.append(box);
 $('diag456Export').onclick=()=>{record('export','user requested');const rows=JSON.parse(localStorage.getItem(LOG)||'[]');const body=['Školní dobrodružství · diagnostika v50.4.1','Export: '+new Date().toISOString(),'User agent: '+navigator.userAgent,'',...rows.map(x=>x.time+' | '+x.type+' | '+x.detail)].join('\n');const blob=new Blob([body],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Skolni_dobrodruzstvi_LOG_'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('diag456Message').textContent='Soubor diagnostiky je připraven.'};
 $('diag456Clear').onclick=()=>{localStorage.removeItem(LOG);record('log-cleared');$('diag456Message').textContent='Diagnostický záznam byl smazán.'};
}
const marker='school-v457-guard';
function guard(){try{history.pushState({[marker]:true},'',location.href)}catch(e){record('history-error',e.message)}}
// Keep one extra browser history entry to catch Android's edge swipe.
guard();
function restore(target){
 restoring=true;
 try{
  if(target.screen==='subjectMenu'){
   document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('visible',el.id==='homeScreen'));
   if(target.subject?.includes('Matematika')||target.subject?.includes('Angličtina')){document.getElementById('subjectHub')?.classList.add('open')}else menu?.classList.add('on');if(target.subject){const title=$('advMenuTitle');if(title)title.textContent=target.subject;}document.body.style.overflow='hidden';
  }else{
   menu?.classList.remove('on');document.getElementById('subjectHub')?.classList.remove('open');document.body.style.overflow='';
   document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('visible',el.id===target.screen));
  }
  if(target.panel){
   const groups=[['setup','game','summary','longLesson'],['enSetup','enGame','enSummary'],['diagSetup','diagGame','diagResults'],['orderSetup','orderGame','orderSummary']];
   if(target.panel==='map462'){const map=$('map462');if(map){map.hidden=false;$('vlUnits').hidden=true;$('vlWork').hidden=true;}}else if(target.panel==='v46map'){const map=$('v46map');if(map){map.hidden=false;const units=$('vlUnits');if(units)units.hidden=true;const work=$('vlWork');if(work)work.hidden=true;}}else if($('v46map'))$('v46map').hidden=true;const group=groups.find(g=>g.includes(target.panel));if(group)group.forEach(id=>$(id)?.classList.toggle('hidden',id!==target.panel));
  }
  window.scrollTo(0,0);
 }finally{queueMicrotask(()=>{restoring=false})}
}
function goBack(source){
 observe();
 const map=$('map462'),oldMap=$('v46map');
 if(current()==='vlastScreen' && ((map&&!map.hidden)||(oldMap&&!oldMap.hidden))){
  if(map)map.hidden=true;if(oldMap)oldMap.hidden=true;
  if($('vlUnits'))$('vlUnits').hidden=false; if($('vlWork'))$('vlWork').hidden=true;
  stack=[{screen:'homeScreen',panel:'',subject:''},{screen:'vlastScreen',panel:'',subject:''}];
  record('back',source+' | map -> Vlastivěda témata');window.scrollTo(0,0);return;
 }
 // A mode (especially Matematika > Výuka) must return to its subject's
 // Výuka/Procvičování/Test selector, not directly to all subjects.
 if((activeLearningMode || ['mathScreen','englishScreen'].includes(current())) && !menu?.classList.contains('on') &&
    ['mathScreen','englishScreen','diagScreen','orderScreen'].includes(current())){
  const subject=activeLearningMode?.subject || (current()==='mathScreen'?'Matematika':'Angličtina');activeLearningMode=null;
  stack=[{screen:'homeScreen',panel:'',subject:''},{screen:'subjectMenu',panel:'',subject}];
  restore(stack[1]);record('back',source+' | learning mode -> '+subject+' menu');return;
 }
 if(menu?.classList.contains('on'))activeLearningMode=null;
 if(gate&&!gate.classList.contains('off')){record('back',source+' | auth gate');return}
 if(menu?.classList.contains('on') && stack.length<=1){menu.classList.remove('on');document.body.style.overflow='';record('back',source+' | subject menu -> home');return;}
 if(stack.length>1){const from=stack.pop(),to=stack[stack.length-1];restore(to);record('back',source+' | '+from.screen+(from.panel?'/'+from.panel:'')+' -> '+to.screen+(to.panel?'/'+to.panel:'')+' | '+stackInfo());return}
 const now=state();
 if(now.screen!=='homeScreen'||menu?.classList.contains('on')||document.getElementById('subjectHub')?.classList.contains('open')){
  // Safe fallback if the app restored a screen without navigation history.
  stack=[{screen:'homeScreen',panel:''}];restore(stack[0]);record('back',source+' | fallback '+now.screen+' -> homeScreen');return;
 }
 if(document.getElementById('subjectHub')?.classList.contains('open')){document.getElementById('subjectHub').classList.remove('open');return;}
 record('back',source+' | home-confirm');
 if(confirm('Chceš ukončit Školní dobrodružství?')){record('exit','confirmed');return 'exit';}
}
let handling=false;
window.addEventListener('popstate',()=>{
 if(handling)return;handling=true;
 let result;
 try{result=goBack('android-gesture')}catch(e){record('back-error',e.message)}
 finally{if(result!=='exit')guard();handling=false}
});
// Explicit button on the subject selection is handled by its original handler;
// the mutation observer recognizes the transition without a second Back action.
})();

