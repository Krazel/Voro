package com.dmkr.voro;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VoroBenchmarkDisplay")
public class VoroBenchmarkDisplayPlugin extends Plugin {
    @PluginMethod public void setActive(PluginCall call) {
        // Gameplay already keeps the display awake, including benchmark runs.
        getActivity().runOnUiThread(() -> {
            getBridge().getWebView().setKeepScreenOn(true);
            call.resolve(new JSObject());
        });
    }
}
