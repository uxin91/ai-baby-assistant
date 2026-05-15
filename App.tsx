import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ChatScreen from './src/screens/ChatScreen';
import GrowthScreen from './src/screens/GrowthScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import { colors } from './src/theme';

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

              return <Ionicons name={iconName} size={focused ? size + 1 : size} color={color} />;
            },
            tabBarActiveTintColor: colors.blue,
            tabBarInactiveTintColor: colors.textSubtle,
            tabBarStyle: {
              height: Platform.OS === 'ios' ? 82 : 68,
              paddingBottom: Platform.OS === 'ios' ? 22 : 10,
              paddingTop: 8,
              backgroundColor: 'rgba(255,255,255,0.94)',
              borderTopWidth: 1,
              borderTopColor: colors.lineSoft,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: 'rgba(245,246,250,0.96)',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
            },
          })}
        >
          <Tab.Screen name="智能问答" component={ChatScreen} options={{ headerTitle: '小芽育儿' }} />
          <Tab.Screen name="成长记录" component={GrowthScreen} options={{ headerTitle: '宝宝成长' }} />
          <Tab.Screen name="日常记录" component={TrackingScreen} options={{ headerTitle: '喂养与睡眠' }} />
          <Tab.Screen name="辅食推荐" component={RecipesScreen} options={{ headerTitle: '辅食食谱' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
