// 🌸 花花大金庫 V3.0 Service Worker
// 版本更新時，改這裡的版本號即可強制手機更新快取
const CACHE_NAME = 'flower-money-v3.0';

// 安裝階段：快取核心資源
self.addEventListener('install', e => {
  self.skipWaiting(); // 立刻插隊取代舊版
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['./', './index.html', './icon.png'])
    )
  );
});

// 啟動階段：清除所有舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('🗑️ 刪除舊快取:', key);
          return caches.delete(key);
        }
      }))
    )
  );
  return self.clients.claim(); // 立刻接管所有分頁
});

// 攔截請求：優先返回快取，否則網路請求後存入快取
self.addEventListener('fetch', e => {
  e.respondWith(
    (async () => {
      // API 請求（Gemini / GAS / Drive）不走快取，直接網路
      if (
        e.request.url.includes('googleapis.com') ||
        e.request.url.includes('script.google.com')
      ) {
        return fetch(e.request);
      }
      const cached = await caches.match(e.request);
      if (cached) return cached;
      const response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});