import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function Auth() {
  // This is a mock authentication check - in a real app, you'd check for a valid token or user session
  const isAuthenticated = true; // Mocked as true for demonstration purposes

  // If authenticated, allow access to protected routes via the Outlet
  // Otherwise redirect to login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
