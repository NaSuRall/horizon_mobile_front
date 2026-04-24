import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import QRCode from "react-native-qrcode-svg";
import {
    View, Text, StyleSheet, Image, ActivityIndicator,
    TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca";
import { useTheme } from "../context/ThemeContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CheckCircle, UserCircle, Zap } from "lucide-react-native";
import Toast from "react-native-toast-message";

const QR_REFRESH_INTERVAL_MS = 9 * 60 * 1000;

// ─── Écran CLIENT ────────────────────────────────────────────────────────────
function ClientQrScreen({ user, fetchWithAuth, theme, styles }) {
    const [qrToken,    setQrToken]    = useState(null);
    const [tokenError, setTokenError] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            fetchQrToken();
            const interval = setInterval(fetchQrToken, QR_REFRESH_INTERVAL_MS);
            return () => clearInterval(interval);
        }, [fetchQrToken])
    );

    const readableCode = user?.first_name
        ? `HM-${user.first_name.toUpperCase()}-${String(user.id).slice(0, 8).toUpperCase()}`
        : "HM-XXXXXXXX";

    if (!qrToken && !tokenError) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <Text style={styles.headerSpan}>Programme fidélité</Text>
            </View>

            <Text style={styles.subtitle}>
                Présenter ce code en caisse{"\n"}pour cumuler vos points
            </Text>

            <View style={styles.qrWrapper}>
                <View style={[styles.qrBox, { borderColor: theme.primary }]}>
                    {tokenError ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Impossible de générer le QR code.{"\n"}Vérifiez votre connexion.</Text>
                        </View>
                    ) : (
                        <QRCode value={qrToken} size={220} color="black" backgroundColor="white" />
                    )}
                </View>
            </View>

            <View style={styles.codeBox}>
                <Text style={styles.codeText}>{readableCode}</Text>
            </View>

            <View style={styles.infoCard}>
                <View style={[styles.infoDot, { backgroundColor: theme.primary }]} />
                <Text style={styles.infoText}>
                    Le caissier scannera ce code pour créditer vos points selon le montant de votre achat.{"\n"}
                    <Text style={styles.infoHint}>Ce code est valable 10 minutes et se renouvelle automatiquement.</Text>
                </Text>
            </View>
        </View>
    );
}

// ─── Écran ADMIN ─────────────────────────────────────────────────────────────
function AdminScanScreen({ fetchWithAuth, theme, styles }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned,    setScanned]        = useState(false);
    const [customer,   setCustomer]       = useState(null);
    const [amount,     setAmount]         = useState("");
    const [loading,    setLoading]        = useState(false);
    const [success,    setSuccess]        = useState(null);

    const handleScan = async ({ data: qrToken }) => {
        if (scanned) return;
        setScanned(true);
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/admin/customer-info`, {
                method: "POST",
                body: JSON.stringify({ qr_token: qrToken }),
            });
            if (!res) return;
            const data = await res.json();
            if (res.ok) {
                setCustomer({ ...data, qr_token: qrToken });
            } else {
                Toast.show({ type: "error", text1: "QR invalide", text2: data.error ?? "Code expiré ou inconnu" });
                setTimeout(() => setScanned(false), 2000);
            }
        } catch {
            Toast.show({ type: "error", text1: "Erreur réseau" });
            setTimeout(() => setScanned(false), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPoints = async () => {
        const pts = parseInt(amount, 10);
        if (!pts || pts <= 0) {
            Toast.show({ type: "error", text1: "Montant invalide" });
            return;
        }
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/admin/scan`, {
                method: "POST",
                body: JSON.stringify({ qr_token: customer.qr_token, amount: pts }),
            });
            if (!res) return;
            const data = await res.json();
            if (res.ok) {
                setSuccess({ pts, newTotal: data.points, rank: data.rank });
            } else {
                Toast.show({ type: "error", text1: "Erreur", text2: data.error ?? "Une erreur est survenue" });
            }
        } catch {
            Toast.show({ type: "error", text1: "Erreur réseau" });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setScanned(false);
        setCustomer(null);
        setAmount("");
        setSuccess(null);
    };

    // Permissions caméra
    if (!permission) {
        return <View style={styles.loadingContainer}><ActivityIndicator color={theme.primary} size="large" /></View>;
    }
    if (!permission.granted) {
        return (
            <View style={styles.permContainer}>
                <Text style={styles.permTitle}>Accès caméra requis</Text>
                <Text style={styles.permSub}>Pour scanner les QR codes clients</Text>
                <TouchableOpacity style={[styles.permBtn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Autoriser la caméra</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header admin */}
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <View style={[styles.adminBadge, { backgroundColor: theme.secondary }]}>
                    <Text style={[styles.adminBadgeText, { color: theme.primary }]}>ADMIN</Text>
                </View>
            </View>

            <Text style={styles.subtitle}>Scanner le QR code du client</Text>

            {/* Viewfinder caméra */}
            <View style={styles.cameraWrapper}>
                {loading ? (
                    <View style={[styles.cameraPlaceholder]}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleScan}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    >
                        {/* Cadre de visée */}
                        <View style={styles.scanOverlay}>
                            <View style={[styles.scanCorner, styles.scanCornerTL, { borderColor: theme.primary }]} />
                            <View style={[styles.scanCorner, styles.scanCornerTR, { borderColor: theme.primary }]} />
                            <View style={[styles.scanCorner, styles.scanCornerBL, { borderColor: theme.primary }]} />
                            <View style={[styles.scanCorner, styles.scanCornerBR, { borderColor: theme.primary }]} />
                        </View>
                    </CameraView>
                )}
            </View>

            {scanned && !customer && !loading && (
                <TouchableOpacity style={styles.rescanBtn} onPress={reset}>
                    <Text style={[styles.rescanText, { color: theme.primary }]}>Scanner à nouveau</Text>
                </TouchableOpacity>
            )}

            {/* ── Modal infos client + ajout de points ── */}
            <Modal visible={!!customer && !success} transparent animationType="slide">
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <ScrollView contentContainerStyle={styles.modalScroll}>
                            <View style={styles.modalBox}>
                                {/* Avatar */}
                                <View style={[styles.avatarCircle, { backgroundColor: theme.secondary }]}>
                                    <UserCircle size={36} color={theme.primary} />
                                </View>

                                <Text style={styles.modalName}>
                                    {customer?.first_name} {customer?.last_name}
                                </Text>
                                <Text style={styles.modalEmail}>{customer?.email}</Text>

                                {/* Points actuels */}
                                <View style={styles.pointsRow}>
                                    <View style={[styles.pointsBadge, { backgroundColor: theme.secondary }]}>
                                        <Text style={[styles.pointsVal, { color: theme.primary }]}>{customer?.points}</Text>
                                        <Text style={[styles.pointsLbl, { color: theme.primary }]}>points</Text>
                                    </View>
                                    <View style={[styles.rankBadge, { borderColor: theme.primary }]}>
                                        <Text style={[styles.rankText, { color: theme.primary }]}>{customer?.rank}</Text>
                                    </View>
                                </View>

                                {/* Saisie montant */}
                                <Text style={styles.amountLabel}>Montant de l'achat (€)</Text>
                                <View style={styles.amountRow}>
                                    <View style={styles.amountInput}>
                                        <Zap size={16} color="#888" />
                                        <TextInput
                                            style={styles.amountField}
                                            placeholder="ex : 45"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={amount}
                                            onChangeText={setAmount}
                                        />
                                        <Text style={styles.amountUnit}>€ = {amount ? parseInt(amount, 10) || 0 : 0} pts</Text>
                                    </View>
                                </View>

                                {/* Boutons */}
                                <View style={styles.modalBtns}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={reset} disabled={loading}>
                                        <Text style={styles.cancelBtnText}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                                        onPress={handleAddPoints}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <ActivityIndicator size="small" color="#fff" />
                                            : <Text style={styles.confirmBtnText}>Ajouter les points</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Modal succès ── */}
            <Modal visible={!!success} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <CheckCircle size={48} color="#2ECC71" />
                        <Text style={styles.successTitle}>Points ajoutés !</Text>
                        <Text style={styles.successSub}>
                            +{success?.pts} pts crédités
                        </Text>
                        <Text style={styles.successDetail}>
                            Nouveau solde : <Text style={{ color: theme.primary }}>{success?.newTotal} pts</Text>{"  "}
                            <Text style={{ color: "#888" }}>{success?.rank}</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: theme.primary, width: "100%", marginTop: 8 }]}
                            onPress={reset}
                        >
                            <Text style={styles.confirmBtnText}>Scanner un autre client</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Écran principal (branche admin / client) ─────────────────────────────────
export default function QrcodeScreen() {
    const { user, fetchWithAuth } = useContext(AuthContext);
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

    if (user?.role === "admin") {
        return <AdminScanScreen fetchWithAuth={fetchWithAuth} theme={theme} styles={styles} />;
    }

    return <ClientQrScreen user={user} fetchWithAuth={fetchWithAuth} theme={theme} styles={styles} />;
}

function makeStyles(theme) {
    return StyleSheet.create({
        loadingContainer: {
            flex: 1, backgroundColor: theme.bg,
            justifyContent: "center", alignItems: "center",
        },
        container: {
            flex: 1, backgroundColor: theme.bg,
            paddingTop: 50, paddingHorizontal: 16, gap: 20,
        },
        header: {
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        },
        logo: { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },
        adminBadge: {
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
        },
        adminBadgeText: { fontFamily: "LexendDeca_700Bold", fontSize: 12, letterSpacing: 1 },

        subtitle: {
            color: theme.textMuted, fontFamily: "LexendDeca_400Regular",
            fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 8,
        },

        // Client QR — always white background so QR code is scannable
        qrWrapper: { alignItems: "center", justifyContent: "center" },
        qrBox: {
            backgroundColor: "white", padding: 20, borderRadius: 16,
            borderWidth: 3, minHeight: 260, alignItems: "center", justifyContent: "center",
        },
        errorBox: { width: 220, alignItems: "center", justifyContent: "center" },
        errorText: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
        codeBox: {
            backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            borderRadius: 12, paddingVertical: 14, alignItems: "center",
        },
        codeText: { color: theme.primary, fontFamily: "LexendDeca_400Regular", fontSize: 16, letterSpacing: 1.5 },
        infoCard: {
            backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12,
        },
        infoDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
        infoText: { flex: 1, color: theme.text, fontFamily: "LexendDeca_400Regular", fontSize: 14, lineHeight: 22 },
        infoHint: { color: theme.textMuted, fontSize: 12 },

        // Admin camera
        cameraWrapper: {
            flex: 1, borderRadius: 20, overflow: "hidden",
            borderWidth: 2, borderColor: theme.primary, maxHeight: 340,
        },
        camera: { flex: 1 },
        cameraPlaceholder: {
            flex: 1, backgroundColor: theme.card,
            justifyContent: "center", alignItems: "center",
        },
        scanOverlay: {
            flex: 1, margin: 40,
            justifyContent: "space-between",
        },
        scanCorner: { position: "absolute", width: 28, height: 28, borderWidth: 3 },
        scanCornerTL: { top: 0,  left: 0,  borderRightWidth: 0, borderBottomWidth: 0 },
        scanCornerTR: { top: 0,  right: 0, borderLeftWidth: 0,  borderBottomWidth: 0 },
        scanCornerBL: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0 },
        scanCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0 },

        rescanBtn: { alignItems: "center", paddingVertical: 8 },
        rescanText: { fontFamily: "LexendDeca_700Bold", fontSize: 14 },

        // Permission
        permContainer: {
            flex: 1, backgroundColor: theme.bg,
            justifyContent: "center", alignItems: "center",
            paddingHorizontal: 32, gap: 16,
        },
        permTitle: { color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 20, textAlign: "center" },
        permSub:   { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 14, textAlign: "center" },
        permBtn:   { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
        permBtnText: { color: "#fff", fontFamily: "LexendDeca_700Bold", fontSize: 15 },

        // Modals
        modalOverlay: {
            flex: 1, backgroundColor: "rgba(0,0,0,0.88)",
            justifyContent: "flex-end",
        },
        modalScroll: { flexGrow: 1, justifyContent: "flex-end" },
        modalBox: {
            backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 28, alignItems: "center", gap: 12,
        },

        avatarCircle: {
            width: 64, height: 64, borderRadius: 32,
            justifyContent: "center", alignItems: "center",
        },
        modalName:  { color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 20 },
        modalEmail: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        pointsRow: { flexDirection: "row", gap: 12, alignItems: "center", marginTop: 4 },
        pointsBadge: {
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignItems: "center",
        },
        pointsVal: { fontFamily: "LexendDeca_700Bold", fontSize: 22 },
        pointsLbl: { fontFamily: "LexendDeca_400Regular", fontSize: 11 },
        rankBadge: {
            paddingHorizontal: 14, paddingVertical: 8,
            borderRadius: 12, borderWidth: 1.5,
        },
        rankText: { fontFamily: "LexendDeca_700Bold", fontSize: 14 },

        amountLabel: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13, alignSelf: "flex-start", marginTop: 4 },
        amountRow: { width: "100%" },
        amountInput: {
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.border,
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        },
        amountField: { flex: 1, color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 18 },
        amountUnit: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        modalBtns: { flexDirection: "row", gap: 12, width: "100%", marginTop: 8 },
        cancelBtn: {
            flex: 1, paddingVertical: 14, borderRadius: 12,
            borderWidth: 1, borderColor: theme.border, alignItems: "center",
        },
        cancelBtnText: { color: theme.textMuted, fontFamily: "LexendDeca_700Bold", fontSize: 15 },
        confirmBtn: {
            flex: 1, paddingVertical: 14, borderRadius: 12,
            alignItems: "center", justifyContent: "center",
        },
        confirmBtnText: { color: "#fff", fontFamily: "LexendDeca_700Bold", fontSize: 15 },

        // Success modal (centré)
        successTitle:  { color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 22, marginTop: 8 },
        successSub:    { color: "#2ECC71", fontFamily: "LexendDeca_700Bold", fontSize: 18 },
        successDetail: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 14, textAlign: "center" },
    });
}
