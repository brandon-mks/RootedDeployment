import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link to="/about">About Us</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/login">Log in</Link>
    </nav>
  );
}

export default Navbar;