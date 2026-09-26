import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import logo from "../assets/mts-logo.png";
import { loginUser } from "../api/authApi";

export default function AdminLogin() {
  const navigate = useNavigate();

  // =========================================================
  // ALREADY LOGGED-IN ADMIN CHECK
  // =========================================================

  useEffect(() => {
    const token =
      localStorage.getItem("mts_token") ||
      sessionStorage.getItem("mts_token");

    const userData =
      localStorage.getItem("mts_user") ||
      sessionStorage.getItem("mts_user");

    if (!token || !userData) {
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role === "Admin") {
        navigate("/admin-dashboard", {
          replace: true,
        });
      }
    } catch {
      localStorage.removeItem("mts_token");
      localStorage.removeItem("mts_user");

      sessionStorage.removeItem("mts_token");
      sessionStorage.removeItem("mts_user");
    }
  }, [navigate]);

  // =========================================================
  // STATE
  // =========================================================

  const [email, setEmail] = useState("admin@mts.com");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (!result.success || !result.token) {
        setError(
          result.message || "Login failed."
        );
        return;
      }

      // =====================================================
      // ADMIN ROLE VALIDATION
      // =====================================================

      if (result.role !== "Admin") {
        setError(
          "This login is only available for administrators."
        );
        return;
      }

      // =====================================================
      // CLEAR OLD LOGIN DATA
      // =====================================================

      localStorage.removeItem("mts_token");
      localStorage.removeItem("mts_user");

      sessionStorage.removeItem("mts_token");
      sessionStorage.removeItem("mts_user");

      // =====================================================
      // SELECT STORAGE
      // =====================================================

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      // =====================================================
      // STORE TOKEN
      // =====================================================

      storage.setItem(
        "mts_token",
        result.token
      );

      // =====================================================
      // STORE USER
      // =====================================================

      storage.setItem(
        "mts_user",
        JSON.stringify({
          userId: result.userId,
          fullName: result.fullName,
          email: result.email,
          role: result.role,
        })
      );

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      navigate("/admin-dashboard");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to MTS API."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main
      className="min-vh-100 d-flex align-items-center"
      style={{
        background:
          "linear-gradient(135deg, #f5f9ff 0%, #eef5ff 50%, #ffffff 100%)",
      }}
    >
      <div className="container-fluid px-3 px-lg-5 py-5">

        <div className="row justify-content-center align-items-center g-5">

          {/* =================================================
              LEFT BRAND PANEL
          ================================================= */}

          <div className="col-lg-6 col-xl-6 d-none d-lg-block">

            <div
              className="px-xl-5"
              style={{
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >

              {/* BRAND */}
              <div className="mb-5">

                <img
                  src={logo}
                  alt="Manish Technology Solution"
                  style={{
                    width: "210px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />

              </div>

              {/* ADMIN LABEL */}
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill bg-primary bg-opacity-10 text-primary mb-4">

                <ShieldCheck
                  size={17}
                  className="me-2"
                />

                <span className="small fw-semibold">
                  SECURE ADMINISTRATION
                </span>

              </div>

              {/* HEADING */}
              <h1
                className="fw-bold mb-3"
                style={{
                  fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                  lineHeight: "1.1",
                }}
              >
                Manage your
                <br />

                <span className="text-primary">
                  MTS business
                </span>{" "}
                from one place.
              </h1>

              <p
                className="text-secondary fs-5 mb-5"
                style={{
                  maxWidth: "580px",
                  lineHeight: "1.7",
                }}
              >
                Manage project inquiries, clients,
                projects, proposals, milestones,
                documents and client communication
                through your centralized admin portal.
              </p>

              {/* FEATURES */}
              <div className="row g-3">

                {/* FEATURE 1 */}
                <div className="col-md-6">

                  <div className="d-flex align-items-start">

                    <div
                      className="rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                      }}
                    >
                      <FolderKanban
                        size={21}
                        className="text-primary"
                      />
                    </div>

                    <div className="ms-3">

                      <div className="fw-semibold">
                        Project Management
                      </div>

                      <div className="small text-secondary mt-1">
                        Track projects and milestones.
                      </div>

                    </div>

                  </div>

                </div>

                {/* FEATURE 2 */}
                <div className="col-md-6">

                  <div className="d-flex align-items-start">

                    <div
                      className="rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                      }}
                    >
                      <Users
                        size={21}
                        className="text-primary"
                      />
                    </div>

                    <div className="ms-3">

                      <div className="fw-semibold">
                        Client Management
                      </div>

                      <div className="small text-secondary mt-1">
                        Manage clients and accounts.
                      </div>

                    </div>

                  </div>

                </div>

                {/* FEATURE 3 */}
                <div className="col-md-6">

                  <div className="d-flex align-items-start">

                    <div
                      className="rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                      }}
                    >
                      <MessageSquare
                        size={21}
                        className="text-primary"
                      />
                    </div>

                    <div className="ms-3">

                      <div className="fw-semibold">
                        Client Communication
                      </div>

                      <div className="small text-secondary mt-1">
                        Stay connected with clients.
                      </div>

                    </div>

                  </div>

                </div>

                {/* FEATURE 4 */}
                <div className="col-md-6">

                  <div className="d-flex align-items-start">

                    <div
                      className="rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                      }}
                    >
                      <CheckCircle2
                        size={21}
                        className="text-primary"
                      />
                    </div>

                    <div className="ms-3">

                      <div className="fw-semibold">
                        Secure Workspace
                      </div>

                      <div className="small text-secondary mt-1">
                        Protected admin access.
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* TAGLINE */}
              <div className="mt-5">

                <span className="small fw-semibold text-primary">
                  THINK
                </span>

                <span className="text-secondary mx-2">
                  |
                </span>

                <span className="small fw-semibold text-primary">
                  BUILD
                </span>

                <span className="text-secondary mx-2">
                  |
                </span>

                <span className="small fw-semibold text-primary">
                  GROW TOGETHER
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================= */}

          <div className="col-12 col-md-8 col-lg-5 col-xl-4">

            <div
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
              style={{
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >

              {/* TOP ACCENT */}
              <div
                style={{
                  height: "5px",
                  background:
                    "linear-gradient(90deg, #0d6efd, #0dcaf0)",
                }}
              />

              <div className="card-body p-4 p-md-5">

                {/* MOBILE LOGO */}
                <div className="d-lg-none text-center mb-4">

                  <img
                    src={logo}
                    alt="Manish Technology Solution"
                    style={{
                      width: "175px",
                      height: "auto",
                    }}
                  />

                </div>

                {/* LOGIN ICON */}
                <div className="text-center mb-4">

                  <div
                    className="mx-auto rounded-4 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                    style={{
                      width: "64px",
                      height: "64px",
                    }}
                  >
                    <ShieldCheck
                      size={32}
                      className="text-primary"
                    />
                  </div>

                  <div className="mt-3">

                    <div className="small text-uppercase text-primary fw-semibold">
                      MTS Administration
                    </div>

                    <h2 className="h3 fw-bold mb-2 mt-1">
                      Welcome back
                    </h2>

                    <p className="text-secondary mb-0">
                      Sign in to manage your MTS portal.
                    </p>

                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <div
                    className="alert alert-danger rounded-3 small"
                    role="alert"
                  >
                    <div className="fw-semibold mb-1">
                      Login failed
                    </div>

                    <div>
                      {error}
                    </div>
                  </div>
                )}

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                >

                  {/* EMAIL */}
                  <div className="mb-4">

                    <label
                      htmlFor="admin-email"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <div className="input-group input-group-lg">

                      <span className="input-group-text bg-light border-end-0">
                        <Mail
                          size={19}
                          className="text-secondary"
                        />
                      </span>

                      <input
                        type="email"
                        id="admin-email"
                        className="form-control bg-light border-start-0"
                        placeholder="admin@mts.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        disabled={loading}
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}
                  <div className="mb-3">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                      <label
                        htmlFor="admin-password"
                        className="form-label fw-semibold mb-0"
                      >
                        Password
                      </label>

                    </div>

                    <div className="input-group input-group-lg">

                      <span className="input-group-text bg-light border-end-0">
                        <LockKeyhole
                          size={19}
                          className="text-secondary"
                        />
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        id="admin-password"
                        className="form-control bg-light border-start-0 border-end-0"
                        placeholder="Enter password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        disabled={loading}
                      />

                      <button
                        type="button"
                        className="btn btn-light border border-start-0"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            size={19}
                            className="text-secondary"
                          />
                        ) : (
                          <Eye
                            size={19}
                            className="text-secondary"
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* REMEMBER */}
                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div className="form-check">

                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberAdmin"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                        disabled={loading}
                      />

                      <label
                        className="form-check-label small text-secondary"
                        htmlFor="rememberAdmin"
                      >
                        Keep me signed in
                      </label>

                    </div>

                    <span className="small text-secondary">
                      Admin access
                    </span>

                  </div>

                  {/* SIGN IN */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center shadow-sm"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />

                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In to Admin Portal

                        <ArrowRight
                          size={18}
                          className="ms-2"
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* SECURITY */}
                <div className="mt-4">

                  <div
                    className="rounded-3 p-3"
                    style={{
                      background:
                        "#f8f9fa",
                    }}
                  >

                    <div className="d-flex align-items-start">

                      <ShieldCheck
                        size={19}
                        className="text-primary flex-shrink-0 mt-1"
                      />

                      <div className="ms-2">

                        <div className="small fw-semibold">
                          Secure Admin Access
                        </div>

                        <div className="small text-secondary mt-1">
                          This area is restricted to
                          authorized MTS administrators.
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* CLIENT LOGIN */}
            <div className="text-center mt-4">

              <span className="small text-secondary">
                Are you a client?
              </span>

              <Link
                to="/client-login"
                className="small text-primary text-decoration-none fw-semibold ms-1"
              >
                Client Login
              </Link>

            </div>

            {/* BACK TO WEBSITE */}
            <div className="text-center mt-2">

              <Link
                to="/"
                className="small text-secondary text-decoration-none"
              >
                ← Back to MTS website
              </Link>

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="text-center mt-5">

          <div className="small text-secondary">
            © {new Date().getFullYear()} Manish Technology Solution
          </div>

          <div className="small text-secondary mt-1">
            THINK | BUILD | GROW TOGETHER
          </div>

        </div>

      </div>
    </main>
  );
}