// 🔥 1. 這裡改成 v3，強迫手機更新
const CACHE_NAME = 'flower-money-v3';

// 安裝階段 (Install)
self.addEventListener('install', (e) => {
  // 🔥 2. 強制插隊：讓這個新 Service Worker 立刻進入等待狀態，不用等舊的停止
  self.skipWaiting(); 
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['./', './index.html', './icon.png']);
    })
  );
});

// 啟動階段 (Activate) - 🔥 3. 這是你原本缺少的「大掃除」功能
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // 如果這個快取的名字不是現在的版本 (v3)，就把它刪掉！
        if (key !== CACHE_NAME) {
          console.log('刪除舊快取:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 讓新版 Service Worker 立刻接管所有頁面
  return self.clients.claim();
});

// 抓取階段 (Fetch) - 這部分保持不變
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) { return r; }
      
      const response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});