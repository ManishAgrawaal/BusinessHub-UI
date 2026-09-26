import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

// =========================================================
// LAYOUTS / COMPONENTS
// =========================================================

import Header from "./components/Header";
import ClientPortalLayout from "./components/ClientPortalLayout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/Home";
import Services from "./pages/Services";
import CaseStudies from "./pages/CaseStudies";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import ClientLogin from "./pages/ClientLogin";

// =========================================================
// CLIENT PORTAL
// =========================================================

import ClientDashboard from "./pages/ClientDashboard";
import ClientProjects from "./pages/ClientProjects";
import ProjectProgress from "./pages/ProjectProgress";
import Quotes from "./pages/Quotes";
import QuoteDetails from "./pages/QuoteDetails";
import Messages from "./pages/Messages";
import Documents from "./pages/Documents";
import ClientProfile from "./pages/ClientProfile";
import NewProject from "./pages/NewProject";

// =========================================================
// ADMIN PORTAL
// =========================================================

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInquiries from "./pages/AdminInquiries";
import AdminQuotes from "./pages/AdminQuotes";
import AdminMessages from "./pages/AdminMessages";
import AdminClients from "./pages/AdminClients";
import AdminProjects from "./pages/AdminProjects";
import AdminMilestones from "./pages/AdminMilestones";
import AdminDocuments from "./pages/AdminDocuments";

// =========================================================
// PUBLIC PAGE LAYOUT
// =========================================================

function PublicPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

// =========================================================
// CLIENT PAGE LAYOUT
// =========================================================

function ClientPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClientPortalLayout>
      {children}
    </ClientPortalLayout>
  );
}

// =========================================================
// ADMIN PAGE LAYOUT
// =========================================================

function AdminPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}

// =========================================================
// APPLICATION ROUTES
// =========================================================

function App() {
  return (
    <Routes>

      {/* ===================================================
          PUBLIC WEBSITE
      =================================================== */}

      <Route
        path="/"
        element={
          <PublicPage>
            <Home />
          </PublicPage>
        }
      />

      <Route
        path="/services"
        element={
          <PublicPage>
            <Services />
          </PublicPage>
        }
      />

      <Route
        path="/case-studies"
        element={
          <PublicPage>
            <CaseStudies />
          </PublicPage>
        }
      />

      <Route
        path="/about"
        element={
          <PublicPage>
            <AboutUs />
          </PublicPage>
        }
      />

      <Route
        path="/contact"
        element={
          <PublicPage>
            <Contact />
          </PublicPage>
        }
      />

      {/* ===================================================
          CLIENT LOGIN
          Already logged-in Client → Client Dashboard
      =================================================== */}

      <Route
        path="/client-login"
        element={
          <PublicOnlyRoute role="Client">
            <PublicPage>
              <ClientLogin />
            </PublicPage>
          </PublicOnlyRoute>
        }
      />

      {/* ===================================================
          CLIENT PORTAL
      =================================================== */}

      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <ClientDashboard />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-projects"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <ClientProjects />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/project-progress"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <ProjectProgress />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotes"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <Quotes />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quotes/:id"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <QuoteDetails />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <Messages />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <Documents />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-profile"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <ClientProfile />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-project"
        element={
          <ProtectedRoute role="Client">
            <ClientPage>
              <NewProject />
            </ClientPage>
          </ProtectedRoute>
        }
      />

      {/* ===================================================
          ADMIN LOGIN
          Already logged-in Admin → Admin Dashboard
      =================================================== */}

      <Route
        path="/admin-login"
        element={
          <PublicOnlyRoute role="Admin">
            <AdminLogin />
          </PublicOnlyRoute>
        }
      />

      {/* ===================================================
          ADMIN PORTAL
      =================================================== */}

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminDashboard />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-inquiries"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminInquiries />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-clients"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminClients />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-projects"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminProjects />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-milestones"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminMilestones />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-quotes"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminQuotes />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-messages"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminMessages />
            </AdminPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-documents"
        element={
          <ProtectedRoute role="Admin">
            <AdminPage>
              <AdminDocuments />
            </AdminPage>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;