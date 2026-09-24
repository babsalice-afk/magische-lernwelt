
const CACHE = "magische-lernwelt-v1";
const CORE = ["./","./index.html","./styles.css","./app.js","./config.js","./manifest.webmanifest","./icons/icon-192.svg","./icons/icon-512.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(resp=>{
    const clone=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,clone)); return resp;
  }).catch(()=>caches.match("./index.html"))));
});
