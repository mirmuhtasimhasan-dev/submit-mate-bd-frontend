'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  api,
  downloadProtectedFile,
  getUser,
  logout,
  normalizeList,
} from '../../lib/api'

type OrderItem = {
  id: number
  order_number?: string
  title?: string
  status?: string
  payment_status?: string
  total_amount?: number
  amount?: number
  deadline?: string
  service?: {
    title?: string
    name?: string
  }
  package?: {
    name?: string
    tier?: string
    price?: number
    turnaround_hours?: number
  }
}

type FileItem = {
  id: number
  original_name?: string
  name?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    try {
      const currentUser = getUser()
      setUser(currentUser)

      if (!currentUser) {
        setMsg('Please login first.')
        setLoading(false)
        return
      }

      const res = await api('/my-orders')
      setOrders(normalizeList(res, 'orders'))
    } catch (err: any) {
      setMsg(err.message || 'Could not load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === 'pending').length
    const progress = orders.filter((o) =>
      ['accepted', 'in_progress', 'need_more_info'].includes(o.status || '')
    ).length
    const completed = orders.filter((o) =>
      ['completed', 'delivered'].includes(o.status || '')
    ).length

    return { total, pending, progress, completed }
  }, [orders])

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="badge badge-dark">Student Dashboard</span>

              <h1
                style={{
                  margin: '18px 0 0',
                  color: 'white',
                  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                }}
              >
                Welcome, {user?.name || 'Student'}
              </h1>

              <p
                style={{
                  marginTop: 14,
                  color: '#dbeafe',
                  fontSize: 17,
                  lineHeight: 1.8,
                  maxWidth: 850,
                }}
              >
                Submit new requests, track current orders, make payments, and
                download support files when available.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/order" className="btn-main">
                New Request
              </Link>

              <button type="button" onClick={logout} className="btn-outline">
                Logout
              </button>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 18,
            marginBottom: 28,
          }}
        >
          <StatCard title="Total Requests" value={stats.total} icon="📌" />
          <StatCard title="Pending" value={stats.pending} icon="⏳" />
          <StatCard title="In Progress" value={stats.progress} icon="⚡" />
          <StatCard title="Completed" value={stats.completed} icon="✅" />
        </div>

        {msg && (
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: '#fff7ed',
              color: '#b45309',
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {msg}
          </div>
        )}

        <section className="brand-card" style={{ padding: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <div>
              <span className="badge">My Requests</span>

              <h2
                style={{
                  margin: '12px 0 0',
                  color: '#06172f',
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                Recent Orders
              </h2>
            </div>

            <button onClick={loadOrders} className="btn-blue" type="button">
              Refresh
            </button>
          </div>

          {loading && <p>Loading your requests...</p>}

          {!loading && orders.length === 0 && (
            <div
              style={{
                border: '1px dashed rgba(8,31,69,0.18)',
                borderRadius: 24,
                padding: 32,
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#06172f',
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                No request submitted yet
              </h3>

              <p style={{ color: '#64748b', marginTop: 10 }}>
                Start by choosing a service and submitting your support request.
              </p>

              <Link href="/order" className="btn-main" style={{ marginTop: 18 }}>
                Submit First Request
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gap: 16 }}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: string
}) {
  return (
    <div className="brand-card" style={{ padding: 22 }}>
      <div className="service-icon">{icon}</div>

      <h3
        style={{
          margin: '16px 0 0',
          color: '#1463e8',
          fontSize: 34,
          fontWeight: 900,
        }}
      >
        {value}
      </h3>

      <p
        style={{
          margin: '4px 0 0',
          color: '#64748b',
          fontWeight: 800,
        }}
      >
        {title}
      </p>
    </div>
  )
}

function OrderCard({ order }: { order: OrderItem }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api(`/orders/${order.id}/files`)
      .then((res) => setFiles(normalizeList(res, 'files')))
      .catch(() => {
        setFiles([])
      })
  }, [order.id])

  function money(value?: number) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  function statusStyle(status?: string) {
    if (status === 'delivered' || status === 'completed') {
      return {
        background: '#dcfce7',
        color: '#166534',
      }
    }

    if (status === 'in_progress' || status === 'accepted') {
      return {
        background: '#dbeafe',
        color: '#1e40af',
      }
    }

    if (status === 'cancelled') {
      return {
        background: '#fee2e2',
        color: '#991b1b',
      }
    }

    return {
      background: '#fff8e8',
      color: '#7c5a00',
    }
  }

  function paymentStyle(status?: string) {
    if (status === 'paid') {
      return {
        background: '#dcfce7',
        color: '#166534',
      }
    }

    if (status === 'partial') {
      return {
        background: '#dbeafe',
        color: '#1e40af',
      }
    }

    return {
      background: '#fee2e2',
      color: '#991b1b',
    }
  }

  async function download(file: FileItem) {
    setMsg('Downloading...')

    try {
      await downloadProtectedFile(
        `/order-files/${file.id}/download`,
        file.original_name || file.name || 'submitmate-file'
      )

      setMsg('')
    } catch (err: any) {
      setMsg(err.message || 'Download failed.')
    }
  }

  const paymentStatus = order.payment_status || 'unpaid'
  const orderAmount = order.total_amount || order.amount || 0
  const showPayButton = paymentStatus !== 'paid'

  return (
    <div
      style={{
        borderRadius: 24,
        border: '1px solid rgba(8,31,69,0.10)',
        background: '#f8fbff',
        padding: 22,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 460px' }}>
          <h3
            style={{
              margin: 0,
              color: '#06172f',
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            #{order.order_number || order.id} - {order.title || 'Untitled'}
          </h3>

          <p
            style={{
              margin: '8px 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            Service: {order.service?.title || order.service?.name || 'N/A'} •
            Package: {order.package?.name || order.package?.tier || 'N/A'} •
            Deadline: {order.deadline || 'N/A'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '9px 13px',
                fontWeight: 900,
                fontSize: 13,
                ...statusStyle(order.status),
              }}
            >
              {order.status || 'pending'}
            </span>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '9px 13px',
                fontWeight: 900,
                fontSize: 13,
                ...paymentStyle(paymentStatus),
              }}
            >
              Payment: {paymentStatus}
            </span>
          </div>

          <p
            style={{
              margin: '10px 0 0',
              color: '#1463e8',
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            {money(orderAmount)}
          </p>

          {showPayButton && (
            <Link
              href={`/orders/${order.id}/payment`}
              className="btn-main"
              style={{
                marginTop: 10,
                minHeight: 40,
                padding: '9px 16px',
                fontSize: 14,
              }}
            >
              {paymentStatus === 'partial' ? 'Update Payment' : 'Pay Now'}
            </Link>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(8,31,69,0.08)',
        }}
      >
        <p
          style={{
            margin: '0 0 10px',
            color: '#06172f',
            fontWeight: 900,
          }}
        >
          Files
        </p>

        {files.length === 0 ? (
          <p style={{ margin: 0, color: '#64748b' }}>
            No files available yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => download(file)}
                className="btn-outline"
                style={{
                  minHeight: 40,
                  padding: '8px 14px',
                  fontSize: 14,
                }}
              >
                {file.original_name || file.name || 'Download file'}
              </button>
            ))}
          </div>
        )}

        {msg && (
          <p style={{ margin: '10px 0 0', color: '#1463e8', fontWeight: 800 }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}