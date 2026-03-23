import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useContext } from "react";
import Toast from 'react-native-toast-message';

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import TabNavigator from "./src/navigation/TabNavigator";

const Stack = createNativeStackNavigator();

function AppNavigation() {
    const { userToken, loading } = useContext(AuthContext);
    if (loading) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
                <Stack.Screen
                    name="Main"
                    // ✅ component prop au lieu d'une fonction inline
                    component={MainWithTheme}
                />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

// ✅ Composant déclaré en dehors pour éviter le re-render et l'erreur "object"
function MainWithTheme() {
    return (
        <ThemeProvider>
            <TabNavigator />
        </ThemeProvider>
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