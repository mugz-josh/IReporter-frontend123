import { HelpCircle, Mail, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";



export default function Support() {
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: t('support.faq.q1'),
      answer: t('support.faq.a1')
    },
    {
      question: t('support.faq.q2'),
      answer: t('support.faq.a2')
    },
    {
      question: t('support.faq.q3'),
      answer: t('support.faq.a3')
    },
    {
      question: t('support.faq.q4'),
      answer: t('support.faq.a4')
    },
    {
      question: t('support.faq.q5'),
      answer: t('support.faq.a5')
    },
    {
      question: t('support.faq.q6'),
      answer: t('support.faq.a6')
    },
    {
      question: t('support.faq.q7'),
      answer: t('support.faq.a7')
    },
    {
      question: t('support.faq.q8'),
      answer: t('support.faq.a8')
    }
  ];

  const tips = [
    {
      title: t('support.tips.1.title'),
      description: t('support.tips.1.description')
    },
    {
      title: t('support.tips.2.title'),
      description: t('support.tips.2.description')
    },
    {
      title: t('support.tips.3.title'),
      description: t('support.tips.3.description')
    },
    {
      title: t('support.tips.4.title'),
      description: t('support.tips.4.description')
    },
    {
      title: t('support.tips.5.title'),
      description: t('support.tips.5.description')
    },
    {
      title: t('support.tips.6.title'),
      description: t('support.tips.6.description')
    },
    {
      title: t('support.tips.7.title'),
      description: t('support.tips.7.description')
    },
    {
      title: t('support.tips.8.title'),
      description: t('support.tips.8.description')
    }
  ];

  return (
    <div className="page-dashboard">
      <aside className="page-aside">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <HelpCircle className="text-primary-foreground" size={20} />
          </div>
          <h1 className="sidebar-title">{t('support.title')}</h1>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-subtitle">
              <HelpCircle size={20} />
              <span>{t('support.subtitle')}</span>
            </div>
            <h2 className="text-2xl font-semibold">{t('support.title')}</h2>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <HelpCircle size={24} style={{ color: "hsl(var(--primary))" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
              {t('support.faq.title')}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  style={{
                    width: "100%",
                    padding: "1.25rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "hsl(var(--foreground))"
                  }}
                >
                  <span>{faq.question}</span>
                  {expandedFAQ === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedFAQ === index && (
                  <div
                    style={{
                      padding: "0 1.25rem 1.25rem 1.25rem",
                      color: "hsl(var(--muted-foreground))",
                      lineHeight: "1.6",
                      borderTop: "1px solid hsl(var(--border))"
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Mail size={24} style={{ color: "hsl(var(--primary))" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
              {t('support.contact.title')}
            </h3>
          </div>

          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.75rem",
            padding: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "1rem" }}>
                  {t('support.contact.getInTouch')}
                </h4>
                <p style={{ color: "hsl(var(--muted-foreground))", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  {t('support.contact.description')}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Mail size={18} style={{ color: "hsl(var(--primary))" }} />
                    <div>
                      <div style={{ fontWeight: "500", color: "hsl(var(--foreground))" }}>{t('support.contact.adminEmail')}</div>
                      <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                        joshua.mugisha.upti@gmail.com
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Mail size={18} style={{ color: "hsl(var(--primary))" }} />
                    <div>
                      <div style={{ fontWeight: "500", color: "hsl(var(--foreground))" }}>{t('support.contact.contactForHelp')}</div>
                      <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                        0754316375
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "1rem" }}>
                  {t('support.contact.responseTimes')}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{t('support.contact.generalInquiries')}</span>
                    <span style={{ fontWeight: "500", color: "hsl(var(--foreground))" }}>24-48 hours</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{t('support.contact.urgentReports')}</span>
                    <span style={{ fontWeight: "500", color: "hsl(var(--foreground))" }}>12 hours</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{t('support.contact.technicalIssues')}</span>
                    <span style={{ fontWeight: "500", color: "hsl(var(--foreground))" }}>6-12 hours</span>
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "hsl(var(--muted))", borderRadius: "0.5rem" }}>
                  <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", margin: 0 }}>
                    <strong>Emergency:</strong> {t('support.contact.emergency').replace('Emergency: ', '')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Lightbulb size={24} style={{ color: "hsl(var(--primary))" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
              {t('support.tips.title')}
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {tips.map((tip, index) => (
              <div
                key={index}
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "hsl(var(--primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>
                      {tip.title}
                    </h4>
                    <p style={{ color: "hsl(var(--muted-foreground))", lineHeight: "1.6", margin: 0 }}>
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.75rem",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "1rem" }}>
            {t('support.quickActions.title')}
          </h4>
          <p style={{ color: "hsl(var(--muted-foreground))", marginBottom: "1.5rem", maxWidth: "600px", margin: "0 auto 1.5rem auto" }}>
            {t('support.quickActions.description')}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                // Try to initiate phone call, fallback to alert
                try {
                  window.location.href = 'tel:0754316375';
                } catch (e) {
                  alert('Contact Support: 0754316375\nEmail: joshua.mugisha.upti@gmail.com');
                }
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(var(--primary) / 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "hsl(var(--primary))";
              }}
            >
              <Mail size={18} />
              {t('support.quickActions.contactSupport')}
            </button>
            <button
              style={{
                padding: "0.75rem 1.5rem",
                background: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(var(--muted) / 0.8)";
              }}
              onMouseLeave={(e) => {
                
                e.currentTarget.style.background = "hsl(var(--muted))";
              }}
            >
              <HelpCircle size={18} />
              {t('support.quickActions.browseFAQ')}
            </button>
          </div>
        </div>
      </main>
    
    </div>
  );
}
