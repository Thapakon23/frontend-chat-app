import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeView from './views/Home-view';
import LoginView from './views/Login-view';
import axios from 'axios';
import { useEffect } from 'react/cjs/react.development';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatView from './views/Chat-view';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatView}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
