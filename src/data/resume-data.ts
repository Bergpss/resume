import type { Locale } from "@/lib/i18n";
import { UI } from "@/lib/i18n";
import type { ResumeData } from "@/lib/types";

export const FACTS = {
  name: "Berg",
  siteUrl: "https://resume.guoyibo.top",
  githubUrl: "https://github.com/Bergpss",
  xUrl: "https://x.com/PssBerg",
  openclaw: {
    start: "2026-02-22",
    end: "2026-03-31",
    customersServed: 20,
    customersUnderstoodInDepth: 5,
  },
} as const;

export const EXPECTED_OPENCLAW_HIGHLIGHTS = {
  zh: [
    "累计服务20位客户，指导完成OpenClaw安装与配置。",
    "深入了解其中5位客户的业务，并根据客户业务需求定制Skills。",
  ],
  en: [
    "Helped 20 customers install and configure OpenClaw.",
    "Developed an in-depth understanding of five customers’ business workflows and customized Skills around customer needs.",
  ],
} as const;

const copy: Record<
  Locale,
  {
    about: string;
    summary: string;
    openclawTitle: string;
    openclawHighlights: readonly [string, string];
  }
> = {
  zh: {
    about: "帮助客户完成 AI 工具的安装、配置与定制。",
    summary:
      "我帮助客户安装、配置 OpenClaw，并在深入了解其业务后，按需求定制 Skills。",
    openclawTitle: "OpenClaw 客户服务与定制",
    openclawHighlights: [
      `累计服务${FACTS.openclaw.customersServed}位客户，指导完成OpenClaw安装与配置。`,
      `深入了解其中${FACTS.openclaw.customersUnderstoodInDepth}位客户的业务，并根据客户业务需求定制Skills。`,
    ],
  },
  en: {
    about: "Helping customers adopt and customize AI tools.",
    summary:
      "I help customers install and configure OpenClaw, and after developing an in-depth understanding of their business, I customize Skills around their needs.",
    openclawTitle: "OpenClaw Setup & Customization",
    openclawHighlights: [
      `Helped ${FACTS.openclaw.customersServed} customers install and configure OpenClaw.`,
      "Developed an in-depth understanding of five customers’ business workflows and customized Skills around customer needs.",
    ],
  },
};

export type SectionKey =
  | "summary"
  | "work"
  | "education"
  | "skills"
  | "projects";

export type SectionTitles = Record<SectionKey, string>;

export function getSectionTitles(locale: Locale): SectionTitles {
  const ui = UI[locale];
  return {
    summary: ui.aboutSection,
    work: ui.workSection,
    education: ui.educationSection,
    skills: ui.skillsSection,
    projects: ui.projectsSection,
  };
}

export function getResumeData(locale: Locale): ResumeData {
  const text = copy[locale];
  return {
    name: FACTS.name,
    about: text.about,
    summary: text.summary,
    siteUrl: FACTS.siteUrl,
    contact: {
      social: [
        {
          name: "GitHub",
          url: FACTS.githubUrl,
          icon: "github",
        },
        {
          name: "X",
          url: FACTS.xUrl,
          icon: "x",
        },
      ],
    },
    education: [],
    work: [],
    skills: [],
    projects: [
      {
        title: text.openclawTitle,
        start: FACTS.openclaw.start,
        end: FACTS.openclaw.end,
        highlights: [...text.openclawHighlights],
        techStack: [],
      },
    ],
  };
}
