import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

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

      {user ? (
        <button
          type="button"
          className="navbar-login"
          onClick={handleLogout}
        >
          Log out
        </button>
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

      <NavLink to="/discover" className={getNavLinkClass}>
        Discover
      </NavLink>

      <NavLink to="/connect" className={getNavLinkClass}>
        Connect
      </NavLink>

      <NavLink to="/chat" className={getNavLinkClass}>
        Chat
      </NavLink>
    </nav>
  );
}

export default Navbar;