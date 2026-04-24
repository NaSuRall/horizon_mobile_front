import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { RefreshCw, QrCode, Info, ShoppingBag } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";
import RankModal from "../components/RankModal";
import Toast from "react-native-toast-message";

export default function HomeScreen() {
  const theme = useTheme();
  const { user, userToken, updatePoints, fetchWithAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [rankModalVisible, setRankModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [pointDelta, setPointDelta] = useState(null);

  const deltaOpacity   = useRef(new Animated.Value(0)).current;
  const deltaTranslateY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const styles = makeStyles(theme);

  const animateDelta = () => {
    deltaOpacity.setValue(1);
    deltaTranslateY.setValue(0);

    Animated.parallel([
      Animated.timing(deltaOpacity, {
        toValue: 0, duration: 2500, useNativeDriver: true,
      }),
      Animated.timing(deltaTranslateY, {
        toValue: -30, duration: 2500, useNativeDriver: true,
      }),
    ]).start(() => { setPointDelta(null); });
  };

  useEffect(() => {
    if (pointDelta !== null) animateDelta();
  }, [pointDelta]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/points`);
      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: "error", text1: "Erreur", text2: data.error ?? "Une erreur est survenue" });
        return;
      }

      const newPoints = data.points;
      const newRank   = data.rank;
      const oldPoints = user.point ?? 0;
      const delta     = newPoints - oldPoints;

      await updatePoints(newPoints, newRank);

      if (delta > 0) {
        Toast.show({ type: "success", text1: "Points mis à jour", text2: `+${delta} points ajoutés sur ton compte !` });
        setPointDelta(delta);
      } else if (delta < 0) {
        Toast.show({ type: "error", text1: "Points mis à jour", text2: `${delta} points retirés de ton compte` });
        setPointDelta(delta);
      } else {
        Toast.show({ type: "info", text1: "Aucun changement", text2: "Ton solde de points est déjà à jour" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Erreur réseau", text2: "Impossible de contacter le serveur" });
      console.error("Erreur :", error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isLight      = isLightColor(theme.primary);
  const qrTextColor  = isLight ? "#111111" : "white";

  const RANK_THRESHOLDS = { Bronze: 0, Silver: 500, Gold: 1000, Platine: 2500, Diamond: 5000 };
  const RANK_ORDER      = ["Bronze", "Silver", "Gold", "Platine", "Diamond"];
  const currentRankName = user.rank ?? "Bronze";
  const currentIdx      = RANK_ORDER.indexOf(currentRankName);
  const isMaxRank       = currentIdx === RANK_ORDER.length - 1;
  const nextRankName    = isMaxRank ? null : RANK_ORDER[currentIdx + 1];
  const currentFloor    = RANK_THRESHOLDS[currentRankName] ?? 0;
  const nextFloor       = isMaxRank ? null : RANK_THRESHOLDS[nextRankName];
  const pointsToNext    = isMaxRank ? 0 : nextFloor - (user.point ?? 0);
  const progress        = isMaxRank ? 1 : Math.min(((user.point ?? 0) - currentFloor) / (nextFloor - currentFloor), 1);

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
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} color={theme.textMuted} />
            <Text style={styles.rechargeText}>
              {isRefreshing ? "chargement..." : "recharger"}
            </Text>
          </TouchableOpacity>

          <View style={styles.pointsRow}>
            <Text style={styles.userPoint}>{user.point}</Text>
            {pointDelta !== null && (
              <Animated.Text
                style={[
                  styles.pointDelta,
                  pointDelta > 0 ? styles.deltaPositive : styles.deltaNegative,
                  { opacity: deltaOpacity, transform: [{ translateY: deltaTranslateY }] },
                ]}
              >
                {pointDelta > 0 ? `+${pointDelta}` : `${pointDelta}`}
              </Animated.Text>
            )}
          </View>

          <Text style={styles.pointsLabel}>points cumulés</Text>

          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Niveau {user.rank ?? "Bronze"}</Text>
            </View>
            <TouchableOpacity style={styles.infoBtn} onPress={() => setRankModalVisible(true)}>
              <Info size={16} color="#4A9EFF" />
            </TouchableOpacity>
            <RankModal
              visible={rankModalVisible}
              onClose={() => setRankModalVisible(false)}
              currentRank={user.rank ?? "Silver"}
            />
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {isMaxRank
              ? "Rang maximum atteint 🏆"
              : `${pointsToNext} points pour atteindre ${nextRankName}`}
          </Text>
        </View>

        {/* QR Code Button */}
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate("QrCode")}>
          <QrCode size={22} color={qrTextColor} />
          <Text style={[styles.qrButtonText, { color: qrTextColor }]}>Afficher mon Qr Code</Text>
        </TouchableOpacity>

        {/* Boutique */}
        <Text style={styles.sectionTitle}>Boutique récompenses</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("Shop")}>
          <ShoppingBag size={22} color={qrTextColor} />
          <Text style={[styles.shopButtonText, { color: qrTextColor }]}>Voir la Boutique</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1, backgroundColor: theme.bg,
      justifyContent: "center", alignItems: "center",
    },
    container: { flex: 1, paddingTop: 50, backgroundColor: theme.bg },

    header: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", paddingHorizontal: 16, marginBottom: 8,
    },
    logo: { width: 140, height: 45, resizeMode: "contain" },
    headerSpan: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

    scrollContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },

    greeting: {
      color: theme.text, fontSize: 28,
      fontFamily: "LexendDeca_700Bold", marginTop: 8,
    },

    card: {
      backgroundColor: theme.card, borderWidth: 1,
      borderColor: theme.border, borderRadius: 20, padding: 18, gap: 8,
    },
    rechargeBtn: {
      flexDirection: "row", alignItems: "center",
      alignSelf: "flex-end", gap: 5,
    },
    rechargeText: { color: theme.textMuted, fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    pointsRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    userPoint: {
      fontSize: 62, color: theme.primary,
      fontFamily: "LexendDeca_700Bold", lineHeight: 68,
    },

    pointDelta: {
      fontSize: 20, fontFamily: "LexendDeca_700Bold",
      marginTop: 10, alignSelf: "center",
    },
    deltaPositive: { color: "#4CAF50" },
    deltaNegative: { color: "#E3000F" },

    pointsLabel: { color: theme.textMuted, fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    levelBadge: {
      borderWidth: 1, borderColor: theme.primary,
      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    },
    levelText: { color: theme.primary, fontSize: 13, fontFamily: "LexendDeca_400Regular" },
    infoBtn: {
      width: 26, height: 26, borderRadius: 13,
      borderWidth: 1.5, borderColor: "#4A9EFF",
      justifyContent: "center", alignItems: "center",
    },

    progressBar: {
      height: 6, backgroundColor: theme.border,
      borderRadius: 10, marginTop: 6, overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: theme.primary, borderRadius: 10 },
    progressLabel: { color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular" },

    qrButton: {
      backgroundColor: theme.primary,
      borderRadius: 14, paddingVertical: 18,
      flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 10,
    },
    qrButtonText: { fontSize: 17, fontFamily: "LexendDeca_700Bold" },

    sectionTitle: { color: theme.textMuted, fontSize: 15, fontFamily: "LexendDeca_400Regular", marginTop: 4 },

    shopButton: {
      backgroundColor: theme.card,
      borderWidth: 1, borderColor: theme.primary,
      borderRadius: 14, paddingVertical: 18,
      flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 10,
    },
    shopButtonText: { fontSize: 17, fontFamily: "LexendDeca_700Bold" },

    rewardDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary },
    activeBadge: { backgroundColor: theme.secondary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    activeText:  { color: theme.primary, fontSize: 12, fontFamily: "LexendDeca_400Regular" },
  });
}
