import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Home, Calendar, QrCode, Gift, User } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

import HomeScreen     from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import QrcodeScreen   from "../screens/QrcodeScreen";
import ShopScreen     from "../screens/ShopScreen";
import GainScreen     from "../screens/GainScreen";
import ProfileScreen  from "../screens/ProfilScrenn";

const Tab = createBottomTabNavigator();

const TABS = [
    { name: "Home",     Icon: Home,     label: "Accueil" },
    { name: "Calendar", Icon: Calendar, label: "Agenda"  },
    // QrCode est géré séparément (bouton central)
    { name: "Gain",     Icon: Gift,     label: "Gains"   },
    { name: "Profil",   Icon: User,     label: "Profil"  },
];

function CustomTabBar({ state, descriptors, navigation }) {
    const theme = useTheme();

    // Indices dans state.routes (ordre déclaré dans Tab.Navigator)
    // Home=0 · Calendar=1 · QrCode=2 · Shop=3 · Gain=4 · Profil=5
    const leftRoutes  = [state.routes[0], state.routes[1]];
    const centerRoute = state.routes[2];
    const rightRoutes = [state.routes[4], state.routes[5]];
    const isCenter    = state.index === 2;

    const renderTab = (route) => {
        const idx       = state.routes.findIndex(r => r.key === route.key);
        const isFocused = state.index === idx;
        const tab       = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const { Icon, label } = tab;

        return (
            <TouchableOpacity
                key={route.key}
                onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
                style={styles.tabItem}
                activeOpacity={0.7}
            >
                <Icon
                    color={isFocused ? "#ffffff" : "rgba(255,255,255,0.4)"}
                    size={22}
                    strokeWidth={isFocused ? 2.5 : 1.8}
                />
                <Text style={[
                    styles.tabLabel,
                    { color: isFocused ? "#ffffff" : "rgba(255,255,255,0.4)" },
                    isFocused && styles.tabLabelActive,
                ]}>
                    {label}
                </Text>
                {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.wrapper}>
            <View style={[styles.bar, { backgroundColor: theme.primary }]}>

                {/* Groupe gauche — Home · Agenda */}
                <View style={styles.group}>
                    {leftRoutes.map(renderTab)}
                </View>

                {/* Bouton QR central surélevé */}
                <TouchableOpacity
                    onPress={() => { if (!isCenter) navigation.navigate(centerRoute.name); }}
                    activeOpacity={0.85}
                    style={styles.centerWrap}
                >
                    <View style={[
                        styles.centerButton,
                        isCenter && { borderColor: theme.primary, borderWidth: 3, backgroundColor: "#fff" },
                    ]}>
                        <QrCode
                            color={isCenter ? theme.primary : "#fff"}
                            size={26}
                            strokeWidth={2}
                        />
                    </View>
                    <Text style={[
                        styles.tabLabel,
                        { color: isCenter ? "#ffffff" : "rgba(255,255,255,0.4)" },
                        isCenter && styles.tabLabelActive,
                    ]}>
                        QR Code
                    </Text>
                    {isCenter && <View style={styles.activeDot} />}
                </TouchableOpacity>

                {/* Groupe droite — Gains · Profil */}
                <View style={styles.group}>
                    {rightRoutes.map(renderTab)}
                </View>

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
            <Tab.Screen name="Shop"     component={ShopScreen} />
            <Tab.Screen name="Gain"     component={GainScreen} />
            <Tab.Screen name="Profil"   component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        alignItems: "center",
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
        backgroundColor: "transparent",
    },

    bar: {
        width: "90%",
        height: 68,
        borderRadius: 26,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 20,
    },

    group: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },

    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingVertical: 4,
    },
    tabLabel: {
        fontSize: 10,
        letterSpacing: 0.2,
    },
    tabLabelActive: {
        fontWeight: "700",
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#fff",
        marginTop: 1,
    },

    // Bouton central QR
    centerWrap: {
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        paddingBottom: 2,
    },
    centerButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "rgba(0,0,0,0.35)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.6)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 16,
    },
});
