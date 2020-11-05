import { NativeEventEmitter, NativeModules } from 'react-native';

const RCTVoiceProcessor = NativeModules.VoiceProcessor;

class VoiceProcessor{

  private _audioBufferEmitter = new NativeEventEmitter(RCTVoiceProcessor);
  private _audioBufferListener : any;

  private _frameLength:number;
  private _sampleRate:number;

  constructor(frameLength:number, sampleRate:number){
    this._frameLength = frameLength;
    this._sampleRate = sampleRate;
  }

  start(callback:(audioBuffer:number[])=>void){        
    RCTVoiceProcessor.start(this._frameLength, this._sampleRate);
    this._audioBufferListener = this._audioBufferEmitter.addListener("audioBuffer", callback);
  }

  stop(){
    this._audioBufferListener.remove();
    RCTVoiceProcessor.stop();    
  }

}

export default VoiceProcessor;
