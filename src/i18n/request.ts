import {getRequestConfig} from 'next-intl/server';
import { locales } from './locales';

export default getRequestConfig(async ({locale}) => {
  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  } catch {
    // Fallback to English if translation file is missing
    return {
      locale,
      messages: (await import(`../messages/en.json`)).default,
    };
  }
});
