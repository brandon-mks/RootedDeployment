import { Avatar } from "@mui/material";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router";

import { useAuth } from "../context/AuthContext.jsx";

function getNavLinkClass({ isActive }) {
  return isActive
    ? "site-nav-link site-nav-link--active"
    : "site-nav-link";
}

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
      {!isLandingPage && (
        <NavLink to="/" end className={getNavLinkClass}>
          Home
        </NavLink>
      )}

      <NavLink to="/discover" className={getNavLinkClass}>
        Discover
      </NavLink>

      <NavLink to="/connect" className={getNavLinkClass}>
        Connect
      </NavLink>

      {user ? (
        <div className="navbar-user">
          <Link to="/user" className="navbar-profile-link">
            <Avatar
              src={user.avatar_url || ""}
              alt={user.username || "Profile"}
              className="navbar-avatar"
            />

            <span className="navbar-username">{user.username}</span>
          </Link>

          <button
            type="button"
            className="navbar-login"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `navbar-login ${getNavLinkClass({ isActive })}`
          }
        >
          Log in
        </NavLink>
      )}
    </nav>
  );
}

export default Navbar;
