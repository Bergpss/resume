import type { Locale } from "@/lib/i18n";
import { localePath, siteName } from "@/lib/i18n";
import { getCurrentRole } from "@/lib/resume";
import type { ResumeData } from "@/lib/types";

export function generateResumeStructuredData(data: ResumeData, locale: Locale) {
  const {
    name,
    about,
    avatar,
    siteUrl,
    personalWebsiteUrl,
    contact,
    work,
    education,
    skills,
  } = data;
  const currentRole = getCurrentRole(work);
  const pageUrl = new URL(localePath(locale), siteUrl).href;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: siteName(name, locale),
    description: about,
    url: pageUrl,
    mainEntity: {
      "@type": "Person",
      name,
      description: about,
      url: pageUrl,
      ...(avatar ? { image: new URL(avatar.src, siteUrl).href } : {}),
      sameAs: [
        ...(personalWebsiteUrl ? [personalWebsiteUrl] : []),
        ...contact.social.map(({ url }) => url),
      ],
      ...(currentRole
        ? {
            jobTitle: currentRole.title,
            worksFor: {
              "@type": "Organization",
              name: currentRole.company,
              ...(currentRole.link ? { url: currentRole.link } : {}),
            },
          }
        : {}),
      ...(education.length > 0
        ? {
            alumniOf: education.map(({ school }) => ({
              "@type": "EducationalOrganization",
              name: school,
            })),
          }
        : {}),
      ...(skills.length > 0 ? { knowsAbout: skills } : {}),
    },
  };
}
