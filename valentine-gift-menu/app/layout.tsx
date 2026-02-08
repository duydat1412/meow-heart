import React from "react"
import type { Metadata } from 'next'
import { Fira_Sans } from 'next/font/google'

import './globals.css'

const firaSans = Fira_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
})

export const metadata: Metadata = {
  title: 'Valentine Gift',
  description: 'A special Valentine gift',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${firaSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
