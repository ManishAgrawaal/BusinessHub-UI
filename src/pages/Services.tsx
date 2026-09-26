import {
  ArrowRight,
  Code2,
  Layers3,
  Globe,
  Cloud,
  Bot,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

const services = [
  {
    icon: Code2,
    title: ".NET Development",
    subtitle: "Reliable Backend & API Solutions",
    description:
      "Build secure, maintainable and scalable business applications using C#, ASP.NET Core and Web APIs.",
    features: [
      "ASP.NET Core Web API",
      "C# Application Development",
      "REST API Development",
      "Authentication & Authorization",
      "SQL Server Integration",
    ],
    technologies: [".NET", "C#", "ASP.NET Core", "SQL Server"],
  },
  {
    icon: Code2,
    title: "React Development",
    subtitle: "Modern User Experiences",
    description:
      "Create responsive and modern web applications using React, TypeScript and reusable UI components.",
    features: [
      "React Application Development",
      "TypeScript",
      "Reusable Components",
      "REST API Integration",
      "Responsive UI",
    ],
    technologies: ["React", "TypeScript", "JavaScript", "Bootstrap"],
  },
  {
    icon: Layers3,
    title: "Angular Development",
    subtitle: "Enterprise Web Applications",
    description:
      "Develop structured enterprise applications using Angular with scalable architecture and reusable components.",
    features: [
      "Angular Applications",
      "Component Architecture",
      "Routing & Lazy Loading",
      "Forms & Validation",
      "API Integration",
    ],
    technologies: ["Angular", "TypeScript", "RxJS", ".NET"],
  },
  {
    icon: Globe,
    title: "Web Application Development",
    subtitle: "Business Applications",
    description:
      "Design and develop complete web applications tailored to your business workflows and requirements.",
    features: [
      "Business Applications",
      "Admin Portals",
      "Customer Portals",
      "Dashboard Development",
      "Third-party Integrations",
    ],
    technologies: ["React", "Angular", ".NET", "SQL Server"],
  },
  {
    icon: Cloud,
    title: "Azure Cloud Solutions",
    subtitle: "Cloud-Ready Applications",
    description:
      "Deploy and modernize applications using Microsoft Azure services and cloud-ready architecture.",
    features: [
      "Azure App Services",
      "Azure Functions",
      "Azure Storage",
      "Application Insights",
      "CI/CD Deployment",
    ],
    technologies: ["Azure", "DevOps", "App Service", "Functions"],
  },
  {
    icon: Bot,
    title: "AI & Automation",
    subtitle: "Smarter Business Workflows",
    description:
      "Explore AI-powered features and automation opportunities that can simplify repetitive business processes.",
    features: [
      "AI Integration",
      "Business Automation",
      "Document Processing",
      "Intelligent Workflows",
      "API-based AI Solutions",
    ],
    technologies: ["AI", ".NET", "Azure", "APIs"],
  },
];

export default function Services() {
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
                What We Offer
              </span>

              <h1 className="display-4 fw-bold text-dark mt-3 mb-3">

                Technology Solutions
                <span className="text-primary">
                  {" "}Built for Business Growth
                </span>

              </h1>

              <p className="lead text-secondary mb-4">
                At Manish Technology Solution, we design and develop
                modern digital solutions that help businesses simplify
                operations, improve customer experiences and grow with
                confidence.
              </p>

              <div className="d-flex justify-content-center flex-wrap gap-3">

                <Link
                  to="/contact"
                  className="btn btn-primary btn-lg px-4"
                >
                  Start a Project
                  <ArrowRight
                    size={18}
                    className="ms-2"
                  />
                </Link>

                <Link
                  to="/case-studies"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  View Our Work
                </Link>

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

          <div className="text-center mb-5">

            <span className="text-primary fw-bold small text-uppercase">
              Our Expertise
            </span>

            <h2 className="display-6 fw-bold mt-2">
              Solutions That Move
              <span className="text-primary">
                {" "}Your Business Forward.
              </span>
            </h2>

            <p className="text-secondary mx-auto mts-max-text">
              From backend APIs to modern frontend applications and
              cloud deployment, we provide end-to-end development
              services for digital products.
            </p>

          </div>


          <div className="row g-4">

            {services.map((service) => {

              const Icon = service.icon;

              return (
                <div
                  className="col-md-6 col-xl-4"
                  key={service.title}
                >

                  <div className="card border shadow-sm rounded-4 h-100">

                    <div className="card-body p-4 p-lg-5">

                      <div className="mts-icon-box mb-4">
                        <Icon size={25} />
                      </div>


                      <h3 className="h4 fw-bold mb-2">
                        {service.title}
                      </h3>


                      <p className="text-primary small fw-semibold mb-3">
                        {service.subtitle}
                      </p>


                      <p className="text-secondary small">
                        {service.description}
                      </p>


                      <hr className="my-4" />


                      <h4 className="h6 fw-bold mb-3">
                        What We Deliver
                      </h4>


                      <div>

                        {service.features.map((feature) => (

                          <div
                            className="d-flex align-items-center gap-2 mb-2"
                            key={feature}
                          >

                            <CheckCircle2
                              size={16}
                              className="text-primary flex-shrink-0"
                            />

                            <span className="text-secondary small">
                              {feature}
                            </span>

                          </div>

                        ))}

                      </div>


                      <div className="mt-4">

                        <div className="d-flex flex-wrap gap-2">

                          {service.technologies.map(
                            (technology) => (

                              <span
                                key={technology}
                                className="badge bg-light text-dark border"
                              >
                                {technology}
                              </span>

                            )
                          )}

                        </div>

                      </div>


                      <div className="mt-4">

                        <Link
                          to="/contact"
                          className="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-2"
                        >
                          Discuss Your Requirement
                          <ArrowRight size={15} />
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
          ENGINEERING PRINCIPLES
      ===================================================== */}

      <section className="bg-light border-top border-bottom">

        <div className="container py-5 py-lg-6">

          <div className="row align-items-center g-5">

            <div className="col-lg-5">

              <span className="text-primary fw-bold small text-uppercase">
                Our Approach
              </span>

              <h2 className="display-6 fw-bold mt-2">
                Engineering
                <span className="text-primary">
                  {" "}Principles.
                </span>
              </h2>

              <p className="text-secondary">
                We focus on practical engineering practices that make
                applications easier to maintain, secure and scale.
              </p>

            </div>


            <div className="col-lg-7">

              <div className="row g-3">

                <div className="col-md-6">

                  <div className="card border-0 shadow-sm rounded-4 h-100">

                    <div className="card-body p-4">

                      <ShieldCheck
                        size={28}
                        className="text-primary mb-3"
                      />

                      <h3 className="h5 fw-bold">
                        Security First
                      </h3>

                      <p className="small text-secondary mb-0">
                        Authentication, authorization and secure API
                        development are considered throughout the
                        application lifecycle.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="col-md-6">

                  <div className="card border-0 shadow-sm rounded-4 h-100">

                    <div className="card-body p-4">

                      <Layers3
                        size={28}
                        className="text-primary mb-3"
                      />

                      <h3 className="h5 fw-bold">
                        Maintainable Architecture
                      </h3>

                      <p className="small text-secondary mb-0">
                        Clean structure and reusable components help
                        keep applications easier to understand and
                        maintain.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="col-md-6">

                  <div className="card border-0 shadow-sm rounded-4 h-100">

                    <div className="card-body p-4">

                      <Code2
                        size={28}
                        className="text-primary mb-3"
                      />

                      <h3 className="h5 fw-bold">
                        Quality Code
                      </h3>

                      <p className="small text-secondary mb-0">
                        We aim for readable, testable and reusable
                        code following established engineering
                        practices.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="col-md-6">

                  <div className="card border-0 shadow-sm rounded-4 h-100">

                    <div className="card-body p-4">

                      <Cloud
                        size={28}
                        className="text-primary mb-3"
                      />

                      <h3 className="h5 fw-bold">
                        Cloud Ready
                      </h3>

                      <p className="small text-secondary mb-0">
                        Applications can be designed with modern
                        deployment and cloud infrastructure in mind.
                      </p>

                    </div>

                  </div>

                </div>

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

              <span className="text-white-50 fw-bold small text-uppercase">
                Have a Project?
              </span>

              <h2 className="display-6 fw-bold text-white mt-2">
                Let's Build Something
                <br />
                Meaningful Together.
              </h2>

              <p className="text-white-50 mb-0">
                Share your business requirement with us and let's
                explore the right technology solution.
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