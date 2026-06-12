import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from '@/i18n/locales';

export const { Link, useRouter, usePathname, redirect, permanentRedirect } =
  createSharedPathnamesNavigation({ locales });
