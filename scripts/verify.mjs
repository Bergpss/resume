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
  EXPECTED_CONTENT_CREATION,
  EXPECTED_EDUCATION,
  EXPECTED_HERMES_CAD,
  EXPECTED_OPENCLAW_HIGHLIGHTS,
  EXPECTED_WORK,
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
        const projects = getResumeData(locale).projects;
        const actual =
          projects.find((project) => project.start === FACTS.openclaw.start)?.highlights ??
          [];
        const expected = EXPECTED_OPENCLAW_HIGHLIGHTS[locale];
        if (actual.join("\n") !== expected.join("\n")) {
          problems.push(`${locale} highlights drifted from the confirmed copy`);
        }
        if (projects[1]?.start !== FACTS.openclaw.start) {
          problems.push(`${locale} OpenClaw is not the second project`);
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "Hermes CAD Skill facts stay in sync with the confirmed copy",
    () => {
      const problems = [];
      if (FACTS.hermesCad.start !== "2026-09") {
        problems.push(`start is ${FACTS.hermesCad.start}`);
      }
      if ("end" in FACTS.hermesCad) {
        problems.push("Hermes CAD should not have a precise end date");
      }
      for (const locale of LOCALES) {
        const projects = getResumeData(locale).projects;
        const actual = projects[0];
        const expected = EXPECTED_HERMES_CAD[locale];
        if (!actual) {
          problems.push(`${locale} is missing the Hermes CAD project`);
          continue;
        }
        if (projects.length !== 2) {
          problems.push(`${locale} has ${projects.length} projects`);
        }
        if (actual.title !== expected.title) {
          problems.push(`${locale} title is ${actual.title}`);
        }
        if (actual.period !== expected.period) {
          problems.push(`${locale} period is ${actual.period}`);
        }
        if ((actual.highlights ?? []).join("\n") !== expected.highlights.join("\n")) {
          problems.push(`${locale} Hermes highlights drifted from the confirmed copy`);
        }
        if (actual.start !== FACTS.hermesCad.start) {
          problems.push(`${locale} start is ${actual.start}`);
        }
        if (actual.end != null) {
          problems.push(`${locale} has an end date ${actual.end}`);
        }
        if ((actual.techStack ?? []).length > 0) {
          problems.push(`${locale} invents a tech stack list`);
        }
        if (actual.link) {
          problems.push(`${locale} invents a project link`);
        }
        if (actual.description) {
          problems.push(`${locale} has a description beyond the confirmed bullets`);
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "education facts stay in sync with the confirmed copy",
    () => {
      const problems = [];
      if (FACTS.education.start !== "2018-09") {
        problems.push(`start is ${FACTS.education.start}`);
      }
      if (FACTS.education.end !== "2022-06") {
        problems.push(`end is ${FACTS.education.end}`);
      }
      for (const locale of LOCALES) {
        const actual = getResumeData(locale).education[0];
        const expected = EXPECTED_EDUCATION[locale];
        if (!actual) {
          problems.push(`${locale} is missing education`);
          continue;
        }
        if (actual.school !== expected.school) {
          problems.push(`${locale} school is ${actual.school}`);
        }
        if (actual.degree !== expected.degree) {
          problems.push(`${locale} degree is ${actual.degree}`);
        }
        if (actual.period !== expected.period) {
          problems.push(`${locale} period is ${actual.period}`);
        }
        if ((actual.highlights ?? []).length > 0) {
          problems.push(`${locale} education still has highlights`);
        }
        if (actual.end !== FACTS.education.end) {
          problems.push(`${locale} education end is ${actual.end}`);
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "work facts stay in sync with the confirmed copy",
    () => {
      const problems = [];
      if (FACTS.work.company !== "北京南北天地科技股份有限公司") {
        problems.push(`company is ${FACTS.work.company}`);
      }
      if (FACTS.work.companyEn !== "Beijing Snsoft Technology Co.,Ltd") {
        problems.push(`companyEn is ${FACTS.work.companyEn}`);
      }
      if (FACTS.work.start !== "2022-09") {
        problems.push(`start is ${FACTS.work.start}`);
      }
      if (FACTS.work.end !== "2025-05") {
        problems.push(`end is ${FACTS.work.end}`);
      }
      for (const locale of LOCALES) {
        const actual = getResumeData(locale).work[0];
        const expected = EXPECTED_WORK[locale];
        if (!actual) {
          problems.push(`${locale} is missing work`);
          continue;
        }
        if (getResumeData(locale).work.length !== 1) {
          problems.push(`${locale} has ${getResumeData(locale).work.length} work entries`);
        }
        if (actual.company !== expected.company) {
          problems.push(`${locale} company is ${actual.company}`);
        }
        const official =
          locale === "en" ? FACTS.work.companyEn : FACTS.work.company;
        if (actual.company !== official) {
          problems.push(`${locale} invented a company name: ${actual.company}`);
        }
        if (locale === "zh" && actual.company === FACTS.work.companyEn) {
          problems.push("zh work uses the English company name");
        }
        if (locale === "en" && actual.company === FACTS.work.company) {
          problems.push("en work still uses the Chinese company name");
        }
        if (actual.title !== expected.title) {
          problems.push(`${locale} title is ${actual.title}`);
        }
        if (actual.period !== expected.period) {
          problems.push(`${locale} period is ${actual.period}`);
        }
        if ((actual.highlights ?? []).join("\n") !== expected.highlights.join("\n")) {
          problems.push(`${locale} work highlights drifted from the confirmed copy`);
        }
        if (actual.description) {
          problems.push(`${locale} work has a description beyond the confirmed bullet`);
        }
        if (actual.badges.length > 0) {
          problems.push(`${locale} work invents badges`);
        }
        if (actual.link) {
          problems.push(`${locale} work invents a company link`);
        }
        if (actual.start !== FACTS.work.start) {
          problems.push(`${locale} work start is ${actual.start}`);
        }
        if (actual.end !== FACTS.work.end) {
          problems.push(`${locale} work end is ${actual.end}`);
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],

  [
    "content creation facts stay in sync with the confirmed copy",
    () => {
      const problems = [];
      if (FACTS.contentCreation.xFollowers !== 948) {
        problems.push(`xFollowers is ${FACTS.contentCreation.xFollowers}`);
      }
      if (FACTS.contentCreation.xFollowersAsOf !== "2026-11-13") {
        problems.push(`xFollowersAsOf is ${FACTS.contentCreation.xFollowersAsOf}`);
      }
      if (FACTS.contentCreation.xFollowers >= 1000) {
        problems.push("follower snapshot claims 1,000 or more");
      }
      for (const locale of LOCALES) {
        const actual = getResumeData(locale).contentCreation[0];
        const expected = EXPECTED_CONTENT_CREATION[locale];
        if (!actual) {
          problems.push(`${locale} is missing content creation`);
          continue;
        }
        if (getResumeData(locale).contentCreation.length !== 1) {
          problems.push(
            `${locale} has ${getResumeData(locale).contentCreation.length} content creation entries`
          );
        }
        if ((actual.highlights ?? []).join("\n") !== expected.highlights.join("\n")) {
          problems.push(`${locale} content highlights drifted from the confirmed copy`);
        }
        const names = actual.platforms.map((platform) => platform.name);
        if (names.join("\n") !== expected.platforms.join("\n")) {
          problems.push(`${locale} platforms are ${names.join(", ")}`);
        }
        const icons = actual.platforms.map((platform) => platform.icon);
        if (icons.join("\n") !== ["x", "douyin", "xiaohongshu"].join("\n")) {
          problems.push(`${locale} platform icons are ${icons.join(", ")}`);
        }
        const snapshot = `${FACTS.contentCreation.xFollowers} (${FACTS.contentCreation.xFollowersAsOf})`;
        if (expected.xNote !== snapshot) {
          problems.push(`${locale} expected X note drifted from the snapshot`);
        }
        if (actual.platforms[0]?.note !== snapshot) {
          problems.push(`${locale} X note is ${actual.platforms[0]?.note}`);
        }
        if (actual.platforms.some((platform) => platform.url)) {
          problems.push(`${locale} content platforms still have profile URLs`);
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
        `${locale}: exactly one <h1> named ${FACTS.names[locale]}`,
        () => {
          const count = page.html.match(/<h1[\s>]/g)?.length ?? 0;
          if (count !== 1) return `found ${count}`;
          const name = decode(
            page.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] ?? ""
          );
          if (name !== FACTS.names[locale]) return `h1 is ${name}`;
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
          const expected = `${FACTS.names[locale]} - ${ui.pageTitleFallback}`;
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
            const expectedSchools = page.data.education.map(
              (entry) => entry.school
            );
            const alumni = data.mainEntity?.alumniOf;
            const listed = (Array.isArray(alumni) ? alumni : alumni ? [alumni] : [])
              .map((item) => item?.name)
              .filter(Boolean);
            if (expectedSchools.join("\n") !== listed.join("\n")) {
              return `alumniOf is ${listed.join(", ") || "missing"}`;
            }
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
        `${locale}: section order is projects, content creation, work, then education`,
        () => {
          const expectedKeys = [
            "summary",
            "projects",
            "contentCreation",
            "work",
            "education",
            "skills",
          ];
          const actualKeys = Object.keys(page.titles);
          if (actualKeys.join("\n") !== expectedKeys.join("\n")) {
            return `title keys are ${actualKeys.join(", ")}`;
          }
          const expectedHeadings = expectedKeys
            .filter((key) => hasData(page.data, key))
            .map((key) => page.titles[key]);
          if (page.headings.join("\n") !== expectedHeadings.join("\n")) {
            return `page has ${page.headings.join(", ")}`;
          }
          const published = expectedKeys.filter((key) => hasData(page.data, key));
          if (
            published.join("\n") !==
            ["projects", "contentCreation", "work", "education"].join("\n")
          ) {
            return `published sections are ${published.join(", ")}`;
          }
        },
      ],
      [
        `${locale}: the about body section is omitted and the tagline stays`,
        () => {
          const problems = [];
          if (page.data.summary) {
            problems.push("summary is still populated");
          }
          if (page.data.about !== {
            zh: "用 AI 帮助用户解决实际问题，让世界更美好",
            en: "Using AI to solve real problems for people and make the world a better place.",
          }[locale]) {
            problems.push(`tagline is ${page.data.about}`);
          }
          const stale = [
            "我帮助客户安装、配置 OpenClaw，并在深入了解其业务后，按需求定制 Skills。",
            "I help customers install and configure OpenClaw, and after developing an in-depth understanding of their business, I customize Skills around their needs.",
          ];
          const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
            /\s+/g,
            " "
          );
          const textFolded = page.text.replace(/\s+/g, " ");
          for (const needle of stale) {
            if (
              htmlFolded.includes(needle) ||
              textFolded.includes(needle) ||
              page.markdown.includes(needle)
            ) {
              problems.push("stale about body is still published");
            }
          }
          for (const heading of [page.titles.summary, "简介", "About"]) {
            if (page.headings.includes(heading)) {
              problems.push(`page still has heading ${heading}`);
            }
            if (page.markdown.match(new RegExp(`^## ${heading}$`, "m"))) {
              problems.push(`markdown still has heading ${heading}`);
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: OpenClaw title, dates, and highlights render`,
        () => {
          const project = page.data.projects.find(
            (entry) => entry.start === FACTS.openclaw.start
          );
          if (!project) return "no OpenClaw project";
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
        `${locale}: Hermes CAD title, period, and highlights render first`,
        () => {
          const project = page.data.projects[0];
          const expected = EXPECTED_HERMES_CAD[locale];
          if (!project) return "no Hermes CAD project";
          if (project.title !== expected.title) {
            return `first project is ${project.title}`;
          }
          const problems = [];
          const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
            /\s+/g,
            " "
          );
          const textFolded = page.text.replace(/\s+/g, " ");
          for (const value of [
            project.title,
            project.period,
            ...(project.highlights ?? []),
          ]) {
            const needle = value.replace(/\s+/g, " ");
            if (!htmlFolded.includes(needle)) problems.push(`html lacks ${value}`);
            if (!page.markdown.includes(value)) {
              problems.push(`markdown lacks ${value}`);
            }
            if (!textFolded.includes(needle)) problems.push(`text lacks ${value}`);
          }
          const section = page.sections.get(page.titles.projects) ?? "";
          const articlesHtml = [...section.matchAll(/<article\b.*?<\/article>/gs)];
          if (articlesHtml.length !== page.data.projects.length) {
            problems.push(`project articles are ${articlesHtml.length}`);
          }
          const first = articlesHtml[0]?.[0] ?? "";
          const firstText = decode(first.replace(/<[^>]+>/g, " "));
          if (!firstText.includes(project.title) || !firstText.includes(project.period)) {
            problems.push("first project article is not the Hermes CAD Skill");
          }
          const banned = [
            "至今",
            "Present",
            "2026-09-01",
            "90%",
            "80%",
            "准确率",
            "地产公司",
            "建筑公司",
            "围墙详图",
            "建设单位",
            "通用 CAD 引擎",
            "general-purpose CAD engine",
            "real estate",
          ];
          for (const needle of banned) {
            if (firstText.includes(needle) || (project.period ?? "").includes(needle)) {
              problems.push(`Hermes CAD shows ${needle}`);
            }
          }
          const feedback = {
            zh: ["客户反馈", "其图纸算量工作流由数天缩短至数分钟"],
            en: ["Client feedback", "their drawing quantity takeoff workflow"],
          }[locale];
          for (const needle of feedback) {
            if (!firstText.includes(needle) && !htmlFolded.includes(needle)) {
              problems.push(`feedback lacks ${needle}`);
            }
          }
          const removed = [
            "客户自述整体 AI 辅助工作流，未独立测量",
            "the client's own account of the overall AI-assisted workflow; not independently measured",
          ];
          for (const needle of removed) {
            if (
              firstText.includes(needle) ||
              htmlFolded.includes(needle) ||
              page.markdown.includes(needle) ||
              textFolded.includes(needle)
            ) {
              problems.push(`feedback still has ${needle}`);
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: education school, period, and degree render`,
        () => {
          const entry = page.data.education[0];
          if (!entry) return "no education entry";
          const problems = [];
          const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
            /\s+/g,
            " "
          );
          const textFolded = page.text.replace(/\s+/g, " ");
          for (const value of [
            entry.school,
            entry.period,
            entry.degree,
            ...(entry.highlights ?? []),
          ]) {
            const needle = value.replace(/\s+/g, " ");
            if (!htmlFolded.includes(needle)) problems.push(`html lacks ${value}`);
            if (!page.markdown.includes(value)) {
              problems.push(`markdown lacks ${value}`);
            }
            if (!textFolded.includes(needle)) problems.push(`text lacks ${value}`);
          }
          const section = page.sections.get(page.titles.education) ?? "";
          const sectionText = decode(section.replace(/<[^>]+>/g, " "));
          for (const banned of [
            "至今",
            "Present",
            "入学",
            "Started Sep 2018",
            "CET-4",
            "CET4",
            "CET 4",
            "四级",
            "530分",
            "score: 530",
          ]) {
            if (sectionText.includes(banned) || entry.period.includes(banned)) {
              problems.push(`education shows ${banned}`);
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],
      [
        `${locale}: work company, period, title, and highlight render`,
        () => {
          const entry = page.data.work[0];
          if (!entry) return "no work entry";
          const problems = [];
          const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
            /\s+/g,
            " "
          );
          const textFolded = page.text.replace(/\s+/g, " ");
          for (const value of [
            entry.company,
            entry.period,
            entry.title,
            ...(entry.highlights ?? []),
          ]) {
            const needle = value.replace(/\s+/g, " ");
            if (!htmlFolded.includes(needle)) problems.push(`html lacks ${value}`);
            if (!page.markdown.includes(value)) {
              problems.push(`markdown lacks ${value}`);
            }
            if (!textFolded.includes(needle)) problems.push(`text lacks ${value}`);
          }
          const section = page.sections.get(page.titles.work) ?? "";
          const sectionText = decode(section.replace(/<[^>]+>/g, " "));
          const bullets = [...section.matchAll(/<li\b[^>]*>(.*?)<\/li>/gs)].map(
            ([, item]) => decode(item.replace(/<[^>]+>/g, "")).trim()
          );
          if (bullets.join("\n") !== (entry.highlights ?? []).join("\n")) {
            problems.push(`work bullets are ${bullets.join(" | ") || "missing"}`);
          }
          for (const banned of [
            "至今",
            "Present",
            "2022-09 - 2025-05",
            "Nanbei",
            "Tiandi Technology",
            "Tiandi Science",
            "TDTEC",
            "负责人",
            "项目管理",
            "project manager",
            "validated efficiency",
            "CET-4",
            "CET4",
            "四级",
            "530分",
          ]) {
            if (sectionText.includes(banned) || entry.period.includes(banned)) {
              problems.push(`work shows ${banned}`);
            }
          }
          if (problems.length > 0) return problems.join("; ");
        },
      ],

      [
        `${locale}: content creation copy, platforms, and X snapshot render`,
        () => {
          const entry = page.data.contentCreation[0];
          if (!entry) return "no content creation entry";
          const problems = [];
          const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
            /\s+/g,
            " "
          );
          const textFolded = page.text.replace(/\s+/g, " ");
          const expected = EXPECTED_CONTENT_CREATION[locale];
          const title = page.titles.contentCreation;
          if (!htmlFolded.includes(title)) problems.push(`html lacks ${title}`);
          if (!page.markdown.includes(title)) problems.push(`markdown lacks ${title}`);
          if (!textFolded.includes(title.toLowerCase())) {
            problems.push(`text lacks ${title.toLowerCase()}`);
          }
          for (const value of [
            ...entry.highlights,
            ...entry.platforms.map((platform) => platform.name),
            entry.platforms[0]?.note,
          ]) {
            const needle = value.replace(/\s+/g, " ");
            if (!htmlFolded.includes(needle)) problems.push(`html lacks ${value}`);
            if (!page.markdown.includes(value)) {
              problems.push(`markdown lacks ${value}`);
            }
            if (!textFolded.includes(needle)) problems.push(`text lacks ${value}`);
          }
          const section = page.sections.get(page.titles.contentCreation) ?? "";
          const sectionText = decode(section.replace(/<[^>]+>/g, " "));
          const hrefsInSection = hrefs(section).map(decode);
          if (hrefsInSection.length > 0) {
            problems.push(`section still has links ${hrefsInSection.join(", ")}`);
          }
          if (section.includes("opens in new tab") || section.includes("ExternalArrow") || section.includes("print:block")) {
            problems.push("section still has a jump link or print URL");
          }
          const mdSection = page.markdown.split(`## ${title}`)[1]?.split(/^## /m)[0] ?? "";
          if (mdSection.includes("](") || mdSection.includes(FACTS.xUrl) || mdSection.includes("x.com/PssBerg")) {
            problems.push("markdown section still has a profile link");
          }
          const textStart = page.text.toLowerCase().indexOf(title.toLowerCase());
          const workTitle = page.titles.work;
          const textEnd = page.text.toLowerCase().indexOf(workTitle.toLowerCase(), textStart + 1);
          const textSection = textStart >= 0 ? page.text.slice(textStart, textEnd >= 0 ? textEnd : undefined) : "";
          if (textSection.includes("x.com/PssBerg") || textSection.includes(FACTS.xUrl)) {
            problems.push("text section still has a profile link");
          }
          if (!section.includes("<title>X</title>")) {
            problems.push("X logo is missing an accessible title");
          }
          if (!section.includes("<title>Douyin</title>")) {
            problems.push("Douyin logo is missing an accessible title");
          }
          if (!section.includes("<title>Xiaohongshu</title>")) {
            problems.push("Xiaohongshu logo is missing an accessible title");
          }
          const names = [...section.matchAll(/<span class="font-medium">(.*?)<\/span>/g)].map(
            ([, name]) => decode(name)
          );
          if (names.join("\n") !== expected.platforms.join("\n")) {
            problems.push(`visible platform names are ${names.join(", ") || "missing"}`);
          }
          const banned = [
            "实时",
            "real-time",
            "realtime",
            "live follower",
            "live count",
            "已达 1,000",
            "已破 1,000",
            "already 1,000",
            "already 1000",
            "1,000 followers",
            "1000 followers",
            "5.6 万粉丝",
            "5.6万粉丝",
            "56,000 followers",
            "56000 followers",
            "douyin.com",
            "xiaohongshu.com",
            "xhslink.com",
            "iesdouyin",
            "widgets.js",
            "api.x.com",
            "pulse.walls.sh",
            "接近 1,000",
            "接近1000",
            "approaching 1,000",
            "approaching 1000",
            "关注者",
            "记录",
            "followers as of",
            "as of Nov",
          ];
          const surfaces = [sectionText, section, mdSection, textSection];
          for (const needle of banned) {
            if (surfaces.some((surface) => surface.includes(needle))) {
              problems.push(`content creation shows ${needle}`);
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
          if (first !== `# ${FACTS.names[locale]}`) return `starts with "${first}"`;
        },
      ],
      [
        `${locale}: the text starts with the name in bold`,
        () => {
          const first = page.styledText.split("\n").find((line) => line.trim());
          if (!first?.startsWith("  \x1b[1m")) return `starts with ${first}`;
          if (!page.text.trim().replace(/\s+/g, " ").startsWith(FACTS.names[locale])) {
            return `the first words are not ${FACTS.names[locale]}`;
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
    "Chinese and English display names stay on their own locales",
    () => {
      const problems = [];
      if (pages.zh.data.name !== "郭一博") {
        problems.push(`zh name is ${pages.zh.data.name}`);
      }
      if (pages.en.data.name !== "Berg") {
        problems.push(`en name is ${pages.en.data.name}`);
      }
      if (pages.en.html.includes("郭一博") || pages.en.markdown.includes("郭一博")) {
        problems.push("en page includes the Chinese display name");
      }
      const zhName = decode(pages.zh.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] ?? "");
      const enName = decode(pages.en.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] ?? "");
      if (zhName !== "郭一博") problems.push(`zh h1 is ${zhName}`);
      if (enName !== "Berg") problems.push(`en h1 is ${enName}`);
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "the tagline under the name is the confirmed self-positioning copy",
    () => {
      const expected = {
        zh: "用 AI 帮助用户解决实际问题，让世界更美好",
        en: "Using AI to solve real problems for people and make the world a better place.",
      };
      const stale = [
        "帮助客户完成 AI 工具的安装、配置与定制。",
        "Helping customers adopt and customize AI tools.",
      ];
      const problems = [];
      for (const locale of LOCALES) {
        const page = pages[locale];
        const about = page.data.about;
        if (about !== expected[locale]) {
          problems.push(`${locale} about is ${about}`);
        }
        const htmlFolded = decode(page.html.replace(/<[^>]+>/g, " ")).replace(
          /\s+/g,
          " "
        );
        const textFolded = page.text.replace(/\s+/g, " ");
        if (!htmlFolded.includes(about)) problems.push(`${locale} html lacks the tagline`);
        if (!textFolded.includes(about)) problems.push(`${locale} text lacks the tagline`);
        if (!page.markdown.includes(`> ${about}`)) {
          problems.push(`${locale} markdown lacks the tagline`);
        }
        for (const previous of stale) {
          if (
            htmlFolded.includes(previous) ||
            textFolded.includes(previous) ||
            page.markdown.includes(previous)
          ) {
            problems.push(`${locale} still has the previous tagline`);
          }
        }
      }
      if (problems.length > 0) return problems.join("; ");
    },
  ],
  [
    "CET-4 and the 530 score are removed from the published resume",
    () => {
      const needles = [
        "CET-4",
        "CET4",
        "CET 4",
        "四级",
        "530分",
        "score: 530",
        "cet4Score",
      ];
      const hits = [];
      for (const file of builtTextFiles) {
        const text = readOut(file);
        for (const needle of needles) {
          if (text.includes(needle)) hits.push(`${file}: ${needle}`);
        }
      }
      for (const [file, source] of sources) {
        for (const needle of needles) {
          if (source.includes(needle)) hits.push(`src/${file}: ${needle}`);
        }
      }
      if (hits.length > 0) return hits.join("; ");
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
