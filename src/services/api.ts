const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function handleUnauthorized(): never {
  localStorage.removeItem("mts_token");
  localStorage.removeItem("mts_user");

  sessionStorage.removeItem("mts_token");
  sessionStorage.removeItem("mts_user");

  window.location.href = "/client-login";

  throw new Error("Session expired. Please login again.");
}

export async function getMyProjects() {
  const token = getAuthToken();

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

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to access projects."
      );
    }

    throw new Error(
      "Unable to load projects."
    );
  }

  return await response.json();
}
