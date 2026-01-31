"use client"

import React, { useState } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Coffee, Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { loginRequest } from '@/features/auth/api'

export function LoginForm() {
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: ({ emailAddress, password }: { emailAddress: string; password: string }) =>
      loginRequest({ emailAddress, password }),
    onSuccess(data) {
      const token = data?.token ?? data?.accessToken ?? null
      const user = data?.user ?? data ?? null
      setAuth(token, user)
    },
    onError(err: Error) {
      const message = err?.message || (typeof err === 'string' ? err : 'Error en login')
      setError(message)
    },
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await mutation.mutateAsync({ emailAddress: email, password })
      const token = data?.token ?? data?.accessToken ?? null
      const user = data?.user ?? data ?? null
      setAuth(token, user)
      if (user) queryClient.setQueryData(['user'], user)
      router.push('/home')
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'Error en login')
      setError(message)
    }
  }


  const isLoading = mutation.isPending

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-[#0b1020] to-[#0b0e14]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/coffee-bg.jpg)' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl p-8 border border-white/10 bg-white/6 backdrop-blur-3xl shadow-[0_20px_50px_rgba(2,6,23,0.6)] transition-transform transform">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400/25 to-rose-400/15 border border-white/10 mb-6">
              <Coffee className="w-8 h-8 text-amber-300" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Bienvenido</h1>
            <p className="mt-2 text-white/75 text-sm">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-white/90">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 bg-white/5 backdrop-blur-sm border border-white/8 text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:border-amber-300 transition-all"
                  aria-label="Correo electrónico"
                  required
                />
                <p className="text-xs text-white/50 mt-1">Usa el correo con el que te registraste en BrewHub.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-white/90">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 bg-white/5 backdrop-blur-sm border border-white/8 text-white placeholder:text-white/50 pr-12 focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:border-amber-300 transition-all"
                  aria-label="Contraseña"
                  required
                />
                <button type="button" aria-label="Mostrar contraseña" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-white/75">
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-white/20 bg-white/3 checked:bg-amber-400 checked:border-amber-400" />
                <span>Recuérdame</span>
              </label>
              <a href="#" className="text-sm text-amber-300 hover:underline">¿Olvidaste la contraseña?</a>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-600/20 border border-red-500/30">
                <p className="text-sm text-red-100">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold rounded-xl shadow-2xl hover:scale-[1.01] transform transition flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-white/60">¿No tienes cuenta? <a href="#" className="text-amber-300 font-medium">Crear cuenta</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
