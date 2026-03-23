import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Calendar, QrCode, FileText, Users } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";

import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import QrcodeScreen from "../screens/QrcodeScreen";
import GainScreen from "../screens/GainScreen";
import ProfileScreen from "../screens/ProfilScrenn";

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
    const theme = useTheme(); // ✅ thème ici
    const isLight    = isLightColor(theme.primary);
    const iconActive = isLight ? "#111111" : "white";
    const iconMuted  = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.4)";
    const centerIconColor = theme.primary;

    const icons = {
        Home: Home, Calendar: Calendar,
        QrCode: QrCode, Gain: FileText, Profil: Users,
    };

    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, { backgroundColor: theme.primary }]}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const isCenter  = route.name === "QrCode";
                    const Icon      = icons[route.name];
                    const onPress   = () => { if (!isFocused) navigation.navigate(route.name); };

                    if (isCenter) {
                        return (
                            <TouchableOpacity key={route.key} onPress={onPress} style={styles.centerButton}>
                                <Icon color={centerIconColor} size={28} />
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem}>
                            <Icon
                                color={isFocused ? iconActive : iconMuted}
                                size={24}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home"     component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="QrCode"   component={QrcodeScreen} />
            <Tab.Screen name="Gain"     component={GainScreen} />
            <Tab.Screen name="Profil"   component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        alignItems: "center", paddingBottom: 20, backgroundColor: "transparent",
    },
    container: {
        width: "90%", height: 65,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    tabItem: {
        flex: 1, alignItems: "center", justifyContent: "center", height: "100%",
    },
    centerButton: {
        width: 62, height: 62,
        backgroundColor: "#111111",
        borderColor: "white", borderWidth: 2,
        borderRadius: 31,
        justifyContent: "center", alignItems: "center",
        marginTop: -30,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 6,
    },
});