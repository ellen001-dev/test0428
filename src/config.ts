export const SITE = {
  website: "https://www.servicetoolbase.com/",
  author: "ServiceToolBase",
  profile: "https://www.servicetoolbase.com/",
  desc: "Real reviews of HVAC, plumbing & electrical software. Real costs, real user feedback. Find the best tool for your service business without vendor bias.",
  title: "ServiceToolBase - Honest Contractor Software Reviews & Comparisons",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/ellen001-dev/test0428/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/New_York", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
