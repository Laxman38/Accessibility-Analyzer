import React from 'react'

const HeroSection = () => {
  return (
    <div className="hero-section">
      {/* hero section  */}
      <div className="hero-badge">
        <span className="badge-icon">🛡️</span>
        WCAG & ADA Compliance Testing
      </div>
      <h1 className="hero-title">
        Accessibility <br /> <span className="hero-highlight">Analyzer</span>
      </h1>
      <p className="hero-description">
        Scan websites and code for accessibility issues. Get instant, actionable
        feedback to create digital experiences that everyone can use.
      </p>

      {/* Feature Cards  */}
      <div className="feature-cards">
        <FeatureCard
          icon="🔍"
          title="Automated Scanning"
          description="Check alt text, color contrast, ARIA tags, and more"
        />
        <FeatureCard
          icon="📋"
          title="Detailed Reports"
          description="Categorized issues with severity levels and locations"
        />
        <FeatureCard
          icon="✅"
          title="Fix Guidance"
          description="Code snippets and best practices for every issue"
        />
      </div>
    </div>
  );
}

export default HeroSection

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}
