import Foundation

/// Duplicate Hadith model for the widget extension target.
struct Hadith: Identifiable, Codable {
    let id: String
    let hadithArabic: String
    let sanad: String
    let hadithEnglish: String
}
