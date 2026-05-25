'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { api, saveAuth } from '../../lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('student@submitmatebd.test')
  const [password, setPassword] = useState('12345678')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setMsg('Logging in...')

    try {
      const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const token = res?.token || res?.access_token || res?.data?.token
      const user = res?.user || res?.data?.user || res?.data

      if (!token || !user) {
        throw new Error('Login response missing token or user.')
      }

      saveAuth(token, user)

      setMsg('Login successful. Redirecting...')

      setTimeout(() => {
        if (user?.role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }, 500)
    } catch (err: any) {
      setMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '54px 0 20px' }}>
      <div className="site-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 26,
            alignItems: 'center',
          }}
        >
          <section className="dark-card" style={{ padding: 40 }}>
            <span className="badge badge-dark">Welcome Back</span>

            <h1
              style={{
                margin: '18px 0 0',
                color: 'white',
                fontSize: 'clamp(2.2rem, 4vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.08,
              }}
            >
              Login to track your academic support requests
            </h1>

            <p
              style={{
                marginTop: 16,
                color: '#dbeafe',
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 700,
              }}
            >
              Access your dashboard, submit new requests, upload files, and
              check order progress from one place.
            </p>

            <div
              style={{
                display: 'grid',
                gap: 14,
                marginTop: 26,
              }}
            >
              {[
                'Track your request status',
                'Upload and manage files',
                'View selected service and package',
                'Admin can manage services and packages',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#dbeafe',
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      display: 'grid',
                      placeItems: 'center',
                      background: '#ffcf32',
                      color: '#06172f',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="brand-card" style={{ padding: 34 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img
                src="/images/logo.png"
                alt="Submit Mate BD"
                style={{
                  width: 86,
                  height: 86,
                  objectFit: 'contain',
                  margin: '0 auto',
                  borderRadius: 18,
                }}
              />

              <h2
                style={{
                  margin: '16px 0 0',
                  color: '#06172f',
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                Sign in
              </h2>

              <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                Use your student or admin account.
              </p>
            </div>

            <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="label-ui">Email</label>

                <input
                  className="input-ui"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="label-ui">Password</label>

                <input
                  className="input-ui"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                className="btn-main"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: 58,
                  fontSize: 17,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {msg && (
              <div
                style={{
                  marginTop: 18,
                  borderRadius: 16,
                  background: msg.toLowerCase().includes('failed')
                    ? '#fee2e2'
                    : '#f8fbff',
                  border: '1px solid rgba(20,99,232,0.14)',
                  padding: 14,
                  color: msg.toLowerCase().includes('failed')
                    ? '#991b1b'
                    : '#06172f',
                  fontWeight: 800,
                }}
              >
                {msg}
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                display: 'grid',
                gap: 10,
                color: '#64748b',
                fontSize: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: '#f8fbff',
                  border: '1px solid rgba(8,31,69,0.08)',
                }}
              >
                <strong style={{ color: '#06172f' }}>Student Demo:</strong>{' '}
                student@submitmatebd.test / 12345678
              </div>

              <div
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: '#f8fbff',
                  border: '1px solid rgba(8,31,69,0.08)',
                }}
              >
                <strong style={{ color: '#06172f' }}>Admin Demo:</strong>{' '}
                admin@submitmatebd.test / 12345678
              </div>
            </div>

            <p
              style={{
                marginTop: 22,
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              New student?{' '}
              <Link
                href="/register"
                style={{ color: '#1463e8', fontWeight: 900 }}
              >
                Create account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}