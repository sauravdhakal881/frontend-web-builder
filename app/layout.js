import './globals.css'

export const metadata = {
  title: 'AI Website Builder',
  description: 'Build websites of all types with AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}