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

import { NativeEventEmitter, NativeModules } from 'react-native';
import { VoiceProcessorError } from './voice_processor_errors';

type VoiceProcessorFrameListener = (frame: number[]) => void;

type VoiceProcessorErrorListener = (error: Error) => void;

class VoiceProcessor {
  private static _instance: VoiceProcessor;

  private _eventEmitter: NativeEventEmitter;

  private _frameListeners: Array<VoiceProcessorFrameListener> = [];
  private _errorListeners: Array<VoiceProcessorErrorListener> = [];

  private constructor() {
    this._eventEmitter = new NativeEventEmitter(NativeModules.PvVoiceProcessor);
    this._eventEmitter.addListener(
      NativeModules.PvVoiceProcessor.FRAME_EMITTER_KEY,
      async (frame: number[]) => {
        this._frameListeners.forEach(
          (listener: VoiceProcessorFrameListener) => {
            listener(frame);
          }
        );
      }
    );

    this._eventEmitter.addListener(
      NativeModules.PvVoiceProcessor.ERROR_EMITTER_KEY,
      async (error: Error) => {
        let voiceProcessorError = new VoiceProcessorError(error.message);
        this._errorListeners.forEach(
          (listener: VoiceProcessorErrorListener) => {
            listener(voiceProcessorError);
          }
        );
      }
    );
  }

  public static get instance(): VoiceProcessor {
    if (!VoiceProcessor._instance) {
      VoiceProcessor._instance = new VoiceProcessor();
    }

    return VoiceProcessor._instance;
  }

  public get numFrameListeners(): number {
    return this._frameListeners.length;
  }

  public get numErrorListeners(): number {
    return this._errorListeners.length;
  }

  public addFrameListener(listener: VoiceProcessorFrameListener) {
    this._frameListeners.push(listener);
  }

  public addFrameListeners(listeners: VoiceProcessorFrameListener[]) {
    this._frameListeners = this._frameListeners.concat(listeners);
  }

  public removeFrameListener(listener: VoiceProcessorFrameListener) {
    this._frameListeners = this._frameListeners.filter(
      (x: VoiceProcessorFrameListener) => x !== listener
    );
  }

  public removeFrameListeners(listeners: VoiceProcessorFrameListener[]) {
    this._frameListeners = this._frameListeners.filter(
      (x: VoiceProcessorFrameListener) => !listeners.includes(x)
    );
  }

  public clearFrameListeners() {
    this._frameListeners = [];
  }

  public addErrorListener(errorListener: VoiceProcessorErrorListener) {
    this._errorListeners.push(errorListener);
  }

  public removeErrorListener(errorListener: VoiceProcessorErrorListener) {
    this._errorListeners = this._errorListeners.filter(
      (x: VoiceProcessorErrorListener) => x !== errorListener
    );
  }

  public clearErrorListeners() {
    this._errorListeners = [];
  }

  public async start(frameLength: number, sampleRate: number): Promise<void> {
    return NativeModules.PvVoiceProcessor.start(frameLength, sampleRate);
  }

  public async stop(): Promise<void> {
    return NativeModules.PvVoiceProcessor.stop();
  }

  public async isRecording(): Promise<boolean> {
    return NativeModules.PvVoiceProcessor.isRecording();
  }

  public async hasRecordAudioPermission(): Promise<boolean> {
    return NativeModules.PvVoiceProcessor.hasRecordAudioPermission();
  }
}

export {
  VoiceProcessor,
  VoiceProcessorFrameListener,
  VoiceProcessorErrorListener,
};
