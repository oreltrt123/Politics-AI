"use client"

import Link from "next/link"
import FAQ from '@/components/home/FAQ'
import Header from '@/components/Layout/Header'

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen text-blackl bg-white relative">
        <Header />
        <div className="relative top-[90px]">
            <FAQ />
        </div>
    </div>
  )
}
