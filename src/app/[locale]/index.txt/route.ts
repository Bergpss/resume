import { notFound } from "next/navigation";
import { getResumeData } from "@/data/resume-data";
import { resumeBlocks } from "@/lib/document";
import { isLocale, LOCALES } from "@/lib/i18n";
import { renderText } from "@/lib/text";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return new Response(renderText(resumeBlocks(getResumeData(locale), locale)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
