import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  UserCircle,
  X,
} from "lucide-react";
import logo from "../assets/mts-logo.png";

interface ClientPortalLayoutProps {
  children: ReactNode;
}

interface ClientConversationNotification {
  userId: number;
  userName: string;
  projectId?: number | null;
  projectName?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ClientConversationsResponse {
  success: boolean;
  conversations: ClientConversationNotification[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
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

export default function ClientPortalLayout({
  children,
}: ClientPortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    ClientConversationNotification[]
  >([]);
  const navigate = useNavigate();

  // =====================================================
  // CLIENT NOTIFICATIONS
  // =====================================================

  async function loadNotifications() {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/Messages/my-conversations?_t=${Date.now()}`,
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

      const result: ClientConversationsResponse =
        await response.json();

      if (!result.success) {
        return;
      }

      const unreadConversations = (
        result.conversations ?? []
      )
        .filter(
          (item) => item.unreadCount > 0
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        )
        .slice(0, 8);

      setNotifications(
        unreadConversations
      );
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

  const totalUnread = notifications.reduce(
    (total, item) =>
      total + item.unreadCount,
    0
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("mts_token");
    localStorage.removeItem("mts_user");

    sessionStorage.removeItem("mts_token");
    sessionStorage.removeItem("mts_user");

    // Redirect to login
    navigate("/client-login", {
      replace: true,
    });
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/client-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Projects",
      path: "/client-projects",
      icon: BriefcaseBusiness,
    },
    {
      label: "Project Progress",
      path: "/project-progress",
      icon: BriefcaseBusiness,
    },
    {
      label: "Quotes & Proposals",
      path: "/quotes",
      icon: FileText,
    },
    {
      label: "Messages",
      path: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Documents",
      path: "/documents",
      icon: FileText,
    },
  ];

  return (
    <div className="min-vh-100 bg-light">

      {/* =====================================================
          PORTAL HEADER
      ===================================================== */}

      <header className="bg-white border-bottom sticky-top">
        <div className="container-fluid">
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ minHeight: "72px" }}
          >

            {/* LEFT */}
            <div className="d-flex align-items-center">

              <button
                type="button"
                className="btn btn-light d-lg-none me-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>

            </div>

            {/* RIGHT */}
            <div className="d-flex align-items-center gap-3">

              {/* Notification */}
              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-light position-relative"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  onClick={() =>
                    setNotificationOpen(
                      (previous) => !previous
                    )
                  }
                >
                  <Bell size={19} />

                  {totalUnread > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{
                        fontSize: "10px",
                        minWidth: "18px",
                      }}
                    >
                      {totalUnread > 9
                        ? "9+"
                        : totalUnread}
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
                          {totalUnread > 0
                            ? `${totalUnread} unread message${
                                totalUnread === 1
                                  ? ""
                                  : "s"
                              }`
                            : "You're all caught up"}
                        </div>
                      </div>

                      {totalUnread > 0 && (
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
                            New messages from the MTS team will appear here automatically.
                          </div>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.userId}
                            type="button"
                            className="w-100 border-0 border-bottom bg-white text-start px-3 py-3"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/messages");
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
                                    {item.userName}
                                  </div>
                                  <div className="small text-secondary text-nowrap">
                                    {formatNotificationTime(
                                      item.lastMessageTime
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
                                  {item.lastMessage}
                                </div>

                                <div className="small text-danger fw-semibold mt-1">
                                  {item.unreadCount} unread
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
                          navigate("/messages");
                        }}
                      >
                        View All Messages
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="dropdown">

                <button
                  className="btn btn-light d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <UserCircle
                    size={25}
                    className="text-primary me-2"
                  />

                  <div className="d-none d-md-block text-start">

                    <div className="small fw-semibold">
                      Client
                    </div>

                    <div className="small text-secondary">
                      Client Account
                    </div>

                  </div>

                  <ChevronDown
                    size={16}
                    className="ms-2"
                  />
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">

                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        navigate("/client-profile")
                      }
                    >
                      <UserCircle
                        size={17}
                        className="me-2"
                      />
                      Profile
                    </button>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <LogOut
                        size={17}
                        className="me-2"
                      />
                      Logout
                    </button>
                  </li>

                </ul>

              </div>

            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-white border-end position-fixed top-0 start-0 h-100 ${
          sidebarOpen ? "d-block" : "d-none"
        } d-lg-block`}
        style={{
          width: "260px",
          zIndex: 1050,
        }}
      >

        {/* Portal Branding */}
        <div
          className="d-flex align-items-center px-3 border-bottom"
          style={{ height: "72px" }}
        >
          <NavLink
            to="/client-dashboard"
            className="d-flex align-items-center text-decoration-none"
          >
            <img
              src={logo}
              alt="MTS"
              style={{
                width: "52px",
                height: "52px",
                objectFit: "contain",
              }}
            />

            <div className="ms-2">

              <div
                className="fw-bold"
                style={{
                  fontSize: "14px",
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
                  fontSize: "14px",
                  lineHeight: "1.1",
                  color: "#071a39",
                }}
              >
                Solution
              </div>

            </div>
          </NavLink>
        </div>

        {/* Mobile close */}
        <div className="d-flex justify-content-end d-lg-none px-3 py-2">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-3">

          <div className="small text-uppercase text-secondary fw-semibold px-2 mb-3">
            Client Portal
          </div>

          <div className="d-grid gap-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `d-flex align-items-center text-decoration-none rounded-3 px-3 py-2 ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-dark"
                    }`
                  }
                >
                  <Icon
                    size={19}
                    className="me-3"
                  />

                  <span className="small fw-semibold">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

          </div>
        </div>

        {/* Bottom Help */}
        <div className="position-absolute bottom-0 start-0 w-100 p-3">

          <div className="bg-light rounded-3 p-3">

            <div className="small fw-semibold mb-1">
              Need Help?
            </div>

            <div className="small text-secondary mb-2">
              Contact your MTS project team.
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary w-100"
              onClick={() => navigate("/messages")}
            >
              Contact Team
            </button>

          </div>
        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="client-portal-content"
        style={{
          marginLeft: "260px",
        }}
      >
        {children}
      </div>

      {/* Mobile Main Content Fix */}
      <style>
        {`
          @media (max-width: 991.98px) {
            .client-portal-content {
              margin-left: 0 !important;
            }
          }
        `}
      </style>

    </div>
  );
}
