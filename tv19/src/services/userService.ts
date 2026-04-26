import axios from "axios";

const API_BASE = "/api";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("tv19_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================================
//  Bookmarks (Save & Read Later)
// ============================================================

export const getBookmarks = async () => {
  const response = await axios.get(`${API_BASE}/user/bookmarks`, {
    headers: getAuthHeaders(),
  });
  return response.data.articles;
};

export const addBookmark = async (articleId: string) => {
  const response = await axios.post(
    `${API_BASE}/user/bookmarks/${articleId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const removeBookmark = async (articleId: string) => {
  const response = await axios.delete(
    `${API_BASE}/user/bookmarks/${articleId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ============================================================
//  Comments (Join the Conversation)
// ============================================================

export interface CommentUser {
  _id: string;
  name: string;
  imageUrl?: string;
}

export interface CommentData {
  _id: string;
  articleId: string;
  userId: CommentUser;
  content: string;
  likes: string[];
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getComments = async (articleId: string): Promise<CommentData[]> => {
  const response = await axios.get(`${API_BASE}/comments/${articleId}`);
  return response.data.comments;
};

export const postComment = async (
  articleId: string,
  content: string,
  parentComment?: string
) => {
  const response = await axios.post(
    `${API_BASE}/comments`,
    { articleId, content, parentComment },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await axios.delete(`${API_BASE}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const likeComment = async (commentId: string) => {
  const response = await axios.post(
    `${API_BASE}/comments/${commentId}/like`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ============================================================
//  Preferences (Personalized Feed)
// ============================================================

export const getPreferences = async () => {
  const response = await axios.get(`${API_BASE}/user/preferences`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updatePreferences = async (categories: string[]) => {
  const response = await axios.put(
    `${API_BASE}/user/preferences`,
    { categories },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getPersonalizedFeed = async (size = 30, skip = 0) => {
  const response = await axios.get(`${API_BASE}/user/feed`, {
    headers: getAuthHeaders(),
    params: { size, skip },
  });
  return response.data;
};

// ============================================================
//  Notifications (Breaking News Alerts)
// ============================================================

export const getNotifications = async () => {
  const response = await axios.get(`${API_BASE}/user/notifications`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateNotifications = async (breakingNews: boolean) => {
  const response = await axios.put(
    `${API_BASE}/user/notifications`,
    { breakingNews },
    { headers: getAuthHeaders() }
  );
  return response.data;
};
