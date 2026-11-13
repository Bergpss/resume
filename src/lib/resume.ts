import "server-only";
import { domainToUnicode } from "node:url";
import type { SectionKey } from "@/data/resume-data";
import { getSectionTitles } from "@/data/resume-data";
import type { Locale } from "@/lib/i18n";
import { UI } from "@/lib/i18n";
import type { ResumeData, SocialIcon, WorkEntry } from "@/lib/types";

export type ContactIcon = SocialIcon | "globe" | "mail" | "phone";

export type { SectionKey };

export function getSections(data: ResumeData, locale: Locale): SectionKey[] {
  const titles = getSectionTitles(locale);
  const keys = Object.keys(titles) as SectionKey[];
  return keys.filter((key) => data[key].length > 0);
}

export interface ContactLink {
  label: string;
  href: string;
  text: string;
  icon: ContactIcon;
}

export function getCurrentRole(work: WorkEntry[]): WorkEntry | undefined {
  return work.find((job) => job.end === null);
}

export function getPageTitle(data: ResumeData, locale: Locale): string {
  return `${data.name} - ${getCurrentRole(data.work)?.title ?? UI[locale].pageTitleFallback}`;
}

const decodeNonAsciiEscapes = (text: string) =>
  text.replace(/(?:%[89A-F][0-9A-F])+/g, (escapes) => {
    try {
      return decodeURIComponent(escapes);
    } catch {
      return escapes;
    }
  });

export function displayUrl(url: string): string {
  const { hostname, port, pathname, search, hash } = new URL(url);
  const host = domainToUnicode(hostname).replace(/^www\./, "");
  const rest = `${pathname.replace(/\/$/, "")}${search}${hash}`;
  return `${host}${port ? `:${port}` : ""}${decodeNonAsciiEscapes(rest)}`;
}

export function getContactLinks(
  { personalWebsiteUrl, contact }: ResumeData,
  locale: Locale
): ContactLink[] {
  const ui = UI[locale];
  const links: ContactLink[] = [];
  if (personalWebsiteUrl) {
    links.push({
      label: ui.personalWebsite,
      href: personalWebsiteUrl,
      text: displayUrl(personalWebsiteUrl),
      icon: "globe",
    });
  }
  if (contact.email) {
    links.push({
      label: ui.email,
      href: `mailto:${contact.email}`,
      text: contact.email,
      icon: "mail",
    });
  }
  if (contact.tel) {
    links.push({
      label: ui.phone,
      href: `tel:${contact.tel}`,
      text: contact.tel,
      icon: "phone",
    });
  }
  for (const social of contact.social) {
    links.push({
      label: social.name,
      href: social.url,
      text: displayUrl(social.url),
      icon: social.icon,
    });
  }
  return links;
}

export function formatDateRange(
  start: string,
  end: string | null | undefined,
  presentLabel: string
): string {
  return `${start} - ${end ?? presentLabel}`;
}
