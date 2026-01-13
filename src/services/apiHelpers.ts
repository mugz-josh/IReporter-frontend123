const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getJsonHeaders(): HeadersInit {
  return {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
}

export async function fetchGet(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

export async function fetchPost(endpoint: string, body: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function fetchPatch(endpoint: string, body: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PATCH",
    headers: getJsonHeaders(),
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function fetchPut(endpoint: string, body: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: getJsonHeaders(),
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function fetchDelete(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
}

// --- Updated FormData functions ---
export async function fetchPostFormData(
  endpoint: string,
  data: any,
  files: File[] = []
) {
  const formData = new FormData();

  // Append normal fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Separate images and videos
  const images = files.filter((file) => file.type.startsWith("image/"));
  const videos = files.filter((file) => file.type.startsWith("video/"));

  images.forEach((file) => formData.append("images", file));
  videos.forEach((file) => formData.append("videos", file));

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(), // Don't set Content-Type for FormData
    body: formData,
  });
  return response.json();
}

export async function fetchPutFormData(
  endpoint: string,
  data: any,
  files: File[] = []
) {
  const formData = new FormData();

  // Append normal fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Separate images and videos
  const images = files.filter((file) => file.type.startsWith("image/"));
  const videos = files.filter((file) => file.type.startsWith("video/"));

  images.forEach((file) => formData.append("images", file));
  videos.forEach((file) => formData.append("videos", file));

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
  return response.json();
}
