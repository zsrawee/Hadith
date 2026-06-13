import Foundation

/// Core data model representing a single Hadith.
struct Hadith: Identifiable, Codable {
    let id: String
    let hadithArabic: String
    let sanad: String
    let hadithEnglish: String
}
