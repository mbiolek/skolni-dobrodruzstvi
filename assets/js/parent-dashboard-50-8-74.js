/* Školní dobrodružství 50.8.74: přehledná rodičovská správa a párování bez opisování. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const family=()=>window.SDCloud866;
const mode=()=>family()?.mode?.()||localStorage.getItem('sd866_device_mode')||'';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const request=(path,opts)=>family().requestParent(path,opts);
let loading=false,lastRefresh=0,pairRequest='';
function status(message,error=false){const el=$('sd874Status');if(el){el.textContent=message;el.classList.toggle('error',error)}}
function tabs(){
 const admin=$('authAdmin');
 if(!admin||$('sd874Dashboard'))return;
 const h=admin.querySelector(':scope > h2');
 const dashboard=document.createElement('div');dashboard.id='sd874Dashboard';
 dashboard.innerHTML='<nav id="sd874Tabs" aria-label="Rodičovská správa"><button type="button" data-tab="profiles">Profily dětí</button><button type="button" data-tab="devices">Zařízení a přístupy</button><button type="button" data-tab="schools">Školy a plány</button><button type="button" data-tab="study">Výsledky a testování</button></nav><div id="sd874TabProfiles" class="sd874-tab"></div><div id="sd874TabDevices" class="sd874-tab" hidden></div><div id="sd874TabSchools" class="sd874-tab" hidden></div><div id="sd874TabStudy" class="sd874-tab" hidden></div>';
 h?.insertAdjacentElement('afterend',dashboard);
 const profiles=$('sd874TabProfiles'),devices=$('sd874TabDevices'),schools=$('sd874TabSchools'),study=$('sd874TabStudy');
 const directNodes=[...admin.children].filter(el=>el!==dashboard&&el!==h);
 for(const node of directNodes){
  if(node.id==='sd866Cloud')devices.append(node);
  else if(node.id==='sd860ParentTool'||node.classList.contains('authrow'))study.append(node);
  else if(node.classList.contains('sd54-schools-btn'))schools.append(node);
  else if(node.id==='adminChildren'||node.id==='adminMessage'||node.classList.contains('sd872-auth-details')||node.tagName==='H3')profiles.append(node);
 }
 const schoolButton=document.createElement('button');schoolButton.type='button';schoolButton.className='sd874-school-button';schoolButton.textContent='Otevřít správu dětí, škol a ročníků';
 schoolButton.addEventListener('click',()=>{if(!document.body.classList.contains('parent-role'))return;document.body.classList.remove('sd54-admin-open');window.SDSchoolPlans52?.manage?.(true)});
 schools.prepend(schoolButton);
 const schoolInfo=document.createElement('p');schoolInfo.textContent='Přiřazuj školy každému dítěti zvlášť. Martinův autoelektrikář je oddělený od základních škol.';schools.append(schoolInfo);
 const title=document.createElement('h3');title.textContent='Připojená zařízení a oprávnění';devices.prepend(title);
 const empty=document.createElement('p');empty.textContent='Pouze rodič smí schvalovat zařízení, přidávat profily a měnit jejich viditelnost.';devices.insertBefore(empty,title.nextSibling);
 document.querySelectorAll('#sd874Tabs button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
 switchTab('profiles');
}
function switchTab(which){
 for(const [tab,id] of [['profiles','sd874TabProfiles'],['devices','sd874TabDevices'],['schools','sd874TabSchools'],['study','sd874TabStudy']]){
  $(id).hidden=tab!==which;
  const btn=document.querySelector('#sd874Tabs [data-tab="'+tab+'"]');btn?.setAttribute('aria-selected',String(tab===which));
 }
 if(which==='devices')refreshDevices(true);
}
function addDevices(){
 const connected=$('sd866Connected');if(!connected||$('sd874Access'))return;
 const section=document.createElement('section');section.id='sd874Access';
 section.innerHTML='<h4>Schválené telefony a počítače</h4><p>Zaškrtni, které profily se na konkrétním zařízení zobrazí. Hlavní profil musí zůstat povolený.</p><button id="sd874Refresh" type="button">Aktualizovat seznam zařízení</button><div id="sd874Status" role="status" aria-live="polite"></div><div id="sd874DeviceList"></div>';
 connected.append(section);
 $('sd874Refresh').addEventListener('click',()=>refreshDevices(true));
 $('sd874DeviceList').addEventListener('change',async e=>{
  const checkbox=e.target.closest('input[data-device][data-profile]');if(!checkbox||loading)return;
  const checked=checkbox.checked;checkbox.disabled=true;
  try{
   await request('/rest/v1/rpc/sd_set_device_profile_access',{method:'POST',body:{p_device_id:checkbox.dataset.device,p_profile_id:checkbox.dataset.profile,p_enabled:checked}});
   status('Přístup byl uložen a projeví se na připojeném zařízení.');await refreshDevices(true);
  }catch(err){checkbox.checked=!checked;status(err.message||String(err),true)}
  finally{checkbox.disabled=false}
 });
 $('sd874DeviceList').addEventListener('click',async e=>{
  const b=e.target.closest('button[data-action]');if(!b||loading)return;
  const device=b.dataset.device;
  if(b.dataset.action==='revoke'){
   if(!confirm('Odpojit toto zařízení a odebrat mu přístup ke všem profilům?'))return;
   try{await request('/rest/v1/sd_child_accounts?auth_user_id=eq.'+encodeURIComponent(device),{method:'DELETE'});status('Zařízení odpojeno.');await refreshDevices(true)}catch(err){status(err.message,true)}
  }else if(b.dataset.action==='rename'){
   const value=prompt('Pojmenování zařízení, například Martinův iPhone:',b.dataset.name||'');
   if(value===null)return;const name=value.trim().slice(0,60);if(!name)return;
   try{await request('/rest/v1/sd_child_accounts?auth_user_id=eq.'+encodeURIComponent(device),{method:'PATCH',body:{device_name:name}});status('Název zařízení uložen.');await refreshDevices(true)}catch(err){status(err.message,true)}
  }
 });
}
async function refreshDevices(force=false){
 if(!family()?.isReady?.()||!document.body.classList.contains('parent-role')||loading)return;
 if(!force&&Date.now()-lastRefresh<20000)return;
 loading=true;
 try{
  const f=await request('/rest/v1/sd_families?select=id&limit=1');
  if(!f.length){status('Rodinný cloud není nastaven.',true);return}
  const id=encodeURIComponent(f[0].id);
  const [accounts,profiles,access]=await Promise.all([
   request('/rest/v1/sd_child_accounts?family_id=eq.'+id+'&select=auth_user_id,profile_id,device_name,created_at&order=created_at.asc'),
   request('/rest/v1/sd_profiles?family_id=eq.'+id+'&deleted_at=is.null&select=id,display_name'),
   request('/rest/v1/sd_device_profile_access?family_id=eq.'+id+'&select=auth_user_id,profile_id')
  ]);
  const target=$('sd874DeviceList');if(!target)return;
  target.replaceChildren();
  if(!accounts.length){target.textContent='Zatím není spárované žádné dětské zařízení.'}
  accounts.forEach((account,index)=>{
   const base=profiles.find(p=>p.id===account.profile_id);
   const permitted=new Set(access.filter(a=>a.auth_user_id===account.auth_user_id).map(a=>a.profile_id));
   const article=document.createElement('article');article.className='sd874-device';
   const heading=document.createElement('h4');heading.textContent=account.device_name||'Zařízení '+(index+1);article.append(heading);
   const desc=document.createElement('p');desc.textContent='Hlavní profil: '+(base?.display_name||'neznámý')+' · Připojeno: '+new Date(account.created_at).toLocaleDateString('cs-CZ');article.append(desc);
   const choices=document.createElement('div');choices.className='sd874-profile-grid';
   profiles.forEach(p=>{
    const label=document.createElement('label'),input=document.createElement('input');
    input.type='checkbox';input.dataset.device=account.auth_user_id;input.dataset.profile=p.id;
    input.checked=permitted.has(p.id)||p.id===account.profile_id;
    input.disabled=p.id===account.profile_id;
    const words=document.createElement('span');words.textContent=p.display_name+(p.id===account.profile_id?' (hlavní)':'');
    label.append(input,words);choices.append(label);
   });
   article.append(choices);
   const tools=document.createElement('div');tools.className='sd874-actions';
   for(const [label,action] of [['Přejmenovat','rename'],['Odpojit','revoke']]){
    const button=document.createElement('button');button.type='button';button.dataset.action=action;button.dataset.device=account.auth_user_id;button.dataset.name=account.device_name||'';button.textContent=label;tools.append(button);
   }
   article.append(tools);target.append(article);
  });
  lastRefresh=Date.now();status('Seznam zařízení je aktuální. '+accounts.length+' připojených zařízení.');
 }catch(err){status('Zařízení nelze načíst: '+(err.message||String(err)),true)}
 finally{loading=false}
}
function initPairing(){
 const child=$('sd866PairPanel');if(child&&!$('sd874Share')){
  const send=document.createElement('button');send.type='button';send.id='sd874Share';send.textContent='Poslat rodiči párovací odkaz';
  send.addEventListener('click',async()=>{
   const code=(($('sd866CodeText')?.textContent)||'').match(/[A-HJ-NP-Z2-9]{16}/)?.[0];
   if(!code){$('sd866Code')?.click();$('sd866PairMessage').textContent='Nejdřív vytvoř kód. Potom klikni na „Poslat rodiči párovací odkaz“.';return}
   const u=new URL('./index.html',location.href);u.search='';u.hash='';u.searchParams.set('sdPair',code);
   try{
    if(navigator.share)await navigator.share({title:'Školní dobrodružství – připojení zařízení',url:u.href});
    else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(u.href);alert('Odkaz zkopírován. Pošli ho rodiči přes WhatsApp nebo zprávu.')}
    else prompt('Zkopíruj odkaz pro rodiče:',u.href);
   }catch(e){if(e.name!=='AbortError')prompt('Zkopíruj odkaz pro rodiče:',u.href)}
  });child.append(send);
  const info=document.createElement('p');info.textContent='Odkaz platí 15 minut. Rodič po otevření pouze vybere profil a potvrdí připojení.';child.append(info);
 }
 let input=$('sd866PairCode');
 if(!input)return;
 const url=new URL(location.href),incoming=url.searchParams.get('sdPair');
 if(incoming&&/^[A-HJ-NP-Z2-9]{16}$/.test(incoming)){
  pairRequest=incoming;sessionStorage.setItem('sd874-pair-request',incoming);
  url.searchParams.delete('sdPair');history.replaceState(history.state,'',url.href);
 }
 pairRequest=pairRequest||sessionStorage.getItem('sd874-pair-request')||'';
 if(pairRequest){
  input.value=pairRequest;
  if(document.body.classList.contains('parent-role')){
   document.body.classList.add('sd54-admin-open');switchTab('devices');
   input.scrollIntoView({block:'center'});
  }
 }
 $('sd866Pair')?.addEventListener('click',()=>{if(pairRequest){sessionStorage.removeItem('sd874-pair-request');pairRequest=''}});
}
function boot(){
 tabs();addDevices();initPairing();
 window.addEventListener('school-account',()=>setTimeout(()=>{initPairing();if(mode()==='parent'){if(pairRequest&&document.body.classList.contains('parent-role'))switchTab('devices');refreshDevices(true)}},200));
 window.addEventListener('pageshow',()=>refreshDevices());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDevices()});
 document.addEventListener('click',e=>{if(e.target.closest('#sd54-admin-open'))setTimeout(refreshDevices,150)},true);
 // Dětské zařízení automaticky rozpozná schválení, není třeba mačkat Zkontrolovat párování.
 setInterval(()=>{if(mode()==='child-pending'&&navigator.onLine&&!document.hidden)family()?.refreshDevice?.().catch(()=>{});},9000);
 setTimeout(()=>{addDevices();initPairing();refreshDevices(true)},900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,400),{once:true});else setTimeout(boot,400);
})();