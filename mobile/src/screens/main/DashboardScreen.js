import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Droplet, Calendar, Bell, ChevronRight, Search, Moon, CheckCircle2 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { user } = useAuth();

  const { data: eligibility } = useQuery({
    queryKey: ['donorEligibility'],
    queryFn: async () => {
      if (user?.role !== 'Donor') return null;
      const res = await api.get('/donors/eligibility');
      return res.data;
    },
    enabled: user?.role === 'Donor'
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Top Header */}
      <View className="flex-row items-center px-6 pt-8 pb-6 justify-between">
        <View className="flex-row flex-1 bg-[#F1F5F9] rounded-full items-center px-4 py-3 mr-3 h-12">
          <Search color="#64748B" size={20} />
          <TextInput 
            placeholder="Search..." 
            className="flex-1 ml-2 text-base text-gray-800 font-medium pb-1"
            placeholderTextColor="#94A3B8"
          />
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-12 h-12 bg-[#F1F5F9] rounded-full items-center justify-center">
            <Moon color="#475569" size={22} />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-[#F1F5F9] rounded-full items-center justify-center relative">
            <Bell color="#475569" size={22} />
            <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F1F5F9]" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Greeting Section */}
        <View className="px-6 mb-8 mt-2">
          <Text className="text-[34px] font-extrabold text-[#0F172A] tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'John'}! 👋
          </Text>
          <Text className="text-lg text-[#64748B] mt-2 leading-7 pr-4 font-medium">
            Thank you for being a life saver. Your generosity brings hope.
          </Text>
        </View>

        {/* Donation Status Card */}
        <View className="mx-6 bg-white rounded-[32px] mb-8 shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
          {/* Dual-Tone Background (Pinkish right side) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 240, 240, 0.8)', 'rgba(255, 225, 225, 1)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '45%' }}
          />

          <View className="p-7 relative z-10 w-[65%]">
            <Text className="text-[11px] font-bold text-gray-500 tracking-[0.2em] mb-4">DONATION STATUS</Text>
            
            <View className="flex-row items-center gap-3 mb-4">
              <CheckCircle2 color="#475569" size={36} strokeWidth={2.5} />
              <Text className="text-[32px] font-extrabold text-[#0F172A]">
                {eligibility?.status || 'Unknown'}
              </Text>
            </View>
            
            <Text className="text-[#64748B] text-[15px] mb-10 leading-6 font-medium pr-2">
              {eligibility?.status === 'Eligible' 
                ? 'You are currently eligible to donate blood and save lives!' 
                : 'You are currently eligible to donate blood and save lives!'}
            </Text>

            <TouchableOpacity className="bg-[#EA0B0B] py-4 px-6 rounded-[20px] flex-row items-center justify-center w-[110%] shadow-[0_8px_20px_rgba(234,11,11,0.3)]">
              <Calendar color="white" size={20} />
              <Text className="text-white font-bold text-[15px] ml-2 flex-1 text-center">Book Appointment</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* Blood Drop Graphic (Absolutely positioned on the right) */}
          <View className="absolute right-0 top-0 bottom-0 w-[45%] flex items-center justify-center z-0">
            {/* The main large red drop */}
            <View className="absolute" style={{ transform: [{ translateY: 20 }] }}>
              <Droplet color="#EA0B0B" size={100} fill="#EA0B0B" strokeWidth={0} />
              {/* Inner highlight for 3D effect */}
              <View className="absolute top-[30%] right-[25%] w-[12%] h-[25%] bg-white rounded-full opacity-30" style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
            {/* Small floating drops/dots */}
            <Droplet className="absolute top-[25%] left-[10%] opacity-60" color="#f87171" size={24} fill="#f87171" strokeWidth={0} />
            <View className="absolute top-[15%] right-[20%] w-4 h-4 bg-[#f87171] rounded-full opacity-90" />
          </View>
        </View>

        {/* Bottom Content Area - Liquid Glass Effect */}
        <View className="mx-6 h-64 rounded-[40px] overflow-hidden border border-white/40 shadow-sm mt-2">
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} className="items-center pt-12">
            <View className="bg-[#F1F5F9] w-20 h-20 rounded-full items-center justify-center opacity-90">
              <Droplet color="#EA0B0B" size={32} fill="#EA0B0B" strokeWidth={0} />
            </View>
          </BlurView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
