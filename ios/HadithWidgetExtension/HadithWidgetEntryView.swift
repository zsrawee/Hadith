import SwiftUI
import WidgetKit

/// The SwiftUI view that renders the Hadith widget content.
struct HadithWidgetEntryView: View {

    var entry: HadithEntry

    /// Key for UserDefaults to persist the "show English" toggle state.
    private let showEnglishKey = "widget_show_english"

    @State private var showEnglish: Bool = false

    var body: some View {
        ZStack {
            // Background
            Color(red: 0.04, green: 0.12, blue: 0.18) // Navy #0A1F2E
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 6) {

                // Sanad
                Text(entry.hadith.sanad)
                    .font(.system(size: 10))
                    .foregroundColor(Color(white: 0.7))
                    .lineLimit(2)

                // Hadith text (Arabic or English)
                Text(showEnglish ? entry.hadith.hadithEnglish : entry.hadith.hadithArabic)
                    .font(showEnglish ? .system(size: 14, weight: .medium) : .system(size: 16, weight: .medium))
                    .foregroundColor(Color(red: 0.96, green: 0.93, blue: 0.84)) // Cream #F5EDD6
                    .lineLimit(4)

                Spacer(minLength: 0)

                // Bottom controls
                HStack {
                    Spacer()

                    // Toggle EN/AR
                    if #available(iOS 17.0, *) {
                        Button(intent: ToggleLanguageIntent()) {
                            Text(showEnglish ? "عرض AR" : "Show EN")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(Color(red: 0.79, green: 0.66, blue: 0.30)) // Gold #C9A84C
                        }
                        .buttonStyle(.plain)
                    } else {
                        // Fallback – link to the app for older iOS
                        Link("Show EN", destination: URL(string: "hadithapp://practice?id=\(entry.hadith.id)")!)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 0.79, green: 0.66, blue: 0.30))
                    }

                    // Speech practice button - opens deep link
                    Link(destination: URL(string: "hadithapp://practice?id=\(entry.hadith.id)")!) {
                        Text("🎤")
                            .font(.system(size: 18))
                    }
                }
            }
            .padding(12)
        }
        .onAppear {
            // Read persisted toggle state
            showEnglish = UserDefaults(suiteName: "group.com.hadith.widget")?.bool(forKey: showEnglishKey) ?? false
        }
        .onChange(of: showEnglish) { newValue in
            UserDefaults(suiteName: "group.com.hadith.widget")?.set(newValue, forKey: showEnglishKey)
        }
        .widgetURL(nil) // Prevent the widget from opening the app on tap (we use buttons)
    }
}

// MARK: - App Intent for iOS 17+ interactive toggle

@available(iOS 17.0, *)
struct ToggleLanguageIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Language"

    func perform() async throws -> some IntentResult {
        // Toggle the shared state
        let defaults = UserDefaults(suiteName: "group.com.hadith.widget")
        let current = defaults?.bool(forKey: "widget_show_english") ?? false
        defaults?.set(!current, forKey: "widget_show_english")
        return .result()
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    HadithWidgetBundle()
} timeline: {
    HadithEntry(
        date: Date(),
        hadith: HadithWidgetRepository.random(),
        showEnglish: false
    )
}
