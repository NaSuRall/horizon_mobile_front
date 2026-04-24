import { useContext, useState, useCallback, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    TouchableOpacity, Modal, Image,
} from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Bookmark, X, Wrench, Camera, Square, Binoculars, Gift, CheckCircle, Clock } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

const TX_ICONS = [Bookmark, X, Wrench, Camera, Square, Binoculars];

function TransactionIcon({ index, theme }) {
    const Icon = TX_ICONS[index % TX_ICONS.length];
    return (
        <View style={{
            width: 42, height: 42, backgroundColor: theme.secondary,
            borderRadius: 10, justifyContent: "center", alignItems: "center",
        }}>
            <Icon color={theme.primary} size={20} />
        </View>
    );
}

export default function GainScreen() {
    const { fetchWithAuth } = useContext(AuthContext);
    const theme = useTheme();
    const route = useRoute();

    const [fontsLoaded]  = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });
    const [activeTab,    setActiveTab]    = useState("historique");
    const [transactions, setTransactions] = useState([]);
    const [redemptions,  setRedemptions]  = useState([]);
    const [loadingTx,    setLoadingTx]    = useState(true);
    const [loadingRd,    setLoadingRd]    = useState(true);
    const [codeModal,    setCodeModal]    = useState(null);

    const styles = makeStyles(theme);

    useEffect(() => {
        if (route.params?.tab) setActiveTab(route.params.tab);
    }, [route.params?.tab]);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const fetchTransactions = async () => {
                setLoadingTx(true);
                try {
                    const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/transactions`);
                    if (!res) return;
                    const data = await res.json();
                    if (res.ok && active) setTransactions(data.transactions ?? []);
                } catch {
                    Toast.show({ type: "error", text1: "Erreur réseau" });
                } finally {
                    if (active) setLoadingTx(false);
                }
            };

            const fetchRedemptions = async () => {
                setLoadingRd(true);
                try {
                    const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/redemptions`);
                    if (!res) return;
                    const data = await res.json();
                    if (res.ok && active) setRedemptions(Array.isArray(data) ? data : []);
                } catch {
                    Toast.show({ type: "error", text1: "Erreur réseau" });
                } finally {
                    if (active) setLoadingRd(false);
                }
            };

            fetchTransactions();
            fetchRedemptions();
            return () => { active = false; };
        }, [])
    );

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const isPending = (status) => status === "pending";

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <Text style={styles.headerSpan}>Programme fidélité</Text>
            </View>

            {/* Titre */}
            <View style={styles.titleBlock}>
                <Text style={styles.titleSub}>MON COMPTE</Text>
                <Text style={[styles.titleMain, { color: theme.primary }]}>
                    {activeTab === "historique" ? "HISTORIQUE" : "RÉCOMPENSES"}
                </Text>
                <Text style={styles.titleCount}>
                    {activeTab === "historique"
                        ? `${transactions.length} transaction(s)`
                        : `${redemptions.length} récompense(s) échangée(s)`}
                </Text>
            </View>

            {/* Sélecteur d'onglet */}
            <View style={styles.tabSwitcher}>
                <TouchableOpacity
                    style={[styles.switchBtn, activeTab === "historique" && { borderColor: theme.primary }]}
                    onPress={() => setActiveTab("historique")}
                >
                    <Text style={[styles.switchBtnText, activeTab === "historique" && { color: theme.primary }]}>
                        Historique
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.switchBtn, activeTab === "recompenses" && { borderColor: theme.primary }]}
                    onPress={() => setActiveTab("recompenses")}
                >
                    <Text style={[styles.switchBtnText, activeTab === "recompenses" && { color: theme.primary }]}>
                        Récompenses
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Onglet Historique ── */}
            {activeTab === "historique" && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {loadingTx ? (
                        <View style={styles.emptyBox}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : transactions.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
                        </View>
                    ) : (
                        transactions.map((tx, index) => (
                            <View key={tx.id ?? index} style={styles.txItem}>
                                <TransactionIcon index={index} theme={theme} />
                                <View style={styles.txInfo}>
                                    <Text style={styles.txLabel}>{tx.label}</Text>
                                    <Text style={styles.txDate}>{tx.date}</Text>
                                </View>
                                <Text style={[styles.txPoints, { color: tx.points >= 0 ? "#2ECC71" : theme.primary }]}>
                                    {tx.points >= 0 ? `+${tx.points}` : `${tx.points}`} pts
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* ── Onglet Récompenses ── */}
            {activeTab === "recompenses" && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {loadingRd ? (
                        <View style={styles.emptyBox}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : redemptions.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Gift size={32} color={theme.textFaint} />
                            <Text style={styles.emptyText}>Aucune récompense échangée</Text>
                            <Text style={styles.emptySubText}>Rendez-vous dans la boutique !</Text>
                        </View>
                    ) : (
                        redemptions.map((rd, index) => (
                            <TouchableOpacity
                                key={rd.code ?? index}
                                style={[
                                    styles.rdItem,
                                    isPending(rd.status) && { borderColor: theme.primary },
                                ]}
                                onPress={() => isPending(rd.status) && setCodeModal(rd)}
                                activeOpacity={isPending(rd.status) ? 0.7 : 1}
                            >
                                <View style={[styles.rdIconWrap, { backgroundColor: theme.secondary }]}>
                                    <Gift color={theme.primary} size={20} />
                                </View>
                                <View style={styles.rdInfo}>
                                    <Text style={styles.rdName}>{rd.reward_name}</Text>
                                    <Text style={styles.rdCode}>{rd.code}</Text>
                                    <Text style={styles.rdDate}>{rd.created_at}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    isPending(rd.status)
                                        ? { backgroundColor: theme.secondary, borderColor: theme.primary }
                                        : { backgroundColor: theme.cardAlt, borderColor: theme.border },
                                ]}>
                                    {isPending(rd.status)
                                        ? <Clock size={11} color={theme.primary} />
                                        : <CheckCircle size={11} color={theme.textFaint} />
                                    }
                                    <Text style={[
                                        styles.statusText,
                                        { color: isPending(rd.status) ? theme.primary : theme.textFaint },
                                    ]}>
                                        {isPending(rd.status) ? "En attente" : "Utilisé"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            {/* ── Modal code QR ── */}
            <Modal visible={!!codeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Gift size={36} color={theme.primary} />
                        <Text style={styles.modalTitle}>{codeModal?.reward_name}</Text>
                        <Text style={styles.modalHint}>Montrez ce code au caissier</Text>
                        <Text style={styles.modalCode}>{codeModal?.code}</Text>
                        <View style={styles.qrWrap}>
                            {codeModal?.code && (
                                <QRCode
                                    value={codeModal.code}
                                    size={160}
                                    color={theme.text}
                                    backgroundColor="transparent"
                                />
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setCodeModal(null)}
                        >
                            <Text style={styles.closeBtnText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

function makeStyles(theme) {
    return StyleSheet.create({
        loadingContainer: {
            flex: 1, backgroundColor: theme.bg,
            justifyContent: "center", alignItems: "center",
        },
        container: {
            flex: 1, backgroundColor: theme.bg,
            paddingTop: 50, paddingHorizontal: 16,
        },
        header: {
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20,
        },
        logo:       { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        titleBlock: { gap: 2, marginBottom: 14 },
        titleSub:   { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13, letterSpacing: 1 },
        titleMain:  { fontFamily: "LexendDeca_700Bold", fontSize: 30, letterSpacing: 1 },
        titleCount: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13, marginTop: 4 },

        tabSwitcher: { flexDirection: "row", gap: 10, marginBottom: 16 },
        switchBtn: {
            flex: 1, paddingVertical: 10, borderRadius: 12,
            borderWidth: 1.5, borderColor: theme.border,
            alignItems: "center", backgroundColor: theme.card,
        },
        switchBtnText: { color: theme.textMuted, fontFamily: "LexendDeca_700Bold", fontSize: 13 },

        scrollContent: { gap: 10, paddingBottom: 120 },

        txItem: {
            backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", gap: 14,
        },
        txInfo:   { flex: 1, gap: 3 },
        txLabel:  { color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 14 },
        txDate:   { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 12 },
        txPoints: { fontFamily: "LexendDeca_700Bold", fontSize: 14 },

        rdItem: {
            backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.border,
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", gap: 14,
        },
        rdIconWrap: {
            width: 42, height: 42, borderRadius: 10,
            justifyContent: "center", alignItems: "center",
        },
        rdInfo:  { flex: 1, gap: 3 },
        rdName:  { color: theme.text, fontFamily: "LexendDeca_700Bold", fontSize: 14 },
        rdCode:  { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13, letterSpacing: 1 },
        rdDate:  { color: theme.textFaint, fontFamily: "LexendDeca_400Regular", fontSize: 11 },
        statusBadge: {
            flexDirection: "row", alignItems: "center", gap: 4,
            paddingHorizontal: 8, paddingVertical: 4,
            borderRadius: 8, borderWidth: 1,
        },
        statusText: { fontSize: 11, fontFamily: "LexendDeca_700Bold" },

        emptyBox: {
            backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            borderRadius: 14, paddingVertical: 36,
            alignItems: "center", gap: 10,
        },
        emptyText:    { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 14 },
        emptySubText: { color: theme.textFaint, fontFamily: "LexendDeca_400Regular", fontSize: 12 },

        modalOverlay: {
            flex: 1, backgroundColor: "rgba(0,0,0,0.88)",
            justifyContent: "center", alignItems: "center", padding: 24,
        },
        modalBox: {
            backgroundColor: theme.card, borderRadius: 20,
            padding: 28, alignItems: "center", gap: 12, width: "100%",
        },
        modalTitle: { color: theme.text, fontSize: 18, fontFamily: "LexendDeca_700Bold", textAlign: "center" },
        modalHint:  { color: theme.textMuted, fontSize: 13, fontFamily: "LexendDeca_400Regular" },
        modalCode: {
            color: theme.text, fontSize: 26, fontFamily: "LexendDeca_700Bold",
            letterSpacing: 3, marginVertical: 4,
        },
        qrWrap: {
            padding: 14, backgroundColor: theme.cardAlt,
            borderWidth: 1, borderColor: theme.border, borderRadius: 12,
        },
        closeBtn: {
            width: "100%", paddingVertical: 13, borderRadius: 12,
            alignItems: "center", marginTop: 6,
        },
        closeBtnText: { color: "#fff", fontFamily: "LexendDeca_700Bold", fontSize: 15 },
    });
}
