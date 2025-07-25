// src/utils/loadTranslations.ts
export async function loadTranslations(locale: string) {
  const moduleNames = [
    'common',
    'auth',
    'landing',
    'profile',
    'forum',
    'exam',
    'courses',
    'admin'
  ];
  
  const translations: Record<string, any> = {};
  
  // Load all translation modules for the locale
  for (const moduleName of moduleNames) {
    try {
      const moduleTranslations = await import(`../../messages/${locale}/${moduleName}.json`);
      Object.assign(translations, moduleTranslations.default);
    } catch (_error) {
      console.warn(`Failed to load ${moduleName} translations for ${locale}`);
    }
  }
  
  return translations;
}