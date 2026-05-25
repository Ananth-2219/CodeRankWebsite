import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URI || (import.meta.env.DEV ? "http://localhost:5000" : "");

if (!API_BASE_URL) {
  console.error("Missing frontend API base URL. Set VITE_API_URL or VITE_API_URI.");
}

const API = axios.create({
  baseURL: API_BASE_URL,
});

const LATEST_ADDED_USER_KEY = "codingrank_latest_added_user";

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API request failed:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  },
);

export async function addUser(usernames) {
  const body = Object.fromEntries(
    Object.entries(usernames)
      .map(([key, value]) => [key, String(value || "").trim()])
      .filter(([, value]) => value),
  );

  const { data } = await API.post("/api/users/add", body);
  return data;
}

export async function getUsers() {
  const { data } = await API.get("/api/users");
  return data.users || [];
}

export async function deleteUser(id, ownerCredentials) {
  const { data } = await API.delete(`/api/users/${id}`, {
    headers: {
      "x-owner-name": ownerCredentials.ownerName,
      "x-owner-secret": ownerCredentials.ownerSecret,
    },
  });
  return data;
}

export async function getLeaderboard() {
  const { data } = await API.get("/api/leaderboard");
  return data;
}

export function rememberLatestAddedUser(userId) {
  if (!userId) return;
  window.localStorage.setItem(LATEST_ADDED_USER_KEY, userId);
}

export function getLatestAddedUser() {
  return window.localStorage.getItem(LATEST_ADDED_USER_KEY) || "";
}

export default API;
