package com.zikalyze.app;

import android.os.Bundle;
import android.graphics.Color;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display for consistent layout across all devices
        setupEdgeToEdgeDisplay();
        
        // Create notification channel for push notifications (Android 8.0+)
        createNotificationChannel();
    }
    
    /**
     * Configures edge-to-edge display to prevent UI overlapping with system bars
     * while ensuring the app is compatible with all Android device sizes and notch types.
     */
    private void setupEdgeToEdgeDisplay() {
        // Enable edge-to-edge - let the app handle window insets via CSS safe-area-insets
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Set status bar and navigation bar to transparent so the WebView content
        // can extend behind them, with the CSS safe-area-insets handling the padding
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        
        // Configure system bar appearance (dark icons on light background or vice versa)
        WindowInsetsControllerCompat insetsController = 
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (insetsController != null) {
            // Use light icons since our app has a dark background
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }
    }
    
    /**
     * Create notification channel for crypto alerts
     * Required for Android 8.0 (API 26) and above for push notifications to work
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create the notification channel
            NotificationChannel channel = new NotificationChannel(
                "crypto_alerts",                    // Channel ID (matches Firebase meta-data)
                "Crypto Alerts",                     // User-visible channel name
                NotificationManager.IMPORTANCE_HIGH  // High importance for timely alerts
            );
            
            // Configure channel settings
            channel.setDescription("Real-time cryptocurrency price alerts and market notifications");
            channel.enableVibration(true);           // Enable vibration for alerts
            channel.enableLights(true);              // Enable LED notification light
            channel.setShowBadge(true);              // Show notification badge on app icon
            
            // Register the channel with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
