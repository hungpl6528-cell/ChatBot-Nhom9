import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Input } from '../components/ui/index'
import { Button } from '../components/ui/Button'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ten: '', email: '', mat_khau: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.mat_khau !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (form.mat_khau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/users/register', {
        ten: form.ten,
        email: form.email,
        mat_khau: form.mat_khau,
      })
      // Auto login after register
      const res = await api.post('/users/login', { email: form.email, mat_khau: form.mat_khau })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('user_name', res.data.user.ten)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể đăng ký. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-brand-500/30 mb-4">
            N9
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Tạo Tài Khoản</h1>
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
              id="register-name"
              label="Họ và tên *"
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.ten}
              onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
              required
            />
            <Input
              id="register-email"
              label="Email *"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            <Input
              id="register-password"
              label="Mật khẩu *"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={form.mat_khau}
              onChange={e => setForm(f => ({ ...f, mat_khau: e.target.value }))}
              required
              autoComplete="new-password"
            />
            <Input
              id="register-confirm"
              label="Xác nhận mật khẩu *"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              required
              error={form.confirm && form.mat_khau !== form.confirm ? 'Mật khẩu không khớp' : undefined}
            />

            <Button
              id="register-submit"
              type="submit"
              loading={loading}
              className="w-full"
            >
              Đăng Ký
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
