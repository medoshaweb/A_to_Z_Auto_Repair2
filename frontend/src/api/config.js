import axios from "axios";

// Get API base URL from environment variable or use default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get tokens from localStorage
    const token = localStorage.getItem("token");
    const customerToken = localStorage.getItem("customerToken");

    // Determine which token to use based on the route
    const url = config.url || "";
    const method = (config.method || "").toLowerCase();

    // Check if this is a customer route that requires customerToken
    // Pattern: /customers/:id/vehicles or /customers/:id/orders
    const isCustomerSpecificRoute = /\/customers\/\d+\/(vehicles|orders)/.test(
      url
    );
    const isCustomerOrderCreate = url === "/orders" && method === "post";
    const isRecommendationRoute = url.includes("/recommendations");
    const isChatbotRoute = url.includes("/chatbot");

    const needsCustomerToken =
      isCustomerSpecificRoute ||
      isCustomerOrderCreate ||
      isRecommendationRoute ||
      isChatbotRoute;

    // Use appropriate token based on route
    if (needsCustomerToken) {
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      } else {
        // Don't add token if customerToken is required but not available
        console.warn(
          "Customer route requires customerToken but none found:",
          url
        );
      }
    } else if (token) {
      // Use admin token for admin routes
      config.headers.Authorization = `Bearer ${token}`;
    } else if (customerToken) {
      // Fallback: use customer token if no admin token
      config.headers.Authorization = `Bearer ${customerToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Don't clear tokens immediately
      // Let the component decide what to do based on the error
      // This prevents race conditions where AdminPrivateRoute redirects before component can handle error
      if (status === 401) {
        console.error("401 Unauthorized - Token may be invalid or expired");
        console.error("Request URL:", error.config?.url);
        console.error("Request method:", error.config?.method);
        // Don't clear tokens here - let the component handle it
        // This prevents AdminPrivateRoute from redirecting before error is shown
      }

      // Return error with original structure preserved
      // This allows components to access error.response.status, error.response.data, etc.
      const errorWithResponse = {
        ...error,
        response: {
          ...error.response,
          status,
          data: data,
        },
        message: data?.message || error.message || "An error occurred",
      };
      return Promise.reject(errorWithResponse);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: null,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: null,
      });
    }
  }
);

export default api;
