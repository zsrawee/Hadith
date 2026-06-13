# Proguard rules for Hadith Widget
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# Keep data classes
-keep class com.hadith.widget.model.** { *; }

# Keep Glance widget
-keep class androidx.glance.** { *; }
