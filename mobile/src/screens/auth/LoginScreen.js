import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.token);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Text className="text-4xl font-black text-blood-600 tracking-tighter">
            BloodLink
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Sign in to manage your blood bank operations
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 bg-gray-50">
              <Mail color="#9ca3af" size={20} />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-900"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 bg-gray-50">
              <Lock color="#9ca3af" size={20} />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={loading}
            className="bg-blood-600 rounded-xl py-4 items-center mt-4"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
