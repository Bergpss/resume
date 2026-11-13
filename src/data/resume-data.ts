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
  work: {
    company: "北京南北天地科技股份有限公司",
    companyEn: "Beijing Snsoft Technology Co.,Ltd",
    start: "2022-09",
    end: "2025-05",
  },
  hermesCad: {
    start: "2026-09",
  },
  contentCreation: {
    // public_metrics.followers_count for @PssBerg via the official X public
    // user lookup, recorded in America/Los_Angeles. This is a snapshot, not live.
    xFollowers: 948,
    xFollowersAsOf: "2026-11-13",
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

export const EXPECTED_HERMES_CAD = {
  zh: {
    title: "Hermes Agent CAD 读取 Skill",
    period: "2026年9月",
    highlights: [
      "为长期工程领域客户定制 CAD 读取 Skill，处理天正施工图（DWG/DXF）。天正自定义 TCH 实体没有代理图形，普通工具读不到标注。",
      "按图框、视口与分图标题位置归组说明、材料引注和尺寸，输出 Markdown。主路径由看图软件先转为 T3 通用图纸，再用 Python ezdxf 提取，DWG 经 LibreDWG dwg2dxf 转换；无法转 T3 时，用 LibreDWG dwgread JSON 启发式解码自定义实体，并提示可能遗漏或错误，关键数字需复核。",
      "交付 Skill 包、指南与 Hermes 使用提示词。客户反馈：其图纸算量工作流由数天缩短至数分钟。",
    ],
  },
  en: {
    title: "CAD Reading Skill for Hermes Agent",
    period: "Sep 2026",
    highlights: [
      "Built a CAD reading Skill for a long-term client in the engineering field to work with Tianzheng (天正) construction drawings (DWG/DXF). Custom TCH entities have no proxy graphics, so ordinary tools cannot read the annotations.",
      "Groups notes, material callouts, and dimensions by title block, viewport, and sheet-title position, and writes Markdown. The main path converts drawings to the generic T3 format in a viewer, then extracts them with Python ezdxf; DWG files go through LibreDWG dwg2dxf. When T3 conversion is not available, a fallback heuristically decodes custom entities from LibreDWG dwgread JSON and flags possible omissions or errors so key figures can be checked.",
      "Delivered the Skill package, a guide, and Hermes prompts. Client feedback: their drawing quantity takeoff workflow went from several days to a few minutes.",
    ],
  },
} as const;

export const EXPECTED_WORK = {
  zh: {
    company: "北京南北天地科技股份有限公司",
    title: "Java 开发工程师",
    period: "2022年9月—2025年5月",
    highlights: [
      "参与 ERP 产品研发，在大客户现场驻场开发。",
      "独立与运维同事及客户沟通需求，完成业务定制开发。",
      "优先使用 AI 工具辅助日常开发，并制作可复用的通用工具，减少重复劳动。",
    ],
  },
  en: {
    company: "Beijing Snsoft Technology Co.,Ltd",
    title: "Java Developer",
    period: "Sep 2022–May 2025",
    highlights: [
      "Worked on ERP product development and on-site customization for major clients.",
      "Independently clarified requirements with operations colleagues and clients and implemented business-specific customizations.",
      "Used AI tools in day-to-day development and built reusable utilities to reduce repetitive work.",
    ],
  },
} as const;

export const EXPECTED_CONTENT_CREATION = {
  zh: {
    highlights: [
      "主要制作 AI 相关视频。",
      "持续用通俗易懂的语言分享 AI 前沿讯息和基础知识。",
      "多平台累计播放量已超过 5.6 万。",
    ],
    platforms: ["X", "抖音", "小红书"],
    xNote: "关注者 948（2026年11月13日记录），接近 1,000。",
  },
  en: {
    highlights: [
      "I mainly make AI-related videos.",
      "I keep sharing AI news and the basics in plain, accessible language.",
      "Combined views across platforms have passed 56,000.",
    ],
    platforms: ["X", "Douyin", "Xiaohongshu"],
    xNote: "948 followers as of Nov 13, 2026, approaching 1,000.",
  },
} as const;

const copy: Record<
  Locale,
  {
    about: string;
    openclawTitle: string;
    openclawHighlights: readonly [string, string];
    educationSchool: string;
    educationDegree: string;
    educationPeriod: string;
    workTitle: string;
    workPeriod: string;
    workHighlights: readonly [string, string, string];
    hermesTitle: string;
    hermesPeriod: string;
    hermesHighlights: readonly [string, string, string];
    contentHighlights: readonly [string, string, string];
    contentPlatforms: readonly [string, string, string];
    contentXNote: string;
  }
> = {
  zh: {
    about: "用 AI 帮助用户解决实际问题，让世界更美好",
    openclawTitle: "OpenClaw 客户服务与定制",
    openclawHighlights: [
      `累计服务${FACTS.openclaw.customersServed}位客户，指导完成OpenClaw安装与配置。`,
      `深入了解其中${FACTS.openclaw.customersUnderstoodInDepth}位客户的业务，并根据客户业务需求定制Skills。`,
    ],
    educationSchool: "华侨大学",
    educationDegree:
      "计算机科学与技术学院 · 本科，计算机科学与技术（人工智能方向）",
    educationPeriod: "2018年9月—2022年6月",
    workTitle: "Java 开发工程师",
    workPeriod: "2022年9月—2025年5月",
    workHighlights: [
      "参与 ERP 产品研发，在大客户现场驻场开发。",
      "独立与运维同事及客户沟通需求，完成业务定制开发。",
      "优先使用 AI 工具辅助日常开发，并制作可复用的通用工具，减少重复劳动。",
    ],
    hermesTitle: "Hermes Agent CAD 读取 Skill",
    hermesPeriod: "2026年9月",
    hermesHighlights: [
      "为长期工程领域客户定制 CAD 读取 Skill，处理天正施工图（DWG/DXF）。天正自定义 TCH 实体没有代理图形，普通工具读不到标注。",
      "按图框、视口与分图标题位置归组说明、材料引注和尺寸，输出 Markdown。主路径由看图软件先转为 T3 通用图纸，再用 Python ezdxf 提取，DWG 经 LibreDWG dwg2dxf 转换；无法转 T3 时，用 LibreDWG dwgread JSON 启发式解码自定义实体，并提示可能遗漏或错误，关键数字需复核。",
      "交付 Skill 包、指南与 Hermes 使用提示词。客户反馈：其图纸算量工作流由数天缩短至数分钟。",
    ],
    contentHighlights: [
      "主要制作 AI 相关视频。",
      "持续用通俗易懂的语言分享 AI 前沿讯息和基础知识。",
      "多平台累计播放量已超过 5.6 万。",
    ],
    contentPlatforms: ["X", "抖音", "小红书"],
    contentXNote: "关注者 948（2026年11月13日记录），接近 1,000。",
  },
  en: {
    about:
      "Using AI to solve real problems for people and make the world a better place.",
    openclawTitle: "OpenClaw Setup & Customization",
    openclawHighlights: [
      `Helped ${FACTS.openclaw.customersServed} customers install and configure OpenClaw.`,
      "Developed an in-depth understanding of five customers’ business workflows and customized Skills around customer needs.",
    ],
    educationSchool: "Huaqiao University",
    educationDegree:
      "College of Computer Science and Technology · Bachelor's, Computer Science and Technology (Artificial Intelligence)",
    educationPeriod: "Sep 2018–Jun 2022",
    workTitle: "Java Developer",
    workPeriod: "Sep 2022–May 2025",
    workHighlights: [
      "Worked on ERP product development and on-site customization for major clients.",
      "Independently clarified requirements with operations colleagues and clients and implemented business-specific customizations.",
      "Used AI tools in day-to-day development and built reusable utilities to reduce repetitive work.",
    ],
    hermesTitle: "CAD Reading Skill for Hermes Agent",
    hermesPeriod: "Sep 2026",
    hermesHighlights: [
      "Built a CAD reading Skill for a long-term client in the engineering field to work with Tianzheng (天正) construction drawings (DWG/DXF). Custom TCH entities have no proxy graphics, so ordinary tools cannot read the annotations.",
      "Groups notes, material callouts, and dimensions by title block, viewport, and sheet-title position, and writes Markdown. The main path converts drawings to the generic T3 format in a viewer, then extracts them with Python ezdxf; DWG files go through LibreDWG dwg2dxf. When T3 conversion is not available, a fallback heuristically decodes custom entities from LibreDWG dwgread JSON and flags possible omissions or errors so key figures can be checked.",
      "Delivered the Skill package, a guide, and Hermes prompts. Client feedback: their drawing quantity takeoff workflow went from several days to a few minutes.",
    ],
    contentHighlights: [
      "I mainly make AI-related videos.",
      "I keep sharing AI news and the basics in plain, accessible language.",
      "Combined views across platforms have passed 56,000.",
    ],
    contentPlatforms: ["X", "Douyin", "Xiaohongshu"],
    contentXNote: "948 followers as of Nov 13, 2026, approaching 1,000.",
  },
};

export type SectionKey =
  | "summary"
  | "work"
  | "education"
  | "skills"
  | "projects"
  | "contentCreation";

export type SectionTitles = Record<SectionKey, string>;

export function getSectionTitles(locale: Locale): SectionTitles {
  const ui = UI[locale];
  return {
    summary: ui.aboutSection,
    projects: ui.projectsSection,
    contentCreation: ui.contentCreationSection,
    work: ui.workSection,
    education: ui.educationSection,
    skills: ui.skillsSection,
  };
}

export function getResumeData(locale: Locale): ResumeData {
  const text = copy[locale];
  return {
    name: FACTS.names[locale],
    about: text.about,
    summary: "",
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
    work: [
      {
        company: locale === "en" ? FACTS.work.companyEn : FACTS.work.company,
        badges: [],
        title: text.workTitle,
        start: FACTS.work.start,
        end: FACTS.work.end,
        period: text.workPeriod,
        description: "",
        highlights: [...text.workHighlights],
      },
    ],
    skills: [],
    projects: [
      {
        title: text.hermesTitle,
        start: FACTS.hermesCad.start,
        period: text.hermesPeriod,
        highlights: [...text.hermesHighlights],
        techStack: [],
      },
      {
        title: text.openclawTitle,
        start: FACTS.openclaw.start,
        end: FACTS.openclaw.end,
        highlights: [...text.openclawHighlights],
        techStack: [],
      },
    ],
    contentCreation: [
      {
        highlights: [...text.contentHighlights],
        platforms: [
          {
            name: text.contentPlatforms[0],
            icon: "x",
            url: FACTS.xUrl,
            note: text.contentXNote,
          },
          {
            name: text.contentPlatforms[1],
            icon: "douyin",
          },
          {
            name: text.contentPlatforms[2],
            icon: "xiaohongshu",
          },
        ],
      },
    ],
  };
}
