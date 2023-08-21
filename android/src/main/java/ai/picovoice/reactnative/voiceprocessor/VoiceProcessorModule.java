//
// Copyright 2020-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

package ai.picovoice.reactnative.voiceprocessor;

import android.Manifest;
import android.content.pm.PackageManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import java.util.HashMap;
import java.util.Map;

import ai.picovoice.android.voiceprocessor.VoiceProcessor;
import ai.picovoice.android.voiceprocessor.VoiceProcessorErrorListener;
import ai.picovoice.android.voiceprocessor.VoiceProcessorException;
import ai.picovoice.android.voiceprocessor.VoiceProcessorFrameListener;

@ReactModule(name = VoiceProcessorModule.NAME)
public class VoiceProcessorModule extends ReactContextBaseJavaModule {
    public static final String NAME = "PvVoiceProcessor";

    private static final int RECORD_AUDIO_REQUEST_CODE = VoiceProcessorModule.class.hashCode();
    private static final String LOG_TAG = "PicovoiceVoiceProcessorModule";
    private static final String FRAME_EMITTER_KEY = "frame_sent";
    private static final String ERROR_EMITTER_KEY = "error_sent";

    private final ReactApplicationContext context;
    private final VoiceProcessor voiceProcessor;

    public VoiceProcessorModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        this.voiceProcessor = VoiceProcessor.getInstance();
        this.voiceProcessor.addErrorListener(new VoiceProcessorErrorListener() {
            @Override
            public void onError(VoiceProcessorException error) {
                reactContext.getJSModule(
                        DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                        ERROR_EMITTER_KEY,
                        error.getMessage());
            }
        });

        this.voiceProcessor.addFrameListener(new VoiceProcessorFrameListener() {
            @Override
            public void onFrame(final short[] frame) {
                WritableArray writeArray = Arguments.createArray();
                for (short value : frame) {
                    writeArray.pushInt(value);
                }
                reactContext.getJSModule(
                        DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(
                        FRAME_EMITTER_KEY,
                        writeArray);
            }
        });
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("FRAME_EMITTER_KEY", FRAME_EMITTER_KEY);
        constants.put("ERROR_EMITTER_KEY", ERROR_EMITTER_KEY);
        return constants;
    }

    @ReactMethod
    public void start(Integer frameLength, Integer sampleRate, Promise promise) {
        try {
            voiceProcessor.start(frameLength, sampleRate);
            promise.resolve(true);
        } catch (VoiceProcessorException e) {
            promise.reject(
                    "PV_AUDIO_RECORDER_ERROR",
                    "Unable to start audio recording: " + e);
        }
    }

    @ReactMethod
    public void stop(Promise promise) {
        try {
            voiceProcessor.stop();
            promise.resolve(true);
        } catch (VoiceProcessorException e) {
            promise.reject(
                    "PV_AUDIO_RECORDER_ERROR",
                    "Unable to stop audio recording: " + e);
        }
    }

    @ReactMethod
    public void isRecording(Promise promise) {
        promise.resolve(voiceProcessor.getIsRecording());
    }

    @ReactMethod
    public void hasRecordAudioPermission(final Promise promise) {
        if (voiceProcessor.hasRecordAudioPermission(this.context.getApplicationContext())) {
            promise.resolve(true);
        } else {
            if (this.getCurrentActivity() != null) {
                ((PermissionAwareActivity) this.getCurrentActivity()).requestPermissions(
                    new String[]{Manifest.permission.RECORD_AUDIO},
                        RECORD_AUDIO_REQUEST_CODE,
                    new PermissionListener() {
                        public boolean onRequestPermissionsResult(final int requestCode,
                                                                  @NonNull final String[] permissions,
                                                                  @NonNull final int[] grantResults) {
                            if (requestCode == RECORD_AUDIO_REQUEST_CODE &&
                                    grantResults.length > 0 &&
                                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                                promise.resolve(true);
                                return true;
                            } else {
                                promise.resolve(false);
                                return false;
                            }
                        }
                    });
            } else {
                promise.reject(
                        "PV_AUDIO_RECORDER_ERROR",
                        "Unable to access current activity to request permissions");
            }
        }
    }
}
