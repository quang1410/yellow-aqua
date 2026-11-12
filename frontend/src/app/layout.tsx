import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { OfflineSetup } from '@/ui/OfflineSetup'
import { t } from '@/i18n/vi'
import '@/styles/tokens.css'

const body = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: t('appName'),
  description: t('appDescription'),
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ea' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1719' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={body.variable}>
      <body>
        {children}
        <OfflineSetup />
      </body>
    </html>
  )
}
