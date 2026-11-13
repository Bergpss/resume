import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getResumeData } from "@/data/resume-data";
import { isLocale, LOCALES } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamic = "force-static";

export const alt = "Berg";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const colors = { bg: "#fafaf8", ink: "#1a1815", body: "#4a4744" };

const readGeist = (file: string) =>
  readFile(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans", file)
  );

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = isLocale(locale) ? getResumeData(locale) : getResumeData("en");
  const [geistRegular, geistBold, nameFont] = await Promise.all([
    readGeist("Geist-Regular.ttf"),
    readGeist("Geist-Bold.ttf"),
    locale === "zh"
      ? readFile(join(process.cwd(), "src/assets/fonts/noto-sans-sc-og.ttf"))
      : Promise.resolve(undefined),
  ]);
  // Geist has no CJK glyphs. The Chinese share image uses a tiny local
  // Noto Sans SC subset for the display name only.
  const tagline = locale === "zh" ? undefined : data.about;
  const nameFontFamily = locale === "zh" ? "Noto Sans SC" : "Geist";

  const fonts: Array<{
    name: string;
    data: Buffer;
    weight: 400 | 700;
    style: "normal";
  }> = [
    { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
    { name: "Geist", data: geistBold, weight: 700, style: "normal" },
  ];
  if (nameFont) {
    fonts.push({
      name: "Noto Sans SC",
      data: nameFont,
      weight: 400,
      style: "normal",
    });
  }

  return new ImageResponse(
    <div
      style={{
        background: colors.bg,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            color: colors.ink,
            fontFamily: nameFontFamily,
          }}
        >
          {data.name}
        </div>
        {tagline ? (
          <div
            style={{
              fontSize: "1.5rem",
              color: colors.body,
              maxWidth: "600px",
              lineHeight: "1.4",
              marginTop: "1rem",
            }}
          >
            {tagline}
          </div>
        ) : null}
        <div
          style={{ fontSize: "1rem", color: colors.body, marginTop: "2rem" }}
        >
          {new URL(data.siteUrl).host}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    }
  );
}
