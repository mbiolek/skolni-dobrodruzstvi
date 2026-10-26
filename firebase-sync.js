/* Školní dobrodružství — Firebase sync v44.4: guarded automatic synchronization. */
(function () {
'use strict';
const CONFIG={apiKey:'AIzaSyDqA_N2hJtOeGmp2e3kktNTHATxfanBmRQ',authDomain:'skolni-dobrodruzstvi.firebaseapp.com',projectId:'skolni-dobrodruzstvi',storageBucket:'skolni-dobrodruzstvi.firebasestorage.app',messagingSenderId:'344403270623',appId:'1:344403270623:web:1a9f09d6cd9144a025026a'};
const PREFIXES=['matematika-karticky-progress-v3','school-','skolni-'];
const EXCLUDE=new Set(['skolni-firebase-sync-v443','skolni-firebase-sync-v444']);
const META='skolni-firebase-sync-v444';function meta(){try{return JSON.parse(localStorage.getItem(META)||'{}')}catch{return {}}}function setMeta(m){originalSet.call(localStorage,META,JSON.stringify(m))}let poll=null;let lastDirty=0;
let auth,db,user=null,enabled=false,timer=null,busy=false,remoteUpdate=false;
const $=id=>document.getElementById(id);
function status(s){const el=$('cloudStatus');if(el)el.textContent=s}
function data(){const obj={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||EXCLUDE.has(k))continue;if(PREFIXES.some(p=>k.startsWith(p)))obj[k]=localStorage.getItem(k)}return obj}
function meaningful(obj){return Object.keys(obj).filter(k=>k!=='matematika-karticky-progress-v3-active'&&!k.includes('theme')&&!k.includes('skin')).length}
function doc(){return db.collection('users').doc(user.uid).collection('sync').doc('school-data')}
function fingerprint(x){return JSON.stringify(Object.keys(x).sort().map(k=>[k,x[k]]))}
function changed(){const m=meta();m.dirty=true;m.changedAt=Date.now();setMeta(m);lastDirty=Date.now();schedule()}
async function upload(force=false){if(!user||busy||!navigator.onLine)return;busy=true;status('Ukládám změny do cloudu…');try{
 const snapshot=data(),m=meta();if(!meaningful(snapshot)){status('Na tomto zařízení nejsou žádné profily k uložení.');return}
 const ref=doc();let conflict=false,revision=0;
 await db.runTransaction(async tx=>{const remote=await tx.get(ref),r=remote.exists?remote.data():null;const rr=r?(r.revision||0):0;
 if(!force&&r&&m.revision!==rr){conflict=true;return}
 revision=rr+1;tx.set(ref,{payload:snapshot,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),revision,schema:2,deviceUpdatedAt:new Date().toISOString()});});
 if(conflict){status('Pozor: Na druhém zařízení jsou nové výsledky. Automatické ukládání pozastaveno, aby se nepřepsaly.');return}
 const next=meta();next.revision=revision;next.initialized=true;next.dirty=fingerprint(data())!==fingerprint(snapshot);setMeta(next);enabled=true;status(next.dirty?'Další změny čekají na uložení.':'Automaticky uloženo do cloudu ✓');
 }catch(e){status('Cloud nedostupný, výsledky zůstávají v zařízení. '+e.message)}finally{busy=false}}
async function download(manual=false){if(!user||busy||!navigator.onLine)return;busy=true;try{const snap=await doc().get();if(!snap.exists||!snap.data().payload){if(manual)status('Cloudová záloha zatím neexistuje.');return}
 const r=snap.data(),payload=r.payload,local=data(),m=meta();if(typeof payload!=='object'||!meaningful(payload)){status('Cloudová záloha neobsahuje profily.');return}
 if(m.initialized&&m.revision===(r.revision||0)&&!m.dirty)return;
 if(fingerprint(local)===fingerprint(payload)){setMeta({...m,initialized:true,revision:r.revision||0,dirty:false});enabled=true;status('Zařízení jsou synchronizována ✓');return}
 if(!manual&&(m.dirty||(!m.initialized&&meaningful(local)))){status('Na tomto zařízení jsou jiné výsledky. Pro bezpečnost vyber ruční načtení nebo nahrání.');return}
 if(manual&&meaningful(local)&&!confirm('Cloudová data nahradí výsledky na tomto zařízení. Nejdříve se uloží místní záchranná kopie. Pokračovat?'))return;
 const backupKey='skolni-firebase-sync-v443';originalSet.call(localStorage,backupKey,JSON.stringify({at:new Date().toISOString(),payload:local}));remoteUpdate=true;
 for(const [k,v] of Object.entries(payload)){if(PREFIXES.some(p=>k.startsWith(p))&&typeof v==='string'&&!EXCLUDE.has(k))originalSet.call(localStorage,k,v)}
 setMeta({...m,initialized:true,revision:r.revision||0,dirty:false});remoteUpdate=false;enabled=true;status('Nové výsledky načteny. Obnovuji aplikaci…');setTimeout(()=>location.reload(),1000);
 }catch(e){remoteUpdate=false;status('Cloud nedostupný, místní data zůstávají zachována. '+e.message)}finally{busy=false}}
function schedule(){if(!enabled||!user||remoteUpdate)return;clearTimeout(timer);timer=setTimeout(()=>upload(false),4000)}
function startPoll(){clearInterval(poll);poll=setInterval(()=>{if(user&&!busy&&navigator.onLine){if(meta().dirty)upload(false);else download(false)}},20000)}
const originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){const result=originalSet.apply(this,arguments);if(this===localStorage&&typeof k==='string'&&PREFIXES.some(p=>k.startsWith(p))&&!EXCLUDE.has(k))changed();return result};
function createUI(){const style=document.createElement('style');style.textContent='#cloudPanel{position:fixed;bottom:14px;left:14px;z-index:2147483640;max-width:340px;background:#fff;color:#163354;border:2px solid #4083c9;border-radius:14px;padding:12px;box-shadow:0 6px 24px #0005;font:14px system-ui}#cloudPanel button{margin:4px;padding:8px 10px;background:#e5f1ff;color:#123f75;border:1px solid #91b7df;border-radius:8px;cursor:pointer;font-weight:700}#cloudPanel strong{display:block;margin-bottom:6px}#cloudPanel small{display:block;margin-top:7px}body:not(.parent-role) #cloudPanel{display:none!important}';document.head.append(style);
const panel=document.createElement('div');panel.id='cloudPanel';panel.innerHTML='<strong>☁ Synchronizace rodiny</strong><div id="cloudStatus">Připojuji Firebase…</div><div id="cloudActions"><button id="cloudLogin">Přihlásit Google</button><button id="cloudUpload" hidden>Nahrát data z tohoto zařízení</button><button id="cloudDownload" hidden>Načíst data z cloudu</button><button id="cloudLogout" hidden>Odhlásit Google</button></div><small>Po prvním propojení se výsledky ukládají a načítají automaticky. Při souběžných změnách se přenos pozastaví, aby nedošlo ke ztrátě výsledků.</small>';
document.body.append(panel);$('cloudLogin').onclick=async()=>{try{await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())}catch(e){status('Přihlášení: '+e.message+' (zkontroluj povolenou doménu v Authentication)')}};$('cloudUpload').onclick=()=>{if(confirm('Nahrát aktuální data tohoto zařízení do cloudu? Existující cloudová záloha bude nahrazena. Při prvním přenosu použij telefon s původními profily.'))upload(true)};$('cloudDownload').onclick=()=>download(true);$('cloudLogout').onclick=()=>{enabled=false;clearInterval(poll);auth.signOut()};}
function init(){createUI();if(!window.firebase||!firebase.initializeApp){status('Firebase knihovna se nenačetla. Zkontroluj připojení k internetu.');return}try{const app=firebase.apps.length?firebase.app():firebase.initializeApp(CONFIG);auth=app.auth();db=app.firestore();auth.onAuthStateChanged(async u=>{user=u;enabled=false;clearInterval(poll);$('cloudLogin').hidden=!!u;$('cloudUpload').hidden=!u;$('cloudDownload').hidden=!u;$('cloudLogout').hidden=!u;
 if(!u){status('Přihlas se rodičovským Google účtem.');return}
 status('Připojuji automatickou synchronizaci…');try{const snap=await doc().get(),m=meta();if(!snap.exists){if(meaningful(data())){enabled=true;await upload(true)}else status('Cloud je prázdný. Nejprve vytvoř profil na telefonu.');}
 else if(!m.initialized){if(fingerprint(data())===fingerprint(snap.data().payload||{})){setMeta({...m,initialized:true,revision:snap.data().revision||0,dirty:false});enabled=true;status('Automatická synchronizace je aktivní ✓')}
 else if(!meaningful(data())){await download(false);enabled=true}else{status('První propojení: vyber ručně, která data zachovat. Potom bude synchronizace automatická.')}}
 else{enabled=true;await download(false);status(meta().dirty?'Místní změny čekají na vyřešení.':'Automatická synchronizace je aktivní ✓');if(meta().dirty&&meta().revision===(snap.data().revision||0))schedule()}
 startPoll();}catch(e){status('Připojení ke cloudu selhalo: '+e.message)}
})}catch(e){status('Firebase chyba: '+e.message)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
