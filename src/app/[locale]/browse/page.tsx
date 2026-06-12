'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import HadithCard from '@/components/HadithCard';

export default function BrowsePage() {
  const t = useTranslations();
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<any>(null);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(setCollections).catch(() => {});
  }, []);

  const loadBooks = async (collectionId: number) => {
    setSelectedCollection(collectionId);
    setSelectedBook(null);
    setHadiths([]);
    try {
      const res = await fetch(`/api/collections/${collectionId}/books`);
      const data = await res.json();
      setBooks(data);
    } catch {}
  };

  const loadHadiths = async (bookId: number) => {
    if (!selectedCollection) return;
    setSelectedBook(bookId);
    setLoading(true);
    try {
      const res = await fetch(`/api/hadiths?collection=${selectedCollection}&book=${bookId}&limit=30`);
      const data = await res.json();
      setHadiths(data.arabic || []);
    } catch {}
    setLoading(false);
  };

  const openHadith = async (urn: string) => {
    try {
      const res = await fetch(`/api/hadiths/${urn}`);
      const data = await res.json();
      setSelectedHadith(data);
    } catch {}
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-accent-500 rounded-full" />
            <h1 className="text-2xl font-bold text-surface-100">{t('browse.title')}</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="glass rounded-xl overflow-hidden sticky top-24 max-h-[70vh] flex flex-col">
                <div className="px-4 py-3 border-b border-surface-800 text-sm font-semibold text-accent-400 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t('browse.collections')}
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {collections.map((col: any) => (
                    <button
                      key={col.id}
                      onClick={() => loadBooks(col.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        selectedCollection === col.id
                          ? 'bg-accent-500/10 text-accent-400'
                          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                      }`}
                    >
                      <span className="font-arabic text-base">{col.title}</span>
                      <span className="block text-xs text-surface-600 mt-0.5">{col.title_en}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {!selectedCollection && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto text-surface-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-lg text-surface-400 mb-2">{t('browse.select')}</h3>
                  <p className="text-surface-600">{t('browse.selectDesc')}</p>
                </div>
              )}

              {/* Books grid */}
              {selectedCollection && !selectedBook && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {books.map((book: any) => (
                    <button
                      key={book.id}
                      onClick={() => loadHadiths(book.id)}
                      className="card card-hover p-4 text-left"
                    >
                      <div className="text-xs font-medium text-accent-400/70 mb-1.5">
                        {t('hadith.book')} {book.display_number || book.order_in_collection || book.id}
                      </div>
                      <div className="font-arabic text-base text-surface-100 leading-relaxed mb-1">
                        {book.title}
                      </div>
                      {book.title_en && (
                        <div className="text-xs text-surface-500 mb-2">{book.title_en}</div>
                      )}
                      <div className="text-xs text-surface-600">
                        {book.hadith_count || '?'} {t('browse.hadiths')}
                        {book.hadith_start ? ` (${book.hadith_start}-${book.hadith_end || '?'})` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Hadiths list */}
              {selectedBook && (
                <>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="btn-ghost mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Books
                  </button>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass rounded-xl p-6">
                          <div className="skeleton h-4 w-1/4 mb-3" />
                          <div className="skeleton h-16 w-full mb-3" />
                          <div className="skeleton h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {hadiths.map((h: any) => (
                        <div
                          key={h.urn}
                          onClick={() => openHadith(h.urn)}
                          className="card card-hover p-4 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-accent-400/70">
                              #{h.display_number || h.order_in_book}
                            </span>
                          </div>
                          <div className="font-arabic text-lg leading-[2] text-surface-100 text-right bg-surface-900/30 rounded-lg p-3 mb-2">
                            {h.content?.slice(0, 200)}
                            {h.content?.length > 200 ? '...' : ''}
                          </div>
                          {h.narrator_prefix && (
                            <div className="text-xs text-surface-500">
                              <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {h.narrator_prefix?.slice(0, 80)}
                            </div>
                          )}
                          {h.grades && (
                            <div className="mt-2">
                              <span className="badge-sahih text-[10px]">{h.grades}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hadith Modal */}
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
      </main>
    </>
  );
}
