import { ExternalArrow } from "@/components/ui/external-arrow";
import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";
import type { WorkEntry } from "@/lib/types";

interface CompanyLinkProps {
  company: WorkEntry["company"];
  link: WorkEntry["link"];
}

function CompanyLink({ company, link }: CompanyLinkProps) {
  if (!link) {
    return <span>{company}</span>;
  }

  return (
    <a
      className="hover:underline"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${company} company website`}
    >
      {company}
      <ExternalArrow />
    </a>
  );
}

interface WorkExperienceItemProps {
  work: WorkEntry;
  periodLabel: string;
  technologiesLabel: string;
}

function WorkExperienceItem({
  work,
  periodLabel,
  technologiesLabel,
}: WorkExperienceItemProps) {
  const { company, link, badges, title, period, description, highlights } =
    work;
  const items = highlights ?? [];

  return (
    <>
      <div className="space-y-1 print:space-y-0.5">
        <div className="flex items-baseline justify-between gap-x-2">
          <h3 className="text-sm font-medium leading-snug print:leading-none">
            <CompanyLink company={company} link={link} />
          </h3>
          <div
            className="shrink-0 text-[13px] tabular-nums text-muted-foreground print:leading-none"
            title={`${periodLabel}: ${period}`}
          >
            {period}
          </div>
        </div>
        <h4 className="text-sm leading-snug text-body print:text-[12px] print:leading-tight">
          {title}
        </h4>
      </div>
      {description || items.length > 0 ? (
        <div className="mt-1.5 text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight">
          {description ? description : null}
          {items.length > 0 ? (
            <ul className="list-inside list-disc">
              {items.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <TagList
        tags={badges}
        label={technologiesLabel}
        className="mt-2 print:mt-0.5"
      />
    </>
  );
}

interface WorkExperienceProps {
  work: WorkEntry[];
  title: string;
  periodLabel: string;
  presentLabel: string;
  technologiesLabel: string;
}

export function WorkExperience({
  work,
  title,
  periodLabel,
  technologiesLabel,
}: WorkExperienceProps) {
  return (
    <Section title={title} titleId="work-experience">
      <div className="space-y-8 print:space-y-1.5">
        {work.map((item) => (
          <article
            key={`${item.company}-${item.start}`}
            className="print:break-inside-avoid"
          >
            <WorkExperienceItem
              work={item}
              periodLabel={periodLabel}
              technologiesLabel={technologiesLabel}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
