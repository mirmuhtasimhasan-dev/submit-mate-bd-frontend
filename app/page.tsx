import Image from 'next/image'
import Link from 'next/link'

const stats = [
  ['10K+', 'Happy Students'],
  ['25K+', 'Support Requests'],
  ['99%', 'Satisfaction'],
  ['24/7', 'Friendly Help'],
]

const supportAreas = [
  {
    icon: '📝',
    title: 'Assignment Guidance',
    desc: 'Topic, structure, outline, improvement suggestions, and study support.',
  },
  {
    icon: '📊',
    title: 'Presentation Design',
    desc: 'Modern slides for class, seminar, project, and viva presentation.',
  },
  {
    icon: '📄',
    title: 'Report Formatting',
    desc: 'APA/MLA style, clean layout, reference formatting, and document polish.',
  },
  {
    icon: '🎯',
    title: 'Exam Preparation',
    desc: 'Short notes, concept explanation, practice materials, and revision support.',
  },
]

const reasons = [
  {
    icon: '🛡️',
    title: 'Safe & Confidential',
    desc: 'Your files and information stay protected.',
  },
  {
    icon: '⏱️',
    title: 'On-Time Support',
    desc: 'Track your request from dashboard.',
  },
  {
    icon: '📚',
    title: 'Learning Friendly',
    desc: 'Support designed to help you understand better.',
  },
]

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="site-container">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <span className="badge home-badge">
                We Got You • Academic Support Platform
              </span>

              <h1 className="home-hero-title">
                Make Your Study Life
                <span>Easier & Smarter</span>
              </h1>

              <p className="home-hero-text">
                Submit Mate BD helps students with assignment guidance,
                presentation design, report formatting, citation support, study
                materials, and exam preparation, all in one friendly platform.
              </p>

              <div className="home-actions">
                <Link href="/order" className="btn-main">
                  Submit Request
                </Link>

                <Link href="/services" className="btn-blue">
                  Services
                </Link>

                <Link href="/packages" className="btn-outline">
                  Packages
                </Link>
              </div>

              <div className="home-stats">
                {stats.map(([num, label]) => (
                  <div key={label} className="home-stat-card">
                    <h3>{num}</h3>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-image poster-frame">
              <Image
                src="/images/live-banner.png"
                alt="Submit Mate BD live academic support"
                width={1200}
                height={1200}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="site-container">
          <div className="home-dark-grid dark-card">
            <div>
              <span className="badge badge-dark">Why Students Choose Us</span>

              <h2>
                Friendly Support. Clear Guidance. Better Confidence.
              </h2>
            </div>

            {reasons.map((item) => (
              <div key={item.title} className="home-dark-item">
                <div>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="site-container">
          <div className="home-section-head">
            <span className="badge">Our Support Areas</span>

            <h2>Everything students usually need, organized in one place.</h2>
          </div>

          <div className="home-card-grid">
            {supportAreas.map((item) => (
              <div key={item.title} className="brand-card home-support-card">
                <div className="service-icon">{item.icon}</div>

                <h3>{item.title}</h3>

                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="site-container">
          <div className="home-image-grid">
            <div className="poster-frame">
              <Image
                src="/images/quality.png"
                alt="Trust and quality support"
                width={1200}
                height={1200}
              />
            </div>

            <div className="poster-frame">
              <Image
                src="/images/formatting.png"
                alt="Report formatting support"
                width={1200}
                height={1200}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-last-section">
        <div className="site-container">
          <div className="dark-card home-final-cta">
            <span className="badge badge-dark">Ready to Start?</span>

            <h2>
              Focus on study. Let Submit Mate BD guide the support process.
            </h2>

            <p>
              Create your request, upload files, choose package, and track your
              support status from dashboard.
            </p>

            <div className="home-actions home-actions-center">
              <Link href="/order" className="btn-main">
                Submit Request
              </Link>

              <Link href="/packages" className="btn-outline">
                See Packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}