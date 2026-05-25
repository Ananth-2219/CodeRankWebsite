import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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
  const { data } = await API.delete(`/api/users/${id}`);
  return data;
}

export async function getLeaderboard() {
  const { data } = await API.get("/api/leaderboard");
  return data;
}

export default API;
