import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import ContextWrapper from './contextWrapper'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-space' })

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
    <html lang="en" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#F4F4F0] text-black selection:bg-[#FFE600] selection:text-black">
        <ContextWrapper>
          {children}
        </ContextWrapper>
      </body>
    </html>
  )
}
