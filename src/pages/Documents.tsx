import {
  CalendarDays,
  Download,
  FileArchive,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type DocumentType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "ZIP"
  | "OTHER";

interface DocumentItem {
  id: number;
  name: string;
  type: DocumentType;
  category: string;
  size: string;
  uploaded: string;
  uploadedAt: string;
  uploadedBy: string;
  projectId?: number | null;
  projectName?: string | null;
  contentType: string;
}

interface DocumentsResponse {
  success: boolean;
  clientId: number;
  totalDocuments: number;

  documents: {
    documentId: number;
    clientId: number;
    projectId?: number | null;
    projectName?: string | null;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedByUserId: number;
    uploadedBy: string;
    createdAt: string;
  }[];
}

interface UploadResponse {
  success: boolean;
  message: string;
  documentId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  projectId?: number | null;
  createdAt: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  documentId: number;
}

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

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

function getDocumentType(
  fileName: string,
  contentType: string
): DocumentType {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() ?? "";

  if (
    extension === "pdf" ||
    contentType === "application/pdf"
  ) {
    return "PDF";
  }

  if (
    extension === "doc" ||
    extension === "docx" ||
    contentType.includes("word")
  ) {
    return "DOCX";
  }

  if (
    extension === "xls" ||
    extension === "xlsx" ||
    contentType.includes("spreadsheet") ||
    contentType.includes("excel")
  ) {
    return "XLSX";
  }

  if (
    extension === "zip" ||
    contentType === "application/zip"
  ) {
    return "ZIP";
  }

  return "OTHER";
}

function getDocumentCategory(
  type: DocumentType
): string {
  switch (type) {
    case "PDF":
      return "PDF Documents";

    case "DOCX":
      return "Word Documents";

    case "XLSX":
      return "Excel Documents";

    case "ZIP":
      return "Project Files";

    default:
      return "Other Documents";
  }
}

export default function Documents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All Documents");

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [projectId, setProjectId] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =========================================================
  // LOAD DOCUMENTS
  // =========================================================

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
        `${API_BASE_URL}/Documents/my-documents`,
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

      const mappedDocuments =
        (result.documents ?? []).map(
          (document) => {
            const type =
              getDocumentType(
                document.fileName,
                document.contentType
              );

            return {
              id: document.documentId,
              name: document.fileName,
              type,
              category:
                getDocumentCategory(type),
              size: formatFileSize(
                document.fileSize
              ),
              uploaded: formatDate(
                document.createdAt
              ),
              uploadedAt:
                document.createdAt,
              uploadedBy:
                document.uploadedBy ||
                "MTS Project Team",
              projectId:
                document.projectId,
              projectName:
                document.projectName,
              contentType:
                document.contentType,
            };
          }
        );

      setDocuments(mappedDocuments);
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

  // =========================================================
  // FILE SELECT
  // =========================================================

  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setUploadMessage("");
    setError("");
  }

  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  async function handleUpload() {
    if (!selectedFile) {
      setError(
        "Please select a document to upload."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadMessage("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const formData = new FormData();

      formData.append(
        "File",
        selectedFile
      );

      if (projectId.trim()) {
        formData.append(
          "ProjectId",
          projectId.trim()
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Documents/upload`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result: UploadResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to upload document."
        );
      }

      setUploadMessage(
        result.message ||
          "Document uploaded successfully."
      );

      setSelectedFile(null);
      setProjectId("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  }

  // =========================================================
  // DOWNLOAD DOCUMENT
  // =========================================================

  async function handleDownload(
    documentId: number,
    fileName: string
  ) {
    try {
      setError("");
      setUploadMessage("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
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
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to download this document."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Document file was not found."
          );
        }

        throw new Error(
          `Unable to download document. Status: ${response.status}`
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to download document."
      );
    }
  }

  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  async function handleDeleteDocument(
    documentId: number,
    fileName: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);
      setError("");
      setUploadMessage("");

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

      const result: DeleteResponse =
        await response.json();

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
          result.message ||
            `Unable to delete document. Status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to delete document."
        );
      }

      setUploadMessage(
        result.message ||
          "Document deleted successfully."
      );

      await loadDocuments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // FILE ICON
  // =========================================================

  function getFileIcon(
    type: DocumentType
  ) {
    switch (type) {
      case "PDF":
        return <FileText size={22} />;

      case "DOCX":
        return <FileCheck2 size={22} />;

      case "XLSX":
        return (
          <FileSpreadsheet size={22} />
        );

      case "ZIP":
        return (
          <FileArchive size={22} />
        );

      default:
        return <FileText size={22} />;
    }
  }

  function getFileIconClass(
    type: DocumentType
  ) {
    switch (type) {
      case "PDF":
        return "bg-danger-subtle text-danger";

      case "DOCX":
        return "bg-primary-subtle text-primary";

      case "XLSX":
        return "bg-success-subtle text-success";

      case "ZIP":
        return "bg-warning-subtle text-warning-emphasis";

      default:
        return "bg-light text-secondary";
    }
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          documents.map(
            (document) =>
              document.category
          )
        )
      );

    return [
      "All Documents",
      ...uniqueCategories,
    ];
  }, [documents]);

  // =========================================================
  // FILTER DOCUMENTS
  // =========================================================

  const filteredDocuments =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return documents.filter(
        (document) => {
          const matchesSearch =
            !searchValue ||
            document.name
              .toLowerCase()
              .includes(searchValue) ||
            (
              document.projectName ?? ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            document.category
              .toLowerCase()
              .includes(searchValue);

          const matchesCategory =
            category === "All Documents" ||
            document.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      documents,
      search,
      category,
    ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalDocuments =
    documents.length;

  const newDocuments =
    documents.filter(
      (document) => {
        const createdDate =
          new Date(
            document.uploadedAt
          );

        if (
          Number.isNaN(
            createdDate.getTime()
          )
        ) {
          return false;
        }

        const today = new Date();

        const sevenDaysAgo =
          new Date();

        sevenDaysAgo.setDate(
          today.getDate() - 7
        );

        return (
          createdDate >=
          sevenDaysAgo
        );
      }
    ).length;

  const projectFiles =
    documents.filter(
      (document) =>
        document.projectId !==
          null &&
        document.projectId !==
          undefined
    ).length;

  const lastUpdated =
    documents.length > 0
      ? documents[0].uploaded
      : "-";

  // =========================================================
  // UI
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
                Documents
              </h1>

              <p className="text-secondary mb-0">
                Access and manage your project documents.
              </p>

            </div>

            <div className="col-auto">

              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                onChange={
                  handleFileSelect
                }
              />

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Upload
                  size={17}
                  className="me-2"
                />

                Upload Document
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="py-4">
        <div className="container-fluid px-4">

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger rounded-4 mb-4">

              <div className="d-flex justify-content-between align-items-center gap-3">

                <div>

                  <div className="fw-semibold mb-1">
                    Documents error
                  </div>

                  <div className="small">
                    {error}
                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={
                    loadDocuments
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
              UPLOAD PANEL
          ================================================= */}

          {selectedFile && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <div className="small text-secondary mb-1">
                      Selected Document
                    </div>

                    <div className="fw-semibold">
                      {selectedFile.name}
                    </div>

                    <div className="small text-secondary mt-1">
                      {formatFileSize(
                        selectedFile.size
                      )}
                    </div>

                  </div>

                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => {

                      setSelectedFile(
                        null
                      );

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }

                    }}
                  >
                    <X size={17} />
                  </button>

                </div>

                <div className="row g-3 align-items-end mt-2">

                  <div className="col-md-5">

                    <label className="form-label small fw-semibold">
                      Project ID{" "}
                      <span className="text-secondary fw-normal">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      placeholder="Example: 1"
                      value={projectId}
                      onChange={(e) =>
                        setProjectId(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="col-md-auto">

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={uploading}
                      onClick={
                        handleUpload
                      }
                    >
                      {uploading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />

                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload
                            size={17}
                            className="me-2"
                          />

                          Upload
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* SUCCESS */}

          {uploadMessage && (
            <div className="alert alert-success rounded-4 mb-4">
              {uploadMessage}
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

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Total Documents
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {totalDocuments}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FolderOpen size={22} />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* NEW */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        New Documents
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {newDocuments}
                      </div>

                      <div className="small text-success mt-1">
                        This week
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FileCheck2 size={22} />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* PROJECT FILES */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Project Files
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {projectFiles}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FileArchive size={22} />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* LAST UPDATED */}

            <div className="col-sm-6 col-lg-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <div className="small text-secondary mb-2">
                        Last Updated
                      </div>

                      <div className="fw-bold">
                        {lastUpdated}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <CalendarDays size={22} />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DOCUMENT LIST
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              {/* HEADER */}

              <div className="row align-items-center g-3 mb-4">

                <div className="col-lg">

                  <h2 className="h5 fw-bold mb-1">
                    Project Documents
                  </h2>

                  <p className="small text-secondary mb-0">
                    Files shared by the MTS project team.
                  </p>

                </div>

                {/* SEARCH */}

                <div className="col-md-6 col-lg-4">

                  <div className="input-group">

                    <span className="input-group-text bg-light border-end-0">
                      <Search size={17} />
                    </span>

                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="Search documents..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* FILTER */}

                <div className="col-md-6 col-lg-auto">

                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >
                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

              {/* LOADING */}

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
                    Loading documents...
                  </div>

                </div>
              )}

              {/* DOCUMENTS */}

              {!loading && (
                <div className="d-grid gap-3">

                  {filteredDocuments.length > 0 ? (

                    filteredDocuments.map(
                      (document) => (

                        <div
                          key={document.id}
                          className="border rounded-4 p-3 p-lg-4"
                        >

                          <div className="row align-items-center g-3">

                            {/* FILE */}

                            <div className="col-lg-5">

                              <div className="d-flex align-items-center">

                                <div
                                  className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${getFileIconClass(
                                    document.type
                                  )}`}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                  }}
                                >
                                  {getFileIcon(
                                    document.type
                                  )}
                                </div>

                                <div className="ms-3 overflow-hidden">

                                  <div className="fw-semibold text-truncate">
                                    {document.name}
                                  </div>

                                  <div className="small text-secondary">
                                    {document.category}
                                  </div>

                                  {document.projectName && (
                                    <div className="small text-primary">
                                      {
                                        document.projectName
                                      }
                                    </div>
                                  )}

                                </div>

                              </div>

                            </div>

                            {/* SIZE */}

                            <div className="col-sm-4 col-lg-2">

                              <div className="small text-secondary mb-1">
                                File Size
                              </div>

                              <div className="small fw-semibold">
                                {document.size}
                              </div>

                            </div>

                            {/* DATE */}

                            <div className="col-sm-4 col-lg-2">

                              <div className="small text-secondary mb-1">
                                Uploaded
                              </div>

                              <div className="small fw-semibold">
                                {document.uploaded}
                              </div>

                            </div>

                            {/* UPLOADED BY */}

                            <div className="col-sm-4 col-lg-1">

                              <div className="small text-secondary mb-1">
                                Uploaded By
                              </div>

                              <div className="small fw-semibold text-truncate">
                                {
                                  document.uploadedBy
                                }
                              </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="col-lg-2">

                              <div className="d-flex gap-2">

                                {/* DOWNLOAD */}

                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm flex-grow-1"
                                  title={`Download ${document.name}`}
                                  onClick={() =>
                                    handleDownload(
                                      document.id,
                                      document.name
                                    )
                                  }
                                >
                                  <Download
                                    size={16}
                                  />
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm flex-grow-1"
                                  title={`Delete ${document.name}`}
                                  disabled={
                                    deletingId ===
                                    document.id
                                  }
                                  onClick={() =>
                                    handleDeleteDocument(
                                      document.id,
                                      document.name
                                    )
                                  }
                                >
                                  {deletingId ===
                                  document.id ? (
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

                            </div>

                          </div>

                        </div>

                      )
                    )

                  ) : (

                    <div className="text-center py-5">

                      <div className="mts-icon-box mx-auto mb-3">
                        <Search size={22} />
                      </div>

                      <h3 className="h6 fw-bold">
                        No documents found
                      </h3>

                      <p className="small text-secondary mb-0">
                        Try changing your search or document category.
                      </p>

                    </div>

                  )}

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              SECURITY NOTICE
          ================================================= */}

          <div className="alert alert-light border rounded-4 mt-4 p-4">

            <div className="d-flex">

              <FileCheck2
                size={21}
                className="text-primary me-3 flex-shrink-0"
              />

              <div>

                <div className="fw-semibold mb-1">
                  Secure Project Documents
                </div>

                <div className="small text-secondary">
                  Project documents are intended for authorized
                  client access only. Files are accessed through
                  the authenticated MTS backend.
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}
