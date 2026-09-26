import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import logo from "../assets/mts-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminMessageNotification {
  messageId: number;
  senderUserId: number;
  senderName: string;
  receiverUserId: number;
  messageText: string;
  projectName?: string | null;
  createdAt: string;
  isRead: boolean;
}

interface AdminMessagesResponse {
  success: boolean;
  messages: AdminMessageNotification[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function getStoredUserId(): number | null {
  try {
    const raw =
      localStorage.getItem("mts_user") ||
      sessionStorage.getItem("mts_user");

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw);
    const userId = Number(user?.userId);

    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}

function formatNotificationTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    AdminMessageNotification[]
  >([]);

  // =========================================================
  // ADMIN NOTIFICATIONS
  // =========================================================

  async function loadNotifications() {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/Messages?_t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const result: AdminMessagesResponse =
        await response.json();

      if (!result.success) {
        return;
      }

      const adminUserId = getStoredUserId();

      const unreadMessages = (result.messages ?? [])
        .filter((item) => {
          const isUnread = !item.isRead;

          if (adminUserId === null) {
            return isUnread;
          }

          return (
            isUnread &&
            item.receiverUserId === adminUserId
          );
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 8);

      setNotifications(unreadMessages);
    } catch {
      // Notification polling is intentionally silent.
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(
      loadNotifications,
      2000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.removeItem("mts_token");
    sessionStorage.removeItem("mts_token");

    localStorage.removeItem("mts_user");
    sessionStorage.removeItem("mts_user");

    setMobileOpen(false);

    navigate("/admin-login");
  }

  // =========================================================
  // ADMIN MENU
  // =========================================================

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Project Inquiries",
      path: "/admin-inquiries",
      icon: FileText,
    },
    {
      label: "Clients",
      path: "/admin-clients",
      icon: Users,
    },
    {
      label: "Projects",
      path: "/admin-projects",
      icon: FolderKanban,
    },
    {
      label: "Milestones",
      path: "/admin-milestones",
      icon: BarChart3,
    },
    {
      label: "Quotes & Proposals",
      path: "/admin-quotes",
      icon: FileCheck2,
    },
    {
      label: "Messages",
      path: "/admin-messages",
      icon: MessageSquare,
    },
    {
      label: "Documents",
      path: "/admin-documents",
      icon: BriefcaseBusiness,
    },
  ];

  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="min-vh-100 bg-light">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div
        className="d-lg-none bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between sticky-top"
        style={{
          zIndex: 1050,
          minHeight: "64px",
        }}
      >
        {/* MOBILE LOGO */}

        <NavLink
          to="/admin-dashboard"
          className="text-decoration-none"
          onClick={closeMobileMenu}
        >
          <img
            src={logo}
            alt="Manish Technology Solution"
            style={{
              width: "140px",
              height: "48px",
              objectFit: "contain",
            }}
          />
        </NavLink>

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="btn btn-light border"
          onClick={() =>
            setMobileOpen((previous) => !previous)
          }
          aria-label="Toggle admin menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          style={{
            zIndex: 1035,
          }}
          onClick={closeMobileMenu}
        />
      )}

      <div className="d-flex">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className={`bg-white border-end ${
            mobileOpen ? "d-block" : "d-none"
          } d-lg-block position-fixed`}
          style={{
            width: "240px",
            height: "100vh",
            top: 0,
            left: 0,
            zIndex: 1040,
          }}
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="border-bottom px-3 d-flex align-items-center"
            style={{
              height: "76px",
            }}
          >
            <NavLink
              to="/admin-dashboard"
              className="text-decoration-none d-flex align-items-center"
              onClick={closeMobileMenu}
            >

              {/* LOGO */}

              <img
                src={logo}
                alt="MTS"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                }}
              />

              {/* COMPANY NAME */}

              <div className="ms-2">

                <div
                  className="fw-bold"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.1",
                    color: "#071a39",
                  }}
                >
                  Manish{" "}
                  <span className="text-primary">
                    Technology
                  </span>
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.1",
                    color: "#071a39",
                  }}
                >
                  Solution
                </div>

              </div>
            </NavLink>
          </div>

          {/* =================================================
              ADMIN LABEL
          ================================================= */}

          <div className="px-3 pt-4 pb-2">
            <div className="small text-uppercase text-secondary fw-semibold">
              Admin Portal
            </div>
          </div>

          {/* =================================================
              MENU
          ================================================= */}

          <nav className="px-2">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `d-flex align-items-center text-decoration-none rounded-3 px-3 py-2 mb-1 ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-dark"
                    }`
                  }
                  style={{
                    transition:
                      "all 0.2s ease",
                  }}
                >

                  <Icon size={18} />

                  <span className="ms-3 small fw-semibold">
                    {item.label}
                  </span>

                </NavLink>
              );
            })}

          </nav>

          {/* =================================================
              SIGN OUT
          ================================================= */}

          <div
            className="position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white"
          >
            <button
              type="button"
              className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center"
              onClick={handleLogout}
            >
              <LogOut
                size={16}
                className="me-2"
              />

              Sign Out
            </button>
          </div>
        </aside>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div
          className="flex-grow-1 admin-main-content"
          style={{
            marginLeft: "240px",
            minWidth: 0,
          }}
        >

          {/* =================================================
              DESKTOP TOP BAR
          ================================================= */}

          <header
            className="bg-white border-bottom d-none d-lg-flex align-items-center justify-content-between px-4"
            style={{
              height: "76px",
            }}
          >

            {/* LEFT */}

            <div>
              <div className="small text-secondary">
                MTS ADMINISTRATION
              </div>
            </div>

            {/* RIGHT */}

            <div className="d-flex align-items-center gap-3">

              {/* NOTIFICATION */}

              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-light border position-relative"
                  title="Notifications"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  onClick={() =>
                    setNotificationOpen(
                      (previous) => !previous
                    )
                  }
                >
                  <Bell size={18} />

                  {notifications.length > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{
                        fontSize: "10px",
                        minWidth: "18px",
                      }}
                    >
                      {notifications.length > 9
                        ? "9+"
                        : notifications.length}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg overflow-hidden"
                    style={{
                      width: "360px",
                      maxWidth: "calc(100vw - 30px)",
                      zIndex: 2000,
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
                      <div>
                        <div className="fw-bold">
                          Notifications
                        </div>
                        <div className="small text-secondary">
                          {notifications.length > 0
                            ? `${notifications.length} unread message${
                                notifications.length === 1
                                  ? ""
                                  : "s"
                              }`
                            : "You're all caught up"}
                        </div>
                      </div>

                      {notifications.length > 0 && (
                        <span className="badge bg-primary-subtle text-primary">
                          New
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        maxHeight: "360px",
                        overflowY: "auto",
                      }}
                    >
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 px-3">
                          <Bell
                            size={28}
                            className="text-secondary mb-2"
                          />
                          <div className="fw-semibold">
                            No new notifications
                          </div>
                          <div className="small text-secondary mt-1">
                            New client messages will appear here automatically.
                          </div>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.messageId}
                            type="button"
                            className="w-100 border-0 border-bottom bg-white text-start px-3 py-3"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/admin-messages");
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <div className="d-flex align-items-start gap-2">
                              <div
                                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                }}
                              >
                                <MessageSquare size={16} />
                              </div>

                              <div className="min-w-0 flex-grow-1">
                                <div className="d-flex justify-content-between gap-2">
                                  <div className="small fw-bold text-dark">
                                    {item.senderName}
                                  </div>
                                  <div className="small text-secondary text-nowrap">
                                    {formatNotificationTime(
                                      item.createdAt
                                    )}
                                  </div>
                                </div>

                                {item.projectName && (
                                  <div className="small text-primary fw-semibold mt-1">
                                    {item.projectName}
                                  </div>
                                )}

                                <div
                                  className="small text-secondary mt-1"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.messageText}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-top">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary w-100"
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("/admin-messages");
                        }}
                      >
                        View All Messages
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ADMIN PROFILE */}

              <div className="d-flex align-items-center">

                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                  }}
                >
                  <Building2 size={18} />
                </div>

                <div className="ms-2">

                  <div className="small fw-bold">
                    MTS Admin
                  </div>

                  <div className="small text-secondary">
                    Administrator
                  </div>

                </div>

              </div>

            </div>
          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <main>
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
