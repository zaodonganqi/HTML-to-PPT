const features = [
  {
    icon: "⚙", // ⚡
    iconClass: "feature-card-icon-1",
    title: "Real-Time Analytics",
    desc: "Stream and process millions of events per second with sub-second latency. Make decisions on live data, not yesterday's reports.",
  },
  {
    icon: "🛡", // 🛡
    iconClass: "feature-card-icon-2",
    title: "Enterprise Security",
    desc: "SOC 2 Type II certified with end-to-end encryption, role-based access controls, and full audit trail capabilities.",
  },
  {
    icon: "🧠", // 🧠
    iconClass: "feature-card-icon-3",
    title: "AI-Powered Insights",
    desc: "Machine learning models that surface anomalies, predict trends, and recommend actions automatically from your data.",
  },
  {
    icon: "🔗", // 🔗
    iconClass: "feature-card-icon-4",
    title: "200+ Integrations",
    desc: "Connect with your entire stack -- databases, warehouses, SaaS tools, and custom APIs through our native connectors.",
  },
  {
    icon: "📈", // 📈
    iconClass: "feature-card-icon-5",
    title: "Custom Dashboards",
    desc: "Build beautiful, interactive dashboards with drag-and-drop widgets. Share with stakeholders in one click.",
  },
  {
    icon: "👥", // 👥
    iconClass: "feature-card-icon-6",
    title: "Team Collaboration",
    desc: "Comment, annotate, and discuss data directly on dashboards. Keep everyone aligned with shared views and alerts.",
  },
];

export default function Features() {
  return (
    <section className="slide" id="features">
      <div className="features-header">
        <p id="features-eyebrow">Why Atlas</p>
        <h2 id="features-title">Everything you need to scale</h2>
        <p id="features-subtitle">
          Purpose-built tools for modern data teams, from ingestion to insight.
        </p>
      </div>
      <div className="features-grid">
        {features.map((feat, i) => (
          <div className="feature-card" key={i} id={`feature-card-${i}`}>
            <div className={`feature-card-icon ${feat.iconClass}`} id={`feature-card-icon-${i}`}>
              {feat.icon}
            </div>
            <h3 className="feature-card-title" id={`feature-card-title-${i}`}>
              {feat.title}
            </h3>
            <p className="feature-card-desc" id={`feature-card-desc-${i}`}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
