# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ===========================
# Capacitor / WebView Rules
# ===========================

# Keep all Capacitor classes and their members
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }

# Keep all Capacitor plugins
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin { *; }

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView JavaScript interfaces
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface public *;
}

# Keep Cordova compatibility
-keep class org.apache.cordova.** { *; }
-keepclassmembers class org.apache.cordova.** { *; }

# ===========================
# Debugging & Stack Traces
# ===========================

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Keep file names and line numbers for better crash reports
-keepattributes *Annotation*
-renamesourcefileattribute SourceFile

# ===========================
# Android & AndroidX
# ===========================

# AndroidX and Android framework are already part of the platform
# Only keep specific classes if you have reflection issues
# (These rules are usually not needed and can bloat APK size)

# Keep Google Play Services (if used)
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ===========================
# App-specific Rules
# ===========================

# Keep main activity
-keep class com.zikalyze.app.MainActivity { *; }

# Only keep classes accessed via reflection or JNI
# Don't keep all app classes - defeats ProGuard purpose
# Add specific keep rules only if you encounter ClassNotFoundException

# ===========================
# Reflection & Serialization
# ===========================

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ===========================
# Warnings to Ignore
# ===========================

# Ignore warnings for missing classes (common in dependencies)
-dontwarn org.apache.cordova.**
-dontwarn com.getcapacitor.**

# ===========================
# Optimization Settings
# ===========================

# Don't optimize WebView-related code
-keep class android.webkit.** { *; }
-keepclassmembers class android.webkit.** { *; }

# Optimize code but don't obfuscate too aggressively
-optimizationpasses 5
-dontusemixedcaseclassnames
-verbose
