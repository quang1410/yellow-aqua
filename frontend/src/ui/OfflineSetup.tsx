'use client'

import { useEffect } from 'react'

/** Đăng ký service worker rồi nhờ nó cache mọi file trang này đã tải. */
export function OfflineSetup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let cancelled = false
    void (async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        const reg = await navigator.serviceWorker.ready
        const urls = [
          location.pathname,
          ...performance
            .getEntriesByType('resource')
            .map((e) => e.name)
            .filter((u) => u.startsWith(location.origin)),
        ]
        const channel = new MessageChannel()
        const done = new Promise<void>((resolve) => (channel.port1.onmessage = () => resolve()))
        reg.active?.postMessage({ type: 'cache-urls', urls }, [channel.port2])
        await done
        if (!cancelled) document.documentElement.dataset.offlineReady = 'true'
      } catch {
        // Offline chỉ là phần thêm; không có thì app vẫn chạy khi có mạng.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])
  return null
}
