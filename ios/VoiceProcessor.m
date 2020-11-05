#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(VoiceProcessor, RCTEventEmitter)

RCT_EXTERN_METHOD(start:(int)frameSize sampleRate:(int)sampleRate)
RCT_EXTERN_METHOD(stop)

@end
