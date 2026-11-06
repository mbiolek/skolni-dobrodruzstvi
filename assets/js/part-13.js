/* 50.7.7: historická duplicitní navigace advSubjectMenu byla odstraněna.
 * Všechny tři předměty ovládá aktivní menu subjectHub / czech-hub,
 * historie a Android Zpět patří výhradně centrálnímu part-23.js.
 * Ponecháváme jen původní přepínání tlačítka prostředí podle profilu. */
(()=>{'use strict';
 const skin=document.getElementById('skinHomeButton');
 if(!skin)return;
 skin.textContent='🎨 Změnit moje prostředí';skin.style.display='none';
 window.addEventListener('school-account',e=>{
  skin.style.display=e.detail?.id&&e.detail.id!=='parent'?'flex':'none';
 });
})();
