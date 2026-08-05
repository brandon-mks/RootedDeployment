import Header from "./Header";
import Footer from "./Footer";

function LandingPage() {
  return (
    <div className="page-layout">
      <Header />

      <main className="page-content">
        <h1>Landing Page</h1>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;