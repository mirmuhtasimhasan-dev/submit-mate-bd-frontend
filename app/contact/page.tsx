'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

const contactInfo = {
  whatsapp: '+8801XXXXXXXXX',
  phone: '+8801XXXXXXXXX',
  email: 'support@submitmatebd.test',
  facebook: 'https://facebook.com/submitmatebd',
  supportHours: 'Every day, 9:00 AM - 11:00 PM',
}

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [msg, setMsg] = useState('')

  function submitContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      setMsg('Name is required.')
      return
    }

    if (!email.trim()) {
      setMsg('Email is required.')
      return
    }

    if (!message.trim()) {
      setMsg('Message is required.')
      return
    }

    setMsg('Thanks. Your message has been prepared. Contact backend will be connected later.')

    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
  }

  return (
    <main style={{ padding: '42px 0 24px' }}>
      <div className="site-container">
        <section className="dark-card" style={{ padding: 34, marginBottom: 28 }}>
          <span className="badge badge-dark">Contact Support</span>

          <h1
            style={{
              margin: '18px 0 0',
              color: 'white',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
            }}
          >
            Need academic support?
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
            Contact Submit Mate BD for assignment guidance, research support,
            formatting help, presentation design, citation support, study
            materials, and mentoring.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
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
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 22,
            marginBottom: 24,
          }}
        >
          <ContactCard
            icon="💬"
            title="WhatsApp"
            value={contactInfo.whatsapp}
            note="Fast support for order questions."
            href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
          />

          <ContactCard
            icon="📞"
            title="Phone"
            value={contactInfo.phone}
            note="Call during support hours."
            href={`tel:${contactInfo.phone}`}
          />

          <ContactCard
            icon="📧"
            title="Email"
            value={contactInfo.email}
            note="Send your question anytime."
            href={`mailto:${contactInfo.email}`}
          />

          <ContactCard
            icon="📘"
            title="Facebook"
            value="Submit Mate BD"
            note="Follow updates and send message."
            href={contactInfo.facebook}
          />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div className="brand-card" style={{ padding: 28 }}>
            <span className="badge">Send Message</span>

            <h2
              style={{
                margin: '14px 0 8px',
                color: '#06172f',
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              Contact form
            </h2>

            <p
              style={{
                margin: '0 0 20px',
                color: '#64748b',
                lineHeight: 1.7,
                fontWeight: 700,
              }}
            >
              Fill up the form below. This is a frontend contact form UI for
              now. Backend message saving can be connected later.
            </p>

            {msg && (
              <div
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: msg.includes('required') ? '#fee2e2' : '#dcfce7',
                  color: msg.includes('required') ? '#991b1b' : '#166534',
                  fontWeight: 900,
                  marginBottom: 18,
                }}
              >
                {msg}
              </div>
            )}

            <form onSubmit={submitContact}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <Field label="Name *">
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </Field>

                <Field label="Email *">
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </Field>

                <Field label="Phone">
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 11)

                      setPhone(onlyNumbers)
                    }}
                    placeholder="Optional"
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Message *">
                  <textarea
                    className="input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message"
                    required
                    rows={6}
                    style={{ resize: 'vertical' }}
                  />
                </Field>
              </div>

              <button type="submit" className="btn-main" style={{ marginTop: 20 }}>
                Submit Message
              </button>
            </form>
          </div>

          <aside className="brand-card" style={{ padding: 28 }}>
            <span className="badge">Support Info</span>

            <InfoRow label="Support Hours" value={contactInfo.supportHours} />
            <InfoRow label="Location" value="Bangladesh" />
            <InfoRow label="Response Type" value="Manual support response" />
            <InfoRow
              label="Safe Support Areas"
              value="Academic guidance, research support, formatting, citation, presentation design, study materials, viva and exam preparation."
            />

            <div
              style={{
                marginTop: 22,
                borderRadius: 22,
                padding: 20,
                background: '#f8fbff',
                border: '1px solid rgba(8,31,69,0.10)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#06172f',
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                Quick action
              </h3>

              <p
                style={{
                  margin: '10px 0 16px',
                  color: '#64748b',
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                Ready to submit your support request? Go to the order page and
                choose your service.
              </p>

              <Link href="/order" className="btn-blue">
                Go to Order Page
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

function ContactCard({
  icon,
  title,
  value,
  note,
  href,
}: {
  icon: string
  title: string
  value: string
  note: string
  href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="brand-card"
      style={{
        padding: 24,
        display: 'block',
        transition: '0.2s ease',
      }}
    >
      <div className="service-icon">{icon}</div>

      <h3
        style={{
          margin: '16px 0 0',
          color: '#06172f',
          fontSize: 23,
          fontWeight: 900,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '8px 0 0',
          color: '#1463e8',
          fontWeight: 900,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: '8px 0 0',
          color: '#64748b',
          lineHeight: 1.6,
          fontWeight: 700,
        }}
      >
        {note}
      </p>
    </a>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: '#06172f', fontWeight: 900 }}>{label}</span>
      {children}
    </label>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(8,31,69,0.08)',
        padding: '16px 0',
      }}
    >
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
          margin: '7px 0 0',
          color: '#06172f',
          lineHeight: 1.7,
          fontWeight: 800,
        }}
      >
        {value}
      </p>
    </div>
  )
}