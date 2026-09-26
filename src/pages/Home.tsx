import {
  ArrowRight,
  Code2,
  Cloud,
  Database,
  Layers3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Server,
  Zap,
  LockKeyhole,
  BarChart3,
  Workflow,
} from "lucide-react";

import { Link } from "react-router-dom";

const services = [
  {
    icon: Code2,
    title: ".NET Development",
    description:
      "Secure and scalable ASP.NET Core applications, Web APIs and enterprise solutions.",
    tags: [".NET 10", "C#", "Web API"],
  },
  {
    icon: Code2,
    title: "React Development",
    description:
      "Modern, responsive React applications designed for great user experiences.",
    tags: ["React", "TypeScript", "Bootstrap"],
  },
  {
    icon: Layers3,
    title: "Angular Development",
    description:
      "Enterprise-ready Angular applications with structured architecture and reusable components.",
    tags: ["Angular", "TypeScript", "Enterprise"],
  },
  {
    icon: Cloud,
    title: "Azure Cloud Solutions",
    description:
      "Cloud-ready applications, deployment and scalable solutions using Microsoft Azure.",
    tags: ["Azure", "Cloud", "DevOps"],
  },
];

const technologies = [
  ".NET",
  "ASP.NET Core",
  "C#",
  "React",
  "Angular",
  "TypeScript",
  "SQL Server",
  "Azure",
  "REST API",
  "Microservices",
  "Docker",
  "Git",
];

const process = [
  {
    number: "01",
    title: "Understand",
    description:
      "We understand your business requirements, users and technical challenges.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "We create a practical solution architecture and user experience.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We develop the solution using modern technologies and engineering practices.",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "We test, deploy and continuously improve the solution.",
  },
];

const capabilities = [
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Security-focused APIs, authentication and application architecture.",
  },
  {
    icon: Zap,
    title: "Built for Scale",
    description:
      "Architecture designed to support growing business requirements.",
  },
  {
    icon: Cloud,
    title: "Cloud Ready",
    description:
      "Modern solutions prepared for Azure-based deployment and growth.",
  },
  {
    icon: BarChart3,
    title: "Business Focused",
    description:
      "Technology decisions aligned with real business requirements.",
  },
];

export default function Home() {
  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="position-relative overflow-hidden border-bottom"
        style={{
          background:
            "radial-gradient(circle at 85% 25%, rgba(13,110,253,0.12), transparent 28%), radial-gradient(circle at 15% 70%, rgba(13,202,240,0.08), transparent 25%), linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >

        {/* Background glow */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "420px",
            height: "420px",
            background:
              "rgba(13,110,253,0.06)",
            filter: "blur(60px)",
            top: "-180px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />

        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background:
              "rgba(13,202,240,0.06)",
            filter: "blur(60px)",
            bottom: "-150px",
            left: "-100px",
            pointerEvents: "none",
          }}
        />

        <div className="container position-relative py-5 py-lg-6">

          <div className="row align-items-center g-5">

            {/* =================================================
                HERO LEFT
            ================================================= */}

            <div className="col-lg-6">

              <div className="d-inline-flex align-items-center rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 mb-4">

                <Sparkles
                  size={15}
                  className="me-2"
                />

                <span className="small fw-semibold">
                  SOFTWARE & DIGITAL SOLUTIONS
                </span>

              </div>

              <h1
                className="fw-bold text-dark mb-4"
                style={{
                  fontSize:
                    "clamp(2.7rem, 5vw, 4.6rem)",
                  lineHeight: "1.04",
                  letterSpacing: "-0.04em",
                }}
              >
                Technology That

                <br />

                <span className="text-primary">
                  Moves Your Business
                </span>

                <br />

                Forward.
              </h1>

              <p
                className="text-secondary mb-4"
                style={{
                  maxWidth: "650px",
                  fontSize: "1.15rem",
                  lineHeight: "1.8",
                }}
              >
                Manish Technology Solution helps businesses
                design, build and modernize digital applications
                using .NET, React, Angular and Azure.
              </p>

              {/* CTA */}

              <div className="d-flex flex-wrap gap-3">

                <Link
                  to="/contact"
                  className="btn btn-primary btn-lg px-4 py-3 shadow-sm"
                >
                  Start a Project

                  <ArrowRight
                    size={18}
                    className="ms-2"
                  />
                </Link>

                <Link
                  to="/case-studies"
                  className="btn btn-outline-primary btn-lg px-4 py-3"
                >
                  View Our Work
                </Link>

              </div>

              {/* TECHNOLOGY MINI LIST */}

              <div className="d-flex flex-wrap gap-4 mt-5">

                <div>
                  <strong className="d-block fs-5">
                    .NET
                  </strong>

                  <small className="text-secondary">
                    Backend
                  </small>
                </div>

                <div>
                  <strong className="d-block fs-5">
                    React
                  </strong>

                  <small className="text-secondary">
                    Frontend
                  </small>
                </div>

                <div>
                  <strong className="d-block fs-5">
                    Angular
                  </strong>

                  <small className="text-secondary">
                    Enterprise
                  </small>
                </div>

                <div>
                  <strong className="d-block fs-5">
                    Azure
                  </strong>

                  <small className="text-secondary">
                    Cloud
                  </small>
                </div>

              </div>

            </div>


            {/* =================================================
                HERO RIGHT - ARCHITECTURE CARD
            ================================================= */}

            <div className="col-lg-6">

              <div
                className="position-relative"
                style={{
                  maxWidth: "610px",
                  margin: "0 auto",
                }}
              >

                {/* Glow */}

                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: "280px",
                    height: "280px",
                    background:
                      "rgba(13,110,253,0.14)",
                    filter: "blur(60px)",
                    top: "20%",
                    left: "30%",
                    pointerEvents: "none",
                  }}
                />

                {/* Main card */}

                <div
                  className="card position-relative border-0 shadow-lg rounded-4 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, #172033 0%, #0d1117 100%)",
                  }}
                >

                  {/* Browser bar */}

                  <div
                    className="px-3 py-3 border-bottom"
                    style={{
                      borderColor:
                        "rgba(255,255,255,0.08)",
                    }}
                  >

                    <div className="d-flex align-items-center">

                      <span
                        className="rounded-circle me-1"
                        style={{
                          width: "8px",
                          height: "8px",
                          background:
                            "#ff6b6b",
                        }}
                      />

                      <span
                        className="rounded-circle me-1"
                        style={{
                          width: "8px",
                          height: "8px",
                          background:
                            "#ffd166",
                        }}
                      />

                      <span
                        className="rounded-circle me-2"
                        style={{
                          width: "8px",
                          height: "8px",
                          background:
                            "#06d6a0",
                        }}
                      />

                      <span className="small text-white-50 ms-2">
                        mts-platform
                      </span>

                    </div>

                  </div>

                  <div className="p-4 p-lg-5">

                    {/* Label */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                      <div>

                        <div className="small text-uppercase text-info fw-semibold">
                          Digital Architecture
                        </div>

                        <div className="text-white fw-bold fs-5 mt-1">
                          MTS Solution Stack
                        </div>

                      </div>

                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          background:
                            "rgba(13,110,253,0.18)",
                        }}
                      >
                        <Layers3
                          size={21}
                          className="text-info"
                        />
                      </div>

                    </div>

                    {/* Architecture */}

                    <div className="font-monospace">

                      <div className="text-primary mb-2">
                        &lt;Application&gt;
                      </div>

                      <div className="ps-4 mb-2 text-white">
                        <span className="text-info">
                          Frontend:
                        </span>{" "}
                        React / Angular
                      </div>

                      <div className="ps-4 mb-2 text-white">
                        <span className="text-info">
                          Backend:
                        </span>{" "}
                        .NET / ASP.NET Core
                      </div>

                      <div className="ps-4 mb-2 text-white">
                        <span className="text-info">
                          Data:
                        </span>{" "}
                        SQL Server
                      </div>

                      <div className="ps-4 mb-2 text-white">
                        <span className="text-info">
                          Cloud:
                        </span>{" "}
                        Azure
                      </div>

                      <div className="text-primary">
                        &lt;/Application&gt;
                      </div>

                    </div>

                    {/* Architecture blocks */}

                    <div className="row g-3 mt-4">

                      <div className="col-6">

                        <div
                          className="rounded-3 p-3 h-100"
                          style={{
                            background:
                              "rgba(255,255,255,0.07)",
                            border:
                              "1px solid rgba(255,255,255,0.08)",
                          }}
                        >

                          <Server
                            size={20}
                            className="text-info mb-2"
                          />

                          <small className="text-white-50 d-block">
                            Architecture
                          </small>

                          <strong className="text-white">
                            Scalable
                          </strong>

                        </div>

                      </div>

                      <div className="col-6">

                        <div
                          className="rounded-3 p-3 h-100"
                          style={{
                            background:
                              "rgba(255,255,255,0.07)",
                            border:
                              "1px solid rgba(255,255,255,0.08)",
                          }}
                        >

                          <LockKeyhole
                            size={20}
                            className="text-info mb-2"
                          />

                          <small className="text-white-50 d-block">
                            Security
                          </small>

                          <strong className="text-white">
                            Enterprise
                          </strong>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Floating badge */}

                <div
                  className="position-absolute bg-white rounded-4 shadow-lg p-3 d-none d-md-block"
                  style={{
                    right: "-30px",
                    bottom: "35px",
                    width: "190px",
                  }}
                >

                  <div className="d-flex align-items-center">

                    <div
                      className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      <CheckCircle2
                        size={20}
                        className="text-success"
                      />
                    </div>

                    <div className="ms-2">

                      <div className="small text-secondary">
                        Delivery
                      </div>

                      <div className="fw-bold">
                        Production Ready
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CAPABILITY STRIP
      ===================================================== */}

      <section className="bg-white border-bottom">

        <div className="container py-4">

          <div className="row g-4 text-center">

            <div className="col-6 col-lg-3">

              <div className="fw-bold text-dark">
                Modern Architecture
              </div>

              <div className="small text-secondary mt-1">
                Clean & maintainable
              </div>

            </div>

            <div className="col-6 col-lg-3">

              <div className="fw-bold text-dark">
                Secure Solutions
              </div>

              <div className="small text-secondary mt-1">
                Built with security in mind
              </div>

            </div>

            <div className="col-6 col-lg-3">

              <div className="fw-bold text-dark">
                Cloud Ready
              </div>

              <div className="small text-secondary mt-1">
                Azure compatible
              </div>

            </div>

            <div className="col-6 col-lg-3">

              <div className="fw-bold text-dark">
                End-to-End Delivery
              </div>

              <div className="small text-secondary mt-1">
                Idea to production
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="bg-white">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-end mb-5">

            <div className="col-lg-8">

              <span className="text-primary fw-bold small text-uppercase">
                What We Do
              </span>

              <h2
                className="display-6 fw-bold text-dark mt-2 mb-3"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                Technology That Solves
                <br />

                <span className="text-primary">
                  Business Problems.
                </span>
              </h2>

              <p className="text-secondary mb-0">
                Practical software engineering services for
                businesses looking to build, modernize or scale
                their digital applications.
              </p>

            </div>

            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">

              <Link
                to="/services"
                className="text-primary text-decoration-none fw-semibold"
              >
                Explore all services

                <ArrowRight
                  size={16}
                  className="ms-2"
                />
              </Link>

            </div>

          </div>


          <div className="row g-4">

            {services.map((service) => {

              const Icon = service.icon;

              return (
                <div
                  className="col-md-6 col-xl-3"
                  key={service.title}
                >

                  <div
                    className="card h-100 border-0 rounded-4 shadow-sm"
                    style={{
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >

                    <div className="card-body p-4 p-xl-4">

                      <div
                        className="rounded-4 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-4"
                        style={{
                          width: "54px",
                          height: "54px",
                        }}
                      >
                        <Icon size={25} />
                      </div>

                      <h3 className="h5 fw-bold mb-3">
                        {service.title}
                      </h3>

                      <p className="text-secondary small mb-4">
                        {service.description}
                      </p>

                      <div className="d-flex flex-wrap gap-2">

                        {service.tags.map(
                          (tag) => (
                            <span
                              key={tag}
                              className="badge bg-light text-secondary border fw-normal px-2 py-2"
                            >
                              {tag}
                            </span>
                          )
                        )}

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
          TECHNOLOGY STACK
      ===================================================== */}

      <section
        className="border-top border-bottom"
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #f1f6fc 100%)",
        }}
      >

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-5">

            <div className="col-lg-4">

              <span className="text-primary fw-bold small text-uppercase">
                Technology Stack
              </span>

              <h2
                className="display-6 fw-bold mt-2 mb-3"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                Built With
                <br />

                <span className="text-primary">
                  Modern Technology.
                </span>
              </h2>

              <p className="text-secondary mb-0">
                We choose technologies based on the business
                requirement, scalability and long-term maintainability.
              </p>

            </div>


            <div className="col-lg-8">

              <div className="row g-3">

                {technologies.map(
                  (technology, index) => (

                    <div
                      className="col-6 col-md-4"
                      key={technology}
                    >

                      <div
                        className="bg-white border rounded-4 p-3 h-100 shadow-sm d-flex align-items-center"
                      >

                        <div
                          className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "38px",
                            height: "38px",
                          }}
                        >
                          <Code2
                            size={17}
                          />
                        </div>

                        <span className="fw-semibold small ms-3">
                          {technology}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY MTS
      ===================================================== */}

      <section className="bg-white">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-5">

            {/* LEFT */}

            <div className="col-lg-6">

              <span className="text-primary fw-bold small text-uppercase">
                Why MTS
              </span>

              <h2
                className="display-6 fw-bold mt-2 mb-3"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                Engineering With

                <br />

                <span className="text-primary">
                  Business Thinking.
                </span>
              </h2>

              <p className="text-secondary">
                We focus on building software that solves
                actual business problems instead of adding
                unnecessary technical complexity.
              </p>

              <div className="mt-4">

                {[
                  "Clean and maintainable architecture",
                  "Secure API and application development",
                  "Responsive and user-friendly interfaces",
                  "Cloud-ready application design",
                  "Transparent communication",
                ].map((item) => (

                  <div
                    className="d-flex align-items-center mb-3"
                    key={item}
                  >

                    <div
                      className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "30px",
                        height: "30px",
                      }}
                    >
                      <CheckCircle2
                        size={17}
                        className="text-primary"
                      />
                    </div>

                    <span className="text-secondary ms-3">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* RIGHT */}

            <div className="col-lg-6">

              <div className="row g-3">

                {capabilities.map(
                  (item) => {

                    const Icon =
                      item.icon;

                    return (
                      <div
                        className="col-6"
                        key={item.title}
                      >

                        <div
                          className="card border-0 bg-light rounded-4 p-4 h-100"
                        >

                          <div
                            className="rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center mb-3"
                            style={{
                              width: "48px",
                              height: "48px",
                            }}
                          >

                            <Icon
                              size={22}
                              className="text-primary"
                            />

                          </div>

                          <h3 className="h6 fw-bold">
                            {item.title}
                          </h3>

                          <p className="small text-secondary mb-0">
                            {item.description}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section
        className="border-top"
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >

        <div className="container py-5 py-lg-6">

          <div className="text-center mb-5">

            <span className="text-primary fw-bold small text-uppercase">
              Our Process
            </span>

            <h2
              className="display-6 fw-bold mt-2 mb-3"
              style={{
                letterSpacing: "-0.03em",
              }}
            >
              From Idea to

              <span className="text-primary">
                {" "}Working Solution.
              </span>
            </h2>

            <p
              className="text-secondary mx-auto"
              style={{
                maxWidth: "650px",
              }}
            >
              A simple, transparent and structured approach
              to turn business requirements into reliable
              digital solutions.
            </p>

          </div>


          <div className="row g-4">

            {process.map(
              (item, index) => (

                <div
                  className="col-md-6 col-lg-3"
                  key={item.number}
                >

                  <div className="position-relative h-100">

                    {/* Connector */}

                    {index < process.length - 1 && (
                      <div
                        className="d-none d-lg-block position-absolute"
                        style={{
                          top: "27px",
                          left: "65%",
                          width: "70%",
                          borderTop:
                            "1px dashed #b8c7dc",
                        }}
                      />
                    )}

                    <div
                      className="card position-relative border-0 shadow-sm rounded-4 h-100"
                    >

                      <div className="card-body p-4">

                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mb-4"
                          style={{
                            width: "54px",
                            height: "54px",
                          }}
                        >
                          {item.number}
                        </div>

                        <h3 className="h5 fw-bold">
                          {item.title}
                        </h3>

                        <p className="small text-secondary mb-0">
                          {item.description}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section
        className="position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d6efd 0%, #0757d5 55%, #063da0 100%)",
        }}
      >

        <div
          className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            background:
              "rgba(255,255,255,0.08)",
            filter: "blur(20px)",
            top: "-200px",
            right: "-100px",
          }}
        />

        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background:
              "rgba(255,255,255,0.06)",
            filter: "blur(30px)",
            bottom: "-180px",
            left: "-100px",
          }}
        />

        <div className="container position-relative py-5 py-lg-6">

          <div className="row align-items-center g-4">

            <div className="col-lg-8">

              <span className="text-white-50 fw-bold small text-uppercase">
                Let's Build Together
              </span>

              <h2
                className="display-5 fw-bold text-white mt-2 mb-3"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                Have a Project in Mind?
              </h2>

              <p
                className="text-white-50 mb-0"
                style={{
                  maxWidth: "650px",
                  fontSize: "1.05rem",
                }}
              >
                Tell us about your business requirement and
                let's build a reliable digital solution together.
              </p>

            </div>


            <div className="col-lg-4 text-lg-end">

              <Link
                to="/contact"
                className="btn btn-light btn-lg px-4 py-3 fw-semibold shadow"
              >
                Start Your Project

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