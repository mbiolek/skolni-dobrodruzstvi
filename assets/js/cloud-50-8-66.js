/* Školní dobrodružství 50.8.66 – centrální profily a bezpečné párování.
   Pouze PUBLIC publishable key. Žádné service_role heslo v prohlížeči.
   Staré údaje se NIKDY neimportují samy; smazané cloudové profily nelze obnovit.
*/
(()=>{'use strict';
const SUPABASE_URL='https://fmwcavjpsobwaorneedc.supabase.co';
const KEY='sb_publishable_jfEwl3aVTkJ9WiV6oFbYGA_MuZHulxj';
const PROFILES='matematika-karticky-progress-v3-profiles', AUTH_LOCAL='skolni-auth-v1';
const SESSION_KEY='sd866_supabase_session',MODE_KEY='sd866_device_mode',BACKUP_KEY='sd866_local_backup';
const $=id=>document.getElementById(id), json=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const mode=()=>localStorage.getItem(MODE_KEY)||'';
let session=json(SESSION_KEY,null),family=null,remote=[],linked=null,working=false;
let baseline=json('sd866_sync_baseline',{}),revision=json('sd866_sync_revision',{}),lastError='',lastSync='',lastSnapshot='',pairCode='';
let busySync=false,loading=false,stop=false;
const log=(e)=>{lastError=String(e?.message||e);console.warn('SD 50.8.66 CLOUD:',e); status(lastError,true)};
function status(str,error=false){let el=$('sd866Status');if(el){el.textContent=str;el.classList.toggle('sd866-error',error)}}
const putSession=s=>{session=s;if(s&&s.access_token){s.expires_at=s.expires_at||Math.floor(Date.now()/1000)+Number(s.expires_in||3600);localStorage.setItem(SESSION_KEY,JSON.stringify(s))}else{localStorage.removeItem(SESSION_KEY)}};
async function net(path,options={},bearer=false,tryRefresh=true){
 const h={'apikey':KEY,'Content-Type':'application/json',...(options.headers||{})};
 if(bearer){if(!session?.access_token)throw Error('Nejdřív je potřeba přihlásit zařízení do cloudu.');
  if(session.expires_at&&session.expires_at<Math.floor(Date.now()/1000)+70)await refresh();
  h.Authorization='Bearer '+session.access_token;
 }
 const r=await fetch(SUPABASE_URL+path,{method:options.method||'GET',headers:h,body:options.body===undefined?undefined:JSON.stringify(options.body),cache:'no-store'});
 if(r.status===401&&bearer&&tryRefresh){await refresh();return net(path,options,true,false)}
 const txt=await r.text();let data;try{data=txt?JSON.parse(txt):null}catch{data=txt}
 if(!r.ok)throw Error((data&&((data.message||data.msg||data.error_description||data.error)))||`Cloud: chyba HTTP ${r.status}`);
 return data;
}
async function refresh(){if(!session?.refresh_token)throw Error('Přihlášení vypršelo. Přihlas se znovu.');
 const s=await net('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}},false);
 putSession(s);return s;
}
async function auth(type,email,password){
 if(!email||!password)throw Error('Vyplň e-mail a heslo.');
 const path=type==='signup'?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
 const s=await net(path,{method:'POST',body:{email,password}},false);
 if(!s.access_token){status('Účet založen. Potvrď odkaz v e-mailu a potom klikni na Přihlásit.');return false}
 putSession(s);localStorage.setItem(MODE_KEY,'parent');await loadParent();return true;
}
async function authUser(){if(!session)return null;
 try{return await net('/auth/v1/user',{},true)}catch(e){if(!navigator.onLine)throw e;putSession(null);throw e}}
function backupLocal(){if(localStorage.getItem(BACKUP_KEY))return;
 const keys=[PROFILES,AUTH_LOCAL,'matematika-karticky-progress-v3-active','sd52_schools_plans_v1','skolni-dobrodruzstvi-v37-avatar'];
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^(sd860_martin_progress_|sd864_cermat_priprava_|school-v29-|sd865_)/).test(k))keys.push(k)}
 const save={version:'50.8.66',created:new Date().toISOString(),items:{}};
 for(const k of new Set(keys))if(localStorage.getItem(k)!==null)save.items[k]=localStorage.getItem(k);
 localStorage.setItem(BACKUP_KEY,JSON.stringify(save));
}
function downloadBackup(){backupLocal();const safe=json(BACKUP_KEY,{});if(safe.items)delete safe.items[AUTH_LOCAL];const b=new Blob([JSON.stringify(safe,null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='Skolni_dobrodruzstvi_ZALOHA_PRED_CLOUDEM_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
const isReady=()=>mode()==='parent'&&!!family&&!!session?.access_token;
const isControlled=()=>mode()==='parent'||mode()==='child';
function ownProfileFromRow(row,progress){const old=progress?.find(x=>x.activity_key==='legacy_profile')?.data;
 const obj=old&&typeof old==='object'&&!Array.isArray(old)?{...old}:{memory:{},totals:{done:0,correct:0}};
 obj.name=row.display_name;return obj;
}
async function fetchProfiles(){
 if(!family)return [];
 return await net('/rest/v1/sd_profiles?family_id=eq.'+family.id+'&select=id,family_id,legacy_id,display_name,deleted_at,updated_at&order=created_at.asc',{},true);
}
async function fetchProgress(profileId){return await net('/rest/v1/sd_progress?profile_id=eq.'+profileId+'&select=activity_key,data,revision,updated_at',{},true)}
function backupIfChange(){backupLocal()}
function removePin(id){const cfg=json(AUTH_LOCAL,{});if(cfg[id]){delete cfg[id];localStorage.setItem(AUTH_LOCAL,JSON.stringify(cfg))}}
function notify(){window.dispatchEvent(new CustomEvent('sd866-updated'));}
function saveMeta(){localStorage.setItem('sd866_sync_baseline',JSON.stringify(baseline));localStorage.setItem('sd866_sync_revision',JSON.stringify(revision))}
function mirror(rows,allProgress,replace=true){
 if(!replace)return;
 backupIfChange();const current=json(PROFILES,{}),next={};
 for(const row of rows){if(row.deleted_at){removePin(row.legacy_id);continue}
  const logs=allProgress[row.id]||[],data=ownProfileFromRow(row,logs),legacy=row.legacy_id;
  const currentObj=current[legacy];
  // Preserve unsaved local exercises; never silently overwrite conflicting work.
  const previous=baseline[legacy];
  const dirty=isControlled()&&currentObj&&previous!==undefined&&JSON.stringify(currentObj)!==previous;
  if(dirty){
    next[legacy]=currentObj;
    status('Na tomto zařízení jsou neodeslané výsledky. Použij Synchronizovat; bez toho je cloud nepřepíše.',true);
  }else{
    next[legacy]=data;
    baseline[legacy]=JSON.stringify(data);
  }
  for(const p of logs){revision[row.id+':'+p.activity_key]=Number(p.revision);if(p.activity_key.startsWith('storage:')){
    const key=p.activity_key.slice(8)+'_'+legacy;
    const cur=localStorage.getItem(key);
    if(cur===null||!baseline['storage:'+key]||cur===baseline['storage:'+key]){
      localStorage.setItem(key,JSON.stringify(p.data));baseline['storage:'+key]=localStorage.getItem(key);
    }
  }}
 }
 localStorage.setItem(PROFILES,JSON.stringify(next));
 const active=localStorage.getItem('matematika-karticky-progress-v3-active');
 if(active&&!next[active])localStorage.removeItem('matematika-karticky-progress-v3-active');
 saveMeta();notify();
}
async function loadParent(){
 const user=await authUser();if(!user?.id)throw Error('Nepodařilo se ověřit rodičovský účet.');
 let families=await net('/rest/v1/sd_families?owner_id=eq.'+encodeURIComponent(user.id)+'&select=id,owner_id,name',{},true);
 if(!families.length){families=await net('/rest/v1/sd_families',{method:'POST',headers:{Prefer:'return=representation'},body:{owner_id:user.id,name:'Školní dobrodružství'}},true)}
 family=families[0];remote=await fetchProfiles();lastSync='';
 if(remote.length){await pullParent();localStorage.setItem(MODE_KEY,'parent')}
 status(remote.length?`Cloud připojen. Aktivních profilů: ${remote.filter(p=>!p.deleted_at).length}.`:'Cloud je prázdný. První převod udělej na telefonu, kde jsou Martin a Matyáš.');
 renderCloud();
}
async function pullParent(){
 if(!isReady())return;
 const rows=await fetchProfiles();const all={};
 for(const r of rows.filter(x=>!x.deleted_at))all[r.id]=await fetchProgress(r.id);
 remote=rows;
 if(rows.length)mirror(rows,all);
 lastSync=new Date().toLocaleTimeString('cs-CZ');renderCloud();
}
async function writeProgress(row,activity,data,oldRev){
 const pk=row.id,key=pk+':'+activity;
 if(oldRev){const result=await net('/rest/v1/sd_progress?profile_id=eq.'+pk+'&activity_key=eq.'+encodeURIComponent(activity)+'&revision=eq.'+oldRev,
   {method:'PATCH',headers:{Prefer:'return=representation'},body:{data,revision:oldRev}},true);
   if(!result.length)throw Error('Konflikt výsledků: na jiném zařízení už byla uložena novější verze. Tvoje místní data zůstala zachována.');
   revision[key]=Number(result[0].revision);saveMeta();
 }else{
   const result=await net('/rest/v1/sd_progress',{method:'POST',headers:{Prefer:'return=representation'},body:{profile_id:pk,activity_key:activity,data}},true);
   revision[key]=Number(result[0].revision);saveMeta();
 }
}
async function importLocal(){
 if(!isReady())throw Error('Přihlas se jako rodič.');
 const locals=json(PROFILES,{}),items=Object.entries(locals).filter(([id,p])=>id!=='parent'&&p&&typeof p==='object'&&p.name);
 if(!items.length)throw Error('Na tomto zařízení nejsou žádné místní dětské profily. Převod proveď na Samsungu.');
 const names=items.map(([,p])=>p.name).join(', ');
 if(!confirm('Do cloudu se nahrají pouze tyto profily ze současného zařízení: '+names+'\n\nPřevod je jednosměrný. Existující cloudové profily se nepřepíší a smazané se neobnoví. Pokračovat?'))return;
 backupLocal();downloadBackup();
 let rows=await fetchProfiles(),imported=0,skipped=[];
 for(const [id,p] of items){
  let row=rows.find(x=>x.legacy_id===id);
  if(row?.deleted_at){skipped.push(p.name+' (dříve smazaný)');continue}
  if(!row){const added=await net('/rest/v1/sd_profiles',{method:'POST',headers:{Prefer:'return=representation'},body:{family_id:family.id,legacy_id:id,display_name:String(p.name).slice(0,120)}},true);row=added[0];rows.push(row)}
  const pg=await fetchProgress(row.id);
  if(!pg.some(x=>x.activity_key==='legacy_profile'))await writeProgress(row,'legacy_profile',p,0);
  for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_']){
    const raw=localStorage.getItem(prefix+id),activity='storage:'+prefix.slice(0,-1);
    if(raw&& !pg.some(x=>x.activity_key===activity)){
      try{await writeProgress(row,activity,JSON.parse(raw),0)}catch(e){console.warn('Import modulu:',e);skipped.push(p.name+'/'+activity)}
    }
  }
  imported++;
 }
 await pullParent();status('Převedeno '+imported+' profilů. '+(skipped.length?'Nepřevedeno: '+skipped.join(', '):'Původní data byla zálohována.'));
}
async function createProfile(id,p){if(!isReady())throw Error('Cloud není ověřen.');
 const rows=await net('/rest/v1/sd_profiles',{method:'POST',headers:{Prefer:'return=representation'},body:{family_id:family.id,legacy_id:id,display_name:p.name}},true);
 await writeProgress(rows[0],'legacy_profile',p,0);await pullParent();return true;
}
async function renameProfile(id,name){if(!isReady())throw Error('Cloud není ověřen.');const row=remote.find(x=>x.legacy_id===id&&!x.deleted_at);if(!row)throw Error('Profil již v cloudu neexistuje.');
 await net('/rest/v1/sd_profiles?id=eq.'+row.id,{method:'PATCH',headers:{Prefer:'return=representation'},body:{display_name:name}},true);await pullParent();return true;
}
async function deleteProfile(id){if(!isReady())throw Error('Cloud není ověřen.');const row=remote.find(x=>x.legacy_id===id&&!x.deleted_at);if(!row)throw Error('Profil již byl smazán.');
 await net('/rest/v1/sd_profiles?id=eq.'+row.id,{method:'PATCH',headers:{Prefer:'return=representation'},body:{deleted_at:new Date().toISOString()}},true);
 await pullParent();removePin(id);return true;
}
async function syncParent(){if(busySync||!isReady())return;busySync=true;
 try{
  const current=json(PROFILES,{});for(const row of remote.filter(x=>!x.deleted_at)){
   const p=current[row.legacy_id];if(!p)continue;
   const old=baseline[row.legacy_id];
   if(old!==undefined&&JSON.stringify(p)!==old){
    await writeProgress(row,'legacy_profile',p,revision[row.id+':legacy_profile']||0);
    baseline[row.legacy_id]=JSON.stringify(p);saveMeta();
   }
   for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_']){
    const localKey=prefix+row.legacy_id,raw=localStorage.getItem(localKey);
    if(raw===null)continue;
    const baseKey='storage:'+localKey,activity='storage:'+prefix.slice(0,-1);
    if(baseline[baseKey]!==raw){
     let data;try{data=JSON.parse(raw)}catch{continue}
     await writeProgress(row,activity,data,revision[row.id+':'+activity]||0);
     baseline[baseKey]=raw;saveMeta();
    }
   }
  }
  await pullParent();status('Synchronizováno v '+lastSync+'.');
 }catch(e){log(e)}finally{busySync=false}
}
async function createCode(){
 if(mode()==='parent'&&session)throw Error('Na tomto zařízení je přihlášen rodič. Nejprve v cloudu použij Odhlásit.');
 let s=session;
 if(!s?.access_token){s=await net('/auth/v1/signup',{method:'POST',body:{}},false);if(!s.access_token)throw Error('Anonymní přihlašování není povoleno. V Supabase otevři Authentication → Providers → Anonymous a povol Anonymous sign-ins.');putSession(s)}
 const bits=new Uint8Array(16);crypto.getRandomValues(bits);
 const code=Array.from(bits,b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
 await net('/rest/v1/sd_pair_requests',{method:'POST',body:{auth_user_id:s.user.id,pairing_code:code}},true);
 pairCode=code;localStorage.setItem(MODE_KEY,'child-pending');renderChild();return code;
}
function revokeLocalChild(){
 const id=linked?.legacy_id||localStorage.getItem('sd866_linked_legacy');
 linked=null;
 if(id){const ps=json(PROFILES,{});if(ps[id]){delete ps[id];localStorage.setItem(PROFILES,JSON.stringify(ps))}}
 sessionStorage.removeItem('skolni-live-v441');localStorage.removeItem('matematika-karticky-progress-v3-active');
 notify();
}
async function verifyChild(){if(!session)return;const user=await authUser();if(!user?.id)return;
 const accounts=await net('/rest/v1/sd_child_accounts?auth_user_id=eq.'+user.id+'&select=profile_id,family_id',{},true);
 if(!accounts.length){if(mode()==='child'){revokeLocalChild();status('Toto zařízení bylo odpojeno správcem.',true)}return}
 const prof=await net('/rest/v1/sd_profiles?id=eq.'+accounts[0].profile_id+'&select=id,legacy_id,display_name,deleted_at',{},true);
 if(!prof.length||prof[0].deleted_at){revokeLocalChild();status('Profil byl smazán nebo zařízení odpojeno.',true);return}
 linked=prof[0];localStorage.setItem('sd866_linked_legacy',linked.legacy_id);localStorage.setItem(MODE_KEY,'child');
 const rows=await fetchProgress(linked.id);
 // Nejdřív odešli změny dítěte, které vznikly od posledního uložení.
 const locally=json(PROFILES,{}),own=locally[linked.legacy_id],old=baseline[linked.legacy_id];
 if(own&&old!==undefined&&JSON.stringify(own)!==old){
  try{await writeProgress(linked,'legacy_profile',own,revision[linked.id+':legacy_profile']||0);
    baseline[linked.legacy_id]=JSON.stringify(own);saveMeta();
  }catch(e){log(e);return}
 }
 for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_']){
  const localKey=prefix+linked.legacy_id,raw=localStorage.getItem(localKey),activity='storage:'+prefix.slice(0,-1);
  if(raw!==null&&baseline['storage:'+localKey]!==undefined&&baseline['storage:'+localKey]!==raw){
    try{await writeProgress(linked,activity,JSON.parse(raw),revision[linked.id+':'+activity]||0);
      baseline['storage:'+localKey]=raw;saveMeta();
    }catch(e){log(e);return}
  }
 }
 const latest=await fetchProgress(linked.id);
 mirror([linked],{[linked.id]:latest});
 status('Zařízení spárováno s profilem '+linked.display_name+'.');renderChild();
}
async function pairDevice(code,legacyId){if(!isReady())throw Error('Přihlas se jako rodič.');const p=remote.find(x=>x.legacy_id===legacyId&&!x.deleted_at);if(!p)throw Error('Profil není dostupný.');
 await net('/rest/v1/rpc/sd_pair_device',{method:'POST',body:{p_pairing_code:code,p_profile_id:p.id}},true);status('Zařízení úspěšně přiřazeno k profilu '+p.display_name+'.');
}
function buildUI(){if($('sd866Cloud'))return;
 const admin=$('authAdmin'),gate=$('authGate');if(!admin||!gate)return;
 const panel=document.createElement('section');panel.id='sd866Cloud';panel.className='sd866-cloud';
 panel.innerHTML=`<h3>☁️ Centrální databáze 50.8.66</h3>
 <p class="sd866-explain">Profily mění pouze rodič přes zabezpečený cloud. Staré místní profily se bez potvrzení nikdy nenahrávají. Stažená záloha neobsahuje PINy.</p>
 <div id="sd866Status" role="status" aria-live="polite">Připraveno k připojení.</div>
 <div id="sd866SignIn"><label>E-mail rodiče <input id="sd866Email" type="email" autocomplete="username" placeholder="tvuj@email.cz"></label>
 <label>Heslo cloudového účtu <input id="sd866Password" type="password" autocomplete="current-password" placeholder="Heslo Supabase Auth"></label>
 <div class="sd866-actions"><button id="sd866Login" type="button">Přihlásit k cloudu</button><button id="sd866Register" type="button">Vytvořit cloudový účet</button></div>
 <small>Toto je přihlášení pro Školní dobrodružství, nikoli heslo databáze Supabase. Při prvním založení potvrď e-mail.</small></div>
 <div id="sd866Connected" hidden><div class="sd866-actions"><button id="sd866Import" type="button">Převést profily z tohoto zařízení</button><button id="sd866Sync" type="button">Synchronizovat</button><button id="sd866Backup" type="button">Stáhnout místní zálohu</button><button id="sd866Logout" type="button">Odhlásit cloud</button></div>
 <p class="sd866-explain">První import proveď na zařízení, kde jsou správné profily Martin a Matyáš. Profil Test z počítače nepřeváděj. Cloud při smazání vždy vítězí; offline zařízení se opraví po připojení.</p>
 <h4>Spárovat dětský telefon / iPhone</h4><label>Jednorázový kód z telefonu <input id="sd866PairCode" maxlength="16" placeholder="16 znaků"></label>
 <label>Pro který profil? <select id="sd866PairProfile"></select></label>
 <button id="sd866Pair" type="button">Povolit tomuto zařízení přístup</button>
 <p class="sd866-explain">Na dítěti otevři přihlašovací obrazovku → „Připojit dětské zařízení“. Párovací kód platí 15 minut.</p></div>`;
 admin.insertBefore(panel,admin.querySelector('h3'));
 const row=document.createElement('div');row.id='sd866ChildPair';row.className='sd866-childpair';
 row.innerHTML=`<button id="sd866PairStart" type="button">Připojit dětské zařízení k rodině</button>
 <div id="sd866PairPanel" hidden><p>Otevři stejné Školní dobrodružství na telefonu dítěte. Vytvoř zde párovací kód a rodič ho zadá ve své správě.</p><button id="sd866Code" type="button">Vytvořit párovací kód</button><button id="sd866CheckPair" type="button">Zkontrolovat párování</button><button id="sd866Unpair" type="button">Odpojit toto zařízení</button><strong id="sd866CodeText"></strong><p id="sd866PairMessage" role="status"></p></div>`;
 gate.querySelector('.authbox')?.append(row);
 const css=document.createElement('link');css.rel='stylesheet';css.href='./assets/css/cloud-50-8-66.css';document.head.append(css);
 $('sd866Login').onclick=()=>action(async()=>auth('login',$('sd866Email').value.trim(),$('sd866Password').value),true);
 $('sd866Register').onclick=()=>action(async()=>auth('signup',$('sd866Email').value.trim(),$('sd866Password').value),true);
 $('sd866Import').onclick=()=>action(importLocal);
 $('sd866Sync').onclick=()=>action(syncParent);
 $('sd866Backup').onclick=downloadBackup;
 $('sd866Logout').onclick=()=>{putSession(null);family=null;remote=[];linked=null;localStorage.removeItem(MODE_KEY);status('Cloud odhlášen. Místní záloha nebyla smazána.');renderCloud()};
 $('sd866Pair').onclick=()=>action(()=>pairDevice($('sd866PairCode').value.trim().toUpperCase(),$('sd866PairProfile').value));
 $('sd866PairStart').onclick=()=>{$('sd866PairPanel').hidden=!$('sd866PairPanel').hidden;renderChild()};
 $('sd866Code').onclick=()=>action(createCode);
 $('sd866CheckPair').onclick=()=>action(verifyChild);
 $('sd866Unpair').onclick=()=>{if(!confirm('Odpojit toto zařízení od cloudu? Místní záloha nebude smazána.'))return;
   putSession(null);revokeLocalChild();localStorage.removeItem(MODE_KEY);localStorage.removeItem('sd866_linked_legacy');pairCode='';renderChild();location.reload()};
 renderCloud();renderChild();
}
async function action(fn,clear=false){if(working)return;working=true;const buttons=document.querySelectorAll('#sd866Cloud button,#sd866ChildPair button');buttons.forEach(b=>b.disabled=true);
 try{if(clear)status('Ověřuji přihlášení…');await fn();if(clear)renderCloud()}catch(e){log(e)}finally{working=false;buttons.forEach(b=>b.disabled=false)}}
function renderCloud(){
 const on=mode()==='parent'&&!!session&&!!family;
 if($('sd866SignIn'))$('sd866SignIn').hidden=on;
 if($('sd866Connected'))$('sd866Connected').hidden=!on;
 if($('sd866PairProfile')){
  const v=$('sd866PairProfile').value;$('sd866PairProfile').replaceChildren();
  for(const p of remote.filter(p=>!p.deleted_at)){const o=document.createElement('option');o.value=p.legacy_id;o.textContent=p.display_name;$('sd866PairProfile').append(o)}
  if(v&&Array.from($('sd866PairProfile').options).some(x=>x.value===v))$('sd866PairProfile').value=v;
 }
}
function renderChild(){if($('sd866CodeText'))$('sd866CodeText').textContent=pairCode?'PÁROVACÍ KÓD: '+pairCode:'';if($('sd866PairMessage'))$('sd866PairMessage').textContent=linked?'Připojeno: '+linked.display_name:mode()==='child-pending'?'Čekám na potvrzení rodiče…':''}
async function init(){buildUI();if(!session?.access_token)return;
 try{
  if(mode()==='parent')await loadParent();
  if(mode()==='child'||mode()==='child-pending')await verifyChild();
 }catch(e){log(e)}
}
function publicEntry(id){return mode()!=='child'||!!linked&&linked.legacy_id===id}
async function canEnter(id){if(mode()!=='child')return true;
 try{await verifyChild();return !!linked&&linked.legacy_id===id}catch(e){status('Bez internetového ověření nelze změnit profil. Zkus se připojit.',true);return false}
}
function lockParentOnChild(){
 if(mode()==='parent'&&session){putSession(null);family=null;remote=[];renderCloud();status('Rodičovské cloudové přihlášení bylo uzamčeno. Pro synchronizaci se znovu přihlas jako rodič.');}
}
window.SDCloud866={isReady,isControlled,mode,publicEntry,canEnter,lockParentOnChild,createProfile,renameProfile,deleteProfile,pullParent,syncParent,backupLocal,downloadBackup,refreshDevice:verifyChild};
setTimeout(init,0);
window.addEventListener('focus',()=>{if(!working&&session&&(mode()==='parent'||mode()==='child')){if(mode()==='parent')syncParent();else verifyChild().catch(log)}});
setInterval(()=>{if(document.hidden||!session||working)return;if(mode()==='parent')syncParent();else if(mode()==='child'||mode()==='child-pending')verifyChild().catch(log)},30000);
})();
