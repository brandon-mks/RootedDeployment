import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link to="/">Home</Link>
      {user ? (
        <button type="button" className="navbar-login" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <Link to="/login" className="navbar-login">
          Log in
        </Link>
      )}
      <Link to="/chat">Chat</Link>
    </nav>
  );
}

export default Navbar;
