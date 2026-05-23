import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#06172f',
        color: 'white',
        marginTop: 80,
      }}
    >
      <div
        className="site-container"
        style={{
          padding: '58px 0 28px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 32,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                  Submit Mate BD
                </h3>

                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#bfdbfe',
                    fontWeight: 700,
                  }}
                >
                  Academic Support Platform
                </p>
              </div>
            </div>

            <p style={{ marginTop: 18, color: '#dbeafe', lineHeight: 1.8 }}>
              We provide academic guidance, research support, formatting help,
              presentation design, citation support, study materials, viva and
              exam preparation, and mentoring.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 18, fontWeight: 900 }}>Quick Links</h4>

            <div
              style={{
                display: 'grid',
                gap: 12,
                marginTop: 16,
                color: '#dbeafe',
              }}
            >
              <Link href="/services">Services</Link>
              <Link href="/packages">Packages</Link>
              <Link href="/order">Submit Request</Link>
              <Link href="/dashboard">Student Dashboard</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/admin">Admin Panel</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 18, fontWeight: 900 }}>Support Areas</h4>

            <div
              style={{
                display: 'grid',
                gap: 12,
                marginTop: 16,
                color: '#dbeafe',
              }}
            >
              <p style={{ margin: 0 }}>Assignment Guidance</p>
              <p style={{ margin: 0 }}>Research Support</p>
              <p style={{ margin: 0 }}>Report Formatting</p>
              <p style={{ margin: 0 }}>Presentation Design</p>
              <p style={{ margin: 0 }}>Citation Support</p>
              <p style={{ margin: 0 }}>Viva and Exam Preparation</p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 18, fontWeight: 900 }}>
              Academic Integrity
            </h4>

            <p style={{ marginTop: 16, color: '#dbeafe', lineHeight: 1.8 }}>
              Submit Mate BD provides learning support, guidance, formatting,
              and mentoring. Students remain responsible for their own final
              submission.
            </p>

            <Link
              href="/contact"
              className="btn-main"
              style={{ marginTop: 18 }}
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.14)',
            color: '#bfdbfe',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span>© {new Date().getFullYear()} Submit Mate BD. All rights reserved.</span>
          <span>Safe academic support and student mentoring.</span>
        </div>
      </div>
    </footer>
  )
}