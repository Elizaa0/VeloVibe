import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen'; 
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen'; 
import LiveTrainingScreen from './src/screens/LiveTrainingScreen'; 
import AddRouteScreen from './src/screens/AddRouteScreen'; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#9FFB88',
    card: '#9FFB88',
    text: '#000000',
  },
};

const firebaseConfig = {
  apiKey: "AIzaSyChjXbNq7enfZpeJhP7zlAPAJy1dtmwPzk",
  authDomain: "velovibe-3922e.firebaseapp.com",
  projectId: "velovibe-3922e",
  storageBucket: "velovibe-3922e.appspot.com",
  messagingSenderId: "718267597069",
  appId: "1:718267597069:web:58beac517e9e0f958a3044",
  measurementId: "G-953FXJX7GS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <Button
                onPress={() => navigation.navigate('Home')}
                title="Wróć"
                color="#000"
              />
            ),
          })}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <Button
                onPress={() => navigation.navigate('Home')}
                title="Wróć"
                color="#000"
              />
            ),
          })}
        />
        <Stack.Screen 
          name="LiveTraining" 
          component={LiveTrainingScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <Button
                onPress={() => navigation.navigate('Home')}
                title="Wróć"
                color="#000"
              />
            ),
          })}
        />
        <Stack.Screen 
          name="AddRoute" 
          component={AddRouteScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <Button
                onPress={() => navigation.navigate('Home')}
                title="Wróć"
                color="#000"
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}