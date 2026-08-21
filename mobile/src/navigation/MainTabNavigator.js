import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Home, Calendar, Clock, User as UserIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const DummyScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Coming Soon</Text>
  </View>
);

const renderLabel = (text, focused, color) => (
  <View style={styles.labelContainer}>
    <Text style={[styles.labelText, { color }]}>{text}</Text>
    {focused && <View style={styles.activeIndicator} />}
  </View>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          borderRadius: 40,
          height: 80,
          paddingBottom: 16,
          paddingTop: 16,
          borderTopWidth: 0,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          tabBarLabel: ({ focused, color }) => renderLabel('Home', focused, color),
        }}
      />
      <Tab.Screen 
        name="Book" 
        component={DummyScreen} 
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
          tabBarLabel: ({ focused, color }) => renderLabel('Book', focused, color),
        }}
      />
      <Tab.Screen 
        name="Appts" 
        component={DummyScreen} 
        options={{
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
          tabBarLabel: ({ focused, color }) => renderLabel('Appts', focused, color),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <UserIcon color={color} size={24} />,
          tabBarLabel: ({ focused, color }) => renderLabel('Profile', focused, color),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    alignItems: 'center',
    marginTop: 4,
    height: 20, // fixed height to accommodate label and indicator
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 24,
    height: 3,
    backgroundColor: '#dc2626',
    borderRadius: 2,
    marginTop: 4,
  }
});
