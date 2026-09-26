import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { FormEvent, useState } from "react";

interface ProjectInquiryForm {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<ProjectInquiryForm>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectInquiryForm, string>>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    setFormData((current) => ({
      ...current,
      [id]: value,
    }));

    setErrors((current) => ({
      ...current,
      [id]: "",
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const validateForm = () => {
    const newErrors: Partial<
      Record<keyof ProjectInquiryForm, string>
    > = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service.";
    }

    if (!formData.budget) {
      newErrors.budget = "Please select an estimated budget.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please tell us about your project.";
    } else if (formData.message.trim().length < 20) {
      newErrors.message =
        "Project details should contain at least 20 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");

    return (
      atIndex > 0 &&
      dotIndex > atIndex + 1 &&
      dotIndex < email.length - 1
    );
  };

  const isValidPhone = (phone: string) => {
    let digitCount = 0;

    for (let i = 0; i < phone.length; i++) {
      const char = phone[i];

      if (char >= "0" && char <= "9") {
        digitCount++;
      }
    }

    return digitCount >= 10 && digitCount <= 15;
  };

  // const handleSubmit = async (
  //   e: FormEvent<HTMLFormElement>
  // ) => {
  //   e.preventDefault();

  //   setSuccessMessage("");
  //   setErrorMessage("");

  //   if (!validateForm()) {
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);

  //     /*
  //      * Backend API integration will be added after
  //      * confirming the ProjectInquiry DTO.
  //      *
  //      * For now we are validating and preparing
  //      * the form correctly.
  //      */

  //     await new Promise((resolve) =>
  //       setTimeout(resolve, 700)
  //     );

  //     setSuccessMessage(
  //       "Thank you! Your project inquiry has been submitted successfully."
  //     );

  //     setFormData({
  //       fullName: "",
  //       email: "",
  //       phone: "",
  //       company: "",
  //       service: "",
  //       budget: "",
  //       message: "",
  //     });

  //     setErrors({});
  //   } catch {
  //     setErrorMessage(
  //       "Unable to submit your inquiry. Please try again."
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
const handleSubmit = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setSuccessMessage("");
  setErrorMessage("");

  if (!validateForm()) {
    return;
  }

  try {
    setSubmitting(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/ProjectInquiries/public`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim() || null,
          service: formData.service,
          budget: formData.budget || null,
          message: formData.message.trim(),
        }),
      }
    );

    const responseText = await response.text();

    let result: {
      success?: boolean;
      message?: string;
      projectInquiryId?: number;
    } = {};

    try {
      result = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          `Unable to submit inquiry. Status: ${response.status}`
      );
    }

    if (!result.success) {
      throw new Error(
        result.message ||
          "Unable to submit your project inquiry."
      );
    }

    setSuccessMessage(
      result.message ||
        "Thank you! Your project inquiry has been submitted successfully."
    );

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      budget: "",
      message: "",
    });

    setErrors({});
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Unable to submit your inquiry. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="mts-section bg-light">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge text-bg-primary rounded-pill px-3 py-2 mb-3">
                LET'S CONNECT
              </span>

              <h1 className="display-4 fw-bold mb-4">
                Let's Talk About{" "}
                <span className="text-mts">Your Project.</span>
              </h1>

              <p className="lead text-secondary mb-0 mts-max-text">
                Have an idea, a business challenge, or an application that
                needs to be built? Tell us what you're working on and let's
                explore how we can help.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex align-items-center mb-3">
                  
                </div>

                <div className="d-flex align-items-center mb-3">
                  <div className="mts-icon-box me-3">
                    <Phone size={24} />
                  </div>

                  <div>
                    <div className="small text-secondary">
                      Call us
                    </div>

                    <div className="fw-semibold">
                      +91 9696252531
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="mts-icon-box me-3">
                    <MapPin size={24} />
                  </div>

                  <div>
                    <div className="small text-secondary">
                      Location
                    </div>

                    <div className="fw-semibold">
                      India
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT FORM + INFORMATION
      ===================================================== */}
      <section className="mts-section">
        <div className="container">
          <div className="row g-5">
            {/* CONTACT FORM */}
            <div className="col-lg-7">
              <div className="mb-4">
                <h2 className="fw-bold mb-2">
                  Tell Us About Your Project
                </h2>

                <p className="text-secondary mb-0">
                  Share a few details and we'll get back to you to discuss
                  your requirements.
                </p>
              </div>

              {/* SUCCESS MESSAGE */}
              {successMessage && (
                <div
                  className="alert alert-success d-flex align-items-center rounded-3"
                  role="alert"
                >
                  <CheckCircle2
                    size={20}
                    className="me-2 flex-shrink-0"
                  />

                  <span>{successMessage}</span>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {errorMessage && (
                <div
                  className="alert alert-danger rounded-3"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* NAME */}
                  <div className="col-md-6">
                    <label
                      htmlFor="fullName"
                      className="form-label fw-semibold"
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      id="fullName"
                      className={`form-control form-control-lg ${
                        errors.fullName
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Your name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />

                    {errors.fullName && (
                      <div className="invalid-feedback">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="col-md-6">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      id="email"
                      className={`form-control form-control-lg ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />

                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* PHONE */}
                  <div className="col-md-6">
                    <label
                      htmlFor="phone"
                      className="form-label fw-semibold"
                    >
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      id="phone"
                      className={`form-control form-control-lg ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                    {errors.phone && (
                      <div className="invalid-feedback">
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* COMPANY */}
                  <div className="col-md-6">
                    <label
                      htmlFor="company"
                      className="form-label fw-semibold"
                    >
                      Company
                    </label>

                    <input
                      type="text"
                      id="company"
                      className="form-control form-control-lg"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  {/* SERVICE */}
                  <div className="col-md-6">
                    <label
                      htmlFor="service"
                      className="form-label fw-semibold"
                    >
                      Service Required
                    </label>

                    <select
                      id="service"
                      className={`form-select form-select-lg ${
                        errors.service ? "is-invalid" : ""
                      }`}
                      value={formData.service}
                      onChange={handleChange}
                    >
                      <option value="">Select a service</option>

<option value=".NET Development">
  .NET Development
</option>

<option value="React Development">
  React Development
</option>

<option value="Angular Development">
  Angular Development
</option>

<option value="Azure Cloud Solutions">
  Azure Cloud Solutions
</option>

<option value="AI & Machine Learning">
  AI & Machine Learning
</option>

<option value="API & Integration">
  API & Integration
</option>

<option value="Microservices Development">
  Microservices Development
</option>

<option value="Database & SQL">
  Database & SQL
</option>

<option value="Other">
  Other
</option>
                    </select>

                    {errors.service && (
                      <div className="invalid-feedback">
                        {errors.service}
                      </div>
                    )}
                  </div>

                  {/* BUDGET */}
                  <div className="col-md-6">
                    <label
                      htmlFor="budget"
                      className="form-label fw-semibold"
                    >
                      Estimated Budget
                    </label>

                    <select
                      id="budget"
                      className={`form-select form-select-lg ${
                        errors.budget ? "is-invalid" : ""
                      }`}
                      value={formData.budget}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select budget range
                      </option>

                      <option value="under-2">
                        Under ₹2 Lakhs
                      </option>

                      <option value="2-5">
                        ₹2 - ₹5 Lakhs
                      </option>

                      <option value="5-10">
                        ₹5 - ₹10 Lakhs
                      </option>

                      <option value="10-25">
                        ₹10 - ₹25 Lakhs
                      </option>

                      <option value="25-plus">
                        ₹25 Lakhs+
                      </option>

                      <option value="not-sure">
                        Not Sure Yet
                      </option>
                    </select>

                    {errors.budget && (
                      <div className="invalid-feedback">
                        {errors.budget}
                      </div>
                    )}
                  </div>

                  {/* PROJECT DETAILS */}
                  <div className="col-12">
                    <label
                      htmlFor="message"
                      className="form-label fw-semibold"
                    >
                      Project Details
                    </label>

                    <textarea
                      id="message"
                      className={`form-control ${
                        errors.message ? "is-invalid" : ""
                      }`}
                      rows={6}
                      placeholder="Tell us about your project, requirements, timeline, or business challenge..."
                      value={formData.message}
                      onChange={handleChange}
                    />

                    {errors.message && (
                      <div className="invalid-feedback">
                        {errors.message}
                      </div>
                    )}
                  </div>

                  {/* SUBMIT */}
                  <div className="col-12 pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-4"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />

                          Sending...
                        </>
                      ) : (
                        <>
                          <span>
                            Send Project Inquiry
                          </span>

                          <ArrowRight
                            size={18}
                            className="ms-2"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-5">
              <div className="card border-0 bg-light rounded-4 p-4 p-lg-5 h-100">
                <h3 className="fw-bold mb-3">
                  What Happens Next?
                </h3>

                <p className="text-secondary mb-4">
                  We keep the initial conversation simple and focused on
                  understanding your business requirements.
                </p>

                {/* STEP 1 */}
                <div className="d-flex mb-4">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                      }}
                    >
                      1
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      We Review Your Inquiry
                    </h6>

                    <p className="small text-secondary mb-0">
                      Our team reviews your requirements and project goals.
                    </p>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="d-flex mb-4">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                      }}
                    >
                      2
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Discovery Discussion
                    </h6>

                    <p className="small text-secondary mb-0">
                      We connect with you to understand scope, challenges,
                      timeline, and expectations.
                    </p>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="d-flex mb-4">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                      }}
                    >
                      3
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      Project Proposal
                    </h6>

                    <p className="small text-secondary mb-0">
                      We discuss the proposed approach, timeline, and next
                      steps.
                    </p>
                  </div>
                </div>

                <hr />

                {/* BENEFITS */}
                <h6 className="fw-bold mb-3">
                  What We Focus On
                </h6>

                <div className="d-flex align-items-center mb-2">
                  <CheckCircle2
                    size={17}
                    className="text-primary me-2"
                  />

                  <span className="small">
                    Business requirements
                  </span>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <CheckCircle2
                    size={17}
                    className="text-primary me-2"
                  />

                  <span className="small">
                    Scalable architecture
                  </span>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <CheckCircle2
                    size={17}
                    className="text-primary me-2"
                  />

                  <span className="small">
                    Security and quality
                  </span>
                </div>

                <div className="d-flex align-items-center">
                  <CheckCircle2
                    size={17}
                    className="text-primary me-2"
                  />

                  <span className="small">
                    Long-term maintainability
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BUSINESS HOURS
      ===================================================== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="d-flex justify-content-center mb-3">
                <div className="mts-icon-box">
                  <Clock size={24} />
                </div>
              </div>

              <h3 className="fw-bold">
                Let's Build Something Valuable
              </h3>

              <p className="text-secondary mb-2">
                We are available Monday to Friday for project discussions.
              </p>

              <small className="text-secondary">
                Typical response time: within 1 business day.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="py-5 bg-mts-dark text-white">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">
                Have a Project in Mind?
              </h2>

              <p className="text-white-50 mb-0">
                Let's turn your business idea into a reliable digital
                solution.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <a
                href="mailto:agrawaalmanish@gmail.com"
                className="btn btn-light btn-lg px-4"
              >
                Email MTS
                <ArrowRight size={18} className="ms-2" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
