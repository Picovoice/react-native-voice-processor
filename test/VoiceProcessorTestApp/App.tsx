/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  Button,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {runVoiceProcessorTests, Result} from './Tests';

function printResults(results: Result[]) {
  return results.map(result => {
    return (
      <View
        key={result.testName}
        style={{
          backgroundColor: result.success ? 'green' : 'red',
          marginBottom: 5,
          padding: 5,
        }}>
        <Text>{result.testName}</Text>
        <Text testID="testResult">{`${result.success}`}</Text>
        {result.errorString ? <Text>{`${result.errorString}`}</Text> : <></>}
      </View>
    );
  });
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const runTests = async () => {
    setRunning(true);
    const newResults = await runVoiceProcessorTests();
    setResults(newResults);
    setRunning(false);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button title="Run Tests" testID="runTests" onPress={runTests} />
          {printResults(results)}
          {running ? (
            <Text testID="testStatus">Tests running, please wait...</Text>
          ) : (
            ''
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
