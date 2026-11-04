
(function(){const b=document.getElementById('tailHint');if(!b)return;
b.addEventListener('click',()=>{setTimeout(()=>{const svg=document.getElementById('tailVisualSvg');if(!svg||typeof window.schoolTextbookDrawing!=='function')return;
// Show the exact same textbook drawing in the hint, not the older clipped drawing.
svg.setAttribute('viewBox','0 0 1200 530');svg.innerHTML=window.schoolTextbookDrawing(12);svg.style.width="100%";},0)},false);
})();

