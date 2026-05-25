'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { api } from '../../lib/api'

type ServiceItem = {
  id: number
  title?: string
  name?: string
  description?: string
}

type PackageItem = {
  id: number
  service_id?: number
  tier?: string
  name?: string
  package_name?: string
  description?: string
  price?: number | string
  turnaround_hours?: number
  delivery_days?: number
  features?: string[] | string
}

const fallbackServices: ServiceItem[] = [
  {
    id: 1,
    title: 'Assignment Guidance',
    description: 'Academic support for assignment planning, structure, formatting, and improvement guidance.',
  },
  {
    id: 2,
    title: 'Research Support',
    description: 'Research topic selection, proposal structure, literature review guidance, and citation support.',
  },
  {
    id: 3,
    title: 'Presentation Design',
    description: 'Professional academic PowerPoint presentation design support for students.',
  },
  {
    id: 4,
    title: 'Citation & Formatting Help',
    description: 'APA, MLA, Harvard, IEEE citation formatting, reference checking, and document formatting support.',
  },
  {
    id: 5,
    title: 'Exam Preparation',
    description: 'Study notes, revision sheets, viva preparation, MCQ preparation, and exam guidance.',
  },
]

const fallbackPackages: PackageItem[] = fallbackServices.flatMap((service) => {
  const serviceTitle = service.title || service.name || 'Academic Support'

  return [
    {
      id: service.id * 10 + 1,
      service_id: service.id,
      tier: 'basic',
      name: 'Basic',
      price: 500,
      turnaround_hours: 48,
      description: 'Basic support package for ' + serviceTitle + '.',
      features: [
        serviceTitle + ' support',
        'Basic academic guidance',
        'Structure and outline support',
        'Delivery within 48 hours',
      ],
    },
    {
      id: service.id * 10 + 2,
      service_id: service.id,
      tier: 'standard',
      name: 'Standard',
      price: 1500,
      turnaround_hours: 24,
      description: 'Standard support package for ' + serviceTitle + '.',
      features: [
        serviceTitle + ' support',
        'Detailed academic guidance',
        'Formatting and citation support',
        'Delivery within 1 day',
      ],
    },
    {
      id: service.id * 10 + 3,
      service_id: service.id,
      tier: 'express',
      name: 'Express',
      price: 3000,
      turnaround_hours: 16,
      description: 'Express support package for ' + serviceTitle + '.',
      features: [
        serviceTitle + ' support',
        'Urgent priority support',
        'Fast formatting and guidance',
        'Delivery within 16 hours',
      ],
    },
  ]
})

const tierOrder: Record<string, number> = {
  basic: 1,
  standard: 2,
  express: 3,
}

const tierLabel: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  express: 'Express',
}

function normalizeList(response: any, key?: string) {
  if (Array.isArray(response)) return response
  if (key && Array.isArray(response?.[key])) return response[key]
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.services)) return response.services
  if (Array.isArray(response?.packages)) return response.packages
  if (response?.data && Array.isArray(response.data.data)) return response.data.data
  return []
}

function getServiceName(service?: ServiceItem) {
  return service?.title || service?.name || 'Academic Support'
}

function getPackageName(pkg?: PackageItem) {
  if (!pkg) return ''
  const tier = pkg.tier || 'basic'
  return tierLabel[tier] || pkg.name || pkg.package_name || 'Package'
}

function getMoney(value?: number | string) {
  return '৳' + Number(value || 0).toLocaleString('en-BD')
}

function getTurnaround(pkg?: PackageItem) {
  if (!pkg) return 'Custom'
  if (pkg.turnaround_hours === 48) return '48 hours'
  if (pkg.turnaround_hours === 24) return '1 day'
  if (pkg.turnaround_hours === 16) return '16 hours'
  if (pkg.turnaround_hours) return String(pkg.turnaround_hours) + ' hours'
  if (pkg.delivery_days === 1) return '1 day'
  if (pkg.delivery_days) return String(pkg.delivery_days) + ' days'
  return 'Custom'
}

function getFeatures(pkg: PackageItem) {
  if (Array.isArray(pkg.features)) return pkg.features

  if (typeof pkg.features === 'string') {
    try {
      const parsed = JSON.parse(pkg.features)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return []
    }
  }

  return []
}

export default function OrderPage() {
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices)
  const [packages, setPackages] = useState<PackageItem[]>(fallbackPackages)
  const [files, setFiles] = useState<File[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(true)

  const [form, setForm] = useState({
    service_id: '',
    package_id: '',
    title: '',
    instructions: '',
    deadline: '',
  })

  useEffect(() => {
    async function loadData() {
      setDataLoading(true)
      setMsg('')

      try {
        const serviceRes = await api('/services')
        const serviceList = normalizeList(serviceRes, 'services')

        if (serviceList.length > 0) {
          setServices(serviceList)
          setUsingFallback(false)
        }

        try {
          const packageRes = await api('/packages')
          const packageList = normalizeList(packageRes, 'packages')

          if (packageList.length > 0) {
            setPackages(packageList)
          }
        } catch {
          setPackages(fallbackPackages)
        }

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const serviceParam = params.get('service')
          const packageParam = params.get('package')

          setForm((prev) => ({
            ...prev,
            service_id: serviceParam || '',
            package_id: packageParam || '',
          }))
        }
      } catch {
        setServices(fallbackServices)
        setPackages(fallbackPackages)
        setUsingFallback(true)
        setMsg('Demo services loaded. Backend API is not connected right now.')
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
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
        return (tierOrder[aTier] || 99) - (tierOrder[bTier] || 99)
      })
  }, [packages, form.service_id])

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === String(form.package_id)
  )

  function changeField(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files || []))
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.service_id) {
      setMsg('Please choose a service.')
      return
    }

    if (!form.package_id) {
      setMsg('Please choose a package.')
      return
    }

    if (!form.title.trim()) {
      setMsg('Please enter a topic/title.')
      return
    }

    if (usingFallback) {
      setMsg('Dropdown is working in demo mode. Backend API must be fixed before real order submit.')
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
        for (const file of files) {
          const fd = new FormData()
          fd.append('file', file)

          await api('/orders/' + orderId + '/upload-file', {
            method: 'POST',
            body: fd,
          })
        }
      }

      setMsg('Request submitted successfully! Redirecting to dashboard...')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 900)
    } catch (err: any) {
      setMsg(err?.message || 'Order failed. Please login and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '42px 0 20px' }}>
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
            Choose your service, select a package, upload your files, and explain your requirements clearly.
          </p>
        </section>

        <form onSubmit={submit} className="brand-card" style={{ padding: 34 }}>
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
                style={{ minHeight: 56, fontSize: 16, fontWeight: 800 }}
              >
                <option value="">Choose a service</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {getServiceName(service)}
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
                {selectedService ? getServiceName(selectedService) : 'No service selected'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <label className="label-ui">Choose Package</label>

            <p style={{ margin: '0 0 16px', color: '#64748b', lineHeight: 1.7 }}>
              Select one package based on your deadline and support needs.
            </p>

            {dataLoading && (
              <div className="brand-card" style={{ padding: 24, boxShadow: 'none' }}>
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
                Choose a service first to see Basic, Standard and Express packages.
              </div>
            )}

            {form.service_id && filteredPackages.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                {filteredPackages.map((pkg) => {
                  const tier = pkg.tier || 'basic'
                  const selected = String(form.package_id) === String(pkg.id)
                  const features = getFeatures(pkg)

                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          package_id: String(pkg.id),
                        }))
                      }
                      style={{
                        textAlign: 'left',
                        borderRadius: 22,
                        border: selected
                          ? '3px solid #1463e8'
                          : '1px solid rgba(8,31,69,0.10)',
                        background: selected ? 'rgba(20,99,232,0.08)' : '#fff',
                        padding: 20,
                        cursor: 'pointer',
                        boxShadow: selected
                          ? '0 18px 42px rgba(6,23,47,0.14)'
                          : '0 10px 26px rgba(6,23,47,0.06)',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#1463e8',
                          fontSize: 12,
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {tier === 'express'
                          ? 'Urgent Support'
                          : tier === 'standard'
                            ? 'Best Value'
                            : 'Regular Support'}
                      </p>

                      <h3
                        style={{
                          margin: '8px 0 0',
                          color: '#06172f',
                          fontSize: 24,
                          fontWeight: 900,
                        }}
                      >
                        {getPackageName(pkg)}
                      </h3>

                      <p
                        style={{
                          margin: '10px 0 0',
                          color: '#64748b',
                          lineHeight: 1.7,
                        }}
                      >
                        {pkg.description || 'Student-friendly academic support package.'}
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
                        <strong style={{ color: '#1463e8', fontSize: 24 }}>
                          {getMoney(pkg.price)}
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
                          {getTurnaround(pkg)}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                        {(features.length > 0
                          ? features.slice(0, 4)
                          : [
                              'Academic guidance',
                              'Formatting support',
                              'Requirement review',
                              'Delivery within ' + getTurnaround(pkg),
                            ]
                        ).map((feature) => (
                          <div
                            key={feature}
                            style={{
                              display: 'flex',
                              gap: 8,
                              color: '#334155',
                              fontWeight: 700,
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ color: '#1463e8', fontWeight: 900 }}>
                              ✓
                            </span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {selected && (
                        <div
                          style={{
                            marginTop: 16,
                            borderRadius: 999,
                            background: '#1463e8',
                            color: '#fff',
                            padding: '10px 12px',
                            textAlign: 'center',
                            fontWeight: 900,
                          }}
                        >
                          Selected
                        </div>
                      )}
                    </button>
                  )
                })}
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
                style={{ minHeight: 56, fontSize: 16 }}
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
                style={{ minHeight: 56, fontSize: 16 }}
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
              placeholder="Write clearly what kind of support you need."
              style={{
                minHeight: 150,
                resize: 'vertical',
                fontSize: 16,
                lineHeight: 1.7,
              }}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <label className="label-ui">Upload Files</label>

            <div
              className="brand-card"
              style={{ padding: 22, boxShadow: 'none', background: '#f8fbff' }}
            >
              <input type="file" multiple onChange={handleFiles} />

              {files.length > 0 && (
                <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                  {files.map((file, index) => (
                    <div
                      key={file.name + file.size + index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                        background: '#fff',
                        border: '1px solid rgba(8,31,69,0.10)',
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {file.name}
                        </strong>

                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                          {Math.round(file.size / 1024)} KB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        style={{
                          border: 0,
                          borderRadius: 10,
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-main"
            disabled={loading}
            style={{
              width: '100%',
              minHeight: 60,
              fontSize: 18,
              marginTop: 24,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>

          {msg && (
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                background: usingFallback ? '#fff8e8' : '#f8fbff',
                border: '1px solid rgba(20,99,232,0.14)',
                padding: 16,
                color: usingFallback ? '#7c5a00' : '#0f172a',
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
