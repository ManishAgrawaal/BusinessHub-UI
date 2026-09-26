import { Link, NavLink } from "react-router-dom";
import { Menu, ArrowRight } from "lucide-react";
import logo from "../assets/mts-logo.png";

export default function Header() {
  return (
    <header className="mts-header sticky-top">
      <nav className="navbar navbar-expand-lg bg-white">
        <div className="container">

          {/* Logo */}
          <Link
  to="/"
  className="navbar-brand mts-navbar-brand"
>
  <img
    src={logo}
    alt="MTS"
    className="mts-logo"
  />

  <div className="mts-brand-name">
    <div className="mts-brand-title">
      Manish <span>Technology</span>
    </div>

    <div className="mts-brand-subtitle">
      Solution
    </div>
  </div>
</Link>

          {/* Mobile Menu */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mtsNavbar"
            aria-controls="mtsNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <Menu size={24} />
          </button>

          {/* Navigation */}
          <div
            className="collapse navbar-collapse"
            id="mtsNavbar"
          >
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

              {/* Home */}
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link mts-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                Home
              </NavLink>

              {/* Services */}
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `nav-link mts-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                Services
              </NavLink>

              {/* Case Studies */}
              <NavLink
                to="/case-studies"
                className={({ isActive }) =>
                  `nav-link mts-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                Case Studies
              </NavLink>

              {/* About Us */}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-link mts-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                About Us
              </NavLink>

              {/* Contact */}
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link mts-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                Contact
              </NavLink>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mt-3 mt-lg-0 ms-lg-2">

                {/* Client Login */}
                <Link
                  to="/client-login"
                  className="btn mts-login-btn"
                >
                  Client Login
                </Link>

                {/* Start a Project */}
                <Link
                  to="/contact"
                  className="btn mts-primary-btn"
                >
                  <span>Start a Project</span>
                  <ArrowRight size={16} />
                </Link>

              </div>

            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}