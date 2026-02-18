# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Preserve the line number information for debugging stack traces
# This helps with crash reporting and ANR analysis in Play Console
-keepattributes SourceFile,LineNumberTable

# Keep source file name for better crash reports
-renamesourcefileattribute SourceFile

# Firebase - Keep all Firebase classes to ensure native libraries are included
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Crashlytics to ensure crash reporting works
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# Keep native methods (JNI) - ensures native libraries (.so files) are packaged
-keepclasseswithmembernames class * {
    native <methods>;
}
