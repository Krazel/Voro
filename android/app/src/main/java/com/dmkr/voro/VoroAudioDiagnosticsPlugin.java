package com.dmkr.voro;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Same lifecycle gate used by iOS; Android retains the approved Web Audio backend.
@CapacitorPlugin(name = "VoroAudioDiagnostics")
public class VoroAudioDiagnosticsPlugin extends Plugin {
    private long sequence = 0;
    private boolean active = true;
    private synchronized JSObject state() {
        JSObject activity = new JSObject();
        activity.put("sequence", sequence);
        activity.put("allowed", active);
        JSObject session = new JSObject();
        session.put("backend", "Android WebView/Web Audio");
        JSObject result = new JSObject();
        result.put("activity", activity);
        result.put("session", session);
        result.put("sequence", sequence);
        return result;
    }
    private synchronized void setActive(boolean value) {
        active = value; sequence++;
        notifyListeners("audioSession", state(), true);
    }
    @PluginMethod public void snapshot(PluginCall call) { call.resolve(state()); }
    @Override protected void handleOnResume() { setActive(true); }
    @Override protected void handleOnPause() { setActive(false); }
}
