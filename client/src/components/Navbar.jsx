import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link to="/">Home</Link>
      <Link to="/login" className="navbar-login">
        Log in</Link>
      <Link to="/chat">Chat</Link>
    </nav>
  );
}

export default Navbar;
