import sanitizeHtml from "sanitize-html";
import { normalizeBlogHtml } from "./normalizeBlogHtml";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "span"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel", "class"],
    img: ["src", "alt", "title", "width", "height", "class"],
    "*": ["class"],
  },
  transformTags: {
    img: (_tagName, attribs) => {
      const src = attribs.src ?? "";
      if (src.toLowerCase().startsWith("data:")) {
        return { tagName: "span", attribs: {}, text: "" };
      }
      return { tagName: "img", attribs };
    },
  },
};

/** Normalize JSON-escaped HTML, then sanitize for safe rendering. */
export function prepareBlogHtml(content: string): string {
  return sanitizeHtml(normalizeBlogHtml(content), SANITIZE_OPTIONS);
}

export { normalizeBlogHtml };
