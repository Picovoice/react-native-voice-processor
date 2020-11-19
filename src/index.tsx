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
