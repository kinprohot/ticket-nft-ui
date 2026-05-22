import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { status } = useSelector((state) => state.account);

  return status ? <Outlet /> : <Navigate to="/login" replace />;
}
