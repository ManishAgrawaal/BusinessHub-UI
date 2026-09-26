import {
  CalendarDays,
  Download,
  Eye,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// TYPES
// =========================================================

interface AdminDocument {
  documentId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  companyName: string;

  projectId?: number | null;
  projectName?: string | null;

  fileName: string;
  contentType: string;
  fileSize: number;

  uploadedByUserId: number;
  uploadedBy: string;

  createdAt: string;
}

interface DocumentDetails extends AdminDocument {
  storedFileName?: string;
  filePath?: string;
}

interface DocumentsResponse {
  success: boolean;
  totalDocuments: number;
  documents: AdminDocument[];
}

interface DocumentDetailsResponse {
  success: boolean;
  document: DocumentDetails;
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
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// =========================================================
// FILE TYPE
// =========================================================

function getFileType(contentType: string, fileName: string): string {
  const type = contentType?.toLowerCase() || "";
  const name = fileName?.toLowerCase() || "";

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return "PDF";
  }

  if (
    type.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "Word";
  }

  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return "Excel";
  }

  if (
    type.includes("image") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".gif") ||
    name.endsWith(".webp")
  ) {
    return "Image";
  }

  if (
    type.includes("zip") ||
    type.includes("rar") ||
    name.endsWith(".zip") ||
    name.endsWith(".rar")
  ) {
    return "Archive";
  }

  if (
    type.includes("javascript") ||
    type.includes("json") ||
    type.includes("text") ||
    name.endsWith(".js") ||
    name.endsWith(".ts") ||
    name.endsWith(".tsx") ||
    name.endsWith(".json") ||
    name.endsWith(".txt")
  ) {
    return "Code/Text";
  }

  return "File";
}

// =========================================================
// FILE ICON
// =========================================================

function FileTypeIcon({
  contentType,
  fileName,
  size = 20,
}: {
  contentType: string;
  fileName: string;
  size?: number;
}) {
  const type = getFileType(contentType, fileName);

  if (type === "PDF") {
    return <FileText size={size} />;
  }

  if (type === "Word") {
    return <FileText size={size} />;
  }

  if (type === "Excel") {
    return <FileSpreadsheet size={size} />;
  }

  if (type === "Image") {
    return <FileImage size={size} />;
  }

  if (type === "Archive") {
    return <FileArchive size={size} />;
  }

  if (type === "Code/Text") {
    return <FileCode2 size={size} />;
  }

  return <File size={size} />;
}

// =========================================================
// STATUS / BADGE
// =========================================================

function getFileBadgeClass(fileType: string): string {
  switch (fileType) {
    case "PDF":
      return "bg-danger-subtle text-danger";

    case "Word":
      return "bg-primary-subtle text-primary";

    case "Excel":
      return "bg-success-subtle text-success";

    case "Image":
      return "bg-info-subtle text-info-emphasis";

    case "Archive":
      return "bg-warning-subtle text-warning-emphasis";

    default:
      return "bg-secondary-subtle text-secondary";
  }
}

// =========================================================
// COMPONENT
// =========================================================

function AdminDocuments() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");

  const [selectedClient, setSelectedClient] =
    useState("all");

  const [selectedProject, setSelectedProject] =
    useState("all");

  const [selectedFileType, setSelectedFileType] =
    useState("all");

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentDetails | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [deleteLoadingId, setDeleteLoadingId] =
    useState<number | null>(null);

  const [downloadLoadingId, setDownloadLoadingId] =
    useState<number | null>(null);

  // =======================================================
  // LOAD DOCUMENTS
  // =======================================================

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Documents/admin-documents`,
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
            "You are not authorized to view documents."
          );
        }

        throw new Error(
          `Unable to load documents. Status: ${response.status}`
        );
      }

      const result: DocumentsResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load documents."
        );
      }

      setDocuments(result.documents ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // CLIENT FILTER OPTIONS
  // =======================================================

  const clients = useMemo(() => {
    const map = new Map<number, string>();

    documents.forEach((document) => {
      if (!map.has(document.clientId)) {
        map.set(
          document.clientId,
          `${document.clientName} - ${document.companyName}`
        );
      }
    });

    return Array.from(map.entries())
      .sort((a, b) =>
        a[1].localeCompare(b[1])
      );
  }, [documents]);

  // =======================================================
  // PROJECT FILTER OPTIONS
  // =======================================================

  const projects = useMemo(() => {
    const map = new Map<number, string>();

    documents.forEach((document) => {
      if (
        document.projectId &&
        document.projectName
      ) {
        if (!map.has(document.projectId)) {
          map.set(
            document.projectId,
            document.projectName
          );
        }
      }
    });

    return Array.from(map.entries())
      .sort((a, b) =>
        a[1].localeCompare(b[1])
      );
  }, [documents]);

  // =======================================================
  // FILE TYPE OPTIONS
  // =======================================================

  const fileTypes = useMemo(() => {
    const types = new Set<string>();

    documents.forEach((document) => {
      types.add(
        getFileType(
          document.contentType,
          document.fileName
        )
      );
    });

    return Array.from(types).sort();
  }, [documents]);

  // =======================================================
  // FILTERED DOCUMENTS
  // =======================================================

  const filteredDocuments = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        search.length === 0 ||
        document.fileName
          .toLowerCase()
          .includes(search) ||
        document.clientName
          .toLowerCase()
          .includes(search) ||
        document.clientEmail
          .toLowerCase()
          .includes(search) ||
        document.companyName
          .toLowerCase()
          .includes(search) ||
        (
          document.projectName ?? ""
        )
          .toLowerCase()
          .includes(search);

      const matchesClient =
        selectedClient === "all" ||
        document.clientId.toString() ===
          selectedClient;

      const matchesProject =
        selectedProject === "all" ||
        (
          document.projectId?.toString() ??
          ""
        ) === selectedProject;

      const matchesFileType =
        selectedFileType === "all" ||
        getFileType(
          document.contentType,
          document.fileName
        ) === selectedFileType;

      return (
        matchesSearch &&
        matchesClient &&
        matchesProject &&
        matchesFileType
      );
    });
  }, [
    documents,
    searchText,
    selectedClient,
    selectedProject,
    selectedFileType,
  ]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalDocuments =
    documents.length;

  const totalClients = clients.length;

  const totalProjects = projects.length;

  const totalStorage = documents.reduce(
    (total, document) =>
      total + document.fileSize,
    0
  );

  // =======================================================
  // VIEW DETAILS
  // =======================================================

  async function handleViewDocument(
    documentId: number
  ) {
    try {
      setDetailsLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Documents/admin-documents/${documentId}`,
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
            "You are not authorized to view this document."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Document not found."
          );
        }

        throw new Error(
          `Unable to load document details. Status: ${response.status}`
        );
      }

      const result: DocumentDetailsResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load document details."
        );
      }

      setSelectedDocument(result.document);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load document details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // =======================================================
  // DOWNLOAD
  // =======================================================

 async function handleDownload(documentId: number, fileName: string) {
  try {
   setDownloadLoadingId(documentId);
    setError("");

    const token =
      localStorage.getItem("mts_token") ||
      sessionStorage.getItem("mts_token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(
      `${API_BASE_URL}/Documents/${documentId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Unable to download document. Status: ${response.status}`
      );
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = window.document.createElement("a");

    link.href = url;
    link.download = fileName;

    window.document.body.appendChild(link);

    link.click();

    window.document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to download document."
    );
  } finally {
    setDownloadLoadingId(null);
  }
}

  // =======================================================
  // DELETE
  // =======================================================

  async function handleDeleteDocument(
    documentId: number
  ) {
    const document =
      documents.find(
        (item) =>
          item.documentId ===
          documentId
      );

    if (!document) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${document.fileName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoadingId(
        documentId
      );

      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Documents/${documentId}`,
        {
          method: "DELETE",
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
            "You are not authorized to delete this document."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Document not found."
          );
        }

        throw new Error(
          `Unable to delete document. Status: ${response.status}`
        );
      }

      setDocuments((current) =>
        current.filter(
          (item) =>
            item.documentId !==
            documentId
        )
      );

      if (
        selectedDocument?.documentId ===
        documentId
      ) {
        setSelectedDocument(null);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete document."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  }

  // =======================================================
  // RESET FILTERS
  // =======================================================

  function clearFilters() {
    setSearchText("");
    setSelectedClient("all");
    setSelectedProject("all");
    setSelectedFileType("all");
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="p-3 p-lg-4">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">

        <div>
          <div className="text-primary small fw-semibold text-uppercase">
            Admin Portal
          </div>

          <h1 className="h3 fw-bold mb-1">
            Documents
          </h1>

          <p className="text-secondary mb-0">
            Manage client documents and project files.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          onClick={loadDocuments}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "spinner-border"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >
          <div>
            <strong>Error:</strong>{" "}
            {error}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() =>
              setError("")
            }
          >
            Close
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                }}
              >
                <FileText size={23} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Total Documents
                </div>

                <div className="fs-4 fw-bold">
                  {totalDocuments}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                }}
              >
                <Upload size={23} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Clients with Documents
                </div>

                <div className="fs-4 fw-bold">
                  {totalClients}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                }}
              >
                <File size={23} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Total Storage
                </div>

                <div className="fs-4 fw-bold">
                  {formatFileSize(
                    totalStorage
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-2">

            {/* SEARCH */}

            <div className="col-12 col-lg-5">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search file, client, company or project..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* CLIENT */}

            <div className="col-12 col-md-4 col-lg-2">

              <select
                className="form-select"
                value={selectedClient}
                onChange={(event) =>
                  setSelectedClient(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Clients
                </option>

                {clients.map(
                  ([clientId, clientName]) => (
                    <option
                      key={clientId}
                      value={clientId}
                    >
                      {clientName}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* PROJECT */}

            <div className="col-12 col-md-4 col-lg-2">

              <select
                className="form-select"
                value={selectedProject}
                onChange={(event) =>
                  setSelectedProject(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Projects
                </option>

                {projects.map(
                  ([projectId, projectName]) => (
                    <option
                      key={projectId}
                      value={projectId}
                    >
                      {projectName}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* FILE TYPE */}

            <div className="col-12 col-md-4 col-lg-2">

              <select
                className="form-select"
                value={selectedFileType}
                onChange={(event) =>
                  setSelectedFileType(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Types
                </option>

                {fileTypes.map(
                  (fileType) => (
                    <option
                      key={fileType}
                      value={fileType}
                    >
                      {fileType}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* CLEAR */}

            <div className="col-12 col-lg-1">

              <button
                type="button"
                className="btn btn-light border w-100"
                onClick={
                  clearFilters
                }
                title="Clear filters"
              >
                Clear
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          DOCUMENT LIST
      =================================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">

          <div className="fw-semibold">
            Client Documents
          </div>

          <div className="small text-secondary">
            Showing{" "}
            <strong>
              {filteredDocuments.length}
            </strong>{" "}
            of{" "}
            <strong>
              {documents.length}
            </strong>{" "}
            documents
          </div>

        </div>

        {loading ? (
          <div className="p-5 text-center">

            <div
              className="spinner-border text-primary"
              role="status"
            />

            <div className="small text-secondary mt-3">
              Loading documents...
            </div>

          </div>
        ) : filteredDocuments.length ===
          0 ? (
          <div className="p-5 text-center">

            <div
              className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <FileText
                size={28}
                className="text-secondary"
              />
            </div>

            <h5 className="mb-1">
              No documents found
            </h5>

            <p className="text-secondary mb-3">
              No documents match the selected filters.
            </p>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-3">
                    Document
                  </th>

                  <th>
                    Client
                  </th>

                  <th>
                    Project
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Size
                  </th>

                  <th>
                    Uploaded
                  </th>

                  <th className="text-end px-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredDocuments.map(
                  (document) => {
                    const fileType =
                      getFileType(
                        document.contentType,
                        document.fileName
                      );

                    return (
                      <tr
                        key={
                          document.documentId
                        }
                      >

                        {/* DOCUMENT */}

                        <td className="px-3">

                          <div className="d-flex align-items-center">

                            <div
                              className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "42px",
                                height: "42px",
                              }}
                            >
                              <FileTypeIcon
                                contentType={
                                  document.contentType
                                }
                                fileName={
                                  document.fileName
                                }
                                size={19}
                              />
                            </div>

                            <div className="ms-3">

                              <div
                                className="fw-semibold text-truncate"
                                style={{
                                  maxWidth:
                                    "230px",
                                }}
                                title={
                                  document.fileName
                                }
                              >
                                {
                                  document.fileName
                                }
                              </div>

                              <div className="small text-secondary">
                                Document #
                                {
                                  document.documentId
                                }
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* CLIENT */}

                        <td>

                          <div className="fw-semibold">
                            {
                              document.clientName
                            }
                          </div>

                          <div className="small text-secondary">
                            {
                              document.companyName
                            }
                          </div>

                        </td>

                        {/* PROJECT */}

                        <td>

                          {document.projectName ? (
                            <>
                              <div className="fw-semibold">
                                {
                                  document.projectName
                                }
                              </div>

                              <div className="small text-secondary">
                                Project #
                                {
                                  document.projectId
                                }
                              </div>
                            </>
                          ) : (
                            <span className="text-secondary">
                              No project
                            </span>
                          )}

                        </td>

                        {/* TYPE */}

                        <td>

                          <span
                            className={`badge ${getFileBadgeClass(
                              fileType
                            )}`}
                          >
                            {fileType}
                          </span>

                        </td>

                        {/* SIZE */}

                        <td>
                          <span className="small">
                            {formatFileSize(
                              document.fileSize
                            )}
                          </span>
                        </td>

                        {/* DATE */}

                        <td>

                          <div className="small">
                            {formatDate(
                              document.createdAt
                            )}
                          </div>

                          <div className="small text-secondary">
                            {
                              document.uploadedBy
                            }
                          </div>

                        </td>

                        {/* ACTIONS */}

                        <td className="text-end px-3">

                          <div className="d-flex justify-content-end gap-1">

                            {/* VIEW */}

                            <button
                              type="button"
                              className="btn btn-sm btn-light border"
                              title="View details"
                              onClick={() =>
                                handleViewDocument(
                                  document.documentId
                                )
                              }
                              disabled={
                                detailsLoading
                              }
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {/* DOWNLOAD */}

                         <button
  type="button"
  className="btn btn-sm btn-light border"
  title="Download"
  onClick={() =>
    handleDownload(
      document.documentId,
      document.fileName
    )
  }
  disabled={
    downloadLoadingId ===
    document.documentId
  }
>
  {downloadLoadingId ===
  document.documentId ? (
    <span
      className="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    />
  ) : (
    <Download size={16} />
  )}
</button>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() =>
                                handleDeleteDocument(
                                  document.documentId
                                )
                              }
                              disabled={
                                deleteLoadingId ===
                                document.documentId
                              }
                            >
                              {deleteLoadingId ===
                              document.documentId ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ===================================================
          DOCUMENT DETAILS MODAL
      =================================================== */}

      {selectedDocument && (
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.55)",
          }}
          onClick={() =>
            setSelectedDocument(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-content border-0 shadow">

              {/* HEADER */}

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    Document Details
                  </h5>

                  <div className="small text-secondary">
                    Document #
                    {
                      selectedDocument.documentId
                    }
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() =>
                    setSelectedDocument(null)
                  }
                >
                  <X size={18} />
                </button>

              </div>

              {/* BODY */}

              <div className="modal-body">

                <div className="d-flex align-items-center mb-4">

                  <div
                    className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                    }}
                  >
                    <FileTypeIcon
                      contentType={
                        selectedDocument.contentType
                      }
                      fileName={
                        selectedDocument.fileName
                      }
                      size={28}
                    />
                  </div>

                  <div className="ms-3">

                    <h5 className="mb-1">
                      {
                        selectedDocument.fileName
                      }
                    </h5>

                    <div className="small text-secondary">
                      {
                        selectedDocument.contentType
                      }
                    </div>

                  </div>

                </div>

                <div className="row g-3">

                  {/* CLIENT */}

                  <div className="col-12 col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Client
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedDocument.clientName
                        }
                      </div>

                      <div className="small text-secondary">
                        {
                          selectedDocument.clientEmail
                        }
                      </div>

                      <div className="small text-secondary mt-1">
                        {
                          selectedDocument.companyName
                        }
                      </div>

                    </div>

                  </div>

                  {/* PROJECT */}

                  <div className="col-12 col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Project
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedDocument.projectName ||
                          "No project assigned"
                        }
                      </div>

                      {selectedDocument.projectId && (
                        <div className="small text-secondary">
                          Project #
                          {
                            selectedDocument.projectId
                          }
                        </div>
                      )}

                    </div>

                  </div>

                  {/* FILE SIZE */}

                  <div className="col-12 col-md-4">

                    <div className="border rounded-3 p-3">

                      <div className="small text-secondary mb-1">
                        File Size
                      </div>

                      <div className="fw-semibold">
                        {formatFileSize(
                          selectedDocument.fileSize
                        )}
                      </div>

                    </div>

                  </div>

                  {/* FILE TYPE */}

                  <div className="col-12 col-md-4">

                    <div className="border rounded-3 p-3">

                      <div className="small text-secondary mb-1">
                        File Type
                      </div>

                      <div className="fw-semibold">
                        {getFileType(
                          selectedDocument.contentType,
                          selectedDocument.fileName
                        )}
                      </div>

                    </div>

                  </div>

                  {/* UPLOADED */}

                  <div className="col-12 col-md-4">

                    <div className="border rounded-3 p-3">

                      <div className="small text-secondary mb-1">
                        Uploaded
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedDocument.createdAt
                        )}
                      </div>

                    </div>

                  </div>

                  {/* UPLOADED BY */}

                  <div className="col-12">

                    <div className="border rounded-3 p-3">

                      <div className="d-flex align-items-center">

                        <CalendarDays
                          size={18}
                          className="text-primary me-2"
                        />

                        <div>

                          <div className="small text-secondary">
                            Uploaded By
                          </div>

                          <div className="fw-semibold">
                            {
                              selectedDocument.uploadedBy
                            }
                          </div>

                          <div className="small text-secondary">
                            {
                              formatDateTime(
                                selectedDocument.createdAt
                              )
                            }
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() =>
                    setSelectedDocument(null)
                  }
                >
                  Close
                </button>

             <button
  type="button"
  className="btn btn-primary d-flex align-items-center gap-2"
  onClick={() =>
    selectedDocument &&
    handleDownload(
      selectedDocument.documentId,
      selectedDocument.fileName
    )
  }
  disabled={
    !selectedDocument ||
    downloadLoadingId === selectedDocument.documentId
  }
>
  {selectedDocument &&
  downloadLoadingId === selectedDocument.documentId ? (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      />
      Downloading...
    </>
  ) : (
    <>
      <Download size={16} />
      Download
    </>
  )}
</button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default AdminDocuments;
