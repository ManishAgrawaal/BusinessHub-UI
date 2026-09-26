import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import { getMyProjects } from "../services/api";

interface Milestone {
  projectMilestoneId: number;
  milestoneName: string;
  description?: string | null;
  progressPercentage: number;
  status: string;
  plannedDate?: string | null;
  completedDate?: string | null;
}

interface Project {
  projectId: number;
  projectName: string;
  description?: string | null;
  status: string;
  projectAmount?: number | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  completedDate?: string | null;

  // Backend currently returns these fields.
  overallProgress?: number;
  totalMilestones?: number;
  completedMilestones?: number;

  milestones: Milestone[];
}

interface ProjectsResponse {
  success: boolean;
  clientId: number;
  projects: Project[];
}

function formatDate(date?: string | null): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string | null): string {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "complete"
  ) {
    return "bg-success-subtle text-success";
  }

  if (
    normalizedStatus === "in progress" ||
    normalizedStatus === "inprogress" ||
    normalizedStatus === "active"
  ) {
    return "bg-primary-subtle text-primary";
  }

  if (
    normalizedStatus === "blocked" ||
    normalizedStatus === "cancelled"
  ) {
    return "bg-danger-subtle text-danger";
  }

  return "bg-warning-subtle text-warning-emphasis";
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientName, setClientName] = useState("Client");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();

    const storedUser = localStorage.getItem("mts_user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user?.fullName) {
          setClientName(user.fullName);
        }
      } catch {
        // Ignore invalid local storage data.
      }
    }
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const result: ProjectsResponse = await getMyProjects();

      if (!result.success) {
        setError("Unable to load your projects.");
        return;
      }

      setProjects(result.projects ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  }

  const project = projects[0];

  const progress = useMemo(() => {
    if (!project) {
      return 0;
    }

    if (
      typeof project.overallProgress === "number" &&
      project.overallProgress >= 0
    ) {
      return Math.min(100, Math.max(0, project.overallProgress));
    }

    if (!project.milestones?.length) {
      return 0;
    }

    const totalProgress = project.milestones.reduce(
      (sum, milestone) =>
        sum + (milestone.progressPercentage || 0),
      0
    );

    return Math.round(
      totalProgress / project.milestones.length
    );
  }, [project]);

  const completedMilestones = useMemo(() => {
    if (!project) {
      return 0;
    }

    if (typeof project.completedMilestones === "number") {
      return project.completedMilestones;
    }

    return (
      project.milestones?.filter(
        (milestone) =>
          milestone.status.toLowerCase() === "completed"
      ).length ?? 0
    );
  }, [project]);

  const totalMilestones = useMemo(() => {
    if (!project) {
      return 0;
    }

    if (typeof project.totalMilestones === "number") {
      return project.totalMilestones;
    }

    return project.milestones?.length ?? 0;
  }, [project]);

  const remainingMilestones = Math.max(
    0,
    totalMilestones - completedMilestones
  );

  const upcomingMilestone = useMemo(() => {
    if (!project?.milestones?.length) {
      return null;
    }

    const pendingMilestones = project.milestones
      .filter(
        (milestone) =>
          milestone.status.toLowerCase() !== "completed"
      )
      .sort((a, b) => {
        const dateA = a.plannedDate
          ? new Date(a.plannedDate).getTime()
          : Number.MAX_SAFE_INTEGER;

        const dateB = b.plannedDate
          ? new Date(b.plannedDate).getTime()
          : Number.MAX_SAFE_INTEGER;

        return dateA - dateB;
      });

    return pendingMilestones[0] ?? null;
  }, [project]);

  const recentMilestones = useMemo(() => {
    if (!project?.milestones) {
      return [];
    }

    return [...project.milestones]
      .sort((a, b) => {
        const dateA = a.completedDate
          ? new Date(a.completedDate).getTime()
          : a.plannedDate
            ? new Date(a.plannedDate).getTime()
            : 0;

        const dateB = b.completedDate
          ? new Date(b.completedDate).getTime()
          : b.plannedDate
            ? new Date(b.plannedDate).getTime()
            : 0;

        return dateB - dateA;
      })
      .slice(0, 3);
  }, [project]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="bg-light min-vh-100">
        <section className="bg-white border-bottom">
          <div className="container py-4">
            <p className="text-secondary small mb-1">
              CLIENT PORTAL
            </p>

            <h1 className="h3 fw-bold mb-1">
              Welcome back, {clientName}
            </h1>

            <p className="text-secondary mb-0">
              Loading your project information...
            </p>
          </div>
        </section>

        <section className="py-5">
          <div className="container">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

                <div className="text-secondary mt-3">
                  Loading your projects...
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="bg-light min-vh-100">
        <section className="bg-white border-bottom">
          <div className="container py-4">
            <p className="text-secondary small mb-1">
              CLIENT PORTAL
            </p>

            <h1 className="h3 fw-bold mb-1">
              Welcome back, {clientName}
            </h1>

            <p className="text-secondary mb-0">
              Here's an overview of your project and recent activity.
            </p>
          </div>
        </section>

        <section className="py-5">
          <div className="container">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <div className="alert alert-danger mb-4">
                  {error}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={loadProjects}
                >
                  <RefreshCw size={17} className="me-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // NO PROJECT
  // =========================================================

  if (!project) {
    return (
      <main className="bg-light min-vh-100">
        <section className="bg-white border-bottom">
          <div className="container py-4">
            <p className="text-secondary small mb-1">
              CLIENT PORTAL
            </p>

            <h1 className="h3 fw-bold mb-1">
              Welcome back, {clientName}
            </h1>

            <p className="text-secondary mb-0">
              Here's an overview of your project and recent activity.
            </p>
          </div>
        </section>

        <section className="py-5">
          <div className="container">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <FolderOpen
                  size={45}
                  className="text-primary mb-3"
                />

                <h2 className="h5 fw-bold">
                  No Projects Found
                </h2>

                <p className="text-secondary mb-0">
                  There are currently no projects associated
                  with your account.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          DASHBOARD HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">
        <div className="container py-4">
          <div className="row align-items-center g-3">

            <div className="col">
              <p className="text-secondary small mb-1">
                CLIENT PORTAL
              </p>

              <h1 className="h3 fw-bold mb-1">
                Welcome back, {clientName}
              </h1>

              <p className="text-secondary mb-0">
                Here's an overview of your project and recent activity.
              </p>
            </div>

            <div className="col-auto">
              <Link
                to="/messages"
                className="btn btn-outline-primary"
              >
                <MessageSquare
                  size={17}
                  className="me-2"
                />

                Contact Team
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <section className="py-4">
        <div className="container">

          {/* =================================================
              PROJECT OVERVIEW
          ================================================= */}

          <div className="row g-4 mb-4">

            {/* PROJECT CARD */}

            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start mb-4">

                    <div>

                      <div className="d-flex align-items-center gap-2 mb-2">

                        <span
                          className={`badge rounded-pill ${getStatusClass(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>

                        <span className="text-secondary small">
                          Project #{project.projectId}
                        </span>

                      </div>

                      <h2 className="h4 fw-bold mb-1">
                        {project.projectName}
                      </h2>

                      <p className="text-secondary mb-0">
                        {project.description ||
                          "Project development and implementation"}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="btn btn-light rounded-circle"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                  </div>

                  {/* PROGRESS */}

                  <div className="mb-3">

                    <div className="d-flex justify-content-between mb-2">

                      <span className="small fw-semibold">
                        Overall Progress
                      </span>

                      <span className="small fw-bold text-primary">
                        {progress}%
                      </span>

                    </div>

                    <div
                      className="progress"
                      style={{ height: "10px" }}
                    >

                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${progress}%`,
                        }}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />

                    </div>

                  </div>

                  {/* PROJECT DETAILS */}

                  <div className="row g-3 mt-3">

                    <div className="col-md-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary mb-1">
                          Current Phase
                        </div>

                        <div className="fw-semibold">
                          {project.status}
                        </div>

                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary mb-1">
                          Start Date
                        </div>

                        <div className="fw-semibold">
                          {formatDate(project.startDate)}
                        </div>

                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary mb-1">
                          Expected Delivery
                        </div>

                        <div className="fw-semibold">
                          {formatDate(project.expectedEndDate)}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* UPCOMING MILESTONE */}

            <div className="col-lg-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-3">

                    <div className="mts-icon-box me-3">
                      <CalendarDays size={22} />
                    </div>

                    <div>

                      <div className="small text-secondary">
                        Upcoming Milestone
                      </div>

                      <h3 className="h6 fw-bold mb-0">
                        {upcomingMilestone
                          ? upcomingMilestone.milestoneName
                          : "No upcoming milestone"}
                      </h3>

                    </div>

                  </div>

                  {upcomingMilestone ? (
                    <>
                      <div className="border rounded-3 p-3 mb-3">

                        <div className="d-flex align-items-center mb-2">

                          <CalendarDays
                            size={17}
                            className="text-primary me-2"
                          />

                          <span className="fw-semibold">
                            {formatDate(
                              upcomingMilestone.plannedDate
                            )}
                          </span>

                        </div>

                        <div className="d-flex align-items-center">

                          <Clock3
                            size={17}
                            className="text-secondary me-2"
                          />

                          <span className="small text-secondary">
                            {upcomingMilestone.description ||
                              "Project milestone"}
                          </span>

                        </div>

                      </div>

                      <Link
                        to="/project-progress"
                        className="btn btn-outline-primary w-100"
                      >
                        View Project Timeline

                        <ArrowRight
                          size={16}
                          className="ms-2"
                        />
                      </Link>
                    </>
                  ) : (
                    <div className="border rounded-3 p-3 text-secondary">
                      All available milestones are completed.
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="row g-4 mb-4">

            {/* MILESTONES */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Milestones Completed
                      </div>

                      <div className="h3 fw-bold mb-1">
                        {completedMilestones}
                      </div>

                      <div className="small text-secondary">
                        {remainingMilestones} remaining
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <CheckCircle2 size={22} />
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* DOCUMENTS */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Documents
                      </div>

                      <div className="h3 fw-bold mb-1">
                        -
                      </div>

                      <div className="small text-secondary">
                        View project documents
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FileText size={22} />
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* MESSAGES */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Messages
                      </div>

                      <div className="h3 fw-bold mb-1">
                        -
                      </div>

                      <div className="small text-primary">
                        View messages
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <MessageSquare size={22} />
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* PROJECT STATUS */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Project Status
                      </div>

                      <div className="h3 fw-bold mb-1">
                        {project.status}
                      </div>

                      <div className="small text-success">
                        {progress}% completed
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <TrendingUp size={22} />
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* =================================================
              LOWER SECTION
          ================================================= */}

          <div className="row g-4">

            {/* RECENT ACTIVITY */}

            <div className="col-lg-7">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                      <h2 className="h5 fw-bold mb-1">
                        Recent Activity
                      </h2>

                      <p className="small text-secondary mb-0">
                        Latest updates from your project
                      </p>

                    </div>

                    <Link
                      to="/project-progress"
                      className="btn btn-sm btn-link text-decoration-none"
                    >
                      View All
                    </Link>

                  </div>

                  {recentMilestones.length === 0 ? (
                    <div className="text-secondary">
                      No milestone activity available.
                    </div>
                  ) : (
                    recentMilestones.map(
                      (milestone, index) => (
                        <div
                          key={milestone.projectMilestoneId}
                          className={`d-flex ${
                            index <
                            recentMilestones.length - 1
                              ? "pb-4 mb-4 border-bottom"
                              : ""
                          }`}
                        >

                          <div className="mts-icon-box me-3 flex-shrink-0">

                            {milestone.status.toLowerCase() ===
                            "completed" ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <TrendingUp size={20} />
                            )}

                          </div>

                          <div className="flex-grow-1">

                            <div className="fw-semibold">
                              {milestone.milestoneName}
                            </div>

                            <div className="small text-secondary">
                              {milestone.description ||
                                "Project milestone update."}
                            </div>

                            <div className="small text-secondary mt-1">
                              Status: {milestone.status}
                              {milestone.completedDate
                                ? ` • Completed ${formatDateTime(
                                    milestone.completedDate
                                  )}`
                                : milestone.plannedDate
                                  ? ` • Planned ${formatDate(
                                      milestone.plannedDate
                                    )}`
                                  : ""}
                            </div>

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <h2 className="h5 fw-bold mb-1">
                    Quick Actions
                  </h2>

                  <p className="small text-secondary mb-4">
                    Access your project resources
                  </p>

                  <div className="d-grid gap-3">

                    {/* PROJECT PROGRESS */}

                    <Link
                      to="/project-progress"
                      className="btn btn-light border text-start p-3"
                    >

                      <div className="d-flex align-items-center">

                        <div className="mts-icon-box me-3">
                          <TrendingUp size={20} />
                        </div>

                        <div className="flex-grow-1">

                          <div className="fw-semibold">
                            Project Progress
                          </div>

                          <div className="small text-secondary">
                            View milestones and progress
                          </div>

                        </div>

                        <ArrowRight size={17} />

                      </div>

                    </Link>

                    {/* QUOTES */}

                    <Link
                      to="/quotes"
                      className="btn btn-light border text-start p-3"
                    >

                      <div className="d-flex align-items-center">

                        <div className="mts-icon-box me-3">
                          <FileText size={20} />
                        </div>

                        <div className="flex-grow-1">

                          <div className="fw-semibold">
                            Quotes & Proposals
                          </div>

                          <div className="small text-secondary">
                            Review project proposals
                          </div>

                        </div>

                        <ArrowRight size={17} />

                      </div>

                    </Link>

                    {/* DOCUMENTS */}

                    <Link
                      to="/documents"
                      className="btn btn-light border text-start p-3"
                    >

                      <div className="d-flex align-items-center">

                        <div className="mts-icon-box me-3">
                          <FolderOpen size={20} />
                        </div>

                        <div className="flex-grow-1">

                          <div className="fw-semibold">
                            Documents
                          </div>

                          <div className="small text-secondary">
                            Access project documents
                          </div>

                        </div>

                        <ArrowRight size={17} />

                      </div>

                    </Link>

                    {/* MESSAGES */}

                    <Link
                      to="/messages"
                      className="btn btn-light border text-start p-3"
                    >

                      <div className="d-flex align-items-center">

                        <div className="mts-icon-box me-3">
                          <MessageSquare size={20} />
                        </div>

                        <div className="flex-grow-1">

                          <div className="fw-semibold">
                            Messages
                          </div>

                          <div className="small text-secondary">
                            Communicate with the team
                          </div>

                        </div>

                        <ArrowRight size={17} />

                      </div>

                    </Link>

                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}