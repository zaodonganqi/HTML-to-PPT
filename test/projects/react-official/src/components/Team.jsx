const team = [
  {
    name: "Alex Thornton",
    role: "CEO & Co-Founder",
    bio: "Former VP Engineering at DataStack. 15 years building enterprise SaaS products.",
    photoClass: "team-photo-1",
    initials: "AT",
  },
  {
    name: "Priya Kapoor",
    role: "CTO & Co-Founder",
    bio: "Ex-Google AI researcher. PhD in Machine Learning from Stanford. 40+ publications.",
    photoClass: "team-photo-2",
    initials: "PK",
  },
  {
    name: "James Okonkwo",
    role: "VP of Product",
    bio: "Led product at Notion and Figma. Passionate about building tools people love.",
    photoClass: "team-photo-3",
    initials: "JO",
  },
  {
    name: "Lena Johansson",
    role: "VP of Design",
    bio: "Award-winning designer. Previously built design systems at Stripe and Apple.",
    photoClass: "team-photo-4",
    initials: "LJ",
  },
];

export default function Team() {
  return (
    <section className="slide" id="team">
      <h2 id="team-title">Meet our leadership</h2>
      <p id="team-subtitle">
        The people behind the product, building the future of data intelligence.
      </p>
      <div className="team-grid">
        {team.map((member, i) => (
          <div className="team-card" key={i} id={`team-card-${i}`}>
            <div
              className={`team-photo-placeholder ${member.photoClass}`}
              id={`team-photo-${i}`}
            >
              {member.initials}
            </div>
            <h3 className="team-name" id={`team-name-${i}`}>
              {member.name}
            </h3>
            <p className="team-role" id={`team-role-${i}`}>
              {member.role}
            </p>
            <p className="team-bio" id={`team-bio-${i}`}>
              {member.bio}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
