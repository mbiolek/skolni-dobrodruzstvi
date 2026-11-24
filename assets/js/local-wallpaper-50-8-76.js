/* Školní dobrodružství 50.8.76: vlastní pozadí pouze na tomto zařízení (IndexedDB). */
(()=>{'use strict';
const DATABASE='sd876_local_wallpapers',STORE='media',KEY='custom',FLAG='sd876_wallpaper_enabled';
let imageUrl=null,busy=false;
const $=id=>document.getElementById(id);
const status=(s,error=false)=>{const e=$('sd876WallpaperStatus');if(e){e.textContent=s;e.classList.toggle('error',error)}};
function storeOpen(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(Error('Prohlížeč nepodporuje místní ukládání obrázků.'));return}
  const req=indexedDB.open(DATABASE,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Ukládání fotografií není dostupné.'));
 });
}
async function operation(mode,value){
 const db=await storeOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),table=tx.objectStore(STORE);
  const req=mode==='readonly'?table.get(KEY):value===null?table.delete(KEY):table.put(value,KEY);
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Zápis fotografie selhal.'));
  tx.oncomplete=()=>db.close();
  tx.onerror=()=>db.close();
 });
}
function apply(blob){
 if(imageUrl)URL.revokeObjectURL(imageUrl);
 imageUrl=URL.createObjectURL(blob);
 document.body.style.setProperty('--sd88-scene','url("'+imageUrl+'")');
 localStorage.setItem(FLAG,'1');
 status('Vlastní pozadí je zapnuté pouze na tomto zařízení.');
}
async function compress(file){
 if(!file.type.startsWith('image/'))throw Error('Vyber fotografii (JPG, PNG, HEIC nebo WebP).');
 if(file.size>25*1024*1024)throw Error('Fotografie je příliš velká. Vyber soubor do 25 MB.');
 let image;
 try{image=await createImageBitmap(file)}catch{
  const temp=URL.createObjectURL(file);
  try{
   image=await new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Fotografii nelze načíst. Zkus JPG nebo PNG.'));img.src=temp;
   });
  }finally{URL.revokeObjectURL(temp)}
 }
 const width=image.width||image.naturalWidth,height=image.height||image.naturalHeight;
 if(!width||!height)throw Error('Neplatné rozměry fotografie.');
 const ratio=Math.min(1,1920/width,1200/height);
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
 const context=canvas.getContext('2d');if(!context)throw Error('Zpracování fotografie není dostupné.');
 context.drawImage(image,0,0,canvas.width,canvas.height);
 if(image.close)image.close();
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Obrázek nelze uložit.')),'image/jpeg',.83));
}
async function setPhoto(file){
 if(busy)return;busy=true;
 try{
  status('Připravuji vlastní pozadí…');
  const blob=await compress(file);
  await operation('readwrite',blob);
  apply(blob);
 }catch(err){status(err.message||String(err),true)}
 finally{busy=false}
}
async function clearPhoto(){
 try{
  await operation('readwrite',null);
  localStorage.setItem(FLAG,'0');
  if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null}
  const preset=localStorage.getItem('sd88-wallpaper')||'noc3';
  window.SDEnvironment5088?.setWallpaper?.(preset);
  status('Vlastní pozadí odstraněno. Zobrazí se vybrané prostředí.');
 }catch(err){status(err.message||String(err),true)}
}
async function boot(){
 const settings=$('sd876Center')?.querySelector('[data-pane="settings"]');
 if(!settings)return;
 const panel=document.createElement('section');panel.id='sd876Wallpaper';
 const h=document.createElement('h4');h.textContent='Vlastní fotografie pozadí';panel.append(h);
 const hint=document.createElement('p');hint.textContent='Vyber fotografii z telefonu nebo počítače. Zůstane uložená pouze na tomto zařízení, neodesílá se do Supabase.';panel.append(hint);
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.id='sd876WallpaperFile';input.addEventListener('change',()=>{if(input.files?.[0])setPhoto(input.files[0]);input.value=''});panel.append(input);
 const remove=document.createElement('button');remove.type='button';remove.textContent='Vrátit původní pozadí';remove.addEventListener('click',clearPhoto);panel.append(remove);
 const text=document.createElement('p');text.id='sd876WallpaperStatus';text.setAttribute('role','status');panel.append(text);settings.append(panel);
 try{
  if(localStorage.getItem(FLAG)==='1'){const blob=await operation('readonly');if(blob instanceof Blob)apply(blob)}
 }catch(err){status('Dříve uloženou fotografii nelze načíst: '+err.message,true)}
 // A new preset chosen in Prostředí always overrides the custom background.
 document.addEventListener('sd88-wallpaper-changed',()=>{localStorage.setItem(FLAG,'0');status('Nyní je zapnuté přednastavené prostředí.')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1900),{once:true});else setTimeout(boot,1900);
})();