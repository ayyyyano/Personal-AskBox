import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { Parser } from "htmlparser2";
import { MarkdownContent } from "../components/MarkdownContent";
import { renderMarkdown } from "../lib/markdown";

function attributesFor(html: string, tagName: string): Record<string, string>[] {
  const matches: Record<string, string>[] = [];
  new Parser({ onopentag: (name, attributes) => { if (name === tagName) matches.push(attributes); } }).end(html);
  return matches;
}

const unsafeHtml = [
  '<img src="/missing.png" onerror="alert(1)">',
  '<a href="https://example.com" onclick="alert(1)">link</a>',
  '<div onpointerover="alert(1)" style="position:fixed" id="askbox" name="location">text</div>',
  '<script>alert(1)</script>after',
  '<iframe srcdoc="<script>alert(1)</script>" src="https://example.com"></iframe>',
  '<object data="data:text/html,attack"></object><embed src="data:text/html,attack">',
  '<svg><a xlink:href="javascript:alert(1)">svg</a><animate onbegin="alert(1)"></animate></svg>',
  '<math><mtext><img src="/missing" onerror="alert(1)"></mtext></math>',
  '<form action="https://example.com"><button formaction="javascript:alert(1)">submit</button></form>',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(1)"><base href="https://example.com"><link rel="stylesheet" href="https://example.com/style.css">',
  '<style>body{display:none}</style><p style="background:url(javascript:alert(1))">text</p>',
  '<img src="/safe.png" srcset="/one.png 1x, javascript:alert(1) 2x" onload="alert(1)">',
  '<details open ontoggle="alert(1)"><summary>details</summary>text</details>',
  '<svg></p><style><g title="</style><img src=x onerror=alert(1)>">',
  '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=alert(1)>">',
];

for (const [index, input] of unsafeHtml.entries()) {
  test(`Markdown strips active HTML payload ${index + 1}`, () => {
    const html = renderMarkdown(input);
    assert.doesNotMatch(html, /<(?:script|iframe|object|embed|svg|math|animate|form|button|meta|base|link|style)\b/i);
    assert.doesNotMatch(html, /\s(?:on\w+|style|srcdoc|srcset|id|name|formaction|xlink:href)\s*=/i);
    assert.doesNotMatch(html, /alert\(1\)/i);
  });
}

const unsafeUrls = [
  "javascript:alert(1)", "JaVaScRiPt:alert(1)", "jav&#x61;script:alert(1)",
  "java&#9;script:alert(1)", "java&#10;script:alert(1)", "&#106;avascript:alert(1)",
  "vbscript:msgbox(1)", "data:text/html;base64,PHNjcmlwdD4=", "file:///etc/passwd",
  "//example.com/remote",
];

for (const [index, url] of unsafeUrls.entries()) {
  test(`Markdown removes unsafe link and image URL ${index + 1}`, () => {
    const html = renderMarkdown(`<a href="${url}">label</a><img src="${url}">`);
    assert.doesNotMatch(html, /\shref\s*=/i);
    assert.doesNotMatch(html, /<img\b/i);
    assert.match(html, /label/);
  });
}

test("Markdown syntax cannot bypass URL filtering", () => {
  const html = renderMarkdown('[link](javascript:alert%281%29) ![image](data:image/svg+xml;base64,PHN2Zz4=)');
  assert.doesNotMatch(html, /\s(?:href|src)\s*=/i);
});

test("safe links preserve destinations and force safe new-tab attributes", () => {
  for (const url of ["https://example.com/path", "http://example.com", "/?q=test#display", "../relative", "#section", "mailto:hello@example.com"]) {
    const html = renderMarkdown(`<a href="${url}" target="_self" rel="opener">label</a>`);
    assert.ok(html.includes(`href="${url}"`));
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
  }
});

test("link titles containing quotes cannot inject attributes", () => {
  const html = renderMarkdown('[link](https://example.com "&quot; onmouseover=&quot;alert(1)")');
  const [link] = attributesFor(html, "a");
  assert.equal(link.href, "https://example.com");
  assert.equal(link.title, '" onmouseover="alert(1)');
  assert.deepEqual(Object.keys(link).sort(), ["href", "rel", "target", "title"]);
});

test("safe Markdown images preserve HTTP and local attachment URLs", () => {
  for (const url of ["https://example.com/photo.png", "http://example.com/photo.png", "/api/questions/fixture/attachment"]) {
    const html = renderMarkdown(`![图片](${url} "图片说明")`);
    assert.ok(html.includes(`src="${url}"`));
    assert.match(html, /alt="图片"/);
    assert.match(html, /title="图片说明"/);
  }
  assert.doesNotMatch(renderMarkdown('<img src="mailto:hello@example.com">'), /<img\b/);
});

test("Markdown preserves headings, emphasis, lists, quotes, tables and line breaks", () => {
  const html = renderMarkdown('# 标题\n\n**加粗** *斜体* ~~删除线~~\n下一行\n\n- 项目\n\n> 引用\n\n| 名称 | 内容 |\n| :--- | ---: |\n| 示例 | 表格 |');
  for (const tag of ["h1", "strong", "em", "del", "br", "ul", "li", "blockquote", "table", "thead", "tbody", "th", "td"]) {
    assert.match(html, new RegExp(`<${tag}(?:\\s|/?>)`));
  }
  assert.match(html, /align="right"/);
});

test("code fences display payloads as text and retain language classes", () => {
  const html = renderMarkdown('```html\n<img src=x onerror=alert(1)>\n```');
  assert.match(html, /<code class="language-html">/);
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(renderMarkdown('<code class="language-js app-bar" onclick="alert(1)">code</code>'), /app-bar|onclick/);
});

test("GFM task lists are inert checkboxes", () => {
  const html = renderMarkdown('- [x] done\n- [ ] todo\n\n<input type="text" autofocus onfocus="alert(1)" name="password">');
  const inputs = html.match(/<input\b[^>]*>/g) ?? [];
  assert.equal(inputs.length, 3);
  for (const input of inputs) {
    assert.match(input, /type="checkbox"/);
    assert.match(input, /\sdisabled(?:[\s=>])/);
  }
  assert.doesNotMatch(html, /autofocus|onfocus|name=/);
});

test("the shared React component sanitizes during server rendering", () => {
  const html = renderToStaticMarkup(createElement(MarkdownContent, {
    text: '**保留格式** <img src="/missing" onerror="alert(1)"><script>alert(1)</script>',
  }));
  assert.match(html, /<strong>保留格式<\/strong>/);
  assert.doesNotMatch(html, /onerror|<script|alert\(1\)/i);
});

test("empty content produces empty output", () => {
  assert.equal(renderMarkdown(""), "");
});
