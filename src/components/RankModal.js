import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const RANKS = [
    {
        name: "Bronze",
        color: "#CD7F32",
        secondary: "#2A1A0A",
        points: "0 - 499 pts",
        perks: ["Accès aux événements standard", "1 point par euro dépensé"],
    },
    {
        name: "Silver",
        color: "#E3000F",
        secondary: "#2A1010",
        points: "500 - 1 499 pts",
        perks: ["Accès aux événements standard", "1.5 points par euro dépensé", "-5% sur les accessoires"],
    },
    {
        name: "Gold",
        color: "#FFD700",
        secondary: "#2A2200",
        points: "1 500 - 3 999 pts",
        perks: ["Accès prioritaire aux événements", "2 points par euro dépensé", "-10% sur les accessoires", "Invitations sorties exclusives"],
    },
    {
        name: "Platinum",
        color: "#00FFD4",
        secondary: "#002A25",
        points: "4 000 - 9 999 pts",
        perks: ["Accès VIP aux événements", "3 points par euro dépensé", "-15% sur tout le magasin", "Cadeaux anniversaire", "Support prioritaire"],
    },
    {
        name: "Diamond",
        color: "#A78BFA",
        secondary: "#1A0A2A",
        points: "10 000+ pts",
        perks: ["Accès VIP + invité aux événements", "5 points par euro dépensé", "-20% sur tout le magasin", "Cadeaux exclusifs", "Conseiller dédié", "Événements privés"],
    },
];

export default function RankModal({ visible, onClose, currentRank }) {
    const theme = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>

                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Niveaux de fidélité</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        Cumulez des points à chaque achat pour monter en rang et débloquer des avantages exclusifs.
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                        {RANKS.map((rank) => {
                            const isCurrent = rank.name === (currentRank ?? "Silver");

                            return (
                                <View
                                    key={rank.name}
                                    style={[
                                        styles.rankCard,
                                        isCurrent && { borderColor: rank.color, borderWidth: 2 },
                                    ]}
                                >
                                    {/* Badge courant */}
                                    {isCurrent && (
                                        <View style={[styles.currentBadge, { backgroundColor: rank.secondary, borderColor: rank.color }]}>
                                            <Text style={[styles.currentBadgeText, { color: rank.color }]}>Votre niveau actuel</Text>
                                        </View>
                                    )}

                                    {/* Rank header */}
                                    <View style={styles.rankHeader}>
                                        <View style={[styles.rankDot, { backgroundColor: rank.color }]} />
                                        <Text style={[styles.rankName, { color: rank.color }]}>{rank.name}</Text>
                                        <Text style={styles.rankPoints}>{rank.points}</Text>
                                    </View>

                                    {/* Perks */}
                                    <View style={styles.perksList}>
                                        {rank.perks.map((perk, i) => (
                                            <View key={i} style={styles.perkRow}>
                                                <View style={[styles.perkDot, { backgroundColor: rank.color }]} />
                                                <Text style={styles.perkText}>{perk}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: "90%",
    },
    handle: {
        width: 40, height: 4,
        backgroundColor: "#444",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12, marginBottom: 16,
    },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        color: "white",
        fontSize: 20,
        fontFamily: "LexendDeca_700Bold",
    },
    closeBtn: {
        width: 34, height: 34,
        backgroundColor: "#2A2A2A",
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
    },
    subtitle: {
        color: "#888888",
        fontSize: 13,
        fontFamily: "LexendDeca_400Regular",
        lineHeight: 20,
        marginBottom: 20,
    },

    list: { gap: 12, paddingBottom: 20 },

    /* Rank card */
    rankCard: {
        backgroundColor: "#111111",
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    currentBadge: {
        alignSelf: "flex-start",
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    currentBadgeText: {
        fontSize: 11,
        fontFamily: "LexendDeca_400Regular",
    },
    rankHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rankDot: {
        width: 12, height: 12, borderRadius: 6,
    },
    rankName: {
        fontSize: 18,
        fontFamily: "LexendDeca_700Bold",
        flex: 1,
    },
    rankPoints: {
        color: "#888888",
        fontSize: 12,
        fontFamily: "LexendDeca_400Regular",
    },

    /* Perks */
    perksList: { gap: 6 },
    perkRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    perkDot: {
        width: 6, height: 6, borderRadius: 3,
    },
    perkText: {
        color: "#CCCCCC",
        fontSize: 13,
        fontFamily: "LexendDeca_400Regular",
        flex: 1,
    },
});