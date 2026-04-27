import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, ScenarioId, SeverityTier} from '../../simulation/types';
import {SCENARIOS} from '../../simulation/scenarios';
import {getBestScore} from '../../storage/persistence';
import {Colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ScenarioSelect'>;

const ORDERED_SCENARIOS: ScenarioId[] = [
  'tachyarrhythmia',
  'hypoxemia',
  'hypotensive_shock',
  'panic_attack',
  'critical_hypoglycemia',
];

function tierColor(tier: SeverityTier): string {
  switch (tier) {
    case 'stable': return Colors.stable;
    case 'warning': return Colors.warning;
    case 'critical': return Colors.critical;
    case 'failing': return Colors.failing;
  }
}

export function ScenarioSelectScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SELECT SCENARIO</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {ORDERED_SCENARIOS.map(id => {
          const scenario = SCENARIOS[id];
          const best = getBestScore(id);
          return (
            <TouchableOpacity
              key={id}
              style={styles.card}
              onPress={() => navigation.navigate('Gameplay', {scenarioId: id})}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{scenario.name}</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    {borderColor: tierColor(scenario.difficulty)},
                  ]}>
                  <Text
                    style={[
                      styles.difficultyText,
                      {color: tierColor(scenario.difficulty)},
                    ]}>
                    {scenario.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{scenario.description}</Text>
              <Text style={styles.bestScore}>
                {best > 0 ? `Best: ${best}` : 'Not yet played'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  difficultyBadge: {
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  bestScore: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
