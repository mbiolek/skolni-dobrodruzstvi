/* Školní dobrodružství 50.8.35 – bezpečná inkrementální aktualizace.
 * Pouze funkční základ + tapety se stahují před aktivací; zbytek průběžně.
 * Dosavadní verze zůstává funkční až do potvrzeného dokončení.
 */
'use strict';
const VERSION='50.8.35';
const CACHE='skolni-dobrodruzstvi-v50-8-35-shell';
const RUNTIME='sd-lazy-assets-v50-8-35';
const ASSETS=["./assets/ikony/home-50-8-21/guild-hudebni-vychova.webp","./assets/ikony/home-50-8-21/guild-vlastiveda.webp","./assets/ikony/home-50-8-21/guild-prirodopis.webp","./assets/ikony/home-50-8-21/guild-cestina.webp","./assets/ikony/home-50-8-21/guild-anglictina.webp","./assets/ikony/home-50-8-21/guild-matematika.webp","./assets/ikony/home-50-8-21/parchment-hudebni-vychova.webp","./assets/ikony/home-50-8-21/parchment-vlastiveda.webp","./assets/ikony/home-50-8-21/parchment-prirodopis.webp","./assets/ikony/home-50-8-21/parchment-cestina.webp","./assets/ikony/home-50-8-21/parchment-anglictina.webp","./assets/ikony/home-50-8-21/parchment-matematika.webp","./assets/ikony/home-50-8-21/adventure-hudebni-vychova.webp","./assets/ikony/home-50-8-21/adventure-vlastiveda.webp","./assets/ikony/home-50-8-21/adventure-prirodopis.webp","./assets/ikony/home-50-8-21/adventure-cestina.webp","./assets/ikony/home-50-8-21/adventure-anglictina.webp","./assets/ikony/home-50-8-21/adventure-matematika.webp","./assets/ikony/home-50-8-21/stone-hudebni-vychova.webp","./assets/ikony/home-50-8-21/stone-vlastiveda.webp","./assets/ikony/home-50-8-21/stone-prirodopis.webp","./assets/ikony/home-50-8-21/stone-cestina.webp","./assets/ikony/home-50-8-21/stone-anglictina.webp","./assets/ikony/home-50-8-21/stone-matematika.webp","./assets/ikony/home-50-8-21/glass-hudebni-vychova.webp","./assets/ikony/home-50-8-21/glass-vlastiveda.webp","./assets/ikony/home-50-8-21/glass-prirodopis.webp","./assets/ikony/home-50-8-21/glass-cestina.webp","./assets/ikony/home-50-8-21/glass-anglictina.webp","./assets/ikony/home-50-8-21/glass-matematika.webp","./assets/js/responsive-cards-50-8-21.js","./assets/css/responsive-cards-50-8-21.css","./assets/css/card-layout-fix-50-8-2.css","./assets/css/card-style-preview-50-8-1.css","./assets/css/card-themes-50-7-6.css","./assets/css/czech-hub-50-7-4.css","./assets/css/english-unit-49-9.css","./assets/css/exact-cutouts-50-8-4.css","./assets/css/exact-cutouts-50-8-5.css","./assets/css/exact-cutouts-50-8-7.css","./assets/css/fix-50-0-2.css","./assets/css/global-style-50-8-8.css","./assets/css/guild-50-8-0.css","./assets/css/home-adventure-buttons-50-8-15.css","./assets/css/home-buttons-50-8-17.css","./assets/css/home-style-unify-50-8-14.css","./assets/css/hotfix-50-8-10.css","./assets/css/hotfix-50-8-11.css","./assets/css/hotfix-50-8-12.css","./assets/css/hotfix-50-8-13.css","./assets/css/hotfix-50-8-9.css","./assets/css/merlin-50-5.css","./assets/css/merlin-50-6-2.css","./assets/css/merlin-50-6.css","./assets/css/merlin-no-question-50-8-4.css","./assets/css/merlin-stage-50-7-8.css","./assets/css/nav-50-7-7.css","./assets/css/night-castles-50-8-4.css","./assets/css/part-01.css","./assets/css/part-02.css","./assets/css/part-03.css","./assets/css/part-04.css","./assets/css/part-05.css","./assets/css/part-06.css","./assets/css/part-07.css","./assets/css/part-08.css","./assets/css/part-09.css","./assets/css/part-10.css","./assets/css/part-11.css","./assets/css/part-12.css","./assets/css/part-13.css","./assets/css/part-14.css","./assets/css/part-15.css","./assets/css/part-16.css","./assets/css/part-17.css","./assets/css/part-18.css","./assets/css/part-19.css","./assets/css/part-20.css","./assets/css/part-21.css","./assets/css/part-22.css","./assets/css/part-23.css","./assets/css/part-24.css","./assets/css/part-25.css","./assets/css/part-26.css","./assets/css/part-27.css","./assets/css/part-28.css","./assets/css/part-29.css","./assets/css/part-30.css","./assets/css/part-31.css","./assets/css/part-32.css","./assets/css/part-33.css","./assets/css/part-34.css","./assets/css/part-35.css","./assets/css/part-36.css","./assets/css/part-37.css","./assets/css/part-38.css","./assets/css/part-39.css","./assets/css/part-40.css","./assets/css/part-41.css","./assets/css/part-42.css","./assets/css/part-43.css","./assets/css/part-44.css","./assets/css/part-45.css","./assets/css/part-46.css","./assets/css/school-plans-50-2.css","./assets/css/splash-50-8-8.css","./assets/css/stone-reference-50-8-3.css","./assets/css/svg-layers-50-7-9.css","./assets/css/ucivo-50-1.css","./assets/css/ui-cards.css","./assets/css/update-50-4.css","./assets/css/update-50-7.css","./assets/css/update-progress-50-8-6.css","./assets/ikony/aplikace/icon-192.png","./assets/ikony/home-adventure/anglictina.png","./assets/ikony/home-adventure/cestina.png","./assets/ikony/home-adventure/hudebni-vychova.png","./assets/ikony/home-adventure/matematika.png","./assets/ikony/home-adventure/prirodopis.png","./assets/ikony/home-adventure/vlastiveda.png","./assets/ikony/home-crystal/anglictina.webp","./assets/ikony/home-crystal/cestina.webp","./assets/ikony/home-crystal/hudebni-vychova.webp","./assets/ikony/home-crystal/matematika.webp","./assets/ikony/home-crystal/prirodopis.webp","./assets/ikony/home-crystal/vlastiveda.webp","./assets/ikony/home-guild/anglictina.webp","./assets/ikony/home-guild/cestina.webp","./assets/ikony/home-guild/hudebni-vychova.webp","./assets/ikony/home-guild/matematika.webp","./assets/ikony/home-guild/prirodopis.webp","./assets/ikony/home-guild/vlastiveda.webp","./assets/ikony/home-parchment/anglictina.webp","./assets/ikony/home-parchment/cestina.webp","./assets/ikony/home-parchment/hudebni-vychova.webp","./assets/ikony/home-parchment/matematika.webp","./assets/ikony/home-parchment/prirodopis.webp","./assets/ikony/home-parchment/vlastiveda.webp","./assets/ikony/hradni-styl-math.webp","./assets/ikony/hradni-styl-english.webp","./assets/ikony/hradni-styl-czech.webp","./assets/ikony/hradni-styl-nature.webp","./assets/ikony/hradni-styl-history.webp","./assets/ikony/hradni-styl-music.webp","./assets/js/app-version.js","./assets/js/card-style-preview-50-8-1.js","./assets/js/card-themes-50-7-6.js","./assets/js/czech-hub-50-7-4.js","./assets/js/english-unit-49-9.js","./assets/js/exact-cutouts-50-8-4.js","./assets/js/exact-cutouts-50-8-5.js","./assets/js/exact-cutouts-50-8-7.js","./assets/js/fix-50-0-2.js","./assets/js/global-style-50-8-8.js","./assets/js/home-adventure-buttons-50-8-15.js","./assets/js/home-buttons-50-8-17.js","./assets/js/home-style-unify-50-8-14.js","./assets/js/label-home-fix-50-8-12.js","./assets/js/merlin-50-5.js","./assets/js/merlin-50-6-2.js","./assets/js/merlin-50-6.js","./assets/js/merlin-stage-50-7-8.js","./assets/js/night-castles-50-8-4.js","./assets/js/part-01.js","./assets/js/part-02.js","./assets/js/part-03.js","./assets/js/part-04.js","./assets/js/part-05.js","./assets/js/part-06.js","./assets/js/part-07.js","./assets/js/part-08.js","./assets/js/part-09.js","./assets/js/part-10.js","./assets/js/part-11.js","./assets/js/part-12.js","./assets/js/part-13.js","./assets/js/part-14.js","./assets/js/part-15.js","./assets/js/part-16.js","./assets/js/part-17.js","./assets/js/part-18.js","./assets/js/part-19.js","./assets/js/part-20.js","./assets/js/part-21.js","./assets/js/part-22.js","./assets/js/part-23.js","./assets/js/part-24.js","./assets/js/part-25.js","./assets/js/part-26.js","./assets/js/part-27.js","./assets/js/part-28.js","./assets/js/part-29.js","./assets/js/part-30.js","./assets/js/part-31.js","./assets/js/part-32.js","./assets/js/school-plans-50-2.js","./assets/js/splash-50-8-8.js","./assets/js/title-fit-50-8-10.js","./assets/js/title-fit-50-8-11.js","./assets/js/ucivo-50-1.js","./assets/js/ui-cards.js","./assets/js/update-50-4.js","./assets/js/update-50-7.js","./assets/merlin/merlin-lucerna-5070.webp","./assets/pozadi/hrad-noc-1-5084.webp","./assets/ui-exact-50-8-4/guild/blanks/mesicni_plan.svg","./assets/ui-exact-50-8-4/guild/blanks/opakovani.svg","./assets/ui-exact-50-8-4/guild/blanks/procvicovani.svg","./assets/ui-exact-50-8-4/guild/blanks/test.svg","./assets/ui-exact-50-8-4/guild/blanks/vyuka.svg","./assets/ui-exact-50-8-4/guild/blanks/zaverecny_test.svg","./assets/ui-exact-50-8-4/parchment/blanks/mesicni_plan.svg","./assets/ui-exact-50-8-4/parchment/blanks/opakovani.svg","./assets/ui-exact-50-8-4/parchment/blanks/procvicovani.svg","./assets/ui-exact-50-8-4/parchment/blanks/test.svg","./assets/ui-exact-50-8-4/parchment/blanks/vyuka.svg","./assets/ui-exact-50-8-4/parchment/blanks/zaverecny_test.svg","./firebase-sync.js","./index.html","./manifest.webmanifest","./novinky-46.js","./opravy-46-5.js","./reky-49-1.js","./vlastiveda-48.js","./vlastiveda.js","./assets/js/fulnek-launch-50-8-18.js","./assets/js/revize-obrazovek-50-8-19.js","./assets/css/fulnek-launch-50-8-18.css","./assets/css/revize-obrazovek-50-8-19.css","./assets/css/home-xp-fulnek-50-8-22.css","./assets/js/home-xp-fulnek-50-8-22.js","./ZMENY_50_8_22.txt","./matematika-fulnek/index.html","./matematika-fulnek/fulnek.css","./matematika-fulnek/fulnek.js","./assets/js/nature-launch-50-8-20.js","./assets/css/nature-launch-50-8-20.css","./prirodoveda-fulnek/index.html","./prirodoveda-fulnek/nature.css","./prirodoveda-fulnek/nature.js","./prirodoveda-fulnek/chapters.json","./prirodoveda-fulnek/images/energie-prehled.webp","./prirodoveda-fulnek/images/energie.webp","./prirodoveda-fulnek/images/fotosynteza.webp","./prirodoveda-fulnek/images/horniny.webp","./prirodoveda-fulnek/images/kolobeh-vody.webp","./prirodoveda-fulnek/images/nerosty.webp","./prirodoveda-fulnek/images/neziva-priroda.webp","./prirodoveda-fulnek/images/potravni-retezec.webp","./prirodoveda-fulnek/images/prehled-prirody.webp","./prirodoveda-fulnek/images/puda-a-vzduch.webp","./prirodoveda-fulnek/images/puda.webp","./prirodoveda-fulnek/images/stavba-zeme.webp","./prirodoveda-fulnek/images/ucivo-prehled.webp","./prirodoveda-fulnek/images/vesmir.webp","./prirodoveda-fulnek/images/voda-vzduch-puda.webp","./prirodoveda-fulnek/images/voda.webp","./prirodoveda-fulnek/images/vzduch.webp","./prirodoveda-fulnek/images/zeme.webp","./prirodoveda-fulnek/images/ziva-priroda.webp","./prirodoveda-fulnek/chapters-data.js","./ZMENY_50_8_23.txt","./obnova.html","./ZMENY_50_8_24.txt","./assets/css/home-layout-50-8-25.css","./assets/js/home-layout-50-8-25.js","./assets/js/fulnek-bank-50-8-25.js","./assets/css/home-map-50-8-26.css","./assets/js/home-map-50-8-26.js","./ZMENY_50_8_26.txt","./assets/js/school-switch-50-8-27.js","./assets/css/school-switch-50-8-27.css","./assets/ui-svg/layers/icons/mapa_a_kompas.svg","./ZMENY_50_8_27.txt","./assets/css/safe-schools-50-8-28.css","./ZMENY_50_8_28.txt","./assets/css/home-environment-50-8-29.css","./assets/js/home-environment-50-8-29.js","./ZMENY_50_8_29.txt","./assets/js/home-appearance-50-8-30.js","./assets/css/home-appearance-50-8-30.css","./ZMENY_50_8_31.txt","./assets/css/quiz-bank-50-8-32.css","./ZMENY_50_8_32.txt","./assets/js/answer-auto-50-8-33.js","./assets/css/answer-auto-50-8-33.css","./ZMENY_50_8_33.txt","./assets/js/environment-audit-50-8-34.js","./assets/css/environment-audit-50-8-34.css","./ZMENY_50_8_34.txt","./assets/css/adventure-journey-50-8-34.css","./assets/js/adventure-journey-50-8-34.js","./assets/ui-exact-50-8-8/adventure/vyuka.png","./assets/ui-exact-50-8-8/adventure/procvicovani.png","./assets/ui-exact-50-8-8/adventure/test.png","./assets/ikony/cards-50-8-35/matematika.webp","./assets/ikony/cards-50-8-35/anglictina.webp","./assets/ikony/cards-50-8-35/cestina.webp","./assets/ikony/cards-50-8-35/prirodoveda.webp","./assets/ikony/cards-50-8-35/vlastiveda.webp","./assets/ikony/cards-50-8-35/hudebni-vychova.webp","./assets/ikony/cards-50-8-35/mapa-dobrodruzstvi.webp","./assets/ikony/cards-50-8-35/mesicni-plan.webp","./assets/ikony/cards-50-8-35/nastaveni.webp","./assets/ikony/cards-50-8-35/vyuka.webp","./assets/ikony/cards-50-8-35/procvicovani.webp","./assets/ikony/cards-50-8-35/test.webp","./assets/ikony/cards-50-8-35/moje-vysledky.webp","./assets/ikony/cards-50-8-35/matematika-fulnek.webp","./assets/ikony/cards-50-8-35/matematika-olomouc.webp","./assets/ikony/cards-50-8-35/kapitoly-podle-ucebnice.webp","./assets/ikony/cards-50-8-35/cisla-slovnich-druhu.webp","./assets/ikony/cards-50-8-35/pravopis-a-diktaty.webp","./assets/ikony/cards-50-8-35/nasobeni.webp","./assets/ikony/cards-50-8-35/deleni.webp","./assets/ikony/cards-50-8-35/nasobeni-deleni.webp","./assets/ikony/cards-50-8-35/desitkova-soustava.webp","./assets/ikony/cards-50-8-35/nasobky-deseti.webp","./assets/ikony/cards-50-8-35/pisemne-deleni.webp","./assets/ikony/cards-50-8-35/deleni-se-zbytkem.webp","./assets/ikony/cards-50-8-35/poradi-operaci-a-zavorky.webp","./assets/ikony/cards-50-8-35/animovana-skola-deleni.webp","./assets/css/card-3d-50-8-35.css","./ZMENY_50_8_35.txt"];
const TOTAL=ASSETS.length;
let downloaded=0, stage='waiting-to-download', lastSent=0;
async function report(force=false,detail=''){
 const now=Date.now();if(!force&&now-lastSent<350&&downloaded<TOTAL)return;
 lastSent=now;
 const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const data={type:'SD_UPDATE_PROGRESS',version:VERSION,stage,done:downloaded,total:TOTAL,detail};
 await Promise.allSettled(clients.map(c=>c.postMessage(data)));
}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function retrieve(url,cache){
 let error;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(url,{cache:'no-store',credentials:'same-origin'});
   if(!response.ok||response.type==='opaque')throw Error('HTTP '+response.status+' '+url.pathname);
   await cache.put(url,response.clone());return;
  }catch(e){error=e;if(attempt<2)await sleep((attempt+1)*550);}
 }
 throw error;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 stage='downloading';downloaded=0;await report(true);
 const cache=await caches.open(CACHE);let next=0,failed=null;
 const worker=async()=>{
  while(!failed){const i=next++;if(i>=TOTAL)return;
   const url=new URL(ASSETS[i],self.registration.scope);
   try{await retrieve(url,cache);downloaded++;await report();}
   catch(error){failed=error;return;}
  }
 };
 await Promise.all([worker(),worker(),worker()]);
 if(failed||downloaded!==TOTAL){
  stage='error';await report(true,String(failed||'Nedokončené stažení'));
  await caches.delete(CACHE);throw failed||Error('Neúplná instalace');
 }
 stage='ready';await report(true);
 // 50.8.25: předchozí chybné UI zamrzalo na 0 % a nemohlo potvrdit aktualizaci.
 // Aktivujeme opravu automaticky; nepřistupujeme k localStorage ani výsledkům.
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(n=>(n.startsWith('skolni-dobrodruzstvi-')||n.startsWith('sd-lazy-assets-'))&&n!==CACHE&&n!==RUNTIME).map(n=>caches.delete(n)));
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 const msg=event.data||{};
 if(msg.type==='SD_UPDATE_GET_STATUS'){
  event.source?.postMessage({type:'SD_UPDATE_PROGRESS',version:VERSION,stage,done:downloaded,total:TOTAL});
 }
 if(msg.type==='SKIP_WAITING'&&stage==='ready')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url),base=new URL(self.registration.scope);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||url.pathname.endsWith('/sw.js'))return;
 event.respondWith((async()=>{
  const shell=await caches.open(CACHE);
  const offline=await shell.match(req,{ignoreSearch:true});if(offline)return offline;
  // Root navigation opens the app; other stored HTML pages (maps, etc.) stay accessible.
  if(req.mode==='navigate' && (url.pathname===base.pathname || url.pathname===base.pathname+'index.html')){
   const home=await shell.match(new URL('./index.html',base));if(home)return home;
  }
  const lazy=await caches.open(RUNTIME);
  const saved=await lazy.match(req,{ignoreSearch:true});if(saved)return saved;
  try{
   const response=await fetch(req);
   const storeCopy=response.clone();
   if(response.ok&&response.type==='basic'&&req.mode!=='navigate'){
    event.waitUntil((async()=>{
     try{
      await lazy.put(req,storeCopy);
      const keys=await lazy.keys();
      // Limit runtime cache to prevent storage exhaustion on Android.
      if(keys.length>210)await Promise.all(keys.slice(0,keys.length-210).map(k=>lazy.delete(k)));
     }catch(e){ /* Browser still receives the online asset. */ }
    })());
   }
   return response;
  }catch(e){
   if(req.mode==='navigate'){
    const cached=await shell.match(new URL('./index.html',base));if(cached)return cached;
   }
   throw e;
  }
 })());
});
