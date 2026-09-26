const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =====================================================
// PROJECT MILESTONE
// =====================================================

export interface ProjectMilestone {
  projectMilestoneId: number;
  milestoneName: string;
  description?: string;
  progressPercentage: number;
  status: string;
  plannedDate?: string;
  completedDate?: string;
}

// =====================================================
// CLIENT PROJECT
// =====================================================

export interface ClientProject {
  projectId: number;
  projectName: string;
  description?: string;
  status: string;
  projectAmount?: number;
  startDate?: string;
  expectedEndDate?: string;
  completedDate?: string;
  overallProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  milestones: ProjectMilestone[];
}

// =====================================================
// MY PROJECTS RESPONSE
// =====================================================

export interface MyProjectsResponse {
  success: boolean;
  clientId: number;
  projects: ClientProject[];
}

// =====================================================
// PROJECT INQUIRY REQUEST
// =====================================================

export interface CreateProjectInquiryRequest {
  projectName: string;
  projectType: string;
  budget?: string;
  startDate?: string;
  deliveryDate?: string;
  description: string;
  requirements: string;
  technologies?: string[];
  additionalRequirements?: string;
}

// =====================================================
// PROJECT INQUIRY RESPONSE
// =====================================================

export interface CreateProjectInquiryResponse {
  success: boolean;
  message: string;
  projectInquiryId?: number;
}

// =====================================================
// GET MY PROJECTS
// =====================================================

export async function getMyProjects(): Promise<MyProjectsResponse> {
  const token =
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_BASE_URL}/Projects/my-projects`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data: MyProjectsResponse = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to access projects."
      );
    }

    throw new Error(
      `Unable to load projects. Status: ${response.status}`
    );
  }

  return data;
}

// =====================================================
// CREATE PROJECT INQUIRY
// =====================================================

export async function createProjectInquiry(
  request: CreateProjectInquiryRequest
): Promise<CreateProjectInquiryResponse> {
  const token =
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_BASE_URL}/ProjectInquiries`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  const data =
    await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Session expired. Please login again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to submit an inquiry."
      );
    }

    throw new Error(
      data?.message ||
        `Unable to submit project inquiry. Status: ${response.status}`
    );
  }

  return data;
}
