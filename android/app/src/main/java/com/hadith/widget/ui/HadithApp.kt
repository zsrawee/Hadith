package com.hadith.widget.ui

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.hadith.widget.model.HadithRepository

/**
 * Top-level composable for the main app.
 * Shows a list of Hadiths and allows navigation to speech practice.
 */
@Composable
fun HadithApp() {
    val hadiths = remember { HadithRepository.getAll() }
    var selectedIndex by remember { mutableIntStateOf(-1) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        Text(
            text = "نور الحديث • Nur al-Hadith",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        hadiths.forEachIndexed { index, hadith ->
            HadithCard(
                arabic = hadith.hadithArabic,
                sanad = hadith.sanad,
                english = hadith.hadithEnglish,
                onPractice = { selectedIndex = index }
            )
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun HadithCard(
    arabic: String,
    sanad: String,
    english: String,
    onPractice: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = sanad,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = arabic,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Start
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = english,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
            textAlign = TextAlign.Start
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = onPractice,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondary
            )
        ) {
            Text("🎤  Speech Practice")
        }
    }
}
