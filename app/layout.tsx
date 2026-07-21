import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PayNote',
  description: 'Request USDC payments. Share a link. Get paid.',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900;1,14..32,400&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{__html: `
          try {
            var t = localStorage.getItem('paynote-theme') || 'light';
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.style.colorScheme = t;
          } catch(e){}
        `}}/>
      </head>
      <body>{children}</body>
    </html>
  )
}
