
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const $ = s => document.querySelector(s);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();
const demo = !(SUPABASE_URL && SUPABASE_ANON_KEY);

const defaultState = {
  family:{id:"demo-family",name:"Unsere Lernwelt",stars:145,crystals:18,parentPin:"2468"},
  children:[
    {id:"c1",name:"Kind 1",theme:"zauberwald",stars:92,crystals:11},
    {id:"c2",name:"Kind 2",theme:"sternennacht",stars:53,crystals:7}
  ],
  subjects:[
    {id:"de",name:"Deutsch",icon:"📖",color:"de",enabled:true},
    {id:"ma",name:"Mathematik",icon:"➕",color:"ma",enabled:false},
    {id:"en",name:"Englisch",icon:"🌙",color:"en",enabled:false},
    {id:"su",name:"Sachunterricht",icon:"🌍",color:"su",enabled:false}
  ],
  sets:[
    {id:"s1",childId:"c1",subjectId:"de",title:"Lernwörter – Beispiel",due:null,active:true,
      items:["Fahrrad","plötzlich","Frühling","Straße","erzählen","wohnen","Zähne","fahren"].map((text,i)=>({id:"w"+i,text,mastery: i<2?72:i<5?42:18,seen:0,correct:0,wrong:0,last:null}))}
  ],
  rewards:[
    {id:"r1",title:"Film aussuchen",cost:100,active:true},
    {id:"r2",title:"Spieleabend bestimmen",cost:180,active:true}
  ],
  collection:[
    {id:"mossbunny",name:"Mooshase",icon:"🐇",unlocked:true,rarity:"gewöhnlich"},
    {id:"mooncat",name:"Mondkatze",icon:"🐈‍⬛",unlocked:true,rarity:"selten"},
    {id:"cloudfox",name:"Wolkenfuchs",icon:"🦊",unlocked:false,rarity:"selten"},
    {id:"stardragon",name:"Sternendrache",icon:"🐉",unlocked:false,rarity:"legendär"},
    {id:"crystalstag",name:"Kristallhirsch",icon:"🦌",unlocked:false,rarity:"episch"},
    {id:"forestspirit",name:"Waldgeist",icon:"🌱",unlocked:false,rarity:"selten"}
  ],
  world:{level:2,house:"Baumhaus",decor:["Kristallbeet"],unlockedAreas:["Lichtung","Zauberbaum"]},
  history:[]
};

let state = JSON.parse(localStorage.getItem("mlw-state") || "null") || structuredClone(defaultState);
let route = "home";
let currentChild = state.children[0]?.id;
let session = null;
let supabase = null;

function save(){ localStorage.setItem("mlw-state",JSON.stringify(state)); }
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function masteryLabel(n){return n>=80?"🟢 sicher":n>=45?"🟡 üben":"🔴 neu/unsicher"}
function child(){return state.children.find(c=>c.id===currentChild)||state.children[0]}
function setsForChild(){return state.sets.filter(s=>s.childId===currentChild)}

async function initSupabase(){
  if(demo) return;
  try{
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
    const {data}=await supabase.auth.getSession(); session=data.session;
    if(session) await pullCloud();
  }catch(e){ console.warn("Cloud nicht verfügbar, lokaler Modus:",e); }
}

async function pullCloud(){
  if(!supabase||!session) return;
  const {data,error}=await supabase.from("app_state").select("payload").eq("user_id",session.user.id).maybeSingle();
  if(!error && data?.payload){state=data.payload; save();}
}
async function pushCloud(){
  save();
  if(!supabase||!session) return;
  await supabase.from("app_state").upsert({user_id:session.user.id,payload:state,updated_at:now()},{onConflict:"user_id"});
}

function layout(content){
  return `<div class="shell">
    <header class="topbar">
      <div class="brand"><div class="brand-mark">✦</div><div>Magische Lernwelt<br><span class="small">${demo?"Demo · lokal":"Cloud · synchronisiert"}</span></div></div>
      <nav class="nav">
        ${[["home","Start"],["learn","Lernen"],["world","Zauberwelt"],["parent","Eltern"]].map(([r,n])=>`<button data-route="${r}" class="${route===r?"active":""}">${n}</button>`).join("")}
      </nav>
    </header>
    ${content}
  </div>`;
}

function render(){
  let content="";
  if(route==="home") content=home();
  if(route==="learn") content=learnHome();
  if(route==="world") content=world();
  if(route==="parent") content=parent();
  $("#app").innerHTML=layout(content);
  bindCommon();
}
function bindCommon(){
  document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{route=b.dataset.route;render()});
  document.querySelectorAll("[data-child]").forEach(b=>b.onclick=()=>{currentChild=b.dataset.child;render()});
}

function home(){
  const c=child();
  return `<main class="page">
    <section class="hero">
      <div class="tag">✦ ${esc(c?.name||"Kind")}'s Lernreise</div>
      <h1>Willkommen in deiner<br>magischen Lernwelt.</h1>
      <p class="sub">Lernen bleibt ruhig und klar. Nach der Lerneinheit wachsen Lichtung, Sammlung und Zauberhaus weiter.</p>
      <div class="row">
        ${state.children.map(x=>`<button class="pill" data-child="${x.id}">${x.id===currentChild?"✓ ":""}${esc(x.name)}</button>`).join("")}
      </div>
    </section>
    <section class="grid">
      <div class="card"><div class="small">Heute verfügbar</div><div class="big-num">${setsForChild().filter(s=>s.active).length}</div><b>Lernlisten</b></div>
      <div class="card"><div class="small">Gesammelt</div><div class="big-num">⭐ ${c?.stars||0}</div><b>Sterne</b></div>
      <div class="card"><div class="small">Magische Energie</div><div class="big-num">💎 ${c?.crystals||0}</div><b>Kristalle</b></div>
      <div class="card"><div class="small">Entdeckt</div><div class="big-num">${state.collection.filter(x=>x.unlocked).length}/${state.collection.length}</div><b>Wesen</b></div>
    </section>
    <section class="grid">
      ${state.subjects.map(s=>`<article class="card click subject-${s.color}">
        <div class="row between"><span style="font-size:34px">${s.icon}</span><span class="tag">${s.enabled?"aktiv":"vorbereitet"}</span></div>
        <h2>${esc(s.name)}</h2><p class="small">${s.id==="de"?"Lernwörter, Rechtschreibung und adaptive Wiederholung":s.enabled?"Bereit":"Kann später als Modul ergänzt werden"}</p>
      </article>`).join("")}
    </section>
  </main>`;
}

function learnHome(){
  const sets=setsForChild();
  return `<main class="page">
    <section class="hero"><div class="tag">Ruhiger Lernmodus</div><h1>Was möchtest du üben?</h1><p class="sub">Keine Sammelwesen während der Aufgaben. Farbe, große Schrift und dezente Magie unterstützen die Orientierung.</p></section>
    <section class="grid">${sets.length?sets.map(s=>{
      const avg=Math.round(s.items.reduce((a,x)=>a+x.mastery,0)/Math.max(1,s.items.length));
      return `<article class="card subject-de"><div class="row between"><span class="tag">📖 Deutsch</span><span class="small">${s.items.length} Wörter</span></div><h2>${esc(s.title)}</h2><div class="progress"><i style="width:${avg}%"></i></div><p class="small">Gesamtfortschritt ${avg}%</p><button class="btn" data-start="${s.id}">Lerneinheit starten</button></article>`
    }).join(""):`<div class="card">Noch keine Lernliste. Lege sie im Elternbereich an.</div>`}</section>
  </main>`;
}

function selectAdaptiveItem(set){
  // Niedrige Kompetenz + lange nicht gesehen + Fehler werden priorisiert.
  const scored=set.items.map(it=>{
    const recency=!it.last?25:Math.min(25,(Date.now()-new Date(it.last).getTime())/86400000*4);
    const errorBias=(it.wrong||0)*4;
    const noise=Math.random()*8;
    return {it,score:(100-it.mastery)+recency+errorBias+noise};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.it;
}
function modeFor(item){
  const m=item.mastery||0;
  if(m<25) return ["recognize","scramble"][Math.floor(Math.random()*2)];
  if(m<50) return ["scramble","gap","recognize"][Math.floor(Math.random()*3)];
  if(m<75) return ["memory","type","gap"][Math.floor(Math.random()*3)];
  return ["type","memory"][Math.floor(Math.random()*2)];
}
function scramble(word){return [...word].sort(()=>Math.random()-.5).join(" · ")}
function distractors(word){
  let a=word;
  if(word.length>3){let i=Math.max(1,Math.floor(word.length/2)); a=word.slice(0,i)+word.slice(i+1)}
  let b=word.length>4?word.slice(0,-2)+word.at(-1)+word.at(-2):word+"h";
  return [word,a,b].filter((v,i,x)=>v&&x.indexOf(v)===i).sort(()=>Math.random()-.5);
}
function gap(word){
  return [...word].map((c,i)=>i>0&&i<word.length-1&&i%3===1?"_":c).join(" ");
}
function startSession(setId){
  const set=state.sets.find(s=>s.id===setId); if(!set)return;
  let count=0, earned=0, current=null, mode=null, memoryHidden=false;
  const total=12;
  function draw(){
    current=selectAdaptiveItem(set); mode=modeFor(current); memoryHidden=false;
    $("#app").innerHTML=`<div class="learn-shell"><section class="learn-card">
      <div class="row between"><span class="tag">📖 Deutsch</span><span class="small">${count+1} von ${total}</span></div>
      <div class="progress"><i style="width:${(count/total)*100}%"></i></div>
      <div id="exercise"></div><div class="feedback" id="fb"></div>
      <div class="row between"><button class="btn secondary" id="quit">Beenden</button><span class="small">⭐ +${earned}</span></div>
    </section></div>`;
    $("#quit").onclick=()=>{route="learn";render()};
    drawExercise();
  }
  function drawExercise(){
    const ex=$("#exercise"), w=current.text;
    if(mode==="recognize"){
      ex.innerHTML=`<p class="small">Welches Wort ist richtig?</p><div class="choice">${distractors(w).map(x=>`<button data-answer="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
      ex.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>answer(b.dataset.answer===w));
    }else if(mode==="scramble"){
      ex.innerHTML=`<p class="small">Setze das Wort im Kopf richtig zusammen.</p><div class="learn-word">${esc(scramble(w))}</div><div class="field"><input id="ans" autocomplete="off" placeholder="Wort eingeben"></div><button class="btn" id="check">Prüfen</button>`;
      $("#check").onclick=()=>answer($("#ans").value.trim().toLocaleLowerCase("de")===w.toLocaleLowerCase("de"));
    }else if(mode==="gap"){
      ex.innerHTML=`<p class="small">Welche Buchstaben fehlen?</p><div class="learn-word">${esc(gap(w))}</div><div class="field"><input id="ans" autocomplete="off" placeholder="Ganzes Wort schreiben"></div><button class="btn" id="check">Prüfen</button>`;
      $("#check").onclick=()=>answer($("#ans").value.trim().toLocaleLowerCase("de")===w.toLocaleLowerCase("de"));
    }else if(mode==="memory"){
      ex.innerHTML=`<p class="small">Merke dir das Wort. Es verschwindet gleich.</p><div class="learn-word" id="memory">${esc(w)}</div><div class="field"><input id="ans" autocomplete="off" placeholder="Danach hier schreiben" disabled></div><button class="btn" id="check" disabled>Prüfen</button>`;
      setTimeout(()=>{if(!$("#memory"))return; $("#memory").textContent="✦ ✦ ✦"; $("#ans").disabled=false; $("#check").disabled=false; $("#ans").focus(); $("#check").onclick=()=>answer($("#ans").value.trim().toLocaleLowerCase("de")===w.toLocaleLowerCase("de"));},2200);
    }else{
      ex.innerHTML=`<p class="small">Schreibe das Lernwort selbst.</p><div class="notice">Tipp: Sprich das Wort leise in Silben. Für die spätere Version kann hier zusätzlich Audio hinterlegt werden.</div><div class="field"><input id="ans" autocomplete="off" placeholder="Wort schreiben"></div><button class="btn" id="check">Prüfen</button>`;
      $("#check").onclick=()=>answer($("#ans").value.trim().toLocaleLowerCase("de")===w.toLocaleLowerCase("de"));
    }
  }
  function answer(ok){
    current.seen=(current.seen||0)+1; current.last=now();
    if(ok){current.correct=(current.correct||0)+1; current.mastery=Math.min(100,(current.mastery||0)+Math.max(5,12-current.mastery/12)); earned+=2; $("#fb").innerHTML=`<span class="spark">✦ Richtig – +2 Sterne</span>`;}
    else{current.wrong=(current.wrong||0)+1; current.mastery=Math.max(0,(current.mastery||0)-7); $("#fb").textContent=`Fast. Richtig ist: ${current.text}`;}
    state.history.push({id:uid(),childId:currentChild,setId:set.id,itemId:current.id,mode,ok,at:now()});
    count++; save();
    setTimeout(()=>{if(count>=total)finish();else draw()},850);
  }
  function finish(){
    const c=child(); c.stars=(c.stars||0)+earned; c.crystals=(c.crystals||0)+Math.max(1,Math.floor(earned/8));
    // kleine Sammelchance nach abgeschlossener Einheit
    const locked=state.collection.filter(x=>!x.unlocked);
    let found=null;
    if(locked.length && Math.random()<.28){found=locked[Math.floor(Math.random()*locked.length)];found.unlocked=true}
    pushCloud();
    $("#app").innerHTML=`<div class="learn-shell"><section class="learn-card" style="text-align:center">
      <div style="font-size:48px">✦</div><h1>Für heute geschafft.</h1><p>Du hast <b>${earned} Sterne</b> und <b>${Math.max(1,Math.floor(earned/8))} Kristall(e)</b> gesammelt.</p>
      ${found?`<div class="notice">Etwas Magisches wurde entdeckt: <b>${found.icon} ${esc(found.name)}</b>!</div>`:""}
      <div class="row" style="justify-content:center"><button class="btn" id="toWorld">Zur Zauberwelt</button><button class="btn secondary" id="toLearn">Noch eine Runde</button></div>
    </section></div>`;
    $("#toWorld").onclick=()=>{route="world";render()}; $("#toLearn").onclick=()=>{route="learn";render()};
  }
  draw();
}

function world(){
  const c=child();
  return `<main class="page">
    <section class="hero"><div class="tag">⭐ ${c?.stars||0} &nbsp; 💎 ${c?.crystals||0}</div><h1>Die magische Lichtung</h1><p class="sub">Hier wird Lernen sichtbar: Die Welt wächst, neue Bereiche öffnen sich und Fantasiewesen werden entdeckt. Keine bekannten Figuren – nur eine eigene, märchenhafte Welt.</p></section>
    <section style="margin-top:22px" class="world">
      <div class="tree"><div class="trunk"></div><div class="crown c1"></div><div class="crown c2"></div><div class="crown c3"></div><div class="house"></div><div class="door"></div></div>
      <div class="crystal" style="left:18%;bottom:70px"></div><div class="crystal" style="left:22%;bottom:58px;transform:scale(.7)"></div><div class="crystal" style="right:19%;bottom:85px;transform:scale(1.2)"></div>
    </section>
    <section class="grid">
      <article class="card"><h2>Gebiete</h2><div class="row">${["Lichtung","Zauberbaum","Feengarten","Kristallhöhle","Sternwarte","Zauberbibliothek","Drachenberg"].map((x,i)=>`<span class="tag ${i>state.world.level?"locked":""}">${i<=state.world.level?"✦":"🔒"} ${x}</span>`).join("")}</div></article>
      <article class="card"><h2>Gestalten</h2><p class="small">Mit Kristallen lassen sich später Baumhaus, Lichtung und Dekoration individuell verändern.</p><div class="row"><button class="btn secondary" data-build="Lichterkette">Lichterkette · 5 💎</button><button class="btn secondary" data-build="Kristallgarten">Kristallgarten · 8 💎</button></div></article>
    </section>
    <h2 style="margin-top:30px">Magische Sammlung</h2>
    <section class="creature-shelf">${state.collection.map(x=>`<div class="creature ${x.unlocked?"":"locked"}"><div><div class="emoji">${x.unlocked?x.icon:"?"}</div><b>${x.unlocked?esc(x.name):"Unentdeckt"}</b><div class="small">${x.unlocked?x.rarity:"Weiterlernen zum Entdecken"}</div></div></div>`).join("")}</section>
  </main>`;
}

function parent(){
  const c=child();
  return `<main class="page">
    <section class="hero"><div class="tag">Elternbereich</div><h1>Lernen verwalten</h1><p class="sub">Lerninhalte vorgeben, Fortschritt prüfen, Belohnungen festlegen und die Plattform später um weitere Fächer erweitern.</p>
      ${demo?`<div class="notice">Die App läuft gerade im lokalen Demo-Modus. Für Synchronisation zwischen Geräten Supabase einrichten und config.js ergänzen.</div>`:""}
    </section>
    <section class="grid">
      <article class="card"><h2>Kinder</h2>${state.children.map(x=>`<div class="row between" style="margin:9px 0"><button class="pill" data-child="${x.id}">${x.id===currentChild?"✓ ":""}${esc(x.name)}</button><span class="small">⭐ ${x.stars} · 💎 ${x.crystals}</span></div>`).join("")}<button class="btn secondary" id="addChild">+ Kinderprofil</button></article>
      <article class="card"><h2>Neue Lernliste</h2><div class="field"><label>Titel</label><input id="setTitle" placeholder="z. B. Ansage KW 40"></div><div class="field"><label>Lernwörter – eines pro Zeile oder mit Komma</label><textarea id="words" rows="6" placeholder="Fahrrad&#10;Frühling&#10;Straße"></textarea></div><button class="btn" id="addSet">Liste anlegen</button></article>
      <article class="card"><h2>Belohnungen</h2>${state.rewards.map(r=>`<div class="reward"><div><b>${esc(r.title)}</b><div class="small">${r.cost} Sterne</div></div><button class="btn secondary" data-redeem="${r.id}">Einlösen</button></div>`).join("<hr>")}<hr><div class="field"><input id="rewardTitle" placeholder="Neue Belohnung"></div><div class="field"><input id="rewardCost" type="number" min="1" value="100"></div><button class="btn secondary" id="addReward">+ Belohnung</button></article>
      <article class="card"><h2>Fächer</h2>${state.subjects.map(s=>`<div class="row between" style="margin:9px 0"><span>${s.icon} <b>${esc(s.name)}</b></span><span class="tag">${s.enabled?"aktiv":"vorbereitet"}</span></div>`).join("")}<p class="small">Die Datenstruktur ist fachunabhängig. Neue Module können ergänzt werden, ohne Profile und Lernhistorie umzubauen.</p></article>
    </section>
    <h2 style="margin-top:30px">${esc(c?.name||"")} · Lernstand</h2>
    <section class="grid">${setsForChild().map(s=>`<article class="card"><h3>${esc(s.title)}</h3>${s.items.map(i=>`<div style="margin:10px 0"><div class="row between"><b>${esc(i.text)}</b><span class="small">${masteryLabel(i.mastery)} · ${Math.round(i.mastery)}%</span></div><div class="progress"><i style="width:${i.mastery}%"></i></div></div>`).join("")}</article>`).join("")}</section>
    <section class="card" style="margin-top:22px"><h2>Cloud-Konto</h2>${cloudBox()}</section>
  </main>`;
}

function cloudBox(){
  if(demo) return `<p class="small">Nach der Supabase-Einrichtung erscheinen hier Anmeldung und Synchronisation. Bis dahin werden alle Daten nur auf diesem Gerät gespeichert.</p>`;
  if(session) return `<div class="row"><span class="tag">✓ Angemeldet: ${esc(session.user.email||"")}</span><button class="btn secondary" id="sync">Jetzt synchronisieren</button><button class="btn secondary" id="logout">Abmelden</button></div>`;
  return `<div class="field"><input id="email" type="email" placeholder="E-Mail"></div><div class="field"><input id="password" type="password" placeholder="Passwort (mind. 6 Zeichen)"></div><div class="row"><button class="btn" id="login">Anmelden</button><button class="btn secondary" id="signup">Konto erstellen</button></div>`;
}

function bindDynamic(){
  document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>startSession(b.dataset.start));
  $("#addChild")?.addEventListener("click",async()=>{const name=prompt("Name des Kinderprofils:");if(name?.trim()){state.children.push({id:uid(),name:name.trim(),theme:"zauberwald",stars:0,crystals:0});await pushCloud();render()}});
  $("#addSet")?.addEventListener("click",async()=>{
    const title=$("#setTitle").value.trim(), raw=$("#words").value;
    const words=[...new Set(raw.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean))];
    if(!title||!words.length)return alert("Bitte Titel und mindestens ein Lernwort eingeben.");
    state.sets.push({id:uid(),childId:currentChild,subjectId:"de",title,due:null,active:true,items:words.map(x=>({id:uid(),text:x,mastery:10,seen:0,correct:0,wrong:0,last:null}))});
    await pushCloud(); render();
  });
  $("#addReward")?.addEventListener("click",async()=>{const t=$("#rewardTitle").value.trim(),cost=Number($("#rewardCost").value);if(t&&cost>0){state.rewards.push({id:uid(),title:t,cost,active:true});await pushCloud();render()}});
  document.querySelectorAll("[data-redeem]").forEach(b=>b.onclick=async()=>{const r=state.rewards.find(x=>x.id===b.dataset.redeem),c=child();if(c.stars<r.cost)return alert("Noch nicht genug Sterne.");if(confirm(`${r.title} für ${r.cost} Sterne einlösen?`)){c.stars-=r.cost;await pushCloud();render()}});
  document.querySelectorAll("[data-build]").forEach(b=>b.onclick=async()=>{const cost=b.dataset.build==="Lichterkette"?5:8,c=child();if(c.crystals<cost)return alert("Noch nicht genug Kristalle.");c.crystals-=cost;state.world.decor.push(b.dataset.build);await pushCloud();render()});
  $("#sync")?.addEventListener("click",async()=>{await pushCloud();alert("Synchronisiert.")});
  $("#logout")?.addEventListener("click",async()=>{await supabase.auth.signOut();session=null;render()});
  $("#login")?.addEventListener("click",()=>auth(false));
  $("#signup")?.addEventListener("click",()=>auth(true));
}
async function auth(signup){
  const email=$("#email").value.trim(),password=$("#password").value;
  const res=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});
  if(res.error)return alert(res.error.message);
  session=res.data.session;
  if(session){await pullCloud();await pushCloud();}
  alert(signup && !session ? "Konto erstellt. Prüfe ggf. die Bestätigungs-E-Mail." : "Angemeldet.");
  render();
}

const oldRender=render;
render=function(){oldRender();bindDynamic()}

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
await initSupabase();
render();
