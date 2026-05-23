'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, getUser, normalizeList } from '../../lib/api'

type OrderItem = {
  id: number
  order_number?: string
  title?: string
  status?: string
  payment_status?: string
  total_amount?: number
  amount?: number
  user_id?: number
  user?: {
    name?: string
    email?: string
  }
  service?: {
    title?: string
    name?: string
  }
  package?: {
    name?: string
    tier?: string
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    setLoading(true)

    try {
      const user = getUser()

      if (user?.role !== 'admin') {
        setMsg('Admin login required.')
        setLoading(false)
        return
      }

      const res = await api('/admin/orders')
      setOrders(normalizeList(res, 'orders'))
      setMsg('')
    } catch (err: any) {
      setMsg(err.message || 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function updateStatus(orderId: number, status: string) {
    try {
      await api(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      )

      setMsg('Order status updated.')
    } catch (err: any) {
      setMsg(err.message || 'Status update failed.')
    }
  }

  function money(value?: number) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 30 }}>
          <span className="badge badge-dark">Admin Panel</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            Manage orders, services and packages
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
            Review student requests, manage services and packages, update order
            status, and upload completed files.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 18,
            marginBottom: 28,
          }}
        >
          <AdminActionCard
            title="Manage Services"
            text="Add, update, activate or delete services."
            href="/admin/services"
            icon="🎓"
          />

          <AdminActionCard
            title="Manage Packages"
            text="Edit Basic, Standard and Express packages."
            href="/admin/packages"
            icon="💼"
          />

          <AdminActionCard
            title="Public Services"
            text="Check the public services page."
            href="/services"
            icon="🌐"
          />

          <AdminActionCard
            title="Public Packages"
            text="Check package pricing cards."
            href="/packages"
            icon="💳"
          />
        </div>

        <section className="brand-card" style={{ padding: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <span className="badge">Orders</span>

              <h2
                style={{
                  margin: '12px 0 0',
                  color: '#06172f',
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                Student Requests
              </h2>
            </div>

            <button onClick={loadOrders} className="btn-blue" type="button">
              Refresh
            </button>
          </div>

          {loading && <p>Loading orders...</p>}

          {msg && (
            <div
              style={{
                borderRadius: 16,
                padding: 16,
                background: '#f8fbff',
                border: '1px solid rgba(20,99,232,0.14)',
                color: '#06172f',
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              {msg}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div
              style={{
                border: '1px dashed rgba(8,31,69,0.18)',
                borderRadius: 22,
                padding: 28,
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 800,
              }}
            >
              No orders found yet.
            </div>
          )}

          {orders.length > 0 && (
            <div className="table-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Student</th>
                    <th>Service</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.order_number || order.id}</strong>
                        <br />
                        <span style={{ color: '#64748b' }}>
                          {order.title || 'Untitled request'}
                        </span>
                      </td>

                      <td>
                        {order.user?.name || `User #${order.user_id || 'N/A'}`}
                        <br />
                        <span style={{ color: '#64748b' }}>
                          {order.user?.email || ''}
                        </span>
                      </td>

                      <td>{order.service?.title || order.service?.name || 'N/A'}</td>

                      <td>{order.package?.name || order.package?.tier || 'N/A'}</td>

                      <td>{money(order.total_amount || order.amount)}</td>

                      <td>{order.payment_status || 'unpaid'}</td>

                      <td>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          className="input-ui"
                          style={{
                            minWidth: 150,
                            padding: '10px 12px',
                            borderRadius: 14,
                          }}
                        >
                          <option value="pending">pending</option>
                          <option value="accepted">accepted</option>
                          <option value="in_progress">in_progress</option>
                          <option value="need_more_info">need_more_info</option>
                          <option value="completed">completed</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>

                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="btn-main"
                          style={{
                            minHeight: 42,
                            padding: '9px 15px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function AdminActionCard({
  title,
  text,
  href,
  icon,
}: {
  title: string
  text: string
  href: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="brand-card"
      style={{
        padding: 24,
        display: 'block',
        minHeight: 180,
      }}
    >
      <div className="service-icon">{icon}</div>

      <h3
        style={{
          margin: '18px 0 8px',
          color: '#06172f',
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        {title}
      </h3>

      <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>{text}</p>
    </Link>
  )
}