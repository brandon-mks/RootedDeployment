import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "@mui/material";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLandingPage = pathname === "/";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="site-nav" aria-label="Main navigation">
      {!isLandingPage && <Link to="/">Home</Link>}

      {user ? (
        <div className="navbar-user">
          <Link to="/user" className="navbar-profile-link">
            <Avatar
              src={user?.avatar_url || ""}
              alt={user?.username || "Profile"}
              className="navbar-avatar"
            />
            <span className="navbar-username">{user?.username}</span>
          </Link>
          <button type="button" className="navbar-login" onClick={handleLogout}>
            Log out
          </button>
        </div>
      ) : (
        <Link to="/login" className="navbar-login">
          Log in
        </Link>
      )}
      <Link to="/discover">Discover</Link>
      <Link to="/connect">Connect</Link>
    </nav>
  );
}

export default Navbar;
