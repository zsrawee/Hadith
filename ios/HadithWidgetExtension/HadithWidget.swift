import SwiftUI
import WidgetKit

/// The timeline entry for the Hadith widget.
struct HadithEntry: TimelineEntry {
    let date: Date
    let hadith: Hadith
    let showEnglish: Bool
}

/// Timeline provider that supplies a random Hadith every few hours.
struct Provider: TimelineProvider {

    func placeholder(in context: Context) -> HadithEntry {
        HadithEntry(date: Date(), hadith: HadithWidgetRepository.random(), showEnglish: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (HadithEntry) -> Void) {
        let entry = HadithEntry(date: Date(), hadith: HadithWidgetRepository.random(), showEnglish: false)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HadithEntry>) -> Void) {
        var entries: [HadithEntry] = []

        // Generate a timeline of 1 entry per day for the next 3 days
        let currentDate = Date()
        for dayOffset in 0..<3 {
            let entryDate = Calendar.current.date(byAdding: .day, value: dayOffset, to: currentDate)!
            let hadith = HadithWidgetRepository.random()
            let entry = HadithEntry(date: entryDate, hadith: hadith, showEnglish: false)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}
