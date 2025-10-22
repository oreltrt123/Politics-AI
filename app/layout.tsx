import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClerkProvider, UserButton } from "@clerk/nextjs"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "מעקב השפעה - הכנסת",
  description: "דוחות שבועיים אוטומטיים על פעילות חברי הכנסת הישראלית",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`font-sans antialiased`}>
    <ClerkProvider>
      <UserButton />
        {children}
        <Analytics />
   </ClerkProvider>
      </body>
    </html>
  )
}
