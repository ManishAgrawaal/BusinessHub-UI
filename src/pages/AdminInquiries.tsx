import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================================
// TYPES
// ============================================================

interface ProjectInquiry {
  projectInquiryId: number;

  clientId?: number | null;

  clientName?: string | null;
  clientEmail?: string | null;
  companyName?: string | null;

  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;

  serviceRequired?: string | null;

  projectName: string;
  projectType: string;

  budget?: string | null;

  startDate?: string | null;
  deliveryDate?: string | null;

  description: string;
  requirements: string;

  technologies?: string | null;
  additionalRequirements?: string | null;

  status: string;

  createdAt: string;
  updatedAt?: string | null;
}

interface InquiriesResponse {
  success: boolean;
  inquiries: ProjectInquiry[];
}

// ============================================================
// DATE FORMAT
// ============================================================

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

// ============================================================
// STATUS STYLE
// ============================================================

function getStatusClass(
  status: string
): string {
  switch (status.toLowerCase()) {
    case "new":
      return "bg-primary-subtle text-primary";

    case "under review":
      return "bg-warning-subtle text-warning-emphasis";

    case "approved":
      return "bg-success-subtle text-success";

    case "rejected":
      return "bg-danger-subtle text-danger";

    default:
      return "bg-light text-dark";
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function AdminInquiries() {
  const navigate = useNavigate();

  const [inquiries, setInquiries] =
    useState<ProjectInquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedInquiry, setSelectedInquiry] =
    useState<ProjectInquiry | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  // ==========================================================
  // LOAD INQUIRIES
  // ==========================================================

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("mts_token") ||
        sessionStorage.getItem("mts_token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

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
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view project inquiries."
          );
        }

        throw new Error(
          `Unable to load inquiries. Status: ${response.status}`
        );
      }

      const result: InquiriesResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load project inquiries."
        );
      }

      setInquiries(
        result.inquiries ?? []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load project inquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // APPROVE INQUIRY
  // ==========================================================

  async function handleApproveInquiry() {
    if (!selectedInquiry || actionLoading) {
      return;
    }

    const currentStatus =
      selectedInquiry.status
        .toLowerCase()
        .trim();

    // Prevent duplicate approval
    if (currentStatus === "approved") {
      return;
    }

    // Prevent approving rejected inquiry
    if (currentStatus === "rejected") {
      setError(
        "A rejected inquiry cannot be approved."
      );
      return;
    }

    const confirmed = window.confirm(
      `Approve "${selectedInquiry.projectName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token =
        localStorage.getItem("mts_token") ||
        sessionStorage.getItem("mts_token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ProjectInquiries/${selectedInquiry.projectInquiryId}/approve`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to approve inquiry."
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to approve inquiry."
        );
      }

      // Close modal
      setSelectedInquiry(null);

      // Refresh latest data
      await loadInquiries();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve inquiry."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // REJECT INQUIRY
  // ==========================================================

  async function handleRejectInquiry() {
    if (!selectedInquiry || actionLoading) {
      return;
    }

    const currentStatus =
      selectedInquiry.status
        .toLowerCase()
        .trim();

    // Prevent duplicate rejection
    if (currentStatus === "rejected") {
      return;
    }

    // Approved inquiry cannot be rejected
    if (currentStatus === "approved") {
      setError(
        "An approved inquiry cannot be rejected."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reject "${selectedInquiry.projectName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token =
        localStorage.getItem("mts_token") ||
        sessionStorage.getItem("mts_token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ProjectInquiries/${selectedInquiry.projectInquiryId}/reject`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to reject inquiry."
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to reject inquiry."
        );
      }

      // Close modal
      setSelectedInquiry(null);

      // Refresh latest data
      await loadInquiries();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reject inquiry."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // FILTERED DATA
  // ==========================================================

  const filteredInquiries =
  useMemo(() => {
    return inquiries.filter((inquiry) => {
      const searchText =
        search.toLowerCase().trim();

      const searchableValues = [
        inquiry.projectName,
        inquiry.projectType,
        inquiry.clientName,
        inquiry.clientEmail,
        inquiry.companyName,
        inquiry.contactName,
        inquiry.contactEmail,
        inquiry.contactPhone,
        inquiry.serviceRequired,
      ];

      const matchesSearch =
        !searchText ||
        searchableValues.some((value) =>
          value
            ?.toLowerCase()
            .includes(searchText)
        );

      const matchesStatus =
        statusFilter === "All" ||
        inquiry.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    inquiries,
    search,
    statusFilter,
  ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalInquiries =
    inquiries.length;

  const newInquiries =
    inquiries.filter(
      (x) =>
        x.status.toLowerCase() ===
        "new"
    ).length;

  const approvedInquiries =
    inquiries.filter(
      (x) =>
        x.status.toLowerCase() ===
        "approved"
    ).length;

  const rejectedInquiries =
    inquiries.filter(
      (x) =>
        x.status.toLowerCase() ===
        "rejected"
    ).length;

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="container-fluid px-4 py-4">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <div className="small text-uppercase text-primary fw-semibold mb-1">
            ADMIN PORTAL
          </div>

          <h1 className="h3 fw-bold mb-1">
            Project Inquiries
          </h1>

          <p className="text-secondary mb-0">
            Review and manage project requests
            submitted by clients.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={loadInquiries}
          disabled={loading}
        >

          <RefreshCw
            size={16}
            className={`me-2 ${
              loading
                ? "spin"
                : ""
            }`}
          />

          {loading
            ? "Loading..."
            : "Refresh"}

        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-danger rounded-4 mb-4">

          <div className="d-flex justify-content-between align-items-center gap-3">

            <div>

              <div className="fw-semibold mb-1">
                Unable to process request
              </div>

              <div className="small">
                {error}
              </div>

            </div>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={loadInquiries}
            >
              Retry
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* TOTAL */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Total Inquiries
                  </div>

                  <div className="h3 fw-bold mb-0">
                    {loading
                      ? "-"
                      : totalInquiries}
                  </div>

                </div>

                <div className="mts-icon-box">
                  <FileText size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* NEW */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    New
                  </div>

                  <div className="h3 fw-bold mb-0">
                    {loading
                      ? "-"
                      : newInquiries}
                  </div>

                </div>

                <div className="mts-icon-box">
                  <Clock3 size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* APPROVED */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Approved
                  </div>

                  <div className="h3 fw-bold mb-0">
                    {loading
                      ? "-"
                      : approvedInquiries}
                  </div>

                </div>

                <div className="mts-icon-box">
                  <CheckCircle2 size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* REJECTED */}

        <div className="col-sm-6 col-xl-3">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between">

                <div>

                  <div className="small text-secondary mb-2">
                    Rejected
                  </div>

                  <div className="h3 fw-bold mb-0">
                    {loading
                      ? "-"
                      : rejectedInquiries}
                  </div>

                </div>

                <div className="mts-icon-box">
                  <XCircle size={22} />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">

        <div className="card-body p-3">

          <div className="row g-3 align-items-center">

            {/* SEARCH */}

            <div className="col-lg-6">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Search size={17} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search project, client or company..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* STATUS */}

            <div className="col-lg-3">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Filter size={17} />
                </span>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="New">
                    New
                  </option>

                  <option value="Under Review">
                    Under Review
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

            {/* RESET */}

            <div className="col-lg-3 text-lg-end">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4 py-3">
                    Project
                  </th>

                  <th>
                    Client
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Budget
                  </th>

                  <th>
                    Submitted
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-end px-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* LOADING */}

                {loading && (
                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-5"
                    >

                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >

                        <span className="visually-hidden">
                          Loading...
                        </span>

                      </div>

                      <div className="small text-secondary mt-3">
                        Loading project inquiries...
                      </div>

                    </td>

                  </tr>
                )}

                {/* DATA */}

                {!loading &&
                  filteredInquiries.length > 0 &&
                  filteredInquiries.map(
                    (inquiry) => (
                      <tr
                        key={
                          inquiry.projectInquiryId
                        }
                      >

                        {/* PROJECT */}

                        <td className="px-4">

                          <div className="d-flex align-items-center">

                            <div className="mts-icon-box flex-shrink-0">
                              <FileText
                                size={19}
                              />
                            </div>

                            <div className="ms-3">

                              <div className="fw-bold">
                                {
                                  inquiry.projectName
                                }
                              </div>

                              <div className="small text-secondary">
                                {
                                  inquiry.companyName
                                }
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* CLIENT */}

                        <td>

                       <div className="fw-semibold small">
  {inquiry.clientName ||
    inquiry.contactName ||
    "Website Visitor"}
</div>

<div className="small text-secondary">
  {inquiry.clientEmail ||
    inquiry.contactEmail ||
    "-"}
</div>

{inquiry.contactPhone && (
  <div className="small text-secondary">
    {inquiry.contactPhone}
  </div>
)}

                        </td>

                        {/* TYPE */}

                        <td>
                        <span className="small">
  {inquiry.serviceRequired ||
    inquiry.projectType ||
    "-"}
</span>
                        </td>

                        {/* BUDGET */}

                        <td>

                          <span className="small fw-semibold">
                            {
                              inquiry.budget ||
                              "-"
                            }
                          </span>

                        </td>

                        {/* DATE */}

                        <td>

                          <div className="d-flex align-items-center small text-secondary">

                            <CalendarDays
                              size={14}
                              className="me-1"
                            />

                            {formatDate(
                              inquiry.createdAt
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`badge rounded-pill ${getStatusClass(
                              inquiry.status
                            )}`}
                          >
                            {
                              inquiry.status
                            }
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="text-end px-4">

                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              setSelectedInquiry(
                                inquiry
                              )
                            }
                          >

                            <Eye
                              size={15}
                              className="me-1"
                            />

                            View

                          </button>

                        </td>

                      </tr>
                    )
                  )}

                {/* EMPTY */}

                {!loading &&
                  filteredInquiries.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >

                        <FileText
                          size={36}
                          className="text-secondary mb-3"
                        />

                        <div className="fw-semibold">
                          No inquiries found
                        </div>

                        <div className="small text-secondary mt-1">
                          Try changing your search
                          or filters.
                        </div>

                      </td>

                    </tr>
                  )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedInquiry && (

        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
          }}
          onClick={() =>
            setSelectedInquiry(null)
          }
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">

              {/* MODAL HEADER */}

              <div className="modal-header">

                <div>

                  <div className="small text-primary fw-semibold mb-1">
                    PROJECT INQUIRY
                  </div>

                  <h5 className="modal-title fw-bold">
                    {
                      selectedInquiry.projectName
                    }
                  </h5>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedInquiry(
                      null
                    )
                  }
                />

              </div>

              {/* MODAL BODY */}

              <div className="modal-body p-4">

                {/* =================================================
                    CONTACT INFORMATION
                ================================================= */}

                <div className="d-flex justify-content-between align-items-start mb-4">

                  <div>
                    <div className="small text-primary fw-semibold text-uppercase mb-1">
                      Contact Information
                    </div>

                    <h6 className="fw-bold mb-1">
                      {selectedInquiry.clientName ||
                        selectedInquiry.contactName ||
                        "Website Visitor"}
                    </h6>

                    <div className="small text-secondary">
                      {selectedInquiry.clientEmail ||
                        selectedInquiry.contactEmail ||
                        "-"}
                    </div>

                    {selectedInquiry.contactPhone && (
                      <div className="small text-secondary">
                        {selectedInquiry.contactPhone}
                      </div>
                    )}

                    <div className="small text-secondary">
                      {selectedInquiry.companyName ||
                        "Company not specified"}
                    </div>
                  </div>

                  <span
                    className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                      selectedInquiry.status
                    )}`}
                  >
                    {selectedInquiry.status}
                  </span>

                </div>

                <div className="row g-3 mb-4">

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Full Name
                      </div>
                      <div className="fw-semibold">
                        {selectedInquiry.clientName ||
                          selectedInquiry.contactName ||
                          "Website Visitor"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Email Address
                      </div>
                      <div className="fw-semibold text-break">
                        {selectedInquiry.clientEmail ||
                          selectedInquiry.contactEmail ||
                          "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Phone Number
                      </div>
                      <div className="fw-semibold">
                        {selectedInquiry.contactPhone ||
                          "Not provided"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Company
                      </div>
                      <div className="fw-semibold">
                        {selectedInquiry.companyName ||
                          "Not specified"}
                      </div>
                    </div>
                  </div>

                </div>

                {/* =================================================
                    PROJECT INFORMATION
                ================================================= */}

                <div className="mb-4">

                  <div className="small text-primary fw-semibold text-uppercase mb-3">
                    Project Information
                  </div>

                  <div className="row g-3">

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Service Required
                        </div>
                        <div className="fw-semibold">
                          {selectedInquiry.serviceRequired ||
                            selectedInquiry.projectType ||
                            "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Project Name
                        </div>
                        <div className="fw-semibold">
                          {selectedInquiry.projectName || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Project Type
                        </div>
                        <div className="fw-semibold">
                          {selectedInquiry.projectType || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Estimated Budget
                        </div>
                        <div className="fw-semibold">
                          {selectedInquiry.budget || "Not specified"}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Preferred Start Date
                        </div>
                        <div className="fw-semibold">
                          {formatDate(selectedInquiry.startDate)}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-secondary mb-1">
                          Expected Delivery Date
                        </div>
                        <div className="fw-semibold">
                          {formatDate(selectedInquiry.deliveryDate)}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <div className="mb-4">

                  <div className="small text-primary fw-semibold text-uppercase mb-2">
                    Project Details
                  </div>

                  <div className="border rounded-3 p-3 bg-light-subtle">
                    <div className="small text-dark text-break">
                      {selectedInquiry.description || "-"}
                    </div>
                  </div>

                </div>

                {/* =================================================
                    BUSINESS REQUIREMENTS
                ================================================= */}

                <div className="mb-4">

                  <div className="small text-primary fw-semibold text-uppercase mb-2">
                    Business Requirements
                  </div>

                  <div className="border rounded-3 p-3 bg-light-subtle">
                    <div className="small text-dark text-break">
                      {selectedInquiry.requirements || "-"}
                    </div>
                  </div>

                </div>

                {/* =================================================
                    TECHNOLOGIES
                ================================================= */}

                <div className="mb-4">

                  <div className="small text-primary fw-semibold text-uppercase mb-2">
                    Technologies
                  </div>

                  <div className="border rounded-3 p-3">

                    {selectedInquiry.technologies ? (
                      <div className="small text-break">
                        {selectedInquiry.technologies}
                      </div>
                    ) : (
                      <div className="small text-secondary">
                        No technologies specified.
                      </div>
                    )}

                  </div>

                </div>

                {/* =================================================
                    ADDITIONAL REQUIREMENTS
                ================================================= */}

                <div className="mb-4">

                  <div className="small text-primary fw-semibold text-uppercase mb-2">
                    Additional Requirements
                  </div>

                  <div className="border rounded-3 p-3">

                    {selectedInquiry.additionalRequirements ? (
                      <div className="small text-break">
                        {selectedInquiry.additionalRequirements}
                      </div>
                    ) : (
                      <div className="small text-secondary">
                        No additional requirements provided.
                      </div>
                    )}

                  </div>

                </div>

                {/* =================================================
                    SUBMISSION INFORMATION
                ================================================= */}

                <div className="row g-3 mb-4">

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Submitted On
                      </div>
                      <div className="fw-semibold">
                        {formatDate(selectedInquiry.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="small text-secondary mb-1">
                        Last Updated
                      </div>
                      <div className="fw-semibold">
                        {formatDate(selectedInquiry.updatedAt)}
                      </div>
                    </div>
                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="border-top pt-4">

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSelectedInquiry(null)}
                      disabled={actionLoading}
                    >
                      Close
                    </button>

                    <div className="d-flex flex-wrap gap-2">

                      {selectedInquiry.status.toLowerCase() !==
                        "approved" &&
                        selectedInquiry.status.toLowerCase() !==
                          "rejected" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={handleRejectInquiry}
                              disabled={actionLoading}
                            >
                              <XCircle
                                size={16}
                                className="me-1"
                              />
                              {actionLoading
                                ? "Processing..."
                                : "Reject"}
                            </button>

                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleApproveInquiry}
                              disabled={actionLoading}
                            >
                              <CheckCircle2
                                size={16}
                                className="me-1"
                              />
                              {actionLoading
                                ? "Processing..."
                                : "Approve"}
                            </button>
                          </>
                        )}

                      {selectedInquiry.status.toLowerCase() ===
                        "approved" && (
                        <button
                          type="button"
                          className="btn btn-primary d-flex align-items-center"
                          onClick={() =>
                            navigate(
                              `/admin-quotes?inquiryId=${selectedInquiry.projectInquiryId}`
                            )
                          }
                        >
                          <ArrowRight
                            size={16}
                            className="me-1"
                          />
                          Create Proposal
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

