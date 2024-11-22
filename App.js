import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { LogBox } from 'react-native'; // Import LogBox

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import LiveTrainingScreen from './src/screens/LiveTrainingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AddFriendScreen from './src/screens/AddFriendScreen';
import AddRouteScreen from './src/screens/AddRouteScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RouteDetailsScreen from './src/screens/RouteDetailsScreen';

// Ignorowanie określonych komunikatów
LogBox.ignoreLogs([
  "The action 'NAVIGATE' with payload", // Ignoruj komunikaty związane z nawigacją
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Strona główna') {
            iconName = 'home';
          } else if (route.name === 'Mapa') {
            iconName = 'map-outline';
          } else if (route.name === 'Trening') {
            iconName = 'bicycle-outline';
          } else if (route.name === 'Profil') {
            iconName = 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9FFB88',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Strona główna" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Trening" component={LiveTrainingScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddFriend"
              component={AddFriendScreen}
              options={{ title: 'Dodaj Znajomego' }}
            />
            <Stack.Screen
              name="AddRoute"
              component={AddRouteScreen}
              options={{ title: 'Dodaj Trasę' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Historia Treningów' }}
            />
            <Stack.Screen
              name="RouteDetails"
              component={RouteDetailsScreen}
              options={{ title: 'Szczegóły Trasy' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
