'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import HadithCard from '@/components/HadithCard';

interface CollectionInfo {
  id: number;
  name_ar: string;
  name_en: string;
}

interface Props {
  bismillah: string;
  featuredTitle: string;
  collectionsTitle: string;
  ctaSearch: string;
  ctaRandom: string;
  majorCollections: CollectionInfo[];
}

interface Stats {
  collection_count?: number;
  total_books?: number;
  total_chapters?: number;
}

export default function ClientHome({
  bismillah, featuredTitle, collectionsTitle,
  ctaSearch, ctaRandom, majorCollections
}: Props) {
  const t = useTranslations();
  const [featured, setFeatured] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [randomRes, statsRes] = await Promise.all([
          fetch('/api/random'),
          fetch('/api/stats'),
        ]);
        const randomData = await randomRes.json();
        const statsData = await statsRes.json();
        setFeatured(randomData);
        setStats(statsData.statistics || {});
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-950 to-surface-950" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <p className="text-2xl md:text-3xl font-arabic text-accent-400 mb-6 animate-fade-in">
            {bismillah}
          </p>
          <h1 className="text-5xl md:text-7xl font-arabic font-bold text-surface-100 mb-2 animate-slide-up">
            نور الحديث
          </h1>
          <p className="text-lg md:text-xl text-accent-400/80 tracking-[0.15em] uppercase mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Nur al-Hadith — The Light of Prophetic Traditions
          </p>
          <p className="text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            Explore the timeless wisdom of Prophet Muhammad ﷺ through authenticated hadith collections. 
            Search, browse, and discover the treasures of Islamic scholarship.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mb-10 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-400">
                {stats.collection_count || '—'}
              </div>
              <div className="text-xs text-surface-500 uppercase tracking-wider mt-1">
                {t('home.stats.collections')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-400">
                {stats.total_books || '—'}
              </div>
              <div className="text-xs text-surface-500 uppercase tracking-wider mt-1">
                {t('home.stats.books')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-400">
                {stats.total_chapters || '—'}
              </div>
              <div className="text-xs text-surface-500 uppercase tracking-wider mt-1">
                {t('home.stats.chapters')}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link href="/search" className="btn-primary text-base px-8 py-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {ctaSearch}
            </Link>
            <Link href="/random" className="btn-secondary text-base px-8 py-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {ctaRandom}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Hadith */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-accent-500 rounded-full" />
          <h2 className="text-2xl font-bold text-surface-100">{featuredTitle}</h2>
        </div>
        
        {loading ? (
          <div className="glass rounded-2xl p-8">
            <div className="skeleton h-8 w-3/4 mb-4" />
            <div className="skeleton h-40 w-full mb-4" />
            <div className="skeleton h-6 w-1/2" />
          </div>
        ) : featured ? (
          <HadithCard arabic={featured.arabic} english={featured.english} featured />
        ) : (
          <div className="glass rounded-2xl p-8 text-center text-surface-500">
            Failed to load featured hadith
          </div>
        )}
      </section>

      {/* Major Collections */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-accent-500 rounded-full" />
          <h2 className="text-2xl font-bold text-surface-100">{collectionsTitle}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {majorCollections.map((col) => (
            <Link
              key={col.id}
              href={`/browse?collection=${col.id}`}
              className="card card-hover p-6 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center
                              group-hover:bg-accent-500/20 transition-all duration-300">
                  <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="font-arabic text-lg text-surface-100 mb-1 leading-relaxed">
                {col.name_ar}
              </h3>
              <p className="text-sm text-surface-400">{col.name_en}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
