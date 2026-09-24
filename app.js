
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const $=s=>document.querySelector(s), uid=()=>crypto.randomUUID(), now=()=>new Date().toISOString();
const demo=!(SUPABASE_URL&&SUPABASE_ANON_KEY);
const defaultState={
 family:{name:"Unsere Lernwelt"},
 children:[],
 subjects:[{id:"de",name:"Deutsch",icon:"📖",enabled:true},{id:"ma",name:"Mathematik",icon:"➕",enabled:false},{id:"en",name:"Englisch",icon:"🌙",enabled:false},{id:"su",name:"Sachunterricht",icon:"🌍",enabled:false}],
 sets:[],rewards:[],
 collection:[
 {id:"mooncat",name:"Mondkatze",icon:"🐈‍⬛",type:"Tier",rarity:"selten",unlocked:true},
 {id:"mossbunny",name:"Mooshase",icon:"🐇",type:"Tier",rarity:"gewöhnlich",unlocked:true},
 {id:"cloudfox",name:"Wolkenfuchs",icon:"🦊",type:"Tier",rarity:"selten"},
 {id:"stardragon",name:"Sternendrache",icon:"🐉",type:"Drache",rarity:"legendär"},
 {id:"emberdragon",name:"Glutdrache",icon:"🐲",type:"Drache",rarity:"episch"},
 {id:"crystalstag",name:"Kristallhirsch",icon:"🦌",type:"Tier",rarity:"episch"},
 {id:"flowerfairy",name:"Blütenfee",icon:"🧚",type:"Fee",rarity:"selten"},
 {id:"moonfairy",name:"Mondfee",icon:"🧚‍♀️",type:"Fee",rarity:"episch"},
 {id:"forestelf",name:"Waldelf",icon:"🧝",type:"Elf",rarity:"selten"},
 {id:"starelf",name:"Sternenelfe",icon:"🧝‍♀️",type:"Elf",rarity:"episch"},
 {id:"pumpkin",name:"Kürbisgeist",icon:"🎃",type:"Herbstwesen",rarity:"gewöhnlich"},
 {id:"ghost",name:"Laternengeist",icon:"👻",type:"Geist",rarity:"selten"},
 {id:"forestspirit",name:"Waldgeist",icon:"🌱",type:"Geist",rarity:"selten"},
 {id:"owl",name:"Runeneule",icon:"🦉",type:"Tier",rarity:"gewöhnlich"},
 {id:"unicorn",name:"Nebel-Einhorn",icon:"🦄",type:"Fabelwesen",rarity:"legendär"}
 ],
 catalog:[
 {id:"lights",cat:"Außen",name:"Glühwürmchen-Lichter",icon:"✨",cost:5},
 {id:"crystals",cat:"Garten",name:"Kristallbeet",icon:"💎",cost:7},
 {id:"flowers",cat:"Garten",name:"Mondblumen",icon:"🌸",cost:5},
 {id:"pond",cat:"Garten",name:"Feenteich",icon:"🪷",cost:12},
 {id:"bench",cat:"Garten",name:"Wald-Bank",icon:"🪑",cost:7},
 {id:"pumpkins",cat:"Saisonal",name:"Leuchtkürbisse",icon:"🎃",cost:8},
 {id:"lanterns",cat:"Außen",name:"Zauberlaternen",icon:"🏮",cost:8},
 {id:"bridge",cat:"Garten",name:"Kleine Holzbrücke",icon:"🌉",cost:14},
 {id:"rug",cat:"Wohnraum",name:"Sternenteppich",icon:"🧶",cost:6},
 {id:"books",cat:"Wohnraum",name:"Zauberbücher",icon:"📚",cost:6},
 {id:"sofa",cat:"Wohnraum",name:"Wolkensofa",icon:"🛋️",cost:12},
 {id:"fireplace",cat:"Wohnraum",name:"Kristallkamin",icon:"🔥",cost:15},
 {id:"bed",cat:"Wohnraum",name:"Mondbett",icon:"🛏️",cost:15},
 {id:"table",cat:"Wohnraum",name:"Elfen-Tisch",icon:"🪵",cost:9},
 {id:"stars",cat:"Haus",name:"Sternendach",icon:"🌟",cost:18},
 {id:"window",cat:"Haus",name:"Mondfenster",icon:"🪟",cost:10},
 {id:"door",cat:"Haus",name:"Runentür",icon:"🚪",cost:10},
 {id:"mushroom",cat:"Garten",name:"Pilzring",icon:"🍄",cost:9},
 {id:"fountain",cat:"Garten",name:"Mondbrunnen",icon:"⛲",cost:16},
 {id:"snow",cat:"Saisonal",name:"Winterzauber",icon:"❄️",cost:10}
 ],
 world:{level:2,owned:["lights"],active:["lights"],area:"Lichtung"},history:[]
};
let state=JSON.parse(localStorage.getItem("mlw-v2")||"null")||structuredClone(defaultState);
let route="home", currentChild=state.children[0]?.id||null, supabase=null, session=null, syncTimer=null, catalogCat="Alle";
const esc=(s="")=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const child=()=>state.children.find(x=>x.id===currentChild);
const sets=()=>state.sets.filter(x=>x.childId===currentChild);
function saveLocal(){localStorage.setItem("mlw-v2",JSON.stringify(state))}
function scheduleSync(){saveLocal();clearTimeout(syncTimer);syncTimer=setTimeout(pushCloud,500)}
async function initCloud(){
 if(demo)return;
 try{const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);const r=await supabase.auth.getSession();session=r.data.session;if(session)await pullCloud()}catch(e){console.warn(e)}
}
async function pullCloud(){if(!supabase||!session)return;const r=await supabase.from("app_state").select("payload").eq("user_id",session.user.id).maybeSingle();if(r.data?.payload){
  const cloud = r.data.payload;
  // Alte V1-Cloud-Daten mit den neuen V2-Strukturen ergänzen,
  // statt die V2-Standardstruktur vollständig zu überschreiben.
  state = {
    ...structuredClone(defaultState),
    ...cloud,
    family: {...structuredClone(defaultState.family), ...(cloud.family||{})},
    subjects: cloud.subjects?.length ? cloud.subjects : structuredClone(defaultState.subjects),
    children: cloud.children || [],
    sets: cloud.sets || [],
    rewards: cloud.rewards || [],
    collection: structuredClone(defaultState.collection).map(base => {
      const saved = (cloud.collection||[]).find(x => x.id === base.id);
      return saved ? {...base, ...saved} : base;
    }),
    catalog: structuredClone(defaultState.catalog).map(base => {
      const saved = (cloud.catalog||[]).find(x => x.id === base.id);
      return saved ? {...base, ...saved} : base;
    }),
    world: {...structuredClone(defaultState.world), ...(cloud.world||{})},
    history: cloud.history || []
  };
  currentChild=state.children[0]?.id||null;
  saveLocal()
}}
async function pushCloud(){if(!supabase||!session)return;await supabase.from("app_state").upsert({user_id:session.user.id,payload:state,updated_at:now()},{onConflict:"user_id"})}
function shell(body){return `<div class="shell"><header class="top"><div class="brand"><div class="logo">✦</div><div>Magische Lernwelt<div class="small">${session?"Cloud · automatisch synchronisiert":demo?"Lokal":"Cloud · Anmeldung erforderlich"}</div></div></div><nav>${[["home","Start"],["learn","Lernen"],["world","Zauberwelt"],["parent","Eltern"]].map(([r,n])=>`<button data-route="${r}" class="${route===r?"active":""}">${n}</button>`).join("")}</nav></header>${body}</div>`}
function render(){
 let b=route==="home"?home():route==="learn"?learnHome():route==="world"?world():parent();
 $("#app").innerHTML=shell(b);bind();
}
function profileBar(){return state.children.length?`<div class="row">${state.children.map(c=>`<button class="pill" data-child="${c.id}">${c.id===currentChild?"✓ ":""}${esc(c.name)}</button>`).join("")}</div>`:`<div class="card"><b>Noch kein Kinderprofil.</b><div class="small">Im Elternbereich kannst du das erste Profil anlegen.</div></div>`}
function home(){let c=child();return `<main class="page"><section class="hero"><span class="tag">✦ Persönliche Lernreise</span><h1>Willkommen in deiner<br>magischen Lernwelt.</h1><p class="muted">Lernen bleibt übersichtlich. Die Fantasiewelt wartet erst nach der Lerneinheit.</p>${profileBar()}</section><section class="grid"><div class="card"><div class="small">Lernlisten</div><h2>${sets().length}</h2></div><div class="card"><div class="small">Sterne</div><h2>⭐ ${c?.stars||0}</h2></div><div class="card"><div class="small">Kristalle</div><h2>💎 ${c?.crystals||0}</h2></div><div class="card"><div class="small">Entdeckt</div><h2>${state.collection.filter(x=>x.unlocked).length}/${state.collection.length}</h2></div></section><section class="grid">${state.subjects.map(s=>`<div class="card"><div style="font-size:34px">${s.icon}</div><h2>${s.name}</h2><span class="tag">${s.enabled?"aktiv":"später erweiterbar"}</span></div>`).join("")}</section></main>`}
function learnHome(){return `<main class="page"><section class="hero"><span class="tag">Ruhiger Lernmodus</span><h1>Was möchtest du üben?</h1><p class="muted">Keine Sammelfiguren während der Aufgaben. Farbe dient nur der Orientierung.</p>${profileBar()}</section><section class="grid">${sets().map(s=>{let a=Math.round(s.items.reduce((n,x)=>n+x.mastery,0)/Math.max(1,s.items.length));return `<div class="card"><h2>${esc(s.title)}</h2><div class="progress"><i style="width:${a}%"></i></div><p class="small">${s.items.length} Wörter · ${a}%</p><button class="btn" data-start="${s.id}">Starten</button></div>`}).join("")||`<div class="card">Noch keine Lernliste vorhanden.</div>`}</section></main>`}
function pick(set){return [...set.items].map(it=>({it,score:100-it.mastery+(it.wrong||0)*5+Math.random()*8})).sort((a,b)=>b.score-a.score)[0]?.it}
function mode(it){let m=it.mastery||0;return m<30?["recognize","scramble"][Math.floor(Math.random()*2)]:m<60?["gap","scramble","recognize"][Math.floor(Math.random()*3)]:["memory","type","gap"][Math.floor(Math.random()*3)]}
function scramble(w){return [...w].sort(()=>Math.random()-.5).join(" · ")} function gap(w){return [...w].map((c,i)=>i>0&&i<w.length-1&&i%3===1?"_":c).join(" ")}
function distract(w){let a=w.length>3?w.slice(0,2)+w.slice(3):w+"h",b=w.length>4?w.slice(0,-2)+w.at(-1)+w.at(-2):w+"e";return [...new Set([w,a,b])].sort(()=>Math.random()-.5)}
function startLearning(id){let set=state.sets.find(x=>x.id===id),n=0,earned=0,total=12,it,m;function draw(){it=pick(set);m=mode(it);$("#app").innerHTML=`<div class="learn"><div class="learnbox"><div class="row between"><span class="tag">📖 Deutsch</span><span class="small">${n+1}/${total}</span></div><div class="progress"><i style="width:${n/total*100}%"></i></div><div id="ex"></div><div class="feedback" id="fb"></div><div class="row between"><button class="btn light" id="quit">Beenden</button><span>⭐ +${earned}</span></div></div></div>`;$("#quit").onclick=()=>{route="learn";render()};exercise()}
 function exercise(){let e=$("#ex"),w=it.text;if(m==="recognize"){e.innerHTML=`<p class="small">Welches Wort ist richtig?</p><div class="choices">${distract(w).map(x=>`<button data-a="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;e.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>ans(b.dataset.a===w))}
 else if(m==="scramble"){e.innerHTML=`<p class="small">Bringe die Buchstaben in die richtige Reihenfolge.</p><div class="word">${esc(scramble(w))}</div>${input()}`}
 else if(m==="gap"){e.innerHTML=`<p class="small">Ergänze das Wort.</p><div class="word">${esc(gap(w))}</div>${input()}`}
 else if(m==="memory"){e.innerHTML=`<p class="small">Merke dir das Wort.</p><div class="word" id="mem">${esc(w)}</div><div class="field"><input id="answer" disabled placeholder="Danach schreiben"></div><button class="btn" id="check" disabled>Prüfen</button>`;setTimeout(()=>{if(!$("#mem"))return;$("#mem").textContent="✦ ✦ ✦";$("#answer").disabled=false;$("#check").disabled=false;$("#check").onclick=check},2200)}
 else e.innerHTML=`<p class="small">Schreibe das Wort selbst.</p>${input()}`}
 function input(){setTimeout(()=>{$("#check")&&( $("#check").onclick=check)},0);return `<div class="field"><input id="answer" autocomplete="off" placeholder="Wort schreiben"></div><button class="btn" id="check">Prüfen</button>`}
 function check(){ans($("#answer").value.trim().toLocaleLowerCase("de")===w.toLocaleLowerCase("de"))}
 function ans(ok){it.seen=(it.seen||0)+1;it.last=now();if(ok){it.correct=(it.correct||0)+1;it.mastery=Math.min(100,(it.mastery||0)+9);earned+=2;$("#fb").textContent="✦ Richtig"}else{it.wrong=(it.wrong||0)+1;it.mastery=Math.max(0,(it.mastery||0)-7);$("#fb").textContent="Richtig ist: "+it.text}state.history.push({childId:currentChild,itemId:it.id,mode:m,ok,at:now()});scheduleSync();n++;setTimeout(()=>n>=total?finish():draw(),800)}
 function finish(){let c=child();c.stars=(c.stars||0)+earned;let gems=Math.max(1,Math.floor(earned/8));c.crystals=(c.crystals||0)+gems;let locked=state.collection.filter(x=>!x.unlocked),found=null;if(locked.length&&Math.random()<.32){found=locked[Math.floor(Math.random()*locked.length)];found.unlocked=true}scheduleSync();$("#app").innerHTML=`<div class="learn"><div class="learnbox" style="text-align:center"><h1>Geschafft.</h1><p>⭐ +${earned} &nbsp; 💎 +${gems}</p>${found?`<div class="card"><div style="font-size:60px">${found.icon}</div><b>Neu entdeckt: ${found.name}</b></div>`:""}<br><button class="btn" id="world">Zur Zauberwelt</button></div></div>`;$("#world").onclick=()=>{route="world";render()}}draw()}
function world(){let c=child(),cats=["Alle",...new Set(state.catalog.map(x=>x.cat))];return `<main class="page"><section class="hero"><span class="tag">Die Welt wächst mit dir</span><h1>Magische Lichtung</h1><p class="muted">Bewohner, Dekorationen und neue Orte werden außerhalb des Lernmodus gesammelt und gestaltet.</p>${profileBar()}</section>
<section class="worldHero" style="margin-top:20px"><div class="mountain"></div><div class="mountain m2"></div><div class="mist"></div><div class="ground"></div><div class="worldLabel">🌿 ${state.world.area}</div><div class="worldStats">⭐ ${c?.stars||0} &nbsp; 💎 ${c?.crystals||0}</div><div class="bigTree"><div class="trunk"></div><div class="branch b1"></div><div class="branch b2"></div><div class="crown c1"></div><div class="crown c2"></div><div class="crown c3"></div><div class="treehouse"></div><div class="door"></div><i class="lantern" style="left:100px;top:250px"></i><i class="lantern" style="right:85px;top:220px"></i></div></section>
<section class="card" style="margin-top:20px"><h2>🪄 Gestalten</h2><p class="small">Katalog für Wohnraum, Haus, Garten, Außenbereich und saisonale Dekoration.</p><div class="catalogTabs">${cats.map(x=>`<button class="pill ${x===catalogCat?"active":""}" data-cat="${x}">${x}</button>`).join("")}</div><div class="catalog">${state.catalog.filter(x=>catalogCat==="Alle"||x.cat===catalogCat).map(x=>`<div class="item ${state.world.owned.includes(x.id)?"owned":""}"><div><div class="itemIcon">${x.icon}</div><b>${x.name}</b><div class="small">${x.cat}</div></div><button class="btn ${state.world.owned.includes(x.id)?"light":""}" data-buy="${x.id}">${state.world.owned.includes(x.id)?"Besitzt du":"💎 "+x.cost}</button></div>`).join("")}</div></section>
<section class="card" style="margin-top:20px"><h2>✨ Magische Sammlung</h2><p class="small">Eigene Fantasiewesen in einer märchenhaften Welt: Tiere, Drachen, Elfen, Feen, Geister und saisonale Wesen.</p><div class="collection">${state.collection.map(x=>`<div class="being ${x.unlocked?"":"locked"}"><div class="ico">${x.unlocked?x.icon:"❔"}</div><b>${x.unlocked?x.name:"Unentdeckt"}</b><div class="rarity">${x.unlocked?x.type+" · "+x.rarity:"weiterlernen"}</div></div>`).join("")}</div></section></main>`}
function parent(){let c=child();return `<main class="page"><section class="hero"><span class="tag">Elternbereich</span><h1>Verwalten & Überblick</h1><p class="muted">Profile, Lernwörter, Belohnungen und Lernstand. Änderungen werden automatisch synchronisiert.</p></section><section class="grid">
<div class="card"><h2>Kinderprofile</h2>${state.children.map(x=>`<div class="row between" style="margin:8px 0"><button class="pill" data-child="${x.id}">${x.id===currentChild?"✓ ":""}${esc(x.name)}</button><button class="btn light" data-delete-child="${x.id}">Löschen</button></div>`).join("")}<button class="btn light" id="addChild">+ Profil</button></div>
<div class="card"><h2>Lernliste anlegen</h2><div class="field"><input id="title" placeholder="z. B. Ansage Woche 40"></div><div class="field"><textarea id="words" rows="6" placeholder="Ein Wort pro Zeile"></textarea></div><button class="btn" id="addSet">Speichern</button></div>
<div class="card"><h2>Belohnungen</h2>${state.rewards.map(r=>`<div class="row between"><span>${esc(r.title)} · ⭐ ${r.cost}</span><button class="btn light" data-redeem="${r.id}">Einlösen</button></div>`).join("<hr>")}<div class="field"><input id="reward" placeholder="z. B. Film aussuchen"></div><div class="field"><input id="cost" type="number" value="100" min="1"></div><button class="btn light" id="addReward">+ Belohnung</button></div>
<div class="card"><h2>Cloud-Konto</h2>${cloud()}</div></section>
<h2 style="margin-top:28px">${c?esc(c.name)+" · Lernstand":"Noch kein Profil"}</h2><section class="grid">${sets().map(s=>`<div class="card"><div class="row between"><h3>${esc(s.title)}</h3><button class="btn light" data-delete-set="${s.id}">Liste löschen</button></div>${s.items.map(i=>`<div style="margin:10px 0"><div class="row between"><b>${esc(i.text)}</b><span class="small">${Math.round(i.mastery)}%</span></div><div class="progress"><i style="width:${i.mastery}%"></i></div></div>`).join("")}</div>`).join("")}</section></main>`}
function cloud(){if(demo)return `<p class="small">Lokaler Modus.</p>`;if(session)return `<span class="tag">✓ ${esc(session.user.email||"angemeldet")}</span><p class="small">Änderungen werden automatisch im Hintergrund gespeichert.</p><button class="btn light" id="logout">Abmelden</button>`;return `<div class="field"><input id="email" type="email" placeholder="E-Mail"></div><div class="field"><input id="pw" type="password" placeholder="Passwort"></div><div class="row"><button class="btn" id="login">Anmelden</button><button class="btn light" id="signup">Konto erstellen</button></div>`}
function bind(){
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{route=b.dataset.route;render()});document.querySelectorAll("[data-child]").forEach(b=>b.onclick=()=>{currentChild=b.dataset.child;render()});
 document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>startLearning(b.dataset.start));
 document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{catalogCat=b.dataset.cat;render()});
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{let x=state.catalog.find(i=>i.id===b.dataset.buy),c=child();if(!c)return alert("Bitte zuerst Kinderprofil wählen.");if(state.world.owned.includes(x.id))return;if((c.crystals||0)<x.cost)return alert("Noch nicht genug Kristalle.");c.crystals-=x.cost;state.world.owned.push(x.id);state.world.active.push(x.id);scheduleSync();render()});
 $("#addChild")?.addEventListener("click",()=>{let n=prompt("Name des Kinderprofils:");if(n?.trim()){let x={id:uid(),name:n.trim(),stars:0,crystals:0};state.children.push(x);currentChild=x.id;scheduleSync();render()}});
 document.querySelectorAll("[data-delete-child]").forEach(b=>b.onclick=()=>{let x=state.children.find(c=>c.id===b.dataset.deleteChild);if(confirm(`Profil "${x.name}" und seine Lernlisten wirklich löschen?`)){state.children=state.children.filter(c=>c.id!==x.id);state.sets=state.sets.filter(s=>s.childId!==x.id);currentChild=state.children[0]?.id||null;scheduleSync();render()}});
 $("#addSet")?.addEventListener("click",()=>{if(!currentChild)return alert("Bitte zuerst ein Kinderprofil anlegen.");let title=$("#title").value.trim(),words=[...new Set($("#words").value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean))];if(!title||!words.length)return alert("Titel und Lernwörter eingeben.");state.sets.push({id:uid(),childId:currentChild,subjectId:"de",title,items:words.map(text=>({id:uid(),text,mastery:10,seen:0,correct:0,wrong:0,last:null}))});scheduleSync();render()});
 document.querySelectorAll("[data-delete-set]").forEach(b=>b.onclick=()=>{if(confirm("Diese Lernliste löschen?")){state.sets=state.sets.filter(s=>s.id!==b.dataset.deleteSet);scheduleSync();render()}});
 $("#addReward")?.addEventListener("click",()=>{let t=$("#reward").value.trim(),cost=Number($("#cost").value);if(t&&cost>0){state.rewards.push({id:uid(),title:t,cost});scheduleSync();render()}});
 document.querySelectorAll("[data-redeem]").forEach(b=>b.onclick=()=>{let r=state.rewards.find(x=>x.id===b.dataset.redeem),c=child();if(!c)return;if(c.stars<r.cost)return alert("Noch nicht genug Sterne.");if(confirm(`${r.title} einlösen?`)){c.stars-=r.cost;scheduleSync();render()}});
 $("#logout")?.addEventListener("click",async()=>{await supabase.auth.signOut();session=null;render()});$("#login")?.addEventListener("click",()=>auth(false));$("#signup")?.addEventListener("click",()=>auth(true));
}
async function auth(signup){let email=$("#email").value.trim(),password=$("#pw").value;let r=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(r.error)return alert(r.error.message);session=r.data.session;if(session){await pullCloud();render()}else alert("Bitte ggf. Bestätigungs-E-Mail öffnen.")}
await initCloud();render();
