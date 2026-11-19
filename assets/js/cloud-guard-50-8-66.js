/* Pomocná ochrana samostatných učebních stránek Martina před již smazaným cloudovým účtem. */
(()=>{'use strict';
if(localStorage.getItem('sd866_device_mode')!=='child')return;
const ROOT='https://fmwcavjpsobwaorneedc.supabase.co';
const APIKEY='sb_publishable_jfEwl3aVTkJ9WiV6oFbYGA_MuZHulxj';
const KEY='sd866_supabase_session',PROFILES='matematika-karticky-progress-v3-profiles';
const linked=localStorage.getItem('sd866_linked_legacy');
if(!linked)return;
function revoke(){
 const ps=JSON.parse(localStorage.getItem(PROFILES)||'{}');delete ps[linked];localStorage.setItem(PROFILES,JSON.stringify(ps));
 sessionStorage.removeItem('skolni-live-v441');localStorage.removeItem('matematika-karticky-progress-v3-active');
 alert('Tento profil byl rodičem smazán nebo odpojen.');location.replace('../index.html');
}
async function check(){if(!navigator.onLine||document.hidden)return;
 try{
  let s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s?.refresh_token)return;
  if(s.expires_at && s.expires_at<Math.floor(Date.now()/1000)+70){
   const r=await fetch(ROOT+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:APIKEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
   if(!r.ok)return;s=await r.json();s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in||3600);localStorage.setItem(KEY,JSON.stringify(s));
  }
  const headers={apikey:APIKEY,Authorization:'Bearer '+s.access_token};
  const a=await fetch(ROOT+'/rest/v1/sd_child_accounts?auth_user_id=eq.'+s.user.id+'&select=profile_id',{headers,cache:'no-store'});
  if(!a.ok)return;const accounts=await a.json();if(!accounts?.length){revoke();return}
  const b=await fetch(ROOT+'/rest/v1/sd_profiles?id=eq.'+accounts[0].profile_id+'&select=legacy_id,deleted_at',{headers,cache:'no-store'});
  if(!b.ok)return;const rows=await b.json();if(!rows?.length||rows[0].deleted_at||rows[0].legacy_id!==linked)revoke();
 }catch(e){console.warn('Cloud guard:',e)}
}
setTimeout(check,2000);setInterval(check,30000);window.addEventListener('focus',check);
})();
