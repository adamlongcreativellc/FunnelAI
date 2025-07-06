import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FunnelAI - AI-Powered Funnel Builder',
  description: 'Create high-converting marketing funnels with AI assistance',
  keywords: ['AI', 'marketing', 'funnel', 'conversion', 'automation'],
  authors: [{ name: 'FunnelAI Team' }],
  creator: 'FunnelAI',
  publisher: 'FunnelAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://funnelai.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://funnelai.com',
    title: 'FunnelAI - AI-Powered Funnel Builder',
    description: 'Create high-converting marketing funnels with AI assistance',
    siteName: 'FunnelAI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FunnelAI - AI-Powered Funnel Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FunnelAI - AI-Powered Funnel Builder',
    description: 'Create high-converting marketing funnels with AI assistance',
    images: ['/og-image.jpg'],
    creator: '@funnelai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}