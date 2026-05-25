'use client'

import Link from 'next/link'
import { useState, type FormEvent, type ReactNode } from 'react'

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
    <main className="contact-page">
      <div className="site-container">
        <section className="dark-card contact-hero">
          <span className="badge badge-dark">Contact Support</span>

          <h1>Need academic support?</h1>

          <p>
            Contact Submit Mate BD for assignment guidance, research support,
            formatting help, presentation design, citation support, study
            materials, and mentoring.
          </p>

          <div className="contact-hero-actions">
            <Link href="/order" className="btn-main">
              Submit Request
            </Link>

            <Link href="/services" className="btn-outline">
              View Services
            </Link>
          </div>
        </section>

        <section className="contact-card-grid">
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

        <section className="contact-main-grid">
          <div className="brand-card contact-form-card">
            <span className="badge">Send Message</span>

            <h2>Contact form</h2>

            <p className="contact-muted">
              Fill up the form below. This is a frontend contact form UI for
              now. Backend message saving can be connected later.
            </p>

            {msg && (
              <div
                className={
                  msg.includes('required')
                    ? 'contact-alert contact-alert-error'
                    : 'contact-alert contact-alert-success'
                }
              >
                {msg}
              </div>
            )}

            <form onSubmit={submitContact} className="contact-form">
              <div className="contact-form-grid">
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

              <Field label="Message *">
                <textarea
                  className="input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message"
                  required
                  rows={6}
                />
              </Field>

              <button type="submit" className="btn-main contact-submit">
                Submit Message
              </button>
            </form>
          </div>

          <aside className="brand-card contact-info-card">
            <span className="badge">Support Info</span>

            <InfoRow label="Support Hours" value={contactInfo.supportHours} />
            <InfoRow label="Location" value="Bangladesh" />
            <InfoRow label="Response Type" value="Manual support response" />
            <InfoRow
              label="Safe Support Areas"
              value="Academic guidance, research support, formatting, citation, presentation design, study materials, viva and exam preparation."
            />

            <div className="contact-quick-card">
              <h3>Quick action</h3>

              <p>
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
      className="brand-card contact-card"
    >
      <div className="service-icon">{icon}</div>

      <h3>{title}</h3>

      <p className="contact-card-value">{value}</p>

      <p className="contact-card-note">{note}</p>
    </a>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="contact-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="contact-info-row">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}
