import type { Metadata } from 'next'
import './globals.css'
import ContextWrapper from './contextWrapper'

export const metadata: Metadata = {
  title: 'Syncronify — Modern Event & Team Execution Platform',
  description: 'Plan, discover, navigate, and collaborate on personal and organization events with a high-contrast Neo-Brutalist interface.',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#F4F4F0] text-black selection:bg-[#FFE600] selection:text-black">
        <ContextWrapper>
          {children}
        </ContextWrapper>
      </body>
    </html>
  )
}
