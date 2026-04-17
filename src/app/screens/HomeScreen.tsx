import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../simulation/types';
import {Colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>PULSELINE</Text>
        <Text style={styles.tagline}>Stabilize the patient. Every second counts.</Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation.navigate('ScenarioSelect')}>
          <Text style={styles.playLabel}>PLAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 6,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 60,
  },
  playButton: {
    backgroundColor: Colors.stable,
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 4,
  },
  playLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
    letterSpacing: 4,
  },
});
