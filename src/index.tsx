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
export type BufferCallbackType = (buffer: number[]) => void;
export const BufferEmitter = RCTVoiceProcessor;

class VoiceProcessor {
  private _frameLength: number;
  private _sampleRate: number;

  constructor(frameLength: number, sampleRate: number) {
    this._frameLength = frameLength;
    this._sampleRate = sampleRate;
  }

  start() {
    RCTVoiceProcessor.start(this._frameLength, this._sampleRate);
  }

  stop() {
    RCTVoiceProcessor.stop();
  }
}

export { VoiceProcessor };
