import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ClientProfileData {
  userId: number;
  clientId: number;
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

interface ClientProfileResponse {
  success: boolean;
  message: string;
  userId: number;
  clientId: number;
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function ClientProfile() {
  const [profile, setProfile] =
    useState<ClientProfileData | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
        `${API_BASE_URL}/Clients/me`,
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
            "You are not authorized to view this profile."
          );
        }

        throw new Error(
          `Unable to load profile. Status: ${response.status}`
        );
      }

      const result: ClientProfileResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Unable to load profile."
        );
      }

      setProfile({
        userId: result.userId,
        clientId: result.clientId,
        fullName: result.fullName,
        email: result.email,
        companyName: result.companyName,
        phoneNumber: result.phoneNumber,
        address: result.address,
        city: result.city,
        country: result.country,
      });

      const name = splitFullName(result.fullName);

      setFirstName(name.firstName);
      setLastName(name.lastName);

      setEmail(result.email);
      setPhoneNumber(result.phoneNumber ?? "");
      setCompanyName(result.companyName);
      setAddress(result.address ?? "");
      setCity(result.city ?? "");
      setCountry(result.country ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      if (!firstName.trim()) {
        throw new Error("First name is required.");
      }

      if (!companyName.trim()) {
        throw new Error("Company name is required.");
      }

      const fullName =
        `${firstName.trim()} ${lastName.trim()}`.trim();

      const response = await fetch(
        `${API_BASE_URL}/Clients/me`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: fullName,
            companyName: companyName.trim(),
            phoneNumber: phoneNumber.trim() || null,
            address: address.trim() || null,
            city: city.trim() || null,
            country: country.trim() || null,
          }),
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
            "You are not authorized to update this profile."
          );
        }

        const errorResult = await response.json().catch(
          () => null
        );

        throw new Error(
          errorResult?.message ||
            `Unable to update profile. Status: ${response.status}`
        );
      }

      const result: ClientProfileResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Unable to update profile."
        );
      }

      setProfile({
        userId: result.userId,
        clientId: result.clientId,
        fullName: result.fullName,
        email: result.email,
        companyName: result.companyName,
        phoneNumber: result.phoneNumber,
        address: result.address,
        city: result.city,
        country: result.country,
      });

      const updatedName = splitFullName(result.fullName);

      setFirstName(updatedName.firstName);
      setLastName(updatedName.lastName);

      setEmail(result.email);
      setPhoneNumber(result.phoneNumber ?? "");
      setCompanyName(result.companyName);
      setAddress(result.address ?? "");
      setCity(result.city ?? "");
      setCountry(result.country ?? "");

      // Update stored client information
      const storage =
        localStorage.getItem("mts_token")
          ? localStorage
          : sessionStorage;

      const existingUser =
        storage.getItem("mts_user");

      if (existingUser) {
        try {
          const user = JSON.parse(existingUser);

          storage.setItem(
            "mts_user",
            JSON.stringify({
              ...user,
              fullName: result.fullName,
              email: result.email,
            })
          );
        } catch {
          // Ignore invalid stored user data
        }
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main>
        <section className="bg-white border-bottom">
          <div className="container-fluid px-4 py-4">
            <div className="small text-uppercase text-secondary fw-semibold mb-1">
              CLIENT PORTAL
            </div>

            <h1 className="h3 fw-bold mb-1">
              Profile
            </h1>

            <p className="text-secondary mb-0">
              Manage your account and contact information.
            </p>
          </div>
        </section>

        <section className="py-5">
          <div className="container-fluid px-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <div className="text-secondary">
                  Loading profile...
                </div>
              </div>
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
    <main>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="bg-white border-bottom">
        <div className="container-fluid px-4 py-4">
          <div className="small text-uppercase text-secondary fw-semibold mb-1">
            CLIENT PORTAL
          </div>

          <h1 className="h3 fw-bold mb-1">
            Profile
          </h1>

          <p className="text-secondary mb-0">
            Manage your account and contact information.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROFILE CONTENT
      ===================================================== */}

      <section className="py-4">
        <div className="container-fluid px-4">

          {/* SUCCESS */}

          {saved && (
            <div
              className="alert alert-success d-flex align-items-center rounded-4"
              role="alert"
            >
              <CheckCircle2
                size={19}
                className="me-2"
              />

              Profile changes saved successfully.
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className="alert alert-danger rounded-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="row g-4">

            {/* =================================================
                PROFILE SUMMARY
            ================================================= */}

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">

                  <div className="text-center">

                    <div
                      className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        width: "90px",
                        height: "90px",
                      }}
                    >
                      <UserCircle size={52} />
                    </div>

                    <h2 className="h5 fw-bold mb-1">
                      {profile?.fullName || "Client"}
                    </h2>

                    <p className="small text-secondary mb-3">
                      Client Account
                    </p>

                    <span className="badge bg-success-subtle text-success rounded-pill">
                      Active Account
                    </span>

                  </div>

                  <hr className="my-4" />

                  <div className="d-grid gap-3">

                    {/* EMAIL */}

                    <div className="d-flex align-items-center">
                      <Mail
                        size={18}
                        className="text-primary me-3"
                      />

                      <div>
                        <div className="small text-secondary">
                          Email
                        </div>

                        <div className="small fw-semibold">
                          {profile?.email || "-"}
                        </div>
                      </div>
                    </div>

                    {/* PHONE */}

                    <div className="d-flex align-items-center">
                      <Phone
                        size={18}
                        className="text-primary me-3"
                      />

                      <div>
                        <div className="small text-secondary">
                          Phone
                        </div>

                        <div className="small fw-semibold">
                          {profile?.phoneNumber || "-"}
                        </div>
                      </div>
                    </div>

                    {/* COMPANY */}

                    <div className="d-flex align-items-center">
                      <Building2
                        size={18}
                        className="text-primary me-3"
                      />

                      <div>
                        <div className="small text-secondary">
                          Company
                        </div>

                        <div className="small fw-semibold">
                          {profile?.companyName || "-"}
                        </div>
                      </div>
                    </div>

                    {/* LOCATION */}

                    <div className="d-flex align-items-center">
                      <MapPin
                        size={18}
                        className="text-primary me-3"
                      />

                      <div>
                        <div className="small text-secondary">
                          Location
                        </div>

                        <div className="small fw-semibold">
                          {[
                            profile?.city,
                            profile?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* =================================================
                PROFILE FORM
            ================================================= */}

            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5">

                  <div className="mb-4">
                    <h2 className="h5 fw-bold mb-1">
                      Personal Information
                    </h2>

                    <p className="small text-secondary mb-0">
                      Update your basic account information.
                    </p>
                  </div>

                  <div className="row g-4">

                    {/* FIRST NAME */}

                    <div className="col-md-6">
                      <label
                        htmlFor="firstName"
                        className="form-label small fw-semibold"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        className="form-control"
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(e.target.value)
                        }
                      />
                    </div>

                    {/* LAST NAME */}

                    <div className="col-md-6">
                      <label
                        htmlFor="lastName"
                        className="form-label small fw-semibold"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        className="form-control"
                        value={lastName}
                        onChange={(e) =>
                          setLastName(e.target.value)
                        }
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">
                      <label
                        htmlFor="email"
                        className="form-label small fw-semibold"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={email}
                        readOnly
                      />

                      <div className="form-text">
                        Email address cannot be changed here.
                      </div>
                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">
                      <label
                        htmlFor="phone"
                        className="form-label small fw-semibold"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        className="form-control"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value)
                        }
                      />
                    </div>

                    {/* COMPANY */}

                    <div className="col-md-6">
                      <label
                        htmlFor="company"
                        className="form-label small fw-semibold"
                      >
                        Company
                      </label>

                      <input
                        id="company"
                        type="text"
                        className="form-control"
                        value={companyName}
                        onChange={(e) =>
                          setCompanyName(e.target.value)
                        }
                      />
                    </div>

                    {/* CITY */}

                    <div className="col-md-6">
                      <label
                        htmlFor="city"
                        className="form-label small fw-semibold"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        type="text"
                        className="form-control"
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                      />
                    </div>

                    {/* COUNTRY */}

                    <div className="col-md-6">
                      <label
                        htmlFor="country"
                        className="form-label small fw-semibold"
                      >
                        Country
                      </label>

                      <input
                        id="country"
                        type="text"
                        className="form-control"
                        value={country}
                        onChange={(e) =>
                          setCountry(e.target.value)
                        }
                      />
                    </div>

                    {/* ADDRESS */}

                    <div className="col-12">
                      <label
                        htmlFor="address"
                        className="form-label small fw-semibold"
                      >
                        Address
                      </label>

                      <textarea
                        id="address"
                        className="form-control"
                        rows={3}
                        value={address}
                        onChange={(e) =>
                          setAddress(e.target.value)
                        }
                      />
                    </div>

                  </div>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save
                            size={17}
                            className="me-2"
                          />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">

                  <div className="d-flex align-items-start">

                    <div className="mts-icon-box me-3 flex-shrink-0">
                      <ShieldCheck size={22} />
                    </div>

                    <div>
                      <h2 className="h6 fw-bold mb-1">
                        Account Security
                      </h2>

                      <p className="small text-secondary mb-3">
                        Keep your account secure by regularly
                        updating your password.
                      </p>

                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                      >
                        Change Password
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
