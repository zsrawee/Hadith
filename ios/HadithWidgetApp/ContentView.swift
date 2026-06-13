import SwiftUI

struct ContentView: View {

    @State private var hadiths: [Hadith] = HadithRepository.all()
    @State private var selectedID: String? = nil
    @State private var showPractice = false

    var body: some View {
        NavigationStack {
            List(hadiths) { hadith in
                VStack(alignment: .leading, spacing: 8) {
                    Text(hadith.sanad)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(hadith.hadithArabic)
                        .font(.body)
                        .foregroundColor(.primary)

                    Text(hadith.hadithEnglish)
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Button {
                        selectedID = hadith.id
                        showPractice = true
                    } label: {
                        Label("Speech Practice", systemImage: "mic.fill")
                            .font(.caption)
                            .foregroundColor(.teal)
                    }
                }
                .padding(.vertical, 4)
            }
            .listStyle(.plain)
            .navigationTitle("نور الحديث")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showPractice) {
                if let id = selectedID, let hadith = HadithRepository.hadith(with: id) {
                    SpeechPracticeView(hadith: hadith)
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
