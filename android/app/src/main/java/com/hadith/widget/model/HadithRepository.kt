package com.hadith.widget.model

/**
 * Repository providing sample Hadith data.
 * In a production app this would fetch from the hadith package or a local database.
 */
object HadithRepository {

    private val hadithList = listOf(
        Hadith(
            id = "bukhari_1",
            hadithArabic = "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
            sanad = "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ، قَالَ: حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ، قَالَ: أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ، أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ، يَقُولُ: سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ، قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، يَقُولُ: «إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...»",
            hadithEnglish = "The Messenger of Allah (ﷺ) said: 'Actions are judged by intentions, and each person will be rewarded according to his intention...'"
        ),
        Hadith(
            id = "muslim_1",
            hadithArabic = "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ",
            sanad = "حَدَّثَنِي أَبُو خَيْثَمَةَ، حَدَّثَنَا وَكِيعٌ، حَدَّثَنَا كَهْمَسٌ، عَنْ عَبْدِ اللَّهِ بْنِ بُرَيْدَةَ، عَنْ يَحْيَى بْنِ يَعْمَرَ، عَنِ ابْنِ عُمَرَ، قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ...»",
            hadithEnglish = "The Messenger of Allah (ﷺ) said: 'Islam is built upon five: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakat, performing Hajj, and fasting Ramadan.'"
        ),
        Hadith(
            id = "nawawi_1",
            hadithArabic = "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
            sanad = "عَنْ أَبِي ذَرٍّ جُنْدُبِ بْنِ جُنَادَةَ، وَأَبِي عَبْدِ الرَّحْمَنِ مُعَاذِ بْنِ جَبَلٍ رَضِيَ اللَّهُ عَنْهُمَا، عَنْ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، قَالَ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ»",
            hadithEnglish = "The Messenger of Allah (ﷺ) said: 'Fear Allah wherever you are, and follow up a bad deed with a good deed and it will erase it, and behave with good character towards people.'"
        ),
        Hadith(
            id = "tirmidhi_1",
            hadithArabic = "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
            sanad = "حَدَّثَنَا قُتَيْبَةُ، حَدَّثَنَا ابْنُ لَهِيعَةَ، عَنْ يَزِيدَ بْنِ عَمْرٍو الْمَعَافِرِيِّ، عَنْ أَبِي عَبْدِ الرَّحْمَنِ الْحُبُلِيِّ، عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو، قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا»",
            hadithEnglish = "The Messenger of Allah (ﷺ) said: 'The most complete of the believers in faith are those with the best character.'"
        ),
        Hadith(
            id = "abu_dawud_1",
            hadithArabic = "مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ",
            sanad = "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ عَمْرٍو، قَالَ: حَدَّثَنَا سُفْيَانُ، عَنْ مَنْصُورٍ، عَنْ إِبْرَاهِيمَ، عَنْ عَلْقَمَةَ، عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ، قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ»",
            hadithEnglish = "The Messenger of Allah (ﷺ) said: 'He who does not show mercy to the people, Allah will not show mercy to him.'"
        )
    )

    /** Retrieve a specific Hadith by its unique ID. */
    fun getHadithById(id: String): Hadith? = hadithList.find { it.id == id }

    /** Return a random Hadith (useful for widgets). */
    fun getRandomHadith(): Hadith = hadithList.random()

    /** Return all hadiths. */
    fun getAll(): List<Hadith> = hadithList
}
