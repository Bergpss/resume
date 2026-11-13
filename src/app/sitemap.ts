import type { MetadataRoute } from "next";
import { FACTS } from "@/data/resume-data";
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    "zh-CN": new URL(localePath("zh"), FACTS.siteUrl).href,
    en: new URL(localePath("en"), FACTS.siteUrl).href,
    "x-default": new URL(localePath(DEFAULT_LOCALE), FACTS.siteUrl).href,
  };

  return LOCALES.map((locale) => ({
    url: new URL(localePath(locale), FACTS.siteUrl).href,
    changeFrequency: "monthly" as const,
    priority: locale === DEFAULT_LOCALE ? 1 : 0.8,
    alternates: { languages },
  }));
}
