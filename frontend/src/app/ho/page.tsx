'use client'

import { useSyncExternalStore } from 'react'
import { t } from '@/i18n/vi'

const noop = () => () => {}

export default function TankPage() {
  // Chỉ true sau khi hydrate ở client, không cần setState trong effect
  const ready = useSyncExternalStore(noop, () => true, () => false)
  return (
    <main data-tank-ready={ready ? 'true' : 'false'} style={{ display: 'grid', placeItems: 'center', height: '100dvh' }}>
      <p>{t('preparingTank')}</p>
    </main>
  )
}
