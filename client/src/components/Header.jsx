import logo from "../assets/Rooted Logo.png";

function Header({ showLogo = true }) {
  return (
    <header className={`site-header ${showLogo ? "" : "landing-header"}`}>
      {showLogo && (
        <img src={logo} alt="Rooted" className="header-logo" />
      )}
    </header>
  );
}

export default Header;
