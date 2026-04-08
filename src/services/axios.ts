
// // import { useLocalStorage } from "@/hooks/useLocalStorage";
// // import { notify } from "@/utils/utils";
// // import axios from "axios";


// // // Create Axios instance
// // const axiosInstance = axios.create({
// //   // baseURL: process.env.NEXT_PUBLIC_BASE_URL ,
// //   baseURL: "https://careapi.in-sourceit.com/api/v1" ,
// //   // withCredentials: true,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },

// // });

// // // Function to log the user out
// // const logOut = () => {
// //   localStorage.clear(); // Clear local storage (or session storage if used)
// //   window.location.href = "/"; // Redirect to login page
// // };

// // // Add an interceptor to handle token expiration
// // axiosInstance.interceptors.response.use(
// //   (response) => {
// //     // If the response is successful, return it as is
// //     return response;
// //   },
// //   (error) => {
// //     // If the response indicates token expiration (401), log out
// //     if (error.response && error.response.status === 401) {
// //       logOut();
// //     }
// //     // Re-throw the error for further handling
// //     return Promise.reject(error);
// //   }
// // );

// // // Generic API request function
// // interface ApiRequestOptions {
// //   method?: string;
// //   data?: unknown;
// //   headers?: Record<string, string>;
// // }

// // const makeApiRequest = async (url: string, options: ApiRequestOptions = {}) => {
// //   const { method = "GET", data = null, headers: customHeaders = {} } = options;
// //   const authToken = localStorage.getItem("authToken");
// // const headers = {
// //     "Content-Type": "application/json",
// //     ...customHeaders,
// //     Authorization: authToken && `Bearer ${authToken}`,
// //   };
// //   try {
// //     const response = await axiosInstance({
// //       url,
// //       method: method.toLowerCase(),
// //       ...(data && { data }),
// //       // ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
// //       headers,
// //     });


// //     // notify({ message: response.response?.data?.message || response.message, type: "error" });
// //     return response.data; // Return only the data from the response
// //   } catch (error: unknown) {
// //     const errorMessage = axios.isAxiosError(error) 
// //       ? error.response?.data?.message || error.message 
// //       : 'An unexpected error occurred';

// //     console.error("API Error:", errorMessage);
// //     notify({ message: errorMessage, type: "error" });
// //     return Promise.reject(errorMessage);
// //   }
// // };
// // // const makeApiRequest = async (url: string, options: ApiRequestOptions = {}) => {
// // //   const { method = "GET", data = null, headers = {} } = options;

// // //   // ✅ Automatically set headers based on data type
// // //   const isFormData = data instanceof FormData;
// // //   const finalHeaders = {
// // //     ...headers,
// // //     ...(isFormData ? {} : { "Content-Type": "application/json" }), // ❌ No need for multipart header
// // //   };

// // //   try {
// // //     const response = await axiosInstance({
// // //       url,
// // //       method: method.toLowerCase(),
// // //       data,
// // //       headers: finalHeaders,
// // //     });

// // //     return response.data; // ✅ Return only necessary data
// // //   } catch (error: any) {
// // //     console.error("API Error:", error);
// // //     return Promise.reject(error.response?.data?.message || error.message);
// // //   }
// // // };


// // export default makeApiRequest;

// import { notify } from "@/utils/utils";
// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// // Create Axios instance
// const axiosInstance = axios.create({
//   baseURL: "https://careapi.in-sourceit.com/api/v1",
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

// // Function to get token from localStorage
// const getAuthToken = (): string | null => {
//   const token = localStorage.getItem("token");
//   console.log("🔑 Retrieved token:", token ? "Token exists" : "No token found");
//   return token;
// };

// // Function to set token in localStorage
// export const setAuthToken = (token: string) => {
//   localStorage.setItem("token", token);
//   console.log("✅ Token saved to localStorage");
// };

// // Function to remove token from localStorage
// export const removeAuthToken = () => {
//   localStorage.removeItem("token");
//   console.log("🗑️ Token removed from localStorage");
// };

// // Function to log the user out
// const logOut = () => {
//   removeAuthToken();
//   localStorage.clear();
//   window.location.href = "/";
// };

// // Request interceptor - Automatically add Bearer token to all requests
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = getAuthToken();

//     console.log("📤 Request to:", config.url);

//     // Agar token hai toh Authorization header add karo
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log("✅ Authorization header added");
//     } else {
//       console.warn("⚠️ No token available for request");
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle token expiration
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error: AxiosError) => {
//     // If token expired (401), logout
//     if (error.response && error.response.status === 401) {
//       notify({ message: "Session expired. Please login again.", type: "error" });
//     //   logOut();
//     }
//     return Promise.reject(error);
//   }
// );

// // Generic API request function
// interface ApiRequestOptions {
//   method?: string;
//   data?: unknown;
//   headers?: Record<string, string>;
// }

// const makeApiRequest = async (url: string, options: ApiRequestOptions = {}) => {
//   const { method = "GET", data = null, headers: customHeaders = {} } = options;

//   // Check if data is FormData
//   const isFormData = data instanceof FormData;

//   // Prepare headers
//   const headers: Record<string, string> = {
//     ...(isFormData ? {} : { "Content-Type": "application/json" }),
//     ...customHeaders,
//   };

//   try {
//     const response = await axiosInstance({
//       url,
//       method: method.toLowerCase(),
//       ...(data && { data }),
//       headers,
//     });

//     return response.data;
//   } catch (error: unknown) {
//     const errorMessage = axios.isAxiosError(error)
//       ? error.response?.data?.message || error.message
//       : "An unexpected error occurred";

//     console.error("API Error:", errorMessage);

//     // Don't show notification for 401 (already handled in interceptor)
//     if (!axios.isAxiosError(error) || error.response?.status !== 401) {
//       notify({ message: errorMessage, type: "error" });
//     }

//     return Promise.reject(error);
//   }
// };

// export default makeApiRequest;
// // export { getAuthToken, setAuthToken, removeAuthToken };
// // import { notify } from "@/utils/utils";
// // import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// // // Create Axios instance
// // const axiosInstance = axios.create({
// //   baseURL: "https://careapi.in-sourceit.com/api/v1",
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// // // Helper function to get token
// // const getAuthToken = (): string | null => {
// //   return localStorage.getItem("token"); // Ya "authToken"
// // };

// // // Function to log the user out
// // const logOut = () => {
// //   localStorage.clear();
// //   window.location.href = "/login";
// // };

// // // Request interceptor - Add token automatically
// // axiosInstance.interceptors.request.use(
// //   (config: InternalAxiosRequestConfig) => {
// //     const token = getAuthToken();

// //     if (token && config.headers) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }

// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor - Handle errors
// // // axiosInstance.interceptors.response.use(
// // //   (response) => {
// // //     // Success response
// // //     return response;
// // //   },
// // //   (error: AxiosError<{ message?: string }>) => {
// // //     // Handle 401 Unauthorized
// // //     if (error.response?.status === 401) {
// // //       notify({ message: "Session expired. Please login again.", type: "error" });
// // //       logOut();
// // //       return Promise.reject(error);
// // //     }

// // //     // Handle 403 Forbidden
// // //     if (error.response?.status === 403) {
// // //       notify({ message: "You don't have permission to access this resource.", type: "error" });
// // //     }

// // //     // Handle 404 Not Found
// // //     if (error.response?.status === 404) {
// // //       notify({ message: "Resource not found.", type: "error" });
// // //     }

// // //     // Handle 500 Server Error
// // //     if (error.response?.status === 500) {
// // //       notify({ message: "Server error. Please try again later.", type: "error" });
// // //     }

// // //     return Promise.reject(error);
// // //   }
// // // );

// // // Generic API request function
// // interface ApiRequestOptions {
// //   method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
// //   data?: unknown;
// //   headers?: Record<string, string>;
// // }

// // const makeApiRequest = async <T = unknown>(
// //   url: string,
// //   options: ApiRequestOptions = {}
// // ): Promise<T> => {
// //   const { method = "GET", data = null, headers = {} } = options;

// //   // Check if data is FormData
// //   const isFormData = data instanceof FormData;

// //   // Merge headers
// //   const finalHeaders: Record<string, string> = {
// //     ...headers,
// //     ...(isFormData ? {} : { "Content-Type": "application/json" }),
// //   };

// //   try {
// //     const response = await axiosInstance({
// //       url,
// //       method: method.toLowerCase(),
// //       ...(data && { data }),
// //       headers: finalHeaders,
// //     });

// //     return response.data;
// //   } catch (error: unknown) {
// //     const errorMessage = axios.isAxiosError(error)
// //       ? error.response?.data?.message || error.message
// //       : "An unexpected error occurred";

// //     console.error("API Error:", errorMessage);

// //     // Only show notification if not 401 (already handled in interceptor)
// //     if (!axios.isAxiosError(error) || error.response?.status !== 401) {
// //       notify({ message: errorMessage, type: "error" });
// //     }

// //     throw error; // Throw error instead of Promise.reject for better error handling
// //   }
// // };

// // export default makeApiRequest;





import { notify } from "@/utils/utils";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://pickpackgo.in-sourceit.com/api/",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Function to get token from localStorage
const getAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn(" No token found in localStorage");
      return null;
    }

    // Remove any extra quotes or whitespace
    const cleanToken = token.trim().replace(/^["']|["']$/g, '');


    return cleanToken;
  } catch (error) {
    console.error("❌ Error reading token from localStorage:", error);
    return null;
  }
};

// Function to set token in localStorage
export const setAuthToken = (token: string) => {
  try {
    if (!token) {
      console.error("❌ Cannot set empty token");
      return;
    }

    // Remove any existing quotes and trim
    const cleanToken = token.trim().replace(/^["']|["']$/g, '');
    localStorage.setItem("token", cleanToken);


    // Verify it was saved
    const savedToken = localStorage.getItem("token");
  } catch (error) {
    console.error("❌ Error saving token to localStorage:", error);
  }
};

// Function to remove token from localStorage
export const removeAuthToken = () => {
  try {
    localStorage.removeItem("token");
    console.log(" Token removed from localStorage");
  } catch (error) {
    console.error(" Error removing token:", error);
  }
};

// Function to log the user out
const logOut = () => {
  removeAuthToken();
  localStorage.clear();
  window.location.href = "/";
  notify({ message: "You have been logged out.", type: "error" });
};

// Request interceptor - Automatically add Bearer token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {} as InternalAxiosRequestConfig['headers'];
      }

      config.headers.Authorization = `Bearer ${token}`;
    } else {

      console.log(" Tip: Make sure you're logged in and token is saved");
    }

    return config;
  },
  (error) => {
    console.error(" Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    // Response received
    return response;
  },
  (error: AxiosError) => {
    console.error(" Response error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });

    // If token expired (401), logout
    if (error.response?.status === 401) {
      console.error(" Unauthorized - Token may be invalid or expired");
      notify({ message: "Session expired. Please login again.", type: "error" });
      logOut();
    }

    return Promise.reject(error);
  }
);

// Generic API request function
interface ApiRequestOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

const makeApiRequest = async <T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { method = "GET", data = null, headers: customHeaders = {} } = options;

  // Check if data is FormData
  const isFormData = data instanceof FormData;

  // Prepare headers
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  try {
    const response = await axiosInstance({
      url,
      method: method.toLowerCase(),
      ...(data && { data }),
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : "An unexpected error occurred";

    console.error(" API Error:", {
      url,
      message: errorMessage,
      status: axios.isAxiosError(error) ? error.response?.status : 'unknown'
    });

    // Don't show notification for 401 (already handled in interceptor)
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      notify({ message: errorMessage, type: "error" });
    }

    return Promise.reject(error);
  }
};

export default makeApiRequest;



















