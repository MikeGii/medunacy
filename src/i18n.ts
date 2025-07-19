import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  const supportedLocales = ['et', 'ukr'];
  const defaultLocale = 'et';
  
  const requestedLocale = await requestLocale;
  const locale = requestedLocale && supportedLocales.includes(requestedLocale) 
    ? requestedLocale 
    : defaultLocale;
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});