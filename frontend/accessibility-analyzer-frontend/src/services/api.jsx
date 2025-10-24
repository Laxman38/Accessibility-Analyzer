import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({  
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout. Please check your connection and try again."
      );
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred"
    );
  }
);

const scanUrl = async (url) => {
  try {
    const response = await api.post("/scan/url", { url });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to scan URL");
  }
};

const scanHtml = async (html) => {
  try {
    const response = await api.post("/scan/html", { html });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to scan HTML content");
  }
};

const getScanHistory = async () => {
  try {
    const response = await api.get("/scan/history");
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch scan history");
  }
};

const exportReport = async (scanId, format = "pdf") => {
  try {
    const response = await api.get(
      `/scan/export/${scanId}/${format}`,
      { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to export report");
  }
};

const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    throw new Error("API health check failed");
  }
};

export { scanUrl, scanHtml, getScanHistory, exportReport, healthCheck, api }
