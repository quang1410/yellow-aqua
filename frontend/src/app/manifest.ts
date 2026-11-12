import type { MetadataRoute } from 'next'
import { t } from '@/i18n/vi'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t('appName'),
    short_name: t('appName'),
    description: t('appDescription'),
    lang: 'vi',
    start_url: '/ho',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0e1719',
    theme_color: '#0e1719',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
