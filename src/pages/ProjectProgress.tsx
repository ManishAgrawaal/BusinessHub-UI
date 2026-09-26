import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Code2,
  FileCheck2,
  Rocket,
  ShieldCheck,
  Palette,
  RefreshCw,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { getMyProjects } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// INTERFACES
// =========================================================

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
  clientId: number;
  projectName: string;
  description?: string | null;
  status: string;
  projectAmount?: number | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  completedDate?: string | null;
  milestones: Milestone[];
}

interface ProjectResponse {
  success: boolean;
  projectId: number;
  clientId: number;
  projectName: string;
  description?: string | null;
  status: string;
  projectAmount?: number | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  completedDate?: string | null;
  milestones: Milestone[];
}

// =========================================================
// AUTH TOKEN
// =========================================================

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

// =========================================================
// PROJECT ID FROM STORAGE
// =========================================================

function getProjectIdFromStorage(): number | null {
  const storedProjectId =
    sessionStorage.getItem(
      "mts_current_project_id"
    ) ||
    localStorage.getItem(
      "mts_current_project_id"
    );

  if (!storedProjectId) {
    return null;
  }

  const parsedId = Number(storedProjectId);

  if (
    Number.isInteger(parsedId) &&
    parsedId > 0
  ) {
    return parsedId;
  }

  return null;
}

// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
  date?: string | null
): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// =========================================================
// MILESTONE ICON
// =========================================================

function getMilestoneIcon(
  milestoneName: string
) {
  const name =
    milestoneName.toLowerCase();

  if (
    name.includes("requirement") ||
    name.includes("discovery")
  ) {
    return FileCheck2;
  }

  if (
    name.includes("ui") ||
    name.includes("ux") ||
    name.includes("design")
  ) {
    return Palette;
  }

  if (
    name.includes("development") ||
    name.includes("develop")
  ) {
    return Code2;
  }

  if (
    name.includes("testing") ||
    name.includes("quality") ||
    name.includes("qa")
  ) {
    return ShieldCheck;
  }

  if (
    name.includes("acceptance") ||
    name.includes("uat")
  ) {
    return CheckCircle2;
  }

  if (
    name.includes("deployment") ||
    name.includes("release") ||
    name.includes("production")
  ) {
    return Rocket;
  }

  return Circle;
}

// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(
  status: string
): string {
  const normalizedStatus =
    status.toLowerCase();

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

  return "bg-light text-secondary";
}

// =========================================================
// COMPONENT
// =========================================================

export default function ProjectProgress() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD PROJECT
  // =========================================================

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      // =====================================================
      // 1. CHECK URL
      //
      // /project-progress?projectId=1
      // =====================================================

      let projectId: number | null = null;

      const queryProjectId =
        searchParams.get("projectId");

      if (queryProjectId) {
        const parsedId =
          Number(queryProjectId);

        if (
          Number.isInteger(parsedId) &&
          parsedId > 0
        ) {
          projectId = parsedId;
        }
      }

      // =====================================================
      // 2. CHECK SESSION / LOCAL STORAGE
      // =====================================================

      if (!projectId) {
        projectId =
          getProjectIdFromStorage();
      }

      // =====================================================
      // 3. DIRECT SIDEBAR ACCESS
      //
      // If URL has no projectId and storage also
      // has no projectId, get client projects.
      //
      // Then select the first project.
      // =====================================================

      if (!projectId) {
        const projectsResult =
          await getMyProjects();

        if (
          !projectsResult.success ||
          !projectsResult.projects ||
          projectsResult.projects.length === 0
        ) {
          throw new Error(
            "No projects are available for your account."
          );
        }

        projectId =
          projectsResult.projects[0].projectId;

        // Save selected project
        sessionStorage.setItem(
          "mts_current_project_id",
          projectId!.toString()
        );

        // Update URL
        setSearchParams(
          {
            projectId:
              projectId!.toString(),
          },
          {
            replace: true,
          }
        );
      }

      // =====================================================
      // LOAD PROJECT DETAILS
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/Projects/my-projects/${projectId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view this project."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Project not found."
          );
        }

        throw new Error(
          `Unable to load project. Status: ${response.status}`
        );
      }

      const result: ProjectResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load project details."
        );
      }

      // =====================================================
      // SET PROJECT
      // =====================================================

      setProject({
        projectId: result.projectId,
        clientId: result.clientId,
        projectName:
          result.projectName,
        description:
          result.description,
        status: result.status,
        projectAmount:
          result.projectAmount,
        startDate:
          result.startDate,
        expectedEndDate:
          result.expectedEndDate,
        completedDate:
          result.completedDate,
        milestones:
          result.milestones ?? [],
      });

      // Keep selected project in session
      sessionStorage.setItem(
        "mts_current_project_id",
        result.projectId!.toString()
      );

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadProject();
  }, []);

  // =========================================================
  // OVERALL PROGRESS
  // =========================================================

  const overallProgress = useMemo(() => {
    if (
      !project?.milestones?.length
    ) {
      return 0;
    }

    const totalProgress =
      project.milestones.reduce(
        (sum, milestone) =>
          sum +
          (milestone.progressPercentage ||
            0),
        0
      );

    return Math.round(
      totalProgress /
        project.milestones.length
    );
  }, [project]);

  // =========================================================
  // COMPLETED MILESTONES
  // =========================================================

  const completedMilestones =
    useMemo(() => {
      if (!project?.milestones) {
        return 0;
      }

      return project.milestones.filter(
        (milestone) =>
          milestone.status.toLowerCase() ===
          "completed"
      ).length;
    }, [project]);

  // =========================================================
  // TOTAL MILESTONES
  // =========================================================

  const totalMilestones =
    project?.milestones?.length ?? 0;

  // =========================================================
  // REMAINING MILESTONES
  // =========================================================

  const remainingMilestones =
    Math.max(
      0,
      totalMilestones -
        completedMilestones
    );

  // =========================================================
  // CURRENT MILESTONE
  // =========================================================

  const currentMilestone =
    useMemo(() => {
      if (
        !project?.milestones?.length
      ) {
        return null;
      }

      return (
        project.milestones.find(
          (milestone) => {
            const status =
              milestone.status.toLowerCase();

            return (
              status ===
                "in progress" ||
              status ===
                "inprogress" ||
              status === "active"
            );
          }
        ) ?? null
      );
    }, [project]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="bg-light min-vh-100">

        <section className="bg-white border-bottom">
          <div className="container-fluid px-4 py-4">

            <button
              type="button"
              className="btn btn-link text-decoration-none text-secondary px-0 mb-3"
              onClick={() =>
                navigate("/client-projects")
              }
            >
              <ArrowLeft
                size={17}
                className="me-2"
              />

              Back to Projects
            </button>

            <h1 className="h3 fw-bold mb-1">
              Project Progress
            </h1>

            <p className="text-secondary mb-0">
              Loading project information...
            </p>

          </div>
        </section>

        <section className="py-5">
          <div className="container-fluid px-4">

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
                  Loading project progress...
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
          <div className="container-fluid px-4 py-4">

            <button
              type="button"
              className="btn btn-link text-decoration-none text-secondary px-0 mb-3"
              onClick={() =>
                navigate("/client-projects")
              }
            >
              <ArrowLeft
                size={17}
                className="me-2"
              />

              Back to Projects
            </button>

            <h1 className="h3 fw-bold mb-1">
              Project Progress
            </h1>

          </div>
        </section>

        <section className="py-5">

          <div className="container-fluid px-4">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-5 text-center">

                <div className="alert alert-danger">
                  {error}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={loadProject}
                >
                  <RefreshCw
                    size={17}
                    className="me-2"
                  />

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

        <section className="py-5">

          <div className="container-fluid px-4">

            <div className="alert alert-info">
              No project information is available.
            </div>

          </div>

        </section>

      </main>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">

        <div className="container-fluid px-4 py-4">

          <button
            type="button"
            className="btn btn-link text-decoration-none text-secondary px-0 mb-3"
            onClick={() =>
              navigate("/client-projects")
            }
          >
            <ArrowLeft
              size={17}
              className="me-2"
            />

            Back to Projects
          </button>

          <div className="row align-items-center g-3">

            <div className="col">

              <div className="d-flex align-items-center gap-2 mb-2">

                <span
                  className={`badge rounded-pill ${getStatusClass(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>

                <span className="small text-secondary">
                  Project #
                  {project.projectId}
                </span>

              </div>

              <h1 className="h3 fw-bold mb-1">
                {project.projectName}
              </h1>

              <p className="text-secondary mb-0">
                Project Progress & Timeline
              </p>

            </div>

            <div className="col-auto">

              <div className="text-end">

                <div className="small text-secondary">
                  Overall Progress
                </div>

                <div className="h3 fw-bold text-primary mb-0">
                  {overallProgress}%
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PROGRESS OVERVIEW
      ===================================================== */}

      <section className="py-4">

        <div className="container-fluid px-4">

          <div className="row g-4 mb-4">

            {/* PROGRESS */}

            <div className="col-lg-8">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between mb-2">

                    <div>

                      <h2 className="h5 fw-bold mb-1">
                        Project Progress
                      </h2>

                      <p className="small text-secondary mb-0">
                        Current project completion
                      </p>

                    </div>

                    <span className="fw-bold text-primary">
                      {overallProgress}%
                    </span>

                  </div>

                  <div
                    className="progress mt-4"
                    style={{
                      height: "12px",
                    }}
                  >

                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${overallProgress}%`,
                      }}
                      aria-valuenow={
                        overallProgress
                      }
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />

                  </div>

                  <div className="row mt-4 g-3">

                    <div className="col-sm-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary">
                          Completed
                        </div>

                        <div className="fw-bold mt-1">
                          {
                            completedMilestones
                          }{" "}
                          Milestones
                        </div>

                      </div>

                    </div>

                    <div className="col-sm-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary">
                          Current
                        </div>

                        <div className="fw-bold mt-1">
                          {currentMilestone
                            ?.milestoneName ||
                            project.status}
                        </div>

                      </div>

                    </div>

                    <div className="col-sm-4">

                      <div className="bg-light rounded-3 p-3">

                        <div className="small text-secondary">
                          Remaining
                        </div>

                        <div className="fw-bold mt-1">
                          {
                            remainingMilestones
                          }{" "}
                          Milestones
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* DELIVERY */}

            <div className="col-lg-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="mts-icon-box mb-3">
                    <Clock3 size={23} />
                  </div>

                  <div className="small text-secondary">
                    Expected Delivery
                  </div>

                  <div className="h4 fw-bold mt-1 mb-2">
                    {formatDate(
                      project.expectedEndDate
                    )}
                  </div>

                  <p className="small text-secondary mb-0">

                    {project.status.toLowerCase() ===
                    "completed"
                      ? "The project has been completed."
                      : "Project progress is being tracked against the planned timeline."}

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PROJECT TIMELINE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4 p-lg-5">

              <div className="mb-5">

                <h2 className="h5 fw-bold mb-1">
                  Project Timeline
                </h2>

                <p className="small text-secondary mb-0">
                  Track each stage of your project.
                </p>

              </div>

              {project.milestones.length ===
              0 ? (

                <div className="alert alert-light border">
                  No milestones have been
                  added to this project yet.
                </div>

              ) : (

                <div className="position-relative">

                  {/* Timeline line */}

                  <div
                    className="position-absolute bg-light border-start"
                    style={{
                      left: "24px",
                      top: "10px",
                      bottom: "10px",
                    }}
                  />

                  <div className="d-grid gap-4">

                    {project.milestones.map(
                      (milestone) => {

                        const Icon =
                          getMilestoneIcon(
                            milestone.milestoneName
                          );

                        const normalizedStatus =
                          milestone.status.toLowerCase();

                        const completed =
                          normalizedStatus ===
                            "completed" ||
                          normalizedStatus ===
                            "complete";

                        const current =
                          normalizedStatus ===
                            "in progress" ||
                          normalizedStatus ===
                            "inprogress" ||
                          normalizedStatus ===
                            "active";

                        return (
                          <div
                            key={
                              milestone.projectMilestoneId
                            }
                            className="position-relative d-flex"
                          >

                            {/* ICON */}

                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                                completed
                                  ? "bg-success text-white"
                                  : current
                                    ? "bg-primary text-white"
                                    : "bg-white border text-secondary"
                              }`}
                              style={{
                                width: "50px",
                                height: "50px",
                                zIndex: 1,
                              }}
                            >

                              {completed ? (
                                <CheckCircle2
                                  size={21}
                                />
                              ) : current ? (
                                <Icon
                                  size={21}
                                />
                              ) : (
                                <Circle
                                  size={20}
                                />
                              )}

                            </div>

                            {/* CONTENT */}

                            <div className="ms-4 flex-grow-1">

                              <div className="d-flex flex-wrap justify-content-between gap-2">

                                <div>

                                  <h3 className="h6 fw-bold mb-1">
                                    {
                                      milestone.milestoneName
                                    }
                                  </h3>

                                  <p className="small text-secondary mb-2">
                                    {
                                      milestone.description ||
                                      "No description available."
                                    }
                                  </p>

                                </div>

                                <span
                                  className={`badge rounded-pill align-self-start ${getStatusClass(
                                    milestone.status
                                  )}`}
                                >
                                  {
                                    milestone.status
                                  }
                                </span>

                              </div>

                              <div className="small text-secondary">

                                {milestone.completedDate
                                  ? `Completed: ${formatDate(
                                      milestone.completedDate
                                    )}`
                                  : milestone.plannedDate
                                    ? `Planned: ${formatDate(
                                        milestone.plannedDate
                                      )}`
                                    : "Date not available"}

                              </div>

                              {/* MILESTONE PROGRESS */}

                              {(current ||
                                milestone.progressPercentage >
                                  0) && (

                                <div className="mt-3">

                                  <div className="d-flex justify-content-between mb-1">

                                    <span className="small fw-semibold">
                                      Milestone Progress
                                    </span>

                                    <span className="small fw-bold text-primary">
                                      {
                                        milestone.progressPercentage
                                      }
                                      %
                                    </span>

                                  </div>

                                  <div
                                    className="progress"
                                    style={{
                                      height: "7px",
                                    }}
                                  >

                                    <div
                                      className="progress-bar"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            milestone.progressPercentage
                                          )
                                        )}%`,
                                      }}
                                    />

                                  </div>

                                </div>

                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PROJECT STATUS
          ================================================= */}

          <div className="row g-4 mt-1">

            <div className="col-lg-8">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-3">

                    <div className="mts-icon-box me-3">
                      <CheckCircle2
                        size={22}
                      />
                    </div>

                    <div>

                      <h2 className="h6 fw-bold mb-1">
                        Current Project Status
                      </h2>

                      <div
                        className={`small ${
                          project.status.toLowerCase() ===
                          "completed"
                            ? "text-success"
                            : "text-primary"
                        }`}
                      >
                        {project.status}
                      </div>

                    </div>

                  </div>

                  <p className="small text-secondary mb-0">

                    {project.description ||
                      "Project activities are being tracked according to the agreed project plan."}

                  </p>

                </div>

              </div>

            </div>

            <div className="col-lg-4">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4">

                  <h2 className="h6 fw-bold mb-3">
                    Need an Update?
                  </h2>

                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() =>
                      navigate("/messages")
                    }
                  >
                    Contact Project Team
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

