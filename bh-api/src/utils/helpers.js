import axios from "axios";

// Downloads raw HTML for a source page that will be parsed later.
export async function loadHtml(url) {
  const response = await axios.get(url);
  return response.data;
}

// Finds the content block that follows a given Czech statistics section title.
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