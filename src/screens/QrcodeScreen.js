import { useContext, useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import QRCode from 'react-native-qrcode-svg';
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { useTheme } from "../context/ThemeContext";

const QR_REFRESH_INTERVAL_MS = 9 * 60 * 1000; // 9 minutes (token valable 10 min côté API)

export default function QrcodeScreen() {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const theme = useTheme();
    const [qrToken, setQrToken] = useState(null);
    const [tokenError, setTokenError] = useState(false);

    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    const fetchQrToken = useCallback(async () => {
        setTokenError(false);
        try {
            const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/qrcode-token`);
            if (response && response.ok) {
                const data = await response.json();
                setQrToken(data.token);
            } else {
                setTokenError(true);
            }
        } catch {
            setTokenError(true);
        }
    }, [fetchWithAuth]);

    // Rafraîchit le token à chaque fois que l'écran devient actif
    useFocusEffect(
        useCallback(() => {
            fetchQrToken();
            const interval = setInterval(fetchQrToken, QR_REFRESH_INTERVAL_MS);
            return () => clearInterval(interval);
        }, [fetchQrToken])
    );

    const readableCode = `HM-${user.first_name.toUpperCase()}-${String(user.id).slice(0, 8).toUpperCase()}`;
    const styles = makeStyles(theme);

    if (!fontsLoaded || (!qrToken && !tokenError)) {
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
                    {tokenError ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Impossible de générer le QR code.{"\n"}Vérifiez votre connexion.</Text>
                        </View>
                    ) : (
                        <QRCode
                            value={qrToken}
                            size={220}
                            color="black"
                            backgroundColor="white"
                        />
                    )}
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
                    Le caissier scannera ce code pour créditer vos points selon le montant de votre achat.{"\n"}
                    <Text style={styles.infoHint}>Ce code est valable 10 minutes et se renouvelle automatiquement.</Text>
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
        header: {
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        },
        logo: { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },
        subtitle: {
            color: "#888888", fontFamily: "LexendDeca_400Regular",
            fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 8,
        },
        qrWrapper: { alignItems: "center", justifyContent: "center" },
        qrBox: {
            backgroundColor: "white",
            padding: 20, borderRadius: 16,
            borderWidth: 3,
            borderColor: theme.primary,
            minHeight: 260, alignItems: "center", justifyContent: "center",
        },
        errorBox: { width: 220, alignItems: "center", justifyContent: "center" },
        errorText: {
            color: "#888888", fontFamily: "LexendDeca_400Regular",
            fontSize: 14, textAlign: "center", lineHeight: 20,
        },
        codeBox: {
            backgroundColor: "#1A1A1A", borderWidth: 1,
            borderColor: "#2A2A2A", borderRadius: 12,
            paddingVertical: 14, alignItems: "center",
        },
        codeText: {
            color: theme.primary,
            fontFamily: "LexendDeca_400Regular",
            fontSize: 16, letterSpacing: 1.5,
        },
        infoCard: {
            backgroundColor: "#1A1A1A", borderWidth: 1,
            borderColor: "#2A2A2A", borderRadius: 14,
            padding: 16, flexDirection: "row",
            alignItems: "flex-start", gap: 12,
        },
        infoDot: {
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: theme.primary,
            marginTop: 3,
        },
        infoText: {
            flex: 1, color: "white",
            fontFamily: "LexendDeca_400Regular",
            fontSize: 14, lineHeight: 22,
        },
        infoHint: {
            color: "#888888", fontSize: 12,
        },
    });
}
