import { Inter } from 'next/font/google'
import './globals.css'
import '@mantine/core/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
