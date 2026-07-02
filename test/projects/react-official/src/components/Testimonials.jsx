const testimonials = [
  {
    quote: "Atlas transformed how our data team operates. We went from weekly reports to real-time dashboards, and our decision velocity increased 10x.",
    name: "Sarah Chen",
    role: "VP of Data, Meridian Health",
    initials: "SC",
  },
  {
    quote: "The AI insights feature alone has saved us hundreds of hours. It surfaces patterns we would have missed and lets us focus on strategy instead of number-crunching.",
    name: "Marcus Rivera",
    role: "CTO, PayScale Technologies",
    initials: "MR",
  },
  {
    quote: "We evaluated twelve platforms before choosing Atlas. The combination of ease-of-use, security compliance, and pricing made it the clear winner for our enterprise.",
    name: "Emily Nakamura",
    role: "Director of Engineering, CloudBank",
    initials: "EN",
  },
];

export default function Testimonials() {
  return (
    <section className="slide" id="testimonials">
      <h2 id="testimonials-title">What our customers say</h2>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div className="testimonial-card" key={i} id={`testimonial-card-${i}`}>
            <p className="testimonial-quote" id={`testimonial-quote-${i}`}>
              {t.quote}
            </p>
            <div className="testimonial-author">
              <div
                className="testimonial-avatar-placeholder"
                id={`testimonial-avatar-${i}`}
              >
                {t.initials}
              </div>
              <div>
                <div className="testimonial-name" id={`testimonial-name-${i}`}>
                  {t.name}
                </div>
                <div className="testimonial-role" id={`testimonial-role-${i}`}>
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
