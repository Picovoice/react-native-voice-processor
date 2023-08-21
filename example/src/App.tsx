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
import { Button, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import {
  VoiceProcessor,
  VoiceProcessorError,
  // @ts-ignore
} from '@picovoice/react-native-voice-processor';

type Props = {};
type State = {
  isListening: boolean;
  buttonText: string;
  buttonDisabled: boolean;
  errorMessage: string | null;
  vuMeterWidthPercent: number;
  volumeHistory: number[];
};

export default class App extends Component<Props, State> {
  private readonly _frameLength: number = 512;
  private readonly _sampleRate: number = 16000;
  private readonly _dbfsOffset: number = 60;
  private readonly _volumeHistoryCapacity: number = 5;

  private _voiceProcessor: VoiceProcessor;

  constructor(props: Props) {
    super(props);
    this.state = {
      buttonText: 'Start',
      isListening: false,
      buttonDisabled: false,
      errorMessage: null,
      vuMeterWidthPercent: 0,
      volumeHistory: new Array(this._volumeHistoryCapacity).fill(0),
    };

    this._voiceProcessor = VoiceProcessor.instance;
    this._voiceProcessor.addFrameListener((frame: number[]) => {
      this.setState((prevState) => ({
        volumeHistory: [
          ...prevState.volumeHistory.splice(1),
          this.calculateVolume(frame),
        ],
      }));
    });
    this._voiceProcessor.addErrorListener((error: VoiceProcessorError) => {
      this.setState({
        errorMessage: `Error received from error listener: ${error}`,
      });
    });
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.volumeHistory !== this.state.volumeHistory) {
      const volumeAvg =
        [...this.state.volumeHistory].reduce(
          (accumulator, value) => accumulator + value,
          0
        ) / this._volumeHistoryCapacity;
      this.setState({
        vuMeterWidthPercent: volumeAvg * 100,
      });
    }
  }

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
        this.setState({
          errorMessage: 'User did not grant permission to record audio',
        });
      }
    } catch (e) {
      this.setState({
        errorMessage: `Unable to start recording: ${e}`,
      });
    }
  }

  async _stopProcessing() {
    try {
      await this._voiceProcessor.stop();
      this.setState({
        isListening: await this._voiceProcessor.isRecording(),
        buttonText: 'Start',
        buttonDisabled: false,
      });
    } catch (e) {
      this.setState({
        errorMessage: `Unable to stop recording: ${e}`,
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

  calculateVolume(frame: number[]): number {
    const sum = [...frame].reduce(
      (accumulator, sample) => accumulator + sample ** 2,
      0
    );
    const rms = Math.sqrt(sum / frame.length) / 32767.0;
    const dbfs = 20 * Math.log10(Math.max(rms, 1e-9));
    return Math.min(1, Math.max(0, dbfs + this._dbfsOffset) / this._dbfsOffset);
  }

  render() {
    return (
      <View style={styles.container}>
        <Svg height="50%" width="90%">
          <Rect x="0" y="90%" width="100%" height="100" fill="gray" />
          <Rect
            x="0"
            y="90%"
            width={`${this.state.vuMeterWidthPercent}%`}
            height="100"
            fill="#377dff"
          />
        </Svg>

        <View style={styles.subContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title={this.state.buttonText}
              disabled={this.state.buttonDisabled}
              onPress={() => this._toggleProcessing()}
              color="#377dff"
            />
          </View>
          {this.state.errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{this.state.errorMessage}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    margin: 5,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  errorContainer: {
    backgroundColor: 'red',
    borderRadius: 5,
    margin: 10,
    padding: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
});
