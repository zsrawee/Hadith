'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import HadithCard from '@/components/HadithCard';

export default function RandomPage() {
  const t = useTranslations();
  const [hadith, setHadith] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(setCollections).catch(() => {});
  }, []);

  const loadRandom = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/random';
      if (selectedCollection) url += `?collection=${selectedCollection}`;
      const res = await fetch(url);
      const data = await res.json();
      setHadith(data);
    } catch {}
    setLoading(false);
  }, [selectedCollection]);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-accent-500 rounded-full" />
            <h1 className="text-2xl font-bold text-surface-100">{t('random.title')}</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-8">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="select flex-1 min-w-[200px]"
            >
              <option value="">{t('random.all')}</option>
              {collections.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title_en || c.title}</option>
              ))}
            </select>
            <button onClick={loadRandom} className="btn-primary" disabled={loading}>
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? t('loading') : t('random.generate')}
            </button>
          </div>

          {/* Result */}
          {!hadith && !loading && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-surface-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-surface-500">{t('random.placeholder')}</p>
            </div>
          )}

          {loading && (
            <div className="glass rounded-2xl p-8">
              <div className="skeleton h-6 w-1/3 mb-4" />
              <div className="skeleton h-40 w-full mb-4" />
              <div className="skeleton h-6 w-1/2" />
            </div>
          )}

          {hadith && !loading && (
            <HadithCard arabic={hadith.arabic} english={hadith.english} detailed />
          )}
        </div>
      </main>
    </>
  );
}
