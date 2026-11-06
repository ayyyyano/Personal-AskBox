import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

const markdown = new Marked({ breaks: true, gfm: true });

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "a", "abbr", "b", "blockquote", "br", "caption", "code", "dd", "del", "details", "div", "dl", "dt",
    "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "input", "kbd", "li", "ol", "p", "pre",
    "s", "samp", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"],
    ol: ["start"],
    td: [{ name: "align", values: ["left", "center", "right"] }],
    th: [{ name: "align", values: ["left", "center", "right"] }],
    input: ["type", "checked", "disabled"],
  },
  allowedClasses: { code: [/^language-[a-z0-9_-]+$/i] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "svg", "math", "iframe", "object", "template"],
  parseStyleAttributes: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    input: sanitizeHtml.simpleTransform("input", { type: "checkbox", disabled: "disabled" }),
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

export function renderMarkdown(text: string): string {
  return sanitizeHtml(markdown.parse(text, { async: false }), options);
}
