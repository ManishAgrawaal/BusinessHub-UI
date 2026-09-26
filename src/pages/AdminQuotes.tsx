import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================================
// TYPES
// ============================================================

interface Quote {
  quoteId: number;
  quoteNumber: string;

  clientId: number;
  clientName?: string | null;
  companyName?: string | null;

  projectId: number;
  projectName?: string | null;

  title: string;
  description?: string | null;

  amount: number;

  status: string;

  validUntil?: string | null;

  createdAt: string;
  updatedAt?: string | null;
}

// ============================================================
// PROJECT INQUIRY
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

// ============================================================
// API RESPONSES
// ============================================================

interface QuotesResponse {
  success: boolean;
  quotes: Quote[];
}

interface QuoteResponse {
  success: boolean;
  message?: string;
  quote?: Quote;
}

interface InquiriesResponse {
  success: boolean;
  inquiries: ProjectInquiry[];
}

interface CreateFromInquiryResponse {
  success: boolean;
  message: string;

  quoteId: number;
  quoteNumber: string;

  clientId: number;
  clientName: string;
  clientEmail: string;
  companyName: string;

  projectId: number;
  projectName: string;

  status: string;
  amount: number;

  validUntil?: string | null;
  createdAt: string;
}

// ============================================================
// CREATE QUOTE FORM
// ============================================================

interface CreateQuoteForm {
  clientId: string;
  projectId: string;

  clientName: string;
  clientEmail: string;
  companyName: string;
  projectName: string;

  quoteNumber: string;
  title: string;
  description: string;

  amount: string;
  validUntil: string;
}

// ============================================================
// AUTH TOKEN
// ============================================================

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

// ============================================================
// DATE
// ============================================================

function formatDate(
  date?: string | null
): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
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
// CURRENCY
// ============================================================

function formatCurrency(
  amount: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
  status: string
): string {
  switch (
    status.toLowerCase()
  ) {
    case "draft":
      return "bg-secondary-subtle text-secondary";

    case "sent":
      return "bg-warning-subtle text-warning-emphasis";

    case "accepted":
      return "bg-success-subtle text-success";

    case "rejected":
      return "bg-danger-subtle text-danger";

    case "completed":
      return "bg-primary-subtle text-primary";

    case "expired":
      return "bg-danger-subtle text-danger";

    default:
      return "bg-light text-dark";
  }
}

// ============================================================
// GENERATE QUOTE NUMBER
// ============================================================

function generateQuoteNumber(): string {
  const year =
    new Date().getFullYear();

  const randomPart =
    Math.floor(
      1000 +
        Math.random() * 9000
    );

  return `MTS-Q-${year}-${randomPart}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AdminQuotes() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const inquiryIdParam =
    searchParams.get(
      "inquiryId"
    );

  const inquiryId =
    inquiryIdParam
      ? Number(inquiryIdParam)
      : null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    selectedQuote,
    setSelectedQuote,
  ] = useState<Quote | null>(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    inquiryLoading,
    setInquiryLoading,
  ] = useState(false);

  const [
    selectedInquiry,
    setSelectedInquiry,
  ] = useState<ProjectInquiry | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<CreateQuoteForm>({
    clientId: "",
    projectId: "",

    clientName: "",
    clientEmail: "",
    companyName: "",
    projectName: "",

    quoteNumber: "",
    title: "",
    description: "",

    amount: "",
    validUntil: "",
  });

  // ==========================================================
  // LOAD QUOTES
  // ==========================================================

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    try {
      setLoading(true);
      setError("");

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response =
        await fetch(
          `${API_BASE_URL}/Quotes`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You are not authorized to view quotes."
          );
        }

        throw new Error(
          `Unable to load quotes. Status: ${response.status}`
        );
      }

      const result:
        QuotesResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load quotes."
        );
      }

      setQuotes(
        result.quotes ?? []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quotes."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOAD INQUIRY FOR PROPOSAL
  // ==========================================================

  useEffect(() => {
    if (
      inquiryId &&
      inquiryId > 0
    ) {
      loadInquiryForProposal(
        inquiryId
      );
    }
  }, [inquiryId]);

  async function loadInquiryForProposal(
    projectInquiryId: number
  ) {
    try {
      setInquiryLoading(true);
      setError("");
      setSuccessMessage("");

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      /*
       * We use the existing admin inquiries
       * endpoint and find the requested inquiry.
       *
       * This also works safely for public inquiries
       * where ClientId can initially be null.
       */

      const response =
        await fetch(
          `${API_BASE_URL}/ProjectInquiries`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You are not authorized to view project inquiries."
          );
        }

        throw new Error(
          `Unable to load inquiry. Status: ${response.status}`
        );
      }

      const result:
        InquiriesResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load project inquiry."
        );
      }

      const inquiry =
        result.inquiries.find(
          (item) =>
            item.projectInquiryId ===
            projectInquiryId
        );

      if (!inquiry) {
        throw new Error(
          "Project inquiry not found."
        );
      }

      // ------------------------------------------------------
      // ONLY APPROVED INQUIRY
      // ------------------------------------------------------

      if (
        inquiry.status.toLowerCase() !==
        "approved"
      ) {
        throw new Error(
          `This inquiry is not approved. Current status: ${inquiry.status}.`
        );
      }

      setSelectedInquiry(
        inquiry
      );

      // ------------------------------------------------------
      // RESOLVE DISPLAY DETAILS
      // ------------------------------------------------------

      const clientName =
        inquiry.clientName ||
        inquiry.contactName ||
        "Website Visitor";

      const clientEmail =
        inquiry.clientEmail ||
        inquiry.contactEmail ||
        "";

      const companyName =
        inquiry.companyName ||
        "";

      const projectName =
        inquiry.projectName ||
        "New Project";

      const service =
        inquiry.serviceRequired ||
        inquiry.projectType ||
        "Software Development";

      const description =
        inquiry.description ||
        inquiry.requirements ||
        "";

      // ------------------------------------------------------
      // PREFILL FORM
      // ------------------------------------------------------

      setForm({
        clientId:
          inquiry.clientId
            ? String(
                inquiry.clientId
              )
            : "",

        projectId: "",

        clientName,

        clientEmail,

        companyName,

        projectName,

        quoteNumber:
          generateQuoteNumber(),

        title:
          `${service} Proposal`,

        description,

        amount: "",

        validUntil: "",
      });

      // ------------------------------------------------------
      // OPEN CREATE MODAL
      // ------------------------------------------------------

      setShowCreateModal(
        true
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load project inquiry."
      );
    } finally {
      setInquiryLoading(false);
    }
  }

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredQuotes =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return quotes.filter(
        (quote) => {
          const matchesSearch =
            !searchText ||
            quote.quoteNumber
              .toLowerCase()
              .includes(
                searchText
              ) ||
            quote.title
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              quote.clientName ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              quote.companyName ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              quote.projectName ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            quote.status
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            quote.status
              .toLowerCase() ===
              statusFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      quotes,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalQuotes =
    quotes.length;

  const draftCount =
    quotes.filter(
      (x) =>
        x.status.toLowerCase() ===
        "draft"
    ).length;

  const sentCount =
    quotes.filter(
      (x) =>
        x.status.toLowerCase() ===
        "sent"
    ).length;

  const acceptedCount =
    quotes.filter(
      (x) =>
        x.status.toLowerCase() ===
        "accepted"
    ).length;

  const totalValue =
    quotes.reduce(
      (
        total,
        quote
      ) =>
        total +
        (quote.amount || 0),
      0
    );

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  function handleFormChange(
    field: keyof CreateQuoteForm,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  // ==========================================================
  // OPEN MANUAL CREATE MODAL
  // ==========================================================

  function openCreateModal() {
    setError("");
    setSuccessMessage("");
    setSelectedInquiry(
      null
    );

    setSearchParams({});

    setForm({
      clientId: "",
      projectId: "",

      clientName: "",
      clientEmail: "",
      companyName: "",
      projectName: "",

      quoteNumber:
        generateQuoteNumber(),

      title: "",
      description: "",

      amount: "",
      validUntil: "",
    });

    setShowCreateModal(
      true
    );
  }

  // ==========================================================
  // CREATE PROPOSAL / QUOTE
  // ==========================================================

  async function handleCreateQuote(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      // ======================================================
      // BASIC VALIDATION
      // ======================================================

      if (
        !form.quoteNumber.trim()
      ) {
        throw new Error(
          "Quote number is required."
        );
      }

      if (
        !form.title.trim()
      ) {
        throw new Error(
          "Quote title is required."
        );
      }

      if (
        !form.amount.trim()
      ) {
        throw new Error(
          "Amount is required."
        );
      }

      const amount =
        Number(form.amount);

      if (
        Number.isNaN(amount) ||
        amount <= 0
      ) {
        throw new Error(
          "Enter a valid quote amount."
        );
      }

      // ======================================================
      // INQUIRY → PROPOSAL
      // ======================================================

      if (
        inquiryId &&
        inquiryId > 0
      ) {
        const payload = {
          projectInquiryId:
            inquiryId,

          quoteNumber:
            form.quoteNumber.trim(),

          title:
            form.title.trim(),

          description:
            form.description.trim() ||
            null,

          amount,

          validUntil:
            form.validUntil
              ? `${form.validUntil}T00:00:00`
              : null,
        };

        const response =
          await fetch(
            `${API_BASE_URL}/Quotes/from-inquiry`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const result:
          CreateFromInquiryResponse =
          await response.json();

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            throw new Error(
              "Session expired. Please login again."
            );
          }

          if (
            response.status === 403
          ) {
            throw new Error(
              "You are not authorized to create proposals."
            );
          }

          throw new Error(
            result.message ||
              `Unable to create proposal. Status: ${response.status}`
          );
        }

        if (
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to create proposal."
          );
        }

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        setShowCreateModal(
          false
        );

        setSelectedInquiry(
          null
        );

        setSuccessMessage(
          `Proposal ${result.quoteNumber} created successfully as Draft.`
        );

        // Remove inquiryId from URL
        setSearchParams({});

        await loadQuotes();

        return;
      }

      // ======================================================
      // MANUAL QUOTE
      // ======================================================

      if (
        !form.clientId.trim()
      ) {
        throw new Error(
          "Client ID is required."
        );
      }

      if (
        !form.projectId.trim()
      ) {
        throw new Error(
          "Project ID is required."
        );
      }

      const payload = {
        clientId:
          Number(
            form.clientId
          ),

        projectId:
          Number(
            form.projectId
          ),

        quoteNumber:
          form.quoteNumber.trim(),

        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          null,

        amount,

        validUntil:
          form.validUntil
            ? `${form.validUntil}T00:00:00`
            : null,
      };

      const response =
        await fetch(
          `${API_BASE_URL}/Quotes`,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result:
        QuoteResponse =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You are not authorized to create quotes."
          );
        }

        throw new Error(
          result.message ||
            `Unable to create quote. Status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to create quote."
        );
      }

      setShowCreateModal(
        false
      );

      setSuccessMessage(
        "Quote created successfully."
      );

      await loadQuotes();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create proposal."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  // ==========================================================
  // SEND QUOTE
  // ==========================================================

  async function handleSendQuote(
    quote: Quote
  ) {
    if (actionLoading) {
      return;
    }

    if (
      quote.status.toLowerCase() !==
      "draft"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Send "${quote.quoteNumber}" to the client?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response =
        await fetch(
          `${API_BASE_URL}/Quotes/${quote.quoteId}/send`,
          {
            method: "PUT",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result:
        QuoteResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to send quote."
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to send quote."
        );
      }

      setSuccessMessage(
        `Quote ${quote.quoteNumber} sent successfully.`
      );

      await loadQuotes();

      setSelectedQuote(
        null
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send quote."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

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
    <main>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">

        <div className="container-fluid px-4 py-4">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <div className="small text-uppercase text-primary fw-semibold mb-1">
                ADMIN PORTAL
              </div>

              <h1 className="h3 fw-bold mb-1">
                Quotes & Proposals
              </h1>

              <p className="text-secondary mb-0">
                Create, manage and send project proposals
                to clients.
              </p>

            </div>

            <div className="d-flex gap-2">

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={loadQuotes}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className="me-2"
                />

                Refresh
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateModal}
                disabled={
                  inquiryLoading
                }
              >
                <Plus
                  size={17}
                  className="me-2"
                />

                Create Quote
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {successMessage && (

        <div className="container-fluid px-4 pt-4">

          <div className="alert alert-success rounded-4">

            <div className="fw-semibold">
              {successMessage}
            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="container-fluid px-4 pt-4">

          <div className="alert alert-danger rounded-4">

            <div className="d-flex justify-content-between align-items-center gap-3">

              <div>

                <div className="fw-semibold mb-1">
                  Quote operation failed
                </div>

                <div className="small">
                  {error}
                </div>

              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  setError("");
                  loadQuotes();
                }}
              >
                Retry
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="py-4">

        <div className="container-fluid px-4">

          <div className="row g-4 mb-4">

            {/* TOTAL */}

            <div className="col-sm-6 col-xl-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Total Quotes
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : totalQuotes}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FileText
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* DRAFT */}

            <div className="col-sm-6 col-xl-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Draft
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : draftCount}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <FileCheck2
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* SENT */}

            <div className="col-sm-6 col-xl-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Sent
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : sentCount}
                      </div>

                    </div>

                    <div className="mts-icon-box">
                      <Send
                        size={22}
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ACCEPTED */}

            <div className="col-sm-6 col-xl-3">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">

                    <div>

                      <div className="small text-secondary mb-2">
                        Accepted
                      </div>

                      <div className="h3 fw-bold mb-0">
                        {loading
                          ? "-"
                          : acceptedCount}
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

          </div>

          {/* TOTAL VALUE */}

          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <div className="small text-secondary">
                    Total Quote Value
                  </div>

                  <div className="h4 fw-bold mb-0 mt-1">
                    {formatCurrency(
                      totalValue
                    )}
                  </div>

                </div>

                <div className="mts-icon-box">
                  <IndianRupee
                    size={22}
                  />
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-3">

              <div className="row g-3 align-items-center">

                <div className="col-lg-6">

                  <div className="input-group">

                    <span className="input-group-text bg-white">
                      <Search
                        size={17}
                      />
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search quote number, title, client..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="col-lg-3">

                  <select
                    className="form-select"
                    value={
                      statusFilter
                    }
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >

                    <option value="All">
                      All Status
                    </option>

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Sent">
                      Sent
                    </option>

                    <option value="Accepted">
                      Accepted
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

                <div className="col-lg-3 text-lg-end">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      resetFilters
                    }
                  >
                    Reset Filters
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              QUOTE TABLE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>

                      <th className="px-4 py-3">
                        Quote
                      </th>

                      <th>
                        Client
                      </th>

                      <th>
                        Project
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Valid Until
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

                    {loading && (

                      <tr>

                        <td
                          colSpan={7}
                          className="text-center py-5"
                        >

                          <div
                            className="spinner-border text-primary"
                            role="status"
                          />

                          <div className="small text-secondary mt-3">
                            Loading quotes...
                          </div>

                        </td>

                      </tr>

                    )}

                    {!loading &&
                      filteredQuotes.length >
                        0 &&
                      filteredQuotes.map(
                        (quote) => (

                          <tr
                            key={
                              quote.quoteId
                            }
                          >

                            {/* QUOTE */}

                            <td className="px-4">

                              <div className="d-flex align-items-center">

                                <div className="mts-icon-box flex-shrink-0">

                                  <FileText
                                    size={19}
                                  />

                                </div>

                                <div className="ms-3">

                                  <div className="small text-secondary">
                                    {
                                      quote.quoteNumber
                                    }
                                  </div>

                                  <div className="fw-bold">
                                    {
                                      quote.title
                                    }
                                  </div>

                                </div>

                              </div>

                            </td>

                            {/* CLIENT */}

                            <td>

                              <div className="small fw-semibold">
                                {
                                  quote.clientName ||
                                  `#${quote.clientId}`
                                }
                              </div>

                              {quote.companyName && (

                                <div className="small text-secondary">
                                  {
                                    quote.companyName
                                  }
                                </div>

                              )}

                            </td>

                            {/* PROJECT */}

                            <td>

                              <div className="small">
                                {
                                  quote.projectName ||
                                  `#${quote.projectId}`
                                }
                              </div>

                            </td>

                            {/* AMOUNT */}

                            <td>

                              <span className="fw-semibold small">
                                {formatCurrency(
                                  quote.amount
                                )}
                              </span>

                            </td>

                            {/* VALID UNTIL */}

                            <td>

                              <div className="small d-flex align-items-center">

                                <CalendarDays
                                  size={14}
                                  className="me-1 text-primary"
                                />

                                {
                                  formatDate(
                                    quote.validUntil
                                  )
                                }

                              </div>

                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={`badge rounded-pill ${getStatusClass(
                                  quote.status
                                )}`}
                              >
                                {
                                  quote.status
                                }
                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="text-end px-4">

                              <div className="d-flex justify-content-end gap-2">

                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() =>
                                    setSelectedQuote(
                                      quote
                                    )
                                  }
                                  title="View Quote"
                                >
                                  <Eye
                                    size={15}
                                  />
                                </button>

                                {quote.status.toLowerCase() ===
                                  "draft" && (

                                  <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() =>
                                      handleSendQuote(
                                        quote
                                      )
                                    }
                                    disabled={
                                      actionLoading
                                    }
                                    title="Send Quote"
                                  >
                                    <Send
                                      size={15}
                                    />
                                  </button>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    {!loading &&
                      filteredQuotes.length ===
                        0 && (

                        <tr>

                          <td
                            colSpan={7}
                            className="text-center py-5"
                          >

                            <FileText
                              size={38}
                              className="text-secondary mb-3"
                            />

                            <div className="fw-semibold">
                              No quotes found
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

        </div>

      </section>

      {/* =====================================================
          VIEW QUOTE MODAL
      ===================================================== */}

      {selectedQuote && (

        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
          }}
          onClick={() =>
            setSelectedQuote(
              null
            )
          }
        >

          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4">

              <div className="modal-header">

                <div>

                  <div className="small text-primary fw-semibold mb-1">
                    QUOTE DETAILS
                  </div>

                  <h5 className="modal-title fw-bold">
                    {
                      selectedQuote.title
                    }
                  </h5>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedQuote(
                      null
                    )
                  }
                />

              </div>

              <div className="modal-body">

                <div className="d-flex justify-content-between align-items-start mb-4">

                  <div>

                    <div className="small text-secondary">
                      Quote Number
                    </div>

                    <div className="fw-bold">
                      {
                        selectedQuote.quoteNumber
                      }
                    </div>

                  </div>

                  <span
                    className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                      selectedQuote.status
                    )}`}
                  >
                    {
                      selectedQuote.status
                    }
                  </span>

                </div>

                <div className="row g-3 mb-4">

                  <div className="col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Client
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedQuote.clientName ||
                          `#${selectedQuote.clientId}`
                        }
                      </div>

                      {selectedQuote.companyName && (

                        <div className="small text-secondary">
                          {
                            selectedQuote.companyName
                          }
                        </div>

                      )}

                    </div>

                  </div>

                  <div className="col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Project
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedQuote.projectName ||
                          `#${selectedQuote.projectId}`
                        }
                      </div>

                    </div>

                  </div>

                  <div className="col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Amount
                      </div>

                      <div className="fw-semibold text-primary">
                        {formatCurrency(
                          selectedQuote.amount
                        )}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-6">

                    <div className="border rounded-3 p-3 h-100">

                      <div className="small text-secondary mb-1">
                        Valid Until
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedQuote.validUntil
                        )}
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mb-4">

                  <h6 className="fw-bold">
                    Description
                  </h6>

                  <div className="bg-light rounded-3 p-3 small">
                    {
                      selectedQuote.description ||
                      "No description provided."
                    }
                  </div>

                </div>

                <div className="border rounded-3 p-3">

                  <div className="fw-semibold mb-3">
                    Quote Actions
                  </div>

                  <div className="d-flex flex-wrap gap-2">

                    {selectedQuote.status.toLowerCase() ===
                      "draft" && (

                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleSendQuote(
                            selectedQuote
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >

                        {actionLoading ? (

                          <span className="spinner-border spinner-border-sm me-2" />

                        ) : (

                          <Send
                            size={15}
                            className="me-1"
                          />

                        )}

                        Send Quote

                      </button>

                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          CREATE QUOTE / PROPOSAL MODAL
      ===================================================== */}

      {showCreateModal && (

        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 rounded-4">

              <form
                onSubmit={
                  handleCreateQuote
                }
              >

                <div className="modal-header">

                  <div>

                    <div className="small text-primary fw-semibold mb-1">
                      {selectedInquiry
                        ? "PROJECT INQUIRY"
                        : "ADMIN PORTAL"}
                    </div>

                    <h5 className="modal-title fw-bold">

                      {selectedInquiry
                        ? "Create Proposal"
                        : "Create Quote"}

                    </h5>

                    {selectedInquiry && (

                      <div className="small text-secondary mt-1">
                        Inquiry #
                        {
                          selectedInquiry.projectInquiryId
                        }
                      </div>

                    )}

                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {

                      setShowCreateModal(
                        false
                      );

                      setSelectedInquiry(
                        null
                      );

                      setSearchParams({});

                    }}
                    disabled={
                      actionLoading
                    }
                  />

                </div>

                <div className="modal-body">

                  {/* =================================================
                      INQUIRY SUMMARY
                  ================================================= */}

                  {selectedInquiry && (

                    <div className="alert alert-primary rounded-4 mb-4">

                      <div className="fw-semibold mb-2">
                        Proposal for approved inquiry
                      </div>

                      <div className="row g-2 small">

                        <div className="col-md-6">

                          <span className="text-secondary">
                            Client:
                          </span>{" "}

                          <strong>
                            {
                              form.clientName ||
                              "Website Visitor"
                            }
                          </strong>

                        </div>

                        <div className="col-md-6">

                          <span className="text-secondary">
                            Company:
                          </span>{" "}

                          <strong>
                            {
                              form.companyName ||
                              "Not specified"
                            }
                          </strong>

                        </div>

                        <div className="col-md-6">

                          <span className="text-secondary">
                            Email:
                          </span>{" "}

                          <strong className="text-break">
                            {
                              form.clientEmail ||
                              "-"
                            }
                          </strong>

                        </div>

                        <div className="col-md-6">

                          <span className="text-secondary">
                            Project:
                          </span>{" "}

                          <strong>
                            {
                              form.projectName
                            }
                          </strong>

                        </div>

                      </div>

                    </div>

                  )}

                  <div className="row g-3">

                    {/* =================================================
                        CLIENT ID
                    ================================================= */}

                    {!selectedInquiry && (

                      <div className="col-md-6">

                        <label className="form-label small fw-semibold">
                          Client ID
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={
                            form.clientId
                          }
                          onChange={(e) =>
                            handleFormChange(
                              "clientId",
                              e.target.value
                            )
                          }
                          min="1"
                          required
                        />

                      </div>

                    )}

                    {/* =================================================
                        PROJECT ID
                    ================================================= */}

                    {!selectedInquiry && (

                      <div className="col-md-6">

                        <label className="form-label small fw-semibold">
                          Project ID
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          value={
                            form.projectId
                          }
                          onChange={(e) =>
                            handleFormChange(
                              "projectId",
                              e.target.value
                            )
                          }
                          min="1"
                          required
                        />

                      </div>

                    )}

                    {/* =================================================
                        QUOTE NUMBER
                    ================================================= */}

                    <div className="col-md-6">

                      <label className="form-label small fw-semibold">
                        Quote Number
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="MTS-Q-2026-0001"
                        value={
                          form.quoteNumber
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "quoteNumber",
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <div className="col-md-6">

                      <label className="form-label small fw-semibold">
                        Proposal Title
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Banking Application Development"
                        value={
                          form.title
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "title",
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <div className="col-md-6">

                      <label className="form-label small fw-semibold">
                        Proposal Amount
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          ₹
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          placeholder="500000"
                          value={
                            form.amount
                          }
                          onChange={(e) =>
                            handleFormChange(
                              "amount",
                              e.target.value
                            )
                          }
                          min="1"
                          step="0.01"
                          required
                        />

                      </div>

                    </div>

                    {/* =================================================
                        VALID UNTIL
                    ================================================= */}

                    <div className="col-md-6">

                      <label className="form-label small fw-semibold">
                        Valid Until
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          form.validUntil
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "validUntil",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="col-12">

                      <label className="form-label small fw-semibold">
                        Proposal Description
                      </label>

                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Enter proposal description..."
                        value={
                          form.description
                        }
                        onChange={(e) =>
                          handleFormChange(
                            "description",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {

                      setShowCreateModal(
                        false
                      );

                      setSelectedInquiry(
                        null
                      );

                      setSearchParams({});

                    }}
                    disabled={
                      actionLoading
                    }
                  >

                    <X
                      size={16}
                      className="me-1"
                    />

                    Cancel

                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      actionLoading ||
                      inquiryLoading
                    }
                  >

                    {actionLoading ? (

                      <>
                        <span className="spinner-border spinner-border-sm me-2" />

                        Creating Proposal...
                      </>

                    ) : (

                      <>
                        <Plus
                          size={16}
                          className="me-1"
                        />

                        {selectedInquiry
                          ? "Create Proposal"
                          : "Create Quote"}
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
