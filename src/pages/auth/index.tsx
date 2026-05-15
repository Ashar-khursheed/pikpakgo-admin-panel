// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Eye, EyeOff, Lock, Mail } from "lucide-react";
// import makeApiRequest from "@/services/axios";
// import { apiUrl } from "@/services/api-end-point";
// import { useAuth } from "@/context/auth";
// import { notify } from "@/utils/utils";

// // Validation Schema
// const validationSchema = Yup.object({
//   email: Yup.string()
//     .email("Invalid email address")
//     .required("Email is required"),
//   password: Yup.string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
// });

// const Authlogin = () => {
//   const { login } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: validationSchema,
//     onSubmit: async (values, { setSubmitting }) => {
//       try {
//         console.log("🔐 Attempting login...");

//         const res = await makeApiRequest(apiUrl.login, {
//           method: "POST",
//           data: values,
//         });

//         console.log("📥 Login Response:", res);

//         // Extract token and user
//         const token =
//           res?.token ||
//           res?.data?.token ||
//           res?.access_token ||
//           res?.data?.access_token;

//         const user = res?.user || res?.data?.user;

//         console.log("🔑 Extracted token:", token);
//         console.log("👤 Extracted user:", user);

//         if (token && user) {
//           // Call login function from context
//           login(user, token);

//           // Show success message
//           notify({ message: "Login Successful", type: 'success' });

//           console.log("✅ About to navigate to dashboard");

//           // Small delay to ensure state is updated
//           setTimeout(() => {
//             navigate("/dashboard");
//           }, 100);
//         } else {
//           console.error("❌ Token or user missing in response");
//           throw new Error("Invalid response: Token or user data missing");
//         }
//       } catch (error: unknown) {
//         console.error("❌ Login failed:", error);

//         let errorMessage = "Login failed. Please try again.";

//         if (error && typeof error === 'object' && 'response' in error) {
//           const response = error.response as { data?: { message?: string } };
//           errorMessage = response.data?.message || errorMessage;
//         }

//         notify({
//           message: errorMessage,
//           type: 'error'
//         });
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
//       <div className="w-full max-w-md">
//         {/* Logo/Brand Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl mb-4 shadow-lg">
//             <Lock className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Welcome Back
//           </h1>
//           <p className="text-gray-600">Sign in to continue to your account</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//           <form onSubmit={formik.handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="email"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Email Address
//               </Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={formik.values.email}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className={`pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
//                     formik.touched.email && formik.errors.email
//                       ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                       : ""
//                   }`}
//                 />
//               </div>
//               {formik.touched.email && formik.errors.email && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {formik.errors.email}
//                 </p>
//               )}
//             </div>

//             {/* Password Field */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="password"
//                 className="text-sm font-medium text-gray-700"
//               >
//                 Password
//               </Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={formik.values.password}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className={`pl-11 pr-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
//                     formik.touched.password && formik.errors.password
//                       ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                       : ""
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {formik.touched.password && formik.errors.password && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {formik.errors.password}
//                 </p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               disabled={formik.isSubmitting}
//               className="w-full h-12 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               {formik.isSubmitting ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Signing in...
//                 </div>
//               ) : (
//                 "Sign In"
//               )}
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Authlogin;

import { useAuth } from "@/context/auth";
import { apiUrl } from "@/services/api-end-point";
import makeApiRequest from "@/services/axios";
import { useAppDispatch } from "@/store/hooks";
import { fetchRolePermissions } from "@/store/slices/role-permissions";
import { setUserProfile } from "@/store/slices/user-profile";
import { notify } from "@/utils/utils";
import { useFormik } from "formik";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

// ─────────────────────────────────────────
// DUMMY JWT GENERATOR (no library needed)
// ─────────────────────────────────────────
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateDummyJWT(payload: object): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  const sig = base64UrlEncode("locksee-dummy-signature-" + Date.now());
  return `${header}.${body}.${sig}`;
}

// ─────────────────────────────────────────
// DUMMY CREDENTIALS
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// ─────────────────────────────────────────
// FLOATING LABEL INPUT
// ─────────────────────────────────────────
function FloatingInput({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon: Icon,
  rightEl,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  touched?: boolean;
  icon: React.ElementType;
  rightEl?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;
  const isErr = touched && !!error;

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Icon */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? "text-[#00a63e]" : "text-gray-400"}`}
        >
          <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur(e);
          }}
          onFocus={() => setFocused(true)}
          autoComplete={type === "password" ? "current-password" : "email"}
          className={`
            peer w-full h-14 pl-11 pr-${rightEl ? "12" : "4"} pt-5 pb-2
            text-[15px] text-gray-900 bg-white rounded-2xl border-2 outline-none
            transition-all duration-200 placeholder-transparent
            ${
              isErr
                ? "border-red-400 focus:border-red-500"
                : focused
                  ? "border-[#00a63e] shadow-[0_0_0_4px_rgba(0,166,62,0.12)]"
                  : "border-gray-200 hover:border-gray-300"
            }
          `}
          placeholder={label}
          style={{ paddingRight: rightEl ? 48 : 16 }}
        />

        {/* Floating label */}
        <label
          htmlFor={id}
          className={`
            absolute left-11 transition-all duration-200 pointer-events-none select-none
            ${
              focused || hasVal
                ? "top-[10px] text-[10.5px] font-semibold tracking-wide " +
                  (isErr ? "text-red-400" : "text-[#00a63e]")
                : "top-1/2 -translate-y-1/2 text-[14px] text-gray-400"
            }
          `}
        >
          {label}
        </label>

        {/* Right element (eye toggle) */}
        {rightEl && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>
      {isErr && (
        <p className="text-[12px] text-red-500 font-medium pl-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const Authlogin = () => {
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
  onSubmit: async (values, { setSubmitting }) => {
  try {
    const res = await makeApiRequest(apiUrl?.login, {
      data: values,
      method: "POST",
    });

    const user = res?.data?.user;
    const token = res?.data?.token;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set profile in Redux from login response (no extra /me call needed)
    dispatch(setUserProfile(user));

    // Immediately fetch role permissions using role_id from login response
    if (user?.role_id) {
      dispatch(fetchRolePermissions(user.role_id));
    }

    login(user, token);

    notify({
      message: `Welcome back, ${user?.first_name} ${user?.last_name}! 👋`,
      type: "success",
    });

    setTimeout(() => navigate("/dashboard"), 150);
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Login failed. Please try again.";

    notify({
      message: msg,
      type: "error",
    });
  } finally {
    setSubmitting(false);
  }
}
  });

  const fillDummy = () => {
    formik.setFieldValue("email", "admin@locksee.app");
    formik.setFieldValue("password", "admin@123");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── LEFT PANEL (branding) ── */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0d1f14 0%, #0a2e1a 60%, #061a0f 100%)",
        }}
      >
        {/* Glow blob */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,166,62,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#00a63e 1px, transparent 1px), linear-gradient(90deg, #00a63e 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top — Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00a63e 0%, #34d068 100%)",
              boxShadow: "0 8px 24px rgba(0,166,62,0.4)",
            }}
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-[17px] text-white tracking-tight">
              PikPakGO
            </p>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Middle — headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00a63e] mb-3">
              PikPakGO Command Center
            </p>
            <h2 className="text-[38px] font-black text-white leading-[1.15] tracking-tight">
              Manage your
              <br />
              <span style={{ color: "#00a63e" }}>Booking  platform</span>
              <br />
              with confidence.
            </h2>
          </div>
          <p className="text-[15px] text-white/50 leading-relaxed max-w-[340px]">
            Monitor key metrics, manage users, and optimize your platform's performance — all from one powerful dashboard.
          </p>

          {/* Stats pills */}
          {/* <div className="flex flex-wrap gap-3 pt-2">
            {[
              { label: "Active Users", value: "74K+" },
              { label: "Messages/Day", value: "2.1M" },
              { label: "Uptime", value: "99.9%" },
            ].map((s, i) => (
              <div
                key={i}
                className="px-4 py-2.5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-[16px] font-black text-white">{s.value}</p>
                <p className="text-[10.5px] text-white/40 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div> */}
        </div>

        {/* Bottom — trust badge */}
        <div className="relative z-10 flex items-center gap-2 text-white/30 text-[12px] invisible">
          <ShieldCheck className="w-4 h-4 text-[#00a63e]/60" />
          <span className="">Secured with end-to-end encryption · Locksee © 2026</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ background: "#FAFAF9" }}
      >
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #00a63e, #34d068)",
              }}
            >
              <MessageCircle
                className="w-4.5 h-4.5 text-white"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <p className="font-extrabold text-[17px] text-gray-900 tracking-tight">
              Locksee Admin
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">
              Sign in to
              <br />
              <span style={{ color: "#00a63e" }}>Admin Panel</span>
            </h1>
            <p className="text-[14px] text-gray-400 mt-2 font-medium">
              Enter your credentials to continue
            </p>
          </div>

        

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <FloatingInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              icon={Mail}
            />

            <FloatingInput
              id="password"
              name="password"
              label="Password"
              type={showPass ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              icon={Lock}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-[52px] mt-2 rounded-2xl font-bold text-[15px] text-white transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: formik.isSubmitting
                  ? "#ccc"
                  : "linear-gradient(135deg, #00a63e 0%, #34d068 100%)",
                boxShadow: formik.isSubmitting
                  ? "none"
                  : "0 8px 24px rgba(0,166,62,0.35)",
                cursor: formik.isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!formik.isSubmitting)
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 12px 32px rgba(0,166,62,0.45)";
              }}
              onMouseLeave={(e) => {
                if (!formik.isSubmitting)
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 24px rgba(0,166,62,0.35)";
              }}
            >
              {formik.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing you in...
                </>
              ) : (
                <>
                  <Lock
                    className="w-4.5 h-4.5"
                    style={{ width: 18, height: 18 }}
                  />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[12px] text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div> */}

          {/* Other demo accounts */}
          {/* <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
              Other Demo Accounts
            </p>
            {DUMMY_ADMINS.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  formik.setFieldValue("email", a.email);
                  formik.setFieldValue("password", a.password);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 text-left"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: i === 0 ? "#00a63e" : "#8E44AD" }}
                >
                  {a.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {a.user.full_name}
                  </p>
                  <p className="text-[11.5px] text-gray-400 truncate">
                    {a.email}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: i === 0 ? "#f0fdf4" : "#F3E5F5",
                    color: i === 0 ? "#00a63e" : "#8E44AD",
                  }}
                >
                  {a.user.role.replace("_", " ")}
                </span>
              </button>
            ))}
          </div> */}

          {/* Footer */}
          {/* <p className="text-center text-[12px] text-gray-400 mt-8">
            Locksee Admin Panel · v2.4.1 ·{" "}
            <span style={{ color: "#00a63e" }}>© 2026</span>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Authlogin;
