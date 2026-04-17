import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../simulation/types';
import {LaunchScreen} from './screens/LaunchScreen';
import {HomeScreen} from './screens/HomeScreen';
import {ScenarioSelectScreen} from './screens/ScenarioSelectScreen';
import {GameplayScreen} from './screens/GameplayScreen';
import {ResultScreen} from './screens/ResultScreen';
import {SettingsScreen} from './screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Launch"
        screenOptions={{headerShown: false, animation: 'fade'}}>
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScenarioSelect" component={ScenarioSelectScreen} />
        <Stack.Screen name="Gameplay" component={GameplayScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
