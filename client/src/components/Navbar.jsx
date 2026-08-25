import { useState } from "react";
import {
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {
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

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const isLandingPage = pathname === "/";
  const isUserPage = pathname.startsWith("/user");
  const isUserMenuOpen = Boolean(userMenuAnchor);

  const displayName = user?.username
    ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}`
    : "User";

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleUserNavigation = (destination) => {
    handleCloseUserMenu();
    navigate(destination);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
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
        <>
          <button
            type="button"
            id="navbar-user-menu-button"
            className={`navbar-user-trigger${
              isUserPage ? " navbar-user-trigger--active" : ""
            }`}
            aria-controls={
              isUserMenuOpen ? "navbar-user-menu" : undefined
            }
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen ? "true" : undefined}
            onClick={handleOpenUserMenu}
          >
            <Avatar
              src={user.avatar_url || undefined}
              alt={`${displayName}'s profile`}
              className="navbar-avatar"
            >
              {displayName.charAt(0)}
            </Avatar>

            <span className="navbar-username">{displayName}</span>

            <ExpandMoreRoundedIcon
              className={`navbar-user-chevron${
                isUserMenuOpen ? " navbar-user-chevron--open" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <Menu
            id="navbar-user-menu"
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleCloseUserMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            MenuListProps={{
              "aria-labelledby": "navbar-user-menu-button",
              "aria-label": `${displayName} account menu`,
            }}
            slotProps={{
              paper: {
                className: "navbar-user-menu-paper",
              },
            }}
          >
            <MenuItem
              onClick={() => handleUserNavigation("/user")}
              selected={isUserPage}
            >
              <ListItemIcon>
                <DashboardRoundedIcon fontSize="small" />
              </ListItemIcon>

              Dashboard
            </MenuItem>

            <MenuItem
              onClick={() =>
                handleUserNavigation("/user?settings=open")
              }
            >
              <ListItemIcon>
                <SettingsRoundedIcon fontSize="small" />
              </ListItemIcon>

              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>

              Log out
            </MenuItem>
          </Menu>
        </>
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