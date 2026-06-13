import Foundation

/// Repository providing sample Hadith data for both the main app and widget.
/// In production this would fetch from a local database or API.
struct HadithRepository {

    private static let allHadiths: [Hadith] = [
        Hadith(
            id: "bukhari_1",
            hadithArabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
            sanad: "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ، قَالَ: حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ، قَالَ: أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ...",
            hadithEnglish: "The Messenger of Allah (ﷺ) said: 'Actions are judged by intentions, and each person will be rewarded according to his intention...'"
        ),
        Hadith(
            id: "muslim_1",
            hadithArabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ...",
            sanad: "حَدَّثَنِي أَبُو خَيْثَمَةَ، حَدَّثَنَا وَكِيعٌ، حَدَّثَنَا كَهْمَسٌ، عَنْ عَبْدِ اللَّهِ بْنِ بُرَيْدَةَ...",
            hadithEnglish: "The Messenger of Allah (ﷺ) said: 'Islam is built upon five: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah...'"
        ),
        Hadith(
            id: "nawawi_1",
            hadithArabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
            sanad: "عَنْ أَبِي ذَرٍّ جُنْدُبِ بْنِ جُنَادَةَ، وَأَبِي عَبْدِ الرَّحْمَنِ مُعَاذِ بْنِ جَبَلٍ رَضِيَ اللَّهُ عَنْهُمَا...",
            hadithEnglish: "The Messenger of Allah (ﷺ) said: 'Fear Allah wherever you are, and follow up a bad deed with a good deed and it will erase it...'"
        ),
        Hadith(
            id: "tirmidhi_1",
            hadithArabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
            sanad: "حَدَّثَنَا قُتَيْبَةُ، حَدَّثَنَا ابْنُ لَهِيعَةَ، عَنْ يَزِيدَ بْنِ عَمْرٍو الْمَعَافِرِيِّ...",
            hadithEnglish: "The Messenger of Allah (ﷺ) said: 'The most complete of the believers in faith are those with the best character.'"
        ),
        Hadith(
            id: "abu_dawud_1",
            hadithArabic: "مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ",
            sanad: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ عَمْرٍو، قَالَ: حَدَّثَنَا سُفْيَانُ، عَنْ مَنْصُورٍ...",
            hadithEnglish: "The Messenger of Allah (ﷺ) said: 'He who does not show mercy to the people, Allah will not show mercy to him.'"
        )
    ]

    // MARK: - Public API

    /// Returns the hadith matching the given ID, if any.
    static func hadith(with id: String) -> Hadith? {
        allHadiths.first { $0.id == id }
    }

    /// Returns a random hadith (for the widget).
    static func randomHadith() -> Hadith {
        allHadiths.randomElement()!
    }

    /// Returns all hadiths.
    static func all() -> [Hadith] {
        allHadiths
    }
}
