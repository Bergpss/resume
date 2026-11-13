import type React from "react";
import { DouyinIcon } from "@/components/icons/douyin-icon";
import { XIcon } from "@/components/icons/x-icon";
import { XiaohongshuIcon } from "@/components/icons/xiaohongshu-icon";
import { Section } from "@/components/ui/section";
import type { ContentPlatform, ContentPlatformIcon } from "@/lib/types";

const PLATFORM_ICONS: Record<
  ContentPlatformIcon,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  x: XIcon,
  douyin: DouyinIcon,
  xiaohongshu: XiaohongshuIcon,
};

interface PlatformItemProps {
  platform: ContentPlatform;
}

function PlatformItem({ platform }: PlatformItemProps) {
  const { name, icon, note } = platform;
  const Icon = PLATFORM_ICONS[icon];

  return (
    <li className="min-w-0">
      <span className="inline-flex items-center gap-1.5">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-medium">{name}</span>
      </span>
      {note ? (
        <p className="mt-0.5 text-pretty text-xs text-muted-foreground print:text-[10px] print:leading-tight">
          {note}
        </p>
      ) : null}
    </li>
  );
}

interface ContentCreationProps {
  title: string;
  highlights: string[];
  platforms: ContentPlatform[];
  platformsLabel: string;
}

export function ContentCreation({
  title,
  highlights,
  platforms,
  platformsLabel,
}: ContentCreationProps) {
  return (
    <Section title={title} titleId="content-creation">
      <article className="print:break-inside-avoid">
        <ul className="list-inside list-disc text-pretty text-xs text-body print:text-[10px] print:leading-tight">
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <ul
          className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3 print:mt-1.5 print:gap-x-5 print:gap-y-1.5"
          aria-label={platformsLabel}
        >
          {platforms.map((platform) => (
            <PlatformItem key={platform.icon} platform={platform} />
          ))}
        </ul>
      </article>
    </Section>
  );
}
