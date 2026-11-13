import { DateRange } from "@/components/ui/date-range";
import { ExternalArrow } from "@/components/ui/external-arrow";
import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";
import { displayUrl } from "@/lib/resume";
import type { Project } from "@/lib/types";

interface ProjectLinkProps {
  title: string;
  link?: string;
}

function ProjectLink({ title, link }: ProjectLinkProps) {
  if (!link) {
    return <span>{title}</span>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
      aria-label={`${title} project (opens in new tab)`}
    >
      {title}
      <ExternalArrow />
    </a>
  );
}

interface ProjectItemProps {
  project: Project;
  periodLabel: string;
  presentLabel: string;
  technologiesLabel: string;
}

function ProjectItem({
  project,
  periodLabel,
  presentLabel,
  technologiesLabel,
}: ProjectItemProps) {
  const { title, description, highlights, techStack, link, start, end } =
    project;

  return (
    <>
      <div className="flex items-baseline justify-between gap-x-2">
        <h3 className="text-sm font-medium leading-snug print:leading-none">
          <ProjectLink title={title} link={link} />
        </h3>
        {start ? (
          <DateRange
            start={start}
            end={end}
            label={periodLabel}
            presentLabel={presentLabel}
          />
        ) : null}
      </div>
      {link ? (
        <a
          className="hidden underline print:block print:break-words print:text-[10px] print:leading-tight"
          href={link}
        >
          {displayUrl(link)}
        </a>
      ) : null}
      {description ? (
        <p className="mt-1 text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight">
          {description}
        </p>
      ) : null}
      {highlights && highlights.length > 0 ? (
        <ul className="mt-1.5 list-inside list-disc text-pretty text-xs text-body print:mt-0.5 print:text-[10px] print:leading-tight">
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
      <TagList
        tags={techStack}
        label={technologiesLabel}
        className="mt-2 print:mt-0.5"
      />
    </>
  );
}

interface ProjectsProps {
  projects: Project[];
  title: string;
  periodLabel: string;
  presentLabel: string;
  technologiesLabel: string;
}

export function Projects({
  projects,
  title,
  periodLabel,
  presentLabel,
  technologiesLabel,
}: ProjectsProps) {
  return (
    <Section title={title} titleId="side-projects" className="scroll-mb-16">
      <div className="space-y-8 print:space-y-1.5">
        {projects.map((project) => (
          <article key={project.title} className="print:break-inside-avoid">
            <ProjectItem
              project={project}
              periodLabel={periodLabel}
              presentLabel={presentLabel}
              technologiesLabel={technologiesLabel}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
