interface DateRangeProps {
  start: string;
  end: string | null | undefined;
  label: string;
  presentLabel: string;
}

export function DateRange({ start, end, label, presentLabel }: DateRangeProps) {
  const endText = end ?? presentLabel;
  return (
    <div
      className="shrink-0 text-[13px] tabular-nums text-muted-foreground print:leading-none"
      title={`${label}: ${start} to ${endText}`}
    >
      {start} - {endText}
    </div>
  );
}
