import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ChatScreen from './src/screens/ChatScreen';
import GrowthScreen from './src/screens/GrowthScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import RecipesScreen from './src/screens/RecipesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'chatbubble';

              if (route.name === '智能问答') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === '成长记录') {
                iconName = focused ? 'trending-up' : 'trending-up-outline';
              } else if (route.name === '日常记录') {
                iconName = focused ? 'clipboard' : 'clipboard-outline';
              } else if (route.name === '辅食推荐') {
                iconName = focused ? 'restaurant' : 'restaurant-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#667eea',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarLabelStyle: {
              fontSize: 11,
            },
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen
            name="智能问答"
            component={ChatScreen}
            options={{ headerTitle: 'AI 育儿助手' }}
          />
          <Tab.Screen
            name="成长记录"
            component={GrowthScreen}
            options={{ headerTitle: '宝宝成长' }}
          />
          <Tab.Screen
            name="日常记录"
            component={TrackingScreen}
            options={{ headerTitle: '喂养 & 睡眠' }}
          />
          <Tab.Screen
            name="辅食推荐"
            component={RecipesScreen}
            options={{ headerTitle: '辅食食谱' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
