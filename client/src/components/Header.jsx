import { Link } from "react-router";

import logo from "../assets/Rooted Logo.png";
import Navbar from "./Navbar";

function Header({ showLogo = true }) {
  return (
    <header className={`site-header ${showLogo ? "" : "landing-header"}`}>
      {showLogo && (
        <Link
          to="/"
          className="header-logo-link"
          aria-label="Return to the Rooted landing page"
        >
          <img src={logo} alt="Rooted" className="header-logo" />
        </Link>
      )}
      <Navbar />
    </header>
  );
}

export default Header;
