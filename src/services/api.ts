import { Report, User } from "@/types/report";
import {
  getAuthHeaders,
  getJsonHeaders,
  fetchGet,
  fetchPost,
  fetchPatch,
  fetchPut,
  fetchDelete,
  fetchPostFormData,
  fetchPutFormData,
} from "./apiHelpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface ApiResponse<T> {
  status: number;
  data?: T[] | T;
  message?: string;
  error?: string;
}

export const api = {
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return fetchPost("/v1/auth/login", { email, password });
  },

  register: async (userData: Partial<User>): Promise<ApiResponse<any>> => {
    return fetchPost("/v1/auth/signup", userData);
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return fetchGet("/v1/auth/profile");
  },

  updateProfile: async (
    profileData: Partial<User>
  ): Promise<ApiResponse<User>> => {
    return fetchPatch("/v1/auth/profile", profileData);
  },

  uploadProfilePicture: async (file: File): Promise<ApiResponse<{ profile_picture: string }>> => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    const response = await fetch(`${API_URL}/v1/auth/profile/picture`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    return response.json();
  },

  getUsers: async (): Promise<ApiResponse<User>> => {
    return fetchGet("/v1/auth/users");
  },

   getRedFlags: async (): Promise<ApiResponse<any>> => {
    return fetchGet("/v1/red-flags");
  },
 getRedFlag: async (id: string): Promise<ApiResponse<any>> => {
    return fetchGet(`/v1/red-flags/${id}`);
  },

 createRedFlag: async (
    redFlagData: any,
    files: File[] = []
  ): Promise<ApiResponse<any>> => {
    return fetchPostFormData("/v1/red-flags", redFlagData, files);
  },
    
  updateRedFlag: async (
    id: string,
    redFlagData: any,
    files: File[] = []
  ): Promise<ApiResponse<any>> => {
    if (files.length > 0) {
      return fetchPutFormData(`/v1/red-flags/${id}`, redFlagData, files);
    } else {
      return fetchPut(`/v1/red-flags/${id}`, redFlagData);
    }
  },

  updateRedFlagLocation: async (
    id: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any>> => {
    return fetchPatch(`/v1/red-flags/${id}/location`, { latitude, longitude });
  },

  updateRedFlagStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<any>> => {
    return fetchPatch(`/v1/red-flags/${id}/status`, { status });
  },

  deleteRedFlag: async (id: string): Promise<ApiResponse<void>> => {
    return fetchDelete(`/v1/red-flags/${id}`);
  },

  getInterventions: async (): Promise<ApiResponse<any>> => {
    return fetchGet("/v1/interventions");
  },
   
  getIntervention: async (id: string): Promise<ApiResponse<any>> => {
    return fetchGet(`/v1/interventions/${id}`);
  },
  createIntervention: async (
    interventionData: any,
    files: File[] = []
  ): Promise<ApiResponse<any>> => {
    return fetchPostFormData("/v1/interventions", interventionData, files);
  },

  updateIntervention: async (
    id: string,
    interventionData: any,
    files: File[] = []
  ): Promise<ApiResponse<any>> => {
    if (files.length > 0) {
      return fetchPutFormData(
        `/v1/interventions/${id}`,
        interventionData,
        files
      );
    } else {
      return fetchPut(`/v1/interventions/${id}`, interventionData);
    }
  },

  updateInterventionLocation: async (
    id: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any>> => {
    return fetchPatch(`/v1/interventions/${id}/location`, {
      latitude,
      longitude,
    });
  },

  updateInterventionStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<any>> => {
    return fetchPatch(`/v1/interventions/${id}/status`, { status });
  },

  deleteIntervention: async (id: string): Promise<ApiResponse<void>> => {
    return fetchDelete(`/v1/interventions/${id}`);
  },

  getNotifications: async (): Promise<ApiResponse<any>> => {
    return fetchGet("/v1/notifications");
  },

  markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
    return fetchPut("/v1/notifications/read", {});
  },

  getComments: async (reportType: string, reportId: string): Promise<ApiResponse<any>> => {
    return fetchGet(`/v1/${reportType}/${reportId}/comments`);
  },

  addComment: async (reportType: string, reportId: string, commentData: { comment_text: string; comment_type?: string }): Promise<ApiResponse<any>> => {
    return fetchPost(`/v1/${reportType}/${reportId}/comments`, commentData);
  },

  deleteComment: async (commentId: string): Promise<ApiResponse<any>> => {
    return fetchDelete(`/v1/comments/${commentId}`);
  },

  upvoteReport: async (reportType: string, reportId: string): Promise<ApiResponse<any>> => {
    return fetchPost(`/v1/${reportType}/${reportId}/upvotes`, {});
  },

  removeUpvote: async (reportType: string, reportId: string): Promise<ApiResponse<any>> => {
    return fetchDelete(`/v1/${reportType}/${reportId}/upvotes`);
  },

  getUpvotes: async (reportType: string, reportId: string): Promise<ApiResponse<any>> => {
    return fetchGet(`/v1/${reportType}s/${reportId}/upvotes`);
  },

  toggleUpvote: async (reportType: string, reportId: string): Promise<ApiResponse<any>> => {
    return fetchPost(`/v1/${reportType}/${reportId}/toggle-upvote`, {});
  },
};


export const authHelper = {
  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
