import { LocaleSwitcher } from "@/components/locale-switcher";
import { PrintButton } from "@/components/print-button";
import type { Locale } from "@/lib/i18n";
import { UI } from "@/lib/i18n";

interface PageControlsProps {
  locale: Locale;
}

export function PageControls({ locale }: PageControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-1 print:hidden">
      <LocaleSwitcher locale={locale} />
      <PrintButton label={UI[locale].print} />
    </div>
  );
}
