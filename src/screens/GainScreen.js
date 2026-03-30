import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { Bookmark, X, Wrench, Camera, Square, Binoculars } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const ICONS = [Bookmark, X, Wrench, Camera, Square, Binoculars];

function TransactionIcon({ index, theme }) {
    const Icon = ICONS[index % ICONS.length];
    return (
        <View style={{ width: 42, height: 42, backgroundColor: theme.secondary, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
            <Icon color={theme.primary} size={20} />
        </View>
    );
}

export default function GainScreen() {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    const styles = makeStyles(theme);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const transactions = user.transactions ?? [];

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <Text style={styles.headerSpan}>Programme fidélité</Text>
            </View>

            {/* Title */}
            <View style={styles.titleBlock}>
                <Text style={styles.titleSub}>MES ACHATS</Text>
                <Text style={styles.titleMain}>HISTORIQUE</Text>
                <Text style={styles.transactionCount}>{transactions.length} transactions</Text>
            </View>

            {/* List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {transactions.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
                    </View>
                ) : (
                    transactions.map((tx, index) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <TransactionIcon index={index} theme={theme} />
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionLabel}>{tx.label}</Text>
                                <Text style={styles.transactionDate}>{tx.date}</Text>
                            </View>
                            <Text style={[
                                styles.transactionPoints,
                                { color: theme.primary }
                            ]}>
                                {tx.points >= 0 ? `+${tx.points}pts` : `${tx.points}pts`}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

        </View>
    );
}

function makeStyles(theme) {
    return StyleSheet.create({
        loadingContainer: {
            flex: 1, backgroundColor: "#111111",
            justifyContent: "center", alignItems: "center",
        },
        container: {
            flex: 1, backgroundColor: "#111111",
            paddingTop: 50, paddingHorizontal: 16,
        },
        header: {
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 24,
        },
        logo: { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        titleBlock: { gap: 2, marginBottom: 16 },
        titleSub: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13, letterSpacing: 1 },
        titleMain: {
            color: theme.primary, // ✅ thème
            fontFamily: "LexendDeca_700Bold", fontSize: 32, letterSpacing: 1,
        },
        transactionCount: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13, marginTop: 4 },

        scrollContent: { gap: 10, paddingBottom: 120 },

        transactionItem: {
            backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", gap: 14,
        },
        transactionInfo: { flex: 1, gap: 3 },
        transactionLabel: { color: "white", fontFamily: "LexendDeca_700Bold", fontSize: 14 },
        transactionDate:  { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 12 },
        transactionPoints: { fontFamily: "LexendDeca_700Bold", fontSize: 14 },

        emptyBox: {
            backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
            borderRadius: 14, paddingVertical: 30, alignItems: "center",
        },
        emptyText: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 14 },
    });
}