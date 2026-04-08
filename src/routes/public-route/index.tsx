import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("🔓 PublicRoute - isAuthenticated:", isAuthenticated);
  console.log("🔓 PublicRoute - isLoading:", isLoading);

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

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    console.log("✅ User already authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Render children (login page) if not authenticated
  return <>{children}</>;
};

export default PublicRoute;