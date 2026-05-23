'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { api, setAuth } from '../../lib/api'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function changeField(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg('Creating account...')

    try {
      const res = await api('/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      const token = res?.token || res?.access_token || res?.data?.token
      const user = res?.user || res?.data?.user || res?.data

      if (!token || !user) {
        throw new Error('Registration response missing token or user.')
      }

      setAuth(token, user)

      setMsg('Account created successfully. Redirecting...')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 600)
    } catch (err: any) {
      setMsg(err.message || 'Registration failed.')
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

              <h1
                style={{
                  margin: '16px 0 0',
                  color: '#06172f',
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                Create account
              </h1>

              <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                Create your student dashboard account.
              </p>
            </div>

            <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="label-ui">Full Name</label>
                <input
                  className="input-ui"
                  name="name"
                  value={form.name}
                  onChange={changeField}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="label-ui">Email</label>
                <input
                  className="input-ui"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={changeField}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="label-ui">Password</label>
                <input
                  className="input-ui"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={changeField}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div>
                <label className="label-ui">Confirm Password</label>
                <input
                  className="input-ui"
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={changeField}
                  placeholder="Confirm password"
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
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            {msg && (
              <div
                style={{
                  marginTop: 18,
                  borderRadius: 16,
                  background: '#f8fbff',
                  border: '1px solid rgba(20,99,232,0.14)',
                  padding: 14,
                  color: '#06172f',
                  fontWeight: 800,
                }}
              >
                {msg}
              </div>
            )}

            <p
              style={{
                marginTop: 22,
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#1463e8', fontWeight: 900 }}>
                Login
              </Link>
            </p>
          </section>

          <section className="dark-card" style={{ padding: 40 }}>
            <span className="badge badge-dark">Student Dashboard</span>

            <h2
              style={{
                margin: '18px 0 0',
                color: 'white',
                fontSize: 'clamp(2.2rem, 4vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.08,
              }}
            >
              Start your academic support journey
            </h2>

            <p
              style={{
                marginTop: 16,
                color: '#dbeafe',
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 700,
              }}
            >
              Submit your academic support request, upload files, select your
              package, and track everything from your own dashboard.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 14,
                marginTop: 28,
              }}
            >
              {[
                ['Basic', '48 hours'],
                ['Standard', '1 day'],
                ['Express', '16 hours'],
              ].map(([name, time]) => (
                <div
                  key={name}
                  style={{
                    borderRadius: 22,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: 18,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: '#ffcf32',
                      fontWeight: 900,
                      fontSize: 22,
                    }}
                  >
                    {name}
                  </h3>

                  <p style={{ margin: '6px 0 0', color: '#dbeafe' }}>
                    {time}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}