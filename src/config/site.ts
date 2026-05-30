export const siteConfig = {
  name: "The Number Garden",
  url: "https://thenumbergarden.com",
  description:
    "The Number Garden is a Portland math studio offering math tutoring, enrichment, and small-group programs for children and families.",
  contactEmail: "info@thenumbergarden.com",
  founderEmail: "paul@thenumbergarden.com",
  scholarshipsEmail: "scholarships@thenumbergarden.com",
  transportationEmail: "carpool@thenumbergarden.com",
  analyticsId: "G-046MWE06FH",
  familyVisitBookingUrl:
    "https://calendly.com/thenumbergarden/intro-visit?hide_event_type_details=1",
  calendlyWidgetCssUrl: "https://calendly.com/assets/external/widget.css",
  calendlyWidgetScriptUrl: "https://calendly.com/assets/external/widget.js",
  newsletterActionUrl: "https://buttondown.com/api/emails/embed-subscribe/TheNumberGarden",
  newsletterReferralUrl: "https://buttondown.com/refer/TheNumberGarden",
  logoPath: "/brand/logo-mark.svg",
  socialImagePath: "/social-preview.png",
  socialImageAlt: "The Number Garden logo mark beside The Number Garden wordmark.",
  mapUrl: "https://maps.app.goo.gl/5X5HBHmZuPr2mLGt6",
  address: {
    street: "1717 NE 42nd Ave Suite 0100B",
    city: "Portland",
    region: "OR",
    country: "US",
  },
  membership: {
    monthlyTuition: "$400",
    seasonTuition: "$1,000",
    seasonLength: "3-month season",
    weeklyVisits: "two visits each week",
    youngChildFormat: "Ages 3 to 5 attend with a caregiver",
    olderChildFormat: "Ages 6 and up move into a child-only format",
    currentHours: "Tuesday and Thursday from 3pm to 6pm, and Saturday from 9am to 11am",
  },
  camp: {
    dateRange: "August 10-14, 2026",
    weekdayRange: "Monday-Friday, August 10-14, 2026",
    youngerGroup: "Ages 6-10: 9-11am",
    olderGroup: "Ages 11-15: 1-4pm",
    emailSubject: "August math camp interest",
  },
};

export const absoluteUrl = (path: string, site: string | URL | undefined = siteConfig.url) =>
  new URL(path, site ?? siteConfig.url);

export const mailtoHref = (email: string, subject?: string) => {
  const subjectParam = subject ? `?subject=${encodeURIComponent(subject)}` : "";

  return `mailto:${email}${subjectParam}`;
};

export const formatStudioAddress = ({ includeRegion = false } = {}) =>
  [
    siteConfig.address.street,
    siteConfig.address.city,
    includeRegion && siteConfig.address.region,
  ]
    .filter(Boolean)
    .join(", ");

export const getLocalBusinessJsonLd = (site: string | URL | undefined = siteConfig.url) => {
  const socialImageUrl = absoluteUrl(siteConfig.socialImagePath, site).toString();
  const logoUrl = absoluteUrl(siteConfig.logoPath, site).toString();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": absoluteUrl("/#business", site).toString(),
    name: siteConfig.name,
    url: absoluteUrl("/", site).toString(),
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    image: socialImageUrl,
    logo: logoUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    areaServed: {
      "@type": "City",
      name: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    hasMap: siteConfig.mapUrl,
    sameAs: [siteConfig.mapUrl],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Math tutoring",
          areaServed: "Portland, OR",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Math enrichment",
          areaServed: "Portland, OR",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Small-group math programs",
          areaServed: "Portland, OR",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "August math camp",
          areaServed: "Portland, OR",
        },
      },
    ],
  };
};
