// Offline cache. Network first, so a fixed version reaches the phone on the next open;
// the cached copy is used when offline or when the network takes longer than 3 s.
const CACHE = 'fittrack-v3';
const ASSETS = ['./', './index.html', './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const fresh = fetch(req, {cache: 'no-cache'}).then(res => {
      if (res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    });
    const timeout = new Promise(resolve => setTimeout(resolve, 3000));
    const res = await Promise.race([fresh.catch(() => null), timeout]);
    return res || (await cache.match(key)) || fresh;
  }));
});
