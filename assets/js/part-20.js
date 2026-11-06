(()=>{'use strict';
const splash=document.createElement('div');splash.id='v37-splash';splash.innerHTML='<div class="v37-splash-img" aria-hidden="true"></div><div class="v37-splash-title">Školní dobrodružství</div><div class="v37-splash-caption">Otevíráme truhlu poznání…</div>';document.body.append(splash);
setTimeout(()=>{splash.classList.add('v37-hide');setTimeout(()=>splash.remove(),500)},1800);
const hero=document.querySelector('#homeScreen .home-hero h1');if(hero)hero.textContent='🧰 Školní dobrodružství';
})();
