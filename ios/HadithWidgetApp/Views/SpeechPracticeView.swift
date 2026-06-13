import SwiftUI
import Speech

/// View that lets the user practice reciting a Hadith using speech recognition.
/// Compares the user's spoken Arabic to the original text and displays feedback.
///
/// Fixes:
///  - Advanced Arabic text normalization (diacritics, alef variants, teh marbuta, etc.)
///  - Clearer error messages from the speech recognizer
///  - Proper confidence-based feedback tiers
struct SpeechPracticeView: View {

    let hadith: Hadith

    @EnvironmentObject private var speechRecognizer: SpeechRecognizer
    @State private var isRecording = false
    @State private var transcribedText = ""
    @State private var feedbackMessage = ""
    @State private var confidenceScore: Double = 0.0
    @State private var isProcessing = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // ── Reference Hadith ──
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
                        .environment(\.layoutDirection, .rightToLeft)

                    Text(hadith.hadithEnglish)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // ── Microphone button ──
                Button(action: toggleRecording) {
                    Label(
                        isRecording ? "Stop Recording" : "Start Recitation",
                        systemImage: isRecording ? "stop.circle.fill" : "mic.circle.fill"
                    )
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        isRecording ? Color.red : Color.teal
                    )
                    .cornerRadius(12)
                }
                .disabled(isProcessing)

                // ── Status ──
                if isRecording {
                    HStack {
                        ProgressView()
                        Text("Listening… Speak clearly in Arabic")
                            .foregroundColor(.secondary)
                    }
                }

                if isProcessing {
                    HStack {
                        ProgressView()
                        Text("Analyzing your recitation…")
                            .foregroundColor(.secondary)
                    }
                }

                // ── Transcribed text ──
                if !transcribedText.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Your Recitation")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text(transcribedText)
                            .font(.body)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                    }
                }

                // ── Feedback ──
                if !feedbackMessage.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Feedback")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            if confidenceScore > 0 {
                                Text("\(Int(confidenceScore * 100))%")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        Text(feedbackMessage)
                            .font(.body)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                feedbackMessage.hasPrefix("✅")
                                    ? Color.green.opacity(0.15)
                                    : Color.orange.opacity(0.15)
                            )
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
                startRecording()
            }
        }
    }

    // MARK: - Recording Control

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
        confidenceScore = 0.0
        isProcessing = false

        speechRecognizer.requestAuthorization { authorized in
            guard authorized else {
                feedbackMessage = "⚠️ Speech recognition permission denied. Please enable in Settings."
                return
            }
            self.isRecording = true
            self.speechRecognizer.startRecording { result, error in
                DispatchQueue.main.async {
                    if let error {
                        let nsError = error as NSError
                        let message: String
                        switch nsError.code {
                        case 203: // SFSpeechRecognitionError.unknown
                            message = "Recognition failed. Please try again."
                        case 201:
                            message = "No speech detected. Try speaking louder."
                        case 200:
                            message = "Network error. Check your connection."
                        case 1100:
                            message = "Microphone unavailable. Check permissions."
                        default:
                            message = "Error: \(error.localizedDescription)"
                        }
                        self.feedbackMessage = message
                        self.isRecording = false
                        return
                    }

                    if let result {
                        self.transcribedText = result.bestTranscription.formattedString
                        if result.isFinal {
                            self.isRecording = false
                            self.isProcessing = true
                            // Brief processing delay for UX
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                self.analyzeRecitation(spoken: self.transcribedText)
                                self.isProcessing = false
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
        isProcessing = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            self.analyzeRecitation(spoken: self.transcribedText)
            self.isProcessing = false
        }
    }

    // MARK: - Analysis

    /// Compares the user's spoken text with the original Hadith Arabic.
    /// Uses advanced normalization so minor diacritic differences don't penalize the user.
    private func analyzeRecitation(spoken: String) {
        let trimmed = spoken.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            feedbackMessage = "No speech detected. Please try again."
            return
        }

        let ref = normalizeArabic(hadith.hadithArabic)
        let spokenClean = normalizeArabic(trimmed)

        guard !ref.isEmpty else { return }

        if spokenClean == ref {
            feedbackMessage = "✅ Excellent! Your recitation matches perfectly."
            confidenceScore = 1.0
            return
        }

        let similarity = computeSimilarity(spokenClean, ref)
        confidenceScore = similarity

        switch similarity {
        case 0.85...:
            feedbackMessage = "👍 Very good! \(Int(similarity * 100))% accuracy. Minor differences only."
        case 0.65..<0.85:
            feedbackMessage = "🔄 Getting there! \(Int(similarity * 100))% accuracy. Try again more slowly."
        case 0.40..<0.65:
            feedbackMessage = "🔶 Partial match (\(Int(similarity * 100))%). Focus on pronouncing each word clearly."
        default:
            feedbackMessage = "🔄 The recitation differs significantly (\(Int(similarity * 100))%). Listen to the original and try again."
        }
    }

    // MARK: - Arabic Normalization

    /// Normalizes Arabic text for fair comparison:
    /// - Removes diacritics (tashkeel)
    /// - Normalizes Alef variants (أ, إ, آ → ا)
    /// - Normalizes Teh Marbuta (ة → ه) and Alef maksura (ى → ي)
    /// - Removes tatweel/kashida
    /// - Collapses whitespace
    private func normalizeArabic(_ text: String) -> String {
        // Step 1: Unicode NFD decomposition to separate diacritics
        let decomposed = text.decomposedStringWithCanonicalMapping

        // Step 2: Remove diacritic characters (Arabic tashkeel: 0x064B-0x065F, 0x0670)
        let noDiacritics = decomposed.unicodeScalars.filter { scalar in
            !(0x064B...0x065F).contains(scalar.value) && scalar.value != 0x0670
        }

        var result = String(String.UnicodeScalarView(noDiacritics))

        // Step 3: Character normalization
        let replacements: [(Character, Character)] = [
            ("أ", "ا"), ("إ", "ا"), ("آ", "ا"),  // Alef variants → ا
            ("ؤ", "و"),                           // Waw with hamza → waw
            ("ئ", "ي"),                           // Ya with hamza → ya
            ("ة", "ه"),                           // Teh marbuta → heh
            ("ى", "ي"),                           // Alef maksura → ya
        ]
        for (old, new) in replacements {
            result = result.replacingOccurrences(of: String(old), with: String(new))
        }

        // Step 4: Remove tatweel/kashida (0x0640)
        result = result.replacingOccurrences(of: "\u{0640}", with: "")

        // Step 5: Collapse whitespace and lowercase
        let collapsed = result
            .components(separatedBy: .whitespacesAndNewlines)
            .filter { !$0.isEmpty }
            .joined(separator: " ")
            .lowercased()
            .trimmingCharacters(in: .whitespacesAndNewlines)

        return collapsed
    }

    // MARK: - Similarity

    /// Character-level positional similarity.
    private func computeSimilarity(_ a: String, _ b: String) -> Double {
        let maxLen = max(a.count, b.count)
        guard maxLen > 0 else { return 1.0 }
        let minLen = min(a.count, b.count)
        var matches = 0
        for (ca, cb) in zip(a, b) {
            if ca == cb { matches += 1 }
        }
        return Double(matches) / Double(maxLen)
    }
}

#Preview {
    NavigationStack {
        SpeechPracticeView(hadith: HadithRepository.all().first!)
            .environmentObject(SpeechRecognizer())
    }
}
