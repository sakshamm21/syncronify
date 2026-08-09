import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContextWrapper from './contextWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Syncronify',
  description: 'An emerging platform for management of your all Events.',
  icons: {
    icon: '/icons/sample-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextWrapper>
        {children}
        </ContextWrapper>
      </body>
    </html>
  )
}
