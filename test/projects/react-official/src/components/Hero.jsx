export default function Hero() {
  return (
    <section className="slide" id="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-badge">New: AI-Powered Analytics</span>
          <h1 id="hero-title">
            Transform Data Into{" "}
            <span className="highlight">Decisions</span>
          </h1>
          <p id="hero-subtitle">
            The enterprise intelligence platform that helps teams move faster,
            think clearer, and build better.
          </p>
          <p id="hero-description">
            Atlas combines real-time analytics, AI-driven insights, and
            collaborative workflows into one unified platform. Trusted by over
            10,000 teams worldwide to power their most critical decisions.
          </p>
          <div className="hero-buttons">
            <button id="hero-cta-primary">Start Free Trial</button>
            <button id="hero-cta-secondary">Watch Demo</button>
          </div>
        </div>
        <div className="hero-visual">
          <div id="hero-illustration">
            <div className="hero-glow-orb" id="hero-glow-teal"></div>
            <div className="hero-glow-orb" id="hero-glow-blue"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
