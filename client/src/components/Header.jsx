import logo from "../assets/Rooted Logo.png";
import Navbar from "./Navbar";

function Header({ showLogo = true }) {
  return (
    <header className={`site-header ${showLogo ? "" : "landing-header"}`}>
      {showLogo && (
        <img src={logo} alt="Rooted" className="header-logo" />
      )}
      <Navbar />
    </header>
  );
}

export default Header;
