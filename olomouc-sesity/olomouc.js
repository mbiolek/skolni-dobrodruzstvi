/* 50.8.44 – izolovaná školní větev Olomouc; nezasahuje do výsledků Fulneku ani do jiných předmětů. */
(()=>{'use strict';
const D=window.SDOlomoucNotebookData844;
if(!D?.subjects){document.getElementById('sd844-content').textContent='Učivo se nepodařilo načíst.';return;}
const PROFILE='matematika-karticky-progress-v3-active',DB='sd52_schools_plans_v1',RESULT='sd844_olomouc_results_v1';
const get=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
const set=(key,value)=>{try{localStorage.setItem(key,value)}catch(e){console.warn('Výsledek se nepodařilo uložit',e)}};
const json=(raw)=>{try{return JSON.parse(raw||'{}')||{}}catch{return {}}};
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const profile=()=>{try{return sessionStorage.getItem('skolni-live-v441')||get(PROFILE)||'parent'}catch{return get(PROFILE)||'parent'}};
const schools=()=>json(get(DB)).schools||[];
const chosenSchool=()=>{const p=profile(),db=json(get(DB)),all=Array.isArray(db.schools)?db.schools:[],allowed=p==='parent'?all:all.filter(s=>(db.assignments?.[p]||[]).includes(s.id)),byId=get('sd827_active_school_'+p)||get('sd827_default_school_'+p);return allowed.find(x=>x.id===byId)||allowed[0]||null};
const isOlomouc=()=>{const s=chosenSchool();return !!s && /olomouc/i.test([s.name,s.city].join(' '))};
const content=document.getElementById('sd844-content');
const subjectIds=Object.keys(D.subjects);
const subjectIcons={english:'🇬🇧',math:'📐',czech:'📖',nature:'🌿'};
const topicIcons={food:'🍓',present:'✏️',frequency:'🔄',clock:'🕒',round:'🎯',place:'🔢',expanded:'🧮',verbs:'🗣️',tense:'⏳',words:'📚',minerals:'🪨',resources:'⛏️'};
let route={step:'home'},quiz=null,timer=null,stopped=false;
const clearTimer=()=>{if(timer!==null){clearTimeout(timer);timer=null}};
function subjectObj(){return D.subjects[route.subject]||null}
function topicObj(){return subjectObj()?.topics.find(t=>t.id===route.topic)||null}
const allEntries=()=>json(get(RESULT));
function saveResult(){const all=allEntries(),key=[profile(),chosenSchool()?.id,route.subject,route.topic].join('|');all[key]??=[];all[key].push({date:new Date().toISOString(),kind:quiz.mode,correct:quiz.correct,total:quiz.list.length});all[key]=all[key].slice(-30);set(RESULT,JSON.stringify(all));}
const shuffle=a=>{const n=a.slice();for(let i=n.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[n[i],n[j]]=[n[j],n[i]]}return n};
function startQuiz(mode){const t=topicObj();if(!t)return;quiz={mode,list:shuffle(t.questions).slice(0,10),pos:0,correct:0,answered:false};nav({...route,step:'quiz',mode})}
const btn=(title,step,id='',icon='',small='')=>`<button class="sd844-card" data-step="${esc(step)}" ${id?`data-id="${esc(id)}"`:''}><span class="glyph" aria-hidden="true">${icon}</span><strong>${esc(title)}</strong>${small?`<small>${esc(small)}</small>`:''}</button>`;
function render(){clearTimer();const title=D.subjects[route.subject]?.title||'Olomouc',t=topicObj();document.title='Školní dobrodružství – '+title;document.getElementById('sd844back').textContent=route.step==='home'?'← Domů':'← Zpět';
 if(!isOlomouc()){
  content.innerHTML='<h1>Vyber školu Olomouc</h1><div class="sd844-note">Toto učivo je určeno pouze pro profil s aktivní školou Olomouc. Vrať se na hlavní stránku a zvol Olomouc, abychom nesmíchali obsah Fulneku a Olomouce.</div><a class="sd844-action" href="../index.html">Zpět do aplikace</a>';return;
 }
 if(route.step==='home'){
  content.innerHTML=`<h1>Učivo Olomouc</h1><p class="subtitle">Zápisy ze školních sešitů · 5.D</p><div class="sd844-note">Témata vycházejí z pěti zaslaných videí. Výklad a otázky jsou nově připravené pro procvičení; nejsou doslovným přepisem učebnic ani potvrzeným měsíčním plánem.</div><div class="sd844-grid">${subjectIds.map(k=>btn(D.subjects[k].title,'subject',k,subjectIcons[k],`${D.subjects[k].topics.length} tematických okruhů`)).join('')}</div>`;return;
 }
 if(route.step==='subject'){
  const s=subjectObj();content.innerHTML=`<h1>${esc(s.title)}</h1><p class="subtitle">Probíraná témata ze sešitů · Olomouc</p><div class="sd844-grid">${s.topics.map(t=>btn(t.title,'topic',t.id,topicIcons[t.id],`${t.questions.length} různých otázek`)).join('')}</div><p class="sd844-meta">Učebnice: ${esc(s.book)}. Zápisy ze sešitů nemusí pokrývat celý školní rok.</p>`;return;
 }
 if(route.step==='topic'){
  content.innerHTML=`<p class="sd844-kicker">${esc(subjectObj().title)}</p><h1>${esc(t.title)}</h1><p>${esc(t.summary)}</p><div class="sd844-note">Podklad: školní sešit · ${esc(t.source)}. Otázky jsou originální procvičovací úlohy sestavené podle tématu.</div><div class="sd844-grid">${btn('Výuka','learn','', '📖','Vysvětlení a příklady')}${btn('Procvičování','practice','', '🎯','Zelená odpověď → další otázka')}${btn('Test','test','', '✅','10 otázek bez opakování')}${btn('Moje výsledky','results','', '🏆','Výsledky této kapitoly')}</div>`;return;
 }
 if(route.step==='learn'){
  content.innerHTML=`<p class="sd844-kicker">Výuka · ${esc(subjectObj().title)}</p><h1>${esc(t.title)}</h1><div class="sd844-panel"><h2>Zapamatuj si</h2><ol>${t.lesson.map(x=>'<li>'+esc(x)+'</li>').join('')}</ol></div><div class="sd844-actions"><button class="sd844-action primary" data-step="practice">Začít procvičování</button><button class="sd844-action" data-step="topic">Zpět na téma</button></div>`;return;
 }
 if(route.step==='results'){
  const id=[profile(),chosenSchool()?.id,route.subject,route.topic].join('|');const rows=(allEntries()[id]||[]).slice(-15).reverse();
  content.innerHTML=`<h1>Moje výsledky</h1><p>${esc(t.title)}</p><div class="sd844-panel">${rows.length?rows.map(x=>`<p><strong>${x.kind==='test'?'Test':'Procvičování'}</strong> · ${esc(new Date(x.date).toLocaleDateString('cs-CZ'))}: ${x.correct}/${x.total} správně (${Math.round(100*x.correct/x.total)} %)</p>`).join(''):'Zatím tu není uložený žádný výsledek.'}</div><p class="sd844-meta">Výsledky této části se ukládají pouze do vybraného profilu a školy. XP v hlavní aplikaci se zatím nemění.</p>`;return;
 }
 if(route.step==='quiz'){return drawQuestion()}
 if(route.step==='done'){
  const total=quiz?.list.length||0,score=quiz?.correct||0,percent=total?Math.round(score*100/total):0;
  content.innerHTML=`<h1>Hotovo!</h1><div class="sd844-panel"><p>Výsledek kapitoly <strong>${esc(t.title)}</strong></p><div class="sd844-score">${score} / ${total}</div><p>Úspěšnost: <strong>${percent} %</strong></p></div><div class="sd844-actions"><button class="sd844-action primary" data-action="retry">Zkusit další otázky</button><button class="sd844-action" data-step="topic">Zpět na téma</button><button class="sd844-action" data-step="results">Moje výsledky</button></div>`;return;
 }
}
function drawQuestion(){const t=topicObj();if(!t||!quiz)return;const total=quiz.list.length;if(quiz.pos>=total){saveResult();nav({...route,step:'done'},true);return}
 const q=quiz.list[quiz.pos];quiz.answered=false;content.innerHTML=`<p class="sd844-kicker">${quiz.mode==='test'?'Test':'Procvičování'} · ${esc(t.title)}</p><h1>Otázka ${quiz.pos+1} z ${total}</h1><div class="sd844-progress"><span style="width:${100*quiz.pos/total}%"></span></div><div class="sd844-panel"><h2>${esc(q.q)}</h2><div id="sd844choices">${q.choices.map((ans,i)=>`<button class="sd844-choice" data-choice="${i}">${esc(ans)}</button>`).join('')}</div><p class="sd844-feedback" id="sd844feedback" aria-live="assertive"></p></div><div class="sd844-actions" id="sd844next"></div>`;}
function choice(index){if(!quiz||quiz.answered)return;const q=quiz.list[quiz.pos],correct=index===q.answer,buttons=[...document.querySelectorAll('#sd844choices button')],feedback=document.getElementById('sd844feedback');
 if(correct){quiz.answered=true;quiz.correct++;buttons[index].classList.add('correct');buttons.forEach(b=>b.disabled=true);feedback.textContent='Správně! Přecházím na další otázku.';timer=setTimeout(()=>{timer=null;quiz.pos++;drawQuestion()},950)}
 else {buttons[index].classList.add('wrong');buttons[index].disabled=true;if(quiz.mode==='test'){
 quiz.answered=true;buttons.forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct')});feedback.textContent='Tentokrát ne. Správná odpověď: '+q.choices[q.answer];document.getElementById('sd844next').innerHTML='<button class="sd844-action primary" data-action="next">Další otázka</button>';
 }else{feedback.textContent='Zkus to ještě jednou.';}}
}
function nav(next,replace=false){clearTimer();const previous=route;const depth=Number(history.state?.depth||0)+(replace?0:1);if(next.step==='topic'&&!replace&&next.topic&&(previous.step==='subject'||next.topic!==previous.topic))next.topicDepth=depth;route=next;const data={sd844:true,route:next,depth};if(replace)history.replaceState(data,'',location.pathname+'#'+encodeURIComponent(next.subject||''));else history.pushState(data,'',location.pathname+'#'+encodeURIComponent(next.subject||''));render();window.scrollTo(0,0)}
const initial=decodeURIComponent(location.hash.replace(/^#/,''));const entry=subjectIds.includes(initial)?{step:'subject',subject:initial}:{step:'home'};route=entry;history.replaceState({sd844:true,route:entry,depth:0},'',location.href);render();
function goBack(){
 clearTimer();
 if(Number(history.state?.depth||0)>0){history.back();return}
 if(route.step!=='home'){nav({step:'home'});return}
 location.assign('../index.html');
}

document.getElementById('sd844back').addEventListener('click',goBack);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action],[data-choice],[data-step]');if(!b)return;
 if(b.dataset.choice!==undefined){choice(Number(b.dataset.choice));return}
 if(b.dataset.action==='next'){quiz.pos++;drawQuestion();return}
 if(b.dataset.action==='retry'){startQuiz(quiz.mode);return}
 const step=b.dataset.step,id=b.dataset.id;
 if(step==='subject'){nav({step,subject:id});return}
 if(step==='topic'){if(!id&&Number.isInteger(route.topicDepth)){const difference=route.topicDepth-Number(history.state?.depth||0);if(difference<0){history.go(difference);return}}nav({step,subject:route.subject,topic:id||route.topic});return}
 if(step==='learn'||step==='results'){nav({...route,step});return}
 if(step==='practice'||step==='test'){startQuiz(step);return}
});
window.addEventListener('popstate',e=>{clearTimer();if(e.state?.sd844){route=e.state.route;render()}else location.assign('../index.html')});
})();
