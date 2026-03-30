import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { RefreshCw, QrCode, Info } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";
import RankModal from "../components/RankModal";
import Toast from "react-native-toast-message";

export default function HomeScreen() {
  const theme = useTheme();
  const { user, userToken, updatePoints, fetchWithAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [rankModalVisible, setRankModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delta d'affichage : null = rien, number = variation (+150 ou -20)
  const [pointDelta, setPointDelta] = useState(null);

  // Animation : opacité + translation verticale du delta
  const deltaOpacity = useRef(new Animated.Value(0)).current;
  const deltaTranslateY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const styles = makeStyles(theme);

  // Lance l'animation du delta puis la cache après 2.5s
  const animateDelta = () => {
    deltaOpacity.setValue(1);
    deltaTranslateY.setValue(0);

    Animated.parallel([
      Animated.timing(deltaOpacity, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(deltaTranslateY, {
        toValue: -30,
        duration: 2500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPointDelta(null);
    });
  };

  // Déclenche l'animation dès que pointDelta est défini
  useEffect(() => {
    if (pointDelta !== null) {
      animateDelta();
    }
  }, [pointDelta]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      // fetchWithAuth gère le 401 → déconnexion automatique
      const response = await fetchWithAuth("http://100.120.71.76:4000/api/user/points");

      // Si null → token expiré, déconnexion déjà gérée dans fetchWithAuth
      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: data.error ?? "Une erreur est survenue",
        });
        return;
      }

      const newPoints = data.points;
      const oldPoints = user.point ?? 0;
      const delta = newPoints - oldPoints;

      await updatePoints(newPoints);

      if (delta > 0) {
        // Points gagnés
        Toast.show({
          type: "success",
          text1: "Points mis à jour",
          text2: `+${delta} points ajoutés sur ton compte !`,
        });
        setPointDelta(delta);
      } else if (delta < 0) {
        // Points perdus
        Toast.show({
          type: "error",
          text1: "Points mis à jour",
          text2: `${delta} points retirés de ton compte`,
        });
        setPointDelta(delta);
      } else {
        // Aucun changement
        Toast.show({
          type: "info",
          text1: "Aucun changement",
          text2: "Ton solde de points est déjà à jour",
        });
      }

    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur réseau",
        text2: "Impossible de contacter le serveur",
      });
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

            {/* Bouton recharger */}
            <TouchableOpacity
                style={styles.rechargeBtn}
                onPress={handleRefresh}
                disabled={isRefreshing}
            >
              <RefreshCw size={14} color="#888888" />
              <Text style={styles.rechargeText}>
                {isRefreshing ? "chargement..." : "recharger"}
              </Text>
            </TouchableOpacity>

            {/* Points + delta animé */}
            <View style={styles.pointsRow}>
              <Text style={styles.userPoint}>{user.point}</Text>

              {/* Delta flottant animé */}
              {pointDelta !== null && (
                  <Animated.Text
                      style={[
                        styles.pointDelta,
                        pointDelta > 0 ? styles.deltaPositive : styles.deltaNegative,
                        {
                          opacity: deltaOpacity,
                          transform: [{ translateY: deltaTranslateY }],
                        },
                      ]}
                  >
                    {pointDelta > 0 ? `+${pointDelta}` : `${pointDelta}`}
                  </Animated.Text>
              )}
            </View>

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

    /* Points row : chiffre + delta côte à côte */
    pointsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    userPoint: {
      fontSize: 62,
      color: theme.primary,
      fontFamily: "LexendDeca_700Bold",
      lineHeight: 68,
    },

    /* Delta animé */
    pointDelta: {
      fontSize: 20,
      fontFamily: "LexendDeca_700Bold",
      marginTop: 10,
      alignSelf: "center",
    },
    deltaPositive: {
      color: "#4CAF50",
    },
    deltaNegative: {
      color: "#E3000F",
    },

    pointsLabel: { color: "#888888", fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    /* Level */
    levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    levelBadge: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    },
    levelText: {
      color: theme.primary,
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
      backgroundColor: theme.primary,
      borderRadius: 10,
    },
    progressLabel: { color: "#888888", fontSize: 12, fontFamily: "LexendDeca_400Regular" },

    /* QR Button */
    qrButton: {
      backgroundColor: theme.primary,
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
      backgroundColor: theme.primary,
    },
    rewardText: { flex: 1, color: "white", fontSize: 14, fontFamily: "LexendDeca_400Regular" },
    activeBadge: {
      backgroundColor: theme.secondary,
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    },
    activeText: {
      color: theme.primary,
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