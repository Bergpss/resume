import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n";

interface PageControlsProps {
  locale: Locale;
}

export function PageControls({ locale }: PageControlsProps) {
  return (
    <div className="mb-2 flex items-center justify-end print:hidden">
      <LocaleSwitcher locale={locale} />
    </div>
  );
}
