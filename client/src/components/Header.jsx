import logo from "../assets/Rooted Logo.png";

function Header({ showLogo = false }) {
  return (
    <header className={`site-header ${showLogo ? "" : "landing-header"}`}>
      {showLogo && <img src={logo} alt="Rooted" className="header-logo" />}

      <nav className="site-nav">
        <a href="#explore">Explore</a>
        <a href="#recommend">Recommend</a>
      </nav>
    </header>
  );
}

export default Header;
