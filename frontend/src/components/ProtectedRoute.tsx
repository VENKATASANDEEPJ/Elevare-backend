import { useContext } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return null;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
