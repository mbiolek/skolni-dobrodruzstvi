
(()=>{'use strict';
 const key='skolni-temata-profilu-v1',valid=['maxi','balanced','simple'];
 let account=null,pending='balanced',original='balanced',saved={};
 try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{saved={}}
 const dialog=document.getElementById('skinDialog');
 const apply=s=>{document.body.dataset.skin=valid.includes(s)?s:'balanced'};
 const current=()=>saved[account||'guest']||'balanced';
 const highlight=()=>document.querySelectorAll('[data-skin-option]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.skinOption===pending)));
 const open=()=>{original=current();pending=original;highlight();dialog.classList.add('skin-open')};
 const close=()=>dialog.classList.remove('skin-open');
 window.addEventListener('school-account',e=>{account=e.detail.id;apply(current())});
 document.querySelectorAll('[data-skin-option]').forEach(b=>b.onclick=()=>{pending=b.dataset.skinOption;highlight();apply(pending)});
 document.getElementById('skinCancel').onclick=()=>{apply(original);close()};
 document.getElementById('skinSave').onclick=()=>{saved[account||'guest']=pending;try{localStorage.setItem(key,JSON.stringify(saved))}catch{}apply(pending);close()};
 dialog.addEventListener('click',e=>{if(e.target===dialog){apply(original);close()}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.classList.contains('skin-open')){apply(original);close()}});
 const btn=(id,text)=>{const b=document.createElement('button');b.id=id;b.className='skin-launch';b.type='button';b.textContent=text;b.onclick=open;return b};
 // Výběr prostředí je dostupný až v přihlášeném profilu dítěte.
 const home=document.querySelector('#homeScreen .home-hero');
 if(home)home.after(btn('skinHomeButton','🎨 Změnit můj svět'));
 apply(current());
})();

