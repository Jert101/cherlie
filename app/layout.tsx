import type { Metadata, Viewport } from 'next'
import { Poppins, Dancing_Script } from 'next/font/google'
import './globals.css'
import AmbientSound from '@/components/AmbientSound'
import InactivityLogout from '@/components/InactivityLogout'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const dancingScript = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-handwritten',
})

export const metadata: Metadata = {
  title: 'SoLuna',
  description: 'A romantic, interactive world for us',
  applicationName: 'SoLuna',
  icons: { icon: '/SoLuna.jpg', apple: '/SoLuna.jpg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SoLuna',
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#1a0f1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} ${dancingScript.variable} font-sans antialiased`}>
        {children}
        <AmbientSound />
        <InactivityLogout />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
