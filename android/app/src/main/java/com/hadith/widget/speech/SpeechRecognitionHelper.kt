package com.hadith.widget.speech

import android.content.Context
import android.speech.SpeechRecognizer
import java.util.Locale

/**
 * Helper class wrapping Android's [SpeechRecognizer] API.
 * Provides a clean interface for the [SpeechPracticeActivity].
 */
class SpeechRecognitionHelper(private val context: Context) {

    private var recognizer: SpeechRecognizer? = null

    /** Returns true if speech recognition is available on this device. */
    fun isAvailable(): Boolean = SpeechRecognizer.isRecognitionAvailable(context)

    /** Clean up resources. */
    fun destroy() {
        recognizer?.destroy()
        recognizer = null
    }
}
