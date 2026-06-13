package com.hadith.widget

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.hadith.widget.ui.HadithApp
import com.hadith.widget.widget.HadithWidgetUpdateWorker

/**
 * Main entry point for the Hadith Widget application.
 *
 * On launch it also schedules the daily widget refresh worker.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Schedule daily widget updates
        HadithWidgetUpdateWorker.schedule(applicationContext)

        setContent {
            MaterialTheme(
                colorScheme = WidgetColors
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HadithApp()
                }
            }
        }
    }
}
