package com.hadith.widget.widget

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.Action
import androidx.glance.action.ActionParameters
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.glance.unit.dp
import androidx.glance.unit.sp
import com.hadith.widget.MainActivity
import com.hadith.widget.R
import com.hadith.widget.model.HadithRepository

/**
 * Jetpack Glance widget that displays a random Hadith with interactive controls.
 *
 * Features:
 *  - Displays Hadith Arabic text + Sanad
 *  - "Show EN" toggle to switch between Arabic and English
 *  - "Speech Practice" button that launches the main app via deep link
 */
class HadithWidget : GlanceAppWidget() {

    override val sizeMode: SizeMode = SizeMode.Single

    /** Key used to persist the "show English" state across widget refreshes. */
    companion object {
        const val PREFS_NAME = "hadith_widget_prefs"
        const val KEY_SHOW_ENGLISH = "show_english"
    }

    override suspend fun provideContent(context: Context, id: GlanceId) {
        // Load a random Hadith
        val hadith = HadithRepository.getRandomHadith()

        // Read the current toggle state from DataStore or shared prefs
        // For simplicity we default to false (show Arabic);
        // a full implementation would use PreferencesGlanceStateDefinition.
        val showEnglish = false

        provideContent {
            WidgetContent(hadith.hadithArabic, hadith.sanad, hadith.hadithEnglish, hadith.id, showEnglish)
        }
    }
}

/**
 * The composable content for the widget.
 */
@androidx.compose.runtime.Composable
fun WidgetContent(
    hadithArabic: String,
    sanad: String,
    hadithEnglish: String,
    hadithId: String,
    showEnglish: Boolean
) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(day = android.graphics.Color.parseColor("#1A3A4A")))
            .padding(12.dp),
        contentAlignment = Alignment.TopStart
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize(),
            verticalAlignment = Alignment.Top,
            horizontalAlignment = Alignment.Start
        ) {
            // ── Sanad (chain of narrators) ──
            Text(
                text = sanad,
                style = TextStyle(
                    color = ColorProvider(day = android.graphics.Color.parseColor("#B0BEC5")),
                    fontSize = 10.sp
                ),
                maxLines = 2,
                modifier = GlanceModifier.fillMaxWidth()
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            // ── Hadith text (Arabic or English) ──
            Text(
                text = if (showEnglish) hadithEnglish else hadithArabic,
                style = TextStyle(
                    color = ColorProvider(day = android.graphics.Color.parseColor("#F5EDD6")),
                    fontSize = if (showEnglish) 14.sp else 16.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Start
                ),
                maxLines = 4,
                modifier = GlanceModifier.fillMaxWidth()
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            // ── Bottom controls ──
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Horizontal.End,
                verticalAlignment = Alignment.Vertical.Center
            ) {
                // "Show EN" toggle button
                Text(
                    text = if (showEnglish) "عرض AR" else "Show EN",
                    style = TextStyle(
                        color = ColorProvider(day = android.graphics.Color.parseColor("#C9A84C")),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = GlanceModifier
                        .clickable(onClick = actionToggleLanguage(hadithArabic, sanad, hadithEnglish, hadithId, showEnglish))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                )

                Spacer(modifier = GlanceModifier.width(12.dp))

                // "Speech Practice" microphone button – launches deep link
                Text(
                    text = "🎤",
                    style = TextStyle(fontSize = 18.sp),
                    modifier = GlanceModifier.clickable(
                        onClick = actionStartActivity(
                            intent = createDeepLinkIntent(hadithId)
                        )
                    )
                )
            }
        }
    }
}

/**
 * Creates a PendingIntent-based deep link to launch [MainActivity] with the Hadith ID.
 */
private fun createDeepLinkIntent(hadithId: String): Intent {
    return Intent(Intent.ACTION_VIEW).apply {
        data = Uri.parse("hadithapp://practice?id=$hadithId")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
}

/**
 * Placeholder action for toggling language.
 * In production this would write to DataStore/Preferences and request a widget update.
 */
private fun actionToggleLanguage(
    arabic: String, sanad: String, english: String, id: String, currentShowEnglish: Boolean
): Action {
    // TODO: Persist !currentShowEnglish via PreferencesGlanceStateDefinition
    // and call HadithWidget().update(context, glanceId)
    return actionStartActivity(
        intent = Intent().apply {
            // This is a no-op demonstration – real impl would update state
        }
    )
}
