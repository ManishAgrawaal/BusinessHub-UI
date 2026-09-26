import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =========================================================
// API CONFIG
// =========================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// TYPES
// =========================================================

interface ClientResponse {
  success: boolean;
  message: string;
  count: number;
  clients: Client[];
}

interface Client {
  clientId: number;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  companyName: string;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface ProjectResponse {
  success: boolean;
  message: string;
  count: number;
  projects: Project[];
}

interface Project {
  projectId: number;
  clientId: number;
  clientName?: string | null;
  companyName?: string | null;
  projectName: string;
  description?: string | null;
  status: string;
  projectAmount?: number | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  completedDate?: string | null;
  overallProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  createdAt: string;
}

interface InquiryResponse {
  success: boolean;
  inquiries: Inquiry[];
}

interface Inquiry {
  projectInquiryId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  companyName: string;
  projectName: string;
  projectType: string;
  budget?: string | null;
  startDate?: string | null;
  deliveryDate?: string | null;
  description?: string | null;
  requirements?: string | null;
  technologies?: string | null;
  additionalRequirements?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface QuoteResponse {
  success: boolean;
  totalQuotes: number;
  quotes: Quote[];
}

interface Quote {
  quoteId: number;
  quoteNumber: string;
  clientId: number;
  clientName: string;
  companyName: string;
  projectId: number;
  projectName: string;
  title: string;
  description?: string | null;
  amount: number;
  status: string;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface DashboardData {
  totalClients: number;
  activeProjects: number;
  newInquiries: number;
  pendingQuotes: number;
  recentInquiry: Inquiry | null;
}

// =========================================================
// HELPERS
// =========================================================

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function formatDate(date?: string | null): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(date?: string | null): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfDate = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );

  const differenceInDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  if (differenceInDays > 1 && differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  }

  return formatDate(date);
}

// =========================================================
// API CALLS
// =========================================================

async function fetchClients(
  token: string
): Promise<ClientResponse> {
  const response = await fetch(
    `${API_BASE_URL}/Clients`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load clients. (${response.status})`
    );
  }

  return await response.json();
}

async function fetchProjects(
  token: string
): Promise<ProjectResponse> {
  const response = await fetch(
    `${API_BASE_URL}/Projects`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load projects. (${response.status})`
    );
  }

  return await response.json();
}

async function fetchInquiries(
  token: string
): Promise<InquiryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ProjectInquiries`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load inquiries. (${response.status})`
    );
  }

  return await response.json();
}

async function fetchQuotes(
  token: string
): Promise<QuoteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/Quotes`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load quotes. (${response.status})`
    );
  }

  return await response.json();
}

// =========================================================
// COMPONENT
// =========================================================

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardData>({
      totalClients: 0,
      activeProjects: 0,
      newInquiries: 0,
      pendingQuotes: 0,
      recentInquiry: null,
    });

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  // =======================================================
  // LOAD DASHBOARD DATA
  // =======================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const [
        clientsResponse,
        projectsResponse,
        inquiriesResponse,
        quotesResponse,
      ] = await Promise.all([
        fetchClients(token),
        fetchProjects(token),
        fetchInquiries(token),
        fetchQuotes(token),
      ]);

      // ===================================================
      // TOTAL CLIENTS
      // ===================================================

      const totalClients =
        clientsResponse.count ??
        clientsResponse.clients?.length ??
        0;

      // ===================================================
      // ACTIVE PROJECTS
      // ===================================================

      const activeProjects =
        projectsResponse.projects?.filter(
          (project) =>
            project.status?.toLowerCase() !==
              "completed" &&
            project.status?.toLowerCase() !==
              "cancelled"
        ).length ?? 0;

      // ===================================================
      // NEW INQUIRIES
      // ===================================================

      const newInquiries =
        inquiriesResponse.inquiries?.filter(
          (inquiry) =>
            inquiry.status?.toLowerCase() ===
            "new"
        ).length ?? 0;

      // ===================================================
      // PENDING QUOTES
      // ===================================================

      const pendingQuotes =
        quotesResponse.quotes?.filter(
          (quote) => {
            const status =
              quote.status?.toLowerCase();

            return (
              status === "draft" ||
              status === "sent"
            );
          }
        ).length ?? 0;

      // ===================================================
      // RECENT INQUIRY
      // ===================================================

      const sortedInquiries = [
        ...(inquiriesResponse.inquiries ?? []),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      const recentInquiry =
        sortedInquiries.length > 0
          ? sortedInquiries[0]
          : null;

      // ===================================================
      // SET DASHBOARD
      // ===================================================

      setDashboard({
        totalClients,
        activeProjects,
        newInquiries,
        pendingQuotes,
        recentInquiry,
      });
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="container-fluid px-4 py-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">

        <div className="small text-uppercase text-primary fw-semibold mb-1">
          ADMIN PORTAL
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

          <div>

            <h1 className="h3 fw-bold mb-1">
              Dashboard
            </h1>

            <p className="text-secondary mb-0">
              Manage clients, projects and
              business operations from one place.
            </p>

          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`me-2 ${
                loading
                  ? "spinner-border"
                  : ""
              }`}
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center rounded-4 mb-4"
          role="alert"
        >

          <div>

            <div className="fw-semibold">
              Unable to load dashboard
            </div>

            <div className="small">
              {error}
            </div>

          </div>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={loadDashboard}
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="row g-4 mb-4">

        {/* TOTAL CLIENTS */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Total Clients
                  </div>

                  <div className="h3 fw-bold mb-0">

                    {loading ? (
                      <span
                        className="placeholder col-3"
                      />
                    ) : (
                      dashboard.totalClients
                    )}

                  </div>

                </div>

                <div className="mts-icon-box">
                  <Users size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ACTIVE PROJECTS */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Active Projects
                  </div>

                  <div className="h3 fw-bold mb-0">

                    {loading ? (
                      <span
                        className="placeholder col-3"
                      />
                    ) : (
                      dashboard.activeProjects
                    )}

                  </div>

                </div>

                <div className="mts-icon-box">
                  <FolderKanban size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* NEW INQUIRIES */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    New Inquiries
                  </div>

                  <div className="h3 fw-bold mb-0">

                    {loading ? (
                      <span
                        className="placeholder col-3"
                      />
                    ) : (
                      dashboard.newInquiries
                    )}

                  </div>

                </div>

                <div className="mts-icon-box">
                  <FileText size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* PENDING QUOTES */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Pending Quotes
                  </div>

                  <div className="h3 fw-bold mb-0">

                    {loading ? (
                      <span
                        className="placeholder col-3"
                      />
                    ) : (
                      dashboard.pendingQuotes
                    )}

                  </div>

                </div>

                <div className="mts-icon-box">
                  <Clock3 size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="row g-4">

        {/* =================================================
            RECENT INQUIRY
        ================================================= */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h2 className="h5 fw-bold mb-1">
                    Recent Project Inquiries
                  </h2>

                  <p className="small text-secondary mb-0">
                    Latest requests submitted
                    by clients.
                  </p>

                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    navigate(
                      "/admin-inquiries"
                    )
                  }
                >
                  View All

                  <ArrowRight
                    size={15}
                    className="ms-1"
                  />

                </button>

              </div>

              {/* LOADING */}

              {loading && (
                <div className="border rounded-4 p-4">

                  <div className="placeholder-glow">

                    <span className="placeholder col-3 mb-3" />

                    <div>
                      <span className="placeholder col-6 mb-2" />
                    </div>

                    <span className="placeholder col-4 mb-3" />

                    <hr />

                    <div className="row g-3">

                      <div className="col-md-4">
                        <span className="placeholder col-8" />
                      </div>

                      <div className="col-md-4">
                        <span className="placeholder col-8" />
                      </div>

                      <div className="col-md-4">
                        <span className="placeholder col-8" />
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* NO INQUIRY */}

              {!loading &&
                !dashboard.recentInquiry && (
                  <div className="border rounded-4 p-5 text-center">

                    <div className="text-secondary mb-2">
                      <FileText size={32} />
                    </div>

                    <div className="fw-semibold">
                      No project inquiries yet
                    </div>

                    <div className="small text-secondary">
                      New client inquiries will
                      appear here.
                    </div>

                  </div>
                )}

              {/* RECENT INQUIRY */}

              {!loading &&
                dashboard.recentInquiry && (
                  <div className="border rounded-4 p-3">

                    <div className="d-flex justify-content-between align-items-start">

                      <div className="d-flex">

                        <div className="mts-icon-box flex-shrink-0">
                          <BriefcaseBusiness
                            size={21}
                          />
                        </div>

                        <div className="ms-3">

                          <div className="small text-secondary">
                            Project Inquiry
                          </div>

                          <h3 className="h6 fw-bold mb-1">
                            {
                              dashboard
                                .recentInquiry
                                .projectName
                            }
                          </h3>

                          <div className="small text-secondary">

                            {
                              dashboard
                                .recentInquiry
                                .companyName
                            }

                            {" • "}

                            {
                              dashboard
                                .recentInquiry
                                .clientName
                            }

                          </div>

                        </div>

                      </div>

                      <span
                        className={`badge rounded-pill ${
                          dashboard.recentInquiry.status
                            ?.toLowerCase() ===
                          "new"
                            ? "bg-warning-subtle text-warning-emphasis"
                            : dashboard.recentInquiry.status
                                ?.toLowerCase() ===
                              "approved"
                            ? "bg-success-subtle text-success"
                            : dashboard.recentInquiry.status
                                ?.toLowerCase() ===
                              "rejected"
                            ? "bg-danger-subtle text-danger"
                            : "bg-secondary-subtle text-secondary"
                        }`}
                      >
                        {
                          dashboard
                            .recentInquiry
                            .status
                        }
                      </span>

                    </div>

                    <hr />

                    <div className="row g-3">

                      <div className="col-md-4">

                        <div className="small text-secondary">
                          Project Type
                        </div>

                        <div className="small fw-semibold">
                          {
                            dashboard
                              .recentInquiry
                              .projectType
                          }
                        </div>

                      </div>

                      <div className="col-md-4">

                        <div className="small text-secondary">
                          Budget
                        </div>

                        <div className="small fw-semibold">
                          {
                            dashboard
                              .recentInquiry
                              .budget ||
                            "Not specified"
                          }
                        </div>

                      </div>

                      <div className="col-md-4">

                        <div className="small text-secondary">
                          Submitted
                        </div>

                        <div className="small fw-semibold">
                          {formatRelativeDate(
                            dashboard
                              .recentInquiry
                              .createdAt
                          )}
                        </div>

                      </div>

                    </div>

                    <div className="mt-3">

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(
                            "/admin-inquiries"
                          )
                        }
                      >
                        Review Inquiry

                        <ArrowRight
                          size={15}
                          className="ms-1"
                        />

                      </button>

                    </div>

                  </div>
                )}

            </div>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <h2 className="h5 fw-bold mb-1">
                Quick Actions
              </h2>

              <p className="small text-secondary mb-4">
                Common administration tasks.
              </p>

              <div className="d-grid gap-2">

                <button
                  type="button"
                  className="btn btn-light border text-start"
                  onClick={() =>
                    navigate(
                      "/admin-inquiries"
                    )
                  }
                >
                  <FileText
                    size={17}
                    className="me-2 text-primary"
                  />
                  Review Inquiries
                </button>

                <button
                  type="button"
                  className="btn btn-light border text-start"
                  onClick={() =>
                    navigate(
                      "/admin-clients"
                    )
                  }
                >
                  <Users
                    size={17}
                    className="me-2 text-primary"
                  />
                  Manage Clients
                </button>

                <button
                  type="button"
                  className="btn btn-light border text-start"
                  onClick={() =>
                    navigate(
                      "/admin-projects"
                    )
                  }
                >
                  <FolderKanban
                    size={17}
                    className="me-2 text-primary"
                  />
                  Manage Projects
                </button>

                <button
                  type="button"
                  className="btn btn-light border text-start"
                  onClick={() =>
                    navigate(
                      "/admin-quotes"
                    )
                  }
                >
                  <Clock3
                    size={17}
                    className="me-2 text-primary"
                  />
                  Manage Quotes
                </button>

                <button
                  type="button"
                  className="btn btn-light border text-start"
                  onClick={() =>
                    navigate(
                      "/admin-messages"
                    )
                  }
                >
                  <MessageSquare
                    size={17}
                    className="me-2 text-primary"
                  />
                  View Messages
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              SYSTEM STATUS
          ================================================= */}

          <div className="card border-0 bg-light rounded-4 mt-4">

            <div className="card-body p-4">

              <div className="d-flex align-items-center">

                <div className="rounded-circle bg-success-subtle text-success p-2">
                  <CheckCircle2
                    size={18}
                  />
                </div>

                <div className="ms-3">

                  <div className="small fw-bold">
                    System Status
                  </div>

                  <div className="small text-success">
                    All services operational
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
