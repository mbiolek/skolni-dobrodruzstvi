/* 50.8.78 – nastavení rodiče, prostředí, avataři, PIN a cloud. */
(()=>{'use strict';
const el=(host,tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;host.append(n);return n};
const btn=(host,text,fn,cls)=>{const b=el(host,'button',text,'sd878-btn '+(cls||''));b.type='button';b.onclick=fn;return b};
function show(){
 const host=document.getElementById('sd878SettingsTop');if(!host)return;
 host.replaceChildren();
 el(host,'h3','Prostředí, avatary a zabezpečení');
 el(host,'p','Vyber grafický styl tlačítek a tapetu zvlášť. Změna se okamžitě projeví také na šesti hlavních rodičovských kartách.','sd878-description');
 const tools=el(host,'div',undefined,'sd878-ctl-row');
 btn(tools,'Vybrat avatara',()=>document.getElementById('v24-avatar-open')?.click(),'sd878-primary');
 const styles=el(host,'section',undefined,'sd878-theme-panel sd880-theme-panel');
 el(styles,'h4','Grafický styl všech karet');
 el(styles,'p','Tyto volby mění materiál, obrázky, rámečky a prostorové provedení tlačítek v dětské i rodičovské části.','sd878-description');
 const theme=el(styles,'div',undefined,'sd880-preview-grid');
 const stylesList=[
  ['glass','Kouzelný krystal','Skleněné magické karty','./assets/karty/styly/glass-nahled.webp'],
  ['stone','Kamenné runy','Ryté kameny a runové rámečky','./assets/karty/styly/stone-nahled.webp'],
  ['parchment','Pergamen','Starý pergamen s pečetěmi','./assets/karty/styly/parchment-nahled.webp'],
  ['guild','Hradní cech','Dřevěné a zlaté cechovní karty','./assets/karty/styly/guild-nahled.webp'],
  ['adventure','Dobrodružné předměty','Ilustrované dobrodružství','./assets/ikony/home-50-8-21/adventure-matematika.webp']
 ];
 const cards=[];
 const styleStatus=el(styles,'p','','sd880-status');
 for(const [key,name,desc,art] of stylesList){
  const button=btn(theme,'',()=>{if(!window.SDCardThemes?.set){styleStatus.textContent='Výběr grafického stylu není nyní dostupný. Zkus aktualizovat aplikaci.';return}
   window.SDCardThemes.set(key);
   refreshCards();
   styleStatus.textContent='Zvolen vzhled: '+name+'. Ověř změnu také na hlavních kartách rodičovského centra.';
  },'sd880-preview-card');
  button.dataset.style=key;
  const image=el(button,'img');image.src=art;image.alt='Ukázka vzhledu '+name;image.loading='lazy';
  el(button,'strong',name);
  el(button,'small',desc);
  cards.push(button);
 }
 function refreshCards(){
  const active=window.SDCardThemes?.get?.()||document.body.dataset.cardStyle||'guild';
  for(const button of cards){const isActive=button.dataset.style===active;button.classList.toggle('is-selected',isActive);button.setAttribute('aria-pressed',String(isActive));}
 }
 refreshCards();
 document.addEventListener('sd-card-style-change',refreshCards);
 const background=el(host,'section',undefined,'sd878-theme-panel sd880-theme-panel');
 el(background,'h4','Tapeta a prostředí');
 el(background,'p','Tapeta se změní na úvodní obrazovce, v rodičovském centru i v dalších podporovaných obrazovkách. Je nezávislá na grafickém stylu karet.','sd878-description');
 const bgGrid=el(background,'div',undefined,'sd880-wallpaper-grid');
 const wallpapers=[
  ['hrad','Hrad','hrad.webp'],
  ['priroda','Příroda','priroda.webp'],
  ['skola','Škola','skola.webp'],
  ['hradni','Hradní','hradni-styl.webp'],
  ['noc1','Noční hrad I','hrad-noc-1-5084.webp'],
  ['noc2','Noční hrad II','hrad-noc-2-5084.webp'],
  ['noc3','Noční hrad III','hrad-noc-3-5084.webp']
 ];
 const wallpaperStatus=el(background,'p','','sd880-status');
 const wallButtons=[];
 for(const [key,name,file] of wallpapers){
  const button=btn(bgGrid,'',()=>{
   if(!window.SDEnvironment5088?.setWallpaper){wallpaperStatus.textContent='Tapetu nyní nelze změnit. Zkus aktualizovat aplikaci.';return}
   window.SDEnvironment5088.setWallpaper(key);
   updateWallpaper();
   wallpaperStatus.textContent='Zvolené prostředí: '+name+'.';
  },'sd880-preview-card');
  button.dataset.wallpaper=key;
  const thumb=el(button,'img');thumb.src='./assets/pozadi/'+file;thumb.alt='Tapeta '+name;thumb.loading='lazy';
  el(button,'strong',name);wallButtons.push(button);
 }
 function updateWallpaper(){
  const selected=window.SDEnvironment5088?.wallpaper?.()||document.body.dataset.wallpaper;
  wallButtons.forEach(button=>{const isActive=button.dataset.wallpaper===selected;button.classList.toggle('is-selected',isActive);button.setAttribute('aria-pressed',String(isActive))});
 }
 updateWallpaper();
 document.addEventListener('sd88-wallpaper-changed',updateWallpaper);
 const cloud=host.parentElement?.querySelector('.sd876-cloud-details');
 if(cloud){const sum=cloud.querySelector('summary');if(sum)sum.textContent='Centrální databáze Supabase a synchronizace';}
 el(host,'p','Rodičovský PIN se mění v původní části „Změnit rodičovský PIN“. Heslo ke cloudovému účtu je od PINu oddělené.','sd878-description');
 const change=el(host,'details',undefined,'sd878-theme-panel');
 el(change,'summary','Změnit heslo rodinného cloudu');
 el(change,'p','Heslo použiješ jen pro přihlášení rodiče k centrální databázi. Není to PIN dítěte.','sd878-description');
 const a=el(change,'label','Nové cloudové heslo (min. 10 znaků)','sd878-field');
 const pass=el(a,'input');pass.type='password';pass.autocomplete='new-password';pass.minLength=10;
 const b=el(change,'label','Zopakovat nové heslo','sd878-field');
 const again=el(b,'input');again.type='password';again.autocomplete='new-password';
 const result=el(change,'p','','sd878-description');
 btn(change,'Uložit nové cloudové heslo',async()=>{
  if(pass.value.length<10){result.textContent='Zadej alespoň 10 znaků.';return}
  if(pass.value!==again.value){result.textContent='Hesla se neshodují.';return}
  try{await window.SDCloud866?.changeCloudPassword?.(pass.value);result.textContent='Cloudové heslo bylo změněno.';pass.value='';again.value='';}
  catch(e){result.textContent='Heslo se nepodařilo změnit: '+e.message}
 },'sd878-primary');
 const password=el(host,'details',undefined,'sd878-theme-panel sd878-cloud-password');
 el(password,'summary','Změnit heslo rodičovského cloudového účtu');
 const passwordForm=el(password,'form',undefined,'sd878-password-form');
 const p1=el(el(passwordForm,'label','Nové heslo (minimálně 10 znaků)','sd878-field'),'input');
 p1.type='password';p1.autocomplete='new-password';p1.required=true;p1.minLength=10;
 const p2=el(el(passwordForm,'label','Zopakovat nové heslo','sd878-field'),'input');
 p2.type='password';p2.autocomplete='new-password';p2.required=true;p2.minLength=10;
 const msg=el(passwordForm,'p','','sd878-description');
 const submit=btn(passwordForm,'Uložit nové cloudové heslo',()=>{},'sd878-primary');submit.type='submit';
 passwordForm.onsubmit=async e=>{
  e.preventDefault();
  if(p1.value.length<10){msg.textContent='Použij heslo o délce alespoň 10 znaků.';return}
  if(p1.value!==p2.value){msg.textContent='Hesla se neshodují.';return}
  if(!window.SDCloud866?.isReady?.()){msg.textContent='Nejdřív přihlas rodičovský cloud.';return}
  submit.disabled=true;
  try{
   await window.SDCloud866.requestParent('/auth/v1/user',{method:'PUT',body:{password:p1.value}});
   p1.value='';p2.value='';msg.textContent='Cloudové heslo bylo změněno. Příště se přihlas novým heslem.';
  }catch(err){msg.textContent='Heslo zatím nebylo změněno: '+(err.message||String(err))+'. Pokud služba vyžaduje nové ověření identity, dokonči ho podle jejího pokynu.'}
  finally{submit.disabled=false}
 };
 const logs=el(host,'div',undefined,'sd878-ctl-row');
 btn(logs,'Uložit diagnostický log (TXT)',()=>document.getElementById('diag456Export')?.click(),'sd878-primary');
 const wallpaper=document.getElementById('sd876Wallpaper');
 if(wallpaper&&!host.parentElement.contains(wallpaper))host.after(wallpaper);
}
window.SDPortalSettings878={show};
})();