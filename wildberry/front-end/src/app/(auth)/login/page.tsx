import { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Login - Wildberry Admin",
  description: "Login to your account",
}

export default function LoginPage() {
  async function onSubmit(formData: FormData) {
    "use server"
    
    const username = formData.get("username")
    const password = formData.get("password")
    
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side with image */}
      <div className="hidden lg:block relative w-1/2">
        <Image
          src="/wildberry.jpg"
          alt="Wildberry"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Wildberry Admin</h1>
            <p className="text-lg text-white/80">Manage your applications and products</p>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <div className="lg:hidden">
                <Image
                  src="/wildberry.jpg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </div>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
