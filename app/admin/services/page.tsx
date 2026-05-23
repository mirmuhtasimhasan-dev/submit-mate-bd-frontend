'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, getUser, normalizeList } from '../../../lib/api'

type ServiceItem = {
  id: number
  title?: string
  name?: string
  slug?: string
  description?: string
  icon?: string
  is_active?: boolean
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    icon: '🎓',
    is_active: true,
  })

  async function loadServices() {
    try {
      const user = getUser()

      if (user?.role !== 'admin') {
        setMsg('Admin login required.')
        setLoading(false)
        return
      }

      const res = await api('/admin/services')
      setServices(normalizeList(res, 'services'))
    } catch (err: any) {
      setMsg(err.message || 'Could not load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  function changeField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function makeSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    setMsg('Creating service...')

    try {
      await api('/admin/services', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          slug: form.slug || makeSlug(form.title),
        }),
      })

      setForm({
        title: '',
        slug: '',
        description: '',
        icon: '🎓',
        is_active: true,
      })

      setMsg('Service created successfully.')
      loadServices()
    } catch (err: any) {
      setMsg(err.message || 'Service create failed.')
    }
  }

  async function updateService(id: number, data: any) {
    setMsg('Updating service...')

    try {
      await api(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          slug: data.slug || makeSlug(data.title),
        }),
      })

      setMsg('Service updated successfully.')
      loadServices()
    } catch (err: any) {
      setMsg(err.message || 'Service update failed.')
    }
  }

  async function deleteService(id: number) {
    if (!confirm('Delete this service? Packages under this service may also be affected.')) {
      return
    }

    setMsg('Deleting service...')

    try {
      await api(`/admin/services/${id}`, {
        method: 'DELETE',
      })

      setMsg('Service deleted successfully.')
      loadServices()
    } catch (err: any) {
      setMsg(err.message || 'Service delete failed.')
    }
  }

  return (
    <main style={{ padding: '42px 0 20px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 30 }}>
          <span className="badge badge-dark">Admin Services</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            Manage academic support services
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
            Add, update, activate or hide services that students can choose
            before submitting a support request.
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

          <Link href="/admin/packages" className="btn-blue">
            Manage Packages
          </Link>

          <Link href="/services" className="btn-main">
            View Public Services
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
            gridTemplateColumns: 'minmax(280px, 0.85fr) minmax(320px, 1.6fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <section className="brand-card" style={{ padding: 26 }}>
            <span className="badge">Add Service</span>

            <h2
              style={{
                margin: '14px 0 18px',
                color: '#06172f',
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              New Service
            </h2>

            <form onSubmit={createService} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="label-ui">Service Title</label>
                <input
                  className="input-ui"
                  name="title"
                  value={form.title}
                  onChange={changeField}
                  placeholder="Assignment Guidance"
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
                  placeholder="assignment-guidance"
                />
              </div>

              <div>
                <label className="label-ui">Icon</label>
                <input
                  className="input-ui"
                  name="icon"
                  value={form.icon}
                  onChange={changeField}
                  placeholder="🎓"
                />
              </div>

              <div>
                <label className="label-ui">Description</label>
                <textarea
                  className="input-ui"
                  name="description"
                  value={form.description}
                  onChange={changeField}
                  placeholder="Write service details"
                  style={{ minHeight: 130, resize: 'vertical' }}
                />
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
                Create Service
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
                <span className="badge">Service List</span>

                <h2
                  style={{
                    margin: '14px 0 0',
                    color: '#06172f',
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  Current Services
                </h2>
              </div>

              <button className="btn-blue" type="button" onClick={loadServices}>
                Refresh
              </button>
            </div>

            {loading && <p>Loading services...</p>}

            {!loading && services.length === 0 && (
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
                No services found.
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              {services.map((service) => (
                <ServiceEditCard
                  key={service.id}
                  service={service}
                  onUpdate={updateService}
                  onDelete={deleteService}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function ServiceEditCard({
  service,
  onUpdate,
  onDelete,
}: {
  service: ServiceItem
  onUpdate: (id: number, data: any) => void
  onDelete: (id: number) => void
}) {
  const [form, setForm] = useState({
    title: service.title || service.name || '',
    slug: service.slug || '',
    description: service.description || '',
    icon: service.icon || '🎓',
    is_active: Boolean(service.is_active),
  })

  function changeField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
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
          gridTemplateColumns: '80px 1fr 1fr',
          gap: 14,
        }}
      >
        <div>
          <label className="label-ui">Icon</label>
          <input
            className="input-ui"
            name="icon"
            value={form.icon}
            onChange={changeField}
          />
        </div>

        <div>
          <label className="label-ui">Title</label>
          <input
            className="input-ui"
            name="title"
            value={form.title}
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
            onClick={() => onUpdate(service.id, form)}
            style={{ minHeight: 44, padding: '10px 16px' }}
          >
            Update
          </button>

          <button
            type="button"
            onClick={() => onDelete(service.id)}
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