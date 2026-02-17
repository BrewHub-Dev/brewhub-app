"use client"

import React, { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useLogin } from '../api';

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useLogin()

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    try {
      await mutation.mutateAsync({ emailAddress: email, password })
    } catch (err) {
      // El error ya está manejado en el hook useLogin con el toast
      console.error('Login error:', err)
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
        <div className="rounded-3xl p-8 border border-border/20 bg-muted/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(2,6,23,0.6)] transition-transform transform">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/25 to-rose-400/15 border border-border/20 mb-6">
              <img src="/images/Subject.png" alt="BrewHub Logo" width={140} height={140} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Bienvenido</h1>
            <p className="mt-2 text-white/75 text-sm">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-white/90">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/3 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 bg-white/5 backdrop-blur-sm border border-white/8 text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:border-primary transition-all"
                  aria-label="Correo electrónico"
                  required
                />
                <p className="text-xs text-white/50 mt-1">Usa el correo con el que te registraste en BrewHub.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-white/90">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 bg-white/5 backdrop-blur-sm border border-white/8 text-white placeholder:text-white/50 pr-12 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:border-primary transition-all"
                  aria-label="Contraseña"
                  required
                />
                <button type="button" aria-label="Mostrar contraseña" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a href="/not-found" className="text-sm text-primary hover:underline">¿Olvidaste la contraseña?</a>
            </div>

            <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl shadow-2xl hover:scale-[1.01] transform transition flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">¿No tienes cuenta? <a href="/not-found" className="text-primary font-medium">Crear cuenta</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
