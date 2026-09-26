import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  overallProgress?: number;

  totalMilestones?: number;
  completedMilestones?: number;

  milestones: Milestone[];
}

interface ProjectsResponse {
  success: boolean;
  projects: Project[];
}

// =========================================================
// DATE FORMAT
// =========================================================

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

function formatShortDate(date?: string | null): string {
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
  });
}

// =========================================================
// PROJECT STATUS CLASS
// =========================================================

function getProjectStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "complete"
  ) {
    return "bg-primary-subtle text-primary";
  }

  if (
    normalizedStatus === "in progress" ||
    normalizedStatus === "inprogress" ||
    normalizedStatus === "active"
  ) {
    return "bg-success-subtle text-success";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "blocked"
  ) {
    return "bg-danger-subtle text-danger";
  }

  return "bg-warning-subtle text-warning-emphasis";
}

// =========================================================
// PROJECT PROGRESS
// =========================================================

function calculateProgress(project: Project): number {
  // Prefer backend calculated progress
  if (
    project.overallProgress !== undefined &&
    project.overallProgress !== null
  ) {
    return Math.max(
      0,
      Math.min(100, project.overallProgress)
    );
  }

  // Fallback for older API response
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
}

// =========================================================
// CURRENT PROJECT PHASE
// =========================================================

function getCurrentPhase(project: Project): string {
  if (!project.milestones?.length) {
    return project.status || "Planning";
  }

  const inProgress = project.milestones.find(
    (milestone) => {
      const status = milestone.status.toLowerCase();

      return (
        status === "in progress" ||
        status === "inprogress" ||
        status === "active"
      );
    }
  );

  if (inProgress) {
    return inProgress.milestoneName;
  }

  const pending = project.milestones.find(
    (milestone) => {
      const status = milestone.status.toLowerCase();

      return (
        status !== "completed" &&
        status !== "complete"
      );
    }
  );

  if (pending) {
    return pending.milestoneName;
  }

  return "Completed";
}

// =========================================================
// COMPONENT
// =========================================================

export default function ClientProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("All Projects");

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const result: ProjectsResponse =
        await getMyProjects();

      if (!result.success) {
        throw new Error(
          "Unable to load projects."
        );
      }

      setProjects(
        result.projects ?? []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredProjects = useMemo(() => {
    if (filter === "All Projects") {
      return projects;
    }

    return projects.filter(
      (project) => {
        const status =
          project.status.toLowerCase();

        if (filter === "In Progress") {
          return (
            status === "in progress" ||
            status === "inprogress" ||
            status === "active"
          );
        }

        if (filter === "Planning") {
          return status === "planning";
        }

        if (filter === "Completed") {
          return (
            status === "completed" ||
            status === "complete"
          );
        }

        return true;
      }
    );
  }, [projects, filter]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalProjects =
    projects.length;

  const activeProjects =
    projects.filter(
      (project) => {
        const status =
          project.status.toLowerCase();

        return (
          status === "in progress" ||
          status === "inprogress" ||
          status === "active" ||
          status === "planning"
        );
      }
    ).length;

  const completedProjects =
    projects.filter(
      (project) => {
        const status =
          project.status.toLowerCase();

        return (
          status === "completed" ||
          status === "complete"
        );
      }
    ).length;

  // =========================================================
  // NEXT DELIVERY
  // =========================================================

  const nextDelivery = useMemo(() => {
    const upcomingProjects =
      projects
        .filter(
          (project) =>
            project.expectedEndDate
        )
        .map((project) => ({
          ...project,
          deliveryDate: new Date(
            project.expectedEndDate!
          ),
        }))
        .filter(
          (project) =>
            !Number.isNaN(
              project.deliveryDate.getTime()
            )
        )
        .sort(
          (a, b) =>
            a.deliveryDate.getTime() -
            b.deliveryDate.getTime()
        );

    return (
      upcomingProjects[0]
        ?.expectedEndDate ?? null
    );
  }, [projects]);

  // =========================================================
  // VIEW PROJECT
  // =========================================================

  function handleViewProject(
    projectId: number
  ) {
    // Pass project ID through URL.
    // Example:
    // /project-progress?projectId=1
    navigate(
      `/project-progress?projectId=${projectId}`
    );
  }

  // =========================================================
  // START NEW PROJECT
  // =========================================================

  function handleStartNewProject() {
    navigate("/new-project");
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">
        <div className="container-fluid px-4 py-4">

          <div className="row align-items-center g-3">

            <div className="col">

              <div className="small text-uppercase text-secondary fw-semibold mb-1">
                CLIENT PORTAL
              </div>

              <h1 className="h3 fw-bold mb-1">
                My Projects
              </h1>

              <p className="text-secondary mb-0">
                View and manage your projects
                with Manish Technology
                Solution.
              </p>

            </div>

            {/* START NEW PROJECT */}

            <div className="col-auto">

              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center"
                onClick={
                  handleStartNewProject
                }
              >
                <Plus
                  size={17}
                  className="me-2"
                />

                Start New Project
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="py-4">
        <div className="container-fluid px-4">

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger rounded-4 mb-4">

              <div className="d-flex justify-content-between align-items-center gap-3">

                <div>

                  <div className="fw-semibold mb-1">
                    Projects error
                  </div>

                  <div className="small">
                    {error}
                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={
                    loadProjects
                  }
                >
                  <RefreshCw
                    size={15}
                    className="me-1"
                  />

                  Retry
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="row g-4 mb-4">

            {/* TOTAL */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Total Projects
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : totalProjects}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FolderKanban
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ACTIVE */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Active Projects
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : activeProjects}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <Clock3 size={22} />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Completed
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : completedProjects}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <CheckCircle2
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* NEXT DELIVERY */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Next Delivery
                      </div>

                      <div className="fw-bold mb-0">
                        {loading
                          ? "-"
                          : formatShortDate(
                              nextDelivery
                            )}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <CalendarDays
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PROJECT LIST
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              {/* HEADER */}

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h2 className="h5 fw-bold mb-1">
                    All Projects
                  </h2>

                  <p className="small text-secondary mb-0">
                    Your project portfolio
                  </p>

                </div>

                {/* FILTER */}

                <div className="dropdown">

                  <button
                    className="btn btn-outline-secondary btn-sm dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    {filter}
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">

                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setFilter(
                            "All Projects"
                          )
                        }
                      >
                        All Projects
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setFilter(
                            "In Progress"
                          )
                        }
                      >
                        In Progress
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setFilter(
                            "Planning"
                          )
                        }
                      >
                        Planning
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setFilter(
                            "Completed"
                          )
                        }
                      >
                        Completed
                      </button>
                    </li>

                  </ul>

                </div>

              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <div className="small text-secondary mt-3">
                    Loading your projects...
                  </div>

                </div>
              )}

              {/* =================================================
                  PROJECT CARDS
              ================================================= */}

              {!loading && (
                <div className="row g-4">

                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(
                      (project) => {

                        const progress =
                          calculateProgress(
                            project
                          );

                        const phase =
                          getCurrentPhase(
                            project
                          );

                        return (
                          <div
                            className="col-12 col-xl-4"
                            key={
                              project.projectId
                            }
                          >

                            <div className="card border rounded-4 h-100">

                              <div className="card-body p-4">

                                {/* TOP */}

                                <div className="d-flex justify-content-between align-items-start mb-3">

                                  <div className="mts-icon-box">
                                    <FolderKanban
                                      size={22}
                                    />
                                  </div>

                                  <span
                                    className={`badge rounded-pill ${getProjectStatusClass(
                                      project.status
                                    )}`}
                                  >
                                    {
                                      project.status
                                    }
                                  </span>

                                </div>

                                {/* PROJECT NUMBER */}

                                <div className="small text-secondary mb-1">
                                  Project #
                                  {project.projectId
                                    .toString()
                                    .padStart(
                                      3,
                                      "0"
                                    )}
                                </div>

                                {/* PROJECT NAME */}

                                <h3 className="h5 fw-bold mb-2">
                                  {
                                    project.projectName
                                  }
                                </h3>

                                {/* DESCRIPTION */}

                                <p className="small text-secondary mb-4">
                                  {project.description ||
                                    "Project development and implementation."}
                                </p>

                                {/* PROGRESS */}

                                <div className="mb-3">

                                  <div className="d-flex justify-content-between mb-2">

                                    <span className="small fw-semibold">
                                      Progress
                                    </span>

                                    <span className="small fw-bold text-primary">
                                      {progress}%
                                    </span>

                                  </div>

                                  <div
                                    className="progress"
                                    style={{
                                      height:
                                        "8px",
                                    }}
                                  >

                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                      aria-valuenow={
                                        progress
                                      }
                                      aria-valuemin={
                                        0
                                      }
                                      aria-valuemax={
                                        100
                                      }
                                    />

                                  </div>

                                </div>

                                {/* MILESTONE SUMMARY */}

                                <div className="d-flex justify-content-between small text-secondary mb-3">

                                  <span>
                                    Milestones
                                  </span>

                                  <span className="fw-semibold text-dark">
                                    {project.completedMilestones ??
                                      0}{" "}
                                    /{" "}
                                    {project.totalMilestones ??
                                      project
                                        .milestones
                                        ?.length ??
                                      0}
                                  </span>

                                </div>

                                {/* PHASE */}

                                <div className="bg-light rounded-3 p-3 mb-3">

                                  <div className="small text-secondary mb-1">
                                    Current Phase
                                  </div>

                                  <div className="small fw-semibold">
                                    {phase}
                                  </div>

                                </div>

                                {/* DATES */}

                                <div className="row g-2 mb-4">

                                  <div className="col-6">

                                    <div className="small text-secondary">
                                      Start Date
                                    </div>

                                    <div className="small fw-semibold">
                                      {formatDate(
                                        project.startDate
                                      )}
                                    </div>

                                  </div>

                                  <div className="col-6">

                                    <div className="small text-secondary">
                                      Delivery
                                    </div>

                                    <div className="small fw-semibold">
                                      {formatDate(
                                        project.expectedEndDate
                                      )}
                                    </div>

                                  </div>

                                </div>

                                {/* VIEW PROJECT */}

                                <button
                                  type="button"
                                  className="btn btn-outline-primary w-100"
                                  onClick={() =>
                                    handleViewProject(
                                      project.projectId
                                    )
                                  }
                                >
                                  View Project

                                  <ArrowRight
                                    size={16}
                                    className="ms-2"
                                  />
                                </button>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="col-12">

                      <div className="text-center py-5">

                        <div className="mts-icon-box mx-auto mb-3">
                          <FolderKanban
                            size={22}
                          />
                        </div>

                        <h3 className="h6 fw-bold">
                          No projects found
                        </h3>

                        <p className="small text-secondary mb-3">
                          There are no projects
                          matching the selected
                          filter.
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={
                            handleStartNewProject
                          }
                        >
                          <Plus
                            size={16}
                            className="me-2"
                          />

                          Start New Project
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}