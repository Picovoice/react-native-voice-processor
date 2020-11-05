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
    this._audioBufferListener = this._audioBufferEmitter.addListener("audioBufferAvailable", callback);
    RCTVoiceProcessor.start(this._frameLength, this._sampleRate);    
  }

  stop(){
    RCTVoiceProcessor.stop();    
    this._audioBufferListener.remove();    
  }

}

export default VoiceProcessor;
