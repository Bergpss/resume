import type { Locale } from "@/lib/i18n";
import { UI } from "@/lib/i18n";
import type { ResumeData } from "@/lib/types";

export const FACTS = {
  names: {
    zh: "郭一博",
    en: "Berg",
  },
  siteUrl: "https://resume.guoyibo.top",
  githubUrl: "https://github.com/Bergpss",
  xUrl: "https://x.com/PssBerg",
  openclaw: {
    start: "2026-02-22",
    end: "2026-03-31",
    customersServed: 20,
    customersUnderstoodInDepth: 5,
  },
  education: {
    start: "2018-09",
    end: "2022-06",
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

export const EXPECTED_EDUCATION = {
  zh: {
    school: "华侨大学",
    degree: "计算机科学与技术学院 · 本科，计算机科学与技术（人工智能方向）",
    period: "2018年9月—2022年6月",
  },
  en: {
    school: "Huaqiao University",
    degree:
      "College of Computer Science and Technology · Bachelor's, Computer Science and Technology (Artificial Intelligence)",
    period: "Sep 2018–Jun 2022",
  },
} as const;

const copy: Record<
  Locale,
  {
    about: string;
    summary: string;
    openclawTitle: string;
    openclawHighlights: readonly [string, string];
    educationSchool: string;
    educationDegree: string;
    educationPeriod: string;
  }
> = {
  zh: {
    about: "用 AI 帮助用户解决实际问题，让世界更美好",
    summary:
      "我帮助客户安装、配置 OpenClaw，并在深入了解其业务后，按需求定制 Skills。",
    openclawTitle: "OpenClaw 客户服务与定制",
    openclawHighlights: [
      `累计服务${FACTS.openclaw.customersServed}位客户，指导完成OpenClaw安装与配置。`,
      `深入了解其中${FACTS.openclaw.customersUnderstoodInDepth}位客户的业务，并根据客户业务需求定制Skills。`,
    ],
    educationSchool: "华侨大学",
    educationDegree:
      "计算机科学与技术学院 · 本科，计算机科学与技术（人工智能方向）",
    educationPeriod: "2018年9月—2022年6月",
  },
  en: {
    about:
      "Using AI to solve real problems for people and make the world a better place.",
    summary:
      "I help customers install and configure OpenClaw, and after developing an in-depth understanding of their business, I customize Skills around their needs.",
    openclawTitle: "OpenClaw Setup & Customization",
    openclawHighlights: [
      `Helped ${FACTS.openclaw.customersServed} customers install and configure OpenClaw.`,
      "Developed an in-depth understanding of five customers’ business workflows and customized Skills around customer needs.",
    ],
    educationSchool: "Huaqiao University",
    educationDegree:
      "College of Computer Science and Technology · Bachelor's, Computer Science and Technology (Artificial Intelligence)",
    educationPeriod: "Sep 2018–Jun 2022",
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
    name: FACTS.names[locale],
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
    education: [
      {
        school: text.educationSchool,
        degree: text.educationDegree,
        start: FACTS.education.start,
        end: FACTS.education.end,
        period: text.educationPeriod,
      },
    ],
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
