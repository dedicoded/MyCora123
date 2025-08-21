
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/supabase'

export default function AuthFlow() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = mode === 'signin' 
        ? await auth.signInWithEmail(email, password)
        : await auth.signUpWithEmail(email, password)

      if (error) {
        setMessage(error.message)
      } else {
        setMessage(mode === 'signin' ? 'Signed in successfully!' : 'Check your email for verification!')
        if (mode === 'signin') router.push('/dashboard')
      }
    } catch (err) {
      setMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await auth.signInWithMagicLink(email)
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for the magic link!')
      }
    } catch (err) {
      setMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'discord') => {
    setLoading(true)
    try {
      const { error } = await auth.signInWithOAuth(provider)
      if (error) {
        setMessage(error.message)
        setLoading(false)
      }
    } catch (err) {
      setMessage('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MyCora</CardTitle>
          <CardDescription>
            Sign in to access your Web3 payment platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-4">
                {/* OAuth Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleOAuth('google')} 
                    disabled={loading}
                    variant="outline" 
                    className="w-full"
                  >
                    Continue with Google
                  </Button>
                  <Button 
                    onClick={() => handleOAuth('github')} 
                    disabled={loading}
                    variant="outline" 
                    className="w-full"
                  >
                    Continue with GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Magic Link */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleMagicLink} 
                    disabled={loading || !email}
                    variant="secondary" 
                    className="w-full"
                  >
                    Send Magic Link
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Enter your email above and click to receive a magic link
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="space-y-2">
                <Button 
                  onClick={() => handleOAuth('google')} 
                  disabled={loading}
                  variant="outline" 
                  className="w-full"
                >
                  Sign up with Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <div className={`mt-4 p-3 rounded text-sm ${
              message.includes('error') || message.includes('Error') 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
