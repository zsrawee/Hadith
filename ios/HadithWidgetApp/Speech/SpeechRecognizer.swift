import Foundation
import Speech
import AVFAudio

/// Wrapper around `SFSpeechRecognizer` to manage recording and transcription.
class SpeechRecognizer: NSObject, ObservableObject, SFSpeechRecognizerDelegate {

    // MARK: - Properties

    private let speechRecognizer: SFSpeechRecognizer? = {
        // Prefer Arabic; fall back to device locale
        let arabic = Locale(identifier: "ar-SA")
        return SFSpeechRecognizer(locale: arabic) ?? SFSpeechRecognizer()
    }()

    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    @Published var isAuthorized = false

    // MARK: - Authorization

    /// Requests speech and microphone authorization.
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        SFSpeechRecognizer.requestAuthorization { status in
            let enabled = status == .authorized
            DispatchQueue.main.async {
                self.isAuthorized = enabled
            }
            // Also request mic permission
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                DispatchQueue.main.async {
                    completion(enabled && granted)
                }
            }
        }
    }

    // MARK: - Recording

    /// Starts recording and transcribing speech. Calls `handler` with partial/final results.
    func startRecording(handler: @escaping (SFSpeechRecognitionResult?, Error?) -> Void) {
        // Cancel any previous task
        stopRecording()

        guard let recognizer = speechRecognizer, recognizer.isAvailable else {
            handler(nil, NSError(domain: "SpeechRecognizer", code: -1,
                                 userInfo: [NSLocalizedDescriptionKey: "Recognizer unavailable"]))
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true

        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            handler(nil, error)
            return
        }

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            self.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            handler(nil, error)
            return
        }

        recognitionTask = recognizer.recognitionTask(with: recognitionRequest!) { result, error in
            handler(result, error)
        }
    }

    /// Stops the recording and cleans up.
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
    }
}
