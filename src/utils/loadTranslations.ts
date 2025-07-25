// src/utils/loadTranslations.ts
export async function loadTranslations(locale: string) {
  const modules = [
    'common',
    'auth',
    'forum',
    'exam',
    'courses',
    'admin'
  ];
  
  const translations: Record<string, any> = {};
  
  // Load all translation modules for the locale
  for (const module of modules) {
    try {
      const moduleTranslations = await import(`../../messages/${locale}/${module}.json`);
      Object.assign(translations, moduleTranslations.default);
    } catch (error) {
      console.warn(`Failed to load ${module} translations for ${locale}`);
    }
  }
  
  return translations;
}