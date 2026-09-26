import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  LockKeyhole,
  Mail,
  MessageSquare,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import logo from "../assets/mts-logo.png";
import { loginUser } from "../api/authApi";

export default function ClientLogin() {
  const navigate = useNavigate();

  // =========================================================
  // ALREADY LOGGED-IN CLIENT CHECK
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

      if (user.role === "Client") {
        navigate("/client-dashboard", {
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

  const [email, setEmail] = useState("");
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
      // CLIENT ROLE VALIDATION
      // =====================================================

      if (result.role !== "Client") {
        setError(
          "This login is only available for clients."
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
      // STORE JWT TOKEN
      // =====================================================

      storage.setItem(
        "mts_token",
        result.token
      );

      // =====================================================
      // STORE USER INFORMATION
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

      navigate("/client-dashboard");

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
              LEFT BRAND / CLIENT PANEL
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

              {/* CLIENT LABEL */}
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill bg-primary bg-opacity-10 text-primary mb-4">

                <ShieldCheck
                  size={17}
                  className="me-2"
                />

                <span className="small fw-semibold">
                  SECURE CLIENT PORTAL
                </span>

              </div>

              {/* HEADING */}
              <h1
                className="fw-bold mb-3"
                style={{
                  fontSize:
                    "clamp(2.2rem, 4vw, 3.5rem)",
                  lineHeight: "1.1",
                }}
              >
                Your project.
                <br />

                <span className="text-primary">
                  Your workspace.
                </span>
              </h1>

              <p
                className="text-secondary fs-5 mb-5"
                style={{
                  maxWidth: "580px",
                  lineHeight: "1.7",
                }}
              >
                Stay connected with your MTS project
                team, track progress, review proposals,
                exchange messages and manage your
                project documents from one secure place.
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
                        My Projects
                      </div>

                      <div className="small text-secondary mt-1">
                        Track your active projects.
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
                      <FileText
                        size={21}
                        className="text-primary"
                      />
                    </div>

                    <div className="ms-3">

                      <div className="fw-semibold">
                        Proposals
                      </div>

                      <div className="small text-secondary mt-1">
                        Review quotes and proposals.
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
                        Team Messages
                      </div>

                      <div className="small text-secondary mt-1">
                        Communicate with your team.
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
                        Project Progress
                      </div>

                      <div className="small text-secondary mt-1">
                        Follow milestones and delivery.
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

                {/* LOGIN ICON + HEADING */}
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
                      MTS CLIENT PORTAL
                    </div>

                    <h2 className="h3 fw-bold mb-2 mt-1">
                      Welcome back
                    </h2>

                    <p className="text-secondary mb-0">
                      Sign in to access your project workspace.
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
                      htmlFor="client-email"
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
                        id="client-email"
                        className="form-control bg-light border-start-0"
                        placeholder="you@company.com"
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
                        htmlFor="client-password"
                        className="form-label fw-semibold mb-0"
                      >
                        Password
                      </label>

                      <Link
                        to="#forgot-password"
                        className="small text-primary text-decoration-none"
                      >
                        Forgot password?
                      </Link>

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
                        id="client-password"
                        className="form-control bg-light border-start-0 border-end-0"
                        placeholder="Enter your password"
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

                  {/* REMEMBER ME */}
                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div className="form-check">

                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberClient"
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
                        htmlFor="rememberClient"
                      >
                        Keep me signed in
                      </label>

                    </div>

                    <span className="small text-secondary">
                      Client access
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
                        Sign In to Client Portal

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
                          Secure Client Access
                        </div>

                        <div className="small text-secondary mt-1">
                          Your projects, proposals and
                          documents are accessible only
                          to authorized users.
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ADMIN LOGIN */}
            <div className="text-center mt-4">

              <span className="small text-secondary">
                Are you an administrator?
              </span>

              <Link
                to="/admin-login"
                className="small text-primary text-decoration-none fw-semibold ms-1"
              >
                Admin Login
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