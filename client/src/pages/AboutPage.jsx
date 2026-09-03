import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

import GitHubIcon from "@mui/icons-material/GitHub";

const creators = [
  {
    name: "Dylan",
    initials: "D",
    github: "",
  },
  {
    name: "Brandon",
    initials: "B",
    github: "https://github.com/brandon-mks",
  },
  {
    name: "Sara",
    initials: "S",
    github: "https://github.com/saracpena",
  },
];

function AboutPage() {
  return (
    <div className="page-layout">
      <Header />

      <main className="page-content about-page">
        {/* <header className="about-hero">
          <p className="hero-eyebrow">Made for the places we call home</p>
          <h1>Find more than a place. Find your place.</h1>
          <p className="about-hero-description">
            Rooted helps people discover the local businesses, gathering
            spaces, events, and opportunities that give a community its
            character.
          </p>
        </header> */}
        <section
          className="about-creators"
          aria-labelledby="about-creators-heading"
        >
          <div className="about-section-heading">
            <p className="about-section-label">Meet the team</p>
            <h2 id="about-creators-heading">The people behind Rooted</h2>
            <p>
              Rooted was imagined and built through a shared commitment to
              thoughtful technology, stronger communities, and experiences
              that help people feel at home.
            </p>
          </div>

          <div className="creator-grid">
            {creators.map((creator) => (
              <article className="creator-card" key={creator.name}>
                <div className="creator-avatar" aria-hidden="true">
                  {creator.initials}
                </div>

                <div className="creator-card-content">
                  <h3>{creator.name}</h3>
                  <p>Co-Creator of Rooted</p>
                </div>

                {creator.github ? (
                  <a
                    className="creator-github-link"
                    href={creator.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${creator.name}'s GitHub profile`}
                  >
                    <GitHubIcon />
                    View GitHub
                  </a>
                ) : (
                  <span className="creator-github-placeholder">
                    GitHub coming soon
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section
          className="about-mission"
          aria-labelledby="about-mission-heading"
        >
          <p className="about-section-label">Our mission</p>

          <h2 id="about-mission-heading">
            Make meaningful local connection easier.
          </h2>

          <p>
            We help people support the places around them, participate in
            their communities, and build a stronger sense of belonging
            wherever they call home.
          </p>
        </section>

        <section
          className="about-story"
          aria-labelledby="about-story-heading"
        >
          <div className="about-story-heading">
            <p className="about-section-label">Why we built Rooted</p>
            <h2 id="about-story-heading">
              Community is all around us. Finding it should be easier.
            </h2>
          </div>

          <div className="about-story-copy">
            <p>
              The places that make a community special are often the easiest
              to overlook. A neighborhood café becomes a morning ritual. A
              farmers market introduces us to the people who grow our food. A
              volunteer opportunity turns good intentions into real impact.
              A local event gives strangers a reason to gather—and sometimes,
              a reason to become friends.
            </p>

            <p>
              Yet discovering these experiences can mean searching across
              scattered websites, social feeds, flyers, and recommendations.
              Rooted was conceived as a simpler, more human way to bring them
              together.
            </p>

            <p>
              We wanted to create more than another directory. We wanted to
              help people discover the life already unfolding around them.
            </p>
          </div>
        </section>

        <section
          className="about-pillars"
          aria-labelledby="about-pillars-heading"
        >
          <div className="about-section-heading">
            <p className="about-section-label">Discover. Connect. Belong.</p>
            <h2 id="about-pillars-heading">
              Two ways to become part of what is nearby.
            </h2>
          </div>

          <div className="about-pillar-grid">
            <article className="about-pillar-card">
              <span className="about-pillar-number" aria-hidden="true">
                01
              </span>
              <h3>Discover</h3>
              <p>
                Find independent businesses, cultural spaces, outdoor
                destinations, markets, and local favorites worth exploring.
              </p>
            </article>

            <article className="about-pillar-card">
              <span className="about-pillar-number" aria-hidden="true">
                02
              </span>
              <h3>Connect</h3>
              <p>
                Find events, volunteer opportunities, workshops,
                performances, and shared experiences that make participation
                easier.
              </p>
            </article>

            <article className="about-pillar-card">
              <span className="about-pillar-number" aria-hidden="true">
                03
              </span>
              <h3>Belong</h3>
              <p>
                Turn nearby places and opportunities into relationships,
                routines, and a community that feels like home.
              </p>
            </article>
          </div>
        </section>

        <section
          className="about-beliefs"
          aria-labelledby="about-beliefs-heading"
        >
          <div>
            <p className="about-section-label">
              Built to be local—wherever local is
            </p>

            <h2 id="about-beliefs-heading">
              Rooted is not about one city, neighborhood, or region.
            </h2>
          </div>

          <div>
            <p>
              It is designed around a feeling that exists everywhere: the
              desire to know the place you live and feel connected to the
              people who share it.
            </p>

            <p>
              Whether someone has lived in a community for years, recently
              moved, or is simply looking for a new way to engage, Rooted
              offers a place to begin.
            </p>
          </div>
        </section>

        {/* <section className="about-closing" aria-labelledby="about-closing-heading">
          <p className="about-section-label">Put down roots</p>
          <h2 id="about-closing-heading">
            Explore what is nearby. Take part in what comes next.
          </h2>
          <p>
            This is your community. Rooted helps you find your place in it.
          </p>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;