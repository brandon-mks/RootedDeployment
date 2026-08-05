import logo from "../assets/Rooted Logo.png";

function Footer() {
  return (
    <footer className="site-footer">
      <img src={logo} alt="Rooted" className="footer-logo" />
      <p>Made for the places we call home.</p>
    </footer>
  );
}

export default Footer;