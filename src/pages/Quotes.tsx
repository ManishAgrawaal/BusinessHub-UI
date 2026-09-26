import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Quote {
  quoteId: number;
  quoteNumber: string;
  projectId: number;
  title: string;
  description?: string | null;
  amount: number;
  status: string;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface QuotesResponse {
  success: boolean;
  clientId: number;
  quotes: Quote[];
}

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function formatDate(date?: string | null): string {
  if (!date) return "-";

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

    case "pending":
    case "pending review":
    case "sent":
      return "bg-warning-subtle text-warning-emphasis";

    case "completed":
      return "bg-primary-subtle text-primary";

    case "rejected":
    case "expired":
      return "bg-danger-subtle text-danger";

    case "draft":
      return "bg-secondary-subtle text-secondary";

    default:
      return "bg-light text-secondary";
  }
}

function getDisplayStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "sent":
      return "Pending Review";

    case "draft":
      return "Draft";

    case "accepted":
      return "Accepted";

    case "rejected":
      return "Rejected";

    case "expired":
      return "Expired";

    case "completed":
      return "Completed";

    default:
      return status;
  }
}

export default function Quotes() {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
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
        `${API_BASE_URL}/Quotes/my-quotes`,
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
            "You are not authorized to view quotes."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Client profile not found."
          );
        }

        throw new Error(
          `Unable to load quotes. Status: ${response.status}`
        );
      }

      const result: QuotesResponse = await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load quotes."
        );
      }

      setQuotes(result.quotes ?? []);
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

  const totalProposals = quotes.length;

  const pendingReviewCount = useMemo(() => {
    return quotes.filter((quote) => {
      const status = quote.status.toLowerCase();

      return (
        status === "sent" ||
        status === "pending" ||
        status === "pending review"
      );
    }).length;
  }, [quotes]);

  const acceptedCount = useMemo(() => {
    return quotes.filter(
      (quote) =>
        quote.status.toLowerCase() === "accepted"
    ).length;
  }, [quotes]);

  const totalValue = useMemo(() => {
    return quotes.reduce(
      (total, quote) => total + (quote.amount || 0),
      0
    );
  }, [quotes]);

  return (
    <main>
      {/* PAGE HEADER */}
      <section className="bg-white border-bottom">
        <div className="container-fluid px-4 py-4">
          <div className="small text-uppercase text-secondary fw-semibold mb-1">
            CLIENT PORTAL
          </div>

          <h1 className="h3 fw-bold mb-1">
            Quotes & Proposals
          </h1>

          <p className="text-secondary mb-0">
            Review project proposals, pricing and commercial details.
          </p>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="py-4">
        <div className="container-fluid px-4">

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
                Loading quotes...
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger rounded-4">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div>
                  <div className="fw-semibold mb-1">
                    Unable to load quotes
                  </div>

                  <div className="small">
                    {error}
                  </div>
                </div>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={loadQuotes}
                >
                  <RefreshCw size={15} className="me-1" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* SUMMARY CARDS */}
              <div className="row g-4 mb-4">

                {/* TOTAL */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-secondary mb-2">
                            Total Proposals
                          </div>

                          <div className="h3 fw-bold mb-0">
                            {totalProposals}
                          </div>
                        </div>

                        <div className="mts-icon-box">
                          <FileText size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PENDING */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-secondary mb-2">
                            Pending Review
                          </div>

                          <div className="h3 fw-bold mb-0">
                            {pendingReviewCount}
                          </div>
                        </div>

                        <div className="mts-icon-box">
                          <Clock3 size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCEPTED */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-secondary mb-2">
                            Accepted
                          </div>

                          <div className="h3 fw-bold mb-0">
                            {acceptedCount}
                          </div>
                        </div>

                        <div className="mts-icon-box">
                          <CheckCircle2 size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOTAL VALUE */}
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-secondary mb-2">
                            Total Value
                          </div>

                          <div className="fw-bold">
                            {formatCurrency(totalValue)}
                          </div>
                        </div>

                        <div className="mts-icon-box">
                          <IndianRupee size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PROPOSALS */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h5 fw-bold mb-1">
                        Proposals
                      </h2>

                      <p className="small text-secondary mb-0">
                        Review your project proposals
                      </p>
                    </div>

                    <button className="btn btn-outline-secondary btn-sm">
                      All Proposals
                    </button>
                  </div>

                  {quotes.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mts-icon-box mx-auto mb-3">
                        <FileText size={22} />
                      </div>

                      <h3 className="h6 fw-bold">
                        No proposals found
                      </h3>

                      <p className="small text-secondary mb-0">
                        You currently don't have any quotes or proposals.
                      </p>
                    </div>
                  ) : (
                    <div className="row g-4">

                      {quotes.map((quote) => (
                        <div
                          className="col-12"
                          key={quote.quoteId}
                        >
                          <div className="border rounded-4 p-4">

                            <div className="row align-items-center g-4">

                              {/* DETAILS */}
                              <div className="col-lg-5">
                                <div className="d-flex align-items-start">

                                  <div className="mts-icon-box me-3">
                                    <FileText size={22} />
                                  </div>

                                  <div>
                                    <div className="small text-secondary mb-1">
                                      Proposal #{quote.quoteNumber}
                                    </div>

                                    <h3 className="h6 fw-bold mb-2">
                                      {quote.title}
                                    </h3>

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
                              </div>

                              {/* CREATED */}
                              <div className="col-sm-6 col-lg-2">
                                <div className="small text-secondary mb-1">
                                  Created
                                </div>

                                <div className="small fw-semibold d-flex align-items-center">
                                  <CalendarDays
                                    size={15}
                                    className="me-2 text-primary"
                                  />

                                  {formatDate(
                                    quote.createdAt
                                  )}
                                </div>
                              </div>

                              {/* VALID UNTIL */}
                              <div className="col-sm-6 col-lg-2">
                                <div className="small text-secondary mb-1">
                                  Valid Until
                                </div>

                                <div className="small fw-semibold">
                                  {formatDate(
                                    quote.validUntil
                                  )}
                                </div>
                              </div>

                              {/* AMOUNT */}
                              <div className="col-sm-6 col-lg-1">
                                <div className="small text-secondary mb-1">
                                  Amount
                                </div>

                                <div className="small fw-bold">
                                  {formatCurrency(
                                    quote.amount
                                  )}
                                </div>
                              </div>

                              {/* ACTION */}
                              <div className="col-sm-6 col-lg-2">
                                <button
                                  className="btn btn-outline-primary btn-sm w-100"
                                  onClick={() =>
                                    navigate(
                                      `/quotes/${quote.quoteId}`
                                    )
                                  }
                                >
                                  View

                                  <ArrowRight
                                    size={15}
                                    className="ms-1"
                                  />
                                </button>
                              </div>

                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </div>

              {/* IMPORTANT NOTICE */}
              <div className="alert alert-light border rounded-4 mt-4 p-4">
                <div className="d-flex">
                  <CheckCircle2
                    size={21}
                    className="text-primary me-3 flex-shrink-0"
                  />

                  <div>
                    <div className="fw-semibold mb-1">
                      Proposal & Approval
                    </div>

                    <div className="small text-secondary">
                      Review the scope, commercials and project terms
                      before approving a proposal. You can also request
                      changes if any requirement needs clarification.
                    </div>
                  </div>
                </div>
              </div>

              {/* SUPPORT */}
              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">

                    <div className="col">
                      <h3 className="h6 fw-bold mb-1">
                        Have questions about a proposal?
                      </h3>

                      <p className="small text-secondary mb-0">
                        Contact the MTS project team for clarification or
                        changes.
                      </p>
                    </div>

                    <div className="col-auto">
                      <button
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
