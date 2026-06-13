import Foundation
import Speech
import AVFAudio

/// Wrapper around `SFSpeechRecognizer` to manage recording and transcription.
///
/// Fixes:
///  - All authorization callbacks dispatched to main thread
///  - Properly handles recognition task lifecycle
///  - Exposes Arabic locale support cleanly
class SpeechRecognizer: NSObject, ObservableObject, SFSpeechRecognizerDelegate {

    // MARK: - Properties

    private let speechRecognizer: SFSpeechRecognizer? = {
        let arabic = Locale(identifier: "ar-SA")
        return SFSpeechRecognizer(locale: arabic) ?? SFSpeechRecognizer()
    }()

    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    @Published var isAuthorized = false
    @Published var isAvailable = false

    // MARK: - Initialization

    override init() {
        super.init()
        speechRecognizer?.delegate = self
        isAvailable = speechRecognizer?.isAvailable ?? false
    }

    // MARK: - SFSpeechRecognizerDelegate

    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        DispatchQueue.main.async {
            self.isAvailable = available
        }
    }

    // MARK: - Authorization

    /// Requests speech-recognition and microphone authorization.
    /// The completion closure is always called on the **main thread**.
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        // 1. Speech recognition authorization
        SFSpeechRecognizer.requestAuthorization { status in
            let speechGranted = status == .authorized

            // 2. Microphone authorization
            AVAudioSession.sharedInstance().requestRecordPermission { micGranted in
                let granted = speechGranted && micGranted
                DispatchQueue.main.async {
                    self.isAuthorized = granted
                    completion(granted)
                }
            }
        }
    }

    // MARK: - Recording

    /// Starts recording and transcribing speech.
    /// The `handler` closure is called with partial results and a final result.
    /// All callbacks happen on a background queue – dispatch to main as needed.
    func startRecording(handler: @escaping (SFSpeechRecognitionResult?, Error?) -> Void) {
        // Cancel any previous task
        stopRecording()

        guard let recognizer = speechRecognizer, recognizer.isAvailable else {
            handler(nil, NSError(
                domain: "SpeechRecognizer",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Speech recognizer is unavailable. Check internet connection and permissions."]
            ))
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        recognitionRequest?.shouldReportPartialResults = true

        // Configure audio session
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

    /// Stops recording and cleans up audio resources.
    func stopRecording() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
    }

    deinit {
        stopRecording()
    }
}
