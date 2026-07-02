const stats = [
  { number: "10k+", label: "Active Teams" },
  { number: "$2.4B", label: "Revenue Tracked" },
  { number: "99.99%", label: "Uptime SLA" },
  { number: "150M+", label: "Queries per Day" },
];

export default function Stats() {
  const items = [];
  stats.forEach((stat, i) => {
    items.push(
      <div className="stat-item" key={`stat-${i}`}>
        <div className="stat-number" id={`stat-number-${i}`}>
          {stat.number}
        </div>
        <div className="stat-label" id={`stat-label-${i}`}>
          {stat.label}
        </div>
      </div>
    );
    if (i < stats.length - 1) {
      items.push(
        <div className="stat-separator" key={`sep-${i}`} id={`stat-separator-${i}`}></div>
      );
    }
  });

  return (
    <section className="slide" id="stats">
      <div className="stats-inner">{items}</div>
    </section>
  );
}
