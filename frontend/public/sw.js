/* Service worker của Yellow Aqua: viết tay, không dùng plugin build. */
const CACHE = 'yellow-aqua-v1'
const SHELL = ['/ho', '/manifest.webmanifest', '/icon.svg']
const NAVIGATION_TIMEOUT_MS = 4000

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'cache-urls') return
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.all(data.urls.map((u) => c.add(u).catch(() => undefined))))
      .then(() => event.ports[0] && event.ports[0].postMessage('ok')),
  )
})

// File có hash trong tên (/_next/static/...) không bao giờ đổi nội dung nên cache-first là an toàn.
// Mọi file khác (manifest, icon, trang) có thể đổi giữa các bản phát hành nên đi mạng trước.
const isImmutable = (url) => url.pathname.startsWith('/_next/static/')

/** Ghi cache và báo cho trình duyệt đợi việc ghi xong rồi mới được dừng service worker. */
function remember(event, request, response) {
  if (!response.ok) return
  const copy = response.clone()
  event.waitUntil(caches.open(CACHE).then((c) => c.put(request, copy)))
}

async function cacheFirst(event, request) {
  const hit = await caches.match(request)
  if (hit) return hit
  const res = await fetch(request)
  remember(event, request, res)
  return res
}

/** Mạng trước; quá `timeoutMs` hoặc lỗi mạng thì dùng bản đã cache. */
async function networkFirst(event, request, timeoutMs, fallbackUrl) {
  const fromCache = async () => (await caches.match(request, { ignoreSearch: true })) || (fallbackUrl ? caches.match(fallbackUrl) : undefined)
  const network = fetch(request).then((res) => {
    remember(event, request, res)
    return res
  })
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))
  try {
    const first = await Promise.race([network, timeout])
    if (first) return first
    return (await fromCache()) || network
  } catch {
    return (await fromCache()) || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (isImmutable(url)) {
    event.respondWith(cacheFirst(event, req))
  } else if (req.mode === 'navigate') {
    event.respondWith(networkFirst(event, req, NAVIGATION_TIMEOUT_MS, '/ho'))
  } else {
    event.respondWith(networkFirst(event, req, NAVIGATION_TIMEOUT_MS))
  }
})
