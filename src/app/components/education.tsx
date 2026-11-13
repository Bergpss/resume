import { Section } from "@/components/ui/section";
import type { EducationEntry } from "@/lib/types";

interface EducationItemProps {
  education: EducationEntry;
  periodLabel: string;
}

function EducationItem({ education, periodLabel }: EducationItemProps) {
  const { school, period, degree, highlights = [] } = education;

  return (
    <>
      <div className="flex items-baseline justify-between gap-x-2">
        <h3 className="text-sm font-medium leading-snug print:leading-none">
          {school}
        </h3>
        <div
          className="shrink-0 text-[13px] tabular-nums text-muted-foreground print:leading-none"
          title={`${periodLabel}: ${period}`}
        >
          {period}
        </div>
      </div>
      <div className="mt-1.5 text-sm text-body print:mt-1 print:text-[12px] print:leading-tight">
        {degree}
      </div>
      {highlights.length > 0 ? (
        <ul className="mt-1.5 text-sm text-body print:mt-1 print:text-[12px] print:leading-tight">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

interface EducationListProps {
  education: readonly EducationEntry[];
  title: string;
  periodLabel: string;
  presentLabel: string;
}

export function Education({
  education,
  title,
  periodLabel,
}: EducationListProps) {
  return (
    <Section title={title} titleId="education-section">
      <div className="space-y-4 print:space-y-1">
        {education.map((item) => (
          <article key={item.school} className="print:break-inside-avoid">
            <EducationItem education={item} periodLabel={periodLabel} />
          </article>
        ))}
      </div>
    </Section>
  );
}
