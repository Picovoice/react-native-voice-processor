//
// Copyright 2020 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import { NativeModules } from 'react-native';

const RCTVoiceProcessor = NativeModules.PvVoiceProcessor;
type BufferCallbackType = (buffer: number[]) => void;
const BufferEmitter = RCTVoiceProcessor;

class VoiceProcessor {
  private static instance: VoiceProcessor;

  private _frameLength: number;
  private _sampleRate: number;
  private _recording: boolean;

  private constructor(frameLength: number, sampleRate: number) {
    this._frameLength = frameLength;
    this._sampleRate = sampleRate;
    this._recording = false;
  }

  public static getVoiceProcessor(
    frameLength: number,
    sampleRate: number
  ): VoiceProcessor {
    if (!VoiceProcessor.instance) {
      VoiceProcessor.instance = new VoiceProcessor(frameLength, sampleRate);
    } else {
      VoiceProcessor.instance._frameLength = frameLength;
      VoiceProcessor.instance._sampleRate = sampleRate;
    }

    return VoiceProcessor.instance;
  }

  async start() {
    if (this._recording) {
      return Promise.resolve(true);
    }

    this._recording = true;
    return RCTVoiceProcessor.start(this._frameLength, this._sampleRate);
  }

  async stop() {
    if (!this._recording) {
      return Promise.resolve(true);
    }

    this._recording = false;
    return RCTVoiceProcessor.stop();
  }
}

export { VoiceProcessor, BufferEmitter, BufferCallbackType };
