'use client'

import Link from 'next/link'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useParams } from 'next/navigation'
import {
  api,
  downloadProtectedFile,
  getUser,
  normalizeList,
} from '../../../../lib/api'

type OrderItem = {
  id: number
  order_number?: string
  title?: string
  instructions?: string
  deadline?: string
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
    price?: number
    turnaround_hours?: number
  }
}

type FileItem = {
  id: number
  file_type?: string
  original_name?: string
  name?: string
  file_size?: number
  mime_type?: string
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

export default function AdminOrderDetailsPage() {
  const params = useParams()
  const orderId = String(params?.id || '')

  const [order, setOrder] = useState<OrderItem | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(null)

  async function loadOrder() {
    if (!orderId) return

    setLoading(true)

    try {
      const user = getUser()

      if (user?.role !== 'admin') {
        setMsg('Admin login required.')
        setLoading(false)
        return
      }

      const [orderRes, filesRes, adminOrdersRes, paymentsRes] =
        await Promise.all([
          api(`/orders/${orderId}`),
          api(`/orders/${orderId}/files`),
          api('/admin/orders'),
          api(`/orders/${orderId}/payments`),
        ])

      const orderFromShow = orderRes?.data || orderRes?.order || orderRes

      const adminOrders = normalizeList(adminOrdersRes, 'orders')
      const orderFromList = adminOrders.find(
        (item: OrderItem) => String(item.id) === String(orderId)
      )

      setOrder({
        ...(orderFromShow || {}),
        ...(orderFromList || {}),
      })

      setFiles(normalizeList(filesRes, 'files'))
      setPayments(normalizeList(paymentsRes))
      setMsg('')
    } catch (err: any) {
      setMsg(err.message || 'Could not load order details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

  function money(value?: number) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  function fileSize(size?: number) {
    const value = Number(size || 0)

    if (!value) return 'Unknown size'
    if (value < 1024) return `${value} B`
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`

    return `${(value / (1024 * 1024)).toFixed(1)} MB`
  }

  function handleDeliveryFiles(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])

    setDeliveryFiles((prev) => {
      const merged = [...prev, ...selected]

      return merged.filter(
        (file, index, arr) =>
          index ===
          arr.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          )
      )
    })

    e.target.value = ''
  }

  async function downloadFile(file: FileItem) {
    setMsg('Downloading file...')

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

  async function updateStatus(status: string) {
    if (!order) return

    setMsg('Updating status...')

    try {
      const res = await api(`/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })

      const updatedOrder = res?.data || { ...order, status }

      setOrder((prev) => ({
        ...(prev || {}),
        ...updatedOrder,
        status,
      }))

      setMsg('Order status updated.')
    } catch (err: any) {
      setMsg(err.message || 'Status update failed.')
    }
  }

  async function verifyPayment(paymentId: number, status: string) {
    setUpdatingPaymentId(paymentId)
    setMsg('Updating payment status...')

    try {
      await api(`/admin/payments/${paymentId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          admin_note:
            status === 'verified'
              ? 'Payment verified by admin.'
              : 'Payment rejected by admin.',
        }),
      })

      setMsg(
        status === 'verified'
          ? 'Payment verified successfully.'
          : 'Payment rejected successfully.'
      )

      await loadOrder()
    } catch (err: any) {
      setMsg(err.message || 'Payment status update failed.')
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  async function uploadDeliveryFiles() {
    if (!order) return

    if (deliveryFiles.length === 0) {
      setMsg('Please select at least one delivery file.')
      return
    }

    setUploading(true)
    setMsg('Uploading delivery files...')

    try {
      for (let i = 0; i < deliveryFiles.length; i++) {
        const fd = new FormData()
        fd.append('file', deliveryFiles[i])

        setMsg(`Uploading file ${i + 1} of ${deliveryFiles.length}...`)

        await api(`/admin/orders/${order.id}/upload-final-file`, {
          method: 'POST',
          body: fd,
        })
      }

      setDeliveryFiles([])
      setMsg('Delivery files uploaded successfully.')
      await loadOrder()
    } catch (err: any) {
      setMsg(err.message || 'Delivery file upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const studentFiles = files.filter(
    (file) => file.file_type === 'student_upload' || !file.file_type
  )

  const completedFiles = files.filter(
    (file) => file.file_type === 'final_delivery'
  )

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 30 }}>
          <span className="badge badge-dark">Order Details</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            #{order?.order_number || order?.id || orderId}
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
            Review the request, download student files, verify payment proof,
            update status, and upload completed files.
          </p>

          <div
            style={{
              marginTop: 22,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/admin" className="btn-outline">
              Back to Admin
            </Link>

            <button type="button" onClick={loadOrder} className="btn-main">
              Refresh
            </button>
          </div>
        </section>

        {loading && (
          <div className="brand-card" style={{ padding: 28 }}>
            Loading order details...
          </div>
        )}

        {msg && (
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: '#f8fbff',
              border: '1px solid rgba(20,99,232,0.14)',
              color: '#06172f',
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {msg}
          </div>
        )}

        {!loading && !order && (
          <div
            className="brand-card"
            style={{ padding: 30, textAlign: 'center' }}
          >
            Order not found.
          </div>
        )}

        {order && (
          <div style={{ display: 'grid', gap: 24 }}>
            <section
              className="brand-card"
              style={{
                padding: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 20,
              }}
            >
              <InfoBlock label="Title" value={order.title || 'Untitled request'} />

              <InfoBlock
                label="Student"
                value={order.user?.name || `User #${order.user_id || 'N/A'}`}
              />

              <InfoBlock label="Email" value={order.user?.email || 'N/A'} />

              <InfoBlock
                label="Service"
                value={order.service?.title || order.service?.name || 'N/A'}
              />

              <InfoBlock
                label="Package"
                value={order.package?.name || order.package?.tier || 'N/A'}
              />

              <InfoBlock
                label="Amount"
                value={money(order.total_amount || order.amount)}
              />

              <InfoBlock
                label="Payment"
                value={order.payment_status || 'unpaid'}
              />

              <InfoBlock label="Deadline" value={order.deadline || 'N/A'} />

              <div>
                <label className="label-ui">Status</label>

                <select
                  className="input-ui"
                  value={order.status || 'pending'}
                  onChange={(e) => updateStatus(e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="in_progress">in_progress</option>
                  <option value="need_more_info">need_more_info</option>
                  <option value="completed">completed</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </section>

            <section className="brand-card" style={{ padding: 28 }}>
              <span className="badge">Payment Proof</span>

              <h2
                style={{
                  margin: '14px 0 8px',
                  color: '#06172f',
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                Manual payment submissions
              </h2>

              <p
                style={{
                  margin: '0 0 18px',
                  color: '#64748b',
                  lineHeight: 1.7,
                }}
              >
                Check submitted payment proof. Verify only after matching the
                amount, sender number, transaction ID, and screenshot.
              </p>

              <div style={{ display: 'grid', gap: 14 }}>
                {payments.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 20,
                      border: '1px dashed rgba(8,31,69,0.18)',
                      padding: 24,
                      textAlign: 'center',
                      color: '#64748b',
                      fontWeight: 800,
                    }}
                  >
                    No payment proof submitted yet.
                  </div>
                ) : (
                  payments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      money={money}
                      updatingPaymentId={updatingPaymentId}
                      onVerify={() => verifyPayment(payment.id, 'verified')}
                      onReject={() => verifyPayment(payment.id, 'rejected')}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="brand-card" style={{ padding: 28 }}>
              <span className="badge">Requirements</span>

              <div
                style={{
                  marginTop: 16,
                  borderRadius: 20,
                  background: '#f8fbff',
                  border: '1px solid rgba(8,31,69,0.08)',
                  padding: 20,
                  color: '#334155',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {order.instructions || 'No requirements provided.'}
              </div>
            </section>

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
              }}
            >
              <FilePanel
                title="Student Files"
                emptyText="No student files found."
                files={studentFiles}
                fileSize={fileSize}
                onDownload={downloadFile}
              />

              <FilePanel
                title="Completed Files"
                emptyText="No completed files uploaded yet."
                files={completedFiles}
                fileSize={fileSize}
                onDownload={downloadFile}
              />
            </section>

            <section className="brand-card" style={{ padding: 28 }}>
              <span className="badge">Upload Completed Files</span>

              <h2
                style={{
                  margin: '14px 0 8px',
                  color: '#06172f',
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                Upload files for student
              </h2>

              <p
                style={{
                  margin: '0 0 18px',
                  color: '#64748b',
                  lineHeight: 1.7,
                }}
              >
                Upload one or multiple completed files. The student can download
                them from the dashboard.
              </p>

              <label
                style={{
                  display: 'block',
                  border: '2px dashed rgba(20,99,232,0.25)',
                  borderRadius: 22,
                  background: 'linear-gradient(180deg,#f8fbff,#eef6ff)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleDeliveryFiles}
                  style={{ display: 'none' }}
                />

                <div style={{ fontSize: 38 }}>📦</div>

                <div
                  style={{
                    marginTop: 10,
                    fontWeight: 900,
                    color: '#06172f',
                    fontSize: 18,
                  }}
                >
                  Click to select files
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: '#64748b',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  PDF, DOCX, PPTX, XLSX, images, ZIP
                </div>
              </label>

              {deliveryFiles.length > 0 && (
                <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
                  {deliveryFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      style={{
                        borderRadius: 16,
                        border: '1px solid rgba(8,31,69,0.10)',
                        background: '#fff',
                        padding: 14,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            color: '#06172f',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {file.name}
                        </strong>

                        <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                          {fileSize(file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setDeliveryFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        style={{
                          border: 'none',
                          borderRadius: 12,
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          fontWeight: 900,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={uploadDeliveryFiles}
                  disabled={uploading}
                  className="btn-main"
                  style={{ opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryFiles([])}
                  className="btn-outline"
                >
                  Clear Selected
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function InfoBlock({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          color: '#64748b',
          fontSize: 13,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: '6px 0 0',
          color: '#06172f',
          fontWeight: 900,
          lineHeight: 1.5,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function PaymentCard({
  payment,
  money,
  updatingPaymentId,
  onVerify,
  onReject,
}: {
  payment: PaymentItem
  money: (value?: number) => string
  updatingPaymentId: number | null
  onVerify: () => void
  onReject: () => void
}) {
  const isUpdating = updatingPaymentId === payment.id
  const isPending = payment.status === 'pending'

  function badgeStyle(status?: string) {
    if (status === 'verified') {
      return { background: '#dcfce7', color: '#166534' }
    }

    if (status === 'rejected' || status === 'failed') {
      return { background: '#fee2e2', color: '#991b1b' }
    }

    return { background: '#fff8e8', color: '#7c5a00' }
  }

  return (
    <div
      style={{
        borderRadius: 22,
        border: '1px solid rgba(8,31,69,0.10)',
        background: '#f8fbff',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
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
              lineHeight: 1.8,
              fontWeight: 700,
            }}
          >
            Sender Number: {payment.sender_number || 'N/A'}
            <br />
            Transaction ID: {payment.transaction_id || 'N/A'}
            <br />
            Provider: {payment.provider || 'manual'}
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
            ...badgeStyle(payment.status),
          }}
        >
          {payment.status || 'pending'}
        </span>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {payment.screenshot_url ? (
          <a
            href={payment.screenshot_url}
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
            style={{
              minHeight: 40,
              padding: '8px 14px',
              fontSize: 14,
            }}
          >
            View Screenshot
          </a>
        ) : (
          <span
            style={{
              borderRadius: 12,
              padding: '9px 12px',
              background: '#fee2e2',
              color: '#991b1b',
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            No screenshot
          </span>
        )}

        {isPending && (
          <>
            <button
              type="button"
              onClick={onVerify}
              disabled={isUpdating}
              className="btn-main"
              style={{
                minHeight: 40,
                padding: '8px 14px',
                fontSize: 14,
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              {isUpdating ? 'Updating...' : 'Verify Payment'}
            </button>

            <button
              type="button"
              onClick={onReject}
              disabled={isUpdating}
              style={{
                minHeight: 40,
                border: 'none',
                borderRadius: 999,
                padding: '8px 14px',
                background: '#fee2e2',
                color: '#991b1b',
                fontWeight: 900,
                cursor: isUpdating ? 'not-allowed' : 'pointer',
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function FilePanel({
  title,
  emptyText,
  files,
  fileSize,
  onDownload,
}: {
  title: string
  emptyText: string
  files: FileItem[]
  fileSize: (size?: number) => string
  onDownload: (file: FileItem) => void
}) {
  return (
    <section className="brand-card" style={{ padding: 28 }}>
      <span className="badge">{title}</span>

      <div style={{ marginTop: 18 }}>
        {files.length === 0 ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px dashed rgba(8,31,69,0.18)',
              padding: 24,
              textAlign: 'center',
              color: '#64748b',
              fontWeight: 800,
            }}
          >
            {emptyText}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(8,31,69,0.10)',
                  background: '#f8fbff',
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong
                    style={{
                      color: '#06172f',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.original_name || file.name || 'File'}
                  </strong>

                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                    {file.file_type || 'file'} • {fileSize(file.file_size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDownload(file)}
                  className="btn-blue"
                  style={{
                    minHeight: 42,
                    padding: '9px 14px',
                    flexShrink: 0,
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}