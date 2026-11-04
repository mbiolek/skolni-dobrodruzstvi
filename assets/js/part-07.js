(()=>{const $=id=>document.getElementById(id),K='matematika-karticky-progress-v3-profiles';let id=()=> $('enProfile').value||'default';let read=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')}catch{return {}}};let edit=fn=>{let all=read();all[id()]??={name:'Hráč 1'};fn(all[id()]);localStorage.setItem(K,JSON.stringify(all))};let norm=x=>String(x).toLocaleLowerCase('cs').trim().normalize('NFC').replace(/\s+/g,' ').replace(/\s*[-–]\s*/g,'-');
let words=[],queue=[],pos=0,good=0,mistakes=0,started=0,asked=0,question=null,phase='idle',timer=null,firstMistake=false;
const shuffle=a=>a.sort(()=>Math.random()-.5);
function refresh(){words=read()[id()]?.vocabulary||[];$('vocList').replaceChildren();words.forEach((w,i)=>{let d=document.createElement('div');d.className='eng-review';d.textContent=w.cz+' → '+w.en+' ';let b=document.createElement('button');b.textContent='Smazat';b.onclick=()=>{edit(p=>p.vocabulary.splice(i,1));refresh()};d.append(b);$('vocList').append(d)})}
$('vocAdd').onclick=()=>{let cz=$('vocCz').value.trim(),en=$('vocEn').value.trim();if(!cz||!en){$('vocStatus').textContent='Vyplň obě slova.';return}edit(p=>{p.vocabulary??=[];if(!p.vocabulary.some(w=>norm(w.cz)===norm(cz)&&norm(w.en)===norm(en)))p.vocabulary.push({cz,en,wrong:0,slow:0})});$('vocCz').value=$('vocEn').value='';refresh()};
$('enProfile').addEventListener('change',refresh);document.querySelectorAll('[data-open="english"]').forEach(x=>x.addEventListener('click',()=>setTimeout(refresh,0)));
function speak(){if(!question||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(question.word.en);u.lang='en-GB';u.rate=.8;window.speechSynthesis.speak(u)}$('vocSpeak').onclick=speak;
function chooseQuestion(index){let mode=$('vocMode').value,kind=mode==='mixed'?['cards-en','write-en','listen-write','cards-cz','write-cz','listen-cards'][index%6]:mode==='cards'?(index%2?'cards-cz':'cards-en'):(index%2?'write-cz':'write-en');return {word:words[queue[index]],kind,idx:queue[index]}}
function ask(){clearTimeout(timer);if(pos>=queue.length){stop(true);return}question=chooseQuestion(pos);phase='asking';firstMistake=false;asked=Date.now();const {word:w,kind}=question;let listen=kind.startsWith('listen'),cards=kind.startsWith('cards')||kind==='listen-cards',reverse=kind.endsWith('-cz');$('vocCount').textContent=`Otázka ${pos+1} / ${queue.length} · správně ${good}`;$('vocBar').style.width=(100*pos/queue.length)+'%';$('vocInstruction').textContent=listen?'Poslechni si slovíčko a napiš nebo vyber český překlad.':reverse?'Přelož z angličtiny do češtiny.':'Přelož z češtiny do angličtiny.';$('vocPrompt').textContent=listen?'🔊 Poslechni si slovo':reverse?w.en:w.cz;$('vocSpeak').classList.toggle('newhidden',!listen);$('vocFeedback').textContent='';$('vocNext').classList.add('newhidden');$('vocInput').value='';$('vocInput').classList.remove('voc-wrong','voc-correct');$('vocInput').disabled=false;$('vocCheck').disabled=false;$('vocCards').classList.toggle('newhidden',!cards);$('vocWriting').classList.toggle('newhidden',cards);$('vocCards').replaceChildren();$('vocInput').placeholder=reverse||listen?'Napiš česky':'Napiš anglicky';if(cards){let candidates=[question.idx];for(const i of shuffle([...words.keys()].filter(i=>i!==question.idx))){let value=(reverse||listen?words[i].cz:words[i].en);if(!candidates.some(j=>norm(reverse||listen?words[j].cz:words[j].en)===norm(value)))candidates.push(i);if(candidates.length===4)break}for(const i of shuffle(candidates)){let b=document.createElement('button');b.className='voc-answer';b.textContent=reverse||listen?words[i].cz:words[i].en;b.onclick=()=>answer(i===question.idx,b);$('vocCards').append(b)}}else setTimeout(()=>$('vocInput').focus(),50);if(listen)setTimeout(()=>{if(phase==='asking')speak()},300)}
function record(ok){let w=question.word;edit(p=>{let v=(p.vocabulary||[]).find(x=>x.cz===w.cz&&x.en===w.en);if(v){if(!ok)v.wrong=(v.wrong||0)+1;if(Date.now()-asked>10000)v.slow=(v.slow||0)+1}})}
function advance(){clearTimeout(timer);pos++;ask()}
function answer(ok,btn){if(phase!=='asking'&&phase!=='retry')return;let w=question.word,reverse=question.kind.endsWith('-cz')||question.kind.startsWith('listen'),expected=reverse?w.cz:w.en;
if(ok){if(!firstMistake){good++;record(true)}phase='correct';if(btn)btn.classList.add('voc-correct');$('vocInput').classList.remove('voc-wrong');$('vocInput').classList.add('voc-correct');$('vocFeedback').textContent=firstMistake?'✓ Teď správně! Pokračujeme.':'✓ Správně!';$('vocInput').disabled=true;$('vocCheck').disabled=true;$('vocCards').querySelectorAll('button').forEach(b=>b.disabled=true);timer=setTimeout(advance,650);return}
if(!firstMistake){mistakes++;record(false);firstMistake=true}phase='retry';if(btn){btn.classList.add('voc-wrong');btn.disabled=true}else{$('vocInput').classList.add('voc-wrong');$('vocInput').value='';$('vocInput').focus()}$('vocFeedback').textContent=`To ještě není ono. Správná odpověď: ${expected}. Zkus ji opravit.`;$('vocNext').classList.remove('newhidden');$('vocNext').textContent='Pokračovat →';}
function stop(completed){clearTimeout(timer);if(window.speechSynthesis)window.speechSynthesis.cancel();$('vocabGame').classList.add('newhidden');$('vocabSetup').classList.remove('newhidden');let elapsed=Math.round((Date.now()-started)/1000);$('vocStatus').textContent=`${completed?'Dokončeno':'Přerušeno'}: ${good}/${pos} bez chyby, ${mistakes} chybných odpovědí, čas ${elapsed} s.`;if(started){try{let KLOG='skolni-vocabulary-history-v1',log=JSON.parse(localStorage.getItem(KLOG)||'[]');log.push({child:id(),started:new Date(started).toISOString(),seconds:elapsed,completed,questions:pos,correct:good,wrong:mistakes});localStorage.setItem(KLOG,JSON.stringify(log.slice(-500)))}catch{}}started=0;refresh()}
$('vocCheck').onclick=()=>{if(!question||!['asking','retry'].includes(phase))return;let v=$('vocInput').value.trim();if(!v)return;let reverse=question.kind.endsWith('-cz')||question.kind.startsWith('listen');answer(norm(v)===norm(reverse?question.word.cz:question.word.en))};
$('vocInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(phase==='correct')return;if(phase==='retry'&&!$('vocInput').value.trim()){$('vocNext').click()}else $('vocCheck').click()}};
$('vocNext').onclick=()=>{if(phase==='retry'||phase==='correct'){advance()}};$('vocStop').onclick=()=>stop(false);
$('vocStart').onclick=()=>{refresh();if(!words.length){$('vocStatus').textContent='Nejprve přidej slovíčka.';return}let count=Number($('vocTotal').value);let ids=[...words.keys()].sort((a,b)=>(words[b].wrong||0)+(words[b].slow||0)-(words[a].wrong||0)-(words[a].slow||0));queue=Array.from({length:count},(_,i)=>ids[i%ids.length]);pos=good=mistakes=0;started=Date.now();$('vocabSetup').classList.add('newhidden');$('vocabGame').classList.remove('newhidden');ask()};refresh();
let steps=[],at=0,done=[],dividend='',d=0,wrong=0,begin=0,firstIndex=0;
function build(){
 const level=$('tailLevel').value,lo=level==='easy'?100:level==='medium'?1000:10000,hi=level==='easy'?999:level==='medium'?9999:999999;
 dividend=String(lo+Math.floor(Math.random()*(hi-lo+1)));d=2+Math.floor(Math.random()*8);
 steps=[];done=[];at=wrong=0;begin=Date.now();let rem=0,started=false;
 for(let i=0;i<dividend.length;i++){
  const previous=rem,number=previous*10+Number(dividend[i]);
  if(!started&&number<d){rem=number;continue}
  if(started){steps.push({kind:'bring',i,value:number,previous,digit:Number(dividend[i]),help:`Ke zbytku ${previous} stáhni další číslici ${dividend[i]}. Dostaneš ${number}.`})}
  else firstIndex=i;
  started=true;
  const quotient=Math.floor(number/d),remainder=number%d;
  steps.push({kind:'quot',i,value:quotient,number,help:`Kolikrát se ${d} vejde do ${number}, aniž bychom ho překročili? ${number} : ${d} = ?`});
  steps.push({kind:'rem',i,value:remainder,number,quotient,help:`${quotient} × ${d} = ${quotient*d}. Z čísla ${number} zbývá ${number} − ${quotient*d} = ?`});
  rem=remainder;
 }
 $('tailGame').classList.remove('newhidden');draw();
}
function draw(){
 const s=steps[at],g=$('tailGrid');$('tailVisualHint').classList.add('newhidden');g.replaceChildren();$('tailInput').value='';$('tailFeedback').textContent='';
 const count=dividend.length,shift=2,quotStart=count+5;
 g.style.gridTemplateColumns=`repeat(${Math.max(13,quotStart+count+1)}, minmax(22px, 1fr))`;
 g.style.gridAutoRows='39px';g.style.minWidth=`${Math.max(330,(quotStart+count+1)*23)}px`;
 function cell(row,col,value,cls='',target=false){let e=document.createElement('span');e.style.gridRow=row;e.style.gridColumn=col;e.textContent=String(value);e.className=cls+(target?' newtarget':'');if(target){e.setAttribute('role','button');e.setAttribute('aria-label','Sem zapiš odpověď');e.tabIndex=0;e.onclick=()=> $('tailInput').focus();e.onkeydown=ev=>{if(ev.key==='Enter')$('tailInput').focus()}}g.append(e)}
 [...dividend].forEach((v,i)=>cell(1,shift+i,v,s&&i<=s.i&&i>=Math.max(0,s.i-1)?'school-active':''));
 cell(1,shift+count,':');cell(1,shift+count+1,d,'school-divisor');cell(1,shift+count+2,'=');
 let qidx=0,row=2,prevRem=0;
 for(const v of done){
  if(v.kind==='quot'){cell(1,quotStart+qidx,v.value,'school-quot');qidx++}
  if(v.kind==='rem'){const txt=String(v.value);[...txt].forEach((c,k)=>cell(row,shift+v.i-txt.length+1+k,c,'school-rem'));row++ ;prevRem=v.value}
  if(v.kind==='bring'){
   cell(row,shift+v.i,'↓','school-arrow');row++;
   const txt=String(v.value);[...txt].forEach((c,k)=>cell(row,shift+v.i-txt.length+1+k,c,'school-bring'));
  }
 }
 if(!s){
  $('tailStep').textContent='Výborně! Příklad dokončen.';
  $('tailHelp').textContent=`${dividend} : ${d} = ${Math.floor(Number(dividend)/d)}, zbytek ${Number(dividend)%d}. Čas: ${Math.round((Date.now()-begin)/1000)} s · chyby: ${wrong}.`;
  $('tailInput').disabled=true;$('tailCheck').disabled=true;return;
 }
 $('tailInput').disabled=false;$('tailCheck').disabled=false;
 const labels={quot:'Kolikrát se dělitel vejde?',rem:'Jaký je zbytek?',bring:'Stáhni další číslici ↓'};
 $('tailStep').textContent=`Krok ${at+1} z ${steps.length} · ${labels[s.kind]}`;
 $('tailHelp').textContent=s.help;
 if(s.kind==='quot')cell(1,quotStart+qidx,'□','',true);
 else if(s.kind==='rem')cell(row,shift+s.i,'□','',true);
 else{cell(row,shift+s.i,'↓','school-arrow');cell(row+1,shift+s.i,'□','',true)}
 $('tailInput').placeholder=s.kind==='quot'?'Číslice výsledku':s.kind==='rem'?'Zbytek':'Stažené číslo';
}
$('tailStart').onclick=build;
$('tailCheck').onclick=()=>{
 const s=steps[at];if(!s)return;const raw=$('tailInput').value.trim();if(!raw)return;
 if(!/^\d+$/.test(raw)||Number(raw)!==s.value){wrong++;$('tailFeedback').textContent='To není správně. Podívej se na zvýrazněná čísla a zkus to ještě jednou.';$('tailFeedback').style.color='#c53030';$('tailInput').focus();return}
 done.push(s);at++;draw();if(steps[at])$('tailInput').focus();
};
$('tailInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('tailCheck').click()}};
function tailIllustration(s){
 const orange='#c66b32',purple='#9154ae',blue='#2585b8';
 const digits=dividend.split('');let x=206, gap=28;
 const text=(px,py,t,color='#293b55',size=22)=>`<text x="${px}" y="${py}" font-family="system-ui" font-size="${size}" fill="${color}">${t}</text>`;
 let out=`<defs><marker id="thArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" stroke="#c66b32" stroke-width="1.3" fill="none"/></marker></defs>`;
 digits.forEach((digit,i)=>out+=text(x+i*gap,100,digit));
 let end=x+digits.length*gap+10;
 out+=text(end,100,': '+d+' = '+done.filter(v=>v.kind==='quot').map(v=>v.value).join('')+'□');
 let number=s.number??s.value, quotient=Math.floor(number/d),rem=number%d;
 let calc=`${number} : ${d} = ${quotient}, zbytek ${rem}`;
 if(s.kind==='bring')calc=`Stáhneme ${s.digit} ke zbytku ${s.previous} → ${s.value}`;
 out+=text(16,170,calc,orange,19);
 let last=x+s.i*gap;
 out+=`<path d="M175 155 Q240 30 ${Math.min(end+100,500)} 80" stroke="${orange}" stroke-width="2.5" fill="none" marker-end="url(#thArrow)" stroke-dasharray="800" class="vd-arr"/>`;
 out+=`<ellipse cx="${last+5}" cy="91" rx="15" ry="22" stroke="${blue}" stroke-width="2.5" fill="none"/>`;
 if(s.kind==='bring')out+=`<path d="M${last+7} 116 Q${last+30} 170 ${last+7} 217" stroke="${blue}" stroke-width="3" fill="none"/>`+text(last-12,245,String(s.value),blue,23);
 else out+=text(last-12,228,'zbytek '+rem,purple,19);
 return out;
}
$('tailHint').onclick=()=>{const s=steps[at];if(!s)return;const panel=$('tailVisualHint');panel.classList.toggle('newhidden');if(panel.classList.contains('newhidden'))return;$('tailVisualTitle').textContent='Takto se číslo zapíše do školního ocasu';$('tailVisualSvg').innerHTML=tailIllustration(s);$('tailVisualText').textContent=s.help+' Správná hodnota pro tento krok: '+s.value+'.';};
$('tailStop').onclick=()=>{$('tailGame').classList.add('newhidden')};
})();
