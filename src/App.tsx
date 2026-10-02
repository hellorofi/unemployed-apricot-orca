import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'todos';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const stored = storage.getString(STORAGE_KEY);
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse todos from storage:', error);
      }
    }
  }, []);

  useEffect(() => {
    storage.set(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-2">
      <TouchableOpacity
        className="flex-1 flex-row items-center"
        onPress={() => toggleTodo(item.id)}
      >
        <View
          className={`h-6 w-6 rounded-full border-2 mr-3 items-center justify-center ${
            item.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-400 dark:border-gray-600'
          }`}
        >
          {item.completed && <Text className="text-white text-xs">✓</Text>}
        </View>
        <Text
          className={`flex-1 ${
            item.completed
              ? 'text-gray-500 dark:text-gray-400 line-through'
              : 'text-black dark:text-white'
          }`}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTodo(item.id)} className="p-2">
        <Text className="text-red-500 font-semibold">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-4"
      >
        <View className="pt-6 pb-4">
          <Text className="text-3xl font-bold text-black dark:text-white">
            Todo List
          </Text>
        </View>

        <View className="flex-row mb-4">
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-black dark:text-white"
            placeholder="Add a new todo..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTodo}
            returnKeyType="done"
          />
          <TouchableOpacity
            className="ml-2 bg-blue-500 rounded-lg px-6 py-3 items-center justify-center"
            onPress={addTodo}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
