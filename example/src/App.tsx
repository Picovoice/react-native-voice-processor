import React, { Component } from 'react';
import { Button, PermissionsAndroid, Platform } from 'react-native';
import {
  StyleSheet,
  View,
  EventSubscription,
  NativeEventEmitter,
} from 'react-native';
import { VoiceProcessor, BufferEmitter } from 'react-native-voice-processor';

type Props = {};
type State = {};

export default class App extends Component<Props, State> {
  _bufferListener?: EventSubscription;
  _bufferEmitter: NativeEventEmitter;
  _voiceProcessor: VoiceProcessor;

  constructor(props: Props) {
    super(props);

    this._voiceProcessor = new VoiceProcessor(512, 16000);
    this._bufferEmitter = new NativeEventEmitter(BufferEmitter);
    this._bufferListener = this._bufferEmitter.addListener(
      BufferEmitter.BUFFER_EMITTER_KEY,
      async (buffer: number[]) => {
        console.log(`Buffer of size ${buffer.length} received!`);
      }
    );
  }
  componentDidMount() {}

  _startProcessing() {
    let recordAudioRequest;
    if (Platform.OS == 'android') {
      recordAudioRequest = this._requestRecordAudioPermission();
    } else {
      recordAudioRequest = new Promise(function (resolve, _) {
        resolve(true);
      });
    }

    recordAudioRequest.then((hasPermission) => {
      if (!hasPermission) {
        return;
      }

      this._voiceProcessor.start();
    });
  }

  _stopProcessing() {
    this._voiceProcessor.stop();
  }

  async _requestRecordAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'VoiceProcessorExample needs your permission to receive audio buffers.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ margin: 5 }}>
          <Button title="Start" onPress={() => this._startProcessing()} />
        </View>
        <View style={{ margin: 5 }}>
          <Button title="Stop" onPress={() => this._stopProcessing()} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
