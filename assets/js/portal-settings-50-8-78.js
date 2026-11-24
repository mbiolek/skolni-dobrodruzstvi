/* 50.8.78 – nastavení rodiče, prostředí, avataři, PIN a cloud. */
(()=>{'use strict';
const el=(host,tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;host.append(n);return n};
const btn=(host,text,fn,cls)=>{const b=el(host,'button',text,'sd878-btn '+(cls||''));b.type='button';b.onclick=fn;return b};
function show(){
 const host=document.getElementById('sd878SettingsTop');if(!host)return;
 host.replaceChildren();
 el(host,'h3','Prostředí, avatary a zabezpečení');
 el(host,'p','Změny prostředí ovlivní také grafiku hlavních tlačítek rodičovského profilu.','sd878-description');
 const tools=el(host,'div',undefined,'sd878-ctl-row');
 btn(tools,'Vybrat avatara',()=>document.getElementById('v24-avatar-open')?.click(),'sd878-primary');
 const styles=el(host,'details',undefined,'sd878-theme-panel');
 el(styles,'summary','Vzhled tlačítek');
 const theme=el(styles,'div',undefined,'sd878-choice-grid');
 for(const [key,name] of [['a','Hrad'],['b','Příroda'],['c','Škola'],['d','Hradní styl']]){
  btn(theme,name,()=>{
   const original=document.querySelector('#themeSwitcher > button[data-theme="'+key+'"]');
   if(original)original.click();else document.body.dataset.gameTheme=key;
  });
 }
 const background=el(host,'details',undefined,'sd878-theme-panel');
 el(background,'summary','Tapeta a pozadí');
 const bgGrid=el(background,'div',undefined,'sd878-choice-grid');
 for(const [id,name] of [['hrad','Hrad'],['priroda','Příroda'],['skola','Škola'],['hradni','Hradní'],['noc1','Noční hrad I'],['noc2','Noční hrad II'],['noc3','Noční hrad III']]){
  btn(bgGrid,name,()=>window.SDEnvironment5088?.setWallpaper?.(id));
 }
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