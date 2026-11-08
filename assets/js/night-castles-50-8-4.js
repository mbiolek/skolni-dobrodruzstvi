/* 50.8.4 – původní tři obrázky nočního hradu jako volitelné herní prostředí. */
(()=>{'use strict';
const KEY='sd-night-castle-5084';
function init(){
 const picker=document.getElementById('themeSwitcher');if(!picker)return;
 const group=document.createElement('div');group.className='sd84-night-picker';
 const caption=document.createElement('strong');caption.textContent='🌙 Nová hradní pozadí';group.append(caption);
 const row=document.createElement('div');row.className='sd84-night-options';group.append(row);
 const options=[['0','Původní prostředí'],['1','Noční hrad I'],['2','Noční hrad II'],['3','Noční hrad III']];
 let choice='0';try{choice=localStorage.getItem(KEY)||'0'}catch(_){}
 const make=(k,label)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.sd84Night=k;
  if(k!=='0'){b.style.setProperty('--sd84-preview',`url("./assets/pozadi/hrad-noc-${k}-5084.webp")`);}
  b.addEventListener('click',()=>{
   if(k!=='0')picker.querySelector('button[data-theme="d"]')?.click();
   select(k);document.body.classList.remove('v43-themes-open');document.getElementById('v43-theme-toggle')?.setAttribute('aria-expanded','false');
  });row.append(b);};
 options.forEach(([k,label])=>make(k,label));picker.append(group);
 function select(k){if(!['0','1','2','3'].includes(k))k='0';choice=k;
  if(k==='0')delete document.body.dataset.castleNight;else document.body.dataset.castleNight=k;
  row.querySelectorAll('button').forEach(b=>{const active=b.dataset.sd84Night===k;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active))});
  try{localStorage.setItem(KEY,k)}catch(_){};
 }
 picker.querySelectorAll('button[data-theme]').forEach(b=>b.addEventListener('click',()=>{select('0')}));
 select(choice);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
