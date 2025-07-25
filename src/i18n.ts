// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const supportedLocales = ["et", "ukr"];
  const defaultLocale = "et";

  const requestedLocale = await requestLocale;
  const locale =
    requestedLocale && supportedLocales.includes(requestedLocale)
      ? requestedLocale
      : defaultLocale;

  // Check if we're using the new modular structure
  try {
    // Try to load from modular structure
    const moduleNames = [
      "common",
      "auth",
      "landing",
      "profile",
      "forum",
      "exam",
      "courses",
      "admin",
    ];
    const messages: Record<string, any> = {};

    for (const moduleName of moduleNames) {
      try {
        const moduleMessages = await import(
          `../messages/${locale}/${moduleName}.json`
        );
        Object.assign(messages, moduleMessages.default || moduleMessages);
      } catch (_error) {
        console.warn(`Failed to load ${moduleName} translations for ${locale}`);
      }
    }

    // If we got some messages, use them
    if (Object.keys(messages).length > 0) {
      return {
        locale,
        messages,
      };
    }
  } catch (error) {
    console.warn(
      "Failed to load modular translations, falling back to single file"
    );
  }

  // Fallback to old single file structure
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Failed to load translations for ${locale}`, error);
    return {
      locale,
      messages: {},
    };
  }
});
