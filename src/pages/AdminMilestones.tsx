import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  FolderKanban,
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

interface Milestone {
  projectMilestoneId: number;
  projectId: number;
  projectName: string;

  milestoneName: string;
  description?: string | null;

  progressPercentage: number;
  status: string;

  plannedDate?: string | null;
  completedDate?: string | null;
  createdAt?: string | null;
}

interface MilestonesResponse {
  success: boolean;
  message?: string;
  count: number;
  milestones: Milestone[];
}

interface Project {
  projectId: number;
  projectName: string;
  clientId?: number;
  clientName?: string | null;
  companyName?: string | null;
}

interface ProjectsResponse {
  success: boolean;
  projects: Project[];
}

interface MilestoneForm {
  projectId: string;
  milestoneName: string;
  description: string;
  progressPercentage: string;
  status: string;
  plannedDate: string;
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
// DATE
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
// STATUS
// =========================================================

function getStatusClass(
  status: string
): string {
  switch (
    status.toLowerCase()
  ) {
    case "pending":
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
// EMPTY FORM
// =========================================================

const emptyForm: MilestoneForm = {
  projectId: "",
  milestoneName: "",
  description: "",
  progressPercentage: "0",
  status: "Pending",
  plannedDate: "",
  completedDate: "",
};

// =========================================================
// COMPONENT
// =========================================================

export default function AdminMilestones() {
  const [milestones, setMilestones] =
    useState<Milestone[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [projectFilter, setProjectFilter] =
    useState("all");

  // =======================================================
  // ADD
  // =======================================================

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [createForm, setCreateForm] =
    useState<MilestoneForm>(
      emptyForm
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

  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null);

  // =======================================================
  // EDIT
  // =======================================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editForm, setEditForm] =
    useState<MilestoneForm>(
      emptyForm
    );

  const [updating, setUpdating] =
    useState(false);

  const [editError, setEditError] =
    useState("");

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    await Promise.all([
      loadMilestones(),
      loadProjects(),
    ]);
  }

  // =======================================================
  // LOAD MILESTONES
  // =======================================================

  async function loadMilestones() {
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
        `${API_BASE_URL}/ProjectMilestones`,
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
            "You are not authorized to view milestones."
          );
        }

        throw new Error(
          `Unable to load milestones. Status: ${response.status}`
        );
      }

      const result: MilestonesResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load milestones."
        );
      }

      setMilestones(
        result.milestones ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load milestones."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =======================================================
  // LOAD PROJECTS
  // =======================================================

  async function loadProjects() {
    try {
      const token = getAuthToken();

      if (!token) {
        return;
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
        return;
      }

      const result: ProjectsResponse =
        await response.json();

      if (result.success) {
        setProjects(
          result.projects ?? []
        );
      }
    } catch {
      // Main milestone loading remains independent.
    }
  }

  // =======================================================
  // UNIQUE PROJECTS FROM MILESTONES
  // =======================================================

  const projectOptions = useMemo(() => {
    const map =
      new Map<number, string>();

    projects.forEach((project) => {
      map.set(
        project.projectId,
        project.projectName
      );
    });

    milestones.forEach((milestone) => {
      if (!map.has(milestone.projectId)) {
        map.set(
          milestone.projectId,
          milestone.projectName
        );
      }
    });

    return Array.from(
      map.entries()
    ).map(([projectId, projectName]) => ({
      projectId,
      projectName,
    }));
  }, [projects, milestones]);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredMilestones =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      return milestones.filter(
        (milestone) => {
          const matchesSearch =
            !search ||
            milestone.milestoneName
              .toLowerCase()
              .includes(search) ||
            milestone.projectName
              .toLowerCase()
              .includes(search) ||
            milestone.status
              .toLowerCase()
              .includes(search);

          const matchesProject =
            projectFilter === "all" ||
            milestone.projectId ===
              Number(projectFilter);

          return (
            matchesSearch &&
            matchesProject
          );
        }
      );
    }, [
      milestones,
      searchText,
      projectFilter,
    ]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalMilestones =
    milestones.length;

  const pendingCount =
    milestones.filter(
      (x) =>
        x.status.toLowerCase() ===
        "pending"
    ).length;

  const inProgressCount =
    milestones.filter(
      (x) =>
        x.status.toLowerCase() ===
        "in progress"
    ).length;

  const completedCount =
    milestones.filter(
      (x) =>
        x.status.toLowerCase() ===
        "completed"
    ).length;

  // =======================================================
  // FORM CHANGE
  // =======================================================

  function handleFormChange(
    field: keyof MilestoneForm,
    value: string
  ) {
    setCreateForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }

  function handleEditFormChange(
    field: keyof MilestoneForm,
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
  // CREATE
  // =======================================================

  async function handleCreate(
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

      if (!createForm.projectId) {
        throw new Error(
          "Please select a project."
        );
      }

      const progress =
        Number(
          createForm.progressPercentage
        );

      if (
        progress < 0 ||
        progress > 100
      ) {
        throw new Error(
          "Progress must be between 0 and 100."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ProjectMilestones`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectId:
              Number(
                createForm.projectId
              ),

            milestoneName:
              createForm.milestoneName,

            description:
              createForm.description ||
              null,

            progressPercentage:
              progress,

            status:
              createForm.status,

            plannedDate:
              createForm.plannedDate ||
              null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to create milestone."
        );
      }

      setCreateForm(
        emptyForm
      );

      setShowAddModal(false);

      await loadMilestones();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to create milestone."
      );
    } finally {
      setCreating(false);
    }
  }

  // =======================================================
  // VIEW
  // =======================================================

  async function handleView(
    milestone: Milestone
  ) {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ProjectMilestones/${milestone.projectMilestoneId}`,
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
          "Unable to load milestone details."
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load milestone details."
        );
      }

      setSelectedMilestone({
        ...milestone,
        ...result,
      });

      setShowViewModal(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load milestone details."
      );
    }
  }

  // =======================================================
  // OPEN EDIT
  // =======================================================

  function handleEdit(
    milestone: Milestone
  ) {
    setSelectedMilestone(
      milestone
    );

    setEditForm({
      projectId:
        String(
          milestone.projectId
        ),

      milestoneName:
        milestone.milestoneName,

      description:
        milestone.description ?? "",

      progressPercentage:
        String(
          milestone.progressPercentage
        ),

      status:
        milestone.status,

      plannedDate:
        milestone.plannedDate
          ? milestone.plannedDate.substring(
              0,
              10
            )
          : "",

      completedDate:
        milestone.completedDate
          ? milestone.completedDate.substring(
              0,
              10
            )
          : "",
    });

    setEditError("");
    setShowEditModal(true);
  }

  // =======================================================
  // UPDATE
  // =======================================================

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedMilestone) {
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

      const progress =
        Number(
          editForm.progressPercentage
        );

      if (
        progress < 0 ||
        progress > 100
      ) {
        throw new Error(
          "Progress must be between 0 and 100."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ProjectMilestones/${selectedMilestone.projectMilestoneId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectId:
              Number(
                editForm.projectId
              ),

            milestoneName:
              editForm.milestoneName,

            description:
              editForm.description ||
              null,

            progressPercentage:
              progress,

            status:
              editForm.status,

            plannedDate:
              editForm.plannedDate ||
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
            "Unable to update milestone."
        );
      }

      setShowEditModal(false);
      setSelectedMilestone(null);

      await loadMilestones();
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to update milestone."
      );
    } finally {
      setUpdating(false);
    }
  }

  // =======================================================
  // CLOSE
  // =======================================================

  function closeAddModal() {
    if (creating) {
      return;
    }

    setShowAddModal(false);
    setCreateError("");
    setCreateForm(
      emptyForm
    );
  }

  function closeViewModal() {
    setShowViewModal(false);
    setSelectedMilestone(null);
  }

  function closeEditModal() {
    if (updating) {
      return;
    }

    setShowEditModal(false);
    setEditError("");
    setSelectedMilestone(null);
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
            Milestones
          </h1>

          <p className="text-secondary mb-0">
            Track and manage project delivery milestones.
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
                emptyForm
              );
              setShowAddModal(true);
            }}
          >
            <Plus
              size={17}
              className="me-2"
            />
            Add Milestone
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
                <BarChart3 size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Total Milestones
                </div>

                <div className="h4 fw-bold mb-0">
                  {totalMilestones}
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
                  Pending
                </div>

                <div className="h4 fw-bold mb-0">
                  {pendingCount}
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
                  {inProgressCount}
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
                  {completedCount}
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
          FILTERS
      =================================================== */}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">

          <div className="row g-3">

            <div className="col-12 col-lg-7">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Search size={17} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search milestone, project or status..."
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

            <div className="col-12 col-lg-5">

              <select
                className="form-select"
                value={projectFilter}
                onChange={(event) =>
                  setProjectFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Projects
                </option>

                {projectOptions.map(
                  (project) => (
                    <option
                      key={
                        project.projectId
                      }
                      value={
                        project.projectId
                      }
                    >
                      {
                        project.projectName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body border-bottom">

          <div className="d-flex justify-content-between">

            <span className="small text-secondary">
              Showing{" "}
              <strong>
                {filteredMilestones.length}
              </strong>{" "}
              of{" "}
              <strong>
                {milestones.length}
              </strong>{" "}
              milestones
            </span>

          </div>

        </div>

        {loading ? (
          <div className="py-5 text-center">

            <div
              className="spinner-border text-primary"
              role="status"
            />

            <div className="small text-secondary mt-3">
              Loading milestones...
            </div>

          </div>
        ) : filteredMilestones.length === 0 ? (

          <div className="py-5 text-center">

            <div
              className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <BarChart3
                size={28}
                className="text-secondary"
              />
            </div>

            <h5 className="fw-bold">
              No milestones found
            </h5>

            <p className="text-secondary mb-0">
              {searchText ||
              projectFilter !== "all"
                ? "Try changing your filters."
                : "No project milestones have been created yet."}
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4 py-3">
                    Milestone
                  </th>

                  <th className="py-3">
                    Project
                  </th>

                  <th className="py-3">
                    Progress
                  </th>

                  <th className="py-3">
                    Status
                  </th>

                  <th className="py-3">
                    Planned Date
                  </th>

                  <th className="py-3 text-end px-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredMilestones.map(
                  (milestone) => (
                    <tr
                      key={
                        milestone.projectMilestoneId
                      }
                    >

                      {/* MILESTONE */}

                      <td className="px-4">

                        <div className="fw-semibold">
                          {
                            milestone.milestoneName
                          }
                        </div>

                        <div className="small text-secondary">
                          Milestone #
                          {
                            milestone.projectMilestoneId
                          }
                        </div>

                      </td>

                      {/* PROJECT */}

                      <td>

                        <div className="fw-semibold">
                          {
                            milestone.projectName
                          }
                        </div>

                        <div className="small text-secondary">
                          Project #
                          {
                            milestone.projectId
                          }
                        </div>

                      </td>

                      {/* PROGRESS */}

                      <td
                        style={{
                          minWidth: "170px",
                        }}
                      >

                        <div className="d-flex justify-content-between small mb-1">

                          <span>
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
                            role="progressbar"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  milestone.progressPercentage,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            milestone.status
                          )}`}
                        >
                          {
                            milestone.status
                          }
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="small">
                          {
                            formatDate(
                              milestone.plannedDate
                            )
                          }
                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="text-end px-4">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="View milestone"
                            onClick={() =>
                              handleView(
                                milestone
                              )
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="Edit milestone"
                            onClick={() =>
                              handleEdit(
                                milestone
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
          ADD MODAL
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
                    Add Milestone
                  </h5>

                  <div className="small text-secondary">
                    Create a milestone for a project.
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
                  handleCreate
                }
              >

                <div className="modal-body">

                  {createError && (
                    <div className="alert alert-danger">
                      {createError}
                    </div>
                  )}

                  <div className="row g-3">

                    {/* PROJECT */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Project *
                      </label>

                      <select
                        className="form-select"
                        value={
                          createForm.projectId
                        }
                        onChange={(event) =>
                          handleFormChange(
                            "projectId",
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select project
                        </option>

                        {projects.map(
                          (project) => (
                            <option
                              key={
                                project.projectId
                              }
                              value={
                                project.projectId
                              }
                            >
                              {
                                project.projectName
                              }
                            </option>
                          )
                        )}
                      </select>

                    </div>

                    {/* NAME */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Milestone Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.milestoneName
                        }
                        onChange={(event) =>
                          handleFormChange(
                            "milestoneName",
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
                          handleFormChange(
                            "status",
                            event.target.value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="On Hold">
                          On Hold
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>

                    </div>

                    {/* PROGRESS */}

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Progress %
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={
                          createForm.progressPercentage
                        }
                        onChange={(event) =>
                          handleFormChange(
                            "progressPercentage",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* PLANNED DATE */}

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Planned Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          createForm.plannedDate
                        }
                        onChange={(event) =>
                          handleFormChange(
                            "plannedDate",
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
                          handleFormChange(
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
                        Create Milestone
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
          VIEW MODAL
      ===================================================== */}

      {showViewModal &&
        selectedMilestone && (
          <div
            className="modal d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.45)",
              zIndex: 1060,
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">

              <div className="modal-content border-0 shadow">

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold">
                      {
                        selectedMilestone.milestoneName
                      }
                    </h5>

                    <div className="small text-secondary">
                      Milestone #
                      {
                        selectedMilestone.projectMilestoneId
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

                  <div className="row g-4">

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Project
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedMilestone.projectName
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Status
                      </div>

                      <span
                        className={`badge ${getStatusClass(
                          selectedMilestone.status
                        )}`}
                      >
                        {
                          selectedMilestone.status
                        }
                      </span>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary mb-1">
                        Progress
                      </div>

                      <div className="d-flex justify-content-between small mb-1">
                        <span>
                          {
                            selectedMilestone.progressPercentage
                          }%
                        </span>
                      </div>

                      <div
                        className="progress"
                        style={{
                          height: "8px",
                        }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                selectedMilestone.progressPercentage,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Planned Date
                      </div>

                      <div className="fw-semibold">
                        {
                          formatDate(
                            selectedMilestone.plannedDate
                          )
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Completed Date
                      </div>

                      <div className="fw-semibold">
                        {
                          formatDate(
                            selectedMilestone.completedDate
                          )
                        }
                      </div>

                    </div>

                    <div className="col-12">

                      <div className="small text-secondary">
                        Description
                      </div>

                      <div>
                        {
                          selectedMilestone.description ||
                          "No description available."
                        }
                      </div>

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

                      handleEdit(
                        selectedMilestone
                      );
                    }}
                  >
                    <Edit3
                      size={15}
                      className="me-2"
                    />
                    Edit Milestone
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
          EDIT MODAL
      ===================================================== */}

      {showEditModal &&
        selectedMilestone && (
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
                      Edit Milestone
                    </h5>

                    <div className="small text-secondary">
                      Update milestone details and progress.
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
                    handleUpdate
                  }
                >

                  <div className="modal-body">

                    {editError && (
                      <div className="alert alert-danger">
                        {editError}
                      </div>
                    )}

                    <div className="row g-3">

                      {/* PROJECT */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Project *
                        </label>

                        <select
                          className="form-select"
                          value={
                            editForm.projectId
                          }
                          onChange={(event) =>
                            handleEditFormChange(
                              "projectId",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select project
                          </option>

                          {projects.map(
                            (project) => (
                              <option
                                key={
                                  project.projectId
                                }
                                value={
                                  project.projectId
                                }
                              >
                                {
                                  project.projectName
                                }
                              </option>
                            )
                          )}
                        </select>

                      </div>

                      {/* NAME */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Milestone Name *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.milestoneName
                          }
                          onChange={(event) =>
                            handleEditFormChange(
                              "milestoneName",
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
                            handleEditFormChange(
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                          <option value="On Hold">
                            On Hold
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>

                      </div>

                      {/* PROGRESS */}

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Progress %
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={
                            editForm.progressPercentage
                          }
                          onChange={(event) =>
                            handleEditFormChange(
                              "progressPercentage",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* PLANNED */}

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Planned Date
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={
                            editForm.plannedDate
                          }
                          onChange={(event) =>
                            handleEditFormChange(
                              "plannedDate",
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
                            handleEditFormChange(
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
                            handleEditFormChange(
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
