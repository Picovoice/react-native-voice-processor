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

import React, { Component } from 'react';
import { Button } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { VoiceProcessor } from 'react-native-voice-processor';
import type { VoiceProcessorError } from 'react-native-voice-processor';

type Props = {};
type State = {
  isListening: boolean;
  buttonText: string;
  buttonDisabled: boolean;
};

export default class App extends Component<Props, State> {
  private readonly _frameLength: number = 512;
  private readonly _sampleRate: number = 16000;

  private _voiceProcessor: VoiceProcessor;

  constructor(props: Props) {
    super(props);
    this.state = {
      buttonText: 'Start',
      isListening: false,
      buttonDisabled: false,
    };

    this._voiceProcessor = VoiceProcessor.instance;
    this._voiceProcessor.addFrameListener((frame: number[]) => {
      console.log(`Received a frame with size ${frame.length}`);
    });
    this._voiceProcessor.addErrorListener((error: VoiceProcessorError) => {
      console.error(`Error listener triggered: ${error}`);
    });
  }

  componentDidMount() {}

  async _startProcessing() {
    try {
      if (await this._voiceProcessor.hasRecordAudioPermission()) {
        await this._voiceProcessor.start(this._frameLength, this._sampleRate);
        this.setState({
          isListening: await this._voiceProcessor.isRecording(),
          buttonText: 'Stop',
          buttonDisabled: false,
        });
      } else {
        console.error(Error('User did not grant permission to record audio.'));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async _stopProcessing() {
    try {
      await this._voiceProcessor.stop();
    } catch (e) {
      this.setState({
        isListening: false,
        buttonText: 'Start',
        buttonDisabled: false,
      });
    }
  }

  async _toggleProcessing() {
    this.setState({
      buttonDisabled: true,
    });

    if (this.state.isListening) {
      await this._stopProcessing();
    } else {
      await this._startProcessing();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
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
  subContainer: {
    margin: 5,
  },
});
