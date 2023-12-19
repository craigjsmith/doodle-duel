import './globals.css'
import '@mantine/core/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Doodle Duel',
  description: 'Online multiplayer draw and guess game',
  metadataBase: new URL('https://doodle.craigsmith.dev'),

  openGraph: {
    title: 'Doodle Duel',
    description: 'Online multiplayer draw and guess game',
    url: 'https://doodle.craigsmith.dev',
    siteName: 'Doodle Duel',
    images: [
      {
        url: '/images/og-1200x630.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
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
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/images/icon.svg" />
      </head>

      <body>
        <MantineProvider
          theme={{
            primaryColor: 'pink',
            colors: {
              'pink': [
                "#ffebf4",
                "#fbd7e4",
                "#edaec3",
                "#e182a2",
                "#d75d86",
                "#d14675",
                "#cf396c",
                "#b82a5b",
                "#a62251",
                "#921545"
              ],
            },
          }}>{children}</MantineProvider>
      </body>
    </html>
  )
}
