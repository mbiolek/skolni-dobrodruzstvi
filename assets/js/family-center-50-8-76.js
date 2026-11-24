/* Školní dobrodružství 50.8.76 – rodičovské centrum a skutečné schvalování zařízení */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const cloud=()=>window.SDCloud866;
const parentReady=()=>!!cloud()?.isReady?.()&&document.body.classList.contains('parent-role');
const RPC=(name,data={})=>cloud().requestParent('/rest/v1/rpc/'+name,{method:'POST',body:data});
const REST=path=>cloud().requestParent('/rest/v1/'+path);
const childRPC=(name,data={})=>cloud().requestCloud('/rest/v1/rpc/'+name,{method:'POST',body:data});
const local=k=>{try{return localStorage.getItem(k)}catch{return null}};
const localSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const localDel=k=>{try{localStorage.removeItem(k)}catch{}};
const titles={testing:'Testovací rozhraní',profiles:'Profily dětí',schools:'Školy a učivo',map:'Mapa postupu',devices:'Zařízení a párování',settings:'Nastavení',visibility:'Viditelnost profilů',results:'Výsledky dětí'};
const mainViews=['testing','profiles','schools','map','devices','settings'];
const icons={testing:'🧪',profiles:'👨‍👧‍👦',schools:'🏫',map:'🗺️',devices:'📱',settings:'⚙️',visibility:'👁',results:'📊'};
let center=null,active='',data={accounts:[],profiles:[],access:[],pending:[],syncDevices:[],details:[]};
let parentBusy=false,pendingSecret='',inviteToken='',childBusy=false;
let landingScheduled=false;
const notify=(text,error=false,id='sd876Notice')=>{const el=$(id);if(el){el.hidden=!text;el.textContent=String(text||'');el.classList.toggle('error',!!error)}};
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const add=(host,tag,cls,text)=>{const x=make(tag,cls,text);host.append(x);return x};
const ctl=(label,callback,cls='')=>{const b=make('button','sd876-btn '+cls,label);b.type='button';b.addEventListener('click',callback);return b};
function profileChoice(placeholder='Vyber profil'){
 const sel=make('select','sd876-select');
 const v=document.createElement('option');v.value='';v.textContent=placeholder;sel.append(v);
 for(const p of data.profiles){const o=document.createElement('option');o.value=p.id;o.textContent=p.display_name;sel.append(o)}
 return sel;
}
function appURL(key,secret){
 const u=new URL('./index.html',location.href);u.search='';u.hash=key+'='+encodeURIComponent(secret);return u.toString();
}
async function share(title,url){
 try{if(navigator.share){await navigator.share({title,url});return}
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);alert('Odkaz je zkopírovaný. Pošli ho přes WhatsApp nebo zprávu.');return}
  prompt('Zkopíruj odkaz:',url);
 }catch(err){if(err?.name!=='AbortError')prompt('Zkopíruj odkaz:',url)}
}
function extractLink(){
 const h=location.hash||'';
 const match=/^#sd876(request|invite)=([0-9a-f]{48})$/.exec(h);
 if(!match)return;
 const key=match[1]==='request'?'sd876_parent_request':'sd876_child_invite';
 try{sessionStorage.setItem(key,match[2])}catch{}
 history.replaceState(history.state,'',location.pathname+location.search);
}
function sectionTop(target,desc){target.replaceChildren();if(desc)add(target,'p','sd876-intro',desc)}
async function getData(){
 if(!parentReady())throw Error('Přihlas rodinný cloud v sekci Nastavení.');
 const f=await REST('sd_families?select=id&limit=1');
 if(!f.length)throw Error('Rodina zatím není připojená.');
 const id=encodeURIComponent(f[0].id);
 const [accounts,profiles,access,pending,syncDevices,details]=await Promise.all([
  REST('sd_child_accounts?family_id=eq.'+id+'&select=auth_user_id,profile_id,device_name,created_at&order=created_at.asc'),
  REST('sd_profiles?family_id=eq.'+id+'&deleted_at=is.null&select=id,display_name&order=created_at.asc'),
  REST('sd_device_profile_access?family_id=eq.'+id+'&select=auth_user_id,profile_id'),
  RPC('sd_876_pending_requests'),
  RPC('sd_876_parent_sync_devices'),
  RPC('sd_878_parent_devices').catch(()=>[])
 ]);
 data={accounts,profiles,access,pending:Array.isArray(pending)?pending:[],syncDevices:Array.isArray(syncDevices)?syncDevices:[],details:Array.isArray(details)?details:[]};
 updateBadge();return data;
}
function updateBadge(){
 const n=data.pending.length,count=$('sd876PendingCount');
 if(count){count.textContent=n?String(n)+' žádostí čeká na schválení':'Žádné čekající žádosti';count.hidden=!parentReady()||n===0}
 const dot=$('sd876PendingDot');if(dot){dot.hidden=!n;dot.textContent=n}
 renderHomeRequests();
}
function renderHomeRequests(){
 const host=$('sd878QuickRequests');if(!host)return;
 host.replaceChildren();host.hidden=!data.pending.length||!parentReady()||!!active;
 if(host.hidden)return;
 add(host,'h3','sd878-pending-title','Žádosti o připojení čekají na schválení');
 for(const req of data.pending.slice(0,4)){
  const card=add(host,'article','sd878-quick-request');
  add(card,'strong','',req.device_name||'Nové zařízení');
  const hint=window.SDDevice878?.parseAgent?.(req.user_agent||'')||{};
  add(card,'small','',hint.kind&&hint.platform?'Typ: '+hint.kind+' · '+hint.platform:'Typ zařízení nebyl rozpoznán');
  const select=profileChoice();card.append(select);
  const row=add(card,'div','sd876-action-row');
  row.append(ctl('Schválit',async()=>{
   if(!select.value){notify('Vyber dítě, ke kterému se má zařízení připojit.',true);return}
   await approve({p_request_id:req.id,p_profile_id:select.value});
  },'sd876-primary'));
  row.append(ctl('Zamítnout',()=>reject({p_request_id:req.id}),'sd876-secondary'));
 }
 if(data.pending.length>4)host.append(ctl('Zobrazit všechny žádosti',()=>openView('devices')));
}
function shell(){
 const admin=$('authAdmin');if(!admin||$('sd876Center'))return;
 admin.dataset.sd876='1';
 center=make('section','sd876-center');center.id='sd876Center';
 const header=add(center,'div','sd876-head');
 const heading=add(header,'div','');
 add(heading,'h2','', 'Rodičovské centrum');
 add(heading,'p','','Všechny děti, zařízení a školy na jednom místě.');
 const cloudStatus=add(header,'span','sd876-connection','Cloud');
 cloudStatus.id='sd876CloudStatus';
 const exitButton=ctl('Změnit profil',()=>document.getElementById('authExit')?.click(),'sd877-change-profile');
 exitButton.id='sd877ChangeProfile';
 header.append(exitButton);
 const badge=add(center,'button','sd876-pending');
 badge.id='sd876PendingCount';badge.type='button';badge.hidden=true;
 const menu=add(center,'div','sd876-menu');menu.id='sd876Menu';
 for(const id of mainViews){
  const b=make('button','sd876-tile sd878-tile sd878-tile-'+id);b.type='button';b.dataset.view=id;
  add(b,'span','sd876-tile-icon',icons[id]);
  const art=document.createElement('img');art.className='sd878-tile-art';art.alt='';art.loading='lazy';
  art.src=(id==='profiles'||id==='devices')?'./assets/ikony/parent-50-8-78/'+(id==='profiles'?'profiles.svg':'devices.svg'):'./assets/ikony/cards-clean-50-8-50/'+({testing:'test',schools:'kapitoly-podle-ucebnice',map:'mapa-dobrodruzstvi',settings:'nastaveni'}[id]||'nastaveni')+'.webp';
  b.prepend(art);
  add(b,'strong','sd876-tile-title',titles[id]);
  add(b,'small','sd876-tile-info',{
   testing:'Obsah očima dětí, bez změny XP',
   profiles:'Školy, ročníky, PINy',
   schools:'Předměty, slovíčka, testy',
   map:'Dobrodružná cesta a pokrok',
   devices:'Žádosti, viditelnost, typy',
   settings:'Cloud, avataři, prostředí',
   visibility:'Oprávnění zařízení',
   results:'XP, testy a výsledky'
  }[id]);
  if(id==='devices'){const dot=add(b,'span','sd876-count');dot.id='sd876PendingDot';dot.hidden=true}
  b.addEventListener('click',()=>openView(id));menu.append(b);
 }
 const quick=add(center,'section','sd878-quick-requests');quick.id='sd878QuickRequests';quick.hidden=true;
 const back=ctl('← Zpět do rodičovského centra',returnToCenter,'sd876-back');
 back.id='sd876Back';back.hidden=true;center.append(back);
 const heading2=add(center,'h3','sd876-section-title');heading2.id='sd876Title';heading2.hidden=true;
 const note=add(center,'p','sd876-message');note.id='sd876Notice';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.hidden=true;
 const panes=add(center,'section','sd876-panes');panes.id='sd876Panes';
 const diagShortcut=make('section','sd877-log-shortcut');
 diagShortcut.id='sd877LogShortcut';
 add(diagShortcut,'strong','','Diagnostika aplikace');
 add(diagShortcut,'p','','Potřebuješ nahlásit chybu? Ulož diagnostický log jako textový soubor (TXT).');
 const saveLog=ctl('Uložit diagnostický log (TXT)',()=>{
  const exportButton=document.getElementById('diag456Export');
  if(exportButton){exportButton.click();notify('Diagnostický log byl připraven ke stažení.','', 'sd876Notice')}
  else notify('Export logu teď není dostupný.','true','sd876Notice');
 },'sd876-primary');
 saveLog.id='sd877ExportLog';
 diagShortcut.append(saveLog);
 menu.insertAdjacentElement('afterend',diagShortcut);
 for(const key of Object.keys(titles)){const pane=add(panes,'div','sd876-pane');pane.dataset.pane=key;pane.hidden=true}
 const previous=admin.querySelector('#sd874Dashboard');
 (previous||admin.querySelector('h2'))?.insertAdjacentElement(previous?'beforebegin':'afterend',center);
 const move=(selector,to)=>{const el=admin.querySelector(selector);if(el){el.hidden=false;to.append(el)}return el};
 move('#sd874TabProfiles',pane('profiles'));move('#sd874TabSchools',pane('schools'));
 const study=move('#sd874TabStudy',pane('results'));
 const tools=study?.querySelector('.sd875-tools');if(tools)move('.sd875-tools',pane('settings'));
 const diagSettings=make('div','sd877-log-settings');
 add(diagSettings,'h4','','Diagnostika aplikace');
 add(diagSettings,'p','','Záznamy pro hledání chyb v navigaci, aktualizacích a synchronizaci.');
 diagSettings.append(ctl('Uložit log jako TXT',()=>document.getElementById('diag456Export')?.click(),'sd876-primary'));
 pane('settings').append(diagSettings);
 // Rodičovský PIN patří do Nastavení, ne mezi dětské profily.
 for(const detail of [...(pane('profiles')?.querySelectorAll('details.sd872-auth-details')||[])]){
  if(detail.querySelector('summary')?.textContent.includes('rodičovského PINu'))pane('settings').prepend(detail);
 }
 move('#sd866Cloud',pane('settings'));
 // Legacy controls preserved, but now live inside the dedicated sections.
 const cloudEl=$('sd866Cloud');
 if(cloudEl){const details=make('details','sd876-cloud-details'),summary=add(details,'summary','','Rodinný cloud – přihlášení a synchronizace');cloudEl.before(details);details.append(cloudEl);details.open=!parentReady()}
 // Hide the outdated duplicate device matrix; the new one is rendered from RLS-backed data.
 const legacy=$('sd874Access');if(legacy)legacy.hidden=true;
 const school=pane('schools');
 const redundant=school?.querySelectorAll('.sd874-school-button')||[];
 for(let i=1;i<redundant.length;i++)redundant[i].remove();
 const msg=add(pane('settings'),'p','sd876-hint','Zde upravíš prostředí, avatary, rodičovský PIN a zabezpečení.');
 const results=pane('results');
 const stats=make('section','sd876-results');stats.id='sd876Results';results.prepend(stats);
 renderResults();
 const testing=pane('testing');add(testing,'div','sd878-test-portal').id='sd878Testing';
 const map=pane('map');add(map,'div','sd878-progress-map').id='sd878Map';
 const profilesHost=pane('profiles');const detailed=make('div','sd878-child-management');detailed.id='sd878Profiles';profilesHost.prepend(detailed);
 const schoolHost=pane('schools');const catalog=make('div','sd878-school-management');catalog.id='sd878Schools';schoolHost.prepend(catalog);
 const dev=pane('devices');
 sectionTop(dev,'Zařízení může požádat o připojení bez opisování dlouhého kódu. Schválení provádí pouze rodič.');
 add(dev,'div','sd876-device-tools').id='sd876DeviceTools';
 add(dev,'div','sd876-request-list').id='sd876Requests';
 add(dev,'div','sd876-devices-list').id='sd876Devices';
 const toVisibility=ctl('Nastavit viditelnost profilů na zařízeních',()=>openView('visibility'),'sd876-primary');
 toVisibility.id='sd878OpenVisibility';dev.append(toVisibility);
 const vis=pane('visibility');
 sectionTop(vis,'U každého spárovaného zařízení nastav, které dětské profily smí zobrazit. Hlavní profil zařízení zůstává povolený.');
 add(vis,'div','sd876-matrix').id='sd876Visibility';
 add(vis,'p','sd876-hint','Povolení profilu neuděluje práva rodiče. Změny se promítnou při připojení zařízení k internetu.');
 $('sd876PendingCount')?.addEventListener('click',()=>openView('devices'));
 openView('');
}
const pane=key=>center?.querySelector('[data-pane="'+key+'"]');
function returnToCenter(){
 const route=window.SDNavigation?.current?.()||'';
 if(route.startsWith('parentCenter:')&&!route.endsWith(':root'))window.SDNavigation.back();
 else openView('');
}
function restoreParentView(view=''){
 if(!document.body.classList.contains('parent-role'))return;
 document.body.classList.add('sd54-admin-open');
 document.getElementById('authAdmin')?.classList.add('on');
 openView(view||'');
}
function activateParentLanding(){
 if(landingScheduled)return;
 landingScheduled=true;
 setTimeout(()=>{
  landingScheduled=false;
  if(!document.body.classList.contains('parent-role')||!document.getElementById('authGate')?.classList.contains('off'))return;
  if(!document.getElementById('homeScreen')?.classList.contains('visible'))return;
  if(document.body.classList.contains('sd52-open')||document.getElementById('sd52')?.hidden===false)return;
  restoreParentView('');
 },85);
}
window.SDFamilyCenter877={restore:restoreParentView,showHome:activateParentLanding,back:returnToCenter,active:()=>active};
async function openView(view){
 if(!center)return;active=view||'';
 center.dataset.view=active||'root';
 $('sd876Menu').hidden=!!view;$('sd876Back').hidden=!view;
 $('sd876Title').hidden=!view;
 const logShortcut=$('sd877LogShortcut');if(logShortcut)logShortcut.hidden=!!view;
 const quick=$('sd878QuickRequests');if(quick)quick.hidden=!!view||!data.pending.length;
 const exit=$('sd877ChangeProfile');if(exit)exit.hidden=!!view;
 if(view)$('sd876Title').textContent=titles[view];
 for(const key of Object.keys(titles))pane(key).hidden=key!==view;
 const notice=$('sd876Notice');notice.hidden=true;notice.textContent='';
 center.classList.toggle('sd876-detail-open',!!view);
 if(view==='devices'||view==='visibility'){
  if(!parentReady()){showCloudPrompt(view==='devices'?'sd876DeviceTools':'sd876Visibility')}
  else await refreshData(view,true);
 }
 if(view==='results')renderResults();
 if(view==='testing'||view==='profiles'||view==='schools'||view==='map'||view==='settings')window.SDParent878?.show?.(view);
 updateCloud();
 const layer=document.getElementById('authAdmin');
 if(layer)layer.scrollTop=0;
}
function showCloudPrompt(id){
 const dest=$(id);if(!dest)return;dest.replaceChildren();
 add(dest,'p','sd876-hint','Pro schvalování a správu zařízení je potřeba přihlášení k rodinnému cloudu.');
 dest.append(ctl('Přejít do nastavení cloudu',()=>{openView('settings');const d=center?.querySelector('.sd876-cloud-details');if(d)d.open=true},'sd876-primary'));
}
async function refreshData(view,force=false){
 if(!parentReady()){if(view)showCloudPrompt(view==='devices'?'sd876DeviceTools':'sd876Visibility');return}
 if(parentBusy)return;parentBusy=true;
 try{
  await getData();
  renderDeviceTools();renderPending();renderDevices();renderVisibility();
  notify('Údaje načteny z rodinného cloudu.');
 }catch(err){notify(err.message||String(err),true)}
 finally{parentBusy=false}
}
function renderDeviceTools(){
 const target=$('sd876DeviceTools');if(!target)return;
 target.replaceChildren();
 const row=add(target,'div','sd876-action-row');
 row.append(ctl('Zobrazit QR kód pro dítě',createInvite,'sd876-primary'));
 row.append(ctl('Sdílet rodinnou pozvánku',async()=>{
  if(!inviteToken)await createInvite();
  if(inviteToken)await share('Připojit zařízení – Školní dobrodružství',appURL('sd876invite',inviteToken));
 }));
 row.append(ctl('Aktualizovat žádosti',()=>refreshData('devices',true),'sd876-secondary'));
 const qr=add(target,'div','sd876-qr-panel');qr.id='sd876QR';qr.hidden=true;
 add(target,'p','sd876-hint','Dítě naskenuje QR kód nebo otevře pozvánku. Potom odešle žádost a ty ji schválíš níže.');
 const linkPanel=add(target,'div','sd876-link-review');linkPanel.id='sd876LinkReview';
 const codePanel=add(target,'details','sd876-fallback');
 add(codePanel,'summary','','Záložní možnost: šestimístný kód');
 add(codePanel,'p','','Když nejde poslat odkaz ani použít QR, dítě ti nadiktuje šest číslic.');
 const input=add(codePanel,'input','sd876-input');input.id='sd876Code';input.placeholder='123456';input.maxLength=6;input.inputMode='numeric';
 const select=profileChoice();select.id='sd876CodeProfile';codePanel.append(select);
 codePanel.append(ctl('Schválit kód',async()=>{
  const code=$('sd876Code').value.trim(),pid=$('sd876CodeProfile').value;
  if(!/^[0-9]{6}$/.test(code)||!pid){notify('Vyber profil a zadej právě šest číslic.',true);return}
  await approve({p_code:code,p_profile_id:pid});
 },'sd876-primary'));
 reviewIncoming();
}
async function createInvite(){
 if(!parentReady()){showCloudPrompt('sd876DeviceTools');return}
 try{
  const res=await RPC('sd_876_make_invite');
  inviteToken=res.invite;
  const url=appURL('sd876invite',inviteToken);
  const qr=$('sd876QR');if(!qr)return;
  qr.replaceChildren();qr.hidden=false;
  add(qr,'h4','','Rodinný QR kód');
  const image=add(qr,'div','sd876-qr-image');
  if(typeof window.QRCode==='function'){
   new window.QRCode(image,{text:url,width:190,height:190,colorDark:'#162e4c',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});
  }else add(qr,'p','','QR kód není k dispozici. Použij tlačítko pro sdílení odkazu.');
  add(qr,'p','sd876-hint','Pozvánka platí 15 minut. Zařízení se připojí až po tvém schválení.');
  qr.append(ctl('Poslat odkaz',()=>share('Rodinná pozvánka – Školní dobrodružství',url),'sd876-primary'));
 }catch(err){notify(err.message,true)}
}
function renderPending(){
 const host=$('sd876Requests');if(!host)return;
 host.replaceChildren();add(host,'h4','','Žádosti čekající na schválení');
 if(!data.pending.length)add(host,'p','sd876-empty','Zatím tu není žádná čekající žádost.');
 for(const req of data.pending){
  const card=add(host,'article','sd876-request');
  add(card,'strong','',req.device_name||'Nové zařízení');
  add(card,'small','', 'Žádost do '+new Date(req.expires_at).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}));
  const parsed=window.SDDevice878?.parseAgent?.(req.user_agent||'');
  if(parsed?.platform)add(card,'small','sd878-device-spec','Typ: '+parsed.kind+' · '+parsed.platform+' · '+parsed.browser);
  const select=profileChoice();card.append(select);
  const row=add(card,'div','sd876-action-row');
  row.append(ctl('Schválit',async()=>{if(!select.value){notify('Nejdřív vyber profil.',true);return}await approve({p_request_id:req.id,p_profile_id:select.value})},'sd876-primary'));
  row.append(ctl('Zamítnout',()=>reject({p_request_id:req.id}),'sd876-secondary'));
 }
}
async function reviewIncoming(){
 const host=$('sd876LinkReview');if(!host)return;
 host.replaceChildren();
 const secret=pendingSecret||sessionStorage.getItem('sd876_parent_request')||'';
 if(!/^[0-9a-f]{48}$/.test(secret)||!parentReady())return;
 try{
  const res=await RPC('sd_876_preview_request',{p_secret:secret});
  const card=add(host,'article','sd876-request sd876-linked');
  add(card,'strong','','Žádost přijatá od dítěte: '+res.device_name);
  add(card,'p','','Ověř, že žádost skutečně přišla od dítěte, jehož zařízení chceš připojit.');
  const select=profileChoice();card.append(select);
  const row=add(card,'div','sd876-action-row');
  row.append(ctl('Schválit',async()=>{if(!select.value){notify('Vyber profil dítěte.',true);return}await approve({p_secret:secret,p_profile_id:select.value})},'sd876-primary'));
  row.append(ctl('Zamítnout',()=>reject({p_secret:secret}),'sd876-secondary'));
 }catch(err){
  add(host,'p','sd876-hint','Odkaz na žádost už není platný nebo byl vyřízen: '+err.message);
  clearIncoming();
 }
}
function clearIncoming(){pendingSecret='';try{sessionStorage.removeItem('sd876_parent_request')}catch{}}
async function approve(args){
 if(parentBusy)return;parentBusy=true;
 try{
  const success=await RPC('sd_876_approve_request',args);
  if(success!==true)throw Error('Kód není platný nebo je vyčerpán limit pokusů. Zkus párovací odkaz.');
  clearIncoming();notify('Zařízení bylo schváleno a přiřazeno k profilu.');
 }catch(err){notify(err.message||String(err),true)}
 finally{parentBusy=false}
 await refreshData('devices',true);
}
async function reject(args){
 if(!confirm('Opravdu zamítnout žádost o připojení?'))return;
 if(parentBusy)return;parentBusy=true;
 try{await RPC('sd_876_reject_request',args);clearIncoming();notify('Žádost byla zamítnuta.')}
 catch(err){notify(err.message||String(err),true)}
 finally{parentBusy=false}
 await refreshData('devices',true);
}
function renderDevices(){
 const host=$('sd876Devices');if(!host)return;host.replaceChildren();
 add(host,'h4','','Spárovaná zařízení');
 if(!data.accounts.length)add(host,'p','sd876-empty','Dosud není spárované žádné zařízení.');
 data.accounts.forEach((a,i)=>{
  const card=add(host,'article','sd876-device');
  const d=data.details.find(x=>x.auth_user_id===a.auth_user_id);
  const hint=window.SDDevice878?.parseAgent?.(d?.user_agent||'')||{};
  const kind=d?.kind||hint.kind||'Neurčeno',platform=d?.platform||hint.platform||'Neznámý systém';
  const browser=d?.browser||hint.browser||'Prohlížeč neurčen';
  const model=d?.model||hint.model||'Přesný model není dostupný';
  const title=add(card,'div','sd876-device-title');add(title,'span','sd876-symbol',/počítač|Windows|macOS/i.test(kind+' '+platform)?'💻':/tablet|iPad/i.test(kind+' '+platform)?'📱':'📱');
  const label=add(title,'div','');
  add(label,'strong','',a.device_name||'Zařízení '+(i+1));
  const profile=data.profiles.find(p=>p.id===a.profile_id);
  add(label,'small','','Hlavní profil: '+(profile?.display_name||'neurčen'));
  add(card,'p','sd878-device-spec','Typ: '+kind+' · Systém: '+platform+' · Prohlížeč: '+browser);
  add(card,'p','sd878-device-spec','Model: '+model);
  if(d?.last_seen_at)add(card,'small','sd878-last-seen','Poslední známé spojení: '+new Date(d.last_seen_at).toLocaleString('cs-CZ'));
  if(hint.uncertain&&!d?.kind)add(card,'small','sd878-uncertain','Typ není jednoznačně rozpoznaný. Může jít o tablet nebo prohlížeč v režimu PC.');
  const row=add(card,'div','sd876-action-row');
  row.append(ctl('Přejmenovat',()=>renameDevice(a),'sd876-secondary'));
  row.append(ctl('Odpojit',()=>disconnectDevice(a),'sd876-warning'));
 });
 add(host,'h4','','Rodičovská synchronizační zařízení');
 if(!data.syncDevices.length)add(host,'p','sd876-empty','Žádné další zařízení pro rodinnou synchronizaci.');
 data.syncDevices.forEach((a,i)=>{
  const card=add(host,'article','sd876-device');
  add(card,'strong','',a.device_name||'Rodičovské zařízení '+(i+1));
  add(card,'small','', 'Připojeno '+new Date(a.created_at).toLocaleDateString('cs-CZ')+' · Přístup ke všem dětským profilům');
  const row=add(card,'div','sd876-action-row');
  row.append(ctl('Přejmenovat',()=>renameParentDevice(a),'sd876-secondary'));
  row.append(ctl('Odpojit',()=>disconnectParentDevice(a),'sd876-warning'));
 });
}
function renderVisibility(){
 const host=$('sd876Visibility');if(!host)return;host.replaceChildren();
 if(!data.accounts.length)add(host,'p','sd876-empty','Nejdřív spáruj dětské zařízení.');
 data.accounts.forEach((a,i)=>{
  const card=add(host,'article','sd876-device');
  add(card,'h4','',a.device_name||'Zařízení '+(i+1));
  const grid=add(card,'div','sd876-access-grid');
  const allowed=new Set(data.access.filter(x=>x.auth_user_id===a.auth_user_id).map(x=>x.profile_id));
  for(const p of data.profiles){
   const label=add(grid,'label','sd876-access-choice');
   const check=add(label,'input','');check.type='checkbox';
   check.checked=allowed.has(p.id)||p.id===a.profile_id;
   check.disabled=p.id===a.profile_id;
   check.setAttribute('aria-label','Povolit profil '+p.display_name);
   add(label,'span','',p.display_name+(p.id===a.profile_id?' (hlavní)':''));
   check.addEventListener('change',()=>setAccess(a,p,check));
  }
 });
 if(data.syncDevices.length){
  add(host,'h4','','Rodičovská synchronizační zařízení');
  add(host,'p','sd876-hint','Správcovská zařízení mají přístup ke všem dětským profilům a nelze jim nastavovat omezenou viditelnost. Můžeš je odpojit v části Zařízení.');
  for(const a of data.syncDevices){
   const card=add(host,'article','sd876-device');
   add(card,'strong','',a.device_name||'Rodičovské zařízení');
   add(card,'small','','Všechny dětské profily');
  }
 }
}
async function setAccess(a,p,control){
 const enabled=control.checked;control.disabled=true;
 try{
  await RPC('sd_set_device_profile_access',{p_device_id:a.auth_user_id,p_profile_id:p.id,p_enabled:enabled});
  notify('Viditelnost profilu '+p.display_name+' byla uložena.');
  await refreshData('visibility',true);
 }catch(err){control.checked=!enabled;notify(err.message,true);control.disabled=false}
}
async function renameDevice(a){
 const name=prompt('Jak se má zařízení jmenovat?',a.device_name||'');if(name===null)return;
 const cleaned=name.trim().slice(0,60);if(!cleaned){notify('Název zařízení nemůže být prázdný.',true);return}
 try{
  await cloud().requestParent('/rest/v1/sd_child_accounts?auth_user_id=eq.'+encodeURIComponent(a.auth_user_id),{method:'PATCH',body:{device_name:cleaned}});
  notify('Zařízení přejmenováno.');await refreshData('devices',true);
 }catch(err){notify(err.message,true)}
}
async function disconnectDevice(a){
 if(!confirm('Odpojit '+(a.device_name||'zařízení')+'? Všechna jeho oprávnění budou odebrána.'))return;
 try{
  await cloud().requestParent('/rest/v1/sd_child_accounts?auth_user_id=eq.'+encodeURIComponent(a.auth_user_id),{method:'DELETE'});
  notify('Zařízení bylo odpojeno.');await refreshData('devices',true);
 }catch(err){notify(err.message,true)}
}
async function renameParentDevice(a){
 const name=prompt('Název rodičovského zařízení:',a.device_name||'');
 if(name===null)return;
 const cleaned=name.trim().slice(0,60);
 if(cleaned.length<2){notify('Název zařízení je příliš krátký.',true);return}
 try{
  const ok=await RPC('sd_876_rename_parent_device',{p_device_id:a.id,p_device_name:cleaned});
  if(!ok)throw Error('Zařízení už není připojené.');
  notify('Název uložen.');await refreshData('devices',true);
 }catch(err){notify(err.message,true)}
}
async function disconnectParentDevice(a){
 if(!confirm('Odpojit '+(a.device_name||'rodičovské zařízení')+'? Pokud právě používáš tento telefon, bude možná potřeba znovu zapnout synchronizaci.'))return;
 try{
  const ok=await RPC('sd_revoke_sync_device',{p_device_id:a.id});
  if(!ok)throw Error('Zařízení už není připojené.');
  notify('Synchronizační zařízení odpojeno.');await refreshData('devices',true);
 }catch(err){notify(err.message,true)}
}
function renderResults(){
 const host=$('sd876Results');if(!host)return;host.replaceChildren();
 let profiles={};try{profiles=JSON.parse(local('matematika-karticky-progress-v3-profiles')||'{}')}catch{}
 add(host,'h4','','Pokrok jednotlivých dětí');
 const grid=add(host,'div','sd876-result-grid');
 for(const [id,p] of Object.entries(profiles)){
  if(id==='parent'||!p||typeof p!=='object')continue;
  const card=add(grid,'article','sd876-result');
  add(card,'strong','',p.name||'Dítě');
  const total=Number(p.totals?.done);
  const correct=Number(p.totals?.correct);
  const parts=[];
  if(Number.isFinite(total))parts.push('Procvičeno: '+total);
  if(Number.isFinite(correct))parts.push('Správně: '+correct);
  if(typeof p.xp==='number')parts.push('XP: '+p.xp);
  add(card,'small','',parts.join(' · ')||'Podrobné výsledky otevři níže.');
 }
 if(!grid.childElementCount)add(grid,'p','','Zatím nejsou na tomto zařízení načtené profily.');
}
function updateCloud(){
 const status=$('sd876CloudStatus');if(!status)return;
 status.textContent=parentReady()?'Cloud připojen':'Cloud není přihlášen';
 status.classList.toggle('online',parentReady());
}
function childUI(){
 const gate=$('authGate')?.querySelector('.authbox');if(!gate||$('sd876ChildPair'))return;
 const root=make('section','sd876-childpair');root.id='sd876ChildPair';gate.append(root);
 root.append(ctl('Požádat rodiče o připojení',()=>{const p=$('sd876ChildForm');p.hidden=!p.hidden;if(!p.hidden)p.scrollIntoView({block:'nearest'})},'sd876-primary'));
 const form=add(root,'div','sd876-child-form');form.id='sd876ChildForm';form.hidden=true;
 add(form,'p','','Zadej e-mail, kterým se rodič přihlašuje ke cloudu. Žádost se mu zobrazí přímo v rodičovské správě. Bez QR a opisování kódů.');
 const label=add(form,'label','sd876-field','Název zařízení');
 const input=add(label,'input','sd876-input');input.id='sd876ChildName';input.maxLength=60;input.placeholder='Například Martinův iPhone';
 input.value=/iPhone|iPad/i.test(navigator.userAgent)?'iPhone':/Android/i.test(navigator.userAgent)?'Telefon Android':'Nové zařízení';
 const emailLabel=add(form,'label','sd876-field','E-mail rodiče');
 const parentEmail=add(emailLabel,'input','sd876-input');
 parentEmail.id='sd878ParentEmail';parentEmail.type='email';parentEmail.autocomplete='email';parentEmail.inputMode='email';
 parentEmail.placeholder='rodic@priklad.cz';parentEmail.value=local('sd878_last_parent_email')||'';
 const buttons=add(form,'div','sd876-action-row');
 buttons.append(ctl('Odeslat žádost rodiči',startRequest,'sd876-primary'));
 const response=add(form,'div','sd876-child-response');response.id='sd876ChildResponse';response.hidden=true;
 add(response,'p','sd876-child-state','').id='sd876ChildState';
 const fallback=add(response,'details','sd878-pair-fallback');
 add(fallback,'summary','','Záložní párování (odkaz, QR nebo kód)');
 const short=add(fallback,'strong','sd876-shortcode','');short.id='sd876ShortCode';
 add(fallback,'p','sd876-hint','Tyto možnosti použij pouze když se přímá žádost rodiči nezobrazí.');
 fallback.append(ctl('Poslat odkaz rodiči',shareRequest,'sd876-secondary'));
 fallback.append(ctl('Zobrazit QR pro rodiče',showChildQR,'sd876-secondary'));
 const qr=add(fallback,'div','sd876-qr-panel');qr.id='sd876ChildQR';qr.hidden=true;
 const waiting=add(form,'p','sd876-child-message','');waiting.id='sd876ChildMessage';waiting.setAttribute('role','status');
 const invite=sessionStorage.getItem('sd876_child_invite');
 const pending=local('sd876_pending_secret');
 if(invite){form.hidden=false;notify('Rodinná pozvánka načtena. Klikni na Odeslat žádost.','', 'sd876ChildMessage')}
 if(pending){form.hidden=false;loadPendingChild(pending)}
}
async function startRequest(){
 if(childBusy)return;
 childBusy=true;notify('Připojuji zařízení…',false,'sd876ChildMessage');
 try{
  await cloud().ensureChildIdentity();
  const invite=sessionStorage.getItem('sd876_child_invite')||null;
  const parentEmail=$('sd878ParentEmail')?.value?.trim()||'';
  if(!invite&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))throw Error('Zadej e-mail rodiče.');
  const res=invite
   ?await childRPC('sd_876_begin_request',{p_device_name:$('sd876ChildName').value.trim(),p_invite:invite})
   :await childRPC('sd_878_begin_direct_request',{p_device_name:$('sd876ChildName').value.trim(),p_parent_email:parentEmail});
  if(invite)sessionStorage.removeItem('sd876_child_invite');
  else localSet('sd878_last_parent_email',parentEmail);
  localSet('sd876_pending_secret',res.secret);
  localSet('sd876_pending_code',res.short_code);
  localSet('sd876_pending_expires',res.expires_at);
  showChildPending(res.secret,res.short_code,true);
 }catch(err){notify(err.message||String(err),true,'sd876ChildMessage')}
 finally{childBusy=false}
}
function showChildPending(secret,code,associated){
 const box=$('sd876ChildResponse');if(!box)return;box.hidden=false;
 $('sd876ShortCode').textContent=code||'';
 $('sd876ChildState').textContent=associated
  ?'Žádost vytvořena. Pokud byl rodičovský e-mail správný, zobrazí se v rodičovské správě v části Žádosti o připojení.'
  :'Žádost je připravená. Pošli odkaz rodiči, aby ji mohl schválit.';
 notify('Po schválení rodičem se toto zařízení připojí automaticky. Kódy nemusíš nikam opisovat.',false,'sd876ChildMessage');
}
function loadPendingChild(secret){
 const code=local('sd876_pending_code')||'';
 showChildPending(secret,code,true);
}
function showChildQR(){
 const secret=local('sd876_pending_secret'),panel=$('sd876ChildQR');
 if(!secret||!panel){notify('Nejdřív vytvoř žádost.',true,'sd876ChildMessage');return}
 panel.replaceChildren();panel.hidden=false;
 add(panel,'strong','','QR kód žádosti pro rodiče');
 const img=add(panel,'div','sd876-qr-image');
 if(typeof window.QRCode==='function'){
  new window.QRCode(img,{text:appURL('sd876request',secret),width:190,height:190,colorDark:'#15364e',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});
 }else add(img,'p','','QR generátor není k dispozici. Použij sdílení odkazu.');
 add(panel,'p','sd876-hint','Rodič naskenuje QR kód a schválí připojení po výběru profilu.');
}
async function shareRequest(){
 const secret=local('sd876_pending_secret');
 if(!secret){notify('Nejdřív vytvoř žádost.',true,'sd876ChildMessage');return}
 await share('Žádost o připojení – Školní dobrodružství',appURL('sd876request',secret));
}
async function pollChild(){
 const secret=local('sd876_pending_secret');if(!secret||document.hidden||childBusy||!navigator.onLine)return;
 const exp=Date.parse(local('sd876_pending_expires')||'');
 if(Number.isFinite(exp)&&exp<Date.now()){notify('Žádost vypršela. Vytvoř novou.',true,'sd876ChildMessage');localDel('sd876_pending_secret');return}
 try{
  const res=await childRPC('sd_876_request_status',{p_secret:secret});
  if(res.status==='approved'){
   localDel('sd876_pending_secret');localDel('sd876_pending_code');localDel('sd876_pending_expires');
   await cloud().refreshDevice();
   notify('Zařízení bylo schváleno. Můžeš se přihlásit do svého profilu.',false,'sd876ChildMessage');
  }else if(res.status==='rejected'||res.status==='expired'||res.status==='disconnected'){
   notify(res.status==='rejected'?'Rodič žádost zamítl.':'Žádost už není platná. Vytvoř novou.',true,'sd876ChildMessage');
   localDel('sd876_pending_secret');localDel('sd876_pending_code');localDel('sd876_pending_expires');
  }
 }catch(err){console.warn('SD876: stav žádosti',err)}
}
function boot(){
 extractLink();
 shell();childUI();updateCloud();
 activateParentLanding();
 pendingSecret=sessionStorage.getItem('sd876_parent_request')||'';
 if(pendingSecret&&parentReady())openView('devices');
 $('sd866Login')?.addEventListener('click',()=>setTimeout(()=>{updateCloud();if(parentReady()&&pendingSecret)openView('devices');else if(parentReady()&&active)refreshData(active,true);else if(parentReady())getData().catch(()=>{})},1800));
 window.addEventListener('school-account',()=>setTimeout(()=>{updateCloud();renderResults();if(parentReady()&&pendingSecret)openView('devices');else if(parentReady()&&(active==='devices'||active==='visibility'))refreshData(active,true);else if(parentReady())getData().catch(()=>{})},400));
 window.addEventListener('sd866-updated',renderResults);
 window.addEventListener('school-resume-login',activateParentLanding);
 window.addEventListener('pageshow',activateParentLanding);
 // Starší moduly při návratu z výuky rodiči zavíraly panel. Obnovíme rodičovské centrum.
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-home],#sd54-admin-open'))setTimeout(activateParentLanding,100);
 },false);
 // Staré tlačítko nesmí rodiče posílat na předměty namísto zpět do centra.
 document.addEventListener('click',e=>{
  if(!document.body.classList.contains('parent-role'))return;
  const legacy=e.target.closest('#sd54-admin-close');
  if(!legacy)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(active)returnToCenter();
  else document.getElementById('authExit')?.click();
 },true);
 // Po opuštění obrazovky škol zůstává rodičovské centrum výchozí stránkou.
 const parentObserver=new MutationObserver(()=>{
  if(!document.body.classList.contains('parent-role')||document.body.classList.contains('sd54-admin-open'))return;
  setTimeout(()=>{
   if(!document.body.classList.contains('parent-role')||document.body.classList.contains('sd54-admin-open'))return;
   if(document.body.classList.contains('sd52-open'))return;
   if(document.getElementById('homeScreen')?.classList.contains('visible'))activateParentLanding();
  },120);
 });
 parentObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('online',()=>{pollChild();if(parentReady()&&active)refreshData(active,true)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){pollChild();if(parentReady()&&(active==='devices'||active==='visibility'))refreshData(active,true)}});
 setInterval(()=>{
  pollChild();
  if(!parentReady()||document.hidden||!navigator.onLine)return;
  if(active==='devices'||active==='visibility')refreshData(active);
  else if(!active)RPC('sd_876_pending_requests').then(rows=>{
   if(Array.isArray(rows)){data.pending=rows;updateBadge();}
  }).catch(e=>console.warn('Nové žádosti o párování:',e.message));
 },11000);
 pollChild();if(parentReady())getData().catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1150),{once:true});
else setTimeout(boot,1150);
})();
