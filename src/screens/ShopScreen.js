import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, ActivityIndicator, ScrollView,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useTheme, isLightColor } from "../context/ThemeContext";
import { ShoppingBag, CheckCircle, Gift } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

export default function ShopScreen() {
    const { user, fetchWithAuth, updatePoints } = useContext(AuthContext);
    const theme      = useTheme();
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(null);
    const [redemption, setRedemption] = useState(null);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => { fetchRewards(); }, []);

    const fetchRewards = async () => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/rewards`);
            if (res.ok) setRewards(await res.json());
        } catch {
            Toast.show({ type: "error", text1: "Erreur réseau", text2: "Impossible de charger la boutique" });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        setPurchasing(true);
        try {
            const res = await fetchWithAuth(
                `${process.env.EXPO_PUBLIC_API_URL}/rewards/${reward.id}/redeem`,
                { method: "POST" },
            );
            if (!res) return;
            const data = await res.json();
            if (res.ok) {
                setConfirming(null);
                setRedemption(data);
                await updatePoints(data.points_remaining, data.rank);
            } else {
                Toast.show({ type: "error", text1: "Erreur", text2: data.error ?? "Une erreur est survenue" });
            }
        } catch {
            Toast.show({ type: "error", text1: "Erreur réseau" });
        } finally {
            setPurchasing(false);
        }
    };

    if (!fontsLoaded) return null;

    const userPoints = user?.point ?? 0;
    const isLight    = isLightColor(theme.primary);
    const textOnTheme = isLight ? "#111" : "#fff";
    const styles     = makeStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Boutique</Text>
                <View style={styles.pointsBadge}>
                    <Text style={[styles.pointsBadgeText, { color: theme.primary }]}>
                        {userPoints} pts
                    </Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : rewards.length === 0 ? (
                <View style={styles.empty}>
                    <ShoppingBag size={40} color="#444" />
                    <Text style={styles.emptyText}>Aucune récompense disponible</Text>
                </View>
            ) : (
                <FlatList
                    data={rewards}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const canAfford = userPoints >= item.point_cost;
                        return (
                            <View style={[styles.card, !canAfford && styles.cardFaded]}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.rewardName}>{item.name}</Text>
                                    {!!item.description && (
                                        <Text style={styles.rewardDesc}>{item.description}</Text>
                                    )}
                                    {item.stock > 0 && (
                                        <Text style={styles.rewardStock}>{item.stock} disponible(s)</Text>
                                    )}
                                </View>
                                <View style={styles.cardAction}>
                                    <Text style={[styles.cost, { color: canAfford ? theme.primary : "#555" }]}>
                                        {item.point_cost} pts
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.redeemBtn,
                                            { backgroundColor: canAfford ? theme.primary : "#2A2A2A" },
                                        ]}
                                        onPress={() => canAfford && setConfirming(item)}
                                        disabled={!canAfford}
                                    >
                                        <Text style={[styles.redeemBtnText, { color: canAfford ? textOnTheme : "#555" }]}>
                                            {canAfford ? "Dépenser" : "Insuffisant"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            {/* ── Confirmation modal ── */}
            <Modal visible={!!confirming} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <ShoppingBag size={40} color={theme.primary} />
                        <Text style={styles.modalTitle}>Confirmer l'échange</Text>
                        <Text style={styles.modalItem}>{confirming?.name}</Text>
                        <Text style={styles.modalSub}>
                            {confirming?.point_cost} points seront déduits de votre solde
                        </Text>
                        <View style={styles.modalRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnOutline]}
                                onPress={() => setConfirming(null)}
                                disabled={purchasing}
                            >
                                <Text style={styles.modalBtnTextMuted}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => handleRedeem(confirming)}
                                disabled={purchasing}
                            >
                                {purchasing
                                    ? <ActivityIndicator size="small" color={textOnTheme} />
                                    : <Text style={[styles.modalBtnText, { color: textOnTheme }]}>Confirmer</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Redemption code modal ── */}
            <Modal visible={!!redemption} transparent animationType="fade">
                <View style={styles.overlay}>
                    <ScrollView contentContainerStyle={styles.codeModalScroll}>
                        <View style={styles.modalBox}>
                            <CheckCircle size={44} color="#2ECC71" />
                            <Text style={styles.modalTitle}>Échange réussi !</Text>
                            <Text style={styles.modalItem}>{redemption?.reward_name}</Text>

                            <Text style={styles.codeLabel}>Votre code de rachat</Text>
                            <Text style={styles.code}>{redemption?.code}</Text>

                            <View style={styles.qrWrap}>
                                {redemption?.code && (
                                    <QRCode
                                        value={redemption.code}
                                        size={160}
                                        color="#ffffff"
                                        backgroundColor="#1A1A1A"
                                    />
                                )}
                            </View>

                            <Text style={styles.codeHint}>
                                Montrez ce code ou ce QR au caissier pour récupérer votre récompense
                            </Text>
                            <Text style={styles.pointsLeft}>
                                Solde restant : {redemption?.points_remaining} pts ({redemption?.rank})
                            </Text>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.primary, borderColor: theme.primary, width: "100%", marginTop: 8 }]}
                                onPress={() => {
                                    setRedemption(null);
                                    navigation.navigate("Gain", { tab: "recompenses" });
                                }}
                            >
                                <Gift size={16} color={textOnTheme} />
                                <Text style={[styles.modalBtnText, { color: textOnTheme }]}>Voir mes récompenses</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnOutline, { width: "100%" }]}
                                onPress={() => setRedemption(null)}
                            >
                                <Text style={styles.modalBtnTextMuted}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

function makeStyles(theme) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: "#111", paddingTop: 50 },

        header: {
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 16, paddingBottom: 16, gap: 12,
        },
        headerTitle: { flex: 1, color: "#fff", fontSize: 22, fontFamily: "LexendDeca_700Bold" },
        pointsBadge: {
            paddingHorizontal: 12, paddingVertical: 6,
            backgroundColor: "#1A1A1A", borderRadius: 20,
        },
        pointsBadgeText: { fontSize: 14, fontFamily: "LexendDeca_700Bold" },

        empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
        emptyText: { color: "#555", fontSize: 15, fontFamily: "LexendDeca_400Regular" },

        list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
        card: {
            backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
            borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12,
        },
        cardFaded: { opacity: 0.45 },
        cardInfo: { flex: 1, gap: 4 },
        rewardName: { color: "#fff", fontSize: 15, fontFamily: "LexendDeca_700Bold" },
        rewardDesc: { color: "#888", fontSize: 13, fontFamily: "LexendDeca_400Regular" },
        rewardStock: { color: "#666", fontSize: 12, fontFamily: "LexendDeca_400Regular" },
        cardAction: { alignItems: "flex-end", gap: 8 },
        cost: { fontSize: 15, fontFamily: "LexendDeca_700Bold" },
        redeemBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
        redeemBtnText: { fontSize: 13, fontFamily: "LexendDeca_700Bold" },

        overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center" },
        codeModalScroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
        modalBox: {
            backgroundColor: "#1A1A1A", borderRadius: 20,
            padding: 24, alignItems: "center", gap: 10,
        },
        modalTitle: { color: "#fff", fontSize: 20, fontFamily: "LexendDeca_700Bold" },
        modalItem:  { color: "#ccc", fontSize: 15, fontFamily: "LexendDeca_400Regular", textAlign: "center" },
        modalSub:   { color: "#888", fontSize: 13, fontFamily: "LexendDeca_400Regular", textAlign: "center" },
        modalRow:   { flexDirection: "row", gap: 12, marginTop: 8 },
        modalBtn: {
            flex: 1, paddingVertical: 13, borderRadius: 12,
            borderWidth: 1, alignItems: "center", justifyContent: "center",
            flexDirection: "row", gap: 8,
        },
        modalBtnOutline: { borderColor: "#444" },
        modalBtnText: { fontSize: 15, fontFamily: "LexendDeca_700Bold" },
        modalBtnTextMuted: { color: "#aaa", fontSize: 15, fontFamily: "LexendDeca_700Bold" },

        codeLabel: { color: "#888", fontSize: 13, fontFamily: "LexendDeca_400Regular", marginTop: 8 },
        code: {
            color: "#fff", fontSize: 26, fontFamily: "LexendDeca_700Bold",
            letterSpacing: 3,
        },
        qrWrap: {
            padding: 16, backgroundColor: "#1A1A1A",
            borderWidth: 1, borderColor: "#2A2A2A", borderRadius: 12, marginVertical: 4,
        },
        codeHint: {
            color: "#888", fontSize: 12, fontFamily: "LexendDeca_400Regular",
            textAlign: "center", paddingHorizontal: 8,
        },
        pointsLeft: { color: "#2ECC71", fontSize: 13, fontFamily: "LexendDeca_400Regular" },
    });
}
