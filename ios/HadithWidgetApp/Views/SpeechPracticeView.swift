import SwiftUI
import Speech

/// View that lets the user practice reciting a Hadith using speech recognition.
/// Compares the user's spoken Arabic to the original text and displays feedback.
struct SpeechPracticeView: View {

    let hadith: Hadith

    @EnvironmentObject private var speechRecognizer: SpeechRecognizer
    @State private var isRecording = false
    @State private var transcribedText = ""
    @State private var feedbackMessage = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Reference Hadith
                VStack(alignment: .leading, spacing: 8) {
                    Text("Original Hadith")
                        .font(.headline)
                        .foregroundColor(.secondary)

                    Text(hadith.sanad)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(hadith.hadithArabic)
                        .font(.title3)
                        .foregroundColor(.primary)

                    Text(hadith.hadithEnglish)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Microphone button
                Button(action: toggleRecording) {
                    Label(
                        isRecording ? "Stop Recording" : "Start Recitation",
                        systemImage: isRecording ? "stop.circle.fill" : "mic.circle.fill"
                    )
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(isRecording ? Color.red : Color.teal)
                    .cornerRadius(12)
                }

                // Status
                if isRecording {
                    HStack {
                        ProgressView()
                        Text("Listening...")
                            .foregroundColor(.secondary)
                    }
                }

                // Transcribed text
                if !transcribedText.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Your Recitation")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text(transcribedText)
                            .font(.body)
                            .padding()
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                    }
                }

                // Feedback
                if !feedbackMessage.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Feedback")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text(feedbackMessage)
                            .font(.body)
                            .padding()
                            .background(feedbackMessage.hasPrefix("✅") ? Color.green.opacity(0.15) : Color.orange.opacity(0.15))
                            .cornerRadius(8)
                    }
                }

                Spacer()
            }
            .padding()
        }
        .navigationTitle("Speech Practice")
        .navigationBarTitleDisplayMode(.inline)
        .onReceive(NotificationCenter.default.publisher(for: .init("DeepLinkPractice"))) { notification in
            if let id = notification.userInfo?["hadithID"] as? String,
               id == hadith.id {
                // Auto-start recording when deep-linked
                startRecording()
            }
        }
    }

    // MARK: - Recording

    private func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }

    private func startRecording() {
        feedbackMessage = ""
        transcribedText = ""

        speechRecognizer.requestAuthorization { authorized in
            guard authorized else {
                feedbackMessage = "⚠️ Speech recognition permission denied. Please enable in Settings."
                return
            }
            DispatchQueue.main.async {
                isRecording = true
                self.speechRecognizer.startRecording { result, error in
                    if let error {
                        DispatchQueue.main.async {
                            self.feedbackMessage = "Error: \(error.localizedDescription)"
                            self.isRecording = false
                        }
                        return
                    }
                    if let result {
                        DispatchQueue.main.async {
                            self.transcribedText = result.bestTranscription.formattedString
                            // Once we have a final result, compare
                            if result.isFinal {
                                self.isRecording = false
                                self.compareRecitation(spoken: self.transcribedText)
                            }
                        }
                    }
                }
            }
        }
    }

    private func stopRecording() {
        speechRecognizer.stopRecording()
        isRecording = false
        compareRecitation(spoken: transcribedText)
    }

    // MARK: - Comparison

    /// Compares the user's spoken text with the original Hadith Arabic.
    private func compareRecitation(spoken: String) {
        guard !spoken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            feedbackMessage = "No speech detected. Please try again."
            return
        }

        let ref = hadith.hadithArabic
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .lowercased()
            .folding(options: .diacriticInsensitive, locale: Locale(identifier: "ar"))

        let spokenClean = spoken
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .lowercased()
            .folding(options: .diacriticInsensitive, locale: Locale(identifier: "ar"))

        if spokenClean == ref {
            feedbackMessage = "✅ Excellent! Your recitation matches perfectly."
            return
        }

        let similarity = computeSimilarity(spokenClean, ref)
        switch similarity {
        case 0.8...:
            feedbackMessage = "👍 Good effort! Most parts match (\(Int(similarity * 100))% accuracy). Keep practicing."
        case 0.5..<0.8:
            feedbackMessage = "🔄 Partial match (\(Int(similarity * 100))% accuracy). Try again slowly."
        default:
            feedbackMessage = "🔄 The recitation differs significantly. Listen to the original and try again."
        }
    }

    /// Simple character-level similarity.
    private func computeSimilarity(_ a: String, _ b: String) -> Double {
        let shorter = a.count <= b.count ? a : b
        let longer  = a.count > b.count ? a : b
        guard !longer.isEmpty else { return 1.0 }
        let matches = zip(shorter, longer).filter { $0 == $1 }.count
        return Double(matches) / Double(longer.count)
    }
}

#Preview {
    NavigationStack {
        SpeechPracticeView(hadith: HadithRepository.all().first!)
            .environmentObject(SpeechRecognizer())
    }
}
