# React Native Voice Processor

[![GitHub release](https://img.shields.io/github/release/Picovoice/react-native-voice-processor.svg)](https://github.com/Picovoice/react-native-voice-processor/releases)
[![GitHub](https://img.shields.io/github/license/Picovoice/react-native-voice-processor)](https://github.com/Picovoice/react-native-voice-processor/)

[![npm](https://img.shields.io/npm/v/@picovoice/react-native-voice-processor)](https://www.npmjs.com/package/@picovoice/react-native-voice-processor)

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

<!-- markdown-link-check-disable -->
[![Twitter URL](https://img.shields.io/twitter/url?label=%40AiPicovoice&style=social&url=https%3A%2F%2Ftwitter.com%2FAiPicovoice)](https://twitter.com/AiPicovoice)
<!-- markdown-link-check-enable -->
[![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCAdi9sTCXLosG1XeqDwLx7w?label=YouTube&style=social)](https://www.youtube.com/channel/UCAdi9sTCXLosG1XeqDwLx7w)

The React Native Voice Processor is an asynchronous audio capture library designed for real-time audio
processing on mobile devices. Given some specifications, the library delivers frames of raw audio
data to the user via listeners.

## Table of Contents

- [React Native Voice Processor](#react-native-voice-processor)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Compatibility](#compatibility)
  - [Installation](#installation)
  - [Permissions](#permissions)
  - [Usage](#usage)
    - [Capturing with Multiple Listeners](#capturing-with-multiple-listeners)
  - [Example](#example)

## Requirements

- [Node.js](https://nodejs.org) (16+)
- [Android SDK](https://developer.android.com/about/versions/12/setup-sdk) (21+)
- [JDK](https://www.oracle.com/java/technologies/downloads/) (8+)
- [Xcode](https://developer.apple.com/xcode/) (11+)
- [CocoaPods](https://cocoapods.org/)

## Compatibility

- React Native 0.62.2+
- Android 5.0+ (API 21+)
- iOS 11.0+

## Installation

React Native Voice Processor is available via [npm](https://www.npmjs.com/package/@picovoice/react-native-voice-processor).
To import it into your React Native project install with npm or yarn:
```console
yarn add @picovoice/react-native-voice-processor
```
or
```console
npm i @picovoice/react-native-voice-processor --save
```

## Permissions

To enable recording with the hardware's microphone, you must first ensure that you have enabled the proper permission on both iOS and Android.

On iOS, open the `Info.plist` file and add the following line:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>[Permission explanation]</string>
```

On Android, open the `AndroidManifest.xml` and add the following line:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

See our [example app](./example) for how to properly request this permission from your users.

## Usage

Access the singleton instance of `VoiceProcessor`:

```typescript
import {
  VoiceProcessor,
  VoiceProcessorError
} from '@picovoice/react-native-voice-processor';

let voiceProcessor = VoiceProcessor.instance;
```

Add listeners for audio frames and errors:

```typescript
voiceProcessor.addFrameListener((frame: number[]) => {
  // use audio frame
});
voiceProcessor.addErrorListener((error: VoiceProcessorError) => {
  // handle error
});
```

Ask for audio record permission and start recording with the desired frame length and audio sample rate:

```typescript
const frameLength = 512;
const sampleRate = 16000;

try {
  if (await voiceProcessor.hasRecordAudioPermission()) {
    await voiceProcessor.start(frameLength, sampleRate);
  } else {
    // user did not grant permission
  }
} catch (e) {
  // handle start error
}
```

Stop audio capture:
```typescript
try {
  await this._voiceProcessor.stop();
} catch (e) {
  // handle stop error
}
```

Once audio capture has started successfully, any frame listeners assigned to the `VoiceProcessor` will start receiving audio frames with the given `frameLength` and `sampleRate`.

### Capturing with Multiple Listeners

Any number of listeners can be added to and removed from the `VoiceProcessor` instance. However,
the instance can only record audio with a single audio configuration (`frameLength` and `sampleRate`),
which all listeners will receive once a call to `start()` has been made. To add multiple listeners:
```typescript
const listener1 = (frame) => { };
const listener2 = (frame) => { };
const listeners = [listener1, listener2];
voiceProcessor.addFrameListeners(listeners);

voiceProcessor.removeFrameListeners(listeners);
// or
voiceProcessor.clearFrameListeners();
```

## Example

The [React Native Voice Processor app](./example) demonstrates how to ask for user permissions and capture output from the `VoiceProcessor`.

To launch the demo, run:
```console
yarn bootstrap
yarn example ios
# or
yarn example android
```

## Releases

### v1.2.0 - August 11, 2023
- Numerous API improvements
- Error handling improvements
- Allow for multiple listeners
- Upgrades to testing infrastructure and example app

### v1.1.0 - February 23, 2023
- Migrated to new template

### v1.0.0 - March 29, 2021
- Initial public release
