import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import HomePage from "../pages/HomePage.jsx";
import LeaderboardPage from "../pages/LeaderboardPage.jsx";
import React from "react";

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
