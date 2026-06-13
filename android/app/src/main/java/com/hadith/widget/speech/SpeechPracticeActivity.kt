package com.hadith.widget.speech

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import com.hadith.widget.WidgetColors
import com.hadith.widget.model.Hadith
import com.hadith.widget.model.HadithRepository
import java.util.Locale

/**
 * Activity launched via deep link (hadithapp://practice?id=XYZ).
 * Receives a Hadith ID and allows the user to practice recitation
 * using Android [SpeechRecognizer].
 */
class SpeechPracticeActivity : ComponentActivity() {

    private var speechRecognizer: SpeechRecognizer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Extract Hadith ID from the deep link data
        val hadithId = intent?.data?.getQueryParameter("id") ?: ""
        val hadith = HadithRepository.getHadithById(hadithId)

        if (hadith == null) {
            Toast.makeText(this, "Hadith not found for ID: $hadithId", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setContent {
            MaterialTheme(colorScheme = WidgetColors) {
                SpeechPracticeScreen(
                    hadith = hadith,
                    onStartListening = { startListening(hadith) },
                    onStopListening = { stopListening() }
                )
            }
        }
    }

    private fun startListening(hadith: Hadith) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Toast.makeText(this, "Speech recognition is not available", Toast.LENGTH_LONG).show()
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            // Support Arabic and English
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ar-SA")
            putExtra(RecognizerIntent.EXTRA_SUPPORTED_LANGUAGES, arrayOf("ar-SA", "en-US"))
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        // Store the hadith for comparison in listener
        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}

            override fun onError(error: Int) {
                val message = when (error) {
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timed out"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
                    else -> "Error: $error"
                }
                Toast.makeText(this@SpeechPracticeActivity, message, Toast.LENGTH_SHORT).show()
            }

            override fun onResults(results: Bundle?) {
                val matches = results
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?: return
                if (matches.isNotEmpty()) {
                    val spokenText = matches[0]
                    val feedback = compareTexts(spokenText, hadith.hadithArabic)
                    // Update UI with feedback – here we show a toast for simplicity
                    runOnUiThread {
                        Toast.makeText(
                            this@SpeechPracticeActivity,
                            feedback,
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        speechRecognizer?.startListening(intent)
    }

    private fun stopListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
    }

    /**
     * Basic comparison of spoken text vs. the reference Hadith text.
     * Returns a simple feedback string. Production apps would implement
     * more sophisticated phonetic comparison.
     */
    private fun compareTexts(spoken: String, reference: String): String {
        val spokenClean = spoken.trim().lowercase(Locale.ROOT)
        val refClean = reference.trim().lowercase(Locale.ROOT)

        return if (spokenClean == refClean) {
            "✅ Excellent! Your recitation matches perfectly."
        } else {
            val similarity = computeSimilarity(spokenClean, refClean)
            when {
                similarity >= 0.8 -> "👍 Good effort! Most parts match (${(similarity * 100).toInt()}% accuracy). Keep practicing."
                similarity >= 0.5 -> "🔄 Partial match (${(similarity * 100).toInt()}% accuracy). Try again slowly."
                else -> "🔄 The recitation differs significantly. Listen to the original and try again."
            }
        }
    }

    /** Simple character-level similarity (Jaccard-like). */
    private fun computeSimilarity(a: String, b: String): Double {
        if (a.isEmpty() && b.isEmpty()) return 1.0
        if (a.isEmpty() || b.isEmpty()) return 0.0
        val shorter = if (a.length <= b.length) a else b
        val longer = if (a.length > b.length) a else b
        var matches = 0
        for (i in shorter.indices) {
            if (i < longer.length && shorter[i] == longer[i]) matches++
        }
        return matches.toDouble() / longer.length
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
    }
}

@androidx.compose.runtime.Composable
private fun SpeechPracticeScreen(
    hadith: Hadith,
    onStartListening: () -> Unit,
    onStopListening: () -> Unit
) {
    var isListening by remember { mutableStateOf(false) }
    var transcribedText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "🎤 Speech Practice",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Reference Hadith
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
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

        // Microphone button
        Button(
            onClick = {
                if (isListening) {
                    onStopListening()
                    isListening = false
                } else {
                    onStartListening()
                    isListening = true
                }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isListening)
                    MaterialTheme.colorScheme.error
                else
                    MaterialTheme.colorScheme.secondary
            )
        ) {
            Text(
                text = if (isListening) "⏹ Stop Listening" else "🎤 Start Recitation"
            )
        }

        if (isListening) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Listening...",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary
            )
        }

        if (transcribedText.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Your speech: $transcribedText",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}
