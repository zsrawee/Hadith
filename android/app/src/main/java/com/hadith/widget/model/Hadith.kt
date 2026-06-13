package com.hadith.widget.model

/**
 * Core data model representing a single Hadith.
 *
 * @property id         Unique identifier (e.g. "bukhari_1")
 * @property hadithArabic  The main Hadith text in Arabic
 * @property sanad      Chain of narrators (السند) in Arabic
 * @property hadithEnglish English translation of the Hadith
 */
data class Hadith(
    val id: String,
    val hadithArabic: String,
    val sanad: String,
    val hadithEnglish: String
)
