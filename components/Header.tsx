'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/packages', label: 'Packages' },
    { href: '/order', label: 'Submit Request' },
    { href: '/contact', label: 'Contact' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand-link" onClick={() => setOpen(false)}>
          <img
            src="/images/logo.png"
            alt="Submit Mate BD"
            width={58}
            height={58}
            className="brand-logo"
          />

          <div className="brand-text">
            <div className="brand-title">
              Submit Mate <span>BD</span>
            </div>

            <div className="brand-subtitle">
              Academic Support Platform
            </div>
          </div>
        </Link>

        <nav className="desktop-nav">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/login" className="btn-outline">
            Login
          </Link>

          <Link href="/order" className="btn-main">
            Get Support
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="mobile-panel">
          <div className="site-container mobile-panel-inner">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="mobile-panel-actions">
              <Link
                href="/login"
                className="btn-outline"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>

              <Link
                href="/order"
                className="btn-main"
                onClick={() => setOpen(false)}
              >
                Get Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}