export const API_BASE_URL = "http://localhost:3000/api";

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(${API_BASE_URL});
  if (!response.ok) {
    throw new Error("API request failed");
  }
  return response.json();
};
