//
// Copyright 2020 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import React, { Component } from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  StyleSheet,
  View,
  EventSubscription,
  NativeEventEmitter,
} from 'react-native';
import { VoiceProcessor, BufferEmitter } from 'react-native-voice-processor';

type Props = {};
type State = {
  isListening: boolean;
  buttonText: string;
  buttonDisabled: boolean;  
};

export default class App extends Component<Props, State> {
  _bufferListener?: EventSubscription;  
  _bufferEmitter: NativeEventEmitter;  

  constructor(props: Props) {
    super(props);
    this.state = {
      buttonText: 'Start',
      isListening: false,
      buttonDisabled: false
    };
    
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
        console.error("Did not grant required microphone permission.")
        return;
      }
      
      VoiceProcessor.getVoiceProcessor(512, 16000).start().then((didStart) =>{
        if(didStart){
          this.setState({          
            isListening: true,
            buttonText: "Stop",
            buttonDisabled: false
          });
        }      
      });      
    });
  }

  _stopProcessing() {    
    VoiceProcessor.getVoiceProcessor(512, 16000).stop().then((didStop) =>{
      if(didStop){
        this.setState({                      
          isListening: false,
          buttonText: "Start",
          buttonDisabled: false
        });
      }
    });
  }

  _toggleProcessing() {
    this.setState({
      buttonDisabled: true
    })

    if (this.state.isListening) {
      this._stopProcessing();
    } else {
      this._startProcessing();
    }
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
          <Button
            title={this.state.buttonText}
            disabled={this.state.buttonDisabled}
            onPress={() => this._toggleProcessing()}
          />
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
