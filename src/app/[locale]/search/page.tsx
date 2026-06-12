'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getCollectionName } from '@/lib/collection-names';
import Navbar from '@/components/Navbar';
import HadithCard from '@/components/HadithCard';

interface SearchResult {
  arabic: any[];
  english: any[];
}

export default function SearchPage() {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [filterCollection, setFilterCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<any>(null);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(setCollections).catch(() => {});
  }, []);

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelectedHadith(null);
    try {
      let url = `/api/search?q=${encodeURIComponent(query)}&limit=50`;
      if (filterCollection) url += `&collection=${filterCollection}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || { arabic: [], english: [] });
    } catch {
      setResults({ arabic: [], english: [] });
    } finally {
      setLoading(false);
    }
  }, [query, filterCollection]);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSearched(false);
      return;
    }
    const timer = setTimeout(performSearch, 400);
    return () => clearTimeout(timer);
  }, [query, filterCollection, performSearch]);

  const allResults = [
    ...(results?.arabic || []).map((r: any) => ({ ...r, _lang: 'arabic' as const })),
    ...(results?.english || []).map((r: any) => ({ ...r, _lang: 'english' as const })),
  ];

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-accent-500 rounded-full" />
            <h1 className="text-2xl font-bold text-surface-100">{t('search.title')}</h1>
          </div>

          {/* Search input */}
          <div className="relative mb-4">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="input pl-12 pr-10"
              dir="auto"
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults(null); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-surface-500 uppercase tracking-wider mb-1.5">
                {t('search.filters.collection')}
              </label>
              <select
                value={filterCollection}
                onChange={(e) => setFilterCollection(e.target.value)}
                className="select"
              >
                <option value="">{t('search.filters.all')}</option>
                {collections.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title_en || c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-6">
                  <div className="skeleton h-4 w-1/4 mb-3" />
                  <div className="skeleton h-20 w-full mb-3" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && allResults.length > 0 && (
            <div className="mb-4 text-sm text-surface-500">
              {allResults.length} {allResults.length === 1 ? t('search.result') : t('search.results')} {t('search.for')} &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && searched && allResults.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-surface-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg text-surface-400 mb-2">{t('search.noResults.title')}</h3>
              <p className="text-surface-600">{t('search.noResults.desc')}</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-surface-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg text-surface-400 mb-2">{t('search.welcome.title')}</h3>
              <p className="text-surface-600">{t('search.welcome.desc')}</p>
            </div>
          )}

          {/* Result list */}
          {!loading && allResults.length > 0 && (
            <div className="space-y-4">
              {allResults.map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={async () => {
                    const urn = item.urn || item.arabic_urn;
                    if (!urn) return;
                    try {
                      const res = await fetch(`/api/hadiths/${urn}`);
                      const data = await res.json();
                      setSelectedHadith(data);
                    } catch {}
                  }}
                  className="card card-hover p-5 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-accent-400/80 uppercase tracking-wider">
                      {item.collection_id ? getCollectionName(item.collection_id)?.en || `Col ${item.collection_id}` : ''}
                    </span>
                    {(item.display_number || item.order_in_book) && (
                      <span className="text-xs text-surface-500">#{item.display_number || item.order_in_book}</span>
                    )}
                  </div>
                  {item._lang === 'arabic' ? (
                    <div className="font-arabic text-lg leading-[2] text-surface-100 text-right bg-surface-900/30 rounded-lg p-3 mb-2">
                      {item.content?.slice(0, 250) || ''}
                      {item.content?.length > 250 ? '...' : ''}
                    </div>
                  ) : (
                    <div className="text-surface-200 leading-relaxed mb-2">
                      {item.content?.slice(0, 250) || ''}
                      {item.content?.length > 250 ? '...' : ''}
                    </div>
                  )}
                  {item.narrator_prefix && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-surface-500">
                        <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {item.narrator_prefix?.slice(0, 60)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected hadith detail */}
          {selectedHadith && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                 onClick={() => setSelectedHadith(null)}>
              <div className="max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
                   onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button onClick={() => setSelectedHadith(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-surface-900/90 
                             border border-surface-700 flex items-center justify-center
                             text-surface-400 hover:text-surface-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <HadithCard arabic={selectedHadith.arabic} english={selectedHadith.english} detailed />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


