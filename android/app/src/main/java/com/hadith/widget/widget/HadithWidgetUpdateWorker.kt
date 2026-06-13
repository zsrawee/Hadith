package com.hadith.widget.widget

import android.content.Context
import androidx.glance.appwidget.UpdateMode
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/**
 * Periodic worker that refreshes the widget daily so users see a new Hadith.
 */
class HadithWidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    override fun doWork(): Result {
        val context = applicationContext
        try {
            HadithWidget().update(context, updateMode = UpdateMode.PERIODIC)
            return Result.success()
        } catch (e: Exception) {
            return Result.retry()
        }
    }

    companion object {
        private const val WORK_NAME = "hadith_widget_daily_update"

        /** Schedule daily widget updates. Call this once from [MainActivity]. */
        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<HadithWidgetUpdateWorker>(
                24, TimeUnit.HOURS
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }
    }
}
