/* Školní dobrodružství 50.8.8. Tlačítka a tapeta jsou dvě nezávislé volby. */
(()=>{'use strict';
const KEY='sd88-wallpaper',scenes=[
 ['hrad','Hrad','hrad.webp','a'],['priroda','Příroda','priroda.webp','b'],
 ['skola','Škola','skola.webp','c'],['hradni','Hradní prostředí','hradni-styl.webp','d'],
 ['noc1','Noční hrad I','hrad-noc-1-5084.webp','d'],
 ['noc2','Noční hrad II','hrad-noc-2-5084.webp','d'],
 ['noc3','Noční hrad III','hrad-noc-3-5084.webp','d']
];
const allowed=new Map(scenes.map(x=>[x[0],x]));let selection='noc3';
function init(){
 const switcher=document.getElementById('themeSwitcher');if(!switcher)return;
 let stored;try{stored=localStorage.getItem(KEY)}catch(_){}
 if(!stored){
  const night=document.body.dataset.castleNight;
  if(night&&allowed.has('noc'+night))stored='noc'+night;
  else stored={a:'hrad',b:'priroda',c:'skola',d:'hradni'}[document.body.dataset.gameTheme]||'noc3';
 }
 const ui=document.createElement('section');ui.className='sd88-wallpaper-selector';ui.id='sd88WallpaperSelect';ui.setAttribute('aria-label','Výběr tapety');
 const title=document.createElement('div');title.className='sd88-setting-heading';title.innerHTML='<strong>Tapeta a pozadí</strong><small>Nezávislé na vzhledu tlačítek – platí pro všechny předměty, profil i úvodní obrazovku.</small>';
 const grid=document.createElement('div');grid.className='sd88-wallpaper-grid';ui.append(title,grid);
 function choose(key,save=true){const opt=allowed.get(key);if(!opt)return;
  selection=key;document.body.dataset.wallpaper=key;
  document.body.style.setProperty('--sd88-scene',`url("${new URL('./assets/pozadi/'+opt[2],document.baseURI).href}")`);
  // Wallpaper must not mutate the legacy game theme; card style is independent.
  document.body.removeAttribute('data-castle-night');
  grid.querySelectorAll('button').forEach(b=>{const yes=b.dataset.wallpaper===key;b.classList.toggle('is-selected',yes);b.setAttribute('aria-pressed',yes?'true':'false')});
  if(save){try{localStorage.setItem(KEY,key)}catch(_){}}
  document.dispatchEvent(new CustomEvent('sd88-wallpaper-changed',{detail:{key,path:`./assets/pozadi/${opt[2]}`}}));
 }
 for(const [key,label,file] of scenes){const b=document.createElement('button');b.type='button';b.dataset.wallpaper=key;
  b.setAttribute('aria-pressed','false');b.className='sd88-wallpaper-button';
  const thumb=document.createElement('img');thumb.src='./assets/pozadi/'+file;thumb.alt='';thumb.loading='lazy';
  const name=document.createElement('span');name.textContent=label;b.append(thumb,name);b.addEventListener('click',()=>choose(key));grid.append(b);
 }
 const cards=document.getElementById('sdCardStyleSelect');if(cards)cards.after(ui);else switcher.append(ui);
 // All obsolete mixed settings remain hidden; no click on wallpaper may change card style.
 document.querySelectorAll('#themeSwitcher > button[data-theme],#themeSwitcher > span,#themeSwitcher .sd84-night-picker').forEach(x=>x.classList.add('sd88-obsolete-theme'));
 choose(allowed.has(stored)?stored:'noc3',false);
 window.SDEnvironment5088={wallpaper:()=>selection,setWallpaper:choose,cardStyle:()=>document.body.dataset.cardStyle};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
