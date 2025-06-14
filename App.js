import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  useColorScheme,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
} from './storage';
import { scheduleDailyReminder } from './notifications';

export default function App() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [goal, setGoal] = useState('');
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const init = async () => {
      const stored = await loadHabitsFromStorage();
      const storedTheme = await AsyncStorage.getItem('theme');
      if (stored) setHabits(stored);
      if (storedTheme === 'dark') setIsDarkMode(true);
      if (storedTheme === 'light') setIsDarkMode(false);
      await scheduleDailyReminder();
    };
    init();
  }, []);

  useEffect(() => {
    saveHabitsToStorage(habits);
  }, [habits]);

  useEffect(() => {
    AsyncStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addHabit = () => {
    if (!newHabit || !goal) return;
    const habit = {
      id: Date.now().toString(),
      name: newHabit,
      goal: parseInt(goal),
      count: 0,
    };
    setHabits([...habits, habit]);
    setNewHabit('');
    setGoal('');
    Keyboard.dismiss();
  };

  const incrementHabit = (id) => {
    const updated = habits.map((habit) =>
      habit.id === id
        ? { ...habit, count: habit.count + 1 }
        : habit
    );
    setHabits(updated);
  };

  const resetHabit = (id) => {
    const updated = habits.map((habit) =>
      habit.id === id ? { ...habit, count: 0 } : habit
    );
    setHabits(updated);
  };

  const renderItem = ({ item }) => {
    const isComplete = item.count >= item.goal;
    const itemStyle = [
      styles.habitItem,
      isComplete && (isDarkMode ? styles.habitItemCompleteDark : styles.habitItemComplete),
      isDarkMode && !isComplete && styles.habitItemDark,
    ];
    const textStyle = [
      styles.habitText,
      isDarkMode && { color: isComplete ? 'white' : '#fff' },
    ];

    return (
      <View style={itemStyle}>
        <View style={styles.habitRow}>
          <Text style={textStyle}>
            {item.name} – {item.count}/{item.goal}
          </Text>
          <View style={styles.buttons}>
            <Button title="+" onPress={() => incrementHabit(item.id)} />
            <Button title="↺" onPress={() => resetHabit(item.id)} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        isDarkMode && { backgroundColor: '#121212' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.themeToggle}>
            <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              thumbColor={isDarkMode ? '#fff' : '#ccc'}
            />
          </View>

          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
          />

          <Text
            style={[
              styles.helperText,
              isDarkMode && { color: 'white' },
            ]}
          >
            Add a habit and a goal. Tap + to increase. ↺ to reset.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Habit name"
              placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
              value={newHabit}
              onChangeText={setNewHabit}
              style={[
                styles.input,
                styles.inputWide,
                isDarkMode && styles.inputDark,
              ]}
            />
            <TextInput
              placeholder="Goal"
              placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
              keyboardType="numeric"
              value={goal}
              onChangeText={setGoal}
              style={[
                styles.input,
                styles.inputNarrow,
                isDarkMode && styles.inputDark,
              ]}
            />
          </View>

          <View style={styles.addButton}>
            <Button title="Add Habit" onPress={addHabit} />
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  habitItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  habitItemDark: {
    backgroundColor: '#1f1f1f',
  },
  habitItemComplete: {
    backgroundColor: '#c8f7c5',
  },
  habitItemCompleteDark: {
    backgroundColor: '#4CAF50',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitText: {
    fontSize: 16,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 5,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  inputWide: {
    flex: 3,
  },
  inputNarrow: {
    flex: 1,
  },
  addButton: {
    padding: 10,
  },
  helperText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    paddingTop: 5,
  },
});
