/* Školní dobrodružství 50.5 – jednotný Merlin: čtení výkladu, kontextová nápověda, hlasové ovládání. */
(()=>{'use strict';
const old=document.getElementById('sd54-merlin');if(!old)return;
const oldImg=old.querySelector('img');const oldScroll=old.querySelector('.sd54-scroll');
if(oldScroll)oldScroll.hidden=true;
const KEY='sd55_voice_enabled';let enabled=true;try{enabled=localStorage.getItem(KEY)!=='false'}catch(e){}
let activeText='',currentSpeech='',lastLesson='',lastPanel='',isOpen=false,speechSerial=0;
const synth='speechSynthesis' in window?window.speechSynthesis:null;
const html=`<div class="sd55-modal" id="sd55-modal" hidden role="dialog" aria-modal="false" aria-labelledby="sd55-title"><div class="sd55-backdrop" data-sd55-close></div><section class="sd55-sheet"><button class="sd55-x" type="button" data-sd55-close aria-label="Zavřít">×</button><img src="./assets/merlin/merlin-cte.gif" alt="Merlin čte pergamen"><div class="sd55-paper"><h2 id="sd55-title">Merlin vysvětluje</h2><p id="sd55-text"></p><div class="sd55-actions"><button type="button" id="sd55-play">▶ Přečíst</button><button type="button" id="sd55-pause">⏸ Pozastavit</button><button type="button" id="sd55-voice">🔊 Hlas zapnutý</button><button type="button" data-sd55-close>Zavřít</button></div><label class="sd55-rate">Rychlost čtení <select id="sd55-rate"><option value="0.8">Pomalu</option><option value="1" selected>Normálně</option><option value="1.15">Rychleji</option></select></label></div></section></div>`;
document.body.insertAdjacentHTML('beforeend',html);
const modal=document.getElementById('sd55-modal'),message=document.getElementById('sd55-text'),voice=document.getElementById('sd55-voice');
function cancel(){speechSerial++;if(synth)try{synth.cancel()}catch(e){}}
function speak(text){cancel();if(!enabled||!synth)return;const serial=speechSerial;currentSpeech=text;try{const utter=new SpeechSynthesisUtterance(text);utter.lang='cs-CZ';utter.rate=Number(document.getElementById('sd55-rate').value)||1;utter.pitch=.93;const voices=synth.getVoices();const cz=voices.find(v=>v.lang.toLowerCase()==='cs-cz')||voices.find(v=>v.lang.toLowerCase().startsWith('cs'));if(cz)utter.voice=cz;utter.onend=()=>{if(serial!==speechSerial)return};synth.speak(utter)}catch(e){}}
function open(text,autoplay=false){if(!text)return;activeText=String(text).replace(/\s+/g,' ').trim().slice(0,2200);message.textContent=activeText;modal.hidden=false;isOpen=true;document.body.classList.add('sd55-speaking');if(oldScroll)oldScroll.hidden=true;if(autoplay)speak(activeText);else cancel()}
function close(){modal.hidden=true;isOpen=false;document.body.classList.remove('sd55-speaking');cancel()}
function lessonText(){const curriculum=document.getElementById('sdCurriculum');if(curriculum&&!curriculum.hidden){const lesson=curriculum.querySelector('.sd-lesson');const paragraph=lesson?.querySelector('p');if(paragraph&&curriculum.querySelector('.sd-lesson h2')?.textContent?.includes('Výuka'))return {title:document.getElementById('sdTitle')?.textContent||'',text:paragraph.textContent.trim()};}
const school=document.getElementById('sd52');if(school&&!school.hidden){const title=school.querySelector('#sd52header')?.textContent||'';if(title==='Výuka'){const p=[...school.querySelectorAll('.sd52-panel p')].map(x=>x.textContent.trim()).filter(Boolean);return p.length?{title:school.querySelector('h1')?.textContent||'Výuka',text:p.join(' ')}:null;}}
return null}
function currentQuestion(){const curriculum=document.getElementById('sdCurriculum');if(curriculum&&!curriculum.hidden){const question=curriculum.querySelector('.sd-lesson h2');if(question&&!curriculum.querySelector('.sd-lesson h2')?.textContent?.includes('Výuka'))return question.textContent.trim()}
const school=document.getElementById('sd52');if(school&&!school.hidden){return school.querySelector('.sd52-panel h2')?.textContent?.trim()||''}return document.querySelector('#game:not(.hidden) .question,#longLesson:not(.hidden) .question')?.textContent?.trim()||''}
function contextHelp(){const l=lessonText();if(l)return `Právě probíráme ${l.title}. ${l.text}`;const q=currentQuestion();if(q)return `Podívej se pozorně na zadání: ${q}. Nejprve si připomeň pravidlo z výuky. Rozděl úkol na menší kroky a zkus odpovědět samostatně. Pokud si nejsi jistý, vrať se k vysvětlení kapitoly.`;return 'Ahoj, dobrodruhu! Vyber si předmět a kapitolu. Ve výuce ti všechno přečtu a vysvětlím. Při procvičování použij otazník s nápovědou.'}
// Zachovat existujícího malého Merlina; po klepnutí otevřít velký dialog.
if(oldImg){const clone=oldImg.cloneNode(true);oldImg.replaceWith(clone);clone.addEventListener('click',()=>isOpen?close():open(contextHelp(),true));clone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();clone.click()}})}
modal.addEventListener('click',e=>{if(e.target.closest('[data-sd55-close]'))close()});
document.getElementById('sd55-play').addEventListener('click',()=>{if(!enabled){enabled=true;updateVoice()}if(synth?.paused){synth.resume();return}speak(activeText)});
document.getElementById('sd55-pause').addEventListener('click',()=>{if(synth){if(synth.paused)synth.resume();else synth.pause()}});
function updateVoice(){voice.textContent=enabled?'🔊 Hlas zapnutý':'🔇 Hlas vypnutý';voice.setAttribute('aria-pressed',String(enabled));try{localStorage.setItem(KEY,String(enabled))}catch(e){}}
voice.addEventListener('click',()=>{enabled=!enabled;updateVoice();if(!enabled)cancel();else speak(activeText)});updateVoice();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen)close()});
const help=document.createElement('button');help.id='sd55-help';help.type='button';help.textContent='? Nápověda';help.setAttribute('aria-label','Vyvolat Merlinovu nápovědu');help.addEventListener('click',()=>open(contextHelp(),true));document.body.append(help);
// Každý nově otevřený výklad z učebnice automaticky přečíst. Sledujeme pouze konkrétní moduly.
let queued=false;function scan(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const l=lessonText();const key=l?l.title+'|'+l.text:'';if(key&&key!==lastLesson){lastLesson=key;open(`Dnes se naučíme: ${l.title}. ${l.text}`,true)}if(!key)lastLesson='';const gate=document.getElementById('authGate');const logged=!!gate?.classList.contains('off');const visible=logged&&!document.body.classList.contains('sd54-admin-open');help.hidden=!visible;});}
const obs=new MutationObserver(scan);for(const id of ['sdCurriculum','sd52','authGate']){const el=document.getElementById(id);if(el)obs.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']})}scan();
// Expose for future subject modules without changing their original handlers.
window.SDMerlin55={explain:(text,autoplay=true)=>open(text,autoplay),help:()=>open(contextHelp(),true),close,stop:cancel};
})();
