import { ApiResponse } from "@looking-for-group/shared";

/**
 * Checks env and determines which url to use
 * Exists for tests to inject the url for the test server instance
 * @returns Url base as a string ("/api" | "localhost:port")
 */
const getBaseUrl = (): string => {
  if (import.meta.env.NODE_ENV === "test") {
    if (!window.TEST_API_URL) {
      throw new Error("TEST_API_URL not set");
    }
    return window.TEST_API_URL;
  }
  return "/api";
};

//Basic GET function for utilities
export const GET = async (apiURL: string): Promise<ApiResponse> => {
  try {
    let url = getBaseUrl() + apiURL;
    if (import.meta.env.DEV) url += `?devId=${import.meta.env.VITE_DEV_ID}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const contentType = response.headers.get("content-type") || "";

    //check if response is JSON
    if (contentType.includes("application/json")) {
      //return if json
      return await response.json();
    } else {
      //handle HTML error pages
      const html = await response.text();
      console.error("Expected json but got:", html);
      return {
        data: null,
        error: "Received HTML reponse instead of JSON (Likely broken endpoint)",
        status: response.status,
      };
    }
  } catch (error: unknown) {
    console.error("GET error", error);
    return { data: null, error: (error as TypeError).message || "Unknown error", status: 500 };
  }
};

//Basic POST function
export const POST = async (
  apiURL: string,
  newData: object
): Promise<ApiResponse<unknown>> => {
  const isFormData = newData instanceof FormData;

  try {
    let url = getBaseUrl() + apiURL;
    if (import.meta.env.DEV) url += `?devId=${import.meta.env.VITE_DEV_ID}`;

    const response = await fetch(url, {
      method: "POST",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: isFormData ? newData : JSON.stringify(newData),
    });

    const contentType = response.headers.get("content-type") || "";

    //check if response is JSON
    if (contentType.includes("application/json")) {
      //return if json
      return await response.json();
    } else {
      //handle HTML error pages
      const html = await response.text();
      console.error("Expected json but got:", html);
      return {
        data: null,
        error: "Received HTML reponse instead of JSON (Likely broken endpoint)",
        status: response.status,
      };
    }
  } catch (error: unknown) {
    console.error("GET error", error);
    return { data: null, error: (error as TypeError).message || "Unknown error", status: 500 };
  }
};

//Basic PUT function
export const PUT = async (
  apiURL: string,
  newData: object
): Promise<ApiResponse<unknown>> => {
  const isFormData = newData instanceof FormData;

  try {
    let url = getBaseUrl() + apiURL;
    if (import.meta.env.DEV) url += `?devId=${import.meta.env.VITE_DEV_ID}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: isFormData ? newData : JSON.stringify(newData),
    });

    const contentType = response.headers.get("content-type") || "";

    //check if response is JSON
    if (contentType.includes("application/json")) {
      //return if json
      return await response.json();
    } else {
      //handle HTML error pages
      const html = await response.text();
      console.error("Expected json but got:", html);
      return {
        data: null,
        error: "Received HTML reponse instead of JSON (Likely broken endpoint)",
        status: response.status,
      };
    }
  } catch (error: unknown) {
    console.error("GET error", error);
    return { data: null, error: (error as TypeError).message || "Unknown error", status: 500 };
  }
};

//Basic DELETE function
export const DELETE = async (
  apiURL: string,
  data: object = {}
): Promise<ApiResponse<unknown>> => {
  const isFormData = data instanceof FormData;

  try {
    let url = getBaseUrl() + apiURL;
    if (import.meta.env.DEV) url += `?devId=${import.meta.env.VITE_DEV_ID}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: isFormData ? data : JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type") || "";

    //check if response is JSON
    if (contentType.includes("application/json")) {
      //return if json
      return await response.json();
    } else {
      //handle HTML error pages
      const html = await response.text();
      console.error("Expected json but got:", html);
      return {
        data: null,
        error: "Received HTML reponse instead of JSON (Likely broken endpoint)",
        status: response.status,
      };
    }
  } catch (error: unknown) {
    console.error("GET error", error);
    return { data: null, error: (error as TypeError).message || "Unknown error", status: 500 };
  }
};

//Basic PATCH function
export const PATCH = async (
  apiURL: string,
  newData: object
): Promise<ApiResponse<unknown>> => {
  const isFormData = newData instanceof FormData;

  try {
    let url = getBaseUrl() + apiURL;
    if (import.meta.env.DEV) url += `?devId=${import.meta.env.VITE_DEV_ID}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: isFormData ? newData : JSON.stringify(newData),
    });

    const contentType = response.headers.get("content-type") || "";

    //check if response is JSON
    if (contentType.includes("application/json")) {
      //return if json
      return await response.json();
    } else {
      //handle HTML error pages
      const html = await response.text();
      console.error("Expected json but got:", html);
      return {
        data: null,
        error: "Received HTML reponse instead of JSON (Likely broken endpoint)",
        status: response.status,
      };
    }
  } catch (error: unknown) {
    console.error("GET error", error);
    return { data: null, error: (error as TypeError).message || "Unknown error", status: 500 };
  }
};


//jsonify the data
function jsonify<_data = unknown>(
  data: _data,
  status: number,
  error: string | null = null,
  mimetype = "application/json"
) {
  return {
    status,
    mimetype,
    data,
    error,
  };
}

export default {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  jsonify,
};
