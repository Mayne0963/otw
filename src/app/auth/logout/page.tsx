"use client"

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await signOut({ redirect: false })
      router.push('/')
    }

    performLogout()
  }, [router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Logging out</CardTitle>
          <CardDescription className="text-center">
            Please wait while we sign you out...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    </div>
  )
} 