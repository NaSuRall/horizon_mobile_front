import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { RefreshCw, QrCode, Info } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";
import RankModal from "../components/RankModal";
import { useState } from "react";

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [rankModalVisible, setRankModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const styles = makeStyles(theme);

  if (!fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }
  const isLight = isLightColor(theme.primary);
  const qrTextColor = isLight ? "#111111" : "white";

  const rewards = [];

  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.headerSpan}>Programme fidélité</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Greeting */}
          <Text style={styles.greeting}>Bonjour, {user.first_name}</Text>

          {/* Points Card */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.rechargeBtn}>
              <RefreshCw size={14} color="#888888" />
              <Text style={styles.rechargeText}>recharger</Text>
            </TouchableOpacity>

            <Text style={styles.userPoint}>{user.point}</Text>
            <Text style={styles.pointsLabel}>points cumulés</Text>

            {/* Level badge */}
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Niveau {user.rank ?? "Bronze"}</Text>
              </View>
              <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => setRankModalVisible(true)}
              >
                <Info size={16} color="#4A9EFF" />
              </TouchableOpacity>
              <RankModal
                  visible={rankModalVisible}
                  onClose={() => setRankModalVisible(false)}
                  currentRank={user.rank ?? "Silver"}
              />
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "80%" }]} />
            </View>
            <Text style={styles.progressLabel}>250 points pour atteindre Gold</Text>
          </View>

          {/* QR Code Button */}
          <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate("QrCode")}>
            <QrCode size={22} color={qrTextColor} />
            <Text style={[styles.qrButtonText, { color: qrTextColor }]}>Afficher mon Qr Code</Text>
          </TouchableOpacity>

          {/* Rewards Section */}
          <Text style={styles.sectionTitle}>Récompenses Disponible</Text>
          {rewards.length === 0 ? (
              <View style={styles.emptyRewards}>
                <Text style={styles.emptyRewardsText}>Pas de récompenses disponibles pour le moment</Text>
              </View>
          ) : (
              <View style={styles.rewardsList}>
                {rewards.map((reward, index) => (
                    <View key={index} style={styles.rewardItem}>
                      <View style={styles.rewardDot} />
                      <Text style={styles.rewardText}>{reward.label}</Text>
                      {reward.active && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeText}>Actif</Text>
                          </View>
                      )}
                    </View>
                ))}
              </View>
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
      flex: 1, paddingTop: 50, backgroundColor: "#111111",
    },

    /* Header */
    header: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", paddingHorizontal: 16, marginBottom: 8,
    },
    logo: { width: 140, height: 45, resizeMode: "contain" },
    headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

    /* Scroll */
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },

    /* Greeting */
    greeting: {
      color: "white", fontSize: 28,
      fontFamily: "LexendDeca_700Bold", marginTop: 8,
    },

    /* Card */
    card: {
      backgroundColor: "#1A1A1A", borderWidth: 1,
      borderColor: "#2A2A2A", borderRadius: 20, padding: 18, gap: 8,
    },
    rechargeBtn: {
      flexDirection: "row", alignItems: "center",
      alignSelf: "flex-end", gap: 5,
    },
    rechargeText: { color: "#888888", fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    userPoint: {
      fontSize: 62,
      color: theme.primary,           // ✅ thème
      fontFamily: "LexendDeca_700Bold",
      lineHeight: 68,
    },
    pointsLabel: { color: "#888888", fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    /* Level */
    levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    levelBadge: {
      borderWidth: 1,
      borderColor: theme.primary,     // ✅ thème
      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    },
    levelText: {
      color: theme.primary,           // ✅ thème
      fontSize: 13, fontFamily: "LexendDeca_400Regular",
    },
    infoBtn: {
      width: 26, height: 26, borderRadius: 13,
      borderWidth: 1.5, borderColor: "#4A9EFF",
      justifyContent: "center", alignItems: "center",
    },

    /* Progress */
    progressBar: {
      height: 6, backgroundColor: "#2A2A2A",
      borderRadius: 10, marginTop: 6, overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.primary, // ✅ thème
      borderRadius: 10,
    },
    progressLabel: { color: "#888888", fontSize: 12, fontFamily: "LexendDeca_400Regular" },

    /* QR Button */
    qrButton: {
      backgroundColor: theme.primary, // ✅ suit le thème maintenant
      borderRadius: 14, paddingVertical: 18,
      flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 10,
    },
    qrButtonText: { color: "white", fontSize: 17, fontFamily: "LexendDeca_700Bold" },

    /* Rewards */
    sectionTitle: { color: "#888888", fontSize: 15, fontFamily: "LexendDeca_400Regular", marginTop: 4 },
    rewardsList: { gap: 10 },
    rewardItem: {
      backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    rewardDot: {
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: theme.primary, // ✅ thème
    },
    rewardText: { flex: 1, color: "white", fontSize: 14, fontFamily: "LexendDeca_400Regular" },
    activeBadge: {
      backgroundColor: theme.secondary, // ✅ thème
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    },
    activeText: {
      color: theme.primary,            // ✅ thème
      fontSize: 12, fontFamily: "LexendDeca_400Regular",
    },
    emptyRewards: {
      backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
      borderRadius: 14, paddingVertical: 24,
      alignItems: "center", justifyContent: "center",
    },
    emptyRewardsText: { color: "#888888", fontSize: 14, fontFamily: "LexendDeca_400Regular" },
  });
}