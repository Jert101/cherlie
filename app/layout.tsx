import type { Metadata } from 'next'
import { Poppins, Dancing_Script } from 'next/font/google'
import './globals.css'
import AmbientSound from '@/components/AmbientSound'

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
  title: 'Our World',
  description: 'A romantic, interactive world for us',
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
      </body>
    </html>
  )
}
