import logo from "../assets/Rooted Logo.png";

function Header() {
  return (
    <header className="site-header">
      <img src={logo} alt="Rooted" className="header-logo" />
    </header>
  );
}

export default Header;