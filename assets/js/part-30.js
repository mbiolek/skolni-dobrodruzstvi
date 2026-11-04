
(function(){
 function setup(){
   const home=document.getElementById('homeScreen');
   if(!home)return;
   home.querySelectorAll('.subject-grid .subject,.v23-extra-grid .subject').forEach(tile=>{
     tile.querySelectorAll('.v450-stats,.v451-footer').forEach(x=>x.remove());
     const footer=document.createElement('div');footer.className='v451-footer';
     const xp=document.createElement('span');xp.textContent='★ XP';
     const badge=document.createElement('span');
     badge.textContent=tile.matches('button')?'🏅 Odznaky':'🔒 Brzy';
     footer.append(xp,badge);tile.append(footer);
   });
   // V některých starších verzích zůstaly v DOM doslovné znaky \n.
   for(const node of Array.from(document.body.childNodes)){
     if(node.nodeType===3 && /^(?:\s|\\n|\\r)+$/.test(node.textContent))node.remove();
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})();

