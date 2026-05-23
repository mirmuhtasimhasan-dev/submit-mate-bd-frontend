import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section style={{ padding: '64px 0 46px' }}>
        <div className="site-container">
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 0.95fr',
              gap: 34,
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge">
                We Got You • Academic Support Platform
              </span>

              <h1 className="hero-title" style={{ marginTop: 22 }}>
                Make Your Study Life{' '}
                <span className="highlight">Easier & Smarter</span>
              </h1>

              <p
                style={{
                  marginTop: 20,
                  color: '#475569',
                  fontSize: 18,
                  lineHeight: 1.9,
                  maxWidth: 650,
                }}
              >
                Submit Mate BD helps students with assignment guidance,
                presentation design, report formatting, citation support, study
                materials, and exam preparation — all in one friendly platform.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  marginTop: 28,
                }}
              >
                <Link href="/order" className="btn-main">
                  Submit Request Now
                </Link>

                <Link href="/services" className="btn-blue">
                  Explore Services
                </Link>

                <Link href="/packages" className="btn-outline">
                  View Packages
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 14,
                  marginTop: 32,
                  maxWidth: 680,
                }}
              >
                {[
                  ['10K+', 'Happy Students'],
                  ['25K+', 'Support Requests'],
                  ['99%', 'Satisfaction'],
                  ['24/7', 'Friendly Help'],
                ].map(([num, label]) => (
                  <div key={label} className="stat-card">
                    <h3
                      style={{
                        margin: 0,
                        color: '#1463e8',
                        fontSize: 28,
                        fontWeight: 900,
                      }}
                    >
                      {num}
                    </h3>

                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#64748b',
                        fontWeight: 800,
                      }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="poster-frame">
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

      <section style={{ padding: '30px 0 72px' }}>
        <div className="site-container">
          <div
            className="dark-card"
            style={{
              padding: 36,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 22,
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-dark">Why Students Choose Us</span>

              <h2
                className="brush-text"
                style={{
                  margin: '18px 0 0',
                  fontSize: 42,
                  lineHeight: 1.08,
                  color: 'white',
                }}
              >
                Friendly Support. Clear Guidance. Better Confidence.
              </h2>
            </div>

            {[
              [
                '🛡️',
                'Safe & Confidential',
                'Your files and information stay protected.',
              ],
              [
                '⏱️',
                'On-Time Support',
                'Track your request from dashboard.',
              ],
              [
                '📚',
                'Learning Friendly',
                'Support designed to help you understand better.',
              ],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 24,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 32 }}>{icon}</div>

                <h3
                  style={{
                    margin: '12px 0 8px',
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  {title}
                </h3>

                <p style={{ margin: 0, color: '#dbeafe', lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 76px' }}>
        <div className="site-container">
          <div
            style={{
              textAlign: 'center',
              maxWidth: 760,
              margin: '0 auto 36px',
            }}
          >
            <span className="badge">Our Support Areas</span>

            <h2
              style={{
                margin: '18px 0 0',
                color: '#06172f',
                fontSize: 44,
                lineHeight: 1.1,
                fontWeight: 900,
              }}
            >
              Everything students usually need, organized in one place.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 22,
            }}
          >
            {[
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
            ].map((item) => (
              <div key={item.title} className="brand-card" style={{ padding: 28 }}>
                <div className="service-icon">{item.icon}</div>

                <h3
                  style={{
                    margin: '18px 0 10px',
                    color: '#06172f',
                    fontSize: 23,
                    fontWeight: 900,
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ color: '#64748b', lineHeight: 1.8, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 76px' }}>
        <div className="site-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
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

      <section style={{ padding: '0 0 30px' }}>
        <div className="site-container">
          <div
            className="dark-card"
            style={{
              padding: 46,
              textAlign: 'center',
            }}
          >
            <span className="badge badge-dark">Ready to Start?</span>

            <h2
              style={{
                margin: '18px auto 0',
                maxWidth: 800,
                color: 'white',
                fontSize: 46,
                lineHeight: 1.1,
                fontWeight: 900,
              }}
            >
              Focus on study. Let Submit Mate BD guide the support process.
            </h2>

            <p
              style={{
                margin: '18px auto 0',
                maxWidth: 680,
                color: '#dbeafe',
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Create your request, upload files, choose package, and track your
              support status from dashboard.
            </p>

            <div
              style={{
                marginTop: 28,
                display: 'flex',
                justifyContent: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
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