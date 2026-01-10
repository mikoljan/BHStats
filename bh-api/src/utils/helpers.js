import axios from "axios";

export async function loadHtml(url) {
  const response = await axios.get(url);
  return response.data;
}