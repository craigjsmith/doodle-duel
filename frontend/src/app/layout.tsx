import { Inter } from 'next/font/google'
import './globals.css'
import '@mantine/core/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import Head from 'next/head';
import { Viewport } from 'next';

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        <title>Doodle Duel</title>
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
