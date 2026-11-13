import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type React from "react";
import { getResumeData } from "@/data/resume-data";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  isLocale,
  LOCALES,
  localePath,
  OG_LOCALE,
  otherLocale,
  siteName,
} from "@/lib/i18n";
import { getPageTitle } from "@/lib/resume";
import "../globals.css";

const geistPixelSquare = localFont({
  src: "../../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
  adjustFontFallback: false,
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw;
  const data = getResumeData(locale);
  const xProfile = data.contact.social.find(({ icon }) => icon === "x");
  const canonical = localePath(locale);

  return {
    metadataBase: new URL(data.siteUrl),
    title: getPageTitle(data, locale),
    description: data.about,
    authors: [{ name: data.name }],
    creator: data.name,
    publisher: data.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "profile",
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[otherLocale(locale)]],
      url: canonical,
      siteName: siteName(data.name, locale),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      card: "summary_large_image",
      creator: xProfile && `@${new URL(xProfile.url).pathname.split("/")[1]}`,
    },
    alternates: {
      canonical,
      languages: {
        "zh-CN": localePath("zh"),
        en: localePath("en"),
        "x-default": localePath(DEFAULT_LOCALE),
      },
      types: { "text/markdown": `${canonical}/index.md` },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${GeistMono.variable} ${geistPixelSquare.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
