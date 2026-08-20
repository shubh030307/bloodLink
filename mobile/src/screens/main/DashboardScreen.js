import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, User as UserIcon, Droplets, Calendar, Bell, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  const { data: eligibility, isLoading: elLoading } = useQuery({
    queryKey: ['donorEligibility'],
    queryFn: async () => {
      if (user?.role !== 'Donor') return null;
      const res = await api.get('/donors/eligibility');
      return res.data;
    },
    enabled: user?.role === 'Donor'
  });

  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/my');
      return res.data;
    }
  });

  const nextAppointment = appointments?.find(a => a.status === 'Scheduled' || a.status === 'Confirmed');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-2">
          <View className="bg-blood-100 p-2 rounded-full">
            <UserIcon color="#ef4444" size={24} />
          </View>
          <View>
            <Text className="font-bold text-gray-900 text-lg">BloodLink</Text>
            <Text className="text-xs text-gray-500 capitalize">{user?.role} Portal</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={logout} className="p-2 bg-gray-100 rounded-full">
          <LogOut color="#4b5563" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Welcome back, {user?.name || 'User'}
        </Text>
        
        {user?.role === 'Donor' && (
          <View className="mb-6 space-y-4">
            <View className={`p-4 rounded-2xl border ${eligibility?.isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <View className="flex-row items-center gap-3 mb-2">
                <Droplets color={eligibility?.isEligible ? '#16a34a' : '#ef4444'} size={24} />
                <Text className={`font-bold text-lg ${eligibility?.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                  {eligibility?.isEligible ? 'Eligible to Donate' : 'Currently Not Eligible'}
                </Text>
              </View>
              {!eligibility?.isEligible && eligibility?.nextEligibleDate && (
                <Text className="text-red-600 mt-1">
                  You will be eligible again on {new Date(eligibility.nextEligibleDate).toLocaleDateString()}
                </Text>
              )}
            </View>

            {nextAppointment ? (
              <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center gap-2">
                    <Calendar color="#3b82f6" size={20} />
                    <Text className="font-bold text-gray-900">Next Appointment</Text>
                  </View>
                  <View className="bg-blue-50 px-2 py-1 rounded">
                    <Text className="text-blue-600 text-xs font-medium">{nextAppointment.status}</Text>
                  </View>
                </View>
                <Text className="font-semibold text-lg">{new Date(nextAppointment.date).toLocaleDateString()}</Text>
                <Text className="text-gray-500 mt-1">{nextAppointment.bloodBank?.name || nextAppointment.camp?.name}</Text>
              </View>
            ) : (
              <TouchableOpacity className="bg-blood-600 p-4 rounded-2xl flex-row justify-between items-center shadow-sm">
                <View>
                  <Text className="text-white font-bold text-lg">Book a Donation</Text>
                  <Text className="text-blood-100 mt-1">Save up to 3 lives today</Text>
                </View>
                <ChevronRight color="white" size={24} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {user?.role !== 'Donor' && (
           <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-gray-600 mb-2">Staff Dashboard</Text>
            <Text className="text-sm text-gray-500">
              Welcome to the Mobile Operations Portal. Use the desktop application for complex management tasks. Mobile workflows for {user?.role} are under development.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
