import SwiftUI

@main
struct HadithWidgetApp: App {

    @StateObject private var speechRecognizer = SpeechRecognizer()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(speechRecognizer)
                .onOpenURL { url in
                    // Handle deep link: hadithapp://practice?id=XYZ
                    guard url.scheme == "hadithapp",
                          url.host == "practice",
                          let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
                          let idParam = components.queryItems?.first(where: { $0.name == "id" })?.value
                    else { return }

                    // Post notification so SpeechPracticeView can observe it
                    NotificationCenter.default.post(
                        name: .init("DeepLinkPractice"),
                        object: nil,
                        userInfo: ["hadithID": idParam]
                    )
                }
        }
    }
}
