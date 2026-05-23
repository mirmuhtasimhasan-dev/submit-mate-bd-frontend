'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, getUser, normalizeList } from '../../../lib/api'

type ServiceItem = {
  id: number
  title?: string
  name?: string
}

type PackageItem = {
  id: number
  service_id?: number
  service?: ServiceItem
  tier?: string
  name?: string
  slug?: string
  description?: string
  price?: number | string
  turnaround_hours?: number
  delivery_days?: number
  features?: string[]
  is_active?: boolean
}

const tierOptions = [
  {
    value: 'basic',
    label: 'Basic',
    hours: 48,
    text: '48 hours',
  },
  {
    value: 'standard',
    label: 'Standard',
    hours: 24,
    text: '1 day',
  },
  {
    value: 'express',
    label: 'Express',
    hours: 16,
    text: '16 hours',
  },
]

export default function AdminPackagesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    service_id: '',
    tier: 'basic',
    name: 'Basic',
    slug: '',
    description: '',
    price: '',
    turnaround_hours: '48',
    featuresText:
      'Academic guidance\nFormatting support\nRequirement review\nDelivery within 48 hours',
    is_active: true,
  })

  async function loadData() {
    try {
      const user = getUser()

      if (user?.role !== 'admin') {
        setMsg('Admin login required.')
        setLoading(false)
        return
      }

      const [serviceRes, packageRes] = await Promise.all([
        api('/admin/services'),
        api('/admin/packages'),
      ])

      setServices(normalizeList(serviceRes, 'services'))
      setPackages(normalizeList(packageRes, 'packages'))
    } catch (err: any) {
      setMsg(err.message || 'Could not load packages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function makeSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function featuresArray(text: string) {
    return text
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function changeField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === 'tier') {
      const selectedTier = tierOptions.find((tier) => tier.value === value)

      setForm((prev) => ({
        ...prev,
        tier: value,
        name: selectedTier?.label || prev.name,
        turnaround_hours: String(selectedTier?.hours || prev.turnaround_hours),
        featuresText: `Academic guidance\nFormatting support\nRequirement review\nDelivery within ${selectedTier?.text || 'custom time'}`,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function createPackage(e: React.FormEvent) {
    e.preventDefault()
    setMsg('Creating package...')

    try {
      const selectedService = services.find(
        (service) => String(service.id) === String(form.service_id)
      )

      const slug =
        form.slug ||
        makeSlug(
          `${selectedService?.title || selectedService?.name || 'service'}-${form.tier}`
        )

      await api('/admin/packages', {
        method: 'POST',
        body: JSON.stringify({
          service_id: Number(form.service_id),
          tier: form.tier,
          name: form.name,
          slug,
          description: form.description,
          price: Number(form.price),
          turnaround_hours: Number(form.turnaround_hours),
          features: featuresArray(form.featuresText),
          is_active: form.is_active,
        }),
      })

      setForm({
        service_id: '',
        tier: 'basic',
        name: 'Basic',
        slug: '',
        description: '',
        price: '',
        turnaround_hours: '48',
        featuresText:
          'Academic guidance\nFormatting support\nRequirement review\nDelivery within 48 hours',
        is_active: true,
      })

      setMsg('Package created successfully.')
      loadData()
    } catch (err: any) {
      setMsg(err.message || 'Package create failed.')
    }
  }

  async function updatePackage(id: number, data: any) {
    setMsg('Updating package...')

    try {
      await api(`/admin/packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          service_id: Number(data.service_id),
          tier: data.tier,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          turnaround_hours: Number(data.turnaround_hours),
          features: featuresArray(data.featuresText),
          is_active: data.is_active,
        }),
      })

      setMsg('Package updated successfully.')
      loadData()
    } catch (err: any) {
      setMsg(err.message || 'Package update failed.')
    }
  }

  async function deletePackage(id: number) {
    if (!confirm('Delete this package?')) return

    setMsg('Deleting package...')

    try {
      await api(`/admin/packages/${id}`, {
        method: 'DELETE',
      })

      setMsg('Package deleted successfully.')
      loadData()
    } catch (err: any) {
      setMsg(err.message || 'Package delete failed.')
    }
  }

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 30 }}>
          <span className="badge badge-dark">Admin Packages</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            Manage Basic, Standard and Express packages
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
            Create service-wise packages with price, features, active status and
            delivery time: Basic 48 hours, Standard 1 day, Express 16 hours.
          </p>
        </section>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Link href="/admin" className="btn-outline">
            Back to Admin
          </Link>

          <Link href="/admin/services" className="btn-blue">
            Manage Services
          </Link>

          <Link href="/packages" className="btn-main">
            View Public Packages
          </Link>
        </div>

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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 0.9fr) minmax(360px, 1.6fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <section className="brand-card" style={{ padding: 26 }}>
            <span className="badge">Add Package</span>

            <h2
              style={{
                margin: '14px 0 18px',
                color: '#06172f',
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              New Package
            </h2>

            <form onSubmit={createPackage} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="label-ui">Service</label>
                <select
                  className="input-ui"
                  name="service_id"
                  value={form.service_id}
                  onChange={changeField}
                  required
                >
                  <option value="">Choose service</option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title || service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-ui">Tier</label>
                <select
                  className="input-ui"
                  name="tier"
                  value={form.tier}
                  onChange={changeField}
                >
                  {tierOptions.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label} — {tier.text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-ui">Package Name</label>
                <input
                  className="input-ui"
                  name="name"
                  value={form.name}
                  onChange={changeField}
                  required
                />
              </div>

              <div>
                <label className="label-ui">Slug</label>
                <input
                  className="input-ui"
                  name="slug"
                  value={form.slug}
                  onChange={changeField}
                  placeholder="presentation-design-basic"
                />
              </div>

              <div>
                <label className="label-ui">Price</label>
                <input
                  className="input-ui"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={changeField}
                  placeholder="500"
                  required
                />
              </div>

              <div>
                <label className="label-ui">Turnaround Hours</label>
                <input
                  className="input-ui"
                  type="number"
                  name="turnaround_hours"
                  value={form.turnaround_hours}
                  onChange={changeField}
                  required
                />
              </div>

              <div>
                <label className="label-ui">Description</label>
                <textarea
                  className="input-ui"
                  name="description"
                  value={form.description}
                  onChange={changeField}
                  placeholder="Package description"
                  style={{ minHeight: 110, resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="label-ui">Features</label>
                <textarea
                  className="input-ui"
                  name="featuresText"
                  value={form.featuresText}
                  onChange={changeField}
                  style={{ minHeight: 140, resize: 'vertical' }}
                />
                <p
                  style={{
                    margin: '8px 0 0',
                    color: '#64748b',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Write one feature per line.
                </p>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#06172f',
                  fontWeight: 900,
                }}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={changeField}
                />
                Active / Available
              </label>

              <button className="btn-main" type="submit">
                Create Package
              </button>
            </form>
          </section>

          <section className="brand-card" style={{ padding: 26 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <span className="badge">Package List</span>

                <h2
                  style={{
                    margin: '14px 0 0',
                    color: '#06172f',
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  Current Packages
                </h2>
              </div>

              <button className="btn-blue" type="button" onClick={loadData}>
                Refresh
              </button>
            </div>

            {loading && <p>Loading packages...</p>}

            {!loading && packages.length === 0 && (
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
                No packages found.
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              {packages.map((pkg) => (
                <PackageEditCard
                  key={pkg.id}
                  item={pkg}
                  services={services}
                  onUpdate={updatePackage}
                  onDelete={deletePackage}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function PackageEditCard({
  item,
  services,
  onUpdate,
  onDelete,
}: {
  item: PackageItem
  services: ServiceItem[]
  onUpdate: (id: number, data: any) => void
  onDelete: (id: number) => void
}) {
  const [form, setForm] = useState({
    service_id: String(item.service_id || item.service?.id || ''),
    tier: item.tier || 'basic',
    name: item.name || 'Basic',
    slug: item.slug || '',
    description: item.description || '',
    price: String(item.price || ''),
    turnaround_hours: String(item.turnaround_hours || 48),
    featuresText: Array.isArray(item.features)
      ? item.features.join('\n')
      : 'Academic guidance\nFormatting support\nRequirement review',
    is_active: Boolean(item.is_active),
  })

  function changeField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === 'tier') {
      const selectedTier = tierOptions.find((tier) => tier.value === value)

      setForm((prev) => ({
        ...prev,
        tier: value,
        name: selectedTier?.label || prev.name,
        turnaround_hours: String(selectedTier?.hours || prev.turnaround_hours),
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div
      style={{
        border: '1px solid rgba(8,31,69,0.10)',
        borderRadius: 22,
        padding: 18,
        background: '#f8fbff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14,
        }}
      >
        <div>
          <label className="label-ui">Service</label>
          <select
            className="input-ui"
            name="service_id"
            value={form.service_id}
            onChange={changeField}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title || service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-ui">Tier</label>
          <select
            className="input-ui"
            name="tier"
            value={form.tier}
            onChange={changeField}
          >
            {tierOptions.map((tier) => (
              <option key={tier.value} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-ui">Name</label>
          <input
            className="input-ui"
            name="name"
            value={form.name}
            onChange={changeField}
          />
        </div>

        <div>
          <label className="label-ui">Price</label>
          <input
            className="input-ui"
            type="number"
            name="price"
            value={form.price}
            onChange={changeField}
          />
        </div>

        <div>
          <label className="label-ui">Hours</label>
          <input
            className="input-ui"
            type="number"
            name="turnaround_hours"
            value={form.turnaround_hours}
            onChange={changeField}
          />
        </div>

        <div>
          <label className="label-ui">Slug</label>
          <input
            className="input-ui"
            name="slug"
            value={form.slug}
            onChange={changeField}
          />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label-ui">Description</label>
        <textarea
          className="input-ui"
          name="description"
          value={form.description}
          onChange={changeField}
          style={{ minHeight: 90, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label-ui">Features</label>
        <textarea
          className="input-ui"
          name="featuresText"
          value={form.featuresText}
          onChange={changeField}
          style={{ minHeight: 110, resize: 'vertical' }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#06172f',
            fontWeight: 900,
          }}
        >
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={changeField}
          />
          Active
        </label>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-main"
            onClick={() => onUpdate(item.id, form)}
            style={{ minHeight: 44, padding: '10px 16px' }}
          >
            Update
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            style={{
              minHeight: 44,
              borderRadius: 999,
              border: 'none',
              padding: '10px 16px',
              background: '#fee2e2',
              color: '#b91c1c',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}