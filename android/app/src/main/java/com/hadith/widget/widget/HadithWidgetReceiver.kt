package com.hadith.widget.widget

import androidx.glance.appwidget.GlanceAppWidgetReceiver

/**
 * Receiver that registers our [HadithWidget] with the Android widget framework.
 */
class HadithWidgetReceiver : GlanceAppWidgetReceiver() {

    override val glanceAppWidget: HadithWidget
        get() = HadithWidget()
}
