import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { Droplets, Calendar, Bell, ChevronRight, Search, Moon, CheckCircle2 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

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

  const { data: appointments } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/my');
      return res.data;
    }
  });

  const nextAppointment = appointments?.find(a => a.status === 'Scheduled' || a.status === 'Confirmed');

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Top Header */}
      <View className="flex-row items-center px-6 pt-8 pb-4 justify-between mt-4">
        <View className="flex-row flex-1 bg-white border border-gray-100 shadow-sm rounded-full items-center px-4 py-2 mr-4 h-12">
          <Search color="#9ca3af" size={20} />
          <TextInput 
            placeholder="Search..." 
            className="flex-1 ml-2 text-base text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm border border-gray-50">
            <Moon color="#4b5563" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm border border-gray-50 relative">
            <Bell color="#4b5563" size={20} />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4 pb-32" showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View className="mb-8">
          <Text className="text-4xl font-extrabold text-[#111827]">
            Hello, {user?.name?.split(' ')[0] || 'John'}! 👋
          </Text>
          <Text className="text-base text-gray-500 mt-2 leading-6 pr-4">
            Thank you for being a life saver. Your generosity brings hope.
          </Text>
        </View>

        {/* Donation Status Card */}
        <View className="bg-white rounded-[32px] p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 relative overflow-hidden">
          {/* Background Drop Illustration */}
          <View className="absolute -right-6 top-6 opacity-10">
            <Droplets color="#ef4444" size={200} />
          </View>
          <View className="absolute -right-2 top-1/4 opacity-90 shadow-xl shadow-red-200">
            <Droplets fill="#ef4444" color="#ef4444" size={70} />
          </View>
          <View className="absolute right-12 top-12 opacity-40">
            <View className="w-4 h-4 bg-red-400 rounded-full"></View>
          </View>

          <Text className="text-xs font-bold text-gray-400 tracking-wider mb-4">DONATION STATUS</Text>
          
          <View className="flex-row items-center gap-3 mb-4">
            <CheckCircle2 color={eligibility?.status === 'Eligible' ? '#22c55e' : '#94a3b8'} size={32} />
            <Text className="text-4xl font-extrabold text-[#334155]">
              {eligibility?.status === 'Eligible' ? 'Eligible' : (eligibility?.status || 'Unknown')}
            </Text>
          </View>
          
          <Text className="text-gray-500 text-sm mb-8 pr-16 leading-5">
            {eligibility?.status === 'Eligible' 
              ? 'You are currently eligible to donate blood and save lives!' 
              : 'You are currently deferred from donating blood. Check back later.'}
          </Text>

          <TouchableOpacity className="bg-[#e11d48] py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-lg shadow-red-200 w-4/5">
            <Calendar color="white" size={20} />
            <Text className="text-white font-bold text-base ml-2">Book Appointment</Text>
            <ChevronRight color="white" size={20} className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Other Content (Upcoming Appt) */}
        {nextAppointment ? (
          <View className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 items-center mt-2 mb-10">
              <View className="bg-red-50 p-5 rounded-full mb-4">
                <Droplets color="#e11d48" size={36} fill="#e11d48" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-1">Upcoming Appointment</Text>
              <Text className="text-gray-500 text-center">
                {new Date(nextAppointment.date).toLocaleDateString()} - {nextAppointment.status}
              </Text>
          </View>
        ) : (
          <View className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 items-center mt-2 mb-10">
              <View className="bg-gray-50 p-5 rounded-full mb-4">
                <Droplets color="#e11d48" size={36} fill="#e11d48" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-1">View Milestones</Text>
              <Text className="text-gray-500 text-center px-4">
                Track your donation journey and impact
              </Text>
          </View>
        )}
        
        {/* Extra spacing for bottom tab bar */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
