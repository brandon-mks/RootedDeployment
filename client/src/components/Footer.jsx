import { Link } from "react-router";
import logo from "../assets/Rooted Logo.png";

function Footer() {
  return (
    <footer className="site-footer">
      <img src={logo} alt="Rooted" className="footer-logo" />
      {/* <p>Made for the places we call home.</p> */}

      <nav className="footer-navigation" aria-label="Footer navigation">
        <Link to="/about">About Us</Link>
        <Link to="/support">Support</Link>
      </nav>
    </footer>
  );
}

export default Footer;