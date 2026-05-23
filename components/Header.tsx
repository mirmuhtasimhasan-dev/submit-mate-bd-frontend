import Link from 'next/link'

export default function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(8,31,69,0.10)',
      }}
    >
      <div
        className="site-container"
        style={{
          minHeight: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/images/logo.png"
            alt="Submit Mate BD"
            width={58}
            height={58}
            style={{
              width: 58,
              height: 58,
              objectFit: 'contain',
              borderRadius: 14,
            }}
          />

          <div>
            <div
              style={{
                color: '#06172f',
                fontSize: 21,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              Submit Mate <span style={{ color: '#1463e8' }}>BD</span>
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: 12,
                fontWeight: 800,
                marginTop: 5,
              }}
            >
              Academic Support Platform
            </div>
          </div>
        </Link>

        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            color: '#334155',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/order">Submit Request</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" className="btn-outline">
            Login
          </Link>

          <Link href="/order" className="btn-main">
            Get Support
          </Link>
        </div>
      </div>
    </header>
  )
}