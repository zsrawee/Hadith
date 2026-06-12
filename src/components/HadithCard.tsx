'use client';

import { useTranslations } from 'next-intl';
import { getCollectionName } from '@/lib/collection-names';
import { useState } from 'react';

interface Props {
  arabic: any;
  english?: any | null;
  featured?: boolean;
  detailed?: boolean;
}

function extractGrade(gradesStr: string) {
  if (!gradesStr) return null;
  const lower = gradesStr.toLowerCase();
  if (lower.includes('صحيح') || lower.includes('sahih')) 
    return { label: 'Sahih (صحيح)', cls: 'badge-sahih', icon: 'check' };
  if (lower.includes('حسن') || lower.includes('hasan')) 
    return { label: 'Hasan (حسن)', cls: 'badge-hasan', icon: 'star' };
  if (lower.includes('ضعيف') || lower.includes('daif') || lower.includes('dhaif')) 
    return { label: "Da'if (ضعيف)", cls: 'badge-daif', icon: 'alert' };
  return { label: gradesStr.slice(0, 30), cls: 'badge-sahih', icon: 'tag' };
}

function extractSanad(arabic: any): string[] {
  const narrators: string[] = [];
  if (arabic.narrators) {
    try {
      const parsed = JSON.parse(arabic.narrators);
      if (Array.isArray(parsed)) {
        parsed.forEach((n: any) => {
          if (typeof n === 'string') narrators.push(n);
          else if (n.name) narrators.push(n.name);
        });
      }
    } catch {}
  }
  if (narrators.length === 0 && arabic.narrator_prefix) {
    const parts = arabic.narrator_prefix.split(/،|,|عَنْ|حَدَّثَنَا|حَدَّثَنِي|أَخْبَرَنَا|أَنَّ/).filter((p: string) => p.trim());
    parts.forEach((p: string) => {
      const trimmed = p.trim();
      if (trimmed.length > 3) narrators.push(trimmed);
    });
  }
  return narrators;
}

export default function HadithCard({ arabic, english, featured, detailed }: Props) {
  const t = useTranslations();
  const [copied, setCopied] = useState<'arabic' | 'english' | null>(null);
  const grade = extractGrade(arabic?.grades || '');
  const sanad = extractSanad(arabic);
  const colName = getCollectionName(arabic?.collection_id || 1);

  const copyText = async (lang: 'arabic' | 'english') => {
    const text = lang === 'arabic' ? arabic?.content : english?.content;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(lang);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(lang);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (!arabic) return null;

  return (
    <div className={`glass rounded-2xl overflow-hidden ${featured ? 'animate-glow' : ''}`}>
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-accent-500 via-emerald-500 to-accent-500" />
      
      <div className="p-6 md:p-8">
        {/* Copy buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {arabic.content && (
            <button onClick={() => copyText('arabic')} className="btn-icon group" title={t('hadith.copyArabic')}>
              {copied === 'arabic' ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
          {english?.content && (
            <button onClick={() => copyText('english')} className="btn-icon group" title={t('hadith.copyEnglish')}>
              {copied === 'english' ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Narrator prefix */}
        {arabic.narrator_prefix && (
          <div className="flex items-start gap-2 mb-4 text-sm text-accent-400/80 bg-accent-500/5 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="font-arabic leading-relaxed">{arabic.narrator_prefix}</span>
            {arabic.narrator_postfix && (
              <span className="text-surface-500"> — {arabic.narrator_postfix}</span>
            )}
          </div>
        )}

        {/* Arabic text */}
        {arabic.content && (
          <div className="font-arabic text-xl md:text-2xl leading-[2.2] text-surface-100 text-right bg-surface-900/50 
                        rounded-xl p-5 mb-4 border border-surface-800/50">
            {arabic.content}
          </div>
        )}

        {/* English text */}
        {english?.content && (
          <div className="text-surface-200 leading-relaxed bg-surface-900/30 rounded-xl p-5 mb-4 
                        border-l-2 border-accent-500/50">
            {english.narrator_prefix && (
              <span className="font-semibold text-accent-400">{english.narrator_prefix} </span>
            )}
            {english.content}
            {english.narrator_postfix && (
              <span className="text-surface-500 italic"> ({english.narrator_postfix})</span>
            )}
          </div>
        )}

        {/* Meta tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-surface-800/80 text-surface-300 border border-surface-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {colName.en}
          </span>
          {(arabic.display_number || arabic.order_in_book) && (
            <span className="badge bg-surface-800/80 text-surface-300 border border-surface-700">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              #{arabic.display_number || arabic.order_in_book}
            </span>
          )}
          {grade && (
            <span className={grade.cls}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {grade.icon === 'check' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : grade.icon === 'star' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
              {grade.label}
            </span>
          )}
        </div>

        {/* Sanad (Chain) */}
        {detailed && sanad.length > 0 && (
          <div className="bg-surface-900/50 rounded-xl p-5 border border-surface-800/50 mt-4">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-accent-400 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {t('hadith.chain')}
            </div>
            <div className="space-y-1">
              {sanad.map((narrator, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-surface-800/50 transition-colors">
                  <span className="text-surface-600 text-sm">{i === 0 ? '📖' : '↑'}</span>
                  <span className="font-arabic text-sm text-surface-200">{narrator}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg">
                <span className="text-surface-600 text-sm">↑</span>
                <span className="font-arabic text-sm text-accent-400 font-bold">
                  {t('hadith.prophet')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        {arabic.comments && (
          <div className="mt-4 px-4 py-3 bg-surface-900/30 rounded-xl border border-surface-800/30">
            <p className="text-xs text-surface-500 italic">{arabic.comments}</p>
          </div>
        )}

        {/* Narrators info */}
        {arabic.narrators && detailed && (
          <div className="mt-3 px-4 py-2 bg-surface-900/20 rounded-xl">
            <p className="text-xs text-surface-500">
              <span className="font-semibold text-surface-400">{t('hadith.narrators')}:</span>{' '}
              {typeof arabic.narrators === 'string' 
                ? arabic.narrators.slice(0, 120) + (arabic.narrators.length > 120 ? '...' : '')
                : JSON.stringify(arabic.narrators).slice(0, 120)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
