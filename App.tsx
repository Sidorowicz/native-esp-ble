import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  PermissionsAndroid,
} from 'react-native';

import Esp32Component from './BLEComponent';

async function requestLocationPermission() {
  try {
    // const granted = await PermissionsAndroid.requestMultiple([
    //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //   PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    //   PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    // ]);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: 'title',
        message: 'message',
        buttonNeutral: 'neutral',
        buttonNegative: 'negative',
        buttonPositive: 'possitive',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('granted');
    } else {
      console.log('not granted');
    }
  } catch (err) {
    console.log(err);
  }
}

requestLocationPermission();

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Esp32Component />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
