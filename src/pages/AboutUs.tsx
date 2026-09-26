import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Users,
  Target,
  ShieldCheck,
  Cloud,
  Layers3,
} from "lucide-react";

import { Link } from "react-router-dom";

const values = [
  {
    icon: Target,
    title: "Business First",
    description:
      "We start by understanding the business problem before deciding on the technology solution.",
  },
  {
    icon: Code2,
    title: "Quality Engineering",
    description:
      "We focus on clean, maintainable and testable software built using modern engineering practices.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "We work closely with clients throughout the development lifecycle to keep communication transparent.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description:
      "Security is considered across application architecture, APIs, authentication and data handling.",
  },
];

const capabilities = [
  ".NET & ASP.NET Core",
  "React Development",
  "Angular Development",
  "Web Application Development",
  "SQL Server",
  "Microsoft Azure",
  "API & System Integration",
  "AI & Automation",
];

export default function AboutUs() {
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
                About MTS
              </span>

              <h1 className="display-4 fw-bold mt-3 mb-4">
                Building Technology
                <span className="text-primary">
                  {" "}That Creates Business Value.
                </span>
              </h1>

              <p className="lead text-secondary">
                Manish Technology Solution is a software and website
                development company focused on building practical,
                scalable and modern digital solutions for businesses.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHO WE ARE
      ===================================================== */}

      <section className="bg-white">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <span className="text-primary fw-bold small text-uppercase">
                Who We Are
              </span>

              <h2 className="display-6 fw-bold mt-2 mb-4">
                Technology Partner for
                <span className="text-primary">
                  {" "}Modern Businesses.
                </span>
              </h2>

              <p className="text-secondary">
                At Manish Technology Solution, we help businesses
                transform ideas and requirements into working digital
                applications.
              </p>

              <p className="text-secondary">
                Our focus is on full-stack web development, enterprise
                applications, APIs, cloud solutions and modern frontend
                experiences.
              </p>

              <p className="text-secondary mb-0">
                We believe technology should simplify business
                processes, improve customer experiences and provide a
                strong foundation for future growth.
              </p>

            </div>


            <div className="col-lg-6">

              <div className="card border-0 shadow-sm rounded-4 bg-light">

                <div className="card-body p-4 p-lg-5">

                  <div className="d-flex align-items-center gap-3 mb-4">

                    <div className="mts-icon-box">
                      <Layers3 size={25} />
                    </div>

                    <div>

                      <h3 className="h5 fw-bold mb-1">
                        Our Technology Approach
                      </h3>

                      <p className="small text-secondary mb-0">
                        Simple. Scalable. Practical.
                      </p>

                    </div>

                  </div>


                  <div className="row g-3">

                    <div className="col-6">

                      <div className="bg-white rounded-3 p-3 border">

                        <Code2
                          size={22}
                          className="text-primary mb-2"
                        />

                        <strong className="d-block">
                          Full Stack
                        </strong>

                        <small className="text-secondary">
                          End-to-end development
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-white rounded-3 p-3 border">

                        <Cloud
                          size={22}
                          className="text-primary mb-2"
                        />

                        <strong className="d-block">
                          Cloud Ready
                        </strong>

                        <small className="text-secondary">
                          Azure-based solutions
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-white rounded-3 p-3 border">

                        <ShieldCheck
                          size={22}
                          className="text-primary mb-2"
                        />

                        <strong className="d-block">
                          Secure
                        </strong>

                        <small className="text-secondary">
                          Security-focused APIs
                        </small>

                      </div>

                    </div>


                    <div className="col-6">

                      <div className="bg-white rounded-3 p-3 border">

                        <Users
                          size={22}
                          className="text-primary mb-2"
                        />

                        <strong className="d-block">
                          Collaborative
                        </strong>

                        <small className="text-secondary">
                          Client-focused delivery
                        </small>

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
          MISSION
      ===================================================== */}

      <section className="bg-light border-top border-bottom">

        <div className="container py-5 py-lg-6">

          <div className="row justify-content-center text-center">

            <div className="col-lg-8">

              <span className="text-primary fw-bold small text-uppercase">
                Our Mission
              </span>

              <h2 className="display-6 fw-bold mt-2 mb-4">
                Think.
                <span className="text-primary"> Build.</span>
                Grow.
              </h2>

              <p className="lead text-secondary">
                Our mission is to make technology practical and
                accessible for businesses by building reliable digital
                solutions that solve real-world problems.
              </p>

              <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">

                <span className="badge bg-white text-dark border px-3 py-2">
                  THINK
                </span>

                <span className="badge bg-white text-dark border px-3 py-2">
                  BUILD
                </span>

                <span className="badge bg-white text-dark border px-3 py-2">
                  GROW TOGETHER
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="bg-white">

        <div className="container py-5 py-lg-6">

          <div className="text-center mb-5">

            <span className="text-primary fw-bold small text-uppercase">
              What We Believe
            </span>

            <h2 className="display-6 fw-bold mt-2">
              Principles Behind
              <span className="text-primary">
                {" "}Our Work.
              </span>
            </h2>

          </div>


          <div className="row g-4">

            {values.map((value) => {

              const Icon = value.icon;

              return (
                <div
                  className="col-md-6 col-lg-3"
                  key={value.title}
                >

                  <div className="card border shadow-sm rounded-4 h-100">

                    <div className="card-body p-4">

                      <div className="mts-icon-box mb-4">
                        <Icon size={24} />
                      </div>

                      <h3 className="h5 fw-bold">
                        {value.title}
                      </h3>

                      <p className="small text-secondary mb-0">
                        {value.description}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          CAPABILITIES
      ===================================================== */}

      <section className="bg-light">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-5">

            <div className="col-lg-5">

              <span className="text-primary fw-bold small text-uppercase">
                Our Capabilities
              </span>

              <h2 className="display-6 fw-bold mt-2">
                Technology Expertise
                <span className="text-primary">
                  {" "}for Your Projects.
                </span>
              </h2>

              <p className="text-secondary">
                Our technology capabilities cover the complete
                application development lifecycle from frontend
                experiences to backend APIs and cloud deployment.
              </p>

            </div>


            <div className="col-lg-7">

              <div className="row g-3">

                {capabilities.map((capability) => (

                  <div
                    className="col-md-6"
                    key={capability}
                  >

                    <div className="bg-white border rounded-3 p-3 d-flex align-items-center gap-2">

                      <CheckCircle2
                        size={18}
                        className="text-primary flex-shrink-0"
                      />

                      <span className="small fw-semibold">
                        {capability}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

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

              <h2 className="display-6 fw-bold text-white">
                Let's Build Something
                <br />
                Great Together.
              </h2>

              <p className="text-white-50 mb-0">
                Have a business idea or software requirement?
                Let's start a conversation.
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