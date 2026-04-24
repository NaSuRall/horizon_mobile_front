import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca";
import {
    View, Text, StyleSheet, TouchableOpacity,
    Modal, ActivityIndicator, ScrollView,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useTheme, isLightColor } from "../context/ThemeContext";
import { Wrench, Shield, Zap, Tag, Package, Gift, CheckCircle, ShoppingBag } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

function rewardIcon(name) {
    const n = (name ?? "").toLowerCase();
    if (n.includes("révision") || n.includes("mécanique") || n.includes("maintenance") || n.includes("vidange")) return Wrench;
    if (n.includes("protection") || n.includes("casque") || n.includes("sécurité") || n.includes("gant")) return Shield;
    if (n.includes("chargeur") || n.includes("batterie") || n.includes("électrique")) return Zap;
    if (n.includes("réduction") || n.includes("remise") || n.includes("promo") || n.includes("bon")) return Tag;
    if (n.includes("kit") || n.includes("accessoire") || n.includes("pack")) return Package;
    return Gift;
}

export default function ShopScreen() {
    const { user, fetchWithAuth, updatePoints } = useContext(AuthContext);
    const theme      = useTheme();
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    const [rewards,    setRewards]    = useState([]);
    const [loading,    setLoading]    = useState(true);
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

    const userPoints    = user?.point ?? 0;
    const isLight       = isLightColor(theme.primary);
    const textOnPrimary = isLight ? "#111" : "#fff";
    const styles        = makeStyles(theme);

    const affordable = rewards.filter(r => userPoints >= r.point_cost);
    const locked     = rewards.filter(r => userPoints < r.point_cost);

    const renderCard = (item, unlocked) => {
        const Icon     = rewardIcon(item.name);
        const progress = Math.min(userPoints / item.point_cost, 1);
        const pct      = Math.round(progress * 100);

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.card, unlocked && { borderColor: theme.primary + "44" }]}
                onPress={() => unlocked && setConfirming(item)}
                activeOpacity={unlocked ? 0.75 : 1}
            >
                {/* Stripe colorée à gauche */}
                <View style={[styles.stripe, { backgroundColor: unlocked ? theme.primary : theme.border }]} />

                {/* Icône */}
                <View style={[styles.iconCircle, {
                    backgroundColor: unlocked ? theme.primary + "22" : theme.cardAlt,
                }]}>
                    <Icon color={unlocked ? theme.primary : theme.textFaint} size={22} />
                </View>

                {/* Infos */}
                <View style={styles.cardBody}>
                    <Text style={[styles.rewardName, { color: unlocked ? theme.text : theme.textMuted }]}>
                        {item.name}
                    </Text>
                    {!!item.description && (
                        <Text style={styles.rewardDesc}>{item.description}</Text>
                    )}
                    {!unlocked && (
                        <View style={styles.lockRow}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, {
                                    width: `${pct}%`,
                                    backgroundColor: theme.primary,
                                }]} />
                            </View>
                            <Text style={styles.progressPct}>{pct}%</Text>
                        </View>
                    )}
                </View>

                {/* Badge coût */}
                <View style={[styles.costBadge, unlocked
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.cardAlt, borderColor: theme.border }
                ]}>
                    <Text style={[styles.costText, { color: unlocked ? textOnPrimary : theme.textMuted }]}>
                        {item.point_cost}
                    </Text>
                    <Text style={[styles.costUnit, { color: unlocked ? textOnPrimary + "BB" : theme.textFaint }]}>
                        pts
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSub}>MES POINTS</Text>
                    <Text style={styles.headerTitle}>MA BOUTIQUE</Text>
                </View>
                <View style={styles.pointsPill}>
                    <Text style={[styles.pointsPillText, { color: theme.primary }]}>{userPoints}</Text>
                    <Text style={styles.pointsPillUnit}>pts</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : rewards.length === 0 ? (
                <View style={styles.empty}>
                    <ShoppingBag size={40} color={theme.textFaint} />
                    <Text style={styles.emptyText}>Aucune récompense disponible</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    {affordable.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>DISPONIBLES</Text>
                            {affordable.map(r => renderCard(r, true))}
                        </>
                    )}
                    {locked.length > 0 && (
                        <>
                            <Text style={[styles.sectionLabel, affordable.length > 0 && { marginTop: 16 }]}>
                                À DÉBLOQUER
                            </Text>
                            {locked.map(r => renderCard(r, false))}
                        </>
                    )}
                </ScrollView>
            )}

            {/* ── Modal de confirmation ── */}
            <Modal visible={!!confirming} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={[styles.modalIconCircle, { backgroundColor: theme.primary + "22" }]}>
                            <ShoppingBag size={28} color={theme.primary} />
                        </View>
                        <Text style={styles.modalTitle}>Confirmer l'échange</Text>
                        <Text style={styles.modalItem}>{confirming?.name}</Text>

                        <View style={styles.costRow}>
                            <Text style={styles.costRowLabel}>Coût</Text>
                            <Text style={[styles.costRowValue, { color: theme.primary }]}>
                                {confirming?.point_cost} pts
                            </Text>
                        </View>
                        <Text style={styles.modalSub}>
                            Solde restant : {Math.max(0, userPoints - (confirming?.point_cost ?? 0))} pts
                        </Text>

                        <View style={styles.modalRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnOutline]}
                                onPress={() => setConfirming(null)}
                                disabled={purchasing}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => handleRedeem(confirming)}
                                disabled={purchasing}
                            >
                                {purchasing
                                    ? <ActivityIndicator size="small" color={textOnPrimary} />
                                    : <Text style={[styles.modalBtnText, { color: textOnPrimary }]}>Confirmer</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Modal code de rachat ── */}
            <Modal visible={!!redemption} transparent animationType="fade">
                <View style={styles.overlay}>
                    <ScrollView contentContainerStyle={styles.codeScroll}>
                        <View style={styles.modalBox}>
                            <CheckCircle size={44} color="#2ECC71" />
                            <Text style={styles.modalTitle}>Échange réussi !</Text>
                            <Text style={styles.modalItem}>{redemption?.reward_name}</Text>

                            <Text style={styles.codeLabel}>Code de rachat</Text>
                            <Text style={styles.code}>{redemption?.code}</Text>

                            <View style={styles.qrWrap}>
                                {redemption?.code && (
                                    <QRCode
                                        value={redemption.code}
                                        size={160}
                                        color={theme.text}
                                        backgroundColor="transparent"
                                    />
                                )}
                            </View>

                            <Text style={styles.codeHint}>
                                Présentez ce code au caissier pour récupérer votre récompense
                            </Text>
                            <Text style={styles.pointsLeft}>
                                Solde restant : {redemption?.points_remaining} pts ({redemption?.rank})
                            </Text>

                            <TouchableOpacity
                                style={[styles.modalBtn, {
                                    backgroundColor: theme.primary, borderColor: theme.primary,
                                    width: "100%", marginTop: 8,
                                }]}
                                onPress={() => {
                                    setRedemption(null);
                                    navigation.navigate("Gain", { tab: "recompenses" });
                                }}
                            >
                                <Gift size={16} color={textOnPrimary} />
                                <Text style={[styles.modalBtnText, { color: textOnPrimary }]}>
                                    Voir mes récompenses
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnOutline, { width: "100%" }]}
                                onPress={() => setRedemption(null)}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>Fermer</Text>
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
        container: { flex: 1, backgroundColor: theme.bg, paddingTop: 50 },

        header: {
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 20, paddingBottom: 20,
            justifyContent: "space-between",
        },
        headerSub:   { color: theme.textMuted, fontSize: 11, fontFamily: "LexendDeca_400Regular", letterSpacing: 1.5 },
        headerTitle: { color: theme.text, fontSize: 26, fontFamily: "LexendDeca_700Bold" },

        pointsPill: {
            flexDirection: "row", alignItems: "baseline", gap: 3,
            paddingHorizontal: 14, paddingVertical: 8,
            backgroundColor: theme.card, borderRadius: 20,
            borderWidth: 1, borderColor: theme.border,
        },
        pointsPillText: { fontSize: 22, fontFamily: "LexendDeca_700Bold" },
        pointsPillUnit: { fontSize: 12, fontFamily: "LexendDeca_400Regular", color: theme.textMuted },

        empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
        emptyText: { color: theme.textMuted, fontSize: 15, fontFamily: "LexendDeca_400Regular" },

        list: { paddingHorizontal: 16, paddingBottom: 110, gap: 10 },
        sectionLabel: {
            color: theme.textMuted, fontSize: 11,
            fontFamily: "LexendDeca_700Bold", letterSpacing: 1.5,
            marginBottom: 4,
        },

        card: {
            backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            borderRadius: 16, flexDirection: "row", alignItems: "center",
            overflow: "hidden", paddingRight: 12, paddingVertical: 14,
        },
        stripe: { width: 4, alignSelf: "stretch", marginRight: 12 },
        iconCircle: {
            width: 46, height: 46, borderRadius: 23,
            justifyContent: "center", alignItems: "center",
            marginRight: 12,
        },
        cardBody: { flex: 1, gap: 4 },
        rewardName: { fontSize: 14, fontFamily: "LexendDeca_700Bold" },
        rewardDesc: { color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular" },

        lockRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
        progressTrack: {
            flex: 1, height: 4, backgroundColor: theme.border,
            borderRadius: 4, overflow: "hidden",
        },
        progressFill: { height: "100%", borderRadius: 4 },
        progressPct: {
            color: theme.textMuted, fontSize: 11,
            fontFamily: "LexendDeca_400Regular", minWidth: 28,
        },

        costBadge: {
            alignItems: "center", paddingHorizontal: 10, paddingVertical: 8,
            borderRadius: 12, borderWidth: 1, minWidth: 52, marginLeft: 8,
        },
        costText: { fontSize: 16, fontFamily: "LexendDeca_700Bold", lineHeight: 20 },
        costUnit: { fontSize: 10, fontFamily: "LexendDeca_400Regular" },

        overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center" },
        codeScroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
        modalBox: {
            backgroundColor: theme.card, borderRadius: 20,
            padding: 24, alignItems: "center", gap: 10,
        },
        modalIconCircle: {
            width: 56, height: 56, borderRadius: 28,
            justifyContent: "center", alignItems: "center",
        },
        modalTitle: { color: theme.text, fontSize: 20, fontFamily: "LexendDeca_700Bold" },
        modalItem:  { color: theme.textMuted, fontSize: 15, fontFamily: "LexendDeca_400Regular", textAlign: "center" },

        costRow: {
            flexDirection: "row", justifyContent: "space-between",
            width: "100%", paddingHorizontal: 16, paddingVertical: 12,
            backgroundColor: theme.cardAlt, borderRadius: 12,
            borderWidth: 1, borderColor: theme.border, marginVertical: 4,
        },
        costRowLabel: { color: theme.textMuted, fontSize: 14, fontFamily: "LexendDeca_400Regular" },
        costRowValue: { fontSize: 14, fontFamily: "LexendDeca_700Bold" },
        modalSub: { color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular", textAlign: "center" },
        modalRow: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
        modalBtn: {
            flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1,
            alignItems: "center", justifyContent: "center",
            flexDirection: "row", gap: 8,
        },
        modalBtnOutline: { borderColor: theme.border },
        modalBtnText: { fontSize: 15, fontFamily: "LexendDeca_700Bold" },

        codeLabel:  { color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular", marginTop: 8 },
        code:       { color: theme.text, fontSize: 24, fontFamily: "LexendDeca_700Bold", letterSpacing: 3 },
        qrWrap: {
            padding: 16, backgroundColor: theme.cardAlt,
            borderWidth: 1, borderColor: theme.border, borderRadius: 14, marginVertical: 4,
        },
        codeHint: {
            color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular",
            textAlign: "center", paddingHorizontal: 8,
        },
        pointsLeft: { color: "#2ECC71", fontSize: 13, fontFamily: "LexendDeca_400Regular" },
    });
}
