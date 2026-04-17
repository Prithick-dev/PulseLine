import React from 'react';
import {View, Text, Switch, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../simulation/types';
import {useSettingsStore} from '../../store/settingsStore';
import {Colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const {soundEnabled, hapticsEnabled, toggleSound, toggleHaptics} =
    useSettingsStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
      </View>

      <View style={styles.section}>
        <SettingRow
          label="Sound"
          value={soundEnabled}
          onToggle={toggleSound}
        />
        <SettingRow
          label="Haptics"
          value={hapticsEnabled}
          onToggle={toggleHaptics}
        />
      </View>

      <Text style={styles.version}>PulseLine v0.1.0</Text>
    </View>
  );
}

function SettingRow({label, value, onToggle}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{false: Colors.border, true: Colors.stable}}
        thumbColor={Colors.textPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  back: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  version: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
