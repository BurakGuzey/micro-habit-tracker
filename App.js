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
} from 'react-native';
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

  useEffect(() => {
    const init = async () => {
      const stored = await loadHabitsFromStorage();
      if (stored) setHabits(stored);
      await scheduleDailyReminder();
    };
    init();
  }, []);

  useEffect(() => {
    saveHabitsToStorage(habits);
  }, [habits]);

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
    return (
      <View
        style={[
          styles.habitItem,
          isComplete && styles.habitItemComplete,
        ]}
      >
        <Text style={styles.habitText}>
          {item.name} – {item.count}/{item.goal}
        </Text>
        <View style={styles.buttons}>
          <Button title="+" onPress={() => incrementHabit(item.id)} />
          <Button title="↺" onPress={() => resetHabit(item.id)} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
          />

          <View style={styles.inputArea}>
            <TextInput
              placeholder="New Habit"
              value={newHabit}
              onChangeText={setNewHabit}
              style={styles.input}
            />
            <TextInput
              placeholder="Goal (e.g. 3)"
              keyboardType="numeric"
              value={goal}
              onChangeText={setGoal}
              style={styles.input}
            />
            <Button title="Add Habit" onPress={addHabit} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inputArea: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  habitItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  habitItemComplete: {
    backgroundColor: '#c8f7c5',
  },
  habitText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
