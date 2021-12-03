import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';

import {
  useFonts,
  Lobster_400Regular,
} from "@expo-google-fonts/lobster"
import {
  Ubuntu_400Regular,
  Ubuntu_500Medium,
} from '@expo-google-fonts/ubuntu'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import token from './reducers/token';
import trip from './reducers/trip';
import userInfo from './reducers/userInfo';

import RegisterScreen from './screens/RegisterScreen'
import MainScreen from './screens/MainScreen'
import GeneratedScreen from './screens/GeneratedTrip'
import MemoriesScreen from './screens/MemoriesScreen'
import NextAdventuresScreen from './screens/NextAdventuresScreen'
import ProfileScreen from './screens/ProfileScreen'
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import CustomTabBar from './components/CustomTabBar';
import GuideScreen from './screens/GuideScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const store = createStore(combineReducers({ token, trip, userInfo }));

// Screens for saved Ex & Future Trips 
function MyDodas() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} >
      <Stack.Screen name="MyTrips" component={MemoriesScreen} />
      <Stack.Screen name="EditTrip" component={GeneratedScreen} />
    </Stack.Navigator>
  )
}

// Stack for Main Screen + Generated Trip
function GenerateTrip() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="TrustDodaResult" component={GeneratedScreen} />
    </Stack.Navigator>
  )
}

// Tab Nav
function DodaTab() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      initialRouteName='GenerateTrip'
      screenOptions={() => ({
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        headerShown: false,
      })}
    >
      <Tab.Screen name="MyDodas" component={MyDodas} />
      <Tab.Screen name="GenerateTrip" component={GenerateTrip} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  )
}

// Main Stack

export default function App() {
  let [fontsLoaded] = useFonts({
    Lobster_400Regular,
    Ubuntu_400Regular,
    Ubuntu_500Medium
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Welcome" component={GuideScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="DodaTab" component={DodaTab} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>

    );
  }
}
