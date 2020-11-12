import AVFoundation

@objc(PvVoiceProcessor)
class PvVoiceProcessor: RCTEventEmitter {

    private let audioInputEngine: AudioInputEngine = AudioInputEngine()
    private let BUFFER_EMITTER_KEY = "buffer_sent"
    private var isListening = false
    
    public override init() {        
        super.init()
    }

    override func supportedEvents() -> [String]! {
      return [self.BUFFER_EMITTER_KEY]
    }

    @objc override func constantsToExport() -> [AnyHashable : Any] {        
        return [
            "BUFFER_EMITTER_KEY": self.BUFFER_EMITTER_KEY
        ]
    }

    @objc(start:sampleRate:)
    func start(frameLength: Int, sampleRate: Int) -> Void {
        
        guard !isListening else {
            NSLog("Audio engine already running.");
            return
        }
        
        audioInputEngine.audioInput = { [weak self] audio in
            
            guard let `self` = self else {
                return
            }
                        
            let buffer = UnsafeBufferPointer(start: audio, count: frameLength);            
            self.sendEvent(withName: self.BUFFER_EMITTER_KEY, body: Array(buffer))
        }

        let audioSession = AVAudioSession.sharedInstance()        
        if audioSession.recordPermission == .denied {
            NSLog("Recording permissions denied")
            return;
        }                
        
        do{
            try audioSession.setCategory(AVAudioSession.Category.record)
            try audioSession.setMode(AVAudioSession.Mode.measurement)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            
            try audioInputEngine.start(frameLength:frameLength, sampleRate:sampleRate)
        }
        catch{
            NSLog("Unable to start audio engine");
            return
        }

        isListening = true
    }

    @objc(stop)
    func stop() -> Void {
        guard isListening else {
            return
        }
        
        self.audioInputEngine.stop()
        
        isListening = false
    }

    private class AudioInputEngine {
        private let numBuffers = 3
        private var audioQueue: AudioQueueRef?
        
        var audioInput: ((UnsafePointer<Int16>) -> Void)?
        
        func start(frameLength:Int, sampleRate:Int) throws {
            var format = AudioStreamBasicDescription(
                mSampleRate: Float64(sampleRate),
                mFormatID: kAudioFormatLinearPCM,
                mFormatFlags: kLinearPCMFormatFlagIsSignedInteger | kLinearPCMFormatFlagIsPacked,
                mBytesPerPacket: 2,
                mFramesPerPacket: 1,
                mBytesPerFrame: 2,
                mChannelsPerFrame: 1,
                mBitsPerChannel: 16,
                mReserved: 0)
            let userData = UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque())
            AudioQueueNewInput(&format, createAudioQueueCallback(), userData, nil, nil, 0, &audioQueue)
            
            guard let queue = audioQueue else {
                return
            }
            
            let bufferSize = UInt32(frameLength) * 2
            for _ in 0..<numBuffers {
                var bufferRef: AudioQueueBufferRef? = nil
                AudioQueueAllocateBuffer(queue, bufferSize, &bufferRef)
                if let buffer = bufferRef {
                    AudioQueueEnqueueBuffer(queue, buffer, 0, nil)
                }
            }
            
            AudioQueueStart(queue, nil)
        }
        
        func stop() {
            guard let audioQueue = audioQueue else {
                return
            }
            AudioQueueStop(audioQueue, true)
            AudioQueueDispose(audioQueue, false)
        }
        
        private func createAudioQueueCallback() -> AudioQueueInputCallback {
            return { userData, queue, bufferRef, startTimeRef, numPackets, packetDescriptions in
                
                // `self` is passed in as userData in the audio queue callback.
                guard let userData = userData else {
                    return
                }
                let `self` = Unmanaged<AudioInputEngine>.fromOpaque(userData).takeUnretainedValue()
                
                let pcm = bufferRef.pointee.mAudioData.assumingMemoryBound(to: Int16.self)
                
                if let audioInput = self.audioInput {
                    audioInput(pcm)
                }
                
                AudioQueueEnqueueBuffer(queue, bufferRef, 0, nil)
            }
        }
    }
}
