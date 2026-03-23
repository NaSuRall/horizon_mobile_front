import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import QRCode from 'react-native-qrcode-svg';
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { useTheme } from "../context/ThemeContext";

export default function QrcodeScreen() {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    const qrContent = JSON.stringify({ user_id: user.id, point: user.point });
    const readableCode = `HM-2024-${user.first_name.toUpperCase()}-${user.id}`;

    const styles = makeStyles(theme);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <Text style={styles.headerSpan}>Programme fidélité</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Présenter ce code en caisse{"\n"}pour cumuler vos points
            </Text>

            {/* QR Code */}
            <View style={styles.qrWrapper}>
                <View style={[styles.qrBox, { borderColor: theme.primary }]}>
                    <QRCode
                        value={qrContent}
                        size={220}
                        color="black"
                        backgroundColor="white"
                    />
                </View>
            </View>

            {/* Readable code */}
            <View style={styles.codeBox}>
                <Text style={styles.codeText}>{readableCode}</Text>
            </View>

            {/* Info card */}
            <View style={styles.infoCard}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>
                    Le caissier scannera ce code pour créditer vos points selon le montant de votre achat.
                </Text>
            </View>

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
            paddingTop: 50, paddingHorizontal: 16, gap: 20,
        },

        /* Header */
        header: {
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        },
        logo: { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        /* Subtitle */
        subtitle: {
            color: "#888888", fontFamily: "LexendDeca_400Regular",
            fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 8,
        },

        /* QR Code */
        qrWrapper: { alignItems: "center", justifyContent: "center" },
        qrBox: {
            backgroundColor: "white",
            padding: 20, borderRadius: 16,
            borderWidth: 3,             // ✅ bordure colorée autour du QR
            borderColor: theme.primary, // ✅ thème
        },

        /* Readable code */
        codeBox: {
            backgroundColor: "#1A1A1A", borderWidth: 1,
            borderColor: "#2A2A2A", borderRadius: 12,
            paddingVertical: 14, alignItems: "center",
        },
        codeText: {
            color: theme.primary,        // ✅ thème
            fontFamily: "LexendDeca_400Regular",
            fontSize: 16, letterSpacing: 1.5,
        },

        /* Info card */
        infoCard: {
            backgroundColor: "#1A1A1A", borderWidth: 1,
            borderColor: "#2A2A2A", borderRadius: 14,
            padding: 16, flexDirection: "row",
            alignItems: "flex-start", gap: 12,
        },
        infoDot: {
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: theme.primary, // ✅ thème
            marginTop: 3,
        },
        infoText: {
            flex: 1, color: "white",
            fontFamily: "LexendDeca_400Regular",
            fontSize: 14, lineHeight: 22,
        },
    });
}