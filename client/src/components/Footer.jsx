import { useState } from "react";
import { Link } from "react-router";

import logo from "../assets/Rooted Logo.png";
import SupportDialog from "./SupportDialog.jsx";

function Footer() {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <img src={logo} alt="Rooted" className="footer-logo" />

        <nav className="footer-navigation" aria-label="Footer navigation">
          <Link to="/about">About Us</Link>

          <button
            type="button"
            className="footer-support-button"
            onClick={() => setSupportOpen(true)}
          >
            Support
          </button>
        </nav>
      </footer>

      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </>
  );
}

export default Footer;