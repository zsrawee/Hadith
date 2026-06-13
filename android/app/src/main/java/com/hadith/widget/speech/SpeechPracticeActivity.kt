package com.hadith.widget.speech

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.hadith.widget.WidgetColors
import com.hadith.widget.model.Hadith
import com.hadith.widget.model.HadithRepository
import java.text.Normalizer
import java.util.Locale
import java.util.regex.Pattern

/**
 * Activity launched via deep link (hadithapp://practice?id=XYZ).
 *
 * Fixes:
 *  - Runtime permission request for RECORD_AUDIO (required on Android 6+)
 *  - UI state (transcribedText / feedback) properly connected to recognition listener
 *  - Arabic text normalization for fair comparison
 */
class SpeechPracticeActivity : ComponentActivity() {

    // ── mutable state shared with the composable ──────────────────────────
    private var isListening by mutableStateOf(false)
    private var transcribedText by mutableStateOf("")
    private var feedbackMessage by mutableStateOf("")
    private var confidenceScore by mutableStateOf(0.0)
    private var isProcessing by mutableStateOf(false)

    private var speechRecognizer: SpeechRecognizer? = null
    private var currentHadith: Hadith? = null

    // Runtime permission launcher
    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                startListeningInternal()
            } else {
                feedbackMessage = "⚠️ Microphone permission is required for speech practice."
                Toast.makeText(this, "Microphone permission denied", Toast.LENGTH_SHORT).show()
            }
        }

    // ── Lifecycle ──────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val hadithId = intent?.data?.getQueryParameter("id") ?: ""
        currentHadith = HadithRepository.getHadithById(hadithId)

        if (currentHadith == null) {
            Toast.makeText(this, "Hadith not found for ID: $hadithId", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setContent {
            MaterialTheme(colorScheme = WidgetColors) {
                SpeechPracticeScreen(
                    hadith = currentHadith!!,
                    isListening = isListening,
                    transcribedText = transcribedText,
                    feedbackMessage = feedbackMessage,
                    confidenceScore = confidenceScore,
                    isProcessing = isProcessing,
                    onToggleRecording = { onToggleRecording() }
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
    }

    // ── Recording control ──────────────────────────────────────────────────

    private fun onToggleRecording() {
        if (isListening) {
            stopListeningInternal()
        } else {
            checkPermissionAndStart()
        }
    }

    private fun checkPermissionAndStart() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED
        ) {
            startListeningInternal()
        } else {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun startListeningInternal() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            feedbackMessage = "Speech recognition is not available on this device."
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ar-SA")
            putExtra(RecognizerIntent.EXTRA_SUPPORTED_LANGUAGES, arrayOf("ar-SA", "en-US"))
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        isProcessing = false
        transcribedText = ""
        feedbackMessage = ""
        confidenceScore = 0.0
        isListening = true

        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}

            override fun onError(error: Int) {
                isListening = false
                isProcessing = false
                val message = when (error) {
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected. Please try again."
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timed out. Tap mic and speak clearly."
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer is busy. Please wait."
                    SpeechRecognizer.ERROR_AUDIO -> "Audio error. Check microphone."
                    SpeechRecognizer.ERROR_CLIENT -> "Client error."
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission missing."
                    SpeechRecognizer.ERROR_NETWORK -> "Network error. Check connection."
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout."
                    SpeechRecognizer.ERROR_SERVER -> "Server error. Try again later."
                    else -> "Unknown error ($error). Please try again."
                }
                feedbackMessage = message
            }

            override fun onResults(results: Bundle?) {
                isListening = false
                isProcessing = false
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION) ?: return
                if (matches.isNotEmpty()) {
                    val spoken = matches[0]
                    transcribedText = spoken
                    val hadith = currentHadith ?: return
                    val result = analyzeRecitation(spoken, hadith.hadithArabic)
                    feedbackMessage = result.first
                    confidenceScore = result.second
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    transcribedText = matches[0]
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        speechRecognizer?.startListening(intent)
    }

    private fun stopListeningInternal() {
        isListening = false
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
    }

    // ── Analysis ───────────────────────────────────────────────────────────

    /**
     * Compares spoken text to the reference Hadith Arabic.
     * Returns (feedbackMessage, confidenceScore) where confidenceScore ∈ [0,1].
     */
    private fun analyzeRecitation(spoken: String, reference: String): Pair<String, Double> {
        val spokenNorm = normalizeArabic(spoken.trim())
        val refNorm = normalizeArabic(reference.trim())

        if (spokenNorm.isEmpty()) {
            return "No speech detected. Please try again." to 0.0
        }

        // Exact match check first
        if (spokenNorm == refNorm) {
            return "✅ Excellent! Your recitation matches perfectly." to 1.0
        }

        // Compute character-level similarity
        val sim = computeSimilarity(spokenNorm, refNorm)

        return when {
            sim >= 0.85 -> "👍 Very good! ${(sim * 100).toInt()}% accuracy. Minor differences only." to sim
            sim >= 0.65 -> "🔄 Getting there! ${(sim * 100).toInt()}% accuracy. Try again more slowly." to sim
            sim >= 0.40 -> "🔶 Partial match (${(sim * 100).toInt()}%). Focus on pronouncing each word clearly." to sim
            else -> "🔄 The recitation differs significantly (${(sim * 100).toInt()}%). Listen to the original and try again." to sim
        }
    }

    /**
     * Normalizes Arabic text for fair comparison:
     * - Removes diacritics (tashkeel: fatha, kasra, damma, sukun, shadda, etc.)
     * - Normalizes Alef variants (أ, إ, آ → ا)
     * - Normalizes Teh Marbuta (ة → ه)
     * - Removes tatweel (kashida)
     * - Removes extra whitespace
     */
    private fun normalizeArabic(text: String): String {
        val normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
            .replace(Regex("[\\u064B-\\u065F]"), "")    // Remove diacritics
            .replace(Regex("[\\u0670]"), "")             // Remove superscript alef
            .replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")  // Alef variants → ا
            .replace("ؤ", "و")  // Waw with hamza → waw
            .replace("ئ", "ي")  // Ya with hamza → ya
            .replace("ة", "ه")  // Teh marbuta → heh
            .replace("ى", "ي")  // Alef maksura → ya
            .replace(Regex("[\\u0640]"), "")             // Remove tatweel/kashida
            .replace(Regex("\\s+"), " ")                 // Collapse whitespace
            .trim()
            .lowercase(Locale.ROOT)

        // Also NFC normalize for consistency
        return Normalizer.normalize(normalized, Normalizer.Form.NFC)
    }

    /** Character-level similarity (positional). */
    private fun computeSimilarity(a: String, b: String): Double {
        if (a.isEmpty() && b.isEmpty()) return 1.0
        if (a.isEmpty() || b.isEmpty()) return 0.0
        val maxLen = maxOf(a.length, b.length)
        var matches = 0
        val minLen = minOf(a.length, b.length)
        for (i in 0 until minLen) {
            if (a[i] == b[i]) matches++
        }
        return matches.toDouble() / maxLen
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Composable UI
// ─────────────────────────────────────────────────────────────────────────────

@androidx.compose.runtime.Composable
private fun SpeechPracticeScreen(
    hadith: Hadith,
    isListening: Boolean,
    transcribedText: String,
    feedbackMessage: String,
    confidenceScore: Double,
    isProcessing: Boolean,
    onToggleRecording: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Title
        Text(
            text = "🎤 Speech Practice",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        // ── Reference Hadith Card ──
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = hadith.sanad,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = hadith.hadithArabic,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Start
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = hadith.hadithEnglish,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                    textAlign = TextAlign.Start
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Microphone Button ──
        Button(
            onClick = onToggleRecording,
            enabled = !isProcessing,
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isListening) MaterialTheme.colorScheme.error
                else MaterialTheme.colorScheme.secondary
            )
        ) {
            Text(
                text = when {
                    isProcessing -> "Analyzing…"
                    isListening -> "⏹ Stop Recording"
                    else -> "🎤 Start Recitation"
                }
            )
        }

        // ── Listening indicator ──
        if (isListening) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Listening… Speak clearly in Arabic",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary
            )
        }

        // ── Processing indicator ──
        if (isProcessing) {
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            Text(
                text = "Analyzing your recitation…",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        // ── Transcribed text ──
        if (transcribedText.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.7f))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = "Your Recitation",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = transcribedText,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        // ── Feedback ──
        if (feedbackMessage.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = when {
                        feedbackMessage.startsWith("✅") ->
                            MaterialTheme.colorScheme.secondary.copy(alpha = 0.25f)
                        else -> MaterialTheme.colorScheme.tertiary.copy(alpha = 0.15f)
                    }
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Feedback",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                        if (confidenceScore > 0) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "${(confidenceScore * 100).toInt()}%",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = feedbackMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
