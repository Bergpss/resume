import type { Locale } from "@/lib/i18n";
import { localePath, UI } from "@/lib/i18n";

interface LocaleSwitcherProps {
  locale: Locale;
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const ui = UI[locale];
  const options: { locale: Locale; label: string }[] = [
    { locale: "zh", label: ui.languageZh },
    { locale: "en", label: ui.languageEn },
  ];

  return (
    <nav aria-label={ui.language} className="flex items-center gap-0.5">
      {options.map((option, index) => {
        const current = option.locale === locale;
        return (
          <span key={option.locale} className="inline-flex items-center">
            {index > 0 ? (
              <span
                className="px-0.5 text-xs text-muted-foreground"
                aria-hidden="true"
              >
                /
              </span>
            ) : null}
            <a
              href={localePath(option.locale)}
              hrefLang={option.locale === "zh" ? "zh-CN" : "en"}
              lang={option.locale === "zh" ? "zh-CN" : "en"}
              className={
                current
                  ? "inline-flex min-h-9 items-center px-1 text-xs text-foreground underline"
                  : "inline-flex min-h-9 items-center px-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
              }
              aria-current={current ? "page" : undefined}
            >
              {option.label}
            </a>
          </span>
        );
      })}
    </nav>
  );
}
