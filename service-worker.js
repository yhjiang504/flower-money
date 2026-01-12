const CACHE_NAME = 'flower-money-v2';

// 第一次安裝時，先把核心檔案存起來
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 這裡加上 './' 代表存首頁，其他的它會自動抓
      return cache.addAll(['./', './index.html', './icon.png']);
    })
  );
});

// 當你打開 App 時
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      // 1. 先去看看快取(Cache)裡面有沒有這個檔案？
      const r = await caches.match(e.request);
      if (r) { return r; } // 有的話直接用，不用連網

      // 2. 如果沒有，就去網路下載
      const response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      
      // 3. 下載下來的東西，順便存一份到快取，下次就不用下載了
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});