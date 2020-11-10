import { NativeModules } from 'react-native';

const RCTVoiceProcessor = NativeModules.VoiceProcessor;
export type BufferCallbackType = (buffer: number[]) => void;
export const BufferEmitter = RCTVoiceProcessor;

class VoiceProcessor {
  private _samplesPerBuffer: number;
  private _sampleRate: number;

  constructor(samplesPerBuffer: number, sampleRate: number) {
    this._samplesPerBuffer = samplesPerBuffer;
    this._sampleRate = sampleRate;
  }

  start() {
    RCTVoiceProcessor.start(this._samplesPerBuffer, this._sampleRate);
  }

  stop() {
    RCTVoiceProcessor.stop();
  }
}

export { VoiceProcessor };
