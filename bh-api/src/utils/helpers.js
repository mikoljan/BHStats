import axios from "axios";

export async function loadHtml(url) {
  const response = await axios.get(url);
  return response.data;
}

export function getDivSection(title, $) {
  const titleDiv = $("div.statsTitle").filter((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    return text === title;
  });

  if (!titleDiv.length) {
    return null;
  }

  return titleDiv.next("div");
}