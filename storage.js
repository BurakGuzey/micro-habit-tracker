import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HABIT_TRACKER_DATA';

export const saveHabitsToStorage = async (habits) => {
  try {
    const json = JSON.stringify(habits);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

export const loadHabitsFromStorage = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error loading habits:', error);
    return [];
  }
};
