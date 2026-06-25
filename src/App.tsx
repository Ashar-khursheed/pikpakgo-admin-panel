import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/auth";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Authlogin from "./pages/auth";
import ManageBlog from "./pages/blog/manage-blog";
import AddBlogPost from "./pages/blog/manage-blog/add-blog-post";
import ViewBlogPost from "./pages/blog/manage-blog/view-blog-post";
import EditBlogPost from "./pages/blog/manage-blog/edit-blog-post";
import ManageBlogCategory from "./pages/blog/manage-blog-category";
import AddBlogCategory from "./pages/blog/manage-blog-category/add-blog-category";
import EditBlogCategory from "./pages/blog/manage-blog-category/edit-blog-category";
import ViewBlogCategory from "./pages/blog/manage-blog-category/view-blog-category";
import ContentCmsListing from "./pages/content-cms";
import AddContent from "./pages/content-cms/add-content";
import EditContent from "./pages/content-cms/edit-content";
import ViewContent from "./pages/content-cms/view-content";
import Dashboard from "./pages/dashboard/Dashboard";
import PricingMarkupListing from "./pages/pricing-markup";
import AddPricingMarkup from "./pages/pricing-markup/add-pricing-markup";
import EditPricingMarkup from "./pages/pricing-markup/edit-pricing-markup";
import ViewPricingMarkup from "./pages/pricing-markup/view-pricing-markup";
import PropertiesListing from "./pages/properties";
import PropertyDetail from "./pages/properties/get-property-by-id";
import PriceMatchClaims from "./pages/claims/PriceMatchClaims";
import SeoManagementListing from "./pages/seo-management";
import AddSeo from "./pages/seo-management/add-seo";
import EditSeo from "./pages/seo-management/edit-seo";
import ViewSeo from "./pages/seo-management/view-seo";
import MYProfile from "./pages/settings/profile";
import EditProfile from "./pages/settings/profile/profile-edit";
import GetAllUsers from "./pages/users";
import UserDetail from "./pages/users/get-user-by-id";
import RolesPermissions from "./pages/roles-permissions";
import AdminSettings from "./pages/admin-settings";
import ProtectedRoute from "./routes/protected-route";
import PublicRoute from "./routes/public-route";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchUserProfile } from "./store/slices/user-profile";
import { fetchRolePermissions } from "./store/slices/role-permissions";
import { store } from "./store/store";

const queryClient = new QueryClient();

// Inner component — inside <Provider> so Redux hooks work correctly
const AppInner = () => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const { profile } = useAppSelector((state) => state.userProfile);
  const { fetched } = useAppSelector((state) => state.rolePermissions);

  // On page refresh: token exists but Redux is empty — re-fetch profile
  useEffect(() => {
    if (token && !profile) {
      dispatch(fetchUserProfile());
    }
  }, [token, profile, dispatch]);

  // After profile loads (from /me on refresh), fetch role permissions if not already fetched
  useEffect(() => {
    if (profile?.role_id && !fetched) {
      dispatch(fetchRolePermissions(profile.role_id));
    }
  }, [profile?.role_id, fetched, dispatch]);

  return (
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
                <Route path="/price-match-claims" element={<PriceMatchClaims />} />
                <Route path="/get-all-pricing-markup" element={<PricingMarkupListing />} />
                <Route path="/get-all-pricing-markup/add" element={<AddPricingMarkup />} />
                <Route path="/get-all-pricing-markup/:id" element={<ViewPricingMarkup />} />
                <Route path="/get-all-pricing-markup/:id/edit" element={<EditPricingMarkup />} />
                <Route path="/get-all-users" element={<GetAllUsers />} />
                <Route path="/get-all-users/:id" element={<UserDetail />} />
                <Route path="/content-cms" element={<ContentCmsListing />} />
                <Route path="/content-cms/add" element={<AddContent />} />
                <Route path="/content-cms/:id" element={<ViewContent />} />
                <Route path="/content-cms/:id/edit" element={<EditContent />} />
                <Route path="/seo-management" element={<SeoManagementListing />} />
                <Route path="/seo-management/add" element={<AddSeo />} />
                <Route path="/seo-management/:id" element={<ViewSeo />} />
                <Route path="/seo-management/:id/edit" element={<EditSeo />} />
                <Route path="/blog/manage-blog-category" element={<ManageBlogCategory />} />
                <Route path="/blog/manage-blog-category/add" element={<AddBlogCategory />} />
                <Route path="/blog/manage-blog-category/:id" element={<ViewBlogCategory />} />
                <Route path="/blog/manage-blog-category/:id/edit" element={<EditBlogCategory />} />
                <Route path="/blog/manage-blog" element={<ManageBlog />} />
                <Route path="/blog/manage-blog/add" element={<AddBlogPost />} />
                <Route path="/blog/manage-blog/:id" element={<ViewBlogPost />} />
                <Route path="/blog/manage-blog/:id/edit" element={<EditBlogPost />} />
                <Route path="/roles-permissions" element={<RolesPermissions />} />
                <Route path="/admin-settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
