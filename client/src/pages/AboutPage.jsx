import Header from "../components/Header";
import Footer from "../components/Footer";

function AboutPage() {
  return (
    <div className="page-layout">
    <Header />
    <main className="page-content">
      <h1>About Us</h1>
      <p>Learn more about Rooted and our community mission.</p>
    </main>
    <Footer/>
    </div>
  );
}

export default AboutPage;