package com.dmkr.voro;

import static org.junit.Assert.*;
import android.graphics.Bitmap;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;
import androidx.lifecycle.Lifecycle;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;

/** Real signed release APK. Test helpers exist only in the instrumentation APK. */
@RunWith(AndroidJUnit4.class)
public class ReleaseSmokeTest {
    private ActivityScenario<MainActivity> scenario;
    private WebView web;
    private final JSONObject report = new JSONObject();
    private String js(String expression) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);
        AtomicReference<String> value=new AtomicReference<>();
        scenario.onActivity(a -> a.getBridge().getWebView().evaluateJavascript(expression,v->{value.set(v);latch.countDown();}));
        assertTrue("JS evaluation timeout",latch.await(12,TimeUnit.SECONDS));
        return value.get();
    }
    private String text(String expression) throws Exception {
        return new JSONArray("["+js(expression)+"]").getString(0);
    }
    private void waitFor(String expression) throws Exception {
        long until=SystemClock.uptimeMillis()+45000;
        while(SystemClock.uptimeMillis()<until){if("true".equals(js(expression)))return;SystemClock.sleep(500);}
        fail("Missing UI: "+expression+"; "+text("document.body.innerText"));
    }
    private void tap(String predicate) throws Exception {
        String query="(()=>{const e=Array.from(document.querySelectorAll('button')).find(e=>"+predicate+");if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,innerWidth]})()";
        JSONArray p=new JSONArray(js(query));
        int[] origin=new int[2];AtomicReference<Integer> width=new AtomicReference<>();
        scenario.onActivity(a->{web=a.getBridge().getWebView();web.getLocationOnScreen(origin);width.set(web.getWidth());});
        float scale=(float)(width.get()/p.getDouble(2));
        pointer(origin[0]+(float)p.getDouble(0)*scale,origin[1]+(float)p.getDouble(1)*scale);
        SystemClock.sleep(700);
    }
    private void pointer(float x,float y){
        long now=SystemClock.uptimeMillis();
        for(int action:new int[]{MotionEvent.ACTION_DOWN,MotionEvent.ACTION_UP}){
            MotionEvent event=MotionEvent.obtain(now,SystemClock.uptimeMillis(),action,x,y,0);
            InstrumentationRegistry.getInstrumentation().sendPointerSync(event);event.recycle();
        }
    }
    private void screenshot(String name) throws Exception {
        Bitmap bitmap=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        File file=new File(InstrumentationRegistry.getInstrumentation().getTargetContext().getExternalFilesDir("qa"),name);
        try(FileOutputStream out=new FileOutputStream(file)){bitmap.compress(Bitmap.CompressFormat.PNG,100,out);}
    }
    @Test public void releaseGameplayAndLifecycle() throws Exception {
        scenario=ActivityScenario.launch(MainActivity.class);
        try {
            waitFor("!!document.querySelector('canvas') && document.querySelectorAll('button').length>2");
            report.put("platform",text("Capacitor.getPlatform()"));assertEquals("android",report.getString("platform"));
            report.put("automaticLanguage",text("document.documentElement.lang"));
            report.put("deviceLanguage",text("navigator.language"));
            report.put("initialText",text("document.body.innerText"));
            js("localStorage.setItem('voro-language-v1','es');location.reload();true");
            waitFor("document.documentElement.lang==='es' && document.body.innerText.includes('Despertar')");
            screenshot("01-birth.png");
            tap("e.textContent.includes('Despertar')");
            waitFor("!!document.querySelector('button[aria-label=\"Pausar\"]')");
            SystemClock.sleep(9000);
            report.put("playingText",text("document.body.innerText"));screenshot("02-gameplay.png");
            tap("e.getAttribute('aria-label')==='Pausar'");
            waitFor("document.body.innerText.includes('Continuar')");
            screenshot("03-pause.png");
            tap("e.textContent.includes('Continuar')");
            tap("e.getAttribute('aria-label')==='Configuración'");
            waitFor("document.body.innerText.includes('MODO ZURDO') || document.body.innerText.toLowerCase().includes('modo zurdo')");
            screenshot("04-settings.png");
            report.put("settingsText",text("document.body.innerText"));
            tap("e.textContent.toLowerCase().includes('volver al juego')");
            waitFor("!!document.querySelector('button[aria-label=\"Pausar\"]')");
            scenario.moveToState(Lifecycle.State.CREATED);SystemClock.sleep(2500);
            scenario.moveToState(Lifecycle.State.RESUMED);SystemClock.sleep(1500);
            waitFor("document.body.innerText.includes('Continuar')");
            tap("e.textContent.includes('Continuar')");
            SystemClock.sleep(3500);
            report.put("resumedText",text("document.body.innerText"));screenshot("05-resumed.png");
            report.put("savedKeys",new JSONArray(js("Object.keys(localStorage)")));
            report.put("nativeAudioPlugin",text("typeof Capacitor.Plugins.VoroAudioDiagnostics.snapshot"));
            assertEquals("function",report.getString("nativeAudioPlugin"));
            report.put("nonDebuggable",(InstrumentationRegistry.getInstrumentation().getTargetContext().getApplicationInfo().flags&2)==0);
            assertTrue(report.getBoolean("nonDebuggable"));
            report.put("success",true);
        } finally {
            File file=new File(InstrumentationRegistry.getInstrumentation().getTargetContext().getExternalFilesDir("qa"),"smoke.json");
            try(FileOutputStream out=new FileOutputStream(file)){out.write(report.toString(2).getBytes(StandardCharsets.UTF_8));}
            scenario.close();
        }
    }
}
