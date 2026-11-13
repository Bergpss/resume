export const LOCALES = ["zh", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export const HTML_LANG = {
  zh: "zh-CN",
  en: "en",
} as const;

export const OG_LOCALE = {
  zh: "zh_CN",
  en: "en_US",
} as const;

export function localePath(locale: Locale, suffix = ""): string {
  return `/${locale}${suffix}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export interface UiCopy {
  aboutSection: string;
  workSection: string;
  educationSection: string;
  skillsSection: string;
  projectsSection: string;
  pageTitleFallback: string;
  print: string;
  language: string;
  languageZh: string;
  languageEn: string;
  commandMenu: string;
  commandMenuHintBefore: string;
  commandMenuHintAfter: string;
  commandActions: string;
  commandLinks: string;
  commandEmpty: string;
  commandPlaceholder: string;
  commandClose: string;
  period: string;
  technologiesUsed: string;
  skillsList: string;
  resumeContent: string;
  location: string;
  personalWebsite: string;
  email: string;
  phone: string;
  present: string;
}

export const UI: Record<Locale, UiCopy> = {
  zh: {
    aboutSection: "简介",
    workSection: "工作经历",
    educationSection: "教育经历",
    skillsSection: "技能",
    projectsSection: "项目",
    pageTitleFallback: "简历",
    print: "打印 / 另存为 PDF",
    language: "语言",
    languageZh: "中文",
    languageEn: "English",
    commandMenu: "命令菜单",
    commandMenuHintBefore: "按下 ",
    commandMenuHintAfter: " 打开命令菜单",
    commandActions: "操作",
    commandLinks: "链接",
    commandEmpty: "没有匹配的结果。",
    commandPlaceholder: "输入命令或搜索…",
    commandClose: "关闭",
    period: "时间",
    technologiesUsed: "使用的技术",
    skillsList: "技能列表",
    resumeContent: "简历内容",
    location: "地点",
    personalWebsite: "个人网站",
    email: "邮箱",
    phone: "电话",
    present: "至今",
  },
  en: {
    aboutSection: "About",
    workSection: "Work Experience",
    educationSection: "Education",
    skillsSection: "Skills",
    projectsSection: "Projects",
    pageTitleFallback: "Resume",
    print: "Print / Save as PDF",
    language: "Language",
    languageZh: "中文",
    languageEn: "English",
    commandMenu: "Command menu",
    commandMenuHintBefore: "Press ",
    commandMenuHintAfter: " to open the command menu",
    commandActions: "Actions",
    commandLinks: "Links",
    commandEmpty: "No results found.",
    commandPlaceholder: "Type a command or search...",
    commandClose: "Close",
    period: "Period",
    technologiesUsed: "Technologies used",
    skillsList: "List of skills",
    resumeContent: "Resume Content",
    location: "Location",
    personalWebsite: "Personal Website",
    email: "Email",
    phone: "Phone",
    present: "Present",
  },
};

export function siteName(name: string, locale: Locale): string {
  return locale === "zh" ? `${name} 的简历` : `${name}'s CV`;
}
