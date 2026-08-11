import Header from "./Header";
import Footer from "./Footer";
import logo from "../assets/Rooted Logo.png";
import FeaturedSection from "./FeaturedSection";

function LandingPage() {

  return (
    <div className="page-layout">
      <Header showLogo={false} />

      <main className="page-content">
        <section className="landing-hero">
          <div className="hero-brand">
            <img src={logo} alt="Rooted" className="hero-logo" />
            <p className="hero-eyebrow">Rooted in your community</p>
          </div>

          <div className="featured-area" id="explore">
            <h1>Where would you like to start?</h1>
            <FeaturedSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
