import React, { Component} from 'react';
import { Button, PermissionsAndroid, Platform } from 'react-native';
import { StyleSheet, View } from 'react-native';
import VoiceProcessor from 'react-native-voice-processor';

type Props = {};
type State = {};

export default class App extends Component<Props, State>{  
  
  voiceProcessor:VoiceProcessor;
  constructor(props:Props){
    super(props);
    
    this.voiceProcessor = new VoiceProcessor(512, 16000);     
  }
  componentDidMount() {        
    
  }
  
  _startProcessing(){       
    let recordAudioRequest;
    if (Platform.OS == 'android') {
      recordAudioRequest = this._requestRecordAudioPermission();
    } else {
      recordAudioRequest = new Promise(function (resolve, reject) { resolve(true); });
    }

    recordAudioRequest.then((hasPermission) => {
      if (!hasPermission) {        
        return;
      }

      this.voiceProcessor.start((buffer)=>{
        console.log(buffer);
      });
    });
  }

  _stopProcessing(){         
    
    this.voiceProcessor.stop();
  }

  async _requestRecordAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'ExampleApp needs access to your microphone to test react-native-audio-toolkit.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
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
        <View>
          <Button title="Start" onPress={() => this._startProcessing()} />
        </View>        
        <View>
          <Button title="Stop" onPress={() => this._stopProcessing()} />
        </View>        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
