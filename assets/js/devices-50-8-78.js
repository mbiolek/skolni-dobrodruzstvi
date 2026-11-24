/* 50.8.78 – rozpoznání typu zařízení ze serverového User-Agentu a hlášení modelu. */
(()=>{'use strict';
const cloud=()=>window.SDCloud866;
const getMode=()=>cloud()?.mode?.()||'';
let lastReport=0;
function parseAgent(agent=''){
 const ua=String(agent||'');
 const iphone=/iPhone/i.test(ua),ipad=/iPad/i.test(ua),android=/Android/i.test(ua),windows=/Windows/i.test(ua),mac=/Macintosh/i.test(ua);
 const phone=/Mobile/i.test(ua),tablet=ipad||(/Android/i.test(ua)&&!phone);
 const browser=/Edg\//i.test(ua)?'Microsoft Edge':/CriOS|Chrome\//i.test(ua)?'Google Chrome':/Firefox|FxiOS/i.test(ua)?'Firefox':/Safari/i.test(ua)?'Safari':'Neurčený prohlížeč';
 const platform=iphone?'iOS (iPhone)':ipad?'iPadOS':android?'Android':windows?'Windows':mac?'macOS':'Neznámý systém';
 const kind=iphone?'Telefon':ipad?'Tablet':windows||mac?'Počítač':android&&phone?'Telefon':tablet?'Tablet nebo režim pro PC':'Neznámý typ';
 return {kind,platform,browser,model:iphone?'iPhone (přesný model nezjištěn)':ipad?'iPad (přesný model nezjištěn)':'',uncertain:!(iphone||ipad||windows||mac||android&&phone)};
}
async function report(){
 if(window.__SD878Preview||document.hidden||!navigator.onLine||getMode()!=='child')return;
 if(Date.now()-lastReport<6*3600000)return;
 lastReport=Date.now();
 try{
  const hints=navigator.userAgentData;
  const info=hints?.getHighEntropyValues?await hints.getHighEntropyValues(['model','platform','platformVersion']):null;
  const parsed=parseAgent(navigator.userAgent);
  const platform=info?.platform?String(info.platform)+' '+String(info.platformVersion||''):parsed.platform;
  const model=info?.model?String(info.model):parsed.model;
  await cloud().requestCloud('/rest/v1/rpc/sd_878_report_own_device',{method:'POST',body:{
   p_kind:parsed.kind,p_platform:platform,p_model:model,p_browser:parsed.browser
  }});
 }catch(e){console.warn('Školní dobrodružství: typ zařízení nebyl nahlášen',e.message)}
}
async function inventory(){
 if(!cloud()?.isReady?.())throw Error('Pro podrobnosti zařízení přihlas rodinný cloud.');
 const rows=await cloud().requestParent('/rest/v1/rpc/sd_878_parent_devices',{method:'POST',body:{}});
 return (Array.isArray(rows)?rows:[]).map(row=>{
  const derived=parseAgent(row.user_agent||'');
  const system=row.device_platform||derived.platform;
  const kind=row.device_kind||derived.kind;
  const browser=row.device_browser||derived.browser;
  const model=row.device_model||derived.model||'Přesný model zatím není uložen';
  return {...row,kind,platform:system,browser,model,uncertain:derived.uncertain&&!row.device_kind};
 });
}
function init(){
 window.addEventListener('school-account',()=>setTimeout(report,1500));
 window.addEventListener('sd866-updated',()=>setTimeout(report,900));
 window.addEventListener('online',()=>setTimeout(report,500));
 setTimeout(report,1800);
}
window.SDDevice878={inventory,parseAgent};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();