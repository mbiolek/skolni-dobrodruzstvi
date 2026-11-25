
(()=>{'use strict';
const $=id=>document.getElementById(id),K='matematika-karticky-progress-v3-profiles',A='matematika-karticky-progress-v3-active',AUTH='skolni-auth-v1',RESUME='skolni-resume-v441',LIVE='skolni-live-v441',PERSIST='skolni-persistent-child-v452',STAMP='skolni-session-time-v455',LIMIT='skolni-lock-minutes-v455';
let config={},selected=null,setup=false,role=null,child=null,backgroundAt=0,lastInput=Date.now();
const timeout=()=>{let n=Number(localStorage.getItem(LIMIT)||15);return [5,15,30,60].includes(n)?n*60000:900000};
const stamp=()=>{try{sessionStorage.setItem(STAMP,String(Date.now()))}catch{}};
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')||{}}catch{return {}}};
const save=p=>localStorage.setItem(K,JSON.stringify(p));
function authRead(){try{config=JSON.parse(localStorage.getItem(AUTH)||'{}')||{}}catch{config={}}}
function hash(pin,salt){let a=2166136261;const str=salt+':'+pin;for(let r=0;r<16000;r++){for(let i=0;i<str.length;i++){a^=str.charCodeAt(i);a=Math.imul(a,16777619)}}return (a>>>0).toString(16)}
function salt(){return Array.from({length:4},()=>Math.floor(Math.random()*0xffffffff).toString(16)).join('')}
function pinValid(v){return /^\d{4,8}$/.test(v)}
function setCredential(id,pin){const s=salt();config[id]={salt:s,hash:hash(pin,s)};localStorage.setItem(AUTH,JSON.stringify(config))}
function check(id,pin){return config[id]&&hash(pin,config[id].salt)===config[id].hash}
function gate(keepResume=false){try{sessionStorage.removeItem(LIVE);sessionStorage.removeItem(STAMP);localStorage.removeItem(PERSIST);if(!keepResume)localStorage.removeItem(RESUME)}catch{}window.dispatchEvent(new CustomEvent('school-account',{detail:{id:null}}));document.body.classList.remove('child-role','parent-role');role=null;child=null;$('authAdmin').classList.remove('on');$('authExit').style.display='none';$('authGate').classList.remove('off');$('authPick').hidden=false;$('authPinPanel').hidden=true;renderUsers();document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('visible',el.id==='homeScreen'))}
function renderUsers(){
 authRead();const ps=read(),el=$('authUsers');el.replaceChildren();
 const mode=window.SDCloud866?.mode?.()||localStorage.getItem('sd866_device_mode');
 function add(id,name,icon){let btn=document.createElement('button');btn.className='userbtn';let sp=document.createElement('span');sp.textContent=icon;btn.append(sp);let title=document.createElement('strong');title.textContent=name;btn.append(title);btn.onclick=()=>choose(id,name);el.append(btn)}
 if(mode!=='child'&&mode!=='child-pending')add('parent','Rodič – správce','🔐');
 Object.entries(ps).forEach(([id,p])=>{if(mode==='child'||mode==='child-pending'){if(!window.SDCloud866?.publicEntry?.(id))return}add(id,p.name||'Dítě','🧒')});
}
async function choose(id,name){
 const cloud=window.SDCloud866;const mode=cloud?.mode?.()||localStorage.getItem('sd866_device_mode');
 if(mode==='child'||mode==='child-pending'){
  if(id==='parent'){alert('Rodičovská správa není na tomto zařízení přístupná.');return}
  if(!await cloud?.canEnter?.(id)){alert('Profil se nepodařilo ověřit v cloudu. Připoj se k internetu nebo požádej rodiče o nové párování.');return}
  // Přihlášení do dětského účtu ověřuje serverový JWT, nikoli místní PIN.
  enter(id);return;
 }
 selected=id;setup=!config[id];if(setup&&id!=='parent'){
  alert('Tento profil ještě nemá PIN. Požádej rodiče, aby jej nastavil ve správě profilů.');return
 }
 $('authPick').hidden=true;$('authPinPanel').hidden=false;
 $('authPinTitle').textContent=(setup?'Nastavení PIN: ':'Přihlášení: ')+name;
 $('authPinRepeatBox').hidden=!setup;
 $('authPinHelp').textContent=setup?'Vytvoř PIN pro tento profil.':'Zadej PIN tohoto profilu.';
 $('authError').textContent='';$('authPin').value='';$('authPinRepeat').value='';$('authPin').focus();
}
function sync(id){let ps=read();if(!ps[id])return;localStorage.setItem(A,id);for(const field of ['profile','enProfile','orderProfile','diagProfile']){let el=$(field);if(el){if(![...el.options].some(o=>o.value===id)){let o=document.createElement('option');o.value=id;o.textContent=ps[id].name;el.append(o)}el.value=id;el.dispatchEvent(new Event('change',{bubbles:false}))}}}
function enter(id){lastInput=Date.now();try{sessionStorage.setItem(LIVE,id);localStorage.removeItem(PERSIST);stamp()}catch{}window.dispatchEvent(new CustomEvent('school-account',{detail:{id}}));$('authGate').classList.add('off');role=id==='parent'?'parent':'child';child=role==='child'?id:null;if(child)window.SDCloud866?.lockParentOnChild?.();document.body.classList.add(role+'-role');$('authExit').style.display='block';if(child)sync(child);if(role==='parent'){renderAdmin();$('authAdmin').classList.add('on')}else $('authAdmin').classList.remove('on');window.dispatchEvent(new CustomEvent('school-resume-login',{detail:{id}}))}
$('authConfirm').onclick=()=>{const pin=$('authPin').value;if(!pinValid(pin)){$('authError').textContent='PIN musí mít 4 až 8 číslic.';return}if(setup){if(pin!==$('authPinRepeat').value){$('authError').textContent='PINy se neshodují.';return}setCredential(selected,pin);enter(selected)}else if(check(selected,pin))enter(selected);else $('authError').textContent='Nesprávný PIN.'};
$('authPin').addEventListener('keydown',e=>{if(e.key==='Enter')$('authConfirm').click()});$('authPinRepeat').addEventListener('keydown',e=>{if(e.key==='Enter')$('authConfirm').click()});$('authBack').onclick=()=>gate();$('authExit').onclick=()=>gate();$('adminLogout').onclick=()=>gate();
function adminMsg(s){$('adminMessage').textContent=s}
function renderAdmin(){
 const ps=read(),el=$('adminChildren');el.replaceChildren();
 Object.entries(ps).forEach(([id,p])=>{
  const row=document.createElement('div');row.className='authitem';
  const title=document.createElement('strong');title.textContent=p.name||id;row.append(title);
  const btn=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{try{await fn()}catch(e){adminMsg(e.message||String(e))}};row.append(b)};
  btn('Změnit PIN',()=>{
   const pin=prompt('Nový PIN pro '+p.name+' (4–8 číslic):');if(pin===null)return;
   if(!pinValid(pin)){adminMsg('PIN musí mít 4 až 8 číslic.');return}
   setCredential(id,pin);adminMsg('PIN byl změněn pouze na tomto zařízení. Na spárovaném telefonu se používá zabezpečené přihlášení zařízení.');
  });
  btn('Přejmenovat',async()=>{
   const n=prompt('Nové jméno',p.name);if(!n||!n.trim())return;
   const name=n.trim().slice(0,24),cloud=window.SDCloud866;
   if(cloud?.isControlled?.()){
     if(!cloud.isReady())throw Error('Cloud není přihlášen. Změna se z bezpečnostních důvodů neuložila.');
     await cloud.renameProfile(id,name);
   }else{const data=read();data[id].name=name;save(data)}
   renderAdmin();adminMsg('Jméno profilu změněno: '+name);
  });
  btn('Smazat',async()=>{
   if(!confirm('Opravdu smazat profil '+p.name+'? Po připojení k internetu zmizí ze všech spárovaných zařízení.'))return;
   const cloud=window.SDCloud866;
   if(cloud?.isControlled?.()){
     if(!cloud.isReady())throw Error('Cloud není dostupný. Profil nebyl smazán; zkus to po připojení.');
     await cloud.deleteProfile(id);
   }else{
     const data=read();delete data[id];save(data);
     delete config[id];localStorage.setItem(AUTH,JSON.stringify(config));
   }
   renderAdmin();renderUsers();adminMsg('Profil byl smazán: '+p.name);
  });
  el.append(row);
 });
}
$('adminCreate').onclick=async()=>{
 const name=$('adminNewName').value.trim(),pin=$('adminNewPin').value;
 if(!name||!pinValid(pin)){adminMsg('Zadej jméno a PIN o 4 až 8 číslicích.');return}
 const ps=read();if(Object.keys(ps).length>=12){adminMsg('Maximum je 12 dětských profilů.');return}
 const id='p'+Date.now(),p={name,memory:{},totals:{done:0,correct:0}},cloud=window.SDCloud866;
 try{
  if(cloud?.isControlled?.()){
   if(!cloud.isReady())throw Error('Cloud není ověřen. Profil se nevytvořil; zkus přihlášení.');
   await cloud.createProfile(id,p);
  }else{ps[id]=p;save(ps)}
  setCredential(id,pin);$('adminNewName').value='';$('adminNewPin').value='';renderAdmin();renderUsers();adminMsg('Profil vytvořen: '+name);
 }catch(e){adminMsg('Vytvoření se nezdařilo: '+(e.message||e))}
};
$('adminParentChange').onclick=()=>{let pin=$('adminParentNew').value;if(!pinValid(pin)){adminMsg('Nový PIN musí mít 4 až 8 číslic.');return}setCredential('parent',pin);$('adminParentNew').value='';adminMsg('Rodičovský PIN změněn.')};
function open(which){$('authAdmin').classList.remove('on');document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('visible',el.id===which+'Screen'));if(which==='english'){$('enProfile').dispatchEvent(new Event('change'))}window.scrollTo(0,0)}
$('adminMath').onclick=()=>open('math');$('adminEnglish').onclick=()=>open('english');
window.addEventListener('sd866-updated',()=>{renderUsers();if(role==='parent')renderAdmin();if(role==='child'&&!read()[child])gate(true)});
// All profile changes are confined to the authenticated child, even when older modules repopulate selectors.
document.addEventListener('change',e=>{if(role!=='child'||!child)return;if(['profile','enProfile','orderProfile','diagProfile'].includes(e.target.id)&&e.target.value!==child){e.stopImmediatePropagation();e.target.value=child}},true);
// The home navigation returns to a role-appropriate landing page.
document.addEventListener('click',e=>{if(!role)return;let b=e.target.closest('[data-home]');if(b&&role==='parent'){setTimeout(()=>{$('authAdmin').classList.add('on')},0)}},true);
// Existing admin controls cannot be activated while signed in as a child.
document.addEventListener('click',e=>{if(role!=='child')return;let b=e.target.closest('button');if(b&&['deleteProfile','addProfile','exportData','importData','parentExport','parentRefresh'].includes(b.id)){e.preventDefault();e.stopImmediatePropagation()}},true);
// Parent's home shows admin first; subject buttons are for children.
document.querySelectorAll('#homeScreen [data-open]').forEach(b=>b.addEventListener('click',()=>{if(role==='parent')$('authAdmin').classList.remove('on')}));
// Restore parent panel whenever the home screen becomes visible.
const obs=new MutationObserver(()=>{if(role==='parent'&&$('homeScreen').classList.contains('visible'))$('authAdmin').classList.add('on')});obs.observe($('homeScreen'),{attributes:true,attributeFilter:['class']});
// A backgrounded PWA may be reloaded by Android or the service worker. Reuse only
// this tab's authenticated session; a fresh tab still requires the child's PIN.
// Cold launch always requires PIN. A live same-tab session is valid only within the configured timeout.
try{
 authRead();
 if(window.__SD878Preview){
  // Isolated parent's sandbox: child screen is displayed directly, without
  // showing the login or pairing gate. The entire storage is in-memory only.
  const previewId=window.__SD878PreviewProfile;
  if(!previewId||!read()[previewId])throw Error('Testovací profil nelze načíst');
  enter(previewId);
  window.schoolDiagnostic?.('parent-preview','opened '+previewId);
 }else{
  const live=sessionStorage.getItem(LIVE),at=Number(sessionStorage.getItem(STAMP)||0);
  const valid=id=>id&&(id==='parent'||Boolean(read()[id]))&&Boolean(config[id]);
  if(valid(live)&&at&&Date.now()-at<timeout())enter(live);else gate(true);
 }
}catch(err){console.warn('Školní dobrodružství: náhled profilu',err);gate(true)}
// Lock after background inactivity without destroying the last-page snapshot.
document.addEventListener('visibilitychange',()=>{if(document.hidden){backgroundAt=Date.now();if(role)stamp()}else if(role){if(backgroundAt&&Date.now()-backgroundAt>=timeout())gate(true);else stamp();backgroundAt=0}});
window.addEventListener('pageshow',()=>{if(role){const at=Number(sessionStorage.getItem(STAMP)||0);if(at&&Date.now()-at>=timeout())gate(true)}});
// Timeout also applies if the screen stays open without interaction.
['pointerdown','keydown','touchstart','scroll'].forEach(evt=>document.addEventListener(evt,()=>{if(role){lastInput=Date.now();stamp()}},{passive:true}));
setInterval(()=>{if(role&&!document.hidden&&Date.now()-lastInput>=timeout())gate(true)},15000);
// Configurable parental timeout.
const lockSettings=document.createElement('div');lockSettings.className='authitem';lockSettings.innerHTML='<strong>Automatické zamčení profilu</strong><label for="schoolLockMinutes">Po kolika minutách vyžadovat PIN?</label><select id="schoolLockMinutes" style="font:inherit;padding:10px;border-radius:12px;margin:8px"><option value="5">5 minut</option><option value="15">15 minut (doporučeno)</option><option value="30">30 minut</option><option value="60">60 minut</option></select>';
$('authAdmin').append(lockSettings);const lockSelect=$('schoolLockMinutes');lockSelect.value=String(timeout()/60000);lockSelect.onchange=()=>{localStorage.setItem(LIMIT,lockSelect.value);adminMsg('Čas zamčení nastaven na '+lockSelect.value+' minut.');};
})();

