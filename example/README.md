# React Native Voice Processor Example

This is an example app that demonstrates how to ask for user permissions and capture output from
the `VoiceProcessor`.

## Requirements

- [Node.js](https://nodejs.org) (16+)
- [Android SDK](https://developer.android.com/about/versions/12/setup-sdk) (21+)
- [JDK](https://www.oracle.com/java/technologies/downloads/) (8+)
- [Xcode](https://developer.apple.com/xcode/) (11+)
- [CocoaPods](https://cocoapods.org/)

## Compatibility

- Android 5.0+ (API 21+)
- iOS 11.0+

## Building

Install dependencies and setup environment (from the root directory of the repo):

```console
yarn bootstrap
```

Connect a mobile device or launch a simulator. Then build and run the app:
```console
yarn example ios
// or
yarn example android
```

## Usage

Toggle recording on and off with the button in the center of the screen. While recording, the VU meter on the screen will respond to the volume of incoming audio.
