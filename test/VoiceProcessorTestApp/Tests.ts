//
// Copyright 2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import {
    VoiceProcessor,
    VoiceProcessorError,
    VoiceProcessorErrorListener,
    VoiceProcessorFrameListener,
} from '@picovoice/react-native-voice-processor';

export type Result = {
    testName: string;
    success: boolean;
    errorString?: string;
};

const _frameLength = 512;
const _sampleRate = 16000;
const _vp = VoiceProcessor.instance;

async function basicTest(): Promise<Result> {
    let result: Result = {
        testName: 'Basic test',
        success: false,
    };
    console.log("ho");
    let frameCount = 0;
    let errorCount = 0;

    const frameListener: VoiceProcessorFrameListener = (frame: number[]) => {
        if (frame.length !== _frameLength) {
            result.success = false;
            result.errorString = `Received frame of size ${frame.length}, expected ${_frameLength}`;
        } else {
            frameCount++;
        }
    };
    const errorListener: VoiceProcessorErrorListener = (
        error: VoiceProcessorError,
    ) => {
        result.success = false;
        result.errorString = error.message;
        errorCount++;
    };
    _vp?.addFrameListener(frameListener);
    _vp?.addErrorListener(errorListener);

    try {
        if (await _vp?.isRecording()) {
            return {
                ...result,
                errorString: 'Voice Processor should not be recording',
            };
        }
        if (!(await _vp?.hasRecordAudioPermission())) {
            return {
                ...result,
                errorString: 'Does not have record audio permission',
            };
        }
        await _vp?.start(_frameLength, _sampleRate);
        if (!(await _vp?.isRecording())) {
            return {
                ...result,
                errorString: 'Voice Processor should be recording',
            };
        }

        await new Promise(r => setTimeout(r, 3000));

        await _vp?.stop();
        if (!result.success && result.errorString) {
            return result;
        }

        if (frameCount === 0 || errorCount > 0) {
            return {
                ...result,
                errorString: `Received ${frameCount} frames and ${errorCount} errors`,
            };
        }
        if (await _vp?.isRecording()) {
            return {
                ...result,
                errorString: 'Voice Processor should not be recording',
            };
        }

        return {
            ...result,
            success: true,
        };
    } catch (e: any) {
        return {
            ...result,
            errorString: e.message,
        };
    } finally {
        _vp.clearErrorListeners();
        _vp.clearFrameListeners();
    }
}

async function invalidSetupTest(): Promise<Result> {
    let result: Result = {
        testName: 'Invalid setup test',
        success: true,
    };

    try {
        if (!(await _vp?.hasRecordAudioPermission())) {
            return {
                ...result,
                errorString: 'Does not have record audio permission',
            };
        }
        await _vp?.start(_frameLength, _sampleRate);
        try {
            await _vp?.start(1024, 44100);
            return {
                ...result,
                errorString:
                    'Second call to start() should have thrown an error',
            };
        } catch (e: any) {
            result.success = true;
        }
        await _vp?.stop();
    } catch (e: any) {
        return {
            ...result,
            errorString: e.message,
        };
    }

    return result;
}

async function addRemoveListenerTest(): Promise<Result> {
    let result: Result = {
        testName: 'Add and remove listeners test',
        success: false,
    };

    const checkNumListenerResult = (num: number, expectedNum: number) => {
        if (num !== expectedNum) {
            throw Error(
                `Expected listener count to be ${num}, got ${expectedNum}`,
            );
        }
    };

    try {
        checkNumListenerResult(_vp?.numFrameListeners, 0);

        let frameListener1: VoiceProcessorFrameListener = _ => {};
        let frameListener2: VoiceProcessorFrameListener = _ => {};
        _vp?.addFrameListener(frameListener1);
        checkNumListenerResult(_vp?.numFrameListeners, 1);
        _vp?.addFrameListener(frameListener2);
        checkNumListenerResult(_vp?.numFrameListeners, 2);
        _vp?.removeFrameListener(frameListener1);
        checkNumListenerResult(_vp?.numFrameListeners, 1);
        _vp?.removeFrameListener(frameListener1);
        checkNumListenerResult(_vp?.numFrameListeners, 1);
        _vp?.removeFrameListener(frameListener2);
        checkNumListenerResult(_vp?.numFrameListeners, 0);

        let frameListeners: VoiceProcessorFrameListener[] = [
            frameListener1,
            frameListener2,
        ];
        _vp?.addFrameListeners(frameListeners);
        checkNumListenerResult(_vp?.numFrameListeners, 2);
        _vp?.removeFrameListeners(frameListeners);
        checkNumListenerResult(_vp?.numFrameListeners, 0);
        _vp?.addFrameListeners(frameListeners);
        checkNumListenerResult(_vp?.numFrameListeners, 2);
        _vp?.clearFrameListeners();
        checkNumListenerResult(_vp?.numFrameListeners, 0);

        let errorListener1: VoiceProcessorErrorListener = _ => {};
        let errorListener2: VoiceProcessorErrorListener = _ => {};
        checkNumListenerResult(_vp?.numErrorListeners, 0);
        _vp?.addErrorListener(errorListener1);
        checkNumListenerResult(_vp?.numErrorListeners, 1);
        _vp?.addErrorListener(errorListener2);
        checkNumListenerResult(_vp?.numErrorListeners, 2);
        _vp?.removeErrorListener(errorListener1);
        checkNumListenerResult(_vp?.numErrorListeners, 1);
        _vp?.removeErrorListener(errorListener1);
        checkNumListenerResult(_vp?.numErrorListeners, 1);
        _vp?.removeErrorListener(errorListener2);
        checkNumListenerResult(_vp?.numErrorListeners, 0);
        _vp?.addErrorListener(errorListener1);
        checkNumListenerResult(_vp?.numErrorListeners, 1);
        _vp?.clearErrorListeners();
        checkNumListenerResult(_vp?.numErrorListeners, 0);
        return {
            ...result,
            success: true,
        };
    } catch (e: any) {
        return {
            ...result,
            errorString: e.message,
        };
    } finally {
        _vp.clearErrorListeners();
        _vp.clearFrameListeners();
    }
}

export async function runVoiceProcessorTests(): Promise<Result[]> {
    return [
        await basicTest(),
        await invalidSetupTest(),
        await addRemoveListenerTest(),
    ];
}

export const numTests = 3;
