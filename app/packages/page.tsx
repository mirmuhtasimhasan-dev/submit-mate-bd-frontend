'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { api, normalizeList } from '../../lib/api'

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
  service?: ServiceItem
  tier?: 'basic' | 'standard' | 'express' | string
  name?: string
  package_name?: string
  description?: string
  price?: number | string
  turnaround_hours?: number
  delivery_days?: number
  features?: string[]
  is_active?: boolean
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

export default function PackagesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [activeService, setActiveService] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([api('/services'), api('/packages')])
      .then(([serviceRes, packageRes]) => {
        setServices(normalizeList(serviceRes, 'services'))
        setPackages(normalizeList(packageRes, 'packages'))
      })
      .catch((err) => {
        setMsg(err.message || 'Could not load packages.')
      })
      .finally(() => setLoading(false))
  }, [])

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const aTier = a.tier || 'basic'
      const bTier = b.tier || 'basic'

      return (tierInfo[aTier]?.order || 99) - (tierInfo[bTier]?.order || 99)
    })
  }, [packages])

  const visibleServices = useMemo(() => {
    if (services.length > 0) return services

    const map = new Map<number, ServiceItem>()

    sortedPackages.forEach((pkg) => {
      if (pkg.service_id && !map.has(pkg.service_id)) {
        map.set(pkg.service_id, {
          id: pkg.service_id,
          title: pkg.service?.title || pkg.service?.name || 'Academic Support',
        })
      }
    })

    return Array.from(map.values())
  }, [services, sortedPackages])

  const groupedByService = useMemo(() => {
    const map = new Map<number, PackageItem[]>()

    sortedPackages.forEach((pkg) => {
      const serviceId = Number(pkg.service_id || pkg.service?.id || 0)

      if (!serviceId) return

      if (!map.has(serviceId)) {
        map.set(serviceId, [])
      }

      map.get(serviceId)?.push(pkg)
    })

    return map
  }, [sortedPackages])

  const selectedServices =
    activeService === 'all'
      ? visibleServices
      : visibleServices.filter((s) => String(s.id) === String(activeService))

  function getServiceName(service: ServiceItem) {
    return service.title || service.name || 'Academic Support'
  }

  return (
    <main>
      <section style={{ padding: '58px 0 34px' }}>
        <div className="site-container">
          <div className="dark-card" style={{ padding: 40 }}>
            <span className="badge badge-dark">Packages & Pricing</span>

            <h1
              style={{
                margin: '18px 0 0',
                fontSize: 'clamp(2.2rem, 4vw, 4.4rem)',
                lineHeight: 1.05,
                fontWeight: 900,
                color: 'white',
              }}
            >
              Choose the right support package for your deadline
            </h1>

            <p
              style={{
                marginTop: 16,
                color: '#dbeafe',
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 860,
              }}
            >
              Select Basic for regular support, Standard for faster delivery, or
              Express for urgent academic guidance. Every package is designed to
              help you organize, format, and improve your academic work with a
              clear support process.
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

              <Link href="/services" className="btn-outline">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '26px 0 72px' }}>
        <div className="site-container">
          <div
            className="brand-card"
            style={{
              padding: 18,
              marginBottom: 26,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveService('all')}
              className={activeService === 'all' ? 'btn-main' : 'btn-outline'}
              style={{ minHeight: 42, padding: '9px 16px' }}
            >
              All Services
            </button>

            {visibleServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setActiveService(String(service.id))}
                className={
                  activeService === String(service.id)
                    ? 'btn-main'
                    : 'btn-outline'
                }
                style={{ minHeight: 42, padding: '9px 16px' }}
              >
                {getServiceName(service)}
              </button>
            ))}
          </div>

          {loading && (
            <div className="brand-card" style={{ padding: 28 }}>
              Loading packages...
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

          {!loading && sortedPackages.length === 0 && (
            <div
              className="brand-card"
              style={{
                padding: 34,
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#06172f',
                  fontWeight: 900,
                  fontSize: 24,
                }}
              >
                No packages found
              </h3>

              <p style={{ color: '#64748b', marginTop: 10 }}>
                Please run seeder or add packages from admin panel.
              </p>

              <Link
                href="/admin/packages"
                className="btn-blue"
                style={{ marginTop: 18 }}
              >
                Manage Packages
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gap: 34 }}>
            {selectedServices.map((service) => {
              const servicePackages = groupedByService.get(service.id) || []

              if (servicePackages.length === 0) return null

              return (
                <div key={service.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'space-between',
                      gap: 18,
                      flexWrap: 'wrap',
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <span className="badge">Service Package</span>

                      <h2
                        style={{
                          margin: '12px 0 0',
                          color: '#06172f',
                          fontSize: 32,
                          fontWeight: 900,
                        }}
                      >
                        {getServiceName(service)}
                      </h2>
                    </div>

                    <Link
                      href={`/order?service=${service.id}`}
                      className="btn-blue"
                    >
                      Order This Service
                    </Link>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 22,
                    }}
                  >
                    {servicePackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        serviceId={service.id}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

function PackageCard({
  pkg,
  serviceId,
}: {
  pkg: PackageItem
  serviceId: number
}) {
  const tier = pkg.tier || 'basic'
  const info = tierInfo[tier] || tierInfo.basic
  const features = Array.isArray(pkg.features) ? pkg.features : []

  function money(value?: number | string) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`
  }

  function packageName() {
    return info.label || pkg.name || pkg.package_name || 'Package'
  }

  function turnaroundText() {
    if (pkg.turnaround_hours === 48) return '48 hours'
    if (pkg.turnaround_hours === 24) return '1 day'
    if (pkg.turnaround_hours === 16) return '16 hours'
    if (pkg.turnaround_hours) return `${pkg.turnaround_hours} hours`
    return info.delivery
  }

  return (
    <div
      className="brand-card"
      style={{
        padding: 28,
        position: 'relative',
        overflow: 'hidden',
        border:
          tier === 'standard'
            ? '2px solid rgba(246,184,0,0.75)'
            : '1px solid rgba(8,31,69,0.10)',
      }}
    >
      {tier === 'standard' && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f6b800',
            color: '#06172f',
            fontWeight: 900,
            fontSize: 12,
            borderRadius: 999,
            padding: '7px 11px',
          }}
        >
          Popular
        </div>
      )}

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 20,
          display: 'grid',
          placeItems: 'center',
          background: info.bg,
          color: info.accent,
          fontSize: 28,
          fontWeight: 900,
        }}
      >
        {tier === 'basic' ? 'B' : tier === 'standard' ? 'S' : 'E'}
      </div>

      <p
        style={{
          margin: '18px 0 0',
          color: info.accent,
          fontSize: 13,
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
          fontSize: 30,
          fontWeight: 900,
        }}
      >
        {packageName()}
      </h3>

      <p
        style={{
          margin: '12px 0 0',
          color: '#64748b',
          lineHeight: 1.8,
          minHeight: 78,
        }}
      >
        {pkg.description ||
          'A student-friendly support package for academic guidance, formatting, and improvement support.'}
      </p>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          gap: 12,
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
            Price
          </p>

          <p
            style={{
              margin: '4px 0 0',
              color: '#1463e8',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            {money(pkg.price)}
          </p>
        </div>

        <div
          style={{
            borderRadius: 999,
            background: '#fff8e8',
            border: '1px solid rgba(246,184,0,0.25)',
            padding: '9px 12px',
            color: '#7c5a00',
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {turnaroundText()}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
        {(features.length
          ? features
          : [
              'Academic guidance',
              'Formatting support',
              'Requirement review',
              `Delivery within ${turnaroundText()}`,
            ]
        ).map((feature) => (
          <div
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#334155',
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 999,
                background: 'rgba(20,99,232,0.10)',
                color: '#1463e8',
                fontSize: 13,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </span>

            {feature}
          </div>
        ))}
      </div>

      <Link
        href={`/order?service=${serviceId}&package=${pkg.id}`}
        className="btn-main"
        style={{
          width: '100%',
          marginTop: 24,
        }}
      >
        Choose {packageName()}
      </Link>
    </div>
  )
}