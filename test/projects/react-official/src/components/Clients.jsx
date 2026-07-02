const clients = [
  { name: "Stripe", logo: "S" },
  { name: "Airbnb", logo: "A" },
  { name: "Spotify", logo: "Sp" },
  { name: "Shopify", logo: "Sh" },
  { name: "Slack", logo: "Sl" },
  { name: "Notion", logo: "N" },
];

export default function Clients() {
  return (
    <section className="slide" id="clients">
      <p id="clients-label">Trusted by industry leaders</p>
      <div className="clients-grid">
        {clients.map((client, i) => (
          <div className="client-logo-item" key={i}>
            <div
              className="client-logo-img"
              id={`client-logo-${i}`}
            >
              {client.logo}
            </div>
            <span className="client-logo-name" id={`client-name-${i}`}>
              {client.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
