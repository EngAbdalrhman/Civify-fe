import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Always use a default locale since we're not using routing
  const locale = "en";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
