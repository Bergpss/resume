import type { SectionKey } from "@/data/resume-data";
import { getSectionTitles } from "@/data/resume-data";
import type { Locale } from "@/lib/i18n";
import { localePath, UI } from "@/lib/i18n";
import {
  displayUrl,
  formatDateRange,
  getContactLinks,
  getSections,
} from "@/lib/resume";
import type { ResumeData } from "@/lib/types";

export interface Link {
  href: string;
  url: string;
}

export interface Row {
  label: string;
  text: string;
  link: Link;
}

export interface Entry {
  name: string;
  link?: Link;
  dates?: string;
  role?: string;
  description?: string;
  highlights: string[];
  tags: string[];
}

export type Inline = string | { code: string };

export type Block =
  | { kind: "title"; name: string; tagline: string }
  | { kind: "rows"; rows: Row[] }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; inlines: Inline[] }
  | ({ kind: "entry" } & Entry)
  | { kind: "tags"; tags: string[] };

const web = (href: string): Link => ({ href, url: displayUrl(href) });

const sections: Record<
  SectionKey,
  (data: ResumeData, locale: Locale) => Block[]
> = {
  summary: ({ summary }) => [{ kind: "paragraph", inlines: [summary] }],
  work: ({ work }) =>
    work.map((job) => ({
      kind: "entry",
      name: job.company,
      link: job.link ? web(job.link) : undefined,
      dates: job.period,
      role: job.title,
      description: job.description,
      highlights: job.highlights ?? [],
      tags: job.badges,
    })),
  education: ({ education }) =>
    education.map((school) => ({
      kind: "entry",
      name: school.school,
      dates: school.period,
      role: school.degree,
      highlights: school.highlights ?? [],
      tags: [],
    })),
  skills: ({ skills }) => [{ kind: "tags", tags: skills }],
  projects: ({ projects }, locale) =>
    projects.map((project) => ({
      kind: "entry",
      name: project.title,
      link: project.link ? web(project.link) : undefined,
      dates:
        project.period ??
        (project.start === undefined
          ? undefined
          : formatDateRange(project.start, project.end, UI[locale].present)),
      description: project.description,
      highlights: project.highlights ?? [],
      tags: project.techStack,
    })),
};

const title = ({ name, about }: ResumeData): Block => ({
  kind: "title",
  name,
  tagline: about,
});

const contactRows = (data: ResumeData, locale: Locale): Row[] => {
  const rows: Row[] = [];
  if (data.location && data.locationLink) {
    rows.push({
      label: UI[locale].location,
      text: data.location,
      link: web(data.locationLink),
    });
  }
  rows.push(
    ...getContactLinks(data, locale).map(({ label, text, href }) => ({
      label,
      text,
      link: { href, url: text },
    }))
  );
  return rows;
};

const body = (data: ResumeData, locale: Locale): Block[] => {
  const titles = getSectionTitles(locale);
  const rows = contactRows(data, locale);
  return [
    ...(rows.length > 0 ? [{ kind: "rows" as const, rows }] : []),
    ...getSections(data, locale).flatMap((key): Block[] => [
      { kind: "heading", text: titles[key] },
      ...sections[key](data, locale),
    ]),
  ];
};

export function resumeBlocks(data: ResumeData, locale: Locale): Block[] {
  return [title(data), ...body(data, locale)];
}

export function llmsBlocks(data: ResumeData, locale: Locale): Block[] {
  const site = new URL(data.siteUrl).origin;
  const markdown = `${site}${localePath(locale, "/index.md")}`;
  const text = `${site}${localePath(locale, "/index.txt")}`;
  const inlines: Inline[] =
    locale === "zh"
      ? [
          "这份简历也提供 Markdown 与 80 列纯文本：",
          { code: markdown },
          "、",
          { code: text },
          "。",
        ]
      : [
          "This resume is also available as markdown and as 80-column text at ",
          { code: markdown },
          " and ",
          { code: text },
          ".",
        ];
  return [title(data), { kind: "paragraph", inlines }, ...body(data, locale)];
}
