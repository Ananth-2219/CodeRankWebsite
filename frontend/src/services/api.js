import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URI || (import.meta.env.DEV ? "http://localhost:5000" : "");

if (!API_BASE_URL) {
  console.error("Missing frontend API base URL. Set VITE_API_URL or VITE_API_URI.");
}

const API = axios.create({
  baseURL: API_BASE_URL,
});

const DELETE_TOKENS_KEY = "codingrank_delete_tokens";

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

export async function deleteUser(id) {
  const deleteToken = getDeleteToken(id);
  const { data } = await API.delete(`/api/users/${id}`, {
    headers: {
      "x-delete-token": deleteToken,
    },
  });
  removeDeleteToken(id);
  return data;
}

export async function getLeaderboard() {
  const { data } = await API.get("/api/leaderboard");
  return data;
}

export function rememberDeleteToken(userId, deleteToken) {
  if (!userId || !deleteToken) return;

  const tokens = readDeleteTokens();
  tokens[userId] = deleteToken;
  writeDeleteTokens(tokens);
}

export function hasDeleteToken(userId) {
  return Boolean(getDeleteToken(userId));
}

function getDeleteToken(userId) {
  return readDeleteTokens()[userId] || "";
}

function removeDeleteToken(userId) {
  const tokens = readDeleteTokens();
  delete tokens[userId];
  writeDeleteTokens(tokens);
}

function readDeleteTokens() {
  try {
    return JSON.parse(window.localStorage.getItem(DELETE_TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeDeleteTokens(tokens) {
  window.localStorage.setItem(DELETE_TOKENS_KEY, JSON.stringify(tokens));
}

export default API;
