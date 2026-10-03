package com.dmkr.voro;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        registerPlugin(VoroAudioDiagnosticsPlugin.class);
        registerPlugin(VoroBenchmarkDisplayPlugin.class);
        super.onCreate(state);
        getBridge().getWebView().setKeepScreenOn(true);
        getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
}
