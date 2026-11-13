import { Section } from "../../components/ui/section";

interface AboutProps {
  summary: string;
  title: string;
  className?: string;
}

export function Summary({ summary, title, className }: AboutProps) {
  return (
    <Section title={title} titleId="about-section" className={className}>
      <div className="text-pretty text-sm text-body print:text-[12px] print:leading-tight">
        {summary}
      </div>
    </Section>
  );
}
