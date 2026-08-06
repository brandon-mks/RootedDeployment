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
        <h1>Landing Page</h1>

        <section>
          <h2>Explore your community</h2>

          <FeaturedSection
            items={featuredItems}
            loading={isLoading}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;