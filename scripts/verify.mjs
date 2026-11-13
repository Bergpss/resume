import { readdirSync, readFileSync, existsSync } from "node:fs";
import module from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

if (!module.registerHooks) {
  console.error(
    `pnpm verify needs Node 22.15 or later for module.registerHooks. This is Node ${process.version}.`
  );
  process.exit(1);
}

const stubImages = (url, context, nextLoad) =>
  /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i.test(url)
    ? { format: "module", source: "export default {}", shortCircuit: true }
    : nextLoad(url, context);
const loadTypeScriptAsModules = (url, context, nextLoad) =>
  nextLoad(
    url,
    url.endsWith(".ts") ? { ...context, format: "module-typescript" } : context
  );
const srcRoot = join(dirname(fileURLToPath(import.meta.url)), "../src");
const resolveAlias = (specifier, context, nextResolve) => {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
  const without = specifier.slice(2);
  const match = [without, `${without}.ts`, `${without}.tsx`]
    .map((file) => join(srcRoot, file))
    .find((file) => existsSync(file));
  if (!match) return nextResolve(specifier, context);
  return nextResolve(pathToFileURL(match).href, context);
};
module.registerHooks({ load: stubImages });
module.registerHooks({ load: loadTypeScriptAsModules });
module.registerHooks({ resolve: resolveAlias });

const {
  EXPECTED_OPENCLAW_HIGHLIGHTS,
  FACTS,
  getResumeData,
  getSectionTitles,
} = await import("../src/data/resume-data.ts");
const { DEFAULT_LOCALE, LOCALES, localePath, UI } = await import(
  "../src/lib/i18n.ts"
);

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "../out");
const srcDir = join(root, "../src");

const readOut = (file) => {
  const path = join(outDir, file);
  if (!existsSync(path)) {
    throw new Error(`missing build output ${file}`);
  }
  return readFileSync(path, "utf8");
};

const sources = readdirSync(srcDir, { recursive: true })
  .filter((file) => /\.(tsx?|css)$/.test(file))
  .map((file) => [
    file,
    readFileSync(join(srcDir, file), "utf8"),
  ]);

const entities = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
};
const decode = (text) =>
  text.replace(/&(?:amp|lt|gt|quot|#x27);/g, (entity) => entities[entity]);

const pages = Object.fromEntries(
  LOCALES.map((locale) => {
    const html = readOut(`${locale}.html`);
    const styledText = readOut(`${locale}/index.txt`);
    const text = styledText.replace(/\x1b\[[0-9;]*m/g, "");
    const markdown = readOut(`${locale}/index.md`);
    const llms = readOut(`${locale}/llms.txt`);
    const data = getResumeData(locale);
    const titles = getSectionTitles(locale);
    const jsonLdScripts = [
      ...html.matchAll(
        /<script type="application\/ld\+json">(.*?)<\/script>/gs
      ),
    ].map(([, json]) => json);
    const headings = [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/gs)].map(
      ([, heading]) => decode(heading)
    );
    const sections = new Map(
      [
        ...html.matchAll(
          /<section\b[^>]*>\s*<h2\b[^>]*>(.*?)<\/h2>(.*?)<\/section>/gs
        ),
      ].map(([, heading, body]) => [decode(heading), body])
    );
    return [
      locale,
      {
        html,
        styledText,
        text,
        markdown,
        llms,
        data,
        titles,
        jsonLdScripts,
        headings,
        sections,
      },
    ];
  })
);

const css = readdirSync(join(outDir, "_next/static/chunks"))
  .filter((file) => file.endsWith(".css"))
  .map((file) => readOut(`_next/static/chunks/${file}`))
  .join("\n");

const unescape = (md) => md.replace(/\\([!-/:-@[-`{-~])/g, "$1");
const site = new URL(FACTS.siteUrl).origin;
const dimLineAfterBlankLine = /(?<=\n\n) {2}\x1b\[2m([^\x1b\n]+)\x1b\[0m$/gm;

const hasData = (data, key) => data[key].length > 0;

const showing = (page, title) =>
  [
    ["page", page.headings, (value) => value],
    [
      "text",
      [...page.styledText.matchAll(dimLineAfterBlankLine)].map(
        ([, heading]) => heading
      ),
      (value) => value.toLowerCase(),
    ],
    [
      "markdown",
      [...page.markdown.matchAll(/^## (.*)$/gm)].map(([, heading]) =>
        unescape(heading)
      ),
      (value) => value,
    ],
  ]
    .filter(([, found, shown]) => found.includes(shown(title)))
    .map(([version]) => version);

const articles = (page, key) => {
  if (!hasData(page.data, key)) return [];
  const heading = page.titles[key];
  const section = page.sections.get(heading);
  if (section === undefined) {
    throw new Error(`${page.data.name} has no "${heading}" section`);
  }
  const found = [...section.matchAll(/<article\b.*?<\/article>/gs)].map(
    ([article]) => article
  );
  if (found.length !== page.data[key].length) {
    throw new Error(
      `${found.length} articles in "${heading}" for ${page.data[key].length} entries`
    );
  }
  return found;
};

const hrefs = (fragment) =>
  [...fragment.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(([, href]) => href);

const showsUrl = (text, href) => {
  const link = new URL(href);
  return ["", "www."].some((www) => {
    const shown = URL.parse(`${link.protocol}//${www}${text}`);
    return (
      shown?.host === link.host &&
      [shown.pathname, `${shown.pathname}/`].includes(link.pathname) &&
      shown.search === link.search &&
      shown.hash === link.hash
    );
  });
};

const isWide = (char) => {
  const code = char.codePointAt(0) ?? 0;
  return (
    (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2329 && code <= 0x232a) ||
    (code >= 0x2e80 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe10 && code <= 0xfe19) ||
    (code >= 0xfe30 && code <= 0xfe6f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6) ||
    (code >= 0x1f300 && code <= 0x1f64f) ||
    (code >= 0x1f900 && code <= 0x1f9ff) ||
    (code >= 0x20000 && code <= 0x3fffd)
  );
};

const displayWidth = (text) =>
  [...text].reduce((sum, char) => sum + (isWide(char) ? 2 : 1), 0);

const upstreamNeedles = [
  "Bartosz",
  "Jarocki",
  "jarocki.me",
  "Wrocław",
  "Wroclaw",
  "bartosz.jarocki",
  "+48530213401",
  "bjarocki",
  "motionapp.com",
  "film.io",
  "parabol.co",
  "clevertech.biz",
  "Jojo Mobile",
  "Nokia Siemens",
  "monito.dev",
  "43frames.com",
  "cv.jarocki",
  "Berg Guo",
];

const builtTextFiles = [
  "zh.html",
  "en.html",
  "zh/index.md",
  "en/index.md",
  "zh/index.txt",
  "en/index.txt",
  "zh/llms.txt",
  "en/llms.txt",
  "robots.txt",
  "sitemap.xml",
  "index.html",
];

const cjkFonts = [
  "PingFang SC",
  "Hiragino Sans GB",
  "Noto Sans CJK SC",
  "Noto Sans SC",
  "Microsoft YaHei",
];

const checks = [
  [
    "OpenClaw facts stay in sync with the confirmed copy",
    () => {
      const problems = [];
      if (FACTS.openclaw.customersServed !== 20) {
        problems.push(`customersServed is ${FACTS.openclaw.customersServed}`);
      }
      if (FACTS.openclaw.customersUnderstoodInDepth !== 5) {
        problems.push(
          `customersUnderstoodInDepth is ${FACTS.openclaw.customersUnderstoodInDepth}`
        );
      }
      if (FACTS.openclaw.start !== "2026-02-22") {
        problems.push(`start is ${FACTS.openclaw.start}`);
      }
      if (FACTS.openclaw.end !== "2026-03-31") {
        problems.push(`end is ${FACTS.openclaw.end}`);
      }
      for (const locale of LOCALES) {
        const actual = getResumeData(locale).projects[0]?.highlights ?? [];
        const expected = EXPECTED_OPENCLAW_HIGHLIGHTS[locale];
        if (actual.join("\n") !== expected.join("\n")) {
          problems.push(`${locale} highlights drifted from the confirmed copy`);
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "built files exist for both locales and the root redirect",
    () => {
      const missing = [
        "zh.html",
        "en.html",
        "zh/index.md",
        "en/index.md",
        "zh/index.txt",
        "en/index.txt",
        "zh/llms.txt",
        "en/llms.txt",
        "zh/opengraph-image",
        "en/opengraph-image",
        "index.html",
        "_redirects",
        "_headers",
        "robots.txt",
        "sitemap.xml",
      ].filter((file) => !existsSync(join(outDir, file)));
      if (missing.length > 0) return `missing ${missing.join(", ")}`;
      if (!readOut("_redirects").includes("/ /zh 302")) {
        return "root redirect does not send / to /zh";
      }
    },
  ],
  ...LOCALES.flatMap((locale) => {
    const page = pages[locale];
    const ui = UI[locale];
    const canonical = new URL(localePath(locale), site).href;
    return [
      [
        `${locale}: exactly one <h1> named ${FACTS.name}`,
        () => {
          const count = page.html.match(/<h1[\s>]/g)?.length ?? 0;
          if (count !== 1) return `found ${count}`;
          const name = decode(
            page.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] ?? ""
          );
          if (name !== FACTS.name) return `h1 is ${name}`;
        },
      ],
      [
        `${locale}: html lang and title are localized`,
        () => {
          const lang = page.html.match(/<html\b[^>]*lang="([^"]+)"/)?.[1];
          const expectedLang = locale === "zh" ? "zh-CN" : "en";
          if (lang !== expectedLang) return `lang is ${lang}`;
          const title = decode(
            page.html.match(/<title>(.*?)<\/title>/)?.[1] ?? ""
          );
          const expected = `${FACTS.name} - ${ui.pageTitleFallback}`;
          if (title !== expected) return `title is ${title}`;
        },
      ],
      [
        `${locale}: canonical, hreflang, and og:url point at locale URLs`,
        () => {
          const canonicalHref = page.html.match(
            /<link rel="canonical" href="([^"]*)"/
          )?.[1];
          if (canonicalHref !== canonical) {
            return `canonical is ${canonicalHref}`;
          }
          const ogUrl = page.html.match(
            /<meta property="og:url" content="([^"]*)"/
          )?.[1];
          if (ogUrl !== canonical) return `og:url is ${ogUrl}`;
          const missing = [
            ['hreflang="zh-CN"', `${site}/zh`],
            ['hreflang="en"', `${site}/en`],
            ['hreflang="x-default"', `${site}/${DEFAULT_LOCALE}`],
          ].filter(
            ([attr, href]) =>
              !page.html.includes(
                `<link rel="alternate" hrefLang="${attr.slice(10, -1)}" href="${href}"`
              ) &&
              !page.html.includes(
                `<link rel="alternate" hreflang="${attr.slice(10, -1)}" href="${href}"`
              )
          );
          // Next emits hrefLang
          const alternates = [
            ...page.html.matchAll(
              /<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g
            ),
          ];
          const found = Object.fromEntries(
            alternates.map(([, lang, href]) => [lang, href])
          );
          const expected = {
            "zh-CN": `${site}/zh`,
            en: `${site}/en`,
            "x-default": `${site}/${DEFAULT_LOCALE}`,
          };
          const wrong = Object.entries(expected).flatMap(([lang, href]) =>
            found[lang] === href ? [] : [`${lang} is ${found[lang]}`]
          );
          if (wrong.length > 0) return wrong.join("; ");
        },
      ],
      [
        `${locale}: markdown alternate and twitter:creator are set`,
        () => {
          const href = page.html.match(
            /<link rel="alternate" type="text\/markdown" href="([^"]*)"/
          )?.[1];
          const expected = `${canonical}/index.md`;
          if (href !== expected) return `alternate is ${href}`;
          const creator = page.html.match(
            /<meta name="twitter:creator" content="([^"]*)"/
          )?.[1];
          if (creator !== "@PssBerg") return `twitter:creator is ${creator}`;
        },
      ],
      [
        `${locale}: JSON-LD parses as one Person without employment fields`,
        () => {
          if (page.jsonLdScripts.length === 0) return "no JSON-LD script";
          for (const json of page.jsonLdScripts) {
            const data = JSON.parse(json);
            const blob = JSON.stringify(data);
            const people = blob.match(/"@type":"Person"/g)?.length ?? 0;
            if (people !== 1) return `found ${people} Person objects`;
            if (blob.includes("estimatedSalary")) return "has estimatedSalary";
            if (blob.includes("jobTitle")) return "has jobTitle";
            if (blob.includes("worksFor")) return "has worksFor";
            if (blob.includes("alumniOf")) return "has alumniOf";
          }
        },
      ],
      [
        `${locale}: visible sections match the data`,
        () => {
          const expected = Object.entries(page.titles)
            .filter(([key]) => hasData(page.data, key))
            .map(([, title]) => title);
          const hidden = Object.entries(page.titles)
            .filter(([key]) => !hasData(page.data, key))
            .map(([, title]) => title);
          const problems = [];
          if (page.headings.join("\n") !== expected.join("\n")) {
            problems.push(`page has ${page.headings.join(", ")}`);
          }
          for (const title of expected) {
            const missing = ["page", "text", "markdown"].filter(
              (version) => !showing(page, title).includes(version)
            );
            if (missing.length > 0) {
              problems.push(`"${title}" missing in ${missing.join(", ")}`);
            }
          }
          for (const title of hidden) {
            if (showing(page, title).length > 0) {
              problems.push(
                `"${title}" shown in ${showing(page, title).join(", ")}`
              );
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: OpenClaw title, dates, and highlights render`,
        () => {
          const project = page.data.projects[0];
          const problems = [];
          const htmlText = decode(page.html.replace(/<[^>]+>/g, " "));
          const folded = (value) => value.replace(/\s+/g, " ");
          const htmlFolded = folded(htmlText);
          const textFolded = folded(page.text);
          for (const value of [
            project.title,
            FACTS.openclaw.start,
            FACTS.openclaw.end,
            ...project.highlights,
          ]) {
            const needle = folded(value);
            if (!htmlFolded.includes(needle)) {
              problems.push(`html lacks ${value}`);
            }
            if (!page.markdown.includes(value)) {
              problems.push(`markdown lacks ${value}`);
            }
            if (!textFolded.includes(needle)) {
              problems.push(`text lacks ${value}`);
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: language switch and print control exist and are print-hidden`,
        () => {
          const other = locale === "zh" ? "en" : "zh";
          const controls = page.html.match(
            /<div class="flex flex-wrap items-center justify-end[^"]*print:hidden[^"]*"/
          );
          if (!controls) return "no print-hidden page controls";
          if (!page.html.includes(`href="${localePath(other)}"`)) {
            return `no link to ${localePath(other)}`;
          }
          if (!page.html.includes(ui.print)) return "print label missing";
          if (!ui.print.includes("PDF")) {
            return "print label does not mention PDF";
          }
        },
      ],
      [
        `${locale}: contact links are GitHub and X only`,
        () => {
          const header = page.html.match(/<header\b.*?<\/header>/s)?.[0] ?? "";
          const links = hrefs(header).map(decode);
          const expected = [FACTS.githubUrl, FACTS.xUrl];
          const unique = [...new Set(links)];
          const missing = expected.filter((href) => !unique.includes(href));
          const extra = unique.filter((href) => !expected.includes(href));
          if (missing.length || extra.length) {
            return [
              ...missing.map((href) => `missing ${href}`),
              ...extra.map((href) => `extra ${href}`),
            ].join("; ");
          }
        },
      ],
      [
        `${locale}: the markdown starts with # and the name`,
        () => {
          const first = unescape(page.markdown.split("\n")[0]);
          if (first !== `# ${FACTS.name}`) return `starts with "${first}"`;
        },
      ],
      [
        `${locale}: the text starts with the name in bold`,
        () => {
          const first = page.styledText.split("\n").find((line) => line.trim());
          if (!first?.startsWith("  \x1b[1m")) return `starts with ${first}`;
          if (!page.text.trim().replace(/\s+/g, " ").startsWith(FACTS.name)) {
            return `the first words are not ${FACTS.name}`;
          }
        },
      ],
      [
        `${locale}: no text line passes 80 columns, except a URL on its own`,
        () => {
          const lines = page.text.split("\n");
          if (!lines.some((line) => line.trim())) return "the text is empty";
          const dataLinks = page.data.contact.social.map(({ url }) => url);
          const long = lines.filter(
            (line) =>
              displayWidth(line) > 80 &&
              !dataLinks.some((href) => showsUrl(line.trim(), href))
          );
          if (long.length > 0) {
            return `${long.length} lines, the first is "${long[0].trim()}"`;
          }
        },
      ],
      [
        `${locale}: llms.txt is the markdown with a formats paragraph after the blockquote`,
        () => {
          const lines = page.llms.split("\n");
          const [title, , quote, , formats] = lines;
          const problems = [];
          if (title !== page.markdown.split("\n")[0]) {
            problems.push(`starts with ${title}`);
          }
          if (unescape(quote ?? "") !== `> ${page.data.about}`) {
            problems.push(`has ${quote} for the blockquote`);
          }
          for (const name of [
            `${site}${localePath(locale, "/index.md")}`,
            `${site}${localePath(locale, "/index.txt")}`,
          ]) {
            if (!formats?.includes(`\`${name}\``)) {
              problems.push(`does not name ${name}`);
            }
          }
          if (
            [...lines.slice(0, 4), ...lines.slice(6)].join("\n") !==
            page.markdown
          ) {
            problems.push("differs from the markdown outside that paragraph");
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: preloads only the two fonts the page uses`,
        () => {
          const fonts =
            page.html.match(
              /<link rel="preload" href="[^"]*" as="font"/g
            )?.length ?? 0;
          if (fonts !== 2) return `preloads ${fonts}`;
        },
      ],
      [
        `${locale}: og:image is present`,
        () => {
          if (!/<meta property="og:image" content="[^"]+"/.test(page.html)) {
            return "no og:image meta tag";
          }
        },
      ],
    ];
  }),
  [
    "print stylesheet uses A4 and Chinese system fonts",
    () => {
      const problems = [];
      if (!/@page\{size:A4;/.test(css) && !/@page \{\s*size: A4;/.test(css)) {
        problems.push("no A4 page size");
      }
      const missing = cjkFonts.filter((font) => !css.includes(`"${font}"`));
      if (missing.length > 0) {
        problems.push(`CSS lacks ${missing.join(", ")}`);
      }
      if (!css.includes("@media print")) return "no print media rules";
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "the built resume does not contain the upstream person's identity",
    () => {
      const hits = [];
      for (const file of builtTextFiles) {
        const text = readOut(file);
        for (const needle of upstreamNeedles) {
          if (text.includes(needle)) hits.push(`${file}: ${needle}`);
        }
      }
      for (const [file, source] of sources) {
        for (const needle of upstreamNeedles) {
          if (source.includes(needle)) hits.push(`src/${file}: ${needle}`);
        }
      }
      if (hits.length > 0) return hits.join("; ");
    },
  ],
  [
    "the published pages do not invent email, phone, location, or analytics",
    () => {
      const needles = [
        "mailto:",
        "tel:",
        "vercel-analytics",
        "China",
        "中国",
      ];
      const hits = builtTextFiles.flatMap((file) =>
        needles
          .filter((needle) => readOut(file).includes(needle))
          .map((needle) => `${file}: ${needle}`)
      );
      const sourceHits = sources.flatMap(([file, source]) =>
        source.includes("vercel-analytics") ||
        source.includes("@vercel/analytics")
          ? [`src/${file}: analytics`]
          : []
      );
      const found = [...hits, ...sourceHits];
      if (found.length > 0) return found.join("; ");
    },
  ],
  [
    "generated robots.txt allows /_next/",
    () => {
      if (/^Disallow:\s*\/_next\//im.test(readOut("robots.txt"))) {
        return "disallows /_next/";
      }
    },
  ],
  [
    "no list inside a heading",
    () => {
      for (const locale of LOCALES) {
        const headings = [
          ...pages[locale].html.matchAll(/<(h[1-6])\b[^>]*>(.*?)<\/\1>/gs),
        ];
        const nested = headings.filter(([, , inner]) =>
          /<(ul|ol)[\s>]/.test(inner)
        );
        if (nested.length > 0) return `${locale} has ${nested.length}`;
      }
    },
  ],
  [
    'no role="feed"',
    () => {
      for (const locale of LOCALES) {
        const count = pages[locale].html.match(/role="feed"/g)?.length ?? 0;
        if (count > 0) return `${locale} found ${count}`;
      }
    },
  ],
  [
    "no text class below 9px",
    () => {
      const sizes = LOCALES.flatMap((locale) => [
        ...pages[locale].html.matchAll(/\btext-\[(\d+(?:\.\d+)?)px\]/g),
      ]);
      const small = new Set(
        sizes.map(([, px]) => Number(px)).filter((px) => px < 9)
      );
      if (small.size > 0) return `found ${[...small].join("px, ")}px`;
    },
  ],
  [
    "colors come from the theme tokens",
    () => {
      const literal =
        /\b[a-z]+-(?:(?:black|white)\b|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|\[(?:#|hsl|rgb|oklch))/g;
      const found = sources.flatMap(([file, source]) =>
        (source.match(literal) ?? []).map((match) => `${file}: ${match}`)
      );
      if (found.length > 0) return `found ${found.join(", ")}`;
    },
  ],
  [
    "every enter and exit animation class is motion-safe",
    () => {
      const enterExit =
        /^(?:animate-(?:in|out)|(?:fade|zoom|spin)-(?:in|out)(?:-.+)?|slide-(?:in-from|out-to)-.+)$/;
      const found = sources.flatMap(([file, source]) =>
        (source.match(/[^\s"'`]+/g) ?? [])
          .filter((token) => enterExit.test(token.split(":").at(-1)))
          .filter((token) => !token.includes("motion-safe:"))
          .map((token) => `${file}: ${token}`)
      );
      if (found.length > 0) return `found ${found.join(", ")}`;
    },
  ],
  [
    "project entries without a link do not invent a printed URL",
    () => {
      for (const locale of LOCALES) {
        const page = pages[locale];
        for (const [index, article] of articles(page, "projects").entries()) {
          const project = page.data.projects[index];
          if (project.link) continue;
          if (article.includes("print:block")) {
            return `${locale} ${project.title} prints a URL without a link`;
          }
        }
      }
    },
  ],
];

let failures = 0;
for (const [name, check] of checks) {
  let problem;
  try {
    problem = check();
  } catch (error) {
    problem = error.message;
  }
  if (problem) failures++;
  console.log(problem ? `FAIL ${name}: ${problem}` : `ok   ${name}`);
}
process.exitCode = failures ? 1 : 0;
