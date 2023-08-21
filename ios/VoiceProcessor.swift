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

import AVFoundation

import ios_voice_processor

@objc(PvVoiceProcessor)
class PvVoiceProcessor: RCTEventEmitter {

    private let voiceProcessor = VoiceProcessor.instance

    private var settingsTimer: Timer?
    private var settingsLock = NSLock()
    private var isSettingsErrorReported = false

    private let FRAME_EMITTER_KEY = "frame_sent"
    private let ERROR_EMITTER_KEY = "error_sent"

    public override init() {
        super.init()
        voiceProcessor.addFrameListener(VoiceProcessorFrameListener({ frame in
            self.sendEvent(withName: self.FRAME_EMITTER_KEY, body: Array(frame))
        }))

        voiceProcessor.addErrorListener(VoiceProcessorErrorListener({ error in
            self.sendEvent(withName: self.ERROR_EMITTER_KEY, body: error.errorDescription)
        }))
    }

    override func supportedEvents() -> [String]! {
        [
            FRAME_EMITTER_KEY,
            ERROR_EMITTER_KEY
        ]
    }

    override static func requiresMainQueueSetup() -> Bool {
        true
    }

    @objc override func constantsToExport() -> [AnyHashable: Any] {
        [
            "FRAME_EMITTER_KEY": FRAME_EMITTER_KEY,
            "ERROR_EMITTER_KEY": ERROR_EMITTER_KEY
        ]
    }

    @objc(start:sampleRate:resolver:rejecter:)
    func start(
            frameLength: Int,
            sampleRate: Int,
            resolver resolve: RCTPromiseResolveBlock,
            rejecter reject: RCTPromiseRejectBlock) {
        do {
            try voiceProcessor.start(frameLength: UInt32(frameLength), sampleRate: UInt32(sampleRate))
        } catch {
            reject("PV_AUDIO_RECORDER_ERROR", "Unable to start audio recording", error)
            return
        }

        settingsTimer = Timer.scheduledTimer(
                timeInterval: 0.1,
                target: self,
                selector: #selector(monitorSettings),
                userInfo: nil,
                repeats: true)
        isSettingsErrorReported = false

        resolve(true)
    }

    @objc(stop:rejecter:)
    func stop(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            try voiceProcessor.stop()
        } catch {
            reject("PV_AUDIO_RECORDER_ERROR", "Unable to start stop recording", error)
            return
        }
        settingsTimer?.invalidate()
        isSettingsErrorReported = false

        resolve(true)
    }

    @objc(isRecording:rejecter:)
    func isRecording(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(voiceProcessor.isRecording)
    }

    @objc(hasRecordAudioPermission:rejecter:)
    func hasRecordAudioPermission(
            resolver resolve: @escaping RCTPromiseResolveBlock,
            rejecter reject: RCTPromiseRejectBlock) {
        if VoiceProcessor.hasRecordAudioPermission {
            resolve(true)
        } else {
            VoiceProcessor.requestRecordAudioPermission({ isGranted in
                resolve(isGranted)
            })
        }
    }

    @objc func monitorSettings() {
        settingsLock.lock()

        if voiceProcessor.isRecording &&
                AVAudioSession.sharedInstance().category != AVAudioSession.Category.playAndRecord {
            if !isSettingsErrorReported {
                self.sendEvent(
                        withName: ERROR_EMITTER_KEY,
                        body: "Audio settings have been changed and Picovoice is no longer receiving microphone audio.")
                isSettingsErrorReported = true
            }
        }
        settingsLock.unlock()
    }
}
