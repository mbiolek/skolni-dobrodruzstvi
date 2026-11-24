/* Školní dobrodružství 50.8.66 – centrální profily a bezpečné párování.
   Pouze PUBLIC publishable key. Žádné service_role heslo v prohlížeči.
   Staré údaje se NIKDY neimportují samy; smazané cloudové profily nelze obnovit.
*/
(()=>{'use strict';
const SUPABASE_URL='https://fmwcavjpsobwaorneedc.supabase.co';
const KEY='sb_publishable_jfEwl3aVTkJ9WiV6oFbYGA_MuZHulxj';
const PROFILES='matematika-karticky-progress-v3-profiles', AUTH_LOCAL='skolni-auth-v1';
const SESSION_KEY='sd866_supabase_session',MODE_KEY='sd866_device_mode',BACKUP_KEY='sd866_local_backup';
const DEVICE_KEY='sd867_restricted_device_token';
let schoolBusy=false;
let deviceToken=localStorage.getItem(DEVICE_KEY)||'',deviceBusy=false,deviceReady=false;
let deviceLastPoll=0,deviceLastSend=0;
const conflicts=new Set();
const $=id=>document.getElementById(id), json=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const mode=()=>localStorage.getItem(MODE_KEY)||'';
let session=json(SESSION_KEY,null),family=null,remote=[],linked=null,working=false;
let allowedProfileIds=new Set(); // 50.8.74: profily povolené serverem pro dětský účet
let baseline=json('sd866_sync_baseline',{}),revision=json('sd866_sync_revision',{}),lastError='',lastSync='',lastSnapshot='',pairCode='';
let busySync=false,loading=false,stop=false;
const childMessage=(msg,isError=false)=>{const e=$('sd866PairMessage');if(!e)return;e.hidden=false;e.textContent=msg;e.dataset.error=isError?'1':'0';};
const readableError=e=>{const msg=String(e?.message||e);return /anonymous[_ -]?provider[_ -]?disabled|anonymous sign.ins are disabled/i.test(msg)?'Párovací kód nelze vytvořit: v Supabase není zapnuté anonymní přihlašování. Rodič musí otevřít Authentication → Sign In / Providers → Anonymous Sign-Ins a zapnout Enable anonymous sign-ins. Potom zde klikni znovu na „Vytvořit párovací kód“.':msg;};
const log=(e)=>{lastError=readableError(e);console.warn('SD 50.8.68 CLOUD:',e);status(lastError,true);if($('sd866PairPanel')&&!$('sd866PairPanel').hidden)childMessage(lastError,true);};
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
async function syncSchoolParent(){
 const grade=window.SDGradeSchools871;
 if(schoolBusy||!isReady()||!grade||!family)return;
 schoolBusy=true;
 try{
  const url='/rest/v1/sd_school_state?family_id=eq.'+family.id+'&select=data,revision';
  const list=await net(url,{},true);
  if(!list.length){
   const res=await net('/rest/v1/sd_school_state',{
    method:'POST',headers:{Prefer:'return=representation'},body:{family_id:family.id,data:grade.exportConfig()}
   },true);
   if(res?.[0])grade.clearDirty(res[0].revision);
   status('Rozdělení škol a ročníků uloženo do cloudu.');
  }else if(grade.isDirty()){
   const rev=grade.cloudRevision();
   // Nemazat cloudovou konfiguraci, pokud se mezitím změnila jinde.
   if(rev!==Number(list[0].revision)){
    status('Školy na jiném zařízení mají novější změny. Místní nastavení je zachované; před další úpravou je potřeba vyřešit konflikt.',true);
    return;
   }
   const result=await net('/rest/v1/sd_school_state?family_id=eq.'+family.id+'&revision=eq.'+rev,{
    method:'PATCH',headers:{Prefer:'return=representation'},body:{data:grade.exportConfig(),revision:rev}
   },true);
   if(!result?.length)throw Error('Školy se mezitím změnily jinde. Místní nastavení se nesmazalo.');
   grade.clearDirty(result[0].revision);
   status('Školy a ročníky synchronizovány.');
  }else grade.applyRemote(list[0].data,list[0].revision);
 }catch(e){status('Školy čekají na synchronizaci: '+String(e.message||e),true);console.warn('SD 50.8.71 škola:',e)}
 finally{schoolBusy=false}
}
async function pullSchoolChild(familyId){
 if(!familyId||!session?.access_token)return;
 try{const rows=await net('/rest/v1/sd_school_state?family_id=eq.'+familyId+'&select=data,revision',{},true);
  if(rows.length)window.SDGradeSchools871?.applyRemote?.(rows[0].data,rows[0].revision);
 }catch(e){console.warn('Načítání škol dítěte:',e)}
}
function backupLocal(){if(localStorage.getItem(BACKUP_KEY))return;
 const keys=[PROFILES,AUTH_LOCAL,'matematika-karticky-progress-v3-active','sd52_schools_plans_v1','skolni-dobrodruzstvi-v37-avatar'];
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^(sd860_martin_progress_|sd864_cermat_priprava_|sdnature_progress_|sd878_extra_practice_|school-v29-|sd865_)/).test(k))keys.push(k)}
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
 try{await syncSchoolParent();await registerSyncDevice()}catch(e){status('Profily v cloudu fungují; automatická synchronizace zařízení vyžaduje nové ověření: '+String(e.message||e),true)}
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
  for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_','sdnature_progress_','sd878_extra_practice_']){
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
   for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_','sdnature_progress_','sd878_extra_practice_']){
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
  await pullParent();await syncSchoolParent();status('Synchronizováno v '+lastSync+'.');
 }catch(e){log(e)}finally{busySync=false}
}
async function ensureChildIdentity(){
 if(mode()==='parent'&&session?.access_token)throw Error('Na tomto zařízení je přihlášen rodič. Párování spusť na zařízení dítěte.');
 let user=null;
 if(session?.access_token)user=await authUser();
 if(!user?.id){
  const next=await net('/auth/v1/signup',{method:'POST',body:{}},false);
  if(!next?.access_token||!next?.user?.id)throw Error('V Supabase musí být povolené anonymní přihlašování dětských zařízení.');
  putSession(next);user=next.user;
 }
 if(mode()!=='child')localStorage.setItem(MODE_KEY,'child-pending');
 return user.id;
}
async function createCode(){
 if(!navigator.onLine)throw Error('Telefon není připojený k internetu. Zapni Wi-Fi nebo mobilní data.');
 if(mode()==='parent'&&session)throw Error('Na tomto zařízení je přihlášen rodič. Nejprve v cloudu použij Odhlásit.');
 let s=session;
 if(!s?.access_token){s=await net('/auth/v1/signup',{method:'POST',body:{}},false);if(!s.access_token)throw Error('Anonymní přihlašování není povoleno. V Supabase otevři Authentication → Providers → Anonymous a povol Anonymous sign-ins.');putSession(s)}
 const bits=new Uint8Array(16);crypto.getRandomValues(bits);
 const code=Array.from(bits,b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
 await net('/rest/v1/sd_pair_requests',{method:'POST',body:{auth_user_id:s.user.id,pairing_code:code}},true);
 pairCode=code;localStorage.setItem(MODE_KEY,'child-pending');renderChild();
 childMessage('Kód je připraven. Rodič ho zadá do své aplikace v části Centrální databáze, vybere Martina nebo Matyáše a potvrdí přístup. Potom stiskni „Zkontrolovat párování“.');return code;
}
function revokeLocalChild(){
 const ids=new Set(allowedProfileIds);
 if(linked?.legacy_id)ids.add(linked.legacy_id);
 const old=localStorage.getItem('sd866_linked_legacy');if(old)ids.add(old);
 allowedProfileIds.clear();linked=null;
 const ps=json(PROFILES,{});
 for(const id of ids)delete ps[id];
 localStorage.setItem(PROFILES,JSON.stringify(ps));
 localStorage.removeItem('sd866_linked_legacy');
 sessionStorage.removeItem('skolni-live-v441');
 localStorage.removeItem('matematika-karticky-progress-v3-active');
 notify();
}
let childVerifying=null;
async function verifyChild(){
 if(childVerifying)return childVerifying;
 childVerifying=verifyChildNow().finally(()=>{childVerifying=null});
 return childVerifying;
}
async function verifyChildNow(){
 if(!session){childMessage('Nejdřív klikni na „Vytvořit párovací kód“.',true);return}
 const user=await authUser();
 if(!user?.id){childMessage('Zařízení ještě není přihlášené. Vytvoř párovací kód znovu.',true);return}
 const accounts=await net('/rest/v1/sd_child_accounts?auth_user_id=eq.'+encodeURIComponent(user.id)+'&select=profile_id,family_id',{},true);
 if(!accounts.length){
  if(mode()==='child'){revokeLocalChild();status('Zařízení bylo odpojeno rodičem.',true)}
  else childMessage('Rodič zatím připojení neschválil. Po potvrzení se profil načte automaticky.');
  return;
 }
 const account=accounts[0];
 // Dotaz vrací jen profily povolené pravidly RLS konkrétnímu dětskému JWT.
 const permitted=await net('/rest/v1/sd_profiles?family_id=eq.'+encodeURIComponent(account.family_id)+'&deleted_at=is.null&select=id,legacy_id,display_name,deleted_at',{},true);
 const primary=permitted.find(p=>p.id===account.profile_id);
 if(!primary){revokeLocalChild();status('Hlavní profil byl odstraněn nebo zařízení ztratilo oprávnění.',true);return}
 const logs={};const local=json(PROFILES,{});
 for(const p of permitted){
  const before=await fetchProgress(p.id);logs[p.id]=before;
  const existing=local[p.legacy_id],old=baseline[p.legacy_id];
  if(existing&&old!==undefined&&JSON.stringify(existing)!==old){
   try{
    await writeProgress(p,'legacy_profile',existing,revision[p.id+':legacy_profile']||0);
    baseline[p.legacy_id]=JSON.stringify(existing);saveMeta();
   }catch(e){log(e);return}
  }
  for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_','sdnature_progress_','sd878_extra_practice_']){
   const localKey=prefix+p.legacy_id,raw=localStorage.getItem(localKey),activity='storage:'+prefix.slice(0,-1);
   if(raw!==null&&((baseline['storage:'+localKey]!==undefined&&baseline['storage:'+localKey]!==raw)||(prefix==='sdnature_progress_'&&baseline['storage:'+localKey]===undefined&&!before.some(x=>x.activity_key===activity)))){
    try{
     await writeProgress(p,activity,JSON.parse(raw),revision[p.id+':'+activity]||0);
     baseline['storage:'+localKey]=raw;saveMeta();
    }catch(e){log(e);return}
   }
  }
  logs[p.id]=await fetchProgress(p.id);
 }
 const previous=new Set(allowedProfileIds);
 const next=new Set(permitted.map(p=>p.legacy_id));
 // Zneplatni lokální kopie profilů, kterým rodič právě odebral přístup.
 for(const id of previous)if(!next.has(id)){
  const oldPs=json(PROFILES,{});
  if(oldPs[id]){delete oldPs[id];localStorage.setItem(PROFILES,JSON.stringify(oldPs))}
 }
 linked=primary;
 localStorage.setItem('sd866_linked_legacy',primary.legacy_id);
 localStorage.setItem(MODE_KEY,'child');
 await pullSchoolChild(account.family_id);
 allowedProfileIds=next;
 mirror(permitted,logs);
 status('Zařízení připojeno. Dostupné profily: '+permitted.map(p=>p.display_name).join(', ')+'.');
 renderChild();
}
async function pairDevice(code,legacyId){if(!isReady())throw Error('Přihlas se jako rodič.');const p=remote.find(x=>x.legacy_id===legacyId&&!x.deleted_at);if(!p)throw Error('Profil není dostupný.');
 await net('/rest/v1/rpc/sd_pair_device',{method:'POST',body:{p_pairing_code:code,p_profile_id:p.id}},true);status('Zařízení úspěšně přiřazeno k profilu '+p.display_name+'.');
}
function buildUI(){if($('sd866Cloud'))return;
 const admin=$('authAdmin'),gate=$('authGate');if(!admin||!gate)return;
 const panel=document.createElement('section');panel.id='sd866Cloud';panel.className='sd866-cloud';
 panel.innerHTML=`<h3>☁️ Centrální databáze 50.8.67</h3>
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
 <div id="sd866PairPanel" hidden><p>Na tomto telefonu vytvoř kód. Rodič jej zadá ve své rodičovské správě a schválí přístup.</p><button id="sd866Code" type="button">Vytvořit párovací kód</button><button id="sd866CheckPair" type="button">Zkontrolovat párování</button><button id="sd866Unpair" type="button">Odpojit toto zařízení</button><strong id="sd866CodeText"></strong><p id="sd866PairMessage" role="status" aria-live="polite">Stiskni „Vytvořit párovací kód“.</p></div>`;
 gate.querySelector('.authbox')?.append(row);
 const css=document.createElement('link');css.rel='stylesheet';css.href='./assets/css/cloud-50-8-66.css';document.head.append(css);
 $('sd866Login').onclick=()=>action(async()=>auth('login',$('sd866Email').value.trim(),$('sd866Password').value),true);
 $('sd866Register').onclick=()=>action(async()=>auth('signup',$('sd866Email').value.trim(),$('sd866Password').value),true);
 $('sd866Import').onclick=()=>action(importLocal);
 $('sd866Sync').onclick=()=>action(async()=>{if(deviceToken)await syncDevice(true);else await syncParent();if(isReady())await syncSchoolParent()});
 $('sd866Backup').onclick=downloadBackup;
 $('sd866Logout').onclick=()=>{putSession(null);family=null;remote=[];linked=null;localStorage.removeItem(MODE_KEY);status('Cloud odhlášen. Místní záloha nebyla smazána.');renderCloud()};
 $('sd866Pair').onclick=()=>action(()=>pairDevice($('sd866PairCode').value.trim().toUpperCase(),$('sd866PairProfile').value));
 $('sd866PairStart').onclick=()=>{const panel=$('sd866PairPanel');panel.hidden=!panel.hidden;panel.dataset.open=panel.hidden?'0':'1';$('sd866PairStart').setAttribute('aria-expanded',String(!panel.hidden));renderChild();if(!panel.hidden){childMessage(pairCode?'Párovací kód je vytvořen. Předej ho rodiči.':'Stiskni „Vytvořit párovací kód“. Pokud se objeví chyba, uvidíš její vysvětlení tady.');panel.scrollIntoView?.({block:'nearest',behavior:'smooth'});}};
 $('sd866Code').onclick=()=>action(createCode,false,true);
 $('sd866CheckPair').onclick=()=>action(verifyChild,false,true);
 $('sd866Unpair').onclick=()=>{if(!confirm('Odpojit toto zařízení od cloudu? Místní záloha nebude smazána.'))return;
   putSession(null);revokeLocalChild();localStorage.removeItem(MODE_KEY);localStorage.removeItem('sd866_linked_legacy');pairCode='';renderChild();location.reload()};
 renderCloud();renderChild();
}
async function action(fn,clear=false,forChild=false){if(working)return;working=true;const buttons=document.querySelectorAll('#sd866Cloud button,#sd866ChildPair button');buttons.forEach(b=>b.disabled=true);
 try{if(clear)status('Ověřuji přihlášení…');if(forChild)childMessage('Pracuji, kontroluji připojení k Supabase…');await fn();if(clear)renderCloud()}catch(e){log(e);if(forChild)childMessage(lastError,true)}finally{working=false;buttons.forEach(b=>b.disabled=false)}}
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
function renderChild(){if($('sd866CodeText'))$('sd866CodeText').textContent=pairCode?'PÁROVACÍ KÓD: '+pairCode:'';if(linked)childMessage('Připojeno: '+linked.display_name+'. Můžeš otevřít svůj profil.');else if(mode()==='child-pending'&&pairCode)childMessage('Čekám na potvrzení rodiče. Kód je uvedený výše.');}
// 50.8.67: trvalý token tohoto zařízení dovoluje pouze číst profily a
// zapisovat studijní výsledky. NIKDY neumožňuje vytvoření/mazání profilu.
// Rodičův cloudový JWT se při přechodu na dítě odstraní.
const makeDeviceToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function registerSyncDevice(){
 if(!isReady()||mode()!=='parent')return false;
 if(deviceToken)return true;
 const token=makeDeviceToken();
 await net('/rest/v1/rpc/sd_register_sync_device',{method:'POST',body:{p_token:token}},true);
 deviceToken=token;localStorage.setItem(DEVICE_KEY,token);deviceReady=false;
 await syncDevice(true);return true;
}
async function pullDevice(){
 if(!deviceToken)return null;
 const info=await net('/rest/v1/rpc/sd_sync_pull',{method:'POST',body:{p_token:deviceToken}},false);
 if(!info||!Array.isArray(info.profiles)||!Array.isArray(info.progress))throw Error('Neúplná odpověď cloudu');
 if(info.school_config)window.SDGradeSchools871?.applyRemote?.(info.school_config,info.school_revision);
 const rows=info.profiles;remote=rows;
 const grouped={};for(const p of info.progress)(grouped[p.profile_id]??=[]).push(p);
 // Prázdná databáze nesmí smazat dosud neimportované místní profily.
 if(rows.length)mirror(rows,grouped);
 for(const row of rows){for(const p of grouped[row.id]||[])revision[row.id+':'+p.activity_key]=Number(p.revision)}
 saveMeta();deviceReady=true;deviceLastPoll=Date.now();
 lastSync=new Date().toLocaleTimeString('cs-CZ');return rows;
}
async function pushDevice(row,activity,data,raw,baselineKey){
 const key=row.id+':'+activity;
 if(conflicts.has(key))return;
 try{
  const res=await net('/rest/v1/rpc/sd_sync_push',{
    method:'POST',body:{p_token:deviceToken,p_profile_id:row.id,p_activity:activity,p_data:data,p_revision:Number(revision[key]||0)}
  },false);
  revision[key]=Number(res.revision);baseline[baselineKey]=raw;deviceLastSend=Date.now();saveMeta();
 }catch(e){
  if(/konflikt|reviz/i.test(String(e.message))){conflicts.add(key);backupLocal();
    status('Konflikt výsledků: místní data byla zachována. Nestahuj ani nemaž profily; použij zálohu.',true)}
  throw e;
 }
}
async function syncDevice(forcePull=false){
 if(!deviceToken||deviceBusy||!navigator.onLine||mode()==='child'||mode()==='child-pending'||document.hidden)return;
 deviceBusy=true;
 try{
  if(!deviceReady)await pullDevice();
  const current=json(PROFILES,{});
  for(const row of remote.filter(x=>!x.deleted_at)){
   const id=row.legacy_id,p=current[id],raw=p?JSON.stringify(p):null;
   if(p&&baseline[id]!==undefined&&raw!==baseline[id]){
    await pushDevice(row,'legacy_profile',p,raw,id);
   }
   for(const prefix of ['sd860_martin_progress_','sd864_cermat_priprava_','sdnature_progress_','sd878_extra_practice_']){
    const k=prefix+id,r=localStorage.getItem(k),baselineKey='storage:'+k;
    if(r===null||baseline[baselineKey]===r)continue;
    let data;try{data=JSON.parse(r)}catch{continue}
    if(!data||typeof data!=='object'||Array.isArray(data))continue;
    await pushDevice(row,'storage:'+prefix.slice(0,-1),data,r,baselineKey);
   }
  }
  if(forcePull||Date.now()-deviceLastPoll>25000)await pullDevice();
  if(!conflicts.size&&Date.now()-deviceLastSend<18000)
   status('Automaticky synchronizováno v '+new Date().toLocaleTimeString('cs-CZ')+'.');
 }catch(e){
  // Připojení může dočasně vypadnout. Původní výsledky nikdy nemažeme.
  if(!String(e.message).includes('Konflikt'))log(e);
 }finally{deviceBusy=false}
}
async function init(){
 buildUI();
 try{
  // Restricted device token works even when the child is logged in locally.
  if(session?.access_token&&mode()==='parent'){
    await loadParent();
    if(deviceToken){deviceReady=true;deviceLastPoll=Date.now();}
  }else if(deviceToken&&mode()==='parent')await syncDevice(true);
  if(session?.access_token&&(mode()==='child'||mode()==='child-pending'))await verifyChild();
 }catch(e){log(e)}
}
function publicEntry(id){return mode()!=='child'||allowedProfileIds.has(id)}
async function canEnter(id){if(mode()!=='child')return true;
 try{await verifyChild();return allowedProfileIds.has(id)}catch(e){status('Bez internetového ověření nelze změnit profil. Zkus se připojit.',true);return false}
}
function lockParentOnChild(){
 if(mode()==='parent'&&session){
  putSession(null);family=null;renderCloud();
  status(deviceToken?'Rodičovská správa uzamčena. Výsledky se dále automaticky synchronizují.':'Rodičovská správa uzamčena. Pro nastavení automatické synchronizace přihlas rodiče znovu.');
  if(deviceToken)setTimeout(()=>syncDevice(true),700);
 }
}
window.SDCloud866={syncSchoolParent,isReady,isControlled,mode,publicEntry,canEnter,lockParentOnChild,createProfile,renameProfile,deleteProfile,pullParent,syncParent,backupLocal,downloadBackup,refreshDevice:verifyChild,syncDevice,registerSyncDevice,requestParent:(path,options={})=>{if(!isReady())throw Error('Tato akce vyžaduje přihlášeného rodiče.');return net(path,options,true);},ensureChildIdentity,requestCloud:(path,options={})=>net(path,options,true)};
setTimeout(init,0);
let childLastVerify=0;
function automaticSync(){
 if(document.hidden||working)return;
 if(deviceToken&&mode()==='parent')syncDevice();
 if(session?.access_token&&(mode()==='child'||mode()==='child-pending')&&Date.now()-childLastVerify>28000){childLastVerify=Date.now();verifyChild().catch(log);}
}
window.addEventListener('focus',automaticSync);
window.addEventListener('online',automaticSync);
window.addEventListener('pageshow',automaticSync);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)automaticSync()});
window.addEventListener('school-account',()=>setTimeout(automaticSync,600));
window.addEventListener('sd871-school-config-change',()=>{if(isReady())setTimeout(syncSchoolParent,250)});
setInterval(automaticSync,9000);
// Dětské telefony ve speciálním spárovaném režimu ověřují vlastní JWT každých 30 s.

})();
