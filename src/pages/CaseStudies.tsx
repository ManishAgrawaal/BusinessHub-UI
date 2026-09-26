import { useState } from "react";
import {
  ArrowRight,
  Building2,
  ShoppingCart,
  Users,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { Link } from "react-router-dom";

const caseStudies = [
  {
    category: "Banking",
    icon: Building2,
    title: "Banking Management System",
    description:
      "A sample banking platform designed to demonstrate secure account management, transaction workflows and business operations.",
    challenge:
      "The business required a centralized application to manage customers, accounts and transaction workflows through a reliable digital platform.",
    solution:
      "Designed a full-stack web application using ASP.NET Core Web API with React and SQL Server.",
    features: [
      "Customer & account management",
      "Transaction processing",
      "Role-based access",
      "Dashboard & reporting",
      "Secure REST APIs",
    ],
    technologies: [".NET", "React", "SQL Server", "Azure"],
  },
  {
    category: "E-Commerce",
    icon: ShoppingCart,
    title: "E-Commerce Platform",
    description:
      "A sample e-commerce application demonstrating product management, shopping workflows and a modern customer experience.",
    challenge:
      "The business needed a responsive online platform where customers could browse products and complete their purchasing journey.",
    solution:
      "Built a modern web application using Angular, ASP.NET Core Web API and SQL Server.",
    features: [
      "Product catalog",
      "Shopping cart",
      "Order management",
      "Customer accounts",
      "Admin management",
    ],
    technologies: ["Angular", ".NET", "SQL Server", "Azure"],
  },
  {
    category: "Enterprise",
    icon: Users,
    title: "HR & Payroll Management",
    description:
      "A sample enterprise HR application demonstrating employee, attendance and payroll management workflows.",
    challenge:
      "The organization needed a centralized system to simplify employee management and automate common HR operations.",
    solution:
      "Developed a full-stack business application using React, ASP.NET Core Web API and SQL Server.",
    features: [
      "Employee management",
      "Attendance tracking",
      "Leave management",
      "Payroll workflows",
      "HR dashboard",
    ],
    technologies: ["React", ".NET", "SQL Server", "Azure"],
  },
];

const filters = ["All", "Banking", "E-Commerce", "Enterprise"];

export default function CaseStudies() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects =
    activeFilter === "All"
      ? caseStudies
      : caseStudies.filter(
          (project) => project.category === activeFilter
        );

  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-light border-bottom">
        <div className="container py-5 py-lg-6">

          <div className="row justify-content-center text-center">
            <div className="col-lg-9">

              <span className="text-primary fw-bold small text-uppercase">
                Our Work
              </span>

              <h1 className="display-4 fw-bold text-dark mt-3 mb-3">
                Real Problems.
                <span className="text-primary">
                  {" "}Thoughtful Solutions.
                </span>
              </h1>

              <p className="lead text-secondary mx-auto mb-0">
                Explore sample projects that demonstrate how Manish
                Technology Solution can design and develop modern,
                scalable business applications using .NET, React,
                Angular and Azure.
              </p>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          CASE STUDIES
      ===================================================== */}

      <section className="bg-white">
        <div className="container py-5 py-lg-6">

          {/* Filters */}

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">

            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`btn rounded-pill px-4 fw-semibold ${
                  activeFilter === filter
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}

          </div>


          {/* Projects */}

          <div className="row g-4">

            {filteredProjects.map((project) => {
              const Icon = project.icon;

              return (
                <div
                  className="col-12"
                  key={project.title}
                >

                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

                    {/* =========================================
                        PROJECT PREVIEW
                    ========================================= */}

                    <div className="bg-primary-subtle p-3 p-md-4">

                      <div className="bg-white border rounded-4 shadow-sm overflow-hidden">

                        {/* Browser Bar */}

                        <div className="border-bottom px-3 py-2">

                          <div className="d-flex align-items-center gap-1">

                            <span className="bg-secondary-subtle rounded-circle"
                              style={{
                                width: "8px",
                                height: "8px",
                              }}
                            />

                            <span className="bg-secondary-subtle rounded-circle"
                              style={{
                                width: "8px",
                                height: "8px",
                              }}
                            />

                            <span className="bg-secondary-subtle rounded-circle"
                              style={{
                                width: "8px",
                                height: "8px",
                              }}
                            />

                            <small className="text-secondary ms-2">
                              MTS APPLICATION PREVIEW
                            </small>

                          </div>

                        </div>


                        {/* Dashboard */}

                        <div className="row g-0">

                          {/* Sidebar */}

                          <div className="col-auto d-none d-md-block">

                            <div className="bg-light border-end p-4 h-100">

                              <div className="fw-bold text-primary mb-4">
                                MTS
                              </div>

                              <div className="d-flex flex-column gap-3">

                                <span className="bg-primary-subtle rounded"
                                  style={{
                                    width: "55px",
                                    height: "6px",
                                  }}
                                />

                                <span className="bg-primary-subtle rounded"
                                  style={{
                                    width: "55px",
                                    height: "6px",
                                  }}
                                />

                                <span className="bg-primary-subtle rounded"
                                  style={{
                                    width: "45px",
                                    height: "6px",
                                  }}
                                />

                                <span className="bg-primary-subtle rounded"
                                  style={{
                                    width: "50px",
                                    height: "6px",
                                  }}
                                />

                              </div>

                            </div>

                          </div>


                          {/* Main Dashboard */}

                          <div className="col">

                            <div className="p-3 p-md-4">

                              <div className="d-flex justify-content-between align-items-center">

                                <div>

                                  <small className="text-secondary text-uppercase fw-semibold">
                                    Business Application
                                  </small>

                                  <h5 className="fw-bold mb-0 mt-1">
                                    {project.category}
                                  </h5>

                                </div>

                                <Icon
                                  size={25}
                                  className="text-primary"
                                />

                              </div>


                              {/* Stats */}

                              <div className="row g-2 mt-3">

                                <div className="col-4">

                                  <div className="border rounded-3 p-2 p-md-3">

                                    <small className="text-secondary d-block">
                                      Records
                                    </small>

                                    <strong>
                                      12.5K
                                    </strong>

                                  </div>

                                </div>


                                <div className="col-4">

                                  <div className="border rounded-3 p-2 p-md-3">

                                    <small className="text-secondary d-block">
                                      Active
                                    </small>

                                    <strong>
                                      8.2K
                                    </strong>

                                  </div>

                                </div>


                                <div className="col-4">

                                  <div className="border rounded-3 p-2 p-md-3">

                                    <small className="text-secondary d-block">
                                      Status
                                    </small>

                                    <strong>
                                      Active
                                    </strong>

                                  </div>

                                </div>

                              </div>


                              {/* Chart */}

                              <div className="bg-light rounded-3 mt-3 p-3">

                                <div className="d-flex align-items-end gap-2"
                                  style={{
                                    height: "45px",
                                  }}
                                >

                                  {[35, 55, 45, 75, 60, 85, 70].map(
                                    (height, index) => (
                                      <div
                                        key={index}
                                        className="bg-primary-subtle rounded-top flex-fill"
                                        style={{
                                          height: `${height}%`,
                                        }}
                                      />
                                    )
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* =========================================
                        CONTENT
                    ========================================= */}

                    <div className="card-body p-4 p-lg-5">

                      {/* Category / Icon */}

                      <div className="d-flex justify-content-between align-items-center mb-3">

                        <div
                          className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <Icon size={23} />
                        </div>

                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                          {project.category}
                        </span>

                      </div>


                      <h2 className="h3 fw-bold text-dark">
                        {project.title}
                      </h2>


                      <p className="text-secondary">
                        {project.description}
                      </p>


                      {/* Challenge + Solution */}

                      <div className="row g-3 my-4">

                        <div className="col-md-6">

                          <div className="bg-light border rounded-3 p-4 h-100">

                            <h3 className="h6 fw-bold">
                              Challenge
                            </h3>

                            <p className="text-secondary small mb-0">
                              {project.challenge}
                            </p>

                          </div>

                        </div>


                        <div className="col-md-6">

                          <div className="bg-light border rounded-3 p-4 h-100">

                            <h3 className="h6 fw-bold">
                              Solution
                            </h3>

                            <p className="text-secondary small mb-0">
                              {project.solution}
                            </p>

                          </div>

                        </div>

                      </div>


                      {/* Features */}

                      <div className="mb-4">

                        <h3 className="h6 fw-bold mb-3">
                          Key Features
                        </h3>

                        <div className="row g-2">

                          {project.features.map((feature) => (

                            <div
                              className="col-md-6"
                              key={feature}
                            >

                              <div className="d-flex align-items-center gap-2 text-secondary small">

                                <CheckCircle2
                                  size={17}
                                  className="text-primary flex-shrink-0"
                                />

                                <span>
                                  {feature}
                                </span>

                              </div>

                            </div>

                          ))}

                        </div>

                      </div>


                      {/* Technology */}

                      <div className="border-top pt-4">

                        <div className="d-flex align-items-center gap-2 mb-3">

                          <Code2
                            size={18}
                            className="text-primary"
                          />

                          <strong>
                            Technology
                          </strong>

                        </div>


                        <div className="d-flex flex-wrap gap-2">

                          {project.technologies.map(
                            (technology) => (

                              <span
                                key={technology}
                                className="badge bg-light text-dark border px-3 py-2"
                              >
                                {technology}
                              </span>

                            )
                          )}

                        </div>

                      </div>


                      {/* Link */}

                      <div className="mt-4">

                        <Link
                          to="/contact"
                          className="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-2"
                        >
                          Discuss a Similar Project
                          <ArrowRight size={16} />
                        </Link>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-primary">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-4">

            <div className="col-lg-8">

              <span className="text-white-50 fw-bold small text-uppercase">
                Have an Idea?
              </span>

              <h2 className="display-6 fw-bold text-white mt-2 mb-3">
                Let's Build Your Next Project.
              </h2>

              <p className="text-white-50 mb-0">
                Tell us about your business requirement and let's
                explore how technology can turn your idea into a
                working solution.
              </p>

            </div>


            <div className="col-lg-4 text-lg-end">

              <Link
                to="/contact"
                className="btn btn-light btn-lg px-4 fw-semibold"
              >
                Start a Project
                <ArrowRight
                  size={18}
                  className="ms-2"
                />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}