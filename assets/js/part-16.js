(()=>{'use strict';
// Replace screenshot-derived icon crops with crisp scalable vector symbols.
const extra={nature:'<path d="M20 99Q10 27 111 19Q110 102 40 109" fill="#58c977" stroke="#20734c" stroke-width="7"/><path d="M27 113Q58 65 100 36" stroke="#efffbd" stroke-width="7" fill="none"/>',history:'<circle cx="70" cy="70" r="52" fill="#2689d9" stroke="#f4c85a" stroke-width="8"/><path d="M52 26L71 42 67 63 84 76 68 93 47 80 33 52Z" fill="#76d16c"/><path d="M95 66L108 77 94 101 80 91Z" fill="#76d16c"/>',music:'<path d="M65 24L111 14V86Q107 104 89 105Q66 106 69 90Q72 74 93 78V38L65 46V102Q61 120 43 120Q19 120 23 103Q26 87 47 91V33Z" fill="#e9b3ff" stroke="#6436b5" stroke-width="6"/>'};
for(const [key,shape] of Object.entries(extra)){const el=document.querySelector('#homeScreen .subject.'+key+' .symbol');if(el)el.innerHTML='<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">'+shape+'</svg>'}
})();
