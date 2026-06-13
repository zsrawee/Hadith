import SwiftUI
import WidgetKit

/// The @main entry point that registers the widget bundle.
@main
struct HadithWidgetBundle: WidgetBundle {

    var body: some Widget {
        HadithWidget()
    }
}

/// The widget configuration.
struct HadithWidget: Widget {

    let kind: String = "com.hadith.widget.hadith"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: Provider()
        ) { entry in
            HadithWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Hadith of the Day")
        .description("Display a daily Hadith with Arabic text and English translation.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
