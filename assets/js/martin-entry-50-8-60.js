/* 50.8.60 – Martin: středoškolský profil bez změn stávajících profilů a PINů. */
(()=>{'use strict';
const USERS='matematika-karticky-progress-v3-profiles',LIVE='skolni-live-v441';
function profiles(){try{return JSON.parse(localStorage.getItem(USERS)||'{}')||{}}catch{return {}}}
function findMartin(){return Object.entries(profiles()).find(([id,p])=>/^martin(?:\s|$)/i.test(String(p.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')))}
function auth(){try{return sessionStorage.getItem(LIVE)}catch{return null}}
function createParentControl(){const admin=document.getElementById('authAdmin');if(!admin)return;let holder=document.getElementById('sd860ParentTool');if(!holder){holder=document.createElement('div');holder.id='sd860ParentTool';holder.className='sd860-parent-box';const btn=document.getElementById('adminCreate');if(btn)btn.insertAdjacentElement('afterend',holder);else admin.append(holder)}
 const martin=findMartin();holder.replaceChildren();const label=document.createElement('p');label.textContent=martin?'Martinův středoškolský profil již existuje.':'Připravený středoškolský profil: Martin – autoelektrikář, výuční list a CERMAT.';holder.append(label);const b=document.createElement('button');b.type='button';b.textContent=martin?'Otevřít Martinův studijní plán':'Přidat Martina – nastavit PIN';b.addEventListener('click',()=>{if(martin){window.location.href='./martin/index.html';return}document.getElementById('adminNewName').value='Martin';document.getElementById('adminNewPin').focus();holder.querySelector('p').textContent='Jméno Martin je vyplněné. Zadej vlastní PIN (4–8 číslic) a klepni na „Vytvořit profil“.'});holder.append(b)}
function init(){const app=document.querySelector('#homeScreen .app');if(!app)return;let launcher=document.getElementById('sd860MartinLaunch');if(!launcher){launcher=document.createElement('section');launcher.id='sd860MartinLaunch';launcher.className='sd860-launcher';launcher.hidden=true;launcher.innerHTML='<div class="sd860-icon" aria-hidden="true">⚡</div><div><span class="sd860-label">STŘEDNÍ ŠKOLA · 3. ROČNÍK</span><h1>Martin – Autoelektrikář</h1><p>Výuční list • 25 ústních okruhů • CERMAT matematika a čeština • nástavbové studium s maturitou.</p><div class="sd860-chips"><span>Přijímačky 12.–13. 4. 2027</span><span>Odborné skripta a diagnostika</span></div></div><a class="sd860-start" href="./martin/index.html">Otevřít Martinův studijní plán →</a>';app.prepend(launcher)}
 const refresh=()=>{const id=auth(),martin=findMartin();const active=!!(id&&id!=='parent'&&martin&&id===martin[0]&&document.body.classList.contains('child-role'));document.body.classList.toggle('sd860-martin-active',active);launcher.hidden=!active;createParentControl()};
 refresh();setTimeout(refresh,120);
 window.addEventListener('school-account',()=>setTimeout(refresh,20));window.addEventListener('school-resume-login',refresh);
 window.addEventListener('pageshow',refresh);
 document.getElementById('adminCreate')?.addEventListener('click',()=>setTimeout(createParentControl,80));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
