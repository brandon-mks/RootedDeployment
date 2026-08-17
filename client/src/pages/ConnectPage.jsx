import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function ConnectPage() {
  return (
    <div className="page-layout">
      <Header />

      <main className="page-content connect-page">
        <header className="connect-page-heading">
          <p className="hero-eyebrow">Connect with your community</p>
          <h1>See what’s happening nearby.</h1>
          <p>
            Find community events and volunteer opportunities around you.
          </p>
        </header>

        <section
          className="connect-options"
          aria-labelledby="connect-options-heading"
        >
          <h2 id="connect-options-heading">How would you like to connect?</h2>

          <div className="connect-options-grid">
            <article className="connect-option-card">
              <h3>Community Events</h3>
              <p>
                Explore gatherings, markets, workshops, and neighborhood
                activities.
              </p>
              <span>Event listings coming soon</span>
            </article>

            <article className="connect-option-card">
              <h3>Volunteer Opportunities</h3>
              <p>
                Find meaningful ways to support organizations in your
                community.
              </p>
              <span>Volunteer listings coming soon</span>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ConnectPage;