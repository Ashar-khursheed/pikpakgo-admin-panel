import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/auth";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Authlogin from "./pages/auth";
import Dashboard from "./pages/dashboard/Dashboard";
import PropertiesListing from "./pages/properties";
import PropertyDetail from "./pages/properties/get-property-by-id";
import MYProfile from "./pages/settings/profile";
import EditProfile from "./pages/settings/profile/profile-edit";
import ProtectedRoute from "./routes/protected-route";
import PublicRoute from "./routes/public-route";
import PricingMarkupListing from "./pages/pricing-markup";
import AddPricingMarkup from "./pages/pricing-markup/add-pricing-markup";
import ViewPricingMarkup from "./pages/pricing-markup/view-pricing-markup";
import EditPricingMarkup from "./pages/pricing-markup/edit-pricing-markup";
import GetAllUsers from "./pages/users";
import UserDetail from "./pages/users/get-user-by-id";
import ContentCmsListing from "./pages/content-cms";
import AddContent from "./pages/content-cms/add-content";
import ViewContent from "./pages/content-cms/view-content";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-center" reverseOrder={true} />
        <BrowserRouter>
          <Routes>
            {/* Public Route - Login */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Authlogin />
                </PublicRoute>
              }
            />

            {/* Protected Routes — all share the Layout (sidebar) */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/profile" element={<MYProfile />} />
              <Route path="/settings/profile/edit" element={<EditProfile />} />
              <Route path="/get-all-properties-listing" element={<PropertiesListing />} />
              <Route path="/get-all-properties-listing/:id" element={<PropertyDetail />} />
              <Route path="/get-all-pricing-markup" element={<PricingMarkupListing />} />
              <Route path="/get-all-pricing-markup/add" element={<AddPricingMarkup />} />
              <Route path="/get-all-pricing-markup/:id" element={<ViewPricingMarkup />} />
              <Route path="/get-all-pricing-markup/:id/edit" element={<EditPricingMarkup />} />
              <Route path="/get-all-users" element={<GetAllUsers />} />
              <Route path="/get-all-users/:id" element={<UserDetail />} />
              <Route path="/content-cms" element={<ContentCmsListing />} />
              <Route path="/content-cms/add" element={<AddContent />} />
              <Route path="/content-cms/:id" element={<ViewContent />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
