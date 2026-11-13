import { notFound } from "next/navigation";
import { getResumeData } from "@/data/resume-data";
import { llmsBlocks } from "@/lib/document";
import { isLocale, LOCALES } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";

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
  return new Response(
    renderMarkdown(llmsBlocks(getResumeData(locale), locale)),
    {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
}
