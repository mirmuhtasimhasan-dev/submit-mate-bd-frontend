import Link from 'next/link'

const contact = {
  facebook: 'https://www.facebook.com/share/1KoJ8Y4geU/',
  instagram: 'https://www.instagram.com/submitmatebd?igsh=MW5kZWUweGN6YjQ3aA==',
  whatsapp: '+8801XXXXXXXXX',
  email: 'submitmatebd@gmail.com',
}

export default function Footer() {
  const whatsappLink = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`

  return (
    <footer className="modern-footer">
      <div className="site-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="footer-logo-row">
              <img src="/images/logo.png" alt="Submit Mate BD" />

              <div>
                <h3>Submit Mate BD</h3>
                <p>Academic Support Platform</p>
              </div>
            </Link>

            <p className="footer-short-text">
              Student-friendly academic guidance, formatting, citation,
              presentation, research support, and mentoring.
            </p>
          </div>

          <div className="footer-links-box">
            <h4>Quick Links</h4>

            <div className="footer-links">
              <Link href="/services">Services</Link>
              <Link href="/packages">Packages</Link>
              <Link href="/order">Submit Request</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div className="footer-social-box">
            <h4>Connect</h4>

            <div className="footer-socials">
  <a href={contact.facebook} target="_blank" rel="noreferrer">
    Follow on Facebook
  </a>

  <a href={contact.instagram} target="_blank" rel="noreferrer">
    Follow on Instagram
  </a>

  <a href={whatsappLink} target="_blank" rel="noreferrer">
    Chat on WhatsApp
  </a>
</div>

            <a href={`mailto:${contact.email}`} className="footer-email">
              {contact.email}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Submit Mate BD</span>
          <span>Safe academic support and mentoring.</span>
        </div>
      </div>
    </footer>
  )
}