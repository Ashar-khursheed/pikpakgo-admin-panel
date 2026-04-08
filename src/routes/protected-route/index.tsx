import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("🔒 ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("🔒 ProtectedRoute - isLoading:", isLoading);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.warn("⚠️ User not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }
 

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;