import DOMPurify from "dompurify";

export function renderHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html);
}
