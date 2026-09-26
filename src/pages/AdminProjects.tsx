import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  FolderKanban,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// TYPES
// =========================================================

interface Project {
  projectId: number;
  clientId: number;

  clientName?: string | null;
  companyName?: string | null;

  projectName: string;
  description?: string | null;

  status: string;

  projectAmount: number;

  startDate?: string | null;
  expectedEndDate?: string | null;
  completedDate?: string | null;

  overallProgress: number;
  totalMilestones: number;
  completedMilestones: number;

  createdAt?: string | null;
}

interface ProjectsResponse {
  success: boolean;
  message?: string;
  count: number;
  projects: Project[];
}

interface Client {
  clientId: number;
  fullName: string;
  companyName: string;
}

interface ClientsResponse {
  success: boolean;
  clients: Client[];
}

interface CreateProjectForm {
  clientId: string;
  projectName: string;
  description: string;
  status: string;
  projectAmount: string;
  startDate: string;
  expectedEndDate: string;
}

interface EditProjectForm {
  clientId: string;
  projectName: string;
  description: string;
  status: string;
  projectAmount: string;
  startDate: string;
  expectedEndDate: string;
  completedDate: string;
}

// =========================================================
// AUTH
// =========================================================

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
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
// CURRENCY
// =========================================================

function formatCurrency(
  amount: number
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(
  status: string
): string {
  switch (
    status.toLowerCase()
  ) {
    case "planning":
      return "bg-warning-subtle text-warning-emphasis";

    case "in progress":
      return "bg-primary-subtle text-primary";

    case "completed":
      return "bg-success-subtle text-success";

    case "on hold":
      return "bg-secondary-subtle text-secondary";

    case "cancelled":
      return "bg-danger-subtle text-danger";

    default:
      return "bg-light text-secondary";
  }
}

// =========================================================
// EMPTY FORMS
// =========================================================

const emptyCreateForm: CreateProjectForm = {
  clientId: "",
  projectName: "",
  description: "",
  status: "Planning",
  projectAmount: "",
  startDate: "",
  expectedEndDate: "",
};

const emptyEditForm: EditProjectForm = {
  clientId: "",
  projectName: "",
  description: "",
  status: "Planning",
  projectAmount: "",
  startDate: "",
  expectedEndDate: "",
  completedDate: "",
};

// =========================================================
// COMPONENT
// =========================================================

export default function AdminProjects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  // =======================================================
  // ADD
  // =======================================================

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [createForm, setCreateForm] =
    useState<CreateProjectForm>(
      emptyCreateForm
    );

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  // =======================================================
  // VIEW
  // =======================================================

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  // =======================================================
  // EDIT
  // =======================================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editForm, setEditForm] =
    useState<EditProjectForm>(
      emptyEditForm
    );

  const [updating, setUpdating] =
    useState(false);

  const [editError, setEditError] =
    useState("");

  // =======================================================
  // LOAD DATA
  // =======================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    await Promise.all([
      loadProjects(),
      loadClients(),
    ]);
  }

  // =======================================================
  // LOAD PROJECTS
  // =======================================================

  async function loadProjects() {
    try {
      setError("");
      setRefreshing(true);

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

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
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view projects."
          );
        }

        throw new Error(
          `Unable to load projects. Status: ${response.status}`
        );
      }

      const result: ProjectsResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load projects."
        );
      }

      setProjects(
        result.projects ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =======================================================
  // LOAD CLIENTS
  // =======================================================

  async function loadClients() {
    try {
      const token = getAuthToken();

      if (!token) {
        return;
      }

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
        return;
      }

      const result: ClientsResponse =
        await response.json();

      if (result.success) {
        setClients(
          result.clients ?? []
        );
      }
    } catch {
      // Client loading error is handled
      // when the Add Project form is used.
    }
  }

  // =======================================================
  // FILTER
  // =======================================================

  const filteredProjects = useMemo(() => {
    const search =
      searchText
        .trim()
        .toLowerCase();

    if (!search) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.projectName
          .toLowerCase()
          .includes(search) ||
        (project.clientName ?? "")
          .toLowerCase()
          .includes(search) ||
        (project.companyName ?? "")
          .toLowerCase()
          .includes(search) ||
        project.status
          .toLowerCase()
          .includes(search)
    );
  }, [projects, searchText]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalProjects =
    projects.length;

  const planningProjects =
    projects.filter(
      (x) =>
        x.status.toLowerCase() ===
        "planning"
    ).length;

  const inProgressProjects =
    projects.filter(
      (x) =>
        x.status.toLowerCase() ===
        "in progress"
    ).length;

  const completedProjects =
    projects.filter(
      (x) =>
        x.status.toLowerCase() ===
        "completed"
    ).length;

  // =======================================================
  // CREATE FORM CHANGE
  // =======================================================

  function handleCreateChange(
    field: keyof CreateProjectForm,
    value: string
  ) {
    setCreateForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }

  // =======================================================
  // CREATE PROJECT
  // =======================================================

  async function handleCreateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      if (!createForm.clientId) {
        throw new Error(
          "Please select a client."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Projects`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId:
              Number(
                createForm.clientId
              ),

            projectName:
              createForm.projectName,

            description:
              createForm.description ||
              null,

            status:
              createForm.status,

            projectAmount:
              Number(
                createForm.projectAmount ||
                  0
              ),

            startDate:
              createForm.startDate ||
              null,

            expectedEndDate:
              createForm.expectedEndDate ||
              null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to create project."
        );
      }

      setCreateForm(
        emptyCreateForm
      );

      setShowAddModal(false);

      await loadProjects();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  }

  // =======================================================
  // VIEW PROJECT
  // =======================================================

  async function handleViewProject(
    project: Project
  ) {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Projects/${project.projectId}`,
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
          "Unable to load project details."
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load project details."
        );
      }

      setSelectedProject({
        ...project,
        ...result,
      });

      setShowViewModal(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load project details."
      );
    }
  }

  // =======================================================
  // OPEN EDIT
  // =======================================================

  function handleEditProject(
    project: Project
  ) {
    setSelectedProject(project);

    setEditForm({
      clientId:
        String(project.clientId),

      projectName:
        project.projectName,

      description:
        project.description ?? "",

      status:
        project.status,

      projectAmount:
        String(
          project.projectAmount ?? 0
        ),

      startDate:
        project.startDate
          ? project.startDate.substring(
              0,
              10
            )
          : "",

      expectedEndDate:
        project.expectedEndDate
          ? project.expectedEndDate.substring(
              0,
              10
            )
          : "",

      completedDate:
        project.completedDate
          ? project.completedDate.substring(
              0,
              10
            )
          : "",
    });

    setEditError("");
    setShowEditModal(true);
  }

  // =======================================================
  // EDIT CHANGE
  // =======================================================

  function handleEditChange(
    field: keyof EditProjectForm,
    value: string
  ) {
    setEditForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }

  // =======================================================
  // UPDATE PROJECT
  // =======================================================

  async function handleUpdateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedProject) {
      return;
    }

    try {
      setUpdating(true);
      setEditError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Projects/${selectedProject.projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId:
              Number(
                editForm.clientId
              ),

            projectName:
              editForm.projectName,

            description:
              editForm.description ||
              null,

            status:
              editForm.status,

            projectAmount:
              Number(
                editForm.projectAmount ||
                  0
              ),

            startDate:
              editForm.startDate ||
              null,

            expectedEndDate:
              editForm.expectedEndDate ||
              null,

            completedDate:
              editForm.completedDate ||
              null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update project."
        );
      }

      setShowEditModal(false);
      setSelectedProject(null);

      await loadProjects();
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to update project."
      );
    } finally {
      setUpdating(false);
    }
  }

  // =======================================================
  // CLOSE MODALS
  // =======================================================

  function closeAddModal() {
    if (creating) {
      return;
    }

    setShowAddModal(false);
    setCreateError("");
    setCreateForm(
      emptyCreateForm
    );
  }

  function closeEditModal() {
    if (updating) {
      return;
    }

    setShowEditModal(false);
    setEditError("");
    setSelectedProject(null);
  }

  function closeViewModal() {
    setShowViewModal(false);
    setSelectedProject(null);
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="container-fluid px-3 px-lg-4 py-4">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <div className="small text-primary fw-semibold text-uppercase">
            Admin Portal
          </div>

          <h1 className="h3 fw-bold mb-1">
            Projects
          </h1>

          <p className="text-secondary mb-0">
            Manage client projects and delivery progress.
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={loadInitialData}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className="me-2"
            />

            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
            onClick={() => {
              setCreateError("");
              setCreateForm(
                emptyCreateForm
              );
              setShowAddModal(true);
            }}
          >
            <Plus
              size={17}
              className="me-2"
            />

            Add Project
          </button>

        </div>
      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <FolderKanban size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Total Projects
                </div>

                <div className="h4 fw-bold mb-0">
                  {totalProjects}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <CalendarDays size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Planning
                </div>

                <div className="h4 fw-bold mb-0">
                  {planningProjects}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <RefreshCw size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  In Progress
                </div>

                <div className="h4 fw-bold mb-0">
                  {inProgressProjects}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <CheckCircle2 size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Completed
                </div>

                <div className="h4 fw-bold mb-0">
                  {completedProjects}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={loadInitialData}
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          PROJECT TABLE
      =================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body border-bottom">

          <div className="row g-3 align-items-center">

            <div className="col-12 col-lg-7">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Search size={17} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search project, client, company or status..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                />

                {searchText && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSearchText("")
                    }
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

            </div>

            <div className="col-12 col-lg-5 text-lg-end">

              <span className="small text-secondary">
                Showing{" "}
                <strong>
                  {filteredProjects.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {projects.length}
                </strong>{" "}
                projects
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="py-5 text-center">

            <div
              className="spinner-border text-primary"
              role="status"
            />

            <div className="small text-secondary mt-3">
              Loading projects...
            </div>

          </div>
        ) : filteredProjects.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="py-5 text-center">

            <div
              className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <FolderKanban
                size={28}
                className="text-secondary"
              />
            </div>

            <h5 className="fw-bold">
              No projects found
            </h5>

            <p className="text-secondary">
              {searchText
                ? "Try changing your search criteria."
                : "No projects have been created yet."}
            </p>

          </div>
        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4 py-3">
                    Project
                  </th>

                  <th className="py-3">
                    Client
                  </th>

                  <th className="py-3">
                    Status
                  </th>

                  <th className="py-3">
                    Progress
                  </th>

                  <th className="py-3">
                    Amount
                  </th>

                  <th className="py-3">
                    Timeline
                  </th>

                  <th className="py-3 text-end px-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProjects.map(
                  (project) => (
                    <tr
                      key={
                        project.projectId
                      }
                    >

                      {/* PROJECT */}

                      <td className="px-4">

                        <div className="fw-semibold">
                          {
                            project.projectName
                          }
                        </div>

                        <div className="small text-secondary">
                          Project #
                          {
                            project.projectId
                          }
                        </div>

                      </td>

                      {/* CLIENT */}

                      <td>

                        <div className="fw-semibold">
                          {
                            project.clientName ||
                            "-"
                          }
                        </div>

                        <div className="small text-secondary">
                          {
                            project.companyName ||
                            "-"
                          }
                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            project.status
                          )} px-2 py-1`}
                        >
                          {
                            project.status
                          }
                        </span>

                      </td>

                      {/* PROGRESS */}

                      <td style={{ minWidth: "150px" }}>

                        <div className="d-flex justify-content-between small mb-1">

                          <span className="text-secondary">
                            {
                              project.overallProgress
                            }
                            %
                          </span>

                          <span className="text-secondary">
                            {
                              project.completedMilestones
                            }
                            /
                            {
                              project.totalMilestones
                            }
                          </span>

                        </div>

                        <div
                          className="progress"
                          style={{
                            height: "6px",
                          }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  project.overallProgress,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                      </td>

                      {/* AMOUNT */}

                      <td>

                        <div className="fw-semibold">
                          {
                            formatCurrency(
                              project.projectAmount
                            )
                          }
                        </div>

                      </td>

                      {/* TIMELINE */}

                      <td>

                        <div className="small">
                          <div>
                            {
                              formatDate(
                                project.startDate
                              )
                            }
                          </div>

                          <div className="text-secondary">
                            to{" "}
                            {
                              formatDate(
                                project.expectedEndDate
                              )
                            }
                          </div>
                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="text-end px-4">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="View project"
                            onClick={() =>
                              handleViewProject(
                                project
                              )
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="Edit project"
                            onClick={() =>
                              handleEditProject(
                                project
                              )
                            }
                          >
                            <Edit3 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          ADD PROJECT MODAL
      ===================================================== */}

      {showAddModal && (
        <div
          className="modal d-block"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.45)",
            zIndex: 1060,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    Add New Project
                  </h5>

                  <div className="small text-secondary">
                    Create a project for a client.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    closeAddModal
                  }
                  disabled={creating}
                />

              </div>

              <form
                onSubmit={
                  handleCreateProject
                }
              >

                <div className="modal-body">

                  {createError && (
                    <div className="alert alert-danger">
                      {createError}
                    </div>
                  )}

                  <div className="row g-3">

                    {/* CLIENT */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Client *
                      </label>

                      <select
                        className="form-select"
                        value={
                          createForm.clientId
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "clientId",
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select client
                        </option>

                        {clients.map(
                          (client) => (
                            <option
                              key={
                                client.clientId
                              }
                              value={
                                client.clientId
                              }
                            >
                              {
                                client.fullName
                              }{" "}
                              -{" "}
                              {
                                client.companyName
                              }
                            </option>
                          )
                        )}
                      </select>

                    </div>

                    {/* PROJECT NAME */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Project Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.projectName
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "projectName",
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* STATUS */}

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        className="form-select"
                        value={
                          createForm.status
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "status",
                            event.target.value
                          )
                        }
                      >
                        <option value="Planning">
                          Planning
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="On Hold">
                          On Hold
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>

                    </div>

                    {/* AMOUNT */}

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Project Amount
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        value={
                          createForm.projectAmount
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "projectAmount",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* START DATE */}

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Start Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          createForm.startDate
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "startDate",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* EXPECTED END */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Expected End Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          createForm.expectedEndDate
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "expectedEndDate",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* DESCRIPTION */}

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Description
                      </label>

                      <textarea
                        className="form-control"
                        rows={4}
                        value={
                          createForm.description
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "description",
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={
                      closeAddModal
                    }
                    disabled={creating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus
                          size={16}
                          className="me-2"
                        />
                        Create Project
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW PROJECT MODAL
      ===================================================== */}

      {showViewModal &&
        selectedProject && (
          <div
            className="modal d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.45)",
              zIndex: 1060,
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

              <div className="modal-content border-0 shadow">

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold">
                      {
                        selectedProject.projectName
                      }
                    </h5>

                    <div className="small text-secondary">
                      Project #
                      {
                        selectedProject.projectId
                      }
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={
                      closeViewModal
                    }
                  />

                </div>

                <div className="modal-body">

                  {/* PROJECT INFO */}

                  <div className="row g-3 mb-4">

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Client
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedProject.clientName ||
                          "-"
                        }
                      </div>

                      <div className="small text-secondary">
                        {
                          selectedProject.companyName ||
                          "-"
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Status
                      </div>

                      <span
                        className={`badge ${getStatusClass(
                          selectedProject.status
                        )}`}
                      >
                        {
                          selectedProject.status
                        }
                      </span>

                    </div>

                    <div className="col-md-4">

                      <div className="small text-secondary">
                        Project Amount
                      </div>

                      <div className="fw-semibold">
                        {formatCurrency(
                          selectedProject.projectAmount
                        )}
                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="small text-secondary">
                        Start Date
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedProject.startDate
                        )}
                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="small text-secondary">
                        Expected End
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedProject.expectedEndDate
                        )}
                      </div>

                    </div>

                    <div className="col-12">

                      <div className="small text-secondary">
                        Description
                      </div>

                      <div>
                        {
                          selectedProject.description ||
                          "No description available."
                        }
                      </div>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="border rounded-3 p-3 mb-4">

                    <div className="d-flex justify-content-between mb-2">

                      <span className="fw-semibold">
                        Overall Progress
                      </span>

                      <span className="fw-bold text-primary">
                        {
                          selectedProject.overallProgress
                        }%
                      </span>

                    </div>

                    <div
                      className="progress mb-2"
                      style={{
                        height: "8px",
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              selectedProject.overallProgress,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="small text-secondary">
                      {
                        selectedProject.completedMilestones
                      }{" "}
                      of{" "}
                      {
                        selectedProject.totalMilestones
                      }{" "}
                      milestones completed
                    </div>

                  </div>

                  {/* MILESTONE SUMMARY */}

                  <div className="alert alert-light border mb-0">

                    <div className="fw-semibold mb-1">
                      Milestones
                    </div>

                    <div className="small text-secondary">
                      Milestone details can be managed from the Admin Milestones module.
                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={() => {
                      setShowViewModal(
                        false
                      );

                      handleEditProject(
                        selectedProject
                      );
                    }}
                  >
                    <Edit3
                      size={15}
                      className="me-2"
                    />
                    Edit Project
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      closeViewModal
                    }
                  >
                    Close
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT PROJECT MODAL
      ===================================================== */}

      {showEditModal &&
        selectedProject && (
          <div
            className="modal d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.45)",
              zIndex: 1060,
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

              <div className="modal-content border-0 shadow">

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold">
                      Edit Project
                    </h5>

                    <div className="small text-secondary">
                      Update project information.
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={
                      closeEditModal
                    }
                    disabled={updating}
                  />

                </div>

                <form
                  onSubmit={
                    handleUpdateProject
                  }
                >

                  <div className="modal-body">

                    {editError && (
                      <div className="alert alert-danger">
                        {editError}
                      </div>
                    )}

                    <div className="row g-3">

                      {/* CLIENT */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Client *
                        </label>

                        <select
                          className="form-select"
                          value={
                            editForm.clientId
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "clientId",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select client
                          </option>

                          {clients.map(
                            (client) => (
                              <option
                                key={
                                  client.clientId
                                }
                                value={
                                  client.clientId
                                }
                              >
                                {
                                  client.fullName
                                }{" "}
                                -{" "}
                                {
                                  client.companyName
                                }
                              </option>
                            )
                          )}
                        </select>

                      </div>

                      {/* PROJECT NAME */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Project Name *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.projectName
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "projectName",
                              event.target.value
                            )
                          }
                          required
                        />

                      </div>

                      {/* STATUS */}

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Status
                        </label>

                        <select
                          className="form-select"
                          value={
                            editForm.status
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="Planning">
                            Planning
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="On Hold">
                            On Hold
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>

                      </div>

                      {/* AMOUNT */}

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Project Amount
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={
                            editForm.projectAmount
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "projectAmount",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* START */}

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Start Date
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            editForm.startDate
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "startDate",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* END */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Expected End Date
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            editForm.expectedEndDate
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "expectedEndDate",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* COMPLETED */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Completed Date
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            editForm.completedDate
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "completedDate",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* DESCRIPTION */}

                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Description
                        </label>

                        <textarea
                          className="form-control"
                          rows={4}
                          value={
                            editForm.description
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "description",
                              event.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                  <div className="modal-footer">

                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={
                        closeEditModal
                      }
                      disabled={updating}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={16}
                            className="me-2"
                          />
                          Save Changes
                        </>
                      )}
                    </button>

                  </div>

                </form>

              </div>
            </div>
          </div>
        )}

    </main>
  );
}

