import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Quote {
  quoteId: number;
  quoteNumber: string;
  clientId: number;
  projectId: number;
  title: string;
  description?: string | null;
  amount: number;
  status: string;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface QuoteResponse {
  success: boolean;
  quote: Quote;
}

interface QuoteActionResponse {
  success: boolean;
  message?: string;
  quoteId?: number;
  status?: string;
  updatedAt?: string;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "accepted":
      return "bg-success-subtle text-success";

    case "rejected":
      return "bg-danger-subtle text-danger";

    case "expired":
      return "bg-danger-subtle text-danger";

    case "sent":
      return "bg-warning-subtle text-warning-emphasis";

    case "pending":
    case "pending review":
      return "bg-warning-subtle text-warning-emphasis";

    case "draft":
      return "bg-secondary-subtle text-secondary";

    case "completed":
      return "bg-primary-subtle text-primary";

    default:
      return "bg-light text-secondary";
  }
}

function getDisplayStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "sent":
      return "Pending Review";

    case "pending":
      return "Pending Review";

    case "pending review":
      return "Pending Review";

    case "accepted":
      return "Accepted";

    case "rejected":
      return "Rejected";

    case "expired":
      return "Expired";

    case "draft":
      return "Draft";

    case "completed":
      return "Completed";

    default:
      return status;
  }
}

export default function QuoteDetails() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [quote, setQuote] = useState<Quote | null>(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  const [actionMessage, setActionMessage] = useState("");

  // ============================================================
  // LOAD QUOTE
  // ============================================================

  useEffect(() => {
    loadQuote();
  }, [id]);

  async function loadQuote() {
    try {
      setLoading(true);
      setError("");
      setActionMessage("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const quoteId = Number(id);

      if (!Number.isInteger(quoteId) || quoteId <= 0) {
        throw new Error("Invalid quote ID.");
      }

      const response = await fetch(
        `${API_BASE_URL}/Quotes/my-quotes/${quoteId}`,
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
            "You are not authorized to view this quote."
          );
        }

        if (response.status === 404) {
          throw new Error("Quote not found.");
        }

        throw new Error(
          `Unable to load quote. Status: ${response.status}`
        );
      }

      const result: QuoteResponse =
        await response.json();

      if (!result.success || !result.quote) {
        throw new Error(
          "Unable to load quote details."
        );
      }

      setQuote(result.quote);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quote details."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ACCEPT / REJECT QUOTE
  // ============================================================

  async function handleQuoteAction(
    action: "accept" | "reject"
  ) {
    if (!quote || processing) {
      return;
    }

    const currentStatus =
      quote.status.toLowerCase();

    if (
      action === "accept" &&
      currentStatus === "accepted"
    ) {
      return;
    }

    if (
      action === "reject" &&
      currentStatus === "rejected"
    ) {
      return;
    }

    if (
      action === "reject" &&
      currentStatus === "accepted"
    ) {
      setError(
        "An accepted quote cannot be rejected."
      );

      return;
    }

    const actionText =
      action === "accept"
        ? "accept"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this quote?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setActionMessage("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Quotes/my-quotes/${quote.quoteId}/${action}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: QuoteActionResponse =
        await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to update this quote."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Quote not found."
          );
        }

        throw new Error(
          result.message ||
            `Unable to ${actionText} quote.`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            `Unable to ${actionText} quote.`
        );
      }

      // Update UI immediately
      setQuote((currentQuote) =>
        currentQuote
          ? {
              ...currentQuote,
              status:
                result.status ||
                (action === "accept"
                  ? "Accepted"
                  : "Rejected"),
              updatedAt:
                result.updatedAt ||
                new Date().toISOString(),
            }
          : currentQuote
      );

      setActionMessage(
        result.message ||
          `Quote ${actionText}ed successfully.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `Unable to ${actionText} quote.`
      );
    } finally {
      setProcessing(false);
    }
  }

  // ============================================================
  // ACTION AVAILABILITY
  // ============================================================

  const canTakeAction =
    quote &&
    (
      quote.status.toLowerCase() ===
        "draft" ||
      quote.status.toLowerCase() ===
        "sent" ||
      quote.status.toLowerCase() ===
        "pending" ||
      quote.status.toLowerCase() ===
        "pending review"
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">

        <div className="container-fluid px-4 py-4">

          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 mb-3"
            onClick={() =>
              navigate("/quotes")
            }
          >
            <ArrowLeft
              size={16}
              className="me-1"
            />

            Back to Quotes
          </button>

          <div className="small text-uppercase text-secondary fw-semibold mb-1">
            CLIENT PORTAL
          </div>

          <h1 className="h3 fw-bold mb-1">
            Quote Details
          </h1>

          <p className="text-secondary mb-0">
            Review proposal details and commercial terms.
          </p>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="py-4">

        <div className="container-fluid px-4">

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
                Loading quote details...
              </div>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="alert alert-danger rounded-4">

              <div className="d-flex justify-content-between align-items-center gap-3">

                <div>

                  <div className="fw-semibold mb-1">
                    Unable to load quote
                  </div>

                  <div className="small">
                    {error}
                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={loadQuote}
                >
                  Retry
                </button>

              </div>

            </div>
          )}

          {/* QUOTE */}

          {!loading &&
            !error &&
            quote && (
              <>

                {/* =================================================
                    MAIN QUOTE CARD
                ================================================= */}

                <div className="card border-0 shadow-sm rounded-4">

                  <div className="card-body p-4">

                    {/* TOP */}

                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

                      <div className="d-flex align-items-start">

                        <div className="mts-icon-box me-3">
                          <FileText size={24} />
                        </div>

                        <div>

                          <div className="small text-secondary mb-1">
                            Proposal #{quote.quoteNumber}
                          </div>

                          <h2 className="h4 fw-bold mb-2">
                            {quote.title}
                          </h2>

                          <span
                            className={`badge rounded-pill ${getStatusClass(
                              quote.status
                            )}`}
                          >
                            {getDisplayStatus(
                              quote.status
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="text-lg-end">

                        <div className="small text-secondary mb-1">
                          Quote Amount
                        </div>

                        <div className="h4 fw-bold text-primary mb-0">
                          {formatCurrency(
                            quote.amount
                          )}
                        </div>

                      </div>

                    </div>

                    <hr />

                    {/* DETAILS */}

                    <div className="row g-4 mt-1">

                      <div className="col-md-6 col-lg-3">

                        <div className="small text-secondary mb-1">
                          Quote Number
                        </div>

                        <div className="fw-semibold">
                          {quote.quoteNumber}
                        </div>

                      </div>

                      <div className="col-md-6 col-lg-3">

                        <div className="small text-secondary mb-1">
                          Created
                        </div>

                        <div className="fw-semibold d-flex align-items-center">

                          <CalendarDays
                            size={16}
                            className="me-2 text-primary"
                          />

                          {formatDate(
                            quote.createdAt
                          )}

                        </div>

                      </div>

                      <div className="col-md-6 col-lg-3">

                        <div className="small text-secondary mb-1">
                          Valid Until
                        </div>

                        <div className="fw-semibold">
                          {formatDate(
                            quote.validUntil
                          )}
                        </div>

                      </div>

                      <div className="col-md-6 col-lg-3">

                        <div className="small text-secondary mb-1">
                          Project ID
                        </div>

                        <div className="fw-semibold">
                          #{quote.projectId}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <div className="card border-0 shadow-sm rounded-4 mt-4">

                  <div className="card-body p-4">

                    <h3 className="h5 fw-bold mb-3">
                      Proposal Description
                    </h3>

                    <p className="text-secondary mb-0">
                      {quote.description ||
                        "No description has been provided for this proposal."}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    ACTION SUCCESS
                ================================================= */}

                {actionMessage && (
                  <div className="alert alert-success rounded-4 mt-4">

                    <div className="d-flex align-items-center">

                      <CheckCircle2
                        size={20}
                        className="me-2"
                      />

                      <span>
                        {actionMessage}
                      </span>

                    </div>

                  </div>
                )}

                {/* =================================================
                    APPROVAL ACTIONS
                ================================================= */}

                <div className="card border-0 shadow-sm rounded-4 mt-4">

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                      <div>

                        <h3 className="h6 fw-bold mb-1">
                          Proposal Approval
                        </h3>

                        <p className="small text-secondary mb-0">
                          Review the proposal before accepting or rejecting it.
                        </p>

                      </div>

                      {canTakeAction ? (
                        <div className="d-flex gap-2">

                          {/* REJECT */}

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            disabled={processing}
                            onClick={() =>
                              handleQuoteAction(
                                "reject"
                              )
                            }
                          >

                            {processing ? (
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <XCircle
                                size={16}
                                className="me-1"
                              />
                            )}

                            {processing
                              ? "Processing..."
                              : "Reject"}

                          </button>

                          {/* ACCEPT */}

                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={processing}
                            onClick={() =>
                              handleQuoteAction(
                                "accept"
                              )
                            }
                          >

                            {processing ? (
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <CheckCircle2
                                size={16}
                                className="me-1"
                              />
                            )}

                            {processing
                              ? "Processing..."
                              : "Accept Quote"}

                          </button>

                        </div>
                      ) : (
                        <div className="text-secondary small d-flex align-items-center">

                          <Clock3
                            size={16}
                            className="me-2"
                          />

                          This quote cannot be modified in its current status.

                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    SUPPORT
                ================================================= */}

                <div className="card border-0 shadow-sm rounded-4 mt-4">

                  <div className="card-body p-4">

                    <div className="row align-items-center g-3">

                      <div className="col">

                        <h3 className="h6 fw-bold mb-1">
                          Need changes or clarification?
                        </h3>

                        <p className="small text-secondary mb-0">
                          Contact the MTS project team if you have
                          questions about this proposal.
                        </p>

                      </div>

                      <div className="col-auto">

                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() =>
                            navigate("/messages")
                          }
                        >
                          Contact Team
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </>
            )}

        </div>

      </section>

    </main>
  );
}
