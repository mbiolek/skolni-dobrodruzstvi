(()=>{'use strict';
const home=document.getElementById('homeScreen'),admin=document.getElementById('authAdmin');if(!home||!admin)return;
const open=document.createElement('button');open.id='sd54-admin-open';open.type='button';open.textContent='⚙ Rodičovská správa';home.prepend(open);
const close=document.createElement('button');close.id='sd54-admin-close';close.type='button';close.textContent='← Zpět na předměty';document.body.append(close);
const shut=()=>document.body.classList.remove('sd54-admin-open');
open.addEventListener('click',()=>{if(!document.body.classList.contains('parent-role'))return;document.body.classList.add('sd54-admin-open');window.scrollTo(0,0)});
close.addEventListener('click',shut);
window.addEventListener('school-account',()=>{shut();refresh()});
document.addEventListener('click',e=>{if(e.target.closest('#authAdmin #adminMath,#authAdmin #adminEnglish,#authAdmin #adminLogout,[data-home],#authExit'))shut()},true);
const guide=document.createElement('aside');guide.id='sd54-merlin';guide.setAttribute('aria-label','Merlin – průvodce');guide.innerHTML='<div class="sd54-scroll" hidden><strong>Merlinův pergamen</strong><span id="sd54-merlin-message"></span><button type="button" id="sd54-merlin-dismiss">Zavřít</button></div><img src="./assets/merlin/merlin-chuze.webp" alt="Merlin s lucernou a pergamenem" tabindex="0" role="button" aria-label="Otevřít Merlinovu nápovědu">';document.body.append(guide);
const toggle=document.createElement('button');toggle.id='sd54-merlin-toggle';toggle.textContent='Skrýt Merlina';document.body.append(toggle);
const img=guide.querySelector('img'),scroll=guide.querySelector('.sd54-scroll'),msg=guide.querySelector('#sd54-merlin-message');let greeted=false,autoClose=null;const walk='./assets/merlin/merlin-chuze.webp',read='./assets/merlin/merlin-cte.gif';function hideScroll(){scroll.hidden=true;clearTimeout(autoClose);img.src=walk}function scheduleClose(){clearTimeout(autoClose);autoClose=setTimeout(hideScroll,6500)}
function tell(message){msg.textContent=message;scroll.hidden=false;img.src=read;scheduleClose()}
function refresh(){const gate=document.getElementById('authGate');const logged=gate?.classList.contains('off');document.body.classList.toggle('sd54-show-merlin',!!logged);if(logged&&!greeted){greeted=true;img.src=walk;setTimeout(()=>{if(document.body.classList.contains('sd54-show-merlin'))tell('Vítej ve Školním dobrodružství! Vyber si předmět. Kdykoli na mě klepni a poradím ti.')},1600)}if(!logged){greeted=false;hideScroll()}}
img.addEventListener('click',()=>tell(document.body.classList.contains('sd52-open')?'Vyber si výuku, procvičování nebo test. Když si nebudeš vědět rady, začni výukou.':'Vyber si předmět a vydej se za dobrodružstvím. Každý pokrok se počítá!'));
img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();img.click()}});
guide.querySelector('#sd54-merlin-dismiss').addEventListener('click',hideScroll);
toggle.addEventListener('click',()=>{const hidden=document.body.classList.toggle('sd541-merlin-hidden');toggle.textContent=hidden?'Zobrazit Merlina':'Skrýt Merlina';if(hidden)hideScroll()});
const observer=new MutationObserver(refresh);observer.observe(document.getElementById('authGate'),{attributes:true,attributeFilter:['class']});refresh();
})();
