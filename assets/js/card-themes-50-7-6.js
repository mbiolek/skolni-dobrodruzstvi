/* Školní dobrodružství 50.7.6: four fantasy designs, one shared real card component.
 * Buttons are NEVER replaced with image-only mockups: original click handlers work.
 * Design is independent of wallpaper selection (A-D).
 */
(()=>{'use strict';
 const KEY='sd-card-style-v1', OPTIONS=[
  ['glass','Kouzelný krystal','Průsvitné magické sklo'],
  ['stone','Kamenné runy','Vytesané kameny se zlatem'],
  ['parchment','Pergamen','Stará mapa a pečetě'],
  ['guild','Hradní cech','Dřevo, štíty a smalt']
 ];
 const choices=new Set(OPTIONS.map(x=>x[0]));
 let saved='glass';try{saved=localStorage.getItem(KEY)||'glass'}catch(e){}
 if(!choices.has(saved))saved='glass';
 const root=document.body; root.dataset.cardStyle=saved;
 const themes=document.getElementById('themeSwitcher');
 if(!themes)return;
 const group=document.createElement('div');group.id='sdCardStyleSelect';
 group.setAttribute('role','group');group.setAttribute('aria-label','Vzhled navigačních karet');
 const title=document.createElement('div');title.className='sd-card-theme-heading';
 title.innerHTML='<strong>🎴 Vzhled karet</strong><small>Vyber si grafický styl. Všechny předměty mají stejné ovládání.</small>';
 const grid=document.createElement('div');grid.className='sd-card-theme-options';
 const change=(style)=>{
  if(!choices.has(style))return;
  root.dataset.cardStyle=style;
  for(const b of grid.querySelectorAll('[data-card-choice]')){
   const sel=b.dataset.cardChoice===style;b.classList.toggle('selected',sel);b.setAttribute('aria-pressed',String(sel));
  }
  try{localStorage.setItem(KEY,style)}catch(e){}
  document.dispatchEvent(new CustomEvent('sd-card-style-change',{detail:{style}}));
 };
 for(const [style,label,sub] of OPTIONS){
  const b=document.createElement('button');b.type='button';b.className='sd-card-style-option';
  b.dataset.cardChoice=style;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(style===saved));
  const img=document.createElement('img');img.src='./assets/karty/styly/'+style+'-nahled.webp';img.alt='';img.loading='lazy';
  const text=document.createElement('span');text.className='sd-card-style-caption';
  const strong=document.createElement('strong');strong.textContent=label;
  const small=document.createElement('small');small.textContent=sub;text.append(strong,small);b.append(img,text);
  b.addEventListener('click',()=>change(style));grid.append(b);
 }
 group.append(title,grid);themes.append(group);change(saved);
 window.SDCardThemes=Object.freeze({set:change,get:()=>root.dataset.cardStyle,values:OPTIONS.map(x=>({id:x[0],label:x[1]}))});
})();