import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 导入页面组件
import PortalScreen from './src/screens/PortalScreen';
import LaunchPadScreen from './src/screens/LaunchPadScreen';
import RadarScreen from './src/screens/RadarScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Portal"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0a0a1a' }
          }}
        >
          <Stack.Screen name="Portal" component={PortalScreen} />
          <Stack.Screen name="LaunchPad" component={LaunchPadScreen} />
          <Stack.Screen name="Radar" component={RadarScreen} />
          <Stack.Screen name="Archive" component={ArchiveScreen} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});