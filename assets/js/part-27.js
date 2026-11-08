/* Školní dobrodružství 50.8.6 – srozumitelné a potvrzované aktualizace PWA. */
(()=>{'use strict';
const box=document.getElementById('pwa31bar'),msg=document.getElementById('pwa31msg'),actions=document.getElementById('pwa31actions');
if(!box||!msg||!actions)return;
const supported=location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname);
if(!supported||!('serviceWorker' in navigator))return;
const meter=document.createElement('div');meter.id='sd5086-progress';meter.hidden=true;
meter.innerHTML='<div class="sd5086-track" role="progressbar" aria-label="Stahování aktualizace" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><small id="sd5086-progress-label">0 %</small>';
box.insertBefore(meter,actions);
const track=meter.querySelector('.sd5086-track'),fill=track.querySelector('span'),count=meter.querySelector('small');
let reg=null,installing=null,hiddenInstall=false,updateRequested=false,refreshing=false,hasController=!!navigator.serviceWorker.controller,lastLogBucket=-1,lastReadyVersion="nová",offeredWorker=null;
function diagnostic(type,detail){try{window.schoolDiagnostic?.(type,detail)}catch(_){}}
function hide(){box.style.display='none'}
function show(text,buttons=[],progress=null){
 msg.textContent=text;
 actions.replaceChildren();
 buttons.forEach(([label,fn,secondary])=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(secondary)b.className='secondary';b.onclick=fn;actions.append(b)});
 if(progress){
   const percent=Math.max(0,Math.min(100,Math.round((progress.done||0)*100/Math.max(1,progress.total||1))));
   meter.hidden=false;track.setAttribute('aria-valuenow',String(percent));fill.style.width=percent+'%';
   count.textContent=`${percent} % · ${progress.done||0} z ${progress.total||0} souborů`;
 }else meter.hidden=true;
 box.style.display='block';
}
function offer(registration){
 if(!registration?.waiting)return;
 const w=registration.waiting;
 if(!navigator.serviceWorker.controller){return;} // first installation: automatic
 const ready=()=>{
   updateRequested=true;diagnostic('update','user accepted update');
   show('Aktualizuji aplikaci. Zachovám tvoje profily i výsledky.');
   w.postMessage({type:'SKIP_WAITING'});
 };
 if(offeredWorker===w)return;offeredWorker=w;
 diagnostic('update','download ready '+lastReadyVersion);
 show('Nová verze Školního dobrodružství je stažená. Chceš ji nyní použít?',[
  ['Aktualizovat nyní',ready],['Později',()=>{hiddenInstall=true;hide()},true]
 ]);
}
function onProgress(data){
 if(data?.type!=='SD_UPDATE_PROGRESS')return;
 if(data.stage==='downloading'){
   const p=Math.floor((data.done||0)*5/Math.max(data.total||1,1));
   if(lastLogBucket!==p){lastLogBucket=p;diagnostic('update-progress',`${data.version}: ${data.done}/${data.total} souborů`)}
   if(!hiddenInstall){show('Stahuji novou verzi '+data.version+'. Aplikaci můžeš dál používat.',[
    ['Skrýt průběh',()=>{hiddenInstall=true;hide()},true]
   ],data)}
 } else if(data.stage==='ready'){
   lastReadyVersion=data.version||'nová';
   diagnostic('update','download completed '+data.version);
   // wait for registration.waiting; statechange event triggers offer().
   if(reg?.waiting)offer(reg);
   else show('Nová verze je stažená. Připravuji nabídku aktualizace.');
 } else if(data.stage==='error'){
   diagnostic('update-error',data.detail||'chyba stahování');
   show('Aktualizaci se nepodařilo dokončit. Současná verze zůstává funkční.',[
    ['Zkusit znovu',()=>reg?.update().catch(err=>diagnostic('update-error',String(err)))],['Zavřít',hide,true]
   ]);
 }
}
navigator.serviceWorker.addEventListener('message',event=>onProgress(event.data));
navigator.serviceWorker.addEventListener('controllerchange',()=>{
 if(refreshing)return;
 // A new worker can only activate after an explicit choice or a first installation.
 const nowControlled=!!navigator.serviceWorker.controller;
 if(nowControlled && hasController){
   refreshing=true;diagnostic('update','new worker activated – reload');
   location.reload();
 } else hasController=nowControlled;
});
function watch(worker){
 if(!worker||worker===installing)return;
 installing=worker;offeredWorker=null;hiddenInstall=false;lastLogBucket=-1;
 diagnostic('update','install started');
 if(navigator.serviceWorker.controller)show('Zjištěna nová verze. Připravuji její bezpečné stažení…');
 worker.addEventListener('statechange',()=>{
  diagnostic('update',`worker state: ${worker.state}`);
  if(worker.state==='installed'){
    if(reg?.waiting)offer(reg);
    else if(navigator.serviceWorker.controller)show('Stažení dokončeno. Připravuji potvrzení aktualizace.');
    else hide();
  }
  if(worker.state==='redundant' && !reg?.waiting){
    show('Aktualizaci se nepodařilo dokončit. Současná verze zůstává funkční.',[
      ['Zkusit znovu',()=>reg?.update().catch(()=>{})],['Zavřít',hide,true]
    ]);
  }
 });
 worker.postMessage({type:'SD_UPDATE_GET_STATUS'});
}
navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(r=>{
 reg=r;
 if(r.installing)watch(r.installing);
 if(r.waiting)offer(r);
 r.addEventListener('updatefound',()=>watch(r.installing));
 r.update().catch(err=>diagnostic('update-error',String(err)));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update().catch(()=>{})});
 window.addEventListener('focus',()=>r.update().catch(()=>{}));
 setInterval(()=>r.update().catch(()=>{}),60*60*1000);
}).catch(err=>{diagnostic('update-error','registrace: '+err);console.warn('Offline režim není dostupný',err)});
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();window.schoolInstallPrompt=event;
 if(reg?.installing||reg?.waiting)return;
 show('Školní dobrodružství si můžeš nainstalovat na plochu telefonu nebo počítače.',[
  ['Nainstalovat',async()=>{hide();const p=window.schoolInstallPrompt;if(p){p.prompt();await p.userChoice;window.schoolInstallPrompt=null}}],['Později',hide,true]
 ]);
});
window.addEventListener('appinstalled',hide);
})();
