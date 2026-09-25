const CACHE="magische-lernwelt-v85";
const CORE=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;let u=new URL(e.request.url),asset=/\/(app\.js|styles\.css)$/.test(u.pathname);if(asset){e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>r).catch(()=>caches.match(e.request)));return}e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){let copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});
