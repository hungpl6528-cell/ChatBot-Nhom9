import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Input } from '../components/ui/index'
import { Button } from '../components/ui/Button'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', mat_khau: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/users/login', form)
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('user_name', res.data.user.ten)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    // Allow guest access without login
    localStorage.setItem('user_name', 'Khách')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-brand-500/30 mb-4">
            N9
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Đăng Nhập</h1>
          <p className="text-slate-500 text-sm mt-1">ChatBot Học Tập — Nhóm 9</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            <Input
              id="login-password"
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={form.mat_khau}
              onChange={e => setForm(f => ({ ...f, mat_khau: e.target.value }))}
              required
              autoComplete="current-password"
            />

            <Button
              id="login-submit"
              type="submit"
              loading={loading}
              className="w-full"
            >
              Đăng Nhập
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-600">
              <span className="bg-surface-card px-3">hoặc</span>
            </div>
          </div>

          <button
            id="guest-login"
            onClick={handleGuestLogin}
            className="w-full py-2.5 rounded-xl border border-surface-border text-slate-400 hover:text-slate-200 hover:border-brand-500/40 transition-all text-sm font-medium"
          >
            👋 Tiếp tục với tư cách Khách
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
