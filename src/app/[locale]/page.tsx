import { notFound } from "next/navigation";
import type React from "react";
import { CommandMenu } from "@/components/command-menu";
import { PageControls } from "@/components/page-controls";
import type { SectionKey } from "@/data/resume-data";
import { getResumeData, getSectionTitles } from "@/data/resume-data";
import { isLocale, localePath, otherLocale, UI } from "@/lib/i18n";
import { getContactLinks, getSections } from "@/lib/resume";
import { generateResumeStructuredData } from "@/lib/structured-data";
import { Education } from "../components/education";
import { Header } from "../components/header";
import { Projects } from "../components/projects";
import { Skills } from "../components/skills";
import { Summary } from "../components/summary";
import { WorkExperience } from "../components/work-experience";

export const dynamic = "force-static";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const data = getResumeData(locale);
  const titles = getSectionTitles(locale);
  const ui = UI[locale];
  const structuredData = generateResumeStructuredData(data, locale);
  const counterpart = otherLocale(locale);
  const commandMenuLinks = [
    ...getContactLinks(data, locale).filter(
      ({ icon }) => icon !== "mail" && icon !== "phone"
    ),
    {
      label:
        UI[counterpart][counterpart === "zh" ? "languageZh" : "languageEn"],
      href: localePath(counterpart),
      text: localePath(counterpart),
      icon: "globe" as const,
    },
  ];
  const content: Record<SectionKey, React.ReactNode> = {
    summary: <Summary summary={data.summary} title={titles.summary} />,
    work: (
      <WorkExperience
        work={data.work}
        title={titles.work}
        periodLabel={ui.period}
        presentLabel={ui.present}
        technologiesLabel={ui.technologiesUsed}
      />
    ),
    education: (
      <Education
        education={data.education}
        title={titles.education}
        periodLabel={ui.period}
        presentLabel={ui.present}
      />
    ),
    skills: (
      <Skills
        skills={data.skills}
        title={titles.skills}
        skillsLabel={ui.skillsList}
      />
    ),
    projects: (
      <Projects
        projects={data.projects}
        title={titles.projects}
        periodLabel={ui.period}
        presentLabel={ui.present}
        technologiesLabel={ui.technologiesUsed}
      />
    ),
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <main
        className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-0 md:p-16"
        id="main-content"
      >
        <section
          className="mx-auto w-full max-w-2xl space-y-8 print:max-w-none print:space-y-3"
          aria-label={ui.resumeContent}
        >
          <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
            <PageControls locale={locale} />
            <Header data={data} locale={locale} />
          </div>

          {getSections(data, locale).map((key, index) => (
            <div
              key={key}
              className="animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 75}ms` }}
            >
              {content[key]}
            </div>
          ))}
        </section>

        <CommandMenu
          links={commandMenuLinks}
          labels={{
            title: ui.commandMenu,
            hintBefore: ui.commandMenuHintBefore,
            hintAfter: ui.commandMenuHintAfter,
            placeholder: ui.commandPlaceholder,
            empty: ui.commandEmpty,
            actions: ui.commandActions,
            links: ui.commandLinks,
            print: ui.print,
            close: ui.commandClose,
          }}
        />
      </main>
    </>
  );
}
