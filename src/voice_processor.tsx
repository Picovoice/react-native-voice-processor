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

/**
 * Type for callback functions that receive audio frames from the VoiceProcessor.
 */
type VoiceProcessorFrameListener = (frame: number[]) => void;

/**
 * Type for callbacks that receive errors from the VoiceProcessor.
 */
type VoiceProcessorErrorListener = (error: VoiceProcessorError) => void;

/**
 * The main class for the `VoiceProcessor` library.
 * This class provides methods to manage audio recording and handle audio frame events.
 */
class VoiceProcessor {
  private static _instance: VoiceProcessor;
  private _eventEmitter: NativeEventEmitter;

  private _frameListeners: Array<VoiceProcessorFrameListener> = [];
  private _errorListeners: Array<VoiceProcessorErrorListener> = [];

  /**
   * Private constructor.
   */
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
      async (error: string) => {
        let voiceProcessorError = new VoiceProcessorError(error);
        this._errorListeners.forEach(
          (listener: VoiceProcessorErrorListener) => {
            listener(voiceProcessorError);
          }
        );
      }
    );
  }

  /**
   * Get the singleton instance of the VoiceProcessor class.
   */
  public static get instance(): VoiceProcessor {
    if (!VoiceProcessor._instance) {
      VoiceProcessor._instance = new VoiceProcessor();
    }

    return VoiceProcessor._instance;
  }

  /**
   * Get the number of currently subscribed frame listeners.
   */
  public get numFrameListeners(): number {
    return this._frameListeners.length;
  }

  /**
   * Get the number of currently subscribed error listeners.
   */
  public get numErrorListeners(): number {
    return this._errorListeners.length;
  }

  /**
   * Adds a new listener that receives audio frames.
   * @param listener - The listener function to be called when audio frames are received.
   */
  public addFrameListener(listener: VoiceProcessorFrameListener) {
    this._frameListeners.push(listener);
  }

  /**
   * Adds multiple listeners that receive audio frames.
   * @param listeners - An array of listeners to be added.
   */
  public addFrameListeners(listeners: VoiceProcessorFrameListener[]) {
    this._frameListeners = this._frameListeners.concat(listeners);
  }

  /**
   * Removes a previously added frame listener.
   * @param listener - The listener function to be removed.
   */
  public removeFrameListener(listener: VoiceProcessorFrameListener) {
    this._frameListeners = this._frameListeners.filter(
      (x: VoiceProcessorFrameListener) => x !== listener
    );
  }

  /**
   * Removes previously added frame listeners.
   * @param listeners - An array of listener to be removed.
   */
  public removeFrameListeners(listeners: VoiceProcessorFrameListener[]) {
    this._frameListeners = this._frameListeners.filter(
      (x: VoiceProcessorFrameListener) => !listeners.includes(x)
    );
  }

  /**
   * Removes all frame listeners.
   */
  public clearFrameListeners() {
    this._frameListeners = [];
  }

  /**
   * Adds a new error listener.
   * @param errorListener - The listener to be called when errors occur.
   */
  public addErrorListener(errorListener: VoiceProcessorErrorListener) {
    this._errorListeners.push(errorListener);
  }

  /**
   * Removes a previously added error listener.
   * @param errorListener - The listener to be removed.
   */
  public removeErrorListener(errorListener: VoiceProcessorErrorListener) {
    this._errorListeners = this._errorListeners.filter(
      (x: VoiceProcessorErrorListener) => x !== errorListener
    );
  }

  /**
   * Removes all error listeners.
   */
  public clearErrorListeners() {
    this._errorListeners = [];
  }

  /**
   * Start audio recording with specified audio parameters.
   * @param frameLength - The desired length of audio frames, in number of samples.
   * @param sampleRate - The desired sample rate for audio recording, in Hz.
   * @returns A promise that resolves when recording starts.
   */
  public async start(frameLength: number, sampleRate: number): Promise<void> {
    return NativeModules.PvVoiceProcessor.start(frameLength, sampleRate);
  }

  /**
   * Stop audio recording.
   * @returns A promise that resolves when recording stops.
   */
  public async stop(): Promise<void> {
    return NativeModules.PvVoiceProcessor.stop();
  }

  /**
   * Checks if audio recording is currently in progress.
   * @returns A promise that resolves with a boolean indicating recording status.
   */
  public async isRecording(): Promise<boolean> {
    return NativeModules.PvVoiceProcessor.isRecording();
  }

  /**
   * Checks if the app has permission to record audio and prompts user if not.
   * @returns A promise that resolves with a boolean indicating permission status.
   */
  public async hasRecordAudioPermission(): Promise<boolean> {
    return NativeModules.PvVoiceProcessor.hasRecordAudioPermission();
  }
}

export {
  VoiceProcessor,
  VoiceProcessorFrameListener,
  VoiceProcessorErrorListener,
};
