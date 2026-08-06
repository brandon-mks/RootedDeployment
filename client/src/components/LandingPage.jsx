import Header from "./Header";
import Footer from "./Footer";
import FeaturedSection from "./FeaturedSection";

function LandingPage() {
  const featuredItems = [];
  const isLoading = true;

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="hero-eyebrow">Rooted in your community</p>

            <h1>Discover more of what’s around you.</h1>

            <p className="hero-description">
              Support local businesses and connect with events happening in your
              community.
            </p>
          </div>

          <div className="featured-area">
            <h2>Where would you like to start?</h2>
            <FeaturedSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
