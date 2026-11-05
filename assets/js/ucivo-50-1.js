/* Školní dobrodružství 50.1 – samostatné lekce 5. ročníku. Původní moduly se nemění. */
(()=>{'use strict';
const DATA={
math:{name:'Matematika',topics:[
['Opakování a početní operace','Při počítání dodržuj pořadí: nejdřív závorky, potom násobení a dělení, nakonec sčítání a odčítání.','6 + 3 × 4 = ?',18,24,36,12],
['Asociativní zákon sčítání','Při sčítání můžeme měnit seskupení sčítanců: (a + b) + c = a + (b + c).','(12 + 8) + 5 = ?',25,20,35,30],
['Asociativní zákon násobení','Při násobení můžeme měnit seskupení činitelů: (a × b) × c = a × (b × c).','(2 × 5) × 7 = ?',70,35,14,75],
['Pořadí výpočtů','Násobení a dělení mají přednost před sčítáním a odčítáním.','30 − 4 × 5 = ?',10,130,26,20],
['Sítě těles a krychle','Síť krychle tvoří šest shodných čtverců.','Kolik čtverců má síť krychle?',6,4,8,12],
['Hranol','Hranol má dvě shodné rovnoběžné podstavy a boční stěny.','Kolik podstav má hranol?',2,1,4,6],
['Válec a pětiboký hranol','Válec má dvě kruhové podstavy. Pětiboký hranol má dvě pětiúhelníkové podstavy.','Kolik vrcholů má pětiboký hranol?',10,5,8,12],
['Jehlan','Jehlan má jednu podstavu a trojúhelníkové boční stěny sbíhající se ve vrcholu.','Kolik podstav má jehlan?',1,2,3,4],
['Jednotky objemu','Jeden litr je 1 000 mililitrů. Jeden metr krychlový je 1 000 litrů.','Kolik mililitrů má 2 litry?',2000,200,20,1000],
['Rýsování','Při rýsování používej ostrou tužku, pravítko a podle potřeby kružítko.','Čím narýsuješ kružnici?','Kružítkem','Pravítkem','Úhloměrem','Gumou'],
['Pravidelný šestiúhelník','Pravidelný šestiúhelník má šest stejně dlouhých stran a šest stejně velkých vnitřních úhlů.','Kolik stran má pravidelný šestiúhelník?',6,5,7,8],
['Přirozená čísla nad milion','Velká čísla čteme po trojicích číslic: jednotky, tisíce, miliony, miliardy.','Kolik nul má milion?',6,5,7,9],
['Grafické sčítání a odčítání úseček','Úsečky lze pomocí kružítka přenášet a graficky sčítat nebo odčítat.','Úsečka 3 cm a úsečka 5 cm mají dohromady délku:',8,2,15,6],
['Obvod mnohoúhelníka','Obvod získáš sečtením délek všech stran.','Jaký je obvod čtverce o straně 7 cm? (cm)',28,14,49,21],
['Obvod pravidelných mnohoúhelníků','Obvod pravidelného mnohoúhelníku je počet stran krát délka jedné strany.','Obvod pravidelného pětiúhelníku se stranou 4 cm je:',20,16,25,9]
]},
czech:{name:'Český jazyk',topics:[
['Kořen, předpona, přípona a koncovka','Kořen je společná významová část příbuzných slov. Předpona stojí před kořenem, přípona za ním.','Jaký je kořen slov les, lesník, lesní?','les','ník','ní','s'],
['Slova příbuzná','Příbuzná slova mají společný kořen a související význam.','Které slovo je příbuzné ke slovu voda?','vodník','vůz','dům','vosa'],
['Odvozování slov','Nová slova tvoříme například předponami a příponami.','Které slovo vzniklo předponou od slova psát?','napsat','písmo','pisatel','psaní'],
['Souhláskové skupiny','Při tvoření slov vznikají skupiny souhlásek; při psaní sleduj stavbu slova.','Který zápis je správný?','nejjasnější','nejasnějšíí','nejjasněší','nejjasnejší'],
['Zdvojené souhlásky','Na hranici předpony a kořene nebo kořene a přípony mohou být dvě stejné souhlásky.','Který zápis je správný?','bezzubý','bezubý','beszubý','bezzubí'],
['Přídavná jména odvozená příponou -ský','Při tvoření přídavných jmen příponou -ský někdy dochází ke změnám souhlásek.','Od slova Praha vytvoříme:','pražský','prahský','pražní','prahový'],
['Předpony s-, z-, vz-','Předpona s- často vyjadřuje směr dohromady nebo shora dolů; z- změnu stavu; vz- pohyb vzhůru.','Které slovo označuje pohyb vzhůru?','vzlétnout','slétnout','zalétnout','odlétnout'],
['Předložky s a z','Předložka s se pojí se 7. pádem; z se pojí s 2. pádem.','Která možnost je správně?','s kamarádem','z kamarádem','s kamaráda','ze kamarádem'],
['Předpony ob-, o-, v- a skupiny bě/bje','Při psaní bě/bje a vě/vje sleduj hranici předpony a kořene.','Který zápis je správný?','objevit','oběvit','objevyť','objěvit'],
['Dělení slov na konci řádku','Slova dělíme podle slabik a pravopisných pravidel; jedno písmeno nenecháváme samotné.','Které rozdělení slova kočka je správné?','koč-ka','k-očka','ko-čk-a','kočk-a'],
['Vyjmenovaná slova','Po obojetných souhláskách píšeme i/y podle vyjmenovaných slov, příbuznosti a významu.','Doplň: b_lina','y','i','í','ý'],
['Slovní druhy','Rozlišujeme deset slovních druhů: ohebné (1–5) a neohebné (6–10).','Jaký slovní druh je slovo rychle?','příslovce','přídavné jméno','sloveso','podstatné jméno'],
['Podstatná jména – pád','Pád určujeme pomocí pádových otázek. Například 2. pád: bez koho, čeho.','Jaký pád je ve spojení bez knihy?','2. pád','1. pád','4. pád','7. pád'],
['Podstatná jména – číslo','Podstatná jména mají číslo jednotné a množné.','Jaké číslo má slovo stromy?','množné','jednotné','neurčité','žádné'],
['Podstatná jména – rod','Rozlišujeme rod mužský, ženský a střední.','Jakého rodu je slovo město?','středního','mužského','ženského','žádného'],
['Skloňování podstatných jmen','Podstatná jména mění tvary podle pádů a čísel; pomáhají nám vzory.','Který vzor patří k ženskému rodu?','žena','hrad','město','pán']
]},
nature:{name:'Přírodověda',topics:[
['Živá a neživá příroda','Živou přírodu tvoří organismy; neživou například voda, vzduch, horniny a světlo.','Co patří do živé přírody?','houba','kámen','voda','vzduch'],
['Voda','Voda se vyskytuje v pevném, kapalném i plynném skupenství.','Jak se nazývá plynné skupenství vody?','vodní pára','led','sníh','rosa'],
['Vzduch','Vzduch je směs plynů; pro dýchání potřebujeme kyslík.','Který plyn potřebujeme k dýchání?','kyslík','dusík','helium','vodík'],
['Světlo a teplo','Slunce je hlavním přirozeným zdrojem světla a tepla pro Zemi.','Která hvězda ohřívá Zemi?','Slunce','Polárka','Sirius','Vega'],
['Půda','Půda obsahuje minerální částice, humus, vodu, vzduch a organismy.','Jak se nazývá rozložená organická složka půdy?','humus','žula','písek','ropa'],
['Nerosty a horniny','Nerost je přírodní stejnorodá látka; hornina může být složena z více nerostů.','Co je hornina?','žula','křemen','sůl kamenná','zlato'],
['Nerostné suroviny a energie','Suroviny získáváme z přírody; některé zdroje energie jsou obnovitelné, jiné ne.','Který zdroj energie je obnovitelný?','vítr','uhlí','ropa','zemní plyn'],
['Vesmír a Slunce','Slunce je hvězda, kolem níž obíhá osm planet Sluneční soustavy.','Kolik planet obíhá kolem Slunce?',8,7,9,10],
['Planety','Země je třetí planeta od Slunce.','Která planeta je třetí od Slunce?','Země','Mars','Venuše','Jupiter'],
['Hvězdy a souhvězdí','Hvězdy vydávají vlastní světlo; souhvězdí jsou obrazce hvězd na obloze.','Co vydává vlastní světlo?','hvězda','Měsíc','Země','kometa bez odrazu'],
['Země a Měsíc','Země se otáčí kolem osy a obíhá kolem Slunce; Měsíc obíhá kolem Země.','Co obíhá kolem Země?','Měsíc','Slunce','Jupiter','Venuše'],
['Podnebné pásy','Na Zemi rozlišujeme tropický, subtropický, mírný a polární podnebný pás.','Ve kterém pásu leží Česká republika?','mírném','tropickém','polárním','rovníkovém'],
['Přizpůsobení organismů','Rostliny a živočichové mají znaky, které jim pomáhají přežít v prostředí.','Co pomáhá lednímu medvědovi v chladu?','hustá srst','velké uši bez srsti','žábry','listy'],
['Lidské tělo – kostra','Kostra podpírá tělo, chrání orgány a spolu se svaly umožňuje pohyb.','Co chrání mozek?','lebka','žebra','pánev','lopatka'],
['Svalová soustava','Svaly umožňují pohyb a udržování polohy těla.','Co spolupracuje s kostrou při pohybu?','svaly','vlasy','nehty','zuby'],
['Dýchací soustava','Vzduch proudí dýchacími cestami do plic, kde probíhá výměna plynů.','Ve kterém orgánu probíhá výměna dýchacích plynů?','plíce','žaludek','ledviny','játra'],
['Srdce a oběhová soustava','Srdce pumpuje krev do cév a zajišťuje její oběh.','Který orgán pohání krev?','srdce','plíce','mozek','žaludek'],
['Trávicí soustava','Trávení začíná v ústech a pokračuje přes žaludek do střev.','Kde začíná trávení potravy?','v ústech','v žaludku','v játrech','v ledvinách'],
['Vylučovací soustava','Ledviny filtrují krev a vytvářejí moč.','Který orgán tvoří moč?','ledviny','plíce','srdce','žaludek'],
['Smyslová a nervová soustava','Smysly získávají informace z okolí a nervová soustava je zpracovává.','Který orgán je důležitý pro zrak?','oko','ucho','jazyk','nos'],
['Kůže a ochrana těla','Kůže chrání tělo, pomáhá regulovat teplotu a vnímat dotek.','Co je největším orgánem lidského těla?','kůže','srdce','oko','jazyk'],
['Lidské výtvory a stroje','Jednoduché stroje, například páka a kladka, usnadňují práci.','Který z uvedených předmětů je jednoduchý stroj?','páka','papír','voda','písek'],
['Ochrana přírody','Přírodu chráníme šetrným zacházením se zdroji, tříděním odpadu a ochranou organismů.','Co pomáhá chránit přírodu?','třídění odpadu','odhazování plastů','plýtvání vodou','vypalování trávy']
]},
history:{name:'Vlastivěda – české dějiny',topics:[
['Vláda Habsburků v českých zemích','Habsburkové vládli českým zemím po dlouhá staletí. V 19. století probíhaly významné společenské změny.','Který panovnický rod vládl českým zemím?','Habsburkové','Přemyslovci ve 20. století','Lucemburkové ve 20. století','Tudorovci'],
['Život v baroku','Baroko se projevilo bohatě zdobenými stavbami, sochami, hudbou a malířstvím.','Co je typické pro barokní stavby?','bohatá výzdoba','panelové domy','mrakodrapy','betonové dálnice'],
['Vzdělávání v českých zemích','Marie Terezie zavedla v roce 1774 všeobecnou školní povinnost pro děti v příslušném věku.','Která panovnice zavedla školní povinnost?','Marie Terezie','Božena Němcová','Eliška Přemyslovna','Libuše'],
['Doba osvícenská','Osvícenství zdůrazňovalo rozum, vzdělávání a reformy společnosti.','Co zdůrazňovalo osvícenství?','vzdělávání a rozum','zákaz škol','návrat do pravěku','zrušení knih'],
['Život na vesnici a ve městě','Lidé na venkově často pracovali v zemědělství, ve městech přibývala řemesla a průmysl.','Která činnost byla typická pro venkov?','zemědělství','výroba letadel','provoz metra','kosmonautika'],
['Průmyslová revoluce','Stroje, továrny a železnice výrazně změnily výrobu i dopravu.','Co se rozšířilo během průmyslové revoluce?','továrny a železnice','mobilní telefony','internet','kosmické lodě'],
['Národní probuzení','Národní obrození usilovalo o rozvoj českého jazyka a kultury.','Co bylo důležité pro národní obrození?','český jazyk','zákaz češtiny','zrušení knihoven','odchod všech učitelů'],
['Revoluční rok 1848','V roce 1848 probíhaly v Evropě revoluce a požadavky na politické a občanské změny.','Ve kterém roce probíhaly revoluce v Evropě?',1848,1918,1938,1989],
['Život za průmyslové revoluce','S růstem továren se lidé stěhovali do měst a měnily se pracovní podmínky.','Kam se stěhovalo mnoho lidí za prací?','do měst','na Měsíc','na pusté ostrovy','do pravěku'],
['Národ sobě','Národní divadlo v Praze se stalo symbolem české kultury a společné podpory veřejnosti.','Která budova je spojena s heslem Národ sobě?','Národní divadlo','Pražský hrad','Petřínská rozhledna','Karlův most'],
['Češi a Němci','V českých zemích dlouhodobě žili lidé hovořící česky i německy.','Kterými dvěma jazyky se v českých zemích často mluvilo?','česky a německy','česky a japonsky','česky a čínsky','česky a portugalsky'],
['První světová válka','První světová válka probíhala v letech 1914–1918 a zásadně změnila Evropu.','Kdy skončila první světová válka?',1918,1914,1939,1945],
['První Československá republika','Samostatné Československo vzniklo 28. října 1918. Prvním prezidentem byl T. G. Masaryk.','Kdo byl prvním československým prezidentem?','T. G. Masaryk','Václav Havel','Edvard Beneš až jako první','Karel IV.'],
['Druhá světová válka','Druhá světová válka v Evropě skončila roku 1945. Přinesla obrovské utrpení a pronásledování.','Ve kterém roce skončila druhá světová válka v Evropě?',1945,1938,1918,1989],
['Přechod k demokracii','Sametová revoluce v listopadu 1989 otevřela cestu k demokracii.','Ve kterém roce proběhla sametová revoluce?',1989,1968,1993,1948]
]},
geography:{name:'Vlastivěda – ČR a Evropa',topics:[
['Na cestách po rodné krajině','V krajině se orientujeme podle mapy, světových stran a významných bodů.','Která světová strana je na běžné mapě nahoře?','sever','jih','východ','západ'],
['Náš kraj','Česká republika má 14 krajů včetně hlavního města Prahy.','Kolik krajů má ČR včetně Prahy?',14,13,15,12],
['Česká republika – naše vlast','Česká republika leží ve střední Evropě a je vnitrozemským státem.','Má Česká republika mořské pobřeží?','ne','ano, u Baltu','ano, u Jadranu','ano, u Atlantiku'],
['Praha – hlavní město','Praha je hlavním a největším městem České republiky. Protéká jí Vltava.','Která řeka protéká Prahou?','Vltava','Labe v centru Prahy','Morava','Odra'],
['ČR pod vlajkou Evropské unie','Česká republika vstoupila do Evropské unie v roce 2004.','Kdy ČR vstoupila do EU?',2004,1993,1989,2010],
['Sousední státy','ČR sousedí s Německem, Polskem, Slovenskem a Rakouskem.','Kolik sousedních států má ČR?',4,3,5,6],
['Evropa – sjednocující se světadíl','Evropa je světadíl s mnoha státy; některé spolupracují v Evropské unii.','Který z těchto států leží v Evropě?','Rakousko','Japonsko','Brazílie','Austrálie'],
['Cestujeme po Evropě','Při cestování používáme mapy, orientujeme se podle států a hlavních měst.','Jaké je hlavní město Slovenska?','Bratislava','Vídeň','Varšava','Budapešť']
]},
english:{name:'Angličtina – Project 1',topics:[
['Introduction – pozdravy','Hello znamená ahoj. Good morning je dobré ráno, goodbye znamená na shledanou.','Jak se anglicky řekne dobré ráno?','Good morning','Good night','Goodbye','Thank you'],
['Ve třídě a pokyny','Open your book znamená otevři knihu. Listen znamená poslouchej.','Co znamená Listen?','Poslouchej','Piš','Běž','Zpívej'],
['Čísla a hláskování','Procvičuj čísla, abecedu a hláskování jmen.','Jak se anglicky řekne dvanáct?','twelve','twenty','two','ten'],
['Friends and family','Family znamená rodina; mother je matka, brother bratr, cousin bratranec nebo sestřenice.','Jak se řekne sestra?','sister','brother','mother','uncle'],
['Země a města','Country je země, city je město; I am from… znamená Jsem z…','Jak se anglicky řekne město?','city','country','river','school'],
['Dny v týdnu','Monday je pondělí, Tuesday úterý, Wednesday středa.','Co znamená Thursday?','čtvrtek','úterý','neděle','pátek'],
['My world – věci a škola','Computer je počítač, school škola, subject vyučovací předmět.','Co znamená timetable?','rozvrh hodin','učebnice','školní taška','přestávka'],
['Domácí mazlíčci','Pet je domácí mazlíček; cat kočka, dog pes, rabbit králík.','Co znamená rabbit?','králík','kočka','pes','myš'],
['Time – kolik je hodin','What time is it? znamená Kolik je hodin? Half past two je půl třetí.','Co znamená quarter past three?','čtvrt na čtyři','půl čtvrté','tři čtvrtě na čtyři','čtyři hodiny'],
['My day – denní režim','Get up znamená vstávat, have breakfast snídat, go to school jít do školy.','Co znamená have breakfast?','snídat','večeřet','spát','běhat'],
['Free time – volný čas','Play football znamená hrát fotbal, go swimming jít plavat.','Co znamená play the guitar?','hrát na kytaru','hrát fotbal','plavat','číst'],
['Places – můj pokoj','Room je pokoj; bed postel, desk psací stůl, wardrobe šatní skříň.','Co znamená wardrobe?','šatní skříň','okno','postel','lampa'],
['Our house – dům','Kitchen je kuchyně, bathroom koupelna, living room obývací pokoj.','Co znamená kitchen?','kuchyně','koupelna','zahrada','garáž'],
['Our town – město','Town je město; hospital nemocnice, library knihovna, station stanice.','Co znamená library?','knihovna','nemocnice','pošta','nádraží'],
['People – vzhled a popis','Tall znamená vysoký, short malý/krátký, curly hair kudrnaté vlasy.','Co znamená curly hair?','kudrnaté vlasy','rovné vlasy','hnědé oči','krátké nohy'],
['Nakupování a oblečení','Clothes znamená oblečení, shoes boty, shop obchod.','Co znamená shoes?','boty','kalhoty','košile','čepice']
]}};
const root=document.createElement('section');root.id='sdCurriculum';root.hidden=true;root.innerHTML=`<div class="sd-wrap"><header class="sd-top"><button type="button" id="sdBack">← Zpět</button><span>Školní dobrodružství · 50.1</span><button type="button" id="sdClose">⌂ Domů</button></header><h1 id="sdTitle">Učivo 5. ročníku</h1><p id="sdSub"></p><div id="sdContent"></div></div>`;document.body.append(root);
let subject=null,topic=null,mode=null,step=0,score=0,wrong=[],questions=[],selected=null;
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function open(){root.hidden=false;document.body.classList.add('sd-open');window.scrollTo(0,0)}
function close(){root.hidden=true;document.body.classList.remove('sd-open')}
function subjects(){subject=null;topic=null;mode=null;open();$('sdTitle').textContent='Učivo podle učebnic 5. třídy';$('sdSub').textContent='Vyber předmět. Původní hry a procvičování zůstávají zachované.';$('sdContent').innerHTML='<div class="sd-grid">'+Object.entries(DATA).map(([id,s])=>`<button class="sd-card" data-sub="${id}"><strong>${esc(s.name)}</strong><small>${s.topics.length} kapitol</small></button>`).join('')+'</div>'}
function topics(id){subject=id;topic=null;mode=null;open();$('sdTitle').textContent=DATA[id].name;$('sdSub').textContent='Vyber konkrétní kapitolu.';$('sdContent').innerHTML='<div class="sd-grid">'+DATA[id].topics.map((t,i)=>`<button class="sd-card" data-topic="${i}"><strong>${i+1}. ${esc(t[0])}</strong><small>Výuka · Procvičování · Test</small></button>`).join('')+'</div>'}
function lesson(i){topic=i;mode=null;open();let t=DATA[subject].topics[i];$('sdTitle').textContent=t[0];$('sdSub').textContent=DATA[subject].name;$('sdContent').innerHTML=`<article class="sd-lesson"><h2>Výuka – vysvětlení</h2><p>${esc(t[1])}</p><div class="sd-hint">Přečti si pravidlo a vyzkoušej otázky. Při chybě se ukáže správná odpověď a vysvětlení.</div></article><div class="sd-grid"><button class="sd-card" data-mode="practice"><strong>Procvičování</strong><small>S nápovědou a opravou chyb</small></button><button class="sd-card" data-mode="test"><strong>Test</strong><small>10 otázek, vyhodnocení a výsledky</small></button><button class="sd-card" data-mode="results"><strong>Moje výsledky</strong><small>Uložené na tomto zařízení</small></button></div>`}
function profile(){try{return localStorage.getItem('sd_curriculum_profile')||document.querySelector('.v23-profile-name')?.textContent?.trim()||document.querySelector('.v24-name')?.textContent?.trim()||'zařízení'}catch{return 'zařízení'}}
function key(){return 'sd_curriculum_v501_'+profile()+'_'+subject+'_'+topic}
function result(){let v;try{v=JSON.parse(localStorage.getItem(key())||'[]')}catch{v=[]}return Array.isArray(v)?v:[]}
function save(){try{let a=result();a.push({date:new Date().toISOString(),score,total:questions.length,mode});localStorage.setItem(key(),JSON.stringify(a.slice(-40)))}catch{}}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function start(m){mode=m;step=0;score=0;wrong=[];const t=DATA[subject].topics[topic];questions=[{q:t[2],a:t[3],choices:shuffle(t.slice(3,7))}];open();drawQuestion()}
function drawQuestion(){if(step>=questions.length){save();let percent=Math.round(score/questions.length*100);$('sdTitle').textContent=mode==='test'?'Výsledek testu':'Hotovo';$('sdSub').textContent=DATA[subject].topics[topic][0];$('sdContent').innerHTML=`<article class="sd-lesson"><h2>${score} / ${questions.length} správně (${percent} %)</h2><p>${percent>=80?'Výborně, kapitolu zvládáš.':'Doporučujeme zopakovat vysvětlení a chybné otázky.'}</p><p>Výsledek se ukládá na tomto zařízení.</p><button class="sd-action" data-again>Opakovat</button><button class="sd-action" data-lesson>Vrátit se ke kapitole</button></article>`;return}
const q=questions[step];selected=null;$('sdTitle').textContent=DATA[subject].topics[topic][0];$('sdSub').textContent=`${mode==='test'?'Test':'Procvičování'} · Otázka ${step+1} z ${questions.length} · Správně ${score}`;$('sdContent').innerHTML=`<article class="sd-lesson"><div class="sd-progress"><span style="width:${step/questions.length*100}%"></span></div><h2>${esc(q.q)}</h2><div class="sd-choices">${q.choices.map((c,i)=>`<button type="button" data-answer="${i}">${esc(c)}</button>`).join('')}</div><div id="sdFeedback" aria-live="polite"></div><button class="sd-action" id="sdNext" hidden>${step+1===questions.length?'Vyhodnotit':'Další otázka →'}</button></article>`}
function answer(i){if(selected!==null)return;selected=i;const q=questions[step],chosen=q.choices[i],ok=String(chosen)===String(q.a);if(ok)score++;else wrong.push(step);$('sdFeedback').innerHTML=`<div class="sd-feedback ${ok?'good':'bad'}">${ok?'Správně!':'Správná odpověď: '+esc(q.a)}<p>${esc(DATA[subject].topics[topic][1])}</p></div>`;document.querySelectorAll('#sdCurriculum [data-answer]').forEach(b=>{b.disabled=true;if(String(q.choices[Number(b.dataset.answer)])===String(q.a))b.classList.add('correct');else if(Number(b.dataset.answer)===i)b.classList.add('incorrect')});$('sdNext').hidden=false}
function results(){mode='results';let r=result();$('sdTitle').textContent='Moje výsledky';$('sdSub').textContent=DATA[subject].topics[topic][0];$('sdContent').innerHTML=`<article class="sd-lesson"><h2>Poslední pokusy</h2>${r.length?r.slice().reverse().slice(0,15).map(x=>`<p>${new Date(x.date).toLocaleDateString('cs-CZ')} · ${x.mode==='test'?'Test':'Procvičování'} · <b>${x.score}/${x.total}</b></p>`).join(''):'<p>Zatím žádné výsledky.</p>'}<button class="sd-action" data-lesson>← Zpět ke kapitole</button></article>`}
root.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.sub)topics(b.dataset.sub);else if(b.dataset.topic!==undefined)lesson(+b.dataset.topic);else if(b.dataset.mode==='results')results();else if(b.dataset.mode)start(b.dataset.mode);else if(b.dataset.answer!==undefined)answer(+b.dataset.answer);else if(b.id==='sdNext'){step++;drawQuestion()}else if(b.hasAttribute('data-again'))start(mode);else if(b.hasAttribute('data-lesson'))lesson(topic);else if(b.id==='sdClose')close();else if(b.id==='sdBack'){if(topic!==null)topics(subject);else if(subject!==null)subjects();else close()}});
// Nový modul je doplňkový a nepřepisuje původní ovládání ani opravné skripty 50.0.2.
const home=document.querySelector('#homeScreen .home-tip')||document.querySelector('#homeScreen .app');if(home){let b=document.createElement('button');b.type='button';b.className='sd-launch';b.textContent='📚 Učivo podle učebnic 5. třídy';b.addEventListener('click',subjects);home.prepend(b)}
for(const [id,screen] of [['math','mathScreen'],['czech','czechScreen'],['english','englishScreen']]){let node=document.getElementById(screen);if(!node)continue;let b=document.createElement('button');b.type='button';b.className='sd-launch sd-inline';b.textContent='📚 Kapitoly podle učebnice';b.addEventListener('click',()=>topics(id));node.prepend(b)}
for(const [cls,id] of [['nature','nature'],['history','geography']]){let el=document.querySelector('#homeScreen .v23-extra.'+cls);if(!el)continue;el.removeAttribute('aria-disabled');el.style.cursor='pointer';el.setAttribute('role','button');el.setAttribute('tabindex','0');el.addEventListener('click',()=>topics(id));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();topics(id)}});let small=el.querySelector('small');if(small)small.textContent='Kapitoly 5. ročníku'}
window.SDCurriculum501={open:subjects,topics,data:DATA};
})();
