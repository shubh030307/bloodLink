import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Mail, Phone, Droplets } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 text-center">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white p-6 rounded-2xl border border-gray-200 items-center shadow-sm mb-6">
          <View className="bg-blood-100 p-4 rounded-full mb-4">
            <UserIcon color="#ef4444" size={48} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</Text>
          <Text className="text-gray-500 capitalize mt-1">{user?.role} Account</Text>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
          <View className="p-4 border-b border-gray-100 flex-row items-center gap-3">
            <Mail color="#6b7280" size={20} />
            <View>
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="text-base text-gray-900">{user?.email || 'N/A'}</Text>
            </View>
          </View>
          
          <View className="p-4 border-b border-gray-100 flex-row items-center gap-3">
            <Phone color="#6b7280" size={20} />
            <View>
              <Text className="text-xs text-gray-500">Phone</Text>
              <Text className="text-base text-gray-900">{user?.phone || 'N/A'}</Text>
            </View>
          </View>
          
          <View className="p-4 flex-row items-center gap-3">
            <Droplets color="#6b7280" size={20} />
            <View>
              <Text className="text-xs text-gray-500">Blood Group</Text>
              <Text className="text-base text-gray-900 font-semibold text-red-600">{user?.bloodGroup || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={logout} 
          className="bg-red-50 p-4 rounded-2xl flex-row justify-center items-center gap-2 border border-red-100 mb-8"
        >
          <LogOut color="#ef4444" size={20} />
          <Text className="text-red-600 font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
