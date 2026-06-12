import { useTranslations } from 'next-intl';
import { getCollectionNames } from '@/lib/collection-names';
import ClientHome from './ClientHome';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const t = useTranslations('home');
  const names = getCollectionNames();
  
  const majorIds = [1, 2, 3, 10, 30, 38];
  const majorCollections = majorIds.map(id => ({
    id,
    name_ar: names[id]?.ar || '',
    name_en: names[id]?.en || '',
  }));

  return (
    <ClientHome
      bismillah={t('bismillah')}
      featuredTitle={t('featured')}
      collectionsTitle={t('collections')}
      ctaSearch={t('cta.search')}
      ctaRandom={t('cta.random')}
      majorCollections={majorCollections}
    />
  );
}
