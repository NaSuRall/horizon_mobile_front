import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { useContext } from "react";
import Toast from 'react-native-toast-message';

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

function AppNavigation() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) {
    return null; // écran de chargement si tu veux
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        // Utilisateur connecté
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Utilisateur NON connecté
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigation />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}