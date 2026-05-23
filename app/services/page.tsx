'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, normalizeList } from '../../lib/api'

type ServiceItem = {
  id: number
  title?: string
  name?: string
  description?: string
  short_description?: string
  icon?: string
  starting_price?: number
  is_active?: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api('/services')
      .then((res) => {
        const list = normalizeList(res, 'services')
        setServices(list)
      })
      .catch((err) => {
        setMsg(err.message || 'Could not load services.')
      })
      .finally(() => setLoading(false))
  }, [])

  const fallbackServices: ServiceItem[] = [
    {
      id: 1,
      title: 'Assignment Guidance',
      description:
        'Get help with structure, outline, formatting, citation, and improvement suggestions.',
      icon: '📝',
      starting_price: 300,
    },
    {
      id: 2,
      title: 'Presentation Design',
      description:
        'Modern slides for class presentation, seminar, viva, and project showcase.',
      icon: '📊',
      starting_price: 500,
    },
    {
      id: 3,
      title: 'Report Formatting',
      description:
        'Clean report layout, references, table of contents, and academic formatting support.',
      icon: '📄',
      starting_price: 400,
    },
    {
      id: 4,
      title: 'Exam Preparation',
      description:
        'Study notes, revision sheets, viva questions, and exam preparation materials.',
      icon: '🎯',
      starting_price: 300,
    },
  ]

  const displayServices = services.length > 0 ? services : fallbackServices

  function getTitle(service: ServiceItem) {
    return service.title || service.name || 'Academic Support'
  }

  function getDescription(service: ServiceItem) {
    return (
      service.short_description ||
      service.description ||
      'Student-friendly academic support service.'
    )
  }

  function getPrice(service: ServiceItem) {
    if (!service.starting_price) return 'Custom'
    return `৳${Number(service.starting_price).toLocaleString('en-BD')}`
  }

  return (
    <main>
      <section style={{ padding: '58px 0 34px' }}>
        <div className="site-container">
          <div
            className="dark-card"
            style={{
              padding: 40,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 28,
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-dark">Our Services</span>

              <h1
                style={{
                  margin: '18px 0 0',
                  fontSize: 'clamp(2.2rem, 4vw, 4.4rem)',
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: 'white',
                }}
              >
                Choose the support you need
              </h1>

              <p
                style={{
                  marginTop: 16,
                  color: '#dbeafe',
                  fontSize: 17,
                  lineHeight: 1.8,
                  maxWidth: 680,
                }}
              >
                Browse student-friendly academic support services. Pick a
                service, choose a package, upload your files, and track your
                request from dashboard.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <Link href="/order" className="btn-main">
                  Submit Request
                </Link>

                <Link href="/packages" className="btn-outline">
                  View Packages
                </Link>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 26,
                padding: 24,
              }}
            >
              <h3 style={{ margin: 0, color: 'white', fontWeight: 900 }}>
                How it works
              </h3>

              <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                {[
                  ['1', 'Choose your service'],
                  ['2', 'Select a matching package'],
                  ['3', 'Upload files and submit request'],
                ].map(([num, text]) => (
                  <div
                    key={num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#dbeafe',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 12,
                        background: '#ffcf32',
                        color: '#06172f',
                        fontWeight: 900,
                      }}
                    >
                      {num}
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '26px 0 72px' }}>
        <div className="site-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 18,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <div>
              <span className="badge">Available Services</span>

              <h2
                style={{
                  margin: '14px 0 0',
                  fontSize: 36,
                  color: '#06172f',
                  fontWeight: 900,
                }}
              >
                Service Categories
              </h2>
            </div>

            <Link href="/order" className="btn-blue">
              Order Now
            </Link>
          </div>

          {loading && (
            <div className="brand-card" style={{ padding: 28 }}>
              Loading services...
            </div>
          )}

          {msg && (
            <div
              className="brand-card"
              style={{
                padding: 20,
                marginBottom: 20,
                color: '#b45309',
                background: '#fff7ed',
              }}
            >
              {msg}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 22,
            }}
          >
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="brand-card"
                style={{
                  padding: 26,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 310,
                }}
              >
                <div className="service-icon">{service.icon || '🎓'}</div>

                <h3
                  style={{
                    margin: '18px 0 10px',
                    color: '#06172f',
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  {getTitle(service)}
                </h3>

                <p
                  style={{
                    color: '#64748b',
                    lineHeight: 1.8,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {getDescription(service)}
                </p>

                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: '#94a3b8',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      Starting From
                    </p>

                    <p
                      style={{
                        margin: '4px 0 0',
                        color: '#1463e8',
                        fontSize: 22,
                        fontWeight: 900,
                      }}
                    >
                      {getPrice(service)}
                    </p>
                  </div>

                  <Link
                    href={`/order?service=${service.id}`}
                    className="btn-main"
                    style={{
                      minHeight: 44,
                      padding: '10px 16px',
                    }}
                  >
                    Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}