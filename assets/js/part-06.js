
(()=>{
const $=id=>document.getElementById(id);let step=0,timer=null;
const stages=[
['Začínáme','První číslice 3 je menší než 8, proto vezmeme první dvě číslice: 34.'],
['34 : 8 = 4','Osmička se do 34 vejde čtyřikrát. Napíšeme 4 jako první číslici výsledku.'],
['Vypočítáme zbytek','4 × 8 = 32. Číslo 32 si vypočítáme v hlavě. Pod 34 zapisujeme jen zbytek 2.'],
['34 − 32 = 2','Odečteme 32 od 34. Zůstane nám 2.'],
['Stáhneme 8 ↓','Další číslici 8 stáhneme ke zbytku 2. Vznikne 28.'],
['28 : 8 = 3','Osmička se do 28 vejde třikrát. Napíšeme 3 do výsledku.'],
['Vypočítáme zbytek','3 × 8 = 24. Pod 28 zapisujeme jen zbytek 4.'],
['28 − 24 = 4','Odečteme 24 od 28. Zůstane 4.'],
['Stáhneme 6 ↓','Stáhneme poslední číslici 6 ke zbytku 4. Vznikne 46.'],
['46 : 8 = 5','Osmička se do 46 vejde pětkrát. Napíšeme 5 do výsledku.'],
['Vypočítáme zbytek','5 × 8 = 40. Pod 46 zapisujeme jen zbytek 6.'],
['46 − 40 = 6','Zbývá 6. Už nemáme co stáhnout a 6 je menší než 8.'],
['Hotovo!','Výsledek je 435 a zbytek 6. Kontrola: 435 × 8 + 6 = 3 486.']
];
const T=(x,y,str,color='#283453',size=26,weight=700,anchor='middle')=>`<text class="vd-pop" x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${str}</text>`;
function schoolDrawing(index,opts={}){
 const colors=['#bf632b','#9148a7','#287fae'],ink='#28384b';
 const x=[510,582,654,726],q=[986,1058,1130],baseline=250;
 const text=(xx,yy,str,color=ink,size=34,weight=500,anchor='middle')=>`<text x="${xx}" y="${yy}" text-anchor="${anchor}" font-family="Arial,system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" class="vd-pop">${str}</text>`;
 const arrow=(d,c,i)=>`<path d="${d}" stroke="${c}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#bookArrow${i})" class="vd-arr"/>`;
 let o=`<defs>${colors.map((c,i)=>`<marker id="bookArrow${i}" viewBox="0 0 12 12" markerWidth="8" markerHeight="8" refX="10" refY="6" orient="auto"><path d="M1 1 L10 6 L1 11" stroke="${c}" fill="none" stroke-width="1.7"/></marker>`).join('')}</defs>`;
 // Each top arrow begins immediately ABOVE the quotient digit in the corresponding calculation.
 // The end is anchored directly above its matching digit in the final quotient.
 const topPaths=[
  'M 212 299 C 212 140, 470 112, 706 115 C 871 116, 976 134, 986 218',
  'M 212 365 C 210 104, 473 73, 726 77 C 930 78, 1047 110, 1058 218',
  'M 212 431 C 207 66, 480 32, 755 38 C 988 41, 1122 89, 1130 218'
 ];
 [1,5,9].forEach((n,i)=>{if(index>=n)o+=arrow(topPaths[i],colors[i],i)});
 x.forEach((xx,i)=>o+=text(xx,baseline,'3486'[i]));
 o+=text(811,baseline,':')+text(867,baseline,'8')+text(921,baseline,'=');
 [1,5,9].forEach((n,i)=>{if(index>=n)o+=text(q[i],baseline,[4,3,5][i])});
 o+=`<path d="M582 260 v14 h16 v-14" stroke="${ink}" stroke-width="2.2" fill="none"/>`;
 if(index>=3)o+=text(582,315,'2');
 if(index>=4)o+=text(654,315,'8');
 if(index>=7)o+=text(654,378,'4');
 if(index>=8)o+=text(726,378,'6');
 if(index>=11)o+=text(726,441,'6');
 // Separate fragments give exact start points at digits 4/3/5 and remainders 2/4/6.
 const rows=[
  {y:318,prefix:'34 : 8 = ',digit:'4',rem:'2'},
  {y:384,prefix:'28 : 8 = ',digit:'3',rem:'4'},
  {y:450,prefix:'46 : 8 = ',digit:'5',rem:'6'}
 ];
 rows.forEach((r,i)=>{if(index>=[1,5,9][i]){
   o+=text(30,r.y,r.prefix,colors[i],29,500,'start');
   o+=text(212,r.y,r.digit,colors[i],29,600);
   o+=text(228,r.y,', zbytek:',colors[i],29,500,'start');
   o+=text(416,r.y,r.rem,colors[i],29,600);
 }});
 // Short remainder arrows originate DIRECTLY at the written remainder digit.
 if(index>=3)o+=arrow('M 428 311 Q 472 344 570 292',colors[0],0);
 if(index>=7)o+=arrow('M 428 377 Q 514 425 643 355',colors[1],1);
 if(index>=11)o+=arrow('M 428 443 Q 550 478 716 418',colors[2],2);
 if(index===0)o+=`<ellipse cx="546" cy="240" rx="77" ry="29" fill="none" stroke="${colors[0]}" stroke-width="3"/>`;
 if(index===12)o+=text(1008,451,'435, zbytek 6','#14896a',23,700);
 return o;
}
function render(){ $('vdSvg').setAttribute('viewBox','0 0 1200 480');$('vdSvg').innerHTML=schoolDrawing(step);$('vdTitle').textContent=stages[step][0];$('vdText').textContent=stages[step][1];$('vdProgress').style.width=((step+1)/stages.length*100)+'%';$('vdPrev').disabled=step===0;$('vdNext').textContent=step===12?'Znovu ↻':'Další krok →';}
function stop(){if(timer){clearInterval(timer);timer=null}$('vdPlay').textContent='▶ Přehrát'}
function next(){step=step===12?0:step+1;render()}
function close(){stop();$('visualDiv').classList.add('hidden');document.body.style.overflow=''}
let vdScale=1,vdTouchStart=0,vdScaleStart=1;
function vdZoom(v){vdScale=Math.max(1,Math.min(3.5,v));$('vdSvg').style.width=(vdScale*100)+'%';$('vdZoomText').textContent=Math.round(vdScale*100)+' % · roztáhni dvěma prsty'}
$('vdMinus').onclick=()=>vdZoom(vdScale-.25);$('vdPlus').onclick=()=>vdZoom(vdScale+.25);$('vdReset').onclick=()=>vdZoom(1);
const vdView=$('vdViewport');const vdDist=e=>Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
vdView.addEventListener('touchstart',e=>{if(e.touches.length===2){vdTouchStart=vdDist(e);vdScaleStart=vdScale}},{passive:true});
vdView.addEventListener('touchmove',e=>{if(e.touches.length===2&&vdTouchStart){e.preventDefault();vdZoom(vdScaleStart*vdDist(e)/vdTouchStart)}},{passive:false});
vdView.addEventListener('touchend',e=>{if(e.touches.length<2)vdTouchStart=0},{passive:true});
$('visualDivLaunch').addEventListener('click',()=>{step=0;stop();$('visualDiv').classList.remove('hidden');document.body.style.overflow='hidden';render()});$('vdClose').onclick=close;$('vdPrev').onclick=()=>{stop();step=Math.max(0,step-1);render()};$('vdNext').onclick=()=>{stop();next()};$('vdPlay').onclick=()=>{if(timer){stop();return}if(step===12)step=0;render();$('vdPlay').textContent='⏸ Pauza';timer=setInterval(()=>{if(step===12){stop();return}next()},2400)};
})();

