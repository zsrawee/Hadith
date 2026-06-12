// Collection names without DB dependency (safe for client components)
export const COLLECTION_NAMES: Record<number, { ar: string; en: string }> = {
  1: { ar: 'صحيح البخاري', en: 'Sahih al-Bukhari' },
  2: { ar: 'صحيح مسلم', en: 'Sahih Muslim' },
  3: { ar: 'سنن النسائي', en: "Sunan an-Nasa'i" },
  10: { ar: 'سنن أبي داود', en: 'Sunan Abi Dawud' },
  30: { ar: 'جامع الترمذي', en: 'Jami` at-Tirmidhi' },
  38: { ar: 'سنن ابن ماجه', en: 'Sunan Ibn Majah' },
  40: { ar: 'موطأ مالك', en: 'Muwatta Malik' },
  50: { ar: 'مسند أحمد', en: 'Musnad Ahmad' },
  101: { ar: 'الأربعون النووية', en: "An-Nawawi's 40 Hadith" },
  102: { ar: 'الأربعينات', en: 'Collections of Forty' },
  110: { ar: 'رياض الصالحين', en: 'Riyad as-Salihin' },
  113: { ar: 'مشكاة المصابيح', en: 'Mishkat al-Masabih' },
  115: { ar: 'الأدب المفرد', en: 'Al-Adab Al-Mufrad' },
  130: { ar: 'الشمائل المحمدية', en: "Ash-Shama'il Al-Muhammadiyah" },
  200: { ar: 'بلوغ المرام', en: 'Bulugh al-Maram' },
  300: { ar: 'حصن المسلم', en: 'Hisn al-Muslim' },
};

export function getCollectionName(id: number): { ar: string; en: string } {
  return COLLECTION_NAMES[id] || { ar: `المجموعة ${id}`, en: `Collection ${id}` };
}

export function getCollectionNames(): Record<number, { ar: string; en: string }> {
  return COLLECTION_NAMES;
}
