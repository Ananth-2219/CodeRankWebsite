import axios from "axios";



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export default api;

export async function addUser(usernames) {
  const body = Object.fromEntries(
    Object.entries(usernames)
      .map(([key, value]) => [key, String(value || "").trim()])
      .filter(([, value]) => value),
  );

  const { data } = await api.post("/users/add", body);
  return data;
}

export async function getUsers() {
  const { data } = await api.get("/users");
  return data.users || [];
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

export async function getLeaderboard() {
  const { data } = await api.get("/leaderboard");
  return data;
}

export default api;
