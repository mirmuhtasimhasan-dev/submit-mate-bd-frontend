'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { api, getUser, normalizeList } from '../../../../lib/api'

type OrderItem = {
  id: number
  order_number?: string
  title?: string
  status?: string
  payment_status?: string
  total_amount?: number
  amount?: number
  service?: {
    title?: string
    name?: string
  }
  package?: {
    name?: string
    tier?: string
    price?: number
  }
}

type PaymentItem = {
  id: number
  method?: string
  provider?: string
  amount?: number
  sender_number?: string
  transaction_id?: string
  screenshot_path?: string
  screenshot_url?: string
  status?: string
  admin_note?: string
  created_at?: string
}

const paymentMethods = [
  {
    value: 'bkash',
    label: 'bKash',
    info: 'Send payment through bKash, then submit transaction details.',
  },
  {
    value: 'nagad',
    label: 'Nagad',
    info: 'Send payment through Nagad, then submit transaction details.',
  },
  {
    value: 'rocket',
    label: 'Rocket',
    info: 'Send payment through Rocket, then submit transaction details.',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    info: 'Use this option for bank transfer payment.',
  },
]

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string

  const [order, setOrder] = useState<OrderItem | null>(null)
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [method, setMethod] = useState('bkash')
  const [amount, setAmount] = useState('')
  const [senderNumber, setSenderNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadPage() {
    try {
      setLoading(true)
      setError('')

      const user = getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const orderRes = await api(`/orders/${orderId}`)
      const orderData = orderRes?.data || orderRes?.order || orderRes

      setOrder(orderData)

      const defaultAmount =
        orderData?.total_amount ||
        orderData?.amount ||
        orderData?.package?.price ||
        0

      setAmount(String(defaultAmount))

      const paymentRes = await api(`/orders/${orderId}/payments`)
      setPayments(normalizeList(paymentRes))
    } catch (err: any) {
      setError(err.message || 'Could not load payment page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      loadPage()
    }
  }, [orderId])

  const verifiedAmount = useMemo(() => {
    return payments
      .filter((payment) => payment.status === 'verified')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  }, [payments])

  const pendingAmount = useMemo(() => {
    return payments
      .filter((payment) => payment.status === 'pending')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  }, [payments])

  const hasPendingPayment = useMemo(() => {
    return payments.some((payment) => payment.status === 'pending')
  }, [payments])

  const isPaid = order?.payment_status === 'paid'

  function money(value?: number | string) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  function paymentBadgeStyle(status?: string) {
    if (status === 'paid') {
      return { background: '#dcfce7', color: '#166534' }
    }

    if (status === 'partial') {
      return { background: '#dbeafe', color: '#1e40af' }
    }

    return { background: '#fee2e2', color: '#991b1b' }
  }

  function proofBadgeStyle(status?: string) {
    if (status === 'verified') {
      return { background: '#dcfce7', color: '#166534' }
    }

    if (status === 'rejected' || status === 'failed') {
      return { background: '#fee2e2', color: '#991b1b' }
    }

    return { background: '#fff8e8', color: '#7c5a00' }
  }

  async function submitPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSubmitting(true)
    setError('')
    setMsg('')

    try {
      const cleanSenderNumber = senderNumber.replace(/\D/g, '').slice(0, 11)

      if (!amount || Number(amount) <= 0) {
        throw new Error('Amount is required.')
      }

      if (!cleanSenderNumber) {
        throw new Error('Sender number is required.')
      }

      if (cleanSenderNumber.length !== 11) {
        throw new Error('Sender number must be exactly 11 digits.')
      }

      if (!transactionId.trim()) {
        throw new Error('Transaction ID is required.')
      }

      if (!screenshot) {
        throw new Error('Payment screenshot is required.')
      }

      const formData = new FormData()
      formData.append('method', method)
      formData.append('amount', amount)
      formData.append('sender_number', cleanSenderNumber)
      formData.append('transaction_id', transactionId.trim())
      formData.append('screenshot', screenshot)

      await api(`/orders/${orderId}/payments`, {
        method: 'POST',
        body: formData,
      })

      setSenderNumber('')
      setTransactionId('')
      setScreenshot(null)

      const input = document.getElementById(
        'paymentScreenshot'
      ) as HTMLInputElement | null

      if (input) {
        input.value = ''
      }

      await loadPage()

      setMsg('Payment proof submitted successfully. Waiting for admin verification.')
    } catch (err: any) {
      setError(err.message || 'Payment submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '48px 0' }}>
        <div className="site-container">
          <div className="brand-card" style={{ padding: 28 }}>
            Loading payment page...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 28 }}>
          <span className="badge badge-dark">Manual Payment</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            Submit Payment Proof
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
            Choose bKash, Nagad, Rocket, or bank transfer. Then submit all
            required transaction details for admin verification.
          </p>

          <div style={{ marginTop: 22 }}>
            <Link href="/dashboard" className="btn-outline">
              Back to Dashboard
            </Link>
          </div>
        </section>

        {msg && (
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: '#dcfce7',
              color: '#166534',
              fontWeight: 900,
              marginBottom: 20,
            }}
          >
            {msg}
          </div>
        )}

        {error && (
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: '#fee2e2',
              color: '#991b1b',
              fontWeight: 900,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <section className="brand-card" style={{ padding: 28, marginBottom: 22 }}>
          <span className="badge">Order Summary</span>

          <h2
            style={{
              margin: '14px 0 8px',
              color: '#06172f',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            #{order?.order_number || order?.id} - {order?.title || 'Untitled'}
          </h2>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            Service: {order?.service?.title || order?.service?.name || 'N/A'} •
            Package: {order?.package?.name || order?.package?.tier || 'N/A'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              marginTop: 22,
            }}
          >
            <InfoBox
              label="Total Amount"
              value={money(order?.total_amount || order?.amount)}
            />
            <InfoBox label="Verified" value={money(verifiedAmount)} />
            <InfoBox label="Pending" value={money(pendingAmount)} />
          </div>

          <div style={{ marginTop: 18 }}>
            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '9px 13px',
                fontWeight: 900,
                fontSize: 13,
                ...paymentBadgeStyle(order?.payment_status),
              }}
            >
              Payment: {order?.payment_status || 'unpaid'}
            </span>
          </div>
        </section>

        <section className="brand-card" style={{ padding: 28, marginBottom: 22 }}>
          <span className="badge">Submit Manual Payment</span>

          {isPaid ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                padding: 18,
                background: '#dcfce7',
                color: '#166534',
                fontWeight: 900,
              }}
            >
              This order is already paid. No further payment proof is needed.
            </div>
          ) : hasPendingPayment ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                padding: 18,
                background: '#fff8e8',
                color: '#7c5a00',
                fontWeight: 900,
              }}
            >
              Payment proof already submitted. Please wait for admin verification.
            </div>
          ) : (
            <form onSubmit={submitPayment} style={{ marginTop: 20 }}>
              <p
                style={{
                  margin: '0 0 16px',
                  color: '#64748b',
                  fontWeight: 800,
                }}
              >
                Fields marked with * are required.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                {paymentMethods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMethod(item.value)}
                    style={{
                      textAlign: 'left',
                      borderRadius: 22,
                      padding: 18,
                      border:
                        method === item.value
                          ? '2px solid #1463e8'
                          : '1px solid rgba(8,31,69,0.12)',
                      background: method === item.value ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <strong
                      style={{
                        display: 'block',
                        color: '#06172f',
                        fontSize: 18,
                        fontWeight: 900,
                      }}
                    >
                      {item.label}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        color: '#64748b',
                        lineHeight: 1.6,
                        marginTop: 6,
                        fontWeight: 700,
                      }}
                    >
                      {item.info}
                    </span>
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                <Field label="Amount *" note="Required. Enter the paid amount.">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </Field>

                <Field
                  label="Sender Number *"
                  note="Required. Only numbers allowed. Must be exactly 11 digits."
                >
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    maxLength={11}
                    value={senderNumber}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 11)

                      setSenderNumber(onlyNumbers)
                    }}
                    placeholder="Example: 01700000000"
                    required
                  />
                </Field>

                <Field
                  label="Transaction ID *"
                  note="Required. Enter the transaction ID from your payment app."
                >
                  <input
                    className="input"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    required
                  />
                </Field>

                <Field
                  label="Screenshot *"
                  note="Required. Upload payment screenshot or PDF proof."
                >
                  <input
                    id="paymentScreenshot"
                    className="input"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    required
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="btn-main"
                disabled={submitting}
                style={{ marginTop: 20 }}
              >
                {submitting ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
            </form>
          )}
        </section>

        <section className="brand-card" style={{ padding: 28, marginBottom: 22 }}>
          <span className="badge">Online Payment</span>

          <h3
            style={{
              margin: '14px 0 8px',
              color: '#06172f',
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            Gateway Options
          </h3>

          <p style={{ color: '#64748b', lineHeight: 1.7, fontWeight: 700 }}>
            These are placeholders only. Real gateway API will be added later
            after merchant information is available.
          </p>

          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            <GatewayBox title="SSLCommerz / Card Payment" />
            <GatewayBox title="aamarPay" />
            <GatewayBox title="bKash Gateway" />
          </div>
        </section>

        <section className="brand-card" style={{ padding: 28 }}>
          <span className="badge">Payment History</span>

          <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
            {payments.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>
                No payment proof submitted yet.
              </p>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    borderRadius: 20,
                    border: '1px solid rgba(8,31,69,0.10)',
                    background: '#f8fbff',
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: '#06172f',
                          fontSize: 20,
                          fontWeight: 900,
                        }}
                      >
                        {payment.method || 'manual'} payment, {money(payment.amount)}
                      </h3>

                      <p
                        style={{
                          margin: '8px 0 0',
                          color: '#64748b',
                          lineHeight: 1.7,
                          fontWeight: 700,
                        }}
                      >
                        Sender: {payment.sender_number || 'N/A'} • Transaction
                        ID: {payment.transaction_id || 'N/A'}
                      </p>

                      {payment.admin_note && (
                        <p
                          style={{
                            margin: '8px 0 0',
                            color: '#991b1b',
                            fontWeight: 800,
                          }}
                        >
                          Admin note: {payment.admin_note}
                        </p>
                      )}

                      {payment.screenshot_url && (
                        <a
                          href={payment.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline"
                          style={{
                            marginTop: 12,
                            minHeight: 38,
                            padding: '8px 14px',
                            fontSize: 14,
                          }}
                        >
                          View Screenshot
                        </a>
                      )}
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: 36,
                        borderRadius: 999,
                        padding: '8px 13px',
                        fontWeight: 900,
                        fontSize: 13,
                        ...proofBadgeStyle(payment.status),
                      }}
                    >
                      {payment.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: '1px solid rgba(8,31,69,0.10)',
        background: '#f8fbff',
        padding: 18,
      }}
    >
      <p style={{ margin: 0, color: '#64748b', fontWeight: 800 }}>{label}</p>

      <h3
        style={{
          margin: '8px 0 0',
          color: '#1463e8',
          fontSize: 24,
          fontWeight: 900,
        }}
      >
        {value}
      </h3>
    </div>
  )
}

function GatewayBox({ title }: { title: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(8,31,69,0.10)',
        background: '#f8fbff',
        padding: 16,
      }}
    >
      <strong style={{ color: '#06172f', fontWeight: 900 }}>{title}</strong>

      <span
        style={{
          display: 'inline-flex',
          marginLeft: 10,
          borderRadius: 999,
          padding: '6px 10px',
          background: '#fff8e8',
          color: '#7c5a00',
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        Coming Soon
      </span>
    </div>
  )
}

function Field({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: '#06172f', fontWeight: 900 }}>{label}</span>
      {children}
      {note && (
        <small style={{ color: '#64748b', fontWeight: 700, lineHeight: 1.5 }}>
          {note}
        </small>
      )}
    </label>
  )
}