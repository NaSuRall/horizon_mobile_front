import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Calendar, QrCode, ShoppingBag, FileText, Users } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";

import HomeScreen     from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import QrcodeScreen   from "../screens/QrcodeScreen";
import ShopScreen     from "../screens/ShopScreen";
import GainScreen     from "../screens/GainScreen";
import ProfileScreen  from "../screens/ProfilScrenn";

const Tab = createBottomTabNavigator();

const ICONS = {
    Home:     Home,
    Calendar: Calendar,
    QrCode:   QrCode,
    Shop:     ShoppingBag,
    Gain:     FileText,
    Profil:   Users,
};

const LABELS = {
    Home:     "Accueil",
    Calendar: "Agenda",
    Shop:     "Boutique",
    Gain:     "Gains",
    Profil:   "Profil",
};

function CustomTabBar({ state, descriptors, navigation }) {
    const theme   = useTheme();
    const isLight = isLightColor(theme.primary);

    const iconActive = isLight ? "#111111" : "#ffffff";
    const iconMuted  = isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.32)";

    // Sépare les routes : 2 gauche · 1 centre · 3 droite
    // Ordre des tabs : Home(0) Calendar(1) QrCode(2) Shop(3) Gain(4) Profil(5)
    const leftRoutes   = state.routes.filter((_, i) => i < 2);
    const centerRoute  = state.routes[2];
    const rightRoutes  = state.routes.filter((_, i) => i > 2);
    const isCenterFocused = state.index === 2;

    const renderTab = (route) => {
        const idx       = state.routes.findIndex(r => r.key === route.key);
        const isFocused = state.index === idx;
        const Icon      = ICONS[route.name];
        const label     = LABELS[route.name];
        const color     = isFocused ? iconActive : iconMuted;

        return (
            <TouchableOpacity
                key={route.key}
                onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
                style={styles.tabItem}
                activeOpacity={0.7}
            >
                <Icon color={color} size={22} strokeWidth={isFocused ? 2.4 : 1.8} />
                <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                {isFocused && (
                    <View style={[styles.activeDot, { backgroundColor: iconActive }]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, { backgroundColor: theme.primary }]}>

                {/* ── Groupe gauche (Home + Calendar) ── */}
                <View style={styles.group}>
                    {leftRoutes.map(renderTab)}
                </View>

                {/* ── Bouton central QrCode ── */}
                <TouchableOpacity
                    onPress={() => { if (!isCenterFocused) navigation.navigate(centerRoute.name); }}
                    style={[
                        styles.centerButton,
                        isCenterFocused && { borderColor: theme.primary, borderWidth: 3 },
                    ]}
                    activeOpacity={0.85}
                >
                    <QrCode
                        color={isCenterFocused ? theme.primary : "#888888"}
                        size={26}
                        strokeWidth={2}
                    />
                </TouchableOpacity>

                {/* ── Groupe droite (Shop + Gain + Profil) ── */}
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
        position: "absolute", bottom: 0, left: 0, right: 0,
        alignItems: "center",
        paddingBottom: 18,
        backgroundColor: "transparent",
    },
    container: {
        width: "92%",
        height: 72,
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        // Ombre sous la barre
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 16,
    },

    // Chaque groupe prend la moitié de l'espace → QrCode parfaitement centré
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
        paddingVertical: 6,
        gap: 3,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: "500",
        letterSpacing: 0.2,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 1,
    },

    // Bouton QrCode central — surélevé, fond sombre, cercle blanc
    centerButton: {
        width: 62,
        height: 62,
        backgroundColor: "#1A1A1A",
        borderRadius: 31,
        borderWidth: 2.5,
        borderColor: "rgba(255,255,255,0.85)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -32,
        // Ombre spécifique au bouton central
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 14,
    },
});
