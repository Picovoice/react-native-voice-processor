package ai.picovoice.reactnativevoiceprocessor;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Process;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class VoiceProcessorModule extends ReactContextBaseJavaModule{
    
    private static final String LOG_TAG = "VoiceProcessorModule";
    private static final String BUFFER_EMITTER_KEY = "buffer_sent";
    private final ReactApplicationContext context;

    private AtomicBoolean started = new AtomicBoolean(false);
    private AtomicBoolean stop = new AtomicBoolean(false);
    private AtomicBoolean stopped = new AtomicBoolean(false);

    @Override
    public String getName() {
        return "VoiceProcessor";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("BUFFER_EMITTER_KEY", BUFFER_EMITTER_KEY);
        return constants;
    }

    public VoiceProcessorModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @ReactMethod
    public void start(Integer frameSize, Integer sampleRate) {
        
        if (started.get()) {
            return;
        }        
        started.set(true);

        Executors.newSingleThreadExecutor().submit(new Callable<Void>() {
            @Override
            public Void call() {         
                android.os.Process.setThreadPriority(Process.THREAD_PRIORITY_URGENT_AUDIO);
                read(frameSize, sampleRate);
                return null;
            }
        });
    }

    @ReactMethod
    public void stop() {
        if (!started.get()) {
            return;
        }

        stop.set(true);

        while (!stopped.get()) {
            try{
                Thread.sleep(10);
            }
            catch(InterruptedException e){
                Log.e(LOG_TAG, e.toString());
            }
        }

        started.set(false);
        stop.set(false);
        stopped.set(false);
    }

    
    private void read(Integer frameSize, Integer sampleRate) {                    
        final int minBufferSize = AudioRecord.getMinBufferSize(
                                                sampleRate,
                                                AudioFormat.CHANNEL_IN_MONO,
                                                AudioFormat.ENCODING_PCM_16BIT);
        final int bufferSize = Math.max(sampleRate / 2, minBufferSize);
        short[] buffer = new short[frameSize];

        AudioRecord audioRecord = null;
        try {
            audioRecord = new AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    sampleRate,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize);
            
            audioRecord.startRecording();        
            
            while (!stop.get()) {               
                
                if (audioRecord.read(buffer, 0, buffer.length) == buffer.length) {          
                    WritableArray wArray = Arguments.createArray();
                    for(int i = 0; i<buffer.length; i++)
                        wArray.pushInt(buffer[i]);
                    this.context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(BUFFER_EMITTER_KEY, wArray); 
                }
            }
            

            audioRecord.stop();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } finally {
            if (audioRecord != null) {
                audioRecord.release();
            }

            stopped.set(true);
        }
    }        
}