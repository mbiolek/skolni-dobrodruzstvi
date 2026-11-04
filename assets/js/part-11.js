
(()=>{const d=document.getElementById('appVersionDialog');document.getElementById('appVersionTag').onclick=()=>d.classList.add('open');document.getElementById('appVersionClose').onclick=()=>d.classList.remove('open');d.addEventListener('click',e=>{if(e.target===d)d.classList.remove('open')});document.addEventListener('keydown',e=>{if(e.key==='Escape')d.classList.remove('open')})})();

