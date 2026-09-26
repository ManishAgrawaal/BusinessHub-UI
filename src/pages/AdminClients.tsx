import {
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// TYPES
// =========================================================

interface Client {
  clientId: number;
  userId: number;

  fullName: string;
  email: string;
  role: string;
  isActive: boolean;

  companyName: string;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ClientsResponse {
  success: boolean;
  message?: string;
  count: number;
  clients: Client[];
}

interface CreateClientForm {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
}

interface EditClientForm {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
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

// =========================================================
// EMPTY CREATE FORM
// =========================================================

const emptyCreateForm: CreateClientForm = {
  fullName: "",
  email: "",
  password: "",
  companyName: "",
  phoneNumber: "",
  address: "",
  city: "",
  country: "India",
};

// =========================================================
// COMPONENT
// =========================================================

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");

  // =======================================================
  // ADD CLIENT
  // =======================================================

  const [showAddModal, setShowAddModal] = useState(false);

  const [createForm, setCreateForm] =
    useState<CreateClientForm>(emptyCreateForm);

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  // =======================================================
  // EDIT CLIENT
  // =======================================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [editForm, setEditForm] =
    useState<EditClientForm>({
      fullName: "",
      companyName: "",
      phoneNumber: "",
      address: "",
      city: "",
      country: "",
      isActive: true,
    });

  const [updating, setUpdating] = useState(false);

  const [editError, setEditError] = useState("");

  // =======================================================
  // VIEW CLIENT
  // =======================================================

  const [showViewModal, setShowViewModal] = useState(false);

  // =======================================================
  // LOAD CLIENTS
  // =======================================================

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
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
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view clients."
          );
        }

        throw new Error(
          `Unable to load clients. Status: ${response.status}`
        );
      }

      const result: ClientsResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load clients."
        );
      }

      setClients(result.clients ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =======================================================
  // FILTER CLIENTS
  // =======================================================

  const filteredClients = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.fullName
          .toLowerCase()
          .includes(search) ||
        client.email
          .toLowerCase()
          .includes(search) ||
        client.companyName
          .toLowerCase()
          .includes(search) ||
        (client.city ?? "")
          .toLowerCase()
          .includes(search) ||
        (client.phoneNumber ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [clients, searchText]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client) => client.isActive
  ).length;

  const inactiveClients = clients.filter(
    (client) => !client.isActive
  ).length;

  // =======================================================
  // CREATE FORM CHANGE
  // =======================================================

  function handleCreateChange(
    field: keyof CreateClientForm,
    value: string
  ) {
    setCreateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // =======================================================
  // CREATE CLIENT
  // =======================================================

  async function handleCreateClient(
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

      const response = await fetch(
        `${API_BASE_URL}/Clients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: createForm.fullName,
            email: createForm.email,
            password: createForm.password,
            companyName: createForm.companyName,
            phoneNumber:
              createForm.phoneNumber || null,
            address:
              createForm.address || null,
            city: createForm.city || null,
            country:
              createForm.country || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to create client."
        );
      }

      setCreateForm(emptyCreateForm);

      setShowAddModal(false);

      await loadClients();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to create client."
      );
    } finally {
      setCreating(false);
    }
  }

  // =======================================================
  // OPEN VIEW
  // =======================================================

  function handleViewClient(client: Client) {
    setSelectedClient(client);
    setShowViewModal(true);
  }

  // =======================================================
  // OPEN EDIT
  // =======================================================

  function handleEditClient(client: Client) {
    setSelectedClient(client);

    setEditForm({
      fullName: client.fullName,
      companyName: client.companyName,
      phoneNumber:
        client.phoneNumber ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      country:
        client.country ?? "",
      isActive: client.isActive,
    });

    setEditError("");

    setShowEditModal(true);
  }

  // =======================================================
  // EDIT FORM CHANGE
  // =======================================================

  function handleEditChange(
    field: keyof EditClientForm,
    value: string | boolean
  ) {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // =======================================================
  // UPDATE CLIENT
  // =======================================================

  async function handleUpdateClient(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedClient) {
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
        `${API_BASE_URL}/Clients/${selectedClient.clientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: editForm.fullName,
            companyName:
              editForm.companyName,
            phoneNumber:
              editForm.phoneNumber || null,
            address:
              editForm.address || null,
            city:
              editForm.city || null,
            country:
              editForm.country || null,
            isActive:
              editForm.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update client."
        );
      }

      setShowEditModal(false);
      setSelectedClient(null);

      await loadClients();
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to update client."
      );
    } finally {
      setUpdating(false);
    }
  }

  // =======================================================
  // CLOSE ADD MODAL
  // =======================================================

  function closeAddModal() {
    if (creating) {
      return;
    }

    setShowAddModal(false);
    setCreateError("");
    setCreateForm(emptyCreateForm);
  }

  // =======================================================
  // CLOSE EDIT MODAL
  // =======================================================

  function closeEditModal() {
    if (updating) {
      return;
    }

    setShowEditModal(false);
    setEditError("");
    setSelectedClient(null);
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="container-fluid px-3 px-lg-4 py-4">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <div className="small text-primary fw-semibold text-uppercase">
            Admin Portal
          </div>

          <h1 className="h3 fw-bold mb-1">
            Clients
          </h1>

          <p className="text-secondary mb-0">
            Manage MTS clients and their accounts.
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={loadClients}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={`me-2 ${
                refreshing
                  ? "spinner-border"
                  : ""
              }`}
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

            Add Client
          </button>

        </div>
      </div>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <Users size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Total Clients
                </div>

                <div className="h4 fw-bold mb-0">
                  {totalClients}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="col-12 col-md-4">
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
                  Active Clients
                </div>

                <div className="h4 fw-bold mb-0">
                  {activeClients}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">

              <div
                className="rounded-3 bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                }}
              >
                <User size={22} />
              </div>

              <div className="ms-3">
                <div className="small text-secondary">
                  Inactive Clients
                </div>

                <div className="h4 fw-bold mb-0">
                  {inactiveClients}
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
            onClick={loadClients}
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          CLIENT TABLE CARD
      =================================================== */}

      <div className="card border-0 shadow-sm">

        {/* TABLE HEADER */}

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
                  placeholder="Search by client, company, email, phone or city..."
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
                  {filteredClients.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {clients.length}
                </strong>{" "}
                clients
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
              Loading clients...
            </div>

          </div>
        ) : filteredClients.length === 0 ? (

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
              <Users
                size={28}
                className="text-secondary"
              />
            </div>

            <h5 className="fw-bold">
              No clients found
            </h5>

            <p className="text-secondary mb-3">
              {searchText
                ? "Try changing your search criteria."
                : "No clients have been created yet."}
            </p>

            {!searchText && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setShowAddModal(true)
                }
              >
                <Plus
                  size={16}
                  className="me-2"
                />
                Add Client
              </button>
            )}

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
                    Client
                  </th>

                  <th className="py-3">
                    Company
                  </th>

                  <th className="py-3">
                    Contact
                  </th>

                  <th className="py-3">
                    Location
                  </th>

                  <th className="py-3">
                    Status
                  </th>

                  <th className="py-3">
                    Created
                  </th>

                  <th className="py-3 text-end px-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredClients.map(
                  (client) => (
                    <tr key={client.clientId}>

                      {/* CLIENT */}

                      <td className="px-4">

                        <div className="d-flex align-items-center">

                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "42px",
                              height: "42px",
                            }}
                          >
                            <User size={19} />
                          </div>

                          <div className="ms-3">

                            <div className="fw-semibold">
                              {client.fullName}
                            </div>

                            <div className="small text-secondary">
                              ID: #
                              {client.clientId}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* COMPANY */}

                      <td>

                        <div className="d-flex align-items-center">

                          <Building2
                            size={16}
                            className="text-secondary me-2"
                          />

                          <span>
                            {client.companyName}
                          </span>

                        </div>

                      </td>

                      {/* CONTACT */}

                      <td>

                        <div className="small">
                          <div className="d-flex align-items-center mb-1">

                            <Mail
                              size={14}
                              className="text-secondary me-2"
                            />

                            <span>
                              {client.email}
                            </span>

                          </div>

                          {client.phoneNumber && (
                            <div className="d-flex align-items-center">

                              <Phone
                                size={14}
                                className="text-secondary me-2"
                              />

                              <span>
                                {client.phoneNumber}
                              </span>

                            </div>
                          )}

                        </div>

                      </td>

                      {/* LOCATION */}

                      <td>

                        <div className="d-flex align-items-start small">

                          <MapPin
                            size={15}
                            className="text-secondary me-2 mt-1"
                          />

                          <span>
                            {client.city ||
                            client.country
                              ? [
                                  client.city,
                                  client.country,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(", ")
                              : "-"}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        {client.isActive ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* CREATED */}

                      <td>
                        <span className="small text-secondary">
                          {formatDate(
                            client.createdAt
                          )}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="text-end px-4">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="View client"
                            onClick={() =>
                              handleViewClient(
                                client
                              )
                            }
                          >
                            <User size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            title="Edit client"
                            onClick={() =>
                              handleEditClient(
                                client
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
          ADD CLIENT MODAL
      ===================================================== */}

      {showAddModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor:
              "rgba(0,0,0,0.45)",
            zIndex: 1060,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 shadow">

              {/* HEADER */}

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    Add New Client
                  </h5>

                  <div className="small text-secondary">
                    Create a new client account.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAddModal}
                  disabled={creating}
                />

              </div>

              {/* BODY */}

              <form
                onSubmit={
                  handleCreateClient
                }
              >

                <div className="modal-body">

                  {createError && (
                    <div className="alert alert-danger">
                      {createError}
                    </div>
                  )}

                  <div className="row g-3">

                    {/* FULL NAME */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Full Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.fullName
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "fullName",
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Email *
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        value={
                          createForm.email
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "email",
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* PASSWORD */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Temporary Password *
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        value={
                          createForm.password
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "password",
                            event.target.value
                          )
                        }
                        minLength={6}
                        required
                      />

                    </div>

                    {/* COMPANY */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Company Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.companyName
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "companyName",
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.phoneNumber
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "phoneNumber",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* CITY */}

                    <div className="col-md-3">

                      <label className="form-label fw-semibold">
                        City
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.city
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "city",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* COUNTRY */}

                    <div className="col-md-3">

                      <label className="form-label fw-semibold">
                        Country
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          createForm.country
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "country",
                            event.target.value
                          )
                        }
                      />

                    </div>

                    {/* ADDRESS */}

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Address
                      </label>

                      <textarea
                        className="form-control"
                        rows={3}
                        value={
                          createForm.address
                        }
                        onChange={(event) =>
                          handleCreateChange(
                            "address",
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

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
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus
                          size={16}
                          className="me-2"
                        />
                        Create Client
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
          VIEW CLIENT MODAL
      ===================================================== */}

      {showViewModal &&
        selectedClient && (
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{
              backgroundColor:
                "rgba(0,0,0,0.45)",
              zIndex: 1060,
            }}
          >
            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content border-0 shadow">

                <div className="modal-header">

                  <div>
                    <h5 className="modal-title fw-bold">
                      Client Details
                    </h5>

                    <div className="small text-secondary">
                      Client #
                      {selectedClient.clientId}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowViewModal(
                        false
                      );
                      setSelectedClient(
                        null
                      );
                    }}
                  />

                </div>

                <div className="modal-body">

                  {/* PROFILE */}

                  <div className="d-flex align-items-center mb-4">

                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{
                        width: "58px",
                        height: "58px",
                      }}
                    >
                      <User size={25} />
                    </div>

                    <div className="ms-3">

                      <h5 className="fw-bold mb-1">
                        {
                          selectedClient.fullName
                        }
                      </h5>

                      <div className="text-secondary small">
                        {
                          selectedClient.email
                        }
                      </div>

                    </div>

                  </div>

                  <div className="row g-3">

                    <div className="col-12">
                      <div className="small text-secondary">
                        Company
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedClient.companyName
                        }
                      </div>
                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Phone
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedClient.phoneNumber ||
                          "-"
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Status
                      </div>

                      <div>

                        {selectedClient.isActive ? (
                          <span className="badge bg-success-subtle text-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">
                            Inactive
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="col-12">

                      <div className="small text-secondary">
                        Address
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedClient.address ||
                          "-"
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        City
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedClient.city ||
                          "-"
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Country
                      </div>

                      <div className="fw-semibold">
                        {
                          selectedClient.country ||
                          "-"
                        }
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Created
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedClient.createdAt
                        )}
                      </div>

                    </div>

                    <div className="col-md-6">

                      <div className="small text-secondary">
                        Last Updated
                      </div>

                      <div className="fw-semibold">
                        {formatDate(
                          selectedClient.updatedAt
                        )}
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

                      handleEditClient(
                        selectedClient
                      );
                    }}
                  >
                    <Edit3
                      size={15}
                      className="me-2"
                    />
                    Edit Client
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(
                        false
                      );

                      setSelectedClient(
                        null
                      );
                    }}
                  >
                    Close
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT CLIENT MODAL
      ===================================================== */}

      {showEditModal &&
        selectedClient && (
          <div
            className="modal d-block"
            tabIndex={-1}
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
                      Edit Client
                    </h5>

                    <div className="small text-secondary">
                      Update client information.
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
                    handleUpdateClient
                  }
                >

                  <div className="modal-body">

                    {editError && (
                      <div className="alert alert-danger">
                        {editError}
                      </div>
                    )}

                    <div className="row g-3">

                      {/* FULL NAME */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.fullName
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "fullName",
                              event.target.value
                            )
                          }
                          required
                        />

                      </div>

                      {/* EMAIL - READ ONLY */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Email
                        </label>

                        <input
                          type="email"
                          className="form-control bg-light"
                          value={
                            selectedClient.email
                          }
                          disabled
                        />

                        <div className="form-text">
                          Email cannot be changed from this screen.
                        </div>

                      </div>

                      {/* COMPANY */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Company Name *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.companyName
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "companyName",
                              event.target.value
                            )
                          }
                          required
                        />

                      </div>

                      {/* PHONE */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Phone Number
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.phoneNumber
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "phoneNumber",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* CITY */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          City
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.city
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "city",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* COUNTRY */}

                      <div className="col-md-6">

                        <label className="form-label fw-semibold">
                          Country
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={
                            editForm.country
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "country",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* ADDRESS */}

                      <div className="col-12">

                        <label className="form-label fw-semibold">
                          Address
                        </label>

                        <textarea
                          className="form-control"
                          rows={3}
                          value={
                            editForm.address
                          }
                          onChange={(event) =>
                            handleEditChange(
                              "address",
                              event.target.value
                            )
                          }
                        />

                      </div>

                      {/* STATUS */}

                      <div className="col-12">

                        <div className="form-check form-switch">

                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="clientActiveSwitch"
                            checked={
                              editForm.isActive
                            }
                            onChange={(event) =>
                              handleEditChange(
                                "isActive",
                                event.target
                                  .checked
                              )
                            }
                          />

                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="clientActiveSwitch"
                          >
                            Active Client
                          </label>

                        </div>

                        <div className="form-text">
                          Inactive clients will not be able to use their account.
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}

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
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
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
