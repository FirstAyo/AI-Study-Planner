import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ authed, children }) {
  return authed ? children : <Navigate to="/login" replace />;
}
