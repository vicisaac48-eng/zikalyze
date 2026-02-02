package com.zikalyze.app;

import android.os.Bundle;
import android.graphics.Color;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display for consistent layout across all devices
        setupEdgeToEdgeDisplay();
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
}
