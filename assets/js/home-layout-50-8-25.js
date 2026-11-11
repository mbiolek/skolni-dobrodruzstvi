/* 50.8.25 — společná mobilní mřížka, zachovává původní tlačítka a jejich click obsluhu. */
(()=>{'use strict';
function init(){
 const home=document.getElementById('homeScreen');if(!home)return;
 const a=home.querySelector('.subject-grid'), b=home.querySelector('.v23-extra-grid');
 if(a&&b&&!home.querySelector('.sd825-home-grid')){
  const wrap=document.createElement('div');wrap.className='sd825-home-grid';
  a.parentNode.insertBefore(wrap,a);wrap.append(a,b);
 }
 window.SDResponsive50821?.refresh?.();
 window.SDHomeXpFulnek50822?.refresh?.();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
