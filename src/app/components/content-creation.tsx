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

interface PlatformIconProps {
  icon: ContentPlatformIcon;
}

function PlatformIcon({ icon }: PlatformIconProps) {
  const Icon = PLATFORM_ICONS[icon];

  return (
    <span
      className="inline-flex size-3.5 shrink-0 items-center justify-center self-center"
      aria-hidden="true"
    >
      <Icon className="size-full" />
    </span>
  );
}

interface PlatformItemProps {
  platform: ContentPlatform;
}

function PlatformItem({ platform }: PlatformItemProps) {
  const { name, icon, followers, recordedOn } = platform;

  return (
    <li
      data-platform={icon}
      className="inline-flex shrink-0 items-baseline gap-x-1.5"
    >
      <PlatformIcon icon={icon} />
      <span>{name}</span>
      {followers ? <span>{followers}</span> : null}
      {recordedOn ? (
        <time
          className="text-muted-foreground tabular-nums"
          dateTime={recordedOn}
        >
          {recordedOn}
        </time>
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
          className="mt-2 flex min-w-0 max-w-full flex-wrap items-baseline gap-x-4 gap-y-1.5 text-xs text-body print:mt-1 print:gap-x-4 print:gap-y-1 print:text-[10px] print:leading-tight"
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
