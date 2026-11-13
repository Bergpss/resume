import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";

interface SkillsProps {
  skills: readonly string[];
  title: string;
  skillsLabel: string;
}

export function Skills({ skills, title, skillsLabel }: SkillsProps) {
  return (
    <Section title={title} titleId="skills-section">
      <TagList tags={skills} label={skillsLabel} variant="skills" />
    </Section>
  );
}
