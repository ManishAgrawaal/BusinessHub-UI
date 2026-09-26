import { FormEvent, useState } from "react";
import { createProjectInquiry } from "../api/projectsApi";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Paperclip,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NewProject() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    budget: "",
    startDate: "",
    deliveryDate: "",
    description: "",
    requirements: "",
    technologies: [] as string[],
    additionalRequirements: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const technologies = [
    "React",
    "Angular",
    ".NET",
    "Azure",
    "SQL Server",
  ];

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleTechnologyChange(technology: string) {
    setForm((prev) => {
      const exists = prev.technologies.includes(technology);

      return {
        ...prev,
        technologies: exists
          ? prev.technologies.filter(
              (x) => x !== technology
            )
          : [...prev.technologies, technology],
      };
    });
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) {
      return;
    }

    setSelectedFiles(Array.from(files));
  }

async function handleSubmit(
  e: FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  try {
    setSubmitting(true);

    const response = await createProjectInquiry({
      projectName: form.projectName.trim(),
      projectType: form.projectType,
      budget: form.budget || undefined,
      startDate: form.startDate || undefined,
      deliveryDate: form.deliveryDate || undefined,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      technologies: form.technologies,
      additionalRequirements:
        form.additionalRequirements.trim() || undefined,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Unable to submit inquiry."
      );
    }

    setSubmitted(true);
  } catch (error) {
    console.error("Project inquiry submission failed:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Unable to submit project inquiry."
    );
  } finally {
    setSubmitting(false);
  }
}

  if (submitted) {
    return (
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="card border-0 shadow-sm mx-auto"
            style={{ maxWidth: "700px" }}
          >
            <div className="card-body text-center p-5">
              <div
                className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{
                  width: "72px",
                  height: "72px",
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h2 className="fw-bold text-dark">
                Project Inquiry Submitted
              </h2>

              <p className="text-secondary mt-3 mb-4">
                Thank you for sharing your project
                requirements. Our MTS team will review your
                inquiry and get back to you shortly.
              </p>

              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Link
                  to="/client-projects"
                  className="btn btn-outline-primary"
                >
                  Back to Projects
                </Link>

                <Link
                  to="/client-dashboard"
                  className="btn btn-primary"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 py-lg-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <Link
            to="/client-projects"
            className="btn btn-light border me-3"
            title="Back to Projects"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="small text-primary fw-semibold mb-1">
              CLIENT PORTAL
            </div>

            <h2 className="fw-bold mb-1">
              Start a New Project
            </h2>

            <p className="text-secondary mb-0">
              Tell us about your project and our team will
              get in touch with you.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">

            {/* Main Form */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">

                  {/* Project Information */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-1">
                      Project Information
                    </h5>

                    <p className="text-secondary small mb-0">
                      Basic information about your new project.
                    </p>
                  </div>

                  <div className="row g-3">

                    {/* Project Name */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Project Name *
                      </label>

                      <input
                        type="text"
                        name="projectName"
                        value={form.projectName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. Customer Banking Portal"
                        required
                      />
                    </div>

                    {/* Project Type */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Project Type *
                      </label>

                      <select
                        name="projectType"
                        value={form.projectType}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">
                          Select project type
                        </option>

                        <option value="Web Application">
                          Web Application
                        </option>

                        <option value="Mobile Application">
                          Mobile Application
                        </option>

                        <option value="API Development">
                          API Development
                        </option>

                        <option value="E-Commerce">
                          E-Commerce
                        </option>

                        <option value="Enterprise Application">
                          Enterprise Application
                        </option>

                        <option value="Cloud Migration">
                          Cloud Migration
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* Budget */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Estimated Budget
                      </label>

                      <select
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">
                          Select budget range
                        </option>

                        <option value="Below 1 Lakh">
                          Below ₹1 Lakh
                        </option>

                        <option value="1 - 5 Lakh">
                          ₹1 - ₹5 Lakh
                        </option>

                        <option value="5 - 10 Lakh">
                          ₹5 - ₹10 Lakh
                        </option>

                        <option value="10 - 25 Lakh">
                          ₹10 - ₹25 Lakh
                        </option>

                        <option value="25 Lakh+">
                          ₹25 Lakh+
                        </option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Expected Start Date
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <CalendarDays size={17} />
                        </span>

                        <input
                          type="date"
                          name="startDate"
                          value={form.startDate}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Delivery Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Expected Delivery Date
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <CalendarDays size={17} />
                        </span>

                        <input
                          type="date"
                          name="deliveryDate"
                          value={form.deliveryDate}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Project Description *
                      </label>

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="form-control"
                        rows={5}
                        placeholder="Describe what you want to build..."
                        required
                      />
                    </div>

                    {/* Requirements */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Business Requirements *
                      </label>

                      <textarea
                        name="requirements"
                        value={form.requirements}
                        onChange={handleChange}
                        className="form-control"
                        rows={5}
                        placeholder="Explain the main business requirements, users, workflows, etc."
                        required
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Technologies */}
                  <div>
                    <h5 className="fw-bold mb-1">
                      Technology Preference
                    </h5>

                    <p className="text-secondary small mb-3">
                      Select technologies you prefer for this
                      project.
                    </p>

                    <div className="row g-2">
                      {technologies.map((technology) => (
                        <div
                          className="col-sm-6 col-md-4"
                          key={technology}
                        >
                          <div className="form-check border rounded p-3">
                            <input
                              className="form-check-input ms-0 me-2"
                              type="checkbox"
                              id={technology}
                              checked={form.technologies.includes(
                                technology
                              )}
                              onChange={() =>
                                handleTechnologyChange(
                                  technology
                                )
                              }
                            />

                            <label
                              className="form-check-label fw-medium"
                              htmlFor={technology}
                            >
                              {technology}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Additional Requirements */}
                  <div>
                    <label className="form-label fw-semibold">
                      Additional Requirements
                    </label>

                    <textarea
                      name="additionalRequirements"
                      value={
                        form.additionalRequirements
                      }
                      onChange={handleChange}
                      className="form-control"
                      rows={4}
                      placeholder="Anything else we should know?"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="mt-4">
                    <label className="form-label fw-semibold">
                      Attach Documents
                    </label>

                    <div className="border rounded p-4 text-center">
                      <Paperclip
                        size={28}
                        className="text-primary mb-2"
                      />

                      <div className="fw-semibold">
                        Attach project documents
                      </div>

                      <div className="small text-secondary mb-3">
                        Requirements, wireframes,
                        specifications, etc.
                      </div>

                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={handleFileChange}
                      />

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 text-start">
                          <div className="small fw-semibold mb-2">
                            Selected files:
                          </div>

                          {selectedFiles.map(
                            (file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="small text-secondary d-flex align-items-center mb-1"
                              >
                                <FileText
                                  size={14}
                                  className="me-2"
                                />

                                <span>
                                  {file.name}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Link
                      to="/client-projects"
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />

                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send
                            size={17}
                            className="me-2"
                          />

                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="col-lg-4">

              {/* What happens next */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                  <div
                    className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <FileText size={23} />
                  </div>

                  <h5 className="fw-bold">
                    What happens next?
                  </h5>

                  <div className="mt-4">

                    {/* Step 1 */}
                    <div className="d-flex">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        1
                      </div>

                      <div className="ms-3">
                        <div className="fw-semibold">
                          Submit your requirements
                        </div>

                        <div className="small text-secondary">
                          Share your project details with
                          our team.
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="d-flex mt-4">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        2
                      </div>

                      <div className="ms-3">
                        <div className="fw-semibold">
                          MTS reviews the inquiry
                        </div>

                        <div className="small text-secondary">
                          Our team reviews your requirements
                          and scope.
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="d-flex mt-4">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        3
                      </div>

                      <div className="ms-3">
                        <div className="fw-semibold">
                          Proposal & Quote
                        </div>

                        <div className="small text-secondary">
                          We prepare the project proposal
                          and quotation.
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="d-flex mt-4">
                      <div
                        className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        4
                      </div>

                      <div className="ms-3">
                        <div className="fw-semibold">
                          Project starts
                        </div>

                        <div className="small text-secondary">
                          Once approved, the project moves
                          into development.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="card border-0 bg-light">
                <div className="card-body p-4">

                  <h6 className="fw-bold">
                    Need help?
                  </h6>

                  <p className="small text-secondary mb-3">
                    If you are unsure about the requirements,
                    submit what you know and our team can
                    help define the scope.
                  </p>

                  <Link
                    to="/contact"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Contact MTS Team
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}