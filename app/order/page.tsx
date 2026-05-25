'use client'

import { api, normalizeList } from '../../lib/api'
import { useEffect, useMemo, useState } from 'react'

type ServiceItem = {
  id: number
  title?: string
  name?: string
  description?: string
  icon?: string
}

type PackageItem = {
  id: number
  service_id?: number
  tier?: 'basic' | 'standard' | 'express' | string
  name?: string
  package_name?: string
  description?: string
  price?: number | string
  turnaround_hours?: number
  delivery_days?: number
  features?: string[]
}

const tierInfo: Record<
  string,
  {
    label: string
    delivery: string
    badge: string
    accent: string
    bg: string
    order: number
  }
> = {
  basic: {
    label: 'Basic',
    delivery: '48 hours',
    badge: 'Regular Support',
    accent: '#1463e8',
    bg: 'rgba(20,99,232,0.08)',
    order: 1,
  },
  standard: {
    label: 'Standard',
    delivery: '1 day',
    badge: 'Best Value',
    accent: '#f6b800',
    bg: 'rgba(246,184,0,0.14)',
    order: 2,
  },
  express: {
    label: 'Express',
    delivery: '16 hours',
    badge: 'Urgent Support',
    accent: '#06172f',
    bg: 'rgba(6,23,47,0.08)',
    order: 3,
  },
}

export default function OrderPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [form, setForm] = useState({
    service_id: '',
    package_id: '',
    title: '',
    instructions: '',
    deadline: '',
  })

  useEffect(() => {
    Promise.all([api('/services'), api('/packages')])
      .then(([serviceRes, packageRes]) => {
        const serviceList = normalizeList(serviceRes, 'services')
        const packageList = normalizeList(packageRes, 'packages')

        setServices(serviceList)
        setPackages(packageList)

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const serviceParam = params.get('service')
          const packageParam = params.get('package')

          let finalServiceId = serviceParam || ''

          if (packageParam) {
            const selectedPkg = packageList.find(
              (p: PackageItem) => String(p.id) === String(packageParam)
            )

            if (selectedPkg?.service_id) {
              finalServiceId = String(selectedPkg.service_id)
            }
          }

          setForm((prev) => ({
            ...prev,
            service_id: finalServiceId,
            package_id: packageParam || '',
          }))
        }
      })
      .catch((err) => {
        setMsg(err.message || 'Could not load services/packages.')
      })
      .finally(() => setDataLoading(false))
  }, [])

  const selectedService = services.find(
    (service) => String(service.id) === String(form.service_id)
  )

  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => String(pkg.service_id) === String(form.service_id))
      .sort((a, b) => {
        const aTier = a.tier || 'basic'
        const bTier = b.tier || 'basic'

        return (tierInfo[aTier]?.order || 99) - (tierInfo[bTier]?.order || 99)
      })
  }, [packages, form.service_id])

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === String(form.package_id)
  )

  function changeField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target

    if (name === 'service_id') {
      setForm((prev) => ({
        ...prev,
        service_id: value,
        package_id: '',
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function selectPackage(pkg: PackageItem) {
    setForm((prev) => ({
      ...prev,
      package_id: String(pkg.id),
    }))
  }

  function money(value?: number | string) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  function turnaroundText(pkg?: PackageItem) {
    if (!pkg) return 'Custom'

    if (pkg.turnaround_hours === 48) return '48 hours'
    if (pkg.turnaround_hours === 24) return '1 day'
    if (pkg.turnaround_hours === 16) return '16 hours'
    if (pkg.turnaround_hours) return `${pkg.turnaround_hours} hours`

    if (pkg.delivery_days === 1) return '1 day'
    if (pkg.delivery_days) return `${pkg.delivery_days} days`

    const tier = pkg.tier || 'basic'
    return tierInfo[tier]?.delivery || 'Custom'
  }

  function packageName(pkg?: PackageItem) {
    if (!pkg) return ''
    const tier = pkg.tier || 'basic'
    return tierInfo[tier]?.label || pkg.name || pkg.package_name || 'Package'
  }

  function serviceName(service?: ServiceItem) {
    return service?.title || service?.name || 'Academic Support'
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])

    setFiles((prev) => {
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

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function fileSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.service_id) {
      setMsg('Please choose a service.')
      return
    }

    if (!form.package_id) {
      setMsg('Please choose Basic, Standard, or Express package.')
      return
    }

    if (!form.title.trim()) {
      setMsg('Please enter a topic/title.')
      return
    }

    setLoading(true)
    setMsg('Submitting request...')

    try {
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          service_id: Number(form.service_id),
          package_id: Number(form.package_id),
          title: form.title,
          instructions: form.instructions,
          deadline: form.deadline || null,
        }),
      })

      const orderId = res?.data?.id || res?.order?.id || res?.id

      if (!orderId) {
        throw new Error('Order created but order ID not found.')
      }

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const fd = new FormData()
          fd.append('file', files[i])

          setMsg(`Uploading file ${i + 1} of ${files.length}...`)

          await api(`/orders/${orderId}/upload-file`, {
            method: 'POST',
            body: fd,
          })
        }
      }

      setMsg('Request submitted successfully! Redirecting to dashboard...')

      setTimeout(() => {
        location.href = '/dashboard'
      }, 900)
    } catch (err: any) {
      setMsg(err?.message || 'Order failed. Please login and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="order-page" style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 30 }}>
          <span className="badge badge-dark">Submit Support Request</span>

          <h1
            style={{
              margin: '18px 0 0',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              lineHeight: 1.08,
              fontWeight: 900,
              color: 'white',
            }}
          >
            Submit your academic support request
          </h1>

          <p
            style={{
              marginTop: 14,
              maxWidth: 850,
              color: '#dbeafe',
              fontSize: 17,
              lineHeight: 1.8,
            }}
          >
            Choose your service, select a package, upload your files, and
            explain your requirements clearly. Basic delivers within 48 hours,
            Standard within 1 day, and Express within 16 hours.
          </p>
        </section>

        <form onSubmit={submit} className="brand-card order-form" style={{ padding: 34 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
            <div>
              <label className="label-ui">Service</label>

              <select
                name="service_id"
                value={form.service_id}
                onChange={changeField}
                className="input-ui"
                style={{
                  minHeight: 56,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                <option value="">Choose a service</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {serviceName(service)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-ui">Selected Service</label>

              <div
                style={{
                  minHeight: 56,
                  borderRadius: 18,
                  border: '1px solid rgba(8,31,69,0.10)',
                  background: '#f8fbff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  color: selectedService ? '#06172f' : '#94a3b8',
                  fontWeight: 800,
                }}
              >
                {selectedService
                  ? serviceName(selectedService)
                  : 'No service selected'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-between',
                gap: 18,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <div>
                <label className="label-ui">Choose Package</label>

                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    lineHeight: 1.7,
                  }}
                >
                  Select one package based on your deadline and support needs.
                </p>
              </div>

              {selectedPackage && (
                <div
                  style={{
                    borderRadius: 999,
                    padding: '10px 14px',
                    background: '#eff6ff',
                    color: '#1463e8',
                    fontWeight: 900,
                  }}
                >
                  Selected: {packageName(selectedPackage)} •{' '}
                  {turnaroundText(selectedPackage)}
                </div>
              )}
            </div>

            {dataLoading && (
              <div
                className="brand-card"
                style={{ padding: 24, boxShadow: 'none' }}
              >
                Loading services and packages...
              </div>
            )}

            {!form.service_id && !dataLoading && (
              <div
                style={{
                  borderRadius: 24,
                  border: '1px dashed rgba(8,31,69,0.18)',
                  background: '#f8fbff',
                  padding: 26,
                  textAlign: 'center',
                  color: '#64748b',
                  fontWeight: 800,
                }}
              >
                Choose a service first to see Basic, Standard and Express
                packages.
              </div>
            )}

            {form.service_id && filteredPackages.length === 0 && !dataLoading && (
              <div
                style={{
                  borderRadius: 24,
                  border: '1px dashed rgba(8,31,69,0.18)',
                  background: '#fff7ed',
                  padding: 26,
                  textAlign: 'center',
                  color: '#b45309',
                  fontWeight: 800,
                }}
              >
                No package found for this service. Please run package seeder or
                add packages from admin panel.
              </div>
            )}

            {filteredPackages.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 18,
                }}
              >
                {filteredPackages.map((pkg) => (
                  <SelectablePackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={String(form.package_id) === String(pkg.id)}
                    onSelect={() => selectPackage(pkg)}
                    money={money}
                    turnaroundText={turnaroundText}
                    packageName={packageName}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
              marginTop: 30,
            }}
          >
            <div>
              <label className="label-ui">Topic / Title</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={changeField}
                className="input-ui"
                placeholder="Example: Research proposal formatting"
                style={{
                  minHeight: 56,
                  fontSize: 16,
                }}
              />
            </div>

            <div>
              <label className="label-ui">Deadline</label>

              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={changeField}
                className="input-ui"
                style={{
                  minHeight: 56,
                  fontSize: 16,
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <label className="label-ui">Instructions</label>

            <textarea
              name="instructions"
              value={form.instructions}
              onChange={changeField}
              className="input-ui"
              placeholder="Write clearly what kind of support you need. Example: formatting help, citation support, presentation design, viva preparation, or research guidance."
              style={{
                minHeight: 170,
                resize: 'vertical',
                fontSize: 16,
                lineHeight: 1.7,
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
              marginTop: 26,
            }}
          >
            <div className="brand-card" style={{ padding: 22, boxShadow: 'none' }}>
              <label className="label-ui">Upload Files</label>

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
                  onChange={handleFiles}
                  style={{ display: 'none' }}
                />

                <div style={{ fontSize: 38 }}>📎</div>

                <div
                  style={{
                    marginTop: 10,
                    fontWeight: 900,
                    color: '#06172f',
                    fontSize: 18,
                  }}
                >
                  Click to upload one or multiple files
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

              {files.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 16,
                        color: '#06172f',
                        fontWeight: 900,
                      }}
                    >
                      Selected Files ({files.length})
                    </h4>

                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="btn-outline"
                      style={{ minHeight: 40, padding: '8px 14px' }}
                    >
                      Clear All
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 14,
                          padding: '14px 16px',
                          borderRadius: 18,
                          border: '1px solid rgba(8,31,69,0.10)',
                          background: '#fff',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: '#06172f',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {file.name}
                          </div>

                          <div
                            style={{
                              color: '#64748b',
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {fileSize(file.size)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            border: 'none',
                            borderRadius: 12,
                            padding: '8px 12px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="brand-card" style={{ padding: 22, boxShadow: 'none' }}>
              <label className="label-ui">Order Summary</label>

              <div
                style={{
                  borderRadius: 22,
                  background:
                    'linear-gradient(135deg, rgba(20,99,232,0.08), rgba(246,184,0,0.10))',
                  border: '1px solid rgba(8,31,69,0.10)',
                  padding: 20,
                }}
              >
                <p style={{ margin: 0, color: '#64748b', fontWeight: 800 }}>
                  Service
                </p>

                <h3
                  style={{
                    margin: '6px 0 16px',
                    color: '#06172f',
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  {selectedService ? serviceName(selectedService) : 'Not selected'}
                </h3>

                <p style={{ margin: 0, color: '#64748b', fontWeight: 800 }}>
                  Package
                </p>

                <h3
                  style={{
                    margin: '6px 0 0',
                    color: '#06172f',
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  {selectedPackage
                    ? packageName(selectedPackage)
                    : 'Not selected'}
                </h3>

                {selectedPackage && (
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        borderRadius: 999,
                        background: '#fff',
                        border: '1px solid rgba(8,31,69,0.10)',
                        padding: '8px 12px',
                        fontWeight: 900,
                        color: '#1463e8',
                      }}
                    >
                      {money(selectedPackage.price)}
                    </span>

                    <span
                      style={{
                        borderRadius: 999,
                        background: '#fff',
                        border: '1px solid rgba(8,31,69,0.10)',
                        padding: '8px 12px',
                        fontWeight: 900,
                        color: '#7c5a00',
                      }}
                    >
                      {turnaroundText(selectedPackage)}
                    </span>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 18,
                  borderRadius: 18,
                  background: '#fff8e8',
                  border: '1px solid rgba(246,184,0,0.22)',
                  padding: 16,
                  color: '#7c5a00',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                We provide academic guidance, formatting support, presentation
                design, citation support, study materials, and mentoring.
                Students are responsible for their own final submission.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              className="btn-main"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: 60,
                fontSize: 18,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

          {msg && (
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                background: '#f8fbff',
                border: '1px solid rgba(20,99,232,0.14)',
                padding: 16,
                color: '#0f172a',
                fontWeight: 700,
              }}
            >
              {msg}
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

function SelectablePackageCard({
  pkg,
  selected,
  onSelect,
  money,
  turnaroundText,
  packageName,
}: {
  pkg: PackageItem
  selected: boolean
  onSelect: () => void
  money: (value?: number | string) => string
  turnaroundText: (pkg?: PackageItem) => string
  packageName: (pkg?: PackageItem) => string
}) {
  const tier = pkg.tier || 'basic'
  const info = tierInfo[tier] || tierInfo.basic
  const features = Array.isArray(pkg.features) ? pkg.features : []

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        borderRadius: 24,
        border: selected
          ? `3px solid ${info.accent}`
          : '1px solid rgba(8,31,69,0.10)',
        background: selected ? info.bg : '#fff',
        padding: 22,
        cursor: 'pointer',
        boxShadow: selected
          ? '0 18px 42px rgba(6,23,47,0.14)'
          : '0 10px 26px rgba(6,23,47,0.06)',
        transition: '0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            background: info.bg,
            color: info.accent,
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          {tier === 'basic' ? 'B' : tier === 'standard' ? 'S' : 'E'}
        </div>

        {selected && (
          <span
            style={{
              borderRadius: 999,
              background: info.accent,
              color: tier === 'standard' ? '#06172f' : '#fff',
              padding: '7px 10px',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Selected
          </span>
        )}
      </div>

      <p
        style={{
          margin: '16px 0 0',
          color: info.accent,
          fontSize: 12,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {info.badge}
      </p>

      <h3
        style={{
          margin: '8px 0 0',
          color: '#06172f',
          fontSize: 26,
          fontWeight: 900,
        }}
      >
        {packageName(pkg)}
      </h3>

      <p
        style={{
          margin: '10px 0 0',
          color: '#64748b',
          lineHeight: 1.7,
          minHeight: 70,
        }}
      >
        {pkg.description ||
          'A student-friendly support package for academic guidance, formatting, and improvement support.'}
      </p>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <strong style={{ color: '#1463e8', fontSize: 28 }}>
          {money(pkg.price)}
        </strong>

        <span
          style={{
            borderRadius: 999,
            background: '#fff8e8',
            border: '1px solid rgba(246,184,0,0.25)',
            padding: '8px 10px',
            color: '#7c5a00',
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {turnaroundText(pkg)}
        </span>
      </div>

      <div style={{ display: 'grid', gap: 9, marginTop: 18 }}>
        {(features.length
          ? features.slice(0, 4)
          : [
              'Academic guidance',
              'Formatting support',
              'Requirement review',
              `Delivery within ${turnaroundText(pkg)}`,
            ]
        ).map((feature) => (
          <div
            key={feature}
            style={{
              display: 'flex',
              gap: 9,
              color: '#334155',
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                width: 21,
                height: 21,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 999,
                background: 'rgba(20,99,232,0.10)',
                color: '#1463e8',
                fontSize: 12,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </span>

            <span>{feature}</span>
          </div>
        ))}
      </div>
    </button>
  )
}